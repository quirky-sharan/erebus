"""
Comprehensive policy documents for the OrbitLex RAG system.
Each document is structured with specific articles, dates, and regulatory text
to enable high-quality retrieval-augmented generation.
"""

IADC_POLICY = """
INTER-AGENCY SPACE DEBRIS COORDINATION COMMITTEE (IADC)
Space Debris Mitigation Guidelines
Originally adopted: October 2002. Revised: September 2007 (IADC-02-01 Rev.1).

SECTION 1 — PURPOSE AND SCOPE
The IADC Space Debris Mitigation Guidelines describe the measures to be taken in the planning, design, manufacture,
and operational phases of spacecraft and launch vehicle orbital stages to limit debris generation.
These guidelines apply to all spacecraft and orbital stages operating in near-Earth space.

SECTION 2 — DEFINITIONS
Space debris: All man-made objects, including fragments and elements thereof, in Earth orbit or re-entering the
atmosphere, that are non-functional. This includes decommissioned satellites, spent rocket bodies, mission-related
debris (e.g. lens caps, deployment mechanisms), and fragmentation debris from explosions or collisions.
Protected regions: LEO region (below 2,000 km altitude), GEO region (geostationary orbit ± 200 km altitude, ± 15° latitude).

SECTION 3 — MITIGATION MEASURES
Guideline 1: Limit debris released during normal operations.
All mission-related objects should be designed to remain attached to the spacecraft or launch vehicle during and after
the operational phase. If separation is necessary, the objects should be designed for controlled de-orbit.

Guideline 2: Minimize the potential for on-orbit break-ups.
Passivation of all energy sources (fuel, batteries, pressure vessels, momentum wheels) is required at end of mission.
Intentional destruction is strongly discouraged except for safety purposes.

Guideline 3: Post-mission disposal — LEO.
Spacecraft and orbital stages that have completed their mission in the LEO protected region should be de-orbited
in a controlled manner or placed in an orbit such that the remaining orbital lifetime does not exceed 25 years.
The 25-year rule is the cornerstone of post-mission disposal for LEO objects.

Guideline 4: Post-mission disposal — GEO.
Spacecraft in or near the GEO protected region should be maneuvered to a graveyard/super-synchronous orbit at
least 200 km above the GEO altitude (approximately 35,986 km). This re-orbiting should occur before the spacecraft
runs out of fuel needed for the maneuver.

Guideline 5: Prevention of on-orbit collisions.
Conjunction assessment and collision avoidance maneuvers should be performed when the probability of collision
exceeds an acceptable threshold (typically 1e-4 for LEO objects).

SECTION 4 — APPLICABILITY
These guidelines apply to all member agencies: ASI (Italy), CNES (France), CNSA (China), CSA (Canada),
DLR (Germany), ESA (Europe), ISRO (India), JAXA (Japan), KARI (Korea), NASA (USA), ROSCOSMOS (Russia),
SSAU (Ukraine), UKSA (UK). Non-member states are encouraged to adopt equivalent measures.
"""

FCC_POLICY = """
FEDERAL COMMUNICATIONS COMMISSION (FCC)
Orbital Debris Mitigation Rules — 47 CFR Part 25
Second Report and Order (FCC 22-74), adopted September 29, 2022.

RULE SUMMARY — 5-YEAR DEORBIT REQUIREMENT
The FCC adopted a rule requiring all satellites in or passing through low Earth orbit (LEO) to deorbit no later
than five (5) years after the end of their mission. This replaces the previous 25-year guideline.

SECTION 25.114(d)(14) — Post-Mission Disposal Plan
Applicants must submit a detailed post-mission disposal plan including:
(i) Planned disposal method (controlled deorbit, atmospheric reentry, or graveyard orbit).
(ii) Expected time from end of mission to disposal completion.
(iii) Amount of fuel reserved for disposal maneuver.
(iv) Casualty risk assessment for uncontrolled reentry (must be < 1:10,000).

SECTION 25.114(d)(14)(iv) — 5-Year Rule
For satellites authorized after the effective date of this rule:
LEO satellites must complete post-mission disposal within 5 years of end of mission.
This applies to all U.S.-licensed satellites AND foreign-licensed satellites seeking U.S. market access.
The rule took effect for new applications 2 years after publication (approximately September 2024).

SECTION 25.283 — End-of-Life Disposal
(a) A space station licensee must, upon completion of its mission, either:
    (1) Remove the satellite from orbit by atmospheric reentry, or
    (2) Maneuver to a disposal orbit meeting applicable guidelines.
(b) The licensee must notify the Commission upon completion of disposal.

APPLICABILITY CRITERIA
This rule applies when ANY of the following conditions are met:
- The satellite is licensed by the United States (FCC license holder).
- The satellite operator is a US-based entity (SpaceX, Amazon/Kuiper, Viasat, etc.).
- A foreign satellite is seeking access to the US market for communications services.
- The satellite's country of registration is the United States.

ENFORCEMENT
Non-compliance may result in: license revocation, denial of market access, financial penalties,
and/or conditions on future authorizations. The FCC may coordinate with other agencies for enforcement.
"""

