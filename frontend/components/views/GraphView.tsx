"use client";
import React, { useEffect, useState, useRef } from 'react';
import { GraphSimulator, GraphStep } from '@/lib/simulations/graph';

export default function GraphView() {
    const [sim] = useState(() => new GraphSimulator(30));
    const [stepData, setStepData] = useState<GraphStep | null>(null);
    const [running, setRunning] = useState(false);
    const [algo, setAlgo] = useState('bfs');
    const [numNodes, setNumNodes] = useState(20);
    const [showWeights, setShowWeights] = useState(false);
    const [dragNode, setDragNode] = useState<number | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    useEffect(() => {
        sim.init(numNodes);
        setStepData(null);
    }, [numNodes]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragNode !== null) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            sim.nodes[dragNode].x = x;
            sim.nodes[dragNode].y = y;
            // Force update
            setStepData(prev => prev ? { ...prev } : null);
        }
    };

    const handleMouseUp = () => {
        setDragNode(null);
    };

    const handleNodeClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (editMode) {
            if (selectedNode === null) {
                setSelectedNode(id);
            } else if (selectedNode === id) {
                setSelectedNode(null);
            } else {
                sim.toggleEdge(selectedNode, id);
                setSelectedNode(null);
                setStepData(null); // Clear path
            }
        } else {
            setDragNode(id);
        }
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

    const handleStart = () => {
        // sim.init(30); // Don't reset graph structure on start, just search
        sim.start(algo);
        setRunning(true);
    };

    const handleReset = () => {
        sim.init(numNodes);
        setStepData(null);
        setRunning(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 mb-6 items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
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
                <button
                    onClick={handleStart}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold"
                    disabled={running}
                >
                    {running ? 'Searching...' : 'Start Search'}
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                    New Graph
                </button>
            </div>

            <div className="flex gap-6 mb-4 items-center bg-gray-800 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Vertices: {numNodes}</label>
                    <input
                        type="range" min="5" max="50"
                        value={numNodes}
                        onChange={(e) => setNumNodes(parseInt(e.target.value))}
                        className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showWeights}
                        onChange={(e) => setShowWeights(e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-500"
                    />
                    <label className="text-sm text-gray-400">Show Weights</label>
                </div>
            </div>

            <div
                className="flex-1 bg-black rounded-xl border border-gray-700 relative overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg className="w-full h-full">
                    {/* Edges */}
                    {sim.nodes.map(node => (
                        node.neighbors.map(neighborId => {
                            const neighbor = sim.nodes[neighborId];
                            if (!neighbor) return null;
                            return (
                                <line
                                    key={`${node.id}-${neighbor.id}`}
                                    x1={`${node.x}%`} y1={`${node.y}%`}
                                    x2={`${neighbor.x}%`} y2={`${neighbor.y}%`}
                                    stroke="#374151" strokeWidth="2"
                                />
                            );
                        })
                    ))}

                    {/* Weights */}
                    {showWeights && sim.nodes.map(node => (
                        node.neighbors.map(neighborId => {
                            if (neighborId < node.id) return null; // Draw once
                            const neighbor = sim.nodes[neighborId];
                            const mx = (node.x + neighbor.x) / 2;
                            const my = (node.y + neighbor.y) / 2;
                            return (
                                <text key={`w-${node.id}-${neighbor.id}`} x={`${mx}%`} y={`${my}%`} fill="#6B7280" fontSize="10" textAnchor="middle">
                                    1
                                </text>
                            );
                        })
                    ))}

                    {/* Path Edges */}
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
                        let fill = "#4B5563"; // Gray
                        if (stepData?.visited.includes(node.id)) fill = "#3B82F6"; // Blue
                        if (stepData?.current === node.id) fill = "#F59E0B"; // Orange
                        if (stepData?.path.includes(node.id)) fill = "#10B981"; // Green
                        if (node.id === 0) fill = "#EF4444"; // Start Red
                        if (node.id === sim.nodes.length - 1) fill = "#8B5CF6"; // End Purple

                        return (
                            <circle
                                key={node.id}
                                cx={`${node.x}%`} cy={`${node.y}%`}
                                r="1.5%"
                                fill={fill}
                                stroke="white" strokeWidth="1"
                                className={`cursor-pointer ${editMode && selectedNode === node.id ? 'stroke-yellow-400 stroke-2' : 'stroke-white'}`}
                                onMouseDown={(e) => handleNodeClick(e, node.id)}
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}
