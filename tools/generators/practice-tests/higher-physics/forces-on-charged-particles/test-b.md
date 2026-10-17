# Higher Physics · Forces on Charged Particles — Practice Test B

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: pw6b
slug: pw6-forces-on-charged-particles-b
title: Forces on Charged Particles · Practice Test B
short: Practice Test B
course: Higher Physics
audience: Higher (Particles and Waves)
topic: Forces on Charged Particles
marks: 25
minutes: 35
badge: hp-focp-test-b
prefix: hppt-pw6b-
hub: /classes/higher/practice-tests.html
@end

@values
e_charge: 1.60e-19
m_proton: 1.673e-27
m_electron: 9.11e-31
m_alpha: 6.645e-27
w3_charge: 8.0e-6
w3_work: 3.6e-3
c1_pd: 3200
c2_pd: 15000
p1_pd: 9000
p1_mass: 3.82e-26
p1_u: 5.0e5
p1_v: 1.4e6
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: The uniform field between charged parallel plates
parent: SQA Higher 2016 Paper 2 Q7(c) — the same uniform field between two metal plates, set as multiple choice and extended to the direction a charge is forced. The published answer is a drawn field pattern, so no answer is reproduced.
diagram: w1_plates
stem: Two parallel metal plates X and Y are connected to a supply. The electric field between them is shown. An electron is placed at rest at the point P, half-way between the plates. Which row in the table is correct?
option: X is negative · the force on the electron is upwards
option: X is positive · the force on the electron is upwards
option: X is negative · the force on the electron is downwards
option: X is positive · the force on the electron is downwards
option: X is positive · the electron feels no force
key: B
mi: Field lines run <strong>from the positive plate to the negative plate</strong>, and here they point downwards, so the upper plate X is <strong>positive</strong>. A field line shows the direction of the force on a <em>positive</em> charge, so a <strong>negative</strong> charge is forced the opposite way — the electron is pushed <strong>upwards</strong>, towards X.
wrong: "The electron feels no force" comes from thinking a charge must be moving to feel an electric force. It does not — that condition belongs to the <em>magnetic</em> force.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: Direction of the magnetic force on a positive particle
parent: SQA Higher 2016 Paper 2 Q8(d) — the same "determine the direction of the force" on a positively charged particle entering a field, with the field reversed to out of the page and an alpha particle in place of the plasma ion, so the answer is not the published "up the page".
diagram: w2_field
stem: An alpha particle enters a region of magnetic field as shown. The direction of the force exerted by the magnetic field on the alpha particle as it enters the field is
option: into the page
option: out of the page
option: towards the top of the page
option: towards the bottom of the page
option: towards the left of the page
key: D
mi: An alpha particle is <strong>positive</strong>, so the conventional current is in its own direction of travel — to the right. Left hand: first finger out of the page, second finger to the right, and the thumb points <strong>towards the bottom of the page</strong>.
wrong: "Towards the top" is the answer for a field into the page — check the dots against the crosses before you start. "Into" or "out of the page" is a field direction, never a force direction: the force is at right angles to both the field and the direction of travel.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Potential difference from the work done and the charge
parent: SQA Higher 2022 Paper 2 Q7(b)(ii) — the same E<sub>w</sub> = QV relationship, rearranged so the potential difference is the unknown, with a microcoulomb charge and new numbers. The published answer is 4·5 × 10⁻¹⁶ J; this question does not ask for a work done at all.
stem: A charge of {w3_charge} C is moved between two points in an electric field. The work done on the charge is {w3_work} J. The potential difference between the two points is
options_from: w3
key: computed
mi: E<sub>w</sub> = QV, so V = E<sub>w</sub> ÷ Q = {w3_work} ÷ {w3_charge} = <strong>{w3_pd} V</strong>.
wrong: Multiplying instead of dividing gives {w3_mult} V; dividing the other way round gives {w3_flip} V. Write the relationship down before rearranging it and neither mistake is available.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Magnetic fields and how they are drawn
parent: ORIGINAL — written for this programme to test the three magnetic-field facts the deck marks hardest, using the standard SQA I/II/III statement form.
stem: A pupil makes the following statements about magnetic fields.<ol class="stmts"><li>A moving charge produces a magnetic field around it.</li><li>Dots drawn on a diagram show a magnetic field directed into the page.</li><li>The force on a charged particle moving through a magnetic field is at right angles to both the field and the particle's direction of travel.</li></ol>Which of these statements is/are correct?
option: I only
option: III only
option: I and II only
option: I and III only
option: I, II and III
key: D
mi: I and III are the standard statements. II is the wrong way round: <strong>dots</strong> are the tip of an arrow coming <strong>out of</strong> the page, and <strong>crosses</strong> are the tail of an arrow going <strong>into</strong> it.
wrong: Choosing "I, II and III" means the dots-and-crosses convention has not been fixed. A charge at rest produces an electric field only — it needs to be moving before there is a magnetic field as well.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: How a cyclotron works
parent: SQA Higher 2023 Paper 2 Q7(b)(ii) — the same "explain why an alternating voltage is used in the cyclotron" mark, set as a multiple-choice statement question and extended to what happens to the radius of the path.
stem: A pupil makes the following statements about a cyclotron.<ol class="stmts"><li>The protons are accelerated by the electric field in the gap between the dees, not by the magnetic field.</li><li>The voltage alternates so that the proton is given a forward push every time it crosses the gap.</li><li>The radius of the proton's path inside a dee decreases as the proton gains speed.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: II and III only
option: I, II and III
key: C
mi: I and II are correct: the magnetic field only <strong>bends</strong> the proton into a circle, and the alternating supply makes sure the field in the gap is the right way round each time the proton arrives. III is the wrong way round — a <strong>faster</strong> proton follows a path of <strong>larger</strong> radius, which is why the dees have to be big.
wrong: Anything that includes III has the cyclotron spiralling inwards. It spirals outwards, and the beam is taken off at the rim.
@end

