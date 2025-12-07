
export class PhysicsSimulator {
    size: number;
    u: Float32Array; // Current state
    u_prev: Float32Array; // Previous state
    u_next: Float32Array; // Next state
    damping: number;
    c: number; // Wave speed
    k: number; // Thermal conductivity
    mode: 'wave' | 'heat';

    constructor(size: number = 100) {
        this.size = size;
        this.u = new Float32Array(size * size);
        this.u_prev = new Float32Array(size * size);
        this.u_next = new Float32Array(size * size);
        this.damping = 0.99;
        this.c = 0.5;
        this.k = 0.1;
        this.mode = 'wave';
    }

    step() {
        const N = this.size;
        for (let i = 1; i < N - 1; i++) {
            for (let j = 1; j < N - 1; j++) {
                const idx = i * N + j;
                const laplacian =
                    this.u[(i + 1) * N + j] +
                    this.u[(i - 1) * N + j] +
                    this.u[i * N + (j + 1)] +
                    this.u[i * N + (j - 1)] -
                    4 * this.u[idx];

                // Wave equation discretization
                // u_next = 2*u - u_prev + c^2 * laplacian
                if (this.mode === 'wave') {
                    this.u_next[idx] =
                        (2 * this.u[idx] - this.u_prev[idx] + this.c * this.c * laplacian) * this.damping;
                } else {
                    // Heat equation: du/dt = k * laplacian
                    // u_next = u + dt * k * laplacian
                    this.u_next[idx] = this.u[idx] + this.k * laplacian;
                }
            }
        }

        // Swap buffers
        const temp = this.u_prev;
        this.u_prev = this.u;
        this.u = this.u_next;
        this.u_next = temp;
    }

    disturb(x: number, y: number, val: number) {
        if (x > 1 && x < this.size - 1 && y > 1 && y < this.size - 1) {
            this.u[x * this.size + y] += val;
        }
    }
}
