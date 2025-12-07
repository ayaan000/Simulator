import sys
import os
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.mars.mars_env import MarsEnvironment

def main():
    env = MarsEnvironment(nx=100, ny=100)
    env.add_rover(10.0, 10.0)
    
    print("Running Mars simulation...")
    
    rover_path = []
    
    for i in range(200):
        env.step(dt=0.1)
        r = env.rovers[0]
        rover_path.append((r["x"], r["y"]))
        
    path = np.array(rover_path)
    
    plt.imshow(env.terrain.T, extent=[0, 100, 0, 100], origin='lower', cmap='copper')
    plt.colorbar(label='Elevation')
    plt.plot(path[:, 0], path[:, 1], 'w-', label='Rover Path')
    plt.legend()
    plt.title("Mars Terrain & Rover Path")
    output_path = os.path.join(os.path.dirname(__file__), 'mars_result.png')
    plt.savefig(output_path)
    print(f"Result saved to {output_path}")

if __name__ == "__main__":
    main()
