#!/usr/bin/env python3
"""Higher Electricity — Practice Test A. The physics only.

Every answer and every distractor is computed here from the `@values` block of
`test-a.md`; nothing numeric is typed into the Markdown or the template, so a
changed supply voltage cannot leave a stale current two parts later (plan §5.7).

The page itself comes from the shared `pagebuild`, driven by the Electricity
profile in `profile.py`.
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
sys.path.insert(0, HERE)

import circuit as C
import blacklist_check
import pagebuild as P
import profile as PROF
import scope as S

BL = blacklist_check.mac_module("higher-physics/electricity/elec_blacklist.py")

SRC = os.path.join(HERE, "test-a.md")
SITE = P.REPO
OUT = os.path.join(SITE, "classes/higher/practice-tests/electricity-a.html")
SQRT2 = math.sqrt(2.0)


def sci_always(x, n):
    """Scientific form even inside the range `P.sci` leaves as a decimal, for a
    distractor that must look like its neighbours: 1·9 × 10³ C, not 1900 C."""
    e = int(math.floor(math.log10(abs(P.round_sig(x, n)))))
    m = P.round_sig(x, n) / (10.0 ** e)
    return "%s × 10%s" % (P.dot(("%." + str(n - 1) + "f") % m),
                          "".join(P.SUP[c] for c in str(e)))


def options(pairs, unit):
    """(value_string, is_key) pairs, already in SQA's ascending order."""
    return [v + " " + unit for v, _ in pairs], [k for _, k in pairs].index(True)


# ------------------------------------------------------------------ physics

