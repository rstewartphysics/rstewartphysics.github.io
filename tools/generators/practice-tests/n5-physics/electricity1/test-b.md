# Electricity 1: Circuits and Resistance — Practice Test B

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: e1b
slug: practice-test-b
title: Electricity 1 · Practice Test B
short: Practice Test B
course: N5 Physics
audience: S3 (sitting Electricity 1 at N5 level)
topic: Electricity 1 — Circuits and Resistance
marks: 25
minutes: 35
badge: elec1-test-b
prefix: n5pt-e1b-
hub: /classes/s3-physics/electricity1.html
@end

@values
w3_r1: 20
w3_r2: 30
w4_r: 56
w4_i: 0.15
c1_supply: 6.0
c1_r1: 24
c1_r2: 36
c2_bands: grey,red,orange,silver
c2_measured_k: 88.0
c3_supply: 24
c3_r1: 120
c3_r2: 180
p1_supply: 24
p1_protect: 220
p1_vprotect: 4.4
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: Connecting meters to measure resistance (booklet L2, L3)
parent: SQA 2020 Paper 1 Q13 — the same "which arrangement lets the resistance of R be found" test, put into words rather than five small circuit diagrams so it reads on a phone.
stem: A pupil wants to measure the resistance of a resistor R. Which row describes how the meters must be connected?
option: ammeter in parallel with R, voltmeter in series with R
option: ammeter in series with R, voltmeter in parallel with R
option: ammeter in series with R, voltmeter in series with R
option: ammeter in parallel with R, voltmeter in parallel with R
option: ammeter in series with R, voltmeter across the supply
key: B
mi: The ammeter must be in series so the whole current passes through it, and the voltmeter must be in parallel with R so it measures the voltage across R alone. R is then found from <var>R</var> = <var>V</var> ÷ <var>I</var>.
wrong: An ammeter in parallel short-circuits the component it is meant to measure; a voltmeter in series stops almost all the current.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: Definition of voltage (booklet L2)
parent: SQA 2014 Paper 1 Q1 — the same "the voltage of a supply is a measure of" stem with a reordered option set.
stem: The voltage of an electrical supply is a measure of the
option: resistance of the circuit
option: current in the circuit
option: energy transferred to each coulomb of charge
option: charge passing a point in the circuit each second
option: speed of the charges in the wires
key: C
mi: Voltage is the energy transferred to each coulomb of charge passing through the supply — that is why one volt is one joule per coulomb.
wrong: "Charge passing a point each second" is the definition of <em>current</em>, not voltage. Charges drift slowly; their speed has nothing to do with the supply voltage.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Resistors in parallel (booklet L6)
parent: SQA 2016 Paper 1 Q4 — the same two-unequal-resistors-between-two-terminals question, with different values so the answer is not the published one.
diagram: w3_network
stem: Two resistors are connected as shown. The total resistance between P and Q is
options_from: w3
key: computed
mi: 1/R<sub>T</sub> = 1/{w3_r1} + 1/{w3_r2}, so 1/R<sub>T</sub> = {w3_recip}, giving R<sub>T</sub> = {w3_total} Ω. The total is always <em>smaller</em> than the smallest resistor.
wrong: Stopping at 1/R<sub>T</sub> = {w3_recip} and not inverting gives {w3_uninverted} Ω. Adding them as if in series gives {w3_series} Ω.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Ohm's law, one step (booklet L4)
parent: SQA 2025 Paper 1 Q13 — the same single-resistor application of V = IR, rearranged to ask for the voltage rather than the resistance, with new values.
stem: A {w4_r} Ω resistor carries a current of {w4_i} A. The voltage across the resistor is
options_from: w4
key: computed
mi: V = IR, so V = {w4_i} × {w4_r} = {w4_v} V.
wrong: Dividing instead of multiplying gives {w4_div} V. The resistance on its own, {w4_r} Ω, is not a voltage.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: Temperature and resistance of a conductor (booklet L4)
parent: ORIGINAL — booklet L4 teaches the temperature-resistance relationship for a conductor, but the past papers test it only through a lamp's V–I graph, which Test A already uses.
stem: A metal wire is connected across a supply of constant voltage. The temperature of the wire rises. Which row describes the resistance of the wire and the current in it?
option: resistance decreases, current decreases
option: resistance decreases, current increases
option: resistance increases, current decreases
option: resistance increases, current increases
option: resistance stays the same, current stays the same
key: C
mi: Heating a metal makes its ions vibrate more, so the electrons collide with them more often and the resistance <strong>increases</strong>. The supply voltage is unchanged, so by V = IR a larger resistance means a <strong>smaller</strong> current.
wrong: A thermistor's resistance falls as it warms, but a plain metal wire behaves the opposite way. Resistance and current cannot both rise at a fixed voltage.
@end

@q C1 | core | struct | 4
keyarea: Resistors in series and Ohm's law (booklet L4, L5)
given: c1_supply,c1_r1,c1_r2
parent: SQA 2017 Paper 2 Q2(a)(i) — the same series pair across a known supply, with new resistances and the current asked for rather than the voltage across one resistor. The published answer is 7·50 V.
context: A pupil sets up the circuit shown.
diagram: c1_series
@part a | 1 | value | auto 1
ask: Calculate the total resistance of the circuit.
answer: c1_total
unit: Ω
mi: R<sub>T</sub> = R<sub>1</sub> + R<sub>2</sub> = {c1_r1} + {c1_r2} = **{c1_total} Ω** **(1)**
@end
@part b | 3 | calc | auto 2
ask: Calculate the reading on the ammeter.
relationship: ohm
answer: c1_current
unit: A
mi: V = IR **(1)**<br>{c1_supply} = I × {c1_total} **(1)**<br>I = **{c1_current} A** **(1)**<br>The unit is required. Carry through an incorrect total resistance from part (a).
@end
@end

