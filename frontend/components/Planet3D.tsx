"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function Planet({ state }: { state: any }) {
    const groupRef = useRef<THREE.Group>(null);

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
        if (!groupRef.current) return;
        groupRef.current.rotation.y += 0.002;
    });

    return (
        <group ref={groupRef}>
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>
            <Craters />
            {state.biomass > 10 && <Life amount={state.biomass} />}
        </group>
    );
}

function Craters() {
    const craters = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 15; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = 2; // Radius of planet

            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);

            // Calculate rotation to face outward (approximately)
            // LookAt logic is easier in Scene graph, but here we just need position.
            // We'll use lookAt in the mesh rendering.
            arr.push(new THREE.Vector3(x, y, z));
        }
        return arr;
    }, []);

    return (
        <group>
            {craters.map((pos, i) => (
                <mesh key={i} position={pos} lookAt={() => new THREE.Vector3(0, 0, 0)}>
                    {/* Render crater as a small dark ring/circle on surface */}
                    {/* CircleGeometry aligned to face normal? 
                        By default Circle faces +Z. We want it to face the normal (pos).
                        lookAt(0,0,0) makes it face center. We want opposite.
                    */}
                    <circleGeometry args={[0.15, 16]} />
                    <meshStandardMaterial color="#333333" side={THREE.DoubleSide} transparent opacity={0.6} depthWrite={false} />
                </mesh>
            ))}
        </group>
    )
}

function Life({ amount }: { amount: number }) {
    // Green particles representing biomass
    const particles = useMemo(() => {
        const arr = [];
        const count = Math.min(100, Math.floor(amount * 3));
        for (let i = 0; i < count; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = 2.05; // Hover slightly above

            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);

            arr.push(new THREE.Vector3(x, y, z));
        }
        return arr;
    }, [amount]);

    return (
        <group>
            {particles.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <sphereGeometry args={[0.03, 4, 4]} />
                    <meshBasicMaterial color="#4ade80" transparent opacity={0.8} />
                </mesh>
            ))}
        </group>
    );
}

function Atmosphere() {
    return (
        <mesh scale={[1.2, 1.2, 1.2]}> {/* Increased scale to be visible */}
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial
                color="#88ccff"
                transparent
                opacity={0.15}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
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
                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

                <Planet state={state} />
                <Atmosphere />

                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
}
