# Universal Simulation Platform

A modular, extensible platform for running and visualizing physical, environmental, and algorithmic simulations.

## Features

### 🌌 Universe
- **N-Body Gravity**: Simulate planetary orbits and cluster formation.
- **Cosmic Expansion**: Visualize the growth of the universe.

### 🌊 Ocean & Marine Life
- **Fluid Dynamics**: Shallow water wave equations.
- **Marine Biology**: Autonomous agents (fish) interacting with the environment.

### 🪐 Planetary Environments
- **Mars**: Procedural terrain generation, rover physics, and dynamic dust storms.
- **Venus**: Atmospheric super-rotation, cloud dynamics, and extreme heat.
- **Earth/Volcano**: Viscous lava flow simulation on terrain.

### 🛠️ Terraforming
- **Meta-Simulation**: Control global parameters (Temperature, Pressure, Biomass).
- **Geo-Engineering**: Deploy solar shades, nuke polar caps, seed bacteria.

### 🔬 Physics Core
- **Heat Diffusion**: Real-time heat transfer visualization.
- **Wave Equation**: Propagation of disturbances.

### 💻 Algorithms
- **Sorting**: Visual bubble sort and other algorithms.
- **Graph Traversal**: BFS/DFS visualization (extensible).

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+

### Quick Start

We provide a unified launch script to install dependencies and start both the backend and frontend.

```bash
python start_platform.py
```

This will:
1. Install Python dependencies (`backend/requirements.txt`).
2. Install Node.js dependencies (`frontend/package.json`).
3. Start the FastAPI Backend on `http://localhost:8000`.
4. Start the Next.js Frontend on `http://localhost:3000`.

### Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Backend**: FastAPI (Python) - Handles simulation logic and state management.
- **Frontend**: Next.js (React) + Tailwind CSS - Handles visualization and user interaction.
- **Simulations**: Located in `/simulations`, designed to be modular and easily extensible.

## Extending

To add a new simulation:
1. Create a new package in `simulations/`.
2. Implement a class with a `step()` method and `get_state()` method.
3. Add an endpoint in `backend/main.py`.
4. Create a new page in `frontend/app/`.
