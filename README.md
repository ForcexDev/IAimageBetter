# IAimageBetter 🌌

Professional AI Image Upscaler built with **React**, **FastAPI**, and **Real-ESRGAN**. 
Transform low-resolution images into high-quality masterpieces using state-of-the-art AI.

![IAimageBetter Screenshot](https://via.placeholder.com/800x450.png?text=IAimageBetter+App)

## ✨ Features

- **Professional Upscaling**: Uses `Real-ESRGAN x4plus` for specialized sharpening.
- **Smart Hardware Detection**: Automatically uses NVIDIA GPU (CUDA) if available, falls back to CPU transparently.
- **Privacy Focused**: Images are processed in-memory and never stored on the server.
- **Modern UI**: Single-page "God Mode" interface designed for 4K/1080p screens.
- **Limits**: Configurable file size and daily usage limits.

## 🚀 Quick Start (Local)

Run the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.9+)

### 1. Backend (Python)
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
*Backend runs on `http://localhost:8000`*

### 2. Frontend (React)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🐳 Docker Deployment (Production)

Deploy easily on any server (Ubuntu/Debian recommended).

```bash
docker-compose up -d --build
```
This starts:
- Frontend (Nginx)
- Backend (FastAPI)
- Redis (Rate Limiting)

For detailed operation commands, see [GUIA_NOTION.md](GUIA_NOTION.md) (if available) or the deployment docs.

## 🛠 Tech Stack
- **Frontend**: React, TailwindCSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, Uvicorn, Torch, Real-ESRGAN.
- **Infra**: Docker, Redis.

## 📄 License
MIT License. Created by [ForcexDev](https://github.com/ForcexDev).
