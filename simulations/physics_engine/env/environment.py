import numpy as np
from ..core.state import StateVector
from ..core.operator import LinearOperator
from ..core.integrator import Integrator, ExplicitEuler

class SimulationEnvironment:
    """
    High-level class to manage a physics simulation.
    """
    def __init__(self, nx: int, ny: int, dt: float, operator: LinearOperator, integrator: Integrator = None):
        self.nx = nx
        self.ny = ny
        self.dt = dt
        self.operator = operator
        self.integrator = integrator or ExplicitEuler()
        self.state: StateVector = None
        self.t = 0.0

    def set_state(self, field: np.ndarray):
        """Set the current state from a 2D field."""
        self.state = StateVector.from_field(field)

    def set_state_vector(self, state_vector: StateVector):
        self.state = state_vector

    def step(self):
        """Advance the simulation by one time step."""
        if self.state is None:
            raise ValueError("State not initialized")
        
        new_data = self.integrator.step(self.state.data, self.operator, self.dt)
        self.state = StateVector(new_data, self.state.shape)
        self.t += self.dt

    def get_field(self) -> np.ndarray:
        """Get the current state as a 2D field."""
        if self.state is None:
            return None
        return self.state.to_field()
