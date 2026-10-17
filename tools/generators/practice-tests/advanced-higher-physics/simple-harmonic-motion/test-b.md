# Advanced Higher Physics · Simple Harmonic Motion — Practice Test B

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: shmb
slug: shm-simple-harmonic-motion-b
title: Simple Harmonic Motion · Practice Test B
short: Practice Test B
course: Advanced Higher Physics
audience: Advanced Higher (Quanta and Waves)
topic: Simple Harmonic Motion
marks: 25
minutes: 35
badge: ah-shm-test-b
prefix: ahpt-shmb-
hub: /classes/adv/practice-tests.html
@end

@values
g: 9.8
w2_omega: 12
c1_mass: 18
c1_period: 0.65
c1_amp: 0.035
c2_mass: 32
c2_omega: 6.2
c2_amp: 0.18
p2_amp: 0.19
p2_omega: 7.8
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: The definition of simple harmonic motion
parent: SQA Advanced Higher 2022 Q10(a) — the definition question as the 2022 marking instructions state it, set as a statement-selection question with a different set of statements from Test A's.
stem: A pupil makes the following statements about simple harmonic motion.<ol class="stmts"><li>The acceleration of the body is directly proportional to its displacement from the rest position.</li><li>The acceleration of the body is always directed towards the rest position.</li><li>The body moves with a constant speed.</li></ol>Which of these statements is/are correct?
option: I only
option: II only
option: I and II only
option: I and III only
option: I, II and III
key: C
mi: I and II together are the definition as it is marked — <var>a</var> = −<var>ω</var><sup>2</sup><var>y</var> says both things at once: the size of the acceleration is proportional to the displacement, and the minus sign puts it in the opposite direction, back towards the rest position.<br>III is wrong: the speed changes constantly, from <var>ωA</var> at the rest position to zero at each end of the motion.
wrong: "I only" is the answer the marking instructions specifically refuse — proportionality without direction. "I, II and III" adds the constant-speed misconception, which would make the acceleration zero everywhere.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: The period of an oscillation from its angular frequency
parent: SQA Advanced Higher 2025 Q9(b)(ii) — the same single step from angular frequency to period, with a new value and set as multiple choice. The published answer is 2.9 s; this one is not.
stem: A body oscillates with simple harmonic motion. The angular frequency of the motion is {w2_omega} rad s⁻¹. The period of the motion is
options_from: w2
key: computed
mi: <var>ω</var> = 2π / <var>T</var>, so <var>T</var> = 2π / <var>ω</var> = 2π / {w2_omega} = <strong>{w2_period} s</strong>.
wrong: {w2_inv} s is 1 / <var>ω</var> — the frequency route, with the 2π left out. {w2_mult} s multiplies by 2π instead of dividing. {w2_freq} s is the frequency in hertz, not the period.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: How the kinetic energy of an oscillating body varies with displacement
parent: ORIGINAL — written for this programme from the deck's energy-against-displacement slide. The energy graphs the diets ask for are drawn, not chosen, and the one that was drawn (2019) is worked in class.
diagram: w3_energy
stem: A body oscillates with simple harmonic motion of amplitude <var>A</var>. Which graph shows how the <strong>kinetic energy</strong> of the body varies with its displacement <var>y</var>?
option: Graph A
option: Graph B
option: Graph C
option: Graph D
key: B
mi: <strong>B.</strong> <var>E</var><sub>k</sub> = ½<var>mω</var><sup>2</sup>(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>) is a parabola opening <em>downwards</em>: largest at the rest position, <var>y</var> = 0, and zero at <var>y</var> = ±<var>A</var>, where the body is momentarily at rest.
wrong: A is the <strong>potential</strong> energy, ½<var>mω</var><sup>2</sup><var>y</var><sup>2</sup> — the same shape the other way up. The two add to the constant total energy, which is graph D.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Choosing between the sine and cosine models of SHM
parent: SQA Advanced Higher 2017 Q8(a) — the same demand about why a student's model is wrong for a mass released from its maximum displacement, set as a statement-selection question rather than a written explanation.
stem: A mass on a spring is pulled down to its maximum displacement and released from rest at time <var>t</var> = 0. A pupil models its displacement as <var>y</var> = <var>A</var> sin <var>ωt</var>. A second pupil makes the following statements.<ol class="stmts"><li>The model is wrong, because it gives <var>y</var> = 0 at <var>t</var> = 0.</li><li><var>y</var> = <var>A</var> cos <var>ωt</var> is the correct model for this release.</li><li>Both models give the same period.</li></ol>Which of these statements is/are correct?
option: I only
option: I and II only
option: I and III only
option: II and III only
option: I, II and III
key: E
mi: All three are correct. At <var>t</var> = 0, sin 0 = 0, so the sine model starts the mass at the rest position — but it was released from <var>y</var> = <var>A</var> **(I)**. cos 0 = 1, so the cosine model starts it at the amplitude **(II)**. Both are the same oscillation started at different points, so <var>ω</var>, and therefore <var>T</var> = 2π / <var>ω</var>, is unchanged **(III)**.
wrong: Leaving III out treats the sine and cosine solutions as different motions. They are the same motion timed from different instants — which is exactly why either may be quoted from the relationships sheet.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: Hooke's law and the compression of a spring
parent: SQA Advanced Higher 2024 Q9(a) — the same spring-and-block compression, asked as a proportionality rather than as a calculation, so no published value is reproduced.
stem: A block of mass <var>m</var> rests on a spring of spring constant <var>k</var>, compressing it by a distance Δ<var>y</var>. The block is replaced by one of <strong>three times</strong> the mass, on the same spring. The new compression is
option: Δ<var>y</var> / 3
option: Δ<var>y</var>
option: √3 Δ<var>y</var>
option: 3Δ<var>y</var>
option: 9Δ<var>y</var>
key: D
mi: <strong>3Δ<var>y</var>.</strong> At rest the spring force balances the weight: <var>k</var>Δ<var>y</var> = <var>mg</var>, so Δ<var>y</var> = <var>mg</var> / <var>k</var>. The compression is <strong>directly</strong> proportional to the mass, and the spring is unchanged, so three times the mass compresses it three times as far.
wrong: √3 Δ<var>y</var> is the square-root reasoning that belongs to the angular frequency, <var>ω</var> = √(<var>k</var>/<var>m</var>) — not to a static compression. Nothing here is oscillating yet.
@end