@q C1 | core | struct | 5
keyarea: Accelerating an alpha particle between charged plates
given: c1_pd_kv
parent: SQA Higher 2022 Paper 2 Q7(a) and (b) — the same protons-between-plates accelerator, with alpha particles in place of protons, released from rest, and a new potential difference, so neither published answer is reproduced.
context: Alpha particles are released from rest at plate A and accelerated in a vacuum towards plate B. The potential difference between the plates is {c1_pd_kv} kV. An alpha particle carries a charge of +2<var>e</var> and has a mass of {m_alpha_disp} kg.
diagram: c1_plates
@part a | 2 | calc | auto 2
ask: Calculate the work done on one alpha particle as it accelerates from plate A to plate B.
relationship: work
answer: c1_work
unit: J
mi: E<sub>w</sub> = QV **(1)**<br>= (2 × {e_charge_disp}) × {c1_pd} = <strong>{c1_work_disp} J</strong> **(1)**<br>The charge is <strong>twice</strong> the charge on an electron. A response using {e_charge_disp} C alone reaches {c1_half_disp} J and scores the relationship mark only.
@end
@part b | 3 | calc | auto 2
ask: Determine the speed of the alpha particle as it reaches plate B.
relationship: ek
answer: c1_speed
unit: m s⁻¹
mi: All the work done becomes kinetic energy, so E<sub>k</sub> = ½<var>m</var><var>v</var><sup>2</sup> **(1)**<br>{c1_work_disp} = ½ × {m_alpha_disp} × <var>v</var><sup>2</sup> **(1)**<br><var>v</var> = <strong>{c1_speed_disp} m s⁻¹</strong> **(1)**<br>Or consistent with part (a).
@end
@end

@q C2 | core | struct | 5
keyarea: Accelerating an electron in a linear accelerator
given: c2_pd_kv
parent: SQA Higher 2017 Paper 2 Q8(a) — the same X-ray linear accelerator with electrons crossing the gap between drift tubes, given a new accelerating voltage, so the answer differs from the published 4·00 × 10⁻¹⁶ J.
context: An X-ray machine contains a linear accelerator that accelerates electrons towards a metal target. The electrons are accelerated across the gap from P to Q by a potential difference of {c2_pd_kv} kV.
diagram: c2_linac
@part a | 2 | calc | auto 2
ask: Calculate the work done on an electron as it accelerates from P to Q.
relationship: work
answer: c2_work
unit: J
mi: E<sub>w</sub> = QV **(1)**<br>= {e_charge_disp} × {c2_pd} = <strong>{c2_work_disp} J</strong> **(1)**<br>Ignore a negative sign on the charge.
@end
@part b | 3 | calc | auto 2
ask: The electron starts from rest at P. Determine its speed as it reaches Q.
relationship: ek
answer: c2_speed
unit: m s⁻¹
mi: E<sub>k</sub> = ½<var>m</var><var>v</var><sup>2</sup> **(1)**<br>{c2_work_disp} = ½ × {m_electron_disp} × <var>v</var><sup>2</sup> **(1)**<br><var>v</var> = <strong>{c2_speed_disp} m s⁻¹</strong> **(1)**<br>The mass of an <strong>electron</strong> is the one to use here. Using the mass of a proton gives {c2_wrong_disp} m s⁻¹.
@end
@end

