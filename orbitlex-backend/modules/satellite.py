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
    orbit_type: str = "LEO"

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
    """Fetch live TLE from CelesTrak and metadata from Space-Track."""
    async with httpx.AsyncClient() as client:
        # Step 1: CelesTrak Lookup
        # Prefer GP (General Perturbations) endpoint for TLE accuracy
        if name_or_id.isdigit():
            url = f"https://celestrak.org/NORAD/elements/gp.php?CATNR={name_or_id}&FORMAT=JSON"
        else:
            # Fallback to general search if it's a name
            url = f"https://celestrak.org/GSAT/query.php?NAME={name_or_id}&FORMAT=JSON"
        
        print(f"[Satellite] Searching CelesTrak for: '{name_or_id}'")
        response = await client.get(url)
        if response.status_code != 200 or not response.json():
            # Retry with legacy endpoint if GP failed
            if name_or_id.isdigit():
                url = f"https://celestrak.org/GSAT/query.php?CATNR={name_or_id}&FORMAT=JSON"
                response = await client.get(url)
            
            if response.status_code != 200 or not response.json():
                print(f"[Satellite] Error: '{name_or_id}' NOT FOUND in CelesTrak (Status: {response.status_code})")
                raise Exception(f"Satellite '{name_or_id}' not found in CelesTrak")
        
        results = response.json()
        print(f"[Satellite] Found {len(results)} matches for '{name_or_id}'. Returning first match.")
        data = results[0]
        # Some endpoints use different field names
        tle1 = data.get('TLE_LINE1') or data.get('TLE1')
        tle2 = data.get('TLE_LINE2') or data.get('TLE2')
        norad_id = str(data.get('NORAD_CAT_ID') or data.get('CATNR'))
        sat_name = data.get('OBJECT_NAME') or data.get('NAME')

        if not (tle1 and tle2):
             raise Exception(f"TLE data missing for {sat_name}")

        # Step 2: Derive orbital parameters using SGP4
        satrec = Satrec.twoline2rv(tle1, tle2)
        
        # Mean motion in radians per minute
        n = satrec.no_kozai  # rad/min
        
        # GM for Earth = 3.986004418e14 m^3/s^2
        gm = 3.986004418e14
        # a = (GM / n^2)^(1/3)
        # Convert n to rad/s: n / 60
        a = (gm / (n/60)**2)**(1/3) / 1000  # in km
        
        earth_radius = 6378.137  # WGS84 semi-major axis in km
        altitude = a - earth_radius
        
        inclination = np.degrees(satrec.inclo)
        eccentricity = satrec.ecco
        # period = 2*pi / n (rad/min) -> mins
        period = (2 * np.pi) / n
        
        apogee = a * (1 + eccentricity) - earth_radius
        perigee = a * (1 - eccentricity) - earth_radius

        # Status normalization
        raw_status = data.get('OPERATIONAL_STATUS') or data.get('STATUS') or status
        if raw_status in ("+", "A"): status = "Active"
        elif raw_status in ("-", "D"): status = "Defunct"
        
        orbit_type = "LEO" if altitude < 2000 else ("GEO" if altitude >= 35786 else "MEO")

        # Step 3: Space-Track metadata fetch (Optional/Best-effort)
        operator = "Unknown"
        country = "Unknown"
        launch_date = data.get('LAUNCH_DATE') or "Unknown"
        mission_type = data.get('OBJECT_TYPE') or "Satellite"
        status = data.get('OPERATIONAL_STATUS') or "Active"

        # Only attempt Space-Track if credentials exist
        if os.environ.get("SPACE_TRACK_USER") and os.environ.get("SPACE_TRACK_PASS"):
            try:
                await _login_space_track(client)
                st = await _fetch_space_track_metadata(client, norad_id)

                country = st.get("COUNTRY") or country
                launch_date = st.get("LAUNCH_DATE") or st.get("LAUNCH") or launch_date
                mission_type = st.get("OBJECT_TYPE") or mission_type
                
                # Normalize status
                raw_status = st.get("OPERATIONAL_STATUS") or st.get("STATUS") or status
                if raw_status in ("+", "A"): status = "Active"
                elif raw_status in ("-", "D"): status = "Defunct"
                elif raw_status == "P": status = "Partially Operational"
                else: status = raw_status

                operator = st.get("OWNER") or st.get("OPERATOR") or operator
            except Exception as e:
                print(f"[Satellite] Space-Track fetch failed: {e}")
            finally:
                try:
                    await client.get(SPACE_TRACK_LOGOUT_URL)
                except Exception:
                    pass

        return SatelliteData(
            name=sat_name,
            norad_id=norad_id,
            tle1=tle1,
            tle2=tle2,
            altitude=round(max(0, altitude), 2),
            inclination=round(inclination, 2),
            period=round(period, 2),
            eccentricity=round(eccentricity, 6),
            apogee=round(max(0, apogee), 2),
            perigee=round(max(0, perigee), 2),
            operator=operator,
            country=country,
            launch_date=launch_date,
            mission_type=mission_type,
            status=status,
            orbit_type=orbit_type
        )

