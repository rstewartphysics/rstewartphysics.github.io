# S3 Engineering Science — build-spec outline for all 8 topic pages

Build-spec for the S3 Engineering topic pages. **Booklet 1 (`what-is-an-engineer.html`) is
fully built and is the canonical S3 template** — copy its structure, chrome, widget styles and
progress wiring. The other six existing pages (`energy`, `electronics`, `computer-control`,
`logic`, `mechanisms`, `pneumatics`) are 24-line skeletons to be **replaced in place** (keep
their URLs); Booklet 8 (Final Engineering Challenge) has **no page yet**.

**Sources of truth:** the BHS S3 booklets in OneDrive (`…/Engineering/S3/Booklet 1–8`,
RESTYLED/FINAL versions), plus repo guides (`CLAUDE.md`, `progress-system-guide.md`). The web
pages **enhance** the booklets — interactive versions of the booklet tasks, instant feedback,
revision quizzes — they do not replace classwork.

**S3 voice (from the booklets — keep it):** "Working like an engineer" framing; *what + why*
answer structure; R/A/G self-assessment; predict → test → record → improve; dual practical
routes (physical kit vs simulation); careers links to local industry; "⭐ Step up to National 5"
progression boxes. This is BGE-level: concrete, low-jargon, minimal maths.

---

## 0. The finished N5 template — build to this, do not retrofit it later

Added 27 August 2026, from `_notes/engineering-pages-visual-update-plan.md` Phase 5. The eight N5
topic pages have been through the visual coherence pass; the S3 pages have not been written yet, so
they should be built to the finished template and never need the retrofit.

**Stylesheets — link both, in this order.**

```html
<link rel="stylesheet" href="/assets/css/engineering-science.css?v=eng-YYYYMMDDx">
<link rel="stylesheet" href="/assets/css/engineering-topic.css?v=engt-YYYYMMDDx">
```

`engineering-science.css` is the chrome (tokens, banner, subnav, `.container`, `.card`, `.cta`,
and the deck-link layer). `engineering-topic.css` is the component layer extracted from the N5
pages — `.panel`, `.sec`, `.keypoint`, `.note`, `.exam-ref`, `.example`, `.practice`, `.widget`,
`.btn`, the maths components. **Do not paste a copy of either into the page.** Keep inline only
what is genuinely unique to that page. Bump `?v=` in the same edit as any sheet change — a stale
`?v=` silently serves the old CSS and makes a real change measure as no change.

**`<body class="eng-dense">`** — this one class turns on the density pass: de-boxed `.note` and
`.exam-ref`, un-nested `.widget`, the compact mode chooser, the 78ch measure, two columns above
1000px, and the short-landscape treatment. Without it the page renders in the old boxed style.

**Three button weights, and each means exactly one thing.**

| Component | Means | Use for |
|---|---|---|
| `.cta` filled orange | do the main thing on this page | the booklet PDF. **At most one above the fold** |
| `.reslink` teal chip | take this away | decks, booklets, data sheets, past papers, simulators |
| `.btn` neutral outline | operate this control | widget buttons, and in-page `#anchor` jumps |

Convert by destination, not by eye: an `<a>` whose href leaves the page is a `.reslink`; an `<a>`
to a bare `#anchor` and every `<button>` stay `.btn`. Never `.btn.primary` on a widget's Check
button — orange has to keep meaning one thing.

**Booklet references are page numbers.** `.page-ref` reads `Booklet p.4` / `Booklet pp.13–14`,
never `§1` (DECK-RULES **6a**, global to every deck and page: a pupil finds a page). Take the
numbers from the booklet's own printed footer.

**Past-paper references are visible text**, never a `title=` tooltip — there is no hover on an
iPad. Use `.exam-ref` under the section's `.keypoint`, each reference in its own `<b>`.

