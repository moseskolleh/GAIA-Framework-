# GAIA Framework 2.0

**Green AI Assessment — a science-based framework for measuring, judging, and reducing the environmental footprint of AI use.**

GAIA is a decision-oriented assessment framework for organizations that *use* AI systems — via APIs, hosted deployments, or self-hosted models. It answers three questions no single existing instrument answers together: (1) how large is the environmental footprint of our AI use — energy, carbon, and water — stated honestly, with uncertainty bounds and data provenance; (2) is that footprint reasonable for the task being performed, compared against measured benchmarks rather than arbitrary thresholds; and (3) what should we change, ranked by evidence of effectiveness. GAIA does not replace measurement standards — it builds on them (SCI / ISO/IEC 21031:2024, ISO 14040/44, ITU-T L.1410, GHG Protocol) and contributes the organizational decision layer that connects them into a workflow anyone can run — in a spreadsheet.

It is written for sustainability and ESG teams, engineering and platform leads, and procurement — anyone who has to decide whether, where, and how to deploy AI, and to report on it afterwards.

- **Specification:** [FRAMEWORK.md](FRAMEWORK.md) (authoritative)
- **Rebuild rationale:** [DECISIONS.md](DECISIONS.md) — what was kept, rebuilt, or removed from v1, and why

---

## Get the tool

