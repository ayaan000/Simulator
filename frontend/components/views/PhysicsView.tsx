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

        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        if (sim.mode === 'rigid') {
            // Draw Rigid Bodies
            // Bodies are in 0-100 coord space, Canvas is 400x400. Scale = 4
            const scale = 4;

            // Draw bounds
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, width, height);

            sim.bodies.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x * scale, b.y * scale, b.radius * scale, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
            return;
        }

        // Map 100x100 grid to 400x400 canvas (4x scaling)
        const scale = 4;

        for (let i = 0; i < sim.size; i++) {
            for (let j = 0; j < sim.size; j++) {
                const val = sim.u[i * sim.size + j];
                // Color map: Blue (-1) -> Black (0) -> Red (1)
                const r = Math.max(0, Math.min(255, val * 255));
                const b = Math.max(0, Math.min(255, -val * 255));
                // Heat uses red-yellow, Wave uses blue-red
                // Keeping original blue-red for consistency

                if (r === 0 && b === 0) continue; // Skip black for perf?

                // Fill block - Optimization: use fillRect for non-per-pixel access? 
                // Creating ImageData for 400x400 is fast enough.
                // We need to fill a 4x4 block for each grid cell [i,j]

                // Note: The loop order in previous code: i (y?), j (x?)
                // Access sim.u[i*size + j].
                // Usually i is row (y), j is col (x).
                // In canvas, x is col, y is row.
                // If i is row, then y = i * scale. x = j * scale.

                for (let dx = 0; dx < scale; dx++) {
                    for (let dy = 0; dy < scale; dy++) {
                        // x = j*scale + dx, y = i*scale + dy
                        // Index = (y * width + x) * 4
                        const x = j * scale + dx;
                        const y = i * scale + dy;
                        const idx = (y * width + x) * 4;

                        data[idx] = r;
                        data[idx + 1] = 0;
                        data[idx + 2] = b;
                        data[idx + 3] = 255;
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

        if (sim.mode === 'rigid') {
            // Click to spawn? MouseMove doesn't spawn usually.
            // Let's spawn on click instead.
            return;
        }

        const x = Math.floor((e.clientY - rect.top) / 4);
        const y = Math.floor((e.clientX - rect.left) / 4);

        sim.disturb(x, y, 5.0);
    };

    const handleClick = (e: React.MouseEvent) => {
        if (sim.mode !== 'rigid') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / 4;
        const y = (e.clientY - rect.top) / 4;
        sim.disturb(x, y, 0); // Disturb uses x,y to add body in rigid mode
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
                    <button
                        onClick={() => { sim.mode = 'rigid'; }}
                        className={`px-3 py-1 rounded ${sim.mode === 'rigid' ? 'bg-green-600' : 'hover:bg-gray-700'}`}
                    >
                        Rigid Body
                    </button>
                </div>
            </div>
            <p className="mb-4 text-gray-400">
                {sim.mode === 'wave' ? 'Move mouse to create ripples.' :
                    sim.mode === 'heat' ? 'Move mouse to add heat.' :
                        'Click to spawn bouncing balls.'}
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
                onClick={handleClick}
            />
        </div>
    );
}
