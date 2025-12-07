import sys
import os
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.fluid.smoke import FluidSimulation

def main():
    sim = FluidSimulation(nx=64, ny=64, dt=1.0)
    
    print("Running Fluid simulation...")
    
    # Add source
    cx, cy = 32, 32
    
    for i in range(50):
        # Add smoke and velocity at center
        sim.add_density(cx, cy, 10.0)
        sim.add_velocity(cx, cy, np.random.randn(), np.random.randn())
        
        sim.step()
        
    plt.imshow(sim.get_state()["density"], cmap='gray', origin='lower')
    plt.title("Smoke Simulation")
    output_path = os.path.join(os.path.dirname(__file__), 'smoke_result.png')
    plt.savefig(output_path)
    print(f"Result saved to {output_path}")

if __name__ == "__main__":
    main()
