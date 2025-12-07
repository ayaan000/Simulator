import numpy as np
from scipy.signal import convolve2d

class GameOfLife:
    """
    Conway's Game of Life simulation.
    """
    def __init__(self, nx: int, ny: int):
        self.nx = nx
        self.ny = ny
        # Random initial state
        self.grid = np.random.choice([0, 1], size=(nx, ny), p=[0.8, 0.2])
        
        # Kernel for counting neighbors
        self.kernel = np.array([[1, 1, 1],
                                [1, 0, 1],
                                [1, 1, 1]])

    def step(self):
        # Count neighbors
        neighbors = convolve2d(self.grid, self.kernel, mode='same', boundary='wrap')
        
        # Apply rules
        # 1. Any live cell with 2 or 3 live neighbors survives.
        # 2. Any dead cell with 3 live neighbors becomes a live cell.
        # 3. All other live cells die in the next generation.
        # 4. All other dead cells stay dead.
        
        new_grid = np.zeros_like(self.grid)
        
        # Rule 1 & 3 (Survival)
        new_grid[(self.grid == 1) & ((neighbors == 2) | (neighbors == 3))] = 1
        
        # Rule 2 (Birth)
        new_grid[(self.grid == 0) & (neighbors == 3)] = 1
        
        self.grid = new_grid

    def get_state(self):
        return self.grid
