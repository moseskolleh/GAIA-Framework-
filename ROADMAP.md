# GAIA Roadmap

## From estimator to instrument: the implementation plan for 2.3 → 4.0

**Companion to FRAMEWORK.md, DECISIONS.md and COMPARISON.md §4 · Drafted September 2026 against v2.2.0**

This is the build plan. COMPARISON.md §4 lists the gaps; this document turns
them, and some ambitions of its own, into ordered steps. Each step says why it
exists, what to build and which files it touches, and the test that proves it
is finished. The steps are sized so that each one can ship on its own.
Nothing here changes the principles. P1–P7 in FRAMEWORK.md §1 bind every step,
and a step that cannot meet them does not ship.

---

## 0. Where GAIA stands (v2.2.0, measured on this repository)

| Measure | Today |
|---|---|
| Current model rows that are **modelled (T4)** | **117 of 119 (98%)**. Two are T2 and none is T3 or T1. Every T3 row is a retired model. |
| Current rows that are **class-anchor placeholders** | 40. These are closed models that nothing published distinguishes. |
| Current **open-weight rows** that could be metered | 77. None has been metered. |
| **Median uncertainty interval** of current rows (high ÷ low) | **×9.2**, meaning ÷3 to ×3 around the central value |
| **Grid-factor vintage** | 2024 data for all 20 regions. There are **no African regions** and one Latin American one. |
| **Constants written as literals** | `k = 10` appears in 8 places (JS, five workbook formulas, two test sites). The tier bands appear in 3 places and the embodied default in several. |
| **What the tool sees** | Hypothetical workloads the user types in. It cannot read actual usage. |
| **Engine agreement** | 3,984 checks pass. The Python reference, the JavaScript engine and the Excel formulas agree. |
| **Web page** | 263 KB, one file, no external requests |

**How to read this.** The engineering is ahead of the evidence. The method is
sound and enforces its own rules: the build refuses bad data and three engines
check each other. But almost every number the method consumes is modelled, and
every workload it assesses is typed in by hand. The plan therefore spends its
effort on three things, in this order:

1. **Get real evidence in:** measurements, provider disclosures, and your
   actual usage.
2. **Tell the truth about what is still uncertain.** That means stating it as a
   probability and showing which factors the uncertainty comes from.
3. **Make every output verifiable** by someone who does not trust us.

---

## 1. Five bets that would make GAIA unlike anything else in the field

None of the instruments in the COMPARISON.md matrix does any of these. Together
they turn GAIA from a calculator into a measuring instrument: a tool that states
its own error, says how to reduce it, and gets more accurate as it is used.

