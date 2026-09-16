/* ==========================================================================
   GAIA Framework — estimator application (source; inlined by build_site.py)

   Zero dependencies. The engine below implements the Module A equations of
   FRAMEWORK.md section 4 and MUST stay identical to build_workbook.py and the
   generated Excel workbook. tests/test_engine.py cross-checks both.
   ========================================================================== */
"use strict";

(function () {

const D = window.GAIA_DATA;
const MODELS = D.models, REGIONS = D.regions, FACILITIES = D.facilities;
const GRADING = D.grading, MITIGATION = D.mitigation, EQUIVALENTS = D.equivalents;
const FRAMEWORKS = D.frameworks, ALIGNMENT = D.alignment, STANDARDS = D.standards;

const TIER_NAMES = { T1: "measured", T2: "disclosed", T3: "benchmarked", T4: "modelled" };
const TIER_BAND = { T1: "×/÷ 1.15", T2: "×/÷ 1.5", T3: "×/÷ 2", T4: "×/÷ 3" };
const K_IN = 10;                 // input tokens cost 1/K_IN of an output token
const STORE_KEY = "gaia.portfolio.v2";
const THEME_KEY = "gaia.theme";

/* ---------------------------------------------------------------- helpers */
const $ = (id) => document.getElementById(id);
const qs = (sel, root) => (root || document).querySelector(sel);
const qsa = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

function el(tag, attrs, kids) {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "class") n.className = attrs[k];
    else if (k === "text") n.textContent = attrs[k];
    else if (k === "html") n.innerHTML = attrs[k];
    else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
  }
  if (kids) for (const c of [].concat(kids)) if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return n;
}
function svgEl(tag, attrs) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (attrs) for (const k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
  return n;
}
function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
function numOr(v, d) { const n = Number(v); return isFinite(n) ? n : d; }

/* Three significant figures — more digits than the uncertainty band supports
   would be pseudo-precision (P2). */
function sig(x, digits) {
  const d = digits || 3;
  if (x === null || x === undefined || !isFinite(x)) return "–";
  if (x === 0) return "0";
  const mag = Math.floor(Math.log10(Math.abs(x)));
  if (mag >= d) return Number(x.toPrecision(d)).toLocaleString("en-US");
  const dp = Math.max(0, d - 1 - mag);
  return x.toLocaleString("en-US", { maximumFractionDigits: Math.min(dp, 8) });
}
/* Unit-adaptive formatters: keep the reader in a magnitude they can picture. */
function fmtWh(wh) {
  if (!isFinite(wh)) return "–";
  if (wh < 1) return sig(wh) + " Wh";
  if (wh < 1000) return sig(wh) + " Wh";
  return sig(wh / 1000) + " kWh";
}
function fmtKWh(kwh) {
  if (!isFinite(kwh)) return "–";
  if (kwh >= 1e6) return sig(kwh / 1e6) + " GWh";
  if (kwh >= 1000) return sig(kwh / 1000) + " MWh";
  if (kwh < 0.1 && kwh > 0) return sig(kwh * 1000) + " Wh";
  return sig(kwh) + " kWh";
}
function fmtKg(kg) {
  if (!isFinite(kg)) return "–";
  if (kg >= 1000) return sig(kg / 1000) + " t CO₂e";
  if (kg < 0.1 && kg > 0) return sig(kg * 1000) + " g CO₂e";
  return sig(kg) + " kg CO₂e";
}
function fmtL(l) {
  if (!isFinite(l)) return "–";
  if (l >= 1e6) return sig(l / 1e6) + " ML";
  if (l >= 10000) return sig(l / 1000) + " m³";
  return sig(l) + " L";
}
function fmtRange(lo, hi, f) { return f(lo) + " – " + f(hi); }
function pct(x) {
  const a = Math.abs(x * 100);
  // Never round 99.86% up to "100%" — that would read as "eliminated entirely".
  const s = a >= 99.95 && a < 100 ? "99.9" : sig(a, a < 10 ? 2 : 3);
  return (x >= 0 ? "+" : "−") + s + "%";
}

