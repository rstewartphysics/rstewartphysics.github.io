# Master plan — N5 Engineering Science Topic pages 2–8

**Scope:** plan the seven remaining N5 Engineering Science topic pages (Topics 2–8), using Topic 1 as the proven baseline. **Planning only — no pages built.**

**Topics covered:** 2 Energy & Efficiency · 3 Electronics & Analogue Control · 4 Logic & Programmable Control · 5 Mechanisms & Drive Systems · 6 Pneumatics · 7 Structures & Materials · 8 Assignment Preparation & Mixed Revision.

**Baseline artefacts reviewed:**
- Built Topic 1 page — `classes/n5-engineering/engineering-contexts-and-systems.html` (1,456 lines)
- Topic 1 improvements doc — `n5-engsci-topic1-contexts-systems-improvements.md`
- Build guides — `CLAUDE.md`, `higher-topic-page-guide.md`

**SQA evidence reviewed (whole-course):**
- Course spec `EngineeringScienceCourseSpecN5.pdf` — content + the per-area **question-paper mark ranges** (pp.8–9) and assignment structure (p.10)
- Question papers + marking instructions 2024 & 2025 (every question mapped to a topic below)
- Assignments + marking instructions 2024 & 2025 ("Leisure pool complex")
- Specimen assignment (CAT) and the topic-indexed Past-Paper Finder 2014–2023
- Topic 2 booklet `N5EngSci_Booklet_2_Energy_and_Efficiency_V2.pdf` (24 pp — the only booklet present for Topics 2–8; see Open Question 1)
- N4/N5 data booklet `n4-n5-engineering-science-data-booklet-2.pdf`

**Prepared:** 2026-06-13.

---

## 0. The single most important number

The course spec fixes how many marks each area carries in **every** 110-mark question paper (spec pp.8–9). This drives both the build order and the badge justifications, so it is the spine of this whole plan:

| Topic | Area(s) in the spec mark table | Marks in **every** QP | Assignment role |
|---|---|---|---|
| 1 (done) | Systems 5–9 · Roles 3–7 · Impacts 5–9 | **13–25** | system/sub-system diagram (8 mks) |
| **2 Energy & Efficiency** | Energy 5–10 | **5–10** | weak (efficiency reasoning in evaluation) |
| **3 Electronics & Analogue** | Analogue 13–26 | **13–26** (largest) | input-sensing circuit (2–3 mks) |
| **4 Logic & Programmable** | Digital 13–24 | **13–24** | flowchart + logic build (10–14 mks) |
| **5 Mechanisms & Drive** | Drive systems 7–12 | **7–12** | gear-train design/test (≈9 mks) |
| **6 Pneumatics** | Pneumatics 7–12 | **7–12** | pneumatic circuit (≈9 mks) |
| **7 Structures & Materials** | Structures 7–12 · Materials 6–10 | **13–22** | force/material reasoning (varies) |
| **8 Assignment + Revision** | (all of the above, sampled) | n/a | the assignment itself = 50 marks (31%) |

Two structural truths fall out of this table and shape everything below:

1. **Topics 2, 3, 5, 6, 7 are calculation-heavy.** Topic 1 was 100% qualitative; from Topic 2 onward, ~30–40% of QP marks are "application and manipulation of formulae" (spec p.9). So every page from Topic 2 on must add the **equation-card machinery** from `higher-topic-page-guide.md` that Topic 1 deliberately omitted (real 2-D fractions, two worked examples per equation, the `.calc` side-note grid, unit conversions). This is the biggest single addition to the baseline.
2. **Exam weight and assignment weight diverge.** The assignment is a closed-book *build* (electronics, logic, gears, pneumatics). So Topics 3, 4, 5, 6 earn **both** badges heavily; Topics 2 and 7 are **exam-dominant**. Badges must reflect that — not paint everything "assignment too."

---

## 1. Baseline standards inherited from Topic 1

Topic 1 is the reference build. Everything in this list is **kept as-is** for Topics 2–8 unless a per-topic section overrides it.

### 1.1 Chrome, palette, navigation (from `CLAUDE.md`, unchanged)
- `layout: none`; link `/assets/css/site-menu.css` + `/assets/css/engineering-science.css?v=eng-YYYYMMDD` (bump version when the shared sheet changes); page-specific widget CSS inline.
- Engineering-Science identity: graphite + orange, **dark mode free** from the shared sheet; `:root{ --page-accent:var(--eng-orange); --menu-accent:var(--eng-orange) }`. Light/dark `theme-color` meta pair.
- `<main class="container">`, `<img class="banner" src="/assets/Engeneringbanner.png">`, intro hero (eyebrow "National 5 Engineering Science · Topic N", title, descriptor, CTA row: *Open the booklet* + *Lesson slides* + *Go to self-check*), backlink to the N5 hub.
- Sticky **jump sub-nav** with scroll-spy (Topic 1 lines 335–349, 1425–1439) + an "N5 hub" CTA. Wraps on mobile (`@media (max-width:640px)`).
- Drawer untouched (CLAUDE.md forbids topic pages in the global nav). **Publishing a page = flip its hub `<details>` placeholder** (`classes/n5-engineering-science.html`) from "Coming Soon" to a `resource-card` linking the page, exactly as Topic 1's was.
- Footer: `© Mr R Stewart's Science, Physics, Electronics &amp; Engineering`.

