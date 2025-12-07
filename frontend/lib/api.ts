const API_BASE = "http://localhost:8000";

export const api = {
    physics: {
        create: async (type: string, nx = 50, ny = 50, param = 0.1) => {
            const res = await fetch(`${API_BASE}/sim/physics/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, nx, ny, param }),
            });
            return res.json();
        },
        step: async (session_id: string, steps = 1) => {
            const res = await fetch(`${API_BASE}/sim/physics/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, steps }),
            });
            return res.json();
        },
    },
    mars: {
        create: async () => {
            const res = await fetch(`${API_BASE}/sim/mars/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            return res.json();
        },
        step: async (session_id: string, steps = 1) => {
            const res = await fetch(`${API_BASE}/sim/mars/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, steps }),
            });
            return res.json();
        },
    },
    venus: {
        create: async () => {
            const res = await fetch(`${API_BASE}/sim/venus/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            return res.json();
        },
        step: async (session_id: string, steps = 1) => {
            const res = await fetch(`${API_BASE}/sim/venus/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, steps }),
            });
            return res.json();
        },
    },
    volcano: {
        create: async () => {
            const res = await fetch(`${API_BASE}/sim/volcano/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            return res.json();
        },
        step: async (session_id: string, steps = 1) => {
            const res = await fetch(`${API_BASE}/sim/volcano/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, steps }),
            });
            return res.json();
        },
    },
    terraforming: {
        create: async (planet = "Mars") => {
            const res = await fetch(`${API_BASE}/sim/terraforming/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planet }),
            });
            return res.json();
        },
        step: async (session_id: string, actions: any) => {
            const res = await fetch(`${API_BASE}/sim/terraforming/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, actions }),
            });
            return res.json();
        },
    },
    automata: {
        create: async () => {
            const res = await fetch(`${API_BASE}/sim/automata/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            return res.json();
        },
        step: async (session_id: string, steps = 1) => {
            const res = await fetch(`${API_BASE}/sim/automata/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, steps }),
            });
            return res.json();
        },
    },
    fluid: {
        create: async () => {
            const res = await fetch(`${API_BASE}/sim/fluid/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            return res.json();
        },
        step: async (session_id: string, steps = 1) => {
            const res = await fetch(`${API_BASE}/sim/fluid/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, steps }),
            });
            return res.json();
        },
        action: async (session_id: string, x: number, y: number, amount: number, r = 1.0, g = 1.0, b = 1.0) => {
            const res = await fetch(`${API_BASE}/sim/fluid/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, x, y, amount, r, g, b }),
            });
            return res.json();
        },
    },
    universe: {
        create: async (num_bodies = 100) => {
            const res = await fetch(`${API_BASE}/sim/universe/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ num_bodies }),
            });
            return res.json();
        },
        step: async (session_id: string, steps = 1) => {
            const res = await fetch(`${API_BASE}/sim/universe/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id, steps }),
            });
            return res.json();
        },
    },
    algorithms: {
        create: async (type: string, data: number[]) => {
            const res = await fetch(`${API_BASE}/algorithms/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, data }),
            });
            return res.json();
        },
        step: async (session_id: string) => {
            const res = await fetch(`${API_BASE}/algorithms/step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id }),
            });
            return res.json();
        },
    }
};
