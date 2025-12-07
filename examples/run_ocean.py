import sys
import os
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.ocean.ocean_env import OceanEnvironment

def main():
    nx, ny = 60, 60
    dt = 0.01
    steps = 200
    
    env = OceanEnvironment(nx, ny, dt, wave_speed=2.0, damping=0.05)
    
    # Initial drop
    X, Y = env.grid.get_coordinates()
    x0, y0 = 0.5, 0.5
    sigma = 0.05
    initial_surface = -1.0 * np.exp(-((X - x0)**2 + (Y - y0)**2) / (2 * sigma**2))
    
    env.set_initial_surface(initial_surface)
    
    print("Running ocean simulation...")
    for i in range(steps):
        env.step()
        if i % 20 == 0:
            print(f"Step {i}, Max Height: {np.max(env.get_surface()):.4f}")
            
    # Save result
    plt.imshow(env.get_surface(), extent=[0, 1, 0, 1], origin='lower', cmap='ocean')
    plt.colorbar(label='Height')
    plt.title(f"Ocean Surface after {steps} steps")
    output_path = os.path.join(os.path.dirname(__file__), 'ocean_result.png')
    plt.savefig(output_path)
    print(f"Result saved to {output_path}")

if __name__ == "__main__":
    main()
