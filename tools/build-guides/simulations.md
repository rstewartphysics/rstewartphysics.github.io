# Simulations — the simulator standard

Moved out of the site `CLAUDE.md` on 23 Nov 2026 (teacher-approved trim); CLAUDE.md keeps the summary and points here.

## Simulations — the simulator standard (site standard, 13 October 2026)

Every simulator on the site is one component with each subject's palette: **`assets/css/sims.css`**
(layout, controls, readouts, graph styling, token-driven like `hub-tiles.css`) plus
**`assets/js/widget-kit.js`** (`window.WidgetKit`). Pages do not hand-roll slider pairing, graph
axes or animation loops. Link `sims.css` after the subject sheet, and load `widget-kit.js` with
`defer`.

```html
<div class="sim" id="sim-x">
  <div class="sim-head"><h3>…</h3><p class="sim-hint">One line on what to try.</p></div>
  <div class="sim-predict">…</div>                       <!-- predict first, before the stage -->
  <div class="sim-stage">
    <div class="sim-view">figures (.sim-figs/.sim-fig), .sim-graph, .sim-readouts</div>
    <div class="sim-controls">
      <label class="sim-field"><span class="sim-name">Resistance <var>R</var><sub>1</sub> (kΩ)</span>
        <span class="sim-row"><input type="range" data-sim="r1" …><input class="sim-num" type="number" data-sim="r1" …></span></label>
    </div>
  </div>
</div>
```

- **One screen.** At 1180 × 760 the stage — picture, graph and controls — fits on screen at once,
  controls **beside** the picture (the one-screen rule above, applied to a block inside a page).
- **Predict first.** A `.sim-predict` card asks what will happen before the pupil can find out;
  every option carries its own feedback (`<template data-feedback>` inside the button,
  `WidgetKit.poeCard`). Same rule as quizzes: a wrong pick says why, the right one starts "Right."
- **Every slider has a number box** (`WidgetKit.liveSim`, same `data-sim` key). A range that spans
  decades uses `data-scale="log"`; one that crowds against a limit (speeds near *c*) uses
  `data-scale="near"`. Values are clamped to the box's min/max when the pupil leaves it.
- **The picture moves with the numbers** (dual coding): a live diagram, labelled with the same
  words as the text, beside every simulator. UK symbols.
- **Graphs** come from `WidgetKit.graph`: "quantity (unit)" on both axes, numbered ticks, the origin
  at 0 unless the physics needs otherwise, a phone layout (`layouts`) so labels stay ≥ 12 px.
- **Readouts** use `WidgetKit.fmt` / `WidgetKit.si` (3 s.f., real minus sign, SI prefixes) and real
  `<var>`/`<sub>` — never `V_s`-style code subscripts. Results announce via `aria-live="polite"`.
- **Motion** runs on `WidgetKit.clock` (pauses with the tab, no autoplay under reduced motion).
- **Progress.** A simulator counts toward its page's badge (`Progress.markSeen` on first use).
- **Stripboard pictures** come from **`assets/js/stripboard.js`** (`SBD.render.renderBoard`), written
  from `tools/generators/stripboard/engine/` by the stripboard `build.py`; never edit it. A layout shown on a page is
  checked with `SBD.check` against its netlist before it is published.
- **Checked automatically.** `npm run sims` (`scripts/sim-check.mjs`) runs every `.sim` at
  1180 × 760 light and dark and at 390 px, in the PR build: no errors or sideways scroll, stage fits,
  slider ↔ box sync, 44 px controls, named drawings, labelled graph axes, nothing moving under
  reduced motion, every drawn stripboard matches its netlist. A slider outside a `.sim` fails.
  It prints the list of every simulator on the site — that list is the inventory.
- **Kit details worth knowing:** `WidgetKit.svgLabel(textEl, "<i>V</i><sub>2</sub>")` writes SVG
  labels with italic symbols and real subscripts; `graph.ref(…, { side, below })` places a guide
  line's label; a simulator may hide a slider for one mode (hidden sliders are not measured); a
  simulator inside a closed `<details>` is fine (the check opens it, as a pupil would). Engineering
  pages add `.sim { --sim-accent-ink: var(--eng-ink-accent); }` so accent text stays AA.
- **Adopted (13 Oct 2026): every simulator on the site** — 21 across Electronics (555, theory),
  Higher (electricity, relativity), N5 Engineering and S3 Physics. No page carries `bindPair`.
- **Still check by eye**, as for every page: a headless Chrome look, and the physics by the teacher.

