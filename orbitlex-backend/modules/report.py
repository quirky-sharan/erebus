"""
Report generation module for OrbitLex.
Uses Groq LLM (Llama 3.3 70B) with RAG-grounded policy context
to generate professional mission compliance reports.
PDF generation uses ReportLab with proper text wrapping and multi-page support.
"""
import os
import json
import textwrap
from datetime import datetime
from groq import Groq
from pydantic import BaseModel
from typing import Optional, List
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from io import BytesIO

try:
    from modules.rag import rag_system
except Exception:
    rag_system = None


class ReportText(BaseModel):
    executive_summary: str = ""
    compliance_narrative: str = ""
    deorbit_analysis: str = ""
    debris_assessment: str = ""
    recommendations: str = ""


class ReportRequest(BaseModel):
    sat_data: dict
    compliance: dict
    deorbit: dict
    debris: dict


def generate_report_narrative(req: ReportRequest) -> ReportText:
    """Generate AI narrative report using Groq LLM with RAG context."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return ReportText(
            executive_summary="GROQ_API_KEY not configured. Unable to generate AI narrative.",
            compliance_narrative="Please set the GROQ_API_KEY environment variable.",
            deorbit_analysis="N/A",
            debris_assessment="N/A",
            recommendations="Configure the Groq API key to enable AI-powered report generation.",
        )

    client = Groq(api_key=api_key)

    # RAG: retrieve relevant policy chunks
    policy_chunks = []
    if rag_system:
        sat_name = req.sat_data.get('name', 'Unknown')
        country = req.sat_data.get('country', 'Unknown')
        altitude = req.sat_data.get('altitude', 0)
        orbit_type = 'LEO' if altitude < 2000 else ('GEO' if altitude >= 35786 else 'MEO')
        
        query = (
            f"Space debris mitigation compliance for {sat_name} satellite "
            f"from {country} in {orbit_type} orbit at {altitude}km altitude "
            f"deorbit timeline liability registration"
        )
        policy_chunks = rag_system.retrieve(query, k=5)

    # Build comprehensive system prompt
    system_prompt = (
        "You are OrbitLex AI, an expert space debris compliance analyst. "
        "Generate professional, technical, and concise mission compliance reports. "
        "Use metric units exclusively. Cite specific regulatory frameworks (IADC, FCC 47 CFR 25, "
        "ESA Zero Debris Charter, UN OST Articles VI-VIII, COPUOS Guidelines) by name and article number. "
        "Be precise with numbers and use scientific notation where appropriate. "
        "You MUST respond with valid JSON containing exactly these 5 keys: "
        "executive_summary, compliance_narrative, deorbit_analysis, debris_assessment, recommendations. "
        "Each value must be a string of 3-5 detailed sentences."
    )

    # Build detailed user prompt with all available data
    compliance_results = req.compliance.get('results', [])
    compliance_text = ""
    for r in compliance_results:
        if isinstance(r, dict):
            compliance_text += f"  - {r.get('framework', '?')}: {r.get('status', '?')} — {r.get('reason', '')}\n"

    user_prompt = f"""Generate a mission compliance report for the following satellite:

SATELLITE DATA:
- Name: {req.sat_data.get('name', 'Unknown')}
- NORAD ID: {req.sat_data.get('norad_id', 'Unknown')}
- Altitude: {req.sat_data.get('altitude', 'Unknown')} km
- Inclination: {req.sat_data.get('inclination', 'Unknown')}°
- Eccentricity: {req.sat_data.get('eccentricity', 'Unknown')}
- Apogee: {req.sat_data.get('apogee', 'Unknown')} km
- Perigee: {req.sat_data.get('perigee', 'Unknown')} km
- Orbital Period: {req.sat_data.get('period', 'Unknown')} min
- Country: {req.sat_data.get('country', 'Unknown')}
- Operator: {req.sat_data.get('operator', 'Unknown')}
- Launch Date: {req.sat_data.get('launch_date', 'Unknown')}
- Status: {req.sat_data.get('status', 'Unknown')}

COMPLIANCE RESULTS:
{compliance_text}

DEORBIT PREDICTION:
- Deterministic: {req.deorbit.get('years_deterministic', 'N/A')} years
- Monte Carlo Mean: {req.deorbit.get('years_mean', 'N/A')} years
- 95% CI: {req.deorbit.get('confidence_interval_95', 'N/A')} years
- IADC Compliant: {req.deorbit.get('iadc_compliant', 'N/A')}
- FCC Compliant: {req.deorbit.get('fcc_compliant', 'N/A')}

DEBRIS RISK:
- Fragmentation Probability: {req.debris.get('frag_prob', 'N/A')}
- Annual Collision Probability: {req.debris.get('collision_prob_annual', 'N/A')}
- Overall Risk Level: {req.debris.get('overall_risk_level', 'N/A')}
- Overall Risk Score: {req.debris.get('overall_risk_score', 'N/A')}

RELEVANT POLICY CONTEXT (from RAG retrieval):
{chr(10).join(policy_chunks) if policy_chunks else 'No policy context available.'}
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        content = chat_completion.choices[0].message.content
        response_json = json.loads(content)
        return ReportText(**response_json)

    except json.JSONDecodeError as e:
        return ReportText(
            executive_summary=f"Report generation produced invalid JSON: {str(e)[:100]}",
            compliance_narrative="Please retry the report generation.",
            deorbit_analysis="N/A",
            debris_assessment="N/A",
            recommendations="Retry report generation.",
        )
    except Exception as e:
        return ReportText(
            executive_summary=f"Report generation failed: {str(e)[:200]}",
            compliance_narrative="An error occurred during LLM processing.",
            deorbit_analysis="N/A",
            debris_assessment="N/A",
            recommendations="Check API key and try again.",
        )


