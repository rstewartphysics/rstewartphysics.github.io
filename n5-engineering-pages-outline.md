# N5 Engineering Science — build-spec outline for the 6 remaining topic pages

Build-spec for the six "Coming soon" N5 Engineering topic pages (topics 3–8). Topics 1–2
(`engineering-contexts-and-systems.html`, `energy-and-efficiency.html`) are live and are the
**canonical templates** — copy their structure, chrome and progress wiring exactly.

**Sources of truth:** the BHS booklets in OneDrive
(`…/Engineering/National 5/3.–8.`), the SQA N5 Engineering Science course spec + data booklet,
and the repo guides (`CLAUDE.md`, `electronics-topic-page-guide.md` for equation/symbol rules,
`progress-system-guide.md` for tracking). The web pages **enhance** the booklets — interactive
practice, instant-check answers, simulators — they do not replace them.

---

## 1. Shared build recipe (every page)

### Files & URLs
```
classes/n5-engineering/electronics-and-analogue-control.html      — Topic 3
classes/n5-engineering/logic-and-programmable-control.html        — Topic 4 (booklets 4a + 4b)
classes/n5-engineering/mechanisms-and-drive-systems.html          — Topic 5
classes/n5-engineering/pneumatics.html                            — Topic 6
classes/n5-engineering/structures-and-materials.html              — Topic 7
classes/n5-engineering/assignment-prep-and-mixed-revision.html    — Topic 8
```
Kebab-case of the hub tile label. All asset/menu links absolute. Never add topic pages to the
nav drawer.

### Head (copy from `energy-and-efficiency.html`, change titles)
- Front matter `layout: none`, `title: <Topic> — National 5 Engineering Science`.
- `color-scheme: light dark`; theme-color `#fbf6ef` light / `#15110b` dark.
- Links/scripts in order: `site-menu.css`, `site-menu.js` (defer), `progress.js` (defer),
  `progress/eng-n5.js` (defer), `widget-kit.js` (defer),
  `engineering-science.css?v=eng-YYYYMMDD` (bump only if the shared sheet changes).
- `:root { --page-accent/--menu-accent: var(--eng-orange); --tagink; --good; --bad }` + dark
  overrides — copy the exact values from the energy page.
- Page widget CSS/JS stays inline. No Liquid-unsafe `{{`/`{%` in inline CSS/JS.

### Body skeleton (same order as the energy page)
1. Skip link → `#mainContent`; `{% include site-menu.html %}`.
2. Banner: `/assets/national-5-engineering-science-banner.jpeg` with overlay text = topic title
   (keep overlay on topic pages).
3. Sticky `.subnav-wrap`: one short link per section + `Answers` + `Check`, and
   `.subnav-cta` → `/classes/n5-engineering-science.html` ("N5 hub").
4. `<main class="container" id="mainContent">`:
   - `section.intro` — 2–3 sentence pupil-voice intro + link to the booklet PDF when published.
   - `section.modebar` — "Choose how to use this page" (same three modes as energy page).
   - Concept sections: `<section class="panel sec" id="sN">` +
     `<span class="concept-tag">Concept N</span>` + `<h2>`.
   - `#answers` — **Booklet check**: `details.reveal` blocks giving final answers to the
     booklet's TRY THIS / PRACTICE questions (the booklets' Appendix answer keys where they
     exist; write them for 3, 4a, 4b, 5 which have none — final answers only, like the energy page).
   - `#check` — **Check yourself**: ~8–10 Q MC quiz + RAG self-check built from the booklet's
     success criteria.
5. `{% include site-footer.html %}`.

### Equations, maths & diagrams (house rules)
- Equation cards `.eq-cards`/`.eq-card`; serif equation font; every quantity symbol in `<var>`;
  real 2-D `.frac` (`fr-n`/`fr-d`, never `num`/`den`) with worded `aria-label`.
