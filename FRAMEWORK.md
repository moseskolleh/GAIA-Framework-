# GAIA Framework 2.0

## Green AI Assessment — a science-based framework for measuring, judging, and reducing the environmental footprint of AI use

**Version:** 2.1.0 · **Status:** Specification · **Date:** July 2026 · **License:** MIT

---

## 0. Abstract

GAIA is a decision-oriented assessment framework for organizations that **use** AI systems (via APIs, hosted deployments, or self-hosted models). It answers three questions no single existing instrument answers together:

1. **How large is the environmental footprint of our AI use** — energy, carbon, and water — stated honestly, with uncertainty bounds and data provenance?
2. **Is that footprint reasonable** for the task being performed, compared against measured benchmarks rather than arbitrary thresholds?
3. **What should we change**, ranked by evidence of effectiveness?

GAIA does not replace measurement standards — it builds on them. Carbon rates follow the Software Carbon Intensity specification (ISO/IEC 21031:2024) and its ratified AI extension (SCI for AI). Lifecycle boundaries follow ISO 14040/14044 and ITU-T L.1410. Water accounting follows the two-path (on-site + off-site) model of Li et al. Grading logic is task-conditioned, following the approach pioneered by the AI Energy Score. GAIA's contribution is the **organizational decision layer** that connects these into a workflow anyone can run — in a spreadsheet.

---

## 1. Principles

These principles are the constitution of the framework. Any future change must satisfy them.

**P1 — Traceable or absent.** Every number in the framework carries a source, a vintage (when it was measured), and a data-quality tier. A value that cannot be sourced is not published.

**P2 — Uncertainty is part of the answer.** Point estimates without bounds are pseudo-precision. Every result is reported as *low / central / high*. The width of the interval is determined by the data-quality tier (§4.5).

**P3 — Separate what varies independently.** The model determines *energy per token*. The facility determines *overhead* (PUE) and *on-site water* (WUE). The regional grid determines *carbon* (CI) and *off-site water* (EWIF). The hardware supply chain determines *embodied emissions*. GAIA never bakes a region's carbon into a model's row — that was the central methodological error of GAIA 1.0.

**P4 — Rates before totals.** Absolute totals scale with usage volume, so they cannot judge efficiency (a large deployment of an efficient model would look "worse" than a tiny deployment of a wasteful one). GAIA grades **intensity per functional unit** (per request, per 1M tokens, per user-month — the SCI concept of *R*), and reports totals alongside for budget and disclosure purposes.

**P5 — Fit-for-purpose beats raw efficiency.** The greenest query is the one that used the smallest adequate model — or was never sent. Following AFNOR SPEC 2314 ("frugal AI"), GAIA requires an explicit adequacy check: could a model one or two capability classes smaller do this job? This replaces GAIA 1.0's subjective "benefit score."

**P6 — Dual carbon reporting.** Location-based carbon (physical grid mix) and market-based carbon (contractual instruments) answer different questions and are both reported, never blended — consistent with GHG Protocol Scope 2 guidance.

**P7 — Comparable by construction.** GAIA's quantities map one-to-one onto SCI variables and GHG Protocol scopes (§7), so a GAIA assessment can be restated as an SCI score or fed into a corporate inventory without rework.

---

## 2. Scope and system boundary

### 2.1 What GAIA assesses

The **use phase of AI inference**, from the perspective of an AI-consuming organization:

| In scope | Treatment |
|---|---|
| GPU/accelerator energy for inference | Core quantity (§4.1) |
| Host CPU, DRAM, storage, idle-capacity energy | Serving-stack multiplier (§4.2) |
| Data-center overhead (cooling, power delivery) | PUE multiplier (§4.2) |
| Grid carbon emissions | Location- and market-based CI (§4.3) |
| On-site cooling water + off-site electricity-generation water | Two-path water model (§4.4) |
| Embodied emissions of serving hardware (manufacturing, amortized) | Embodied adder (§4.6) |
| Amortized training footprint | Optional adder, off by default (§4.7) |

