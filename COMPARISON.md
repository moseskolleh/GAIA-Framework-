# GAIA Among the Frameworks

## Capability comparison, macro-framework alignment (UN SDGs, GRI, ESRS, IFRS), and the improvement roadmap that falls out of it

**Companion to FRAMEWORK.md §7 · Version 2.1.0 · July 2026**

This document does three things: (1) compares GAIA capability-by-capability against every serious instrument in the field, (2) maps GAIA's outputs onto the macro sustainability frameworks organizations actually report against — the UN Sustainable Development Goals, GRI, ESRS/CSRD, IFRS S2, CDP, SBTi — and (3) states plainly where other frameworks are stronger, which becomes GAIA's improvement roadmap. A comparison that only lists what you do better is marketing; this one is an audit.

---

## 1. Capability matrix — GAIA vs. the technical frameworks

✔ = provided · ◐ = partial · — = not in scope

| Capability | **GAIA 2.1** | SCI / SCI-for-AI (ISO/IEC 21031) | AI Energy Score | EcoLogits | CodeCarbon / Green Algorithms | AFNOR SPEC 2314 | ISO/IEC TR 20226:2025 | ITU-T L.1801 (2026) | GHG Protocol | LLMCarbon |
|---|---|---|---|---|---|---|---|---|---|---|
| Quantifies **energy** per unit of AI work | ✔ | ✔ (as E) | ✔ (GPU-only bench) | ✔ | ✔ (measured) | ◐ (method refs) | ◐ (metrics overview) | ◐ (guidelines) | — | ✔ (modeled) |
| Quantifies **carbon** | ✔ dual (location + market) | ✔ (location-based only, by design) | — | ✔ | ✔ | ◐ | ◐ | ◐ | ✔ dual | ✔ |
| Quantifies **water** (two-path: WUE + EWIF) | ✔ | — | — | ✔ | — | ◐ | ◐ (named, not computed) | ◐ | — | — |
| **Embodied hardware** emissions | ✔ (adder, sourced anchors) | ✔ (as M) | — | ✔ | ◐ | ✔ (lifecycle) | ✔ (named) | ✔ (named) | ✔ (Scope 3) | ✔ |
| **Uncertainty bounds** on every result | ✔ (tier-driven low/central/high) | — | — | ◐ (ranges) | — | — | — | — | ◐ (data-quality guidance) | — |
| **Data-provenance tiers** (measured→modeled) | ✔ (T1–T4, labeled per row) | — | single tier (bench) | single tier (model) | single tier (measured) | — | — | ◐ | ✔ (data hierarchy) | single tier |
| Usable **without provider cooperation** | ✔ | ◐ | ✔ (open models only) | ✔ | self-hosted only | ✔ | ✔ | ✔ | ✔ | ✔ |
| **Task-conditioned efficiency rating** | ✔ (A–E per task class) | — | ✔ (5 stars per task) | — | — | — | — | — | — | — |
| **Sufficiency / frugality check** (question the need) | ✔ (3-question flag) | — | — | — | — | ✔ (its core idea) | ◐ | ◐ | — | — |
| **Decision guidance** (what to do with the number) | ✔ (grade × flag table) | — | ◐ (pick 5-star models) | — | — | ✔ (31 practice sheets) | ◐ | ◐ | — | — |
| Organization-level **workflow** (inventory → report) | ✔ (G→A→I→A) | — | — | — | — | ✔ | — | ◐ | ✔ (inventory) | — |
| **Disclosure template** | ✔ (SCI- and AI-Act-aligned) | ◐ (score reporting) | ◐ (label) | — | — | ✔ (communication rules) | — | ◐ | ✔ | — |
| **No-code tool** anyone can run (Excel) | ✔ (generated workbook) | — | — | — (Python) | — (Python) | — (PDF) | — (PDF) | — (PDF) | ◐ (sector tools) | — |
| Free & open (MIT), reproducible from code | ✔ | ◐ (spec open) | ✔ | ✔ | ✔ | ◐ (free PDF) | — (paid) | ◐ | ◐ | ✔ |
| Formal **standard status** | — | ✔ ISO/IEC IS | — | — | — | ◐ (AFNOR Spec) | ✔ ISO/IEC TR | ✔ ITU-T Rec. | ✔ de-facto | — |
| **Assurance / certification** pathway | — (roadmap §4) | ◐ (emerging) | ◐ (label process) | — | — | ◐ (self-declaration rules) | — | — | ✔ (audit ecosystem) | — |
| **Multi-criteria** beyond E/C/W (materials, ADPe) | — (roadmap §4) | — | — | ✔ (ADPe, primary energy) | — | ✔ (LCA multi-criteria) | ✔ (named) | ✔ (named) | — | — |
| **Hourly / marginal** grid carbon | — (roadmap §4) | ◐ (granular I allowed) | — | — | ◐ (plugins) | — | — | — | ◐ (market instruments debate) | — |
| **Training-phase** footprint | ◐ (optional amortized adder) | ✔ (SCI-for-AI splits) | — | ◐ | ✔ (measure it) | ✔ | ✔ | ✔ | ◐ | ✔ (its core) |

