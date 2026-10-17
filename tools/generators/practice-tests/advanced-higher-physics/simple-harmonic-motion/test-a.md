# Advanced Higher Physics · Simple Harmonic Motion — Practice Test A

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: shma
slug: shm-simple-harmonic-motion-a
title: Simple Harmonic Motion · Practice Test A
short: Practice Test A
course: Advanced Higher Physics
audience: Advanced Higher (Quanta and Waves)
topic: Simple Harmonic Motion
marks: 25
minutes: 35
badge: ah-shm-test-a
prefix: ahpt-shma-
hub: /classes/adv/practice-tests.html
@end

@values
g: 9.8
w2_period: 0.24
c1_mass: 2.4
c1_osc: 20
c1_time: 17.0
c1_amp: 0.055
c2_mass: 4.8
c2_omega: 2.6
c2_amp: 0.14
p2_amp: 0.018
p2_omega: 9.4
p2_disp: 0.011
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: The definition of simple harmonic motion
parent: SQA Advanced Higher 2020 Q9(a) — the definition question, which the marking instructions state word for word and which has been asked in 2016, 2020, 2022 and 2023. Set here as a statement-selection question rather than a written mark, with the 2020 "do not accept" caveat built into the distractors.
stem: A pupil makes the following statements about a body moving with simple harmonic motion.<ol class="stmts"><li>The unbalanced force on the body is proportional to its displacement from the rest position.</li><li>The unbalanced force on the body acts in the opposite direction to its displacement.</li><li>The acceleration of the body is constant.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: II and III only
option: I, II and III
key: C
mi: Statements I and II together are the definition as it is marked: the unbalanced force, and therefore the acceleration, is <strong>proportional to the displacement</strong> and acts <strong>in the opposite direction</strong> to it — <var>F</var> = −<var>ky</var>.<br>Statement III is wrong: the acceleration is largest at maximum displacement and zero as the body passes through the rest position, so it is never constant.
wrong: Choosing "I only" is exactly what the 2020 marking instructions refuse — they will not accept "force is proportional to displacement" without reference to direction. The minus sign in <var>F</var> = −<var>ky</var> <em>is</em> the direction, so it has to be said.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: Angular frequency from the period
parent: SQA Advanced Higher 2023 Q10(b)(i) — the same single-step route to ω, given the period rather than the frequency and set as multiple choice. The published answer is 346 rad s⁻¹; this one is not.
stem: A body oscillates with simple harmonic motion. The period of its motion is {w2_period} s. The angular frequency of the motion is
options_from: w2
key: computed
mi: <var>f</var> = 1 / <var>T</var> = 1 / {w2_period} = {w2_freq} Hz, so <var>ω</var> = 2π<var>f</var> = <strong>{w2_omega} rad s⁻¹</strong>.<br>Reaching for <var>ω</var> = 2π / <var>T</var> in one step is the same arithmetic and is just as acceptable.
wrong: {w2_freq} rad s⁻¹ is the frequency, not the angular frequency — the 2π has been left out. {w2_half} rad s⁻¹ comes from π / <var>T</var>, and {w2_inv} rad s⁻¹ from 2π<var>T</var>, which multiplies where it should divide.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Recognising underdamping, critical damping and overdamping
parent: SQA Advanced Higher 2023 Q10(f) and 2024 Q9(c)(i) — the same demand about damping traces, with the sketch reversed: the candidate reads four graphs and picks the one the question describes, rather than drawing it.
diagram: w3_damping
stem: A system is displaced from its rest position and released. Which graph shows the displacement of a <strong>critically damped</strong> system varying with time?
option: Graph A
option: Graph B
option: Graph C
option: Graph D
key: C
mi: <strong>C.</strong> Critical damping returns the system to the rest position in the <strong>shortest time without oscillating</strong> — the line falls to zero and stays there, without crossing the axis.<br>A is underdamped: it oscillates with a decreasing amplitude. B is overdamped: it also never crosses the axis, but takes noticeably longer to settle. D is undamped SHM, whose amplitude never decreases.
wrong: B is the answer most often chosen. Both B and C return without oscillating; the difference is <strong>how long it takes</strong>, and the critically damped one is always the quicker of the two.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Where displacement, velocity and acceleration are greatest in SHM
parent: ORIGINAL — written for this programme from the deck's displacement, velocity and acceleration slide, in the standard SQA statement form.
stem: A body oscillates with simple harmonic motion between displacements +<var>A</var> and −<var>A</var>. A pupil makes the following statements about the motion.<ol class="stmts"><li>The speed of the body is greatest as it passes through the rest position.</li><li>The magnitude of the acceleration of the body is greatest at <var>y</var> = ±<var>A</var>.</li><li>The velocity and the acceleration reach their maximum values at the same instant.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: II and III only
option: I, II and III
key: C
mi: I and II are both right, and they are the two ends of the same idea: <var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>) is largest when <var>y</var> = 0, and <var>a</var> = −<var>ω</var><sup>2</sup><var>y</var> is largest in magnitude when <var>y</var> = ±<var>A</var>.<br>III is therefore wrong: the speed peaks where the acceleration is <strong>zero</strong>, a quarter of a period apart.
wrong: Choosing "I, II and III" usually means the velocity–time and acceleration–time graphs have been remembered as being in step. Sketch them under one another: <var>v</var> leads <var>y</var> by a quarter period, and <var>a</var> is a further quarter period on.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: How the angular frequency of a mass–spring system depends on the mass
parent: SQA Advanced Higher 2024 Q9(b)(iii) — the same "state and justify how ω changes" demand, with the change made to the mass rather than to the spring constant, and set as multiple choice.
stem: A mass hanging on a spring oscillates with angular frequency <var>ω</var>. The mass is now replaced by one of <strong>four times</strong> the original mass, on the same spring. The angular frequency of the new oscillation is
option: <var>ω</var> / 4
option: <var>ω</var> / 2
option: <var>ω</var>
option: 2<var>ω</var>
option: 4<var>ω</var>
key: B
mi: <strong><var>ω</var> / 2.</strong> For a mass on a spring <var>ω</var> = √(<var>k</var> / <var>m</var>), so <var>ω</var> ∝ 1 / √<var>m</var>. Four times the mass divides the angular frequency by √4 = 2.<br>The spring is unchanged, so <var>k</var> is unchanged — the amplitude has no effect on <var>ω</var> either.
wrong: "<var>ω</var> / 4" treats <var>ω</var> as inversely proportional to the mass itself and forgets the square root. "<var>ω</var>" unchanged is the answer to the 2024 question about amplitude, not about mass.
@end

