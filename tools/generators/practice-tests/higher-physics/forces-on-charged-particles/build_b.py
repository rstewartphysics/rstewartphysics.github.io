#!/usr/bin/env python3
"""Forces on Charged Particles — Practice Test B. The physics only.

Same shape as `build.py`: every answer computed from the `@values` block of
`test-b.md`, the page from the shared builder and the Higher profile. The pair
is checked for disjointness by `verify.py`, not by eye.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
sys.path.insert(0, HERE)

import blacklist_check as BL
import fields as F
import pagebuild as P
import profile as PROF

SRC = os.path.join(HERE, "test-b.md")
OUT = (P.REPO + "/classes/higher/"
       "practice-tests/pw6-forces-on-charged-particles-b.html")


def compute(v):
    n = {k: float(x) for k, x in v.items()}
    e, me, ma, mp = n["e_charge"], n["m_electron"], n["m_alpha"], n["m_proton"]
    d = {}
    d["e_charge_disp"] = P.sci(e, 3)
    d["m_electron_disp"] = P.sci(me, 3)
    d["m_alpha_disp"] = P.sci(ma, 4)

    # W3 — p.d. from the work done and the charge
    q3, w3 = n["w3_charge"], n["w3_work"]
    pd3 = w3 / q3
    d["w3_charge"] = P.sci(q3, 2)
    d["w3_work"] = P.sci(w3, 2)
    d["w3_pd"] = P.sci(pd3, 2)
    d["w3_mult"] = P.sci(w3 * q3, 2)
    d["w3_flip"] = P.sci(q3 / w3, 2)
    d["w3_options"] = [P.sci(w3 * q3, 2) + " V", P.sci(q3 / w3, 2) + " V",
                       P.sci(pd3, 2) + " V", P.sci(w3, 2) + " V",
                       P.sci(pd3 / 2.0, 2) + " V"]
    d["w3_key"] = 2

    # C1 — an alpha particle accelerated from rest between two plates
    c1v = n["c1_pd"]
    c1w = 2.0 * e * c1v
    c1speed = (2.0 * c1w / ma) ** 0.5
    d["c1_pd"] = P.fm(c1v, 4)
    d["c1_pd_kv"] = P.fixed(c1v / 1000.0, 2)
    d["c1_work_disp"] = P.sci(c1w, 3)
    d["c1_half_disp"] = P.sci(e * c1v, 3)
    d["c1_speed_disp"] = P.sci(c1speed, 3)

    # C2 — an electron across the gap of a linear accelerator
    c2v = n["c2_pd"]
    c2w = e * c2v
    c2speed = (2.0 * c2w / me) ** 0.5
    d["c2_pd"] = P.fm(c2v, 5)
    d["c2_pd_kv"] = P.fixed(c2v / 1000.0, 1)
    d["c2_work_disp"] = P.sci(c2w, 3)
    d["c2_speed_disp"] = P.sci(c2speed, 3)
    d["c2_wrong_disp"] = P.sci((2.0 * c2w / mp) ** 0.5, 3)

    # P1 — the charge on an ion, from the kinetic energy it gains
    m, u, vf, p1v = n["p1_mass"], n["p1_u"], n["p1_v"], n["p1_pd"]
    ek0, ek1 = 0.5 * m * u * u, 0.5 * m * vf * vf
    gain = ek1 - ek0
    charge = gain / p1v
    d["p1_mass_disp"] = P.sci(m, 3)
    d["p1_u_disp"] = P.sci(u, 2)
    d["p1_v_disp"] = P.sci(vf, 2)
    d["p1_pd"] = P.fm(p1v, 4)
    d["p1_pd_kv"] = P.fixed(p1v / 1000.0, 2)
    d["p1_ek0_disp"] = P.sci(ek0, 2)
    d["p1_ek1_disp"] = P.sci(ek1, 2)
    d["p1_gain_disp"] = P.sci(gain, 2)
    d["p1_charge_disp"] = P.sci(charge, 2)
    d["p1_charge_n"] = P.fm(charge / e, 2)

    d["_quantities"] = ["%g C" % q3, "%g J" % w3,
                        "%g kV" % (c1v / 1000.0),
                        "%g kV" % (c2v / 1000.0),
                        "%g kV" % (p1v / 1000.0),
                        "%g kg" % m, "%g m s⁻¹" % u, "%g m s⁻¹" % vf]
    d["_num"] = {"c1_work": (c1w, "J"), "c1_speed": (c1speed, "m s⁻¹"),
                 "c2_work": (c2w, "J"), "c2_speed": (c2speed, "m s⁻¹"),
                 "p1_gain": (gain, "J"), "p1_charge": (charge, "C")}
    return d


def diagrams(v, d):
    return {
        "w1_plates": F.plates(
            top="X", bottom="Y", field=True, field_dir="down",
            particle=("P", 0, ""), particle_pos=0.5,
            label="Two horizontal parallel plates, the upper labelled X and the "
                  "lower labelled Y, with equally spaced field lines running "
                  "straight down from X to Y. The point P is half-way between "
                  "them."),
        "w2_field": F.particle_in_field(
            into=False, particle="alpha particle", motion="right",
            region_label="region of magnetic field out of page",
            label="An alpha particle travelling to the right enters a square "
                  "region of magnetic field directed out of the page, drawn as "
                  "dots."),
        "c1_plates": F.plates(
            top="+", bottom="−", pd=d["c1_pd_kv"] + " kV", field=True,
            particle=("α", 1, ""), particle_pos=0.12,
            left_label="plate A", right_label="plate B",
            label="Two parallel plates: a positive plate A above and a negative "
                  "plate B below, with the uniform field between them drawn as "
                  "equally spaced lines pointing down from A to B. An alpha "
                  "particle is at rest at plate A."),
        "c2_linac": F.linac(
            r_label="P", s_label="Q", beam="electron beam",
            label="A linear accelerator: four hollow metal drift tubes of "
                  "increasing length in a line, wired alternately to an "
                  "alternating supply. The electron beam travels along the "
                  "axis, crossing the gap P and then the gap Q."),
        "c3_plates": F.plates(
            top="+", bottom="−", field=False,
            label="Two horizontal parallel plates, the upper one positive and "
                  "the lower one negative, with the space between them empty — "
                  "the field lines have not been drawn."),
        "p1_plates": F.plates(
            top="+", bottom="−", pd=d["p1_pd_kv"] + " kV", field=False,
            beam="ion", label="Two horizontal parallel plates, the upper "
                  "positive and the lower negative, with an ion travelling "
                  "from left to right through the gap between them."),
    }


def main():
    meta, values, qs = P.parse(open(SRC, encoding="utf-8").read())
    PROF.apply(meta)
    d = compute(values)
    dia = diagrams(values, d)
    data = P.payload(qs, d)
    html = P.page(meta, qs, d, dia, data)

    if BL.report(d["_quantities"]):
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
    open(os.path.join(HERE, "marking-instructions-b.html"), "w", encoding="utf-8").write(
        P.marking_instructions(meta, qs, d))
    open(os.path.join(HERE, "answers-b.json"), "w", encoding="utf-8").write(
        json.dumps({k: x for k, x in d.items() if not k.startswith("_")},
                   ensure_ascii=False, indent=1))
    print("built %s  (%d questions, %s marks, %d bytes)"
          % (OUT, len(qs), meta["marks"], len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
