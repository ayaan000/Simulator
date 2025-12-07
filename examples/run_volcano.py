import sys
import os
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.earth.volcano import VolcanoEnvironment

def main():
    env = VolcanoEnvironment(nx=50, ny=50)
    
    print("Running Volcano simulation...")
    for i in range(50):
        env.step()
        
    state = env.get_state()
    
    plt.imshow((state["terrain"] + state["lava"]).T, extent=[0, 1, 0, 1], origin='lower', cmap='terrain')
    # Overlay lava
    plt.imshow(state["lava"].T, extent=[0, 1, 0, 1], origin='lower', cmap='hot', alpha=0.5)
    
    plt.title("Volcano Lava Flow")
    output_path = os.path.join(os.path.dirname(__file__), 'volcano_result.png')
    plt.savefig(output_path)
    print(f"Result saved to {output_path}")

if __name__ == "__main__":
    main()
