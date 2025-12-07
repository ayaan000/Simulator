"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function PhysicsPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [running, setRunning] = useState(false);
    const [modelType, setModelType] = useState("diffusion");

    useEffect(() => {
        startSim();
    }, [modelType]);

    const startSim = () => {
        setRunning(false);
        api.physics.create(modelType).then(res => setSessionId(res.session_id));
    };

    useEffect(() => {
        if (!running || !sessionId) return;

        const interval = setInterval(async () => {
            const data = await api.physics.step(sessionId);
            draw(data);
        }, 50);

        return () => clearInterval(interval);
    }, [running, sessionId]);

    const draw = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { field, min, max } = data;
        const width = canvas.width;
        const height = canvas.height;
        const nx = field.length;
        const ny = field[0].length;
        const cellW = width / nx;
        const cellH = height / ny;
        const range = max - min || 1;

        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const val = (field[i][j] - min) / range;
                // Heatmap: Blue -> Red
                const r = Math.floor(val * 255);
                const b = Math.floor((1 - val) * 255);
                ctx.fillStyle = `rgb(${r}, 0, ${b})`;
                ctx.fillRect(i * cellW, height - (j + 1) * cellH, cellW, cellH);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-blue-500">Physics Engine</h1>
            <div className="flex gap-4 mb-4">
                <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded"
                >
                    <option value="diffusion">Diffusion (Heat)</option>
                    {/* Wave not yet fully wired in backend create, but prepared */}
                </select>
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                    {running ? "Pause" : "Start"}
                </button>
                <button
                    onClick={startSim}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                >
                    Reset
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="border border-gray-700 rounded"
            />
        </div>
    );
}
