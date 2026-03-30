import httpx
from sgp4.api import Satrec, WGS84
import numpy as np
from datetime import datetime, timezone
import os
from pydantic import BaseModel
from typing import Optional

class SatelliteData(BaseModel):
    name: str
    norad_id: str
    tle1: str
    tle2: str
    altitude: float
    inclination: float
    period: float
    eccentricity: float
    apogee: float
    perigee: float
    operator: Optional[str] = "Unknown"
    country: Optional[str] = "Unknown"
    launch_date: Optional[str] = "Unknown"
    mission_type: Optional[str] = "Unknown"
    status: Optional[str] = "Unknown"

async def fetch_satellite(name_or_id: str) -> SatelliteData:
    # 1. CelesTrak TLE fetch
    async with httpx.AsyncClient() as client:
        # Try by name first, if it looks like an ID, try CATNR
        if name_or_id.isdigit():
            url = f"https://celestrak.org/GSAT/query.php?CATNR={name_or_id}&FORMAT=JSON"
        else:
            url = f"https://celestrak.org/GSAT/query.php?NAME={name_or_id}&FORMAT=JSON"
        
        response = await client.get(url)
        if response.status_code != 200 or not response.json():
            # Try fallback to CATNR if name failed
            url = f"https://celestrak.org/GSAT/query.php?CATNR={name_or_id}&FORMAT=JSON"
            response = await client.get(url)
            if response.status_code != 200 or not response.json():
                raise Exception("Satellite not found in CelesTrak")

        data = response.json()[0]
        tle1 = data['TLE_LINE1']
        tle2 = data['TLE_LINE2']
        norad_id = str(data['NORAD_CAT_ID'])
        sat_name = data['OBJECT_NAME']

        # 2. Derive orbital parameters using SGP4
        satellite = Satrec.twoline2rv(tle1, tle2)
        
        # Mean motion in radians per minute
        # n = mean motion from TLE (revs per day)
        # Convert to rad/min: n * (2*pi / 1440)
        n = satellite.no_kozai  # mean motion in rad/min
        
        # Semi-major axis a = (GM / n^2)^(1/3)
        # GM for Earth = 3.986004418e14 m^3/s^2
        # Convert n to rad/s: n / 60
        gm = 3.986004418e14
        a = (gm / (n/60)**2)**(1/3) / 1000  # in km
        
        earth_radius = 6371.0
        altitude = a - earth_radius
        
        inclination = np.degrees(satellite.inclo)
        eccentricity = satellite.ecco
        period = 1440.0 / (n * 1440.0 / (2 * np.pi)) # 1440 / (revs per day)
        
        apogee = a * (1 + eccentricity) - earth_radius
        perigee = a * (1 - eccentricity) - earth_radius

        # 3. Space-Track metadata fetch (Simplified for now, needs credentials)
        # In a real implementation, we would login and fetch satcat data
        # For this version, we'll use placeholder data until ST credentials are verified
        operator = "Unknown"
        country = "Unknown"
        launch_date = "Unknown"
        mission_type = "Satellite"
        status = "Active"

        return SatelliteData(
            name=sat_name,
            norad_id=norad_id,
            tle1=tle1,
            tle2=tle2,
            altitude=round(altitude, 2),
            inclination=round(inclination, 2),
            period=round(period, 2),
            eccentricity=round(eccentricity, 6),
            apogee=round(apogee, 2),
            perigee=round(perigee, 2),
            operator=operator,
            country=country,
            launch_date=launch_date,
            mission_type=mission_type,
            status=status
        )