Out of scope (documented, per ISO 14044 cut-off rules): end-user devices, network transmission, data-center construction, and end-of-life. Published LCAs that include these stages find them to be minor contributors for generative-AI serving (Mistral's audited LCA attributes ~85% of emissions and ~91% of water to training + inference alone); the omission is nonetheless a boundary truncation that understates the true total, and conforming reports must state it.

### 2.2 Functional units

Every GAIA result is expressed per functional unit *R* (SCI terminology). Standard units:

- **R1 — per request** (one prompt → one response, with declared token profile)
- **R2 — per 1M tokens generated**
- **R3 — per user-month**
- **R4 — per task outcome** (e.g., per document processed) — recommended where workflows are stable

---

## 3. The four modules: Ground → Assess → Interpret → Act

The framework's name is its method.

### Module G — GROUND (inventory and scoping)
Enumerate AI use cases; for each: model(s) used, deployment path (API / cloud-hosted / on-prem), hosting region (if known), monthly request volume, and token profile (median input and output tokens per request; output tokens dominate inference energy). Choose functional units. Declare the system boundary and any deviations from §2.1.

### Module A — ASSESS (quantification)
Compute energy, carbon (dual), and water per functional unit and in total, with low/central/high bounds, using the equations of §4 and the best available data tier for each quantity (§4.5).

### Module I — INTERPRET (contextualization)
Assign each use case an **efficiency grade A–E** (§5) conditioned on its task class; run the **fit-for-purpose check** (§5.3); place totals in context (share of organizational footprint, real-world equivalents with sourced conversion factors).

### Module A′ — ACT (mitigation and reporting)
Select mitigation levers from the evidence-ranked catalogue (§6); set reduction targets on *intensity*; report using the GAIA disclosure template (§8), which is SCI-compatible and EU-AI-Act-aligned.

---

## 4. Quantification methodology (Module A equations)

### 4.1 Energy per request

```
E_request = E_IT × PUE                                          [Wh]

E_IT  = IT-boundary energy for the request
        (accelerator + host CPU/DRAM + idle serving capacity)
PUE   = power usage effectiveness of the facility
```

`E_IT` is obtained by tier (§4.5). **The GAIA model database stores per-token energies already normalized to the IT boundary** — the serving-stack multiplier S (below) is applied during normalization, not by the user. When computed from tokens:

```
E_IT = (T_out × e_out) + (T_in × e_in)                          [Wh]
```

where `e_out` is the model's IT-boundary energy per output token and `e_in ≈ e_out / k` with k ≈ 10 (input processing is batched/parallel; empirically 5–20× cheaper per token than generation).

**Serving-stack multiplier S (normalization step).** Google's production measurement of the full Gemini serving stack found the accelerator to be only ~58% of per-prompt energy (host 25%, idle capacity 10%, with facility overhead applied separately) — implying S ≈ 1.7 on GPU-only figures. Sources measured GPU-only (AI Energy Score) are multiplied by S when entered into the database; provider-disclosed full-stack figures (Google, Mistral) are not (their facility overhead is instead backed out). Default S = 1.7 (range 1.4–2.0). *(Source: Elsworth et al., "Measuring the environmental impact of delivering AI at Google" [arXiv:2508.15734], Aug 2025.)*

**PUE.** Profile defaults (see `data/facilities.csv`, which the tools use verbatim): hyperscale best-in-class 1.09 (range 1.06–1.15; Google fleet trailing-twelve-month ≈ 1.09–1.10), hyperscale cloud typical 1.15 (1.10–1.30), colocation/enterprise 1.54 (Uptime Institute Global Survey 2025 industry average), on-premises legacy 1.80, unknown/API default 1.20. User-overridable.

### 4.2 Total and monthly energy

```
E_month = E_request × Q_month / 1000                            [kWh]
```

### 4.3 Carbon

```
C_op(location) = E_month × CI_location / 1000                   [kg CO2e]
C_op(market)   = E_month × CI_market / 1000                     [kg CO2e]
C_total        = C_op + C_embodied (+ C_training, optional)

(E_month in kWh; CI in g CO2e/kWh; /1000 converts g → kg)
```

`CI_location` comes from the hosting region's annual average grid intensity (Ember / IEA, latest year; the workbook ships a sourced regional table with vintage labels). If the hosting region is unknown — common for API use — use the provider's reported fleet average if disclosed, else the global average (473 g CO2e/kWh, Ember 2024) with widened bounds. `CI_market` uses provider-disclosed market-based factors where available (several providers procure 90–100% clean energy on paper); GAIA reports it beside, never instead of, the location-based figure (P6).

### 4.4 Water (two-path model, after Li et al.)

```
W_month = (E_IT_month × WUE_site) + (E_month × EWIF_region)     [L]
```

- **Path 1 — on-site:** cooling water at the facility, proportional to IT energy. Profile defaults (per `data/facilities.csv`): hyperscale best-in-class ≈ 0.25 L/kWh, hyperscale typical ≈ 1.0, colocation/legacy ≈ 1.8. *(Sources: operator sustainability reports; Google 2024 fleet WUE ≈ 1.0 L/kWh.)*
- **Path 2 — off-site:** water consumed generating the electricity (EWIF). Defaults: ≈ 2.0 L/kWh central (range 1.0–4.0), region-specific values in the workbook table. *(Sources: Li, Yang, Islam & Ren, "Making AI Less Thirsty" [arXiv:2304.03271]; Macknick et al. 2012 operational water-consumption factors.)*

GAIA 1.0 stored a single per-model water number — this conflated the model with the facility and region and is abolished (P3).

### 4.5 Data-quality tiers (the provenance ladder)

Every `E_IT` estimate is labeled with the tier it came from. Tiering follows the hierarchy emerging in the literature (cf. the four-tier Scope-3 methodology of arXiv:2606.10660) and GHG Protocol data-quality guidance:

| Tier | Basis | Uncertainty band (central ×/÷) | Example |
|---|---|---|---|
| **T1 Measured** | Direct metering of your deployment (e.g., CodeCarbon, nvidia-smi + host power) | 1.15 | Self-hosted Llama with power logging |
| **T2 Disclosed** | Provider-published full-stack measurement with stated boundary | 1.5 | Google Gemini 0.24 Wh/median prompt; Mistral Large 2 LCA |
| **T3 Benchmarked** | Independent standardized benchmark (GPU-only, needs S) | 2 | AI Energy Score; Jegham et al. API benchmarks |
| **T4 Modeled** | Parameter-count physics model (FLOPs → J via hardware efficiency) | 3 | EcoLogits-style estimate for an undisclosed model |

The tier band is the **default minimum width**: Low = central ÷ band; High = central × band. A database row may carry *wider* bounds than its tier default when independent sources disagree (several T2/T3 rows do — e.g. provider disclosures with unstated boundaries, or benchmark results that conflict with first-principles estimates); the widening is documented in that row's `basis` field, and the row's stored `wh_low`/`wh_high` are authoritative.

Bound propagation is **energy-dominated**: downstream results (carbon, water, totals) scale by the energy bounds (`wh_low/central`, `wh_high/central`). Factor uncertainty (CI, PUE, WUE, EWIF — whose own low/high columns ship in the factor tables) adds *beyond* the displayed band and is disclosed as such rather than compounded, which keeps the interval interpretable and spreadsheet-tractable.

**Tier-4 model (for models with no measurement):**

```
e_out ≈ (2 × N_active) / (η_hw × u × 3600)                      [Wh/token]
```

`N_active` = active parameters per token (MoE models use active, not total); `η_hw` = accelerator FLOPs/J at serving precision (H100-class ≈ 1.4×10¹² dense BF16 FLOPs/J); `u` = model FLOPs utilization in serving, default 0.3 (range 0.1–0.5). This is the estimation logic used by Epoch AI's ChatGPT analysis and the EcoLogits library.

### 4.6 Embodied emissions

Manufacturing emissions of serving hardware, amortized over service life:

```
C_embodied = C_manuf × (t_use / t_life) × allocation_share
```

Practical default when the serving fleet is unknown (API use): **embodied adder = 25% of location-based operational carbon** (range 10–50%). Anchors: the BLOOM LCA attributed ≈ 22% of training-phase footprint to embodied hardware (Luccioni et al. 2022); Google's per-prompt disclosure and Mistral's LCA place embodied within this band for modern fleets; an H100 GPU ≈ 200 kg CO2e embodied, an 8-GPU HGX server ≈ 3–5 t CO2e over a 4–6-year life (Boavizta; NVIDIA disclosures).

### 4.7 Amortized training footprint (optional)

Off by default — under GHG Protocol logic, training emissions belong to the model provider's inventory, and double-counting is a real risk. When an organization wants a "full-attribution" view, allocate:

```
C_training_share = C_training_total × (your_tokens / est_total_lifetime_tokens)
```

Mistral's audited LCA (the first for an LLM: 20.4 kt CO2e and 281,000 m³ water for Large 2 training + 18 months of use, Jan 2025) shows training-inclusive attribution adds material but not dominant amounts per marginal request for widely used models.

---

## 5. Interpretation: grades that mean something (Module I)

### 5.1 Task classes

Requests are graded **within their task class** — comparing a reasoning-agent workload to an autocomplete query is meaningless. Classes:

| Class | Description | Typical token profile |
|---|---|---|
| **L — Light** | Classification, extraction, short chat, autocomplete | ≤ 100 out |
| **S — Standard** | General assistant use, summarization, translation | 100–500 out |
| **H — Heavy** | Long-form generation, RAG over large contexts, code generation | 500–2000 out |
| **R — Reasoning/agentic** | Extended thinking, multi-step agents, deep research | > 2000 out (incl. hidden reasoning tokens) |

### 5.2 Efficiency grade (A–E)

Grades are assigned on **central-estimate energy per request** against fixed, logarithmic, task-conditioned bands. Fixed absolute bands (rather than percentile ranks) keep grades stable over time and auditable; the ~×3 logarithmic spacing reflects the order-of-magnitude spreads observed in every benchmark study. Bands are anchored to published measurements: provider-disclosed medians (0.24–0.34 Wh) anchor grade A/B for class S; reasoning models measured at >30 Wh/request (Jegham et al.; AI Energy Score v2 found reasoning ≈ 30× standard generation) anchor grade E.

**Wh per request (central estimate, full-stack):**

| Grade | L | S | H | R |
|---|---|---|---|---|
| **A** | ≤ 0.1 | ≤ 0.3 | ≤ 1.0 | ≤ 3.0 |
| **B** | ≤ 0.3 | ≤ 1.0 | ≤ 3.0 | ≤ 10 |
| **C** | ≤ 1.0 | ≤ 3.0 | ≤ 10 | ≤ 30 |
| **D** | ≤ 3.0 | ≤ 10 | ≤ 30 | ≤ 100 |
| **E** | > 3.0 | > 10 | > 30 | > 100 |

Carbon and water intensities are **reported, not graded** — they are dominated by the region and facility (P3), which the model choice cannot fix. Grading energy grades the thing the user controls; the report shows where siting, not model choice, is the real lever.

### 5.3 Fit-for-purpose check (replaces the v1 "benefit score")

GAIA 1.0 scored "benefit" as `Efficiency×0.4 + Quality×0.3 + Strategic×0.3` on self-assessed 1–10 inputs — false precision on subjective data. GAIA 2.0 asks three auditable yes/no questions per use case (AFNOR SPEC 2314's frugality logic):

1. **Necessity** — does the task need generative AI at all (vs. search, template, rules, or a human)?
2. **Right-sizing** — has a model at least one capability class smaller been evaluated on this task within the last two model generations, with documented quality results?
3. **Token discipline** — are prompts, retrieval payloads, and reasoning budgets bounded (max-token limits, thinking-budget caps, caching for repeated context)?

The result is a frugality flag: **F0** (all three pass), **F1** (one failure), **F2+** (two or more) — reported next to the grade. An "A-graded" use case at F2 (an efficient model doing an unnecessary job) is worse than a "C at F0". No composite score is computed — the pair (grade, flag) *is* the result. Collapsing them into one number is exactly the arbitrariness GAIA 2.0 exists to remove.

### 5.4 Decision guidance

| Grade × Flag | Guidance |
|---|---|
| A–B, F0 | Proceed; monitor quarterly |
| A–B, F1+ | Efficient but wasteful by design — fix necessity/right-sizing first |
| C–D, F0 | Justified heavy use — apply mitigation levers; set an intensity-reduction target |
| C–D, F1+ | Priority for intervention |
| E, any | Re-architect: reasoning budgets, model routing, or task redesign before scale-up |

No "prohibited" verdicts: GAIA is a decision-support instrument, not a regulator. Thresholds triggering mandatory review are an organizational policy choice layered on top.

---

## 6. Mitigation catalogue (Module A′) — evidence-ranked

Each lever ships with the measured effect size and source; "up to" marketing numbers are banned.

| # | Lever | Measured effect on energy/carbon | Evidence |
|---|---|---|---|
| 1 | **Right-size the model** (route to smallest adequate) | 10–70× between frontier-reasoning and small efficient models on identical prompts | Jegham et al. 2025 (o3 vs GPT-4.1 nano >70×); AI Energy Score spreads |
| 2 | **Cap reasoning/thinking budgets** | Reasoning modes average ≈ 30× standard generation; budgets recover most of it for bounded tasks | AI Energy Score v2 (Dec 2025) |
| 3 | **Choose low-carbon hosting regions** | Grid CI spans ~20× (≈ 30–40 g CO2e/kWh in hydro/nuclear-heavy grids vs 600–750 in coal-heavy) | Ember Global Electricity Review (2024 data) |
| 4 | **Bound output length; prompt/token discipline** | Energy ≈ linear in output tokens; halving median output ≈ halves per-request energy | Physics of autoregressive decoding; Luccioni et al. 2024 |
| 5 | **Cache repeated context / responses** | Eliminates recomputation of repeated prefixes; effect = your cache hit rate | Provider prompt-caching documentation |
| 6 | **Batching / off-peak scheduling** | Improves utilization `u`; effect measured in single-digit to low-double-digit % | Serving-systems literature; grid CI diurnal variation |
| 7 | **Prefer providers with disclosed footprints** | Enables T2 data (halves uncertainty); creates market pressure for transparency | This framework, P1 |
| 8 | **Newer hardware generations** | ~24% lower embodied carbon per FLOP (B200 vs H100); higher FLOPs/J | NVIDIA disclosures |

Provider-side levers a *user* cannot pull (PUE improvement, clean-power procurement, WUE engineering) appear in the report as *disclosure asks* for vendor management, not as user actions. One-off measurement cost of switching a workload to T1 metering is itself a recommended lever: it converts guesswork into data.

---

## 7. Comparability: where GAIA sits among frameworks

GAIA is designed to be *restatable* in the other instruments' terms — the crosswalk is the point.

| Framework | Type | What it does | Relation to GAIA |
|---|---|---|---|
| **SCI — ISO/IEC 21031:2024** (Green Software Foundation) | Standard (rate) | `SCI = (E×I + M)/R` per functional unit | GAIA's §4 computes exactly E, I, M, R; any GAIA result restates as an SCI score (energy → E, location CI → I, embodied → M, functional unit → R) |
| **SCI for AI** (GSF, ratified 2025) | Standard extension | SCI adapted to AI lifecycle incl. training/inference split | GAIA Module A is an implementation; GAIA adds water, grading, frugality, and the decision layer SCI deliberately leaves out |
| **AI Energy Score** (Hugging Face/Salesforce/Cohere/CMU, 2025–) | Benchmark + rating | Standardized GPU-energy benchmark on H100, 5-star ratings per task | GAIA consumes it as T3 data; GAIA's task-conditioned grades follow its logic but grade *your deployment*, not the bare model |
| **EcoLogits** (GenAI Impact) | Software library | ISO-14044-based per-request estimates for API models | Peer methodology for GAIA's T4 model; GAIA is spreadsheet-first and adds the organizational workflow |
| **CodeCarbon / Green Algorithms** | Measurement tools | Meter or estimate compute energy/carbon | GAIA's T1 data source |
| **AFNOR SPEC 2314 — Frugal AI** (2024) | Reference framework | Lifecycle methodology + 31 best practices + "question the need" | GAIA's §5.3 frugality check descends from it; GAIA adds quantitative grading and uncertainty tiers |
| **ITU-T L.1410 / ISO 14040/44** | LCA standards | Boundary and allocation rules for ICT LCA | Govern GAIA's §2 boundary declarations |
| **GHG Protocol (Scope 2 guidance, ICT sector)** | Accounting standard | Corporate inventories, dual reporting | GAIA totals feed Scope 2/3 line items; P6 dual reporting is inherited from it |
| **LLMCarbon** (ICLR 2024) | Academic model | End-to-end (training+inference+embodied) carbon prediction | Basis for GAIA's optional §4.7 training attribution |
| **EU AI Act (Art. 40/51, Annex XI)** | Regulation | Energy documentation duties for GPAI providers | GAIA's disclosure template (§8) is structured so provider-side answers slot in when they become available |
| **ISO/IEC TR 20226:2025** | Standard (technical report) | Overview of environmental sustainability aspects and metrics of AI systems (July 2025) | GAIA is an executable companion: it implements the TR's metric categories in runnable form; conformance crosswalk on the roadmap |
| **ITU-T L.1801 (02/2026)** | Standard (Recommendation) | Guidelines for assessing the environmental impact of AI systems | Same relation — L.1801 gives the guidelines, GAIA the no-code instrument that executes them |

What none of these provides — and GAIA does — is the combination of: (a) uncertainty-tiered estimates usable *without* provider cooperation, (b) water alongside carbon, (c) task-conditioned grading of deployments, (d) an explicit frugality check, and (e) an Excel artifact a non-programmer can run.

### 7.1 Macro-framework alignment (UN SDGs and corporate reporting)

Beyond the technical instruments above, GAIA's outputs are mapped element-by-element onto the frameworks organizations report against: **UN SDG targets** 6.4, 7.2/7.3, 8.4, 9.4, 12.2/12.6 and 13.2/13.3 (measurement hooks only — GAIA quantifies the environmental *cost* of AI; whether an application advances an SDG, "AI for Good", is out of scope, the same boundary ISO/IEC TR 20226 draws); **GRI** 302/303/305; **ESRS** E1/E3 under CSRD (GAIA's P6 dual Scope-2 reporting is required by ESRS natively); **IFRS S2**; **CDP**; **SBTi** baselines; and **UN Global Compact** Principles 7–9. The full mapping table, the capability matrix against every framework in this section, and the gap-analysis roadmap that falls out of it live in **COMPARISON.md**; the mapping also ships as the "SDG & Reporting Map" sheet in the Excel workbook. Two rules bound every such claim: SDG/report statements must trace to an actually produced GAIA output (P1), and goal-badging without numbers is non-conforming.

---

## 8. Reporting and disclosure

A conforming GAIA report contains, per use case and in aggregate:

1. **Inventory declaration** (Module G outputs, incl. boundary deviations)
2. **Intensity results** — energy Wh/R, carbon g CO2e/R (location AND market), water mL/R — each as low/central/high with tier labels
3. **Totals** — monthly kWh, kg CO2e (dual), litres
4. **Grade + frugality flag** per use case (§5)
5. **Data-quality statement** — share of results by tier; plan to move up-tier
6. **Mitigation commitments** — chosen levers, intensity targets, review date
7. **Factor vintages** — grid CI year, PUE/WUE sources, model-database version

Restating as SCI: report `(E×I + M)/R` using location-based I. Feeding a GHG inventory: `C_op` of self-hosted deployments → Scope 2; API usage and embodied → Scope 3 (categories 1/11 per the four-tier Scope-3 methodology, arXiv:2606.10660).

---

## 9. Governance of the framework itself

- **Versioning:** semantic. Factor-table refreshes (grid CI vintages, new models) bump the minor version; methodology changes bump the major version and require a documented rationale against P1–P7.
- **Reproducibility:** the Excel tool is *generated* from `build_workbook.py` + the CSV data tables in `data/` — the spreadsheet is a build artifact, never hand-edited. Anyone can audit the formulas in the script or the sheet.
- **Update cadence:** model database and grid factors reviewed at least twice yearly (the field moves fast: between 2024 and 2026, per-prompt disclosed energy fell ~33× at one provider while reasoning modes raised per-request energy ~30× at the task level — both directions matter).
- **Corrections:** an error found in any published number is fixed in the data table with a changelog entry, never silently.

## 10. Known limitations (stated, per P2)

- Closed providers do not disclose per-model serving data; most rows are T3/T4 with wide bounds. This is a property of the industry, not the framework — GAIA makes the opacity itself visible (that is the point of the tier column).
- Benchmarks measure specific hardware/serving configurations; production fleets differ (batching, quantization, speculative decoding can shift per-token energy several-fold in either direction).
- Annual-average grid CI ignores hourly variation; marginal-emissions accounting is out of scope for v2.0 (candidate for v3).
- Water data is the weakest link globally: EWIF varies by basin and season, and *water stress context* (WHERE a litre is drawn) matters as much as volume. GAIA reports volume and flags stress-region hosting qualitatively.
- Rebound effects (efficiency → more usage) are real and unmodeled; the frugality flag is the partial control.

## 11. Foundational sources

Measurement & disclosure: Elsworth et al. (Google), *Measuring the environmental impact of delivering AI*, arXiv:2508.15734 (2025) · Mistral AI × ADEME/Carbone 4, *LCA of Mistral Large 2* (2025) · OpenAI (Altman), per-query energy statement (2025) · Epoch AI, *How much energy does ChatGPT use?* (2025).
Benchmarks: Jegham et al., *How Hungry is AI?*, arXiv:2505.09598 (2025) · Luccioni et al., *AI Energy Score* v1–v2 (2025) · Luccioni, Jernite & Strubell, *Power Hungry Processing*, FAccT (2024).
Water: Li, Yang, Islam & Ren, *Making AI Less "Thirsty"*, arXiv:2304.03271 (2023; CACM 2025) · Macknick et al., operational water factors (2012).
Lifecycle & embodied: Luccioni, Viguier & Ligozat, *BLOOM LCA*, arXiv:2211.02001 (2022) · Faiz et al., *LLMCarbon*, ICLR (2024) · Boavizta server-impact database · NVIDIA HGX embodied-carbon disclosures.
Standards: ISO/IEC 21031:2024 (SCI) · GSF *SCI for AI* (2025) · ISO 14040/14044 · ITU-T L.1410 · AFNOR SPEC 2314 (2024) · GHG Protocol Scope 2 Guidance · EU AI Act Art. 40/51/95, Annex XI.
Accounting methodology: *Accounting for AI Inference in Corporate GHG Inventories: A Four-Tier Methodology for Scope 3 Category 1 Reporting*, arXiv:2606.10660 (2026).
Context data: Ember *Global Electricity Review* (2025, 2024 data) · IEA *Electricity 2025* / *Energy & AI* (2025) · Uptime Institute *Global Data Center Survey* (2025) · operator sustainability reports (Google, Microsoft, Meta, AWS).

---

*GAIA 2.0 keeps the founding idea of GAIA 1.0 — that AI's environmental cost should be visible at the moment of decision — and rebuilds everything between the idea and the answer on published science.*