### 1.2 Section architecture (from Topic 1, kept)
Numbered learn-sections mapping **one-to-one to the booklet's sections** (so the page doubles as the booklet companion), each containing: short notes → term table / diagram → one interactive widget → a **Practice callout** with `details.reveal` answers keyed to booklet page numbers. Then the three "back-of-book" sections:
- **Booklet check** — nested `details.reveal` keyed to booklet pages; open tasks get *"Example of a strong answer — yours can differ"*; research/open tasks get scaffolding, not answers.
- **Key ideas / knowledge organiser** — the booklet's organiser verbatim + a **Common Mistakes** warning card (booklet's own list).
- **Check yourself** — mixed MCQ quiz + **RAG self-check** using the booklet's success criteria **verbatim**, persisted to `localStorage`.

### 1.3 Interaction + a11y patterns (from Topic 1, kept)
- Widgets: `data-match` dropdown-sorters, `data-builder` tap-to-place block builders, MCQ engine, RAG tracker, print-opens-reveals (Topic 1 lines 1196–1453). Reuse these JS modules wholesale — they are generic.
- Every drag has a tap fallback; tap targets ≥44 px; no `alert()` (inline `aria-live`); quiz marked **glyph + text, never colour-only**; RAG buttons carry R/A/G letters; skip link, `id="mainContent"`, ≥3 px focus rings, `prefers-reduced-motion`, print stylesheet.
- **Per-page `localStorage` prefix** (never reuse `n5ecs-`): `n5e2-`, `n5e3-`, `n5e4-`, `n5e5-`, `n5e6-`, `n5e7-`, `n5e8-`.

