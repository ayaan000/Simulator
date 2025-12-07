"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function VenusPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.venus.create().then(res => setSessionId(res.session_id));
    }, []);

    useEffect(() => {
        if (!running || !sessionId) return;
        const interval = setInterval(async () => {
            const data = await api.venus.step(sessionId);
            draw(data);
        }, 100);
        return () => clearInterval(interval);
    }, [running, sessionId]);

    const draw = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { clouds } = data;
        const width = canvas.width;
        const height = canvas.height;
        const nx = clouds.length;
        const ny = clouds[0].length;
        const cellW = width / nx;
        const cellH = height / ny;

        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const val = clouds[i][j]; // 0..1
                // Yellow/Orange clouds
                const r = 255;
                const g = Math.floor(200 + val * 55);
                const b = Math.floor(val * 100);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cellW, height - (j + 1) * cellH, cellW, cellH);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-yellow-500">Venus Atmosphere</h1>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
                >
                    {running ? "Pause" : "Start"}
                </button>
            </div>
            <canvas ref={canvasRef} width={600} height={300} className="border border-gray-700 rounded" />
        </div>
    );
}
