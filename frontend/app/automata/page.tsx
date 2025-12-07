"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function AutomataPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.automata.create().then(res => setSessionId(res.session_id));
    }, []);

    useEffect(() => {
        if (!running || !sessionId) return;
        const interval = setInterval(async () => {
            const data = await api.automata.step(sessionId);
            draw(data);
        }, 100);
        return () => clearInterval(interval);
    }, [running, sessionId]);

    const draw = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { grid } = data;
        const width = canvas.width;
        const height = canvas.height;
        const nx = grid.length;
        const ny = grid[0].length;
        const cellW = width / nx;
        const cellH = height / ny;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#00FF00"; // Hacker green
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                if (grid[i][j] === 1) {
                    ctx.fillRect(i * cellW, j * cellH, cellW - 1, cellH - 1);
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-green-500">Game of Life</h1>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                >
                    {running ? "Pause" : "Start"}
                </button>
            </div>
            <canvas ref={canvasRef} width={500} height={500} className="border border-gray-700 rounded" />
        </div>
    );
}
