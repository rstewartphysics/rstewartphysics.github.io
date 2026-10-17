# Higher Physics · Electricity — Practice Test A

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: elea
slug: electricity-a
title: Electricity · Practice Test A
short: Practice Test A
course: Higher Physics
audience: Higher (Electricity)
topic: Electricity
marks: 45
minutes: 60
badge: hp-elec-test-a
prefix: hppt-elea-
hub: /classes/higher/practice-tests.html
@end

@values
w1_vrms: 18.0
w2_tb_ms: 2.5
w2_period_div: 4
w3_r: 220
w3_p: 0.55
w4_vs: 9.0
w4_r1_k: 1.5
w4_r2_k: 2.0
w5_emf: 6.5
w5_r: 0.60
w5_load: 4.4
w6_c_uf: 43
w6_v: 45
c1_ygain: 2.0
c1_peak_div: 3.5
c1_tb_ms: 0.5
c1_period_div: 4
c1_load: 33
c2_emf: 9.0
c2_r: 4.0
c3_vs: 5.0
c3_i_ua: 25
c3_c_uf: 330
c3_t: 36
p1_emf: 6.8
p1_r: 2.4
p1_load1: 1.6
p1_load2: 2.4
p2_c_mf: 120
p2_v: 3.3
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: Peak and r.m.s. voltage
parent: SQA Higher Specimen Paper P1 Q20 — the same peak-from-r.m.s. step, with a low-voltage supply in place of the mains, so the published 325 V is not reproduced.
stem: The r.m.s. voltage of the output from a low-voltage a.c. supply is {w1_vrms}&nbsp;V. The peak voltage of the output is
options_from: w1
key: computed
mi: <var>V</var><sub>peak</sub> = √2 <var>V</var><sub>rms</sub> = √2 × {w1_vrms} = <strong>{w1_peak}&nbsp;V</strong>.
wrong: {w1_div}&nbsp;V comes from dividing by √2 instead of multiplying — the peak is always the <em>larger</em> of the two. {w1_double}&nbsp;V comes from doubling the r.m.s. value, and {w1_vrms}&nbsp;V treats the r.m.s. value as the peak.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: Frequency from an oscilloscope trace
parent: SQA Higher Specimen Paper P1 Q21 — the same "frequency from the trace and the timebase" idiom, with a different timebase setting and number of cycles, so the published 8·3 Hz is not reproduced.
diagram: w2_trace
stem: The output from a signal generator is displayed on an oscilloscope. The trace is shown. The timebase of the oscilloscope is set at {w2_tb_ms}&nbsp;ms/div. The frequency of the output signal is
options_from: w2
key: computed
mi: One complete wave covers {w2_period_div} divisions, so <var>T</var> = {w2_period_div} × {w2_tb_ms}&nbsp;ms = {w2_t_ms}&nbsp;ms = {w2_t_s}&nbsp;s.<br><var>f</var> = 1 / <var>T</var> = 1 / {w2_t_s} = <strong>{w2_f}&nbsp;Hz</strong>.
wrong: {w2_half}&nbsp;Hz comes from reading only half a wave (peak to trough) as the period. Forgetting to change ms into s gives {w2_ms}&nbsp;Hz.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Power, current and resistance
parent: SQA Higher 2018 P1 Q16 — the same "current from power and resistance" step, with a new resistor and power, so the published 0·20 A is not reproduced.
stem: The power dissipated in a {w3_r}&nbsp;Ω resistor is {w3_p}&nbsp;W. The current in the resistor is
options_from: w3
key: computed
mi: <var>P</var> = <var>I</var><sup>2</sup><var>R</var>, so {w3_p} = <var>I</var><sup>2</sup> × {w3_r} and <var>I</var> = √({w3_p} / {w3_r}) = <strong>{w3_i}&nbsp;A</strong>.
wrong: {w3_nosqrt}&nbsp;A is <var>I</var><sup>2</sup> — the square root was not taken. {w3_v}&nbsp;A is the p.d. across the resistor in volts, not the current.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Potential difference in a series–parallel circuit
parent: SQA Higher Specimen Paper P1 Q23 — the same "p.d. across part of a resistor network" idiom, with a different network and supply and the voltmeter across the single resistor, so the published answer is not reproduced.
diagram: w4_circuit
stem: A circuit is set up as shown. The battery has negligible internal resistance. The reading on the voltmeter is
options_from: w4
key: computed
mi: The two {w4_r2_k}&nbsp;kΩ resistors in parallel have a combined resistance of {w4_rp_k}&nbsp;kΩ.<br><var>V</var><sub>1</sub> = (<var>R</var><sub>1</sub> / (<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>)) <var>V</var><sub>S</sub> = ({w4_r1_k} / ({w4_r1_k} + {w4_rp_k})) × {w4_vs} = <strong>{w4_v1}&nbsp;V</strong>.
wrong: {w4_nopar}&nbsp;V comes from adding the two parallel resistors as if they were in series. {w4_vp}&nbsp;V is the p.d. across the parallel pair, not across the {w4_r1_k}&nbsp;kΩ resistor.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: Lost volts and internal resistance
parent: SQA Higher 2022 P1 Q21 — the same "lost volts" question with a battery of new e.m.f. and internal resistance and a new load, so the published 4·8 V is not reproduced.
diagram: w5_circuit
stem: A battery of e.m.f. {w5_emf}&nbsp;V and internal resistance {w5_r}&nbsp;Ω is connected to a resistor of resistance {w5_load}&nbsp;Ω as shown. The lost volts due to the internal resistance of the battery is
options_from: w5
key: computed
mi: <var>I</var> = <var>E</var> / (<var>R</var> + <var>r</var>) = {w5_emf} / ({w5_load} + {w5_r}) = {w5_i}&nbsp;A.<br>Lost volts = <var>I</var><var>r</var> = {w5_i} × {w5_r} = <strong>{w5_lost}&nbsp;V</strong>.
wrong: {w5_tpd}&nbsp;V is the terminal potential difference — the p.d. across the {w5_load}&nbsp;Ω resistor — not the lost volts. {w5_noR}&nbsp;V comes from leaving the internal resistance out of the total when finding the current.
@end

