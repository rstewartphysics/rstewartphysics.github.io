# Higher Physics · Forces on Charged Particles — Practice Test A

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: pw6a
slug: pw6-forces-on-charged-particles-a
title: Forces on Charged Particles · Practice Test A
short: Practice Test A
course: Higher Physics
audience: Higher (Particles and Waves)
topic: Forces on Charged Particles
marks: 25
minutes: 35
badge: hp-focp-test-a
prefix: hppt-pw6a-
hub: /classes/higher/practice-tests.html
@end

@values
e_charge: 1.60e-19
m_proton: 1.673e-27
m_electron: 9.11e-31
w3_charge: 2.5e-6
w3_pd: 60
c1_pd: 4500
c2_pd: 19000
p1_pd: 28000
p1_speed: 1.8e6
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: Electric field patterns around point charges
parent: SQA Higher Specimen Paper Q13 — the same "which row shows the charges" idiom read from three field patterns, with a different set of charges and a new distractor set. The published answer is row B (positive, positive, negative); this one is not.
diagram: w1_charges
stem: The electric field patterns around three charged particles Q, R and S are shown. Which row in the table shows the charges on particles Q, R and S?
option: Q positive · R positive · S negative
option: Q negative · R negative · S positive
option: Q positive · R negative · S negative
option: Q negative · R positive · S positive
option: Q negative · R negative · S negative
key: D
mi: A field line shows the direction of the force on a <strong>positive</strong> charge, so lines point <strong>away from</strong> a positive charge and <strong>towards</strong> a negative one. The arrows on Q point inwards, so Q is negative; the arrows on R and S point outwards, so R and S are both positive.
wrong: Rows with Q positive come from reading the arrows the wrong way round. This is the single most-marked mistake in the topic — decide the direction from "the force on a positive charge" every time, not from the shape of the pattern.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: Direction of the magnetic force on a moving charge
parent: SQA Higher 2025 Paper 1 Q11 — the same "direction of the force as the particle enters the field" idiom, with an electron in place of the proton and a different direction of travel, so the answer is not the published E.
diagram: w2_field
stem: An electron enters a region of magnetic field as shown. The direction of the force exerted by the magnetic field on the electron as it enters the field is
option: into the page
option: out of the page
option: towards the left of the page
option: towards the right of the page
option: towards the top of the page
key: C
mi: Use the <strong>left</strong> hand, with the <strong>conventional current</strong> as the second finger. The electron is negative and travels <em>down</em> the page, so the conventional current is <em>up</em> the page. First finger into the page, second finger up the page — the thumb points <strong>towards the left of the page</strong>.
wrong: "Towards the right" is what you get by using the electron's own direction of travel as the current instead of reversing it. "Into" or "out of the page" is the field direction, not the force — the force is always at right angles to both.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Work done moving a charge through a potential difference
parent: SQA Higher 2016 Paper 2 Q7(a) — the same single-step E<sub>w</sub> = QV, set as multiple choice with a microcoulomb charge and a new potential difference, so the answer differs from the published 3·2 × 10⁻¹⁶ J.
stem: A charge of {w3_charge} C is moved through a potential difference of {w3_pd} V. The work done on the charge is
options_from: w3
key: computed
mi: E<sub>w</sub> = QV = {w3_charge} × {w3_pd} = <strong>{w3_work} J</strong>.
wrong: Dividing instead of multiplying gives {w3_div} J; the two values on their own, {w3_charge} J and {w3_pd} J, are the charge and the p.d., not the work done.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Potential difference, and the direction a charge is forced
parent: ORIGINAL — written for this programme to test the two definitions the deck marks hardest, with the standard SQA I/II/III statement form.
stem: A pupil makes the following statements about an electric field.<ol class="stmts"><li>A potential difference of 1 volt means 1 joule of work is done moving 1 coulomb of charge between two points.</li><li>Electric field lines are drawn in the direction of the force on a positive charge.</li><li>A negative charge released from rest moves in the same direction as the field lines.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: II and III only
option: I, II and III
key: C
mi: Statements I and II are the definitions as they are marked. Statement III is the misconception: a <strong>negative</strong> charge is forced in the <strong>opposite</strong> direction to the field lines, because the lines are drawn for a positive charge.
wrong: Choosing "I, II and III" means statement III was not read against the definition in statement II — the two contradict each other.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: How a linear accelerator works
parent: SQA Higher Specimen Paper Q6(b) — the same two points the marking instructions want about a drift-tube accelerator (the alternating supply and the increasing tube lengths), set as a multiple-choice statement question rather than two written marks.
stem: A linear accelerator uses hollow metal drift tubes in a vacuum. A pupil makes the following statements about it.<ol class="stmts"><li>The protons are accelerated in the gaps between the tubes.</li><li>The supply alternates so that the field in each gap pushes the protons forwards every time they cross it.</li><li>The tubes are made longer along the accelerator because the field inside a tube gets weaker.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: II and III only
option: I, II and III
key: C
mi: I and II are the two points the marking instructions want. III is wrong twice over: there is <strong>no field inside a tube</strong> at all, so the proton coasts through at constant speed, and the tubes get longer because the proton is <strong>travelling faster</strong> and covers more distance in the same half-cycle.
wrong: Anything that includes III treats the tubes as the accelerating part. The tubes are the coasting part; the gaps do the work.
@end

