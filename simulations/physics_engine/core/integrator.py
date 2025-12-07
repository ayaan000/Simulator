import numpy as np
from .operator import LinearOperator

class Integrator:
    def step(self, state: np.ndarray, operator: LinearOperator, dt: float) -> np.ndarray:
        raise NotImplementedError

class ExplicitEuler(Integrator):
    def step(self, state: np.ndarray, operator: LinearOperator, dt: float) -> np.ndarray:
        # s_{t+1} = s_t + dt * (A * s_t)
        # This assumes the system is ds/dt = A * s
        derivative = operator.apply(state)
        return state + dt * derivative

class RK4(Integrator):
    def step(self, state: np.ndarray, operator: LinearOperator, dt: float) -> np.ndarray:
        k1 = operator.apply(state)
        k2 = operator.apply(state + 0.5 * dt * k1)
        k3 = operator.apply(state + 0.5 * dt * k2)
        k4 = operator.apply(state + dt * k3)
        return state + (dt / 6.0) * (k1 + 2*k2 + 2*k3 + k4)
