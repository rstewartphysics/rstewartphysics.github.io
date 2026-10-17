#!/usr/bin/env python3
"""Electricity 1 Practice Test A — the physics; the page comes from pagebuild.

Every answer is computed here from the `@values` block of `test-a.md`; nothing
numeric is typed into the Markdown or the template, so a changed resistance
cannot leave a stale current three parts later (plan §5.7).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))

import circuit as C
import graphs as G
import pagebuild as P

SRC = os.path.join(HERE, "test-a.md")
OUT = (P.REPO + "/classes/s3-physics/"
       "electricity1/practice-test-a.html")

# ------------------------------------------------------------------ physics



def compute(v):
    n = {k: float(x) for k, x in v.items() if k != "c1_bands"}
    d = {}

    # W3 — series voltage rule
    w3v2 = n["w3_supply"] - n["w3_v1"]
    d["w3_supply"] = P.fixed(n["w3_supply"], 1)
    d["w3_v1"] = P.fixed(n["w3_v1"], 1)
    d["w3_v2"] = P.fixed(w3v2, 1)
    d["w3_options"] = [P.fixed(n["w3_supply"] / n["w3_v1"], 1) + " V", P.fixed(w3v2, 1) + " V",
                       P.fixed(n["w3_v1"], 1) + " V", P.fixed(n["w3_supply"], 1) + " V",
                       P.fixed(n["w3_supply"] + n["w3_v1"], 1) + " V"]
    d["w3_key"] = 1

    # W4 — current splits at a parallel junction
    a1, a2 = n["w4_a1"], n["w4_a2"]
    a3 = a1 - a2
    d["w4_a1"] = P.fixed(a1, 2)
    d["w4_a2"] = P.fixed(a2, 2)
    d["w4_a3"] = P.fixed(a3, 2)
    d["w4_sum"] = P.fixed(a1 + a2, 2)
    d["w4_options"] = [P.fixed(a3 / 2.0, 2) + " A", P.fixed(a3, 2) + " A",
                       P.fixed(a2, 2) + " A", P.fixed(a1, 2) + " A",
                       P.fixed(a1 + a2, 2) + " A"]
    d["w4_key"] = 1

    # W5 — one resistor in series with a parallel pair
    rp = 1.0 / (1.0 / n["w5_parallel"] + 1.0 / n["w5_parallel"])
    tot = rp + n["w5_series"]
    d["w5_series"] = P.fm(n["w5_series"])
    d["w5_parallel"] = P.fm(n["w5_parallel"])
    d["w5_rp"] = P.fixed(rp, 1)
    d["w5_total"] = P.fm(tot)
    d["w5_options"] = [P.fixed(n["w5_series"] / 3.0, 1) + " Ω", P.fixed(rp, 1) + " Ω",
                       P.fm(n["w5_series"]) + " Ω", P.fm(tot) + " Ω",
                       P.fm(n["w5_series"] * 3) + " Ω"]
    d["w5_key"] = 3

    # C1 — resistor colour code
    b = [x.strip() for x in v["c1_bands"].split(",")]
    digits = P.COLOUR_DIGIT[b[0]] * 10 + P.COLOUR_DIGIT[b[1]]
    val = digits * P.COLOUR_MULT[b[2]]
    tol = P.COLOUR_TOL[b[3]]
    tol_ohms = val * tol / 100.0
    meas = n["c1_measured_k"] * 1000
    for i, x in enumerate(b):
        d["c1_b%d" % (i + 1)] = x
    d["c1_d1"] = str(P.COLOUR_DIGIT[b[0]])
    d["c1_d2"] = str(P.COLOUR_DIGIT[b[1]])
    d["c1_digits"] = str(digits)
    d["c1_mult"] = P.fm(P.COLOUR_MULT[b[2]], 4)
    d["c1_value"] = P.fm(val, 4)
    d["c1_value_k"] = P.fm(val / 1000.0)
    d["c1_tol"] = P.fm(tol)
    d["c1_tol_ohms"] = P.fm(tol_ohms, 4)
    d["c1_max"] = P.fm(val + tol_ohms, 4)
    d["c1_max_k"] = P.fm((val + tol_ohms) / 1000.0, 4)
    d["c1_min"] = P.fm(val - tol_ohms, 4)
    d["c1_min_k"] = P.fm((val - tol_ohms) / 1000.0, 4)
    d["c1_measured"] = P.fm(meas, 4)
    d["c1_measured_k"] = P.fixed(n["c1_measured_k"], 2)
    d["_num"] = {"c1_value_k": (val / 1000.0, "kΩ"),
                 "c1_max": (val + tol_ohms, "Ω")}

    # C2 — two resistors in series
    tot2 = n["c2_r1"] + n["c2_r2"]
    cur = n["c2_supply"] / tot2
    v1 = cur * n["c2_r1"]
    d["c2_supply"] = P.fm(n["c2_supply"])
    d["c2_r1"] = P.fm(n["c2_r1"], 4)
    d["c2_r2"] = P.fm(n["c2_r2"], 4)
    d["c2_r1_k"] = P.fm(n["c2_r1"] / 1000.0)
    d["c2_r2_k"] = P.fm(n["c2_r2"] / 1000.0)
    d["c2_total"] = P.fm(tot2, 4)
    d["c2_total_k"] = P.fixed(tot2 / 1000.0, 1)
    d["c2_current"] = P.fm(cur * 1000, 2) + " × 10⁻³"
    d["c2_current_ma"] = P.fm(cur * 1000, 2)
    d["c2_v1"] = P.fm(v1, 3)
    d["c2_v1_2sf"] = P.fm(v1, 2)
    d["_num"].update({"c2_total_k": (tot2 / 1000.0, "kΩ"),
                      "c2_current_ma": (cur * 1000, "mA"),
                      "c2_v1": (v1, "V")})

    # C3 — resistance from the gradient of a V-I graph
    grad, p1, p2 = n["c3_gradient"], n["c3_p1"], n["c3_p2"]
    d["c3_gradient"] = P.fm(grad)
    d["c3_p1"] = P.fixed(p1, 2)
    d["c3_p2"] = P.fixed(p2, 2)
    d["c3_v1"] = P.fixed(p1 * grad, 1)
    d["c3_v2"] = P.fixed(p2 * grad, 1)
    d["c3_resistance"] = P.fm(grad)
    # a worked example point on a grid line, so a pupil can actually read it off
    step = 0.02
    pt_i = round(round((n["c3_imax"] / 2.0) / step) * step, 4)
    d["c3_pt_i"] = P.fixed(pt_i, 2)
    d["c3_pt_v"] = P.fixed(pt_i * grad, 1)
    d["c3_lo"] = P.fm(grad * 0.95, 2)
    d["c3_hi"] = P.fm(grad * 1.05, 2)
    d["_num"]["c3_resistance"] = (grad, "Ω")

    # P1 — parallel pair in series with a protection resistor
    par = 1.0 / (2.0 / n["p1_cable"])
    tot3 = par + n["p1_protect"]
    i1 = n["p1_supply"] / tot3
    par3 = 1.0 / (3.0 / n["p1_cable"])
    tot4 = par3 + n["p1_protect"]
    i3 = n["p1_supply"] / tot4
    d["p1_supply"] = P.fm(n["p1_supply"])
    d["p1_cable"] = P.fm(n["p1_cable"])
    d["p1_protect"] = P.fm(n["p1_protect"])
    d["p1_parallel"] = P.fixed(par, 1)
    d["p1_total"] = P.fixed(tot3, 1)
    d["p1_current"] = P.fixed(i1, 2)
    d["p1_parallel3"] = P.fixed(par3, 1)
    d["p1_total3"] = P.fixed(tot4, 1)
    d["p1_current3"] = P.fixed(i3, 2)
    d["_num"].update({"p1_total": (tot3, "Ω"), "p1_current": (i1, "A")})
    return d


# ----------------------------------------------------------------- diagrams

def diagrams(v, d):
    n = {k: float(x) for k, x in v.items() if k != "c1_bands"}
    return {
        "w1_symbols": C.symbol_row([C.Motor(), C.VR(), C.Fuse(), C.Ohm()],
                                   letters=["W", "X", "Y", "Z"]),
        "w3_series": C.schematic(
            top=[C.Battery(d["w3_supply"] + " V")],
            bottom=[C.R("R₁", across=C.V("V₁")), C.R("R₂", across=C.V("V₂"))]),
        "w4_parallel": C.schematic(
            top=[C.Battery(), C.A("A₁")],
            bottom=[C.Par([[C.A("A₂"), C.R("R₁")], [C.A("A₃"), C.R("R₂")]])]),
        "w5_network": C.network([C.R(d["w5_series"] + " Ω"),
                                 C.Par([[C.R(d["w5_parallel"] + " Ω")],
                                        [C.R(d["w5_parallel"] + " Ω")]])]),
        "c1_bands": C.resistor_bands([x.strip() for x in v["c1_bands"].split(",")]),
        "c2_series": C.schematic(
            top=[C.Battery(d["c2_supply"] + " V")],
            bottom=[C.A(), C.R(d["c2_r1_k"] + " kΩ"), C.R(d["c2_r2_k"] + " kΩ")]),
        "c3_graph": G.vi_line(n["c3_gradient"], n["c3_imax"],
                              "Graph of voltage across R against current in R: a straight "
                              "line through the origin"),
        "c3_lamp": G.vi_lamp("Sketch graph of voltage across a filament lamp against "
                             "current in it: a curve that gets steeper"),
        "p1_circuit": C.schematic(
            top=[C.Battery(d["p1_supply"] + " V"), C.A()],
            bottom=[C.R(d["p1_protect"] + " Ω"),
                    C.Par([[C.R(d["p1_cable"] + " Ω")],
                           [C.Switch("S"), C.R(d["p1_cable"] + " Ω")]])]),
    }



def main():
    meta, values, qs = P.parse(open(SRC, encoding="utf-8").read())
    d = compute(values)
    dia = diagrams(values, d)
    data = P.payload(qs, d)
    html = P.page(meta, qs, d, dia, data)

    errs, warns = P.check(html, meta, qs, d, values)
    for w in warns:
        print("WARN  " + w)
    for e in errs:
        print("ERROR " + e)
    if errs:
        print("\n%d error(s) — not written." % len(errs))
        return 1

    open(OUT, "w", encoding="utf-8").write(html)
    open(os.path.join(HERE, "provenance.csv"), "w", encoding="utf-8").write(
        P.provenance(qs, d))
    open(os.path.join(HERE, "marking-instructions.html"), "w", encoding="utf-8").write(
        P.marking_instructions(meta, qs, d))
    open(os.path.join(HERE, "answers.json"), "w", encoding="utf-8").write(
        json.dumps({k: v for k, v in d.items() if not k.startswith("_")},
                   ensure_ascii=False, indent=1))
    print("built %s  (%d questions, %s marks, %d bytes)"
          % (OUT, len(qs), meta["marks"], len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