@q C1 | core | struct | 7
keyarea: The cosine solution, angular frequency and maximum speed of a mass on a spring
given: c1_time,c1_amp
parent: SQA Advanced Higher 2016 Q10 — the same apparatus and the same three demands (show the cosine expression is a solution, find ω from a count of oscillations, find the maximum velocity), on a new context and with every number changed. The published answers are 5.2 rad s⁻¹ and 0.21 m s⁻¹; these are not.
context: A hanging basket is suspended from a spring bracket outside a shop. The basket has a mass of {c1_mass} kg. It is pulled down {c1_amp} m from its equilibrium position and released, and then oscillates vertically. The basket completes {c1_osc} oscillations in {c1_time} s. Frictional forces are negligible.
diagram: c1_basket
@part a | 3 | derive | self 3
ask: The vertical displacement <var>y</var> of the basket can be described by the expression <var>y</var> = <var>A</var> cos <var>ωt</var>, where the symbols have their usual meaning. Using calculus methods, show that this expression is a solution to the equation d<sup>2</sup><var>y</var>/d<var>t</var><sup>2</sup> + <var>ω</var><sup>2</sup><var>y</var> = 0.
mi: <ol class="deriv"><li><var>y</var> = <var>A</var> cos <var>ωt</var> — the given displacement.</li><li>d<var>y</var>/d<var>t</var> = −<var>Aω</var> sin <var>ωt</var> — differentiate once. **(1)**</li><li>d<sup>2</sup><var>y</var>/d<var>t</var><sup>2</sup> = −<var>Aω</var><sup>2</sup> cos <var>ωt</var> — differentiate again. **(1)**</li><li><var>A</var> cos <var>ωt</var> is <var>y</var>, so d<sup>2</sup><var>y</var>/d<var>t</var><sup>2</sup> = −<var>ω</var><sup>2</sup><var>y</var> — substitute <var>y</var> back in.</li><li>d<sup>2</sup><var>y</var>/d<var>t</var><sup>2</sup> + <var>ω</var><sup>2</sup><var>y</var> = 0 — the line the question asked for. **(1)**</li></ol>Both differentiations must appear, and both must be right, or the first mark is lost — the 2016 marking instructions award zero if sin appears in the first derivative. **The final line must be written down**, or the scheme caps this at 2 of 3.
@end
@part b | 2 | calc | auto 2
ask: Calculate the angular frequency of the oscillation of the basket.
relationship: omega
answer: c1_omega
unit: rad s⁻¹
mi: <var>f</var> = {c1_osc} / {c1_time} = {c1_freq} Hz **(1)**<br><var>ω</var> = 2π<var>f</var> = <strong>{c1_omega_disp} rad s⁻¹</strong> **(1)**<br><var>T</var> = {c1_time} / {c1_osc} = {c1_period} s followed by <var>ω</var> = 2π / <var>T</var> is the same two marks. A count of oscillations is exact, so it is the time that fixes the significant figures.
@end
@part c | 2 | calc | auto 2
ask: Calculate the maximum speed of the basket during its oscillation.
relationship: vel
answer: c1_vmax
unit: m s⁻¹
mi: <var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>), and the speed is greatest at <var>y</var> = 0 **(1)**<br><var>v</var> = {c1_omega_disp} × {c1_amp} = <strong>{c1_vmax_disp} m s⁻¹</strong> **(1)**<br><var>v</var><sub>max</sub> = <var>ωA</var> quoted directly is accepted as the starting point.
@end
@end

