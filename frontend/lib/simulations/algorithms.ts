
export type SortStep = {
    data: number[];
    indices: number[];
    swapped: number[];
    done: boolean;
};

export class SortingSimulator {
    data: number[];
    generator: Generator<SortStep, void, unknown> | null = null;

    constructor(size: number = 50) {
        this.data = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    }

    init(size: number) {
        this.data = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
        this.generator = null;
    }

    reset(size: number = 50) {
        // If size is passed, use it, otherwise keep current data size or default
        if (size !== this.data.length) {
            this.data = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
        } else {
            // Reshuffle or new random
            this.data = Array.from({ length: this.data.length }, () => Math.floor(Math.random() * 100));
        }
        this.generator = null;
        return [...this.data];
    }

    *bubbleSort(arr: number[]): Generator<SortStep> {
        const n = arr.length;
        let a = [...arr];
        for (let i = 0; i < n; i++) {
            let swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                yield { data: [...a], indices: [j, j + 1], swapped: [], done: false };
                if (a[j] > a[j + 1]) {
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    swapped = true;
                    yield { data: [...a], indices: [j, j + 1], swapped: [j, j + 1], done: false };
                }
            }
            if (!swapped) break;
        }
        yield { data: [...a], indices: [], swapped: [], done: true };
    }

    *quickSort(arr: number[], low: number, high: number): Generator<SortStep> {
        if (low < high) {
            // Partition
            const pivot = arr[high];
            let i = low - 1;
            for (let j = low; j < high; j++) {
                yield { data: [...arr], indices: [j, high], swapped: [], done: false };
                if (arr[j] <= pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    yield { data: [...arr], indices: [i, j], swapped: [i, j], done: false };
                }
            }
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            yield { data: [...arr], indices: [i + 1, high], swapped: [i + 1, high], done: false };

            const pi = i + 1;
            yield* this.quickSort(arr, low, pi - 1);
            yield* this.quickSort(arr, pi + 1, high);
        }
        if (low === 0 && high === arr.length - 1) {
            yield { data: [...arr], indices: [], swapped: [], done: true };
        }
    }

    *mergeSort(arr: number[], l: number, r: number): Generator<SortStep> {
        if (l < r) {
            const m = Math.floor((l + r) / 2);
            yield* this.mergeSort(arr, l, m);
            yield* this.mergeSort(arr, m + 1, r);
            yield* this.merge(arr, l, m, r);
        }
        if (l === 0 && r === arr.length - 1) {
            yield { data: [...arr], indices: [], swapped: [], done: true };
        }
    }

    *merge(arr: number[], l: number, m: number, r: number): Generator<SortStep> {
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = arr.slice(l, m + 1);
        const R = arr.slice(m + 1, r + 1);

        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            yield { data: [...arr], indices: [l + i, m + 1 + j], swapped: [], done: false };
            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            yield { data: [...arr], indices: [k], swapped: [k], done: false };
            k++;
        }
        while (i < n1) {
            arr[k] = L[i];
            i++;
            yield { data: [...arr], indices: [k], swapped: [k], done: false };
            k++;
        }
        while (j < n2) {
            arr[k] = R[j];
            j++;
            yield { data: [...arr], indices: [k], swapped: [k], done: false };
            k++;
        }
    }

    start(type: string) {
        const arr = [...this.data];
        if (type === 'bubble') this.generator = this.bubbleSort(arr);
        else if (type === 'quick') this.generator = this.quickSort(arr, 0, arr.length - 1);
        else if (type === 'merge') this.generator = this.mergeSort(arr, 0, arr.length - 1);
    }

    step(): SortStep | null {
        if (!this.generator) return null;
        const res = this.generator.next();
        if (res.done) return { data: this.data, indices: [], swapped: [], done: true };
        return res.value;
    }
}
