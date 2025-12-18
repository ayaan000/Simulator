export type Body = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
    color: string;
};

export class PhysicsSimulator {
    size: number;
    u: Float32Array; // Current state (Wave/Heat)
    u_prev: Float32Array;
    u_next: Float32Array;

    bodies: Body[] = []; // Rigid Bodies

    damping: number;
    c: number; // Wave speed
    k: number; // Thermal conductivity
    mode: 'wave' | 'heat' | 'rigid';
    gravity: number = 0.5;
    restitution: number = 0.8;

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
        if (this.mode === 'rigid') {
            this.stepRigid();
            return;
        }

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

                if (this.mode === 'wave') {
                    this.u_next[idx] =
                        (2 * this.u[idx] - this.u_prev[idx] + this.c * this.c * laplacian) * this.damping;
                } else {
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

    stepRigid() {
        // Simple Euler integration & Boundary checks
        for (const b of this.bodies) {
            b.vy += this.gravity;
            b.x += b.vx;
            b.y += b.vy;

            // Damping / Air resistance
            b.vx *= 0.99;
            b.vy *= 0.99;

            // Boundaries (assuming 400x400 canvas mapping roughly to 0-400 coords? 
            // The view uses 400x400. Let's assume simulation uses 0-100 coordinate space to fit 'size')
            // Actually View maps 100x100 grid to 400x400.
            // Let's keep rigid bodies in 0-100 space for consistency with size, or 0-400?
            // Let's use 0-100 space to match 'size'.

            if (b.x < b.radius) { b.x = b.radius; b.vx *= -this.restitution; }
            if (b.x > this.size - b.radius) { b.x = this.size - b.radius; b.vx *= -this.restitution; }
            if (b.y < b.radius) { b.y = b.radius; b.vy *= -this.restitution; }
            if (b.y > this.size - b.radius) {
                b.y = this.size - b.radius;
                b.vy *= -this.restitution;
                // Friction
                b.vx *= 0.9;
            }
        }

        // Collisions (Naive O(N^2))
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const b1 = this.bodies[i];
                const b2 = this.bodies[j];

                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const dist = Math.hypot(dx, dy);
                const minDist = b1.radius + b2.radius;

                if (dist < minDist) {
                    // Resolve overlap
                    const overlap = minDist - dist;
                    const angle = Math.atan2(dy, dx);
                    const tx = Math.cos(angle) * overlap * 0.5;
                    const ty = Math.sin(angle) * overlap * 0.5;

                    b1.x -= tx;
                    b1.y -= ty;
                    b2.x += tx;
                    b2.y += ty;

                    // Elastic collision (ignoring mass for now or assuming equal mass)
                    // Simple 1D response along normal
                    // Normal vector
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Relative velocity
                    const dvx = b2.vx - b1.vx;
                    const dvy = b2.vy - b1.vy;

                    // Velocity along normal
                    const velAlongNormal = dvx * nx + dvy * ny;

                    // Do not resolve if velocities are separating
                    if (velAlongNormal > 0) continue;

                    // Impulse scalar
                    let jVal = -(1 + this.restitution) * velAlongNormal;
                    jVal /= (1 / b1.mass + 1 / b2.mass);

                    // Apply impulse
                    const impulseX = jVal * nx;
                    const impulseY = jVal * ny;

                    b1.vx -= (1 / b1.mass) * impulseX;
                    b1.vy -= (1 / b1.mass) * impulseY;
                    b2.vx += (1 / b2.mass) * impulseX;
                    b2.vy += (1 / b2.mass) * impulseY;
                }
            }
        }
    }

    addBody(x: number, y: number) {
        this.bodies.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: Math.random() * 2 + 1,
            mass: Math.random() * 2 + 1, // Mass proportional to radius? Let's say mass = radius
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
    }

    disturb(x: number, y: number, val: number) {
        if (this.mode === 'rigid') {
            this.addBody(x, y);
            return;
        }
        if (x > 1 && x < this.size - 1 && y > 1 && y < this.size - 1) {
            this.u[x * this.size + y] += val;
        }
    }
}
