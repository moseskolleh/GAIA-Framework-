# GAIA 2.0 Rebuild — Decision Record

Audit of every GAIA 1.0 component: **KEPT**, **REBUILT**, or **REMOVED**, with the scientific rationale. This file is the honest ledger of the rebuild.

---

## Kept

| Component | Why it stays |
|---|---|
| **The name and mission** | "Make AI's environmental cost visible at the moment of decision" is the founding idea and it is sound. GAIA now also names the method: **G**round → **A**ssess → **I**nterpret → **A**ct. |
| **Energy + Carbon + Water as the metric triple** | Validated by the literature: every serious study (Google's disclosure, Mistral's LCA, Jegham et al., Li et al.) treats these three as the core inference footprint. |
| **PUE / WUE / grid-intensity concepts** | Real, standard quantities. v1 had the right ingredients — they are now used in the correct equations with sourced defaults and vintages. |
| **A letter-grade output** | Grades communicate. Kept as A–E, but redefined (see Rebuilt). |
| **Mitigation-strategies module** | Right idea. Every effect size is now a measured number with a citation, or it is not listed. |
| **Excel-first accessibility** | Core product decision, per the founder: there must always be a downloadable Excel version anyone can try. Now guaranteed by generating the workbook from code (`build_workbook.py`), so the spreadsheet can never drift from the methodology. |
| **Single-file web app, no dependencies** | Good engineering call in v1. The page is rebuilt for 2.0 but keeps the zero-dependency architecture. |

## Rebuilt

| v1 component | v1 problem | v2 replacement |
|---|---|---|
| **Environmental Score** `= Energy/10 + Water×50 + Carbon×2` | Dimensionally incoherent (adds Wh + L + g with invented weights); scale-dependent (score grows with usage volume, so any large deployment "fails"); double-counts (carbon and water are *derived from* energy, then added to it) | No composite score exists in v2. Energy intensity per request is graded (A–E) within task classes on fixed logarithmic bands anchored to published measurements; carbon and water are reported as intensities with uncertainty bounds (FRAMEWORK.md §5.2) |
| **Benefit Score** `= Efficiency×0.4 + Quality×0.3 + Strategic×0.3` on self-rated 1–10 inputs | False precision on subjective inputs; the weights have no basis; invites gaming | Fit-for-purpose check (§5.3): three auditable yes/no questions (necessity, right-sizing, token discipline) → frugality flag F0/F1/F2+, following AFNOR SPEC 2314. Reported *beside* the grade, never blended into one number |
| **Decision Matrix (A+…F with "Prohibited")** | Thresholds arbitrary; graded absolute monthly totals, so grade = f(company size); "Prohibited" is a governance decision masquerading as arithmetic | Grade × flag guidance table (§5.4). Intensity, not totals, is graded. Mandatory-review thresholds are left to organizational policy, explicitly |
| **Per-model energy/water/carbon columns** | Water and carbon are properties of the *region and facility*, not the model — storing them per model bakes in hidden assumptions (this was v1's central methodological error). Numbers had no source, vintage, or uncertainty | Model database stores **energy only** (Wh per 1k output tokens + per-request presets), each row with source, vintage, data-quality tier (T1–T4) and low/high bounds. Carbon and water are computed from separate, sourced regional/facility tables (§4.3–4.4) |
| **Single point estimates everywhere** | The best-measured quantities in this field carry ×1.5–×3 uncertainty; hiding that is pseudo-science | Every result reports low/central/high, with interval width set by data tier (§4.5) |
| **Mitigation percentages ("40–60% reduction")** | Unsourced; some invented | Evidence-ranked lever catalogue with measured effect sizes and citations (§6) |
| **Environmental equivalents (LED hours, km driven)** | Kept in spirit — good for communication — but v1's conversion factors were uncited | Equivalents remain in the tool with sourced conversion factors and are labeled as communication aids, not results |
| **README claims ("reduce footprint 30–60%")** | Marketing numbers with no source | README states what the framework does and cites what the levers achieve |

## Removed

| Item | Reason |
|---|---|
| `SKILL.md` | Excel-to-webapp conversion instructions for an AI assistant — internal tooling notes, not framework content |
| `extract_excel_data.py` + `workbook-data.json` pipeline | Inverted architecture: the Excel was hand-edited truth extracted into the app. v2 inverts it — data tables (CSV) are the truth; the workbook is **generated** by `build_workbook.py` |
| `PULL_AND_TEST.md`, `MERGE_TO_MAIN.md`, `PULL_REQUEST.md`, `EXCEL_TO_APP_CHEATSHEET.md`, `COMPLETE_WORKFLOW.md`, `VERIFICATION_REPORT.md`, `INDEX.md`, `CLEAR_CACHE.html`, `test-assets-loading.html`, `test-calculation.html` | Session/process artifacts from earlier development, not framework deliverables. Preserved in git history |
| `USER_GUIDE.md`, `DEPLOYMENT.md` | v1-UI walkthrough and Pages setup notes; superseded by the new README and the workbook's Start Here sheet |
| `gaia-workbook-viewer.html` | v1 spreadsheet viewer built on the abolished extract pipeline |
| `assets/` (`ai-models-database.csv`, `workbook-data.json`, `README.md`) and `List of models.csv` | v1 model data without sources, uncertainty, or vintage; superseded by `data/models.csv` (every row sourced and tiered) |
| `GAIA_Complete_Tool.xlsx` (v1 workbook) | Superseded by generated `GAIA_Assessment_Tool.xlsx`; v1 file moved to `legacy/GAIA_Complete_Tool_v1.xlsx` for reference |
| `UI elements/` (v1 design mockups) | Moved to `legacy/ui-elements-v1/` — historical record of the v1 interface |
| Weekly Monitor sheet (fabricated demo data) | A monitoring log with invented numbers teaches users to trust invented numbers. v2 ships a clean usage-log template instead |
| "Support" contacts (`gaia-support@gov.example`, `learn.gov/gaia`) | Placeholder fiction |

## The one-sentence summary

**v1 had the right question and the right ingredients, but connected them with invented arithmetic; v2 connects the same question to the same ingredients through published measurements, standard formulas (SCI, ISO 14040/44, GHG Protocol), stated uncertainty, and provenance for every number.**
