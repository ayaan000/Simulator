import numpy as np
from ..physics_engine.grid.grid2d import Grid2D

class VenusEnvironment:
    """
    Simulates Venusian atmosphere: high pressure, heat, and super-rotation winds.
    """
    def __init__(self, nx: int, ny: int):
        self.grid = Grid2D(nx, ny)
        
        # Temperature field (Kelvin) - very hot
        self.temp = np.ones((nx, ny)) * 737.0 
        
        # Wind velocity (zonal flow)
        self.u_wind = np.ones((nx, ny)) * 100.0 # Super-rotation (m/s)
        self.v_wind = np.zeros((nx, ny))
        
        # Cloud density (sulfuric acid clouds)
        self.clouds = np.random.rand(nx, ny) * 0.5 + 0.5
        
        self.dt = 0.1

    def step(self):
        # 1. Advection: Winds move clouds and heat
        # Simple semi-Lagrangian or finite difference advection
        # For MVP: simple shift + diffusion
        
        # Zonal flow (West to East)
        shift = int(self.u_wind[0,0] * self.dt) # Simplified uniform shift
        self.clouds = np.roll(self.clouds, shift, axis=0)
        self.temp = np.roll(self.temp, shift, axis=0)
        
        # 2. Turbulence / Diffusion
        noise = np.random.randn(*self.clouds.shape) * 0.01
        self.clouds += noise
        self.clouds = np.clip(self.clouds, 0, 1)
        
        # 3. Heat fluctuation
        # Day/Night side difference (though Venus rotates slowly, atmosphere moves fast)
        # Add a "hot spot" that moves
        
    def get_state(self):
        return {
            "temperature": self.temp,
            "clouds": self.clouds,
            "wind_u": self.u_wind
        }