def compute(v):
    n = {k: float(x) for k, x in v.items()}
    d = {}
    q = []          # every quantity the paper puts in front of a pupil, SI

    # W1 — peak from r.m.s.
    vr = n["w1_vrms"]
    pk = SQRT2 * vr
    d["w1_vrms"] = P.fm_sf(vr, 3)
    d["w1_peak"] = P.fm_sf(pk, 3)
    d["w1_div"] = P.fm_sf(vr / SQRT2, 3)
    d["w1_double"] = P.fm_sf(2 * vr, 3)
    d["w1_options"], d["w1_key"] = options(
        [(P.fm_sf(vr / 2, 2), False), (d["w1_div"], False), (d["w1_vrms"], False),
         (d["w1_peak"], True), (d["w1_double"], False)], "V")
    q += [(vr, "V")]

    # W2 — frequency from a trace
    tb, per = n["w2_tb_ms"], n["w2_period_div"]
    t_ms = tb * per
    f = 1000.0 / t_ms
    d["w2_tb_ms"] = P.fm_sf(tb, 2)
    d["w2_period_div"] = P.fm(per)
    d["w2_t_ms"] = P.fm_sf(t_ms, 2)
    d["w2_t_s"] = P.fm_sf(t_ms / 1000.0, 2)
    d["w2_f"] = P.fm(f)
    d["w2_half"] = P.fm(2 * f)
    d["w2_ms"] = P.fm_sf(1.0 / t_ms, 2)
    d["w2_options"], d["w2_key"] = options(
        [(d["w2_ms"], False), (P.fm(1000.0 / (10 * tb)), False), (d["w2_f"], True),
         (d["w2_half"], False), (P.fm(1000.0 / tb), False)], "Hz")
    q += [(tb / 1000.0, "s")]

    # W3 — current from power and resistance
    r3, p3 = n["w3_r"], n["w3_p"]
    i3 = math.sqrt(p3 / r3)
    d["w3_r"] = P.fm(r3)
    d["w3_p"] = P.fm_sf(p3, 2)
    d["w3_i"] = P.fm_sf(i3, 2)
    d["w3_nosqrt"] = P.sci(p3 / r3, 2)
    d["w3_v"] = P.fm_sf(math.sqrt(p3 * r3), 2)
    d["w3_options"], d["w3_key"] = options(
        [(d["w3_nosqrt"], False), (d["w3_i"], True), (P.fm_sf(math.sqrt(p3), 2), False),
         (d["w3_v"], False), (P.fm_sf(p3 * r3, 2), False)], "A")
    q += [(r3, "Ω"), (p3, "W")]

    # W4 — voltmeter across the series resistor of a series-parallel divider
    vs, r1, r2 = n["w4_vs"], n["w4_r1_k"], n["w4_r2_k"]
    rp = r2 / 2.0
    v1 = vs * r1 / (r1 + rp)
    d["w4_vs"] = P.fm_sf(vs, 2)
    d["w4_r1_k"] = P.fm_sf(r1, 2)
    d["w4_r2_k"] = P.fm_sf(r2, 2)
    d["w4_rp_k"] = P.fm_sf(rp, 2)
    d["w4_v1"] = P.fm_sf(v1, 2)
    d["w4_vp"] = P.fm_sf(vs - v1, 2)
    d["w4_nopar"] = P.fm_sf(vs * r1 / (r1 + 2 * r2), 2)
    d["w4_options"], d["w4_key"] = options(
        [(d["w4_nopar"], False), (d["w4_vp"], False), (P.fm_sf(vs / 2, 2), False),
         (d["w4_v1"], True), (P.fm_sf(vs * 2 * r2 / (r1 + 2 * r2), 2), False)], "V")
    q += [(vs, "V"), (r1 * 1e3, "Ω"), (r2 * 1e3, "Ω")]

    # W5 — lost volts
    e5, ri5, rl5 = n["w5_emf"], n["w5_r"], n["w5_load"]
    i5 = e5 / (rl5 + ri5)
    d["w5_emf"] = P.fm_sf(e5, 2)
    d["w5_r"] = P.fm_sf(ri5, 2)
    d["w5_load"] = P.fm_sf(rl5, 2)
    d["w5_i"] = P.fm_sf(i5, 2)
    d["w5_lost"] = P.fm_sf(i5 * ri5, 2)
    d["w5_tpd"] = P.fm_sf(i5 * rl5, 2)
    d["w5_noR"] = P.fm_sf(e5 / rl5 * ri5, 2)
    d["w5_options"], d["w5_key"] = options(
        [(d["w5_lost"], True), (d["w5_noR"], False), (P.fm_sf(i5, 2), False),
         (d["w5_tpd"], False), (d["w5_emf"], False)], "V")
    q += [(e5, "V"), (ri5, "Ω"), (rl5, "Ω")]

    # W6 — Q = CV
    c6, v6 = n["w6_c_uf"] * 1e-6, n["w6_v"]
    q6 = c6 * v6
    d["w6_c_uf"] = P.fm(n["w6_c_uf"])
    d["w6_v"] = P.fm(v6)
    d["w6_c_sci"] = P.sci(c6, 2)
    d["w6_q"] = P.sci(q6, 2)
    d["w6_nou"] = sci_always(n["w6_c_uf"] * v6, 2)
    d["w6_half"] = P.sci(q6 / 2, 2)
    d["w6_options"], d["w6_key"] = options(
        [(P.sci(c6 / v6, 2), False), (d["w6_half"], False), (d["w6_q"], True),
         (d["w6_nou"], False), (P.sci(v6 / c6, 2), False)], "C")
    q += [(c6, "F"), (v6, "V")]

    # C1 — oscilloscope: peak, frequency, r.m.s., r.m.s. current
    yg, pdiv, tbm, prd, rl = (n["c1_ygain"], n["c1_peak_div"], n["c1_tb_ms"],
                              n["c1_period_div"], n["c1_load"])
    vpk = yg * pdiv
    t1 = tbm * prd / 1000.0
    f1 = 1.0 / t1
    vrms = vpk / SQRT2
    irms = vrms / rl
    d["c1_ygain_disp"] = P.fm_sf(yg, 2)
    d["c1_tb_disp"] = P.fm_sf(tbm, 1)
    d["c1_peak_div"] = P.fm(pdiv)
    d["c1_period_div"] = P.fm(prd)
    d["c1_load"] = P.fm(rl)
    d["c1_peak_disp"] = P.fm_sf(vpk, 2)
    d["c1_pp_disp"] = P.fm_sf(2 * vpk, 2)
    d["c1_t_ms"] = P.fm_sf(t1 * 1000, 2)
    d["c1_t_s"] = P.sci(t1, 2)
    d["c1_f_disp"] = P.fm(f1)
    d["c1_rms_disp"] = P.fm_sf(vrms, 2)
    d["c1_irms_disp"] = P.fm_sf(irms, 2)
    d["c1_ipk_disp"] = P.fm_sf(vpk / rl, 2)
    q += [(yg, "V"), (tbm / 1000.0, "s"), (rl, "Ω")]

    # C2 — R against 1/I
    e2, r2i = n["c2_emf"], n["c2_r"]
    xs = [0.6, 1.0, 1.4, 1.8]
    d["_c2_pts"] = xs
    d["c2_r_disp"] = P.fm_sf(r2i, 2)
    d["c2_emf_disp"] = P.fm_sf(e2, 2)
    d["c2_x1"], d["c2_x2"] = P.fm_sf(xs[0], 2), P.fm_sf(xs[-1], 2)
    d["c2_y1"] = P.fm_sf(e2 * xs[0] - r2i, 2)
    d["c2_y2"] = P.fm_sf(e2 * xs[-1] - r2i, 3)
    isc = e2 / r2i
    d["c2_isc_disp"] = P.fm_sf(isc, 2)

    # C3 — constant-current charging
    vs3, i3c, c3, t3 = (n["c3_vs"], n["c3_i_ua"] * 1e-6, n["c3_c_uf"] * 1e-6,
                        n["c3_t"])
    r3c = vs3 / i3c
    q3 = i3c * t3
    d["c3_vs_disp"] = P.fm_sf(vs3, 2)
    d["c3_i_ua"] = P.fm(n["c3_i_ua"])
    d["c3_i_sci"] = P.sci(i3c, 2)
    d["c3_c_uf"] = P.fm(n["c3_c_uf"])
    d["c3_t"] = P.fm(t3)
    d["c3_r_disp"] = P.sci(r3c, 2)
    d["c3_q_disp"] = P.sci(q3, 2)
    q += [(vs3, "V"), (i3c, "A"), (c3, "F"), (t3, "s")]

    # P1 — power in the load for two settings
    e1, ri1, ra, rb = n["p1_emf"], n["p1_r"], n["p1_load1"], n["p1_load2"]
    ia = e1 / (ra + ri1)
    ib = e1 / (rb + ri1)
    pa, pb = ia * ia * ra, ib * ib * rb
    d["p1_emf_disp"] = P.fm_sf(e1, 2)
    d["p1_r_disp"] = P.fm_sf(ri1, 2)
    d["p1_load1_disp"] = P.fm_sf(ra, 2)
    d["p1_load2_disp"] = P.fm_sf(rb, 2)
    d["p1_i1_disp"] = P.fm_sf(ia, 2)
    d["p1_p1_disp"] = P.fm_sf(pa, 2)
    d["p1_pr_disp"] = P.fm_sf(ia * ia * ri1, 2)
    d["p1_i2_disp"] = P.fm_sf(ib, 3)
    d["p1_p2_disp"] = P.fm_sf(pb, 3)
    assert pb > pa
    q += [(e1, "V"), (ri1, "Ω"), (ra, "Ω"), (rb, "Ω")]

    # P2 — energy stored, capacitance in mF
    c2c, v2 = n["p2_c_mf"] * 1e-3, n["p2_v"]
    ep = 0.5 * c2c * v2 * v2
    d["p2_c_mf"] = P.fm(n["p2_c_mf"])
    d["p2_c_sci"] = P.fm_sf(c2c, 3)
    d["p2_v_disp"] = P.fm_sf(v2, 2)
    d["p2_e_disp"] = P.fm_sf(ep, 2)
    d["p2_nomf_disp"] = P.sci(0.5 * n["p2_c_mf"] * v2 * v2, 2)
    q += [(c2c, "F"), (v2, "V")]

    d["_si"] = q
    d["_num"] = {"c1_peak": (vpk, "V"), "c1_f": (f1, "Hz"), "c1_rms": (vrms, "V"),
                 "c1_irms": (irms, "A"), "c2_r": (r2i, "Ω"), "c2_emf": (e2, "V"),
                 "c2_isc": (isc, "A"), "c3_r": (r3c, "Ω"), "c3_q": (q3, "C"),
                 "p1_i1": (ia, "A"), "p1_p1": (pa, "W"), "p2_e": (ep, "J")}
    return d


