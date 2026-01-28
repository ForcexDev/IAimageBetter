from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends, Form
from fastapi.responses import Response
from app.services.enhancer import enhancer
# from app.services.limiter import limiter  <-- PROD
from app.services.limiter_dev import limiter # <-- DEV (No limits)
import io

router = APIRouter()

@router.get("/limits")
async def get_limits(request: Request):
    """Returns current limits for the user (IP based) and global stats."""
    client_ip = request.client.host
    
    global_stats = await limiter.get_global_usage()
    ip_stats = await limiter.check_ip_availability(client_ip)
    
    return {
        "global": global_stats,
        "user": {
            "ip": client_ip,
            "can_try": ip_stats["can_try"],
            "wait_seconds": ip_stats.get("wait_seconds", 0)
        }
    }

@router.post("/enhance")
async def enhance_image(
    request: Request, 
    file: UploadFile = File(...),
    scale: float = Form(4.0)
):
    client_ip = request.client.host
    
    # 1. Check Limits
    access = await limiter.verify_request_allowed(client_ip)
    if not access["allowed"]:
        raise HTTPException(status_code=429, detail=access)
    
    # 2. Validate Image
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Check size (approximate via spool, exact check might need reading)
    # For now we assume Nginx/FastAPI middleware handles hard size limits, 
    # but we can check content length if provided.
    
    content = await file.read()
    if len(content) > 5 * 1024 * 1024: # 5MB
        raise HTTPException(status_code=400, detail="File too large (Max 5MB)")

    try:
        # 3. Enhance
        enhanced_bytes = await enhancer.enhance_image(content, outscale=scale)
        
        # 4. Record Usage (Only if successful)
        await limiter.record_usage(client_ip)
        
        return Response(content=enhanced_bytes, media_type="image/png")
        
    except Exception as e:
        import traceback
        print(f"Error enhancing image: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
