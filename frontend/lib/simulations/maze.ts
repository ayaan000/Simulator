
export type MazeCell = {
    x: number;
    y: number;
    walls: [boolean, boolean, boolean, boolean]; // Top, Right, Bottom, Left
    visited: boolean;
};

export class MazeSimulator {
    rows: number;
    cols: number;
    grid: MazeCell[];
    current: MazeCell | null = null;
    stack: MazeCell[] = [];
    generator: Generator<MazeCell, void, unknown> | null = null;

    constructor(rows: number = 20, cols: number = 20) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.init();
    }

    init() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid.push({
                    x: c,
                    y: r,
                    walls: [true, true, true, true],
                    visited: false
                });
            }
        }
        this.current = this.grid[0];
        this.current.visited = true;
        this.stack = [];
        this.generator = this.generate();
    }

    index(c: number, r: number) {
        if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
        return c + r * this.cols;
    }

    removeWalls(a: MazeCell, b: MazeCell) {
        const x = a.x - b.x;
        if (x === 1) { a.walls[3] = false; b.walls[1] = false; }
        else if (x === -1) { a.walls[1] = false; b.walls[3] = false; }

        const y = a.y - b.y;
        if (y === 1) { a.walls[0] = false; b.walls[2] = false; }
        else if (y === -1) { a.walls[2] = false; b.walls[0] = false; }
    }

    *generate(): Generator<MazeCell> {
        while (true) {
            // Step 1: Choose random unvisited neighbor
            const neighbors: MazeCell[] = [];
            const top = this.grid[this.index(this.current!.x, this.current!.y - 1)];
            const right = this.grid[this.index(this.current!.x + 1, this.current!.y)];
            const bottom = this.grid[this.index(this.current!.x, this.current!.y + 1)];
            const left = this.grid[this.index(this.current!.x - 1, this.current!.y)];

            if (top && !top.visited) neighbors.push(top);
            if (right && !right.visited) neighbors.push(right);
            if (bottom && !bottom.visited) neighbors.push(bottom);
            if (left && !left.visited) neighbors.push(left);

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.stack.push(this.current!);
                this.removeWalls(this.current!, next);
                this.current = next;
                this.current.visited = true;
                yield this.current;
            } else if (this.stack.length > 0) {
                this.current = this.stack.pop()!;
                yield this.current;
            } else {
                break;
            }
        }
    }

    step() {
        if (this.generator) {
            this.generator.next();
        }
    }
}
