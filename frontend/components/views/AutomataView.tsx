"use client";
import React, { useEffect, useRef, useState } from 'react';
import { AutomataSimulator } from '@/lib/simulations/automata';

export default function AutomataView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sim] = useState(() => new AutomataSimulator(60, 100));
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            sim.step();
            draw();
        }, 100);
        return () => clearInterval(interval);
    }, [running]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const cellW = width / sim.cols;
        const cellH = height / sim.rows;

        ctx.fillStyle = '#111827'; // bg-gray-900
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#10B981'; // text-green-500
        for (let i = 0; i < sim.rows; i++) {
            for (let j = 0; j < sim.cols; j++) {
                if (sim.grid[i][j] === 1) {
                    ctx.fillRect(j * cellW, i * cellH, cellW - 1, cellH - 1);
                }
            }
        }
    };

    // Initial draw
    useEffect(() => {
        draw();
    }, []);

    const handleCanvasClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientY - rect.top) / (rect.height / sim.rows));
        const y = Math.floor((e.clientX - rect.left) / (rect.width / sim.cols));

        if (x >= 0 && x < sim.rows && y >= 0 && y < sim.cols) {
            sim.grid[x][y] = sim.grid[x][y] ? 0 : 1;
            draw();
        }
    };

    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
                >
                    {running ? "Pause" : "Start"}
                </button>
                <button
                    onClick={() => { sim.randomize(); draw(); }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                    Randomize
                </button>
                <button
                    onClick={() => { sim.gliderGun(); draw(); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
                >
                    Glider Gun
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={1000}
                height={600}
                className="bg-gray-900 rounded border border-gray-700 cursor-pointer shadow-lg"
                onClick={handleCanvasClick}
            />
        </div>
    );
}
