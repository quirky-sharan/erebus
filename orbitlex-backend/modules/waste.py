from __future__ import annotations

from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field

from modules.waste_engine import (
    classify_waste,
    get_sorting_and_segregation,
    get_technology_recommendations,
    get_recovery_estimates,
)
from modules.waste_report import generate_waste_narrative
from modules.waste_engine import WasteClassification
from modules.waste_nlp import enrich_classification_llm


class WasteAnalyzeRequest(BaseModel):
    material: str = Field(..., description="Manual material selection (e.g., metal, plastic, paper, e-waste)")
    description: Optional[str] = Field(None, description="Free-text description of the item condition/contents")
    weight_kg: Optional[float] = Field(None, ge=0, description="Estimated weight in kilograms (optional)")
    region: str = Field("Global", description="Region/jurisdiction for compliance guidance")


class WasteAnalyzeResponse(BaseModel):
    classification: Dict[str, Any]
    segregation: Dict[str, Any]
    technologies: Dict[str, Any]
    recovery_estimates: Dict[str, Any]
    consumer_awareness: Dict[str, Any]
    policy_compliance: Dict[str, Any]
    circular_product_design: Dict[str, Any]


def analyze_waste(req: WasteAnalyzeRequest) -> WasteAnalyzeResponse:
    classification = classify_waste(req.material, req.description or "")

    # Priority-1 AI/NLP improvement:
    # If the heuristic is uncertain/ambiguous, use an LLM-enrichment step that is
    # grounded with RAG policy chunks.
    needs_ai = (
        classification.confidence < 0.72
        or classification.category in ("unknown", "mixed")
        or (req.description and len(req.description) > 60)
    )
    if needs_ai:
        try:
            classification = enrich_classification_llm(
                material=req.material,
                description=req.description,
                region=req.region,
                fallback=classification,
            )
        except Exception:
            # Best-effort: keep heuristic output on any enrichment failure.
            pass

    segregation = get_sorting_and_segregation(classification)
    techs = get_technology_recommendations(classification)
    recovery = get_recovery_estimates(classification, req.weight_kg)

    narrative = generate_waste_narrative(
        material=req.material,
        description=req.description,
        region=req.region,
        classification=classification,
        segregation=segregation,
        techs=techs,
        recovery=recovery,
    )

    return WasteAnalyzeResponse(
        classification={
            "category": classification.category,
            "subtype": classification.subtype,
            "contamination_risk": classification.contamination_risk,
            "hazard_flags": classification.hazard_flags,
            "condition_quality": classification.condition_quality,
            "confidence": classification.confidence,
        },
        segregation=segregation,
        technologies=techs,
        recovery_estimates=recovery,
        consumer_awareness=narrative["consumer_awareness"],
        policy_compliance=narrative["policy_compliance"],
        circular_product_design=narrative["circular_product_design"],
    )