let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}
function download(name, mime, text) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function csvCell(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function toCSV(rows) { return rows.map(r => r.map(csvCell).join(",")).join("\n"); }

/* ------------------------------------------------------------- THE ENGINE */
/* @engine-start — extracted verbatim by tests/test_engine.py; do not rename */
/*  E_IT_request = e_out × (T_out + T_in × (1 − cache) / 10) / 1000   [Wh]
    E_request    = E_IT_request × PUE                                 [Wh]
    E_month      = E_request × Q / 1000                               [kWh]
    C_location   = E_month × CI / 1000                                [kg]
    C_market     = E_month × CI_market / 1000       (only if supplied)
    C_embodied   = C_location × adder                                 [kg]
    Water        = E_IT_month × WUE + E_month × EWIF                  [L]
    bounds       = every output × (wh_low/e_out) and × (wh_high/e_out)
    grade        = central E_request against the task class's bands            */
function engine(cfg) {
  const m = cfg.model, g = cfg.grading, f = cfg.facility, r = cfg.region;
  const tIn = Math.max(0, cfg.tokensIn), tOut = Math.max(0, cfg.tokensOut);
  const q = Math.max(0, cfg.queries);
  const cache = clamp(cfg.cacheShare || 0, 0, 1);
  const adder = cfg.adder;
  const billableIn = tIn * (1 - cache);

  const eIT = m.e_out * (tOut + billableIn / K_IN) / 1000;
  const eReq = eIT * f.pue;
  const eMonth = eReq * q / 1000;
  const eITMonth = eIT * q / 1000;
  const carbon = eMonth * r.ci / 1000;
  const carbonMarket = (cfg.marketCI === null || cfg.marketCI === undefined) ? null : eMonth * cfg.marketCI / 1000;
  const embodied = carbon * adder;
  const water = eITMonth * f.wue + eMonth * r.ewif;

  const kLo = m.e_out > 0 ? m.lo / m.e_out : 1;
  const kHi = m.e_out > 0 ? m.hi / m.e_out : 1;

  const grade = eReq <= g.a ? "A" : eReq <= g.b ? "B" : eReq <= g.c ? "C" : eReq <= g.d ? "D" : "E";

  // Energy attribution (central estimate) for the breakdown bar
  const itOut = m.e_out * tOut / 1000;
  const itIn = m.e_out * (billableIn / K_IN) / 1000;
  const overhead = eReq - eIT;

  return {
    m, g, f, r, q, tIn, tOut, cache, adder,
    eIT, eReq, eMonth, eITMonth, carbon, carbonMarket, embodied, water,
    kLo, kHi, grade,
    parts: { itOut, itIn, overhead },
    perMillionTokens: tOut > 0 ? (eReq / tOut) * 1e6 : 0,
    carbonPerRequest: eReq * r.ci / 1000,      // mg CO2e per request → g: /1000
  };
}

/* @engine-end */

function frugality(fails) {
  return fails === 0 ? "F0" : fails === 1 ? "F1" : "F2+";
}
function guidanceFor(grade, fails) {
  if (grade === "E") return "Re-architect: reasoning budgets, model routing, or task redesign before scale-up";
  if (grade === "A" || grade === "B") {
    return fails === 0 ? "Proceed; monitor quarterly"
      : "Efficient but wasteful by design — fix necessity and right-sizing first";
  }
  return fails === 0
    ? "Justified heavy use — apply mitigation levers; set an intensity-reduction target"
    : "Priority for intervention";
}

/* ------------------------------------------------------- data conveniences */
const idxByName = {};
MODELS.forEach((m, i) => { idxByName[m.model] = i; });
function modelByName(n) { const i = idxByName[n]; return i === undefined ? null : MODELS[i]; }
function findRegion(n) { return REGIONS.find(r => r.region === n) || REGIONS[0]; }
function findFacility(n) { return FACILITIES.find(f => f.profile === n) || FACILITIES[0]; }
function findGrade(code) { return GRADING.find(g => g.code === code) || GRADING[1]; }
function defaultModel() {
  return MODELS.find(m => m.model === D.defaults.model) || MODELS[0];
}
function openLabel(m) { return m.openness === "open" ? "Open weights" : "Proprietary"; }
function paramLabel(m) {
  if (m.params_active && m.params_total && m.params_active !== m.params_total)
    return m.params_active + "B / " + m.params_total + "B";
  if (m.params_active) return m.params_active + "B";
  if (m.params_total) return m.params_total + "B";
  return "undisclosed";
}

/* =========================================================================
   ESTIMATOR
   ========================================================================= */
const est = {
  state: null,
  init() {
    // Model select, grouped by provider, superseded rows in their own group
    const sel = $("model");
    const current = MODELS.filter(m => m.status !== "legacy");
    const legacy = MODELS.filter(m => m.status === "legacy");
    const providers = [];
    current.forEach(m => { if (providers.indexOf(m.provider) < 0) providers.push(m.provider); });
    providers.forEach(p => {
      const og = el("optgroup", { label: p });
      current.filter(m => m.provider === p).forEach(m => {
        og.appendChild(el("option", { value: m.model, text: m.model + (m.openness === "open" ? "  ·  open weights" : "") }));
      });
      sel.appendChild(og);
    });
    if (legacy.length) {
      const og = el("optgroup", { label: "Superseded / historical" });
      legacy.forEach(m => og.appendChild(el("option", { value: m.model, text: m.model })));
      sel.appendChild(og);
    }

    const task = $("taskclass");
    GRADING.forEach(g => task.appendChild(el("option", { value: g.code, text: g.code + " — " + g.name + " (" + g.desc + ")" })));

    const fac = $("facility");
    FACILITIES.forEach(f => fac.appendChild(el("option", {
      value: f.profile, text: f.profile + " · PUE " + f.pue.toFixed(2)
    })));

    const reg = $("region");
    REGIONS.forEach(r => reg.appendChild(el("option", {
      value: r.region, text: r.region + " · " + sig(r.ci) + " g CO₂e/kWh"
    })));

    // Defaults
    sel.value = defaultModel().model;
    task.value = D.defaults.task;
    fac.value = D.defaults.facility;
    reg.value = D.defaults.region;
    const g0 = findGrade(task.value);
    $("tokens-in").value = g0.tin;
    $("tokens-out").value = g0.tout;

    // Wiring
    $("taskclass").addEventListener("change", () => {
      const g = findGrade($("taskclass").value);
      $("tokens-in").value = g.tin;
      $("tokens-out").value = g.tout;
      est.render();
    });
    $("adder").addEventListener("input", () => { $("adder-out").textContent = $("adder").value + "%"; });
    $("cache").addEventListener("input", () => { $("cache-out").textContent = $("cache").value + "%"; });
    ["model", "tokens-in", "tokens-out", "queries", "facility", "region", "market-ci",
      "adder", "cache", "frugal-1", "frugal-2", "frugal-3"].forEach(id => {
      $(id).addEventListener("input", est.render);
      $(id).addEventListener("change", est.render);
    });

    $("btn-share").addEventListener("click", est.share);
    $("btn-json").addEventListener("click", est.exportJSON);
    $("btn-csv").addEventListener("click", est.exportCSV);
    $("btn-print").addEventListener("click", () => window.print());
    $("btn-reset").addEventListener("click", est.reset);

    est.readHash();
    est.render();
  },

  read() {
    const m = modelByName($("model").value) || defaultModel();
    const g = findGrade($("taskclass").value);
    const f = findFacility($("facility").value);
    const r = findRegion($("region").value);
    const marketRaw = $("market-ci").value.trim();
    const fails = ["frugal-1", "frugal-2", "frugal-3"].filter(id => !$(id).checked).length;
    return {
      model: m, grading: g, facility: f, region: r,
      tokensIn: Math.max(0, numOr($("tokens-in").value, 0)),
      tokensOut: Math.max(0, numOr($("tokens-out").value, 0)),
      queries: Math.max(0, numOr($("queries").value, 0)),
      adder: numOr($("adder").value, 25) / 100,
      cacheShare: numOr($("cache").value, 0) / 100,
      marketCI: marketRaw === "" ? null : Math.max(0, numOr(marketRaw, 0)),
      fails: fails,
    };
  },

  render() {
    const cfg = est.read();
    const x = engine(cfg);
    est.state = { cfg, x };
    const flag = frugality(cfg.fails);

    // Verdict
    const badge = $("grade-badge");
    badge.firstChild.nodeValue = x.grade;
    badge.className = "grade-badge g-" + x.grade;
    badge.setAttribute("aria-label", "Efficiency grade " + x.grade + ", task class " + x.g.name);
    $("grade-class").textContent = "CLASS " + x.g.code;
    $("grade-word").textContent = "Grade " + x.grade;
    $("flag-chip").textContent = flag;
    $("flag-chip").className = "chip " + (cfg.fails === 0 ? "open" : cfg.fails === 1 ? "warn" : "danger");
    $("guidance").textContent = guidanceFor(x.grade, cfg.fails);

    // Hero + uncertainty
    $("out-request").innerHTML = sig(x.eReq) + '<span class="unit">Wh / request</span>';
    $("out-request-lo").textContent = sig(x.eReq * x.kLo) + " Wh";
    $("out-request-hi").textContent = sig(x.eReq * x.kHi) + " Wh";
    $("out-request-tier").textContent = x.m.tier + " · " + TIER_NAMES[x.m.tier] + " · band " + TIER_BAND[x.m.tier];
    est.drawUncertainty(x);

    // Stats
    $("out-energy").textContent = fmtKWh(x.eMonth);
    $("out-energy-range").textContent = fmtRange(x.eMonth * x.kLo, x.eMonth * x.kHi, fmtKWh);
    $("out-carbon").textContent = fmtKg(x.carbon);
    $("out-carbon-range").textContent = fmtRange(x.carbon * x.kLo, x.carbon * x.kHi, fmtKg);
    $("out-carbon-market").textContent = x.carbonMarket === null ? "not provided" : fmtKg(x.carbonMarket);
    $("out-water").textContent = fmtL(x.water);
    $("out-water-range").textContent = fmtRange(x.water * x.kLo, x.water * x.kHi, fmtL);
    $("out-embodied").textContent = fmtKg(x.embodied);

    est.drawBreakdown(x);
    est.renderEquivalents(x);
    est.renderProvenance(x);
    est.renderWhatIf(x, cfg);
    act.renderApplied(x, cfg);

    // Mini bar
    const mg = $("mini-grade");
    mg.textContent = x.grade;
    mg.className = "mg g-" + x.grade;
    $("mini-energy").textContent = sig(x.eReq) + " Wh/req";
    $("mini-carbon").textContent = fmtKg(x.carbon);

    $("model-hint").textContent = x.m.provider + " · " + openLabel(x.m) + " · " + paramLabel(x.m) + " active"
      + " · " + x.m.tier + " " + TIER_NAMES[x.m.tier];

    // A collapsed section must still announce what is inside it, or it reads as missing.
    const fold = $("fold-summary");
    if (fold) {
      const bits = [cfg.tokensIn + " in / " + cfg.tokensOut + " out"];
      if (cfg.cacheShare > 0) bits.push(sig(cfg.cacheShare * 100, 2) + "% cached");
      bits.push(sig(cfg.adder * 100, 2) + "% embodied");
      if (cfg.marketCI !== null) bits.push("market " + sig(cfg.marketCI) + " g/kWh");
      fold.textContent = "— " + bits.join(" · ");
    }

    $("sr-status").textContent =
      "Grade " + x.grade + ", frugality " + flag + ". " + sig(x.eReq) + " watt-hours per request, " +
      "range " + sig(x.eReq * x.kLo) + " to " + sig(x.eReq * x.kHi) + ". " +
      fmtKg(x.carbon) + " per month, location-based.";

    est.writeHash();
  },

  /* The central estimate's position inside its own band, on a log axis —
     the band is multiplicative, so a linear placement would mislead. */
  drawUncertainty(x) {
    const mark = $("rail-mark");
    if (!mark) return;
    const lo = x.eReq * x.kLo, hi = x.eReq * x.kHi;
    if (!(hi > 0) || !isFinite(hi) || lo <= 0) { mark.style.left = "50%"; return; }
    const span = Math.log(hi) - Math.log(lo);
    const t = span > 0 ? (Math.log(x.eReq) - Math.log(lo)) / span : 0.5;
    mark.style.left = (clamp(t, 0, 1) * 100).toFixed(2) + "%";
  },

  drawBreakdown(x) {
    const bar = $("stackbar"), leg = $("stacklegend");
    bar.textContent = ""; leg.textContent = "";
    const total = x.eReq || 1;
    const parts = [
      { k: "Output tokens", v: x.parts.itOut, c: "var(--h1)" },
      { k: "Input tokens", v: x.parts.itIn, c: "var(--h6)" },
      { k: "Facility overhead (PUE)", v: x.parts.overhead, c: "var(--h3)" },
    ];
    parts.forEach(p => {
      const share = clamp(p.v / total, 0, 1);
      if (share > 0) bar.appendChild(el("span", { style: "width:" + (share * 100).toFixed(2) + "%;background:" + p.c }));
      leg.appendChild(el("span", {
        html: '<i style="background:' + p.c + '"></i>' + p.k + " · <b>" + sig(share * 100, 2) + "%</b>"
      }));
    });
    if (x.cache > 0) {
      leg.appendChild(el("span", { class: "muted", text: "cache hit " + sig(x.cache * 100, 2) + "% of input tokens" }));
    }
  },

  renderEquivalents(x) {
    const list = $("equiv-list");
    list.textContent = "";
    const eq = (q, name) => EQUIVALENTS.find(e => e.quantity === q && e.equivalent === name);
    const items = [];
    const led = eq("Energy", "hours of LED bulb (10 W)");
    if (led) items.push({ v: x.eMonth * led.factor, t: "hours of a 10 W LED bulb", s: led.source });
    const car = eq("Carbon", "km driven in an average petrol car");
    if (car) items.push({ v: x.carbon * car.factor, t: "km driven in an average petrol car", s: car.source });
    if (x.water >= 1000) {
      const sh = eq("Water", "8-minute showers");
      if (sh) items.push({ v: x.water / 1000 * sh.factor, t: "8-minute showers", s: sh.source });
    } else {
      const gl = eq("Water", "drinking glasses (250 mL)");
      if (gl) items.push({ v: x.water * gl.factor, t: "drinking glasses of water", s: gl.source });
    }
    items.forEach(i => {
      const li = el("li", { title: i.s });
      li.appendChild(el("span", { class: "ev", text: "≈ " + sig(i.v) }));
      li.appendChild(document.createTextNode(" " + i.t + " per month"));
      list.appendChild(li);
    });
  },

  renderProvenance(x) {
    const dl = $("prov-list");
    dl.textContent = "";
    const rows = [
      ["Model row", x.m.model + " — " + sig(x.m.e_out) + " Wh/1k output tokens (" + sig(x.m.lo) + "–" + sig(x.m.hi) + "), " + x.m.tier + " " + TIER_NAMES[x.m.tier] + ", vintage " + x.m.vintage],
      ["Architecture", (x.m.arch || "unknown") + " · " + paramLabel(x.m) + " · " + openLabel(x.m)
        + (x.m.license && x.m.license.toLowerCase() !== "proprietary" ? " (" + x.m.license + ")" : "")],
      ["Facility", x.f.profile + " — PUE " + x.f.pue.toFixed(2) + ", WUE " + x.f.wue.toFixed(2) + " L/kWh"],
      ["Grid", x.r.region + " — CI " + sig(x.r.ci) + " g CO₂e/kWh, EWIF " + sig(x.r.ewif) + " L/kWh, vintage " + x.r.vintage],
      ["Intensity", sig(x.perMillionTokens / 1000) + " kWh / 1M output tokens · " + sig(x.carbonPerRequest * 1000) + " mg CO₂e / request"],
    ];
    rows.forEach(([k, v]) => { dl.appendChild(el("dt", { text: k })); dl.appendChild(el("dd", { text: v })); });
    $("prov-src").textContent =
      (x.m.anchored
        ? "This row is a CLASS ANCHOR: nothing published distinguishes this model's energy from any other closed model in its capability class. "
        : x.m.derived
          ? "This row is DERIVED from its active-parameter count, not measured. "
          : "")
      + "Basis: " + (x.m.basis || "—") + " · Source: " + (x.m.source || "—");
  },

  /* Sensitivity: re-run the same equations with exactly one input changed. */
  renderWhatIf(x, cfg) {
    const ul = $("whatif");
    ul.textContent = "";
    const base = x.carbon;
    const rows = [];

    // 1. Smallest adequate model from the same provider, else overall smallest current
    const sameProvider = MODELS.filter(m => m.provider === x.m.provider && m.status !== "legacy" && m.e_out < x.m.e_out);
    const smaller = sameProvider.sort((a, b) => a.e_out - b.e_out)[0];
    if (smaller) rows.push({
      label: "Route to " + smaller.model,
      note: "smallest model from the same provider in the database",
      cfg: Object.assign({}, cfg, { model: smaller }),
      apply: () => { $("model").value = smaller.model; est.render(); },
    });

    // 2. Best open-weight alternative
    const bestOpen = MODELS.filter(m => m.openness === "open" && m.status !== "legacy" && m.e_out < x.m.e_out)
      .sort((a, b) => b.e_out - a.e_out)[0];
    if (bestOpen && (!smaller || bestOpen.model !== smaller.model)) rows.push({
      label: "Self-host " + bestOpen.model,
      note: "highest-capability open-weight row below your current energy intensity",
      cfg: Object.assign({}, cfg, { model: bestOpen }),
      apply: () => { $("model").value = bestOpen.model; est.render(); },
    });

    // 3. Lowest-carbon region
    const cleanest = REGIONS.slice().sort((a, b) => a.ci - b.ci)[0];
    if (cleanest && cleanest.region !== x.r.region) rows.push({
      label: "Host in " + cleanest.region,
      note: "lowest grid carbon intensity in the table (" + sig(cleanest.ci) + " g/kWh)",
      cfg: Object.assign({}, cfg, { region: cleanest }),
      apply: () => { $("region").value = cleanest.region; est.render(); },
    });

    // 4. Halve output tokens
    if (cfg.tokensOut > 1) rows.push({
      label: "Halve median output length",
      note: "token discipline: " + cfg.tokensOut + " → " + Math.round(cfg.tokensOut / 2) + " output tokens",
      cfg: Object.assign({}, cfg, { tokensOut: Math.round(cfg.tokensOut / 2) }),
      apply: () => { $("tokens-out").value = Math.round(cfg.tokensOut / 2); est.render(); },
    });

    // 5. Cache half the input context
    if (cfg.tokensIn > 0 && cfg.cacheShare < 0.5) rows.push({
      label: "Cache 50% of input context",
      note: "prompt caching removes prefill recomputation on hits",
      cfg: Object.assign({}, cfg, { cacheShare: 0.5 }),
      apply: () => { $("cache").value = 50; $("cache-out").textContent = "50%"; est.render(); },
    });

    // 6. Best-in-class facility
    const bestFac = FACILITIES.slice().sort((a, b) => a.pue - b.pue)[0];
    if (bestFac && bestFac.profile !== x.f.profile) rows.push({
      label: "Serve from a " + bestFac.profile.toLowerCase() + " facility",
      note: "PUE " + x.f.pue.toFixed(2) + " → " + bestFac.pue.toFixed(2),
      cfg: Object.assign({}, cfg, { facility: bestFac }),
      apply: () => { $("facility").value = bestFac.profile; est.render(); },
    });

    rows.forEach(row => {
      const y = engine(row.cfg);
      const delta = base > 0 ? (y.carbon - base) / base : 0;
      const li = el("li");
      li.appendChild(el("span", {
        class: "delta " + (delta < -0.0005 ? "down" : delta > 0.0005 ? "up" : ""),
        text: Math.abs(delta) < 0.0005 ? "—" : pct(delta),
      }));
      const what = el("div", { class: "what" });
      what.appendChild(el("b", { text: row.label }));
      what.appendChild(el("span", { text: row.note + " → " + fmtKg(y.carbon) + "/mo" }));
      li.appendChild(what);
      const b = el("button", { class: "btn sm", type: "button", text: "Apply" });
      b.addEventListener("click", row.apply);
      li.appendChild(b);
      ul.appendChild(li);
    });

    if (!rows.length) ul.appendChild(el("li", { class: "muted", text: "No single-input change in the data tables improves on this configuration." }));
  },

  /* ---------- state in the URL ---------- */
  writeHash() {
    const c = est.read();
    const p = new URLSearchParams();
    p.set("m", c.model.model);
    p.set("t", c.grading.code);
    p.set("ti", c.tokensIn); p.set("to", c.tokensOut); p.set("q", c.queries);
    p.set("f", c.facility.profile); p.set("r", c.region.region);
    p.set("a", Math.round(c.adder * 100)); p.set("c", Math.round(c.cacheShare * 100));
    if (c.marketCI !== null) p.set("mci", c.marketCI);
    p.set("fr", ["frugal-1", "frugal-2", "frugal-3"].map(id => $(id).checked ? "1" : "0").join(""));
    const tab = ui.currentTab;
    const hash = "#" + (tab !== "estimate" ? tab + "&" : "") + p.toString();
    history.replaceState(null, "", hash);
  },

  readHash() {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return;
    const parts = raw.split("&");
    if (parts.length && parts[0].indexOf("=") < 0) parts.shift();   // leading tab name
    const p = new URLSearchParams(parts.join("&"));
    const set = (id, v) => { if (v !== null && v !== undefined && v !== "") $(id).value = v; };
    if (p.get("m") && modelByName(p.get("m"))) set("model", p.get("m"));
    if (p.get("t") && findGrade(p.get("t"))) set("taskclass", p.get("t"));
    set("tokens-in", p.get("ti")); set("tokens-out", p.get("to")); set("queries", p.get("q"));
    if (p.get("f")) set("facility", p.get("f"));
    if (p.get("r")) set("region", p.get("r"));
    if (p.get("a")) { set("adder", p.get("a")); $("adder-out").textContent = p.get("a") + "%"; }
    if (p.get("c")) { set("cache", p.get("c")); $("cache-out").textContent = p.get("c") + "%"; }
    if (p.get("mci")) set("market-ci", p.get("mci"));
    const fr = p.get("fr");
    if (fr && fr.length === 3) ["frugal-1", "frugal-2", "frugal-3"].forEach((id, i) => { $(id).checked = fr[i] === "1"; });
  },

  share() {
    est.writeHash();
    const url = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        () => toast("Link copied — it restores every input"),
        () => toast("Copy failed; the URL bar holds the link")
      );
    } else toast("The URL bar holds the shareable link");
  },

  reset() {
    history.replaceState(null, "", location.pathname + location.search);
    $("model").value = defaultModel().model;
    $("taskclass").value = D.defaults.task;
    const g = findGrade(D.defaults.task);
    $("tokens-in").value = g.tin; $("tokens-out").value = g.tout;
    $("queries").value = 10000;
    $("facility").value = D.defaults.facility;
    $("region").value = D.defaults.region;
    $("market-ci").value = "";
    $("adder").value = 25; $("adder-out").textContent = "25%";
    $("cache").value = 0; $("cache-out").textContent = "0%";
    ["frugal-1", "frugal-2", "frugal-3"].forEach(id => { $(id).checked = true; });
    est.render();
    toast("Reset to defaults");
  },

  resultObject() {
    const { cfg, x } = est.state;
    return {
      framework: "GAIA " + D.version,
      generated_by: "web estimator",
      inputs: {
        model: x.m.model, provider: x.m.provider, openness: x.m.openness,
        task_class: x.g.name, task_code: x.g.code,
        tokens_in: cfg.tokensIn, tokens_out: cfg.tokensOut,
        cached_input_share: cfg.cacheShare,
        requests_per_month: cfg.queries,
        facility: x.f.profile, pue: x.f.pue, wue_l_per_kwh: x.f.wue,
        region: x.r.region, ci_g_per_kwh: x.r.ci, ewif_l_per_kwh: x.r.ewif,
        market_ci_g_per_kwh: cfg.marketCI,
        embodied_adder: cfg.adder,
      },
      results: {
        energy_wh_per_request: { low: x.eReq * x.kLo, central: x.eReq, high: x.eReq * x.kHi },
        energy_kwh_per_month: { low: x.eMonth * x.kLo, central: x.eMonth, high: x.eMonth * x.kHi },
        carbon_location_kg_per_month: { low: x.carbon * x.kLo, central: x.carbon, high: x.carbon * x.kHi },
        carbon_market_kg_per_month: x.carbonMarket === null ? null : { low: x.carbonMarket * x.kLo, central: x.carbonMarket, high: x.carbonMarket * x.kHi },
        embodied_kg_per_month: x.embodied,
        water_l_per_month: { low: x.water * x.kLo, central: x.water, high: x.water * x.kHi },
        grade: x.grade, frugality_flag: frugality(cfg.fails),
        guidance: guidanceFor(x.grade, cfg.fails),
      },
      provenance: {
        model_tier: x.m.tier, model_vintage: x.m.vintage, model_basis: x.m.basis, model_source: x.m.source,
        grid_vintage: x.r.vintage, grid_source: x.r.source, facility_source: x.f.source,
        bounds_note: "Energy-dominated bounds from the model row's tier. Factor uncertainty (CI, PUE, WUE, EWIF) adds beyond this band.",
      },
      data_version: D.version, data_date: D.version_date,
    };
  },

  exportJSON() {
    download("gaia-assessment.json", "application/json", JSON.stringify(est.resultObject(), null, 2));
    toast("JSON exported");
  },

  exportCSV() {
    const o = est.resultObject();
    const rows = [["section", "field", "value", "unit"]];
    Object.entries(o.inputs).forEach(([k, v]) => rows.push(["input", k, v, ""]));
    const r = o.results;
    const trip = (name, obj, unit) => {
      if (!obj) { rows.push(["result", name, "not provided", unit]); return; }
      rows.push(["result", name + "_low", obj.low, unit]);
      rows.push(["result", name + "_central", obj.central, unit]);
      rows.push(["result", name + "_high", obj.high, unit]);
    };
    trip("energy_per_request", r.energy_wh_per_request, "Wh");
    trip("energy_per_month", r.energy_kwh_per_month, "kWh");
    trip("carbon_location_per_month", r.carbon_location_kg_per_month, "kg CO2e");
    trip("carbon_market_per_month", r.carbon_market_kg_per_month, "kg CO2e");
    rows.push(["result", "embodied_per_month", r.embodied_kg_per_month, "kg CO2e"]);
    trip("water_per_month", r.water_l_per_month, "L");
    rows.push(["result", "grade", r.grade, "A–E"]);
    rows.push(["result", "frugality_flag", r.frugality_flag, "F0/F1/F2+"]);
    Object.entries(o.provenance).forEach(([k, v]) => rows.push(["provenance", k, v, ""]));
    download("gaia-assessment.csv", "text/csv", toCSV(rows));
    toast("CSV exported");
  },
};