**Reading of the matrix.** GAIA's defensible, unique combination remains: *uncertainty-tiered estimates usable without provider cooperation + water alongside dual carbon + task-conditioned grading + frugality + a no-code artifact*. No other single instrument offers that set. The matrix equally shows GAIA is **not** a standard (ISO/ITU are), **not** an assurance scheme (GHG Protocol's ecosystem is), **not** multi-criteria yet (EcoLogits and AFNOR are), and **not** sub-annual in carbon accounting. Those four cells define the roadmap (§4).

---

## 2. Alignment with the UN Sustainable Development Goals

GAIA is an environmental *measurement-and-decision* instrument; the SDGs are a *policy goal* framework. The honest mapping is therefore at the level of **SDG targets and indicators that GAIA outputs can evidence**, not a claim that using GAIA "achieves" any goal. Six goals have concrete, traceable hooks:

| SDG | Target | What the target asks | The GAIA output that evidences it |
|---|---|---|---|
| **SDG 6** Clean water and sanitation | **6.4** — substantially increase water-use efficiency across all sectors | Water-use efficiency over time | Water intensity per functional unit (L/request, L/1M tokens) from the two-path model (§4.4); trend across assessment periods in the Usage Log |
| **SDG 7** Affordable and clean energy | **7.3** — double the global rate of improvement in energy efficiency | Energy-intensity improvement | The A–E grade *is* an energy-intensity rating per task class; intensity-reduction targets set in Module A′ track 7.3 directly |
| | **7.2** — increase share of renewable energy | Renewables share of consumption | Market-based CI input + low-carbon-region lever (§6 lever 3) document the renewable share of AI electricity |
| **SDG 8** Decent work and economic growth | **8.4** — improve resource efficiency in consumption and production; decouple growth from degradation | Resource use per unit of value | Rates-before-totals (P4): footprint per task outcome (R4) is a decoupling metric — AI output vs. resources consumed |
| **SDG 9** Industry, innovation and infrastructure | **9.4** — upgrade infrastructure for sustainability, resource-use efficiency, clean technologies | Adoption of efficient technology | Mitigation levers 1, 2, 8 (model right-sizing, reasoning budgets, newer accelerator generations) with measured effect sizes |
| **SDG 12** Responsible consumption and production | **12.2** — sustainable management and efficient use of natural resources | Resource management | The full Ground→Assess inventory: an auditable account of energy/water/materials consumed by AI use |
| | **12.6** — encourage companies to adopt sustainable practices and integrate sustainability information into reporting | Sustainability reporting | The GAIA disclosure template (§8) — designed to feed the corporate reports of §3 below |
| **SDG 13** Climate action | **13.2 / 13.3** — integrate climate measures into policies and planning; improve capacity | Emissions accounting and reduction planning | Dual-reported carbon totals and intensities; evidence-ranked reduction plan; SCI/GHGP restatement for climate disclosures |

Two boundaries, stated deliberately:

- **GAIA does not measure "AI for Good."** Whether an AI application *advances* an SDG (health, education, climate modeling) is out of scope — the same boundary ISO/IEC TR 20226 draws. GAIA measures the environmental cost side of the ledger; the frugality check (§5.3) is where cost meets purpose.
- **SDG claims must trace to numbers.** A conforming GAIA report may state "supports monitoring of SDG targets 6.4/7.3/12.2" only where the corresponding GAIA outputs are actually produced and disclosed. Goal-washing — badging reports with SDG icons unconnected to measured outputs — is exactly the practice P1 (traceable or absent) exists to prevent.

---

## 3. Alignment with corporate reporting frameworks

Where a GAIA quantity lands in the reports organizations already file. This is the practical answer to "why should the sustainability team care": GAIA fills the AI line-items these frameworks increasingly demand.

| Framework | Disclosure | GAIA output that populates it |
|---|---|---|
| **GRI Standards** | 302-1 Energy consumption within the organization | Monthly kWh of *self-hosted* AI (E_month) |
| | 302-2 Energy consumption outside the organization | Monthly kWh of *API/cloud* AI use |
| | 302-3 Energy intensity | Wh per functional unit (R1–R4) |
| | 302-4 Reduction of energy consumption | Before/after intensity from the mitigation plan |
| | 303-5 Water consumption | On-site path (E_IT × WUE) for owned facilities; two-path total as value-chain context |
| | 305-2 Energy indirect (Scope 2) GHG emissions | C_op of self-hosted deployments — location- and market-based, reported separately as GRI requires |
| | 305-3 Other indirect (Scope 3) GHG emissions | API-use carbon (cat. 1/11 logic per arXiv:2606.10660) + embodied adder |
| | 305-4 GHG emissions intensity | kg CO2e per functional unit |
| **ESRS (CSRD, EU)** | E1-5 Energy consumption and mix | E_month split by deployment path; market CI documents the mix claim |
| | E1-6 Gross Scopes 1, 2, 3 GHG emissions | Same mapping as GRI 305; ESRS also requires *both* Scope-2 methods — GAIA's P6 dual reporting satisfies it natively |
| | E1-4 Targets related to climate change | Intensity-reduction targets from Module A′ |
| | E3-4 Water consumption | Two-path water total, with the on-site/off-site split ESRS appendices ask to characterize |
| **IFRS S2 (ISSB)** | Cross-industry metrics: Scopes 1–3, industry-based metrics | GAIA totals as the AI contribution to Scope 2/3; per-FU intensities as entity-specific metrics |
| **CDP** | Climate change & water security questionnaires | Carbon and water modules populate the quantitative fields; the data-quality statement (§8.5) answers CDP's methodology questions honestly |
| **SBTi** | Near-term Scope 2/3 target validation | GAIA supplies the AI-use baseline and tracks intensity; note SBTi targets are set on *absolute* or economic-intensity bases — GAIA totals feed that, grades do not |
| **EU AI Act** (Art. 40/51, Annex XI) | GPAI energy documentation | The disclosure template's provider-side fields are structured to accept Annex XI data as it becomes available |
| **UN Global Compact** | Principles 7–9 (precaution, responsibility, clean tech) | The GAIA report is direct evidence of Principle 7 (precautionary quantification) and 9 (diffusion of environmentally friendly technologies via the lever catalogue) |

