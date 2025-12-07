"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { UniverseSimulator, Body } from '@/lib/simulations/universe';
import * as THREE from 'three';

function Bodies({ bodies }: { bodies: Body[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!meshRef.current) return;
        bodies.forEach((body, i) => {
            dummy.position.set(body.x, body.y, body.z);
            dummy.scale.set(body.radius, body.radius, body.radius);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            meshRef.current!.setColorAt(i, new THREE.Color(body.color));
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, bodies.length]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial />
        </instancedMesh>
    );
}



export default function UniverseView() {
    const [sim] = useState(() => new UniverseSimulator(200));
    const [bodies, setBodies] = useState<Body[]>(sim.bodies);
    const [running, setRunning] = useState(true);

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => {
            sim.step();
            // Trigger re-render? 
            // React state update for 200 bodies at 60fps is bad.
            // We should mutate ref in a real app, but for this structure we need to force update.
            // Actually, let's just update a frame counter or rely on useFrame inside Canvas 
            // reading from the mutable sim object directly!
        }, 16);
        return () => clearInterval(interval);
    }, [running]);

    return (
        <div className="h-full w-full bg-black relative">
            <div className="absolute top-4 left-4 z-10 flex gap-4">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-bold"
                >
                    {running ? "Pause" : "Resume"}
                </button>
                <button
                    onClick={() => sim.init(200)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                    Reset
                </button>
                <button
                    onClick={() => sim.solarSystem()}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-white"
                >
                    Solar System
                </button>
            </div>

            <Canvas camera={{ position: [0, 40, 60], fov: 45 }}>
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[0, 0, 0]} intensity={2} color="#ffcc00" /> {/* Sun light */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <SceneContent sim={sim} />

                <OrbitControls />
            </Canvas>
        </div>
    );
}

function SceneContent({ sim }: { sim: UniverseSimulator }) {
    // This component lives inside Canvas and can hook into useFrame loop
    // to read directly from sim without React state overhead
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!meshRef.current) return;

        // We assume sim.step() is called externally or we call it here?
        // Calling it here couples simulation speed to framerate.
        // Let's call it here for smoothness.
        sim.step();

        sim.bodies.forEach((body, i) => {
            dummy.position.set(body.x, body.y, body.z);
            dummy.scale.set(body.radius, body.radius, body.radius);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            meshRef.current!.setColorAt(i, new THREE.Color(body.color));
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, sim.bodies.length]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial roughness={0.5} metalness={0.5} />
            </instancedMesh>
            <Trails bodies={sim.bodies} />
        </group>
    );
}

function Trails({ bodies }: { bodies: Body[] }) {
    // Render trails for the first 10 bodies (Sun + inner planets)
    return (
        <group>
            {bodies.slice(0, 10).map((body, i) => (
                <TrailLine key={i} body={body} color={body.color} />
            ))}
        </group>
    );
}

function TrailLine({ body, color }: { body: Body, color: string }) {
    const ref = useRef<any>(null);
    const [points] = useState(() => new Float32Array(300)); // 100 points * 3 coords
    const [cnt, setCnt] = useState(0);

    useFrame(() => {
        if (!ref.current) return;

        // Shift points
        for (let i = 299; i > 2; i--) {
            points[i] = points[i - 3];
        }
        points[0] = body.x;
        points[1] = body.y;
        points[2] = body.z;

        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <line ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={100}
                    array={points}
                    itemSize={3}
                    args={[points, 3]}
                />
            </bufferGeometry>
            <lineBasicMaterial color={color} opacity={0.5} transparent />
        </line>
    );
}