**Deck links.** When an S3 deck exists, it gets a `.reslink` in its lesson's section and a
`.top-pills` row under the backlink, exactly as the N5 pages do. If S3 gains enough decks it gets
its own `classes/s3-engineering/slides.html`, copied structurally from
`classes/n5-engineering/slides.html`. Note for that page: paint in an SVG `<symbol>` must be
inline `style=` on every shape — document CSS cannot reach into a `<use>` shadow tree and
class-styled shapes render solid black.

**Colour.** `--eng-orange` and `--eng-teal` both fail AA as text (3.4:1 and 2.94:1). Small text on
accent uses `--eng-ink-accent` or `--eng-ink-teal`. Check contrast against **composited**
backgrounds — a translucent tint read as opaque gives a false pass.

**Any page where a pupil does a task** still obeys the one-screen rule in `CLAUDE.md`: question,
pieces and working area on one 1180 × 760 landscape screen. On a topic page the working version of
that rule is narrower — once the pupil has scrolled to a widget, its question, working area and
Check button fit one screen. Long lists (a 10-question quiz, a RAG self-check) are exempt; they are
lists, not tasks.

**The banner is not slimmed to a strip on short landscape.** The task pages do that, but this art
is 3:1 and carries the subject title, so a 15:1 strip crops through it. `engineering-topic.css`
hides the image and turns its overlay into a slim title bar instead; inherit that, do not override it.

---

## 1. Shared build recipe (every page)

### Files & URLs
```
classes/s3-engineering/what-is-an-engineer.html   — B1 ✅ BUILT (template)
classes/s3-engineering/energy.html                — B2 (replace skeleton)
classes/s3-engineering/electronics.html           — B3 (replace skeleton)
classes/s3-engineering/computer-control.html      — B4 (replace skeleton)
classes/s3-engineering/logic.html                 — B5 (replace skeleton)
classes/s3-engineering/pneumatics.html            — B6 (replace skeleton)
classes/s3-engineering/mechanisms.html            — B7 (replace skeleton; retitle page
                                                     "Mechanisms & Structures" to match booklet)
classes/s3-engineering/final-challenge.html       — B8 (new page + new hub card)
```
**Hub fix while flipping cards:** the hub (`classes/s3-engineering-science.html`) currently
numbers Mechanisms=6 / Pneumatics=7, but the booklets are 6=Pneumatics / 7=Mechanisms &
Structures — align hub card order and titles to the booklets, and add card 8 (Final Challenge).

### Head (copy from `what-is-an-engineer.html`, change titles)
- Front matter `layout: none`, `title: <Topic> | S3 Engineering Science`.
- `color-scheme: light dark`; theme-color `#fbf6ef` / `#15110b`.
- Links/scripts in order: `site-menu.css`, `site-menu.js` (defer), `progress.js` (defer),
  `progress/eng-s3.js` (defer), `widget-kit.js` (defer),
  `engineering-science.css?v=eng-YYYYMMDD`.
- Page styles inline (the template's `wie-*` component classes — rename prefix per page or
  extract the common set; follow whatever the template does at build time).

### Body skeleton (same order as the template)
1. Skip link; `{% include site-menu.html %}`; banner
   `/assets/s3-engineering-science-banner.jpeg` + overlay (topic title / "S3 Engineering Science").
2. Sticky subnav: one link per section + `Booklet Answers` + `Quiz` + `Self-check`;
   `.subnav-cta` → `/classes/s3-engineering-science.html` ("S3 hub").
3. Hero section (topic framing, "working like an engineer" strapline) → modes bar ("How do you
   want to use this page?") → content sections (`wie-section` pattern, `feature` for
   highlights) → **Booklet Answers** (`details.reveal` per booklet task — model answers for
   fill-in tables/sentences) → **Quiz** (~8–10 MC, `data-prog-challenge="ch-quiz"`) →
   **Self-check** (R/A/G list from the booklet success criteria).
4. `{% include site-footer.html %}`.