ESA_POLICY = """
EUROPEAN SPACE AGENCY (ESA)
Zero Debris Charter
Adopted: November 2022 at ESA Ministerial Council.

CHARTER COMMITMENTS
ESA commits to achieving zero debris generation from new ESA missions by 2030.

Commitment 1: Post-Mission Disposal
All LEO missions: Complete post-mission disposal within 5 years of end of operational life.
All GEO missions: Re-orbit to graveyard orbit compliant with IADC guidelines.
All other orbits: Adopt disposal strategies minimizing long-term debris risk.

Commitment 2: Active Debris Removal (ADR)
ESA will invest in and deploy active debris removal technologies to clean up existing debris.
The ClearSpace-1 mission (planned for 2026) will demonstrate ADR by capturing a Vega upper stage (VESPA).

Commitment 3: Design for Demise
Spacecraft materials and components shall be designed to fully demise during atmospheric reentry.
Target: Zero casualty risk on ground. All components must ablate completely or survive at < 15 J kinetic energy.

Commitment 4: Passivation
Complete passivation of all energy sources within 1 month of end of operational life.
This includes: fuel venting, battery discharge, pressurized system release, and momentum wheel spin-down.

Commitment 5: Collision Avoidance
Implement automated collision avoidance systems for all missions in congested orbital regions.
Threshold: Perform avoidance maneuver if collision probability exceeds 1e-4 per conjunction.

ESA CLEAN SPACE INITIATIVE
ESA's Clean Space initiative includes the Space Debris Mitigation requirements (ESSB-ST-U-007)
that apply to all ESA missions. Key requirements include:
- Reliability threshold for post-mission disposal: > 0.9 (90% probability of successful disposal).
- If reliability < 0.9, ADR capability must be demonstrated or a dedicated ADR mission must be planned.

APPLICABILITY
Applies to: All ESA missions, ESA-contracted missions, and European operators voluntarily adopting the charter.
European countries with space agencies that have signed: France (CNES), Germany (DLR), Italy (ASI),
UK (UKSA), Spain (INTA), and others.
"""

UN_OST_POLICY = """
UNITED NATIONS OUTER SPACE TREATY (OST)
Treaty on Principles Governing the Activities of States in the Exploration and Use of Outer Space,
including the Moon and Other Celestial Bodies.
Effective: October 10, 1967. Signatories: 114 countries. Ratified by: 112 countries.

ARTICLE I — Freedom of Exploration
Outer space shall be free for exploration and use by all States without discrimination.

ARTICLE II — Non-Appropriation
Outer space is not subject to national appropriation by claim of sovereignty, by means of use or occupation.

ARTICLE III — International Law
Activities in outer space shall be carried on in accordance with international law,
including the Charter of the United Nations, in the interest of maintaining international peace and security.

ARTICLE IV — Peaceful Purposes
States Parties shall not place nuclear weapons or other weapons of mass destruction in orbit.
Military bases, installations, and fortifications on celestial bodies are forbidden.

ARTICLE V — Astronaut Rescue
States Parties shall provide all possible assistance to astronauts in distress.

ARTICLE VI — State Responsibility
States Parties to the Treaty shall bear international responsibility for national activities in outer space,
whether carried on by governmental agencies or by non-governmental entities.
Activities of non-governmental entities require authorization and continuing supervision by the appropriate State.

ARTICLE VII — Liability
Each State Party that launches or procures the launching of an object into outer space, and each State Party
from whose territory or facility an object is launched, is internationally liable for damage to another State Party
or to its natural or juridical persons.

ARTICLE VIII — Jurisdiction and Control
A State Party to the Treaty on whose registry an object launched into outer space is carried shall retain
jurisdiction and control over such object, and over any personnel thereof, while in outer space or on a celestial body.
Ownership of objects launched into outer space is not affected by their presence in outer space or their return to Earth.

ARTICLE IX — Harmful Contamination
States shall conduct space activities so as to avoid harmful contamination of outer space and adverse changes
in the environment of the Earth. If a State has reason to believe that a planned activity would cause
harmful interference, it shall undertake appropriate international consultations.

COMPLIANCE ASSESSMENT CRITERIA
For space debris compliance purposes:
- A satellite is COMPLIANT if it is registered with the UN (UNOOSA registry), its launching state is known,
  and the state accepts liability under Article VII.
- A satellite is NON-COMPLIANT if it is unregistered debris, or if the launching state cannot be determined,
  or if the object is generating uncontrolled debris that may cause damage to other states' objects.
"""

