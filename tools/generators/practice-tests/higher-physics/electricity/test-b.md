# Higher Physics · Electricity — Practice Test B

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: eleb
slug: electricity-b
title: Electricity · Practice Test B
short: Practice Test B
course: Higher Physics
audience: Higher (Electricity)
topic: Electricity
marks: 45
minutes: 60
badge: hp-elec-test-b
prefix: hppt-eleb-
hub: /classes/higher/practice-tests.html
@end

@values
w1_vrms: 7.0
w1_load: 39
w2_ygain: 0.20
w2_peak_div: 2.5
w3_vs: 6.6
w3_r: 22
w5_r: 1.8
w5_load: 8.2
w5_i: 0.12
w6_c_uf: 390
w6_v: 5.5
w7_vs: 10.5
w7_c_uf: 150
w7_vc: 2.4
c1_open: 3.2
c1_closed: 2.6
c1_i: 0.75
c2_v: 5.8
c2_q_mc: 2.61
c2_r_k: 27
c3_vpk: 11.3
c3_r1: 330
c3_r2: 470
p1_emf: 14.4
p1_r: 0.050
p1_motor: 0.35
p2_c_uf: 270
p2_r_k: 3.9
p2_vs: 5.6
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: Peak power from an r.m.s. voltage
parent: SQA Higher 2023 P1 Q19 — the same "peak power in a resistor from the r.m.s. supply voltage" question, with a new supply and resistor, so the published 6·3 W is not reproduced.
stem: An a.c. supply of negligible internal resistance is connected to a {w1_load}&nbsp;Ω resistor. The r.m.s. voltage of the supply is {w1_vrms}&nbsp;V. The peak power dissipated in the resistor is
options_from: w1
key: computed
mi: <var>V</var><sub>peak</sub> = √2 <var>V</var><sub>rms</sub> = √2 × {w1_vrms} = {w1_vpk} V.<br><var>P</var><sub>peak</sub> = <var>V</var><sub>peak</sub><sup>2</sup> / <var>R</var> = {w1_vpk}<sup>2</sup> / {w1_load} = <strong>{w1_ppk} W</strong>.
wrong: {w1_mean} W uses the r.m.s. voltage, which gives the <em>mean</em> power, not the peak. {w1_root} W multiplies the mean power by √2 instead of by 2.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: r.m.s. voltage from an oscilloscope trace
parent: ORIGINAL — written for this programme around the SQA oscilloscope idiom, asking for the r.m.s. voltage from the Y-gain rather than the frequency.
diagram: w2_trace
stem: The output of a signal generator is displayed on an oscilloscope. The trace is shown. The Y-gain setting is {w2_ygain}&nbsp;V/div. The r.m.s. voltage of the output is
options_from: w2
key: computed
mi: The trace rises {w2_peak_div} divisions above the centre line: <var>V</var><sub>peak</sub> = {w2_peak_div} × {w2_ygain} = {w2_vpk} V.<br><var>V</var><sub>rms</sub> = <var>V</var><sub>peak</sub> / √2 = <strong>{w2_vrms} V</strong>.
wrong: {w2_vpk} V is the peak voltage. {w2_pp} V is peak-to-peak. {w2_up} V multiplies by √2 instead of dividing.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Series and parallel circuits with a switch
parent: SQA Higher 2018 P1 Q15 — the same "statements about meter readings as a switch is opened and closed" idiom, with a different network, supply and set of statements, so the published answer does not carry over.
diagram: w3_circuit
stem: A circuit is set up as shown. The battery has negligible internal resistance. A student makes the following statements.<ol class="stmts" type="I"><li>When switch S is open, the reading on the voltmeter is {w3_v_open}&nbsp;V.</li><li>When switch S is closed, the reading on the ammeter is {w3_wrong_i}&nbsp;A.</li><li>Closing switch S increases the reading on the voltmeter.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: I and III only
option: I, II and III
key: D
mi: <strong>S open</strong>: the circuit is two {w3_r}&nbsp;Ω resistors in series, {w3_rt_open}&nbsp;Ω in total, so <var>I</var> = {w3_vs} / {w3_rt_open} = {w3_i_open} A and the voltmeter reads {w3_i_open} × {w3_r} = {w3_v_open} V — <strong>I is correct</strong>.<br><strong>S closed</strong>: the parallel pair is {w3_rp}&nbsp;Ω, the total is {w3_rt_closed}&nbsp;Ω, and <var>I</var> = {w3_vs} / {w3_rt_closed} = {w3_i_closed} A, not {w3_wrong_i} A — <strong>II is wrong</strong>.<br>The voltmeter now reads {w3_i_closed} × {w3_r} = {w3_v_closed} V, which is more than before — <strong>III is correct</strong>.
wrong: {w3_wrong_i} A is the current when the total resistance is taken as the {w3_r}&nbsp;Ω resistor alone. Closing a switch in a parallel branch <em>lowers</em> the total resistance, so the current and the p.d. across the series resistor both rise.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Effective resistance of a combination
parent: SQA Higher Specimen Paper P1 Q22 — the same "which combination" idiom with every resistor identical, asking for the <em>greatest</em> effective resistance instead of the least, from a different set of networks.
diagram: w4_networks
stem: In each of the combinations shown, every resistor has the same resistance <var>R</var>. Which combination has the greatest effective resistance between X and Y?
option: Combination A
option: Combination B
option: Combination C
option: Combination D
option: Combination E
key: B
mi: A: two in parallel, <var>R</var>/2. <strong>B: one in series with a parallel pair, <var>R</var> + <var>R</var>/2 = 1·5<var>R</var></strong>. C: two in series, in parallel with one, 2<var>R</var>/3. D: two parallel pairs in series, <var>R</var>/2 + <var>R</var>/2 = <var>R</var>. E: three in parallel, <var>R</var>/3. The greatest is <strong>B</strong>.
wrong: Choosing C because it has the most resistors forgets that putting a branch in parallel always <em>lowers</em> the resistance — the combined resistance of a parallel group is less than its smallest branch.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: E.m.f., terminal potential difference and internal resistance
parent: SQA Higher 2025 P1 Q21 — the same "which row shows the EMF and the voltmeter reading" idiom, with a new internal resistance, load and current, so the published row is not reproduced.
diagram: w5_circuit
stem: A cell of internal resistance {w5_r}&nbsp;Ω is connected to a {w5_load}&nbsp;Ω resistor as shown. The voltmeter is connected across the terminals of the cell. The switch is closed and the reading on the ammeter is {w5_i}&nbsp;A. Which row shows the e.m.f. of the cell and the reading on the voltmeter?
options_from: w5
key: computed
mi: <var>E</var> = <var>I</var>(<var>R</var> + <var>r</var>) = {w5_i} × ({w5_load} + {w5_r}) = <strong>{w5_emf} V</strong>.<br>The voltmeter reads the terminal p.d.: <var>V</var> = <var>I</var><var>R</var> = {w5_i} × {w5_load} = <strong>{w5_tpd} V</strong>.
wrong: {w5_lost} V is the lost volts, <var>I</var><var>r</var>. A voltmeter across the terminals of a cell reads the terminal p.d., which is the e.m.f. <em>minus</em> the lost volts.
@end

