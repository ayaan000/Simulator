import sys
import os
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.venus.venus_env import VenusEnvironment

def main():
    env = VenusEnvironment(nx=100, ny=50)
    
    print("Running Venus simulation...")
    for i in range(50):
        env.step()
        
    state = env.get_state()
    
    plt.imshow(state["clouds"].T, extent=[0, 360, -90, 90], origin='lower', cmap='YlOrBr')
    plt.colorbar(label='Cloud Density')
    plt.title("Venus Atmosphere (Super-rotation)")
    output_path = os.path.join(os.path.dirname(__file__), 'venus_result.png')
    plt.savefig(output_path)
    print(f"Result saved to {output_path}")

if __name__ == "__main__":
    main()
