class TerraformingSim:
    """
    Meta-simulation for planetary terraforming.
    Tracks global parameters like Temperature, Pressure, Oxygen, Water, Biomass.
    """
    def __init__(self, planet_type: str = "Mars"):
        self.planet_type = planet_type
        
        if planet_type == "Mars":
            self.temp = 210.0 # Kelvin
            self.pressure = 0.6 # kPa
            self.oxygen = 0.1 # %
            self.water = 10.0 # % surface coverage (ice)
            self.biomass = 0.0
        elif planet_type == "Venus":
            self.temp = 737.0
            self.pressure = 9200.0
            self.oxygen = 0.0
            self.water = 0.0
            self.biomass = 0.0
        
        self.year = 0

    def step(self, actions: dict):
        """
        actions: dict of player interventions, e.g. {"import_ice": True, "solar_shade": False}
        """
        self.year += 1
        
        # Natural feedback loops
        
        # Greenhouse effect
        greenhouse_factor = (self.pressure / 100.0) * 0.1 
        self.temp += greenhouse_factor
        
        # Actions
        if actions.get("nuke_poles", False) and self.planet_type == "Mars":
            self.temp += 5.0
            self.pressure += 1.0
            self.water += 2.0
            
        if actions.get("solar_shade", False) and self.planet_type == "Venus":
            self.temp -= 2.0
            
        if actions.get("plant_bacteria", False):
            if self.temp > 273 and self.temp < 320 and self.water > 5.0:
                self.biomass += 1.0
                self.oxygen += 0.1
                
        # Stabilization
        # Radiative cooling
        self.temp -= 0.5 
        
        # Clamping
        self.temp = max(0, self.temp)
        self.pressure = max(0, self.pressure)
        self.oxygen = max(0, min(100, self.oxygen))
        self.water = max(0, min(100, self.water))
        self.biomass = max(0, self.biomass)

    def get_state(self):
        return {
            "year": self.year,
            "temp": self.temp,
            "pressure": self.pressure,
            "oxygen": self.oxygen,
            "water": self.water,
            "biomass": self.biomass
        }
