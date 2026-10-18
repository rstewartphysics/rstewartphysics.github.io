# Block 6 — 555 timers and the op-amp comparator: build guides and lesson plan

Working notes from a cloud session (15 Oct 2026), handed to the Mac to **audit and finish**.
This is one part of a wider job: the old *Practical Electronics Block 6 — Oscillators and
Amplifiers* booklet is being rebuilt so that the **booklet, the slides and the website use the
same circuits, values, net numbers, colours and figures**. Nothing here is live on the site yet;
`tools/` is excluded from the Jekyll build.

Contents: 1 what is here · 2 decisions · 3 audit of the current 555 page · 4 lesson plan ·
5 the build guides · 6 the three circuits · 7 running it · 8 **for the Mac: audit and finish**.

---

## 1. What is in this folder

| File | What it does |
|------|--------------|
| `circuits.mjs` | The three circuits: components, netlist (`target`), a breadboard and a stripboard reference layout each, and the circuit diagram drawn with the engine's own symbols (`SBD.circuit`), split into step groups. |
| `check.mjs` | Runs `SBD.check` on all six layouts. `node tools/build-guides/check.mjs` must print six `OK`s. |
| `build-trainer.mjs` | Builds `preview/conversion-trainer.html`: one self-contained page with `assets/js/stripboard.js` inlined. Works out the chip-first step order, the nets per board, net colours, the spot-the-mistake boards (each must fail `SBD.check`, or the build stops) and the quiz. |
| `trainer.tpl.html` | The page shell and all its behaviour. |
| `test-trainer.mjs` | Drives the page in headless Chromium: taps answers, checks for page errors and sideways scroll at 390 px. Exits non-zero on failure. |
| `preview/conversion-trainer.html` | The built prototype. Open it in a browser (or on an iPad via AirDrop) to try it. |

The old booklet PDF is **not** in the repo (school crest, photos of unknown provenance). Every
figure here is drawn; nothing was copied from it.

## 2. Decisions made with the teacher

