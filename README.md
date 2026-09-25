# GAIA Framework

**Green AI Assessment — a science-based framework for measuring, judging, and reducing the environmental footprint of AI use.**

GAIA is a decision-oriented assessment framework for organizations that *use* AI systems — via APIs, hosted deployments, or self-hosted models. It answers three questions no single existing instrument answers together: (1) how large is the environmental footprint of our AI use — energy, carbon, and water — stated honestly, with uncertainty bounds and data provenance; (2) is that footprint reasonable for the task being performed, compared against measured benchmarks rather than arbitrary thresholds; and (3) what should we change, ranked by evidence of effectiveness. GAIA does not replace measurement standards — it builds on them (SCI / ISO/IEC 21031:2024, ISO 14040/44, ITU-T L.1410, GHG Protocol) and contributes the organizational decision layer that connects them into a workflow anyone can run — in a spreadsheet.

It is written for sustainability and ESG teams, engineering and platform leads, and procurement — anyone who has to decide whether, where, and how to deploy AI, and to report on it afterwards.

- **Specification:** [FRAMEWORK.md](FRAMEWORK.md) (authoritative)
- **Rebuild rationale:** [DECISIONS.md](DECISIONS.md) — what was kept, rebuilt, or removed from v1, and why
- **Comparison & alignment:** [COMPARISON.md](COMPARISON.md) — capability matrix against every framework in the field, alignment with the UN SDGs / GRI / ESRS / IFRS S2 / CDP / SBTi, and the gap-analysis roadmap
- **Build plan:** [ROADMAP.md](ROADMAP.md) — the step-by-step implementation plan from 2.3 to 4.0: features, improvements and efficiencies, each with a done-when test
- **Version history:** [CHANGELOG.md](CHANGELOG.md)

---

## Get the tool

