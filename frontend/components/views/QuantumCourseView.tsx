"use client";
import React, { useState, useEffect, useRef } from 'react';

const CHAPTERS = [
    {
        id: 1,
        title: "Stern-Gerlach Experiments",
        content: (
            <>
                <h3>1.1 The Stern-Gerlach Experiment</h3>
                <p>
                    In 1922, Otto Stern and Walther Gerlach performed a seminal experiment. They sent a beam of silver atoms through an inhomogeneous magnetic field.
                    Classically, one would expect the beam to spread out continuously due to the random orientation of the atoms' magnetic moments.
                </p>
                <p>
                    <strong>The Surprise:</strong> The beam split into exactly two discrete components! One deflected up, one down.
                    This was the first direct evidence of <strong>quantization of angular momentum</strong> (spin).
                </p>

                <div className="my-6 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded">
                    <h4 className="mt-0 text-blue-300">Key Concept: Quantum State Vectors</h4>
                    <p>
                        We represent the state of the atoms deflected "up" as the ket <code>|+⟩</code> (spin up).
                        The atoms deflected "down" are <code>|-⟩</code> (spin down).
                        <br />
                        A general state is a superposition: <code>|ψ⟩ = c<sub>+</sub>|+⟩ + c<sub>-</sub>|-⟩</code>
                    </p>
                </div>

                <h3>1.2 Sequential Measurements</h3>
                <p>
                    What happens if we block the <code>|-⟩</code> beam and send the <code>|+⟩</code> atoms through a second magnet?
                </p>
                <ul className="list-disc pl-5">
                    <li>If the second magnet is also <strong>Z-oriented</strong>, 100% of atoms go UP. The state "remembers" it is spin up.</li>
                    <li>If the second magnet is <strong>X-oriented</strong>, the beam splits 50/50 again! The measurement of X destroys the information about Z.</li>
                </ul>
            </>
        ),
        sim: <SternGerlachSim />,
        quiz: {
            question: "An atom is prepared in the state |+⟩ (Spin Z Up). It passes through an X-analyzer. What is the probability of measuring Spin X Down?",
            options: ['0%', '25%', '50%', '100%'],
            answer: '50%',
            explanation: "Correct! The state |+⟩ is an equal superposition of X-up and X-down: |+⟩ = (|+⟩ₓ + |-⟩ₓ) / √2"
        }
    },
    {
        id: 2,
        title: "Operators and Measurement",
        content: (
            <>
                <h3>2.1 Operators</h3>
                <p>
                    In quantum mechanics, physical quantities (observables) are represented by <strong>linear operators</strong>.
                    For spin-1/2 systems, these operators are 2x2 matrices.
                </p>
                <p>
                    When an operator acts on a state vector (ket), it transforms it into a new vector:
                    <br />
                    <code>A|ψ⟩ = |ϕ⟩</code>
                </p>

                <div className="my-6 p-4 bg-purple-900/20 border-l-4 border-purple-500 rounded">
                    <h4 className="mt-0 text-purple-300">The Pauli Matrices</h4>
                    <p>The spin operators are proportional to the Pauli matrices:</p>
                    <ul className="font-mono text-sm">
                        <li>X = [[0, 1], [1, 0]]  (Bit Flip)</li>
                        <li>Z = [[1, 0], [0, -1]] (Phase Flip)</li>
                        <li>Y = [[0, -i], [i, 0]]</li>
                    </ul>
                </div>

                <h3>2.2 Measurement</h3>
                <p>
                    The only possible results of a measurement are the <strong>eigenvalues</strong> of the operator.
                    For spin operators, the eigenvalues are +ℏ/2 and -ℏ/2.
                </p>
                <p>
                    <strong>Eigenvectors</strong> are special states that don't change direction when the operator acts on them, only their length (by the eigenvalue factor).
                </p>
            </>
        ),
        sim: <MatrixOperatorSim />,
        quiz: {
            question: "Apply the X operator (Bit Flip) to the state |0⟩ (Spin Up). What is the result?",
            options: ['|0⟩', '|1⟩', '-|0⟩', '0'],
            answer: '|1⟩',
            explanation: "Correct! X|0⟩ = |1⟩. The X operator flips the bit from 0 (up) to 1 (down)."
        }
    },
    {
        id: 3,
        title: "Schrödinger Time Evolution",
        content: (
            <>
                <h3>3.1 The Schrödinger Equation</h3>
                <p>
                    How do quantum states change over time? They evolve according to the Schrödinger equation:
                    <br />
                    <code>iℏ d/dt |ψ(t)⟩ = H |ψ(t)⟩</code>
                </p>
                <p>
                    Here, <strong>H</strong> is the Hamiltonian operator, representing the total energy of the system.
                </p>

                <h3>3.2 Spin Precession</h3>
                <p>
                    For a spin-1/2 particle in a magnetic field <strong>B</strong>, the Hamiltonian is <code>H = -γ B·S</code>.
                    This causes the spin vector to <strong>precess</strong> around the magnetic field direction, similar to a gyroscope.
                </p>
                <p>
                    This is the basis for Nuclear Magnetic Resonance (NMR) and MRI machines!
                </p>
            </>
        ),
        sim: <SpinPrecessionSim />,
        quiz: {
            question: "If a spin starts in |+x⟩ and a B-field is applied along Z, what happens?",
            options: ['It stays in |+x⟩', 'It flips to |-x⟩', 'It precesses in the XY plane', 'It aligns with Z'],
            answer: 'It precesses in the XY plane',
            explanation: "Correct! The torque is τ = μ × B. Since μ is along X and B is along Z, the torque is along Y, causing precession."
        }
    },
    {
        id: 4,
        title: "Quantum Spookiness",
        content: (
            <>
                <h3>4.1 Entanglement</h3>
                <p>
                    When two particles interact, their states can become <strong>entangled</strong>.
                    The state of the whole system cannot be described as a product of individual states.
                </p>
                <p>
                    Example (Bell State): <code>|Φ<sup>+</sup>⟩ = (|00⟩ + |11⟩) / √2</code>
                </p>
                <p>
                    If you measure the first qubit and get 0, the second qubit <strong>instantly</strong> becomes 0, no matter how far away it is.
                    Einstein called this "spooky action at a distance."
                </p>
            </>
        ),
        sim: <EntanglementSim />,
        quiz: {
            question: "In the state (|00⟩ + |11⟩)/√2, if Alice measures 0, what will Bob measure?",
            options: ['0 (100%)', '1 (100%)', '0 or 1 (50/50)', 'Nothing'],
            answer: '0 (100%)',
            explanation: "Correct! The measurements are perfectly correlated."
        }
    },
    {
        id: 5,
        title: "Quantized Energies: Particle in a Box",
        content: (
            <>
                <h3>5.1 Infinite Square Well</h3>
                <p>
                    Imagine a particle trapped in a 1D box of length L. The potential V is 0 inside and infinite outside.
                </p>
                <p>
                    The wavefunction must be zero at the walls. This boundary condition forces the wavefunction to be a standing wave:
                    <br />
                    <code>ψ<sub>n</sub>(x) = √(2/L) sin(nπx/L)</code>
                </p>
                <p>
                    The energy levels are quantized: <code>E<sub>n</sub> = n²h² / (8mL²)</code>.
                    Zero energy is impossible! (Zero-point energy).
                </p>
            </>
        ),
        sim: <ParticleInBoxSim />,
        quiz: {
            question: "What happens to the energy levels if you shrink the box size L?",
            options: ['They get closer', 'They spread apart', 'They stay the same', 'They become zero'],
            answer: 'They spread apart',
            explanation: "Correct! E is proportional to 1/L². Smaller box = Higher confinement energy."
        }
    },
    {
        id: 6,
        title: "Unbound States",
        content: (
            <>
                <h3>6.1 Free Particles</h3>
                <p>
                    If V=0 everywhere, the particle is free. The solutions are plane waves <code>e<sup>(ikx)</sup></code>.
                    These are not normalizable! Real particles are localized <strong>wave packets</strong>.
                </p>

                <h3>6.2 Tunneling</h3>
                <p>
                    If a particle encounters a potential barrier higher than its energy, classically it bounces back.
                    Quantum mechanically, the wavefunction decays exponentially inside the barrier but can emerge on the other side!
                </p>
            </>
        ),
        sim: <TunnelingSim />,
        quiz: {
            question: "Does tunneling probability increase or decrease with barrier width?",
            options: ['Increase', 'Decrease', 'Stays same', 'Oscillates'],
            answer: 'Decrease',
            explanation: "Correct! The wavefunction decays exponentially e<sup>(-κx)</sup> inside the barrier. Wider barrier = less transmission."
        }
    }
];