| Question | Decision |
|----------|----------|
| Site structure | A short hub, **"7 · Timers & comparators"**, plus three lesson pages: op-amp comparator, 555 monostable, 555 astable (keeps the existing `555-astable.html` URL and its badge). |
| Order and fading | **Comparator first, fully worked → monostable, some steps yours → astable last, your turn.** |
| Guide structure | Per circuit: **1 · the diagram on its own**, **2 · diagram → breadboard**, **3 · diagram → stripboard**, each a clear step-by-step conversion. |
| Conversion method | **Chip first, then work round the chip**: its supply pins, then the other pins in number order, then the nets away from the chip. One net per step. A part goes in when all its legs' nets have been reached; a link goes in with what it serves. |
| Net colours | Every net keeps one colour everywhere (diagram ring, board band, text). A net that has a link wire takes that wire's colour; +V red, 0 V black. The number always shows too, so colour is never the only cue. |
| Cable management | Off-board leads enter **together at the top-left corner** (stripboard: +V on track A, 0 V on track B, a black link B1–V1 carries 0 V down; breadboard: the top rails), so the loom can go in one spiral wrap. |
| Supplies | 555 circuits at **5 V**; the 741 at **9 V** (a 741 is out of spec on a single 5 V supply). |
| 555 pin 5 | Left unconnected (no 10 nF capacitor). |
| LED resistors | 270 Ω at 5 V (about 11 mA); 680 Ω for the 9 V comparator. |
| Comparator sensor | **Thermistor only**, all three tabs and the simulator (no LDR option). |
| Monostable trigger | **3-pin slide switch**: common on pin 2, outer pins to **+5 V and 0 V**. R1 (10 kΩ) stays as a pull-up so pin 2 never floats while the switch is between positions. |
| Capacitor symbol | **Two flat plates with a +**, **site-wide**. The guides draw it now; the engine's own `ecap` (Planner, Builder, every `SBD.circuit` diagram) still draws a curved plate and must change in the Mac sources — see §8. |
| Breadboard | Half board, 400 holes (`bb-400`). |
| Board rows | Engine letters A–V (the classroom sheet's 22–1 numbering is dropped). |
| Yenka | Kept alongside the on-page simulator. |

**Changed by the teacher, 18 Oct 2026** (these replace the rows above where they differ):

| Question | Decision |
|----------|----------|
| Comparator | **Not built.** Yenka and the on-page simulator only: no breadboard or stripboard guide, no bench test, no comparator in the Planner/Builder banks. The guide keeps Part 1 (the diagram) and a quiz on reading it. |
| 555 circuits | **Both built**, with the breadboard and stripboard guides. |
| Fading | Moves down one: **monostable worked, astable your turn**. |
| Old booklet's mock assignment | **Not used any more.** Not carried into the new booklet; no hub capstone built from it. |
| Timing | Block 6 is taught from about 1 Nov 2026. |
| Old deck | `555 Timer Tasks.pptx` is replaced by one deck per lesson. |
| Booklet | Lean: tasks and questions only; the notes are on the lesson pages. |

## 3. Audit of the current 555 astable page

`classes/electronics/555-astable.html`, checked at 1180 × 760.

**Good already:** the board is drawn by the engine through `board-figure.js` and checked with
`SBD.check`; the simulator meets the site standard (stage fits one screen, predict first, slider
+ number box, live diagram, labelled graph); badge "Timer Tamer" is wired. The booklet's timing
table (2.1, 0.99, 1.2, 1.5 s) agrees with the page's mark/space relationships.

| # | Finding | Fix |
|---|---------|-----|
| A1 | Two `<h1>`s: the banner's and a `visually-hidden` one in `<main>` (CLAUDE.md open job 2). | Drop the hidden one. |
| A2 | The credits line still mentions a "stripboard layout photo … drawn in Yenka"; the board is now engine-drawn. | Reword. |
| A3 | The pin-out label "control (not used)" is clipped at 1180 px. | Widen the viewBox or shorten. |
| A4 | Pin 5: booklet says 0.01 µF to 0 V; page says unused. | Decided: unused (§2). Make the booklet match. |
| A5 | No test points on the board; the booklet and the mock marking scheme expect them. | Done in the guides (TP1–TP4/5). |
| A6 | Board letters A–V vs the classroom sheet's 22–1. | Decided: letters (§2). |
| A7 | The "What goes where" list isn't linked to the board. | The guides' tap-to-trace replaces it. |
| A8 | Page is about 8,500 px long at 1180 px. | Splitting into lessons fixes it. |
| A9 | Hub tile calls it "555 Astable simulator". | Rename when the lesson hub goes live. |

**Physics and wording to check (teacher):**
1. The booklet's comparator box says V<sub>out</sub> "**rises** to the negative saturation level" — should be *falls*.
2. A 741 on a single supply can't reach either rail (about 1–2 V short), so "LOW" may be 1.5–2 V and an LED with its resistor can glow faintly. Worth a "real circuits" note.
3. The Planner's existing *Frost warning* question runs a 741 on +5 V — out of spec; check before reusing.
4. The booklet's light sensor (LDR at the bottom, VR1 at the top) is dark-activated. The new comparator (TH1 on top, VR1 below) is **hot-activated**: V<sub>in</sub> rises as TH1 warms.

## 4. Lesson plan

```
classes/electronics/timers-and-comparators.html   hub: three lesson tiles, the mock-assignment link
classes/electronics/op-amp-comparator.html         Lesson 1 (new) — fully worked
classes/electronics/555-monostable.html            Lesson 2 (new) — some steps yours
classes/electronics/555-astable.html               Lesson 3 (existing URL) — your turn
```

Each lesson follows the Electronics theory-page rhythm (concept tag → **Key words** → explanation
and figure as `.dual` → practice with reveal → **"You can now…"**), then:

1. **Predict**, then **how it works** (dual coded).
2. **Simulator** on the shared kit (`sims.css` + `WidgetKit`). The comparator sim mirrors the
   transistor page's sensor controls (thermistor only, sensor arm, temperature slider) plus a
   reference divider; reuse the divider maths from `theory/resistor-circuits.html`, don't fork it.
   Monostable: press-and-hold trigger, R and C on log sliders, fast-forward, booklet presets
   (100 k/100 µF → 11 s, 100 k/47 µF → 5.2 s, 100 k/22 µF → 2.4 s, 10 k/100 µF → 1.1 s).
   Astable: keep the existing sim, add the booklet's **T ≈ 0.7(R1 + 2R2)C** card, its four rows as
   presets, and a **measure** tool styled like *Wave Reader* (signals & capacitors page).
3. **Relationships**: worked examples, practice generator.
4. **Build it**: the three-part build guide (§5).
5. A **named scored challenge** in the house style: *Threshold Hunter* (comparator), *Pulse Setter*
   (monostable), *Timer Tuner* (astable).
6. **Check your understanding**: MCQ with feedback on every option, cloze, RAG self-check.
7. **"Next:"** chain: Logic & ICs (theory 6) → hub → lessons in order. Logic & ICs keeps its short
   "describe" section and links down; its Yenka photos are not reused.

~~Capstone on the hub~~ — dropped 18 Oct 2026: the booklet's *Flashing lights* mock assignment is
not used any more.

Build order agreed for the two weeks: hub + comparator → monostable → astable upgrade → boards,
capstone, badges → `npm run sims`, screenshots both themes and widths → teacher physics and real
iPad Safari.

## 5. The build guides (the prototype)

**Part 1 — the diagram on its own.** Built up chip first: the chip box with its pin numbers, then
the supply rails and supply pins, then the parts, then test points. The new part is orange.

**Parts 2 and 3 — diagram → breadboard / stripboard.** The finished diagram beside the board.

1. *Place the chip* (stripboard: and its four track cuts).
2. One step per net, **supply pins first**, then the other pins in number order, then nets away
   from the chip. Each step rings the pin on the diagram, shows only that net's number, lights only
   that net's track or column in the net's colour, and places only what can now be finished. The
   text is generated from the layout: "Pin 7 is in track G (holes 15–37), so that track is net 3"
   and "R1 goes in now, from net 1 (track A) to net 3 (track G)".
3. *Test points*, then *Check it against the diagram* with a fill-in net table.

**Learning features** (all in the prototype):

| Feature | How it works |
|---------|--------------|
| Fading help | Comparator: worked, with an optional "Try each step first". Monostable: tap questions on the part steps and free-choice nets. Astable: every step is a question; how-to text sits behind a Hint. |
| Predict, then reveal | "Pin 7 is on net 3. Tap its track." and "R1 joins net 3 to net 1. Tap where its other leg goes." Wrong taps explain themselves; a free-choice net accepts any empty track and says where the guide put it. |
| Two-way trace | Tap a net number on the diagram or any hole on the board: the net lights in both (dashed). |
| Pin drill | Pin buttons 1–8 ring the pin on the diagram and the board, with its name and hole; the chip step asks "Where is pin 1?". |
| Spot the mistake | Three faulty stripboards per circuit (missing cut, reversed part, shorted resistor, missing link, wrong track). Every wrong answer explains itself; the right one rings the fault and quotes `SBD.check`. |
| Net table | Type each net's tracks or columns; check or reveal. |
| Quick quiz | Three recall questions per circuit, feedback on every option. |

Every figure is the real engine. The prototype fits one landscape iPad screen (the board scales
to the viewport height) and has no sideways scroll at 390 px.

## 6. The three circuits

All six layouts pass `SBD.check` with no warnings (`check.mjs`). Net numbers follow `target` order.

**741 comparator, 9 V** — TH1 (thermistor) on top and VR1 (10 kΩ, as a variable resistor) below
feed pin 3; R2 10 kΩ / R3 2.2 kΩ set V<sub>ref</sub> ≈ 1.6 V on pin 2; pin 6 → R4 680 Ω → LED1.
Nets: 1 +9 V · 2 0 V · 3 V<sub>in</sub> (TH1, VR1 wiper, pin 3) · 4 V<sub>ref</sub> (R2, R3, pin 2) ·
5 pin 6, R4 · 6 R4, LED1. Test points TP1 +9 V, TP2 0 V, TP3 V<sub>in</sub>, TP4 V<sub>ref</sub>,
TP5 V<sub>out</sub> (the booklet's TP1–TP5).

**555 monostable, 5 V** — R2 100 kΩ, C1 100 µF on pins 6/7 (T ≈ 1.1 R2 C1 = 11 s); R1 10 kΩ
pull-up and SW1 slide switch on pin 2 (outer pins to +5 V and 0 V); pin 3 → R3 270 Ω → LED1. Nets: 1 +5 V · 2 0 V ·
3 trigger (SW1 common, R1, pin 2) · 4 timing (R2, pins 6 and 7, C1+) · 5 pin 3, R3 · 6 R3, LED1.

**555 astable, 5 V** — R1 1 kΩ, R2 10 kΩ, C1 100 µF (the classroom board's values; f ≈ 0.68 Hz);
red LED1 + R3 270 Ω from pin 3 to 0 V, green LED2 + R4 270 Ω from +5 V to pin 3. Nets: 1 +5 V ·
2 0 V · 3 R1, R2, pin 7 · 4 R2, pins 6 and 2, C1+ · 5 pin 3, R3, LED2 · 6 R3, LED1 · 7 R4, LED2.
The stripboard is the existing classroom layout (`assets/boards/555-astable.json`) moved to 5 V,
with test points and the top-left supply entry added.

## 7. Running it

```sh
node tools/build-guides/check.mjs          # six OKs
node tools/build-guides/build-trainer.mjs  # writes preview/conversion-trainer.html
npm install                                # once, for Playwright
node tools/build-guides/test-trainer.mjs   # taps through it; non-zero exit on errors
```

`build-trainer.mjs out.html --fragment` writes the page without the `<html>` skeleton (the form a
claude.ai artifact takes).

## 8. For the Mac: audit and finish

**Audit first**
- [ ] Open `preview/conversion-trainer.html` on a real iPad in Safari, held sideways and upright:
      tapping single holes on the half-size breadboard, the step buttons, the pin drill.
- [ ] Physics and wording of every circuit and step (teacher): the four flags in §3; the
      monostable's "slide it back straight away, while pin 2 is held LOW the output stays HIGH";
      thermistor value and VR1 range for a sensible switching temperature; LED currents.
- [x] ~~**Bench test: does the comparator's LED glow when it should be off?**~~ Dropped 18 Oct:
      the comparator is not built. (physics audit,
      17 Oct). A 741 on a single 9 V supply only pulls its output down to about 1–2 V, close to
      a red LED's forward voltage. If the LED glows faintly when cold, put a 1N4148 in series with
      it (and add it to the circuit, layouts and step text here) rather than changing the chip.
- [x] Every generated step text and every spot-the-mistake explanation (`build-trainer.mjs`),
      18 Oct: three-legged parts get their own sentence; no brackets inside brackets; on the
      astable stripboard the 0 V spine (B–V, F–V) now goes in with pin 1, as on the monostable;
      spot-the-mistake explains each fault in words instead of quoting the checker (which
      described a reversed C1 or LED as "you need a cut").
- [x] Re-run `check.mjs`, `build-trainer.mjs` and `test-trainer.mjs` after any change (18 Oct:
      six OKs, no page errors, 390 px no sideways scroll; the drive test now asserts the
      comparator shows only its diagram and quiz).

**Decided, to do on the Mac**
- [ ] **One capacitor symbol site-wide** (teacher, 15 Oct): change `ecap()` in the bundle's
      `sbd-circuit.js` to two flat plates with a "+" beside the positive plate (the guides'
      `pcap` in `circuits.mjs` is the drawing to match), rebuild the four planner/builder pages,
      run `npm run stripboard`, then look at every Planner/Builder diagram that has a capacitor.

**Booklet and slides (the wider job)**
- [ ] Rebuild the Block 6 booklet sources around these three circuits in the new order (comparator,
      monostable, astable), with the same values, net numbers, net colours, test points and wording.
      Keep its Yenka simulation tables; swap its blank stripboard grids for the planning sheets.
- [ ] Fix the comparator wording (§3, flag 1) and the pin 5 instruction (§2) in the booklet.
- [ ] Slides: one deck per lesson under the deck rules; reuse the guide figures so the deck, the
      booklet and the page show the same picture. Add an export step to `build-trainer.mjs` (or a
      sibling) that writes each step's diagram and board as standalone SVG (`renderBoard` with
      `standalone: true`; `SBD.circuit.wrap` for diagrams) for the deck kit and the booklet.
- [x] ~~Check the booklet's mock assignment~~ — dropped 18 Oct: the old mock is not used.

**Into the site**
- [ ] Turn the prototype into one shared component (`assets/js/build-guide.js` + one JSON per
      circuit under `assets/guides/`) on the site's own sheets (`electronics.css`, `sims.css`,
      `reading.css`) with dark mode from the site tokens; the prototype's own styling is temporary.
- [ ] Build the hub and the three lesson pages per §4, with progress badges (`/add-progress`),
      simulator checks (`npm run sims`) and an `[data-guide]` check in `scripts/sim-check.mjs`.
- [ ] Update `assets/boards/555-astable.json` to the 5 V layout here (or retire it for the guide).
- [ ] Apply the audit fixes A1–A3 and A9 to the existing astable page.
- [ ] Add the two 555 circuits (not the comparator) to the Stripboard/Breadboard Planner and Builder question banks (Mac
      sources) so each lesson can end with "Plan it yourself" and a board → diagram ("Reverse")
      exercise; then `npm run stripboard`.
- [ ] Credits: nothing third-party is used so far; check again if photos are added.
- [ ] Remove this folder's preview from the repo once the real pages exist.
