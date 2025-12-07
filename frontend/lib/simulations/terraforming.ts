
export type PlanetState = {
    year: number;
    temp: number;
    pressure: number;
    oxygen: number;
    water: number;
    biomass: number;
};

export class TerraformingSimulator {
    state: PlanetState;

    constructor() {
        this.state = {
            year: 0,
            temp: 210.0,
            pressure: 0.6,
            oxygen: 0.1,
            water: 10.0,
            biomass: 0.0
        };
    }

    step(actions: { nuke_poles: boolean, solar_shade: boolean, plant_bacteria: boolean }) {
        this.state.year += 1;

        // Greenhouse
        const greenhouse = (this.state.pressure / 100.0) * 0.1;
        this.state.temp += greenhouse;

        // Actions
        if (actions.nuke_poles) {
            this.state.temp += 5.0;
            this.state.pressure += 1.0;
            this.state.water += 2.0;
        }

        if (actions.solar_shade) {
            this.state.temp -= 2.0;
        }

        if (actions.plant_bacteria) {
            if (this.state.temp > 273 && this.state.temp < 320 && this.state.water > 5.0) {
                this.state.biomass += 1.0;
                this.state.oxygen += 0.1;
            }
        }

        // Stabilization
        this.state.temp -= 0.5;

        // Clamping
        this.state.temp = Math.max(0, this.state.temp);
        this.state.pressure = Math.max(0, this.state.pressure);
        this.state.oxygen = Math.max(0, Math.min(100, this.state.oxygen));
        this.state.water = Math.max(0, Math.min(100, this.state.water));
        this.state.biomass = Math.max(0, this.state.biomass);

        return { ...this.state };
    }
}
