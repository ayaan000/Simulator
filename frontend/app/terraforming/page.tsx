"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Planet3D from "@/components/Planet3D";

export default function TerraformingPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [state, setState] = useState<any>(null);
    const [actions, setActions] = useState({
        nuke_poles: false,
        solar_shade: false,
        plant_bacteria: false
    });

    useEffect(() => {
        api.terraforming.create("Mars").then(res => setSessionId(res.session_id));
    }, []);

    useEffect(() => {
        if (!sessionId) return;
        const interval = setInterval(async () => {
            const data = await api.terraforming.step(sessionId, actions);
            setState(data);
        }, 500); // Slower step
        return () => clearInterval(interval);
    }, [sessionId, actions]);

    const toggleAction = (key: string) => {
        setActions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    if (!state) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-4 text-purple-500">Terraforming Simulator</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <Planet3D state={state} />

                    <div className="mt-4 grid grid-cols-2 gap-4 text-lg">
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-gray-400">Year</p>
                            <p className="text-2xl font-bold">{state.year}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-gray-400">Temperature</p>
                            <p className={`text-2xl font-bold ${state.temp > 273 ? 'text-green-400' : 'text-blue-400'}`}>
                                {state.temp.toFixed(1)} K
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-gray-400">Pressure</p>
                            <p className="text-2xl font-bold">{state.pressure.toFixed(2)} kPa</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-gray-400">Biomass</p>
                            <p className="text-2xl font-bold text-green-500">{state.biomass.toFixed(1)}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-gray-400">Water</p>
                            <p className="text-2xl font-bold text-blue-500">{state.water.toFixed(1)} %</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <p className="text-gray-400">Oxygen</p>
                            <p className="text-2xl font-bold text-gray-200">{state.oxygen.toFixed(1)} %</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Planetary Engineering</h2>

                    <div className="space-y-4">
                        <button
                            onClick={() => toggleAction("nuke_poles")}
                            className={`w-full p-6 rounded-xl border transition-all ${actions.nuke_poles
                                    ? 'bg-red-900/50 border-red-500 text-red-200 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                                }`}
                        >
                            <h3 className="text-xl font-bold mb-2">☢️ Nuke Polar Caps</h3>
                            <p className="text-sm opacity-80">Release CO2 and Water vapor to thicken atmosphere and warm the planet.</p>
                        </button>

                        <button
                            onClick={() => toggleAction("solar_shade")}
                            className={`w-full p-6 rounded-xl border transition-all ${actions.solar_shade
                                    ? 'bg-blue-900/50 border-blue-500 text-blue-200 shadow-[0_0_20px_rgba(37,99,235,0.5)]'
                                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                                }`}
                        >
                            <h3 className="text-xl font-bold mb-2">🛰️ Solar Shades</h3>
                            <p className="text-sm opacity-80">Deploy orbital mirrors to block sunlight and cool the planet.</p>
                        </button>

                        <button
                            onClick={() => toggleAction("plant_bacteria")}
                            className={`w-full p-6 rounded-xl border transition-all ${actions.plant_bacteria
                                    ? 'bg-green-900/50 border-green-500 text-green-200 shadow-[0_0_20px_rgba(22,163,74,0.5)]'
                                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                                }`}
                        >
                            <h3 className="text-xl font-bold mb-2">🦠 Seed Bacteria</h3>
                            <p className="text-sm opacity-80">Introduce extremophiles to convert CO2 to Oxygen and build biomass.</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
