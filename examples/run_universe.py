import sys
import os
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.universe.nbody import NBodySimulation

def main():
    n = 100
    steps = 200
    
    sim = NBodySimulation(num_bodies=n, G=1.0, dt=0.01)
    
    # Initialize in a disk
    angles = np.random.rand(n) * 2 * np.pi
    radii = np.random.rand(n) * 2 + 0.5
    sim.pos[:, 0] = radii * np.cos(angles)
    sim.pos[:, 1] = radii * np.sin(angles)
    
    # Tangential velocity for stability
    v_mag = np.sqrt(sim.G * n / radii) # Rough orbital velocity
    sim.vel[:, 0] = -v_mag * np.sin(angles)
    sim.vel[:, 1] = v_mag * np.cos(angles)
    
    print("Running N-body simulation...")
    
    # Store trajectories for plotting
    trajectories = np.zeros((steps, n, 2))
    
    for i in range(steps):
        sim.step()
        trajectories[i] = sim.pos
        
    # Plot
    plt.figure(figsize=(6, 6))
    for i in range(n):
        plt.plot(trajectories[:, i, 0], trajectories[:, i, 1], alpha=0.3)
    plt.scatter(trajectories[-1, :, 0], trajectories[-1, :, 1], c='red', s=10)
    plt.title(f"N-Body Simulation ({n} bodies, {steps} steps)")
    plt.xlim(-5, 5)
    plt.ylim(-5, 5)
    output_path = os.path.join(os.path.dirname(__file__), 'universe_result.png')
    plt.savefig(output_path)
    print(f"Result saved to {output_path}")

if __name__ == "__main__":
    main()
