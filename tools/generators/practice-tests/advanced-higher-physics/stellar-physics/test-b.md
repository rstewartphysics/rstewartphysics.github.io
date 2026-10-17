# Advanced Higher Physics · Stellar Physics — Practice Test B

Source of truth for the generated page. Edit this file and re-run its build script;
never edit the page. The planning notes that sat here are kept on the Mac.

@meta
id: stlb
slug: stellar-physics-b
title: Stellar Physics · Practice Test B
short: Practice Test B
course: Advanced Higher Physics
audience: Advanced Higher (Rotational Motion and Astrophysics)
topic: Stellar Physics
marks: 25
minutes: 35
badge: ah-stellar-test-b
prefix: ahpt-stlb-
hub: /classes/adv/practice-tests.html
@end

@values
c1_t: 3130
c1_L: 1.35e24
c2_ly: 65
c2_r: 3.1e10
c2_b: 3.6e-8
c3_d: 2.9e18
c3_b: 3.9e-8
@end

@q W1 | warmup | mcq | 1 | auto 1
keyarea: Where main-sequence stars sit on the H-R diagram
parent: SQA Advanced Higher 2018 Q8(a)(i) — "state the region of the H-R diagram in which stars like the Sun are located", set as a labelled-region choice on a redrawn diagram.
stem: Four regions of the H-R diagram are labelled P, Q, R and S. Stars like the Sun fuse hydrogen in their cores. In which region are these stars found?
diagram: w1_hr
option: Region P
option: Region Q
option: Region R
option: Region S
key: A
mi: <strong>Region P — the main sequence.</strong> Stars that fuse hydrogen in their core lie on the main sequence.<br>Q is the giants, R the supergiants and S the white dwarfs.
wrong: The Sun will become a giant (Q) later in its life. Right now it is on the main sequence.
@end

@q W2 | warmup | struct | 2
keyarea: The stages of the proton–proton chain
parent: SQA Advanced Higher 2018 Q8(a)(ii) — "identify the particles indicated by the letters", asked about the second and third stages of the chain rather than the summary equation. The published answers were helium and a positron; Z here is not a positron.
context: The proton–proton chain in the core of a star has three stages.<br>Stage 1: ¹₁H + ¹₁H → ²₁H + ⁰₊₁e + ν<br>Stage 2: ²₁H + ¹₁H → ³₂He + Z<br>Stage 3: ³₂He + ³₂He → X + ¹₁H + ¹₁H
@part _ | 2 | explain | self 2
ask: Identify the particles or radiation represented by X and Z.
mi: X: a <strong>helium-4 nucleus</strong> (⁴₂He, an alpha particle) **(1)**<br>Z: a <strong>gamma ray</strong> (a photon) **(1)**<br>Check the numbers balance. In stage 3 the top numbers are 3 + 3 = 6, and the two protons take 2, so X has 4. In stage 2 the numbers already balance, so Z has no mass and no charge.<br>"Helium atom" is not accepted for X — it is a nucleus.
@end
@end

@q W3 | warmup | mcq | 1 | auto 1
keyarea: How luminosity depends on radius
parent: ORIGINAL — written for this site from L = 4πr²σT⁴. The deck's own check asks what happens when the temperature doubles, so this asks about the radius instead.
stem: Two stars have the same surface temperature. The radius of star P is three times the radius of star Q. What is the luminosity of P divided by the luminosity of Q?
option: 3
option: 6
option: 9
option: 27
option: 81
key: C
mi: <strong>9.</strong> <var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup>. The temperature is the same, so <var>L</var> ∝ <var>r</var><sup>2</sup>. 3<sup>2</sup> = 9.
wrong: 3 forgets to square the radius. 81 uses the fourth power, which belongs to the temperature, not the radius.
@end