**Reporting-boundary note.** GAIA quantities enter corporate inventories at the *use-case* level; the organization's consolidation rules (operational vs. financial control) then govern which scope they land in. GAIA deliberately reports both paths so the mapping survives either choice.

---

## 4. Gap analysis — where others are stronger, and what GAIA adopts next

The matrix's honest reading, converted into a versioned roadmap. Each item names the framework that does it better today and the adoption path.

| # | Gap (who does it better) | Adoption path | Target version |
|---|---|---|---|
| 1 | **Formal standardization** — ISO/IEC TR 20226:2025 and ITU-T L.1801 (02/2026) carry institutional authority GAIA cannot claim | Publish a conformance crosswalk showing GAIA implements TR 20226's metric categories and L.1801's assessment guidelines in runnable form; track both documents' revisions each cycle. GAIA's role: the *executable companion*, not a competing standard | 2.2 (crosswalk); ongoing |
| 2 | **Hourly / marginal grid carbon** — electricityMaps / WattTime signals; SCI permits granular I | Optional hourly-CI import in the workbook (region column already isolates CI); marginal-emissions guidance for the batch-scheduling lever | 3.0 |
| 3 | **Water-stress context** — ISO 14046 / AWARE characterization factors weight litres by basin scarcity | Add optional AWARE multiplier column to `data/regions.csv`; report "stress-weighted m³-eq" beside raw litres | 2.2 |
| 4 | **Multi-criteria breadth** — EcoLogits and Mistral's LCA report abiotic resource depletion (ADPe, kg Sb-eq); AFNOR and TR 20226 name materials/waste | Fourth metric column (materials pressure) sourced from EcoLogits factors and Boavizta, with its own tier labels; keeps P1 (no unsourced numbers) | 3.0 |
| 5 | **Assurance** — GHG Protocol has an audit ecosystem; AFNOR defines self-declaration rules | Define GAIA conformance levels: *Self-declared* (checklist in the workbook) → *Peer-reviewed* → *Assured* (third-party verifies tier labels and boundary statement); publish the checklist | 2.2 (checklist), 3.0 (levels) |
| 6 | **Target-setting pathways** — SBTi provides validated trajectories | Guidance note aligning Module A′ intensity targets with SBTi ICT trajectories, without pretending grades are targets | 2.2 |
| 7 | **Training-phase depth** — LLMCarbon models training end-to-end; SCI-for-AI splits lifecycle phases | Upgrade §4.7 from a single amortization formula to an LLMCarbon-parameterized estimator for organizations that fine-tune or train | 3.0 |
| 8 | **Rebound effects** — no framework handles this well; academic literature only | Add usage-trend line to the Usage Log with a rebound annotation (efficiency gain vs. volume growth), making rebound *visible* even if unmodeled | 2.2 |

Items 1, 3, 5, 6, 8 are additive (minor versions); items 2, 4, 7 change methodology (major version), per the governance rules in FRAMEWORK.md §9.

---

## 5. The positioning sentence

Standards (ISO/IEC 21031 & TR 20226, ITU-T L.1410 & L.1801) define *what should be measured*; benchmarks and tools (AI Energy Score, EcoLogits, CodeCarbon) measure *fragments of it*; reporting frameworks (SDG, GRI, ESRS, IFRS, CDP) define *where the answers must land*. **GAIA is the executable middle: the open, no-code instrument that takes an organization from the standards' definitions to the reporting frameworks' line-items — with uncertainty and provenance intact.**

---

### Sources added in v2.1

ISO/IEC TR 20226:2025, *Environmental sustainability aspects of AI systems* (published July 2025) · ITU-T L.1801, *Guidelines for assessing the environmental impact of artificial intelligence systems* (Feb 2026) · UN SDG targets & indicators (A/RES/71/313) · GRI 302/303/305 · ESRS E1/E3 (Commission Delegated Regulation (EU) 2023/2772) · IFRS S2 · SBTi ICT sector guidance · UN Global Compact Principles 7–9. Full v2.0 source list: FRAMEWORK.md §11.