@q C1 | core | struct | 7
keyarea: The sine solution, the spring constant and the maximum speed of a machine on springs
given: c1_mass,c1_period,c1_amp
parent: SQA Advanced Higher 2020 Q9(b) for the derivation, 2017 Q8(b)(ii) for the spring constant and 2020 Q9(c)(ii) for the speed — three demands Test A does not use, on a new context and with every number changed. The published answers are 31 N m⁻¹ and 13 m; these are not.
context: A machine that fills bags of flour is mounted on springs so that its vibration is not passed into the floor. The machine has a mass of {c1_mass} kg. When it is running it oscillates vertically with simple harmonic motion of period {c1_period} s and amplitude {c1_amp} m. For a mass on springs, <var>ω</var> = √(<var>k</var> / <var>m</var>), where <var>k</var> is the combined spring constant of the mounting.
diagram: c1_machine
@part a | 3 | derive | self 3
ask: The vertical displacement <var>y</var> of the machine can be described by the expression <var>y</var> = <var>A</var> sin <var>ωt</var>, where the symbols have their usual meaning. Show that this expression is a solution to the relationship <var>F</var> = −<var>mω</var><sup>2</sup><var>y</var>.
mi: <ol class="deriv"><li><var>y</var> = <var>A</var> sin <var>ωt</var> — the given displacement.</li><li><var>v</var> = d<var>y</var>/d<var>t</var> = <var>Aω</var> cos <var>ωt</var> — differentiate once. **(1)**</li><li><var>a</var> = d<sup>2</sup><var>y</var>/d<var>t</var><sup>2</sup> = −<var>Aω</var><sup>2</sup> sin <var>ωt</var> — differentiate again. **(1)**</li><li><var>F</var> = <var>ma</var> = −<var>mAω</var><sup>2</sup> sin <var>ωt</var> — Newton's second law.</li><li><var>A</var> sin <var>ωt</var> is <var>y</var>, so <var>F</var> = −<var>mω</var><sup>2</sup><var>y</var> — the line the question asked for. **(1)**</li></ol>Both differentiations must appear and both must be right, or the first mark is lost. **The final relationship must be written down**, or the 2020 scheme caps this at 2 of 3.
@end
@part b | 2 | calc | auto 2
ask: Determine the combined spring constant of the mounting.
relationship: spring
answer: c1_k
unit: N m⁻¹
mi: <var>ω</var> = 2π / <var>T</var> = 2π / {c1_period} = {c1_omega_disp} rad s⁻¹ **(1)**<br>Rearranging <var>ω</var> = √(<var>k</var> / <var>m</var>) gives <var>k</var> = <var>mω</var><sup>2</sup> = {c1_mass} × {c1_omega_disp}<sup>2</sup> = <strong>{c1_k_disp} N m⁻¹</strong> **(1)**<br>Reaching <var>k</var> = 4π<sup>2</sup><var>m</var> / <var>T</var><sup>2</sup> in one step is the same two marks.
@end
@part c | 2 | calc | auto 2
ask: Calculate the maximum speed of the machine as it oscillates.
relationship: vel
answer: c1_vmax
unit: m s⁻¹
mi: <var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>), and the speed is greatest at <var>y</var> = 0 **(1)**<br><var>v</var> = {c1_omega_disp} × {c1_amp} = <strong>{c1_vmax_disp} m s⁻¹</strong> **(1)**<br><var>v</var><sub>max</sub> = <var>ωA</var> quoted directly is accepted as the starting point.
@end
@end

