from typing import List, Optional
from pydantic import BaseModel
from modules.satellite import SatelliteData

class FrameworkResult(BaseModel):
    framework: str
    status: str
    reason: str
    rule_text: str

class ComplianceReport(BaseModel):
    results: List[FrameworkResult]

def check_compliance(sat: SatelliteData, deorbit_years: float) -> ComplianceReport:
    results = []

    # 1. IADC (Inter-Agency Space Debris Coordination Committee)
    iadc_status = "Compliant"
    iadc_reason = f"Deorbit predicted in {deorbit_years:.1f} years, within 25yr limit."
    if deorbit_years > 35:
        iadc_status = "Non-Compliant"
        iadc_reason = "Exceeds 25-year limit by more than 10 years."
    elif deorbit_years > 25:
        iadc_status = "At Risk"
        iadc_reason = "Predicting deorbit beyond 25-year limit."
    
    results.append(FrameworkResult(
        framework="IADC",
        status=iadc_status,
        reason=iadc_reason,
        rule_text="Post-mission orbital lifetime should not exceed 25 years."
    ))

    # 2. FCC (Federal Communications Commission)
    fcc_status = "N/A"
    fcc_reason = "Not applicable to this jurisdiction."
    if sat.country == "USA" or sat.operator == "SpaceX" or sat.operator == "Amazon":
        # Simplified: Check against 5-year rule for post-2022 US satellites
        fcc_status = "Compliant"
        fcc_reason = f"Within 5-year deorbit limit for US missions ({deorbit_years:.1f}yr)."
        if deorbit_years > 8:
            fcc_status = "Non-Compliant"
            fcc_reason = "Exceeds 5-year limit by more than 3 years."
        elif deorbit_years > 5:
            fcc_status = "At Risk"
            fcc_reason = "Exceeds new 5-year post-mission rule."
    
    results.append(FrameworkResult(
        framework="FCC",
        status=fcc_status,
        reason=fcc_reason,
        rule_text="Post-mission deorbit required within 5 years for US-licensed systems (2022 rule)."
    ))

    # 3. ESA Zero Debris Charter
    esa_status = "Compliant"
    esa_reason = "Complies with debris mitigation guidelines."
    if sat.altitude < 2000 and deorbit_years > 5:
        esa_status = "At Risk"
        esa_reason = "LEO satellite with deorbit beyond 5-year zero-debris target."
        if deorbit_years > 10:
            esa_status = "Non-Compliant"
            esa_reason = "Exceeds 5-year target by more than 5 years."
    
    results.append(FrameworkResult(
        framework="ESA Zero Debris",
        status=esa_status,
        reason=esa_reason,
        rule_text="LEO missions should target deorbit within 5 years by 2030."
    ))

    # 4. UN Outer Space Treaty (OST)
    # Most satellites are compliant unless they pose immediate liability or registration risk
    un_status = "Compliant"
    un_reason = "State party retains liability and registration."
    if sat.status == "DEBRIS":
        un_status = "Non-Compliant"
        un_reason = "Uncontrolled orbital debris; potential Article VII liability."
    
    results.append(FrameworkResult(
        framework="UN OST",
        status=un_status,
        reason=un_reason,
        rule_text="States are internationally liable for damage caused by their space objects."
    ))

    # 5. UN COPUOS
    # Includes debris mitigation and graveyard bands
    un_copuos_status = "Compliant"
    un_copuos_reason = "Follows COPUOS Space Debris Mitigation Guidelines."
    # Check for GEO graveyard violation (simplified)
    if 35586 < sat.altitude < 35986:
        un_copuos_status = "At Risk"
        un_copuos_reason = "Object located in critical GEO protection zone."

    results.append(FrameworkResult(
        framework="UN COPUOS",
        status=un_copuos_status,
        reason=un_copuos_reason,
        rule_text="Preserve outer space for future generations through mitigation."
    ))

    return ComplianceReport(results=results)
