# Block 6 — timers and comparators: the build guides

The shared build-guide component and its data. Plan and binding decisions: the Block 6
`PLAN.md` (v3, 18 Oct 2026) on the Mac; where this file and the plan differ, the plan wins.
`tools/` is excluded from the Jekyll build.

Contents: 1 what is here · 2 using a guide on a page · 3 decisions · 4 running it ·
5 the three circuits · 6 audit of the current 555 page · 7 still to do.

---

## 1. What is here

| File | What it does |
|------|--------------|
| `/assets/js/build-guide.js` | The component. Mounts on `.build-guide[data-guide]`, loads `stripboard.js` and the guide's JSON when it nears the screen. |
| `/assets/css/build-guide.css` | Its styles, from the subject sheet's tokens (like `sims.css`). Text sizes in `em`, 18 px base. |
| `/assets/guides/<id>.json` | One per circuit. **Generated: never edit.** |
| `circuits.mjs` | The three circuits: components, netlist (`target`), a breadboard and a stripboard reference layout each, and the diagram drawn with the engine's own symbols, split into step groups. |
| `build-guides.mjs` | Writes the JSON: the chip-first step order and text, nets per board, net colours, the spot-the-mistake boards (each must fail `SBD.check`, or the build stops) and the quiz. Run by `tools/generators/regen_all.py`, so CI fails if the JSON drifts. |
| `check.mjs` | Runs `SBD.check` on all six layouts. |
| `test-guides.mjs` | Drives the three guides on `preview/guide-demo.html` in Chromium: parts per circuit, taps, net table, every fault board, every quiz item, one-screen board at 1180 × 760, no sideways scroll at 390 px dark. |
| `export-figures.mjs` | Writes every step's diagram and board, and every fault board, as SVG (styles flattened to attributes, so MuPDF, PowerPoint and Word draw them) and PNG (3×) to `~/claude-work/block6-timers/figures/` for the decks. Not committed. |
| `serve.mjs` | The static server the two Chromium scripts share. |
| `preview/guide-demo.html` | Test page: the three guides on the real Electronics sheets. |

## 2. Using a guide on a page

```html
<link rel="stylesheet" href="/assets/css/build-guide.css?v=bg-20261018a">   <!-- after the subject sheet -->
<script src="/assets/js/build-guide.js?v=bg-20261018a" defer></script>

<div class="build-guide" data-guide="555-monostable" data-prog-badge="…"></div>
```

`data-guide` is the JSON's name. `data-prog-badge` is optional: on first use the guide calls
`Progress.markSeen` with it. The figures sit on light paper in both appearances, like every other
board figure. One guide per mount; a page can hold more than one.

## 3. Decisions (teacher, 15 and 18 Oct 2026)

| Question | Decision |
|----------|----------|
| Lessons | 1 Testing → 2 Comparator → 3 Monostable → 4 Astable (PLAN D12). |
| Comparator | **Not built.** Yenka and the simulator only. Its guide is Part 1 (the diagram) and the quiz (D4). |
| Monostable | **Breadboard only, worked**, with an optional "Try each step first" (D9). Three faulty **breadboards** to spot (D10): C1 reversed, the pin 4 link missing, R3 with both legs in one column. |
| Astable | **Stripboard only, some steps yours**: the part steps are questions (D9). Its three faulty stripboards stay (D10): red LED reversed, pin 2's yellow link missing, R2 on pin 6's track. |
| Test points | **T1, T2 …**, as in the booklet, the mock and SQA 2025 Q7 (booklet E6). |
| Conversion method | **Chip first, then work round the chip**: supply pins, then the other pins in number order, then nets away from the chip. One net per step. A part goes in when all its legs' nets have been reached; a link goes in with what it serves. |
| Net colours | Every net keeps one colour everywhere (diagram ring, board band, text). A net with a link wire takes that wire's colour; +V red, 0 V black. The number always shows too, so colour is never the only cue. |
| Cable management | Off-board leads enter **together at the top-left corner**, so the loom takes one spiral wrap. |
| Supplies | 555 circuits at **5 V**; the 741 at **9 V**. |
| 555 pin 5 | Left unconnected. |
| LED resistors | 270 Ω at 5 V (about 11 mA); 680 Ω for the 9 V comparator. |
| Comparator sensor | Thermistor only. |
| Monostable trigger | 3-pin slide switch: common on pin 2, outer pins to +5 V and 0 V; R1 10 kΩ pull-up. |
| Capacitor symbol | Two flat plates with a +, **site-wide**. The guides draw it now; the engine's `ecap` changes later (PLAN job 9). |
| Breadboard | Half board, 400 holes (`bb-400`). Board rows A–V (engine letters). |

## 4. Running it

