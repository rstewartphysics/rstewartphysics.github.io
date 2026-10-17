# Electricity 1: Circuits and Resistance — Practice Test A

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: e1a
slug: practice-test-a
title: Electricity 1 · Practice Test A
short: Practice Test A
course: N5 Physics
audience: S3 (sitting Electricity 1 at N5 level)
topic: Electricity 1 — Circuits and Resistance
marks: 25
minutes: 35
badge: elec1-test-a
prefix: n5pt-e1a-
hub: /classes/s3-physics/electricity1.html
@end

@values
w3_supply: 9.0
w3_v1: 5.4
w4_a1: 0.84
w4_a2: 0.52
w5_series: 18
w5_parallel: 18
c1_bands: brown,grey,red,gold
c1_measured_k: 1.84
c2_supply: 12
c2_r1: 4700
c2_r2: 3300
c3_gradient: 45
c3_imax: 0.16
c3_p1: 0.04
c3_p2: 0.14
p1_supply: 12
p1_protect: 15
p1_cable: 47
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: Circuit symbols (booklet L1)
parent: SQA 2014 Paper 1 Q2 — same "which row identifies these symbols" idiom, four different components and a new distractor set.
diagram: w1_symbols
stem: The circuit symbols W, X, Y and Z are shown below. Which row correctly identifies these four components?
option: W motor, X variable resistor, Y resistor, Z voltmeter
option: W ammeter, X variable resistor, Y fuse, Z ohmmeter
option: W motor, X variable resistor, Y fuse, Z ohmmeter
option: W motor, X resistor, Y fuse, Z voltmeter
option: W ammeter, X resistor, Y variable resistor, Z ohmmeter
key: C
mi: A circle containing M is a motor; a rectangle with an arrow through it is a variable resistor; a rectangle with the conductor drawn through it is a fuse; a circle containing Ω is an ohmmeter.
wrong: A voltmeter and an ohmmeter are both circles — the letter inside is what tells them apart.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: Definitions of current and charge (booklet L2)
parent: SQA 2015 Paper 1 Q2 — same I/II/III statement idiom, statements rewritten around current and charge carriers.
stem: A pupil makes the following statements about an electric circuit.<ol class="stmts"><li>The current in a circuit is the charge passing a point each second.</li><li>In a metal wire the charge carriers are electrons.</li><li>The current in a series circuit is smaller after each resistor.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: II and III only
option: I, II and III
key: C
mi: Statements I and II are the standard definitions. Statement III is a common misconception — current is the same at every point in a series circuit; it is the <em>voltage</em> that is shared between the components.
wrong: Charge is not used up as it goes round a circuit, so the current cannot get smaller after each resistor.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Voltage in a series circuit (booklet L2)
parent: SQA 2024 Paper 1 Q11 — same two-voltmeter series circuit, new supply voltage, and the resistor values removed so the series voltage rule is what is tested.
diagram: w3_series
stem: The circuit shown is set up. The reading on voltmeter V<sub>1</sub> is {w3_v1} V. The reading on voltmeter V<sub>2</sub> is
options_from: w3
key: computed
mi: In a series circuit the supply voltage is shared between the components: V<sub>s</sub> = V<sub>1</sub> + V<sub>2</sub>, so V<sub>2</sub> = {w3_supply} − {w3_v1} = {w3_v2} V.
wrong: The two readings add up to the supply voltage — they are not each equal to it, and they are not multiplied together.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Current in a parallel circuit (booklet L2)
parent: SQA 2016 Paper 1 Q3 — same branching circuit read through its ammeters, reduced to one junction and given new readings, so it is a single step rather than a two-branch deduction.
diagram: w4_parallel
stem: The circuit shown is set up. The reading on ammeter A<sub>1</sub> is {w4_a1} A and the reading on ammeter A<sub>2</sub> is {w4_a2} A. The reading on ammeter A<sub>3</sub> is
options_from: w4
key: computed
mi: The current from the supply splits between the two branches: I<sub>1</sub> = I<sub>2</sub> + I<sub>3</sub>, so I<sub>3</sub> = {w4_a1} − {w4_a2} = {w4_a3} A.
wrong: The current is <em>not</em> the same in every part of a parallel circuit — that is only true in series. Adding the two readings instead of subtracting gives {w4_sum} A.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: Combining resistors (booklet L5)
parent: SQA 2025 Paper 1 Q14 — same three-identical-resistor network, different value and a different arrangement, so the answer is not the published one.
diagram: w5_network
stem: Three {w5_series} Ω resistors are connected as shown. The total resistance between X and Y is
options_from: w5
key: computed
mi: The two resistors in parallel combine first: 1/R<sub>P</sub> = 1/{w5_parallel} + 1/{w5_parallel}, so R<sub>P</sub> = {w5_rp} Ω. That is in series with the third resistor: R<sub>T</sub> = {w5_rp} + {w5_series} = {w5_total} Ω.
wrong: Adding all three in series gives 54 Ω; treating all three as parallel gives 6·0 Ω. Work out the parallel pair first, then add the series resistor.
@end