/* =========================================================================
   MODEL EXPLORER
   ========================================================================= */
const models = {
  sortKey: "e_out", sortDir: "asc",
  filters: { providers: new Set(), openness: null, tier: null, cls: null, legacy: false },
  search: "",
  chartScope: "all",

  init() {
    const bar = $("model-filters");
    const providers = [];
    MODELS.forEach(m => { if (providers.indexOf(m.provider) < 0) providers.push(m.provider); });

    const group = (label, items, onClick, isOn) => {
      const wrap = el("span", { class: "fgroup" });
      wrap.appendChild(el("span", { class: "flabel", text: label }));
      items.forEach(it => {
        const b = el("button", { type: "button", text: it.label, "aria-pressed": isOn(it.value) ? "true" : "false" });
        b.addEventListener("click", () => { onClick(it.value); models.render(); });
        wrap.appendChild(b);
      });
      bar.appendChild(wrap);
    };

    group("Weights", [
      { label: "Open", value: "open" }, { label: "Proprietary", value: "closed" },
    ], v => { models.filters.openness = models.filters.openness === v ? null : v; },
      v => models.filters.openness === v);

    group("Class", [
      { label: "Frontier", value: "Frontier" }, { label: "Mid", value: "Mid" },
      { label: "Small", value: "Small" }, { label: "Tiny", value: "Tiny" },
    ], v => { models.filters.cls = models.filters.cls === v ? null : v; },
      v => models.filters.cls === v);

    group("Tier", [
      { label: "T1", value: "T1" }, { label: "T2", value: "T2" },
      { label: "T3", value: "T3" }, { label: "T4", value: "T4" },
    ], v => { models.filters.tier = models.filters.tier === v ? null : v; },
      v => models.filters.tier === v);

    group("Provider", providers.map(p => ({ label: p, value: p })),
      v => { const s = models.filters.providers; s.has(v) ? s.delete(v) : s.add(v); },
      v => models.filters.providers.has(v));

    const extra = el("span", { class: "fgroup" });
    const legacyBtn = el("button", { type: "button", text: "Include superseded", "aria-pressed": "false" });
    legacyBtn.addEventListener("click", () => {
      models.filters.legacy = !models.filters.legacy;
      legacyBtn.setAttribute("aria-pressed", models.filters.legacy ? "true" : "false");
      models.render();
    });
    const clearBtn = el("button", { type: "button", text: "Clear filters" });
    clearBtn.addEventListener("click", () => {
      models.filters = { providers: new Set(), openness: null, tier: null, cls: null, legacy: false };
      models.search = "";
      $("model-search").value = "";
      legacyBtn.setAttribute("aria-pressed", "false");
      qsa("#model-filters button").forEach(b => { if (b !== legacyBtn && b !== clearBtn) b.setAttribute("aria-pressed", "false"); });
      models.render();
    });
    extra.appendChild(legacyBtn); extra.appendChild(clearBtn);
    bar.appendChild(extra);

    $("model-search").addEventListener("input", e => { models.search = e.target.value.toLowerCase(); models.render(); });

    qsa("#models-table th.sortable").forEach(th => {
      th.setAttribute("tabindex", "0");
      th.setAttribute("role", "button");
      const go = () => {
        const k = th.dataset.key;
        if (models.sortKey === k) models.sortDir = models.sortDir === "asc" ? "desc" : "asc";
        else { models.sortKey = k; models.sortDir = (k === "e_out" || k === "params_active") ? "asc" : "asc"; }
        models.render();
      };
      th.addEventListener("click", go);
      th.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });

    models.renderTierProfile();
    $("btn-models-csv").addEventListener("click", models.exportCSV);
    ["all", "high", "low"].forEach(scope => {
      $("chart-scope-" + scope).addEventListener("click", () => {
        models.chartScope = scope;
        models.render();
      });
    });

    models.render();
  },

  /* The provenance profile of the whole database. Publishing it is the point:
     a table that is mostly modelled should say so before it says anything else. */
  renderTierProfile() {
    const bar = $("tierbar"), leg = $("tierlegend"), note = $("tiernote");
    if (!bar) return;
    bar.textContent = ""; leg.textContent = "";
    const total = MODELS.length;
    const counts = { T1: 0, T2: 0, T3: 0, T4: 0 };
    MODELS.forEach(m => { counts[m.tier] = (counts[m.tier] || 0) + 1; });
    ["T1", "T2", "T3", "T4"].forEach(t => {
      if (!counts[t]) return;
      const share = counts[t] / total;
      bar.appendChild(el("span", {
        style: "width:" + (share * 100).toFixed(2) + "%;background:" + charts.tierColor(t),
        title: counts[t] + " rows",
      }));
      leg.appendChild(el("span", {
        html: '<i style="background:' + charts.tierColor(t) + '"></i>' + t + " · " + TIER_NAMES[t]
          + " · <b>" + counts[t] + "</b> row" + (counts[t] === 1 ? "" : "s"),
      }));
    });
    const modelled = counts.T4 || 0;
    const measured = (counts.T1 || 0) + (counts.T2 || 0);
    note.textContent =
      modelled + " of " + total + " rows (" + Math.round(modelled / total * 100) + "%) are modelled "
      + "rather than measured, and only " + measured + " rest on a provider disclosure or a meter. "
      + "That is a description of the industry, not a defect of the method — no closed provider "
      + "publishes per-model serving energy, and a user of a closed API cannot measure it at any "
      + "price. It is also why two of the ten mitigation levers act on the opacity itself rather "
      + "than on consumption, and why the open-weight rows matter: those are the ones you can meter.";
  },

  filtered() {
    const f = models.filters;
    return MODELS.filter(m => {
      if (!f.legacy && m.status === "legacy") return false;
      if (f.openness === "open" && m.openness !== "open") return false;
      if (f.openness === "closed" && m.openness === "open") return false;
      if (f.cls && m.cls !== f.cls) return false;
      if (f.tier && m.tier !== f.tier) return false;
      if (f.providers.size && !f.providers.has(m.provider)) return false;
      if (models.search) {
        const hay = [m.model, m.provider, m.cls, m.arch, m.license, m.tier, m.basis, m.source, m.reasoning].join(" ").toLowerCase();
        if (hay.indexOf(models.search) < 0) return false;
      }
      return true;
    });
  },

  sorted(rows) {
    const k = models.sortKey, dir = models.sortDir === "asc" ? 1 : -1;
    const val = m => {
      if (k === "params_active") return Number(m.params_active) || Number(m.params_total) || Infinity;
      const v = m[k];
      return typeof v === "number" ? v : String(v === undefined ? "" : v).toLowerCase();
    };
    return rows.slice().sort((a, b) => {
      const va = val(a), vb = val(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return a.model < b.model ? -1 : 1;
    });
  },

  render() {
    const rows = models.sorted(models.filtered());
    const tb = qs("#models-table tbody");
    tb.textContent = "";

    rows.forEach(m => {
      const tr = el("tr");
      tr.appendChild(el("td", {}, [
        el("b", { text: m.model }),
        m.released ? el("span", { class: "src", text: "released " + m.released + (m.ctx ? " · " + m.ctx + " ctx" : "") }) : null,
      ]));
      tr.appendChild(el("td", { text: m.provider }));
      tr.appendChild(el("td", {}, [el("span", {
        class: "chip " + (m.openness === "open" ? "open" : ""),
        text: m.openness === "open" ? "Open" : "Closed",
        title: m.license || "",
      })]));
      tr.appendChild(el("td", { text: m.cls }));
      tr.appendChild(el("td", { class: "num", text: paramLabel(m), title: m.arch || "" }));
      tr.appendChild(el("td", { text: m.reasoning }));
      tr.appendChild(el("td", { class: "num" }, [
        el("b", { text: sig(m.e_out) }),
        m.anchored ? el("span", { class: "src", text: "class anchor", title: "No parameter disclosure and no measurement: this row carries the anchor for its capability class, not a figure specific to this model." }) : null,
      ]));
      tr.appendChild(el("td", { class: "num muted", text: sig(m.lo) + "–" + sig(m.hi) }));
      tr.appendChild(el("td", {}, [el("span", { class: "tier tier-" + m.tier, text: m.tier })]));
      tr.appendChild(el("td", { text: m.vintage }));
      tr.appendChild(el("td", {}, [
        el("span", { class: "small", text: m.basis || "" }),
        el("span", { class: "src", text: m.source || "" }),
      ]));
      const use = el("button", { class: "btn sm", type: "button", text: "Use" });
      use.addEventListener("click", () => {
        $("model").value = m.model;
        est.render();
        ui.show("estimate");
        toast(m.model + " loaded into the estimator");
      });
      tr.appendChild(el("td", {}, [use]));
      tb.appendChild(tr);
    });

    qsa("#models-table th.sortable").forEach(th => {
      if (th.dataset.key === models.sortKey) th.dataset.dir = models.sortDir;
      else th.removeAttribute("data-dir");
    });

    const openCount = rows.filter(m => m.openness === "open").length;
    $("models-count").textContent =
      rows.length + " of " + MODELS.length + " rows · " + openCount + " open-weight · " +
      "energy spread " + models.spreadLabel(rows);

    ["all", "high", "low"].forEach(scope => {
      $("chart-scope-" + scope).setAttribute("aria-pressed", models.chartScope === scope ? "true" : "false");
    });
    charts.modelChart(rows);
  },

  spreadLabel(rows) {
    const vals = rows.map(m => m.e_out).filter(v => v > 0);
    if (vals.length < 2) return "—";
    const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    return "×" + sig(hi / lo, 2);
  },

  exportCSV() {
    const rows = models.sorted(models.filtered());
    const out = [["model", "provider", "openness", "license", "capability_class", "architecture",
      "params_total_b", "params_active_b", "context", "reasoning_mode", "released",
      "wh_per_1k_output_tokens_it", "wh_low", "wh_high", "tier", "vintage", "basis", "source"]];
    rows.forEach(m => out.push([m.model, m.provider, m.openness, m.license, m.cls, m.arch,
      m.params_total, m.params_active, m.ctx, m.reasoning, m.released,
      m.e_out, m.lo, m.hi, m.tier, m.vintage, m.basis, m.source]));
    download("gaia-models.csv", "text/csv", toCSV(out));
    toast("Model table exported");
  },
};

/* =========================================================================
   CHARTS (hand-rolled SVG — no dependencies)
   ========================================================================= */
const charts = {
  tierColor(t) { return "var(--t-" + t.slice(1) + ")"; },

  modelChart(rows) {
    const svg = $("model-chart"), axis = $("model-axis");
    const all = rows.filter(m => m.e_out > 0);
    let data = all, dropped = 0;
    if (models.chartScope === "high") {
      data = all.slice().sort((a, b) => b.e_out - a.e_out).slice(0, 20);
      dropped = all.length - data.length;
    } else if (models.chartScope === "low") {
      data = all.slice().sort((a, b) => a.e_out - b.e_out).slice(0, 20);
      dropped = all.length - data.length;
    }
    data = data.slice().sort((a, b) => a.e_out - b.e_out);

    const W = Math.max(520, svg.parentNode.clientWidth || 800);
    const rowH = 21, padT = 10, padB = 8;
    const padL = Math.min(230, Math.max(128, W * 0.25)), padR = 62;
    const H = padT + padB + data.length * rowH;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("height", H);
    svg.textContent = "";
    axis.textContent = "";

    if (!data.length) {
      svg.setAttribute("height", 60);
      svg.setAttribute("viewBox", "0 0 " + W + " 60");
      const t = svgEl("text", { x: W / 2, y: 34, "text-anchor": "middle", class: "label" });
      t.textContent = "No models match these filters";
      svg.appendChild(t);
      $("chart-legend").textContent = "";
      return;
    }

    const lows = data.map(m => Math.max(m.lo, 1e-5)), highs = data.map(m => m.hi);
    const lo = Math.pow(10, Math.floor(Math.log10(Math.min.apply(null, lows))));
    const hi = Math.pow(10, Math.ceil(Math.log10(Math.max.apply(null, highs))));
    const span = Math.log10(hi) - Math.log10(lo) || 1;
    const x = v => padL + (Math.log10(Math.max(v, lo)) - Math.log10(lo)) / span * (W - padL - padR);

    for (let d = Math.log10(lo); d <= Math.log10(hi) + 1e-9; d++) {
      const px = x(Math.pow(10, d));
      svg.appendChild(svgEl("line", { x1: px, x2: px, y1: 0, y2: H, class: "gridline" }));
    }

    data.forEach((m, i) => {
      const y = padT + i * rowH + rowH / 2;
      const xl = x(m.lo), xh = x(m.hi), xc = x(m.e_out);
      svg.appendChild(svgEl("line", { x1: xl, x2: xh, y1: y, y2: y, class: "whisker" }));
      [xl, xh].forEach(px => svg.appendChild(svgEl("line", { x1: px, x2: px, y1: y - 3.5, y2: y + 3.5, class: "whisker" })));
      if (m.openness === "open") {
        svg.appendChild(svgEl("circle", { cx: xc, cy: y, r: 7, fill: "none", stroke: charts.tierColor(m.tier), "stroke-width": 1.2, opacity: .4 }));
      }
      const c = svgEl("circle", { cx: xc, cy: y, r: 4.3, fill: charts.tierColor(m.tier), class: "bar" });
      const title = svgEl("title");
      title.textContent = m.model + " — " + sig(m.e_out) + " Wh/1k output tokens ("
        + sig(m.lo) + "–" + sig(m.hi) + "), " + m.tier + " " + TIER_NAMES[m.tier];
      c.appendChild(title);
      svg.appendChild(c);
      const lab = svgEl("text", { x: padL - 9, y: y + 4, "text-anchor": "end", class: "label" });
      lab.textContent = m.model.length > 31 ? m.model.slice(0, 30) + "…" : m.model;
      svg.appendChild(lab);
      const val = svgEl("text", { x: W - padR + 8, y: y + 4, class: "value" });
      val.textContent = sig(m.e_out);
      svg.appendChild(val);
    });

    // Axis in its own element so it stays visible while the plot scrolls
    const aH = 30;
    axis.setAttribute("viewBox", "0 0 " + W + " " + aH);
    axis.setAttribute("height", aH);
    for (let d = Math.log10(lo); d <= Math.log10(hi) + 1e-9; d++) {
      const v = Math.pow(10, d), px = x(v);
      axis.appendChild(svgEl("line", { x1: px, x2: px, y1: 0, y2: 5, class: "whisker" }));
      const t = svgEl("text", { x: px, y: 16, "text-anchor": "middle", class: "axis-label" });
      t.textContent = v >= 1 ? sig(v) : String(Number(v.toPrecision(2)));
      axis.appendChild(t);
    }
    const ax = svgEl("text", { x: padL + (W - padL - padR) / 2, y: 28, "text-anchor": "middle", class: "axis-label" });
    ax.textContent = "Wh per 1,000 output tokens (log scale)";
    axis.appendChild(ax);

    const leg = $("chart-legend");
    leg.textContent = "";
    ["T1", "T2", "T3", "T4"].forEach(t => leg.appendChild(el("span", {
      html: '<i style="background:' + charts.tierColor(t) + '"></i>' + t + " · " + TIER_NAMES[t]
    })));
    leg.appendChild(el("span", { html: '<i style="background:transparent;border:1px solid var(--ink-3);border-radius:50%"></i>ring = open weights' }));
    leg.appendChild(el("span", { text: "whiskers = low–high bounds" }));
    leg.appendChild(el("span", {
      style: dropped ? "color:var(--warn);font-weight:650" : "",
      text: dropped
        ? "showing " + data.length + " of " + all.length + " matching rows — " + dropped + " not plotted"
        : "showing all " + data.length + " matching rows · scroll the plot",
    }));
  },

  bars(svgId, items, opts) {
    const svg = $(svgId);
    const o = opts || {};
    svg.textContent = "";
    const W = Math.max(420, svg.clientWidth || svg.parentNode.clientWidth || 700);
    const rowH = 30, padT = 10, padB = 26, padL = Math.min(220, Math.max(110, W * 0.26)), padR = 90;
    const H = padT + padB + Math.max(items.length, 1) * rowH;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("height", H);
    if (!items.length) {
      const t = svgEl("text", { x: W / 2, y: 30, "text-anchor": "middle", class: "label" });
      t.textContent = o.empty || "Nothing to chart yet";
      svg.appendChild(t);
      return;
    }
    const max = Math.max.apply(null, items.map(i => i.value)) || 1;
    const x = v => (v / max) * (W - padL - padR);
    items.forEach((it, i) => {
      const y = padT + i * rowH;
      svg.appendChild(svgEl("rect", {
        x: padL, y: y + 6, width: Math.max(1, x(it.value)), height: rowH - 14, rx: 3,
        fill: it.color || "var(--h1)", class: "bar",
      }));
      const lab = svgEl("text", { x: padL - 8, y: y + rowH / 2 + 3.5, "text-anchor": "end", class: "label" });
      lab.textContent = it.label.length > 34 ? it.label.slice(0, 33) + "…" : it.label;
      svg.appendChild(lab);
      const val = svgEl("text", { x: padL + Math.max(1, x(it.value)) + 7, y: y + rowH / 2 + 3.5, class: "value" });
      val.textContent = it.text || sig(it.value);
      svg.appendChild(val);
    });
  },
};

/* =========================================================================
   COMPARE
   ========================================================================= */
const compare = {
  items: [],
  init() {
    $("btn-add-scenario").addEventListener("click", () => {
      compare.items.push(compare.blank("Scenario " + (compare.items.length + 1)));
      compare.render();
    });
    $("btn-scenario-from-estimator").addEventListener("click", () => {
      const c = est.read();
      compare.items.push({
        name: c.model.model + " · " + c.region.region,
        model: c.model.model, task: c.grading.code, region: c.region.region,
        facility: c.facility.profile, tIn: c.tokensIn, tOut: c.tokensOut, q: c.queries,
      });
      compare.render();
      toast("Estimator configuration added");
    });
    $("btn-compare-csv").addEventListener("click", compare.exportCSV);
    if (!compare.items.length) compare.seed();
    compare.render();
  },

  blank(name) {
    const c = est.state ? est.state.cfg : null;
    return {
      name: name,
      model: c ? c.model.model : defaultModel().model,
      task: c ? c.grading.code : D.defaults.task,
      region: c ? c.region.region : D.defaults.region,
      facility: c ? c.facility.profile : D.defaults.facility,
      tIn: c ? c.tokensIn : findGrade(D.defaults.task).tin,
      tOut: c ? c.tokensOut : findGrade(D.defaults.task).tout,
      q: c ? c.queries : 10000,
    };
  },

  /* Two illustrative starting points: today's default, and a right-sized
     open-weight alternative in the SAME capability class on the cleanest grid.
     Seeding with the smallest row in the whole table would make the comparison
     look decisive and mean nothing — capability class is the honest constraint. */
  seed() {
    const base = compare.blank("Current setup");
    const baseModel = modelByName(base.model) || defaultModel();
    const pool = MODELS.filter(m => m.openness === "open" && m.status !== "legacy");
    const sameClass = pool.filter(m => m.cls === baseModel.cls);
    const cheapOpen = (sameClass.length ? sameClass : pool)
      .sort((a, b) => a.e_out - b.e_out)[0];
    const cleanest = REGIONS.slice().sort((a, b) => a.ci - b.ci)[0];
    const alt = Object.assign({}, base, {
      name: "Right-sized + clean grid",
      model: cheapOpen ? cheapOpen.model : base.model,
      region: cleanest ? cleanest.region : base.region,
      facility: FACILITIES.slice().sort((a, b) => a.pue - b.pue)[0].profile,
    });
    compare.items = [base, alt];
  },

  compute(it) {
    return engine({
      model: modelByName(it.model) || defaultModel(),
      grading: findGrade(it.task),
      facility: findFacility(it.facility),
      region: findRegion(it.region),
      tokensIn: Math.max(0, numOr(it.tIn, 0)),
      tokensOut: Math.max(0, numOr(it.tOut, 0)),
      queries: Math.max(0, numOr(it.q, 0)),
      adder: est.state ? est.state.cfg.adder : 0.25,
      cacheShare: 0,
      marketCI: null,
    });
  },

  render() {
    const grid = $("compare-grid");
    grid.textContent = "";
    const results = compare.items.map(compare.compute);
    const baseline = results[0];

    compare.items.forEach((it, i) => {
      const x = results[i];
      const card = el("div", { class: "card scenario" + (i === 0 ? " baseline" : "") });
      if (i === 0) card.appendChild(el("span", { class: "baselinetag", text: "Baseline" }));

      const head = el("header");
      const nameIn = el("input", { type: "text", value: it.name, "aria-label": "Scenario name" });
      nameIn.addEventListener("input", e => { it.name = e.target.value; });
      head.appendChild(nameIn);
      if (compare.items.length > 1) {
        const rm = el("button", { class: "remove", type: "button", "aria-label": "Remove scenario", text: "×" });
        rm.addEventListener("click", () => { compare.items.splice(i, 1); compare.render(); });
        head.appendChild(rm);
      }
      card.appendChild(head);

      const mk = (label, options, value, onChange) => {
        const f = el("div", { class: "mini-field" });
        const id = "cmp-" + i + "-" + label.replace(/\W+/g, "");
        f.appendChild(el("label", { for: id, text: label }));
        const s = el("select", { id: id });
        options.forEach(o => s.appendChild(el("option", { value: o.v, text: o.t })));
        s.value = value;
        s.addEventListener("change", e => { onChange(e.target.value); compare.render(); });
        f.appendChild(s);
        return f;
      };
      card.appendChild(mk("Model", MODELS.filter(m => m.status !== "legacy").map(m => ({ v: m.model, t: m.model })), it.model, v => { it.model = v; }));
      card.appendChild(mk("Task class", GRADING.map(g => ({ v: g.code, t: g.code + " — " + g.name })), it.task, v => {
        it.task = v; const g = findGrade(v); it.tIn = g.tin; it.tOut = g.tout;
      }));
      card.appendChild(mk("Region", REGIONS.map(r => ({ v: r.region, t: r.region + " (" + sig(r.ci) + " g)" })), it.region, v => { it.region = v; }));
      card.appendChild(mk("Facility", FACILITIES.map(f => ({ v: f.profile, t: f.profile })), it.facility, v => { it.facility = v; }));

      const nums = el("div", { style: "display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem" });
      [["Tok in", "tIn"], ["Tok out", "tOut"], ["Req/mo", "q"]].forEach(([lab, key]) => {
        const f = el("div", { class: "mini-field" });
        const id = "cmp-" + i + "-" + key;
        f.appendChild(el("label", { for: id, text: lab }));
        const inp = el("input", { id: id, type: "number", min: "0", step: "1", value: it[key] });
        inp.addEventListener("input", e => { it[key] = numOr(e.target.value, 0); compare.render(); });
        f.appendChild(inp);
        nums.appendChild(f);
      });
      card.appendChild(nums);

      const out = el("div", { class: "out" });
      out.appendChild(el("div", { class: "big" }, [
        el("span", { class: "gradepill g-" + x.grade, text: x.grade }),
        el("span", { text: fmtKg(x.carbon) }),
      ]));
      const line = (k, v) => out.appendChild(el("div", { class: "line", html: "<span>" + k + "</span><b>" + v + "</b>" }));
      line("Energy / request", sig(x.eReq) + " Wh");
      line("Energy / month", fmtKWh(x.eMonth));
      line("Water / month", fmtL(x.water));
      line("Data tier", x.m.tier);
      if (i > 0 && baseline && baseline.carbon > 0) {
        const d = (x.carbon - baseline.carbon) / baseline.carbon;
        out.appendChild(el("div", {
          class: "vs",
          style: "color:" + (d < 0 ? "var(--good)" : d > 0 ? "var(--bad)" : "var(--ink-3)"),
          text: (Math.abs(d) < 0.0005 ? "same as baseline" : pct(d) + " vs baseline")
            + (d < 0 ? "  (saves " + fmtKg(baseline.carbon - x.carbon) + "/mo)" : ""),
        }));
      }
      card.appendChild(out);
      grid.appendChild(card);
    });

    charts.bars("compare-chart", compare.items.map((it, i) => ({
      label: it.name || "Scenario " + (i + 1),
      value: results[i].carbon,
      text: fmtKg(results[i].carbon),
      color: i === 0 ? "var(--h2)" : "var(--h1)",
    })), { empty: "Add a scenario to compare" });

    $("compare-shared").textContent = compare.items.length + " scenarios · same equations, one input changed at a time";

    const note = $("compare-caveat");
    if (note) {
      const used = results.map(r => r.m);
      const anchored = used.filter(m => m.anchored);
      const allModelled = used.every(m => m.tier === "T4");
      note.textContent = "";
      if (anchored.length && used.length > 1) {
        note.appendChild(el("div", {
          class: "callout warn",
          text: "At least one scenario (" + anchored.map(m => m.model).join(", ")
            + ") uses a class anchor — a placeholder standing in for a measurement that does not "
            + "exist, identical for every closed model in that capability class. A difference "
            + "involving an anchored row is a difference between estimates, not between measured "
            + "systems, and its magnitude is largely a property of the anchor. Treat the direction "
            + "as informative and the size as indicative.",
        }));
      } else if (allModelled && used.length > 1) {
        note.appendChild(el("div", {
          class: "callout",
          text: "Every scenario here rests on a modelled (T4) energy figure. The comparison is "
            + "internally consistent — same equations, same constants — but it compares two "
            + "estimates. Metering an open-weight deployment is the only way to replace one of "
            + "them with a measurement.",
        }));
      }
    }
  },

  exportCSV() {
    const rows = [["scenario", "model", "task_class", "region", "facility", "tokens_in", "tokens_out",
      "requests_per_month", "wh_per_request", "kwh_per_month", "kg_co2e_per_month", "litres_per_month", "grade", "tier"]];
    compare.items.forEach(it => {
      const x = compare.compute(it);
      rows.push([it.name, it.model, x.g.name, it.region, it.facility, it.tIn, it.tOut, it.q,
        x.eReq, x.eMonth, x.carbon, x.water, x.grade, x.m.tier]);
    });
    download("gaia-comparison.csv", "text/csv", toCSV(rows));
    toast("Comparison exported");
  },
};

/* =========================================================================
   PORTFOLIO
   ========================================================================= */
const portfolio = {
  rows: [],
  init() {
    portfolio.load();
    $("btn-add-usecase").addEventListener("click", () => {
      const c = est.state ? est.state.cfg : null;
      portfolio.rows.push({
        name: "Use case " + (portfolio.rows.length + 1),
        model: c ? c.model.model : defaultModel().model,
        task: c ? c.grading.code : D.defaults.task,
        region: c ? c.region.region : D.defaults.region,
        facility: c ? c.facility.profile : D.defaults.facility,
        tIn: c ? c.tokensIn : findGrade(D.defaults.task).tin,
        tOut: c ? c.tokensOut : findGrade(D.defaults.task).tout,
        q: c ? c.queries : 10000,
      });
      portfolio.save(); portfolio.render();
    });
    $("btn-portfolio-sample").addEventListener("click", () => {
      portfolio.rows = portfolio.sample();
      portfolio.save(); portfolio.render();
      toast("Worked example loaded — every row is editable");
    });
    $("btn-portfolio-csv").addEventListener("click", portfolio.exportCSV);
    $("btn-portfolio-json").addEventListener("click", portfolio.exportJSON);
    $("btn-portfolio-clear").addEventListener("click", () => {
      if (!portfolio.rows.length) return;
      if (window.confirm("Remove all " + portfolio.rows.length + " use cases from this browser?")) {
        portfolio.rows = []; portfolio.save(); portfolio.render(); toast("Portfolio cleared");
      }
    });
    portfolio.render();
  },

  /* A plausible mid-size organization: the point is that the aggregate is
     dominated by one or two use cases, which is what the chart shows. */
  sample() {
    const pick = (names, fallback) => {
      for (const n of names) if (modelByName(n)) return n;
      return fallback;
    };
    const big = defaultModel().model;
    const frontier = pick(MODELS.filter(m => m.cls === "Frontier" && m.status !== "legacy")
      .sort((a, b) => b.e_out - a.e_out).map(m => m.model), big);
    const small = pick(MODELS.filter(m => m.cls === "Small" && m.status !== "legacy")
      .sort((a, b) => a.e_out - b.e_out).map(m => m.model), big);
    const mid = pick(MODELS.filter(m => m.cls === "Mid" && m.status !== "legacy")
      .sort((a, b) => a.e_out - b.e_out).map(m => m.model), big);
    const reg = D.defaults.region, fac = D.defaults.facility;
    return [
      { name: "Customer support assistant", model: mid, task: "S", region: reg, facility: fac, tIn: 900, tOut: 220, q: 420000 },
      { name: "Ticket classification", model: small, task: "L", region: reg, facility: fac, tIn: 350, tOut: 40, q: 1800000 },
      { name: "Internal code assistant", model: big, task: "H", region: reg, facility: fac, tIn: 4000, tOut: 900, q: 160000 },
      { name: "Contract review agent", model: frontier, task: "R", region: reg, facility: fac, tIn: 12000, tOut: 6000, q: 4000 },
      { name: "Weekly research digest", model: frontier, task: "R", region: reg, facility: fac, tIn: 20000, tOut: 8000, q: 200 },
    ];
  },

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) portfolio.rows = JSON.parse(raw) || [];
    } catch (e) { portfolio.rows = []; }
  },
  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(portfolio.rows)); } catch (e) { /* private mode */ }
  },

  compute(r) {
    return engine({
      model: modelByName(r.model) || defaultModel(),
      grading: findGrade(r.task),
      facility: findFacility(r.facility),
      region: findRegion(r.region),
      tokensIn: Math.max(0, numOr(r.tIn, 0)),
      tokensOut: Math.max(0, numOr(r.tOut, 0)),
      queries: Math.max(0, numOr(r.q, 0)),
      adder: 0.25, cacheShare: 0, marketCI: null,
    });
  },

  render() {
    const tb = qs("#portfolio-table tbody");
    tb.textContent = "";
    $("portfolio-empty").hidden = portfolio.rows.length > 0;
    qs("#portfolio-table").parentNode.hidden = portfolio.rows.length === 0;

    const totals = { kwh: 0, kg: 0, l: 0, emb: 0 };
    const gradeCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    const results = [];

    portfolio.rows.forEach((r, i) => {
      const x = portfolio.compute(r);
      results.push(x);
      totals.kwh += x.eMonth; totals.kg += x.carbon; totals.l += x.water; totals.emb += x.embodied;
      gradeCount[x.grade]++;

      const tr = el("tr");
      const td = (child) => { const c = el("td"); c.appendChild(child); tr.appendChild(c); return c; };

      const name = el("input", { type: "text", value: r.name, "aria-label": "Use case name" });
      name.addEventListener("input", e => { r.name = e.target.value; portfolio.save(); });
      td(name);

      const mkSel = (options, value, onChange, label) => {
        const s = el("select", { "aria-label": label });
        options.forEach(o => s.appendChild(el("option", { value: o.v, text: o.t })));
        s.value = value;
        s.addEventListener("change", e => { onChange(e.target.value); portfolio.save(); portfolio.render(); });
        return s;
      };
      td(mkSel(MODELS.filter(m => m.status !== "legacy").map(m => ({ v: m.model, t: m.model })), r.model, v => { r.model = v; }, "Model"));
      td(mkSel(GRADING.map(g => ({ v: g.code, t: g.code + " — " + g.name })), r.task, v => {
        r.task = v; const g = findGrade(v); r.tIn = g.tin; r.tOut = g.tout;
      }, "Task class"));
      td(mkSel(REGIONS.map(x2 => ({ v: x2.region, t: x2.region })), r.region, v => { r.region = v; }, "Region"));

      [["q", "Requests per month"], ["tIn", "Input tokens"], ["tOut", "Output tokens"]].forEach(([key, label]) => {
        const inp = el("input", { type: "number", min: "0", step: "1", value: r[key], "aria-label": label });
        inp.addEventListener("input", e => { r[key] = numOr(e.target.value, 0); portfolio.save(); portfolio.render(); });
        td(inp).className = "num";
      });

      tr.appendChild(el("td", { class: "num", text: sig(x.eMonth) }));
      tr.appendChild(el("td", { class: "num", text: sig(x.carbon) }));
      tr.appendChild(el("td", { class: "num", text: sig(x.water) }));
      tr.appendChild(el("td", {}, [el("span", { class: "gradepill g-" + x.grade, text: x.grade })]));

      const del = el("button", { class: "rowdel", type: "button", "aria-label": "Remove " + r.name, text: "×" });
      del.addEventListener("click", () => { portfolio.rows.splice(i, 1); portfolio.save(); portfolio.render(); });
      tr.appendChild(el("td", {}, [del]));
      tb.appendChild(tr);
    });

    // Summary
    const sum = $("portfolio-summary");
    sum.textContent = "";
    const mk = (k, v, r) => {
      const c = el("div", { class: "card psum" });
      c.appendChild(el("div", { class: "k", text: k }));
      c.appendChild(el("div", { class: "v", text: v }));
      if (r) c.appendChild(el("div", { class: "r", text: r }));
      return c;
    };
    sum.appendChild(mk("Use cases", String(portfolio.rows.length), portfolio.rows.length ? "in this inventory" : "add one to begin"));
    sum.appendChild(mk("Monthly energy", fmtKWh(totals.kwh), sig(totals.kwh * 12) + " kWh/year"));
    sum.appendChild(mk("Monthly carbon", fmtKg(totals.kg), "+ " + fmtKg(totals.emb) + " embodied"));
    sum.appendChild(mk("Monthly water", fmtL(totals.l), "two-path model"));

    const dist = el("div", { class: "card psum" });
    dist.appendChild(el("div", { class: "k", text: "Grade distribution" }));
    const bar = el("div", { class: "gradedist" });
    ["A", "B", "C", "D", "E"].forEach(g => {
      const seg = el("span", { title: gradeCount[g] + " × grade " + g });
      const n = portfolio.rows.length || 1;
      seg.appendChild(el("i", { style: "background:var(--g-" + g.toLowerCase() + ");transform:scaleX(" + (gradeCount[g] / n) + ")" }));
      bar.appendChild(seg);
    });
    dist.appendChild(el("div", { class: "v", style: "font-size:1rem", text: ["A", "B", "C", "D", "E"].map(g => g + ":" + gradeCount[g]).join("  ") }));
    dist.appendChild(bar);
    sum.appendChild(dist);

    // Chart: ranked contribution
    const items = portfolio.rows.map((r, i) => ({
      label: r.name, value: results[i].carbon, text: fmtKg(results[i].carbon),
      color: "var(--g-" + results[i].grade.toLowerCase() + ")",
    })).sort((a, b) => b.value - a.value);
    charts.bars("portfolio-chart", items, { empty: "Add use cases to see where the footprint concentrates" });
  },

  exportCSV() {
    const rows = [["use_case", "model", "task_class", "region", "facility", "requests_per_month",
      "tokens_in", "tokens_out", "wh_per_request", "kwh_per_month", "kg_co2e_location_per_month",
      "kg_co2e_embodied_per_month", "litres_per_month", "grade", "tier"]];
    portfolio.rows.forEach(r => {
      const x = portfolio.compute(r);
      rows.push([r.name, r.model, x.g.name, r.region, r.facility, r.q, r.tIn, r.tOut,
        x.eReq, x.eMonth, x.carbon, x.embodied, x.water, x.grade, x.m.tier]);
    });
    download("gaia-portfolio.csv", "text/csv", toCSV(rows));
    toast("Portfolio exported");
  },
  exportJSON() {
    const out = portfolio.rows.map(r => {
      const x = portfolio.compute(r);
      return {
        use_case: r.name, model: r.model, task_class: x.g.name, region: r.region, facility: r.facility,
        requests_per_month: r.q, tokens_in: r.tIn, tokens_out: r.tOut,
        energy_wh_per_request: { low: x.eReq * x.kLo, central: x.eReq, high: x.eReq * x.kHi },
        energy_kwh_per_month: x.eMonth, carbon_kg_per_month: x.carbon,
        embodied_kg_per_month: x.embodied, water_l_per_month: x.water,
        grade: x.grade, tier: x.m.tier,
      };
    });
    download("gaia-portfolio.json", "application/json", JSON.stringify({ framework: "GAIA " + D.version, use_cases: out }, null, 2));
    toast("Portfolio exported");
  },
};

