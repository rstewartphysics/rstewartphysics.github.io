#!/usr/bin/env python3
"""Simple Harmonic Motion — Practice Test B. The physics only.

The companion to `build.py`, sharing its profile and therefore its page, and
sharing nothing else: different parents, different apparatus, different
numbers, different answers. `verify.py` checks all three mechanically once this
has run.
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
sys.path.insert(0, HERE)

import blacklist_check as BL
import oscillate as O
import pagebuild as P
import profile as PROF

SRC = os.path.join(HERE, "test-b.md")
OUT = (P.REPO + "/classes/adv/"
       "practice-tests/shm-simple-harmonic-motion-b.html")

TWO_PI = 2.0 * math.pi


# ------------------------------------------------------------------ physics

def compute(v):
    n = {k: float(x) for k, x in v.items()}
    d = {}

    # W2 — the period from the angular frequency
    w2 = n["w2_omega"]
    t2 = TWO_PI / w2
    d["w2_omega"] = P.fm(w2)
    d["w2_period"] = P.fm_sf(t2, 2)
    d["w2_inv"] = P.fm_sf(1.0 / w2, 2)            # the 2π left out
    d["w2_mult"] = P.fm_sf(TWO_PI * w2, 2)        # multiplying, not dividing
    d["w2_freq"] = P.fm_sf(w2 / TWO_PI, 2)        # the frequency, not the period
    d["w2_options"] = [P.fm_sf(1.0 / w2, 2) + " s",
                       P.fm_sf(math.pi / w2, 2) + " s",
                       P.fm_sf(t2, 2) + " s",
                       P.fm_sf(w2 / TWO_PI, 2) + " s",
                       P.fm_sf(TWO_PI * w2, 2) + " s"]
    d["w2_key"] = 2

    # C1 — the flour machine on springs: ω from T, then k, then v(max)
    m1, t1, a1 = n["c1_mass"], n["c1_period"], n["c1_amp"]
    w1 = TWO_PI / t1
    k1 = m1 * w1 * w1
    v1 = w1 * a1
    d["c1_mass"] = P.fm(m1)
    d["c1_period"] = P.fm(t1)
    d["c1_amp"] = P.fm(a1)
    d["c1_omega_disp"] = P.fm_sf(w1, 3)
    d["c1_k_disp"] = P.sci(k1, 2)
    d["c1_vmax_disp"] = P.fm_sf(v1, 2)

    # C2 — the pogo stick: Ek at half the amplitude, then a(max)
    m2, w2b, a2 = n["c2_mass"], n["c2_omega"], n["c2_amp"]
    half = a2 / 2.0
    ek = 0.5 * m2 * w2b * w2b * (a2 * a2 - half * half)
    ekmax = 0.5 * m2 * w2b * w2b * a2 * a2
    amax = w2b * w2b * a2
    d["c2_mass"] = P.fm(m2)
    d["c2_omega"] = P.fm(w2b)
    d["c2_amp"] = P.fm(a2)
    d["c2_half"] = P.fm(half)
    d["c2_ek_disp"] = P.fm_sf(ek, 2)
    d["c2_ekmax_disp"] = P.fm_sf(ekmax, 2)
    d["c2_amax_disp"] = P.fm_sf(amax, 2)

    # P2 — the springboard: a quarter of a period from the equation of motion
    ap, wp = n["p2_amp"], n["p2_omega"]
    tp = TWO_PI / wp
    d["p2_amp"] = P.fm(ap)
    d["p2_omega"] = P.fm(wp)
    d["p2_period_disp"] = P.fm_sf(tp, 2)
    d["p2_quarter_disp"] = P.fm_sf(tp / 4.0, 2)
    d["p2_half_disp"] = P.fm_sf(tp / 2.0, 2)

    d["g"] = P.fm(n["g"])

    d["_quantities"] = ["%g rad s⁻¹" % w2, "%g kg" % m1, "%g s" % t1,
                        "%g m" % a1, "%g kg" % m2, "%g rad s⁻¹" % w2b,
                        "%g m" % a2, "%g m" % ap, "%g rad s⁻¹" % wp]
    d["_num"] = {"c1_k": (k1, "N m⁻¹"),
                 "c1_vmax": (v1, "m s⁻¹"),
                 "c2_ek": (ek, "J"),
                 "c2_amax": (amax, "m s⁻²"),
                 "p2_quarter": (tp / 4.0, "s")}
    return d


# ----------------------------------------------------------------- diagrams

def diagrams(v, d):
    return {
        "w3_energy": O.graph_options(
            ["ep", "ek", "linear", "flat"],
            "Four sketch graphs of energy against displacement, labelled A to "
            "D, each drawn from minus A through zero to plus A. A is a "
            "parabola with its minimum at zero displacement. B is a parabola "
            "with its maximum at zero displacement. C is a V shape with its "
            "point at zero displacement. D is a horizontal line.",
            curve=O.energy_curves, ylab="energy (J)",
            xlab="displacement (m)"),
        "c1_machine": O.block_on_spring(
            mass_label=d["c1_mass"] + " kg",
            label="A machine of mass %s kg resting on a spring mounting that "
                  "stands on the floor. A dashed line marks the equilibrium "
                  "position of the machine, and an arrow shows that it "
                  "oscillates vertically about it." % d["c1_mass"]),
        "c2_accel": O.graph_options(
            ["negcos", "cos", "sin", "negsin"],
            "Four sketch graphs of acceleration against time, labelled A to D, "
            "each drawn over one full oscillation. A starts at its most "
            "negative value and returns there. B starts at its most positive "
            "value and returns there. C starts at zero, rises to a maximum, "
            "then falls to a minimum. D starts at zero, falls to a minimum, "
            "then rises to a maximum.",
            ylab="acceleration (m s⁻²)"),
        "p2_board": O.diving_board(
            label="A springboard clamped at one end, its free end level with a "
                  "dashed line marking the rest position, and a double-headed "
                  "arrow at the free end showing that it oscillates up and "
                  "down."),
    }


def main():
    meta, values, qs = P.parse(open(SRC, encoding="utf-8").read())
    PROF.apply(meta)
    d = compute(values)
    dia = diagrams(values, d)
    data = P.payload(qs, d)
    html = P.page(meta, qs, d, dia, data)

    if BL.report(d["_quantities"], BL.load("blacklist-ah.json")):
        print("\nblacklist clash — not written.")
        return 1

    errs, warns = P.check(html, meta, qs, d, values)
    for w in warns:
        print("WARN  " + w)
    for e in errs:
        print("ERROR " + e)
    if errs:
        print("\n%d error(s) — not written." % len(errs))
        return 1

    if not os.path.isdir(os.path.dirname(OUT)):
        os.makedirs(os.path.dirname(OUT))
    open(OUT, "w", encoding="utf-8").write(html)
    open(os.path.join(HERE, "provenance-b.csv"), "w", encoding="utf-8").write(
        P.provenance(qs, d))
    open(os.path.join(HERE, "marking-instructions-b.html"), "w",
         encoding="utf-8").write(P.marking_instructions(meta, qs, d))
    open(os.path.join(HERE, "answers-b.json"), "w", encoding="utf-8").write(
        json.dumps({k: x for k, x in d.items() if not k.startswith("_")},
                   ensure_ascii=False, indent=1))
    print("built %s  (%d questions, %s marks, %d bytes)"
          % (OUT, len(qs), meta["marks"], len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
