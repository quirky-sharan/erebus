import httpx
from sgp4.api import Satrec, WGS84
import numpy as np
from datetime import datetime, timezone
import os
import asyncio
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

SPACE_TRACK_LOGIN_URL = "https://www.space-track.org/auth/login"
SPACE_TRACK_LOGOUT_URL = "https://www.space-track.org/ajaxauth/logout"
SPACE_TRACK_SATCAT_URL = (
    "https://www.space-track.org/basicspacedata/query/class/satcat/NORAD_CAT_ID/{id}/format/json"
)


async def _request_json_with_retry(
    client: httpx.AsyncClient,
    url: str,
    attempts: int = 3,
    retry_delay_s: float = 3.0,
) -> object:
    """
    Space-Track can rate-limit (429). Retry with a fixed delay.
    Keep the retry logic local to this request lifecycle.
    """
    last_exc: Optional[Exception] = None
    for attempt in range(attempts):
        try:
            resp = await client.get(url)
            if resp.status_code == 429 and attempt < attempts - 1:
                await asyncio.sleep(retry_delay_s)
                continue
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            last_exc = e
            if attempt < attempts - 1:
                await asyncio.sleep(retry_delay_s)
                continue
    raise last_exc  # type: ignore[misc]


async def _login_space_track(
    client: httpx.AsyncClient,
    attempts: int = 3,
    retry_delay_s: float = 3.0,
) -> None:
    # Credentials must come from env vars (never hardcoded).
    user = os.environ.get("SPACE_TRACK_USER")
    password = os.environ.get("SPACE_TRACK_PASS")
    if not user or not password:
        raise Exception("Missing SPACE_TRACK_USER or SPACE_TRACK_PASS in environment")

    # Space-Track expects POST fields: identity + password.
    payload = {"identity": user, "password": password}
    for attempt in range(attempts):
        resp = await client.post(SPACE_TRACK_LOGIN_URL, data=payload)
        if resp.status_code == 429 and attempt < attempts - 1:
            await asyncio.sleep(retry_delay_s)
            continue
        # If credentials are wrong, Space-Track typically returns non-2xx.
        resp.raise_for_status()
        return


async def _fetch_space_track_metadata(client: httpx.AsyncClient, norad_cat_id: str) -> dict:
    data = await _request_json_with_retry(
        client,
        SPACE_TRACK_SATCAT_URL.format(id=norad_cat_id),
    )

    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    return {}

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

        # 3. Space-Track metadata fetch (requires credentials via env vars)
        # Keep ST session cookies within this request lifecycle.
        operator = "Unknown"
        country = "Unknown"
        launch_date = "Unknown"
        mission_type = "Satellite"
        status = "Active"

        try:
            await _login_space_track(client)
            st = await _fetch_space_track_metadata(client, norad_id)

            country = st.get("COUNTRY") or country
            launch_date = st.get("LAUNCH_DATE") or st.get("LAUNCH") or launch_date
            mission_type = st.get("OBJECT_TYPE") or mission_type
            status = st.get("OPERATIONAL_STATUS") or st.get("STATUS") or status

            # Space-Track SATCAT often doesn't return a clear "operator" field.
            # Best-effort mapping (kept explicit to avoid wrong assumptions).
            operator = st.get("OWNER") or st.get("OPERATOR") or operator
        finally:
            # Try to log out, but never fail the whole request if it errors.
            try:
                await client.get(SPACE_TRACK_LOGOUT_URL)
            except Exception:
                pass

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
