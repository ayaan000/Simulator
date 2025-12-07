"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function FluidPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [running, setRunning] = useState(false);
    const [color, setColor] = useState({ r: 1.0, g: 1.0, b: 1.0 });

    useEffect(() => {
        api.fluid.create().then(res => setSessionId(res.session_id));
    }, []);

    useEffect(() => {
        if (!running || !sessionId) return;
        const interval = setInterval(async () => {
            const data = await api.fluid.step(sessionId);
            draw(data);
        }, 50);
        return () => clearInterval(interval);
    }, [running, sessionId]);

    const handleMouseMove = async (e: React.MouseEvent) => {
        if (!sessionId || !canvasRef.current) return;

        // Add smoke on mouse move
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (rect.width / 64)); // 64 is nx
        const y = Math.floor((rect.height - (e.clientY - rect.top)) / (rect.height / 64)); // Invert Y

        if (x >= 0 && x < 64 && y >= 0 && y < 64) {
            await api.fluid.action(sessionId, x, y, 5.0, color.r, color.g, color.b);
        }
    };

    const draw = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { density, r, g, b } = data;
        const width = canvas.width;
        const height = canvas.height;
        const nx = density.length;
        const ny = density[0].length;
        const cellW = width / nx;
        const cellH = height / ny;

        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const d = density[i][j];
                if (d > 0.01) {
                    // Use advected color fields, normalized by density to avoid darkening?
                    // Actually, stable fluids usually advects color density directly.
                    // Let's just use the r,g,b fields directly, clamped.
                    const red = Math.min(255, Math.floor(r[i][j] * 20)); // Scale up for visibility
                    const green = Math.min(255, Math.floor(g[i][j] * 20));
                    const blue = Math.min(255, Math.floor(b[i][j] * 20));

                    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                    ctx.fillRect(i * cellW, height - (j + 1) * cellH, cellW + 1, cellH + 1);
                } else {
                    ctx.fillStyle = "black";
                    ctx.fillRect(i * cellW, height - (j + 1) * cellH, cellW + 1, cellH + 1);
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-400">Fluid Dynamics (Color Dye)</h1>
            <p className="mb-4 text-gray-500">Move your mouse to inject colored dye.</p>

            <div className="flex gap-4 mb-4 items-center">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                >
                    {running ? "Pause" : "Start"}
                </button>

                <div className="flex gap-2">
                    <button onClick={() => setColor({ r: 1, g: 0, b: 0 })} className="w-8 h-8 rounded-full bg-red-500 border-2 border-white" />
                    <button onClick={() => setColor({ r: 0, g: 1, b: 0 })} className="w-8 h-8 rounded-full bg-green-500 border-2 border-white" />
                    <button onClick={() => setColor({ r: 0, g: 0, b: 1 })} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white" />
                    <button onClick={() => setColor({ r: 1, g: 1, b: 1 })} className="w-8 h-8 rounded-full bg-white border-2 border-white" />
                    <button onClick={() => setColor({ r: 1, g: 0.5, b: 0 })} className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white" />
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={512}
                height={512}
                className="border border-gray-700 rounded cursor-crosshair"
                onMouseMove={handleMouseMove}
            />
        </div>
    );
}
