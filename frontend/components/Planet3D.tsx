"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function Planet({ state }: { state: any }) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Calculate color based on state
    // Red (Mars) -> Blue (Water) -> Green (Biomass)
    const color = useMemo(() => {
        if (!state) return new THREE.Color("red");

        const water = state.water / 100;
        const biomass = state.biomass / 100;

        const r = Math.max(0.2, 1.0 - water * 0.8 - biomass * 0.8);
        const g = Math.min(0.8, biomass * 0.8 + water * 0.2);
        const b = Math.min(0.8, water * 0.8);

        return new THREE.Color(r, g, b);
    }, [state]);

    useFrame(() => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y += 0.002;
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial
                color={color}
                roughness={0.8}
                metalness={0.2}
            />
        </mesh>
    );
}

function Atmosphere() {
    return (
        <mesh scale={[2.2, 2.2, 2.2]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                color="#88ccff"
                transparent
                opacity={0.2}
                side={THREE.BackSide}
            />
        </mesh>
    )
}

export default function Planet3D({ state }: { state: any }) {
    return (
        <div className="h-[400px] w-full bg-black rounded-xl overflow-hidden border border-gray-700">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Stars />

                <Planet state={state} />
                <Atmosphere />

                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
}
