from __future__ import annotations

import json
import os
from dataclasses import asdict
from typing import Any, Optional

from groq import Groq

from modules.waste_engine import WasteClassification
from modules.waste_rag import waste_rag_system


class WasteAnalysisLLMResponse:
    """
    This is intentionally lightweight; we return raw dicts from the endpoint
    after validating JSON shape at the caller.
    """


def _coerce_list(x: Any) -> list[str]:
    if isinstance(x, list):
        return [str(i) for i in x]
    return [str(x)]


def generate_waste_narrative(
    *,
    material: str,
    description: Optional[str],
    region: str,
    classification: WasteClassification,
    segregation: dict,
    techs: dict,
    recovery: dict,
) -> dict:
    """
    Use Groq + RAG to generate:
    - Consumer awareness + incentivization copy
    - Policy/compliance checklist grounded in retrieved policy chunks
    - Circular product design recommendations
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise Exception("Missing GROQ_API_KEY in environment")

    client = Groq(api_key=api_key)

    query = f"Waste recycling policy compliance and circular design for {material} in {region}"
    policy_chunks = waste_rag_system.retrieve(query, k=5)

    system_prompt = (
        "You are OrbitLex AI, an expert in circularity, waste compliance, and safe recycling technologies. "
        "Generate professional, technically accurate, concise outputs. "
        "You must base compliance guidance on the provided policy chunks. "
        "Use metric units. Return ONLY valid JSON (no markdown) with this exact shape:\n"
        "{\n"
        "  \"consumer_awareness\": {\n"
        "    \"points_award\": integer,\n"
        "    \"why_points\": string,\n"
        "    \"program_suggestion\": string\n"
        "  },\n"
        "  \"policy_compliance\": {\n"
        "    \"region\": string,\n"
        "    \"verdict\": string,\n"
        "    \"checklist\": [string],\n"
        "    \"policy_sources\": [string]\n"
        "  },\n"
        "  \"circular_product_design\": {\n"
        "    \"design_guidelines\": [string],\n"
        "    \"reuse_strategy\": string\n"
        "  }\n"
        "}\n"
    )

    user_payload = {
        "material": material,
        "description": description,
        "region": region,
        "classification": asdict(classification),
        "segregation": segregation,
        "technologies": techs,
        "recovery_estimates": recovery,
        "retrieved_policy_chunks": policy_chunks,
    }

    user_prompt = f"Input:\n{json.dumps(user_payload, ensure_ascii=False)}"

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.25,
        response_format={"type": "json_object"},
    )

    response_json = json.loads(chat_completion.choices[0].message.content)

    # Light validation / coercion.
    consumer = response_json.get("consumer_awareness", {})
    policy = response_json.get("policy_compliance", {})
    circular = response_json.get("circular_product_design", {})

    consumer_awareness = {
        "points_award": int(consumer.get("points_award", 0)),
        "why_points": str(consumer.get("why_points", "")),
        "program_suggestion": str(consumer.get("program_suggestion", "")),
    }

    policy_compliance = {
        "region": str(policy.get("region", region)),
        "verdict": str(policy.get("verdict", "Needs review")),
        "checklist": _coerce_list(policy.get("checklist", [])),
        "policy_sources": _coerce_list(policy.get("policy_sources", policy_chunks)),
    }

    circular_product_design = {
        "design_guidelines": _coerce_list(circular.get("design_guidelines", [])),
        "reuse_strategy": str(circular.get("reuse_strategy", "")),
    }

    return {
        "consumer_awareness": consumer_awareness,
        "policy_compliance": policy_compliance,
        "circular_product_design": circular_product_design,
    }

