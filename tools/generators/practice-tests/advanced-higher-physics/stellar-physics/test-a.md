# Advanced Higher Physics · Stellar Physics — Practice Test A

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: stla
slug: stellar-physics-a
title: Stellar Physics · Practice Test A
short: Practice Test A
course: Advanced Higher Physics
audience: Advanced Higher (Rotational Motion and Astrophysics)
topic: Stellar Physics
marks: 25
minutes: 35
badge: ah-stellar-test-a
prefix: ahpt-stla-
hub: /classes/adv/practice-tests.html
@end

@values
c1_d: 5.3e18
c1_b: 8.5e-8
c1_r: 4.7e11
c2_t: 5340
c2_r: 5.52e8
c2_ly: 11.9
p1_t: 16000
p1_rsol: 0.01
p2_thot: 8500
p2_tcool: 3800
p3_sun: 5800
p3_vega: 9600
p3_wd: 16500
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: The proton–proton chain
parent: SQA Advanced Higher 2020 Q6(a) — "state the name given to the series of fusion reactions", set as multiple choice for a new star.
stem: Tau Ceti is a main-sequence star a little smaller than the Sun. In its core, hydrogen is converted to helium by a series of fusion reactions. What is this series of reactions called?
option: nuclear fission
option: the proton–proton chain
option: beta decay
option: the triple-alpha process
option: pair production
key: B
mi: <strong>The proton–proton chain</strong> (the p–p chain). Hydrogen nuclei fuse, step by step, to make helium-4.
wrong: Fission splits heavy nuclei. It does not power stars. The triple-alpha process fuses <em>helium</em> to carbon. That happens later, in a giant's core.
@end

@q W2 | warmup | mcq | 1 | auto 1
keyarea: Classifying stars from their position on the H-R diagram
parent: SQA Advanced Higher 2019 Q7(a)(i) — "state which of these stars is a red giant", with four new star positions on a redrawn H-R diagram.
stem: Four stars, A, B, C and D, are marked on the H-R diagram. Which star is a red giant?
diagram: w2_hr
option: Star A
option: Star B
option: Star C
option: Star D
key: C
mi: <strong>Star C.</strong> It is cool (about 4000 K, on the right) but very luminous (about 250 times the Sun). Cool and bright means it must be very large. That is a red giant.<br>A and D lie on the main sequence. B is hot but faint, so it is a white dwarf.
wrong: Star A is the most luminous, but it lies on the main sequence and is hot and blue-white. Giants sit <strong>above and to the right</strong> of the main sequence.
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: Leaving the main sequence
parent: SQA Advanced Higher 2019 Q7(a)(ii)(A) — the same demand, set as multiple choice.
stem: A star like the Sun spends most of its life on the main sequence. What change happens in its core at the point when it leaves the main sequence?
option: Hydrogen fusion in the core stops.
option: Helium fusion in the core stops.
option: Hydrogen fusion in the core speeds up.
option: Hydrogen nuclei in the core begin to split.
option: Iron fusion in the core begins.
key: A
mi: <strong>Hydrogen fusion in the core stops</strong>, because the hydrogen in the core runs out.
wrong: Helium fusion has not started yet at this point. It starts later, when the core has shrunk and heated up.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: Thermal pressure and gravity as a star becomes a red giant
parent: SQA Advanced Higher 2019 Q7(a)(ii)(B) — the same explanation, set as multiple choice.
stem: As a star like the Sun becomes a red giant, its diameter increases. Which statement explains this?
option: The outward thermal pressure is greater than the inward gravitational force.
option: The inward gravitational force is greater than the outward thermal pressure.
option: The thermal pressure and the gravitational force are balanced.
option: The star gains mass from the space around it.
option: Fusion stops everywhere in the star, so it cools and expands.
key: A
mi: <strong>Thermal pressure is greater than gravity.</strong> Hydrogen fuses in a shell around the core. This raises the outward pressure, so the outer layers are pushed out.<br>The mark needs a <strong>comparison</strong> of the two forces.
wrong: "Balanced" describes a main-sequence star. A balanced star stays the same size.
@end

@q W5 | warmup | mcq | 1 | auto 1
keyarea: What decides a star's fate
parent: SQA Advanced Higher 2019 Q7(c) — the same demand, set as multiple choice.
stem: Every main-sequence star ends as a white dwarf, a neutron star or a black hole. Which property of the star decides which one?
option: its surface temperature
option: its distance from Earth
option: its mass
option: its colour
option: its apparent brightness
key: C
mi: <strong>Its mass.</strong> Mass decides how long a star lives and how it ends.
wrong: Temperature and colour change during a star's life. The ending is already set by its mass. Distance and apparent brightness depend on where <em>we</em> are, not on the star.
@end

@q C1 | core | struct | 6
keyarea: Luminosity from apparent brightness and distance, then surface temperature
given: c1_d,c1_b,c1_r
parent: SQA Advanced Higher 2019 Q7(b)(i)–(ii) — the same two steps, luminosity from b and d and then temperature from L and r, for a new star with every number changed. The published answers are 7.5 × 10³¹ W and 3500 K; these are not.
context: Antares is a red supergiant in the constellation Scorpius. It is {c1_d_disp} m from Earth. Its apparent brightness is {c1_b_disp} W m⁻².
@part a | 3 | calc | auto 2
ask: Calculate the luminosity of Antares.
relationship: bright
answer: c1_L
unit: W
mi: <var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>) **(1)**<br>{c1_b_disp} = <var>L</var> / (4π × ({c1_d_disp})<sup>2</sup>) **(1)**<br><var>L</var> = <strong>{c1_lum_disp} W</strong> **(1)**
@end
@part b | 3 | calc | auto 2
ask: The radius of Antares is {c1_r_disp} m. Calculate the surface temperature of Antares.
relationship: lum
answer: c1_T
unit: K
mi: <var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup> **(1)**<br>{c1_lum_disp} = 4π × ({c1_r_disp})<sup>2</sup> × 5.67 × 10⁻⁸ × <var>T</var><sup>4</sup> **(1)**<br><var>T</var> = <strong>{c1_temp_disp} K</strong> **(1)**<br>Or consistent with your answer to (a).
@end
@end