@q W6 | warmup | mcq | 1 | auto 1
keyarea: Capacitance, charge and potential difference
parent: SQA Higher 2018 P1 Q17 — the same single step, <var>Q</var> = <var>C</var><var>V</var>, with a new capacitor and p.d., so the published 3·00 × 10⁻³ C is not reproduced.
stem: A {w6_c_uf}&nbsp;μF capacitor is charged until the potential difference across it is {w6_v}&nbsp;V. The charge stored on the capacitor is
options_from: w6
key: computed
mi: <var>C</var> = <var>Q</var> / <var>V</var>, so <var>Q</var> = <var>C</var><var>V</var> = {w6_c_sci} × {w6_v} = <strong>{w6_q}&nbsp;C</strong>.
wrong: {w6_nou}&nbsp;C comes from leaving the capacitance in microfarads. {w6_half}&nbsp;C is half the charge — the ½ belongs to the <em>energy</em> relationships, not to <var>Q</var> = <var>C</var><var>V</var>.
@end

@q W7 | warmup | mcq | 1 | auto 1
keyarea: Charging a capacitor through a resistor
parent: ORIGINAL — written for this programme to test the three factors pupils most often confuse (the current at the instant of switching, what the resistance changes, and what the supply voltage changes), in the standard SQA I/II/III statement form.
stem: An uncharged capacitor is connected in series with a resistor, a switch and a d.c. supply of negligible internal resistance. The switch is closed and the capacitor charges. A student makes the following statements.<ol class="stmts" type="I"><li>The charging current is greatest at the instant the switch is closed.</li><li>Using a resistor of greater resistance increases the maximum charge stored on the capacitor.</li><li>Using a supply of greater voltage increases the maximum energy stored in the capacitor.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and III only
option: II and III only
option: I, II and III
key: C
mi: <strong>I is correct</strong>: at the instant the switch is closed the capacitor has no charge, so there is no p.d. across it and the whole supply voltage is across the resistor — the current is at its largest.<br><strong>II is wrong</strong>: the maximum charge is <var>Q</var> = <var>C</var><var>V</var>, which depends on the capacitance and the supply voltage only. A greater resistance makes the capacitor take <em>longer</em> to charge; it does not change how much charge it ends up with.<br><strong>III is correct</strong>: <var>E</var> = ½<var>C</var><var>V</var><sup>2</sup>, so a greater supply voltage stores more energy.
wrong: Any answer that includes II treats resistance as changing the <em>amount</em> of charge. Resistance changes the <em>time</em> taken to charge, never the final charge.
@end

