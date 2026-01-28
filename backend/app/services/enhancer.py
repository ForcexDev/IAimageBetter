import asyncio
import io
import os
import torch
import numpy as np
from PIL import Image

class EnhancerService:
    def __init__(self):
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # --- Performance Configuration ---
        # 1. Tile Size: Higher = Faster but more RAM. Default 400 (Conservative).
        # On 16GB RAM CPU server, try 800-1000.
        self.tile_size = int(os.getenv("AI_TILE_SIZE", "400"))
        
        # 2. Threads: Force specific CPU core usage.
        threads = os.getenv("AI_THREADS")
        if threads:
            torch.set_num_threads(int(threads))
            print(f"[EnhancerService] ⚙️ Tuning: CPU Threads set to {threads}")

        # 3. Precision: FP16 (Half) is faster on GPU, but sometimes buggy on CPU.
        # Auto-detect: True if CUDA, False if CPU (unless forced).
        self.half_precision = os.getenv("AI_HALF", "auto").lower()
        if self.half_precision == "auto":
            self.half_precision = True if self.device.type == 'cuda' else False
        else:
            self.half_precision = self.half_precision == "true"

        print(f"[EnhancerService] Initializing. Device: {self.device} | Tile: {self.tile_size} | Half: {self.half_precision}")
        if self.model is not None:
            return
            
        print("[EnhancerService] Loading Real-ESRGAN model...")
        try:
            from realesrgan import RealESRGANer
            from basicsr.archs.rrdbnet_arch import RRDBNet
            
            # Define the network architecture
            model_net = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            
            # Model path - RealESRGANer will download automatically if not present
            model_url = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth'
            
            self.model = RealESRGANer(
                scale=4,
                model_path=model_url,
                model=model_net,
                tile=self.tile_size,  # Dynamic Tile Size
                tile_pad=10,
                pre_pad=0,
                half=self.half_precision, # Dynamic Precision
                device=self.device,
            )
            print(f"[EnhancerService] Model loaded successfully on {self.device}")
        except Exception as e:
            print(f"[EnhancerService] FATAL: Failed to load model: {e}")
            raise

    async def enhance_image(self, image_data: bytes, outscale: float = 4.0) -> bytes:
        """
        Enhances the image using Real-ESRGAN x4.
        If outscale != 4, resizes the output to match the requested scale.
        """
        # Lazy load the model on first request
        if self.model is None:
            try:
                self._load_model()
            except Exception as e:
                print(f"Model load failed: {e}")
                raise

        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            # Convert PIL to CV2 (numpy) for RealESRGAN
            img_np = np.array(image)
            img_cv2 = img_np[:, :, ::-1] # RGB to BGR

            print(f"[EnhancerService] Starting enhancement (Scale={outscale}). Input: {image.size}")

            # Run inference in thread pool to avoid blocking
            loop = asyncio.get_running_loop()
            # We always upscale X4 to get maximum detail restoration
            output, _ = await loop.run_in_executor(None, lambda: self.model.enhance(img_cv2, outscale=4))
            
            if output is None:
                raise RuntimeError("Enhancement returned no output")

            # BGR back to RGB
            output_rgb = output[:, :, ::-1]
            
            # Convert back to PIL
            output_pil = Image.fromarray(output_rgb)

            # Resize if needed (e.g. user wanted 2x but we generated 4x)
            if outscale != 4:
                # Calculate new dimensions
                target_w = int(image.width * outscale)
                target_h = int(image.height * outscale)
                
                output_pil = output_pil.resize((target_w, target_h), Image.Resampling.LANCZOS)

            # Save to bytes
            img_byte_arr = io.BytesIO()
            output_pil.save(img_byte_arr, format='PNG')
            return img_byte_arr.getvalue()

        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error enhancing image: {e}")
            raise e

# Singleton instance
enhancer = EnhancerService()