@q C2 | core | struct | 7
keyarea: Luminosity from radius and temperature, then apparent brightness over a distance in light-years
given: c2_t,c2_r,c2_ly
parent: SQA Advanced Higher 2020 Q6(b)(i)–(ii) — the same two steps for a new Sun-like star, with every number changed. The published answers are 6.74 × 10²⁶ W and 2.37 × 10⁻¹¹ W m⁻²; these are not.
context: Tau Ceti is a Sun-like star. Its surface temperature is {c2_t} K and its radius is {c2_r_disp} m.
@part a | 3 | calc | auto 2
ask: Calculate the luminosity of Tau Ceti.
relationship: lum
answer: c2_L
unit: W
mi: <var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup> **(1)**<br><var>L</var> = 4π × ({c2_r_disp})<sup>2</sup> × 5.67 × 10⁻⁸ × {c2_t}<sup>4</sup> **(1)**<br><var>L</var> = <strong>{c2_lum_disp} W</strong> **(1)**
@end
@part b | 4 | calc | auto 2
ask: Tau Ceti is {c2_ly} light-years from Earth. Determine the apparent brightness of Tau Ceti seen from Earth.
relationship: bright
answer: c2_b
unit: W m⁻²
mi: <var>d</var> = {c2_ly} × 365.25 × 24 × 60 × 60 × 3.00 × 10⁸ = {c2_d_disp} m **(1)** — this mark stands on its own.<br><var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>) **(1)**<br><var>b</var> = {c2_lum_disp} / (4π × ({c2_d_disp})<sup>2</sup>) **(1)**<br><var>b</var> = <strong>{c2_b_disp} W m⁻²</strong> **(1)**<br>Using 365 days is accepted. Or consistent with your answer to (a).
@end
@end

@q P1 | push | struct | 2
keyarea: Using the H-R diagram to find a star's type and radius
parent: ORIGINAL — written for this site from the course specification's "use of H-R diagrams to determine stellar properties". It reads the constant-radius lines, which no past paper has asked a candidate to do directly.
context: Star X is marked on the H-R diagram. The dashed lines join stars that have the same radius.
diagram: p1_hr
@part a | 1 | explain | self 1
ask: State the type of star X.
mi: <strong>White dwarf</strong> **(1)**. It is hot (about {p1_t} K) but very faint.
@end
@part b | 1 | explain | self 1
ask: Use the diagram to estimate the radius of star X, in solar radii.
mi: <strong>10⁻² solar radii</strong> (about 0.01 of the Sun's radius) **(1)**. Star X sits on the 10⁻² solar radii line.<br>Accept any value between 5 × 10⁻³ and 2 × 10⁻² solar radii.
@end
@end

@q P2 | push | struct | 2
keyarea: Comparing the radii of two stars from luminosity and temperature
parent: SQA Advanced Higher 2025 Q5(b)(ii) — the same "greater than, less than or equal to, and justify" demand, for a new pair of supergiants. The published pair was Betelgeuse and Rigel.
context: Deneb and Mu Cephei are both supergiants. Their luminosities are about the same. Deneb has a surface temperature of {p2_thot_disp} K. Mu Cephei has a surface temperature of {p2_tcool_disp} K.
@part _ | 2 | explain | self 2
ask: State whether the radius of Mu Cephei is greater than, less than or equal to the radius of Deneb. Justify your answer.
mi: <strong>Greater than</strong> **(1)**.<br>The luminosities are about the same, and <var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup>. Mu Cephei has the lower surface temperature, so it needs a larger radius to give out the same power **(1)**.<br>The justification must use <var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup> (or <var>L</var> ∝ <var>r</var><sup>2</sup><var>T</var><sup>4</sup>). Using <var>P</var>/<var>A</var> = <var>σT</var><sup>4</sup> alone is not enough.
@end
@end

@q P3 | push | struct | 3
keyarea: Matching black-body spectra to stars by peak wavelength
parent: SQA Advanced Higher 2025 Q5(c) — the same four-spectra table, for four new stars with their temperatures given. The published stars were Betelgeuse, Rigel, Sirius B and the Sun.
context: A star's spectrum can be approximated as a black-body spectrum. The surface temperatures of four stars are: the Sun, {p3_sun} K; Vega, {p3_vega} K; 40 Eridani B, {p3_wd_disp} K; Mu Cephei, {p2_tcool_disp} K. The black-body spectra of the four stars are shown below.
diagram: p3_spectra
@part _ | 3 | explain | self 3
ask: By considering the peak wavelength of each spectrum, match each star to its spectrum. Write each star and its spectrum letter in your jotter.
mi: {p3_key} **(3)**<br>The hotter the star, the <strong>shorter</strong> the peak wavelength. So the hottest star has its peak furthest to the left.<br>All four correct: 3 marks. Two or three correct: 2 marks. One correct: 1 mark.
@end
@end
