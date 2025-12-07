from collections import deque

def bfs_steps(graph, start_node):
    """
    Generator for BFS traversal.
    graph: dict of adjacency lists {node: [neighbors]}
    Yields: (visited_set, queue, current_node)
    """
    visited = {start_node}
    queue = deque([start_node])
    
    yield (list(visited), list(queue), None)
    
    while queue:
        current = queue.popleft()
        yield (list(visited), list(queue), current)
        
        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                yield (list(visited), list(queue), current)
