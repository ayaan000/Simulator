"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";

export default function AlgorithmsPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [data, setData] = useState<number[]>([]);
    const [indices, setIndices] = useState<number[]>([]);
    const [swapped, setSwapped] = useState<number[]>([]);
    const [running, setRunning] = useState(false);
    const [algoType, setAlgoType] = useState("bubble_sort");
    const [done, setDone] = useState(false);

    const initData = () => {
        const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100));
        setData(arr);
        setIndices([]);
        setSwapped([]);
        setDone(false);
        return arr;
    };

    useEffect(() => {
        initData();
    }, []);

    const startSort = async () => {
        const arr = initData(); // Reset
        const res = await api.algorithms.create(algoType, arr);
        setSessionId(res.session_id);
        setRunning(true);
    };

    useEffect(() => {
        if (!running || !sessionId || done) return;
        const interval = setInterval(async () => {
            const res = await api.algorithms.step(sessionId);
            if (res.done) {
                setDone(true);
                setRunning(false);
            } else {
                setData(res.data);
                setIndices(res.indices);
                setSwapped(res.swapped);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [running, sessionId, done]);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-green-500">Sorting Algorithms</h1>

            <div className="flex gap-4 mb-8">
                <select
                    value={algoType}
                    onChange={(e) => setAlgoType(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-4 py-2"
                >
                    <option value="bubble_sort">Bubble Sort</option>
                    <option value="quick_sort">Quick Sort</option>
                    <option value="merge_sort">Merge Sort</option>
                </select>

                <button
                    onClick={startSort}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                    disabled={running}
                >
                    {running ? "Sorting..." : "Start Sorting"}
                </button>
            </div>

            <div className="flex items-end justify-center h-96 gap-1 bg-black p-4 rounded border border-gray-700">
                {data.map((val, idx) => {
                    let color = "bg-blue-500";
                    if (swapped.includes(idx)) color = "bg-red-500";
                    else if (indices.includes(idx)) color = "bg-yellow-500";

                    return (
                        <div
                            key={idx}
                            className={`w-4 transition-all duration-75 ${color}`}
                            style={{ height: `${val}%` }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
