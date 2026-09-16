#!/usr/bin/env python3
"""
build_site.py — deterministic generator of index.html (the GAIA web estimator).

Like the Excel workbook, the published page is a BUILD ARTIFACT. It is assembled
from:

    web/template.html   markup with {{...}} placeholders
    web/gaia.css        stylesheet
    web/gaia.js         application + engine
    data/*.csv          the sourced factor tables — the single source of truth

Running this script is the only way the page's data changes, so the page, the
workbook, and the specification cannot drift apart (FRAMEWORK.md §9).

    python3 build_site.py

Produces a self-contained single file with no external requests: no fonts, no
CDN, no analytics. That property is deliberate and must be preserved.
"""

import csv
import json
import os
import re
import sys

VERSION = "2.2.0"
VERSION_DATE = "2026-09-16"

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
WEB = os.path.join(HERE, "web")
OUT = os.path.join(HERE, "index.html")

# Defaults the estimator opens with. A widely used mid-tier model on the global
# average grid with the unknown-facility profile: the honest default for an
# organization that has not yet looked anything up.
DEFAULT_MODEL = "GPT-5.6 Terra"
DEFAULT_TASK = "S"
DEFAULT_FACILITY = "Unknown (API default)"
DEFAULT_REGION = "Global average"


def load_csv(name):
    path = os.path.join(DATA, name)
    with open(path, newline="", encoding="utf-8") as f:
        return [dict(r) for r in csv.DictReader(f)]


def fnum(s, default=None):
    """Parse a numeric CSV field; empty stays empty rather than becoming zero."""
    s = ("" if s is None else str(s)).strip()
    if s == "":
        return default
    return float(s)


def snum(s):
    """Numeric-or-empty-string, for fields that are legitimately undisclosed."""
    s = ("" if s is None else str(s)).strip()
    if s == "":
        return ""
    try:
        f = float(s)
        return int(f) if f == int(f) else f
    except ValueError:
        return s