async def fetch_satellite_group(group: str) -> list[SatelliteData]:
    """Fetch a group of satellites from CelesTrak (e.g. STATIONS, GEO, WEATHER)."""
    # Mapping friendly names to CelesTrak group query params
    group_map = {
        'LEO': 'STATIONS',
        'GEO': 'GEO',
        'ACTIVE': 'VISUAL',
        'WEATHER': 'WEATHER',
        'ALL': 'STATIONS'
    }
    target = group_map.get(group.upper(), 'STATIONS')
    url = f"https://celestrak.org/NORAD/elements/gp.php?GROUP={target}&FORMAT=JSON"
    
    async with httpx.AsyncClient() as client:
        print(f"[Satellite] Fetching group cluster: '{target}'")
        resp = await client.get(url)
        if resp.status_code != 200:
            return []
            
        raw_list = resp.json()
        results = []
        
        # We only take the first 50 for performance reasons in the UI
        for data in raw_list[:50]:
            try:
                # Basic normalization for group data
                tle1 = data.get('TLE_LINE1') or data.get('TLE1')
                tle2 = data.get('TLE_LINE2') or data.get('TLE2')
                norad_id = str(data.get('NORAD_CAT_ID') or data.get('CATNR'))
                sat_name = data.get('OBJECT_NAME') or data.get('NAME')
                
                if not (tle1 and tle2): continue
                
                # Derive orbital parameters (Simplified for group view, real-time detail on selection)
                satrec = Satrec.twoline2rv(tle1, tle2)
                n = satrec.no_kozai
                gm = 3.986004418e14
                a = (gm / (n/60)**2)**(1/3) / 1000
                earth_radius = 6378.137
                altitude = a - earth_radius
                
                results.append(SatelliteData(
                    name=sat_name,
                    norad_id=norad_id,
                    tle1=tle1,
                    tle2=tle2,
                    altitude=round(max(0, altitude), 2),
                    inclination=round(np.degrees(satrec.inclo), 2),
                    period=round((2 * np.pi) / n, 2),
                    eccentricity=round(satrec.ecco, 6),
                    apogee=round(max(0, a * (1 + satrec.ecco) - earth_radius), 2),
                    perigee=round(max(0, a * (1 - satrec.ecco) - earth_radius), 2),
                    country=data.get('COUNTRY_CODE') or "Unknown",
                    status=data.get('OPERATIONAL_STATUS') or "Active",
                    orbit_type="LEO" if altitude < 2000 else ("GEO" if altitude >= 35786 else "MEO")
                ))
            except Exception as e:
                print(f"[Satellite] Skipping malformed record: {e}")
                continue
                
        print(f"[Satellite] Cluster fetch complete. Loaded {len(results)} mission nodes.")
        return results

