"use client";
import React, { useState } from 'react';


type SimType = 'sorting' | 'graph' | 'maze' | 'flow' | 'fluid' | 'terraforming' | 'automata' | 'physics' | 'universe' | 'quantum_course';

interface LayoutProps {
    activeSim: SimType;
    setActiveSim: (sim: SimType) => void;
    children: React.ReactNode;
}

export default function SimulationLayout({ activeSim, setActiveSim, children }: LayoutProps) {
    const sims: { id: SimType, label: string, icon: string }[] = [
        { id: 'sorting', label: 'Sorting', icon: '📊' },
        { id: 'graph', label: 'Graph Search', icon: '🕸️' },
        { id: 'maze', label: 'Maze Gen', icon: '🌀' },
        { id: 'flow', label: 'Flow Sim', icon: '🌊' },
        { id: 'fluid', label: 'Fluid Dynamics', icon: '💧' },
        { id: 'terraforming', label: 'Terraforming', icon: '🌍' },
        { id: 'automata', label: 'Game of Life', icon: '👾' },
        { id: 'physics', label: 'Physics Engine', icon: '⚛️' },
        { id: 'universe', label: 'Universe', icon: '🌌' },
        { id: 'quantum_course', label: 'Quantum Course', icon: '🎓' },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        SimPlatform
                    </h1>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {sims.map((sim) => (
                        <button
                            key={sim.id}
                            onClick={() => setActiveSim(sim.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSim === sim.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{sim.icon}</span>
                            <span className="font-medium">{sim.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700 text-xs text-gray-500 text-center">
                    v2.0 • Client-Side • GitHub Pages
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-gray-800/50 border-b border-gray-700 flex items-center px-8 backdrop-blur">
                    <h2 className="text-xl font-semibold text-gray-200">
                        {sims.find(s => s.id === activeSim)?.label} Viewer
                    </h2>
                </header>
                <main className="flex-1 overflow-auto p-8 bg-black/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