def build_data():
    models = []
    for m in load_csv("models.csv"):
        if not m.get("model"):
            continue
        models.append({
            "model": m["model"],
            "provider": m["provider"],
            "cls": m["capability_class"],
            "reasoning": m["reasoning_mode"],
            "openness": m["openness"],
            "license": m["license"],
            "arch": m["architecture"],
            "params_total": snum(m["params_total_b"]),
            "params_active": snum(m["params_active_b"]),
            "ctx": m["context_window"],
            "released": m["released"],
            "status": m["status"],
            "e_out": fnum(m["wh_per_1k_output_tokens_it"], 0.0),
            "lo": fnum(m["wh_low"], 0.0),
            "hi": fnum(m["wh_high"], 0.0),
            "tier": m["tier"],
            "vintage": m["vintage"],
            "basis": m["basis"],
            "source": m["source"],
            # Derived flags so the interface can distinguish a placeholder from
            # a derivation without re-parsing prose at runtime.
            "anchored": m["basis"].startswith("Class anchor"),
            "derived": "T4-physics(" in m["basis"],
        })

    regions = [{
        "region": r["region"],
        "ci": fnum(r["ci_location_gco2_kwh"], 0.0),
        "ci_lo": fnum(r["ci_low"], 0.0),
        "ci_hi": fnum(r["ci_high"], 0.0),
        "ewif": fnum(r["ewif_l_kwh"], 0.0),
        "ewif_lo": fnum(r["ewif_low"], 0.0),
        "ewif_hi": fnum(r["ewif_high"], 0.0),
        "vintage": r["vintage"],
        "source": r["source"],
        "notes": r["notes"],
    } for r in load_csv("regions.csv")]

    facilities = [{
        "profile": f["profile"],
        "pue": fnum(f["pue"], 1.0),
        "pue_lo": fnum(f["pue_low"], 1.0),
        "pue_hi": fnum(f["pue_high"], 1.0),
        "wue": fnum(f["wue_l_kwh"], 0.0),
        "wue_lo": fnum(f["wue_low"], 0.0),
        "wue_hi": fnum(f["wue_high"], 0.0),
        "source": f["source"],
        "notes": f["notes"],
    } for f in load_csv("facilities.csv")]

    grading = [{
        "name": g["task_class"],
        "code": g["class_code"],
        "tin": int(float(g["tokens_in_default"])),
        "tout": int(float(g["tokens_out_default"])),
        "a": fnum(g["grade_a_max_wh"], 0.0),
        "b": fnum(g["grade_b_max_wh"], 0.0),
        "c": fnum(g["grade_c_max_wh"], 0.0),
        "d": fnum(g["grade_d_max_wh"], 0.0),
        "desc": g["description"],
    } for g in load_csv("grading.csv")]

    mitigation = [{
        "rank": int(float(m["rank"])),
        "lever": m["lever"],
        "who": m["who_controls"],
        "effect": m["measured_effect"],
        "evidence": m["evidence"],
    } for m in load_csv("mitigation.csv")]

    equivalents = [{
        "quantity": e["quantity"],
        "per_unit": e["per_unit"],
        "equivalent": e["equivalent"],
        "factor": fnum(e["factor"], 0.0),
        "source": e["source"],
    } for e in load_csv("equivalents.csv")]

    frameworks = [{
        "framework": f["framework"],
        "org": f["org"],
        "type": f["type"],
        "what": f["what_it_does"],
        "relation": f["relation_to_gaia"],
    } for f in load_csv("frameworks.csv")]

    standards = [{"name": s["standard"], "note": s["role_in_gaia"]}
                 for s in load_csv("standards.csv")]

    alignment = [{
        "framework": a["framework"],
        "element": a["element"],
        "requirement": a["requirement"],
        "gaia_output": a["gaia_output"],
    } for a in load_csv("alignment.csv")]

    return {
        "version": VERSION,
        "version_date": VERSION_DATE,
        "defaults": {
            "model": DEFAULT_MODEL,
            "task": DEFAULT_TASK,
            "facility": DEFAULT_FACILITY,
            "region": DEFAULT_REGION,
        },
        "models": models,
        "regions": regions,
        "facilities": facilities,
        "grading": grading,
        "mitigation": mitigation,
        "equivalents": equivalents,
        "frameworks": frameworks,
        "standards": standards,
        "alignment": alignment,
    }