@q W6 | warmup | mcq | 1 | auto 1
keyarea: Energy stored in a capacitor
parent: SQA Higher 2018 P1 Q18 — the same "energy stored in a fully charged capacitor" step, with a new capacitor and supply, so the published 1·6 × 10⁻² J is not reproduced.
stem: A {w6_c_uf}&nbsp;μF capacitor is connected to a {w6_v}&nbsp;V d.c. supply of negligible internal resistance until it is fully charged. The energy stored in the capacitor is
options_from: w6
key: computed
mi: <var>E</var> = ½<var>C</var><var>V</var><sup>2</sup> = ½ × {w6_c_sci} × {w6_v}<sup>2</sup> = <strong>{w6_e} J</strong>.
wrong: {w6_nohalf} J leaves out the ½. {w6_nosq} J forgets to square the voltage. {w6_nou} J leaves the capacitance in microfarads.
@end

@q W7 | warmup | mcq | 1 | auto 1
keyarea: Charge on a capacitor part-way through charging
parent: SQA Higher 2022 P1 Q22 — the same "charge stored when the voltmeter across the capacitor reads a value below the supply" idiom, with a new supply, capacitor and reading, so the published 1·5 × 10⁻³ C is not reproduced.
diagram: w7_circuit
stem: A capacitor is connected in the circuit shown. The battery has negligible internal resistance. The capacitor is initially uncharged, and the switch is then closed. When the reading on the voltmeter is {w7_vc}&nbsp;V, the charge stored on the capacitor is
options_from: w7
key: computed
mi: The voltmeter reads the p.d. across the capacitor, so <var>Q</var> = <var>C</var><var>V</var> = {w7_c_sci} × {w7_vc} = <strong>{w7_q} C</strong>.
wrong: {w7_full} C uses the supply voltage — that is the charge once the capacitor is <em>fully</em> charged. {w7_vr} C uses the p.d. across the resistor, {w7_vr_v} V, instead of the p.d. across the capacitor.
@end

