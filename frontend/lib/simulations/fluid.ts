
export class FluidSimulator {
    size: number;
    dt: number;
    diff: number;
    visc: number;

    s: Float32Array;
    density: Float32Array;

    Vx: Float32Array;
    Vy: Float32Array;

    Vx0: Float32Array;
    Vy0: Float32Array;

    // Color fields
    r: Float32Array;
    g: Float32Array;
    b: Float32Array;
    r0: Float32Array;
    g0: Float32Array;
    b0: Float32Array;

    obstacles: Uint8Array;

    constructor(size: number, dt: number, diff: number, visc: number) {
        this.size = size;
        this.dt = dt;
        this.diff = diff;
        this.visc = visc;

        const N = size * size;
        this.s = new Float32Array(N);
        this.density = new Float32Array(N);
        this.obstacles = new Uint8Array(N);

        this.Vx = new Float32Array(N);
        this.Vy = new Float32Array(N);
        this.Vx0 = new Float32Array(N);
        this.Vy0 = new Float32Array(N);

        this.r = new Float32Array(N);
        this.g = new Float32Array(N);
        this.b = new Float32Array(N);
        this.r0 = new Float32Array(N);
        this.g0 = new Float32Array(N);
        this.b0 = new Float32Array(N);
    }

    addDensity(x: number, y: number, amount: number, color: { r: number, g: number, b: number }) {
        const idx = this.IX(x, y);
        this.density[idx] += amount;
        this.r[idx] += amount * color.r;
        this.g[idx] += amount * color.g;
        this.b[idx] += amount * color.b;
    }

    addVelocity(x: number, y: number, amountX: number, amountY: number) {
        const idx = this.IX(x, y);
        this.Vx[idx] += amountX;
        this.Vy[idx] += amountY;
    }

    addObstacle(x: number, y: number) {
        const idx = this.IX(x, y);
        this.obstacles[idx] = 1;
        // Clear fluid at obstacle
        this.density[idx] = 0;
        this.Vx[idx] = 0;
        this.Vy[idx] = 0;
    }

    step() {
        const N = this.size;
        const visc = this.visc;
        const diff = this.diff;
        const dt = this.dt;
        const Vx = this.Vx;
        const Vy = this.Vy;
        const Vx0 = this.Vx0;
        const Vy0 = this.Vy0;
        const s = this.s;
        const density = this.density;

        this.diffuse(1, Vx0, Vx, visc, dt);
        this.diffuse(2, Vy0, Vy, visc, dt);

        this.project(Vx0, Vy0, Vx, Vy);

        this.advect(1, Vx, Vx0, Vx0, Vy0, dt);
        this.advect(2, Vy, Vy0, Vx0, Vy0, dt);

        this.project(Vx, Vy, Vx0, Vy0);

        this.diffuse(0, s, density, diff, dt);
        this.advect(0, density, s, Vx, Vy, dt);

        // Color advection
        this.diffuse(0, this.r0, this.r, diff, dt);
        this.advect(0, this.r, this.r0, Vx, Vy, dt);

        this.diffuse(0, this.g0, this.g, diff, dt);
        this.advect(0, this.g, this.g0, Vx, Vy, dt);

        this.diffuse(0, this.b0, this.b, diff, dt);
        this.advect(0, this.b, this.b0, Vx, Vy, dt);
    }

    IX(x: number, y: number) {
        return x + y * this.size;
    }

    diffuse(b: number, x: Float32Array, x0: Float32Array, diff: number, dt: number) {
        const a = dt * diff * (this.size - 2) * (this.size - 2);
        this.lin_solve(b, x, x0, a, 1 + 6 * a);
    }

    lin_solve(b: number, x: Float32Array, x0: Float32Array, a: number, c: number) {
        const tolerance = 1e-5;
        const iter = 4; // Low iterations for performance in JS
        const N = this.size;

        for (let k = 0; k < iter; k++) {
            for (let j = 1; j < N - 1; j++) {
                for (let i = 1; i < N - 1; i++) {
                    const idx = this.IX(i, j);
                    if (this.obstacles[idx]) {
                        x[idx] = 0;
                        continue;
                    }
                    x[idx] =
                        (x0[idx] +
                            a * (x[this.IX(i + 1, j)] + x[this.IX(i - 1, j)] +
                                x[this.IX(i, j + 1)] + x[this.IX(i, j - 1)])) / c;
                }
            }
            this.set_bnd(b, x);
        }
    }

    project(velocX: Float32Array, velocY: Float32Array, p: Float32Array, div: Float32Array) {
        const N = this.size;
        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                div[this.IX(i, j)] = -0.5 * (
                    velocX[this.IX(i + 1, j)] - velocX[this.IX(i - 1, j)] +
                    velocY[this.IX(i, j + 1)] - velocY[this.IX(i, j - 1)]
                ) / N;
                p[this.IX(i, j)] = 0;
            }
        }
        this.set_bnd(0, div);
        this.set_bnd(0, p);
        this.lin_solve(0, p, div, 1, 6);

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                velocX[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) * N;
                velocY[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) * N;
            }
        }
        this.set_bnd(1, velocX);
        this.set_bnd(2, velocY);
    }

    advect(b: number, d: Float32Array, d0: Float32Array, velocX: Float32Array, velocY: Float32Array, dt: number) {
        const N = this.size;
        let i0, i1, j0, j1;

        const dt0 = dt * (N - 2);

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                let x = i - dt0 * velocX[this.IX(i, j)];
                let y = j - dt0 * velocY[this.IX(i, j)];

                if (x < 0.5) x = 0.5;
                if (x > N + 0.5) x = N + 0.5;
                i0 = Math.floor(x);
                i1 = i0 + 1;

                if (y < 0.5) y = 0.5;
                if (y > N + 0.5) y = N + 0.5;
                j0 = Math.floor(y);
                j1 = j0 + 1;

                const s1 = x - i0;
                const s0 = 1.0 - s1;
                const t1 = y - j0;
                const t0 = 1.0 - t1;

                d[this.IX(i, j)] =
                    s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) +
                    s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
            }
        }
        this.set_bnd(b, d);
    }

    set_bnd(b: number, x: Float32Array) {
        const N = this.size;
        for (let i = 1; i < N - 1; i++) {
            x[this.IX(i, 0)] = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
            x[this.IX(i, N - 1)] = b === 2 ? -x[this.IX(i, N - 2)] : x[this.IX(i, N - 2)];
        }
        for (let j = 1; j < N - 1; j++) {
            x[this.IX(0, j)] = b === 1 ? -x[this.IX(1, j)] : x[this.IX(1, j)];
            x[this.IX(N - 1, j)] = b === 1 ? -x[this.IX(N - 2, j)] : x[this.IX(N - 2, j)];
        }

        x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
        x[this.IX(0, N - 1)] = 0.5 * (x[this.IX(1, N - 1)] + x[this.IX(0, N - 2)]);
        x[this.IX(N - 1, 0)] = 0.5 * (x[this.IX(N - 2, 0)] + x[this.IX(N - 1, 1)]);
        x[this.IX(N - 1, N - 1)] = 0.5 * (x[this.IX(N - 2, N - 1)] + x[this.IX(N - 1, N - 2)]);
    }
}