@q C1 | core | struct | 4
keyarea: Resistor colour code and tolerance (booklet L3)
given: c1_value_k
parent: ORIGINAL — the resistor colour code is taught in Booklet 1 L3 but does not appear in the N5 past papers, so there is no SQA parent to vary.
context: A resistor is taken from the school stock box. Its colour bands are shown below.
diagram: c1_bands
@part a | 1 | value | auto 1
ask: State the resistance of this resistor, in kΩ.
answer: c1_value_k
unit: kΩ
mi: {c1_b1} = {c1_d1}, {c1_b2} = {c1_d2} gives {c1_digits}; {c1_b3} is the multiplier ×{c1_mult}. Resistance = {c1_value} Ω = {c1_value_k} kΩ. **(1)**
@end
@part b | 2 | working | auto 1
sf: 3
ask: Calculate the maximum resistance this resistor could have and still be within its stated tolerance.
answer: c1_max
unit: Ω
mi: A {c1_b4} band is a tolerance of ±{c1_tol}%. <br>{c1_tol}% of {c1_value} Ω = {c1_tol_ohms} Ω **(1)**<br>Maximum = {c1_value} + {c1_tol_ohms} = **{c1_max} Ω** **(1)**<br>Accept {c1_max_k} kΩ. Carry through an incorrect value from part (a).
@end
@part c | 1 | short | self 1
ask: The resistor is measured with an ohmmeter, which reads {c1_measured_k} kΩ. State whether the resistor is within its stated tolerance. You must justify your answer.
mi: Yes / it is within tolerance **(1)**, because {c1_measured} Ω lies between the minimum {c1_min} Ω and the maximum {c1_max} Ω. <br>No mark for "yes" on its own — the justification must quote the range.
@end
@end

@q C2 | core | struct | 6
keyarea: Ohm's law and resistors in series (booklet L4, L5)
given: c2_supply,c2_r1_k,c2_r2_k
parent: SQA 2022 Paper 2 Q6(b) — same series pair with the supply given, but kilohm values, a current asked for in milliamperes, and a different quantity in the final part. The published answer is 1·2 V; none of the answers here match it.
context: A pupil sets up the circuit shown to test two resistors from the stock box.
diagram: c2_series
@part a | 1 | value | auto 1
ask: Calculate the total resistance of the circuit.
answer: c2_total_k
unit: kΩ
mi: R<sub>T</sub> = R<sub>1</sub> + R<sub>2</sub> = {c2_r1} + {c2_r2} = **{c2_total} Ω = {c2_total_k} kΩ** **(1)**
@end
@part b | 3 | calc | auto 2
ask: Calculate the reading on the ammeter. Give your answer in milliamperes.
relationship: ohm
answer: c2_current_ma
unit: mA
mi: V = IR **(1)**<br>{c2_supply} = I × {c2_total} **(1)**<br>I = {c2_current} A = **{c2_current_ma} mA** **(1)**<br>The unit is required. Accept {c2_current} A written in standard form.
@end
@part c | 2 | calc | auto 2
ask: Calculate the potential difference across the {c2_r1_k} kΩ resistor.
relationship: ohm
answer: c2_v1
unit: V
mi: V = IR<br>V = {c2_current} × {c2_r1} **(1)**<br>V = **{c2_v1} V** **(1)**<br>Accept {c2_v1_2sf} V. Carry through an incorrect current from part (b).
@end
@end

