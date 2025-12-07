import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from simulations.algorithms.sorting import bubble_sort_steps
from simulations.algorithms.graph_traversal import bfs_steps

def main():
    print("--- Bubble Sort Visualization ---")
    arr = [64, 34, 25, 12, 22, 11, 90]
    print(f"Initial: {arr}")
    
    gen = bubble_sort_steps(arr)
    step = 0
    for state, indices, swapped in gen:
        step += 1
        status = "SWAP" if swapped else "COMP"
        print(f"Step {step}: {state} | {status} {indices}")

    print("\n--- BFS Visualization ---")
    graph = {
        'A': ['B', 'C'],
        'B': ['D', 'E'],
        'C': ['F'],
        'D': [],
        'E': ['F'],
        'F': []
    }
    print(f"Graph: {graph}")
    
    gen = bfs_steps(graph, 'A')
    step = 0
    for visited, queue, current in gen:
        step += 1
        print(f"Step {step}: Current={current}, Queue={queue}, Visited={visited}")

if __name__ == "__main__":
    main()