| | |
|---|---|
| **Excel workbook** | [Download GAIA_Assessment_Tool.xlsx](https://github.com/moseskolleh/GAIA-Framework-/raw/main/GAIA_Assessment_Tool.xlsx) |
| **Web estimator** | [moseskolleh.github.io/GAIA-Framework-](https://moseskolleh.github.io/GAIA-Framework-/) |

There is always a downloadable Excel version. **Both** tools are generated from the same data tables — `build_workbook.py` emits the workbook, `build_site.py` emits the web page — so neither can drift from the methodology or from each other, and every formula is auditable in the sheet itself. `tests/test_engine.py` evaluates the Python reference, the JavaScript engine and the workbook's own Excel formulas on the same cases and fails if any of the three disagrees.

The web estimator covers rather more than a single calculation: a **model explorer** over the full database with filters and a log-scale energy chart with uncertainty whiskers, **scenario comparison**, a **portfolio inventory** with grade distribution and contribution ranking, **per-lever savings** computed against your own configuration, CSV/JSON export, and shareable links that restore every input. It is one self-contained file that makes no external requests — no fonts, no CDN, no analytics.

---

## The four modules

The framework's name is its method: **G**round → **A**ssess → **I**nterpret → **A**ct.

1. **Ground** — inventory your AI use cases: model, deployment path, hosting region, monthly request volume, token profile. Choose functional units and declare the system boundary.
2. **Assess** — compute energy, carbon (location- and market-based), and water per functional unit and in total, with low/central/high bounds, using the equations of FRAMEWORK.md §4 and the best available data tier for each quantity.
3. **Interpret** — assign each use case an efficiency grade (A–E) conditioned on its task class; run the fit-for-purpose check (frugality flag F0/F1/F2+); place totals in context with sourced equivalents.
4. **Act** — select mitigation levers from the evidence-ranked catalogue, set reduction targets on *intensity*, and report using the SCI-compatible disclosure template.

---

## The model database

135 rows across 33 providers, 85 of them open-weight, each carrying its energy
intensity with bounds, its data-quality tier, its vintage, and the source it came
from. Only energy is stored per model: carbon and water belong to the grid and
the facility (P3).

Two things the database does that most public model tables do not:

- **Energy is modelled on *active* parameters, not total.** A sparse
  mixture-of-experts model activating 49B of 1.6T serves at roughly the per-token
  energy of a 49B dense model. Treating it as a 1.6T model overstates its energy
  by more than an order of magnitude — the single most common error in public
  estimates of open-weight model energy.
- **Openness is recorded as a *measurability* flag.** An open-weight deployment
  can be metered and moved from T4 (modelled, ×/÷ 3) to T1 (measured, ×/÷ 1.15).
  A closed API model cannot be metered by its user at any price, so its ceiling is
  T2 and only the provider can lift it. That asymmetry, not a licence preference,
  is why the column exists.

Tier-4 rows are derived rather than typed: each records its own derivation as
`T4-physics(A=<active params>)`, and the test suite re-derives every one of them
from the framework constants and fails if a stored value has drifted. Closed
models with no parameter disclosure fall back to documented class anchors — two
rows sharing an anchor means nothing published distinguishes them, not that the
models are equally efficient.

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

Condensed from the full crosswalk in [FRAMEWORK.md §7](FRAMEWORK.md#7-comparability-where-gaia-sits-among-frameworks); the complete capability matrix — including ISO/IEC TR 20226:2025, ITU-T L.1801, and the macro frameworks (UN SDGs, GRI, ESRS, IFRS S2, CDP, SBTi) — is in [COMPARISON.md](COMPARISON.md):

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
FRAMEWORK.md                  Authoritative specification
DECISIONS.md                  Rebuild ledger: kept / rebuilt / removed, with rationale
COMPARISON.md                 Capability matrix, SDG/GRI/ESRS/IFRS alignment, gap-analysis roadmap
ROADMAP.md                    Implementation plan 2.3 → 4.0: phased steps, each with a done-when test
CHANGELOG.md                  Version history; corrections are recorded, never silent
data/                         Sourced factor tables — the single source of truth
  models.csv                  Per-model energy intensity, bounds, tier, openness, params, vintage
  regions.csv                 Grid carbon intensity and EWIF by region
  facilities.csv              PUE / WUE facility profiles
  grading.csv                 Task classes, default token profiles, grade bands
  mitigation.csv              Evidence-ranked mitigation levers with measured effects
  equivalents.csv             Sourced conversion factors for communication equivalents
  frameworks.csv              Framework crosswalk (workbook sheet + web page source)
  standards.csv               Standards GAIA implements or maps onto
  alignment.csv               SDG / GRI / ESRS / IFRS / CDP / SBTi mapping
web/                          Web estimator sources
  template.html               Markup with {{...}} placeholders
  gaia.css                    Stylesheet (light, dark, print)
  gaia.js                     Application and engine (the @engine block is the §4 equations)
build_workbook.py             Generates the Excel tool from the CSV tables
build_site.py                 Generates index.html from web/ + the CSV tables
tests/test_engine.py          Cross-checks the reference, JavaScript and Excel engines
GAIA_Assessment_Tool.xlsx     Generated workbook (build artifact — never hand-edited)
index.html                    Generated web estimator (build artifact — never hand-edited)
.github/workflows/build.yml   CI: rebuild, fail on stale artifacts, run the cross-engine test
legacy/                       GAIA 1.0 artifacts retained for reference
LICENSE                       MIT
```

---

## Build and test

```bash
pip install openpyxl formulas          # formulas is only needed for the Excel cross-check
python3 build_site.py                  # data/*.csv + web/  -> index.html
python3 build_workbook.py              # data/*.csv         -> GAIA_Assessment_Tool.xlsx
python3 tests/test_engine.py --excel   # reference vs JavaScript vs Excel, plus data validation
```

**Data update workflow:** edit the relevant table in `data/*.csv` (with source and
vintage), rebuild both artifacts, run the tests, and bump the minor version.
Neither the spreadsheet nor the web page is ever edited by hand.

`build_site.py` refuses to publish a page whose data breaks the framework's own
rules — bounds that do not bracket a central value, a band narrower than its tier
permits, a PUE below 1.0, an empty source (P1), or grade bands that do not
increase. A failing build is the framework enforcing itself.

---

## Governance and versioning

- **Semantic versioning.** Factor-table refreshes (grid CI vintages, new models) bump the minor version; methodology changes bump the major version and require a documented rationale against principles P1–P7.
- **Reproducibility.** The Excel tool is generated from `build_workbook.py` and the CSV tables; anyone can audit the formulas in the script or in the sheet.
- **Update cadence.** Model database and grid factors are reviewed at least twice yearly.
- **Corrections.** An error in any published number is fixed in the data table with a changelog entry, never silently.

**Roadmap:** marginal and hourly emissions accounting; water-stress weighting for
hosting regions; a refreshed grid and facility factor set; and expanded guides for
moving deployments to T1 (metered) data — the lever with the largest effect on the
honesty of any assessment. The full, ordered plan is in [ROADMAP.md](ROADMAP.md).

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