def check(data):
    """Fail the build rather than publish an inconsistent page (P1)."""
    problems = []
    names = [m["model"] for m in data["models"]]
    if len(names) != len(set(names)):
        dupes = sorted({n for n in names if names.count(n) > 1})
        problems.append("duplicate model rows: " + ", ".join(dupes))
    if data["defaults"]["model"] not in names:
        problems.append("default model %r is not in models.csv" % data["defaults"]["model"])
    if data["defaults"]["region"] not in [r["region"] for r in data["regions"]]:
        problems.append("default region %r is not in regions.csv" % data["defaults"]["region"])
    if data["defaults"]["facility"] not in [f["profile"] for f in data["facilities"]]:
        problems.append("default facility %r is not in facilities.csv" % data["defaults"]["facility"])
    if data["defaults"]["task"] not in [g["code"] for g in data["grading"]]:
        problems.append("default task class %r is not in grading.csv" % data["defaults"]["task"])

    for m in data["models"]:
        where = "models.csv row %r" % m["model"]
        if not (m["lo"] <= m["e_out"] <= m["hi"]):
            problems.append("%s: bounds do not bracket the central value "
                            "(%s <= %s <= %s)" % (where, m["lo"], m["e_out"], m["hi"]))
        if m["e_out"] <= 0:
            problems.append("%s: non-positive central energy" % where)
        if m["tier"] not in ("T1", "T2", "T3", "T4"):
            problems.append("%s: unknown tier %r" % (where, m["tier"]))
        if m["openness"] not in ("open", "closed"):
            problems.append("%s: openness must be 'open' or 'closed', got %r" % (where, m["openness"]))
        if m["status"] not in ("current", "legacy"):
            problems.append("%s: status must be 'current' or 'legacy', got %r" % (where, m["status"]))
        if not m["source"].strip():
            problems.append("%s: empty source — P1 forbids unsourced values" % where)
        if m["cls"] not in ("Frontier", "Mid", "Small", "Tiny"):
            problems.append("%s: unknown capability class %r" % (where, m["cls"]))
        # A tier's band is the minimum width; rows may be wider, never narrower.
        min_band = {"T1": 1.15, "T2": 1.5, "T3": 2.0, "T4": 3.0}[m["tier"]]
        tol = 1e-6
        if m["e_out"] / m["lo"] < min_band - tol and m["hi"] / m["e_out"] < min_band - tol:
            problems.append("%s: band narrower than its tier allows (needs ×/÷ %s)"
                            % (where, min_band))

    for r in data["regions"]:
        if not (r["ci_lo"] <= r["ci"] <= r["ci_hi"]):
            problems.append("regions.csv %r: CI bounds do not bracket the central value" % r["region"])
        if not (r["ewif_lo"] <= r["ewif"] <= r["ewif_hi"]):
            problems.append("regions.csv %r: EWIF bounds do not bracket the central value" % r["region"])
        if not r["source"].strip():
            problems.append("regions.csv %r: empty source" % r["region"])

    for f in data["facilities"]:
        if not (f["pue_lo"] <= f["pue"] <= f["pue_hi"]):
            problems.append("facilities.csv %r: PUE bounds do not bracket the central value" % f["profile"])
        if not (f["wue_lo"] <= f["wue"] <= f["wue_hi"]):
            problems.append("facilities.csv %r: WUE bounds do not bracket the central value" % f["profile"])
        if f["pue"] < 1.0:
            problems.append("facilities.csv %r: PUE below 1.0 is physically impossible" % f["profile"])

    for g in data["grading"]:
        if not (g["a"] < g["b"] < g["c"] < g["d"]):
            problems.append("grading.csv %r: grade bands must increase A<B<C<D" % g["name"])

    return problems


def stats(data):
    current = [m for m in data["models"] if m["status"] != "legacy"]
    vals = [m["e_out"] for m in current if m["e_out"] > 0]
    spread = max(vals) / min(vals) if len(vals) > 1 else 1
    return {
        "MODEL_COUNT": str(len(current)),
        "OPEN_COUNT": str(len([m for m in current if m["openness"] == "open"])),
        "REGION_COUNT": str(len(data["regions"])),
        "PROVIDER_COUNT": str(len({m["provider"] for m in current})),
        "SPREAD": "%d×" % round(spread),
    }


def main():
    data = build_data()
    problems = check(data)
    if problems:
        sys.stderr.write("build_site.py: data validation failed\n")
        for p in problems:
            sys.stderr.write("  - %s\n" % p)
        return 1

    with open(os.path.join(WEB, "template.html"), encoding="utf-8") as f:
        html = f.read()
    with open(os.path.join(WEB, "gaia.css"), encoding="utf-8") as f:
        css = f.read()
    with open(os.path.join(WEB, "gaia.js"), encoding="utf-8") as f:
        js = f.read()

    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=False)
    # </script> inside a string would close the inline block early.
    blob = blob.replace("</", "<\\/")
    payload = ("/* Generated by build_site.py from data/*.csv — do not edit. */\n"
               "window.GAIA_DATA = " + blob + ";")

    repl = {"CSS": css, "JS": js, "DATA": payload,
            "VERSION": VERSION, "VERSION_DATE": VERSION_DATE}
    repl.update(stats(data))

    def sub(match):
        key = match.group(1)
        if key not in repl:
            raise SystemExit("build_site.py: unknown placeholder {{%s}} in template" % key)
        return repl[key]

    html = re.sub(r"\{\{([A-Z_]+)\}\}", sub, html)

    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)

    kb = len(html.encode("utf-8")) / 1024
    print("Wrote %s (%.0f KB, self-contained)" % (OUT, kb))
    print("  %s models (%s open-weight) · %s regions · %s facilities · %s levers"
          % (len(data["models"]), len([m for m in data["models"] if m["openness"] == "open"]),
             len(data["regions"]), len(data["facilities"]), len(data["mitigation"])))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
