# Changelog

All notable changes to the GAIA Framework. Versioning is semantic: factor-table
refreshes bump the minor version; methodology changes bump the major version and
require a documented rationale against principles P1–P7 (FRAMEWORK.md §9).

Errors in published numbers are corrected in the data table with an entry here,
never silently.

---

## 2.2.0 — 2026-09-16

The models-and-interface release. The model database triples in size and gains an
openness axis; the web estimator becomes a generated artifact of the same data
tables that produce the workbook; and the three implementations of the §4
equations are now cross-checked by a test rather than by hope.

### Model database — 26 → 135 rows

- **Frontier models refreshed to September 2026** across OpenAI, Anthropic,
  Google and Meta, from provider model cards and release notes. Superseded rows
  are retained with `status = legacy` so year-on-year comparison stays possible;
  they are hidden from default views.
- **85 open-weight rows**, up from 9 — the DeepSeek, Qwen, Kimi, GLM, MiniMax,
  Hunyuan, MiMo, InternLM, Ling/Ring, Step and ERNIE families alongside gpt-oss,
  Gemma, Llama, Mistral, Nemotron, Phi, Olmo, Falcon, Granite, Command, SmolLM,
  Jamba, LFM, Apertus, EuroLLM and Comma. 33 providers in total.
- **New columns:** `openness`, `license`, `architecture`, `params_total_b`,
  `params_active_b`, `context_window`, `released`, `status`.
- **Tier-4 rows are now derived, not typed.** Every physics-estimated row records
  its derivation inline as `T4-physics(A=<active params>)`, and
  `tests/test_engine.py` re-derives it from the framework constants and fails if
  the stored value has drifted. Energy scales with *active* parameters, which for
  a sparse model can be a twentieth of the total.
- **Class anchors documented** (FRAMEWORK.md §4.5) for closed models with no
  parameter disclosure, calibrated against the only two full-stack disclosures in
  the field. Two rows sharing an anchor are a statement about missing disclosure,
  not a finding that the models are equally efficient.
- **Bounds now round outward.** Two-significant-figure rounding could previously
  narrow an interval below what its tier permits; low bounds round down and high
  bounds round up, and the build refuses to publish a row that breaks the rule.

### Methodology

- **Cached input tokens** enter the energy equation:
  `E_IT = e_out × (T_out + T_in × (1 − c) / 10) / 1000`. A prompt-cache hit skips
  prefill, so those input tokens carry no energy. Output tokens are never cached.
  Implemented identically in the spreadsheet, the web estimator and the reference.
- **§4.8 Open weights and the path to T1** — openness is recorded as a
  *measurability* flag: an open-weight deployment can be metered to T1, a closed
  API row cannot rise above T2 without the provider's cooperation.
- **Mitigation catalogue: 8 → 10 levers**, adding sparse-architecture serving and
  metering an open-weight deployment. The two levers that reduce *uncertainty*
  rather than consumption are labelled as such.
- **Limitations expanded**: the Tier-4 hardware anchor is documented as
  conservative and dated (H100-class BF16 at u = 0.3, while fleets move to FP8/FP4
  on newer silicon), class anchors are documented as non-discriminating, and
  per-provider coverage currency is documented as varying.

### Tools

- **`index.html` is now a build artifact.** `build_site.py` generates it from
  `web/template.html`, `web/gaia.css`, `web/gaia.js` and `data/*.csv`. The page
  and the workbook can no longer drift apart, and the data blob is no longer
  hand-synchronised. The page remains a single self-contained file with no
  external requests — no fonts, no CDN, no analytics.
- **The web estimator becomes an application**: model explorer with filters,
  search, sorting and a log-scale energy chart with uncertainty whiskers;
  scenario comparison; a portfolio inventory with grade distribution and
  contribution ranking; per-lever savings computed against your configuration;
  CSV/JSON export; shareable permalinks that restore every input; a print
  stylesheet; a theme toggle; and keyboard-navigable tabs.
- **New workbook sheet, "Scenario Compare"** — four deployment options side by
  side on one workload, with its own formula chain and a difference-against-
  baseline row.
- **`tests/test_engine.py`** evaluates the Python reference, the JavaScript
  engine and the workbook's own Excel formulas on the same cases and fails if any
  disagree. It also validates every data row against the framework's rules and
  checks that the published page carries exactly the CSV data.
- **`build_site.py` validates before it publishes**: bounds that do not bracket a
  central value, bands narrower than their tier permits, a PUE below 1.0, an
  empty source (P1) or non-increasing grade bands all fail the build.
- **CI** (`.github/workflows/build.yml`) rebuilds both artifacts, fails if the
  committed `index.html` is stale, and runs the cross-engine test.
- **`data/frameworks.csv` and `data/standards.csv`** replace the hard-coded
  comparison tables; the workbook sheet and the web page now render the same rows.

### Known gaps in this release

- Grid carbon intensity and facility factors are unchanged (Ember 2024 data,
  Uptime Institute 2025). A refresh was attempted and could not be sourced within
  this pass; the `vintage` columns say so.
- xAI and Amazon rows are carried forward from the 2025 database without
  re-verification, and say so in their `basis` field. Their current lineups could
  not be confirmed in this pass.
- No new independent per-inference benchmark data was incorporated; the T2/T3
  anchors remain the 2025 disclosures and measurements.

---

## 2.1.0 — 2026-07-06

- Added the **SDG & Reporting Map**: GAIA outputs mapped onto UN SDG targets, GRI
  302/303/305, ESRS E1/E3, IFRS S2, CDP, SBTi and UN Global Compact principles,
  shipping as a workbook sheet generated from `data/alignment.csv`.
- Added **COMPARISON.md**: the full capability matrix against every framework in
  the field, plus the gap-analysis roadmap.
- Extended the framework crosswalk with ISO/IEC TR 20226:2025 and ITU-T L.1801.

## 2.0.0 — 2026

Complete rebuild on published science. The founding idea of GAIA 1.0 — that AI's
environmental cost should be visible at the moment of decision — was kept;
everything between the idea and the answer was replaced.

- **Separated what varies independently (P3).** Model determines energy per
  token; facility determines overhead and on-site water; grid determines carbon
  and off-site water. GAIA 1.0 baked a region's carbon into each model's row.
- **Removed the composite score.** The v1 "benefit score"
  (`Efficiency×0.4 + Quality×0.3 + Strategic×0.3` on self-assessed 1–10 inputs)
  was false precision on subjective data. The pair (grade, frugality flag) is the
  result, and no dimensionless composite exists anywhere in GAIA 2.0.
- **Added data-quality tiers and uncertainty bounds.** Every energy figure is
  T1/T2/T3/T4 with a band of ×1.15 / ×1.5 / ×2 / ×3, and every result is reported
  low / central / high.
- **Added dual carbon reporting** (location- and market-based, never blended) and
  the two-path water model (on-site cooling plus off-site generation).
- **Made the workbook a build artifact** generated by `build_workbook.py` from
  `data/*.csv`.

See DECISIONS.md for what was kept, rebuilt, or removed from v1, and why.
