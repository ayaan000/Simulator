import numpy as np
import scipy.sparse as sp

class LinearOperator:
    """
    Wraps a SciPy sparse matrix to act as a linear operator on the state vector.
    """
    def __init__(self, matrix: sp.spmatrix):
        self.matrix = matrix

    def apply(self, state_vector: np.ndarray) -> np.ndarray:
        """Apply the operator to a state vector (flattened array)."""
        return self.matrix.dot(state_vector)

    def __add__(self, other):
        if isinstance(other, LinearOperator):
            return LinearOperator(self.matrix + other.matrix)
        return NotImplemented

    def __mul__(self, scalar):
        return LinearOperator(self.matrix * scalar)