- Two worked examples per equation (`.example` + `.calc` grid, every `.calc-row` exactly 4
  cells): one substitute-and-solve, one substitute-then-rearrange. Add an "extra step" to
  questions (prefix conversion, square, or multi-step) per the topic-page guides.
- Diagrams are inline SVG, themed via classes (`var(--text)`/`var(--card)`), `role="img"` +
  `<title>`. **UK/IEC rectangle resistors; distinctive-shape logic gates** (site-wide teacher's
  choice). Pneumatic/drive/flowchart symbols follow the **N5 data booklet**.

### Progress wiring (run `/add-progress`; never hand-roll)
- Page calls `Progress.markSeen("<page-id>")` on load; challenge widgets get
  `data-prog-challenge="ch-<slug>"` and are auto-bound (copy the energy page's binding snippet).
- Register one topic badge per page in `assets/js/progress/eng-n5.js`
  (pattern: `eng-contexts`, `eng-energy` exist). Proposed:

| Page | page-id / badge | Badge name (suggested) | storage prefix |
|---|---|---|---|
| Electronics & Analogue Control | `eng-electronics` | Circuit Builder 🔌 | `n5e-` |
| Logic & Programmable Control | `eng-control` | Control Coder 🤖 | `n5c-` |
| Mechanisms & Drive Systems | `eng-mechanisms` | Gear Master ⚙️ | `n5m-` |
| Pneumatics | `eng-pneumatics` | Air Engineer 💨 | `n5p-` |
| Structures & Materials | `eng-structures` | Load Bearer 🏗️ | `n5s-` |
| Assignment Prep | `eng-assignment` | Assignment Ace 📋 | `n5a-` |

### Publishing a page (per-page checklist)
1. Build the page; pass the a11y/pre-commit checks (focus rings, tap targets ≥44–48px,
   `prefers-reduced-motion`, `aria-live` results, balanced tags, IDs exist).
2. Flip the hub tile in `classes/n5-engineering-science.html`:
   `<span class="cta soon">` → `<a class="cta" href="…">Open revision page</a>` and add
   `data-prog-badges="<badge-id>"` to the topic card.
3. Add the badge to `progress/eng-n5.js`.

### External simulators (free, no kit — link prominently where noted)
- **NoPressureSim** (pneumatics): https://sites.google.com/view/nostrainsim/pneumatics
- **NoStressSim** (beams/forces): https://sites.google.com/view/nostrainsim/forces-and-structures

---

## 2. Topic 3 — Electronics & Analogue Control

**Booklet:** `N5EngSci_Booklet_3_Electronics_and_Analogue_Control_FINAL.docx`.
**Note:** substantial overlap with the site's Electronics subject pages — reuse component
patterns (`.ttable`, `.sym-grid`) and SVG symbols from `classes/electronics/theory.html`, but
keep content strictly N5 EngSci (BS symbols from the N5 data booklet; no BS1852/op-amps).

**Subnav:** Circuits · Ohm's Law · Power · I/O Devices · Dividers · Transistor · Answers · Check

| # | Section (concept block) | Content & components |
|---|---|---|
| 1 | Electricity & circuits | V/I/R meaning table; **symbol reference grid** (cell, battery, switch, lamp, LED, resistor, variable resistor, LDR, NTC thermistor, diode, buzzer, motor, voltmeter, ammeter, relay, NPN transistor — inline SVG, rectangle resistors); series vs parallel rules table (Kirchhoff I & II); meter connection (voltmeter parallel/high-R, ammeter series/low-R); pre-power-up checklist (`.chk-list`). **Widget:** series/parallel rules drag-match (`ch-match-rules`). |
| 2 | Ohm's Law & resistance | Eq cards: `V = IR`, `R_T = R₁+R₂+…`, `1/R_T = 1/R₁+1/R₂+…`. 2 worked examples each (booklet values: 6 V/0.2 A → 30 Ω; 100+220+470 Ω series; 100∥200 Ω). Practice callouts from booklet TRY THIS. Note: parallel R_T always < smallest R. **Widget:** interactive Ohm's-law calculator/slider sim (`ch-ohms-calc`) — flagship, calls `markSeen`/`record`. |
| 3 | Electrical power | Eq cards: `P = IV`, `P = I²R`, `P = V²/R` — choose by what's known. 2 worked examples each (12 V/0.5 A lamp; 220 Ω/0.1 A; 1 kΩ/5 V). Include a prefix-conversion question (50 mA). **Widget:** "which formula?" selector challenge (`ch-power-pick`). |
| 4 | Input & output devices | Transducer definitions; input table (switch, variable resistor, LDR, thermistor) & output table (lamp/LED, buzzer, motor, relay) with engineering examples; LDR/NTC behaviour rules (bright→low R; hot→low R). **Widget:** match-the-sensor-to-the-job (`ch-match-sensor`). |
| 5 | Voltage dividers & sensors | Analogue signal definition; divider circuit SVG (R1 top, R2 bottom, V2 out); eq card `V₁/V₂ = R₁/R₂`; 2 worked examples (1 kΩ/2 kΩ, V1=3 V; sensor divider 4 kΩ LDR). LDR top vs bottom behaviour table; describing-a-sensor-circuit method (resistance → V_out → transistor → output). **Widget:** live divider sim — drag light-level/temperature slider, watch V₂ (`ch-divider-sim`) — good second flagship. |
| 6 | Transistor, relay & protection diode | NPN as a switch (B/C/E; ~0.7 V switching); relay = electromagnetic switch (small current switches big circuit); protection diode across coil (voltage-spike reasoning); full control circuit SVG (divider → transistor → relay+diode → output); light-/dark-sensing and hot-/cold-sensing position tables. Assignment link box → Topic 8. **Widget:** build-the-control-circuit ordering challenge (`ch-build-control`). |

**Answers:** write final answers for all TRY THIS + PRACTICE sets (booklet has no key).
**Check:** 10 MC (symbols, series/parallel rules, one calc per formula, LDR/thermistor
behaviour, divider position, diode function) + RAG list from success criteria.
**Common-mistakes call-outs** (from booklet Knowledge Organiser): units on answers; meter
connections; battery polarity; describe sensor circuits via V_out; transistor is the switch.

---

## 3. Topic 4 — Logic & Programmable Control (booklets 4a + 4b on one page)

**Booklets:** `Booklet_4a_Logic_and_Digital_Control_FINAL.docx` +
`Booklet_4b_Programmable_Control_FINAL.docx`. One hub tile → one page, two halves.

**Subnav:** Digital · Gates · Truth tables · Boolean · Microcontrollers · Flowcharts ·
Programming · Answers · Check

| # | Section | Content & components |
|---|---|---|
| 1 | Digital signals & logic states | Analogue vs digital table (links back to Topic 3 divider); logic 1/0 = high/low ≈ 5 V/0 V; digital I/O examples. **Widget:** logic-state sorter (`ch-logic-states`). |
| 2 | AND, OR, NOT gates | **N5 note callout: only AND/OR/NOT — NAND/NOR/XOR not required.** Distinctive-shape SVG symbols; truth tables in `.ttable`; word definitions ("all inputs 1" / "any input 1" / inverter). **Widget:** interactive gate playground — click inputs, watch output (`ch-gate-play`) — flagship. |
| 3 | Truth tables for combinations | rows = 2ⁿ (max 3 inputs at N5); combinational = no memory; intermediate-column method; worked examples: `Q = A AND (NOT B)` (4 rows), `Q = (A AND B) OR C` (8 rows). **Widget:** fill-in truth-table challenge with auto-mark (`ch-ttable`). |
| 4 | Boolean expressions | `Q = A·B`, `Q = A+B`, `Q = Ā` notation; description ↔ expression ↔ diagram conversion triangle; 4-step design method (identify I/O → choose gate(s) → write expression → draw & check). Booklet scenarios as practice (washing machine door AND start; alarm from any door OR; emergency stop NOT). **Widget:** description→expression builder (`ch-boolean`). |
| 5 | Microcontrollers & programmable control | What a microcontroller is; commercial/industrial/transport/home examples table; programmable vs hard-wired comparison table (6 rows from booklet). |
| 6 | Flowcharts | Data-booklet symbol table (terminator, parallelogram I/O, rectangle process, diamond decision, arrows); structures: continuous loop, fixed loop, time delay, branch; **exam-convention callout: label every I/O with pin number, every delay with a unit; exam uses flowcharts/pseudocode, never Arduino C.** Worked flowchart (LED on 1 s → off → stop). **Widget:** drag-the-flowchart-blocks sequencer (`ch-flowchart`). |
| 7 | Programming in real life | `setup()`/`loop()` roles; pseudocode ↔ Arduino C command reference table (pinMode, digitalWrite, digitalRead, analogRead, delay, if, for); ms conversion warning. Worked examples as tabbed code blocks: flashing lamp (continuous+delay), traffic lights (multi-output), darkness alarm with counter (analogRead + if + for). "Find and fix" debugging: the two booklet debug programs as interactive spot-the-fault reveals (`ch-debug`). Assignment link box → Topic 8. |

**Answers:** final answers for 4a + 4b PRACTICE sets (no key in booklets).
**Check:** 10 MC across both halves (gate ID, truth-table row count, Boolean from description,
flowchart symbol, pseudocode keyword, delay units, setup vs loop) + RAG (merged criteria).

---

## 4. Topic 5 — Mechanisms & Drive Systems

**Booklet:** `N5EngSci_Booklet_5_Mechanisms_and_Drive_Systems_FINAL.docx` (also
`Booklet_5_Mechanisms_TEACHER_ANSWERS.md` in the folder — use for the Answers section).

**Subnav:** Motion · Levers · Linkages · Gears · Belt & chain · Friction · Answers · Check

| # | Section | Content & components |
|---|---|---|
| 1 | Motion & mechanisms | Definition; four motions table (rotary, linear, reciprocating, oscillating) with animated-SVG mini-icons (respect `prefers-reduced-motion`). **Widget:** identify-the-motion match (`ch-match-motion`). |
| 2 | Levers *(enrichment)* | **Callout: "Enrichment — N4 progression; lever classes are not on the N5 assessment list — prioritise motion, gears, drives and friction."** Load/effort/pivot; class 1/2/3 with example SVGs. Keep short; collapsible `details`. |
| 3 | Linkages *(enrichment)* | Same enrichment callout. Reverse-motion, push/pull, bell crank, parallel-motion table + SVGs with input/output arrows. **Widget (shared with levers):** identify-the-class/linkage sorter (`ch-linkages`). |
| 4 | Gears & gear trains | Driver/driven/idler; eq cards: gear ratio `= N₂/N₁`, **data-booklet method callout: `input speed × input size = output speed × output size`** (markers reward it; "movement multiplier" scores less); `VR = n₁/n₂`. Worked examples: ratio 20T→60T; output speed 20T@600 rpm→40T; compound train A10→B40, C20→D60 @1200 rpm. Idler = direction only. **Widget:** interactive gear-train sim — set teeth, watch speeds/directions (`ch-gear-sim`) — flagship. |
| 5 | Belt & chain drives | How each transmits drive; advantages/disadvantages comparison; same data-booklet relationship with pulley diameter / sprocket teeth. Worked examples: 50 mm@1000 rpm→200 mm pulley; 40T chainwheel@80 rpm→20T sprocket. BS drive-system symbol grid (spur gear, gear train, belt+pulley, chain+sprocket, shaft, bearing). **Widget:** belt-vs-chain chooser scenarios (`ch-belt-chain`). |
| 6 | Friction | Definition; effects in a mechanism (heat, wear, efficiency loss); reduction methods table (lubrication, bearings, smooth surfaces, lighter loads); helpful-vs-wasteful friction on a bicycle. Assignment link box → Topic 8. |

**Answers:** from `Booklet_5_Mechanisms_TEACHER_ANSWERS.md`.
**Check:** 10 MC (motion ID, ratio calc, output-speed calc, compound-train calc, idler effect,
belt vs chain, friction) + RAG. Common-mistakes: data-booklet relationship; driver vs driven;
idler ≠ ratio change; revs min⁻¹ unit.

---

## 5. Topic 6 — Pneumatics

**Booklet:** `N5EngSci_Booklet_6_Pneumatics_FINAL.docx` (answer key in appendix — reuse).
**Simulator-first page:** the booklet has 7 ▶ SIMULATE IT tasks + 3 design briefs on
NoPressureSim — surface these as styled sim-task cards linking out.

**Subnav:** Intro · Components · Cylinders · Valves · Calculations · Circuits · Design · Answers · Check

| # | Section | Content & components |
|---|---|---|
| 1 | Pneumatics in engineering | Definition; uses by sector; advantages/disadvantages table; safety rules checklist (`.chk-list`, use `--warm` caution styling); school pressure 4–6 bar. |
| 2 | Components | Compressor/reservoir/regulator functions + data-booklet symbol grid; other components table (SAC, DAC, 3/2, 5/2, restrictor, unidirectional restrictor, shuttle valve). **Widget:** match-component-to-function (`ch-match-comp`). |
| 3 | Cylinders | SAC (air out, spring return) vs DAC (air both ways) with symbol SVGs and outstroke/instroke labels; application chooser table. Sim cards: **SIM 1** (SAC + 3/2), **SIM 2** (DAC + 5/2). **Terminology callout: "the 3/2 valve _actuates_, the 5/2 valve _changes state_, the piston _outstrokes/instrokes_"** + marked model answer from booklet. |
| 4 | Valves | 3/2 and 5/2 port tables + symbols; restrictor vs unidirectional restrictor; time delay (restrictor + reservoir → pilot); shuttle valve; actuation methods table (manual, mechanical/roller, pilot-air, **solenoid = the electronics↔pneumatics link**, diaphragm); pneumatic logic: AND = two valves in series (two-hand safety), OR = shuttle valve — cross-link to Topic 4 gates. Sim cards: SIM 3 (restrictor speed), SIM 4 (time delay), SIM 5 (OR), SIM 6 (AND). **Widget:** valve-port/logic quiz (`ch-valves`). |
| 5 | Pressure, force & area | **Units-first callout: work in N and mm² → Nmm⁻²; 1 Nmm⁻² = 1 000 000 Pa; never mix Pa with mm².** Eq cards: `P = F/A`, `A = πd²/4`. Worked examples: 2000 mm²@0.6 → 1200 N; d=50 mm@0.5 → 982 N (area first!). Outstroke > instroke (rod reduces effective area). **Widget:** cylinder force calculator — set d and P, computes A then F showing both steps (`ch-force-calc`) — flagship. |
| 6 | Circuits | Three reference circuit SVGs: 3/2+SAC; 5/2+DAC; speed control with unidirectional restrictors. Practical tasks 1–2 as build guides. |
| 7 | Design & investigate | SIM 7 (limit-switch auto-sequence) + Design briefs A/B/C (sliding door; two-hand two-station press; auto retract) as challenge cards with hints in `details.reveal`; "evidence for your assignment" box (save .json, export image) → Topic 8. |

**Answers:** booklet appendix key (calculations + all PRACTICE sets).
**Check:** 10 MC (component functions, 3/2 vs 5/2, SAC vs DAC, force calc, delay circuit,
shuttle/AND/OR, terminology) + RAG. Common-mistakes from booklet organiser.

---

## 6. Topic 7 — Structures & Materials

**Booklet:** `N5EngSci_Booklet_7_Structures_and_Materials_FINAL.docx` (answer key in appendix).
**Simulator-first:** 4 ▶ NoStressSim tasks + 2 design briefs — same sim-card treatment.

**Subnav:** Forces · Triangle · Moments · Beams · Materials · Stress & strain · Design · Answers · Check

| # | Section | Content & components |
|---|---|---|
| 1 | Forces & free body diagrams | Force = push/pull, size + direction (N); force types table (weight, applied, reaction, tension, compression); FBD rules + beam FBD SVG. SIM 1 card (loaded-beam FBD). **Widget:** tension-or-compression identifier (`ch-ten-comp`). |
| 2 | Triangle of forces | **N5 note callout: scale drawing only — resolution (sin/cos) is Higher.** Head-to-tail method steps; scale choice (1 cm = 100 N); worked example (600 N sign, cables 30°/45°). SIM 2 card (Static Node mode checks your drawing). |
| 3 | Moments & the principle | Eq card `M = Fx` (Nm); worked example 60 N × 0.4 m; principle: ΣCWM = ΣACWM; see-saw worked example (200 N @1.5 m vs 300 N @?). SIM 3 card. **Widget:** interactive balance-the-beam sim (`ch-balance`) — flagship. |
| 4 | Simply-supported beams | Take-moments-about-a-support method; worked examples 1 (4 m beam, 600 N @1 m) and 2 (6 m beam, two loads); reactions sum = total load check. SIM 4 card. **Widget:** reaction calculator challenge (`ch-reactions`). |
| 5 | Materials selection | Families table (ferrous, non-ferrous, polymers, ceramics, composites, smart) with examples/uses; properties glossary (strength, stiffness, hardness, toughness, ductility, malleability, elasticity, conductivity, corrosion resistance, density); **justify = property + why it matters** callout. **Widget:** justify-the-choice scenario match (`ch-materials`). |
| 6 | Stress & strain | **Units-first callout (same as pneumatics): N and mm² → Nmm⁻²; 1 Nmm⁻² = 1 MPa; strain is unitless.** Eq cards: `σ = F/A`, `ε = Δl/l`. Worked examples: 5000 N/100 mm² cable; 2 m wire +4 mm. Combined stress+strain question. |
| 7 | Design & investigate | Briefs A (worst-case walkway reaction) + B (two-cable sign ≤400 N) as challenge cards; assignment-evidence box (Simulation Report PDF) → Topic 8. |

**Answers:** booklet appendix key (scale-drawing answers shown as target ± tolerance).
**Check:** 10 MC (force ID, moment calc, principle, beam reactions, material family/property,
stress calc, strain units) + RAG. Common-mistakes from booklet organiser.

---

## 7. Topic 8 — Assignment Prep & Mixed Revision

**Booklet:** `Booklet 8 – Assignment Skills` (2025 "Leisure pool complex" mock).
**Different shape:** a skills/reference page, not a concept-block teaching page — model on the
booklet's structure. ⚠ **Keep the Hint Bank (booklet §11) off the public page** — it's
teacher-controlled mock material; the page teaches the transferable skills only.
**Note:** `classes/n5-engineering-assignment-prep.html` already exists as a skeleton resource
page linked from the hub's resources row — either build this topic page *as* that file
(keeping its URL) or build the topic page and redirect/merge; decide at build time, don't
leave two competing pages.

**Subnav:** The assignment · Analysis · Design · Build · Testing · Evaluation · Task skills ·
Tools · Check

| # | Section | Content |
|---|---|---|
| 1 | How the assignment works | 50 marks ≈ 31%; five tasks table (contexts, what each tests, marks, tool); conditions callout (8 h closed-book, no notes/internet/AI, some sub-tasks by hand); page-labelling rule (task number + SCN); follow-through (FTE) rule; golden rule: everything links to the specification. |
| 2 | Analysis — specification | Vague vs testable table (all 4 booklet pairs); "if you can't test it, reword it". **Widget:** vague→testable spec fixer (`ch-spec`). |
| 3 | Design | Good-practice table (system diagram, circuit, flowchart/pseudocode, simulation); show development, not just the final idea. |
| 4 | Build | Safe working; build log; keep the spec beside you. (Short.) |
| 5 | Testing | Numbered test-procedure pattern with expected results; **name-the-component results** — weak vs strong table from the booklet. **Widget:** rate-the-test-result challenge (`ch-results`). |
| 6 | Evaluation | Point-by-point vs spec with evidence; justify improvements (why, not just what); booklet example evaluation table. |
| 7 | Six task-type skills | One card per skill (8.1–8.6): system/sub-system diagrams; sensing circuit + V_out; flowchart+circuit test-and-fix; gear train & VR; logic from Boolean; pneumatic time-delay + safety. Each card: method summary, parallel example, **"what markers check" list (real SQA marker feedback — keep verbatim)**, cross-link to its topic page (3–7). |
| 8 | Which tool for which task | Tool table (Yenka / NoStrainSim / NoPressureSim / real kit / paper-only sub-tasks); simulation checklist (battery orientation, right microcontroller, matches tests, feedback arrows, generic labels, values shown). **Widget:** simulation-checklist spot-the-error (`ch-simcheck`). |

**Check:** 10 MC (marks structure, spec quality, test-result quality, FTE rule, tool choice,
marker checkpoints) + RAG from booklet criteria. No Answers section (no numeric practice).

---

## 8. Phased build order

Each phase = **one shippable page**, done to completion before the next starts. A phase is not
finished until every step in the per-phase checklist passes.

**Per-phase checklist (applies to every phase):**
1. Build `classes/n5-engineering/<page>.html` from the shared recipe (§1) + that topic's spec.
2. Write the `#answers` Booklet-check section (final answers, `details.reveal`).
3. Write the `#check` section (MC quiz + RAG from the booklet success criteria).
4. Wire progress: `markSeen`, `data-prog-challenge` hooks, flagship `record` where specced.
5. Register the topic badge in `assets/js/progress/eng-n5.js`.
6. Flip the hub tile in `classes/n5-engineering-science.html` (`cta soon` → live link) and add
   `data-prog-badges`.
7. Pre-commit checklist: head standard, `.calc-row` 4 cells, `fr-n`/`fr-d`, `<var>` on symbols,
   UK/IEC symbols, balanced tags, JS IDs exist, absolute paths, unique storage prefix,
   no Liquid-unsafe sequences, a11y guardrails.

| Phase | Page | Why this order | Extra phase-specific steps |
|---|---|---|---|
| **1** | Mechanisms & Drive Systems (5) | Most exam-central remaining calc topic; teacher answer key ready (`Booklet_5_Mechanisms_TEACHER_ANSWERS.md`) | Gear-train sim is the flagship widget — build it first, reuse its slider/readout pattern in later phases |
| **2** | Electronics & Analogue Control (3) | Biggest content but heavy reuse: symbols/`.ttable`/`.sym-grid` from `classes/electronics/theory.html` | Write the missing answer key (booklet has none) |
| **3** | Pneumatics (6) | Introduces the sim-task-card pattern (NoPressureSim) + the N/mm² units callout | Sim-card component built here is reused verbatim in Phase 4 |
| **4** | Structures & Materials (7) | Shares Phase 3's sim-card pattern (NoStressSim) and units callout — build back-to-back | Scale-drawing answers shown as target ± tolerance |
| **5** | Logic & Programmable Control (4) | Largest page (booklets 4a + 4b); do once all patterns are settled | Two-half page: gates/truth-tables then flowcharts/programming; write missing answer keys |
| **6** | Assignment Prep & Mixed Revision (8) | Last — its six skill cards cross-link into Phases 1–5 pages, which must be live | Resolve the skeleton `classes/n5-engineering-assignment-prep.html` (build as that URL or merge); keep the Hint Bank off the public page |

**Definition of done for the whole job:** all six hub tiles live, six badges registered, every
page passes the checklist, and the hub's "coming soon" state is gone.
