#!/usr/bin/env python3
"""
tests/test_engine.py — the three implementations must agree.

GAIA states one set of equations (FRAMEWORK.md §4) and ships them three times:
as a Python reference here, as JavaScript in web/gaia.js (which becomes
index.html), and as Excel formulas in GAIA_Assessment_Tool.xlsx. A user who
gets a different answer from the spreadsheet than from the web page has been
given two different frameworks. This test makes that failure loud.

    python3 tests/test_engine.py            # reference vs JavaScript (+ data checks)
    python3 tests/test_engine.py --excel    # also evaluate the workbook formulas

The --excel pass needs the 'formulas' package; it is skipped, loudly, without it.
"""

import csv
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data")

TOL = 1e-9          # reference vs JavaScript: identical arithmetic
TOL_XL = 5e-6       # vs Excel: display rounding in the stored cached values

failures = []
checks = 0


def check(name, ok, detail=""):
    global checks
    checks += 1
    if not ok:
        failures.append("%s%s" % (name, (" — " + detail) if detail else ""))


def close(a, b, tol):
    if a is None or b is None:
        return a is b
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


# ---------------------------------------------------------------- the spec
def reference(model, grading, facility, region, t_in, t_out, q,
              adder=0.25, cache=0.0, market_ci=None):
    """FRAMEWORK.md §4, written out longhand."""
    billable_in = t_in * (1.0 - cache)
    e_it = model["e_out"] * (t_out + billable_in / 10.0) / 1000.0
    e_req = e_it * facility["pue"]
    e_month = e_req * q / 1000.0
    e_it_month = e_it * q / 1000.0
    carbon = e_month * region["ci"] / 1000.0
    carbon_market = None if market_ci is None else e_month * market_ci / 1000.0
    embodied = carbon * adder
    water = e_it_month * facility["wue"] + e_month * region["ewif"]
    k_lo = model["lo"] / model["e_out"]
    k_hi = model["hi"] / model["e_out"]
    if e_req <= grading["a"]:
        grade = "A"
    elif e_req <= grading["b"]:
        grade = "B"
    elif e_req <= grading["c"]:
        grade = "C"
    elif e_req <= grading["d"]:
        grade = "D"
    else:
        grade = "E"
    return {
        "eIT": e_it, "eReq": e_req, "eMonth": e_month, "eITMonth": e_it_month,
        "carbon": carbon, "carbonMarket": carbon_market, "embodied": embodied,
        "water": water, "kLo": k_lo, "kHi": k_hi, "grade": grade,
    }


# ------------------------------------------------------------------- data
def load(name):
    with open(os.path.join(DATA, name), newline="", encoding="utf-8") as f:
        return [r for r in csv.DictReader(f) if any(v.strip() for v in r.values())]


def f(x):
    return float(x)


MODELS = [{"model": m["model"], "e_out": f(m["wh_per_1k_output_tokens_it"]),
           "lo": f(m["wh_low"]), "hi": f(m["wh_high"]), "tier": m["tier"],
           "openness": m["openness"], "status": m["status"],
           "cls": m["capability_class"], "provider": m["provider"],
           "arch": m["architecture"],
           "params_active": m["params_active_b"], "params_total": m["params_total_b"]}
          for m in load("models.csv")]
REGIONS = [{"region": r["region"], "ci": f(r["ci_location_gco2_kwh"]),
            "ci_lo": f(r["ci_low"]), "ci_hi": f(r["ci_high"]),
            "ewif": f(r["ewif_l_kwh"]), "ewif_lo": f(r["ewif_low"]),
            "ewif_hi": f(r["ewif_high"])} for r in load("regions.csv")]
FACILITIES = [{"profile": x["profile"], "pue": f(x["pue"]), "pue_lo": f(x["pue_low"]),
               "pue_hi": f(x["pue_high"]), "wue": f(x["wue_l_kwh"]),
               "wue_lo": f(x["wue_low"]), "wue_hi": f(x["wue_high"])}
              for x in load("facilities.csv")]
GRADING = [{"name": g["task_class"], "code": g["class_code"],
            "tin": int(f(g["tokens_in_default"])), "tout": int(f(g["tokens_out_default"])),
            "a": f(g["grade_a_max_wh"]), "b": f(g["grade_b_max_wh"]),
            "c": f(g["grade_c_max_wh"]), "d": f(g["grade_d_max_wh"])}
           for g in load("grading.csv")]