/* =========================================================================
   ACT
   ========================================================================= */
const act = {
  init() {
    const tb = qs("#levers-table tbody");
    MITIGATION.forEach(l => {
      const tr = el("tr");
      tr.appendChild(el("td", { class: "rank num", text: String(l.rank) }));
      tr.appendChild(el("td", {}, [
        el("b", { text: l.lever }),
        el("span", { class: "src", text: "Controlled by: " + l.who }),
      ]));
      tr.appendChild(el("td", { text: l.effect }));
      tr.appendChild(el("td", { class: "small muted", text: l.evidence }));
      tb.appendChild(tr);
    });
  },

  /* Only levers whose effect is computable from the data tables get a number.
     Ranks are read from mitigation.csv so the two lists cannot drift apart. */
  rank(needle) {
    const l = MITIGATION.find(x => x.lever.toLowerCase().indexOf(needle) >= 0);
    return l ? l.rank + " · " : "";
  },

  renderApplied(x, cfg) {
    const ul = $("act-applied");
    if (!ul) return;
    ul.textContent = "";
    const base = x.carbon;
    const add = (label, note, y) => {
      const li = el("li");
      if (y === null) {
        li.appendChild(el("span", { class: "delta muted", text: "n/a" }));
      } else {
        const d = base > 0 ? (y - base) / base : 0;
        li.appendChild(el("span", { class: "delta " + (d < 0 ? "down" : d > 0 ? "up" : ""), text: Math.abs(d) < 0.0005 ? "—" : pct(d) }));
      }
      const w = el("div", { class: "what" });
      w.appendChild(el("b", { text: label }));
      w.appendChild(el("span", { text: note }));
      li.appendChild(w);
      ul.appendChild(li);
    };

    const cheapest = MODELS.filter(m => m.status !== "legacy" && m.cls !== "Frontier" && m.model !== "Custom / my own model")
      .sort((a, b) => a.e_out - b.e_out)[0];
    if (cheapest && cheapest.e_out < x.m.e_out) {
      const y = engine(Object.assign({}, cfg, { model: cheapest }));
      add(act.rank("right-size") + "Right-size the model",
          "smallest non-frontier row in the database (" + cheapest.model + ") on the same workload", y.carbon);
    } else {
      add(act.rank("right-size") + "Right-size the model",
          "already at or below the smallest non-frontier row in the database", null);
    }

    if (x.g.code === "R") {
      const std = findGrade("S");
      const y = engine(Object.assign({}, cfg, { grading: std, tokensOut: std.tout, tokensIn: std.tin }));
      add(act.rank("reasoning") + "Cap reasoning budgets",
          "reasoning profile → standard profile (" + x.tOut + " → " + std.tout + " output tokens)", y.carbon);
    } else {
      add(act.rank("reasoning") + "Cap reasoning budgets",
          "this workload is not on the reasoning profile — no reasoning tokens to cap", null);
    }

    const cleanest = REGIONS.slice().sort((a, b) => a.ci - b.ci)[0];
    add(act.rank("hosting region") + "Low-carbon hosting region",
        x.r.region + " (" + sig(x.r.ci) + " g/kWh) → " + cleanest.region + " (" + sig(cleanest.ci) + " g/kWh)",
        engine(Object.assign({}, cfg, { region: cleanest })).carbon);

    if (cfg.tokensOut > 1) {
      add(act.rank("output length") + "Bound output length",
          "halve the median response: " + cfg.tokensOut + " → " + Math.round(cfg.tokensOut / 2) + " tokens",
          engine(Object.assign({}, cfg, { tokensOut: Math.round(cfg.tokensOut / 2) })).carbon);
    } else {
      add(act.rank("output length") + "Bound output length", "output already minimal", null);
    }

    if (cfg.tokensIn > 0 && cfg.cacheShare < 0.8) {
      add(act.rank("cache") + "Cache repeated context",
          "80% prompt-cache hit rate on " + cfg.tokensIn + " input tokens",
          engine(Object.assign({}, cfg, { cacheShare: 0.8 })).carbon);
    } else {
      add(act.rank("cache") + "Cache repeated context",
          cfg.tokensIn > 0 ? "already caching 80% or more of the input" : "no input context to cache", null);
    }

    // Same capability class, lowest energy: the sparse-architecture lever made concrete.
    const sameClass = MODELS.filter(m => m.status !== "legacy" && m.cls === x.m.cls
      && m.model !== "Custom / my own model" && m.e_out < x.m.e_out)
      .sort((a, b) => a.e_out - b.e_out)[0];
    if (sameClass) {
      add(act.rank("sparse") + "Sparse serving at the same capability class",
          x.m.model + " → " + sameClass.model + " ("
          + (sameClass.params_active ? sameClass.params_active + "B active" : "undisclosed params") + ")",
          engine(Object.assign({}, cfg, { model: sameClass })).carbon);
    } else {
      add(act.rank("sparse") + "Sparse serving at the same capability class",
          "no lower-energy row in the " + x.m.cls.toLowerCase() + " class", null);
    }

    if (x.m.openness !== "open") {
      add(act.rank("meter") + "Meter your own deployment",
          "not available: " + x.m.model + " is a closed API model and cannot be metered by its user at any price (§4.8)", null);
    } else {
      add(act.rank("meter") + "Meter your own deployment",
          "open weights — metering replaces this row's ×/÷3 modelled band with a ×/÷1.15 measured one. "
          + "It changes the uncertainty, not the energy.", null);
    }

    const bestFac = FACILITIES.slice().sort((a, b) => a.pue - b.pue)[0];
    add("Provider lever · best-in-class facility",
        "PUE " + x.f.pue.toFixed(2) + " → " + bestFac.pue.toFixed(2) + " — a disclosure ask for vendor management, not a user action",
        engine(Object.assign({}, cfg, { facility: bestFac })).carbon);
  },
};

