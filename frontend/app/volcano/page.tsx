"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function VolcanoPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.volcano.create().then(res => setSessionId(res.session_id));
    }, []);

    useEffect(() => {
        if (!running || !sessionId) return;
        const interval = setInterval(async () => {
            const data = await api.volcano.step(sessionId);
            draw(data);
        }, 100);
        return () => clearInterval(interval);
    }, [running, sessionId]);

    const draw = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { terrain, lava } = data;
        const width = canvas.width;
        const height = canvas.height;
        const nx = terrain.length;
        const ny = terrain[0].length;
        const cellW = width / nx;
        const cellH = height / ny;

        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const h = terrain[i][j];
                const l = lava[i][j];

                // Terrain: Green -> Brown
                let r = Math.floor(h * 100);
                let g = Math.floor(100 + h * 50);
                let b = Math.floor(h * 20);

                if (l > 0.01) {
                    // Lava overlay: Red/Orange
                    r = 255;
                    g = Math.floor(255 - l * 20); // Hotter = more yellow
                    b = 0;
                }

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cellW, height - (j + 1) * cellH, cellW, cellH);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-red-500">Volcano Simulation</h1>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                >
                    {running ? "Pause" : "Erupt"}
                </button>
            </div>
            <canvas ref={canvasRef} width={500} height={500} className="border border-gray-700 rounded" />
        </div>
    );
}
