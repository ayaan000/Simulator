import numpy as np
import scipy.sparse as sp
from ..core.operator import LinearOperator
from ..grid.grid2d import Grid2D

def build_laplacian(nx: int, ny: int, dx: float, dy: float) -> sp.spmatrix:
    """
    Constructs a 2D discrete Laplacian operator using a 5-point stencil.
    Assumes zero Dirichlet boundary conditions for simplicity in this MVP.
    """
    n = nx * ny
    
    # Diagonals
    main_diag = -4.0 * np.ones(n)
    off_diag_x = np.ones(n - 1)
    off_diag_y = np.ones(n - ny)
    
    # Adjust for boundaries (simplified)
    # In a flattened array, x-neighbors are +/- 1, y-neighbors are +/- ny
    # We need to zero out connections that wrap around the grid in X
    for i in range(1, n):
        if i % nx == 0:
            off_diag_x[i-1] = 0
    
    diagonals = [main_diag, off_diag_x, off_diag_x, off_diag_y, off_diag_y]
    offsets = [0, 1, -1, ny, -ny]
    
    laplacian = sp.diags(diagonals, offsets, shape=(n, n), format='csr')
    
    # Scale by 1/dx^2 (assuming dx=dy for simplicity or taking average)
    laplacian /= (dx * dy) 
    return laplacian

class DiffusionModel:
    def __init__(self, grid: Grid2D, diffusivity: float):
        self.grid = grid
        self.diffusivity = diffusivity
        self.laplacian = build_laplacian(grid.nx, grid.ny, grid.dx, grid.dy)
        self.operator = LinearOperator(self.laplacian * diffusivity)

    def get_operator(self) -> LinearOperator:
        return self.operator
