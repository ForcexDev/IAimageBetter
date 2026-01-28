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
        print(f"[EnhancerService] Initializing. Target device: {self.device}")
        
    def _load_model(self):
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
                tile=400,  # Tiling enabled to prevent OOM on large images
                tile_pad=10,
                pre_pad=0,
                half=True if self.device.type == 'cuda' else False,
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