@q W8 | warmup | mcq | 1 | auto 1
keyarea: Doping and p–n junctions
parent: SQA Higher 2017 P1 Q19 — the same three-statement form and answer set, with the statements moved from band structure to doping and bias, so the published answer does not carry over.
stem: A student makes the following statements about semiconductors.<ol class="stmts" type="I"><li>In an n-type semiconductor, the majority charge carriers are electrons.</li><li>When an LED is reverse biased, electrons fall from the conduction band to the valence band and emit photons.</li><li>A p–n junction diode conducts when it is reverse biased.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: III only
option: I and II only
option: II and III only
key: A
mi: <strong>I is correct</strong>: doping with an element that has an extra outer electron gives n-type material, where the majority charge carriers are electrons.<br><strong>II is wrong</strong>: an LED emits light when it is <em>forward</em> biased. In reverse bias there is no current, so no electrons cross the junction to fall into the valence band.<br><strong>III is wrong</strong>: a p–n junction conducts in <em>forward</em> bias only.
wrong: Choosing an answer that includes II or III swaps forward and reverse bias. Forward bias is the one that conducts and lights the LED.
@end

@q C1 | core | struct | 6
keyarea: E.m.f. and internal resistance from two meter readings
parent: SQA Higher 2022 P2 Q12(c) and (d) — the same demands (how the e.m.f. is measured, and why the terminal p.d. falls when current is drawn), set with an open-circuit reading and one loaded reading in place of a graph, so the published e.m.f. and internal resistance are not reproduced.
context: A student uses the circuit shown to investigate the battery of a head torch. When switch S is open, the reading on the voltmeter is {c1_open}&nbsp;V. Switch S is closed: the reading on the voltmeter is now {c1_closed}&nbsp;V and the reading on the ammeter is {c1_i}&nbsp;A.
diagram: c1_circuit
@part a | 1 | value | auto 1
ask: State the e.m.f. of the battery.
answer: c1_emf
unit: V
sf: 2
mi: <var>E</var> = <strong>{c1_open} V</strong> **(1)**<br>With the switch open no current is drawn, so there are no lost volts and the voltmeter reads the e.m.f.
@end
@part b | 3 | calc | auto 2
ask: Calculate the internal resistance of the battery.
relationship: emf
answer: c1_r
unit: Ω
sf: 2
mi: <var>E</var> = <var>V</var> + <var>I</var><var>r</var> **(1)**<br>{c1_open} = {c1_closed} + {c1_i} × <var>r</var> **(1)**<br><var>r</var> = <strong>{c1_r_disp} Ω</strong> **(1)**<br>Or consistent with (a).
@end
@part c | 2 | explain | self 2
ask: Explain why the reading on the voltmeter decreases when switch S is closed.
mi: When S is closed there is a current in the circuit, so there are lost volts across the internal resistance (<var>I</var><var>r</var> is no longer zero) **(1)**.<br>The terminal p.d. is the e.m.f. minus the lost volts, so it is less than the e.m.f. **(1)**.
@end
@end

