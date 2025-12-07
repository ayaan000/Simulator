"use client";
import React, { useEffect, useState } from 'react';
import { TerraformingSimulator, PlanetState } from '@/lib/simulations/terraforming';
import Planet3D from '@/components/Planet3D'; // Reuse existing 3D component

export default function TerraformingView() {
    const [sim] = useState(() => new TerraformingSimulator());
    const [state, setState] = useState<PlanetState>(sim.state);
    const [actions, setActions] = useState({
        nuke_poles: false,
        solar_shade: false,
        plant_bacteria: false
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const newState = sim.step(actions);
            setState(newState);
        }, 500);
        return () => clearInterval(interval);
    }, [actions]);

    const toggle = (key: keyof typeof actions) => {
        setActions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col gap-4">
                <div className="flex-1 bg-black rounded-xl border border-gray-700 overflow-hidden relative">
                    <Planet3D state={state} />
                    <div className="absolute top-4 left-4 text-white/50 font-mono">
                        Year: {state.year}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <StatBox label="Temp" value={`${state.temp.toFixed(1)} K`} color={state.temp > 273 ? 'text-green-400' : 'text-blue-400'} />
                    <StatBox label="Pressure" value={`${state.pressure.toFixed(2)} kPa`} />
                    <StatBox label="Oxygen" value={`${state.oxygen.toFixed(1)} %`} />
                    <StatBox label="Water" value={`${state.water.toFixed(1)} %`} color="text-blue-400" />
                    <StatBox label="Biomass" value={`${state.biomass.toFixed(1)}`} color="text-green-400" />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-400">Planetary Engineering</h3>
                <ActionButton
                    active={actions.nuke_poles}
                    onClick={() => toggle('nuke_poles')}
                    icon="☢️" title="Nuke Polar Caps"
                    desc="Release CO2 and Water vapor to thicken atmosphere."
                    color="red"
                />
                <ActionButton
                    active={actions.solar_shade}
                    onClick={() => toggle('solar_shade')}
                    icon="🛰️" title="Solar Shades"
                    desc="Deploy orbital mirrors to block sunlight."
                    color="blue"
                />
                <ActionButton
                    active={actions.plant_bacteria}
                    onClick={() => toggle('plant_bacteria')}
                    icon="🦠" title="Seed Bacteria"
                    desc="Introduce extremophiles to convert CO2 to Oxygen."
                    color="green"
                />
            </div>
        </div>
    );
}

function StatBox({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
    return (
        <div className="bg-gray-800 p-3 rounded text-center">
            <div className="text-xs text-gray-500 uppercase">{label}</div>
            <div className={`text-lg font-bold ${color}`}>{value}</div>
        </div>
    );
}

function ActionButton({ active, onClick, icon, title, desc, color }: any) {
    const colors: any = {
        red: 'border-red-500 bg-red-900/20 text-red-100',
        blue: 'border-blue-500 bg-blue-900/20 text-blue-100',
        green: 'border-green-500 bg-green-900/20 text-green-100'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 rounded-xl border text-left transition-all ${active ? colors[color] : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                }`}
        >
            <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{icon}</span>
                <span className="font-bold text-lg">{title}</span>
            </div>
            <p className="text-sm opacity-70 ml-10">{desc}</p>
        </button>
    );
}