@q C3 | core | struct | 3
keyarea: The V–I experiment and resistance from a graph (booklet L4)
parent: SQA 2025 Paper 2 Q6(b) and (c) — the same read-the-graph task and the same lamp follow-up, on a graph with a different scale. The published question asks for a gradient; this asks for the resistance from a point on the line, because gradients are taught in S4 rather than S3 (teacher, 3 Sep 2026). The published answer is 56 Ω.
context: A pupil investigates a resistor R using an ammeter and a voltmeter, and plots the results shown.
diagram: c3_graph
@part a | 2 | calc | auto 2
sf: 2
ask: Read a point from your line and use it to determine the resistance of resistor R.
relationship: ohm
answer: c3_resistance
unit: Ω
mi: Read any point that lies on the line — for example ({c3_pt_i}, {c3_pt_v}).<br>V = IR, so {c3_pt_v} = {c3_pt_i} × R **(1)**<br>R = **{c3_resistance} Ω** **(1)**<br>Every point on this line gives the same resistance, because the line is straight and goes through the origin. Any point on the line is acceptable; a point that is not on the line is not. Accept {c3_lo}–{c3_hi} Ω for a value read off the graph.
@end
@part b | 1 | short | self 1
ask: The pupil replaces resistor R with a filament lamp and repeats the experiment, obtaining the sketch graph shown. State what this graph shows about the resistance of the filament lamp as the current in it increases.
diagram: c3_lamp
mi: The resistance increases / is not constant / the lamp is non-ohmic **(1)**.<br>The line curves upwards, so equal increases in current need larger and larger increases in voltage — V ÷ I is getting bigger.
@end
@end

@q P1 | push | struct | 5
keyarea: Combination circuit — parallel then series (booklet L6)
parent: SQA 2023 Paper 2 Q6 — same switched parallel-plus-series structure, new resistances, a new context and a different question order. The published answers are 0·20 A and 42 Ω; neither appears here.
context: A gardener builds a soil-warming system for a greenhouse, powered from a {p1_supply} V supply. Two heating cables, each of resistance {p1_cable} Ω, are connected in parallel. A {p1_protect} Ω resistor protects the supply. Switch S brings the second cable into the circuit.
diagram: p1_circuit
@part a | 3 | calc | auto 2
ask: Determine the total resistance of the circuit when switch S is closed.
relationship: parallel
answer: p1_total
unit: Ω
mi: 1/R<sub>P</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> **(1)**<br>1/R<sub>P</sub> = 1/{p1_cable} + 1/{p1_cable}, so R<sub>P</sub> = {p1_parallel} Ω **(1)**<br>R<sub>T</sub> = {p1_parallel} + {p1_protect} = **{p1_total} Ω** **(1)**<br>Using R<sub>T</sub> = R<sub>1</sub> + R<sub>2</sub> for the parallel pair scores 0 for the whole part.
@end
@part b | 2 | calc | auto 2
ask: Determine the reading on the ammeter when switch S is closed.
relationship: ohm
answer: p1_current
unit: A
mi: V = IR<br>{p1_supply} = I × {p1_total} **(1)**<br>I = **{p1_current} A** **(1)**<br>Carry through an incorrect total resistance from part (a). The unit is required.
@end
@end

@q P2 | push | open | 2 | self 2
keyarea: Reasoning about parallel circuits (booklet L6)
parent: SQA 2022 Paper 2 Q6(c)(ii) and SQA 2023 Paper 2 Q6(b)(ii) — the same "state the effect and justify it" demand, moved into the greenhouse context and framed as a claim to be judged.
stem: The gardener now connects a third identical {p1_cable} Ω heating cable in parallel with the other two. A friend says:<blockquote>"Adding another cable adds more resistance to the circuit, so the reading on the ammeter will fall."</blockquote>State whether the friend is correct, and justify your answer using the physics of parallel circuits.
mi: The friend is **not** correct **(1)**.<br>Adding a resistor in parallel gives the current more paths to flow along, so the <strong>total resistance of the circuit decreases</strong>. The supply voltage is unchanged, so by V = IR the current — and therefore the ammeter reading — <strong>increases</strong> **(1)**.<br>Award the first mark only if a justification is attempted. A justification by calculation is acceptable: with three cables R<sub>P</sub> = {p1_parallel3} Ω, R<sub>T</sub> = {p1_total3} Ω and I = {p1_current3} A, which is larger than {p1_current} A.
@end