### Interactives (the S3 house style, all from the template)
Sorters (`wie-sorter`), match tasks (`cs-match`), mini-sims (`wie-sim`) — each with
`data-prog-challenge="ch-<slug>"`. 3–5 challenges per page. Booklet fill-in tables become
interactive: predict-then-reveal, drag-to-column sorts, complete-the-sentence cloze
(`.prog-cloze` auto-bound by the engine).

### Progress wiring (run `/add-progress`)
`Progress.markSeen('<page-id>')` + challenge hooks; register badge in
`assets/js/progress/eng-s3.js` (pattern: `eng-what-engineer` exists); add
`data-prog-badges="<id>"` to the hub card.

| Page | page-id / badge | Badge name (suggested) |
|---|---|---|
| What is an Engineer? | `eng-what-engineer` | Engineering Explorer 🧭 *(live)* |
| Energy | `eng-s3-energy` | Energy Auditor ⚡ |
| Electronics | `eng-s3-electronics` | Circuit Starter 🔌 |
| Computer Control | `eng-s3-control` | Code Controller 🤖 |
| Logic | `eng-s3-logic` | Logic Thinker 🚦 |
| Pneumatics | `eng-s3-pneumatics` | Air Mover 💨 |
| Mechanisms & Structures | `eng-s3-mechanisms` | Motion Maker ⚙️ |
| Final Challenge | `eng-s3-challenge` | Team Engineer 🏆 |

### Standard closing sections (every page, from the booklets)
- **Careers link** — the booklet's job list + local contexts (Torness, farms, factories);
  keep short, styled as a feature card.
- **⭐ Step up to National 5** — the booklet's progression box verbatim; link the matching
  N5 topic page once it exists.
- **Challenge / Extension** — booklet challenges as collapsible cards.

---

## 2. Booklet 1 — What is an Engineer? ✅ BUILT

Live at `what-is-an-engineer.html` (hero, engineer-types sorter, systems sim, Duns Park case
study, impacts sorter, booklet answers, quiz, self-check). No rebuild needed — it defines the
patterns above. Only touch it to add cross-links to new pages as they publish.

---

## 3. Booklet 2 — Energy (`energy.html`)

The one S3 page with real calculation content — borrow the N5 energy page's equation-card and
worked-example treatment, but keep S3-light (formula given, substitute, answer with unit).

**Subnav:** Forms · Transfers · Power · Efficiency · Saving energy · Energy audit · Answers · Quiz · Self-check

| # | Section | Content & interactives |
|---|---|---|
| 1 | What is energy? / Forms | Joules (J, kJ, MJ); why engineers care (cost, environment, better design); 8 forms table (chemical, kinetic, gravitational potential, electrical, heat, light, sound, elastic). **Widget:** match-object-to-energy-form (`ch-match-forms`) — booklet Quick Match (kettle, wind turbine, battery, LED torch, car engine, speaker, elastic band, skier). |
| 2 | Energy transfers | Input → useful output + wasted output; kettle worked example; booklet systems table (charger, bulb, motor, petrol car, wind turbine, loudspeaker) as an interactive fill-in with reveal (`ch-transfers`). |
| 3 | Power | `P = E ÷ t`, watts; drill worked example (600 J / 4 s → 150 W); two practice calcs (800 J/5 s; 1500 J/10 s) with reveal working. |
| 4 | Efficiency | `efficiency = useful ÷ total × 100`; kettle worked example (160/200 → 80%); booklet practice set (bulb 60%, motor 40%, fan 75%, heater 80%, machine 15%) as auto-marked inputs (`ch-efficiency`) — flagship widget with `record`. Challenge: old bulb vs LED comparison; percentage-points question. Rules: always %, never >100%. |
| 5 | Saving energy & sustainability | Why efficiency matters list; improvement methods table (materials, insulation, friction, design, sensors/control, renewables); match-the-improvement task (`ch-improve`). |
| 6 | Working like an engineer — Energy audit | The booklet's team audit as a structured guide (plan → record use → useful/wasted → improvements → impact) — page supports the class activity, doesn't replace it. Torness careers card. |

