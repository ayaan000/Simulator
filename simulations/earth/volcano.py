import numpy as np
from ..physics_engine.grid.grid2d import Grid2D

class VolcanoEnvironment:
    """
    Simulates lava flow down a terrain.
    Lava is treated as a viscous fluid that spreads and hardens.
    """
    def __init__(self, nx: int, ny: int):
        self.grid = Grid2D(nx, ny)
        self.terrain = self._generate_volcano()
        self.lava = np.zeros((nx, ny))
        self.lava_source = (nx // 2, ny // 2)
        self.active = True

    def _generate_volcano(self):
        X, Y = self.grid.get_coordinates()
        # Cone shape
        cx, cy = 0.5, 0.5
        r = np.sqrt((X - cx)**2 + (Y - cy)**2)
        height = 1.0 - r
        height[height < 0] = 0
        return height * 10.0 # Scale height

    def step(self):
        if self.active:
            # Erupt lava at source
            sx, sy = self.lava_source
            self.lava[sx, sy] += 0.5 # Add lava height
            
        # Flow logic (simplified cellular automata / finite difference)
        # Lava flows to lower neighbors (terrain + lava height)
        
        total_height = self.terrain + self.lava
        new_lava = self.lava.copy()
        
        # Simple diffusion-like spreading based on height difference
        # This is a very rough approximation of viscous flow
        for i in range(1, self.grid.nx - 1):
            for j in range(1, self.grid.ny - 1):
                if self.lava[i, j] > 0:
                    h_curr = total_height[i, j]
                    
                    # Check neighbors
                    neighbors = [(i+1, j), (i-1, j), (i, j+1), (i, j-1)]
                    for ni, nj in neighbors:
                        h_neigh = total_height[ni, nj]
                        diff = h_curr - h_neigh
                        if diff > 0:
                            flow = diff * 0.1 # Viscosity factor
                            amount = min(self.lava[i, j], flow)
                            new_lava[i, j] -= amount
                            new_lava[ni, nj] += amount
                            
        self.lava = new_lava

    def get_state(self):
        return {
            "terrain": self.terrain,
            "lava": self.lava
        }