@q W8 | warmup | mcq | 1 | auto 1
keyarea: Band structure of a semiconductor
parent: SQA Higher 2022 P1 Q24 — the same "which row describes the conduction band and the gap" idiom, asked about a semiconductor instead of an insulator, so the published row C is not the answer.
stem: Which of the following describes the conduction band, and the gap between the valence band and the conduction band, in a pure semiconductor at room temperature?
option: Conduction band: empty · Gap: large
option: Conduction band: almost empty · Gap: small
option: Conduction band: partly filled · Gap: the bands overlap
option: Conduction band: full · Gap: small
option: Conduction band: full · Gap: large
key: B
mi: In a semiconductor the gap between the valence band and the conduction band is <strong>small</strong>, so at room temperature a few electrons gain enough energy to cross it: the conduction band is <strong>almost empty</strong> (row B).
wrong: Row A describes an insulator — the gap is too large for electrons to cross. Row C describes a metal (a conductor).
@end

@q C1 | core | struct | 7
keyarea: Peak, r.m.s. and frequency from an oscilloscope, and Ohm's law with r.m.s. values
given: c1_ygain_disp
parent: ORIGINAL — written for this programme around the SQA oscilloscope idiom (Y-gain and timebase given, trace shown), extended to an r.m.s. current in a resistor.
context: The output of a signal generator is connected across a {c1_load}&nbsp;Ω resistor. An oscilloscope connected across the resistor shows the trace below. The Y-gain setting is {c1_ygain_disp}&nbsp;V/div and the timebase setting is {c1_tb_disp}&nbsp;ms/div.
diagram: c1_trace
@part a | 1 | value | auto 1
ask: Determine the peak voltage of the signal.
answer: c1_peak
unit: V
sf: 2
mi: The trace reaches {c1_peak_div} divisions above the centre line: <var>V</var><sub>peak</sub> = {c1_peak_div} × {c1_ygain_disp} = <strong>{c1_peak_disp}&nbsp;V</strong> **(1)**<br>Peak-to-peak ({c1_pp_disp}&nbsp;V) is not accepted.
@end
@part b | 2 | calc | auto 2
ask: Determine the frequency of the signal.
relationship: period
answer: c1_f
unit: Hz
sf: 2
mi: One wave covers {c1_period_div} divisions: <var>T</var> = {c1_period_div} × {c1_tb_disp}&nbsp;ms = {c1_t_ms}&nbsp;ms = {c1_t_s}&nbsp;s<br><var>T</var> = 1 / <var>f</var> **(1)**<br><var>f</var> = 1 / {c1_t_s} = <strong>{c1_f_disp}&nbsp;Hz</strong> **(1)**<br>An incorrect reading of the period can still earn the relationship mark.
@end
@part c | 2 | calc | auto 2
ask: Calculate the r.m.s. voltage of the signal.
relationship: vpeak
answer: c1_rms
unit: V
sf: 2
mi: <var>V</var><sub>peak</sub> = √2 <var>V</var><sub>rms</sub> **(1)**<br>{c1_peak_disp} = √2 × <var>V</var><sub>rms</sub>, so <var>V</var><sub>rms</sub> = <strong>{c1_rms_disp}&nbsp;V</strong> **(1)**<br>Or consistent with (a).
@end
@part d | 2 | calc | auto 2
ask: Calculate the r.m.s. current in the resistor.
relationship: ohm
answer: c1_irms
unit: A
sf: 2
mi: <var>V</var> = <var>I</var><var>R</var> **(1)**<br>{c1_rms_disp} = <var>I</var><sub>rms</sub> × {c1_load}, so <var>I</var><sub>rms</sub> = <strong>{c1_irms_disp}&nbsp;A</strong> **(1)**<br>Or consistent with (c). Using the peak voltage gives the peak current, {c1_ipk_disp}&nbsp;A — that is not the r.m.s. current and scores the relationship mark only.
@end
@end