# ----------------------------------------------------------------- diagrams

def diagrams(v, d):
    n = {k: float(x) for k, x in v.items()}
    xs = d["_c2_pts"]
    e2, r2 = n["c2_emf"], n["c2_r"]
    return {
        "w2_trace": S.scope_trace(
            n["w2_period_div"], 3,
            "An oscilloscope screen with a grid of 10 divisions across and 8 up. "
            "A sine wave trace completes one wave every %s divisions."
            % d["w2_period_div"]),
        "w4_circuit": C.schematic(
            top=[C.Battery("%s V" % d["w4_vs"])],
            bottom=[C.R("%s kΩ" % d["w4_r1_k"], across=C.V()),
                    C.Par([[C.R("%s kΩ" % d["w4_r2_k"])], [C.R("%s kΩ" % d["w4_r2_k"])]])],
            label="A %s volt battery in series with a %s kilohm resistor and a pair of "
                  "%s kilohm resistors connected in parallel. A voltmeter is connected "
                  "across the %s kilohm resistor."
                  % (d["w4_vs"], d["w4_r1_k"], d["w4_r2_k"], d["w4_r1_k"])),
        "w5_circuit": C.schematic(
            top=[C.Source("E", "r")],
            bottom=[C.R("%s Ω" % d["w5_load"])], min_side=150,
            label="A battery, drawn as a cell E and its internal resistance r inside a "
                  "dashed box, connected to a single resistor."),
        "c1_trace": S.scope_trace(
            n["c1_period_div"], n["c1_peak_div"],
            "An oscilloscope screen with a grid of 10 divisions across and 8 up. "
            "A sine wave trace rises %s divisions above the centre line and completes "
            "one wave every %s divisions." % (d["c1_peak_div"], d["c1_period_div"])),
        "c2_circuit": C.schematic(
            top=[C.Source("E", "r")],
            bottom=[C.Switch("S"), C.VR("R"), C.A()],
            label="A battery of e.m.f. E and internal resistance r, drawn inside a "
                  "dashed box, in series with a switch S, a variable resistor R and an "
                  "ammeter."),
        "c2_graph": S.straight_line(
            xs, e2, -r2, "1/I (A⁻¹)", "R (Ω)", (0, 2.05), (-5, 14),
            [0, 0.4, 0.8, 1.2, 1.6, 2.0], [-4, -2, 0, 2, 4, 6, 8, 10, 12, 14],
            "A straight-line graph of R in ohms against 1 over I in inverse amperes. "
            "Four plotted points lie on the line, and the line is drawn back to meet "
            "the R axis below zero.", x_from=0.0),
        "c3_circuit": C.schematic(
            top=[C.Battery("%s V" % d["c3_vs_disp"]), C.Switch("S")],
            bottom=[C.A(), C.VR("R"), C.Capacitor("%s μF" % d["c3_c_uf"])],
            label="A %s volt battery and switch S in series with an ammeter, a variable "
                  "resistor R and a %s microfarad capacitor."
                  % (d["c3_vs_disp"], d["c3_c_uf"])),
        "p1_circuit": C.schematic(
            top=[C.Source("E", "r")],
            bottom=[C.VR("R")],
            label="A battery of e.m.f. E and internal resistance r, drawn inside a "
                  "dashed box, connected to a variable resistor R."),
    }


