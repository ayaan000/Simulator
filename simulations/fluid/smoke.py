import numpy as np
from scipy.ndimage import map_coordinates

class FluidSimulation:
    """
    Simple Eulerian Fluid Simulation (Stable Fluids style).
    Simulates density (smoke) and velocity fields.
    """
    def __init__(self, nx: int, ny: int, dt: float = 0.1, diffusion: float = 0.0):
        self.nx = nx
        self.ny = ny
        self.dt = dt
        self.diff = diffusion
        
        # Fields
        self.density = np.zeros((nx, ny))
        self.u = np.zeros((nx, ny)) # x-velocity
        self.v = np.zeros((nx, ny)) # y-velocity
        
        # Color fields
        self.r = np.zeros((nx, ny))
        self.g = np.zeros((nx, ny))
        self.b = np.zeros((nx, ny))
        
        # Coordinates for interpolation
        self.x, self.y = np.meshgrid(np.arange(ny), np.arange(nx))

    def add_density(self, x, y, amount, color=(1.0, 1.0, 1.0)):
        self.density[x, y] += amount
        self.r[x, y] += amount * color[0]
        self.g[x, y] += amount * color[1]
        self.b[x, y] += amount * color[2]

    def add_velocity(self, x, y, amount_x, amount_y):
        self.u[x, y] += amount_x
        self.v[x, y] += amount_y

    def step(self):
        # 1. Advect Velocity (Self-Advection)
        self.u = self._advect(self.u, self.u, self.v)
        self.v = self._advect(self.v, self.u, self.v)
        
        # 2. Advect Density (moved by velocity)
        self.density = self._advect(self.density, self.u, self.v)
        self.r = self._advect(self.r, self.u, self.v)
        self.g = self._advect(self.g, self.u, self.v)
        self.b = self._advect(self.b, self.u, self.v)
        
        # 3. Diffuse (Optional, skipped for MVP as numerical dissipation is often enough)
        
        # 4. Project (Enforce incompressibility - skipped for MVP visual smoke)
        # A full projection step requires solving a Poisson equation. 
        # For visual "smoke", advection alone looks okay-ish but won't swirl correctly without projection.
        # We'll add a simple curl-noise or just leave as advection-only for MVP speed.
        
        # Decay
        self.density *= 0.99

    def _advect(self, field, u, v):
        # Backtrace
        # New pos = Old pos - velocity * dt
        # We want to find the value at (x, y) at t+1. It comes from (x - u*dt, y - v*dt) at t.
        
        # Map coordinates expects (row, col) -> (x, y) in numpy indexing
        # u is velocity in row direction (x), v is velocity in col direction (y)
        
        back_x = self.x - u * self.dt
        back_y = self.y - v * self.dt
        
        # Interpolate
        # map_coordinates uses (row_coords, col_coords)
        return map_coordinates(field, [back_x, back_y], order=1, mode='wrap')

    def get_state(self):
        return {
            "density": self.density,
            "velocity_u": self.u,
            "velocity_v": self.v,
            "r": self.r,
            "g": self.g,
            "b": self.b
        }
