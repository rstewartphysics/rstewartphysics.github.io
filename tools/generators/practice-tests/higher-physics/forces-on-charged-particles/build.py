#!/usr/bin/env python3
"""Forces on Charged Particles — Practice Test A. The physics only.

Every answer is computed here from the `@values` block of `test-a.md`; nothing
numeric is typed into the Markdown or the template, so a changed accelerating
voltage cannot leave a stale speed two parts later (plan §5.7).

The page itself comes from the shared `pagebuild`, driven by the Higher profile
in `profile.py` — the same builder the N5 tests use, so a layout fix reaches
every test at once.
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

SRC = os.path.join(HERE, "test-a.md")
OUT = (P.REPO + "/classes/higher/"
       "practice-tests/pw6-forces-on-charged-particles-a.html")


# ------------------------------------------------------------------ physics

def compute(v):
    n = {k: float(x) for k, x in v.items()}
    e, mp = n["e_charge"], n["m_proton"]
    d = {}

    # data-sheet constants, as they are printed
    d["e_charge_disp"] = P.sci(e, 3)
    d["m_proton_disp"] = P.sci(mp, 4)
    d["m_electron_disp"] = P.sci(n["m_electron"], 3)

    # W3 — work done moving a charge through a p.d.
    q3, v3 = n["w3_charge"], n["w3_pd"]
    w3 = q3 * v3
    d["w3_charge"] = P.sci(q3, 2)
    d["w3_pd"] = P.fm(v3)
    d["w3_work"] = P.sci(w3, 2)
    d["w3_div"] = P.sci(q3 / v3, 2)
    d["w3_options"] = [P.sci(q3 / v3, 2) + " J", P.sci(w3, 2) + " J",
                       P.sci(v3 / q3, 2) + " J", P.sci(q3, 2) + " J",
                       P.fm(v3) + " J"]
    d["w3_key"] = 1

    # C1 — work done on an electron in an X-ray tube
    c1v = n["c1_pd"]
    c1w = e * c1v
    d["c1_pd"] = P.fm(c1v, 4)
    d["c1_pd_kv"] = P.fm(c1v / 1000.0)
    d["c1_work_disp"] = P.sci(c1w, 2)

    # C2 — a proton accelerated across the gap of a cyclotron
    c2v = n["c2_pd"]
    c2w = e * c2v
    c2speed = (2.0 * c2w / mp) ** 0.5
    d["c2_pd"] = P.fm(c2v, 5)
    d["c2_pd_kv"] = P.fixed(c2v / 1000.0, 1)
    d["c2_work_disp"] = P.sci(c2w, 3)
    d["c2_speed_disp"] = P.sci(c2speed, 3)
    d["c2_vsq_disp"] = P.sci(2.0 * c2w / mp, 3)

    # P1 — a proton already moving, accelerated across one gap of a linac
    p1v, u = n["p1_pd"], n["p1_speed"]
    p1w = e * p1v
    ek0 = 0.5 * mp * u * u
    ek1 = ek0 + p1w
    p1speed = (2.0 * ek1 / mp) ** 0.5
    d["p1_pd"] = P.fm(p1v, 4)
    d["p1_pd_kv"] = P.fm(p1v / 1000.0)
    d["p1_speed_disp"] = P.sci(u, 2)
    d["p1_work_disp"] = P.sci(p1w, 2)
    d["p1_ek0_disp"] = P.sci(ek0, 2)
    d["p1_ek1_disp"] = P.sci(ek1, 2)
    d["p1_speed_final_disp"] = P.sci(p1speed, 2)
    # the error the question is set to catch: the work done taken on its own
    d["p1_wrong_disp"] = P.sci((2.0 * p1w / mp) ** 0.5, 2)

    # every quantity the paper puts in front of a pupil, in the blacklist's
    # own "<value> <unit>" form, so the check below is mechanical
    d["_quantities"] = ["%g C" % q3, "%g V" % v3,
                        "%g kV" % (c1v / 1000.0),
                        "%g kV" % (c2v / 1000.0),
                        "%g kV" % (p1v / 1000.0),
                        "%g m s⁻¹" % u]
    d["_num"] = {"c1_work": (c1w, "J"),
                 "c2_work": (c2w, "J"),
                 "c2_speed": (c2speed, "m s⁻¹"),
                 "p1_work": (p1w, "J"),
                 "p1_speed_final": (p1speed, "m s⁻¹")}
    return d


# ----------------------------------------------------------------- diagrams

def diagrams(v, d):
    return {
        "w1_charges": F.charge_row(
            [-1, 1, 1], ["Q", "R", "S"],
            "Three point charges. The field lines around Q point inwards "
            "towards it; those around R and S point outwards away from them."),
        "w2_field": F.particle_in_field(
            into=True, particle="electron", motion="down",
            region_label="region of magnetic field into page",
            label="An electron travelling down the page enters a square region "
                  "of magnetic field directed into the page, drawn as crosses."),
        "c1_plates": F.plates(
            top="−", bottom="+", pd=d["c1_pd_kv"] + " kV", field=True,
            particle=("e⁻", -1, ""), particle_pos=0.16,
            left_label="cathode", right_label="anode",
            label="Two parallel plates: a negative cathode above and a positive "
                  "anode below, with the uniform electric field between them "
                  "drawn as equally spaced lines pointing from the anode up to "
                  "the cathode. An electron is at rest at the cathode."),
        "c2_cyclotron": F.cyclotron(
            pd_label=d["c2_pd_kv"] + " kV",
            label="A cyclotron seen from above: two hollow D-shaped electrodes "
                  "separated by a narrow gap, connected to an alternating "
                  "supply. A proton crosses the gap from R to S."),
        "c3_beam": F.curved_beam(
            into=True, curve="down", beam="beam of electrons",
            label="A beam of electrons enters a square region of uniform "
                  "magnetic field from the left and follows a path that curves "
                  "downwards as it crosses the region."),
        "p1_linac": F.linac(
            label="A linear accelerator: four hollow metal drift tubes of "
                  "increasing length in a line, wired alternately to an "
                  "alternating supply. The proton beam travels along the axis, "
                  "crossing the gap R and then the gap S."),
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
    open(os.path.join(HERE, "provenance.csv"), "w", encoding="utf-8").write(
        P.provenance(qs, d))
    open(os.path.join(HERE, "marking-instructions.html"), "w", encoding="utf-8").write(
        P.marking_instructions(meta, qs, d))
    open(os.path.join(HERE, "answers.json"), "w", encoding="utf-8").write(
        json.dumps({k: x for k, x in d.items() if not k.startswith("_")},
                   ensure_ascii=False, indent=1))
    print("built %s  (%d questions, %s marks, %d bytes)"
          % (OUT, len(qs), meta["marks"], len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