@q W4 | warmup | mcq | 1 | auto 1
keyarea: How apparent brightness depends on distance
parent: ORIGINAL — written for this site from b = L / (4πd²).
stem: Two stars have the same luminosity. Star R is twice as far from Earth as star S. What is the apparent brightness of R divided by the apparent brightness of S?
option: 2
option: ½
option: ¼
option: ⅛
option: 1 / 16
key: C
mi: <strong>¼.</strong> <var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>). The luminosity is the same, so <var>b</var> ∝ 1 / <var>d</var><sup>2</sup>. Twice the distance gives 1 / 2<sup>2</sup> = ¼ of the brightness.
wrong: ½ forgets to square the distance. The light spreads over a sphere, and its area grows as <var>d</var><sup>2</sup>.
@end

@q C1 | core | struct | 6
keyarea: Power per unit area from temperature, then radius from luminosity
given: c1_t,c1_L
parent: SQA Advanced Higher 2024 Q6(a)(i)–(ii) — the same two steps for a different red dwarf, with every number changed. The published star was Wolf 359, with answers 3.5 × 10⁶ W m⁻² and 1.0 × 10⁸ m; these are not.
context: Barnard's Star is a red dwarf on the main sequence. It is one of the closest stars to the Sun. Its surface temperature is {c1_t} K and its luminosity is {c1_lum_disp} W.
@part a | 3 | calc | auto 2
ask: Calculate the power per unit area emitted from the surface of Barnard's Star.
relationship: pa
answer: c1_pa
unit: W m⁻²
mi: <var>P</var> / <var>A</var> = <var>σT</var><sup>4</sup> **(1)**<br><var>P</var> / <var>A</var> = 5.67 × 10⁻⁸ × {c1_t}<sup>4</sup> **(1)**<br><var>P</var> / <var>A</var> = <strong>{c1_pa_disp} W m⁻²</strong> **(1)**
@end
@part b | 3 | calc | auto 2
ask: Calculate the radius of Barnard's Star.
relationship: lum
answer: c1_r
unit: m
mi: <var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup> **(1)**<br>{c1_lum_disp} = 4π<var>r</var><sup>2</sup> × {c1_pa_disp} **(1)**<br><var>r</var> = <strong>{c1_r_out} m</strong> **(1)**<br>Or consistent with your answer to (a). Starting again from 5.67 × 10⁻⁸ × {c1_t}<sup>4</sup> is just as good.
@end
@end

@q C2 | core | struct | 5
keyarea: Surface temperature from distance in light-years, radius and apparent brightness
given: c2_ly,c2_r,c2_b
parent: SQA Advanced Higher 2022 Q5(c) — the same five-mark route through b = L/(4πd²) and L = 4πr²σT⁴, for a new star with every number changed. The published star was Bellatrix, with an answer of 2.4 × 10⁴ K; this is not.
context: Aldebaran is an orange giant in the constellation Taurus. It is {c2_ly} ly from Earth. It has a radius of {c2_r_disp} m. Its apparent brightness is {c2_b_disp} W m⁻².
@part _ | 5 | calc | auto 2
ask: Determine the surface temperature of Aldebaran.
relationship: lum
answer: c2_T
unit: K
mi: <var>d</var> = {c2_ly} × 365.25 × 24 × 60 × 60 × 3.00 × 10⁸ = {c2_d_disp} m **(1)** — this mark stands on its own.<br><var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>) **(1)** and <var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup> **(1)**<br>{c2_b_disp} × 4π × ({c2_d_disp})<sup>2</sup> = 4π × ({c2_r_disp})<sup>2</sup> × 5.67 × 10⁻⁸ × <var>T</var><sup>4</sup> **(1)**<br><var>T</var> = <strong>{c2_temp_disp} K</strong> **(1)**<br>Using 365 days is accepted. Finding <var>L</var> first and then <var>T</var> earns the same marks. On this page, pick the relationship you used last.
@end
@end

