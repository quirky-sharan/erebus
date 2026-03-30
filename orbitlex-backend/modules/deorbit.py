import numpy as np
from scipy.integrate import odeint
from pydantic import BaseModel
from typing import List, Tuple

class DeorbitPrediction(BaseModel):
    years_deterministic: float
    years_mean: float
    years_p5: float
    years_p95: float
    confidence_interval_95: List[float]
    histogram_bins: List[float]
    altitude_decay_curve: List[dict]
    iadc_compliant: bool
    fcc_compliant: bool

def atmospheric_density(h: float) -> float:
    # NRLMSISE-00 simplified lookup table (kg/m^3)
    if h < 200: return 5e-10
    if h < 400: return 5e-11
    if h < 600: return 1e-12
    if h < 800: return 5e-14
    if h < 1000: return 2e-15
    return 1e-16

def dh_dt(h, t, cd, area, mass, solar_factor):
    if h < 100: return 0 # Reentry point
    
    gm = 3.986004418e14
    earth_radius = 6371000.0
    r = earth_radius + h * 1000
    v = np.sqrt(gm / r)
    
    rho = atmospheric_density(h) * solar_factor
    # a_drag = 0.5 * rho * v^2 * cd * A / m
    a_drag = 0.5 * rho * (v**2) * cd * (area / mass)
    
    # dh/dt = - (2 * a_drag) / (v * omega) -> simplified
    # Faster approx: dh/dt = - (rho * cd * area * v^2) / (m * omega)
    # n (mean motion) = v / r
    omega = v / r
    dhdt = - (rho * cd * area * (v**2)) / (mass * omega)
    
    return dhdt / 1000 # Convert to km/s

def predict_deorbit(altitude: float, inclination: float, mass: float = 500, area: float = 5) -> DeorbitPrediction:
    cd = 2.2
    t = np.linspace(0, 3600 * 24 * 365 * 100, 1000) # 100 years
    
    # Deterministic simulation
    sol = odeint(dh_dt, altitude, t, args=(cd, area, mass, 1.0))
    years_deterministic = 100
    for i, h in enumerate(sol):
        if h <= 120: # Approx reentry
            years_deterministic = t[i] / (3600 * 24 * 365)
            break
            
    # Monte Carlo (PPL Layer)
    num_sims = 100 # Reduced for performance in demo
    decay_times = []
    
    for _ in range(num_sims):
        m_rand = np.random.normal(mass, mass * 0.1)
        a_rand = np.random.normal(area, area * 0.15)
        s_rand = np.random.uniform(0.8, 1.5)
        
        sim_sol = odeint(dh_dt, altitude, t, args=(cd, a_rand, m_rand, s_rand))
        decay_yr = 100
        for i, h in enumerate(sim_sol):
            if h <= 120:
                decay_yr = t[i] / (3600 * 24 * 365)
                break
        decay_times.append(decay_yr)
        
    mean_val = np.mean(decay_times)
    p5 = np.percentile(decay_times, 5)
    p95 = np.percentile(decay_times, 95)
    
    # Altitude decay curve (from deterministic)
    curve = []
    for i in range(0, len(sol), 50):
        curve.append({"year": round(t[i] / (3600 * 24 * 365), 1), "altitude": round(float(sol[i]), 1)})

    return DeorbitPrediction(
        years_deterministic=round(years_deterministic, 1),
        years_mean=round(mean_val, 1),
        years_p5=round(p5, 1),
        years_p95=round(p95, 1),
        confidence_interval_95=[round(p5, 1), round(p95, 1)],
        histogram_bins=list(np.histogram(decay_times, bins=20)[0].astype(float)),
        altitude_decay_curve=curve,
        iadc_compliant=mean_val <= 25,
        fcc_compliant=mean_val <= 5
    )
