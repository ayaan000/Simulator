
export type Body = {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    mass: number;
    radius: number;
    color: string;
    trail: [number, number, number][];
};

export class UniverseSimulator {
    bodies: Body[];
    G: number;
    dt: number;

    constructor(numBodies: number = 100) {
        this.G = 0.1;
        this.dt = 0.01;
        this.bodies = [];
        this.init(numBodies);
    }

    init(n: number) {
        this.bodies = [];
        // Star
        this.bodies.push({
            x: 0, y: 0, z: 0,
            vx: 0, vy: 0, vz: 0,
            mass: 10000,
            radius: 5,
            color: '#FFD700',
            trail: []
        });

        // Planets
        for (let i = 0; i < n; i++) {
            const dist = 20 + Math.random() * 80;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.sqrt((this.G * 10000) / dist); // Circular orbit v = sqrt(GM/r)

            this.bodies.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                z: (Math.random() - 0.5) * 5,
                vx: -Math.sin(angle) * velocity,
                vy: Math.cos(angle) * velocity,
                vz: (Math.random() - 0.5) * 0.1,
                mass: 1 + Math.random() * 5,
                radius: 1 + Math.random(),
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                trail: []
            });
        }
    }

    solarSystem() {
        this.bodies = [];
        // Sun
        this.bodies.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, mass: 30000, radius: 6, color: '#FFD700', trail: [] });

        // Mercury
        this.bodies.push({ x: 10, y: 0, z: 0, vx: 0, vy: Math.sqrt((this.G * 30000) / 10), vz: 0, mass: 1, radius: 0.8, color: '#A5A5A5', trail: [] });
        // Venus
        this.bodies.push({ x: 15, y: 0, z: 0, vx: 0, vy: Math.sqrt((this.G * 30000) / 15), vz: 0, mass: 2, radius: 1.2, color: '#E3BB76', trail: [] });
        // Earth
        this.bodies.push({ x: 20, y: 0, z: 0, vx: 0, vy: Math.sqrt((this.G * 30000) / 20), vz: 0, mass: 2, radius: 1.3, color: '#22A6B3', trail: [] });
        // Mars
        this.bodies.push({ x: 25, y: 0, z: 0, vx: 0, vy: Math.sqrt((this.G * 30000) / 25), vz: 0, mass: 1.5, radius: 1.0, color: '#EB4D4B', trail: [] });
        // Jupiter
        this.bodies.push({ x: 40, y: 0, z: 0, vx: 0, vy: Math.sqrt((this.G * 30000) / 40), vz: 0, mass: 50, radius: 3.5, color: '#F0932B', trail: [] });
    }

    blackHole() {
        this.bodies = [];
        // Supermassive Black Hole
        this.bodies.push({
            x: 0, y: 0, z: 0,
            vx: 0, vy: 0, vz: 0,
            mass: 500000,
            radius: 8,
            color: '#000000',
            trail: []
        });

        // Accretion Disk debris
        for (let i = 0; i < 300; i++) {
            const dist = 15 + Math.random() * 60;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.sqrt((this.G * 500000) / dist);
            // Add some randomness to velocity/plane
            const variation = 0.8 + Math.random() * 0.4;

            this.bodies.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                z: (Math.random() - 0.5) * 2,
                vx: -Math.sin(angle) * velocity * variation,
                vy: Math.cos(angle) * velocity * variation,
                vz: (Math.random() - 0.5) * 0.5,
                mass: 0.1 + Math.random(),
                radius: 0.5 + Math.random() * 0.5,
                color: `hsl(${Math.random() * 60 + 10}, 80%, ${40 + Math.random() * 40}%)`, // Fire colors
                trail: []
            });
        }
    }

    step() {
        const n = this.bodies.length;
        // Compute forces
        for (let i = 0; i < n; i++) {
            let fx = 0, fy = 0, fz = 0;
            for (let j = 0; j < n; j++) {
                if (i === j) continue;
                const dx = this.bodies[j].x - this.bodies[i].x;
                const dy = this.bodies[j].y - this.bodies[i].y;
                const dz = this.bodies[j].z - this.bodies[i].z;
                const distSq = dx * dx + dy * dy + dz * dz;
                // Softened gravity to prevent singularities and instability
                // F = G * m1 * m2 / (r^2 + softening^2)
                // Vector form: F_vec = F * (r_vec / r) = (G * m1 * m2 * r_vec) / (r^2 + softening^2)^(3/2)

                const softening = 2.0; // Softening parameter
                const distSoft = Math.pow(distSq + softening * softening, 1.5);

                const f = (this.G * this.bodies[i].mass * this.bodies[j].mass) / distSoft;

                fx += f * dx;
                fy += f * dy;
                fz += f * dz;
            }
            this.bodies[i].vx += (fx / this.bodies[i].mass) * this.dt;
            this.bodies[i].vy += (fy / this.bodies[i].mass) * this.dt;
            this.bodies[i].vz += (fz / this.bodies[i].mass) * this.dt;
        }

        // Update positions
        for (let i = 0; i < n; i++) {
            this.bodies[i].x += this.bodies[i].vx * this.dt;
            this.bodies[i].y += this.bodies[i].vy * this.dt;
            this.bodies[i].z += this.bodies[i].vz * this.dt;

            // Update trail (limit length)
            if (Math.random() < 0.1) { // Don't save every frame
                this.bodies[i].trail.push([this.bodies[i].x, this.bodies[i].y, this.bodies[i].z]);
                if (this.bodies[i].trail.length > 50) this.bodies[i].trail.shift();
            }
        }
    }
}
