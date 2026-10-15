# Electronics joined-up audit (15 Oct 2026)

How the N5 Electronics simulators, theory pages and practical tools connect, where each one helps
pupils most, and what to change so they work as one course. Audited from `main` after PR #200
(25 pages: hub, six theory pages, four practical pages, the 555 page, nine tools and planning
sheets, slides, glossary, revision). Evidence is from page source: links between Electronics
pages, headings, interactive pieces, and topic terms counted on every page. `npm run sims` was not
run (no site build in the cloud session) — run it on the Mac before and after this work.

**Labels:** **[cloud]** can be done in a cloud session · **[Mac]** needs the Mac's bundle sources
or a real iPad.

## Summary

- **Only three real simulators**: 555 astable, voltage divider + comparator, transistor switch.
  Capacitor timing, LED series resistors, series/parallel and power have no live model.
- **Theory and tools don't talk**: no theory page links to the Planner, Builder, Block Diagram
  Builder or a slide deck; the tools link back only to the hub.
- **The 555 page is stranded**: three pages link to it, it sits under "Tools" on the hub, and it
  doesn't link to capacitor theory or the 555 pin-out.
- **The tools already hold the course**: the 12 Stripboard Builder circuits map onto every theory
  page, but nothing points a pupil from a topic to its practice circuit.
- **Content gaps**: LED series-resistor sums, preferred values (E12), pull-downs in theory,
  potentiometer for sensitivity, monostable timing.
- **Two visual languages**: eight Yenka screenshots in theory pages beside engine-drawn boards.

## What is there now

"In" = number of other Electronics pages linking to it.

| Page | Simulator | Other interactive pieces | In | Links out (besides hub, glossary) |
|---|---|---|---|---|
| 1 Quantities & calculations | — | Number Cruncher, 2 fill-the-gaps, prefix ladder | 1 | Resistor circuits |
| 2 Resistor circuits | Divider + comparator | Network Navigator, guided fill-ins | 3 | Transistor, Logic |
| 3 Transistor switching | Transistor switch | Design challenges (Bright Spark) | 3 | Resistor, Signals |
| 4 Signals & capacitors | — | Wave Reader | 2 | Components, 555 |
| 5 Components & devices | — | Component Collector | 3 | Logic |
| 6 Logic gates & ICs | — | Gate explorer, Logic Lord | 4 | Transistor, Revision |
| 555 astable | 555 astable | Predict, practice generator, MCQ, cloze | 3 | Stripboard Planner |
| Simulation | — | The Operator | 2 | 555, Builder, Testing, Logic |
| Construction | — | Resistor decoder, Solder Master, 9-step conversion | 3 | Builders, Planners, sheets, Components |
| Testing | — | Fault Finder | 4 | Mock guide |
| Planning | — | Master Planner | 2 | Block Diagram Builder, Mock guide, Testing |
| Stripboard/Breadboard Builder & Planner | (the engine) | Convert, Trace, Fault-finder, Reverse, Test points | 2–7 | Planning sheets only |
| Block Diagram Builder | — | Drag-and-check block diagrams | 4 | Hub only |
| Slides | — | 9 Logic/practical decks (L1–L9) | 1 | — |
| Glossary | — | — | 11 | Hub only |

## Findings

**1 · Theory pages never send pupils to practise** — High · [cloud] (tool pages: [Mac])
No theory page links to the Builders, Planners, Block Diagram Builder, Simulation page or a deck;
the Builder/Planner pages link only to the hub and planning sheets.
*Fix:* a closing "Practise it" row (up to three links) in every theory section, and a "Need a
reminder?" link back on every tool (see *Learning path*). Reuse `.resource-grid` or hub tiles.
The four Builder/Planner pages are generated: their back-links go into the Mac bundle sources.

**2 · Key ideas have no live model** — High · [cloud]
Three `.sim` blocks site-wide in Electronics. No simulator for a capacitor charging (the basis of
every 555 timing sum — Signals & capacitors explains RC delay in words only), the LED series
resistor, series/parallel, or power.
*Fix:* the *Simulator plan* below; capacitor charge/discharge first, then LED + series resistor.

