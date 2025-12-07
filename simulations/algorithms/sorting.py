import copy

def bubble_sort_steps(data):
    """
    Yields (current_data, [compared_indices], [swapped_indices])
    """
    arr = copy.deepcopy(data)
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            yield arr, [j, j+1], []
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
                yield arr, [j, j+1], [j, j+1]
        if not swapped:
            break
    yield arr, [], []

def quick_sort_steps(data):
    arr = copy.deepcopy(data)
    yield from _quick_sort_recursive(arr, 0, len(arr) - 1)
    yield arr, [], []

def _quick_sort_recursive(arr, low, high):
    if low < high:
        # Partition
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            yield arr, [j, high], [] # Compare with pivot
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                yield arr, [i, j], [i, j] # Swap
        arr[i+1], arr[high] = arr[high], arr[i+1]
        yield arr, [i+1, high], [i+1, high] # Swap pivot
        
        pi = i + 1
        
        yield from _quick_sort_recursive(arr, low, pi - 1)
        yield from _quick_sort_recursive(arr, pi + 1, high)

def merge_sort_steps(data):
    arr = copy.deepcopy(data)
    yield from _merge_sort_recursive(arr, 0, len(arr) - 1)
    yield arr, [], []

def _merge_sort_recursive(arr, l, r):
    if l < r:
        m = (l + r) // 2
        yield from _merge_sort_recursive(arr, l, m)
        yield from _merge_sort_recursive(arr, m + 1, r)
        yield from _merge(arr, l, m, r)

def _merge(arr, l, m, r):
    n1 = m - l + 1
    n2 = r - m
    
    L = arr[l:m+1]
    R = arr[m+1:r+1]
    
    i = 0
    j = 0
    k = l
    
    while i < n1 and j < n2:
        yield arr, [l+i, m+1+j], [] # Compare
        if L[i] <= R[j]:
            arr[k] = L[i]
            i += 1
        else:
            arr[k] = R[j]
            j += 1
        yield arr, [k], [k] # Update
        k += 1
        
    while i < n1:
        arr[k] = L[i]
        i += 1
        yield arr, [k], [k]
        k += 1
        
    while j < n2:
        arr[k] = R[j]
        j += 1
        yield arr, [k], [k]
        k += 1
