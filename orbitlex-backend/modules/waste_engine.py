from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Literal, Optional


WasteCategory = Literal[
    "plastic",
    "metal",
    "paper",
    "glass",
    "e-waste",
    "organic",
    "mixed",
    "unknown",
]

HazardFlag = Literal["battery", "solvent/chemical", "unknown_hazard"]

ConditionQuality = Literal["unknown", "good", "moderate", "poor"]


@dataclass(frozen=True)
class WasteClassification:
    category: WasteCategory
    subtype: str
    contamination_risk: Literal["low", "medium", "high"]
    hazard_flags: list[HazardFlag]
    condition_quality: ConditionQuality
    confidence: float  # 0..1


def _normalize_text(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def _infer_from_description(description: str) -> dict:
    text = _normalize_text(description)

    hazard_flags: list[HazardFlag] = []
    if any(k in text for k in ["battery", "li-ion", "lithium", "power pack"]):
        hazard_flags.append("battery")
    if any(k in text for k in ["solvent", "chemical", "paint", "pesticide", "thinner"]):
        hazard_flags.append("solvent/chemical")
    if not hazard_flags and any(k in text for k in ["unknown", "hazard", "leak", "corrosion"]):
        hazard_flags.append("unknown_hazard")

    contamination_risk: Literal["low", "medium", "high"] = "low"
    if any(k in text for k in ["food", "grease", "oil", "stained", "dirty"]):
        contamination_risk = "high"
    elif any(k in text for k in ["lightly soiled", "smudged", "residue"]):
        contamination_risk = "medium"

    condition_quality: ConditionQuality = "unknown"
    if any(k in text for k in ["working", "functional", "intact", "no damage", "undamaged", "clean", "new"]):
        condition_quality = "good"
    elif any(k in text for k in ["used", "worn", "scratched", "scuffed", "minor damage", "tested ok"]):
        condition_quality = "moderate"
    elif any(k in text for k in ["broken", "cracked", "damaged", "leaking", "leak", "burnt", "corroded", "rust", "not working"]):
        condition_quality = "poor"

    subtype = "General"
    if "pet" in text or "bottle" in text:
        subtype = "PET (bottle-grade)"
    elif "hdpe" in text:
        subtype = "HDPE (container-grade)"
    elif any(k in text for k in ["aluminum", "alu", "can"]):
        subtype = "Aluminum (can/scrap)"
    elif any(k in text for k in ["steel", "iron"]):
        subtype = "Ferrous metal (steel/iron)"
    elif any(k in text for k in ["paperboard", "cardboard", "box"]):
        subtype = "Cardboard/Paperboard"
    elif any(k in text for k in ["newspaper"]):
        subtype = "Newspaper/Paper"
    elif any(k in text for k in ["bottle", "jar", "glass"]):
        subtype = "Glass container"
    elif any(k in text for k in ["phone", "laptop", "tablet", "pcb", "charger", "wires"]):
        subtype = "Electronics + components"
    elif any(k in text for k in ["food", "leftovers", "organic"]):
        subtype = "Organics (biowaste)"

    return {
        "contamination_risk": contamination_risk,
        "hazard_flags": hazard_flags,
        "subtype_guess": subtype,
        "condition_quality": condition_quality,
    }


def classify_waste(material: str, description: str | None = None) -> WasteClassification:
    material_norm = _normalize_text(material)
    desc = description or ""
    desc_info = _infer_from_description(desc)

    mapping: dict[str, WasteCategory] = {
        "plastic": "plastic",
        "metal": "metal",
        "paper": "paper",
        "glass": "glass",
        "e-waste": "e-waste",
        "ewaste": "e-waste",
        "electronics": "e-waste",
        "organic": "organic",
        "compost": "organic",
        "mixed": "mixed",
        "unknown": "unknown",
    }

    category: WasteCategory = mapping.get(material_norm, "unknown")  # default safe fallback
    subtype = desc_info["subtype_guess"] if desc else "General"
    condition_quality = desc_info["condition_quality"]

    # Confidence drops if the material selection is "mixed"/"unknown".
    base_conf = 0.85 if category not in ("mixed", "unknown") else 0.55
    # Increase confidence if description gives strong cues (hazards/subtype).
    if desc_info["hazard_flags"] or ("bottle" in _normalize_text(desc) or "pcb" in _normalize_text(desc)):
        base_conf += 0.08
    if condition_quality != "unknown":
        # Condition cues increase overall confidence for recovery/reuse decisions.
        base_conf += 0.05
    base_conf = min(base_conf, 0.95)

    return WasteClassification(
        category=category,
        subtype=subtype,
        contamination_risk=desc_info["contamination_risk"],
        hazard_flags=desc_info["hazard_flags"],
        condition_quality=condition_quality,
        confidence=round(base_conf, 2),
    )


def get_sorting_and_segregation(classification: WasteClassification) -> dict:
    c = classification.category
    cont = classification.contamination_risk
    hazards = classification.hazard_flags
    condition = classification.condition_quality

    steps: list[str] = []
    bins: list[str] = []

    steps.append("Wear appropriate PPE where required (especially for sharp/hazardous fractions).")
    steps.append("Remove visible contaminants (food residues, liquids, coatings) where feasible.")

    if c in ("paper", "plastic"):
        if cont == "high":
            steps.append("Because contamination is high, divert to lower-grade recovery or safe disposal per local rules.")
        else:
            steps.append("Ensure items are dry before placing into the recycling stream to reduce rejection.")

    if "battery" in hazards:
        steps.append("Safely segregate batteries from the e-waste stream; tape terminals if applicable.")
        bins.append("Battery collection (separate hazardous stream)")

    if c == "e-waste":
        steps.append("Separate devices from accessories (chargers/cables) to improve safe treatment.")
        bins.append("WEEE/e-waste container (hazardous-handling compliant)")

    if c == "metal":
        steps.append("Remove non-metal attachments and keep ferrous/non-ferrous separated when possible.")
        bins.append("Metal recycling stream (scrap sorting)")

    if c == "glass":
        steps.append("Rinse to remove residues; separate by color only if your facility requires it.")
        bins.append("Glass cullet stream")

    if c == "organic":
        steps.append("Keep biowaste free from plastics/metal contamination to avoid compost rejection.")
        bins.append("Organics/biowaste bin")

    if c == "mixed":
        steps.append("For mixed waste, prioritize recovery by separating dominant fractions if known.")
        bins.append("Mixed residual stream (best-effort sorting at facility)")

    if condition == "poor":
        steps.append("Because item condition appears poor, divert uncertain fractions to certified treatment rather than direct recycling streams.")

    if not bins:
        bins.append("Local recycling stream (as defined by region and facility)")

    return {
        "predicted_material_class": c,
        "subtype": classification.subtype,
        "segregation_steps": steps,
        "recommended_bins": bins,
    }


def get_technology_recommendations(classification: WasteClassification) -> dict:
    c = classification.category
    cont = classification.contamination_risk
    hazards = classification.hazard_flags

    technologies: list[str] = []
    safety_notes: list[str] = []

    if c == "metal":
        technologies = [
            "Pre-sorting (manual/optical) and removal of non-metal contaminants.",
            "Shredding and size classification for scrap processing.",
            "Magnetic separation (ferrous) and eddy-current separation (non-ferrous).",
            "Smelting or refining depending on metal composition and local infrastructure.",
        ]
        safety_notes = [
            "Use cut-resistant gloves; sharp edges are common in scrap.",
            "Separate hazardous coatings/painted metals where required by local rules.",
        ]

    elif c == "plastic":
        technologies = [
            "Sorting by resin type (where available) to avoid cross-contamination.",
            "Washing + separation to remove residues and labels.",
            "Mechanical recycling (re-melting/extrusion) for clean thermoplastics.",
            "Chemical recycling options for hard-to-recycle polymers (where permitted).",
        ]
        safety_notes = [
            "Minimize dust exposure during shredding; confirm facility PPE controls.",
            "High-contamination plastics may be better directed to recovery with proper treatment.",
        ]
        if cont == "high":
            safety_notes.append("Because contamination is high, recycling yield may drop; follow facility guidance for rejection.")

    elif c == "paper":
        technologies = [
            "Pulping and fiber separation in controlled slurry systems.",
            "De-inking where required (toner/ink removal).",
            "Reforming into new paper products; contamination affects output quality.",
        ]
        safety_notes = [
            "Avoid mixing wet/greasy paper with the clean stream; it increases rejects and odors.",
            "Use ventilation during processing to limit dust exposure.",
        ]

    elif c == "glass":
        technologies = [
            "Crushing and grading into cullet sizes.",
            "Sorting (metals/ceramics removal) to protect furnace performance.",
            "Melting and remanufacturing into new glass products.",
        ]
        safety_notes = [
            "Glass edges can cause cuts; use cut-resistant gloves.",
            "Separate hazardous residues (e.g., chemical contamination) if present.",
        ]

    elif c == "e-waste":
        technologies = [
            "Secure intake and initial triage (remove batteries and hazardous modules).",
            "Dismantling to recover reusable components and extract valuable materials.",
            "Mechanical shredding with dust capture for downstream separation.",
            "Smelting/hydrometallurgy routes for metal recovery (facility dependent).",
            "Refurbishment pathway when devices are functional or reparable.",
        ]
        safety_notes = [
            "E-waste often contains hazardous substances; only use certified facilities and procedures.",
            "Treat batteries as hazardous fractions; avoid crushing lithium packs.",
            "Control fumes/dust during thermal/mechanical steps.",
        ]
        if hazards:
            safety_notes.append(f"Hazard flags detected: {', '.join(hazards)}.")

    elif c == "organic":
        technologies = [
            "Composting (aerobic) for source-separated biowaste.",
            "Anaerobic digestion for biogas recovery in suitable systems.",
            "Quality checks to avoid plastic contamination in output.",
        ]
        safety_notes = [
            "Handle with hygiene practices; biowaste can contain pathogens.",
            "Ensure facility compliance for odor/leachate control.",
        ]

    elif c == "mixed":
        technologies = [
            "Facility-level sorting (NIR/optical, magnets, screening) to recover fractions.",
            "Residual treatment/disposal for non-recoverable portions.",
        ]
        safety_notes = ["Mixed waste can contain hidden hazardous fractions; rely on facility triage."]

    else:
        technologies = ["Local certified recycler triage and best-effort recovery."]
        safety_notes = ["Provide clear handling notes to the facility; follow local hazardous waste guidance."]

    return {
        "technology_steps": technologies,
        "safety_notes": safety_notes,
    }


def _range(mid: float, spread: float) -> tuple[float, float]:
    return max(0.0, mid - spread), min(1.0, mid + spread)


def get_recovery_estimates(
    classification: WasteClassification, weight_kg: Optional[float] = None
) -> dict:
    c = classification.category
    cont = classification.contamination_risk
    condition_quality = classification.condition_quality

    # Base expected fractions (midpoints); refined by contamination risk.
    if c == "metal":
        rec_mid, rec_spread = 0.92, 0.06
        reuse_mid, reuse_spread = 0.18, 0.10
    elif c == "paper":
        rec_mid, rec_spread = 0.72, 0.10
        reuse_mid, reuse_spread = 0.08, 0.06
    elif c == "plastic":
        rec_mid, rec_spread = 0.45, 0.18
        reuse_mid, reuse_spread = 0.09, 0.06
    elif c == "glass":
        rec_mid, rec_spread = 0.82, 0.08
        reuse_mid, reuse_spread = 0.12, 0.07
    elif c == "e-waste":
        rec_mid, rec_spread = 0.60, 0.16
        reuse_mid, reuse_spread = 0.26, 0.12
    elif c == "organic":
        rec_mid, rec_spread = 0.70, 0.18
        reuse_mid, reuse_spread = 0.04, 0.04
    elif c == "mixed":
        rec_mid, rec_spread = 0.25, 0.15
        reuse_mid, reuse_spread = 0.06, 0.06
    else:
        rec_mid, rec_spread = 0.20, 0.15
        reuse_mid, reuse_spread = 0.05, 0.05

    # Contamination penalizes paper/plastics more strongly.
    contamination_penalty = 0.0
    if cont == "medium":
        contamination_penalty = 0.08
    elif cont == "high":
        contamination_penalty = 0.18

    if c in ("paper", "plastic"):
        rec_mid = max(0.05, rec_mid - contamination_penalty)
        reuse_mid = max(0.02, reuse_mid - contamination_penalty / 2)

    # Item condition impacts reuse readiness and (slightly) recovery yield.
    if condition_quality == "good":
        if c in ("e-waste", "metal", "glass"):
            reuse_mid = min(0.98, reuse_mid + 0.08)
        if c in ("paper", "plastic"):
            rec_mid = min(0.98, rec_mid + 0.03)
    elif condition_quality == "poor":
        if c in ("e-waste", "metal", "glass"):
            reuse_mid = max(0.01, reuse_mid - 0.07)
        if c in ("paper", "plastic"):
            rec_mid = max(0.05, rec_mid - 0.05)

    rec_lo, rec_hi = _range(rec_mid, rec_spread)
    reuse_lo, reuse_hi = _range(reuse_mid, reuse_spread)

    def pct(x: float) -> float:
        return round(x * 100.0, 1)

    weight_kg = float(weight_kg) if weight_kg is not None else None
    recyclable_kg_range = None
    reusable_kg_range = None
    if weight_kg is not None:
        recyclable_kg_range = [round(weight_kg * rec_lo, 2), round(weight_kg * rec_hi, 2)]
        reusable_kg_range = [round(weight_kg * reuse_lo, 2), round(weight_kg * reuse_hi, 2)]

    return {
        "recyclable_fraction_pct_range": [pct(rec_lo), pct(rec_hi)],
        "reusable_fraction_pct_range": [pct(reuse_lo), pct(reuse_hi)],
        "recyclable_kg_range": recyclable_kg_range,
        "reusable_kg_range": reusable_kg_range,
        "pathways": [
            "Material recycling (material recovery) where quality allows.",
            "Refurbishment / reuse pathway when the item/component remains functional.",
            "Recovery with certified treatment for fractions that cannot be directly recycled.",
        ],
    }