@q C2 | core | struct | 6
keyarea: Kinetic energy part-way through an oscillation, and the acceleration of an oscillating body
given: c2_mass,c2_omega,c2_amp
parent: ORIGINAL for the energy calculation — the diets ask for the maximum kinetic energy, and the one that does (2019) is worked in class, so this asks for it at a stated displacement instead. Parts (b) and (c) follow SQA Advanced Higher 2022 Q10(c)(ii) and (c)(iii), on a new context and with every number changed; the published answer is 1.2 m s⁻², and this one is not.
context: A child bounces on a pogo stick. Once the bouncing is steady the motion of the child can be modelled as simple harmonic motion. The child has a mass of {c2_mass} kg, the angular frequency of the motion is {c2_omega} rad s⁻¹, and the amplitude of the motion is {c2_amp} m.
@part a | 3 | calc | auto 2
ask: Calculate the kinetic energy of the child at the instant the displacement is half the amplitude.
relationship: ek
answer: c2_ek
unit: J
mi: <var>E</var><sub>k</sub> = ½<var>mω</var><sup>2</sup>(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>), with <var>y</var> = <var>A</var> / 2 = {c2_half} m **(1)**<br>= ½ × {c2_mass} × {c2_omega}<sup>2</sup> × ({c2_amp}<sup>2</sup> − {c2_half}<sup>2</sup>) **(1)**<br>= <strong>{c2_ek_disp} J</strong> **(1)**<br>A candidate who uses <var>y</var> = {c2_amp} m — the amplitude rather than half of it — gets zero, because the body is momentarily at rest there. One who forgets to halve the amplitude in the bracket and works out the <em>maximum</em> kinetic energy gets {c2_ekmax_disp} J.
@end
@part b | 2 | calc | auto 2
ask: Calculate the maximum acceleration of the child during the motion.
relationship: accel
answer: c2_amax
unit: m s⁻²
mi: <var>a</var> = −<var>ω</var><sup>2</sup><var>y</var>, and the acceleration is greatest in magnitude at <var>y</var> = <var>A</var> **(1)**<br><var>a</var> = {c2_omega}<sup>2</sup> × {c2_amp} = <strong>{c2_amax_disp} m s⁻²</strong> **(1)**<br>The minus sign is a direction, not part of the size: an answer of −{c2_amax_disp} m s⁻² is accepted.
@end
@part c | 1 | explain | self 1
ask: The child is at the top of the bounce, at maximum displacement, at time <var>t</var> = 0. Which graph shows how the acceleration of the child varies with time over the first full oscillation?
diagram: c2_accel
mi: <strong>A.</strong> **(1)**<br>At <var>t</var> = 0 the displacement is at its maximum <em>positive</em> value, so <var>a</var> = −<var>ω</var><sup>2</sup><var>y</var> is at its maximum <em>negative</em> value — the graph starts at the bottom. It is a negative cosine, exactly out of step with the displacement.<br>B is the displacement graph, not the acceleration. C and D start at zero, which is where the body would be if it had been released from the rest position instead.
@end
@end