@q C3 | core | struct | 3
keyarea: Drawing and reading the field between two charged plates
parent: SQA Higher 2024 Paper 2 Q6(a)(i) — the same "field pattern between the plates" mark, written out in words rather than drawn because this test is sat on a screen, with the second part taken from the deck's "which way does a charge move" content.
context: Two parallel metal plates are connected to a supply as shown. The electric field between them has not been drawn.
diagram: c3_plates
@part a | 2 | explain | self 2
ask: Describe the electric field pattern between the two plates. Your answer should refer to the shape and spacing of the field lines and to their direction.
mi: The lines are <strong>straight, parallel and equally spaced</strong>, at right angles to the plates, starting and finishing on them **(1)**.<br>They point <strong>from the positive plate to the negative plate</strong> — that is, downwards on this diagram **(1)**.<br>SQA ignores end effects. A response describing curved lines, or lines that do not reach the plates, scores zero for the first mark.
@end
@part b | 1 | explain | self 1
ask: An electron is now released from rest next to the negative plate. State the direction in which it moves.
mi: <strong>Upwards</strong> — towards the positive plate **(1)**.<br>A negative charge is forced in the <em>opposite</em> direction to the field lines. "Towards the positive plate" is acceptable; "along the field lines" is not.
@end
@end

@q P1 | push | struct | 5
keyarea: Finding the charge on an ion from the kinetic energy it gains
given: p1_u_disp,p1_v_disp
parent: SQA Higher 2022 Paper 2 Q7(b)(iii) — the same "kinetic energy at the far plate, given the energy at the near plate" chain, turned round so the unknown is the charge on the particle rather than its final speed. The published answer is a speed of 8·3 × 10⁵ m s⁻¹; this question does not ask for a speed.
context: An ion of mass {p1_mass_disp} kg enters the gap between two charged plates travelling at {p1_u_disp} m s⁻¹, and leaves it travelling at {p1_v_disp} m s⁻¹. The potential difference across the gap is {p1_pd_kv} kV.
diagram: p1_plates
@part a | 3 | calc | auto 2
ask: Calculate the kinetic energy gained by the ion as it crosses the gap.
relationship: ek
answer: p1_gain
unit: J
mi: E<sub>k</sub> = ½<var>m</var><var>v</var><sup>2</sup> **(1)**<br>At entry: ½ × {p1_mass_disp} × ({p1_u_disp})<sup>2</sup> = {p1_ek0_disp} J. At exit: ½ × {p1_mass_disp} × ({p1_v_disp})<sup>2</sup> = {p1_ek1_disp} J **(1)**<br>Gain = {p1_ek1_disp} − {p1_ek0_disp} = <strong>{p1_gain_disp} J</strong> **(1)**<br>A response that forgets to subtract the energy the ion already had gives {p1_ek1_disp} J and scores two marks at most.
@end
@part b | 2 | calc | auto 2
ask: Determine the charge on the ion.
relationship: work
answer: p1_charge
unit: C
mi: All the work done on the ion becomes kinetic energy, so E<sub>w</sub> = QV **(1)**<br>Q = {p1_gain_disp} ÷ {p1_pd} = <strong>{p1_charge_disp} C</strong> **(1)**<br>Or consistent with part (a). That is about {p1_charge_n} times the charge on an electron, which is reasonable for a heavily ionised atom.
@end
@end

@q P2 | push | open | 2 | self 2
keyarea: Comparing a linear accelerator with a cyclotron
parent: SQA Higher 2018 Paper 2 Q6(c) — the same open "comment on this accelerator compared with a real one" demand, narrowed to a single comparison so that it can be marked against a short scheme by the candidate.
stem: A pupil says:<blockquote>"A cyclotron and a linear accelerator are really the same machine — both use an alternating supply to push the particles along."</blockquote>State one important difference between the two machines, and explain why a cyclotron can reach a high speed in a much smaller space than a linear accelerator can.
mi: Any one clear difference **(1)**: in a linear accelerator the particle travels in a <strong>straight line</strong> and crosses each gap once, so the machine must be long; in a cyclotron a <strong>magnetic field</strong> bends the particle into a circle so it returns to the <strong>same gap</strong> again and again.<br>The explanation **(1)**: because the particle is accelerated many times at the same gap, the energy is built up in a small space; the radius of its path simply grows as it speeds up.<br>Award the second mark only if the answer makes the link between crossing the gap repeatedly and building up speed. The pupil's statement is not wholly wrong — both do use an alternating supply — so a response that only says "they are different" scores zero.
@end