def generate_pdf(sat_name: str, report: ReportText, sat_data: dict = None,
                 compliance_data: dict = None, deorbit_data: dict = None,
                 debris_data: dict = None) -> bytes:
    """
    Generate a professional multi-page PDF report using ReportLab.
    Handles text wrapping, tables, and multiple sections properly.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )

    # Custom styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=22, spaceAfter=4, textColor=HexColor('#00C2FF'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'CustomSubtitle', parent=styles['Normal'],
        fontSize=12, textColor=HexColor('#666666'),
        spaceAfter=20
    )
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'],
        fontSize=14, spaceBefore=16, spaceAfter=8,
        textColor=HexColor('#0057FF'), fontName='Helvetica-Bold'
    )
    body_style = ParagraphStyle(
        'CustomBody', parent=styles['Normal'],
        fontSize=10, leading=14, spaceAfter=8,
        textColor=HexColor('#333333')
    )
    mono_style = ParagraphStyle(
        'MonoStyle', parent=styles['Normal'],
        fontSize=9, fontName='Courier', leading=12,
        textColor=HexColor('#444444')
    )

    story = []

    # ── Cover section ──
    story.append(Paragraph("ORBITLEX", title_style))
    story.append(Paragraph("Mission Compliance &amp; Debris Impact Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#00C2FF')))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Satellite: <b>{sat_name}</b>", body_style))
    story.append(Paragraph(f"Report Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", body_style))
    story.append(Paragraph("Classification: <i>Official / Restricted</i>", body_style))
    story.append(Spacer(1, 24))

    # ── Orbital Parameters Table ──
    if sat_data:
        story.append(Paragraph("Orbital Parameters", heading_style))
        param_data = [
            ["Parameter", "Value"],
            ["Altitude", f"{sat_data.get('altitude', 'N/A')} km"],
            ["Inclination", f"{sat_data.get('inclination', 'N/A')}°"],
            ["Eccentricity", f"{sat_data.get('eccentricity', 'N/A')}"],
            ["Apogee", f"{sat_data.get('apogee', 'N/A')} km"],
            ["Perigee", f"{sat_data.get('perigee', 'N/A')} km"],
            ["Period", f"{sat_data.get('period', 'N/A')} min"],
            ["Country", f"{sat_data.get('country', 'N/A')}"],
            ["Operator", f"{sat_data.get('operator', 'N/A')}"],
            ["Status", f"{sat_data.get('status', 'N/A')}"],
        ]
        t = Table(param_data, colWidths=[2.5 * inch, 4 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#0057FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#F8F8F8'), HexColor('#FFFFFF')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 16))

    # ── Compliance Table ──
    if compliance_data and compliance_data.get('results'):
        story.append(Paragraph("Compliance Matrix", heading_style))
        comp_rows = [["Framework", "Status", "Assessment"]]
        for r in compliance_data['results']:
            if isinstance(r, dict):
                comp_rows.append([
                    r.get('framework', ''),
                    r.get('status', ''),
                    r.get('reason', '')[:80],
                ])
        if len(comp_rows) > 1:
            t = Table(comp_rows, colWidths=[1.5 * inch, 1.2 * inch, 3.8 * inch])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#0057FF')),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#F8F8F8'), HexColor('#FFFFFF')]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t)
            story.append(Spacer(1, 16))

    # ── AI-Generated Sections ──
    sections = [
        ("Executive Summary", report.executive_summary),
        ("Compliance Narrative", report.compliance_narrative),
        ("Deorbit Analysis", report.deorbit_analysis),
        ("Debris Assessment", report.debris_assessment),
        ("Recommendations", report.recommendations),
    ]

    for title, content in sections:
        if content and content.strip() and content.strip() != "N/A":
            story.append(Paragraph(title, heading_style))
            # Wrap long text properly
            for para in content.split('\n'):
                para = para.strip()
                if para:
                    story.append(Paragraph(para, body_style))
            story.append(Spacer(1, 8))

    # ── Deorbit Summary ──
    if deorbit_data:
        story.append(Paragraph("Deorbit Prediction Summary", heading_style))
        deorbit_rows = [
            ["Metric", "Value"],
            ["Deterministic", f"{deorbit_data.get('years_deterministic', 'N/A')} years"],
            ["Monte Carlo Mean", f"{deorbit_data.get('years_mean', 'N/A')} years"],
            ["95% CI", f"{deorbit_data.get('confidence_interval_95', 'N/A')}"],
            ["IADC Compliant", str(deorbit_data.get('iadc_compliant', 'N/A'))],
            ["FCC Compliant", str(deorbit_data.get('fcc_compliant', 'N/A'))],
        ]
        t = Table(deorbit_rows, colWidths=[2.5 * inch, 4 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#0057FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#F8F8F8'), HexColor('#FFFFFF')]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 16))

    # ── Footer ──
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#CCCCCC')))
    story.append(Spacer(1, 8))
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, textColor=HexColor('#999999'), alignment=TA_CENTER
    )
    story.append(Paragraph(
        f"Generated by OrbitLex AI • {datetime.utcnow().strftime('%Y-%m-%d')} • "
        "This report is auto-generated and should be reviewed by qualified personnel.",
        footer_style
    ))

    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