@q C2 | core | struct | 7
keyarea: Capacitance, and the time taken to charge a capacitor
parent: SQA Higher 2023 P2 Q13(a)(i) and (b) — the same coulombmeter measurement of capacitance and the same "5RC" estimate of the charging time, with new readings and a new resistor, so neither published answer is reproduced; the last part asks about the resistor rather than the uncertainty.
context: A student charges a capacitor fully from a d.c. supply and measures the charge stored with a coulombmeter. The student records a potential difference across the capacitor of {c2_v}&nbsp;V and a charge of {c2_q_mc}&nbsp;mC.
@part a | 3 | calc | auto 2
ask: Calculate the capacitance of the capacitor.
relationship: cap
answer: c2_c
unit: F
sf: 2
mi: <var>C</var> = <var>Q</var> / <var>V</var> **(1)**<br>= {c2_q_sci} / {c2_v} **(1)**<br>= <strong>{c2_c_disp} F</strong> **(1)**<br>Leaving the charge in millicoulombs loses the substitution mark and the final mark.
@end
@part b | 2 | value | auto 1
ask: The capacitor is discharged and connected in series with a {c2_r_k}&nbsp;kΩ resistor and the supply. The time <var>t</var> taken for the capacitor to charge fully can be estimated using the relationship <var>t</var> = 5<var>R</var><var>C</var>. Calculate the estimated time taken for the capacitor to charge fully.
answer: c2_t
unit: s
sf: 2
mi: <var>t</var> = 5<var>R</var><var>C</var> = 5 × {c2_r_sci} × {c2_c_disp} **(1)**<br>= <strong>{c2_t_disp} s</strong> **(1)**<br>Or consistent with (a).
@end
@part c | 2 | explain | self 2
ask: The {c2_r_k}&nbsp;kΩ resistor is replaced by one of greater resistance. State the effect this has on the time taken for the capacitor to charge fully. You must justify your answer.
mi: The time taken <strong>increases</strong> **(1)** — awarded only if a justification is attempted.<br>A greater resistance means a smaller charging current (at every p.d. across the resistor), so charge flows onto the capacitor more slowly (<var>t</var> = 5<var>R</var><var>C</var> increases) **(1)**.
@end
@end

@q C3 | core | struct | 7
keyarea: r.m.s. values in a series a.c. circuit
parent: ORIGINAL — written for this programme to join the peak/r.m.s. step to a series circuit: total resistance, r.m.s. current and mean power in one resistor.
context: An a.c. supply of negligible internal resistance, with a peak voltage of {c3_vpk}&nbsp;V, is connected to a {c3_r1}&nbsp;Ω resistor and a {c3_r2}&nbsp;Ω resistor in series, as shown.
diagram: c3_circuit
@part a | 2 | calc | auto 2
ask: Calculate the r.m.s. voltage of the supply.
relationship: vpeak
answer: c3_vrms
unit: V
sf: 2
mi: <var>V</var><sub>peak</sub> = √2 <var>V</var><sub>rms</sub> **(1)**<br>{c3_vpk} = √2 × <var>V</var><sub>rms</sub>, so <var>V</var><sub>rms</sub> = <strong>{c3_vrms_disp} V</strong> **(1)**
@end
@part b | 3 | calc | auto 2
ask: Calculate the r.m.s. current in the circuit.
relationship: ohm
answer: c3_irms
unit: A
sf: 2
mi: <var>R</var><sub>T</sub> = {c3_r1} + {c3_r2} = {c3_rt} Ω **(1)**<br><var>V</var> = <var>I</var><var>R</var> **(1)**<br><var>I</var><sub>rms</sub> = {c3_vrms_disp} / {c3_rt} = <strong>{c3_irms_disp} A</strong> **(1)**<br>Or consistent with (a). Using the peak voltage gives {c3_ipk_disp} A, the peak current, and loses the final mark.
@end
@part c | 2 | calc | auto 2
ask: Calculate the mean power dissipated in the {c3_r2}&nbsp;Ω resistor.
relationship: p_i2r
answer: c3_p
unit: W
sf: 2
mi: <var>P</var> = <var>I</var><sup>2</sup><var>R</var> **(1)**<br>= {c3_irms_disp}<sup>2</sup> × {c3_r2} = <strong>{c3_p_disp} W</strong> **(1)**<br>Or consistent with (b).
@end
@end

@q C4 | core | struct | 4
keyarea: Band theory of conductors, insulators and semiconductors
parent: SQA Higher Specimen Paper P2 Q15(a) — the same "which material is a semiconductor" demand from three band diagrams, with the materials in a different order, so the published "Material 2" is not the answer; the later parts are original.
context: The diagrams show the valence band and the conduction band of three materials. Shaded areas represent bands occupied by electrons.
diagram: c4_bands
@part a | 1 | explain | self 1
ask: State which material is a semiconductor.
mi: <strong>Material 1</strong> **(1)** — a small gap, with the conduction band almost empty.
@end
@part b | 1 | explain | self 1
ask: State which material is a conductor.
mi: <strong>Material 3</strong> **(1)** — its highest occupied band is only partly filled, so electrons are free to move.
@end
@part c | 2 | explain | self 2
ask: Using band theory, explain why the conductivity of the semiconductor increases as its temperature increases.
mi: As the temperature increases, more electrons gain enough energy to move from the valence band into the conduction band **(1)**.<br>With more electrons in the conduction band (and more holes left in the valence band), there are more charge carriers, so the conductivity increases **(1)**.<br>Bands must be named correctly for either mark.
@end
@end

