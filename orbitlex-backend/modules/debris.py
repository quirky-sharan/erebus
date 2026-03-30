from pydantic import BaseModel
from typing import List, Optional
from modules.satellite import SatelliteData
import numpy as np

class OrbitalBand(BaseModel):
    band_name: str
    alt_min: float
    alt_max: float
    object_count: int
    debris_density_class: str
    sat_in_band: bool

class DebrisRisk(BaseModel):
    frag_prob: float
    collision_prob_annual: float
    overall_risk_score: float
    overall_risk_level: str
    orbital_bands: List[OrbitalBand]

def simulate_debris(sat: SatelliteData) -> DebrisRisk:
    # 1. Fragmentation Risk (Simplified heuristic from Master Prompt)
    base_prob = 0.12 # LEO
    if sat.altitude > 2000: base_prob = 0.18 # MEO
    if sat.altitude > 35786: base_prob = 0.08 # GEO
    
    # Modifiers
    modifiers = 0
    if 700 < sat.altitude < 900: modifiers += 0.05 # Iridium-Cosmos zone
    if sat.status == "DEFUNCT": modifiers += 0.03
    if sat.eccentricity > 0.1: modifiers += 0.04
    
    frag_prob = min(base_prob + modifiers, 1.0)
    
    # 2. Collision Probability (annual)
    # sigma = collision cross section approx 100 m^2 (0.0001 km^2)
    sigma = 0.0001
    
    # Lookup object density n (objects/km^3)
    density_table = {
        500: 8e-9,  # High Starlink
        800: 5e-9,  # High Iridium-Cosmos
        1000: 2e-9, # Medium
        2000: 1e-10, # Low
        35786: 5e-11 # Very Low
    }
    
    # Find closest altitude band for density
    n = 1e-12 # Default
    for alt, dens in density_table.items():
        if sat.altitude <= alt:
            n = dens
            break
            
    # v_rel = 7.5 km/s (7500 m/s)
    # dt = 31536000 s (1 year)
    v_rel = 7.5
    dt = 31536000
    collision_prob = sigma * n * v_rel * dt
    
    # 3. Overall Risk Score
    # Score = frag_prob * 0.4 + min(collision_prob * 1e8, 1) * 0.4 + (1 if defunct else 0) * 0.2
    defunct_factor = 1.0 if sat.status == "DEFUNCT" else 0
    score = (frag_prob * 0.4) + (min(collision_prob * 1e6, 1) * 0.4) + (defunct_factor * 0.2)
    
    level = "LOW"
    if score > 0.6: level = "HIGH"
    elif score > 0.25: level = "MEDIUM"
    
    # 4. Orbital Band Data
    bands = [
        OrbitalBand(band_name="LEO", alt_min=200, alt_max=2000, object_count=23000, 
                     debris_density_class="HIGH", sat_in_band=(sat.altitude < 2000)),
        OrbitalBand(band_name="MEO", alt_min=2000, alt_max=35786, object_count=1200, 
                     debris_density_class="MEDIUM", sat_in_band=(2000 <= sat.altitude < 35786)),
        OrbitalBand(band_name="GEO", alt_min=35786, alt_max=36000, object_count=500, 
                     debris_density_class="LOW", sat_in_band=(sat.altitude >= 35786))
    ]
    
    return DebrisRisk(
        frag_prob=round(frag_prob, 3),
        collision_prob_annual=collision_prob,
        overall_risk_score=round(score, 2),
        overall_risk_level=level,
        orbital_bands=bands
    )
