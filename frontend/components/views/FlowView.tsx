"use client";
import React, { useEffect, useState, useRef } from 'react';
import { FlowSimulator, FlowNode, FlowEdge } from '@/lib/simulations/flow';

export default function FlowView() {
    const [sim] = useState(() => new FlowSimulator());
    const [running, setRunning] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [highlightEdges, setHighlightEdges] = useState<string[]>([]);
    const [residualEdges, setResidualEdges] = useState<{ source: number, target: number, cap: number, isBack: boolean }[]>([]);
    const [dragNode, setDragNode] = useState<number | null>(null);
    const [mode, setMode] = useState<'view' | 'add_node' | 'add_edge' | 'edit_cap'>('view');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            const res = sim.step() as any;
            if (res && !res.done) {
                setHighlightEdges(res.value.pathEdges || []);
                setResidualEdges(res.value.residualEdges || []);
                setLog([...sim.log]);
            } else {
                setRunning(false);
                setHighlightEdges([]);
                setResidualEdges([]);
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
            <div className="flex gap-4 mb-4 items-center bg-gray-800 p-4 rounded-xl border border-gray-700 overflow-x-auto">
                <h2 className="text-xl font-bold text-blue-400 whitespace-nowrap">Max Flow</h2>

                <div className="flex bg-gray-700 rounded p-1 gap-1">
                    <button
                        onClick={() => setMode('view')}
                        className={`px-3 py-1 rounded text-sm ${mode === 'view' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    >
                        View
                    </button>
                    <button
                        onClick={() => setMode('add_node')}
                        className={`px-3 py-1 rounded text-sm ${mode === 'add_node' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    >
                        + Node
                    </button>
                    <button
                        onClick={() => setMode('add_edge')}
                        className={`px-3 py-1 rounded text-sm ${mode === 'add_edge' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    >
                        + Edge
                    </button>
                    <button
                        onClick={() => setMode('edit_cap')}
                        className={`px-3 py-1 rounded text-sm ${mode === 'edit_cap' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    >
                        Edit Cap
                    </button>
                </div>

                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={() => { sim.edges.forEach(e => e.flow = 0); setLog([]); setResidualEdges([]); setHighlightEdges([]); setRunning(false); }}
                        className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded font-bold text-white text-sm whitespace-nowrap"
                    >
                        Reset Flow
                    </button>
                    <button
                        onClick={handleStart}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold text-white text-sm whitespace-nowrap"
                        disabled={running}
                    >
                        {running ? 'Calculating...' : 'Run'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                <div
                    className={`flex-1 bg-black rounded-xl border border-gray-700 relative overflow-hidden ${mode === 'add_node' ? 'cursor-crosshair' : 'cursor-default'}`}
                    onMouseMove={handleMouseMove}
                    onClick={handleCanvasClick}
                    onMouseUp={() => setDragNode(null)}
                    onMouseLeave={() => setDragNode(null)}
                >
                    <svg className="w-full h-full">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
                            </marker>
                            <marker id="arrowhead-res" markerWidth="8" markerHeight="6" refX="24" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
                            </marker>
                        </defs>
                        {/* Residual Edges */}
                        {residualEdges.map((edge, i) => {
                            const s = sim.nodes[edge.source];
                            const t = sim.nodes[edge.target];
                            return (
                                <g key={`res-${i}`} opacity="0.6">
                                    <line
                                        x1={s.x} y1={s.y}
                                        x2={t.x} y2={t.y}
                                        stroke="#F59E0B"
                                        strokeWidth="1"
                                        strokeDasharray="4 2"
                                        markerEnd="url(#arrowhead-res)"
                                    />
                                    {edge.cap > 0 && <text
                                        x={(s.x * 2 + t.x) / 3}
                                        y={(s.y * 2 + t.y) / 3}
                                        fill="#F59E0B"
                                        fontSize="10"
                                        textAnchor="middle"
                                        className="font-mono bg-black select-none"
                                    >
                                        {edge.cap}
                                    </text>}
                                </g>
                            );
                        })}
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
