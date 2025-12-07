import sys
import os
import numpy as np
import matplotlib.pyplot as plt

# Add the parent directory to sys.path to allow importing simulations
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.physics_engine.grid.grid2d import Grid2D
from simulations.physics_engine.models.diffusion import DiffusionModel
from simulations.physics_engine.env.environment import SimulationEnvironment

def main():
    # Parameters
    nx, ny = 50, 50
    lx, ly = 1.0, 1.0
    diffusivity = 0.01
    dt = 0.001
    steps = 100

    # Setup
    grid = Grid2D(nx, ny, lx, ly)
    model = DiffusionModel(grid, diffusivity)
    env = SimulationEnvironment(nx, ny, dt, model.get_operator())

    # Initial Condition: Gaussian bump in the center
    X, Y = grid.get_coordinates()
    x0, y0 = 0.5, 0.5
    sigma = 0.1
    initial_field = np.exp(-((X - x0)**2 + (Y - y0)**2) / (2 * sigma**2))
    
    env.set_state(initial_field)

    # Run
    print(f"Starting simulation with {steps} steps...")
    for i in range(steps):
        env.step()
        if i % 10 == 0:
            print(f"Step {i}, Max Value: {np.max(env.get_field()):.4f}")

    print("Simulation complete.")
    
    # Visualization (Optional, requires matplotlib)
    try:
        plt.imshow(env.get_field(), extent=[0, lx, 0, ly], origin='lower', cmap='hot')
        plt.colorbar(label='Temperature')
        plt.title(f"Diffusion after {steps} steps")
        output_path = os.path.join(os.path.dirname(__file__), 'diffusion_result.png')
        plt.savefig(output_path)
        print(f"Result saved to {output_path}")
    except Exception as e:
        print(f"Could not save image: {e}")

if __name__ == "__main__":
    main()