def natural_size(svg):
    """Give every drawing a width from its own viewBox rather than one CSS width
    for all: a wide circuit squeezed into the same box as a narrow one comes out
    with text too small to read. matplotlib's viewBox is in points, so graphs
    are scaled up to match the circuits' 13 px labels."""
    import re

    def one(m):
        tag = m.group(0)
        vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', tag)
        if not vb or "style=" in tag:
            return tag
        w = float(vb.group(1)) * (1.2 if 'class="ckt" viewBox' in tag else 1.4)
        # the width="100%" attribute goes: Chrome sizes the box height from it
        # rather than from the CSS width, leaving empty space under the drawing
        tag = re.sub(r'\swidth="100%"', "", tag)
        return tag.replace("<svg ", '<svg style="width:min(100%%, %dpx);height:auto" ' % w, 1)
    return re.sub(r"<svg [^>]*>", one, svg)


def main(src=SRC, out=OUT, suffix=""):
    meta, values, qs = P.parse(open(src, encoding="utf-8").read())
    PROF.apply(meta)
    d = compute(values)
    dia = {k: natural_size(x) for k, x in diagrams(values, d).items()}
    data = P.payload(qs, d)
    html = P.page(meta, qs, d, dia, data)

    if BL.report(d["_si"]):
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

    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(html)
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
