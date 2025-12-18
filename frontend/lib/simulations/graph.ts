export type Node = {
    id: number;
    x: number;
    y: number;
    neighbors: { id: number; weight: number }[];
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
    startId: number = 0;
    endId: number = 0;

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
                    // Default weight 1 as requested, or dist? User said "default of 1".
                    this.nodes[i].neighbors.push({ id: j, weight: 1 });
                    this.nodes[j].neighbors.push({ id: i, weight: 1 });
                }
            }
        }
        this.startId = 0;
        this.endId = n - 1;
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

        const idx1 = n1.neighbors.findIndex(n => n.id === id2);
        if (idx1 !== -1) {
            // Remove
            n1.neighbors.splice(idx1, 1);
            const idx2 = n2.neighbors.findIndex(n => n.id === id1);
            if (idx2 !== -1) n2.neighbors.splice(idx2, 1);
        } else {
            // Add
            n1.neighbors.push({ id: id2, weight: 1 });
            n2.neighbors.push({ id: id1, weight: 1 });
        }
    }

    setEdgeWeight(id1: number, id2: number, weight: number) {
        const n1 = this.nodes[id1];
        const n2 = this.nodes[id2];
        const e1 = n1.neighbors.find(n => n.id === id2);
        if (e1) e1.weight = weight;
        const e2 = n2.neighbors.find(n => n.id === id1);
        if (e2) e2.weight = weight;
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
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    parent.set(neighbor.id, curr);
                    queue.push(neighbor.id);
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
                    if (!visited.has(neighbor.id)) {
                        parent.set(neighbor.id, curr);
                        stack.push(neighbor.id);
                    }
                }
            }
        }
        yield { visited: Array.from(visited), path: [], current: null, done: true };
    }

    *dijkstra(startId: number, endId: number): Generator<GraphStep> {
        const dist = new Map<number, number>();
        const prev = new Map<number, number>();
        const pq = new Set<number>();

        for (const node of this.nodes) {
            dist.set(node.id, Infinity);
            pq.add(node.id);
        }
        dist.set(startId, 0);
        const visited = new Set<number>();

        while (pq.size > 0) {
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

            for (const neighbor of this.nodes[u].neighbors) {
                if (pq.has(neighbor.id)) {
                    const alt = dist.get(u)! + neighbor.weight; // Use actual weight
                    if (alt < dist.get(neighbor.id)!) {
                        dist.set(neighbor.id, alt);
                        prev.set(neighbor.id, u);
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
            return Math.hypot(n.x - endNode.x, n.y - endNode.y) * 1; // Heuristic scale?
        };

        const openSet = new Set<number>([startId]);
        const cameFrom = new Map<number, number>();

        const gScore = new Map<number, number>();
        gScore.set(startId, 0);

        const fScore = new Map<number, number>();
        fScore.set(startId, h(startId));

        const visited = new Set<number>();

        while (openSet.size > 0) {
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
                const tentative_g = gScore.get(current)! + neighbor.weight; // Use edge weight for cost

                if (tentative_g < (gScore.get(neighbor.id) ?? Infinity)) {
                    cameFrom.set(neighbor.id, current);
                    gScore.set(neighbor.id, tentative_g);
                    fScore.set(neighbor.id, tentative_g + h(neighbor.id));
                    if (!visited.has(neighbor.id)) {
                        openSet.add(neighbor.id);
                    }
                }
            }
        }
        yield { visited: Array.from(visited), path: [], current: null, done: true };
    }

    start(type: string, startId?: number, endId?: number) {
        if (startId !== undefined) this.startId = startId;
        if (endId !== undefined) this.endId = endId;

        if (type === 'bfs') this.generator = this.bfs(this.startId, this.endId);
        else if (type === 'dfs') this.generator = this.dfs(this.startId, this.endId);
        else if (type === 'dijkstra') this.generator = this.dijkstra(this.startId, this.endId);
        else if (type === 'astar') this.generator = this.astar(this.startId, this.endId);
    }

    step(): GraphStep | null {
        if (!this.generator) return null;
        const res = this.generator.next();
        if (res.done) return { visited: [], path: [], current: null, done: true };
        return res.value;
    }
}