| | |
|---|---|
| **Excel workbook** | [Download GAIA_Assessment_Tool.xlsx](https://github.com/moseskolleh/GAIA-Framework-/raw/main/GAIA_Assessment_Tool.xlsx) |
| **Web estimator** | [moseskolleh.github.io/GAIA-Framework-](https://moseskolleh.github.io/GAIA-Framework-/) |

There is always a downloadable Excel version. The workbook and the web estimator implement the same equations from the same data tables; the spreadsheet is generated from code (`build_workbook.py` + `data/*.csv`), so it can never drift from the methodology, and every formula is auditable in the sheet itself.

---

## The four modules

The framework's name is its method: **G**round → **A**ssess → **I**nterpret → **A**ct.

1. **Ground** — inventory your AI use cases: model, deployment path, hosting region, monthly request volume, token profile. Choose functional units and declare the system boundary.
2. **Assess** — compute energy, carbon (location- and market-based), and water per functional unit and in total, with low/central/high bounds, using the equations of FRAMEWORK.md §4 and the best available data tier for each quantity.
3. **Interpret** — assign each use case an efficiency grade (A–E) conditioned on its task class; run the fit-for-purpose check (frugality flag F0/F1/F2+); place totals in context with sourced equivalents.
4. **Act** — select mitigation levers from the evidence-ranked catalogue, set reduction targets on *intensity*, and report using the SCI-compatible disclosure template.

---

## What makes it scientific

- **Traceable or absent.** Every factor in `data/` carries a source, a vintage (when it was measured), and a data-quality tier. A value that cannot be sourced is not published.
- **Data-quality tiers with uncertainty bands.** Every energy estimate is labeled T1 (measured) / T2 (provider-disclosed) / T3 (benchmarked) / T4 (modeled), with interval widths of ×1.15 / ×1.5 / ×2 / ×3 respectively.
- **Low/central/high reporting.** Every result is an interval, not a point estimate. Bounds propagate through the calculation; factor uncertainty is documented as adding beyond the energy-dominated band.
- **Separation of what varies independently (P3).** The model determines energy per token; the facility determines overhead (PUE) and on-site water (WUE); the regional grid determines carbon (CI) and off-site water (EWIF); the hardware supply chain determines embodied emissions. No region's carbon is ever baked into a model's row — that was the central methodological error of GAIA 1.0.
- **Dual carbon reporting.** Location-based and market-based carbon answer different questions and are reported side by side, never blended — per GHG Protocol Scope 2 guidance.
- **Task-conditioned grading.** Energy per request is graded A–E within its task class (Light / Standard / Heavy / Reasoning) on fixed logarithmic bands anchored to published measurements — a reasoning-agent workload is never compared to autocomplete.
- **Frugality flag, not a composite score.** Three auditable yes/no questions (necessity, right-sizing, token discipline) yield F0/F1/F2+, reported *beside* the grade. No dimensionless composite score exists anywhere in GAIA 2.0.

---

## Where GAIA sits among existing instruments

Condensed from the full crosswalk in [FRAMEWORK.md §7](FRAMEWORK.md#7-comparability-where-gaia-sits-among-frameworks):

| Framework | Type | Relation to GAIA |
|---|---|---|
| **SCI — ISO/IEC 21031:2024** | Standard (rate) | GAIA computes exactly E, I, M, R; any GAIA result restates as an SCI score |
| **SCI for AI** (GSF, 2025) | Standard extension | GAIA's Assess module is an implementation; GAIA adds water, grading, frugality, and the decision layer |
| **AI Energy Score** (2025–) | Benchmark + rating | GAIA consumes it as T3 data; GAIA grades *your deployment*, not the bare model |
| **EcoLogits** (GenAI Impact) | Software library | Peer methodology for GAIA's T4 estimates; GAIA is spreadsheet-first and adds the organizational workflow |
| **AFNOR SPEC 2314 — Frugal AI** (2024) | Reference framework | GAIA's fit-for-purpose check descends from it; GAIA adds quantitative grading and uncertainty tiers |
| **GHG Protocol** (Scope 2 guidance) | Accounting standard | GAIA totals feed Scope 2/3 line items; dual reporting is inherited from it |

What none of these provides — and GAIA does — is the combination of uncertainty-tiered estimates usable without provider cooperation, water alongside carbon, task-conditioned grading of deployments, an explicit frugality check, and an Excel artifact a non-programmer can run.

---

## Repository structure

```
FRAMEWORK.md                  Authoritative GAIA 2.0 specification
DECISIONS.md                  Rebuild ledger: kept / rebuilt / removed, with rationale
data/                         Sourced factor tables — the single source of truth
  models.csv                  Per-model energy intensity (Wh/1k output tokens), tier, bounds, vintage
  regions.csv                 Grid carbon intensity and EWIF by region
  facilities.csv              PUE / WUE facility profiles
  grading.csv                 Task classes, default token profiles, grade bands
  mitigation.csv              Evidence-ranked mitigation levers with measured effects
  equivalents.csv             Sourced conversion factors for communication equivalents
build_workbook.py             Generates the Excel tool from the CSV tables
GAIA_Assessment_Tool.xlsx     Generated workbook (build artifact — never hand-edited)
index.html                    Zero-dependency web estimator (GitHub Pages)
legacy/                       GAIA 1.0 artifacts retained for reference
LICENSE                       MIT
```

---

## Regenerate the workbook

```bash
pip install openpyxl
python3 build_workbook.py
```

**Data update workflow:** edit the relevant table in `data/*.csv` (with source and vintage), regenerate the workbook, and bump the minor version. The spreadsheet is a build artifact and is never edited by hand.

---

## Governance and versioning

- **Semantic versioning.** Factor-table refreshes (grid CI vintages, new models) bump the minor version; methodology changes bump the major version and require a documented rationale against principles P1–P7.
- **Reproducibility.** The Excel tool is generated from `build_workbook.py` and the CSV tables; anyone can audit the formulas in the script or in the sheet.
- **Update cadence.** Model database and grid factors are reviewed at least twice yearly.
- **Corrections.** An error in any published number is fixed in the data table with a changelog entry, never silently.

**Roadmap:** marginal/hourly emissions accounting, water-stress weighting for hosting regions, and expanded guides for moving deployments to T1 (metered) data.

---

## Key sources

- Elsworth et al. (Google), *Measuring the environmental impact of delivering AI at Google*, arXiv:2508.15734 (2025)
- Mistral AI × ADEME/Carbone 4, *Life-cycle assessment of Mistral Large 2* (2025)
- Jegham et al., *How Hungry is AI?*, arXiv:2505.09598 (2025)
- Luccioni et al., *AI Energy Score* v1–v2 (2025)
- Li, Yang, Islam & Ren, *Making AI Less "Thirsty"*, arXiv:2304.03271 (2023; CACM 2025)
- ISO/IEC 21031:2024 (Software Carbon Intensity) and GSF *SCI for AI* (2025)
- AFNOR SPEC 2314, *Frugal AI* (2024)
- Ember, *Global Electricity Review* (2025, 2024 data)

The full source list, with vintages, is in [FRAMEWORK.md §11](FRAMEWORK.md#11-foundational-sources) and in the `source` column of every data table.

---

## License

MIT — see [LICENSE](LICENSE).
