import numpy as np

class NBodySimulation:
    """
    Simulates N particles interacting via gravity.
    """
    def __init__(self, num_bodies: int, G: float = 1.0, softening: float = 0.1, dt: float = 0.01):
        self.n = num_bodies
        self.G = G
        self.softening = softening
        self.dt = dt
        
        # State: positions (x, y) and velocities (vx, vy)
        self.pos = np.random.randn(self.n, 2)
        self.vel = np.random.randn(self.n, 2) * 0.1
        self.mass = np.ones(self.n)
        self.t = 0.0

    def compute_accelerations(self):
        # Direct sum calculation
        # dx[i, j] = x[j] - x[i]
        
        x = self.pos[:, 0:1]
        y = self.pos[:, 1:2]
        
        dx = x.T - x
        dy = y.T - y
        
        inv_r3 = (dx**2 + dy**2 + self.softening**2)**(-1.5)
        
        ax = self.G * (dx * inv_r3) @ self.mass
        ay = self.G * (dy * inv_r3) @ self.mass
        
        return np.stack((ax, ay), axis=1)

    def step(self):
        # Symplectic Euler / Leapfrog integration
        acc = self.compute_accelerations()
        
        self.vel += acc * self.dt
        self.pos += self.vel * self.dt
        self.t += self.dt

    def get_state(self):
        return {
            "positions": self.pos.copy(),
            "velocities": self.vel.copy(),
            "masses": self.mass.copy()
        }