# --------------------------------------------------------------- cases
def cases():
    """A spread of configurations, plus every model on the standard profile."""
    out = []
    std = next(g for g in GRADING if g["code"] == "S")
    glob = next(r for r in REGIONS if r["region"] == "Global average")
    unk = next(x for x in FACILITIES if x["profile"] == "Unknown (API default)")
    for m in MODELS:
        out.append((m, std, unk, glob, 500, 300, 10000, 0.25, 0.0, None))
    # Corners: every task class, every facility, every region, cache, market CI
    m0 = MODELS[0]
    for g in GRADING:
        out.append((m0, g, unk, glob, g["tin"], g["tout"], 1, 0.10, 0.0, None))
    for fac in FACILITIES:
        out.append((m0, std, fac, glob, 1000, 2000, 500000, 0.5, 0.0, 41.0))
    for reg in REGIONS:
        out.append((m0, std, unk, reg, 0, 1, 1, 0.25, 0.0, None))
    for cache in (0.0, 0.25, 0.5, 0.999, 1.0):
        out.append((m0, std, unk, glob, 100000, 10, 12345, 0.33, cache, 0.0))
    # Degenerate inputs must not throw or produce NaN
    out.append((m0, std, unk, glob, 0, 0, 0, 0.25, 0.0, None))
    return out


# ------------------------------------------------------- JavaScript engine
def js_results(case_list):
    with open(os.path.join(ROOT, "web", "gaia.js"), encoding="utf-8") as fh:
        src = fh.read()
    m = re.search(r"/\* @engine-start.*?\*/(.*?)/\* @engine-end \*/", src, re.S)
    if not m:
        raise SystemExit("could not find the @engine markers in web/gaia.js")
    engine_src = m.group(1)

    payload = [{
        "model": c[0], "grading": c[1], "facility": c[2], "region": c[3],
        "tokensIn": c[4], "tokensOut": c[5], "queries": c[6],
        "adder": c[7], "cacheShare": c[8], "marketCI": c[9],
    } for c in case_list]

    harness = """
const K_IN = 10;
function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
%s
const cases = %s;
const out = cases.map(c => {
  const r = engine(c);
  return {eIT:r.eIT, eReq:r.eReq, eMonth:r.eMonth, eITMonth:r.eITMonth,
          carbon:r.carbon, carbonMarket:r.carbonMarket, embodied:r.embodied,
          water:r.water, kLo:r.kLo, kHi:r.kHi, grade:r.grade};
});
process.stdout.write(JSON.stringify(out));
""" % (engine_src, json.dumps(payload))

    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as fh:
        fh.write(harness)
        path = fh.name
    try:
        res = subprocess.run(["node", path], capture_output=True, text=True, timeout=120)
        if res.returncode != 0:
            raise SystemExit("node failed:\n" + res.stderr[:4000])
        return json.loads(res.stdout)
    finally:
        os.unlink(path)


# ------------------------------------------------------------ Excel engine
def excel_results(case_list):
    """Evaluate the generated workbook's own formulas and read back the
    Assessment results. This is the real Excel engine — INDEX/MATCH lookups
    against the data sheets, the Engine sheet chain, and the grade ladder —
    not a Python re-implementation of it."""
    try:
        import warnings
        warnings.filterwarnings("ignore")
        import formulas
    except ImportError:
        return None, "the 'formulas' package is not installed (pip install formulas)"
    book = os.path.join(ROOT, "GAIA_Assessment_Tool.xlsx")
    if not os.path.exists(book):
        return None, "GAIA_Assessment_Tool.xlsx has not been built"

    base = "'[%s]ASSESSMENT'!" % os.path.basename(book)
    xl = formulas.ExcelModel().loads(book).finish()
    outs = [base + c for c in ("C21", "D21", "E21", "D22", "D23", "D24",
                               "D25", "D26", "C28", "F28")]
    results = []
    for model, grading, facility, region, t_in, t_out, q, adder, cache, mci in case_list:
        inputs = {
            base + "C4": model["model"],
            base + "C5": grading["name"],
            base + "C6": t_in,
            base + "C7": t_out,
            base + "C8": q,
            base + "C9": facility["profile"],
            base + "C10": region["region"],
            base + "C11": adder,
            base + "C12": "" if mci is None else mci,
            base + "C13": cache,
        }
        sol = xl.calculate(inputs=inputs, outputs=outs)

        def val(cell):
            v = sol[base + cell].value[0, 0]
            return v

        results.append({
            "eReqLow": val("C21"), "eReq": val("D21"), "eReqHigh": val("E21"),
            "eMonth": val("D22"), "carbon": val("D23"), "carbonMarket": val("D24"),
            "embodied": val("D25"), "water": val("D26"),
            "grade": val("C28"), "flag": val("F28"),
        })
    return results, None


