"use client";
import React, { useEffect, useState, useRef } from 'react';
import { SortingSimulator, SortStep } from '@/lib/simulations/algorithms';

export default function AlgorithmsView() {
    const [sim] = useState(() => new SortingSimulator(50));
    const [data, setData] = useState<number[]>([]);
    const [indices, setIndices] = useState<number[]>([]);
    const [swapped, setSwapped] = useState<number[]>([]);
    const [running, setRunning] = useState(false);
    const [algo, setAlgo] = useState('bubble');
    const [speed, setSpeed] = useState(50);
    const [size, setSize] = useState(50);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(false);

    useEffect(() => {
        if (audioEnabled && !audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } else if (!audioEnabled && audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    }, [audioEnabled]);

    const playTone = (freq: number) => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtxRef.current.currentTime + 0.1);
        osc.stop(audioCtxRef.current.currentTime + 0.1);
    };

    useEffect(() => {
        sim.init(size);
        setData(sim.reset());
    }, [size]);

    useEffect(() => {
        setData(sim.reset());
    }, []);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            const step = sim.step();
            if (step) {
                setData(step.data);
                setIndices(step.indices);
                setSwapped(step.swapped);
                if (step.done) setRunning(false);
            } else {
                setRunning(false);
            }
        }, 105 - speed);
        return () => clearInterval(interval);
    }, [running, speed]);

    const handleStart = () => {
        sim.reset();
        sim.start(algo);
        setRunning(true);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-4 mb-6 items-center bg-gray-800 p-4 rounded-xl border border-gray-700">
                <select
                    value={algo}
                    onChange={(e) => setAlgo(e.target.value)}
                    className="bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                    <option value="bubble">Bubble Sort</option>
                    <option value="quick">Quick Sort</option>
                    <option value="merge">Merge Sort</option>
                    <option value="heap">Heap Sort</option>
                </select>
                <button
                    onClick={handleStart}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors"
                    disabled={running}
                >
                    {running ? 'Sorting...' : 'Start Visualization'}
                </button>
            </div>

            <div className="flex gap-6 mb-4 items-center bg-gray-800 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Size: {size}</label>
                    <input
                        type="range" min="10" max="100"
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value))}
                        className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        disabled={running}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Speed</label>
                    <input
                        type="range" min="1" max="100"
                        value={speed}
                        onChange={(e) => setSpeed(parseInt(e.target.value))}
                        className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex-1 bg-black rounded-xl border border-gray-700 p-8 flex items-end justify-center gap-1 relative overflow-hidden">
                {data.map((val, idx) => {
                    let color = "bg-blue-500";
                    if (swapped.includes(idx)) color = "bg-red-500";
                    else if (indices.includes(idx)) color = "bg-yellow-400";

                    return (
                        <div
                            key={idx}
                            className={`flex-1 transition-all duration-75 ${color} rounded-t-sm flex items-end justify-center group relative`}
                            style={{ height: `${val}%` }}
                        >
                            <span className="text-[10px] text-white opacity-100 mb-1 font-mono absolute bottom-0">
                                {val}
                            </span>
                        </div>
                    );
                })}

                {/* Overlay numbers if requested, but hover is cleaner. 
                    User asked for "arbitrary numbres for clarity". 
                    Let's add a toggle or just show them on hover/always if few enough.
                    With 50 bars, always showing is messy. Let's stick to hover or maybe show value on top of active ones.
                */}
                <div className="absolute top-4 right-4 text-gray-400 font-mono text-sm">
                    Array Size: {data.length}
                </div>
            </div>
        </div>
    );
}
