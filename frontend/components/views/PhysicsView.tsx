"use client";
import React, { useEffect, useRef, useState } from 'react';
import { PhysicsSimulator } from '@/lib/simulations/physics';

export default function PhysicsView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sim] = useState(() => new PhysicsSimulator(100));
    const [running, setRunning] = useState(true);
    const [damping, setDamping] = useState(0.99);

    useEffect(() => {
        sim.damping = damping;
    }, [damping]);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            sim.step();
            draw();
        }, 30);
        return () => clearInterval(interval);
    }, [running]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        // Map 100x100 grid to 400x400 canvas (4x scaling)
        const scale = 4;

        for (let i = 0; i < sim.size; i++) {
            for (let j = 0; j < sim.size; j++) {
                const val = sim.u[i * sim.size + j];
                // Color map: Blue (-1) -> Black (0) -> Red (1)
                const r = Math.max(0, Math.min(255, val * 255));
                const b = Math.max(0, Math.min(255, -val * 255));

                // Fill block
                for (let dx = 0; dx < scale; dx++) {
                    for (let dy = 0; dy < scale; dy++) {
                        const idx = ((i * scale + dx) * width + (j * scale + dy)) * 4;
                        data[idx] = r;     // R
                        data[idx + 1] = 0; // G
                        data[idx + 2] = b; // B
                        data[idx + 3] = 255; // Alpha
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientY - rect.top) / 4);
        const y = Math.floor((e.clientX - rect.left) / 4);

        sim.disturb(x, y, 5.0);
    };

    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex gap-4 mb-4 items-center">
                <h2 className="text-xl font-bold text-blue-400">Physics Engine</h2>
                <div className="flex bg-gray-800 rounded p-1">
                    <button
                        onClick={() => { sim.mode = 'wave'; sim.u.fill(0); sim.u_prev.fill(0); }}
                        className={`px-3 py-1 rounded ${sim.mode === 'wave' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                    >
                        Wave
                    </button>
                    <button
                        onClick={() => { sim.mode = 'heat'; sim.u.fill(0); }}
                        className={`px-3 py-1 rounded ${sim.mode === 'heat' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                    >
                        Heat
                    </button>
                </div>
            </div>
            <p className="mb-4 text-gray-400">
                {sim.mode === 'wave' ? 'Move mouse to create ripples.' : 'Move mouse to add heat.'}
            </p>

            <div className="flex items-center gap-2 mb-4">
                <label className="text-xs text-gray-400">Damping</label>
                <input
                    type="range" min="0.9" max="1.0" step="0.001"
                    value={damping}
                    onChange={(e) => setDamping(parseFloat(e.target.value))}
                    className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="bg-black rounded border border-gray-700 cursor-crosshair shadow-2xl"
                onMouseMove={handleMouseMove}
            />
        </div>
    );
}
