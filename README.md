# IAimageBetter - AI Image Enhancer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by Real-ESRGAN](https://img.shields.io/badge/Model-Real--ESRGAN-blue)](https://github.com/xinntao/Real-ESRGAN)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A professional-grade, self-hosted web application for AI-powered image upscaling and enhancement using Real-ESRGAN. Built with React, Vite, and Tailwind CSS for a modern, performant experience.

**Community Edition**: No limits, no subscriptions, no cloud dependencies—just pure AI performance on your own hardware.

![Project Preview](assets/UI.gif)

---

## 🌐 Live Demo

Try the hosted version before installing locally: **[iaimagebetter.forcex.dev](https://iaimagebetter.forcex.dev/)**

The web demo features mobile optimization, fast x2 upscaling model (~2 min for max supported resolution), and intelligent queue management. Note that daily usage limits apply—run locally for unlimited access.

---

## ✨ Features

### Core Capabilities
- **Unlimited Processing** - No file size restrictions or resolution caps
- **Privacy-First Design** - 100% offline processing with no data transmission
- **Smart Hardware Detection** - Automatic CUDA detection with optimized CPU fallback
- **Performance Optimization** - Customizable tile sizes and thread allocation
- **Modern Interface** - Before/after slider, zoom comparison, and real-time previews
- **Multi-Language Support** - English and Spanish localization

### Technology Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI + PyTorch + Real-ESRGAN
- **Infrastructure**: Docker + Nginx + Redis
- **AI Models**: Real-ESRGAN (x4plus, x2, animevideov3)

---

## ⚡ Performance Benchmarks

Real-world processing times on production hardware:

| Hardware | Model | Target Resolution | Processing Time |
|----------|-------|-------------------|-----------------|
| NVIDIA RTX 3070 | x4plus | 8K | ~10 seconds |
| NVIDIA RTX 3070 | x4plus | 4K | ~3-5 seconds |
| Web Demo (Shared) | x2 | Max supported | ~2 minutes |
| CPU (16GB RAM) | x4plus | 4K | ~5-8 minutes |

**Key Insights:**
- GPU acceleration provides 30-40x performance improvement over CPU processing
- Larger tile sizes reduce processing time but require more VRAM/RAM
- The x2 model processes approximately 2x faster than x4plus

---

## 🏗️ Architecture
```
┌─────────────────────┐
│   React Frontend    │  Modern UI with Vite build system
│   (Tailwind CSS)    │  and Tailwind styling
└──────────┬──────────┘
           │
      ┌────▼────┐
      │  Nginx  │  Reverse proxy with upload optimization
      └────┬────┘
           │
┌──────────▼──────────┐
│   FastAPI Backend   │  Real-ESRGAN processing engine
│   (PyTorch + GPU)   │  with hardware acceleration
└──────────┬──────────┘
           │
      ┌────▼────┐
      │  Redis  │  Job queue and state management
      └─────────┘
```

---

## 🚀 Installation

### Prerequisites
- Docker and Docker Compose
- (Optional) NVIDIA GPU with CUDA drivers and [NVIDIA Container Toolkit](https://github.com/NVIDIA/nvidia-docker)

### Quick Start

Clone the repository:
```bash
git clone https://github.com/ForcexDev/IAimageBetter.git
cd IAimageBetter
```

Launch the application:
```bash
docker compose up -d --build
```

Access the interface at `http://localhost:5193`

The application automatically detects available hardware and configures itself accordingly.

---

## ⚙️ Configuration

### Performance Tuning

Optimize Real-ESRGAN processing by adjusting parameters in `docker-compose.yml`:

| Hardware Configuration | AI_TILE_SIZE | AI_THREADS | Expected Performance |
|------------------------|--------------|------------|---------------------|
| NVIDIA RTX 3070+ | 400-600 | Auto | ~10s for 8K (x4) |
| NVIDIA GTX 1060+ | 300-400 | Auto | ~20-30s for 8K |
| CPU (16GB+ RAM) | 1000-2000 | 10-12 | ~5-8 min for 4K |
| CPU (8GB RAM) | 400 | Auto | ~10-15 min for 4K |
| CPU (Low-end) | 200 | 2 | Stable, slower processing |

### Applying Configuration

Edit the `backend` service in `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - REDIS_URL=redis://redis:6379
      # Performance Tuning
      - AI_TILE_SIZE=1000    # Increase for more RAM usage & faster processing
      - AI_THREADS=10        # Number of CPU threads
```

Restart the services:
```bash
docker compose down
docker compose up -d
```

💡 **Note**: Higher tile sizes consume more memory but significantly reduce processing time. Monitor system resources and adjust accordingly.

---

## 📊 Model Comparison

| Model | Upscale Factor | Optimal Use Case | Relative Speed | Output Quality |
|-------|----------------|------------------|----------------|----------------|
| x4plus | 4x | General photography, realistic images | Baseline | Excellent |
| x2 | 2x | Quick processing, web optimization | 2x faster | Very Good |
| animevideov3 | 4x | Anime, illustrations, artwork | Baseline | Excellent |

---

## 🆚 Local vs Web Version

| Feature | Local Installation | Web Demo |
|---------|-------------------|----------|
| Processing Speed | ~10s (RTX 3070, 8K) | ~2 min (limited) |
| Resolution Limit | Hardware-dependent (8K+) | Capped |
| Daily Quota | Unlimited | Limited |
| Privacy | 100% offline | Cloud processing |
| GPU Acceleration | Full CUDA support | Shared resources |
| Model Selection | All models available | x2 only |
| Configuration | Full control | Fixed settings |

**Recommendation**: Deploy locally for professional-grade performance and unlimited processing capacity.

---

## 📸 Use Cases

- **Photography** - Upscale archival photos and enhance resolution for printing
- **Digital Art** - Prepare artwork for large-format prints and high-resolution displays
- **Content Creation** - Optimize images for 4K/8K screens and high-DPI devices
- **E-commerce** - Enhance product photography with detailed zoom capabilities
- **Restoration** - Modernize historical photographs and archived materials
- **Game Development** - Upscale textures and sprites for HD remasters

---

## 🔧 Troubleshooting

### GPU Not Detected

Verify NVIDIA drivers:
```bash
nvidia-smi
```

Check Docker GPU access:
```bash
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

### Out of Memory Errors

- Reduce `AI_TILE_SIZE` in configuration
- Switch to x2 model instead of x4plus
- Close other GPU-intensive applications
- Consider processing smaller batches

### Slow Processing Performance

- Verify GPU utilization (check logs for "CUDA available: True")
- Increase `AI_TILE_SIZE` if sufficient VRAM/RAM available
- Ensure NVIDIA drivers are up to date
- Consider hardware upgrade for GPU acceleration

---

## 🤝 Development

### Local Development Setup

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Contributing

Contributions are welcome. Please open an issue to discuss major changes before submitting a pull request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Built with [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) by Xintao Wang et al.

---

**Developed by [ForcexDev](https://github.com/ForcexDev)**

⭐ Star this repository if you find it useful!
