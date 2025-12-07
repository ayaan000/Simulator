import sys
import os
import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.physics_engine.grid.grid2d import Grid2D
from simulations.physics_engine.models.diffusion import DiffusionModel
from simulations.physics_engine.env.environment import SimulationEnvironment
from simulations.universe.nbody import NBodySimulation
from simulations.mars.mars_env import MarsEnvironment
from simulations.venus.venus_env import VenusEnvironment
from simulations.earth.volcano import VolcanoEnvironment
from simulations.terraforming.terraformer import TerraformingSim
from simulations.automata.game_of_life import GameOfLife
from simulations.fluid.smoke import FluidSimulation
from simulations.algorithms.sorting import bubble_sort_steps, merge_sort_steps, quick_sort_steps

app = FastAPI(title="Simulation Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage
sessions: Dict[str, Any] = {}

# --- Data Models ---
class CreatePhysicsRequest(BaseModel):
    type: str = "diffusion" # diffusion, wave
    nx: int = 50
    ny: int = 50
    dt: float = 0.01
    param: float = 0.1 # diffusivity or wave_speed

    param: float = 0.1 # diffusivity or wave_speed


class CreateUniverseRequest(BaseModel):
    num_bodies: int = 100
    G: float = 1.0
    dt: float = 0.01

class CreateMarsRequest(BaseModel):
    nx: int = 100
    ny: int = 100

class CreateVenusRequest(BaseModel):
    nx: int = 100
    ny: int = 50

class CreateVolcanoRequest(BaseModel):
    nx: int = 50
    ny: int = 50

class CreateTerraformRequest(BaseModel):
    planet: str = "Mars"

class TerraformActionRequest(BaseModel):
    session_id: str
    actions: Dict[str, bool]

class CreateAutomataRequest(BaseModel):
    nx: int = 50
    ny: int = 50

class CreateFluidRequest(BaseModel):
    nx: int = 64
    ny: int = 64

class FluidActionRequest(BaseModel):
    session_id: str
    x: int
    y: int
    amount: float
    r: float = 1.0
    g: float = 1.0
    b: float = 1.0

class StepRequest(BaseModel):
    session_id: str
    steps: int = 1

class CreateAlgoRequest(BaseModel):
    type: str = "bubble_sort"
    data: List[int]

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Simulation Platform API is running"}

# Physics Endpoints
@app.post("/sim/physics/create")
def create_physics(req: CreatePhysicsRequest):
    session_id = str(uuid.uuid4())
    
    grid = Grid2D(req.nx, req.ny)
    
    if req.type == "diffusion":
        model = DiffusionModel(grid, diffusivity=req.param)
        env = SimulationEnvironment(req.nx, req.ny, req.dt, model.get_operator())
        
        # Init with center bump
        X, Y = grid.get_coordinates()
        initial_field = np.exp(-((X - 0.5)**2 + (Y - 0.5)**2) / 0.02)
        env.set_state(initial_field)
        
        sessions[session_id] = {"type": "physics", "env": env}
    else:
        raise HTTPException(status_code=400, detail="Unknown physics model")
        
    return {"session_id": session_id}

@app.post("/sim/physics/step")
def step_physics(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[req.session_id]
    env = session["env"]
    
    for _ in range(req.steps):
        env.step()
        
    field = env.get_field()
    return {
        "t": env.t,
        "field": field.tolist(),
        "min": float(np.min(field)),
        "max": float(np.max(field))
    }

# Mars Endpoints
@app.post("/sim/mars/create")
def create_mars(req: CreateMarsRequest):
    session_id = str(uuid.uuid4())
    env = MarsEnvironment(req.nx, req.ny)
    env.add_rover(10.0, 10.0) # Default rover
    sessions[session_id] = {"type": "mars", "env": env}
    return {"session_id": session_id}

@app.post("/sim/mars/step")
def step_mars(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    env = sessions[req.session_id]["env"]
    # Mars step takes dt
    for _ in range(req.steps):
        env.step(dt=0.1)
        
    state = env.get_state()
    # Convert numpy arrays to lists for JSON
    state["terrain"] = state["terrain"].tolist()
    return state

# Venus Endpoints
@app.post("/sim/venus/create")
def create_venus(req: CreateVenusRequest):
    session_id = str(uuid.uuid4())
    env = VenusEnvironment(req.nx, req.ny)
    sessions[session_id] = {"type": "venus", "env": env}
    return {"session_id": session_id}

@app.post("/sim/venus/step")
def step_venus(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    env = sessions[req.session_id]["env"]
    for _ in range(req.steps):
        env.step()
    state = env.get_state()
    state["temperature"] = state["temperature"].tolist()
    state["clouds"] = state["clouds"].tolist()
    state["wind_u"] = state["wind_u"].tolist()
    return state

# Volcano Endpoints
@app.post("/sim/volcano/create")
def create_volcano(req: CreateVolcanoRequest):
    session_id = str(uuid.uuid4())
    env = VolcanoEnvironment(req.nx, req.ny)
    sessions[session_id] = {"type": "volcano", "env": env}
    return {"session_id": session_id}

@app.post("/sim/volcano/step")
def step_volcano(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    env = sessions[req.session_id]["env"]
    for _ in range(req.steps):
        env.step()
    state = env.get_state()
    state["terrain"] = state["terrain"].tolist()
    state["lava"] = state["lava"].tolist()
    return state

# Terraforming Endpoints
@app.post("/sim/terraforming/create")
def create_terraform(req: CreateTerraformRequest):
    session_id = str(uuid.uuid4())
    sim = TerraformingSim(req.planet)
    sessions[session_id] = {"type": "terraform", "sim": sim}
    return {"session_id": session_id}

@app.post("/sim/terraforming/step")
def step_terraform(req: TerraformActionRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    sim = sessions[req.session_id]["sim"]
    sim.step(req.actions)
    return sim.get_state()

# Automata Endpoints
@app.post("/sim/automata/create")
def create_automata(req: CreateAutomataRequest):
    session_id = str(uuid.uuid4())
    sim = GameOfLife(req.nx, req.ny)
    sessions[session_id] = {"type": "automata", "sim": sim}
    return {"session_id": session_id}

@app.post("/sim/automata/step")
def step_automata(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    sim = sessions[req.session_id]["sim"]
    for _ in range(req.steps):
        sim.step()
    return {"grid": sim.get_state().tolist()}

# Fluid Endpoints
@app.post("/sim/fluid/create")
def create_fluid(req: CreateFluidRequest):
    session_id = str(uuid.uuid4())
    sim = FluidSimulation(req.nx, req.ny)
    sessions[session_id] = {"type": "fluid", "sim": sim}
    return {"session_id": session_id}

@app.post("/sim/fluid/step")
def step_fluid(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    sim = sessions[req.session_id]["sim"]
    for _ in range(req.steps):
        sim.step()
    state = sim.get_state()
    return {
        "density": state["density"].tolist(),
        "velocity_u": state["velocity_u"].tolist(),
        "velocity_v": state["velocity_v"].tolist(),
        "r": state["r"].tolist(),
        "g": state["g"].tolist(),
        "b": state["b"].tolist()
    }

@app.post("/sim/fluid/action")
def action_fluid(req: FluidActionRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    sim = sessions[req.session_id]["sim"]
    sim.add_density(req.x, req.y, req.amount, color=(req.r, req.g, req.b))
    # Add random velocity for swirl
    sim.add_velocity(req.x, req.y, np.random.randn(), np.random.randn())
    return {"status": "ok"}

# Universe Endpoints
@app.post("/sim/universe/create")
def create_universe(req: CreateUniverseRequest):
    session_id = str(uuid.uuid4())
    sim = NBodySimulation(req.num_bodies, req.G, dt=req.dt)
    
    # Init disk
    n = req.num_bodies
    angles = np.random.rand(n) * 2 * np.pi
    radii = np.random.rand(n) * 2 + 0.5
    sim.pos[:, 0] = radii * np.cos(angles)
    sim.pos[:, 1] = radii * np.sin(angles)
    v_mag = np.sqrt(sim.G * n / radii)
    sim.vel[:, 0] = -v_mag * np.sin(angles)
    sim.vel[:, 1] = v_mag * np.cos(angles)
    
    sessions[session_id] = {"type": "universe", "sim": sim}
    return {"session_id": session_id}

@app.post("/sim/universe/step")
def step_universe(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sim = sessions[req.session_id]["sim"]
    for _ in range(req.steps):
        sim.step()
        
    state = sim.get_state()
    return {
        "t": sim.t,
        "positions": state["positions"].tolist()
    }

# Algorithm Endpoints
@app.post("/algorithms/create")
def create_algo(req: CreateAlgoRequest):
    session_id = str(uuid.uuid4())
    if req.type == "bubble_sort":
        gen = bubble_sort_steps(req.data)
        sessions[session_id] = {"type": "algo", "gen": gen, "done": False}
    elif req.type == "merge_sort":
        gen = merge_sort_steps(req.data)
        sessions[session_id] = {"type": "algo", "gen": gen, "done": False}
    elif req.type == "quick_sort":
        gen = quick_sort_steps(req.data)
        sessions[session_id] = {"type": "algo", "gen": gen, "done": False}
    else:
        raise HTTPException(status_code=400, detail="Unknown algorithm")
        
    return {"session_id": session_id}

@app.post("/algorithms/step")
def step_algo(req: StepRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[req.session_id]
    if session["done"]:
        return {"done": True}
    
    try:
        # Only step once for algorithms per request for now
        state, indices, swapped = next(session["gen"])
        return {
            "done": False,
            "data": state,
            "indices": indices,
            "swapped": swapped
        }
    except StopIteration:
        session["done"] = True
        return {"done": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
