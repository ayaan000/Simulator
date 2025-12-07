"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function UniversePage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.universe.create(150).then(res => setSessionId(res.session_id));
    }, []);

    useEffect(() => {
        if (!running || !sessionId) return;

        const interval = setInterval(async () => {
            const data = await api.universe.step(sessionId);
            draw(data);
        }, 30);

        return () => clearInterval(interval);
    }, [running, sessionId]);

    const draw = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { positions } = data;
        const width = canvas.width;
        const height = canvas.height;

        // Clear with trail effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "white";
        const scale = 40; // Zoom factor
        const cx = width / 2;
        const cy = height / 2;

        for (const pos of positions) {
            const x = cx + pos[0] * scale;
            const y = cy - pos[1] * scale;

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-indigo-500">Universe Simulation</h1>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
                >
                    {running ? "Pause" : "Start"}
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-700 rounded"
            />
        </div>
    );
}
