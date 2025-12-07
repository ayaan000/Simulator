import numpy as np
from ..physics_engine.grid.grid2d import Grid2D

class MarsEnvironment:
    """
    Simulates a Mars-like environment with procedural terrain and simple atmospheric effects.
    """
    def __init__(self, nx: int, ny: int, lx: float = 100.0, ly: float = 100.0):
        self.grid = Grid2D(nx, ny, lx, ly)
        self.terrain = self._generate_terrain()
        self.rovers = []
        self.dust_intensity = 0.0

    def _generate_terrain(self):
        """
        Generates a heightmap using simple multi-octave noise (approximation).
        """
        X, Y = self.grid.get_coordinates()
        
        # Base low-frequency noise (rolling hills)
        # Using simple sin/cos summation as a proxy for Perlin noise to avoid external deps for now
        h = 2.0 * np.sin(X / 10.0) * np.cos(Y / 10.0)
        
        # Medium frequency (craters/rocks)
        h += 0.5 * np.sin(X / 2.0 + Y / 3.0)
        
        # High frequency (roughness)
        h += 0.1 * np.random.randn(*X.shape)
        
        # Add a "crater"
        cx, cy = self.grid.lx / 2, self.grid.ly / 2
        r = np.sqrt((X - cx)**2 + (Y - cy)**2)
        crater_mask = (r < 15.0)
        h[crater_mask] -= 5.0 * np.exp(-r[crater_mask]**2 / 50.0)
        
        return h

    def add_rover(self, x: float, y: float):
        self.rovers.append({"x": x, "y": y, "vx": 0.0, "vy": 0.0})

    def step(self, dt: float):
        # Update dust storms (random walk intensity)
        self.dust_intensity += np.random.randn() * 0.01
        self.dust_intensity = np.clip(self.dust_intensity, 0.0, 1.0)
        
        # Update rovers (simple physics on terrain)
        for rover in self.rovers:
            # Get local gradient
            ix = int(rover["x"] / self.grid.dx)
            iy = int(rover["y"] / self.grid.dy)
            
            # Clamp indices
            ix = max(0, min(self.grid.nx - 2, ix))
            iy = max(0, min(self.grid.ny - 2, iy))
            
            # Simple gradient descent gravity
            dh_dx = (self.terrain[ix+1, iy] - self.terrain[ix, iy]) / self.grid.dx
            dh_dy = (self.terrain[ix, iy+1] - self.terrain[ix, iy]) / self.grid.dy
            
            gravity = 3.71 # Mars gravity
            
            # F = ma -> a = F/m. Assume m=1.
            # Force = -gravity * slope - friction * v
            ax = -gravity * dh_dx - 0.5 * rover["vx"]
            ay = -gravity * dh_dy - 0.5 * rover["vy"]
            
            rover["vx"] += ax * dt
            rover["vy"] += ay * dt
            
            rover["x"] += rover["vx"] * dt
            rover["y"] += rover["vy"] * dt
            
            # Boundary checks
            rover["x"] = max(0, min(self.grid.lx, rover["x"]))
            rover["y"] = max(0, min(self.grid.ly, rover["y"]))

    def get_state(self):
        return {
            "terrain": self.terrain,
            "rovers": self.rovers,
            "dust_intensity": self.dust_intensity
        }
