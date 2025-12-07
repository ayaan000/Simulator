"use client";
import React, { useEffect, useState, useRef } from 'react';
import { FlowSimulator, FlowNode, FlowEdge } from '@/lib/simulations/flow';

export default function FlowView() {
    const [sim] = useState(() => new FlowSimulator());
    const [running, setRunning] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [highlightEdges, setHighlightEdges] = useState<string[]>([]);
    const [dragNode, setDragNode] = useState<number | null>(null);
    const [mode, setMode] = useState<'view' | 'add_node' | 'add_edge' | 'edit_cap'>('view');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            const res = sim.step() as any;
            if (res && !res.done) {
                setHighlightEdges(res.value.pathEdges || []);
                setLog([...sim.log]);
            } else {
                setRunning(false);
                setHighlightEdges([]);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [running]);

    const handleStart = () => {
        sim.generator = sim.maxFlow();
        setRunning(true);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (mode === 'add_node') {
            const rect = e.currentTarget.getBoundingClientRect();
            sim.addNode(e.clientX - rect.left, e.clientY - rect.top);
            setLog([...sim.log]); // Force update
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragNode !== null) {
            const rect = e.currentTarget.getBoundingClientRect();
            sim.nodes[dragNode].x = e.clientX - rect.left;
            sim.nodes[dragNode].y = e.clientY - rect.top;
            // Force update
            setLog([...sim.log]);
        }
    };

    const handleNodeClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (mode === 'add_edge') {
            if (selectedNode === null) {
                setSelectedNode(id);
            } else if (selectedNode !== id) {
                sim.addEdge(selectedNode, id, 10); // Default capacity 10
                setSelectedNode(null);
                setLog([...sim.log]);
            }
        } else if (mode === 'view') {
            setDragNode(id);
        }
    };

    const handleEdgeClick = (e: React.MouseEvent, edge: FlowEdge) => {
        e.stopPropagation();
        if (mode === 'edit_cap') {
            edge.capacity = (edge.capacity % 20) + 1; // Cycle 1-20
            setLog([...sim.log]);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 mb-4 items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h2 className="text-xl font-bold text-blue-400">Network Flow (Max Flow)</h2>
                <button
                    onClick={handleStart}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold text-white"
                    disabled={running}
                >
                    {running ? 'Calculating...' : 'Run Max Flow'}
                </button>
                <div className="text-sm text-gray-400">
                    Source: S (0), Sink: T ({sim.nodes.length - 1})
                </div>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                <div
                    className="flex-1 bg-black rounded-xl border border-gray-700 relative overflow-hidden"
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setDragNode(null)}
                    onMouseLeave={() => setDragNode(null)}
                >
                    <svg className="w-full h-full">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
                            </marker>
                        </defs>
                        {/* Edges */}
                        {sim.edges.map(edge => {
                            const s = sim.nodes[edge.source];
                            const t = sim.nodes[edge.target];
                            const isPath = highlightEdges.includes(edge.id);
                            return (
                                <g
                                    key={edge.id}
                                    onClick={(e) => handleEdgeClick(e, edge)}
                                    className={mode === 'edit_cap' ? 'cursor-pointer hover:opacity-80' : ''}
                                >
                                    <line
                                        x1={s.x} y1={s.y}
                                        x2={t.x} y2={t.y}
                                        stroke={isPath ? "#10B981" : "#4B5563"}
                                        strokeWidth={isPath ? 4 : 2}
                                        markerEnd="url(#arrowhead)"
                                    />
                                    {/* Capacity Label */}
                                    <text
                                        x={(s.x + t.x) / 2}
                                        y={(s.y + t.y) / 2 - 5}
                                        fill={isPath ? "#10B981" : "#9CA3AF"}
                                        fontSize="12"
                                        textAnchor="middle"
                                        className="font-mono bg-black select-none"
                                    >
                                        {edge.flow}/{edge.capacity}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Nodes */}
                        {sim.nodes.map(node => (
                            <g
                                key={node.id}
                                transform={`translate(${node.x},${node.y})`}
                                className={`cursor-pointer ${mode === 'add_edge' && selectedNode === node.id ? 'stroke-yellow-400' : 'stroke-blue-500'}`}
                                onMouseDown={(e) => handleNodeClick(e, node.id)}
                            >
                                <circle r="20" fill="#1F2937" stroke="#3B82F6" strokeWidth="2" />
                                <text dy="5" textAnchor="middle" fill="white" fontWeight="bold">
                                    {node.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                <div className="w-64 bg-gray-900 rounded-xl border border-gray-700 p-4 overflow-y-auto font-mono text-xs text-gray-300">
                    <h3 className="font-bold text-white mb-2">Log</h3>
                    {log.map((l, i) => (
                        <div key={i} className="mb-1 border-b border-gray-800 pb-1">{l}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
