"use client";
import React, { useEffect, useRef, useState } from 'react';
import { MazeSimulator } from '@/lib/simulations/maze';

export default function MazeView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sim] = useState(() => new MazeSimulator(30, 40));
    const [running, setRunning] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
    const [endPos, setEndPos] = useState<{ x: number, y: number } | null>(null);
    const [mode, setMode] = useState<'generate' | 'pick_start' | 'pick_end'>('generate');

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            sim.step();
            draw();
            if (sim.stack.length === 0 && sim.current === sim.grid[0]) {
                setRunning(false); // Done
            }
        }, 20); // Fast speed
        return () => clearInterval(interval);
    }, [running]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = 20;
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < sim.grid.length; i++) {
            const cell = sim.grid[i];
            const x = cell.x * w;
            const y = cell.y * w;

            if (cell.visited) {
                ctx.fillStyle = '#1F2937'; // Visited
                ctx.fillRect(x, y, w, w);
            }

            if (sim.current === cell) {
                ctx.fillStyle = '#8B5CF6'; // Current head (Purple)
                ctx.fillRect(x, y, w, w);
            }

            if (startPos && startPos.x === cell.x && startPos.y === cell.y) {
                ctx.fillStyle = '#10B981'; // Start Green
                ctx.fillRect(x + 4, y + 4, w - 8, w - 8);
            }
            if (endPos && endPos.x === cell.x && endPos.y === cell.y) {
                ctx.fillStyle = '#EF4444'; // End Red
                ctx.fillRect(x + 4, y + 4, w - 8, w - 8);
            }

            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (cell.walls[0]) { ctx.moveTo(x, y); ctx.lineTo(x + w, y); }
            if (cell.walls[1]) { ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + w); }
            if (cell.walls[2]) { ctx.moveTo(x + w, y + w); ctx.lineTo(x, y + w); }
            if (cell.walls[3]) { ctx.moveTo(x, y + w); ctx.lineTo(x, y); }
            ctx.stroke();
        }
    };

    const handleStart = () => {
        // Use current startPos or default (0,0)
        const sx = startPos ? startPos.x : 0;
        const sy = startPos ? startPos.y : 0;

        // Ensure start/end are set visually if not already
        if (!startPos) setStartPos({ x: 0, y: 0 });
        if (!endPos) setEndPos({ x: sim.cols - 1, y: sim.rows - 1 });

        sim.init(sx, sy);
        setRunning(true);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX / 20);
        const y = Math.floor((e.clientY - rect.top) * scaleY / 20);

        if (x >= 0 && x < sim.cols && y >= 0 && y < sim.rows) {
            if (mode === 'pick_start') setStartPos({ x, y });
            else if (mode === 'pick_end') setEndPos({ x, y });
        }
        draw();
    };

    // Redraw on state change
    useEffect(() => { draw(); }, [startPos, endPos, mode]);

    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex gap-4 mb-4 items-center">
                <button
                    onClick={handleStart}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold text-white"
                >
                    Generate Maze
                </button>
                <div className="flex bg-gray-800 rounded p-1">
                    <button
                        onClick={() => setMode('pick_start')}
                        className={`px-3 py-1 rounded ${mode === 'pick_start' ? 'bg-green-600' : 'hover:bg-gray-700'}`}
                    >
                        Set Start
                    </button>
                    <button
                        onClick={() => setMode('pick_end')}
                        className={`px-3 py-1 rounded ${mode === 'pick_end' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                    >
                        Set End
                    </button>
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="bg-gray-900 rounded border border-gray-700 shadow-xl cursor-crosshair"
                onClick={handleCanvasClick}
            />
        </div>
    );
}