@q C2 | core | struct | 6
keyarea: Energy stored in an oscillating system, and identifying the damping
given: c2_mass,c2_omega,c2_amp
parent: SQA Advanced Higher 2020 Q9(c)(iii) and 2024 Q9(c)(i)–(ii) — the energy calculation from the first, the damping trace and the change asked for from the second, both on a new context and with every number changed. The published answers are 1.3 × 10⁴ J and "underdamping"; the energy here is not, and the damping question now asks for a change that would reach the rest position fastest.
context: A tall building is protected from swaying by a tuned mass damper — a heavy block hung from springs near the top of the building, free to oscillate. A working model of one is built in a laboratory. The block of the model has a mass of {c2_mass} kg, its oscillation has an angular frequency of {c2_omega} rad s⁻¹, and it is released from an amplitude of {c2_amp} m.
@part a | 3 | calc | auto 2
ask: Calculate the maximum potential energy stored in the springs of the model.
relationship: ep
answer: c2_ep
unit: J
mi: <var>E</var><sub>p</sub> = ½<var>mω</var><sup>2</sup><var>y</var><sup>2</sup>, and the potential energy is greatest at <var>y</var> = <var>A</var> **(1)**<br>= ½ × {c2_mass} × {c2_omega}<sup>2</sup> × {c2_amp}<sup>2</sup> **(1)**<br>= <strong>{c2_ep_disp} J</strong> **(1)**<br>Working from the other end — the maximum kinetic energy, ½<var>mω</var><sup>2</sup>(<var>A</var><sup>2</sup> − 0) at <var>y</var> = 0 — gives the same number, because the total energy is constant.
@end
@part b | 1 | explain | self 1
ask: The model is displaced and released, and its motion is recorded. State the type of damping shown in the graph.
diagram: c2_trace
mi: <strong>Underdamping</strong> (underdamped). **(1)**<br>The block oscillates about the rest position several times, and the amplitude of each swing is smaller than the last.<br>"Damped" on its own does not earn the mark — the question asks which type.
@end
@part c | 2 | explain | self 2
ask: The model should return to its rest position in the shortest possible time, without oscillating. State the type of damping needed, and suggest one change to the model that would achieve it.
mi: <strong>Critical damping</strong> **(1)**, which returns the system to rest in the shortest time without oscillating.<br>Any change that <strong>increases the resistive force</strong> on the block earns the second mark **(1)** — for example fitting a piston-and-oil damper between the block and the frame, immersing the block in a more viscous liquid, or attaching a card to increase its surface area.<br>"Increase the damping" on its own is not enough: the 2024 marking instructions want the physical change named, not the effect restated.
@end
@end