**3 · The 555 page is outside the course** — High · [cloud]
Linked only from the hub (as a "Tools & resources" tile, "555 Astable simulator"), Simulation and
Signals & capacitors. It doesn't link to capacitor timing or the 555 pin-out; Logic & ICs'
"Control circuits you must describe" doesn't link to it.
*Fix:* the Block 6 plan (`tools/build-guides/README.md`, open job 6): a "7 · Timers &
comparators" course section, reached by "Next" from Logic & ICs. Meanwhile add the four links.

**4 · The Builder's circuits are the course, unlabelled** — Medium · [Mac] then [cloud]
The 12 Stripboard Builder circuits: LED and series resistor; Light sensor divider; Buzzer switched
by a transistor; seven logic circuits (Lift door interlock, Guard and start button, Tank empty
warning, Kiln door interlock, Car park full sign, Greenhouse irrigation, Two active-low sensors);
Stairwell light timer (555 monostable); Frost warning (comparator). The Breadboard Builder has
three of them. Deep links exist only for Convert mode, by position (`#q3`), which breaks when the
bank is reordered.
*Fix:* [Mac] stable deep links by mode and circuit id (e.g. `#trace/ldr-divider`) in the bundle
sources; [cloud] then each theory page links to its circuit in the right mode (Trace after the
idea, Convert to practise, Fault-finder for revision).

