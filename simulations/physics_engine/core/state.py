import numpy as np

class StateVector:
    """
    Wraps a flattened state vector and provides methods to reshape it into 2D fields.
    """
    def __init__(self, data: np.ndarray, shape: tuple[int, int]):
        self.data = data
        self.shape = shape
        self.nx, self.ny = shape

    @classmethod
    def from_field(cls, field: np.ndarray):
        """Create a StateVector from a 2D field."""
        return cls(field.flatten(), field.shape)

    @classmethod
    def from_fields(cls, fields: list[np.ndarray]):
        """Create a StateVector from a list of 2D fields (stacked)."""
        if not fields:
            raise ValueError("At least one field is required")
        shape = fields[0].shape
        for f in fields:
            if f.shape != shape:
                raise ValueError("All fields must have the same shape")
        
        flat_data = np.concatenate([f.flatten() for f in fields])
        return cls(flat_data, shape)

    def to_field(self) -> np.ndarray:
        """Reshape the state vector into a single 2D field."""
        return self.data.reshape(self.shape)

    def to_fields(self, num_fields: int) -> list[np.ndarray]:
        """Reshape the state vector into a list of 2D fields."""
        field_size = self.nx * self.ny
        if self.data.size != field_size * num_fields:
             raise ValueError(f"State vector size {self.data.size} does not match expected size for {num_fields} fields of shape {self.shape}")
        
        fields = []
        for i in range(num_fields):
            start = i * field_size
            end = start + field_size
            fields.append(self.data[start:end].reshape(self.shape))
        return fields

    def __repr__(self):
        return f"StateVector(shape={self.shape}, size={self.data.size})"
