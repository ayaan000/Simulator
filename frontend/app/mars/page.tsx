"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function MarsPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.mars.create().then(res => setSessionId(res.session_id));
    }, []);

    useEffect(() => {
        if (!running || !sessionId) return;

        const interval = setInterval(async () => {
            const data = await api.mars.step(sessionId);
            draw(data);
        }, 100);

        return () => clearInterval(interval);
    }, [running, sessionId]);

    const draw = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { terrain, rovers, dust_intensity } = data;
        const width = canvas.width;
        const height = canvas.height;
        const nx = terrain.length;
        const ny = terrain[0].length;
        const cellW = width / nx;
        const cellH = height / ny;

        // Draw Terrain
        // Normalize terrain for color
        const flat = terrain.flat();
        const min = Math.min(...flat);
        const max = Math.max(...flat);
        const range = max - min || 1;

        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const val = (terrain[i][j] - min) / range;
                // Copper-like color map
                const r = Math.floor(val * 255);
                const g = Math.floor(val * 150);
                const b = Math.floor(val * 50);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cellW, height - (j + 1) * cellH, cellW, cellH);
            }
        }

        // Draw Rovers
        ctx.fillStyle = "white";
        for (const r of rovers) {
            // Map rover pos (0..100) to canvas
            const rx = (r.x / 100) * width;
            const ry = height - (r.y / 100) * height;
            ctx.beginPath();
            ctx.arc(rx, ry, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Dust Overlay
        if (dust_intensity > 0.1) {
            ctx.fillStyle = `rgba(200, 100, 50, ${dust_intensity * 0.5})`;
            ctx.fillRect(0, 0, width, height);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-orange-500">Mars Environment</h1>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700"
                >
                    {running ? "Pause" : "Start"}
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="border border-gray-700 rounded"
            />
        </div>
    );
}
