from __future__ import annotations

import json
import os
from typing import Optional, Any

from groq import Groq

from modules.waste_engine import (
    WasteClassification,
    WasteCategory,
    HazardFlag,
    ConditionQuality,
)
from modules.waste_rag import waste_rag_system


def _coerce_category(x: Any) -> WasteCategory:
    allowed = {"plastic", "metal", "paper", "glass", "e-waste", "organic", "mixed", "unknown"}
    v = str(x or "").strip().lower()
    if v == "ewaste":
        v = "e-waste"
    if v not in allowed:
        return "unknown"
    return v  # type: ignore[return-value]


def _coerce_hazards(x: Any) -> list[HazardFlag]:
    allowed: set[str] = {"battery", "solvent/chemical", "unknown_hazard"}
    if not x:
        return []
    if isinstance(x, list):
        raw = x
    else:
        raw = [x]
    out: list[HazardFlag] = []
    for item in raw:
        s = str(item).strip().lower()
        if s == "unknown":
            s = "unknown_hazard"
        if s in allowed:
            out.append(s)  # type: ignore[arg-type]
    return out


def _coerce_condition_quality(x: Any) -> ConditionQuality:
    allowed: set[str] = {"unknown", "good", "moderate", "poor"}
    v = str(x or "").strip().lower()
    if v not in allowed:
        return "unknown"
    return v  # type: ignore[return-value]


def enrich_classification_llm(
    *,
    material: str,
    description: Optional[str],
    region: str,
    fallback: WasteClassification,
) -> WasteClassification:
    """
    LLM-based NLP enrichment for uncertain/ambiguous inputs.

    Output is structured JSON coerced into WasteClassification.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        # Hard fail is undesirable for a "best-effort" enrichment step.
        return fallback

    client = Groq(api_key=api_key)

    query = f"Waste classification, sorting safety, and reuse readiness for material={material} description={description} region={region}"
    policy_chunks = waste_rag_system.retrieve(query, k=5)

    system_prompt = (
        "You are OrbitLex AI, a waste segregation and circularity expert. "
        "Infer a structured waste classification for the user input.\n"
        "Rules:\n"
        "- Use ONLY the following categories: plastic, metal, paper, glass, e-waste, organic, mixed, unknown.\n"
        "- contamination_risk must be one of: low, medium, high.\n"
        "- hazard_flags must be any subset of: battery, solvent/chemical, unknown_hazard.\n"
        "- condition_quality must be one of: good, moderate, poor.\n"
        "- confidence must be a number 0..1.\n"
        "- Return ONLY valid JSON (no markdown) with keys:\n"
        "{\n"
        "  \"category\": string,\n"
        "  \"subtype\": string,\n"
        "  \"contamination_risk\": \"low\"|\"medium\"|\"high\",\n"
        "  \"hazard_flags\": [\"battery\"|\"solvent/chemical\"|\"unknown_hazard\"],\n"
        "  \"condition_quality\": \"good\"|\"moderate\"|\"poor\",\n"
        "  \"confidence\": number\n"
        "}\n"
        "Ground your guidance in the provided policy chunks.\n"
    )

    user_payload = {
        "material": material,
        "description": description,
        "region": region,
        "heuristic_fallback": {
            "category": fallback.category,
            "subtype": fallback.subtype,
            "contamination_risk": fallback.contamination_risk,
            "hazard_flags": fallback.hazard_flags,
            "condition_quality": fallback.condition_quality,
            "confidence": fallback.confidence,
        },
        "retrieved_policy_chunks": policy_chunks,
    }

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.15,
        response_format={"type": "json_object"},
    )

    response_json = json.loads(chat_completion.choices[0].message.content)

    category = _coerce_category(response_json.get("category"))
    subtype = str(response_json.get("subtype") or fallback.subtype)
    contamination_risk = str(response_json.get("contamination_risk") or fallback.contamination_risk).lower().strip()
    if contamination_risk not in {"low", "medium", "high"}:
        contamination_risk = fallback.contamination_risk
    hazard_flags = _coerce_hazards(response_json.get("hazard_flags"))
    condition_quality = _coerce_condition_quality(response_json.get("condition_quality"))
    confidence_raw = response_json.get("confidence", fallback.confidence)
    try:
        confidence = float(confidence_raw)
    except Exception:
        confidence = fallback.confidence
    confidence = max(0.0, min(1.0, confidence))

    return WasteClassification(
        category=category,
        subtype=subtype,
        contamination_risk=contamination_risk,  # type: ignore[arg-type]
        hazard_flags=hazard_flags,
        condition_quality=condition_quality,
        confidence=round(confidence, 2),
    )