**Answers:** model answers for Quick Match, transfer tables, all calcs (with working), challenge Qs.
**Quiz:** 8 MC (form ID, useful vs wasted, one power calc, two efficiency calcs, >100%
impossible, improvement methods). **Step up to N5** box → links `energy-and-efficiency.html`.

---

## 4. Booklet 3 — Electronics (`electronics.html`)

**Subnav:** What is electronics · Symbols · Circuits · Breadboard · V, I & R · Series & parallel · Sensors · Design task · Answers · Quiz · Self-check

| # | Section | Content & interactives |
|---|---|---|
| 1 | What is electronics? | Sense/decide/control/respond; everyday examples; spot-the-electronics I/O table as interactive (`ch-spot`). |
| 2 | Circuit symbols | Symbol grid (cell/battery, switch, lamp, LED, resistor, variable resistor, motor, buzzer, LDR, thermistor, ammeter, voltmeter) — inline SVG, UK rectangle style, reuse N5/Electronics assets. **Widget:** match-component-to-use (`ch-match-comp`). |
| 3 | Complete circuits | Complete-loop rule; LED polarity (long leg = +); LED always needs a resistor; "Will it work?" scenarios as predict-and-reveal (`ch-will-it-work`); common-mistakes list. |
| 4 | Breadboard basics | Power rails / rows-of-5 / centre gap — labelled SVG diagram; build-safely checklist; Practical 1 (LED circuit) as an illustrated step guide with check table. |
| 5 | Current, voltage & resistance | Water-pipe analogy table (I amps, V volts, R ohms); multimeter use (across for V, in line for I); Practical 3 guide. **Challenge sub-panel:** Ohm's law `V = I × R` worked example (0.02 A × 220 Ω = 4.4 V) + 2 practice — flag as challenge/N5-taster. |
| 6 | Series & parallel | Comparison table (loop vs branches; current; voltage; one-breaks behaviour); Practical 4 (Yenka lamps) as predict/test guide. **Widget:** series-vs-parallel lamp sim (`ch-series-parallel`) — flagship. |
| 7 | Sensors & outputs | Input → process → output; LDR + thermistor behaviour cards; Practical 5 (night light / temperature warning) guide. |
| 8 | Design task + fault-finding | Team design brief menu (night light, temperature warning, door alarm, motor control, light-level indicator) with constraints & roles; Yenka + breadboard checklists; fault-finding table (LED reversed, missing resistor, wrong row, loose wire, flat battery) as diagnose-the-fault challenge (`ch-fault`). Careers card. |

**Answers:** model answers for match tasks, will-it-work, practical expected results, challenge calcs.
**Quiz:** 8–10 MC (symbol ID ×2, LED rules, series vs parallel, sensor behaviour, fault
diagnosis). **Step up to N5** box (voltage divider preview) → links N5 electronics page.

---

## 5. Booklet 4 — Computer Control (`computer-control.html`)

**Subnav:** Computer control · Microcontrollers · Duino.app · Arduino C++ · Practicals · Flowcharts · Mini system · Debugging · Answers · Quiz · Self-check