@q C2 | core | struct | 4
keyarea: Resistor colour code and tolerance (booklet L3)
given: c2_value_k
parent: ORIGINAL — the colour code is taught in Booklet 1 L3 but does not appear in the N5 past papers. Test A asks for the maximum within tolerance; this asks for the minimum, on a different resistor.
context: A resistor is taken from the school stock box. Its colour bands are shown below.
diagram: c2_bands
@part a | 1 | value | auto 1
ask: State the resistance of this resistor, in kΩ.
answer: c2_value_k
unit: kΩ
mi: {c2_b1} = {c2_d1}, {c2_b2} = {c2_d2} gives {c2_digits}; {c2_b3} is the multiplier ×{c2_mult}. Resistance = {c2_value} Ω = **{c2_value_k} kΩ** **(1)**
@end
@part b | 2 | working | auto 1
sf: 3
ask: Calculate the minimum resistance this resistor could have and still be within its stated tolerance.
answer: c2_min
unit: Ω
mi: A {c2_b4} band is a tolerance of ±{c2_tol}%. <br>{c2_tol}% of {c2_value} Ω = {c2_tol_ohms} Ω **(1)**<br>Minimum = {c2_value} − {c2_tol_ohms} = **{c2_min} Ω** **(1)**<br>Accept {c2_min_k} kΩ. Carry through an incorrect value from part (a).
@end
@part c | 1 | short | self 1
ask: The resistor is measured with an ohmmeter, which reads {c2_measured_k} kΩ. State whether the resistor is within its stated tolerance. You must justify your answer.
mi: Yes / it is within tolerance **(1)**, because {c2_measured} Ω lies between the minimum {c2_min} Ω and the maximum {c2_max} Ω. <br>No mark for "yes" on its own — the justification must quote the range.
@end
@end

@q C3 | core | struct | 5
keyarea: Resistors in parallel (booklet L6)
given: c3_supply,c3_r1,c3_r2
parent: SQA 2014 Paper 2 Q1(b)(i) — the same parallel network across a supply, with two unequal resistors instead of the published three and new values. The published answer is 20 Ω.
context: Two resistors are connected in parallel across a {c3_supply} V supply, as shown.
diagram: c3_parallel
@part a | 3 | calc | auto 2
ask: Determine the total resistance of the circuit.
relationship: parallel
answer: c3_total
unit: Ω
mi: 1/R<sub>T</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> **(1)**<br>1/R<sub>T</sub> = 1/{c3_r1} + 1/{c3_r2} **(1)**<br>R<sub>T</sub> = **{c3_total} Ω** **(1)**<br>Using R<sub>T</sub> = R<sub>1</sub> + R<sub>2</sub> scores 0 for the whole part.
@end
@part b | 2 | calc | auto 2
ask: Determine the current in the {c3_r1} Ω resistor.
relationship: ohm
answer: c3_branch
unit: A
mi: Both resistors have the full supply voltage across them, because they are in parallel.<br>V = IR, so {c3_supply} = I × {c3_r1} **(1)**<br>I = **{c3_branch} A** **(1)**<br>Using the total resistance here instead of {c3_r1} Ω gives the supply current, not the current in this resistor.
@end
@end

@q P1 | push | struct | 5
keyarea: Series voltage sharing to find an unknown resistance (booklet L2, L4)
parent: SQA 2018 Paper 2 Q6(b)(ii) — the same "component in series with a protection resistor, find the unknown value from the shared voltage" problem, moved out of an LED circuit into a heating element so no electronics knowledge is needed. The published answer is 72 Ω.
context: A technician tests a heating element. The element is connected in series with a {p1_protect} Ω protection resistor across a {p1_supply} V supply. A voltmeter across the protection resistor reads {p1_vprotect} V.
diagram: p1_circuit
@part a | 2 | calc | auto 2
ask: Determine the current in the circuit.
relationship: ohm
answer: p1_current
unit: A
mi: The voltmeter reading and the resistance it is across both belong to the protection resistor.<br>V = IR, so {p1_vprotect} = I × {p1_protect} **(1)**<br>I = **{p1_current} A** **(1)**<br>The two components are in series, so this is the current everywhere in the circuit.
@end
@part b | 3 | calc | auto 2
ask: Determine the resistance of the heating element.
relationship: ohm
answer: p1_element
unit: Ω
mi: In series the supply voltage is shared: V<sub>element</sub> = {p1_supply} − {p1_vprotect} = {p1_velement} V **(1)**<br>V = IR, so {p1_velement} = {p1_current} × R **(1)**<br>R = **{p1_element} Ω** **(1)**<br>Carry through an incorrect current from part (a). Dividing the whole {p1_supply} V by the current gives the total resistance {p1_total} Ω, not the element's.
@end
@end

@q P2 | push | open | 2 | self 2
keyarea: Reasoning about series circuits (booklet L2, L4)
parent: SQA 2017 Paper 2 Q2(b)(ii) — the same "state the effect on a meter reading and justify it" demand, applied to the voltmeter in this circuit rather than to the power in a motor.
stem: The technician now fits a different heating element, one with a <strong>lower</strong> resistance than the first. The {p1_protect} Ω protection resistor and the {p1_supply} V supply are unchanged.<br><br>State what happens to the reading on the voltmeter, and justify your answer.
mi: The reading <strong>increases</strong> **(1)**.<br>A lower element resistance makes the <strong>total resistance of the circuit smaller</strong>, so the current is larger. That larger current passes through the {p1_protect} Ω protection resistor too, and by V = IR a larger current through an unchanged resistance gives a larger voltage across it **(1)**.<br>Award the first mark only if a justification is attempted. A justification by calculation is acceptable.
@end
