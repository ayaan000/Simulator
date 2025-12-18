"use client";
import React, { useEffect, useState, useRef } from 'react';
import { GraphSimulator, GraphStep } from '@/lib/simulations/graph';

export default function GraphView() {
    const [sim] = useState(() => new GraphSimulator(30));
    const [stepData, setStepData] = useState<GraphStep | null>(null);
    const [running, setRunning] = useState(false);
    const [algo, setAlgo] = useState('bfs');
    const [numNodes, setNumNodes] = useState(20);
    const [showWeights, setShowWeights] = useState(true);
    const [dragNode, setDragNode] = useState<number | null>(null);
    const [mode, setMode] = useState<'view' | 'add_node' | 'add_edge' | 'set_start' | 'set_target' | 'edit_weight'>('view');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const [startNode, setStartNode] = useState<number>(0);
    const [endNode, setEndNode] = useState<number | null>(null);

    useEffect(() => {
        sim.init(numNodes);
        setStartNode(0);
        setEndNode(numNodes - 1);
        setStepData(null);
    }, [numNodes]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragNode !== null && mode === 'view') {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            sim.nodes[dragNode].x = x;
            sim.nodes[dragNode].y = y;
            setStepData(prev => prev ? { ...prev } : null); // Force update
        }
    };

    const handleMouseUp = () => {
        setDragNode(null);
    };

    const handleNodeClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (mode === 'add_edge') {
            if (selectedNode === null) {
                setSelectedNode(id);
            } else if (selectedNode === id) {
                setSelectedNode(null);
            } else {
                sim.toggleEdge(selectedNode, id);
                setSelectedNode(null);
                setStepData(null);
            }
        } else if (mode === 'set_start') {
            setStartNode(id);
        } else if (mode === 'set_target') {
            setEndNode(id);
        } else if (mode === 'edit_weight') {
            if (selectedNode === null) {
                setSelectedNode(id);
            } else {
                // Find edge between selectedNode and id
                const edge = sim.nodes[selectedNode].neighbors.find(n => n.id === id);
                if (edge) {
                    const newWeight = prompt("Enter new weight:", edge.weight.toString());
                    if (newWeight !== null) {
                        const w = parseInt(newWeight) || 1;
                        sim.setEdgeWeight(selectedNode, id, w);
                        setStepData(null); // Clear path
                    }
                }
                setSelectedNode(null);
            }
        } else if (mode === 'view') {
            setDragNode(id);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (mode === 'add_node') {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            sim.addNode();
            const newNode = sim.nodes[sim.nodes.length - 1];
            newNode.x = x;
            newNode.y = y;
            setStepData(null);
        }
    };

    const handleStart = () => {
        if (endNode === null) return;
        sim.start(algo, startNode, endNode);
        setRunning(true);
    };

    const handleReset = () => {
        sim.init(numNodes);
        setStartNode(0);
        setEndNode(numNodes - 1);
        setStepData(null);
        setRunning(false);
    };

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            const step = sim.step();
            if (step) {
                setStepData(step);
                if (step.done) setRunning(false);
            } else {
                setRunning(false);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [running]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 mb-6 items-center bg-gray-800 p-4 rounded-xl border border-gray-700 flex-wrap">
                <select
                    value={algo}
                    onChange={(e) => setAlgo(e.target.value)}
                    className="bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
                >
                    <option value="bfs">Breadth-First Search (BFS)</option>
                    <option value="dfs">Depth-First Search (DFS)</option>
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="astar">A* Search</option>
                </select>

                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-600">
                    <button
                        onClick={() => setMode('view')}
                        className={`px-3 py-1 rounded ${mode === 'view' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        View
                    </button>
                    <button
                        onClick={() => setMode('add_node')}
                        className={`px-3 py-1 rounded ${mode === 'add_node' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Add Node
                    </button>
                    <button
                        onClick={() => setMode('add_edge')}
                        className={`px-3 py-1 rounded ${mode === 'add_edge' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Add Edge
                    </button>
                    <button
                        onClick={() => setMode('set_start')}
                        className={`px-3 py-1 rounded ${mode === 'set_start' ? 'bg-green-900 text-green-100' : 'text-gray-400 hover:text-white'}`}
                    >
                        Set Start
                    </button>
                    <button
                        onClick={() => setMode('set_target')}
                        className={`px-3 py-1 rounded ${mode === 'set_target' ? 'bg-purple-900 text-purple-100' : 'text-gray-400 hover:text-white'}`}
                    >
                        Set Target
                    </button>
                    <button
                        onClick={() => setMode('edit_weight')}
                        className={`px-3 py-1 rounded ${mode === 'edit_weight' ? 'bg-yellow-900 text-yellow-100' : 'text-gray-400 hover:text-white'}`}
                    >
                        Edit Weight
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Show Weights</label>
                    <input
                        type="checkbox"
                        checked={showWeights}
                        onChange={(e) => setShowWeights(e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-500"
                    />
                </div>

                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={handleStart}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-bold text-white shadow-lg"
                        disabled={running}
                    >
                        {running ? 'Running...' : 'Run Algorithm'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                    >
                        Reset Graph
                    </button>
                </div>
            </div>

            <div
                className={`flex-1 bg-black rounded-xl border border-gray-700 relative overflow-hidden ${mode === 'add_node' ? 'cursor-crosshair' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleCanvasClick}
            >
                <svg className="w-full h-full">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="20" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                        </marker>
                    </defs>

                    {/* Edges */}
                    {sim.nodes.map(node => (
                        node.neighbors.map(edge => {
                            const neighbor = sim.nodes[edge.id];
                            if (!neighbor) return null;
                            // Draw only if node.id < neighbor.id to avoid duplicates (undirected visual)
                            // But for editing weights, maybe duplicates matter if directed?
                            // GraphSimulator seems undirected (toggleEdge adds to both).
                            if (node.id > neighbor.id) return null;

                            return (
                                <g key={`${node.id}-${neighbor.id}`}>
                                    <line
                                        x1={`${node.x}%`} y1={`${node.y}%`}
                                        x2={`${neighbor.x}%`} y2={`${neighbor.y}%`}
                                        stroke={mode === 'edit_weight' && (selectedNode === node.id || selectedNode === neighbor.id) ? "#F59E0B" : "#374151"}
                                        strokeWidth={mode === 'edit_weight' ? "4" : "2"}
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            if (mode === 'edit_weight') {
                                                e.stopPropagation();
                                                const newWeight = prompt("Enter new weight:", edge.weight.toString());
                                                if (newWeight !== null) {
                                                    const w = parseInt(newWeight) || 1;
                                                    sim.setEdgeWeight(node.id, neighbor.id, w);
                                                    setStepData(null);
                                                }
                                            }
                                        }}
                                    />
                                    {showWeights && (
                                        <text
                                            x={`${(node.x + neighbor.x) / 2}%`}
                                            y={`${(node.y + neighbor.y) / 2}%`}
                                            fill="#9CA3AF"
                                            fontSize="12"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            dy="-5"
                                            className="select-none pointer-events-none"
                                        >
                                            {edge.weight}
                                        </text>
                                    )}
                                </g>
                            );
                        })
                    ))}

                    {/* Path */}
                    {stepData?.path.map((nodeId, i) => {
                        if (i === 0) return null;
                        const prev = sim.nodes[stepData.path[i - 1]];
                        const curr = sim.nodes[nodeId];
                        return (
                            <line
                                key={`path-${i}`}
                                x1={`${prev.x}%`} y1={`${prev.y}%`}
                                x2={`${curr.x}%`} y2={`${curr.y}%`}
                                stroke="#10B981" strokeWidth="4"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {sim.nodes.map(node => {
                        let fill = "#4B5563"; // Gray base
                        if (stepData?.visited.includes(node.id)) fill = "#3B82F6"; // Visited Blue
                        if (stepData?.current === node.id) fill = "#F59E0B"; // Current Orange
                        if (stepData?.path.includes(node.id)) fill = "#10B981"; // Path Green

                        // Overrides
                        if (node.id === startNode) fill = "#DC2626"; // Start Red
                        if (node.id === endNode) fill = "#8B5CF6"; // End Purple

                        const isSelected = selectedNode === node.id;

                        return (
                            <g key={node.id}>
                                <circle
                                    cx={`${node.x}%`} cy={`${node.y}%`}
                                    r="2%"
                                    fill={fill}
                                    stroke={isSelected ? "white" : "none"}
                                    strokeWidth={isSelected ? "3" : "0"}
                                    className={`cursor-pointer transition-colors duration-200 hover:opacity-80`}
                                    onMouseDown={(e) => handleNodeClick(e, node.id)}
                                />
                                <text
                                    x={`${node.x}%`}
                                    y={`${node.y}%`}
                                    dy="0.3em"
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="12"
                                    className="select-none pointer-events-none font-bold"
                                >
                                    {node.id}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {mode === 'edit_weight' && (
                    <div className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded text-sm pointer-events-none">
                        Click an edge to edit weight (or select two nodes)
                    </div>
                )}
            </div>
        </div>
    );
}
