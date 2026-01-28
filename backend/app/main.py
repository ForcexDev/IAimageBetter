from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="IAimageBetter API",
    description="Backend for AI Image Enhancer",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "https://forcex.dev"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "IAimageBetter API is running", "docs": "/docs"}

@app.get("/status")
async def status():
    # TODO: Check Redis connection
    return {"status": "operational", "gpu_available": False} # Placeholder

from app.api.routes import router
app.include_router(router, prefix="/api")