@q P1 | push | struct | 8
keyarea: Internal resistance and wasted power in a high-current circuit
parent: ORIGINAL — written for this programme in a new context (a cordless drill), combining e.m.f., internal resistance, wasted power and a qualitative change of load.
context: A cordless drill is powered by a battery pack of e.m.f. {p1_emf}&nbsp;V and internal resistance {p1_r}&nbsp;Ω. While drilling, the motor has a resistance of {p1_motor}&nbsp;Ω.
diagram: p1_circuit
@part a | 3 | calc | auto 2
ask: Calculate the current in the motor while drilling.
relationship: emf
answer: p1_i
unit: A
sf: 2
mi: <var>E</var> = <var>V</var> + <var>I</var><var>r</var>, with <var>V</var> = <var>I</var><var>R</var> **(1)**<br>{p1_emf} = <var>I</var> × {p1_motor} + <var>I</var> × {p1_r} **(1)**<br><var>I</var> = <strong>{p1_i_disp} A</strong> **(1)**<br><var>I</var> = <var>E</var> / (<var>R</var> + <var>r</var>) is accepted for the first mark.
@end
@part b | 3 | calc | auto 2
ask: Calculate the power wasted in the internal resistance of the battery pack.
relationship: p_i2r
answer: p1_p
unit: W
sf: 2
mi: <var>P</var> = <var>I</var><sup>2</sup><var>R</var> **(1)**<br>= {p1_i_disp}<sup>2</sup> × {p1_r} **(1)**<br>= <strong>{p1_p_disp} W</strong> **(1)**<br>Or consistent with (a). Using the motor's resistance gives the power in the motor, {p1_pm_disp} W, and scores the relationship mark only.
@end
@part c | 2 | open | self 2
ask: The drill bit jams in the wood, and the resistance of the motor decreases. Explain why the potential difference across the motor decreases.
mi: A smaller total resistance means a larger current in the circuit **(1)**.<br>The lost volts (<var>I</var><var>r</var>) increase, so the terminal p.d. — the p.d. across the motor, <var>E</var> − <var>I</var><var>r</var> — decreases **(1)**.
@end
@end

@q P2 | push | struct | 5
keyarea: The charging current of a capacitor, and what sets the charge stored
parent: SQA Higher 2017 P2 Q13 — the same circuit of a capacitor, two equal resistors and a second switch across one of them, with a new capacitor, resistors and supply; (a) asks for the initial current with both resistors in the circuit, and (b) replaces the published "why is the charging time shorter" with the effect on the charge stored.
context: An uncharged {p2_c_uf}&nbsp;μF capacitor is connected in the circuit shown. The {p2_vs}&nbsp;V battery has negligible internal resistance. Switch S<sub>2</sub> is open.
diagram: p2_circuit
@part a | 3 | calc | auto 2
ask: Switch S<sub>1</sub> is closed. Calculate the initial charging current.
relationship: ohm
answer: p2_i
unit: A
sf: 2
mi: Initially the capacitor is uncharged, so the whole {p2_vs} V is across the two resistors in series, <var>R</var><sub>T</sub> = {p2_rt_disp} Ω.<br><var>V</var> = <var>I</var><var>R</var> **(1)**<br>{p2_vs} = <var>I</var> × {p2_rt_disp} **(1)**<br><var>I</var> = <strong>{p2_i_disp} A</strong> **(1)**<br>Using one resistor only gives {p2_one_disp} A — the first mark only.
@end
@part b | 2 | open | self 2
ask: The capacitor is discharged. Switch S<sub>2</sub> is now closed, and then switch S<sub>1</sub> is closed. State the effect this has on the maximum charge stored on the capacitor. You must justify your answer.
mi: <strong>No effect</strong> — the maximum charge is the same **(1)** — awarded only if a justification is attempted.<br>The maximum charge is <var>Q</var> = <var>C</var><var>V</var>; the capacitance and the supply voltage are unchanged. Closing S<sub>2</sub> only reduces the resistance, which shortens the time taken to charge **(1)**.
@end
@end