| # | Section | Content & interactives |
|---|---|---|
| 1 | What is computer control? | Reads inputs, runs program, switches outputs; everywhere-list; I-P-O tables (microwave, smoke alarm, crossing, washing machine) as interactive fill-in (`ch-ipo`). |
| 2 | Microcontrollers | Small computer on a chip; Arduino; why engineers use them (one chip, reprogrammable, cheaper, upgradable). |
| 3 | Duino.app workflow | 8-step workflow as a visual stepper; before-I-run checklist. |
| 4 | Arduino C++ for beginners | **Enrichment callout (verbatim from booklet): C++ goes beyond N5 — the exam uses flowcharts/pseudocode; plan the flowchart first.** Building-blocks table (`//`, `setup()`, `loop()`, `{}`, `;`, `pinMode`, `digitalWrite`, `delay`); Python-vs-C++ note; annotated Blink code block with hover/tap explanations. **Widget:** find-the-line quiz on Blink (`ch-blink`). |
| 5 | Practicals 1–4 | Four cards: Blink (edit delays test table), Button input (`digitalRead`/`if-else`, swap-HIGH-LOW edit), Buzzer patterns (timed loop), Light sensor (`analogRead`, threshold, TODO fill-ins). Each: I-P-O strip, both hardware routes (Uno+breadboard / Grove), code block, test table, debugging table. **Widget:** predict-the-output code challenge (`ch-code-predict`) — flagship. |
| 6 | Flowcharts for control | Five symbols table; match-symbol task; order-the-flowchart (button→LED) as drag-sequencer (`ch-flow-order`); night-light flowchart exercise. |
| 7 | Mini control system (Practical 5) | Team brief menu (night light, button alarm, light-level warning, pedestrian crossing, reaction timer, fan control); constraints; roles; starter template code with TODOs; test/debug/improve/explain steps. |
| 8 | Debugging like an engineer | Common-faults list (pins, semicolons, brackets, upload, board/port, LED, wiring, threshold); diagnose-the-fault table as challenge (`ch-debug`). Careers card (control/automation/robotics/embedded + local contexts). |

**Answers:** I-P-O model answers, practical expected results, flowchart order, debug causes/fixes.
**Quiz:** 8–10 MC (what a microcontroller does, setup vs loop, command meanings, ms conversion,
flowchart symbols, threshold logic). **Step up to N5** box (flowcharts/pseudocode focus) →
links N5 logic-and-programmable-control page.

---

## 6. Booklet 5 — Logic & Digital Control (`logic.html`)

**Subnav:** What is logic · Digital signals · NOT · AND · OR · Truth tables · Combined logic · Design challenge · Answers · Quiz · Self-check

| # | Section | Content & interactives |
|---|---|---|
| 1 | What is logic? / Digital signals | Two-state decisions; where engineers use logic; 1/0 = ON/OFF = TRUE/FALSE; 1-or-0 sorter (`ch-one-zero`). |
| 2 | NOT gate | Reverses input; warning-light example; truth table; interactive gate: click input, watch output. |
| 3 | AND gate | Both inputs = 1; guard-AND-start safety example; 4-row truth table; predict-then-test pattern (from Yenka tasks). |
| 4 | OR gate | Either input; two-door alarm example; truth table. **Widget (spans 2–4):** interactive gate playground NOT/AND/OR with predict mode (`ch-gates`) — flagship; mirrors the booklet's Yenka predict→test→record flow. |
| 5 | Comparing gates | Summary table (what it does / when output is 1 / example use); match-problem-to-gate task (`ch-match-gate`). |
| 6 | Truth tables like an engineer | "A truth table is a TEST RECORD"; worked OR example; guided AND; independent NOT; fill-in truth-table challenge with auto-mark (`ch-ttable`). |
| 7 | Combined logic | AND + NOT example (buzzer when alarm ON AND door OPEN); machine-safety system (guard AND start, optional NOT-safe LED); test-every-combination discipline. |
| 8 | Design challenge + fault-finding | Team brief menu A–H (safety guard, door alarm, cupboard alarm, lift door, seatbelt, warning light, two-button start, fridge alarm); constraints (≥2 inputs, truth table, logic diagram, test every combination); roles; common logic faults + diagnose table (`ch-logic-fault`). Careers card. |

**Answers:** truth tables, gate choices, fault causes/fixes, challenge Qs (incl. 3-input OR
8-row table). **Quiz:** 8 MC (gate behaviour ×3, truth-table rows, best-gate-for-scenario ×2,
why test every combination). **Step up to N5** box (Boolean expressions, 3 inputs) → links N5
logic page.

---

## 7. Booklet 6 — Pneumatics (`pneumatics.html`)