def excel_scenarios():
    """The Scenario Compare sheet carries its own formula chain (the Engine sheet
    holds one scenario). Check it against the reference on its shipped defaults
    and on an edited column."""
    try:
        import warnings
        warnings.filterwarnings("ignore")
        import formulas
    except ImportError:
        return None, "the 'formulas' package is not installed"
    book = os.path.join(ROOT, "GAIA_Assessment_Tool.xlsx")
    if not os.path.exists(book):
        return None, "GAIA_Assessment_Tool.xlsx has not been built"
    base = "'[%s]SCENARIO COMPARE'!" % os.path.basename(book)
    xl = formulas.ExcelModel().loads(book).finish()

    by_name = {m["model"]: m for m in MODELS}
    reg_by = {r["region"]: r for r in REGIONS}
    fac_by = {f["profile"]: f for f in FACILITIES}
    grade_by = {g["name"]: g for g in GRADING}

    cheap_open = min((m for m in MODELS if m["openness"] == "open"),
                     key=lambda m: m["e_out"])
    clean = min(REGIONS, key=lambda r: r["ci"])
    best_fac = min(FACILITIES, key=lambda f: f["pue"])

    # Column C ships as the first model row; column F as the frugal option.
    plans = [
        ("C", MODELS[0], grade_by["Standard"], fac_by["Unknown (API default)"],
         reg_by["Global average"], 500, 300, 10000, 0.25, 0.0),
        ("F", cheap_open, grade_by["Standard"], best_fac, clean,
         500, 300, 10000, 0.25, 0.0),
    ]
    inputs = {}
    edited = ("D", by_name[MODELS[-1]["model"]], grade_by["Reasoning/agentic"],
              fac_by["Colocation / enterprise (typical)"],
              reg_by[REGIONS[-1]["region"]], 3000, 5000, 7777, 0.4, 0.6)
    plans.append(edited)
    col, m, g, fac, reg, t_in, t_out, q, adder, cache = edited
    inputs.update({
        base + col + "5": m["model"], base + col + "6": g["name"],
        base + col + "7": t_in, base + col + "8": t_out, base + col + "9": q,
        base + col + "10": fac["profile"], base + col + "11": reg["region"],
        base + col + "12": cache, base + col + "13": adder,
    })
    outs = [base + c + r for c in ("C", "D", "F")
            for r in ("24", "25", "26", "27", "28", "30")]
    sol = xl.calculate(inputs=inputs, outputs=outs)

    results = []
    for col, m, g, fac, reg, t_in, t_out, q, adder, cache in plans:
        ref = reference(m, g, fac, reg, t_in, t_out, q, adder, cache, None)
        got = {k: sol[base + col + r].value[0, 0] for k, r in
               (("eReq", "24"), ("eMonth", "25"), ("carbon", "26"),
                ("embodied", "27"), ("water", "28"), ("grade", "30"))}
        results.append((col, ref, got))
    return results, None