1. **Probabilistic grades and an uncertainty budget (Phase 3).** Today GAIA
   says "grade B". It should say "grade B: 62% B, 22% A, 15% C". It should also
   show which inputs the uncertainty comes from ("model energy 94%, PUE 5%,
   grid 1%") and what obtaining a better number would buy ("a provider
   disclosure would shrink this interval from ×/÷3.1 to ×/÷1.6"). The two
   levers in the catalogue that reduce uncertainty rather than consumption then
   get an effect size for the first time. The maths is closed-form, so it still
   runs in a spreadsheet.
2. **Your real usage, without it leaving your browser (Phase 2).** Drop in a
   provider usage export or OpenTelemetry spans. GAIA then assesses the tokens
   you actually used, including measured cache hits and reasoning tokens, and
   writes a conforming §8 report. The page makes no network requests, so the
   usage data stays on the user's machine.
3. **A metering commons that turns modelled rows into measured ones
   (Phase 5).** A small harness lets anyone who serves an open-weight model
   produce a measurement receipt. A physics check rejects impossible receipts,
   repeat measurements earn a "replicated" badge, and accepted receipts enter
   the database as T3. The 77 open-weight rows are the ones that can move from
   ×/÷3 to ×/÷1.15.
4. **Workloads as they actually run (Phase 4).** Agents re-send a growing
   context on every step, so their input grows quadratically with the number of
   steps. RAG, routers and guardrails are chains of calls, not one call.
   Failed agent runs are pure waste. GAIA should model all of this with closed
   forms a spreadsheet can hold.
5. **Verifiable by construction (Phase 6), plus an open disclosure format
   providers can adopt (Phase 5).** Every report carries a hash of its inputs,
   data version and method version, and anyone can re-run it and get the same
   numbers. Alongside that, a small `ai-footprint.json` schema gives providers
   one place to publish boundary-declared figures that GAIA ingests as T2
   without anyone copying numbers by hand.

---

## 2. Rules for every step (definition of done)

- **P1–P7 hold.** A step that would need an unsourced number, a composite
  score, or carbon baked into a model row does not ship.
- **All three engines change together.** Any change to the equations lands in
  the Python reference, the JavaScript engine and the workbook formulas in the
  same pull request, and the golden vectors (step 0.4) are regenerated.
  If a feature cannot be expressed in plain spreadsheet formulas, it stays
  outside the core engine. It can live in the web app or the CLI as a clearly
  labelled extra.
- **Version rules as in FRAMEWORK.md §9.** Data and additive features bump the
  minor version. Anything that changes an existing result bumps the major
  version and needs a DECISIONS.md entry that argues the change against P1–P7.
- **The page stays one file with zero external requests,** and no user data
  goes to any server GAIA runs. Step 0.7 turns this into a test.
- **Every data table carries a licence check.** A dataset whose licence does
  not allow redistribution is not shipped, however useful it would be.
- **Each step ends with a CHANGELOG entry.**

**Effort key** (one developer who knows the repo): **S** ≤ 2 days ·
**M** ≤ 2 weeks · **L** ≤ 6 weeks.

---

## 3. The phases at a glance

| Phase | Theme | Ships as | Kind |
|---|---|---|---|
| **0** | Foundations: one source for every number | 2.2.1 | Engineering only, no result changes |
| **1** | Fresh and wider evidence | 2.3.0 | Data (minor) |
| **2** | Real usage in, conforming reports out | 2.4.0 | Additive features (minor) |
| **3** | Honest numbers: probabilistic GAIA and physics model v2 | **3.0.0** | **Methodology (major)** |
| **4** | Workloads as they really run | 3.1 (additive) · **4.0** (methodology) | Mixed |
| **5** | The metering commons | continuous track, from 2.3 | Data and tooling |
| **6** | Trust: verifiable, conformant, citable | continuous track, from 2.4 | Governance and tooling |
| **7** | Reach: everywhere decisions are made | continuous track, from 2.4 | Product |

**Suggested calendar.** Q4 2026: Phases 0 and 1, and step 5.1 starts
early because Phase 3 calibration needs its data. Q1 2027: Phase 2.
Q2 2027: Phase 3 (release 3.0). H2 2027: Phase 4. Tracks 5–7 run alongside
throughout.

```
0 Foundations ──► 1 Evidence ──► 2 Usage & reports ──► 3 Probabilistic (3.0) ──► 4 Workloads (3.1/4.0)
      │                │                                   ▲
      │                └──► 5 Metering commons ────────────┘  (calibration data for 3.5)
      └──► 6 Trust ──────────► 7 Reach
```

---

## Phase 0: Foundations (2.2.1)

*Goal: make every later step cheap and safe. No published number changes.*

#### 0.1 One source for every constant · M
**Why.** Changing `k`, `S`, the tier bands, the embodied default or the Tier-4
hardware constants today means a search across JavaScript, workbook formulas
and tests. `k = 10` alone is written out in eight places.

**Build.** Add `data/constants.csv` with columns `id, value, low, high, unit,
source, vintage, note`. It covers k, S (1.4–2.0), η_hw, u (0.1–0.5), the four
tier bands, the embodied adder (0.10–0.50), the unknown-facility PUE and the
global CI fallback. `build_site.py` injects it as `GAIA_DATA.constants`.
`build_workbook.py` writes a named Constants block on the Engine sheet, and
every formula refers to it. The tests read the CSV.

**Done when.** A search for the literals finds them only in `constants.csv`.
Editing k in the CSV changes all three engines and the cross-check still
passes. Constants now fall under P1 like every other number, each with a
source and a vintage.

#### 0.2 One source for the version · S
**Why.** `VERSION` is set separately in `build_site.py`, in
`build_workbook.py` and in the FRAMEWORK.md header.

**Build.** Add a `VERSION` file that both builds read. A test asserts that the
FRAMEWORK.md header and the top CHANGELOG entry match it.

**Done when.** A release is a one-line edit plus a CHANGELOG entry.

#### 0.3 The engine as a module · M
**Why.** `tests/test_engine.py` pulls the engine out of `gaia.js` with
`@engine` markers and a regex. That works, but it is fragile, and the Python
reference exists only inside the test file.

**Build.** Move the engine into `web/engine.js`: pure functions with no DOM
access. The build concatenates it into the page, and Node tests `require` it
directly. Promote the Python reference to `gaia/engine.py`. The tests, the CLI
(step 2.3) and the calibration tools (step 3.5) all import that one file.

**Done when.** No test uses regex extraction, and the reference engine lives in
one importable Python module.

#### 0.4 Golden test vectors · S
**Build.** Generate `tests/vectors/engine-v2.json` from the reference: a few
hundred input cases with expected outputs, covering edge cases (zero tokens,
full cache, every region, facility and tier). Commit it. All three engines are
checked against the file, and the file is published so that other tools, such
as EcoLogits, can test themselves against GAIA's equations. Keep one vector
file per method major version.

**Done when.** `engine-v2.json` is in the repo, documented in README, and any
engine can be tested against it without GAIA's code.

#### 0.5 Properties as tests · S
**Why.** The principles should be executable. P3 in particular can be tested.

**Build.** Seeded randomised tests using stdlib `random`, so no new dependency:
- More output tokens never means less energy.
- A higher cache share never means more energy.
- Low ≤ central ≤ high everywhere.
- The grade is monotone in energy.
- **Changing the region never changes energy (P3).**
- Changing the model never changes CI or EWIF.

**Done when.** 10,000 random configurations pass on every CI run.

#### 0.6 Fail on workbook content drift · S
**Why.** CI currently only *warns* when the rebuilt `.xlsx` differs, because
byte comparison is noisy. That lets a real data drift through.

**Build.** Dump every cell's value and formula with openpyxl into normalised
text, compare the dumps, and fail on any difference.

**Done when.** A hand-edited workbook, or a stale one, fails CI.

#### 0.7 Browser test of the published page · M
**Build.** A Playwright test, run in CI, that checks the following:
- Every tab renders.
- A permalink restores every input exactly.
- The console shows no errors.
- **The page makes zero network requests** beyond loading its own file. This
  turns a README promise into an assertion.
- axe-core finds no serious accessibility violations. axe is a CI-only
  dependency and is not shipped in the page.
- The page is under a weight budget of 350 KB (it is 263 KB today).

**Done when.** Breaking any one of those fails the build.

#### 0.8 Split `gaia.js` into modules · M
**Why.** `gaia.js` is one 80 KB file holding eight sub-applications.

**Build.** Move the code into `web/js/{util,engine,estimate,models,charts,compare,portfolio,act,ui}.js`,
concatenated in a fixed order by `build_site.py`. No bundler and no new
dependencies. The output stays one file.

**Done when.** The generated `index.html` is functionally identical (step 0.7
passes) and no source file exceeds about 600 lines.

#### 0.9 Contributor rails · S
**Build.**
- A `Makefile` with `make build`, `make test` and `make check`.
- A pre-commit hook that rebuilds the artifacts.
- `CONTRIBUTING.md` covering the data workflow, the P1 checklist and the
  version rules.
- GitHub issue forms for *new model row*, *factor correction* and
  *measurement receipt* (step 5.2). Source and vintage are required fields.
- A PR template with a P1–P7 checklist.

**Done when.** An outside contributor can add a sourced model row without
asking anyone how.

---

## Phase 1: Fresh and wider evidence (2.3.0)

*Goal: close gaps 3, 9 and 10 from COMPARISON.md, and cover the regions where
AI is actually hosted.*

#### 1.1 Grid refresh and a staleness gate · M
**Build.** Refresh `regions.csv` to 2025 data from Ember's Global Electricity
Review 2026 release. Add a **staleness gate** to the build:
- It warns when any factor's vintage is more than 18 months old at release.
- It fails at 36 months unless the row carries a written `stale_reason`.
- The page and the workbook show the age of each factor next to it.

**Done when.** The refresh is shipped, or the failed attempt is recorded in
the CHANGELOG, as the rule in COMPARISON.md gap 10 requires. After that, stale
data can no longer ship silently.

#### 1.2 Regions where AI is actually hosted · M
**Why.** The 20 regions include no African country and only one Latin
American one, yet Kenya's roughly 90%-renewable grid and South Africa's
coal-heavy one both host cloud capacity. US grids differ several-fold from one
sub-grid to another.

**Build.** Extend `regions.csv` to at least 60 countries and zones, each with
its own source and vintage:
- **Africa:** South Africa, Kenya, Nigeria, Egypt, Morocco, Ghana
- **Latin America:** Mexico, Chile, Colombia, Argentina
- **South-East Asia:** Indonesia, Malaysia, Thailand, Vietnam
- **Gulf:** Saudi Arabia, Qatar, Israel
- **Oceania:** New Zealand
- **The rest of the EU**
- **Major US balancing areas**

EWIF gets the same treatment where it can be sourced. Where it cannot, the row
carries the global EWIF with widened bounds, and its `basis` says so.

**Done when.** Every country that hosts a hyperscale cloud region has a row.

#### 1.3 Cloud region codes → grid zones · M
**Why.** Users know `aws:eu-west-3` or `gcp:europe-west1`. They do not know
their grid zone.

**Build.** Add `data/cloud_regions.csv` with columns `provider, region_code,
city, country, grid_zone, provider_cfe_pct, source`. It covers AWS, Azure, GCP
and OCI, and major API providers' disclosed serving locations where published.
Google's published per-region carbon-free-energy percentage fills
`provider_cfe_pct`, which is market-side context shown beside, never instead
of, location-based CI (P6). The estimator gets a "cloud region" picker that
sets the region.

**Done when.** Every public region code of the four clouds resolves to a
sourced grid row.

#### 1.4 Water stress (AWARE) · M · closes gap 3
**Build.** Add an `aware_cf` column and its source (WULCA AWARE, Boulay et al.
2018) to `regions.csv`. Report **stress-weighted water (m³ world-eq)** beside
raw litres. Flag hosting where AWARE is above 10 in the result and in the
portfolio. The limitation is written into §10: country-level factors are
coarse, and basin-level factors are better.

**Done when.** Water appears as volume and as stress-weighted volume, with the
flag, in all three engines.

#### 1.5 Benchmark importers: the first current T3 rows · L · closes gap 9 (first pass)
**Build.** Two scripts:
- `tools/import_mlenergy.py`, for the ML.ENERGY leaderboard
- `tools/import_aienergyscore.py`, for AI Energy Score

Each maps benchmark entries to model rows and applies the serving-stack
correction S at import (both benchmarks are GPU-only). It writes the values as
T3 with the benchmark release, hardware and configuration in `basis` and
`source`. The importers are deterministic and their output is reviewed like
any other data PR.

**Done when.** Every current open-weight row that either benchmark covers is
T3 instead of T4. The CHANGELOG reports the new tier mix.

#### 1.6 Hardware table (data only) · S
**Build.** Add `data/hardware.csv` with columns `accelerator, precision,
peak_flops, tdp_w, flops_per_joule, source, vintage`. It covers H100 BF16 and
FP8, H200, B200 FP8 and FP4, MI300X, L40S, the TPU generations with public
specifications, and a consumer GPU and Apple silicon for local serving. In 2.3
it is reference data only. Step 3.5 uses it to re-anchor the physics model,
and step 5.2 uses it for the physics gate.

#### 1.7 Model aliases · S
**Build.** Add `data/model_aliases.csv` mapping API model identifiers, dated
snapshots and marketplace names (Bedrock, Vertex, Azure, OpenRouter) to
database rows. Patterns are anchored regular expressions, and a test ensures
that no identifier maps to two rows.

**Done when.** Phase 2 importers can resolve real usage exports without asking
the user to match models by hand.

#### 1.8 Source watcher: robots propose, humans source · M · closes gap 10
**Build.** A scheduled GitHub Action runs monthly. It checks the upstream
sources for new releases: Ember, Uptime, ML.ENERGY, AI Energy Score, and
Hugging Face model cards from tracked organisations. It then opens one issue
listing what is due for refresh. **It never writes a number.** P1 requires a
person to read the source.

**Done when.** The twice-yearly review in FRAMEWORK.md §9 starts from an
automatically generated worklist.

---

## Phase 2: Real usage in, conforming reports out (2.4.0)

*Goal: go from "estimate a hypothetical workload" to "assess what we actually
used, and produce the report", in under 15 minutes.*

#### 2.1 Usage import in the browser · L
**Build.** Drag-and-drop CSV and JSON import with versioned presets for these
formats:
- the OpenAI and Anthropic usage exports
- AWS Bedrock token metrics
- Azure OpenAI
- Google Vertex and Gemini
- OpenRouter activity
- LiteLLM spend logs
- Langfuse and Helicone exports
- **OpenTelemetry GenAI semantic-convention spans**
  (`gen_ai.request.model`, `gen_ai.usage.input_tokens`,
  `gen_ai.usage.output_tokens`)

A generic column mapper handles anything else. Where an export reports
**cached input tokens** or **reasoning tokens**, they are used directly. That
makes `c` the *measured* hit rate §4.1 asks for, and it addresses the
"reasoning tokens partly visible" limitation in §10. The output is portfolio
rows grouped by month, model and use case, with models resolved through
step 1.7.

Each preset is tested against a synthetic fixture built from the provider's
documented schema, and each is re-checked at implementation time because these
schemas change. **Files are parsed in the page and never uploaded.**

**Done when.** A real export from each of the first three presets (OpenAI,
Anthropic, OTel) becomes a portfolio in one drop.

#### 2.2 A workbook that takes real usage · M
**Build.** Change the Usage Log to carry region, facility and cache share
**per row**. Today it uses the single region and facility of the Assessment
sheet. Add an Import sheet where a pasted export is mapped through the alias
table with plain lookups, so no Power Query is needed.

**Done when.** A multi-region, multi-month inventory runs entirely in the
spreadsheet, and the cross-check covers the new formulas.

#### 2.3 Python package and command-line tool · M
**Build.** A pip-installable `gaia` package built on the step 0.3 reference
engine. Commands:
- `gaia assess usage.csv --cloud-region aws:eu-west-1 --out report.json`
- `gaia report report.json --format html|md|json`
- `gaia vectors --check`

It is tested against the golden vectors, so a team can run GAIA monthly in its
own pipeline.

**Done when.** `pip install` followed by one command produces the same numbers
as the page and the workbook.

#### 2.4 A generator for the conforming §8 report · L
**Build.** A report generator shared by the web page and the CLI. It fills all
seven §8 sections from the portfolio:
- the inventory and its boundary
- intensities, with dual carbon and tier labels
- totals
- grade and frugality flag
- a data-quality statement: the share of results in each tier and a
  generated plan for moving rows up a tier
- mitigation commitments
- factor vintages

It also adds the SCI restatement and the GHG Protocol scope mapping. Output
formats are print-ready HTML (the browser prints it to PDF), Markdown, and JSON
validated by a published schema (`schemas/gaia-report.schema.json`).

**Done when.** A report produced from a usage export passes the step 6.2
self-declared checklist with no hand edits.

#### 2.5 Exports for reporting frameworks · M
**Build.** Machine-readable tables that follow the COMPARISON.md §3 mapping:
- ESRS E1 and E3 datapoints, keyed to EFRAG's datapoint list. The ESRS are
  being simplified, so the exports track the set that is in force.
- GRI 302, 303 and 305 content-index rows
- the quantitative fields of CDP's climate and water questionnaires
- GHG Protocol Scope 2 and Scope 3 Category 1 line items
- an SCI score

Every export repeats the §2.1 note that the boundary is truncated.

**Done when.** Each export traces cell by cell to a GAIA output. That is P1,
and it is also the "no goal-washing" rule in COMPARISON.md §2.

#### 2.6 Frugality with evidence, and a right-sizing kit · M
**Why.** F0 is currently three unchecked yes/no answers.

**Build.** Each of the three §5.3 questions gets an evidence field (text or a
link) and a date. The right-sizing question requires a **right-sizing
record** with these fields:
- the candidate smaller model
- the task sample and its size
- the quality metric and the acceptance threshold
- the result and the date

A flag without evidence shows as "F0 (unevidenced)". The kit consists of a
workbook sheet and `docs/right-sizing.md`, which describe how to run the
comparison. GAIA does not judge quality. It requires the evaluation to be
written down, which is what AFNOR SPEC 2314 asks for.

**Done when.** Every F0 in a generated report can be traced to a dated
evaluation.

#### 2.7 Change analysis: rebound becomes measurable · M · closes gap 8
**Build.** Decompose the change in energy and carbon between two periods into
four effects, using additive LMDI-I (Ang 2004, 2005):
- **activity:** volume
- **mix:** the model and task structure
- **intensity:** energy per request
- **grid:** CI

LMDI leaves no residual term and needs only logarithms, so it fits in a
spreadsheet. The Change Analysis output reads like this: *"Carbon rose 26%:
activity +80%, intensity −30%, grid −4%."* That is the rebound effect, stated
as a number instead of an annotation.

**Done when.** The Usage Log produces the decomposition, and the effects add up
exactly to the total change. That identity is a test.

#### 2.8 Explain every number · M
**Build.** The engine returns a **trace**: each step of the derivation with its
equation reference (§4.x), input values, bounds, tier, source and vintage.
Every result on the page opens its trace, and the workbook's Engine sheet gets
a matching "why" column.

**Done when.** Any number on screen can be followed back to a row in `data/`
in two clicks.

---

## Phase 3: Honest numbers, probabilistic GAIA and physics model v2 (3.0.0, methodology)

*Goal: replace "the band is energy-dominated and factor uncertainty is
disclosed but not compounded" (§4.5) with an uncertainty model that is
complete, still works in a spreadsheet, and tells the user what to do next.
Every step in this phase needs a DECISIONS.md entry.*

#### 3.1 A closed-form lognormal uncertainty model · L
**Build.** Treat every factor as lognormal: model energy, PUE, CI, WUE, EWIF
and the embodied adder. Each factor's median is its central value, and its σ
comes from its stored bounds.
- **Reading of the bands.** A tier band is read as a 90% interval, which is
  "very likely" in the IPCC calibrated vocabulary: σ = ln(band) / 1.645.
  Record that choice in DECISIONS.md.
- **Products.** Carbon is a product of factors (E × PUE × CI × Q), so the log
  variances add exactly: σ² = Σσᵢ².
- **Water.** Water is a sum of two lognormal paths. It is combined by
  Fenton–Wilkinson moment matching (Fenton 1960), which takes about six
  spreadsheet cells.
- **Excel functions.** Only `EXP`, `LN`, `SQRT` and `NORM.S.DIST` are used.

The interval becomes complete rather than energy-only, and §4.5 and §10 are
rewritten to match.

**Done when.** All three engines produce identical σ values, and the step 3.8
Monte Carlo check confirms them.

#### 3.2 Probabilistic grades · M
**Build.** P(grade) = Φ((ln b_upper − ln E)/σ) − Φ((ln b_lower − ln E)/σ), for
each A–E band. The letter is still the grade of the central value, so there is
no discontinuity with 2.x. It is now shown with its confidence.

**Worked example.** GPT-5.6 Sol (frontier class anchor) on the Standard
profile, with the facility unknown, has a central value of 0.50 Wh, which is a
B. Under 3.1 its 90% interval is 0.16–1.55 Wh, and the grade reads
**B: 62% B, 22% A, 15% C**.

The §5.4 guidance gains a row: when no grade reaches 50%, the grade is **not
resolved**, and the first action is levers 8 and 9 (get better data), not
re-architecture.

**Done when.** Grade probabilities appear in the estimator, portfolio, report
and workbook, and they sum to 1 (a test).

#### 3.3 Uncertainty budget and value of information · M
**Build.** Each factor's share of the log-variance, in the style of a GUM
uncertainty budget (JCGM 100:2008), plus a "what would narrow this" line.

**Worked example (same case, carbon).**
- The budget is **model energy 94%, PUE 5%, grid CI 1%**.
- A provider disclosure (T4 → T2) would shrink the interval from **×/÷3.1 to
  ×/÷1.6**, and the budget becomes model 69%, PUE 26%, CI 5%.
- For an open-weight deployment, metering (T4 → T1) gives **×/÷1.36**, and
  **PUE becomes the dominant uncertainty at 67%**.

So the budget also names the next number to obtain: the host's measured PUE.
Levers 8 and 9 now carry an effect size in the same currency as every other
lever.

**Done when.** Each result shows its budget, and the Act tab ranks
"improve data" actions by how much they narrow the interval.

#### 3.4 Comparisons that account for shared error · M
**Why.** Most of a T4 row's ×/÷3 comes from the hardware constant and the
utilisation assumption, and every physics-derived row shares those. So the
*ratio* between two physics rows is known much better than either value.
Two rows that share a class anchor are identical by construction.

**Build.** Split σ_T4 into a **shared** part (η_hw, u) and a **row-specific**
part, with the split taken from step 3.5. The Compare tab then states
P(option B uses less than option A) using that correlation structure.
- **Example.** Gemma 4 12B against Gemma 4 31B is about **84%** if the two
  rows are treated as independent. It is **above 99%** once their shared
  hardware error is recognised. That figure assumes an illustrative
  row-specific spread of ×/÷1.5, which step 3.5 will calibrate.
- **Pairs sharing an anchor** read **"indistinguishable: nothing published
  separates these"**, which is exactly the §10 limitation, now visible at the
  moment of choice.

**Done when.** Every pairwise comparison shows the probability, and two rows
sharing an anchor always show 50% with the explanation.

#### 3.5 Calibrate the physics model against measurements; re-anchor the hardware · L · closes gap 11
**Build.** Write `tools/calibrate.py`, which does the following:
- It regresses every measured value (the T2 and T3 rows, the step 1.5 imports
  and the step 5.2 receipts) against the T4 prediction for the same model.
- It reports the bias (the geometric mean of measured ÷ predicted) and the
  spread (the geometric standard deviation).
- It splits the spread into shared and row-specific parts, which step 3.4
  needs.

The ×3 band then rests on evidence rather than assumption. It is kept if the
evidence supports it and changed only through a DECISIONS.md entry. At the same
time, re-anchor η_hw and u against `hardware.csv` and published serving
utilisation, as **versioned constants**. The calibration report is regenerated
in CI, and a fitted band that drifts beyond a threshold opens a methodology
review.

**Done when.** `docs/calibration.md` shows the residual plot and statistics,
and the T4 constants cite it.

#### 3.6 Long-context attention and an evidence-based k · M
**Why.** The physics model counts 2N FLOPs per token. At long contexts, which
are now normal for agents and RAG, attention adds 2·n_layer·n_ctx·d_attn per
token (Kaplan et al. 2020). For models with sliding-window, grouped-query
(GQA) or latent (MLA) attention the extra cost is smaller, but it is not zero.

**Build.** Record `n_layers`, `d_model` and `attention_type` in `models.csv`
for open-weight rows, read from their published configurations. Apply the
term for contexts above a documented threshold. Re-estimate the prefill ratio
k (fixed at 10 today, with an empirical range of 5–20) from the measured
prefill/decode splits in the step 1.5 and step 5.1 data.

**Done when.** Long-context T4 estimates include attention, and k carries a
source.

#### 3.7 Method versioning · M
**Build.** Every assessment records a `method_version` and a `data_version`.
The engines can run the 2.x method on request (`--method 2`, or a hidden
workbook switch). The 2.x golden vectors keep passing, so an assessment from
2026 still reproduces exactly in 2028.

**Done when.** `engine-v2.json` and `engine-v3.json` both pass on the 3.0
code.

#### 3.8 A Monte Carlo cross-check (tests only) · S
**Build.** Draw 100,000 samples per case (seeded, stdlib) and compare the
percentiles with the closed-form results of step 3.1, especially the
Fenton–Wilkinson water sum. The tolerance is recorded in the test.

**Done when.** The closed-form approximations are demonstrated in the test
suite, not just assumed.

**Release gate for 3.0.**
- One DECISIONS.md entry per methodology change.
- Both vector sets pass.
- The Monte Carlo check passes.
- CHANGELOG shows side by side how the grades of the worked examples moved.
- A "what changed for my assessment" note is published for existing users.

---

## Phase 4: Workloads as they really run (3.1 additive, 4.0 methodology)

#### 4.1 Workload graph: pipelines of stages · L · 3.1
**Build.** A use case becomes a list of **stages**. Each stage has a model,
calls per task, a token profile and a cache share, and the stages are summed.
This is the existing §4 equation applied to several calls, so no new physics
is involved. It covers:
- **RAG:** embed the query, re-rank, generate
- **Routers:** a classifier, then the large model on a fraction p of requests
  and the small model on 1 − p
- **Guardrails:** a moderation call per request
- **Cascades**

The per-task-outcome unit R4 becomes computable. The workbook gets a Pipeline
sheet with up to N stage rows per use case.

**Done when.** A router pipeline and a RAG pipeline reproduce their hand
calculations in all three engines.

#### 4.2 Agent loops · M · 3.1
**Build.** An agent runs n steps over a base context c₀. Each step adds Δ
tokens of tool output and model output. Total input is therefore
**n·c₀ + Δ·n(n−1)/2**, which grows quadratically with the number of steps.
Inputs: steps, c₀, Δ, output per step, cache share, retry rate, parallel
sub-agents, and success rate p. The output is energy **per successful task**:
E ÷ p for independent retries. Failed runs count, because reliability is an
environmental lever. This makes three things quantifiable:
- context compaction (resetting the context every m steps)
- prompt caching, which becomes the largest single lever for agents
- the point at which input processing overtakes generation

**Done when.** The estimator has an "Agent" mode, and the lever catalogue gains
"compact agent context", with a computed effect and a cited basis.

#### 4.3 Modalities · L · 4.0
**Build.** New functional units and task classes, each with bands anchored to
published measurements (AI Energy Score tasks; Luccioni, Jernite & Strubell
2024):
- **image generation:** per image
- **speech recognition:** per audio minute
- **speech synthesis:** per character or per minute
- **embeddings:** per 1M tokens
- **video generation:** per second

The rows go in a new `models_media.csv`. **No modality ships without sourced
bands (P1).**

**Done when.** At least image generation, speech recognition and embeddings are
graded, and each band cites its anchor.

#### 4.4 Carbon-aware timing: hourly profiles, and marginal where sourced · L · 4.0 · closes gap 2
**Build.** Add `data/ci_profiles/<zone>.csv`: typical-day profiles of 24 hours
× 12 months from openly licensed hourly data. The optional hourly mode
quantifies lever 7 in the user's own numbers ("moving this batch job to
02:00–06:00 cuts its carbon by X%"). Marginal intensity is used only where a
redistributable, sourced dataset exists, and the difference between average and
marginal intensity is explained. The annual average stays the default
reporting basis, in line with GHG Protocol location-based accounting.

**Done when.** Lever 7 shows a computed effect for any zone that has a
profile.

#### 4.5 Materials (ADPe) as a fourth metric · M · 4.0 · closes gap 4
**Build.** Abiotic depletion (kg Sb-eq) from Boavizta and EcoLogits factors,
tier-labelled, **reported, not graded**. It is grouped with carbon and water
under P3.

**Done when.** The estimator, the report and the workbook show ADPe with
bounds.

#### 4.6 Fine-tuning and training estimator · L · 4.0 · closes gap 7
**Build.** Upgrade §4.7 to an estimator parameterised on LLMCarbon's approach,
for organizations that fine-tune, covering full fine-tuning against LoRA and
amortisation over tokens served. Training stays **off by default**, and the
GHG Protocol double-counting warning stays.

**Done when.** A fine-tuned open-weight deployment can be assessed from end to
end, with training shown as a separate, optional line.

---

## Phase 5: The metering commons (continuous, from 2.3)

*Goal: turn the 77 open-weight rows from modelled to measured, and put market
pressure on the closed rows.*

#### 5.1 `gaia-meter`, a measurement harness · L
**Build.** `meter/` is a small Python tool with these properties:
- **Workload.** It runs a fixed prompt set, matched to the `grading.csv` token
  profiles, against any OpenAI-compatible local endpoint: vLLM, SGLang, TGI,
  llama.cpp or Ollama.
- **Energy readings.** It reads GPU energy from the NVML total-energy counter
  rather than sampled power, CPU and DRAM energy from RAPL where available,
  and optionally a PDU or wall meter.
- **Concurrency.** It measures at several concurrency levels.
- **Output.** It reports Wh per 1k output tokens at the IT boundary,
  including the idle share.
- **Receipt.** It writes a receipt JSON recording hardware, driver, serving
  engine and version, precision and quantisation, concurrency, and a hash of
  the prompt set.

For the person running it, the result is **T1 for their own deployment**. The
tool wraps ML.ENERGY and Zeus concepts rather than competing with them.

**Done when.** A user with one GPU and a vLLM server gets a receipt in under an
hour.

#### 5.2 From receipts to the database, with a physics gate · M
**Build.** Receipts are submitted by PR into `data/measurements/`. CI does
three things:
- It validates the schema.
- It applies a **physics gate**: the implied FLOPs per joule, 2·N_active·tokens
  ÷ energy, may not exceed the hardware's peak from `hardware.csv`. An
  impossible measurement is rejected automatically.
- It aggregates the receipts into `models.csv` as **T3** for everyone else. A
  community measurement is an independent benchmark for others, not a
  measurement of their own deployment.

Two independent receipts that agree within ×1.3 earn a **replicated** badge.

**Done when.** 10 receipts have been merged and at least 3 replicated.

#### 5.3 Bring your own logs · S
**Build.** Import an existing CodeCarbon `emissions.csv`, Zeus or DCGM log
together with a token count, and get your own T1 figure without running the
harness.

#### 5.4 Utilisation curves and a new lever · M
**Build.** Publish energy per token against concurrency for each measured
model and hardware pair. Users then pick their operating point instead of
assuming u = 0.3. This adds the lever **"raise serving utilisation /
right-size replicas"**, with a measured effect. Idle capacity is waste the
self-hoster controls.

#### 5.5 Provider Disclosure Index · M
**Build.** A per-provider table computed only from public facts already in the
database:
- parameter disclosure
- a full-stack per-request figure with a stated boundary
- water, region and PUE disclosure
- market-based CI
- third-party assurance
- machine-readable publication (step 5.6)

The criteria are published, a right-of-reply process exists, and the wording
contains no adjectives. It is recomputed each release and tracked over time.
This is lever 9 made visible, and the market pressure the framework says is
the only route to closed-row improvement.

**Done when.** The index appears on the page and in the workbook, with its
methodology in `docs/disclosure-index.md`.

#### 5.6 `ai-footprint.json`, an open disclosure format · M
**Build.** A small JSON Schema that a provider can publish at
`/.well-known/ai-footprint.json` or in a model card. It carries per-model
energy per 1k output tokens (central, low, high) with a declared boundary,
plus measurement period, hardware, method, serving regions, PUE, WUE,
market-based CI and assurance. GAIA ingests any valid file as T2 with no hand
copying. A crosswalk maps each field to the EU AI Act Annex XI documentation
items and the GPAI Code of Practice model-documentation form, so that one
publication serves several audiences. It is offered to the Green Software
Foundation's SCI for AI work as a contribution, not kept as a GAIA-owned
standard.

A **procurement kit** comes with it: RFP clauses and a supplier questionnaire
that ask for exactly these fields.

**Done when.** The schema, the validator, the crosswalk and the kit are
published, and one real file (even a self-published example) is ingested
from end to end.

---

## Phase 6: Trust, meaning verifiable, conformant and citable (continuous, from 2.4)

#### 6.1 A reproducibility hash and a Verify tab · S
**Build.** Every report carries a SHA-256 over its canonicalised inputs, data
version and method version. A **Verify** tab takes a report JSON, recomputes
it offline (using SubtleCrypto, with no network), and answers either
"identical" or "these numbers differ".

**Done when.** Anyone can check a published GAIA report without trusting its
author. That is assurance-lite at zero cost.

#### 6.2 Conformance levels and a report label · M · closes gap 5
**Build.** Three levels:
- **Self-declared:** a checklist evaluated automatically from the report. It
  checks that all seven §8 sections are present, the boundary is stated,
  vintages are listed and frugality evidence exists.
- **Peer-reviewed.**
- **Assured:** a third party verifies the tier labels, the boundary and the
  evidence.

The report gets a label in the style of an energy label, as an SVG. It shows
grade and confidence, frugality flag, tier mix, method version and the hash.

**Done when.** The checklist ships as a workbook sheet and a JSON rule set,
and the label renders from any report.

#### 6.3 Standards crosswalks · M · closes gap 1
**Build.** Clause-by-clause conformance tables against ISO/IEC TR 20226:2025
and ITU-T L.1801, and an SCI for AI score export in the Green Software
Foundation format. Each crosswalk records the revision it was checked
against, and the source watcher (step 1.8) tracks new revisions.

#### 6.4 Target pathways · S · closes gap 6
**Build.** A guidance note, plus Usage Log tracking, that links Module A′
intensity targets to absolute SBTi-style trajectories, while keeping clear
that grades are not targets.

#### 6.5 Citable and externally reviewed · M
**Build.**
- A `CITATION.cff` file and a Zenodo DOI for every release.
- A JOSS paper for the software.
- A methods paper on the probabilistic grading and the calibrated physics
  model.
- An external methodology review panel of two to three named reviewers,
  whose reviews are published in `reviews/`.
- An errata page generated from the CHANGELOG corrections.

**Done when.** GAIA can be cited by version, and its method has a published
outside review.

---

## Phase 7: Reach, meaning everywhere decisions are made (continuous, from 2.4)

#### 7.1 `gaia-otel`: footprint as a production metric · L
**Build.** An OpenTelemetry span processor for Python and JavaScript. It reads
the GenAI semantic-convention attributes on each LLM span and adds
`gaia.energy_wh` (low, central, high), `gaia.carbon_g`, `gaia.water_ml` and
`gaia.tier`. Exports go to the user's own backend: Grafana, Datadog, Honeycomb
or anything that speaks OTel. A Grafana dashboard JSON is included. The
footprint then sits next to latency and cost, and is measured continuously
rather than once a year.

**Done when.** One line of setup in a Python app adds footprint attributes to
every LLM span, and the numbers match the golden vectors.

#### 7.2 A guided first assessment · M
**Build.** A five-screen walk through Ground, Assess, Interpret and Act for
first-time users. It ends in the §8 report. The expert interface stays as it
is.

**Done when.** A new user, observed in testing, goes from opening the page to
holding a report in under 15 minutes.

#### 7.3 Offline-first installable app · S
**Build.** A web manifest and a service worker, so the page installs and works
with no connectivity, which matters for field use. The page still makes zero
external requests.

#### 7.4 Languages · M
**Build.** A string catalogue for the page and the workbook. French comes
first, because of AFNOR, the EU and francophone Africa, followed by Spanish,
Portuguese and German. Numbers and units are formatted for the locale.

#### 7.5 Embeds and badges · S
**Build.** An embeddable `<gaia-estimate>` element and an SVG badge for model
cards and READMEs, for example *"GAIA B (62%) · T3 · Standard workload"*.
Each badge links to the reproducible permalink.

#### 7.6 Case studies and a notebook · M
**Build.** Three worked archetypes, each with a full report: a customer-support
assistant, a coding agent and a document-processing pipeline. Also a
15-minute tutorial and a Jupyter notebook that uses the Python package.

#### 7.7 Practise what we preach · S
**Build.** The page reports its own footprint: its transfer size, and an
estimate from a sourced web-energy model. The step 0.7 weight budget enforces
it.

---

## The first ten moves (start here)

These are ordered so that each move makes the next one cheaper, and so that
something visible ships every few weeks.

1. **0.1** Put the constants in `data/constants.csv`.
2. **0.2 and 0.3** Add the `VERSION` file, make the engine a module, and
   promote the Python reference.
3. **0.4 and 0.5** Add the golden vectors, and the properties as tests
   (P3 becomes executable).
4. **0.7** Add the browser test, including the zero-network assertion.
5. **1.1** Refresh the grid to 2025 data and add the staleness gate.
6. **1.2 and 1.3** Add the African, Latin American, Asian and Gulf regions,
   and the cloud-region-code map.
7. **1.5** Import ML.ENERGY and AI Energy Score. This produces the first
   *current* T3 rows. Start 5.1 alongside it.
8. **2.1** Import usage in the browser, starting with the OpenAI, Anthropic
   and OTel presets.
9. **2.4** Build the generator for the conforming §8 report.
10. **3.1–3.3 as a labelled preview.** Show probabilistic grades and the
    uncertainty budget behind a "preview" toggle, so users can react before
    3.0 fixes the method.

---

## What GAIA will not do

These are deliberate, and each one has a reason.

- **No composite score, ever.** DECISIONS.md explains why the v1 scores were
  removed. Probabilistic grades are still grades, and the (grade, flag) pair is
  still the result.
- **No LLM-estimated numbers in `data/`.** Automation may *propose* sources to
  check (step 1.8). A person reads the source and writes the value. P1 has no
  exception for convenience.
- **No backend that holds user data.** The page makes zero requests, the CLI
  runs locally, and the SDK exports only to the user's own telemetry.
- **No offsetting claims.** Market-based CI is shown beside location-based,
  never instead of it (P6). GAIA will never print "carbon-neutral AI".
- **No "AI for good" benefit scoring.** It is out of scope, for the same reason
  ISO/IEC TR 20226 leaves it out. The frugality flag is where cost meets
  purpose.
- **No grades on carbon or water.** They are properties of the region and the
  facility (P3). Grading them would grade the wrong decision.
- **No unlicensed data.** A dataset GAIA cannot redistribute is a dataset GAIA
  does not ship.

---

## Success measures

| Measure | 2.2.0 (today) | Target at 3.0 | Target end of 2027 |
|---|---|---|---|
| Current rows that are **not** T4 | 2 of 119 (2%) | ≥ 30% | ≥ 50% |
| Current open-weight rows with a measurement (T3 or T1) | 0 of 77 | ≥ 50% | ≥ 80% |
| Median high ÷ low interval, current rows | ×9.2 | ≤ ×6, **reached through evidence, not by narrowing assumptions** | ≤ ×4 |
| Age of the oldest grid factor at release | 2024 data | ≤ 18 months | ≤ 18 months |
| Countries and zones, plus cloud-region codes resolved | 20 (none in Africa) / 0 | ≥ 60 / all four major clouds | ≥ 80 / + API providers |
| Constant literals outside `constants.csv` | many (k alone: 8) | 0 | 0 |
| Engines tested against the published vectors | 3 internal | 3 internal + CLI | + ≥ 1 external tool |
| Time from a usage export to a conforming §8 report | not possible in-tool | < 15 min | < 10 min |
| Community measurement receipts (replicated) | 0 | ≥ 25 (≥ 5) | ≥ 100 (≥ 25) |
| Providers publishing machine-readable footprint data | 0 | the format is published | ≥ 1 |

---

## Risks and how the plan handles them

| Risk | Mitigation |
|---|---|
| **The plan is large for one maintainer** | Every step ships on its own; the first ten moves deliver visible value early; Phase 0 contributor rails and step 1.8 automation cut the per-release cost |
| **Spreadsheet function support** (`NORM.S.DIST` in LibreOffice, Google Sheets, and the `formulas` evaluator used in CI) | Spike it at the start of step 3.1. If it fails, fall back to a polynomial approximation of Φ in plain arithmetic (Abramowitz & Stegun 26.2.17), which is portable and deterministic |
| **Usage export schemas change** | Presets are versioned fixtures; the generic column mapper is always available; a failing preset degrades to manual mapping, never to a silent wrong number |
| **Bad or gamed community measurements** | The physics gate against hardware peak, replication badges, human review, and receipts that record the full configuration |
| **Reputational or legal pushback on the Disclosure Index** | Public facts only, published criteria, right of reply, no adjectives, and a history kept per release |
| **Engines drift as the method grows** | Golden vectors per method version, the Monte Carlo cross-check, and the rule that anything not spreadsheet-tractable stays out of the core |
| **Licensing of new datasets** (hourly CI, AWARE, benchmarks) | A licence column in every new table; the build refuses data without one |
| **3.0 changes grades users have already reported** | Method versioning (step 3.7) keeps old assessments reproducible; the release ships a "what changed for my assessment" note |

---

## Traceability: every known gap maps to a step

| Source | Gap or limitation | Closed by |
|---|---|---|
| COMPARISON §4 #1 | Formal standardisation | 6.3 |
| COMPARISON §4 #2 · FRAMEWORK §10 | Hourly or marginal grid carbon | 4.4 |
| COMPARISON §4 #3 · FRAMEWORK §10 | Water-stress context | 1.4 |
| COMPARISON §4 #4 | Multi-criteria (materials) | 4.5 |
| COMPARISON §4 #5 | Assurance pathway | 6.1, 6.2 |
| COMPARISON §4 #6 | Target-setting pathways | 6.4 |
| COMPARISON §4 #7 | Training-phase depth | 4.6 |
| COMPARISON §4 #8 · FRAMEWORK §10 | Rebound effects | 2.7 |
| COMPARISON §4 #9 | Independent per-inference measurement | 1.5, 5.1–5.4 |
| COMPARISON §4 #10 · FRAMEWORK §10 | Factor and coverage currency | 1.1, 1.8 |
| COMPARISON §4 #11 · FRAMEWORK §10 | Hardware drift in the T4 anchor | 1.6, 3.5 |
| FRAMEWORK §4.5 | Factor uncertainty disclosed, not compounded | 3.1, 3.8 |
| FRAMEWORK §10 | Class anchors do not distinguish models | 3.4, 5.5, 5.6 |
| FRAMEWORK §10 | Reasoning tokens only partly visible | 2.1 (metered reasoning tokens) |
| FRAMEWORK §5.3 | Frugality answers are unevidenced | 2.6 |
| Not yet recorded | Agent and long-context workloads | 3.6, 4.1, 4.2 |
| Not yet recorded | Non-text modalities | 4.3 |

---

## References for the methods this plan introduces

- Ang, B. W. (2004). Decomposition analysis for policymaking in energy: which is
  the preferred method? *Energy Policy* 32(9). And Ang (2005), The LMDI approach
  to decomposition analysis: a practical guide, *Energy Policy* 33(7). Used in
  step 2.7.
- Boulay, A.-M. et al. (2018). The WULCA consensus characterization model for
  water scarcity footprints (AWARE). *Int. J. Life Cycle Assessment* 23. Used
  in step 1.4.
- Fenton, L. (1960). The sum of log-normal probability distributions in
  scatter transmission systems. *IRE Trans. Communications Systems*. Used in
  step 3.1.
- JCGM 100:2008 (GUM), *Evaluation of measurement data: guide to the
  expression of uncertainty in measurement*, and JCGM 101:2008 (its Monte Carlo
  supplement). Used in steps 3.3 and 3.8.
- Kaplan, J. et al. (2020). Scaling laws for neural language models.
  arXiv:2001.08361, for per-token forward FLOPs including the attention term.
  Used in step 3.6.
- Mastrandrea, M. D. et al. (2010). IPCC guidance note on consistent treatment
  of uncertainties, for the calibrated likelihood language. Used in step 3.1.
- OpenTelemetry semantic conventions for generative AI (`gen_ai.*`
  attributes). Used in steps 2.1 and 7.1.
- ML.ENERGY Leaderboard and the Zeus library; AI Energy Score. Used in
  steps 1.5 and 5.1.
- Luccioni, Jernite & Strubell (2024). Power hungry processing. *FAccT*. Used
  in step 4.3.

Sources already cited in FRAMEWORK.md §11 are not repeated here.
