
export class AutomataSimulator {
    rows: number;
    cols: number;
    grid: number[][];

    constructor(rows: number = 50, cols: number = 50) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createGrid();
        this.randomize();
    }

    createGrid() {
        return Array(this.rows).fill(0).map(() => Array(this.cols).fill(0));
    }

    randomize() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = Math.random() > 0.8 ? 1 : 0;
            }
        }
    }

    gliderGun() {
        // Clear grid
        for (let i = 0; i < this.rows; i++) this.grid[i].fill(0);

        const ox = 5, oy = 5;
        const gun = [
            [0, 4], [0, 5], [1, 4], [1, 5],
            [10, 4], [10, 5], [10, 6],
            [11, 3], [11, 7],
            [12, 2], [12, 8],
            [13, 2], [13, 8],
            [14, 5],
            [15, 3], [15, 7],
            [16, 4], [16, 5], [16, 6],
            [17, 5],
            [20, 2], [20, 3], [20, 4],
            [21, 2], [21, 3], [21, 4],
            [22, 1], [22, 5],
            [24, 0], [24, 1], [24, 5], [24, 6],
            [34, 2], [34, 3], [35, 2], [35, 3]
        ];

        gun.forEach(([x, y]) => {
            if (y + oy < this.rows && x + ox < this.cols) {
                this.grid[y + oy][x + ox] = 1;
            }
        });
    }

    pulsar() {
        // Clear grid
        for (let i = 0; i < this.rows; i++) this.grid[i].fill(0);

        const cx = Math.floor(this.cols / 2);
        const cy = Math.floor(this.rows / 2);

        const pattern = [
            [-6, -4], [-6, -3], [-6, -2], [-6, 2], [-6, 3], [-6, 4],
            [-4, -6], [-4, -1], [-4, 1], [-4, 6],
            [-3, -6], [-3, -1], [-3, 1], [-3, 6],
            [-2, -6], [-2, -1], [-2, 1], [-2, 6],

            [2, -6], [2, -1], [2, 1], [2, 6],
            [3, -6], [3, -1], [3, 1], [3, 6],
            [4, -6], [4, -1], [4, 1], [4, 6],

            [6, -4], [6, -3], [6, -2], [6, 2], [6, 3], [6, 4]
        ];

        pattern.forEach(([dx, dy]) => {
            if (cy + dy >= 0 && cy + dy < this.rows && cx + dx >= 0 && cx + dx < this.cols) {
                this.grid[cy + dy][cx + dx] = 1;
            }
        });
    }

    step() {
        const newGrid = this.createGrid();
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const neighbors = this.countNeighbors(i, j);
                if (this.grid[i][j] === 1) {
                    newGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                } else {
                    newGrid[i][j] = (neighbors === 3) ? 1 : 0;
                }
            }
        }
        this.grid = newGrid;
    }

    countNeighbors(x: number, y: number) {
        let sum = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const row = (x + i + this.rows) % this.rows;
                const col = (y + j + this.cols) % this.cols;
                sum += this.grid[row][col];
            }
        }
        sum -= this.grid[x][y];
        return sum;
    }
}