@q P1 | push | struct | 4
keyarea: Deriving the angular frequency of a mass on a spring
parent: SQA Advanced Higher 2024 Q9(b)(i) for the derivation, and 2020 Q9(e) for the statement in part (b) — neither is used in Test A, and both are asked here about a change Test A does not make.
context: A mass <var>m</var> hangs on a spring of spring constant <var>k</var> and is set oscillating with simple harmonic motion. Hooke's law gives the restoring force on the mass as <var>F</var> = −<var>ky</var>.
@part a | 3 | derive | self 3
ask: Using <var>F</var> = −<var>ky</var> and <var>F</var> = <var>ma</var>, derive the relationship <var>ω</var> = √(<var>k</var> / <var>m</var>).
mi: <ol class="deriv"><li><var>F</var> = −<var>ky</var> and <var>F</var> = <var>ma</var> — the two expressions for the same single force. **(1)**</li><li>−<var>ky</var> = <var>ma</var> — equate them. **(1)**</li><li>For SHM, <var>a</var> = −<var>ω</var><sup>2</sup><var>y</var>, so −<var>ky</var> = −<var>mω</var><sup>2</sup><var>y</var>.</li><li><var>k</var> = <var>mω</var><sup>2</sup>, so <var>ω</var> = √(<var>k</var> / <var>m</var>) — the line the question asked for. **(1)**</li></ol>The 2024 scheme gives one mark for both force relationships, one for equating them, and one for substituting <var>a</var> = −<var>ω</var><sup>2</sup><var>y</var> and reaching the final line. The final line must appear, or it caps at 2 of 3.
@end
@part b | 1 | explain | self 1
ask: The same mass and spring are now set oscillating with a larger amplitude. State the effect this has on the angular frequency of the oscillation.
mi: <strong>No effect</strong> — the angular frequency is unchanged. **(1)**<br><var>ω</var> = √(<var>k</var> / <var>m</var>) depends only on the spring constant and the mass, and neither has changed. The amplitude does not appear in it.<br>This is the 2020 marking instruction's own reasoning: "<var>ω</var> depends on mass and spring constant only".
@end
@end

@q P2 | push | struct | 3
keyarea: Reading an equation of motion, and the time to reach maximum displacement
given: p2_amp,p2_omega
parent: SQA Advanced Higher 2025 Q9(b)(ii) — the same period-from-an-equation demand, on an unfamiliar context and taken one step further: the time asked for is a quarter of a period, not the period itself. The published answer is 2.9 s; this one is not.
context: A diver stands on the free end of a springboard and bounces on the spot. The vertical displacement of the free end, in metres, at time <var>t</var> seconds is given by <var>y</var> = {p2_amp} sin {p2_omega}<var>t</var>.
diagram: p2_board
@part a | 3 | calc | auto 2
ask: Determine the time taken for the free end of the board to travel from its rest position to its maximum displacement.
relationship: period_omega
answer: p2_quarter
unit: s
mi: Comparing <var>y</var> = {p2_amp} sin {p2_omega}<var>t</var> with <var>y</var> = <var>A</var> sin <var>ωt</var> gives <var>ω</var> = {p2_omega} rad s⁻¹, so <var>T</var> = 2π / <var>ω</var> = {p2_period_disp} s **(1)**<br>The board goes from the rest position to maximum displacement in a <strong>quarter</strong> of a period **(1)**<br><var>t</var> = {p2_period_disp} / 4 = <strong>{p2_quarter_disp} s</strong> **(1)**<br>Sketching one cycle of the sine curve is the quickest way to see the quarter: rest position → maximum → rest position → minimum → rest position, four equal steps.
wrong: {p2_period_disp} s is the full period — the answer to the question the 2025 paper asked, not to this one. Half of it, {p2_half_disp} s, is the time from one extreme to the other.
@end
@end
