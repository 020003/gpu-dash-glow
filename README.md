# GPU Monitoring Dashboard (Frontend + NVIDIA-SMI Exporter)

A lightweight, real‑time GPU monitoring dashboard built with React/Vite + Tailwind (frontend) and a minimal Flask service that exposes NVIDIA GPU metrics via `nvidia-smi`.

- Frontend: Vite (port 8080), React, TypeScript, shadcn-ui, Tailwind
- Exporter API: Flask (port 5000), returns JSON at `/nvidia-smi.json`


## Features
- Live GPU metrics: utilization, memory, temperature, power, fan
- Historical mini‑charts with auto-refresh
- Multiple hosts monitoring (add/save hosts in UI)
- Demo mode (mock data) for quick preview


## Prerequisites
- Node.js 18+ and npm (if running frontend locally)
- Docker + Docker Compose v2
- NVIDIA GPU with recent drivers and `nvidia-smi` on the host
- NVIDIA Container Toolkit (for GPU access in Docker)
  - Install guide: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html


## Quick Start
You can run services separately (recommended for development) or together.

### 1) Start the NVIDIA-SMI Exporter (Docker)
```
docker compose -f docker-compose.gpu-exporter.yml build --no-cache
docker compose -f docker-compose.gpu-exporter.yml up -d

# Verify
curl http://localhost:5000/nvidia-smi.json | jq
```
If you see JSON with a `gpus` array, the exporter is working.

> Note: Requires NVIDIA Container Toolkit and drivers on the host. The compose file is already configured with the necessary device reservations.


### 2a) Start the Frontend (Docker)
```
docker compose -f docker-compose.frontend.yml up -d --build
# Open: http://localhost:8080
```

### 2b) Start the Frontend (Local)
```
# Install deps
npm i

# Run dev server (uses port 8080 from vite.config.ts)
npm run dev
# Open: http://localhost:8080
```

In the app, set API URL to: `http://localhost:5000/nvidia-smi.json` and click Save. You can toggle Demo Mode to use synthetic data.


## Run Both via Combined Compose (optional)
A convenience compose is provided:
```
docker compose up -d --build
# Frontend: http://localhost:8080
# Exporter: http://localhost:5000/nvidia-smi.json
```


## Ports
- Frontend (Vite dev): 8080 (container and host)
- Exporter (Flask): 5000 (container and host)

If you need to change the frontend port, edit `vite.config.ts` and adjust the mapping in `docker-compose.frontend.yml` accordingly.


## Configuration & Usage
- API URL field: point to your exporter, e.g. `http://HOST:5000/nvidia-smi.json`
- Demo Mode: generates dynamic mock data for showcasing
- Refresh Interval: choose how often to refetch metrics
- Hosts: add multiple hosts (with their exporter URLs) and switch between them


## API
- Endpoint: `GET /nvidia-smi.json`
- Response shape (TypeScript): `src/types/gpu.ts` (`NvidiaSmiResponse`)

Example:
```json
{
  "host": "my-server",
  "timestamp": "2025-08-08T09:00:00.000Z",
  "gpus": [
    {
      "id": 0,
      "uuid": "GPU-...",
      "name": "NVIDIA A100",
      "driverVersion": "555.85",
      "temperature": 62,
      "utilization": 73,
      "memory": { "used": 10240, "total": 40960 },
      "power": { "draw": 210, "limit": 350 },
      "fan": 45,
      "processes": [ { "pid": 12345, "name": "python", "memory": 2048 } ]
    }
  ]
}
```


## Redeploy / Update
- Exporter only:
```
docker compose -f docker-compose.gpu-exporter.yml build --no-cache \
  && docker compose -f docker-compose.gpu-exporter.yml up -d --force-recreate
```
- Frontend only:
```
docker compose -f docker-compose.frontend.yml up -d --build --force-recreate
```
- Combined:
```
docker compose up -d --build --force-recreate
```
- Logs:
```
docker compose -f docker-compose.gpu-exporter.yml logs -f gpu-exporter
```


## Development
- Frontend
  - `npm run dev` — Vite dev server (HMR)
  - `npm run build` — production build to `dist/`
  - `npm run preview` — preview production build locally
- Exporter
  - Python/Flask service under `server/`
  - Local run (host with GPUs):
    ```bash
    cd server
    pip3 install -r requirements.txt
    python3 app.py  # serves on :5000
    ```


## Troubleshooting
- Exporter returns 500 with fan speed string (e.g. `[N/A]`)
  - This repo includes a fix to safely treat `[N/A]` as `null`. Rebuild the image to update:
    ```
    docker compose -f docker-compose.gpu-exporter.yml build --no-cache
    docker compose -f docker-compose.gpu-exporter.yml up -d --force-recreate
    ```
- Exporter can’t access GPUs
  - Ensure NVIDIA drivers are installed and `nvidia-smi` works on the host
  - Install NVIDIA Container Toolkit and restart Docker
- Frontend cannot reach exporter
  - Confirm CORS is enabled (it is by default via Flask-CORS)
  - Verify the API URL is reachable from your browser (not from within a container)
  - Check firewall/security groups if remote
- Port conflicts
  - Change the host port mappings in the compose files or edit `vite.config.ts`


## Security Notes
- The exporter exposes low-level system info; restrict access on untrusted networks
- Consider reverse proxies, auth, or network ACLs in production


## Project Structure
```
.
├── docker-compose.frontend.yml        # Frontend only
├── docker-compose.gpu-exporter.yml    # Exporter only
├── docker-compose.yml                 # Combined (frontend + exporter)
├── Dockerfile                         # Frontend dev image (Vite)
├── server/
│   ├── app.py                         # Flask exporter
│   ├── Dockerfile                     # Exporter image
│   └── requirements.txt               # Flask deps
└── src/                               # React app
    ├── pages/Index.tsx                # Main dashboard
    ├── components/GpuCard.tsx         # GPU card UI
    ├── hooks/useNvidiaSmi.ts          # Fetch hook
    └── types/gpu.ts                   # Types
```


## License
MIT (or your preferred license)