@q C2 | core | struct | 6
keyarea: E.m.f. and internal resistance from a graph of R against 1/I
parent: SQA Higher Specimen Paper P2 Q13 — the same "R against 1/I" method, with a battery of new e.m.f. and internal resistance, so neither published value is reproduced, and a short-circuit current calculated from the graph's values.
context: A student uses the circuit shown to determine the e.m.f. <var>E</var> and internal resistance <var>r</var> of a battery. The variable resistor provides known values of resistance <var>R</var>. For each value of <var>R</var> the switch is closed, the current <var>I</var> is noted and 1/<var>I</var> is calculated.<br>Applying conservation of energy to the circuit gives <var>R</var> = <var>E</var> × (1/<var>I</var>) − <var>r</var>, which is the equation of a straight line: the gradient is <var>E</var> and the intercept on the <var>R</var> axis is −<var>r</var>. The graph of the student's results is shown.
diagram: c2_circuit
@part a | 1 | value | auto 1
ask: Use the graph to determine the internal resistance of the battery.
diagram: c2_graph
answer: c2_r
unit: Ω
sf: 2
mi: The line meets the <var>R</var> axis at −{c2_r_disp}&nbsp;Ω, so <var>r</var> = <strong>{c2_r_disp}&nbsp;Ω</strong> **(1)**<br>A negative value for <var>r</var> is not accepted.
@end
@part b | 2 | value | auto 1
ask: Use the graph to determine the e.m.f. of the battery.
answer: c2_emf
unit: V
sf: 2
mi: <var>E</var> = gradient = Δ<var>R</var> / Δ(1/<var>I</var>) **(1)** — using two points on the line, for example ({c2_x1}, {c2_y1}) and ({c2_x2}, {c2_y2}): ({c2_y2} − {c2_y1}) / ({c2_x2} − {c2_x1})<br>= <strong>{c2_emf_disp}&nbsp;V</strong> **(1)**<br>The first mark is for a correct gradient calculation using points on the line, not data points off it.
@end
@part c | 3 | calc | auto 2
ask: The battery is accidentally short-circuited. Calculate the current in the battery when this happens.
relationship: emf
answer: c2_isc
unit: A
sf: 2
mi: <var>E</var> = <var>V</var> + <var>I</var><var>r</var> **(1)**<br>When short-circuited the terminal p.d. is zero: {c2_emf_disp} = 0 + <var>I</var> × {c2_r_disp} **(1)**<br><var>I</var> = <strong>{c2_isc_disp}&nbsp;A</strong> **(1)**<br>Or consistent with (a) and (b). <var>I</var> = <var>E</var> / <var>r</var> is accepted for the first mark.
@end
@end