**Simulator-first:** every practical has a NoPressureSim route
(https://sites.google.com/view/nostrainsim/pneumatics) — link prominently as sim-task cards
(same pattern as the N5 pneumatics page).

**Subnav:** What is pneumatics · Safety · Components · I-P-O · Diagrams · Cylinders · Speed control · Design task · Answers · Quiz · Self-check

| # | Section | Content & interactives |
|---|---|---|
| 1 | What is pneumatics? | Compressed air = squashed air storing energy; push/pull/lift/hold/clamp; spot-the-pneumatics tick task (`ch-spot-pneu`); real-world examples table; advantages vs limitations. |
| 2 | Safety | Booklet safety rules as an interactive tick-to-confirm checklist (`--warm` caution styling); one what+why explain prompt. |
| 3 | Components | Component table (air supply/compressor, regulator, tubing, valve, push-button valve, lever/roller valve, SAC, DAC, flow control valve, exhaust) with simple symbol SVGs; match-component-to-job (`ch-match-pneu`). |
| 4 | Input, process, output | Worked clamp example; I-P-O fill-in (clamp, bus door, gripper, lifting platform) (`ch-ipo-pneu`). |
| 5 | Reading circuit diagrams | Symbol basics (line=tubing, boxed square=valve, rod rectangle=cylinder, triangle=exhaust, circle+arrow=supply); predict-from-diagram tasks. |
| 6 | Cylinders (Practicals 1–3) | SAC (air out, spring back) and DAC (air both ways) with labelled SVGs and compare table; three practical cards each showing **both routes** (physical kit checklist / NoPressureSim build steps) + test tables. **Widget:** animated cylinder sim — press valve, watch extend/retract, toggle SAC/DAC (`ch-cylinder`) — flagship. |
| 7 | Speed control (Practical 4) | Flow-control valve; fair-test reminder; low/medium/high results pattern; why slower can be safer. |
| 8 | Design task + fault-finding | Team brief menu A–G (clamp, lifting platform, sorter, bus door, safety guard, gripper, packaging pusher); constraints; roles; kit-vs-sim comparison table; common faults (no movement, wrong way, slow, hissing leak) diagnose challenge (`ch-pneu-fault`). Careers card. |

**Answers:** match tasks, I-P-O tables, practical expected results, fault causes/fixes.
**Quiz:** 8 MC (what pneumatics is, component jobs ×2, SAC vs DAC, safety rule, diagram symbol,
why simulate). **Step up to N5** box (P = F ÷ A, 3/2 & 5/2 valves) → links N5 pneumatics page.

---

## 8. Booklet 7 — Mechanisms & Structures (`mechanisms.html`, retitled)

Booklet is DRAFT — build from the current content; expect light revisions.

**Subnav:** Mechanisms vs structures · Motion · Gears · Levers & linkages · Pulleys · Structures · Triangulation · Structure test · Answers · Quiz · Self-check

| # | Section | Content & interactives |
|---|---|---|
| 1 | Mechanisms vs structures | M transfers movement / S supports loads / most products = both; M/S/B sorter (bridge, bike gears, crane, hinge, tower, folding chair, wiper, lift, robot arm, swing) (`ch-msb`). |
| 2 | Types of motion | Linear, rotary, reciprocating, oscillating table + animated SVG icons; match-the-motion (`ch-motion`); Yenka task 1 as observation guide. |
| 3 | Gears | Driver/driven/idler; meshing gears turn opposite ways; small→large = slower, large→small = faster; Practical 1 (Fischertechnik / Yenka routes) predict-and-test. **Widget:** two-gear + idler sim (`ch-gears`) — flagship (simplified N5 gear sim, no ratios). |
| 4 | Levers & linkages *(enrichment)* | **Enrichment callout (verbatim): beyond the N5 mechanism list — for N5 revision focus on gears, pulleys and drives.** Effort/load/pivot; pivot-position investigation (Practical 2); linkage examples + card-linkage build (Practical 3) as illustrated guides. |
| 5 | Pulleys & drive systems | Same-size/large→small/small→large rules; crossed belt reverses; pulley investigation table; gears-vs-pulleys challenge. |
| 6 | Simple structures | Compression / tension / bending table with examples; identify-the-load task; draw-the-forces arrows task (in/out/down) as an interactive arrow-placer or predict-reveal (`ch-forces`). |
| 7 | Triangulation & stability | Triangles can't squash; wide base, low centre of mass; spot-the-triangulation (bridge, crane, pylon, roof frame). |
| 8 | Structure test (Practical 4) + fault-finding | Build brief (paper tower / straw tower / stick bridge / card platform) with constraints; test table (standing, load, shake); mechanical faults diagnose challenge (gears slip, lever bends, linkage jams, tower wobbles) (`ch-mech-fault`). Careers card. |

**Answers:** sorters, motion match, practical expected patterns, fault causes/fixes.
**Quiz:** 8 MC (motion ID ×2, gear direction/speed, lever parts, triangulation, tension vs
compression). **Step up to N5** box (FBDs, moments, VR) → links N5 mechanisms + structures pages.

---

## 9. Booklet 8 — Final Engineering Challenge (`final-challenge.html`, NEW)

Booklet is DRAFT. **Different shape:** a project companion page, not a teaching page — it
scaffolds the multi-lesson team challenge. Fewer widgets; strong checklists and printable-style
tables. Add a new hub card 8 (+ badge).

**Subnav:** The challenge · Projects · Roles & planning · Build log · Testing · Impacts · Presentation · Reflection · Self-check

| # | Section | Content |
|---|---|---|
| 1 | How it works | Teams of 2–3; choose from menu; all assessed the same way; assessed on engineering *thinking* (planning, understanding, prototype, testing/improving, presentation, reflection) — pupil-friendly assessment list as cards. |
| 2 | Project menu | 8 project cards (bridge, protective packaging, insulated container, paper platform/chair, earthquake tower, shelter, mechanical linkage, gear/pulley drive) each with goal & test; common rules panel (materials, desk-size, tray storage, ≥3 tests, ≥1 improvement). **Widget:** which-project-suits-us picker quiz (`ch-project-pick`) — optional fun. |
| 3 | Roles & planning | Roles table (PM, Design, Build, Test & Evaluation); planning prompts (problem, success criteria, constraints, materials); sketch + predicted strengths/weaknesses; sentence starters. |
| 4 | Build log | Per-lesson log structure (completed / problems / changed / next step); storage reminder. |
| 5 | Testing | ≥3 tests, expected vs actual, improvement; the five reflection questions. |
| 6 | Engineering understanding & impacts | Link project to the four engineer types (cross-link `what-is-an-engineer.html` sections); social/economic/environmental impact prompts with sentence starters — reuse the impacts-sorter pattern as a refresher (`ch-impacts-recap`). |
| 7 | Presentation checklist | The booklet's 10-point checklist as an interactive tick list (`ch-present`). |
| 8 | Individual reflection + careers | The 8 personal reflection prompts; careers card (mechanical/civil/structural/design + local contexts); challenge/extension cards (gear ratio, idler, triangulation redesign, failure-point language, sustainability, linking topics). |

**No Answers section** (open-ended project). **Quiz:** short 6-MC engineering-process check
(process steps, why prototype, impact types, what+why). **Step up to N5** box (the N5
assignment parallel — verbatim from booklet) → links N5 assignment-prep page.

---

## 10. Build order (suggested)

1. **Energy** (B2) — closest to the built N5 energy page; establishes the S3 replace-a-skeleton flow.
2. **Electronics** (B3) → **Computer Control** (B4) → **Logic** (B5) — the middle run; heavy
   pattern reuse (symbol grids, code blocks, gate playground).
3. **Pneumatics** (B6) → **Mechanisms & Structures** (B7) — sim-card pattern shared with the
   N5 siblings; fix the hub numbering when flipping these.
4. **Final Challenge** (B8) — last; new hub card, cross-links to everything.

Per page: replace skeleton in place (keep URL), register badge in `progress/eng-s3.js`, add
`data-prog-badges` to the hub card, run the pre-commit checklist.
