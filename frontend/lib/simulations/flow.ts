
export type FlowNode = {
    id: number;
    x: number;
    y: number;
    label: string;
};

export type FlowEdge = {
    id: string;
    source: number;
    target: number;
    capacity: number;
    flow: number;
};

export class FlowSimulator {
    nodes: FlowNode[];
    edges: FlowEdge[];
    generator: Generator<any, void, unknown> | null = null;
    log: string[] = [];

    constructor() {
        this.nodes = [
            { id: 0, x: 100, y: 300, label: 'S' },
            { id: 1, x: 300, y: 150, label: 'A' },
            { id: 2, x: 300, y: 450, label: 'B' },
            { id: 3, x: 500, y: 150, label: 'C' },
            { id: 4, x: 500, y: 450, label: 'D' },
            { id: 5, x: 700, y: 300, label: 'T' },
        ];
        this.edges = [
            { id: 'e1', source: 0, target: 1, capacity: 10, flow: 0 },
            { id: 'e2', source: 0, target: 2, capacity: 10, flow: 0 },
            { id: 'e3', source: 1, target: 2, capacity: 2, flow: 0 },
            { id: 'e4', source: 1, target: 3, capacity: 4, flow: 0 },
            { id: 'e5', source: 1, target: 4, capacity: 8, flow: 0 },
            { id: 'e6', source: 2, target: 4, capacity: 9, flow: 0 },
            { id: 'e7', source: 3, target: 5, capacity: 10, flow: 0 },
            { id: 'e8', source: 4, target: 3, capacity: 6, flow: 0 },
            { id: 'e9', source: 4, target: 5, capacity: 10, flow: 0 },
        ];
    }

    addNode(x: number, y: number) {
        const id = this.nodes.length;
        this.nodes.push({ id, x, y, label: String(id) });
    }

    addEdge(source: number, target: number, capacity: number) {
        this.edges.push({
            id: `e-${Date.now()}`,
            source,
            target,
            capacity,
            flow: 0
        });
    }

    resetFlow() {
        this.edges.forEach(e => e.flow = 0);
        this.log = [];
    }

    *maxFlow(): Generator<any> {
        this.resetFlow();
        const source = 0;
        const sink = this.nodes.length - 1;
        let maxFlow = 0;

        while (true) {
            // BFS to find augmenting path
            const parent = new Map<number, FlowEdge>();
            const queue = [source];
            const visited = new Set<number>([source]);

            let pathFound = false;
            while (queue.length > 0) {
                const u = queue.shift()!;
                if (u === sink) {
                    pathFound = true;
                    break;
                }

                // Outgoing edges
                for (const edge of this.edges) {
                    if (edge.source === u && !visited.has(edge.target) && edge.capacity > edge.flow) {
                        visited.add(edge.target);
                        parent.set(edge.target, edge);
                        queue.push(edge.target);
                    }
                }
                // Incoming edges (residual) - simplified for now, assuming directed graph only forward
            }

            if (!pathFound) break;

            // Find bottleneck
            let pathFlow = Infinity;
            let v = sink;
            const pathEdges: string[] = [];
            while (v !== source) {
                const edge = parent.get(v)!;
                pathFlow = Math.min(pathFlow, edge.capacity - edge.flow);
                pathEdges.push(edge.id);
                v = edge.source;
            }

            // Update flow
            v = sink;
            while (v !== source) {
                const edge = parent.get(v)!;
                edge.flow += pathFlow;
                v = edge.source;
            }

            maxFlow += pathFlow;
            this.log.push(`Augmented flow by ${pathFlow}. Total: ${maxFlow}`);
            yield { maxFlow, pathEdges };
        }
        this.log.push(`Max Flow calculation complete. Max Flow: ${maxFlow}`);
    }

    step() {
        if (this.generator) {
            return this.generator.next();
        }
        return { done: true };
    }
}