### 1.4 Fixes from the Topic 1 improvements doc — bake in from day one
The Topic 1 review surfaced four things that should be **standard from Topic 2**, not retrofitted:
1. **Diagram conventions to the assignment standard** — see §2.2. (Topic 1's omission of the system boundary / drivers / external in-out is the canonical example: that exact diagram is worth ≈8 marks in the assignment.)
2. **SQA's exact terminology leads**, friendly term in brackets (Topic 1 said "real-world input"; SQA marks "external input"). Each topic's notation glossary is in §3.
3. **Evidence-gated badges** — §2.1.
4. **Collapsible learn-sections** — Topic 1 shipped as one ~1,450-line scroll because the five sections never collapse. From Topic 2, make each learn-section collapsible (default open) and/or add a collapse-all. (Calculation topics are longer than Topic 1, so this matters *more*, not less.)

---

## 2. Mandatory guardrails for all seven pages

### 2.1 Badge system — "🎯 Exam" / "📘 Assignment" (evidence-gated)

Two badges, identical to the Topic 1 improvements spec (§3 there):
- **🎯 Exam** — placed only where the spec mark range and/or a real past-paper question supports it. The justification (spec range + year/question) goes in a `title=` attribute.
- **📘 Assignment** — placed only where the *skill is produced and marked* in the assignment (cite the task: year + task number).

**Style (reuse, no new colours):**
```css
.badge { display:inline-block; font-size:.68rem; font-weight:900; letter-spacing:.04em;
         text-transform:uppercase; padding:2px 8px; border-radius:999px; margin-left:.4rem;
         vertical-align:middle; white-space:nowrap; }
.badge.exam   { color:#111; background:var(--eng-orange); }
.badge.assign { color:var(--eng-text); background:transparent; border:1.5px solid var(--eng-orange); }
```
**Placement rules:** section headings, the topic's "exam-critical diagram", and "draw/calculate"-type practice questions. **Never** badge the sub-nav or every table row. Add a one-line legend under the hero. **Evidence requirement:** no badge without a citation in this plan's per-topic table (§3). If a strand isn't in the spec mark table and didn't appear in 2024/2025, it gets no Exam badge.

### 2.2 Diagram & notation conventions per topic (the per-topic analogue of Topic 1's "system boundary")

This is the equivalent of Topic 1's Step 2 for every topic — the topic-specific convention SQA marks, that the page must teach correctly. **Use BS/ISO symbols, drawn as themeable inline SVG** (`.bd` pattern: `stroke:var(--eng-text)`, `fill:var(--eng-surface-2)`, `role="img"` + `<title>`), never raster images.

| Topic | Convention SQA marks | Evidence |
|---|---|---|
| 2 Energy | **Energy-transformation block diagram** (form-in → device → useful form + wasted form) and **energy audit** (input = useful + wasted). Forms named, not "energy". | Spec p.4; booklet 2 pp.5,15,17; QP "name the wasted energy" (2024 Q7(b)) |
| 3 Analogue | **BS/IEC circuit symbols** (cell, switch, resistor, **variable resistor**, **LDR**, **thermistor**, LED, buzzer, diode, motor, lamp, ammeter, voltmeter); **voltage-divider** layout; transistor-as-switch; LDR/thermistor **characteristic graphs** read from a table | Spec p.5; 2025 QP Q1 (symbols), Q14; 2024 QP Q8,Q10; **2025 Assignment Task 1b / 2024 Task 3b mark exact symbols** |
| 4 Logic & Prog. | **BS logic-gate symbols** (AND/OR/NOT, up to 3 inputs) + **truth tables** + **Boolean**; **flowchart symbols** (start/stop, input/output, **decision/branch**, loop) with **pin numbers + delay units** | Spec p.5; 2024 QP Q1,Q11(b),Q12(c),Q14(c); 2025 QP Q9,Q11; **2025 Assignment Task 2 + Task 4 mark symbols/pins** |
| 5 Mechanisms | **Gear-train diagrams + BS symbols**; **motion types** (rotary/linear/reciprocating/oscillating); idler vs compound; **velocity-ratio** convention (driven÷driver teeth = in÷out speed) | Spec p.5; 2024 QP Q4,Q9,Q15(d); 2025 QP Q4,Q5,Q14; **2025 Assignment Task 3** |
| 6 Pneumatics | **ISO 1219 / BS pneumatic symbols** (restrictor, **uni-directional restrictor**, **reservoir**, **3/2 & 5/2 valves**, **single/double-acting cylinders**, diaphragm/solenoid/push-button/lever/roller actuators); time-delay (reservoir+UDR); direction-of-stroke arrows | Spec p.6; 2024 QP Q3,Q15; 2025 QP Q8; **2025 Assignment Task 5 / 2024 Task 1 mark symbols + connections** |
| 7 Structures | **Free-body diagram**; **triangle of forces**; **tension/compression** member labels (tie/strut, arrow direction); **moments** (ΣCWM = ΣACWM, ΣFᵥ = 0) on balance/simply-supported beams; **material-property** comparison with justification | Spec p.6; 2024 QP Q6,Q13(c),Q14; 2025 QP Q10,Q11,Q13 |
| 8 Revision | re-uses all of the above as worked exemplars | — |

### 2.3 Calculation pages: equation-card machinery (Topics 2, 3, 5, 6, 7)
From `higher-topic-page-guide.md` — the part Topic 1 didn't need:
- **Equation cards** with **real 2-D fractions** using `fr-n`/`fr-d` (never `num`/`den`).
- **Two worked examples per equation**: (a) substitute-and-solve, (b) rearrange with **"numbers in first"**. Use SQA's own style: substitution mark, transposition mark, final-answer-with-unit mark, 2 s.f. (the MIs mark exactly this way — e.g. 2025 MI Q10(c) Ep, Q12(b) Eh: one mark substitution, one transposition, one answer-with-unit).
- **`.calc` side-note grid** for unit conversions; conversions placed **to the left** of worked examples (per the repo's established convention).
- **Data-booklet integration:** link `n4-n5-engineering-science-data-booklet-2.pdf` from each calc page's hero; reproduce the relevant formula row in the knowledge organiser (the data booklet is provided in the real exam, so teach pupils to use it).
- **SQA arithmetic conventions** the MIs enforce, surfaced on every calc page: convert time to seconds first; round to 2 s.f.; carry units; **follow-through error (FTE)** credit (so partial method still scores). These map straight onto the booklet-2 "Common Mistakes" list (p.24).

### 2.4 UX rules (carry Topic 1 improvements forward)
- Learn-sections **collapsible** (default open) — avoid Topic 1's single-scroll. Calculation topics are long; this is mandatory, not optional, for Topics 3/4/7.
- **Entry-point chooser** under the hero — *Revise / Worked examples / Exam practice* (calc topics) or *Revise / Check booklet / Exam practice* (qual topics). (Open Question 4 confirms whether to standardise this; recommended yes.)
- Concept density: one idea per card; equation card → worked examples → practice, in that order, with whitespace between "learn" and "test".
- Marking never colour-only; tap targets ≥44 px; no parallax/fixed backgrounds; `overflow-x` contained; `env(safe-area-inset-*)` on sticky chrome.

### 2.5 Content-depth / scope rules
- **Cover the spec content statement exactly — no more.** Each per-topic section below lists the spec bullets; the page teaches those and the past-paper-attested examples, and stops. (Topic 1's near-zero bloat is the target.)
- **Booklet-faithful definitions** verbatim; **British spelling**; N5 reading level; no teacher-only notes.
- **Command words:** teach *describe* (features) vs *explain* (cause + effect) per MI principles (j)/(k) — already flagged for Topic 1, applies to every topic's practice answers.
- **Liquid safety:** no `{{`/`{%` in inline CSS/JS. Pre-commit: tag balance, JS brace balance, every JS-referenced ID exists (per `higher-topic-page-guide.md`).

### 2.6 File / naming conventions
- Path: `classes/n5-engineering/<kebab-topic>.html` (mirrors Topic 1).
- Suggested filenames: `energy-and-efficiency.html` · `electronics-and-analogue-control.html` · `logic-and-programmable-control.html` · `mechanisms-and-drive-systems.html` · `pneumatics.html` · `structures-and-materials.html` · `assignment-prep-and-revision.html`.
- `localStorage` prefixes `n5e2-`…`n5e8-` (§1.3).
- Asset folders already exist (`…/national-5/02-…` through `07-…`, plus `04a-logic-and-digital-control` + `04b-programmable-control`, `assignment-prep`, `revision`).

---

## 3. Per-topic plans (Topics 2–8)

Each section gives: spec content → booklet/source status → section breakdown → exam-critical diagram/notation → **verified exam & assignment evidence (with year/question)** → reuse-vs-new notes.

---

### Topic 2 — Energy & Efficiency  ·  `n5e2-`  ·  Exam 5–10 marks/paper

**Spec content (p.4):** conservation of energy; calculations with kinetic, potential, electrical, heat energy; energy transfers/losses/transformations; energy audits + overall efficiency; `Ew=Fd`, `P=E/t`, `Ek=½mv²`, `Ep=mgh`, `Ee=VIt`, `Eh=cmΔT`, `η=Eout/Ein=Pout/Pin`; manipulating formulae.

**Source status:** ✅ **Booklet present** (`…/02-energy-and-efficiency/N5EngSci_Booklet_2_Energy_and_Efficiency_V2.pdf`, 24 pp). No PPT in repo. This is the only Topic 2–8 page with a ready booklet — **build it first.**

**Section breakdown (maps to booklet 2):**
1. **Forms of energy** (booklet p.3) — kinetic/potential/electrical/heat/chemical/light/sound; "the four used in calculations are Ek, Ep, Ee, Eh." Term table + `data-match` form-sorter.
2. **Energy in systems: input / useful output / wasted** (p.4) — + **energy-transformation block diagram** (p.5). Sorter for input/useful/wasted.
3. **Conservation of energy** (p.5, p.15) — `input = useful + wasted`; "account for the energy" task.
4. **Equation cards** (pp.7–12): `Ew=Fd`, `Ek=½mv²`, `Ep=mgh`, `Ee=VIt`, `Eh=cmΔT`, `P=E/t` — each with the §2.3 two-worked-example treatment, unit-conversion side-notes (time→s; J/kJ/MJ; g→kg), and the booklet's own "Try this" items as practice.
5. **Efficiency + energy audits** (pp.16–17): `η=Eout/Ein` ratio + `×100` percentage, also with power; **energy-audit diagram** (input/useful/wasted boxes) — builder widget. Booklet's "complete the audit" table.
6. **Engineering decision task** (p.18, "choose a motor") — a comparison/justify exemplar (this is the topic's *explain/recommend* skill, mirroring the assignment's evaluation stage).
- Booklet answers keyed to pp.6,13–14,15,17,19–20; knowledge organiser (p.24: formulae + conversions + common mistakes); RAG from booklet pp.2 success criteria (3 groups: forms, calculations, efficiency/audits).

**Exam-critical convention:** energy-transformation block diagram + energy audit, with **forms named** (not "energy"). 2 s.f., units, time-in-seconds.

**Verified evidence:**
| Idea | 🎯 Exam | 📘 Assignment |
|---|---|---|
| `Ee=VIt` | 2024 QP Q12(b); 2025 QP electrical-energy items | — |
| `Ek=½mv²` | 2024 QP Q13(b) | — |
| `Ep=mgh` | 2025 QP Q10(c) | — |
| `Eh=cmΔT` | 2025 QP Q12(b) | — |
| Efficiency `η=Eout/Ein` | 2025 QP Q10(d)(i) | reasoning in evaluation tasks |
| Name the wasted energy / friction loss | 2024 QP Q7(b), Q9(c); 2025 QP Q10(d)(ii) | improve-efficiency justify (2025 Task 2d/5c style) |

**Badge verdict:** **🎯 Exam (strong, every year).** 📘 Assignment **light** — energy/efficiency is not a standalone assignment task in 2024/2025; efficiency reasoning surfaces only in evaluation. Badge the page Exam-dominant; add a single Assignment note on efficiency-as-evaluation.

**Reuse vs new:** reuse all Topic 1 chrome/widgets. **New:** the entire equation-card system (this page sets the template every later calc page copies). Build this page carefully — it is the calculation prototype.

---

### Topic 3 — Electronics & Analogue Control  ·  `n5e3-`  ·  Exam 13–26 marks/paper (largest)

**Spec content (p.5):** function/purpose of battery, switch, resistor, variable resistor, LDR, thermistor, LED, buzzer, diode, motor, lamp, ammeter, voltmeter; circuit function as input–process–output; **Ohm's law**; resistors **series & parallel**; **voltage dividers** (fixed + variable, as input signal); interpreting LDR/thermistor characteristics; relays; protection diode; **transistor switching**; operating a control circuit (variable voltage divider + transistor + relay + output transducer).

**Source status:** ❌ no booklet/PPT in repo (`…/03-…` folder empty). Build from spec + data booklet + past papers, or source a booklet first (Open Question 1).

**Section breakdown:**
1. **Components & symbols** — BS/IEC symbol table (the 13 components above) + input/process/output classification (sensor/switch → resistor network/transistor → lamp/motor/buzzer). Symbol-matching widget.
2. **Ohm's law** equation card `V=IR` (+ rearrangements) — §2.3 treatment.
3. **Resistors in series & parallel** — `Rt=R1+R2…` and `1/Rt=1/R1+1/R2`; equation cards + worked examples (2024 QP Q8(a) is exactly this).
4. **Voltage divider** — fixed (`V1/V2=R1/R2`, output voltage) + variable (LDR/thermistor as input transducer); **characteristic-graph reading**; this is the page's flagship (designing a divider to give an input signal).
5. **Transistor as a switch + relay + protection diode** — the control circuit; "as temperature rises, R falls, Vin rises, transistor switches, output changes" narrative (2024 QP Q10(d), 2025 QP Q14(a)).
6. **Power** `P=VI`, `P=I²R`, `P=V²/R` (2025 QP Q11(e)).
- Knowledge organiser: symbols + formulae; common mistakes (symbol confusion, series/parallel mix-ups, divider direction).

**Exam-critical convention:** correct **BS component symbols** and **voltage-divider** layout; the input-transducer characteristic graph; transistor-switch behaviour described as a cause-effect chain.

**Verified evidence:**
| Idea | 🎯 Exam | 📘 Assignment |
|---|---|---|
| Component symbols (parallel, ammeter/voltmeter) | 2025 QP Q1 | symbols marked in input-sensing circuit |
| Series/parallel `Rt` | 2024 QP Q8(a); 2025 QP Q12(d) | — |
| Ohm's law `V=IR` | 2024 QP Q8(b); 2025 QP Q12(e) | — |
| Voltage divider (cold/dark sensor, `Vout`) | 2024 QP Q10(c); 2025 QP Q14(c) | **2025 Assignment Task 1b** (thermistor cold sensor); **2024 Task 3b** (LDR dark sensor) |
| Transistor/relay/LED switching narrative | 2024 QP Q10(d); 2025 QP Q14(a) | implied in build tasks |
| Power `P=I²R`/`P=V²/R` | 2025 QP Q11(e) | — |

**Badge verdict:** **🎯 Exam (the heaviest area of the whole paper) AND 📘 Assignment** (input-sensing circuit is a marked assignment task both years). Highest combined value of any topic — strong case for building it second.

**Reuse vs new:** reuse chrome + equation cards (from Topic 2). **New:** SVG circuit-symbol set; a voltage-divider "build the sensor circuit" widget (extends the Topic 1 tap-to-place builder); characteristic-graph SVG.

---

### Topic 4 — Logic & Programmable Control  ·  `n5e4-`  ·  Exam 13–24 marks/paper

**Spec content (p.5):** AND/OR/NOT gates + combinations up to 3 inputs (truth tables, logic diagrams, Boolean); microcontrollers in commercial/industrial use; **advantages/disadvantages vs hard-wired**; flowchart symbols (start, stop, input, output, **branch**, loop) with time delays + continuous/fixed loops; commands (high, low, for…next, if…then, pause, end). Asset folders split this as `04a-logic-and-digital-control` + `04b-programmable-control` — **one page covering both** (Open Question 3).

**Source status:** ❌ no booklet/PPT (folders empty).

**Section breakdown:**
1. **Logic gates** — AND/OR/NOT symbols + behaviour; **truth tables**; **Boolean** notation (`·`, `+`, overbar).
2. **Combining gates (≤3 inputs)** — build a logic diagram from a Boolean expression and vice-versa; truth table for a 3-gate system (2024 QP Q14(c), 2025 QP Q11(c)(d)). Truth-table + logic-diagram builder widget.
3. **Microcontrollers** — commercial/industrial examples; **advantages vs hard-wired** (reprogrammable, fewer components, cheaper to change) as a cause-effect/justify skill (2025 Assignment Task 2 context).
4. **Flowcharts** — standard symbols + conventions; **pin numbers + delay units**; time delays; **fixed vs continuous loops**; decisions. Build/trace-a-flowchart widget. (Flowcharts are the single biggest item: 2024 QP Q11(b) = 11 marks; 2025 QP Q9 = 10 marks.)
- Knowledge organiser: gate symbols + truth tables + flowchart symbols + common mistakes (decision Y/N placement, loop-back point, pin states).

**Exam-critical convention:** **BS logic symbols + correct truth tables + Boolean**; **flowchart symbols with pin numbers, delay units, decision Y/N and loop arrows in the right place** (the MIs mark each of these individually — 2025 MI Q9 lists 10 separate marks).

**Verified evidence:**
| Idea | 🎯 Exam | 📘 Assignment |
|---|---|---|
| NOT/AND/OR gate + truth table | 2024 QP Q1, Q12(c), Q14(c) | — |
| Logic diagram from Boolean / 3-gate truth table | 2025 QP Q11(c)(d) | **2025 Assignment Task 4** (`P=(S·D)+M`, truth table) |
| Flowchart (pins, delays, loops, decisions) | 2024 QP Q11(b) **11 mks**; 2025 QP Q9 **10 mks** | **2025 Assignment Task 2** (flume flowchart+circuit, 14 mks across 2a–d); **2024 Task 2** |
| Microcontroller advantages vs hard-wired | 2024 QP Q8(d); 2025 QP Q8(c) | justification context in Task 2 |

**Badge verdict:** **🎯 Exam AND 📘 Assignment — both heavy.** Flowcharts/logic are the largest single assignment build (≈14 marks in 2025). Build third.

**Reuse vs new:** reuse chrome. **New:** logic-gate SVG set, interactive **truth-table generator**, **flowchart-builder** (the most complex new widget — tap-to-assemble flowchart with pin/delay slots; biggest engineering effort of the seven pages; reusable on Topic 8).

---

### Topic 5 — Mechanisms & Drive Systems  ·  `n5e5-`  ·  Exam 7–12 marks/paper

**Spec content (p.5):** motion types (rotary, linear, reciprocating, oscillating); **simple gear trains, idler gears**, diagrams/conventions; **compound gear trains**; **velocity ratio** of simple & compound; **effects of friction**; **British Standards symbols**. (Spec support notes p.19 also mention belt & chain drives.)

**Source status:** ❌ no booklet/PPT.

**Section breakdown:**
1. **Motion types** — rotary/linear/reciprocating/oscillating with engineered examples; identify-the-motion sorter (2025 QP Q5; 2024 QP Q15(d)).
2. **Gears & gear trains** — BS gear symbols; driver/driven/idler; direction of rotation (idler reverses).
3. **Velocity ratio** equation card — `VR = driven teeth ÷ driver teeth = input speed ÷ output speed`; simple + **compound** trains; worked examples (2024 QP Q9(a) compound = 4 marks; 2025 QP Q14(d)).
4. **Friction in drive systems** — effects + reduction (lubrication/bearings), as cause-effect (2024 QP Q9(c)).
5. *(Optional, spec support note)* belt & chain drives.
- Knowledge organiser: motion types + VR formula + symbols + common mistakes (idler effect, ratio simplification, RPM not accepted as a unit per MI).

**Exam-critical convention:** **gear-train diagram + BS symbols**; **velocity-ratio** convention and ratio simplification; "do not accept RPM" (2024/2025 MI).

**Verified evidence:**
| Idea | 🎯 Exam | 📘 Assignment |
|---|---|---|
| Velocity ratio (simple) | 2024 QP Q4; 2025 QP Q4(c) | **2025 Assignment Task 3b** (calculate actual VR) |
| Compound gear train / output speed | 2024 QP Q9(a); 2025 QP Q14(d) | **2025 Assignment Task 3d** (design compound train 20–30:1) |
| Direction (idler, compound) | 2025 QP Q4(b); 2025 QP Q14(e) | **2025 Assignment Task 3a/3c** (direction + spec check) |
| Motion type | 2024 QP Q15(d); 2025 QP Q5 | — |
| Friction effects | 2024 QP Q9(c) | — |

**Badge verdict:** **🎯 Exam AND 📘 Assignment** — Task 3 (motorised cover, ≈9 marks) is essentially a gear-train design/test exercise.

**Reuse vs new:** reuse chrome + equation card. **New:** gear-train SVG (with teeth counts), a velocity-ratio calculator/checker widget, motion-type sorter.

---

### Topic 6 — Pneumatics  ·  `n5e6-`  ·  Exam 7–12 marks/paper

**Spec content (p.6):** symbols + operation of restrictor, **uni-directional restrictor**, **reservoir**, **5/2 valve**, actuators (diaphragm, solenoid); **pneumatic time-delay circuits**; **force/pressure/area** in single- & double-acting cylinders (`P=F/A`, `A=πd²/4`); controlling speed & force.

**Source status:** ❌ no booklet/PPT.

**Section breakdown:**
1. **Components & symbols** — ISO 1219/BS symbol table: 3/2 & 5/2 valves, single/double-acting cylinders, restrictor, UDR, reservoir, actuators (diaphragm, solenoid, push-button, lever, roller-trip). Symbol-matcher.
2. **How a circuit works** — actuation sequence narrative (valve actuated → pilot air → cylinder out/in-strokes), the most-marked descriptive skill (2024 QP Q15(a) = 5 marks; 2025 QP Q8(b) = 4 marks). Sequence-ordering widget.
3. **Time delay** — reservoir + UDR; "outstroke slowly and smoothly."
4. **Force / pressure / area** equation cards — `P=F/A` and `A=πd²/4`; single vs double-acting; worked examples (2024 QP Q15(b); 2025 QP Q8(d)).
5. **Controlling speed & force** — restrictor on exhaust, UDR direction (2024 QP Q15(c)).
- Knowledge organiser: symbols + `P=F/A`/area + common mistakes (UDR direction, exhaust-port restriction).

**Exam-critical convention:** **ISO 1219 pneumatic symbols, valve/cylinder connections, direction-of-stroke arrows, UDR orientation** (all marked individually in the assignment MI — 2025 Task 5b lists 5 separate marks; "connections must be shown").

**Verified evidence:**
| Idea | 🎯 Exam | 📘 Assignment |
|---|---|---|
| Symbol/operation, valve sequence | 2024 QP Q3, Q15(a); 2025 QP Q8(b) | **2025 Assignment Task 5a/5b** (build circuit, 7 mks); **2024 Task 1b** (5 mks) |
| `P=F/A`, piston area `A=πd²/4` | 2024 QP Q15(b); 2025 QP Q8(d) | — |
| Restrictor / speed control / time delay | 2024 QP Q15(c); 2025 QP context | **2025 Task 5b** (UDR, reservoir time-delay); **2024 Task 1b** (UDRs) |
| Safety modification + justify | — | **2025 Task 5c**; **2024 Task 1** |

**Badge verdict:** **🎯 Exam AND 📘 Assignment — both strong.** Pneumatics is a reliable ≈9-mark assignment build.

**Reuse vs new:** reuse chrome + equation cards. **New:** pneumatic-symbol SVG set; a sequence-ordering widget (reuse Topic 1's tap-to-place); cylinder force/area calculator.

---

### Topic 7 — Structures & Materials  ·  `n5e7-`  ·  Exam 13–22 marks/paper

**Spec content (p.6):** effects of force (**tensile/compressive**); concurrent forces + equilibrium; **triangle of forces + free-body diagrams**; non-concurrent + parallel forces; **moment of a force**; **principle of moments** calcs; balance/simply-supported beams + **reaction forces**. Materials: **selecting material with justification**; **direct stress σ=F/A**; **strain ε=Δl/l**.

**Source status:** ❌ no booklet/PPT.

**Section breakdown:**
1. **Forces & effects** — tension vs compression (tie/strut), arrow directions on members (2024 QP Q6(a); 2025 QP Q11(a)).
2. **Free-body diagrams & triangle of forces** — equilibrium of concurrent forces (2025 QP Q13(a)).
3. **Moments** equation card — principle of moments `ΣCWM=ΣACWM`, `ΣFᵥ=0`; balance & simply-supported beams; reaction forces (2024 QP Q14(a) = 5 marks; 2025 QP Q13(b)(c)).
4. **Stress** equation card — `σ=F/A` (2024 QP Q6(b); 2025 QP Q10(e)).
5. **Strain** equation card — `ε=Δl/l` (2024 QP Q14(b); 2025 QP Q11(b)).
6. **Material selection** — property comparison (strength, corrosion resistance…) with **justification** (2024 QP Q13(c): "corrosion resistant and high strength — do not accept 'strong'").
- Knowledge organiser: free-body/moments conventions + `σ`/`ε` formulae + material properties + common mistakes ("strong" not accepted; CWM/ACWM signs).

**Exam-critical convention:** **free-body diagram + tension/compression labelling + triangle of forces**; **moments layout** (`ΣCWM=ΣACWM`, `ΣFᵥ=0`); stress/strain formulae with units; **justified** material choice.

**Verified evidence:**
| Idea | 🎯 Exam | 📘 Assignment |
|---|---|---|
| Tension/compression members | 2024 QP Q6(a); 2025 QP Q11(a) | structural reasoning in design |
| Free-body / triangle of forces | 2025 QP Q13(a) | — |
| Moments + reaction forces | 2024 QP Q14(a); 2025 QP Q13(b)(c) | — |
| Stress `σ=F/A` | 2024 QP Q6(b); 2025 QP Q10(e) | — |
| Strain `ε=Δl/l` | 2024 QP Q14(b); 2025 QP Q11(b) | — |
| Material selection + justify | 2024 QP Q13(c) | material-choice reasoning in design/eval |

**Badge verdict:** **🎯 Exam — very strong** (Structures + Materials combine to 13–22 marks, second only to electronics). 📘 Assignment **light–moderate** (force/material reasoning supports design/evaluation but isn't a standalone marked build in 2024/2025). Badge Exam-dominant.

**Reuse vs new:** reuse chrome + equation cards. **New:** free-body/triangle-of-forces SVG; moments/beam diagram; a force/moments/stress/strain calculator; material-property comparison table widget.

---

### Topic 8 — Assignment Preparation & Mixed Revision  ·  `n5e8-`  ·  the assignment = 50 marks (31%)

**Not a new-content page** — a **skills + revision hub**. The assignment (spec p.10) is marked across **Analysis 4–8 · Designing 8–12 · Building 8–12 · Testing 8–14 · Evaluation 8–14**, closed-book, 8 hours.

**Source status:** assignment papers + MIs (2024, 2025) and specimen CAT all present; an `assignment-prep` asset folder and an existing `classes/n5-engineering-assignment-prep.html` exist (Open Question 5: integrate vs separate).

**Section breakdown:**
1. **What the assignment is** — 5 stages, marks, conditions (closed-book, no internet/AI, individual, MFI image marking, A4 + SCN labelling).
2. **The recurring task types** (evidenced across 2024/2025) as worked exemplars, each linking back to its topic page:
   - **System + sub-system diagram with boundary, drivers, feedback** (Task 1 2025 / Task 3 2024) → Topic 1.
   - **Input-sensing circuit** (thermistor/LDR) (Task 1b 2025 / Task 3b 2024) → Topic 3.
   - **Flowchart + microcontroller circuit, integrate & test** (Task 2) → Topic 4.
   - **Logic diagram + truth table** (Task 4 2025) → Topic 4.
   - **Gear train design/test** (Task 3 2025) → Topic 5.
   - **Pneumatic circuit + safety modification** (Task 5 2025 / Task 1 2024) → Topic 6.
3. **Stage skills** — Analysis (read the spec, identify the problem), Design, Build/simulate (Yenka/logic/pneumatics evidence + hard copy), Test (planned test → result → amendment → re-test, the exact 2024/2025 testing-table pattern), Evaluate (against spec, "improve & justify" with cause-effect).
4. **Mixed revision** — a cross-topic MCQ quiz sampling all 7 topics; the **Past-Paper Finder** (topic-indexed 2014–2023) and QP/MI links; a whole-course RAG.

**Exam-critical convention:** none new — it consolidates every topic's convention. Emphasise the **testing-table method** and **"describe a modification and justify it"** (cause-effect) which recur in every assignment.

**Badge verdict:** the whole page is **📘 Assignment**, with a **🎯 Exam** "mixed practice" sub-section.

**Reuse vs new:** mostly assembly + links; reuse the quiz/RAG engines across all topics; the main new asset is the worked-exemplar gallery of the recurring assignment tasks.

---

## 4. Open questions / assumptions to confirm

1. **Booklets for Topics 3–7 don't exist in the repo.** Only Topic 2 has a booklet; folders `03`–`07` are empty. This is the biggest blocker. Options: **(a)** author/source booklets first (keeps the "page mirrors booklet" model and the booklet-answers + RAG-from-success-criteria sections intact); **(b)** build pages from the spec + data booklet + past papers, deriving practice from past-paper questions and writing success criteria to match the spec. **Assumption:** Topic 2 proceeds now on its booklet; Topics 3–7 need a decision before build. *Recommend (a) where possible, (b) as fallback with spec-derived criteria.*
2. **Practice-question sourcing without a booklet.** For Topics 3–7, may I draw practice questions from the **past papers** (paraphrased, with the marking-instruction answers as reveals, citing year/Q), rather than booklet questions? This is the natural substitute and aligns the page to real exam style. *Assumption: yes, paraphrased + attributed.*
3. **Topic 4 — one page or two?** Asset folders split logic (`04a`) and programmable (`04b`). The hub lists a single "4. Logic and Programmable Control." *Assumption: one page with two major sections.* Confirm.
4. **Standardise the entry-point chooser?** Topic 1 shipped without the planned mode chooser. Recommend adding *Revise / Worked examples / Exam practice* to every calc page (and *Revise / Check booklet / Exam practice* to qualitative ones). Confirm you want this as a standard, and whether to retrofit Topic 1.
5. **Topic 8 vs the existing `n5-engineering-assignment-prep.html`.** There is already a flat assignment-prep page. *Assumption:* Topic 8 = a revision/skills hub that **links to** (not replaces) the existing prep page, and the hub's "8." `<details>` points to it. Confirm whether to merge them.
6. **Equation-card house style.** Confirm Topic 2 should set the canonical calc template (fractions, two worked examples, `.calc` grid, data-booklet links) that Topics 3/5/6/7 copy — i.e. invest extra care in Topic 2 as the prototype. *Assumption: yes.*
7. **Data booklet on calc pages.** Assumption: link `n4-n5-engineering-science-data-booklet-2.pdf` from every calculation page's hero and reproduce relevant formula rows, since it's provided in the real exam. Confirm.
8. **Badge evidence horizon.** Badges here are justified from 2024 + 2025 (the strongest, most recent primary evidence) plus the spec mark ranges. The topic-indexed 2014–2023 Finder can deepen this if you want more years cited per badge. *Assumption: 2024/2025 + spec ranges are sufficient; deeper citation optional.*

---

## 5. Suggested build order & priority

Ordering balances **(a) source-material readiness**, **(b) exam mark weight**, **(c) assignment weight**, and **(d) template dependencies** (the equation-card and widget templates compound).

| Order | Topic | Why here | Blocker |
|---|---|---|---|
| **1** | **2 Energy & Efficiency** | Booklet ready; natural sequence; **establishes the equation-card template** every later calc page reuses; moderate scope | none — **build now** |
| **2** | **3 Electronics & Analogue** | **Largest exam area (13–26)** + a marked assignment task; reuses Topic 2's calc template | needs booklet (OQ 1) |
| **3** | **4 Logic & Programmable** | Big exam (13–24) **and** the biggest assignment build (≈14 mks); flowchart widget is reusable in Topic 8 | needs booklet; biggest new-widget effort |
| **4** | **6 Pneumatics** | Strong assignment build (≈9 mks) + reliable exam; symbol-set + sequence widget | needs booklet |
| **5** | **5 Mechanisms & Drive** | Assignment build (≈9 mks) + exam; gear SVG + VR calculator | needs booklet |
| **6** | **7 Structures & Materials** | **Heavy exam (13–22)** but lighter assignment; most new diagram types (free-body, moments, stress/strain) | needs booklet |
| **7** | **8 Assignment + Revision** | **Build last** — it assembles worked exemplars and links from every finished topic page | depends on 1–6 + OQ 5 |

**Fast-track alternative if booklets stay unavailable:** build **Topic 2 now**, then jump to **Topic 8** (assignment hub) using only the already-present assignment papers/MIs + Past-Paper Finder — it needs no booklet and delivers high revision value before Topics 3–7 are unblocked.

**Cross-cutting deliverable:** as each page goes live, flip its `<details>` on `classes/n5-engineering-science.html` from "Coming Soon" to a Topic-N revision-page `resource-card` (exactly as Topic 1's entry, lines 62–78 of the hub).
