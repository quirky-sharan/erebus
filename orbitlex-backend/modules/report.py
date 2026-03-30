import os
from groq import Groq
from pydantic import BaseModel
from typing import Optional, List
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from modules.rag import rag_system
import json

class ReportText(BaseModel):
    executive_summary: str
    compliance_narrative: str
    deorbit_analysis: str
    debris_assessment: str
    recommendations: str

class ReportRequest(BaseModel):
    sat_data: dict
    compliance: dict
    deorbit: dict
    debris: dict

def generate_report_narrative(req: ReportRequest) -> ReportText:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    
    # Retrieve relevant policy chunks for RAG
    query = f"Space debris mitigation for {req.sat_data.get('name')} {req.sat_data.get('country')} orbital lifetime"
    policy_chunks = rag_system.retrieve(query)
    
    system_prompt = (
        "You are OrbitLex AI, a space debris compliance expert. Generate professional, technical, concise "
        "mission compliance reports. Use metric units. Cite specific regulatory frameworks. Be precise. "
        "Structure output as JSON with keys: executive_summary, compliance_narrative, deorbit_analysis, "
        "debris_assessment, recommendations. Each value is a string of 2-4 sentences."
    )
    
    user_prompt = (
        f"Satellite: {req.sat_data.get('name')}\n"
        f"Altitude: {req.sat_data.get('altitude')} km\n"
        f"Operator: {req.sat_data.get('operator')}\n"
        f"Compliance: {req.compliance.get('results')}\n"
        f"Deorbit Years: {req.deorbit.get('years_mean')}\n"
        f"Debris Risk: {req.debris.get('overall_risk_level')}\n"
        f"Policy Chunks: {policy_chunks}\n"
    )
    
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    response_json = json.loads(chat_completion.choices[0].message.content)
    return ReportText(**response_json)

def generate_pdf(sat_name, report: ReportText) -> bytes:
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    p.setFont("Helvetica-Bold", 24)
    p.drawString(100, height - 100, "ORBITLEX MISSION COMPLIANCE REPORT")
    p.setFont("Helvetica", 14)
    p.drawString(100, height - 130, f"Satellite: {sat_name}")
    p.drawString(100, height - 150, f"Classification: Official / Restricted")

    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, height - 200, "Executive Summary")
    p.setFont("Helvetica", 11)
    p.drawString(100, height - 220, report.executive_summary)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, height - 260, "Compliance Matrix Findings")
    p.setFont("Helvetica", 11)
    p.drawString(100, height - 280, report.compliance_narrative)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, height - 320, "Recommendations")
    p.setFont("Helvetica", 11)
    p.drawString(100, height - 340, report.recommendations)

    p.showPage()
    p.save()
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