```sh
node tools/build-guides/check.mjs            # six OKs
node tools/build-guides/build-guides.mjs     # writes assets/guides/*.json (commit them)
npm install                                  # once, for Playwright
node tools/build-guides/test-guides.mjs      # non-zero exit on any failure
node tools/build-guides/export-figures.mjs   # deck figures, Mac only
```

The Chromium scripts take `PW_CHROMIUM=<path to Chrome>` when Playwright's own browser is not
installed. To look at the demo by hand: `python3 -m http.server` in the repo root, then open
`/tools/build-guides/preview/guide-demo.html`.

## 5. The three circuits

All six layouts in `circuits.mjs` pass `SBD.check` with no warnings (`check.mjs`). Net numbers follow `target` order.

**741 comparator, 9 V** — TH1 (thermistor) on top and VR1 (10 kΩ, as a variable resistor) below
feed pin 3; R2 10 kΩ / R3 2.2 kΩ set V<sub>ref</sub> ≈ 1.6 V on pin 2; pin 6 → R4 680 Ω → LED1.
Nets: 1 +9 V · 2 0 V · 3 V<sub>in</sub> (TH1, VR1 wiper, pin 3) · 4 V<sub>ref</sub> (R2, R3, pin 2) ·
5 pin 6, R4 · 6 R4, LED1. Test points T1 +9 V, T2 0 V, T3 V<sub>in</sub>, T4 V<sub>ref</sub>,
T5 V<sub>out</sub>, as in the booklet.

**555 monostable, 5 V** — R2 100 kΩ, C1 100 µF on pins 6/7 (T ≈ 1.1 R2 C1 = 11 s); R1 10 kΩ
pull-up and SW1 slide switch on pin 2 (outer pins to +5 V and 0 V); pin 3 → R3 270 Ω → LED1. Nets: 1 +5 V · 2 0 V ·
3 trigger (SW1 common, R1, pin 2) · 4 timing (R2, pins 6 and 7, C1+) · 5 pin 3, R3 · 6 R3, LED1.

**555 astable, 5 V** — R1 1 kΩ, R2 10 kΩ, C1 100 µF (the classroom board's values; f ≈ 0.68 Hz);
red LED1 + R3 270 Ω from pin 3 to 0 V, green LED2 + R4 270 Ω from +5 V to pin 3. Nets: 1 +5 V ·
2 0 V · 3 R1, R2, pin 7 · 4 R2, pins 6 and 2, C1+ · 5 pin 3, R3, LED2 · 6 R3, LED1 · 7 R4, LED2.
The stripboard is the existing classroom layout (`assets/boards/555-astable.json`) moved to 5 V,
with test points and the top-left supply entry added.

## 6. Audit of the current 555 astable page

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
| A5 | No test points on the board; the booklet and the mock marking scheme expect them. | Done in the guides (T1–T4/5). |
| A6 | Board letters A–V vs the classroom sheet's 22–1. | Decided: letters (§2). |
| A7 | The "What goes where" list isn't linked to the board. | The guides' tap-to-trace replaces it. |
| A8 | Page is about 8,500 px long at 1180 px. | Splitting into lessons fixes it. |
| A9 | Hub tile calls it "555 Astable simulator". | Rename when the lesson hub goes live. |

**Physics and wording to check (teacher):**
1. The booklet's comparator box says V<sub>out</sub> "**rises** to the negative saturation level" — should be *falls*.
2. A 741 on a single supply can't reach either rail (about 1–2 V short), so "LOW" may be 1.5–2 V and an LED with its resistor can glow faintly. Worth a "real circuits" note.
3. The Planner's existing *Frost warning* question runs a 741 on +5 V — out of spec; check before reusing.
4. The booklet's light sensor (LDR at the bottom, VR1 at the top) is dark-activated. The new comparator (TH1 on top, VR1 below) is **hot-activated**: V<sub>in</sub> rises as TH1 warms.

## 7. Still to do (PLAN order of work)

- [x] Lesson pages host the guides: L3 monostable (#236) and L4 astable (#240). The comparator guide is on no lesson page; `preview/guide-demo.html` is where it is tested.
- [x] A `[data-guide]` check in `scripts/sim-check.mjs` (29 Oct); badges on every Block 6 tile (#235, #238) (job 8).
- [x] The two 555 circuits into the question banks (job 8, 29 Oct): `astable-555` and `monostable-555` in `questions.js` and `bb-questions.js`, on the two Learn pages. The two Planner pages are free build and have no bank.
- [x] `assets/boards/555-astable.json` retired (29 Oct): nothing loaded it; the guide's JSON is the astable layout.
- [x] One capacitor symbol site-wide: `ecap()` in the engine now draws the guides' flat plates + "+" (job 9, 29 Oct, teacher OK).
- [ ] Physics and wording of every step and fault (teacher), and a real iPad.
- [x] `preview/` is KEPT as the guide test page (teacher, 29 Oct): `test-guides.mjs` drives all three guides there, and it is the comparator guide's only test.
