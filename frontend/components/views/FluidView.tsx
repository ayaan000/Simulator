"use client";
import React, { useEffect, useRef, useState } from 'react';
import { FluidSimulator } from '@/lib/simulations/fluid';

export default function FluidView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sim] = useState(() => new FluidSimulator(64, 0.1, 0.0001, 0.0001));
    const [running, setRunning] = useState(false);
    const [mode, setMode] = useState<'dye' | 'obstacle'>('dye');
    const [viscosity, setViscosity] = useState(0.0001);
    const [color, setColor] = useState({ r: 1.0, g: 1.0, b: 1.0 });
    const [rainbow, setRainbow] = useState(false);
    const [brushSize, setBrushSize] = useState(5.0);

    useEffect(() => {
        if (rainbow) {
            const interval = setInterval(() => {
                const time = Date.now() * 0.002;
                setColor({
                    r: Math.sin(time) * 0.5 + 0.5,
                    g: Math.sin(time + 2) * 0.5 + 0.5,
                    b: Math.sin(time + 4) * 0.5 + 0.5
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [rainbow]);

    useEffect(() => {
        sim.visc = viscosity;
    }, [viscosity]);

    useEffect(() => {
        if (!running) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const interval = setInterval(() => {
            sim.step();
            draw(ctx);
        }, 30);
        return () => clearInterval(interval);
    }, [running]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (rect.width / sim.size));
        const y = Math.floor((e.clientY - rect.top) / (rect.height / sim.size));

        if (x >= 0 && x < sim.size && y >= 0 && y < sim.size) {
            sim.addDensity(x, y, brushSize, color);
            sim.addVelocity(x, y, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
            if (!running) draw(canvas.getContext('2d')!); // Draw immediately if paused
        }
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const cellW = width / sim.size;
        const cellH = height / sim.size;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < sim.size; i++) {
            for (let j = 0; j < sim.size; j++) {
                const idx = sim.IX(i, j);
                if (sim.obstacles[idx]) {
                    ctx.fillStyle = '#4B5563'; // Gray obstacle
                    ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
                    continue;
                }
                const d = sim.density[idx];
                if (d > 0.01) {
                    const r = Math.min(255, Math.floor(sim.r[idx] * 20));
                    const g = Math.min(255, Math.floor(sim.g[idx] * 20));
                    const b = Math.min(255, Math.floor(sim.b[idx] * 20));
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
                }
            }
        }
    };

    return (
        <div className="flex flex-col h-full items-center">
            <div className="flex gap-4 mb-4 items-center bg-gray-800 p-3 rounded-xl border border-gray-700">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold"
                >
                    {running ? "Pause" : "Start"}
                </button>

                <div className="flex gap-2 bg-gray-700 p-1 rounded">
                    <button
                        onClick={() => setMode('dye')}
                        className={`px-3 py-1 rounded ${mode === 'dye' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
                    >
                        💧 Dye
                    </button>
                    <button
                        onClick={() => setMode('obstacle')}
                        className={`px-3 py-1 rounded ${mode === 'obstacle' ? 'bg-gray-500 text-white' : 'text-gray-300'}`}
                    >
                        🧱 Wall
                    </button>
                </div>

                <div className="flex flex-col w-32">
                    <label className="text-xs text-gray-400">Viscosity</label>
                    <input
                        type="range" min="0" max="0.01" step="0.0001"
                        value={viscosity}
                        onChange={(e) => setViscosity(parseFloat(e.target.value))}
                        className="h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="flex flex-col w-32">
                    <label className="text-xs text-gray-400">Brush Size</label>
                    <input
                        type="range" min="1" max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                        className="h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <button
                    onClick={() => setRainbow(!rainbow)}
                    className={`px-3 py-1 rounded ${rainbow ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                    🌈 Rainbow
                </button>

                <div className="flex gap-2">
                    {[
                        { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, { r: 0, g: 0, b: 1 },
                        { r: 1, g: 1, b: 1 }, { r: 1, g: 0.5, b: 0 }
                    ].map((c, i) => (
                        <button
                            key={i}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 ${color.r === c.r && color.g === c.g ? 'border-white scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: `rgb(${c.r * 255},${c.g * 255},${c.b * 255})` }}
                        />
                    ))}
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={512}
                height={512}
                className="bg-black rounded-lg shadow-2xl cursor-crosshair touch-none"
                onMouseMove={handleMouseMove}
            />
        </div>
    );
}
