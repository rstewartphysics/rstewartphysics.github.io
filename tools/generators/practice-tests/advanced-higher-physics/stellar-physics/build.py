#!/usr/bin/env python3
"""Stellar Physics — Practice Test A or B. The physics only.

    python3 build.py a      # or b

Every answer is computed here from the `@values` block of `test-a.md` /
`test-b.md`; nothing numeric is typed into the Markdown, so a changed radius
cannot leave a stale temperature one part later.

The page comes from the shared `pagebuild` with this pack's `profile.py`.
It is written into the site worktree named by PT_REPO (default: the
`ah-stellar-practice-tests` worktree), never the shared checkout.
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
sys.path.insert(0, HERE)

import blacklist_check as BL
import hr_diagram as HR
import pagebuild as P
import profile as PROF

REPO = P.REPO

SIGMA = 5.67e-8
LY = 3.00e8 * 365.25 * 24 * 60 * 60


def temp(x):
    """Temperatures as the papers print them: 5340, 16 500."""
    s = "%d" % round(x)
    return s if len(s) < 5 else s[:-3] + " " + s[-3:]


# ------------------------------------------------------------------ physics

def compute_a(n):
    d = {}
    # C1 — Antares: L from b and d, then T from L and r
    L1 = n["c1_b"] * 4 * math.pi * n["c1_d"] ** 2
    T1 = (L1 / (4 * math.pi * n["c1_r"] ** 2 * SIGMA)) ** 0.25
    # C2 — Tau Ceti: L from r and T, then b over a distance in light-years
    L2 = 4 * math.pi * n["c2_r"] ** 2 * SIGMA * n["c2_t"] ** 4
    d2 = n["c2_ly"] * LY
    b2 = L2 / (4 * math.pi * d2 ** 2)
    d.update({
        "c1_d_disp": P.sci(n["c1_d"], 2), "c1_b_disp": P.sci(n["c1_b"], 2),
        "c1_r_disp": P.sci(n["c1_r"], 2),
        "c1_lum_disp": P.sci(L1, 2), "c1_temp_disp": P.sci(T1, 2),
        "c2_t": temp(n["c2_t"]), "c2_r_disp": P.sci(n["c2_r"], 3),
        "c2_ly": P.fm(n["c2_ly"]), "c2_d_disp": P.sci(d2, 3),
        "c2_lum_disp": P.sci(L2, 3), "c2_b_disp": P.sci(b2, 3),
        "p1_t": temp(n["p1_t"]),
        "p2_thot_disp": P.sci(n["p2_thot"], 2).replace("8500", "8.5 × 10³"),
        "p2_tcool_disp": P.sci(n["p2_tcool"], 2).replace("3800", "3.8 × 10³"),
        "p3_sun": temp(n["p3_sun"]), "p3_vega": temp(n["p3_vega"]),
        "p3_wd_disp": temp(n["p3_wd"]),
    })
    # the four panels, in an order that is not the published one
    panels = [("the Sun", n["p3_sun"]), ("40 Eridani B", n["p3_wd"]),
              ("Mu Cephei", n["p2_tcool"]), ("Vega", n["p3_vega"])]
    d["_panels"] = panels
    d["p3_key"] = "; ".join("%s — spectrum <strong>%s</strong>" % (s, "ABCD"[i])
                            for i, (s, _) in sorted(enumerate(panels),
                                                    key=lambda p: p[1][1]))
    # given-value keys the sig-fig rule reads
    for k in ("c1_d", "c1_b", "c1_r"):
        d[k] = d[k + "_disp"]
    d["c2_r"] = d["c2_r_disp"]
    d["_quantities"] = ["%g m" % n["c1_d"], "%g W m⁻²" % n["c1_b"], "%g m" % n["c1_r"],
                        "%g K" % n["c2_t"], "%g m" % n["c2_r"], "%g ly" % n["c2_ly"],
                        "%g K" % n["p2_thot"], "%g K" % n["p2_tcool"],
                        "%g K" % n["p3_vega"], "%g K" % n["p3_wd"]]
    d["_num"] = {"c1_L": (L1, "W"), "c1_T": (T1, "K"),
                 "c2_L": (L2, "W"), "c2_b": (b2, "W m⁻²")}
    return d


def compute_b(n):
    d = {}
    # C1 — Barnard's Star: P/A from T, then r from L and P/A
    pa = SIGMA * n["c1_t"] ** 4
    r1 = math.sqrt(n["c1_L"] / (4 * math.pi * pa))
    # C2 — Aldebaran: T from d (ly), r and b
    d2 = n["c2_ly"] * LY
    L2 = n["c2_b"] * 4 * math.pi * d2 ** 2
    T2 = (L2 / (4 * math.pi * n["c2_r"] ** 2 * SIGMA)) ** 0.25
    # C3 — Canopus: SHOW that L = …
    L3 = n["c3_b"] * 4 * math.pi * n["c3_d"] ** 2
    d.update({
        "c1_t": temp(n["c1_t"]), "c1_lum_disp": P.sci(n["c1_L"], 3),
        "c1_pa_disp": P.sci(pa, 3), "c1_r_out": P.sci(r1, 3),
        "c2_ly": P.fm(n["c2_ly"]), "c2_r_disp": P.sci(n["c2_r"], 2),
        "c2_b_disp": P.sci(n["c2_b"], 2), "c2_d_disp": P.sci(d2, 3),
        "c2_temp_disp": P.sci(T2, 2),
        "c3_d_disp": P.sci(n["c3_d"], 2), "c3_b_disp": P.sci(n["c3_b"], 2),
        "c3_lum_disp": P.sci(L3, 2),
    })
    d["c1_L"] = d["c1_lum_disp"]
    d["c2_r"], d["c2_b"] = d["c2_r_disp"], d["c2_b_disp"]
    d["_quantities"] = ["%g K" % n["c1_t"], "%g W" % n["c1_L"], "%g ly" % n["c2_ly"],
                        "%g m" % n["c2_r"], "%g W m⁻²" % n["c2_b"],
                        "%g m" % n["c3_d"], "%g W m⁻²" % n["c3_b"], "%g W" % L3]
    # C3's luminosity is printed in the question (a SHOW), so it is not an
    # auto-marked answer and must stay out of the answer set
    d["_num"] = {"c1_pa": (pa, "W m⁻²"), "c1_r": (r1, "m"), "c2_T": (T2, "K")}
    return d


# ----------------------------------------------------------------- diagrams

def diagrams_a(n, d):
    return {
        "w2_hr": HR.hr_diagram(
            points=[(25000, 2e4, "A"), (12000, 4e-3, "B"), (4200, 250, "C"),
                    (6000, 1.5, "D")],
            label="An H-R diagram of luminosity in solar units against surface "
                  "temperature, hot on the left. The main sequence runs from top "
                  "left to bottom right. Star A is on the main sequence near the "
                  "top left. Star B is hot and very faint, at the bottom left. "
                  "Star C is cool and very luminous, above and to the right of "
                  "the main sequence. Star D is on the main sequence near the Sun."),
        "p1_hr": HR.hr_diagram(
            points=[(n["p1_t"], HR.luminosity(n["p1_t"], n["p1_rsol"]), "X")],
            label="An H-R diagram with dashed lines of constant radius from "
                  "10⁻³ to 10³ solar radii. Star X is at a surface temperature of "
                  "about %s K and a luminosity of about 6 × 10⁻³ solar units, in "
                  "the bottom-left region, on the 10⁻² solar radii line." % d["p1_t"]),
        "p3_spectra": HR.spectra(
            [("spectrum " + "ABCD"[i], T) for i, (_, T) in enumerate(d["_panels"])],
            label="Four graphs of intensity against wavelength from 0 to 1200 nm, "
                  "each a black-body curve. Spectrum A peaks at about 500 nm. "
                  "Spectrum B peaks at about 180 nm. Spectrum C peaks at about "
                  "760 nm. Spectrum D peaks at about 300 nm."),
    }


def diagrams_b(n, d):
    return {
        "w1_hr": HR.hr_diagram(
            region_labels={"main sequence": "P", "giants": "Q",
                           "supergiants": "R", "white dwarfs": "S"},
            label="An H-R diagram with four regions labelled. P is beside the "
                  "main-sequence line that runs from top left to bottom right. "
                  "Q is above the main sequence on the cool, right-hand side. R "
                  "is at the very top. S is at the bottom left, hot but faint."),
    }


def main():
    which = (sys.argv[1:] or ["a"])[0].lower()
    src = os.path.join(HERE, "test-%s.md" % which)
    meta, values, qs = P.parse(open(src, encoding="utf-8").read())
    PROF.apply(meta, "build.py %s" % which)
    n = {k: float(x) for k, x in values.items()}
    d = (compute_a if which == "a" else compute_b)(n)
    dia = (diagrams_a if which == "a" else diagrams_b)(n, d)
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

    out = os.path.join(REPO, "classes/adv/practice-tests/%s.html" % meta["slug"])
    open(out, "w", encoding="utf-8").write(html)
    suffix = "" if which == "a" else "-b"
    open(os.path.join(HERE, "provenance%s.csv" % suffix), "w", encoding="utf-8").write(
        P.provenance(qs, d))
    open(os.path.join(HERE, "marking-instructions%s.html" % suffix), "w",
         encoding="utf-8").write(P.marking_instructions(meta, qs, d))
    open(os.path.join(HERE, "answers%s.json" % suffix), "w", encoding="utf-8").write(
        json.dumps({k: x for k, x in d.items() if not k.startswith("_")},
                   ensure_ascii=False, indent=1))
    print("built %s  (%d questions, %s marks, %d bytes)"
          % (out, len(qs), meta["marks"], len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
