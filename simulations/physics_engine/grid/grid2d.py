import numpy as np

class Grid2D:
    """
    Helper class to define a 2D grid and generate coordinate arrays.
    """
    def __init__(self, nx: int, ny: int, lx: float = 1.0, ly: float = 1.0):
        self.nx = nx
        self.ny = ny
        self.lx = lx
        self.ly = ly
        self.dx = lx / nx
        self.dy = ly / ny
        
        self.x = np.linspace(0, lx, nx)
        self.y = np.linspace(0, ly, ny)
        self.X, self.Y = np.meshgrid(self.x, self.y, indexing='ij')

    @property
    def shape(self):
        return (self.nx, self.ny)

    def get_coordinates(self):
        return self.X, self.Y
