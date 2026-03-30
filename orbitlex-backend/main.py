from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os
from dotenv import load_dotenv

from auth import verify_token

load_dotenv()

app = FastAPI(title="OrbitLex Backend")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://your-app.vercel.app").split(",")

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
    # To be implemented: return satellite data
    return {"message": "Not implemented yet"}

@app.post("/api/compliance")
async def get_compliance(sat_data: dict, user=Depends(verify_token)):
    # To be implemented
    return {"message": "Not implemented yet"}

@app.post("/api/deorbit")
async def get_deorbit(params: dict, user=Depends(verify_token)):
    # To be implemented
    return {"message": "Not implemented yet"}

@app.post("/api/debris")
async def get_debris(sat_data: dict, user=Depends(verify_token)):
    # To be implemented
    return {"message": "Not implemented yet"}

@app.post("/api/report")
async def get_report_narrative(all_module_outputs: dict, user=Depends(verify_token)):
    # To be implemented
    return {"message": "Not implemented yet"}

@app.get("/api/pdf")
async def get_pdf(satellite: str, user=Depends(verify_token)):
    # To be implemented
    return {"message": "Not implemented yet"}
