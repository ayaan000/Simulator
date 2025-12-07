
export type Node = {
    id: number;
    x: number;
    y: number;
    neighbors: number[];
};

export type GraphStep = {
    visited: number[];
    path: number[];
    current: number | null;
    done: boolean;
};

export class GraphSimulator {
    nodes: Node[];
    generator: Generator<GraphStep, void, unknown> | null = null;

    constructor(numNodes: number = 20) {
        this.nodes = [];
        this.init(numNodes);
    }

    init(n: number) {
        this.nodes = [];
        // Generate random nodes
        for (let i = 0; i < n; i++) {
            this.nodes.push({
                id: i,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                neighbors: []
            });
        }
        // Connect neighbors based on distance
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const dist = Math.hypot(this.nodes[i].x - this.nodes[j].x, this.nodes[i].y - this.nodes[j].y);
                if (dist < 30) {
                    this.nodes[i].neighbors.push(j);
                    this.nodes[j].neighbors.push(i);
                }
            }
        }
    }

    addNode() {
        const id = this.nodes.length;
        this.nodes.push({
            id,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            neighbors: []
        });
    }

    toggleEdge(id1: number, id2: number) {
        const n1 = this.nodes[id1];
        const n2 = this.nodes[id2];

        const idx1 = n1.neighbors.indexOf(id2);
        if (idx1 !== -1) {
            // Remove
            n1.neighbors.splice(idx1, 1);
            n2.neighbors.splice(n2.neighbors.indexOf(id1), 1);
        } else {
            // Add
            n1.neighbors.push(id2);
            n2.neighbors.push(id1);
        }
    }

    *bfs(startId: number, endId: number): Generator<GraphStep> {
        const queue = [startId];
        const visited = new Set<number>();
        const parent = new Map<number, number>();
        visited.add(startId);

        while (queue.length > 0) {
            const curr = queue.shift()!;
            yield { visited: Array.from(visited), path: [], current: curr, done: false };

            if (curr === endId) {
                // Reconstruct path
                const path = [endId];
                let p = endId;
                while (parent.has(p)) {
                    p = parent.get(p)!;
                    path.unshift(p);
                }
                yield { visited: Array.from(visited), path, current: null, done: true };
                return;
            }

            for (const neighbor of this.nodes[curr].neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent.set(neighbor, curr);
                    queue.push(neighbor);
                }
            }
        }
        yield { visited: Array.from(visited), path: [], current: null, done: true };
    }

    *dfs(startId: number, endId: number): Generator<GraphStep> {
        const stack = [startId];
        const visited = new Set<number>();
        const parent = new Map<number, number>();

        while (stack.length > 0) {
            const curr = stack.pop()!;
            if (!visited.has(curr)) {
                visited.add(curr);
                yield { visited: Array.from(visited), path: [], current: curr, done: false };

                if (curr === endId) {
                    const path = [endId];
                    let p = endId;
                    while (parent.has(p)) {
                        p = parent.get(p)!;
                        path.unshift(p);
                    }
                    yield { visited: Array.from(visited), path, current: null, done: true };
                    return;
                }

                for (const neighbor of this.nodes[curr].neighbors) {
                    if (!visited.has(neighbor)) {
                        parent.set(neighbor, curr);
                        stack.push(neighbor);
                    }
                }
            }
        }
        yield { visited: Array.from(visited), path: [], current: null, done: true };
    }

    *dijkstra(startId: number, endId: number): Generator<GraphStep> {
        const dist = new Map<number, number>();
        const prev = new Map<number, number>();
        const pq = new Set<number>(); // Simple set as PQ for demo

        for (const node of this.nodes) {
            dist.set(node.id, Infinity);
            pq.add(node.id);
        }
        dist.set(startId, 0);

        const visited = new Set<number>();

        while (pq.size > 0) {
            // Find min dist node
            let u = -1;
            let minD = Infinity;
            for (const id of pq) {
                if (dist.get(id)! < minD) {
                    minD = dist.get(id)!;
                    u = id;
                }
            }

            if (u === -1 || minD === Infinity) break;
            pq.delete(u);
            visited.add(u);

            yield { visited: Array.from(visited), path: [], current: u, done: false };

            if (u === endId) {
                const path = [endId];
                let p = endId;
                while (prev.has(p)) {
                    p = prev.get(p)!;
                    path.unshift(p);
                }
                yield { visited: Array.from(visited), path, current: null, done: true };
                return;
            }

            for (const v of this.nodes[u].neighbors) {
                if (pq.has(v)) {
                    const alt = dist.get(u)! + 1; // Uniform weight
                    if (alt < dist.get(v)!) {
                        dist.set(v, alt);
                        prev.set(v, u);
                    }
                }
            }
        }
        yield { visited: Array.from(visited), path: [], current: null, done: true };
    }

    *astar(startId: number, endId: number): Generator<GraphStep> {
        const startNode = this.nodes[startId];
        const endNode = this.nodes[endId];

        const h = (id: number) => {
            const n = this.nodes[id];
            return Math.hypot(n.x - endNode.x, n.y - endNode.y);
        };

        const openSet = new Set<number>([startId]);
        const cameFrom = new Map<number, number>();

        const gScore = new Map<number, number>();
        gScore.set(startId, 0);

        const fScore = new Map<number, number>();
        fScore.set(startId, h(startId));

        const visited = new Set<number>();

        while (openSet.size > 0) {
            // Node with lowest fScore
            let current = -1;
            let minF = Infinity;
            for (const id of openSet) {
                const f = fScore.get(id) ?? Infinity;
                if (f < minF) {
                    minF = f;
                    current = id;
                }
            }

            if (current === endId) {
                const path = [endId];
                let p = endId;
                while (cameFrom.has(p)) {
                    p = cameFrom.get(p)!;
                    path.unshift(p);
                }
                yield { visited: Array.from(visited), path, current: null, done: true };
                return;
            }

            openSet.delete(current);
            visited.add(current);
            yield { visited: Array.from(visited), path: [], current, done: false };

            for (const neighbor of this.nodes[current].neighbors) {
                const tentative_g = gScore.get(current)! + Math.hypot(
                    this.nodes[current].x - this.nodes[neighbor].x,
                    this.nodes[current].y - this.nodes[neighbor].y
                );

                if (tentative_g < (gScore.get(neighbor) ?? Infinity)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentative_g);
                    fScore.set(neighbor, tentative_g + h(neighbor));
                    if (!visited.has(neighbor)) {
                        openSet.add(neighbor);
                    }
                }
            }
        }
        yield { visited: Array.from(visited), path: [], current: null, done: true };
    }

    start(type: string) {
        if (type === 'bfs') this.generator = this.bfs(0, this.nodes.length - 1);
        else if (type === 'dfs') this.generator = this.dfs(0, this.nodes.length - 1);
        else if (type === 'dijkstra') this.generator = this.dijkstra(0, this.nodes.length - 1);
        else if (type === 'astar') this.generator = this.astar(0, this.nodes.length - 1);
    }

    step(): GraphStep | null {
        if (!this.generator) return null;
        const res = this.generator.next();
        if (res.done) return { visited: [], path: [], current: null, done: true };
        return res.value;
    }
}