UN_COPUOS_POLICY = """
UNITED NATIONS COMMITTEE ON THE PEACEFUL USES OF OUTER SPACE (COPUOS)
Space Debris Mitigation Guidelines
Endorsed by the UN General Assembly: December 2007 (Resolution 62/217).
Updated by COPUOS STSC: 2019 Guidelines for the Long-term Sustainability of Outer Space Activities.

THE 7 COPUOS SPACE DEBRIS MITIGATION GUIDELINES (2007)

Guideline 1: Limit debris released during normal operations.
Spacecraft and launch vehicle orbital stages should be designed not to release debris during normal operations.
If debris release is necessary, the potential for future interference with the outer space environment must be minimized.

Guideline 2: Minimize the potential for break-ups during operational phases.
Spacecraft and orbital stages should be designed and operated to avoid failure modes that may lead to accidental break-ups.
In cases where a break-up is suspected, a re-orbit or de-orbit maneuver should be performed if safe to do so.

Guideline 3: Limit the probability of accidental collision in orbit.
Information should be shared regarding predicted close approaches. States and international organizations
should provide conjunction data to spacecraft operators. Collision avoidance maneuvers should be planned.

Guideline 4: Avoid intentional destruction and other harmful activities.
States should refrain from intentional destruction of space objects that generates long-lived debris.
Anti-satellite (ASAT) weapons tests generating debris are strongly discouraged.

Guideline 5: Minimize potential for post-mission break-ups from stored energy.
All on-board energy sources should be passivated (depleted) when they are no longer required for operations.
This includes: residual propellants, batteries, high-pressure vessels, momentum wheels, and other stored energy.

Guideline 6: Limit the long-term presence of spacecraft and launch vehicle orbital stages in LEO after end of mission.
Spacecraft and orbital stages should be de-orbited or placed in orbits that limit their orbital lifetime.
The recommended maximum is 25 years post-mission (consistent with IADC guidelines).

Guideline 7: Limit the long-term interference of spacecraft and launch vehicle orbital stages with the GEO region.
Objects in GEO should be re-orbited to a graveyard orbit at end of mission.
The minimum altitude increase for graveyard orbit is 235 km + (1000 × Cr × A/m) km above GEO,
where Cr is the solar radiation pressure coefficient and A/m is the area-to-mass ratio.

2019 GUIDELINES FOR LONG-TERM SUSTAINABILITY (LTS)

LTS Guideline A.1: Adopt, revise, and amend national regulatory frameworks.
LTS Guideline A.2: Share information on space objects and events.
LTS Guideline B.1: Provide updated contact information for space activities.
LTS Guideline B.2: Improve accuracy of orbital data.
LTS Guideline B.3: Promote collection and dissemination of space debris monitoring data.
LTS Guideline B.4: Perform conjunction assessment and share results.
LTS Guideline B.5: Develop collision avoidance capabilities.
LTS Guideline B.6: Share operational space weather data and forecasts.
LTS Guideline B.7: Perform research on space debris to support mitigation.
LTS Guideline B.8: Design and operate space objects for safe disposal.
LTS Guideline B.9: Plan for end-of-life of space objects.
LTS Guideline B.10: Manage risks of re-entry of space objects.
LTS Guideline C.1: Promote and facilitate international cooperation.

GEO GRAVEYARD REQUIREMENTS
The GEO protected region is defined as: altitude between 35,586 km and 35,986 km (i.e., GEO ± 200 km).
Objects must not be abandoned in this region. Decommissioned GEO satellites must be moved to a
graveyard orbit at least 235 km above the GEO altitude.
Leaving debris in the GEO protected zone is a violation of COPUOS Guideline 7.
"""