# ------------------------------------------------------------- data checks
def data_checks():
    names = [m["model"] for m in MODELS]
    check("models: unique names", len(names) == len(set(names)),
          "duplicates: %s" % sorted({n for n in names if names.count(n) > 1}))
    bands = {"T1": 1.15, "T2": 1.5, "T3": 2.0, "T4": 3.0}
    for m in MODELS:
        tag = "models[%s]" % m["model"]
        check(tag + ": bounds bracket central", m["lo"] <= m["e_out"] <= m["hi"],
              "%s / %s / %s" % (m["lo"], m["e_out"], m["hi"]))
        check(tag + ": positive energy", m["e_out"] > 0)
        check(tag + ": known tier", m["tier"] in bands)
        check(tag + ": openness flag", m["openness"] in ("open", "closed"))
        check(tag + ": status flag", m["status"] in ("current", "legacy"))
        check(tag + ": capability class",
              m["cls"] in ("Frontier", "Mid", "Small", "Tiny"), m["cls"])
        if m["tier"] in bands and m["lo"] > 0:
            b = bands[m["tier"]]
            wide = (m["e_out"] / m["lo"] >= b - 1e-6) or (m["hi"] / m["e_out"] >= b - 1e-6)
            check(tag + ": band at least as wide as its tier", wide,
                  "tier %s needs x/÷ %s" % (m["tier"], b))
        if m["arch"] == "MoE" and m["params_active"] and m["params_total"]:
            check(tag + ": MoE active < total",
                  float(m["params_active"]) < float(m["params_total"]))
    # Tier-4 rows that declare a physics derivation must actually match it.
    # e_out = 2*N_active/(eta*u*3600)*S, eta=1.4e12 FLOPs/J, u=0.3, S=1.7
    per_b = 1000 * 2 * 1e9 / (1.4e12 * 0.3 * 3600) * 1.7
    derived = 0
    for raw in load("models.csv"):
        m = re.search(r"T4-physics\(A=([0-9.]+)\)", raw["basis"])
        if not m:
            continue
        derived += 1
        active = float(m.group(1))
        want = active * per_b
        got = float(raw["wh_per_1k_output_tokens_it"])
        tag = "models[%s]" % raw["model"]
        # stored at two significant figures, so allow half a unit in the last place
        check(tag + ": T4 physics matches its declared active parameters",
              abs(got - want) <= max(0.005 * want, 5e-5) + 0.05 * want,
              "declared A=%s implies %.4g, row stores %.4g" % (active, want, got))
        check(tag + ": declared A matches the params_active column",
              raw["params_active_b"] == "" or
              abs(float(raw["params_active_b"]) - active) < 1e-6,
              "basis says %s, column says %s" % (active, raw["params_active_b"]))
        check(tag + ": tier is T4", raw["tier"] == "T4")
    check("models: physics-derived rows exist", derived > 0)

    for r in REGIONS:
        check("regions[%s]: CI bounds" % r["region"], r["ci_lo"] <= r["ci"] <= r["ci_hi"])
        check("regions[%s]: EWIF bounds" % r["region"], r["ewif_lo"] <= r["ewif"] <= r["ewif_hi"])
        check("regions[%s]: CI positive" % r["region"], r["ci"] > 0)
    for x in FACILITIES:
        check("facilities[%s]: PUE >= 1" % x["profile"], x["pue"] >= 1.0)
        check("facilities[%s]: PUE bounds" % x["profile"], x["pue_lo"] <= x["pue"] <= x["pue_hi"])
        check("facilities[%s]: WUE bounds" % x["profile"], x["wue_lo"] <= x["wue"] <= x["wue_hi"])
    for g in GRADING:
        check("grading[%s]: bands increase" % g["name"], g["a"] < g["b"] < g["c"] < g["d"])
        check("grading[%s]: token defaults positive" % g["name"], g["tin"] >= 0 and g["tout"] > 0)

    # Every CSS custom property the script names must exist in the stylesheet.
    # A missing one does not throw — it renders as no colour at all, which is
    # how a chart silently turns grey.
    with open(os.path.join(ROOT, "web", "gaia.js"), encoding="utf-8") as fh:
        js_src = fh.read()
    with open(os.path.join(ROOT, "web", "gaia.css"), encoding="utf-8") as fh:
        css_src = fh.read()
    declared = set(re.findall(r"(--[a-z0-9-]+)\s*:", css_src))
    # names built by concatenation, e.g. "var(--t-" + tier + ")"
    used = set(re.findall(r"var\((--[a-z0-9-]+)\)", js_src))
    for prefix, values in ((r'"var\(--t-" \+', ["--t-1", "--t-2", "--t-3", "--t-4"]),
                           (r'"var\(--g-" \+', ["--g-a", "--g-b", "--g-c", "--g-d", "--g-e"]),
                           (r'"background:var\(--g-" \+', ["--g-a", "--g-b", "--g-c", "--g-d", "--g-e"])):
        if re.search(prefix, js_src):
            used.update(values)
    for name in sorted(used):
        check("gaia.js: CSS variable %s is defined in gaia.css" % name, name in declared,
              "the script paints with it, the stylesheet never declares it")

    # The generated page must carry exactly the CSV data.
    page = os.path.join(ROOT, "index.html")
    if os.path.exists(page):
        with open(page, encoding="utf-8") as fh:
            html = fh.read()
        mm = re.search(r"window\.GAIA_DATA = (\{.*?\});", html, re.S)
        check("index.html: embeds GAIA_DATA", mm is not None)
        if mm:
            blob = json.loads(mm.group(1).replace("<\\/", "</"))
            check("index.html: model count matches models.csv",
                  len(blob["models"]) == len(MODELS),
                  "page %d vs csv %d" % (len(blob["models"]), len(MODELS)))
            by_name = {m["model"]: m for m in blob["models"]}
            for m in MODELS:
                p = by_name.get(m["model"])
                check("index.html: %s present" % m["model"], p is not None)
                if p:
                    check("index.html: %s energy matches" % m["model"],
                          close(p["e_out"], m["e_out"], 1e-12))
            check("index.html: region count matches", len(blob["regions"]) == len(REGIONS))
            check("index.html: no external resources",
                  not re.search(r'(src|href)="https?://(?!github\.com|moseskolleh)', html),
                  "the page must not fetch anything at runtime")