@q C1 | core | struct | 5
keyarea: Electric fields, and the work done accelerating a charge
given: c1_pd_kv
parent: SQA Higher 2018 Paper 2 Q6(a) — the same cathode-and-anode accelerator, with a new accelerating voltage and the "show that" replaced by a calculation, so the answer differs from the published 2·6 × 10⁻¹⁶ J.
context: Inside an X-ray tube, electrons are released from rest at a heated cathode and accelerated through a vacuum towards the anode. The potential difference between the cathode and the anode is {c1_pd_kv} kV.
diagram: c1_plates
@part a | 2 | explain | self 2
ask: Explain why the electron accelerates towards the anode.
mi: The electron is <strong>charged</strong> (negatively charged) **(1)**.<br>It therefore experiences a <strong>force in the electric field</strong>; because it is negative the force is in the opposite direction to the field lines, that is towards the positive anode **(1)**.<br>A response that only says "charged particles experience a force" earns the second mark alone. Any statement that the electron is positive or uncharged scores zero.
@end
@part b | 3 | calc | auto 2
ask: Calculate the work done on one electron as it accelerates from the cathode to the anode.
relationship: work
answer: c1_work
unit: J
mi: E<sub>w</sub> = QV **(1)**<br>= {e_charge_disp} × {c1_pd} **(1)**<br>= <strong>{c1_work_disp} J</strong> **(1)**<br>The charge is the magnitude of the charge on an electron from the data sheet; ignore a negative sign.
@end
@end

@q C2 | core | struct | 5
keyarea: Accelerating a proton in a cyclotron
given: c2_pd_kv
parent: SQA Higher 2023 Paper 2 Q7(b)(i) — the same cyclotron and dees, with a new accelerating voltage and the single 5-mark calculation split into its two steps. The published answer is 2·47 × 10⁶ m s⁻¹; this one is not.
context: A cyclotron is used to produce isotopes for medical imaging. It has two hollow D-shaped electrodes, called dees, in a vacuum. Protons are released from rest at R and accelerated across the gap between the dees by a potential difference of {c2_pd_kv} kV.
diagram: c2_cyclotron
@part a | 2 | calc | auto 2
ask: Calculate the work done on a proton as it crosses the gap from R to S.
relationship: work
answer: c2_work
unit: J
mi: E<sub>w</sub> = QV **(1)**<br>= {e_charge_disp} × {c2_pd} = <strong>{c2_work_disp} J</strong> **(1)**
@end
@part b | 3 | calc | auto 2
ask: Determine the speed of the proton as it reaches S.
relationship: ek
answer: c2_speed
unit: m s⁻¹
mi: All the work done becomes kinetic energy, so E<sub>k</sub> = ½<var>m</var><var>v</var><sup>2</sup> **(1)**<br>{c2_work_disp} = ½ × {m_proton_disp} × <var>v</var><sup>2</sup> **(1)**<br><var>v</var> = <strong>{c2_speed_disp} m s⁻¹</strong> **(1)**<br>The mass of a proton comes from the data sheet. A candidate who reaches ½<var>m</var><var>v</var><sup>2</sup> but forgets to take the square root arrives at {c2_vsq_disp}, which is <var>v</var><sup>2</sup>, not <var>v</var>.
@end
@end

