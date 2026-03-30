"""
Open-source inspired policy guidance text for the waste/recycling domain.

Notes:
- This project uses an in-memory FAISS index (no database, no disk persistence).
- The texts below are concise, paraphrased summaries meant for RAG grounding and
  demonstration; you should replace/extend them with the exact text you want to
  cite for production use.
"""

BASELINE_WASTE_POLICY = """
Waste management principles:
1) Segregate waste at source to improve recycling yield and reduce contamination.
2) Protect workers by treating hazardous fractions appropriately (PPE, safe handling,
   certified treatment facilities).
3) Use the waste hierarchy: prevention, reuse, recycling, recovery, disposal.
4) Track compliance obligations through documented procedures, audits, and reporting.
"""

EU_WEEE_POLICY = """
WEEE (Waste Electrical and Electronic Equipment) guidance:
- Separate collection for WEEE to enable controlled treatment.
- Dismantle to recover reusable components and handle hazardous substances
  (e.g., batteries, mercury switches, cathode-ray tubes) with specialized processes.
- Apply environmentally sound treatment to prevent release of pollutants.
- Producer responsibility frameworks often require collection and recycling targets.
"""

BASEL_HAZARDOUS_POLICY = """
Basel Convention high-level guidance:
- Hazardous waste must be identified and managed under controlled procedures.
- Cross-border movement requires documentation and compliance with applicable rules.
- Treat hazardous components separately to prevent contamination of recyclable streams.
"""

PACKAGING_EPR_POLICY = """
Packaging waste and EPR (Extended Producer Responsibility):
- Producers are responsible for funding collection, sorting, and recycling where applicable.
- Packaging systems typically require separate collection / labeling and reporting of recovery rates.
- Compliance is demonstrated through verifiable recycling/recovery figures and auditing.
"""

E_WASTE_UNIVERSAL_POLICY = """
E-waste safety and feasibility:
- Before processing, remove batteries and clearly segregate hazardous modules.
- Shredder-recovery lines must incorporate dust capture and hazardous fraction handling.
- Refurbishment and component-level reuse can outperform material recycling when feasible.
"""

EPR_GLOBAL_GUIDANCE = """
EPR (general):
- Define responsibilities, reporting cadence, targets, and verification methods.
- Maintain chain-of-custody / treatment documentation for audits.
"""

WASTE_POLICY_DOCS = {
    "baseline": BASELINE_WASTE_POLICY,
    "eu_ww": EU_WEEE_POLICY,
    "basel": BASEL_HAZARDOUS_POLICY,
    "epr_packaging": PACKAGING_EPR_POLICY,
    "e_waste_safety": E_WASTE_UNIVERSAL_POLICY,
    "epr_global": EPR_GLOBAL_GUIDANCE,
}