@q P1 | push | struct | 4
keyarea: Deriving the velocity of a body moving with SHM
parent: ORIGINAL — the course specification's "I can derive v = ±ω√(A² − y²)" is examinable but has not been set in the nine diets from 2016 to 2025, so there is no parent to vary. The statement in part (b) is the deck's own check-yourself point.
context: A body oscillates with simple harmonic motion of amplitude <var>A</var> and angular frequency <var>ω</var>. Its displacement at time <var>t</var> is <var>y</var> = <var>A</var> sin <var>ωt</var>.
@part a | 3 | derive | self 3
ask: Using calculus methods, derive the relationship <var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>).
mi: <ol class="deriv"><li><var>y</var> = <var>A</var> sin <var>ωt</var> — the given displacement.</li><li><var>v</var> = d<var>y</var>/d<var>t</var> = <var>Aω</var> cos <var>ωt</var> — differentiate once. **(1)**</li><li>cos<sup>2</sup><var>ωt</var> + sin<sup>2</sup><var>ωt</var> = 1, so cos <var>ωt</var> = ±√(1 − sin<sup>2</sup><var>ωt</var>) — the identity that removes the cosine. **(1)**</li><li>sin <var>ωt</var> = <var>y</var> / <var>A</var>, so <var>v</var> = ±<var>Aω</var>√(1 − <var>y</var><sup>2</sup>/<var>A</var><sup>2</sup>).</li><li>Taking the <var>A</var> inside the root: <var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>). **(1)**</li></ol>The ± is part of the relationship and part of the final mark: the body passes every displacement twice each cycle, once in each direction. Starting from <var>y</var> = <var>A</var> cos <var>ωt</var> instead is equally acceptable and earns the same three marks.
@end
@part b | 1 | explain | self 1
ask: State the displacement at which the speed of the body is greatest, and the speed it reaches there.
mi: At <var>y</var> = <strong>0</strong>, the rest position, where the speed is <var>v</var> = <strong><var>ωA</var></strong>. **(1)**<br>Both halves are needed for the mark. Substituting <var>y</var> = 0 into the relationship just derived is the quickest justification.
@end
@end

@q P2 | push | struct | 3
keyarea: Reading amplitude and angular frequency from an equation of motion, and the speed at a given displacement
given: p2_amp,p2_omega,p2_disp
parent: SQA Advanced Higher 2025 Q9(b)(iii) — the same "a displacement equation is given, find a velocity" demand, on an unfamiliar context, with the speed wanted at a stated displacement rather than at its maximum. The published answer is 0.73 m s⁻¹; this one is not.
context: As people walk across it, the deck of a footbridge oscillates vertically. The motion of the middle of the deck can be modelled as simple harmonic motion. Its vertical displacement, in metres, at time <var>t</var> seconds is given by <var>y</var> = {p2_amp} sin {p2_omega}<var>t</var>.
diagram: p2_bridge
@part a | 3 | calc | auto 2
ask: Determine the speed of the middle of the deck at the instant its displacement from the rest position is {p2_disp} m.
relationship: vel
answer: p2_speed
unit: m s⁻¹
mi: Comparing <var>y</var> = {p2_amp} sin {p2_omega}<var>t</var> with <var>y</var> = <var>A</var> sin <var>ωt</var> gives <var>A</var> = {p2_amp} m and <var>ω</var> = {p2_omega} rad s⁻¹ **(1)**<br><var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>) = ±{p2_omega}√({p2_amp}<sup>2</sup> − {p2_disp}<sup>2</sup>) **(1)**<br>= <strong>{p2_speed_disp} m s⁻¹</strong> **(1)**<br>The ± is not wrong here — the deck passes this displacement moving upwards and moving downwards — but a speed is asked for, so the magnitude alone is enough.<br>A candidate who reads the amplitude as {p2_omega} m and the angular frequency as {p2_amp} rad s⁻¹ has the two the wrong way round; the number multiplying <var>t</var> is always <var>ω</var>.
@end
@end
