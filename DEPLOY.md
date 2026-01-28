# IAimageBetter Deployment Guide

This guide describes how to deploy the application on your Ubuntu server using Docker Compose.

## Prerequisites

- **OS**: Ubuntu (Server)
- **Software**: Docker, Docker Compose, Git
- **Hardware**: GPU recommended (NVIDIA for speed).
- **CPU Support**: The application **automatically detects** if a GPU is missing and switches to CPU mode. No configuration changes are needed, but processing will take longer (minutes instead of seconds).

## Deployment Steps

1. **Transfer Files**
   Copy the project folder to your server:
   ```bash
   scp -r IAimageBetter user@your-server-ip:~/
   ```

2. **Configuration**
   Ensure `docker-compose.yml` is present.
   Check `backend/app/main.py` CORS origins if using a specific domain (currently set to generous defaults).

3. **Start Services**
   Navigate to the folder and run:
   ```bash
   cd IAimageBetter
   docker-compose up --build -d
   ```
   This will start:
   - Frontend (Port 80)
   - Backend (Port 8000 - Internal)
   - Redis (Internal)

4. **Verify Deployment**
   - Access `http://your-server-ip/`
   - You should see the UI.
   - Check API status: `http://your-server-ip/api/status` (via browser dev tools or curl)

## Data Persistence
- Redis data (limits) is persisted in the `redis_data` volume. Restarts won't reset limits unless the volume is removed.

## Troubleshooting
- **Logs**: `docker-compose logs -f`
- **Rebuild**: `docker-compose up --build -d --force-recreate`