@q C3 | core | struct | 7
keyarea: Charging a capacitor with a constant current
parent: SQA Higher Specimen Paper P2 Q14 — the same constant-current charging circuit, with a new supply, current, capacitor and time, so no published answer (4·0 × 10⁵ Ω, 7·5 × 10⁻⁴ C) is reproduced, and the last part asks for the reason the resistance must be adjusted.
context: A {c3_c_uf}&nbsp;μF capacitor is charged using the circuit shown. The {c3_vs_disp}&nbsp;V battery has negligible internal resistance. The capacitor is initially uncharged. The switch S is closed, and the charging current is kept constant at {c3_i_ua}&nbsp;μA by adjusting the resistance of the variable resistor R.
diagram: c3_circuit
@part a | 3 | calc | auto 2
ask: Calculate the resistance of the variable resistor R just after the switch is closed.
relationship: ohm
answer: c3_r
unit: Ω
sf: 2
mi: Just after the switch is closed the capacitor is uncharged, so the whole {c3_vs_disp}&nbsp;V is across R.<br><var>V</var> = <var>I</var><var>R</var> **(1)**<br>{c3_vs_disp} = {c3_i_sci} × <var>R</var> **(1)**<br><var>R</var> = <strong>{c3_r_disp}&nbsp;Ω</strong> **(1)**
@end
@part b | 2 | calc | auto 2
ask: Calculate the charge on the capacitor {c3_t}&nbsp;s after the switch is closed.
relationship: charge
answer: c3_q
unit: C
sf: 2
mi: <var>Q</var> = <var>I</var><var>t</var> **(1)**<br>= {c3_i_sci} × {c3_t} = <strong>{c3_q_disp}&nbsp;C</strong> **(1)**
@end
@part c | 2 | explain | self 2
ask: Explain why the resistance of the variable resistor must be decreased as the capacitor charges, to keep the current constant.
mi: As the capacitor charges, the p.d. across the capacitor increases, so the p.d. across the variable resistor decreases **(1)**.<br>For the current (<var>I</var> = <var>V</var> / <var>R</var>) to stay the same with a smaller p.d. across it, the resistance must be smaller **(1)**.<br>The second mark depends on the first.
@end
@end

@q C4 | core | struct | 4
keyarea: Band theory in a photodiode
parent: SQA Higher 2022 P2 Q3(d)(ii) — the same band-theory explanation of how a photodiode produces a potential difference, set in a new context, with the naming part replaced by a second band-theory judgement.
context: An intruder alarm uses a beam of light shining onto a photodiode. A photodiode is a p–n junction. While light is incident on the photodiode it produces a potential difference; when an intruder breaks the beam, the potential difference drops and the alarm sounds.
@part a | 3 | explain | self 3
ask: Using band theory, explain how a potential difference is produced when photons of light are incident on the photodiode.
mi: Electrons gain (absorb) energy from the photons **(1)**.<br>Electrons move from the valence band to the conduction band **(1)**.<br>Electrons move towards the n-type semiconductor, producing a potential difference **(1)**.<br>Look for a reference to both the conduction band and the valence band first, otherwise 0 marks. Bands must be named correctly — do not accept "valency" or "conductive". The third statement depends on the second.
@end
@part b | 1 | explain | self 1
ask: Explain, in terms of the conduction band, why the potential difference drops when the beam is broken.
mi: With no photons absorbed, electrons are no longer given enough energy to move into the conduction band, so no (fewer) electrons move towards the n-type side **(1)**.
@end
@end