@q C3 | core | struct | 2
keyarea: A SHOW question — luminosity from apparent brightness and distance
parent: SQA Advanced Higher 2025 Q5(b)(i) — the same "show that the luminosity is" demand, for a new star. The published star was Rigel, showing 4.7 × 10³¹ W.
context: Canopus is the second-brightest star in the night sky. It is {c3_d_disp} m from Earth. Its apparent brightness is {c3_b_disp} W m⁻².
@part _ | 2 | explain | self 2
ask: Show that the luminosity of Canopus is {c3_lum_disp} W. Write your working in your jotter.
mi: <var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>) and {c3_b_disp} = <var>L</var> / (4π × ({c3_d_disp})<sup>2</sup>) **(1)**<br><var>L</var> = <strong>{c3_lum_disp} W</strong> **(1)**<br>This is a SHOW question. The final line must be written down, or the most you can have is 1 mark.
@end
@end

@q P1 | push | open | 3 | self 3
keyarea: Colour, apparent brightness and distance — an open-ended discussion
parent: SQA Advanced Higher 2022 Q5(d) — the same four-voice discussion, rewritten about two new stars. The published pair was Rigel and Betelgeuse.
stem: A group of pupils are talking about the stars Capella and Regulus.<ul class="discuss"><li><strong>Pupil 1:</strong> "Why does Regulus look blue-white, while Capella looks yellow?"</li><li><strong>Pupil 2:</strong> "Capella looks brighter than Regulus, so it must be closer to us."</li><li><strong>Pupil 3:</strong> "Two stars that look close together in the sky must be close together in space."</li><li><strong>Pupil 4:</strong> "A star's colour tells you nothing about its temperature."</li></ul>Use your knowledge of physics to comment on the discussion.
mi: This is an open-ended question. Mark the answer as a whole: <strong>3</strong> for good understanding, <strong>2</strong> for reasonable, <strong>1</strong> for limited, <strong>0</strong> for none.<br>Physics a good answer might use:<br>• Colour depends on <strong>surface temperature</strong>. Regulus is hotter, so its peak wavelength is shorter and it looks blue-white. So Pupil 4 is wrong.<br>• Apparent brightness depends on <strong>luminosity and distance</strong>: <var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>). A brighter-looking star could be closer, or it could be more luminous. So Pupil 2's reasoning does not hold on its own.<br>• The sky is a 2-D view. Stars that look close together can be at very different distances along our line of sight. So Pupil 3 is wrong.<br>• A star's position on the H-R diagram links its colour, temperature and luminosity.
@end

@q P2 | push | open | 3 | self 3
keyarea: How stars end — white dwarfs, neutron stars and black holes
parent: SQA Advanced Higher 2025 Q3(d) — the same open-ended comparison, set on its own rather than after a pulsar calculation.
stem: Every star ends its life as a white dwarf, a neutron star or a black hole. Using your knowledge of physics, comment on the similarities and differences in how stars evolve into these three objects.
mi: This is an open-ended question. Mark the answer as a whole: <strong>3</strong> for good understanding, <strong>2</strong> for reasonable, <strong>1</strong> for limited, <strong>0</strong> for none.<br>Physics a good answer might use:<br>• <strong>Same start:</strong> every star begins on the main sequence, fusing hydrogen in its core. When the core hydrogen runs out, core fusion stops and the core contracts under gravity.<br>• <strong>Mass decides the ending.</strong> A star like the Sun becomes a red giant, sheds its outer layers as a planetary nebula, and leaves its core as a white dwarf.<br>• A much more massive star becomes a supergiant and fuses heavier elements, up to iron. Its core collapses and it explodes as a supernova. The remnant is a neutron star, or a black hole if the remnant is massive enough.<br>• <strong>All three are remnants</strong>: no fusion, very small and very dense. A black hole is so dense that its escape velocity is greater than the speed of light.
@end

@q P3 | push | struct | 1
keyarea: Stellar lifetimes and the age of the Universe
parent: SQA Advanced Higher 2024 Q6(c) — the same demand, for a different long-lived red dwarf. The published star was Wolf 359.
context: Proxima Centauri is a small red dwarf. Stars like it stay on the main sequence for thousands of billions of years.
@part _ | 1 | explain | self 1
ask: Scientists know the mass of stars like this. Suggest why they have still not observed what happens to these stars at the end of their lives.
mi: Their lifetime is <strong>longer than the age of the Universe</strong> (about 14 billion years), so none has reached the end of its life yet **(1)**.
@end
@end
