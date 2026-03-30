"""
OrbitLex FastAPI Backend — Main Application
Stateless API router for satellite compliance analysis, deorbit prediction,
debris risk simulation, and AI-powered report generation.
No database — all data fetched live from CelesTrak and Space-Track APIs.
"""
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

from auth import verify_token
from modules.satellite import fetch_satellite, fetch_satellite_group, SatelliteData
from modules.compliance import check_compliance
from modules.deorbit import predict_deorbit
from modules.debris import simulate_debris
from modules.report import generate_report_narrative, generate_pdf, ReportRequest, ReportText

# Import waste module if available
try:
    from modules.waste import analyze_waste, WasteAnalyzeRequest
    HAS_WASTE = True
except ImportError:
    HAS_WASTE = False

app = FastAPI(
    title="OrbitLex API",
    description="Mission Compliance & Debris Impact Analyser",
    version="1.0.0",
)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://orbitlex.vercel.app"
).split(",")

print(f"[SYSTEM] OrbitLex API Startup | DEV_MODE: {DEV_MODE}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Models ──

class ComplianceRequest(BaseModel):
    sat_data: dict
    deorbit_years: float

class DeorbitRequest(BaseModel):
    altitude: float
    inclination: float
    mass: float = 500.0
    area: float = 5.0

class DebrisRequest(BaseModel):
    name: str = "Unknown"
    norad_id: str = "0"
    tle1: str = ""
    tle2: str = ""
    altitude: float = 400.0
    inclination: float = 51.6
    period: float = 92.0
    eccentricity: float = 0.0001
    apogee: float = 420.0
    perigee: float = 410.0
    operator: Optional[str] = "Unknown"
    country: Optional[str] = "Unknown"
    launch_date: Optional[str] = "Unknown"
    mission_type: Optional[str] = "Unknown"
    status: Optional[str] = "Active"

class PDFRequest(BaseModel):
    sat_data: dict
    compliance: dict
    deorbit: dict
    debris: dict
    report: dict


# ── Health Check ──

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "OrbitLex API",
        "version": "1.0.0",
    }


# ── Satellite Search ──

@app.get("/api/search")
async def search_satellite(
    name: str = Query(..., description="Satellite name or NORAD ID"),
    user=Depends(verify_token),
):
    """Search for a satellite by name or NORAD ID. Fetches live TLE data from CelesTrak and metadata from Space-Track."""
    try:
        data = await fetch_satellite(name)
        return data
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=404, detail=f"Satellite search failed: {str(e)}")


@app.get("/api/search/group")
async def search_satellite_group(
    group: str = Query("ALL", description="Satellite group name (LEO, GEO, WEATHER, etc.)"),
    user=Depends(verify_token),
):
    """Fetch a group of satellites for repository pre-population."""
    try:
        data = await fetch_satellite_group(group)
        return data
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Group fetch failed: {str(e)}")


# ── Compliance Check ──

@app.post("/api/compliance")
async def get_compliance(req: ComplianceRequest, user=Depends(verify_token)):
    """Run regulatory compliance check against 5 international frameworks."""
    try:
        sat = SatelliteData(**req.sat_data)
        report = check_compliance(sat, req.deorbit_years)
        return report
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Compliance check failed: {str(e)}")


# ── Deorbit Prediction ──

@app.post("/api/deorbit")
async def get_deorbit(req: DeorbitRequest, user=Depends(verify_token)):
    """Run physics-based deorbit prediction with Monte Carlo uncertainty bounds."""
    try:
        result = predict_deorbit(
            altitude=req.altitude,
            inclination=req.inclination,
            mass=req.mass,
            area=req.area,
        )
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Deorbit prediction failed: {str(e)}")


# ── Debris Risk Simulation ──

@app.post("/api/debris")
async def get_debris(req: DebrisRequest, user=Depends(verify_token)):
    """Simulate debris fragmentation and collision risk."""
    try:
        sat = SatelliteData(
            name=req.name,
            norad_id=req.norad_id,
            tle1=req.tle1,
            tle2=req.tle2,
            altitude=req.altitude,
            inclination=req.inclination,
            period=req.period,
            eccentricity=req.eccentricity,
            apogee=req.apogee,
            perigee=req.perigee,
            operator=req.operator,
            country=req.country,
            launch_date=req.launch_date,
            mission_type=req.mission_type,
            status=req.status,
        )
        result = simulate_debris(sat)
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Debris simulation failed: {str(e)}")


# ── AI Report Generation ──

@app.post("/api/report")
async def get_report_narrative(req: ReportRequest, user=Depends(verify_token)):
    """Generate AI-powered mission compliance report using Groq LLM + RAG."""
    try:
        report = generate_report_narrative(req)
        return report
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


# ── PDF Download ──

@app.post("/api/pdf")
async def get_pdf(req: PDFRequest, user=Depends(verify_token)):
    """Generate and stream a PDF compliance report."""
    try:
        report = ReportText(**req.report)
        sat_name = req.sat_data.get('name', 'Unknown')
        
        pdf_bytes = generate_pdf(
            sat_name=sat_name,
            report=report,
            sat_data=req.sat_data,
            compliance_data=req.compliance,
            deorbit_data=req.deorbit,
            debris_data=req.debris,
        )
        
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in sat_name)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="orbitlex_{safe_name}.pdf"'}
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ── Waste Analysis (Priority features) ──

if HAS_WASTE:
    @app.post("/api/waste/analyze")
    async def waste_analyze_endpoint(req: WasteAnalyzeRequest, user=Depends(verify_token)):
        """
        Priority-1 waste analysis:
        - Segregation & sorting, Safe recycling, Consumer incentives,
        - Policy compliance, Circular product design guidance
        """
        try:
            return analyze_waste(req)
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=f"Waste analysis failed: {str(e)}")
