## AH lab pages — the site standard (approved 11 November 2026)

**What it is.** An Advanced Higher lab sheet is a **web page**, not a PDF. A pupil does the
experiment **on their own**, so the page carries everything: method, safety, what to do when it
goes wrong, a results table that saves, a live graph and the write-up headings. It prints cleanly
for anyone who wants paper. The teacher does not need to be in the room.

**Model page:** `classes/adv/electromagnetism/lab-f-bil-top-pan-balance.html` (j 3.1b, PR #278).
**Copy it** for a new lab. Change the content; keep the structure, classes and shared files.

This is an AH-only exception to the lean practical-sheet house style (no method or safety on the
sheet). N5, Higher and Engineering practical sheets keep the lean style.

### 1. Files

| What | Where |
|---|---|
| Page | `classes/adv/<unit-folder>/lab-<kebab-title>.html` (unit folder as already used: `rotational-astrophysics`, `quanta-waves`, `electromagnetism`) |
| Shared CSS | `assets/css/ah-lab.css` — linked after `adv-higher-physics.css` and `sims.css` |
| Shared JS | `assets/js/ah-lab.js` — needs `widget-kit.js` before it |
| Hub tile | `classes/adv/topics.html`, **Lab sheets** row (`#labs`), one `.hub-tile` per lab, title starts with the topic letter (`j · …`), drawn icon from the AH sprite |

Hand-built page, `layout: none`, AH theme. `reading.css` is not used. Page-only CSS stays in the
page's own `<style>` and is kept small; anything a second lab would need goes into `ah-lab.css`.

### 2. Order on the page (fixed)

Each block is a `section.panel` with an `id` that the subnav links to.

1. **Banner**: `<h1>` = what is measured ("Measuring B with a Top-Pan Balance"); the line under it is
   `Advanced Higher Physics · <Unit topic> · Lab sheet`.
2. **Subnav**: Idea · Set-up · Safety · Method · Results · Finding X · Write-up, plus `AH topics`.
3. **Back link + feedback button** (`.lab-top`, `feedback-button.html about="AH lab: …"`).
4. **The idea** (`#idea`): short physics, `.lab-eq` cards for each equation, the end-view or
   principle figure beside it (`.lab-idea` grid), and a `.lab-syms` symbol list with units.
5. **Aim and set-up** (`#setup`): the aim in one line, then **Predict** (sketch the expected graph,
   say why). Labelled apparatus figure (Figure 1). **Equipment** as `.lab-ticks.cols` tick boxes,
   with ranges and resolutions given (e.g. "reads to 0.01 g").
6. **Safety** (`.panel.lab-safety`, `#safety`): bold lead phrase + one sentence per point. Only the
   real hazards of this kit.
7. **Method** (`#method`): numbered `.lab-ticks` steps, one action each, a tick box per step. The
   last step records the scale-reading and calibration uncertainties of every instrument.
   Then **If it goes wrong** (`dl.lab-trouble`): the symptom, then what to check.
8. **Results** (`#results`): the table built from the `#labData` JSON (§3), the extra inputs
   (`.lab-extra`, e.g. `l` and its uncertainty), the **live graph**, then **Copy for Excel** and
   **Clear table** buttons and the `#labStatus` line.
9. **Finding X** (`#finding`): numbered `.lab-steps`: mean and random uncertainty, combining
   uncertainties, the quantity, the graph, the gradient, the result, the gradient uncertainty, the
   final uncertainty. It ends "Your answer: X = ( … ± … ) unit".
10. **Your write-up** (`#writeup`): `.lab-writeup` table with **Heading · What it needs · Done** (a tick
    box). The headings are the AH Project sections: Aim, Procedure, Results, Analysis, Uncertainties,
    Conclusion and evaluation. Keep each "what it needs" to one or two sentences.
11. **Hand-in line** (`.lab-handin`): "Hand in your write-up on paper, in the tray." No date.
12. **After the lab, try these past-paper questions** (`.lab-papers`): bank items only, links to
    the scotpapers paper + marking PDFs.
13. **Credits line** (`p[data-credit-note]`): figures drawn by R Stewart; past papers ©
    Qualifications Scotland (SQA); `R Stewart - Month Year`.

**Not on a lab page:** worked-out B or uncertainties for the pupil, a sense-check line, a time
guide, a date, emojis.

### 3. The results table and graph (`#labData`)

The table is not written in HTML. `ah-lab.js` builds it from one JSON block:

```html
<script type="application/json" id="labData">
{
  "id": "fbil",                        // short, unique; storage key is ahlab-<id>-v1
  "fixed": { "key": "I", "label": "<var>I</var> (A)", "unit": "A", "values": ["0.50", "1.00"] },
  "cols": [ { "key": "dm1", "label": "<var>Δm</var> Run 1 (g)" }, … ],
  "extra": [ { "key": "l", "label": "l (mm)" } ],
  "graph": { "title": "…",
             "x": { "min": 0, "max": 3.5, "label": "current <i>I</i>", "unit": "A", "step": 0.5 },
             "y": { "min": 0, "max": 2, "label": "…", "unit": "g" },
             "plot": ["dm1", "dm2", "dm3"] }
}
</script>
```

- **Fixed column** = the independent variable at set values. **Three runs** of the raw reading,
  then the pupil's own worked columns (mean, random uncertainty, the derived quantity, its
  uncertainty). Every cell is an input; nothing is calculated for the pupil.
