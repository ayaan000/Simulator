import sys
import os
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.automata.game_of_life import GameOfLife

def main():
    sim = GameOfLife(nx=50, ny=50)
    
    print("Running Game of Life...")
    for i in range(10):
        sim.step()
        
    plt.imshow(sim.get_state(), cmap='binary')
    plt.title("Game of Life")
    output_path = os.path.join(os.path.dirname(__file__), 'gol_result.png')
    plt.savefig(output_path)
    print(f"Result saved to {output_path}")

if __name__ == "__main__":
    main()