/* =========================================================================
   STATIC TABLES (method + data panels)
   ========================================================================= */
function renderStaticTables() {
  // Equations
  const eq = [
    "E_IT_request [Wh]  = e_out × (T_out + T_in × (1 − c) / 10) / 1000",
    "                     e_out : model energy per 1,000 output tokens, IT boundary",
    "                             (serving-stack multiplier already applied)",
    "                     c     : cached share of input tokens (prefill skipped on a hit)",
    "E_request  [Wh]    = E_IT_request × PUE                    PUE from the facility profile",
    "E_month    [kWh]   = E_request × Q_month / 1000",
    "C_location [kg]    = E_month × CI_location / 1000          CI from the hosting region",
    "C_market   [kg]    = E_month × CI_market / 1000            reported beside, never blended",
    "C_embodied [kg]    = C_location × adder                    default 0.25, range 0.10–0.50",
    "W_month    [L]     = E_IT_month × WUE + E_month × EWIF     on-site cooling + off-site generation",
    "low / high         = every output × (wh_low / e_out) and × (wh_high / e_out)",
    "Grade              = central E_request against the task class's fixed logarithmic bands",
  ].join("\n");
  [$("eqbox"), $("eqbox-2")].forEach(n => { if (n) n.textContent = eq; });

  // Grade bands
  const gt = qs("#grading-table tbody");
  if (gt) {
    ["A", "B", "C", "D", "E"].forEach(g => {
      const tr = el("tr");
      tr.appendChild(el("td", {}, [el("span", { class: "gradepill g-" + g, text: g })]));
      GRADING.forEach(cl => {
        const v = g === "A" ? "≤ " + cl.a : g === "B" ? "≤ " + cl.b : g === "C" ? "≤ " + cl.c
          : g === "D" ? "≤ " + cl.d : "> " + cl.d;
        tr.appendChild(el("td", { class: "num", text: v }));
      });
      gt.appendChild(tr);
    });
  }

  // Frameworks
  const ft = qs("#frameworks-table tbody");
  if (ft) FRAMEWORKS.forEach(f => {
    const tr = el("tr");
    tr.appendChild(el("td", {}, [el("b", { text: f.framework }), f.org ? el("span", { class: "src", text: f.org }) : null]));
    tr.appendChild(el("td", { class: "small", text: f.type }));
    tr.appendChild(el("td", { class: "small", text: f.what }));
    tr.appendChild(el("td", { class: "small", text: f.relation }));
    ft.appendChild(tr);
  });

  // Standards list
  const sl = $("standards-list");
  if (sl) STANDARDS.forEach(s => {
    sl.appendChild(el("li", { html: "<b>" + s.name + "</b> · <span>" + s.note + "</span>" }));
  });

  // Regions
  const rt = qs("#regions-table tbody");
  if (rt) REGIONS.forEach(r => {
    const tr = el("tr");
    tr.appendChild(el("td", { text: r.region }));
    tr.appendChild(el("td", { class: "num", text: sig(r.ci) }));
    tr.appendChild(el("td", { class: "num muted", text: sig(r.ci_lo) + "–" + sig(r.ci_hi) }));
    tr.appendChild(el("td", { class: "num", text: sig(r.ewif) }));
    tr.appendChild(el("td", { class: "num muted", text: sig(r.ewif_lo) + "–" + sig(r.ewif_hi) }));
    tr.appendChild(el("td", { text: r.vintage }));
    tr.appendChild(el("td", { class: "small" }, [
      el("span", { text: r.source || "" }),
      r.notes ? el("span", { class: "src", text: r.notes }) : null,
    ]));
    rt.appendChild(tr);
  });

  // Facilities
  const ftb = qs("#facilities-table tbody");
  if (ftb) FACILITIES.forEach(f => {
    const tr = el("tr");
    tr.appendChild(el("td", {}, [el("b", { text: f.profile })]));
    tr.appendChild(el("td", { class: "num", text: f.pue.toFixed(2) }));
    tr.appendChild(el("td", { class: "num muted", text: f.pue_lo.toFixed(2) + "–" + f.pue_hi.toFixed(2) }));
    tr.appendChild(el("td", { class: "num", text: f.wue.toFixed(2) }));
    tr.appendChild(el("td", { class: "num muted", text: f.wue_lo.toFixed(2) + "–" + f.wue_hi.toFixed(2) }));
    tr.appendChild(el("td", { class: "small" }, [
      el("span", { text: f.source || "" }),
      f.notes ? el("span", { class: "src", text: f.notes }) : null,
    ]));
    ftb.appendChild(tr);
  });

  // Equivalents
  const et = qs("#equivalents-table tbody");
  if (et) EQUIVALENTS.forEach(e => {
    const tr = el("tr");
    tr.appendChild(el("td", { text: e.quantity }));
    tr.appendChild(el("td", { text: e.per_unit }));
    tr.appendChild(el("td", { text: e.equivalent }));
    tr.appendChild(el("td", { class: "num", text: sig(e.factor) }));
    tr.appendChild(el("td", { class: "small muted", text: e.source }));
    et.appendChild(tr);
  });

  // Alignment
  const at = qs("#alignment-table tbody");
  if (at) ALIGNMENT.forEach(a => {
    const tr = el("tr");
    tr.appendChild(el("td", {}, [el("b", { text: a.framework })]));
    tr.appendChild(el("td", { class: "small", text: a.element }));
    tr.appendChild(el("td", { class: "small", text: a.requirement }));
    tr.appendChild(el("td", { class: "small", text: a.gaia_output }));
    at.appendChild(tr);
  });
}