# --------------------------------------------------------------------- run
def main():
    case_list = cases()
    ref = [reference(*c) for c in case_list]

    js = js_results(case_list)
    check("javascript: case count", len(js) == len(ref))
    for i, (a, b) in enumerate(zip(ref, js)):
        for k in ("eIT", "eReq", "eMonth", "eITMonth", "carbon", "embodied",
                  "water", "kLo", "kHi"):
            check("javascript case %d: %s" % (i, k), close(a[k], b[k], TOL),
                  "reference %r vs js %r" % (a[k], b[k]))
        check("javascript case %d: grade" % i, a["grade"] == b["grade"],
              "reference %s vs js %s" % (a["grade"], b["grade"]))
        check("javascript case %d: market carbon" % i,
              close(a["carbonMarket"], b["carbonMarket"], TOL)
              if a["carbonMarket"] is not None else b["carbonMarket"] is None)
        for k in ("eReq", "carbon", "water"):
            check("javascript case %d: %s is finite" % (i, k),
                  b[k] == b[k] and abs(b[k]) != float("inf"))

    data_checks()

    if "--excel" in sys.argv:
        # Every model row on the standard profile, plus every corner case.
        subset = case_list
        xl, why = excel_results(subset)
        if xl is None:
            print("! Excel cross-check skipped: %s" % why)
        else:
            sub_ref = [reference(*c) for c in subset]
            for i, (a, b) in enumerate(zip(sub_ref, xl)):
                for k in ("eReq", "eMonth", "carbon", "embodied", "water"):
                    check("excel case %d: %s" % (i, k), close(a[k], b[k], TOL_XL),
                          "reference %r vs excel %r" % (a[k], b[k]))
                check("excel case %d: grade" % i, a["grade"] == b["grade"],
                      "reference %s vs excel %r" % (a["grade"], b["grade"]))
                check("excel case %d: low bound" % i,
                      close(a["eReq"] * a["kLo"], b["eReqLow"], TOL_XL))
                check("excel case %d: high bound" % i,
                      close(a["eReq"] * a["kHi"], b["eReqHigh"], TOL_XL))
                if a["carbonMarket"] is None:
                    check("excel case %d: market carbon withheld" % i,
                          str(b["carbonMarket"]).strip().lower() == "not provided",
                          "expected 'not provided', got %r" % (b["carbonMarket"],))
                else:
                    check("excel case %d: market carbon" % i,
                          close(a["carbonMarket"], b["carbonMarket"], TOL_XL),
                          "reference %r vs excel %r" % (a["carbonMarket"], b["carbonMarket"]))

    if "--excel" in sys.argv:
        scen, why = excel_scenarios()
        if scen is None:
            print("! Scenario Compare cross-check skipped: %s" % why)
        else:
            for col, ref, got in scen:
                for k in ("eReq", "eMonth", "carbon", "embodied", "water"):
                    check("scenario column %s: %s" % (col, k),
                          close(ref[k], got[k], TOL_XL),
                          "reference %r vs sheet %r" % (ref[k], got[k]))
                check("scenario column %s: grade" % col, ref["grade"] == got["grade"],
                      "reference %s vs sheet %r" % (ref["grade"], got["grade"]))

    print("%d checks, %d failures" % (checks, len(failures)))
    for fl in failures[:60]:
        print("  FAIL %s" % fl)
    if len(failures) > 60:
        print("  ... and %d more" % (len(failures) - 60))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