- **Graph plots the raw readings** of every run, one colour per run, so a bad reading shows at once.
  The y axis grows to fit. Pupils still draw their own graph of the derived quantity.
- **Saving:** cells, extra inputs and every `data-tick` box save to `localStorage` on this device
  only. **Clear table** needs two taps. A non-number is flagged, not rejected.
- **Copy for Excel:** tab-separated, headers in plain text, extras underneath (for LINEST).
- Bump the `?v=` on `ah-lab.css` / `ah-lab.js` whenever either file changes. If a change to the
  JSON shape would break saved readings, change the key suffix to `-v2`.

### 4. Figures

- Ladder (CLAUDE.md §7): an SQA figure first if a current bank item shows the set-up, else drawn.
- Drawn figures are **inline SVG**, emitted by a small Python script in the project's `_build/`
  (model: `3. Electromagnetism/_build/svg_fbil.py`), coloured with the page's CSS variables so they
  theme light and dark. Labels are real SVG `<text>`. Each `<svg>` has `role="img"` and an
  `aria-label` that describes the set-up in full sentences.
- **Phone (≤ 600 px):** apparatus labels become numbered markers with a `.fig-key` list under the
  figure, so no label drops below 12 px. The key is hidden in print.
- UK/BS-IEC circuit symbols, a junction dot at every real node.

### 5. Writing

- Short, plain sentences; one action per method step; UK spelling; "you", not "pupils".
- Bold the lead phrase of each safety point, trouble symptom and Finding step.
- Equations in `.lab-eq` (Cambria, bold) with an `aria-label` that reads them out; symbols in `<var>`.
- Uncertainty words follow the AH course spec: scale reading, calibration, random; combine in
  quadrature; leave out any smaller than a third of the biggest.

### 6. Before it ships

- **Bank check** (`web-exam-items`): the past-paper list is current bank items, linked to the paper
  and marking PDFs. If no item fits, say so in the project `STATE.md`.
- **Kit check:** the teacher confirms the equipment, ranges and steps match the real kit.
- **Checks (Tier 2):** headless Chrome at 1180 px and 390 px,
  current appearance; type a full table, reload, confirm it restores; graph shows every reading;
  Copy for Excel pastes; print preview fits in order. Tier 1 (both appearances, both widths, full
  print check) only when `ah-lab.css` / `ah-lab.js` change.
- Contact sheet in Preview → teacher notes → approval → commit, push, PR (one per lab).
- Credits: add the lab to `CREDITS.md` + `classes/credits.html` only if it uses outside material.