@q P1 | push | struct | 8
keyarea: Internal resistance and the power delivered to a load
given: p1_emf_disp,p1_r_disp,p1_load1_disp
parent: SQA Higher 2016 P1 Q19 — the same investigation of how the power in a variable resistor changes as its resistance is changed, set as a structured calculation with a battery of new e.m.f. and internal resistance, so the published multiple-choice answer does not apply.
context: A battery of e.m.f. {p1_emf_disp}&nbsp;V and internal resistance {p1_r_disp}&nbsp;Ω is connected to a variable resistor R as shown. The resistance of R is set to {p1_load1_disp}&nbsp;Ω.
diagram: p1_circuit
@part a | 3 | calc | auto 2
ask: Calculate the current in the circuit.
relationship: emf
answer: p1_i1
unit: A
sf: 2
mi: <var>E</var> = <var>V</var> + <var>I</var><var>r</var>, with <var>V</var> = <var>I</var><var>R</var> **(1)**<br>{p1_emf_disp} = <var>I</var> × {p1_load1_disp} + <var>I</var> × {p1_r_disp} **(1)**<br><var>I</var> = <strong>{p1_i1_disp}&nbsp;A</strong> **(1)**<br><var>I</var> = <var>E</var> / (<var>R</var> + <var>r</var>) is accepted for the first mark.
@end
@part b | 3 | calc | auto 2
ask: Calculate the power dissipated in the variable resistor.
relationship: p_i2r
answer: p1_p1
unit: W
sf: 2
mi: <var>P</var> = <var>I</var><sup>2</sup><var>R</var> **(1)**<br>= {p1_i1_disp}<sup>2</sup> × {p1_load1_disp} **(1)**<br>= <strong>{p1_p1_disp}&nbsp;W</strong> **(1)**<br>Or consistent with (a). Using the internal resistance instead of R gives the power wasted inside the battery, {p1_pr_disp}&nbsp;W, and scores the relationship mark only.
@end
@part c | 2 | open | self 2
ask: The resistance of R is now increased to {p1_load2_disp}&nbsp;Ω. State whether the power dissipated in R increases, decreases or stays the same. You must justify your answer by calculation.
mi: <strong>Increases</strong> **(1)** — awarded only if a justification is attempted.<br><var>I</var> = {p1_emf_disp} / ({p1_load2_disp} + {p1_r_disp}) = {p1_i2_disp}&nbsp;A, and <var>P</var> = {p1_i2_disp}<sup>2</sup> × {p1_load2_disp} = {p1_p2_disp}&nbsp;W, which is greater than {p1_p1_disp}&nbsp;W **(1)**.<br>The current is smaller, but the resistance has doubled, and the product <var>I</var><sup>2</sup><var>R</var> rises. (The power in the load is greatest when the load resistance equals the internal resistance — not required.)
@end
@end

@q P2 | push | struct | 5
keyarea: Energy stored in a capacitor, and how capacitance affects discharge
given: p2_v_disp
parent: SQA Higher 2016 P2 Q13(a)(ii) and (c) — the same energy-stored calculation and the same "effect on the time the lamp stays lit" judgement, in a new context, with a capacitance in millifarads and the change made the other way, so neither the published 10·8 J nor "shorter" is reproduced.
context: An emergency exit sign contains a {p2_c_mf}&nbsp;mF capacitor. While mains power is on, the capacitor is kept charged to {p2_v_disp}&nbsp;V. During a power cut the capacitor discharges through a small lamp, keeping the sign lit for a short time.
@part a | 3 | calc | auto 2
ask: Calculate the maximum energy stored in the capacitor.
relationship: e_cv2
answer: p2_e
unit: J
sf: 2
mi: <var>E</var> = ½<var>C</var><var>V</var><sup>2</sup> **(1)**<br>= ½ × {p2_c_sci} × {p2_v_disp}<sup>2</sup> **(1)**<br>= <strong>{p2_e_disp}&nbsp;J</strong> **(1)**<br>Leaving the capacitance in millifarads gives {p2_nomf_disp}&nbsp;J — the substitution mark is not awarded.
@end
@part b | 2 | open | self 2
ask: The capacitor is replaced by one of greater capacitance, which is also kept charged to {p2_v_disp}&nbsp;V. State the effect this has on the time the lamp stays lit during a power cut. You must justify your answer.
mi: The lamp stays lit for a <strong>longer</strong> time **(1)** — awarded only if a justification is attempted.<br>At the same p.d., a capacitor of greater capacitance stores more charge (<var>Q</var> = <var>C</var><var>V</var>) and more energy, so it takes longer to discharge through the lamp **(1)**.
@end
@end
