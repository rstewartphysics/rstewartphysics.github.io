#!/usr/bin/env python3
"""Electricity 1 Practice Test B — the physics; the page comes from pagebuild.

Same template and guardrails as Test A. Every answer is computed here from the
`@values` block of `test-b.md`.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))

import circuit as C
import pagebuild as P

SRC = os.path.join(HERE, "test-b.md")
OUT = (P.REPO + "/classes/s3-physics/"
       "electricity1/practice-test-b.html")


def compute(v):
    n = {k: float(x) for k, x in v.items() if k != "c2_bands"}
    d = {}

    # W3 — two unequal resistors in parallel
    r1, r2 = n["w3_r1"], n["w3_r2"]
    recip = 1.0 / r1 + 1.0 / r2
    tot = 1.0 / recip
    d["w3_r1"] = P.fm(r1)
    d["w3_r2"] = P.fm(r2)
    d["w3_recip"] = P.fm(recip, 3)
    d["w3_total"] = P.fm(tot)
    d["w3_uninverted"] = P.fm(recip, 2)
    d["w3_series"] = P.fm(r1 + r2)
    d["w3_options"] = [P.fm(recip, 2) + " Ω", P.fm(tot) + " Ω",
                       P.fm((r1 + r2) / 2.0) + " Ω", P.fm(r1 + r2) + " Ω",
                       P.fm(r1 * r2, 3) + " Ω"]
    d["w3_key"] = 1

    # W4 — V = IR in one step
    vr, vi = n["w4_r"], n["w4_i"]
    d["w4_r"] = P.fm(vr)
    d["w4_i"] = P.fixed(vi, 2)
    d["w4_v"] = P.fm(vi * vr)
    d["w4_div"] = P.fm(vr / vi, 3)
    d["w4_options"] = [P.fm(vi / vr, 2) + " V", P.fm(vi * vr / 10.0, 2) + " V",
                       P.fm(vi * vr) + " V", P.fm(vr) + " V",
                       P.fm(vr / vi, 3) + " V"]
    d["w4_key"] = 2

    # C1 — two resistors in series
    s1, s2, vs = n["c1_r1"], n["c1_r2"], n["c1_supply"]
    stot = s1 + s2
    si = vs / stot
    d["c1_supply"] = P.fixed(vs, 1)
    d["c1_r1"] = P.fm(s1)
    d["c1_r2"] = P.fm(s2)
    d["c1_total"] = P.fm(stot)
    d["c1_current"] = P.fixed(si, 2)
    d["_num"] = {"c1_total": (stot, "Ω"), "c1_current": (si, "A")}

    # C2 — resistor colour code
    b = [x.strip() for x in v["c2_bands"].split(",")]
    digits = P.COLOUR_DIGIT[b[0]] * 10 + P.COLOUR_DIGIT[b[1]]
    val = digits * P.COLOUR_MULT[b[2]]
    tol = P.COLOUR_TOL[b[3]]
    tol_ohms = val * tol / 100.0
    meas = n["c2_measured_k"] * 1000
    for i, x in enumerate(b):
        d["c2_b%d" % (i + 1)] = x
    d["c2_d1"] = str(P.COLOUR_DIGIT[b[0]])
    d["c2_d2"] = str(P.COLOUR_DIGIT[b[1]])
    d["c2_digits"] = str(digits)
    d["c2_mult"] = P.fm(P.COLOUR_MULT[b[2]], 4)
    d["c2_value"] = P.fm(val, 4)
    d["c2_value_k"] = P.fm(val / 1000.0)
    d["c2_tol"] = P.fm(tol)
    d["c2_tol_ohms"] = P.fm(tol_ohms, 4)
    d["c2_min"] = P.fm(val - tol_ohms, 4)
    d["c2_min_k"] = P.fm((val - tol_ohms) / 1000.0, 4)
    d["c2_max"] = P.fm(val + tol_ohms, 4)
    d["c2_max_k"] = P.fm((val + tol_ohms) / 1000.0, 4)
    d["c2_measured"] = P.fm(meas, 4)
    d["c2_measured_k"] = P.fixed(n["c2_measured_k"], 1)
    d["_num"].update({"c2_value_k": (val / 1000.0, "kΩ"),
                      "c2_min": (val - tol_ohms, "Ω")})

    # C3 — two unequal resistors in parallel across a supply
    p1, p2, pv = n["c3_r1"], n["c3_r2"], n["c3_supply"]
    ptot = 1.0 / (1.0 / p1 + 1.0 / p2)
    branch = pv / p1
    d["c3_supply"] = P.fm(pv)
    d["c3_r1"] = P.fm(p1)
    d["c3_r2"] = P.fm(p2)
    d["c3_total"] = P.fm(ptot)
    d["c3_branch"] = P.fixed(branch, 2)
    d["_num"].update({"c3_total": (ptot, "Ω"), "c3_branch": (branch, "A")})

    # P1 — series voltage sharing to find an unknown resistance
    sup, prot, vp = n["p1_supply"], n["p1_protect"], n["p1_vprotect"]
    cur = vp / prot
    vel = sup - vp
    rel = vel / cur
    d["p1_supply"] = P.fm(sup)
    d["p1_protect"] = P.fm(prot)
    d["p1_vprotect"] = P.fixed(vp, 1)
    d["p1_current"] = P.fixed(cur, 3)
    d["p1_velement"] = P.fixed(vel, 1)
    d["p1_element"] = P.fm(rel, 3)
    d["p1_total"] = P.fm(sup / cur, 4)
    d["_num"].update({"p1_current": (cur, "A"), "p1_element": (rel, "Ω")})
    return d


def diagrams(v, d):
    return {
        "w3_network": C.network([C.Par([[C.R(d["w3_r1"] + " Ω")],
                                        [C.R(d["w3_r2"] + " Ω")]])],
                                terminals=("P", "Q")),
        "c1_series": C.schematic(
            top=[C.Battery(d["c1_supply"] + " V")],
            bottom=[C.A(), C.R(d["c1_r1"] + " Ω"), C.R(d["c1_r2"] + " Ω")]),
        "c2_bands": C.resistor_bands([x.strip() for x in v["c2_bands"].split(",")]),
        "c3_parallel": C.schematic(
            top=[C.Battery(d["c3_supply"] + " V"), C.A()],
            bottom=[C.Par([[C.R(d["c3_r1"] + " Ω")], [C.R(d["c3_r2"] + " Ω")]])]),
        "p1_circuit": C.schematic(
            top=[C.Battery(d["p1_supply"] + " V")],
            bottom=[C.R(d["p1_protect"] + " Ω", across=C.V()),
                    C.R("heating element")]),
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
    open(os.path.join(HERE, "provenance-b.csv"), "w", encoding="utf-8").write(
        P.provenance(qs, d))
    open(os.path.join(HERE, "marking-instructions-b.html"), "w", encoding="utf-8").write(
        P.marking_instructions(meta, qs, d))
    open(os.path.join(HERE, "answers-b.json"), "w", encoding="utf-8").write(
        json.dumps({k: v for k, v in d.items() if not k.startswith("_")},
                   ensure_ascii=False, indent=1))
    print("built %s  (%d questions, %s marks, %d bytes)"
          % (OUT, len(qs), meta["marks"], len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