**5 · Content gaps against the course** — Medium · [cloud]
- LED series resistor, R = (V<sub>s</sub> − V<sub>LED</sub>) ÷ I: only Construction mentions it.
- Power (P = IV and forms): two mentions on Quantities, no component examples.
- Preferred values (E12): on no page.
- Pull-down resistors: Construction and the mock guide only (slide L7 teaches them; Logic & ICs doesn't).
- Potentiometer/preset to set sensitivity: symbol only (Components).
- Monostable and comparator: one paragraph each on Logic & ICs with Yenka photos; no monostable timing.
*Fix:* add each where the *Learning path* puts it; monostable and comparator go to Block 6.

**6 · Slides aren't linked from their pages** — Medium · [cloud]
The nine decks are reachable only from the Slides page. No decks yet for quantities, resistors,
transistors, signals or components.
*Fix:* deck cards in the matching sections — L1–L3, L6 on Logic & ICs; L4–L5 on Simulation
("Designing a system"); L7 on Logic & ICs (switches, pull-downs) and Testing (logic probe); L8 on
the Breadboard Builder and Construction; L9 on the Stripboard Builder and Construction. New decks
for the other topics belong to the booklet/slides rebuild.

**7 · Course order doesn't match teaching order** — Medium · [cloud] · **teacher decision**
Hub: Quantities → Resistors → Transistors → Signals → Components → Logic. The slides teach logic,
systems and breadboard/stripboard first; Components (symbols) comes fifth, after three pages that
use the symbols.
*Suggested:* 1 Quantities · 2 Components & symbols · 3 Logic & ICs · 4 Resistor circuits & sensors
· 5 Transistor switching · 6 Signals & capacitors · 7 Timers & comparators; practical pages as
their own chain; each theory section points to the practical step it feeds.

**8 · One sensor model written twice; comparator in three places** — Medium · [cloud]
LDR/thermistor maths is coded separately in the Resistor circuits and Transistor simulators; the
comparator is taught in the divider sim, on Logic & ICs, and in the coming Block 6 lesson.
*Fix:* sensor models (LDR from lux, thermistor from temperature) into `WidgetKit`, shared by the
divider, transistor and comparator sims. The Block 6 lesson is the comparator's home; the others
summarise and link.

**9 · Yenka screenshots in theory pages** — Low · [cloud]
Eight files from `assets/electronics/Circuits/`: four sensor/transistor circuits (Transistor
switching), astable, monostable, comparator (Logic & ICs), back-EMF diode (Components).
*Fix:* redraw with `SBD.circuit`, as the build guides do, so one circuit looks the same in theory,
simulator, Builder and booklet; then retire the folder.

**10 · The glossary is a dead end** — Low · [cloud]
Eleven pages link in; it links only to the hub.
*Fix:* link each term to its teaching section; add preferred value, pull-down, potentiometer,
monostable, comparator, time delay.

**11 · Practical pages have no "Next" chain** — Low · [cloud]
*Fix:* chain Planning → Simulation → Construction → Testing (the assignment order); link each
Revision tracker item to its page.

## The learning path

| Step | Theory home | Live model there | Practise it (links to add) | Feeds |
|---|---|---|---|---|
| 1 | Quantities: units, prefixes, V = IR, P = IV | **New:** Ohm's law and power | Number Cruncher; Builder *LED and series resistor* (Convert) | Every calculation |
| 2 | Components & symbols: LED, diode, relay + back-EMF, switch, buzzer, motor; **LED series resistor**, **E12** | **New:** LED and series resistor | Component Collector; Resistor decoder (Construction); Builder *LED and series resistor* | Construction, output stages |
| 3 | Logic & ICs: gates, truth tables, combinational, pin-outs, **pull-downs** | Gate explorer (onto the sim standard) | Logic Lord; Block Diagram Builder; Builder logic circuits; slides L1–L3, L6, L7 | Simulation "Designing a system", mock |
| 4 | Resistor circuits & sensors: series, parallel, divider, LDR, thermistor, **potentiometer** | Divider sim (shared sensors); **New:** series/parallel sim | Network Navigator; Builder *Light sensor divider* (Trace, then Convert) | Transistor switching, comparator |
| 5 | Transistor switching: NPN/MOSFET, relay driving | Transistor sim (shared sensors) | Bright Spark; Builder *Buzzer switched by a transistor* | Output sub-systems |
| 6 | Signals & capacitors: analogue/digital, oscilloscope, **RC charging, time delay** | **New:** capacitor charge/discharge | Wave Reader | Every 555 lesson |
| 7 | Timers & comparators (Block 6): comparator → monostable → astable | Comparator, monostable, 555 sims; build guides | Build guides; Builder *Frost warning*, *Stairwell light timer*; Planner | Mock (flashing lights) |
| P | Practical: Planning → Simulation → Construction → Testing | **New, later:** virtual multimeter at test points | Master Planner; The Operator; Builders/Planners; Fault Finder; Mock guide; slides L8–L9 | The 70-mark assignment |

## Simulator plan

All on `sims.css` + `WidgetKit`, beside the paragraph they explain, counted toward the page badge,
checked by `npm run sims`.

| Simulator | Home | Pupil changes / sees | Reuses | Priority |
|---|---|---|---|---|
| Capacitor charge/discharge | Signals & capacitors, "Capacitance & timing" | R, C (log), charge/discharge; V<sub>C</sub> against time with the ⅓ and ⅔ lines | 555 sim graph and clock | High |
| LED and series resistor | Components & devices | Supply, R; LED current, brightness, "too much current"; next E12 value up | WidgetKit readouts | High |
| Comparator (thermistor) | Block 6 comparator lesson | Temperature, VR1; V<sub>in</sub>/V<sub>ref</sub> number line, LED, V<sub>out</sub> vs V<sub>in</sub> | Divider sim, shared sensors | High (Block 6) |
| 555 monostable | Block 6 monostable lesson | R, C, slide switch; trigger, V<sub>C</sub>, pulse; T ≈ 1.1RC | 555 astable sim | High (Block 6) |
| Series and parallel | Resistor circuits | Up to three resistors; total R, branch currents, p.d.s | Network Navigator maths | Medium |
| Ohm's law and power | Quantities | V, R; I, P, lamp brightness | WidgetKit | Medium |
| Gate explorer on the standard | Logic & ICs | Inputs, gate; lamp, truth-table row lit | Existing Gate explorer | Low |
| Virtual multimeter | Testing | Probe a board's test points; expected vs measured, diagnose | Stripboard engine nets/test points | Low |

## For the Mac: order of work

- [ ] **Block 6 first** (needed within two weeks of 15 Oct): open job 6 / `tools/build-guides/README.md`.
- [ ] **Links** (findings 1, 3, 6, 10, 11): "Practise it" rows, deck cards, glossary links,
      practical "Next" chain [cloud]; "Need a reminder?" back-links on the four Builder/Planner
      pages and the Block Diagram Builder in the bundle sources [Mac].
- [ ] **Capacitor and LED simulators**, with the LED series resistor and E12 content (2, 5).
- [ ] **Teacher decision on course order** (7), then reorder the hub and the "Next" chain.
- [ ] **Builder deep links by mode and circuit id** (4) [Mac], then theory pages link to them.
- [ ] **Shared sensor model, redrawn circuits, remaining simulators** (8, 9).
- [ ] **Check by eye**: `npm run sims`, every new simulator on a real iPad in Safari, physics by the teacher.