@q C3 | core | struct | 3
keyarea: Finding the direction of a magnetic field from the path of a beam
parent: SQA Higher 2024 Paper 2 Q6(b) — the same "determine the direction of the uniform magnetic field from the path of the beam", with the beam deflected the other way, so the answer is not the published "out of page". The second part follows SQA Higher 2017 Paper 2 Q8(b)(ii), which asks candidates to compare two field regions.
context: A narrow beam of electrons is directed from left to right into a region of uniform magnetic field between two coils. The path taken by the electrons is shown.
diagram: c3_beam
@part a | 1 | explain | self 1
ask: Determine the direction of the uniform magnetic field.
mi: <strong>Into the page.</strong> **(1)**<br>The electrons travel to the right, so the conventional current is to the left; the beam is deflected downwards, so the thumb points down. Left hand, thumb down and second finger left, puts the first finger into the page.<br>Do not accept "downwards" on its own — that is the direction of the force, not the field.
@end
@part b | 2 | explain | self 2
ask: The current in the coils is now increased. State the effect this has on the path of the electron beam, and justify your answer.
mi: The beam is deflected <strong>more</strong> — it follows a more sharply curved path (a smaller radius) **(1)**.<br>A larger current in the coils produces a <strong>stronger magnetic field</strong>, so there is a larger force on each electron **(1)**.<br>The first mark requires a justification to be attempted. "The beam bends more" with no reason scores 1 only.
@end
@end

@q P1 | push | struct | 5
keyarea: Work done and kinetic energy in a linear accelerator
given: p1_pd_kv,p1_speed_disp
parent: SQA Higher Specimen Paper Q6(a) — the same drift-tube accelerator with the proton already moving at R, given a new supply voltage and a new entry speed, so neither published answer (5·6 × 10⁻¹⁵ J and 2·8 × 10⁶ m s⁻¹) is reproduced.
context: In a linear accelerator, protons are accelerated across the gap between two drift tubes by a potential difference of {p1_pd_kv} kV. A proton is already travelling at {p1_speed_disp} m s⁻¹ when it reaches R.
diagram: p1_linac
@part a | 2 | calc | auto 2
ask: Calculate the work done on the proton as it accelerates from R to S.
relationship: work
answer: p1_work
unit: J
mi: E<sub>w</sub> = QV **(1)**<br>= {e_charge_disp} × {p1_pd} = <strong>{p1_work_disp} J</strong> **(1)**
@end
@part b | 3 | calc | auto 2
ask: Determine the speed of the proton as it reaches S.
relationship: ek
answer: p1_speed_final
unit: m s⁻¹
mi: The proton arrives at R with kinetic energy already: E<sub>k</sub> = ½<var>m</var><var>v</var><sup>2</sup> = ½ × {m_proton_disp} × ({p1_speed_disp})<sup>2</sup> = {p1_ek0_disp} J **(1)**<br>The work done is added to it: {p1_ek0_disp} + {p1_work_disp} = {p1_ek1_disp} J **(1)**<br>{p1_ek1_disp} = ½ × {m_proton_disp} × <var>v</var><sup>2</sup>, so <var>v</var> = <strong>{p1_speed_final_disp} m s⁻¹</strong> **(1)**<br>A candidate who forgets the kinetic energy the proton already had gets {p1_wrong_disp} m s⁻¹ — the work done alone. That is the error this question is set to catch, so award the first two marks only if the addition is attempted.
@end
@end

@q P2 | push | open | 2 | self 2
keyarea: Reasoning about charge, work done and kinetic energy
parent: SQA Higher 2022 Paper 2 Q7(c) — the same "state the effect and justify it" demand about a change made to an accelerator, with the change made to the particle rather than to the apparatus, so the published "no effect" answer does not apply.
stem: The same linear accelerator is now used to accelerate alpha particles instead of protons, across the same gap and with the same accelerating potential difference. An alpha particle carries a charge of +2<var>e</var>.<br>State the effect this has on the kinetic energy gained by a particle crossing the gap, and justify your answer.
mi: The kinetic energy gained is <strong>doubled</strong> **(1)**.<br>All the work done on the particle becomes kinetic energy, and E<sub>w</sub> = QV. The potential difference is unchanged, but the charge on an alpha particle is <strong>twice</strong> the charge on a proton, so twice as much work is done on it **(1)**.<br>Award the first mark only if a justification is attempted. Do not accept a justification based on the mass of the alpha particle: mass changes the <em>speed</em> it reaches, not the kinetic energy it gains.
@end
