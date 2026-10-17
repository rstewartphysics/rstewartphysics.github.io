#!/usr/bin/env python3
"""Higher Electricity — Practice Test B. The physics only.

Same builder, profile and checks as Test A (`build.py`); only the physics and
the diagrams differ. Every answer is computed from `test-b.md`'s `@values`.
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build as A
from build import C, P, S, SQRT2, options, sci_always

SRC = os.path.join(HERE, "test-b.md")
OUT = os.path.join(A.SITE, "classes/higher/practice-tests/electricity-b.html")


def compute(v):
    n = {k: float(x) for k, x in v.items()}
    d = {}
    q = []

    # W1 — peak power from r.m.s.
    vr, rl = n["w1_vrms"], n["w1_load"]
    vpk = SQRT2 * vr
    mean = vr * vr / rl
    d["w1_vrms"] = P.fm_sf(vr, 2)
    d["w1_load"] = P.fm(rl)
    d["w1_vpk"] = P.fm_sf(vpk, 3)
    d["w1_ppk"] = P.fm_sf(2 * mean, 2)
    d["w1_mean"] = P.fm_sf(mean, 2)
    d["w1_root"] = P.fm_sf(SQRT2 * mean, 2)
    d["w1_options"], d["w1_key"] = options(
        [(P.fm_sf(vr / rl, 2), False), (d["w1_mean"], False), (d["w1_root"], False),
         (d["w1_ppk"], True), (P.fm_sf(4 * mean, 2), False)], "W")
    q += [(vr, "V"), (rl, "Ω")]

    # W2 — r.m.s. from a trace
    yg, pd = n["w2_ygain"], n["w2_peak_div"]
    pk = yg * pd
    d["w2_ygain"] = P.fm_sf(yg, 2)
    d["w2_peak_div"] = P.fm(pd)
    d["w2_vpk"] = P.fm_sf(pk, 2)
    d["w2_vrms"] = P.fm_sf(pk / SQRT2, 2)
    d["w2_pp"] = P.fm_sf(2 * pk, 2)
    d["w2_up"] = P.fm_sf(pk * SQRT2, 2)
    d["w2_options"], d["w2_key"] = options(
        [(P.fm_sf(pk / 2, 2), False), (d["w2_vrms"], True), (d["w2_vpk"], False),
         (d["w2_up"], False), (d["w2_pp"], False)], "V")
    q += [(yg, "V")]

    # W3 — series resistor and a switched parallel pair
    vs, r = n["w3_vs"], n["w3_r"]
    i_open = vs / (2 * r)
    i_closed = vs / (1.5 * r)
    d["w3_vs"] = P.fm_sf(vs, 2)
    d["w3_r"] = P.fm(r)
    d["w3_rt_open"] = P.fm(2 * r)
    d["w3_rp"] = P.fm(r / 2)
    d["w3_rt_closed"] = P.fm(1.5 * r)
    d["w3_i_open"] = P.fm_sf(i_open, 2)
    d["w3_v_open"] = P.fm_sf(i_open * r, 2)
    d["w3_i_closed"] = P.fm_sf(i_closed, 2)
    d["w3_v_closed"] = P.fm_sf(i_closed * r, 2)
    d["w3_wrong_i"] = P.fm_sf(vs / r, 2)
    assert i_closed * r > i_open * r
    q += [(vs, "V"), (r, "Ω")]

    # W5 — which row: e.m.f. and terminal p.d.
    ri, rl5, i5 = n["w5_r"], n["w5_load"], n["w5_i"]
    emf = i5 * (rl5 + ri)
    tpd, lost = i5 * rl5, i5 * ri
    d["w5_r"] = P.fm_sf(ri, 2)
    d["w5_load"] = P.fm_sf(rl5, 2)
    d["w5_i"] = P.fm_sf(i5, 2)
    d["w5_emf"] = P.fm_sf(emf, 2)
    d["w5_tpd"] = P.fm_sf(tpd, 2)
    d["w5_lost"] = P.fm_sf(lost, 2)
    row = lambda e, v: "e.m.f. %s&nbsp;V · voltmeter %s&nbsp;V" % (e, v)
    d["w5_options"] = [row(d["w5_lost"], d["w5_tpd"]), row(d["w5_tpd"], d["w5_lost"]),
                       row(d["w5_tpd"], d["w5_emf"]), row(d["w5_emf"], d["w5_lost"]),
                       row(d["w5_emf"], d["w5_tpd"])]
    d["w5_key"] = 4
    q += [(ri, "Ω"), (rl5, "Ω"), (i5, "A")]

    # W6 — energy stored
    c6, v6 = n["w6_c_uf"] * 1e-6, n["w6_v"]
    e6 = 0.5 * c6 * v6 * v6
    d["w6_c_uf"] = P.fm(n["w6_c_uf"])
    d["w6_v"] = P.fm_sf(v6, 2)
    d["w6_c_sci"] = P.sci(c6, 2)
    d["w6_e"] = P.sci(e6, 2)
    d["w6_nohalf"] = sci_always(2 * e6, 2)
    d["w6_nosq"] = P.sci(0.5 * c6 * v6, 2)
    d["w6_nou"] = sci_always(0.5 * n["w6_c_uf"] * v6 * v6, 2)
    d["w6_options"], d["w6_key"] = options(
        [(d["w6_nosq"], False), (P.sci(c6 * v6, 2), False), (d["w6_e"], True),
         (sci_always(2 * e6, 2), False), (d["w6_nou"], False)], "J")
    q += [(c6, "F"), (v6, "V")]

    # W7 — charge part-way through charging
    vs7, c7, vc = n["w7_vs"], n["w7_c_uf"] * 1e-6, n["w7_vc"]
    d["w7_vs"] = P.fm_sf(vs7, 3)
    d["w7_c_uf"] = P.fm(n["w7_c_uf"])
    d["w7_c_sci"] = P.sci(c7, 2)
    d["w7_vc"] = P.fm_sf(vc, 2)
    d["w7_q"] = P.sci(c7 * vc, 2)
    d["w7_full"] = P.sci(c7 * vs7, 2)
    d["w7_vr_v"] = P.fm_sf(vs7 - vc, 2)
    d["w7_vr"] = P.sci(c7 * (vs7 - vc), 2)
    d["w7_options"], d["w7_key"] = options(
        [(P.sci(c7 / vc, 2), False), (d["w7_q"], True), (d["w7_vr"], False),
         (d["w7_full"], False), (sci_always(vc / c7, 2), False)], "C")
    q += [(vs7, "V"), (c7, "F"), (vc, "V")]

    # C1 — two meter readings
    vo, vcl, i1 = n["c1_open"], n["c1_closed"], n["c1_i"]
    r1 = (vo - vcl) / i1
    d["c1_open"] = P.fm_sf(vo, 2)
    d["c1_closed"] = P.fm_sf(vcl, 2)
    d["c1_i"] = P.fm_sf(i1, 2)
    d["c1_r_disp"] = P.fm_sf(r1, 2)
    q += [(vo, "V"), (vcl, "V"), (i1, "A")]

    # C2 — C = Q/V and t = 5RC
    v2, q2, r2 = n["c2_v"], n["c2_q_mc"] * 1e-3, n["c2_r_k"] * 1e3
    c2 = q2 / v2
    t2 = 5 * r2 * c2
    d["c2_v"] = P.fm_sf(v2, 2)
    d["c2_q_mc"] = P.fm_sf(n["c2_q_mc"], 3)
    d["c2_q_sci"] = P.sci(q2, 3)
    d["c2_c_disp"] = P.sci(c2, 2)
    d["c2_r_k"] = P.fm(n["c2_r_k"])
    d["c2_r_sci"] = P.sci(r2, 2)
    d["c2_t_disp"] = P.fm_sf(t2, 2)
    q += [(v2, "V"), (q2, "C"), (r2, "Ω")]

    # C3 — series a.c. circuit
    vp3, ra, rb = n["c3_vpk"], n["c3_r1"], n["c3_r2"]
    vrms = vp3 / SQRT2
    rt = ra + rb
    irms = vrms / rt
    p3 = irms * irms * rb
    d["c3_vpk"] = P.fm_sf(vp3, 3)
    d["c3_r1"] = P.fm(ra)
    d["c3_r2"] = P.fm(rb)
    d["c3_rt"] = P.fm(rt)
    d["c3_vrms_disp"] = P.fm_sf(vrms, 2)
    d["c3_irms_disp"] = P.fm_sf(irms, 2)
    d["c3_ipk_disp"] = P.fm_sf(vp3 / rt, 2)
    d["c3_p_disp"] = P.fm_sf(p3, 2)
    q += [(vp3, "V"), (ra, "Ω"), (rb, "Ω")]

    # P1 — drill battery
    e1, ri1, rm = n["p1_emf"], n["p1_r"], n["p1_motor"]
    ip = e1 / (rm + ri1)
    pw = ip * ip * ri1
    d["p1_emf"] = P.fm_sf(e1, 3)
    d["p1_r"] = P.fm_sf(ri1, 2)
    d["p1_motor"] = P.fm_sf(rm, 2)
    d["p1_i_disp"] = P.fm_sf(ip, 2)
    d["p1_p_disp"] = P.fm_sf(pw, 2)
    d["p1_pm_disp"] = P.fm_sf(ip * ip * rm, 2)
    q += [(e1, "V"), (ri1, "Ω"), (rm, "Ω")]

    # P2 — initial charging current through two resistors
    c5, rr, vs5 = n["p2_c_uf"] * 1e-6, n["p2_r_k"] * 1e3, n["p2_vs"]
    i5c = vs5 / (2 * rr)
    d["p2_c_uf"] = P.fm(n["p2_c_uf"])
    d["p2_r_k"] = P.fm_sf(n["p2_r_k"], 2)
    d["p2_vs"] = P.fm_sf(vs5, 2)
    d["p2_rt_disp"] = P.fm(2 * rr)
    d["p2_i_disp"] = P.sci(i5c, 2)
    d["p2_one_disp"] = P.sci(vs5 / rr, 2)
    q += [(c5, "F"), (rr, "Ω"), (vs5, "V")]

    d["_si"] = q
    d["_num"] = {"c1_emf": (vo, "V"), "c1_r": (r1, "Ω"), "c2_c": (c2, "F"),
                 "c2_t": (t2, "s"), "c3_vrms": (vrms, "V"), "c3_irms": (irms, "A"),
                 "c3_p": (p3, "W"), "p1_i": (ip, "A"), "p1_p": (pw, "W"),
                 "p2_i": (i5c, "A")}
    return d


def _net(elems, letter):
    svg = C.network(elems)
    return '<figure><figcaption>%s</figcaption>%s</figure>' % (letter, svg)


def diagrams(v, d):
    R = lambda: C.R("")
    nets = [
        _net([C.Par([[R()], [R()]])], "A"),
        _net([R(), C.Par([[R()], [R()]])], "B"),
        _net([C.Par([[R(), R()], [R()]])], "C"),
        _net([C.Par([[R()], [R()]]), C.Par([[R()], [R()]])], "D"),
        _net([C.Par([[R()], [R()], [R()]])], "E"),
    ]
    return {
        "w2_trace": S.scope_trace(
            5, float(v["w2_peak_div"]),
            "An oscilloscope screen with a grid of 10 divisions across and 8 up. "
            "A sine wave trace rises %s divisions above the centre line."
            % d["w2_peak_div"]),
        "w3_circuit": C.schematic(
            top=[C.Battery("%s V" % d["w3_vs"])],
            bottom=[C.R("%s Ω" % d["w3_r"], across=C.V()),
                    C.Par([[C.R("%s Ω" % d["w3_r"])],
                           [C.R("%s Ω" % d["w3_r"]), C.Switch("S")]]),
                    C.A()],
            label="A %s volt battery in series with a %s ohm resistor, a parallel "
                  "pair and an ammeter. One branch of the pair is a %s ohm resistor; "
                  "the other is a %s ohm resistor in series with switch S. A voltmeter "
                  "is connected across the single resistor."
                  % (d["w3_vs"], d["w3_r"], d["w3_r"], d["w3_r"])),
        "w4_networks": '<div class="opt-grid">%s</div>' % "".join(nets),
        "w5_circuit": C.schematic(
            top=[C.Source("E", "r", across=C.V())],
            bottom=[C.Switch("S"), C.R("%s Ω" % d["w5_load"]), C.A()],
            label="A cell drawn as e.m.f. E and internal resistance inside a dashed "
                  "box, with a voltmeter across its terminals, in series with a "
                  "switch, a resistor and an ammeter."),
        "w7_circuit": C.schematic(
            top=[C.Battery("%s V" % d["w7_vs"]), C.Switch("S")],
            bottom=[C.R("R"), C.Capacitor("%s μF" % d["w7_c_uf"], across=C.V())],
            label="A %s volt battery and switch in series with a resistor and a %s "
                  "microfarad capacitor. A voltmeter is connected across the "
                  "capacitor." % (d["w7_vs"], d["w7_c_uf"])),
        "c1_circuit": C.schematic(
            top=[C.Source("E", "r", across=C.V())],
            bottom=[C.Switch("S"), C.R("R"), C.A()],
            label="A battery drawn as e.m.f. E and internal resistance r inside a "
                  "dashed box, with a voltmeter across its terminals, in series with "
                  "switch S, a resistor R and an ammeter."),
        "c3_circuit": C.schematic(
            top=[C.ACSupply("")],
            bottom=[C.R("%s Ω" % d["c3_r1"]), C.R("%s Ω" % d["c3_r2"])],
            min_side=110,
            label="An a.c. supply connected to a %s ohm resistor and a %s ohm "
                  "resistor in series." % (d["c3_r1"], d["c3_r2"])),
        "c4_bands": S.band_materials(
            [("Material 1", 22, 1.0, 0.06), ("Material 2", 70, 1.0, 0.0),
             ("Material 3", 10, 1.0, 0.5)],
            "Band diagrams for three materials, each with a valence band below a "
            "conduction band. Material 1: a small gap, valence band shaded, "
            "conduction band almost empty. Material 2: a large gap, valence band "
            "shaded, conduction band empty. Material 3: valence band shaded and "
            "conduction band half shaded."),
        "p1_circuit": C.schematic(
            top=[C.Source("E", "r")],
            bottom=[C.Motor("")],
            label="A battery pack drawn as e.m.f. E and internal resistance r inside a "
                  "dashed box, connected to a motor."),
        "p2_circuit": C.schematic(
            top=[C.Battery("%s V" % d["p2_vs"]), C.Switch("S₁")],
            bottom=[C.R("%s kΩ" % d["p2_r_k"]),
                    C.R("%s kΩ" % d["p2_r_k"], across=C.Switch("", sub="S₂")),
                    C.Capacitor("%s μF" % d["p2_c_uf"])],
            label="A %s volt battery and switch S1 in series with two %s kilohm "
                  "resistors and a %s microfarad capacitor. Switch S2 is connected "
                  "across the second resistor." % (d["p2_vs"], d["p2_r_k"],
                                                   d["p2_c_uf"])),
    }


if __name__ == "__main__":
    A.compute, A.diagrams = compute, diagrams
    sys.exit(A.main(SRC, OUT, "-b"))