/* =========================================================================
   UI SHELL — tabs, theme, mini bar
   ========================================================================= */
const ui = {
  currentTab: "estimate",
  initialised: {},

  show(tab) {
    if (!$("panel-" + tab)) tab = "estimate";
    ui.currentTab = tab;
    qsa("nav.tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false"));
    qsa(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + tab));

    if (!ui.initialised[tab]) {
      ui.initialised[tab] = true;
      if (tab === "models") models.init();
      if (tab === "compare") compare.init();
      if (tab === "portfolio") portfolio.init();
    } else {
      if (tab === "models") models.render();
      if (tab === "compare") compare.render();
      if (tab === "portfolio") portfolio.render();
    }
    est.writeHash();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  },

  initTabs() {
    qsa("[data-tab]").forEach(b => {
      b.addEventListener("click", e => {
        if (b.tagName === "A" && b.getAttribute("href") && b.getAttribute("href").charAt(0) !== "#") return;
        e.preventDefault();
        ui.show(b.dataset.tab);
      });
    });
    const tabs = qsa("nav.tabs button");
    tabs.forEach((t, i) => {
      t.addEventListener("keydown", e => {
        let j = null;
        if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") j = 0;
        if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); tabs[j].focus(); ui.show(tabs[j].dataset.tab); }
      });
    });
    const raw = location.hash.replace(/^#/, "").split("&")[0];
    if (raw && raw.indexOf("=") < 0 && $("panel-" + raw)) ui.currentTab = raw;
  },

  initTheme() {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    if (stored === "dark" || stored === "light") document.documentElement.setAttribute("data-theme", stored);
    $("theme-toggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const now = cur ? (cur === "dark" ? "light" : "dark") : (sysDark ? "light" : "dark");
      document.documentElement.setAttribute("data-theme", now);
      try { localStorage.setItem(THEME_KEY, now); } catch (e) { /* ignore */ }
      // charts read CSS variables, so redraw the visible ones
      if (ui.initialised.models) models.render();
      if (ui.initialised.compare) compare.render();
      if (ui.initialised.portfolio) portfolio.render();
      est.render();
    });
  },

  initMiniBar() {
    if (!("IntersectionObserver" in window)) return;
    let formVis = false, heroVis = false;
    const minibar = $("minibar");
    const update = () => {
      const show = formVis && !heroVis && ui.currentTab === "estimate";
      minibar.classList.toggle("show", show);
      minibar.setAttribute("aria-hidden", show ? "false" : "true");
      document.body.classList.toggle("has-minibar", show);
    };
    new IntersectionObserver(es => { formVis = es[0].isIntersecting; update(); }).observe($("est-form"));
    new IntersectionObserver(es => { heroVis = es[0].isIntersecting; update(); }).observe(qs(".headline"));
    window.addEventListener("hashchange", update);
  },

  initResize() {
    let t = null;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (ui.currentTab === "models" && ui.initialised.models) charts.modelChart(models.sorted(models.filtered()));
        if (ui.currentTab === "compare" && ui.initialised.compare) compare.render();
        if (ui.currentTab === "portfolio" && ui.initialised.portfolio) portfolio.render();
      }, 160);
    });
  },
};

/* ------------------------------------------------------------------- boot */
function boot() {
  renderStaticTables();
  act.init();
  est.init();
  ui.initTabs();
  ui.initTheme();
  ui.initMiniBar();
  ui.initResize();
  ui.show(ui.currentTab);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

})();
