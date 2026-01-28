# IAimageBetter - AI Image Enhancer (Local Unlimited Version)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by Real-ESRGAN](https://img.shields.io/badge/Model-Real--ESRGAN-blue)](https://github.com/xinntao/Real-ESRGAN)

**IAimageBetter** is a powerful, locally hosted web application for upscaling and enhancing images using Artificial Intelligence (Real-ESRGAN).

🚀 **This is the Community Edition: No limits, no subscriptions, just pure AI performance on your own hardware.**

![Project Preview](https://github.com/ForcexDev/IAimageBetter/raw/main/preview.png)

## 🌐 Try the Web Demo

Don't want to install anything? Try the hosted production version:

👉 **[Launch Web Demo](https://iaimagebetter.forcex.dev/)**

*   **Optimized for Mobile**: Works perfectly on phones.
*   **Fast x2 Model**: Enhanced speed for quick results.
*   **Smart Queue**: Handles high traffic gracefully.
*   *(Note: The web demo has daily usage limits. Run locally for unlimited use.)*

---

## ✨ Local Features

- **Unlimited Upscaling**: No file size limits, no resolution caps. If your hardware can handle it, you can upscale it.
- **Privacy First**: 100% offline processing. Your photos never leave your server.
- **Smart Hardware Detection**: Automatically detects CUDA (NVIDIA GPU) or falls back to optimized CPU mode.
- **Dynamic Performance Tuning**: Customize tile sizes and thread counts to squeeze the most out of your RAM and CPU.
- **Modern UI**: Beautiful, responsive interface with Before/After slider and Zoom comparison.
- **Multi-Language**: English and Spanish support.

## �️ Installation & Deployment

The easiest way to run IAimageBetter locally is using **Docker Compose**.

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose installed.
- (Optional) NVIDIA Drivers & NVIDIA Container Toolkit for GPU acceleration.

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ForcexDev/IAimageBetter.git
   cd IAimageBetter
   ```

2. **Start the application:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the Web Interface:**
   Open your browser and go to `http://localhost:5193`

## ⚙️ Performance Tuning (Crucial for generic CPUs)

Real-ESRGAN is heavy. You can tune the performance directly in `docker-compose.yml` to match your hardware specs.

### Recommended Settings

| Hardware | AI_TILE_SIZE | AI_THREADS | Notes |
|----------|--------------|------------|-------|
| **GPU (NVIDIA)** | 400 (Default) | Auto | Fastest. Keep tile low to avoid VRAM OOM. |
| **CPU (8GB RAM)** | 400 | Auto | Standard stability. |
| **CPU (16GB+ RAM)**| **1000+** | **10-12** | **HIGH SPEED CPU**. Uses more RAM to process faster. |
| **CPU (Low End)** | 200 | 2 | Slow but stable. |

### How to Apply Settings

Edit `docker-compose.yml` and uncomment/adjust these lines in the `backend` service:

```yaml
    environment:
      - REDIS_URL=redis://redis:6379
      # Performance Tuning
      - AI_TILE_SIZE=1000  # Increase for more RAM usage & speed
      - AI_THREADS=10      # Number of CPU threads to use
```

Then restart:
```bash
docker compose up -d
```

## 🏗️ Technical Architecture

- **Frontend**: React + Vite + TailwindCSS (Modern, Fast, Responsive).
- **Backend**: FastAPI + PyTorch + Real-ESRGAN (The AI Brain).
- **Queue System**: Redis (Handles job management).
- **Proxy**: Nginx (Handles large file uploads and long timeouts).

## �️ License

This project is open source and available under the [MIT License](LICENSE).

---
**Created by [ForcexDev](https://github.com/ForcexDev)**
