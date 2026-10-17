#!/usr/bin/env python3
"""Simple Harmonic Motion — Practice Test A. The physics only.

Every answer is computed here from the `@values` block of `test-a.md`; nothing
numeric is typed into the Markdown or the template, so a changed amplitude
cannot leave a stale speed two parts later (plan §5.7).

The page itself comes from the shared `pagebuild`, driven by the Advanced
Higher profile in `profile.py` — the same builder the N5 and Higher tests use,
so a layout fix reaches every test at once.
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

SRC = os.path.join(HERE, "test-a.md")
OUT = (P.REPO + "/classes/adv/"
       "practice-tests/shm-simple-harmonic-motion-a.html")

TWO_PI = 2.0 * math.pi


# ------------------------------------------------------------------ physics

def compute(v):
    n = {k: float(x) for k, x in v.items()}
    d = {}

    # W2 — angular frequency from the period
    t2 = n["w2_period"]
    w2 = TWO_PI / t2
    d["w2_period"] = P.fm(t2)
    d["w2_freq"] = P.fm_sf(1.0 / t2, 2)
    d["w2_omega"] = P.fm_sf(w2, 2)
    d["w2_half"] = P.fm_sf(math.pi / t2, 2)            # the halving slip
    d["w2_inv"] = P.fm_sf(TWO_PI * t2, 2)              # multiplying by T
    d["w2_options"] = [P.fm_sf(t2 / TWO_PI, 2) + " rad s⁻¹",
                       P.fm_sf(TWO_PI * t2, 2) + " rad s⁻¹",
                       P.fm_sf(1.0 / t2, 2) + " rad s⁻¹",
                       P.fm_sf(math.pi / t2, 2) + " rad s⁻¹",
                       P.fm_sf(w2, 2) + " rad s⁻¹"]
    d["w2_key"] = 4

    # C1 — the hanging basket: ω from a count of oscillations, then v(max)
    osc, t1, amp = n["c1_osc"], n["c1_time"], n["c1_amp"]
    f1 = osc / t1
    w1 = TWO_PI * f1
    vmax = w1 * amp
    d["c1_mass"] = P.fm(n["c1_mass"])
    d["c1_osc"] = "%d" % int(osc)
    d["c1_time"] = P.fixed(t1, 1)
    d["c1_amp"] = P.fm(amp)
    d["c1_freq"] = P.fm_sf(f1, 3)
    d["c1_period"] = P.fm_sf(t1 / osc, 3)
    d["c1_omega_disp"] = P.fm_sf(w1, 3)
    d["c1_vmax_disp"] = P.fm_sf(vmax, 2)

    # C2 — the tuned mass damper model: maximum potential energy
    m2, w2b, a2 = n["c2_mass"], n["c2_omega"], n["c2_amp"]
    ep = 0.5 * m2 * w2b * w2b * a2 * a2
    d["c2_mass"] = P.fm(m2)
    d["c2_omega"] = P.fm(w2b)
    d["c2_amp"] = P.fm(a2)
    d["c2_ep_disp"] = P.fm_sf(ep, 2)

    # P2 — the footbridge deck: speed at a stated displacement
    ap, wp, yp = n["p2_amp"], n["p2_omega"], n["p2_disp"]
    vp = wp * math.sqrt(ap * ap - yp * yp)
    d["p2_amp"] = P.fm(ap)
    d["p2_omega"] = P.fm(wp)
    d["p2_disp"] = P.fm(yp)
    d["p2_speed_disp"] = P.fm_sf(vp, 2)

    d["g"] = P.fm(n["g"])

    # every quantity the paper puts in front of a pupil, in the blacklist's own
    # "<value> <unit>" form, so the check below is mechanical
    d["_quantities"] = ["%g s" % t2, "%g kg" % n["c1_mass"], "%g s" % t1,
                        "%g m" % amp, "%g kg" % m2, "%g rad s⁻¹" % w2b,
                        "%g m" % a2, "%g m" % ap, "%g rad s⁻¹" % wp,
                        "%g m" % yp]
    d["_num"] = {"c1_omega": (w1, "rad s⁻¹"),
                 "c1_vmax": (vmax, "m s⁻¹"),
                 "c2_ep": (ep, "J"),
                 "p2_speed": (vp, "m s⁻¹")}
    return d


# ----------------------------------------------------------------- diagrams

def diagrams(v, d):
    return {
        "w3_damping": O.graph_options(
            ["under", "over", "critical", "undamped"],
            "Four sketch graphs of displacement against time, labelled A to D. "
            "A oscillates about zero with an amplitude that decreases each "
            "swing. B falls slowly to zero without crossing the axis. C falls "
            "to zero without crossing the axis, and reaches it much sooner "
            "than B. D oscillates about zero with an amplitude that never "
            "decreases."),
        "c1_basket": O.mass_spring(
            mass_label=d["c1_mass"] + " kg",
            displacement=d["c1_amp"] + " m",
            label="A hanging basket of mass %s kg suspended from a spring on a "
                  "bracket. A dashed line marks its equilibrium position, and "
                  "the basket is drawn %s m below that line, where it is "
                  "released. An arrow shows that it then oscillates vertically."
                  % (d["c1_mass"], d["c1_amp"])),
        "c2_trace": O.damping_trace(
            "under",
            "A graph of displacement against time for the model. It "
            "oscillates about zero, and the amplitude of each swing is smaller "
            "than the one before it."),
        "p2_bridge": O.beam_on_supports(
            label="A footbridge deck resting on a support at each end, sagging "
                  "slightly in the middle, with an arrow at the middle of the "
                  "deck showing that it oscillates up and down."),
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