export default function QuantumCourseView() {
    const [chapterIndex, setChapterIndex] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

    const currentChapter = CHAPTERS[chapterIndex];

    const handleNext = () => {
        if (chapterIndex < CHAPTERS.length - 1) {
            setChapterIndex(prev => prev + 1);
            setShowQuiz(false);
            setQuizAnswer(null);
        }
    };

    const handlePrev = () => {
        if (chapterIndex > 0) {
            setChapterIndex(prev => prev - 1);
            setShowQuiz(false);
            setQuizAnswer(null);
        }
    };

    return (
        <div className="flex flex-col h-full text-gray-200 p-4 gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-purple-400">Quantum Mechanics: A Paradigms Approach</h1>
                    <p className="text-gray-400">Chapter {currentChapter.id}: {currentChapter.title}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={chapterIndex === 0}
                        onClick={handlePrev}
                        className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        disabled={chapterIndex === CHAPTERS.length - 1}
                        onClick={handleNext}
                        className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next Chapter
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                {/* Text Content */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 overflow-y-auto custom-scrollbar">
                    <div className="prose prose-invert max-w-none">
                        {currentChapter.content}

                        <div className="mt-8 pt-8 border-t border-gray-700">
                            <button
                                onClick={() => setShowQuiz(!showQuiz)}
                                className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold border border-gray-600 transition-colors"
                            >
                                {showQuiz ? "Hide Practice Problem" : `Solve Practice Problem ${currentChapter.id}.1`}
                            </button>

                            {showQuiz && (
                                <div className="mt-4 p-4 bg-gray-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                                    <p className="font-bold mb-2">Problem:</p>
                                    <p className="mb-4">{currentChapter.quiz.question}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {currentChapter.quiz.options.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setQuizAnswer(opt)}
                                                className={`p-2 rounded ${quizAnswer === opt
                                                    ? (opt === currentChapter.quiz.answer ? 'bg-green-600' : 'bg-red-600')
                                                    : 'bg-gray-700 hover:bg-gray-600'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {quizAnswer === currentChapter.quiz.answer && (
                                        <p className="mt-2 text-green-400 text-sm">
                                            {currentChapter.quiz.explanation}
                                        </p>
                                    )}
                                    {quizAnswer && quizAnswer !== currentChapter.quiz.answer && (
                                        <p className="mt-2 text-red-400 text-sm">Incorrect. Try again!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Interactive Simulation */}
                <div className="bg-black rounded-xl border border-gray-700 flex flex-col overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded text-xs text-gray-400 border border-gray-800">
                        Interactive Simulator
                    </div>
                    {currentChapter.sim}
                </div>
            </div>
        </div>
    );
}

// --- Simulators ---

function SternGerlachSim() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [magnet, setMagnet] = useState<'Z' | 'X'>('Z');
    const [inputState, setInputState] = useState<'Random' | '+Z' | '-Z'>('Random');
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: { x: number, y: number, vy: number, state: number }[] = [];
        let frame = 0;

        const interval = setInterval(() => {
            if (!isRunning) return;
            frame++;

            if (frame % 5 === 0) {
                let initialState = 0;
                if (inputState === '+Z') initialState = 1;
                if (inputState === '-Z') initialState = -1;
                if (initialState === 0) initialState = Math.random() > 0.5 ? 1 : -1;

                particles.push({
                    x: 0,
                    y: canvas.height / 2 + (Math.random() - 0.5) * 10,
                    vy: 0,
                    state: initialState
                });
            }

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#333';
            ctx.fillRect(150, 50, 100, canvas.height - 100);
            ctx.fillStyle = '#555';
            ctx.font = "20px monospace";
            ctx.fillText(`SG-${magnet}`, 170, canvas.height / 2 + 5);

            ctx.fillStyle = '#00ffcc';
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += 2;

                if (p.x > 150 && p.x < 250) {
                    if (magnet === 'Z') {
                        p.vy += p.state * 0.1;
                    } else {
                        if (Math.abs(p.vy) < 0.01) {
                            const outcome = Math.random() > 0.5 ? 1 : -1;
                            p.vy += outcome * 0.1;
                        }
                    }
                }

                p.y += p.vy;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
                if (p.x > canvas.width) particles.splice(i, 1);
            }

            ctx.fillStyle = '#222';
            ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
            ctx.fillStyle = '#4ade80';
            ctx.fillText("N+", canvas.width - 50, 50);
            ctx.fillStyle = '#f87171';
            ctx.fillText("N-", canvas.width - 50, canvas.height - 50);

        }, 16);

        return () => clearInterval(interval);
    }, [magnet, inputState, isRunning]);

    return (
        <div className="flex flex-col h-full">
            <canvas ref={canvasRef} width={600} height={400} className="w-full flex-1 bg-black" />
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-4 items-center justify-center">
                <div className="flex flex-col">
                    <label className="text-xs text-gray-400">Input Beam</label>
                    <select
                        value={inputState}
                        onChange={(e) => setInputState(e.target.value as any)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                        <option value="Random">Unpolarized (Random)</option>
                        <option value="+Z">Spin Up |+⟩</option>
                        <option value="-Z">Spin Down |-⟩</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-gray-400">Magnet Orientation</label>
                    <div className="flex gap-1">
                        <button onClick={() => setMagnet('Z')} className={`px-3 py-1 rounded text-sm ${magnet === 'Z' ? 'bg-blue-600' : 'bg-gray-700'}`}>Z-Axis</button>
                        <button onClick={() => setMagnet('X')} className={`px-3 py-1 rounded text-sm ${magnet === 'X' ? 'bg-blue-600' : 'bg-gray-700'}`}>X-Axis</button>
                    </div>
                </div>
                <button onClick={() => setIsRunning(!isRunning)} className="ml-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold text-sm">{isRunning ? "Pause" : "Resume"}</button>
            </div>
        </div>
    );
}

function MatrixOperatorSim() {
    const [state, setState] = useState({ c0: 1, c1: 0 });

    const applyOperator = (op: 'X' | 'Z' | 'H') => {
        let newC0 = state.c0;
        let newC1 = state.c1;

        if (op === 'X') {
            const temp = newC0;
            newC0 = newC1;
            newC1 = temp;
        } else if (op === 'Z') {
            newC1 = -newC1;
        } else if (op === 'H') {
            const invSqrt2 = 1 / Math.sqrt(2);
            const tempC0 = newC0;
            newC0 = invSqrt2 * (tempC0 + newC1);
            newC1 = invSqrt2 * (tempC0 - newC1);
        }
        setState({ c0: newC0, c1: newC1 });
    };

    const reset = () => setState({ c0: 1, c1: 0 });

    return (
        <div className="flex flex-col h-full items-center justify-center p-8">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-mono text-purple-400 mb-4">State Vector |ψ⟩</h3>
                <div className="text-4xl font-mono bg-gray-900 p-6 rounded-xl border border-gray-700">
                    {state.c0.toFixed(3)}|0⟩ + {state.c1.toFixed(3)}|1⟩
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={() => applyOperator('X')} className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-500 font-bold font-mono text-xl">X</button>
                <button onClick={() => applyOperator('Z')} className="px-6 py-3 bg-green-600 rounded hover:bg-green-500 font-bold font-mono text-xl">Z</button>
                <button onClick={() => applyOperator('H')} className="px-6 py-3 bg-yellow-600 rounded hover:bg-yellow-500 font-bold font-mono text-xl">H</button>
            </div>
            <button onClick={reset} className="mt-8 text-gray-500 hover:text-white underline">Reset to |0⟩</button>
        </div>
    );
}

function SpinPrecessionSim() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let t = 0;
        const interval = setInterval(() => {
            t += 0.05;
            setAngle(t);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const r = 100;

            // Draw Sphere Outline
            ctx.strokeStyle = '#333';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            // Draw B-field (Z-axis)
            ctx.strokeStyle = '#444';
            ctx.beginPath();
            ctx.moveTo(cx, cy + r + 20);
            ctx.lineTo(cx, cy - r - 20);
            ctx.stroke();
            ctx.fillStyle = '#888';
            ctx.fillText("B", cx + 10, cy - r - 20);

            // Draw Spin Vector
            const sx = r * Math.sin(t);
            const sy = r * Math.cos(t) * 0.3; // Tilt for 3D effect

            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + sx, cy - sy);
            ctx.stroke();

            // Draw Arrowhead
            ctx.fillStyle = '#00ffcc';
            ctx.beginPath();
            ctx.arc(cx + sx, cy - sy, 5, 0, Math.PI * 2);
            ctx.fill();

        }, 16);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <canvas ref={canvasRef} width={400} height={400} className="bg-black rounded-full border border-gray-800" />
            <p className="mt-4 text-gray-400">Spin Vector Precessing around B-field</p>
        </div>
    );
}

function EntanglementSim() {
    const [measured, setMeasured] = useState(false);
    const [result, setResult] = useState<number | null>(null);

    const measure = () => {
        setMeasured(true);
        setResult(Math.random() > 0.5 ? 0 : 1);
    };

    const reset = () => {
        setMeasured(false);
        setResult(null);
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-8">
            <div className="mb-8 text-center">
                <h3 className="text-xl text-purple-400 mb-2">Bell State |Φ<sup>+</sup>⟩</h3>
                <div className="text-4xl font-mono">
                    (|00⟩ + |11⟩) / √2
                </div>
            </div>

            <div className="flex gap-16 items-center">
                <div className="text-center">
                    <p className="mb-2 text-gray-400">Alice</p>
                    <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold border-2 ${measured ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'}`}>
                        {measured ? result : "?"}
                    </div>
                </div>

                <div className="text-2xl text-gray-600">↔️</div>

                <div className="text-center">
                    <p className="mb-2 text-gray-400">Bob</p>
                    <div className={`w-24 h-24 rounded-xl flex items-center justify-center text-4xl font-bold border-2 ${measured ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'}`}>
                        {measured ? result : "?"}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex gap-4">
                <button onClick={measure} disabled={measured} className="px-6 py-3 bg-purple-600 rounded hover:bg-purple-500 font-bold disabled:opacity-50">
                    Measure
                </button>
                <button onClick={reset} className="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600 font-bold">
                    Reset
                </button>
            </div>
            {measured && <p className="mt-4 text-green-400 animate-in fade-in">Instant correlation observed!</p>}
        </div>
    );
}

function ParticleInBoxSim() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [n, setN] = useState(1);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let t = 0;
        const interval = setInterval(() => {
            t += 0.1;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Box
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, 50, 300, 300);

            // Draw Wavefunction
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 3;
            ctx.beginPath();

            const baseline = 200;
            const amplitude = 50;

            for (let x = 0; x <= 300; x++) {
                // psi(x) = sin(n * pi * x / L)
                // Time dependence: cos(omega * t) (real part)
                const psi = Math.sin((n * Math.PI * x) / 300) * Math.cos(t * n);

                ctx.lineTo(50 + x, baseline - psi * amplitude);
            }
            ctx.stroke();

            // Draw Energy Level
            ctx.fillStyle = '#ffff00';
            ctx.fillText(`n = ${n}`, 20, 200);
            ctx.fillText(`E ∝ ${n * n}`, 20, 220);

        }, 16);
        return () => clearInterval(interval);
    }, [n]);

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <canvas ref={canvasRef} width={400} height={400} className="bg-black" />
            <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4].map(level => (
                    <button
                        key={level}
                        onClick={() => setN(level)}
                        className={`px-4 py-2 rounded ${n === level ? 'bg-purple-600' : 'bg-gray-700'}`}
                    >
                        n={level}
                    </button>
                ))}
            </div>
        </div>
    );
}

function TunnelingSim() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: { x: number, y: number, vx: number }[] = [];

        const interval = setInterval(() => {
            // Spawn
            if (Math.random() < 0.05) {
                particles.push({ x: 0, y: 200 + (Math.random() - 0.5) * 50, vx: 2 });
            }

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Barrier
            ctx.fillStyle = '#555';
            ctx.fillRect(200, 100, 20, 200);
            ctx.fillStyle = '#aaa';
            ctx.fillText("Barrier", 190, 90);

            // Update Particles
            ctx.fillStyle = '#00ffff';
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;

                // Hit Barrier
                if (p.x > 200 && p.x < 220) {
                    // Tunneling probability
                    if (Math.random() > 0.1) {
                        p.vx = -2; // Reflect
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();

                if (p.x > canvas.width || p.x < 0) particles.splice(i, 1);
            }

        }, 16);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <canvas ref={canvasRef} width={400} height={400} className="bg-black border border-gray-800" />
            <p className="mt-4 text-gray-400">Particles tunneling through a potential barrier</p>
        </div>
    );
}
