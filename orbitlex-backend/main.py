from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os
from dotenv import load_dotenv

from auth import verify_token
from modules.satellite import fetch_satellite
from modules.compliance import check_compliance
from modules.deorbit import predict_deorbit
from modules.debris import simulate_debris
from modules.report import generate_report_narrative, generate_pdf, ReportRequest
from modules.waste import analyze_waste, WasteAnalyzeRequest

load_dotenv()

app = FastAPI(title="OrbitLex Backend")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://orbitlex.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/search")
async def search_satellite(name: str = Query(..., description="Satellite name or NORAD ID"), 
                           user=Depends(verify_token)):
    try:
        data = await fetch_satellite(name)
        return data
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/compliance")
async def get_compliance(sat_data: dict, deorbit_years: float, user=Depends(verify_token)):
    # sat_data is expected to be a dict from SatelliteData model
    from modules.satellite import SatelliteData
    sat = SatelliteData(**sat_data)
    report = check_compliance(sat, deorbit_years)
    return report

@app.post("/api/deorbit")
async def get_deorbit(params: dict, user=Depends(verify_token)):
    # Expects altitude, inclination, mass, area
    try:
        result = predict_deorbit(
            float(params['altitude']), 
            float(params['inclination']), 
            float(params.get('mass', 500)), 
            float(params.get('area', 5))
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/debris")
async def get_debris(sat_data: dict, user=Depends(verify_token)):
    from modules.satellite import SatelliteData
    sat = SatelliteData(**sat_data)
    result = simulate_debris(sat)
    return result

@app.post("/api/report")
async def get_report_narrative_endpoint(req: ReportRequest, user=Depends(verify_token)):
    try:
        report = generate_report_narrative(req)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pdf")
async def get_pdf_endpoint(satellite: str, report_data: dict, user=Depends(verify_token)):
    # For demo, report_data should be passed or stored
    from modules.report import ReportText
    report = ReportText(**report_data)
    pdf_bytes = generate_pdf(satellite, report)
    return Response(
        content=pdf_bytes, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=orbitlex_{satellite}.pdf"}
    )

@app.post("/api/waste/analyze")
async def waste_analyze_endpoint(req: WasteAnalyzeRequest, user=Depends(verify_token)):
    """
    Priority-1 waste flow:
    - Segregation & sorting steps (smart/heuristic from NLP)
    - Safe recycling technologies (per inferred category + hazards)
    - Recyclability & reusability estimates (fraction ranges + optional kg ranges)
    - Consumer incentives (points)
    - Policy & compliance support (RAG-grounded, LLM synthesized)
    - Circular product design guidance
    """
    try:
        return analyze_waste(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
