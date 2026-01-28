from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends, Form
from fastapi.responses import Response
from app.services.enhancer import enhancer

import io

router = APIRouter()



@router.post("/enhance")
async def enhance_image(
    request: Request, 
    file: UploadFile = File(...),
    scale: float = Form(4.0)
):
    client_ip = request.client.host
    
    # 1. No Limits Check (Local Version)
    
    # 2. Validate Image
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Check size (approximate via spool, exact check might need reading)
    # For now we assume Nginx/FastAPI middleware handles hard size limits, 
    # but we can check content length if provided.
    
    content = await file.read()
    if len(content) > 100 * 1024 * 1024: # 100MB
        raise HTTPException(status_code=400, detail="File too large (Max 100MB)")

    try:
        # 3. Enhance
        enhanced_bytes = await enhancer.enhance_image(content, outscale=scale)
        
        # 4. Record Usage (Disabled for Local Version)
        # await limiter.record_usage(client_ip)
        
        return Response(content=enhanced_bytes, media_type="image/png")
        
    except Exception as e:
        import traceback
        print(f"Error enhancing image: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
