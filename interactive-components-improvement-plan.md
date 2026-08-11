# Interactive components improvement — LOCKED PLAN

> **Purpose of this doc:** a self-contained, ready-to-implement plan to deepen the *learning value* of
> the hands-on interactives on S3 Physics, S3 Engineering and N5 Engineering. Written so it can be
> picked up cold in a fresh terminal on a future day — every file path, challenge ID, engine call and
> acceptance test is in here. Read top-to-bottom once, then execute the **sequenced build order in §7**,
> obeying the **guardrails in §8** and ticking the **definition of done in §9** for each step.
>
> **State at time of writing:** plan only, nothing built. Branch when starting:
> `git switch -c interactives-enrichment` off `main` (do **not** work on
> `progress-s3-physics-electricity1`).

---

## 0. Locked decisions (confirmed with Robert, 2026-06-25 → 2026-06-29)

| Decision | Choice |
|----------|--------|
| **Scope** | S3 Electricity 1 + N5 Engineering (contexts, energy) **+ S3 Engineering** (`what-is-an-engineer`) |
| **PhET embed** | **Keep both** — our in-house live sim feeds the challenges; PhET stays as a free-build sandbox below it |
| **Ambition** | **Full P1–P2 set** across the in-scope pages |
| **Sim placement** | **Inline** on the topic page, beside the relevant concept |
| **Per-concept coverage** | **Every taught concept on every in-scope page carries ≥1 scored *manipulable* interactive** (live-sim / drag-place / builder / game), not just a quiz, cloze or 30-sec quickcheck. Applies to S3 Electricity (L1–L6), N5 contexts (S1–S5), N5 energy (S1–S5), S3 Engineering (each section). Coverage matrix in §3a. |
| **Engineering concept-card reframe** | **All three Engineering pages** (N5 contexts, N5 energy, **and** S3 `what-is-an-engineer`) rebuild to the **Higher-Physics concept-card model**: each concept = brief notes → guided explainer → worked example → scored interactive. **Trim the booklet detail** (drop the heavy definition tables + "Booklet p.X task" references; pupil uses the physical booklet). A **separate "Check your booklet work" answers section is retained** at the foot. Template + per-page card plan in §4a. |

---

## 1. Reference standard (what "good" means here)

Copy the *interaction DNA*, not the palette:

- **Higher Physics electricity** (`classes/higher/electricity/current-pd-power-resistance.html`):
  `<input type="range">` + a linked `<input type="number">` → a **live SVG diagram** + **live numeric
  readouts**, no submit button. e.g. potential-divider V₁/V₂, Wheatstone balance. **This page is also
  the structural reference for the Engineering concept-card reframe (§4a).**
- **Electronics** (`classes/electronics/555-astable.html`, `stripboard-builder.html`): `<canvas>`
  waveform that redraws as sliders move; tap-to-place builder.
- **The common thread:** *change an input → immediately see the model respond.* That is the missing
  ingredient on the S3/Eng pages, which are currently almost all tap-to-answer.

**Pedagogical rule for every new widget — Predict → Manipulate → See → Score:** lead with a one-tap
prediction, let the pupil drive a live model, show the consequence visually *and* numerically, then
register the challenge. Wrong predictions never cost points.

---

## 2. The progress engine — facts you must not re-derive

- **One engine, never forked.** Logic lives in `assets/js/progress.js` (`window.Progress`). Each subject
  has a config in `assets/js/progress/<ns>.js` calling `Progress.init(cfg)`. Construction guide:
  `progress-system-guide.md`. Logic harness: `test/progress.html`.
- **One storage key per subject:** `progress-<ns>-v1`. Exploratory widget state uses its own per-page
  prefix (`s3-…`, `eng-…`, `wie-…`) and is **never** written into the progress key.

### API cheat-sheet (verified against the engine + a wired page)

```js
Progress.init(cfg)            // called once by the subject config file
Progress.markSeen(badgeId)    // call once when a tracked page mounts — feeds "explorer", never scores
Progress.complete(chId)       // page-unlock model: a data-prog-challenge passed
Progress.miss()               // page-unlock model: a tracked attempt failed (streak handling)
Progress.record(id,score,max) // scored model: logs BEST attempt, sticky unlock at threshold
```

- **Page-completion badge** (`unlock:"page"` in the config): the badge earns itself once **every**
  `data-prog-challenge` on the page is `complete()`-d. This is the model all three subjects use.
- The engine **auto-counts** `[data-prog-challenge]`, `.prog-cloze`, `.prog-fillin` into the page total.
  **Every new challenge raises that page's total, so the page badge now requires it too** — re-check the
  count against `test/progress.html` whenever you add/remove one.
- **Canonical wiring pattern** (copy verbatim from
  `classes/n5-engineering/engineering-contexts-and-systems.html` ~lines 1762–1830):

```js
// on success of a challenge wrapper with data-prog-challenge="ch-foo":
if (correct) { window.Progress.complete(id); } else { window.Progress.miss(); }
// once, when the page mounts:
if (window.Progress) { window.Progress.markSeen("eng-contexts"); }
```

---

## 3. Current-state facts (audited 2026-06-25/29)

| Page | Lines | Engine? | Instrumented challenges | Interactive depth | Key gap |
|------|-------|---------|------------------------|-------------------|---------|
| `classes/s3-physics/electricity1.html` | 2346 | ✅ `s3-physics.js` | **32** (quiz, checks, predict, cloze, match game, colour-code, triangle, graph pick) | Tap-to-answer + **PhET iframe** (click-to-load) + static SVG circuits | **No in-house live sim**; V–I taught with static graph + MCQ; **L5 has no manipulable interactive** |
| `classes/n5-engineering/engineering-contexts-and-systems.html` | 1841 | ✅ `eng-n5.js` | **12** (match, builder, cloze, predict, quiz) — all wired | Strongest of the set; builders are good | Closed-loop control is a *builder*, never *runs*; **S3 sustainability has no interactive**; booklet-style notes |
| `classes/n5-engineering/energy-and-efficiency.html` | 1379 | ✅ loads `eng-n5.js` | **0** — has `data-match`/`data-builder` widgets but **none carry `data-prog-challenge`** | Match + builder, not scored | **BUG: `eng-energy` badge can never unlock**; **S3 conservation + S4 calculations have no interactive**; booklet-style notes |
| `classes/s3-engineering/what-is-an-engineer.html` | 3290 | ❌ none | 0 (custom `wie-*` sorter/builder/quiz, un-instrumented) | Real interactives (`wie-sorter`, system-diagram builder, `wie-quiz`) but outside the engine | **Not on the engine**; no `s3-engineering` config; **case-study section has no interactive**; booklet-style notes |
| `classes/s3-engineering/{logic,electronics,energy,mechanisms,pneumatics,computer-control}.html` | ~24 each | ❌ | 0 | **"Coming Soon" stubs** | No content yet — **out of scope** (content-build job, not interactive polish) |

Config files: `assets/js/progress/{s3-physics,eng-n5}.js` exist. **`s3-engineering.js` does not exist yet.**

---

## 3a. Per-concept coverage matrix (the requirement made concrete)

Goal: **every concept ends with ≥1 scored manipulable interactive.** "✅ have" = a manipulable scored
widget already exists; "🔶 planned" = a work package below adds one; "❌ gap" = a concept that today has
*only* tap-to-answer / quickcheck / reading and needs a new scored interactive. The gaps are exactly
what WP-8…WP-11 (and the WP-7 case-study extension) close.

### `s3-physics/electricity1.html` — L1–L6
| Concept | Today | Action |
|---------|-------|--------|
| L1 — Circuit symbols | ✅ symbol-matching game (`ch-tool-symbol`) | keep |
| L2 — Current & voltage | 🔶 WP-3 live circuit sim + WP-5 meter drag-place | build |
| L3 — Resistance & colour codes | ✅ colour-code game (`ch-tool-colour`) | keep |
| L4a — Ohm's law: equations & calc | ✅ formula triangle + V=IR practice generator | keep |
| L4b — V–I graphs & temperature | 🔶 WP-4 live Ohm's-law explorer + V–I plot | build |
| **L5 — Combining resistors (basic)** | **❌ only the 30-sec quickcheck** | **WP-8 (new live R-combiner)** |
| L6 — Combining resistors (tricky) | ✅ order-the-steps builder (`ch-order-combo`) | keep |

### `n5-engineering/engineering-contexts-and-systems.html` — S1–S5
| Concept | Today | Action |
|---------|-------|--------|
| S1 — Engineering and engineers | ✅ match (`ch-match-engineer`) | keep |
| S2 — Contexts and impacts | ✅ match (`ch-match-impacts`) | keep |
| **S3 — Sustainability & emerging tech** | **❌ reading only** | **WP-9 (new scored sort)** |
| S4 — The systems approach | ✅ builder (`ch-build-fan`) | keep |
| S5 — Control systems | ✅ match + cloze + predict + builder, 🔶 WP-6 runnable loop | keep/build |

### `n5-engineering/energy-and-efficiency.html` — S1–S5
| Concept | Today | Action |
|---------|-------|--------|
| S1 — Forms of energy | 🔶 WP-1 wires `match-forms` (`ch-match-forms`) | wire |
| S2 — Energy in systems | 🔶 WP-1 wires `build-transform` + `match-iuw` | wire |
| **S3 — Conservation of energy** | **❌ reading only** | **WP-10 (new live energy-balance)** |
| **S4 — Energy calculations** | **❌ worked text only** | **WP-11 (new scored calc generator)** |
| S5 — Efficiency & energy audits | 🔶 WP-2 live Sankey + `ch-efficiency-target` | build |

### `s3-engineering/what-is-an-engineer.html` — by section
| Concept | Today | Action |
|---------|-------|--------|
| Types of engineers | 🔶 WP-7 wires `jobs-sorter` (`ch-sort-jobs`) | wire |
| Systems thinking | 🔶 WP-7 wires + enriches system-diagram builder (`ch-build-system`) | wire/enrich |
| **Local case study (Duns Park)** | **❌ reading only** | **WP-7 ext.: `ch-case-system` drag-place** |
| Impacts of engineering | 🔶 WP-7 wires `impact-sorter` (`ch-sort-impacts`) | wire |
| Test yourself | 🔶 WP-7 wires `wie-quiz` (`ch-quiz`) | wire |

---

## 4. The reusable interactive kit (build once, reuse everywhere)

To stay true to "one engine, never a fork", factor every new manipulable widget onto **three shared
exploratory patterns**. Build them as small, dependency-free, page-level JS helpers (inline per page is
fine — they are *widget* code, not *engine* code). State is transient and prefixed (`s3-…`/`eng-…`),
never in the progress key. **Build the kit before the WPs that consume it (see §7).**

1. **`live-sim`** — one or more `<input type="range">` each paired with a linked `<input type="number">`
   (two-way synced), driving a `render()` callback that updates an SVG/canvas + readout nodes. This is
   the generalisation of the Higher potential-divider pattern. Keyboard-driveable; `aria-live="polite"`
   on readouts; honours `prefers-reduced-motion` (freeze animations). **Consumers:** WP-2, WP-3, WP-4,
   WP-8, WP-10.
2. **`poe-card`** — predict-button row → reveal → then exposes / scrolls to the `live-sim` so the pupil
   tests their prediction. Reuses the page's existing `.predict-btns`/`.predict-fb` styling.
   **Consumer:** WP-7 enrich.
3. **`drag-place`** — tap-or-drag tokens into labelled slots; validate; success lights the model, failure
   shows the realistic failure mode. **Must have a tap-only fallback** (no drag-only interactions).
   **Consumers:** WP-5, WP-7 case-study, WP-9.

Each scored widget calls `Progress.complete(chId)` on success / `Progress.miss()` on fail (page-unlock
model). Each tracked page calls `Progress.markSeen(badgeId)` once on mount.

---

## 4a. Engineering concept-card reframe (Higher-style)

All three Engineering pages move from booklet-style reference to the **Higher concept-card model** (copy
the *structure* of `classes/higher/electricity/current-pd-power-resistance.html`, keep the Engineering
palette). The page chrome (banner, hub-link, footer) and the foot sections
("Check your booklet work", "Key ideas at a glance", "Check yourself") are **untouched**; only the
**concept sections** are rebuilt.

### Card anatomy (every concept, in this order)
```html
<section class="panel sec" id="cN" aria-labelledby="cN-title">
  <span class="concept-tag">Concept N</span>
  <h2 id="cN-title">Title <span class="badge exam">Exam</span></h2>

  <p class="lead">Brief notes — 2–4 sentences, MUCH shorter than the booklet. No big tables.</p>

  <!-- LEARNING (both, per locked decision): -->
  <!-- 1. guided explainer: a short annotated diagram / step-through that teaches the idea -->
  <!-- 2. worked example: eq-card(s) for calc concepts (serif equations, <var>, real .frac fr-n/fr-d),
          or a worked walk-through for non-calc concepts -->

  <!-- SCORED INTERACTIVE: a data-prog-challenge widget (the §3a / §5 interactive for this concept) -->
</section>
```

**Removed from the cards:** the large `.tbl` definition tables, full word-lists, and every
"Booklet p.X task" reference. **Kept, separate, at the foot of each page:** the existing
`Check your booklet work` answers block, `Key ideas at a glance`, and `Check yourself`.

**Equations:** N5 Energy calcs use real eq-cards — serif `"Times New Roman"`, quantity symbols in
`<var>`, fractions via `.frac` `fr-n`/`fr-d` (never `num`/`den`), two worked examples per equation —
exactly the Higher rules in `higher-topic-page-guide.md`. Engineering palette tokens stay (N5 Eng
`#d74a84`, Eng Sci orange `#f28c28`); equations don't change colour.

### Per-page concept-card plan (concept → learning → scored interactive)

**N5 `engineering-contexts-and-systems.html` (5 cards):**
| Card | Brief notes on | Scored interactive |
|------|----------------|--------------------|
| C1 Engineering & engineers | what engineers do; disciplines | `ch-match-engineer` (exists) |
| C2 Contexts & impacts | economic/social/environmental | `ch-match-impacts` (exists) |
| C3 Sustainability & emerging tech | the 6 R's, emerging tech | **WP-9** new sort |
| C4 The systems approach | input–process–output, sub-systems | `ch-build-fan` builder (exists) |
| C5 Control systems | open vs closed loop, feedback | builder + **WP-6** runnable loop |

**N5 `energy-and-efficiency.html` (5 cards):**
| Card | Brief notes on | Scored interactive |
|------|----------------|--------------------|
| C1 Forms of energy | the 7 forms; the 4 calc forms | `ch-match-forms` (**WP-1** wires) |
| C2 Energy in systems | input / useful / wasted | `ch-build-transform` + `ch-match-iuw` (**WP-1**) |
| C3 Conservation of energy | energy can't be created/destroyed | **WP-10** live energy-balance |
| C4 Energy calculations | Eₑ=VIt, Eₖ, Eₚ, Eₕ (eq-cards + 2 worked examples each) | **WP-11** calc generator |
| C5 Efficiency & energy audits | efficiency = useful/input ×100 | **WP-2** live Sankey |

**S3 `what-is-an-engineer.html` (4 cards + page quiz):**
| Card | Brief notes on | Scored interactive |
|------|----------------|--------------------|
| C1 Types of engineers | disciplines & roles | `ch-sort-jobs` (**WP-7**) |
| C2 Systems thinking | input–process–output | `ch-build-system` (**WP-7**, enriched) |
| C3 Local case study (Duns Park) | the worked local example | `ch-case-system` drag-place (**WP-7**) |
| C4 Impacts of engineering | social/economic/environmental | `ch-sort-impacts` (**WP-7**) |
| (page) Test yourself | — | `ch-quiz` (**WP-7**) |

The reframe itself is captured as **WP-12 / WP-13 / WP-14** in §5; the right-hand column lists the
existing/new WPs that slot into each card's scored-interactive position.

---

## 5. Work packages (the actual build)

Priority: **P1** = biggest learning gain / fixes a bug · **P2** = strong enrichment.
Each package lists the file, the new challenge IDs to register, config edits, and acceptance criteria.

### WP-1 — Fix energy & efficiency wiring  ·  P1  ·  `energy-and-efficiency.html`
The `eng-energy` badge currently cannot unlock. Make the existing widgets count.
- Add `data-prog-challenge` to the existing `data-match` (`match-forms`, `match-iuw`) and `data-builder`
  (`build-transform`) widgets — IDs: `ch-match-forms`, `ch-match-iuw`, `ch-build-transform`.
- Port the wiring loop from the contexts page (§2): on check-pass → `Progress.complete(id)`, else
  `Progress.miss()`; add `Progress.markSeen("eng-energy")` on mount.
- **Acceptance:** completing all three challenges unlocks `eng-energy` in `progress-eng-n5-v1`; hub
  total on the N5 Engineering hub increments; verified against `test/progress.html` counting.

### WP-2 — Live efficiency + Sankey model  ·  P1  ·  `energy-and-efficiency.html`
New `live-sim`: sliders for **input energy (J)** and **useful output (J)** → live **efficiency %**
readout + a **proportional Sankey bar** (useful = green, wasted = amber, each labelled with text + %).
- New challenge `ch-efficiency-target`: "Make this device 60% efficient (±2%)" → `Progress.complete`.
  No new badge — counts toward the existing `eng-energy` page badge (just ensure the new
  `data-prog-challenge` is in the page so the engine counts it).
- **Acceptance:** dragging sliders updates %, bar and readout in real time; target challenge completes;
  efficiency clamps 0–100%; reduced-motion users still get instant (non-animated) bar updates.

### WP-3 — Live series/parallel circuit sim  ·  P1  ·  `electricity1.html`
In-house `live-sim` placed **above** the existing PhET embed (PhET stays as the sandbox).
- Sliders: **supply voltage**, **R₁**, **R₂**; a **series ↔ parallel** toggle.
- Live SVG circuit with **current-flow dots** (speed ∝ current; frozen under reduced-motion), **lamp
  brightness** ∝ current, and live **ammeter + voltmeter** readouts that obey the series/parallel rules.
- New challenge `ch-sim-parallel-equal`: "In parallel, make both lamps equally bright and read off each
  lamp's voltage" → `Progress.complete`.
- **Acceptance:** readouts numerically obey the rules (series: same I, V splits; parallel: same V, I
  splits); the existing predict cards (`ch-predict-parallel`, `ch-whatif`) now have a model to test
  against; PhET still loads on demand below.

### WP-4 — Live Ohm's-law explorer + V–I graph  ·  P2  ·  `electricity1.html`
Replace the static V–I graph + pick-an-answer with a `live-sim`: sliders **V** and **R** → live **I**;
a **V–I plot that draws as V sweeps**; an **ohmic ↔ filament-lamp** toggle (straight line vs curve).
- Keep the existing triangle tool; this caps it with a "why the lamp's line bends" moment.
- New challenge `ch-graph-live`: identify which trace is ohmic after sweeping both → `Progress.complete`
  (can replace the old static `ch-graph` pick; if so, keep the challenge **count stable** or update IDs
  consistently so the page total still matches what `s3-physics.js` expects).
- **Acceptance:** I = V/R holds live; lamp curve visibly non-linear; graph is keyboard-operable.

### WP-5 — Drag-to-place the meters  ·  P2  ·  `electricity1.html`
Turn the "ammeter in series / voltmeter in parallel" misconception box (~line 617) into a `drag-place`:
drop the ammeter into the loop and the voltmeter across a lamp. Correct → circuit lights; voltmeter in
series → no current (realistic failure). Tap fallback required.
- New challenge `ch-meter-place`: both meters correctly placed → `Progress.complete`.
- **Acceptance:** wrong placements show the failure mode, not just a red X; works tap-only on iPad.

### WP-6 — Running closed-loop control sim  ·  P2  ·  `engineering-contexts-and-systems.html`
After the existing build-the-loop builder, add a **runnable** thermostat/temperature loop: a **feedback
ON/OFF** toggle + a **disturbance** button. Feedback on → value settles to setpoint; off → it drifts.
- New challenge `ch-loop-stabilise`: with feedback on, recover from a disturbance to setpoint →
  `Progress.complete`. Counts toward the existing `eng-contexts` page badge.
- **Acceptance:** observable difference between open/closed loop; reduced-motion → stepwise not animated.

### WP-7 — Put `what-is-an-engineer` on the engine + enrich  ·  P1 (wiring) / P2 (enrich)  ·  `s3-engineering/what-is-an-engineer.html`
This page has real `wie-*` interactives but is **not on the progress engine** and there is **no
`s3-engineering` config**.
- **Create `assets/js/progress/s3-engineering.js`** (model on `eng-n5.js`): `ns:"s3-engineering"`,
  page badge `wie-engineer` ("Engineering Explorer", `unlock:"page"`), a rank ladder, and the two
  standard achievements. Palette via Engineering-Science orange tokens (`#f28c28`) — token-driven, no
  new stylesheet.
- Add the two `<script>` tags to the page; add `data-prog-challenge` to the `wie-sorter` (job sort),
  the system-diagram builder, the impact sorter and `wie-quiz` (IDs: `ch-sort-jobs`, `ch-build-system`,
  `ch-sort-impacts`, `ch-quiz`); wire each to `Progress.complete`/`miss`; `markSeen("wie-engineer")`.
- **Enrich (P2):** upgrade the system-diagram builder toward the contexts-page builder standard and add
  one `poe-card` on "what makes something a system".
- **Per-concept coverage (case study):** the **Local case study (Duns Park)** section is reading-only.
  Add a scored `drag-place` "tap-to-identify the input / process / output of the case-study system"
  (`ch-case-system`) — making **five** tracked challenges.
- Wire the S3 Engineering **hub** (`classes/s3-engineering-science.html`) with `id="progressHub"` +
  `data-prog-badges` so the badge surfaces there (mirror how the N5 hub does it).
- **Acceptance:** badge unlocks on completing all **five** challenges; appears on the S3 Eng hub; no
  double storage key; `wie-*` transient state stays out of `progress-s3-engineering-v1`.

### WP-8 — Live combined-resistance sim  ·  P1  ·  `electricity1.html` (L5)
L5 (Combining resistors – basic) has **no manipulable interactive** today — only the 30-sec quickcheck.
Add a `live-sim` reusing the WP-3 helper, focused on the *numbers/formula* rather than the circuit:
- Sliders **R₁**, **R₂** + a **series ↔ parallel** toggle → live **total resistance** readout with the
  working shown (series: R₁+R₂; parallel: the product-over-sum line), updating as you drag.
- New challenge `ch-combine-target`: "Using two resistors in **parallel**, get the total below R₁"
  (i.e. demonstrate parallel always lowers resistance) → `Progress.complete`.
- **Acceptance:** total obeys the rules live (series > either; parallel < smaller); `aria-live` readout;
  reduced-motion → instant update; raises the L5 challenge count in `s3-physics.js`.

### WP-9 — Scored sustainability sort  ·  P2  ·  `engineering-contexts-and-systems.html` (S3)
S3 (Sustainability & emerging technologies) is reading-only. Add a scored `drag-place`/sort widget
mirroring the existing match widgets on the page.
- New challenge `ch-sort-sustainability`: sort technologies/impacts into sustainable vs unsustainable
  (or the 6 R's) → `Progress.complete`. Counts toward the existing `eng-contexts` page badge.
- **Acceptance:** tap-only fallback; wrong placement shows why; raises the page challenge total in the
  config; verified against `test/progress.html`.

### WP-10 — Live energy-balance model  ·  P2  ·  `energy-and-efficiency.html` (S3)
S3 (Conservation of energy) is reading-only. Add a small `live-sim`: sliders for the output energy
shares → a live **total** that must equal the fixed **input** (energy can't be created/destroyed).
- New challenge `ch-energy-balance`: make the outputs sum to the input (±) → `Progress.complete`.
  Counts toward `eng-energy`.
- **Acceptance:** total updates live and flags imbalance non-colour-only; reduced-motion safe; raises
  the `eng-energy` challenge count.

### WP-11 — Scored energy-calculation generator  ·  P2  ·  `energy-and-efficiency.html` (S4)
S4 (Energy calculations) has no interactive. Add a scored **practice generator** modelled on the S3
Physics V=IR generator — random Eₑ=VIt / Eₖ / Eₚ / Eₕ questions with answer check.
- New challenge `ch-energy-calc`: a correct generated calculation → `Progress.complete`. Counts toward
  `eng-energy`.
- **Acceptance:** units enforced; new question on demand; keyboard-operable; raises the `eng-energy`
  challenge count.

### WP-12 — Concept-card reframe: N5 contexts  ·  P1  ·  `engineering-contexts-and-systems.html`
Rebuild the five S1–S5 sections as the §4a concept cards (C1–C5). Per card: trim the booklet tables to
a `<p class="lead">` (2–4 sentences), add a guided explainer + worked walk-through, then keep/insert the
scored interactive named in the §4a table. Remove all "Booklet p.X task" references from the cards.
- **Keep separate:** `Check your booklet work`, `Key ideas at a glance`, `Check yourself` — untouched.
- The interactives themselves are WP-6 and WP-9 (plus the existing match/builder widgets); this WP is the
  **card shell + notes-trim + explainer/worked-example** around them.
- **Acceptance:** every card reads short by default and ends in a scored interactive; no `.tbl`
  definition tables remain in the concept cards; badge math re-checked.

### WP-13 — Concept-card reframe: N5 energy  ·  P1  ·  `energy-and-efficiency.html`
Same reframe for the five energy sections (C1–C5). C4 (Energy calculations) gets real **eq-cards** for
Eₑ=VIt, Eₖ, Eₚ, Eₕ — serif equations, `<var>`, `.frac` `fr-n`/`fr-d`, **two worked examples each** — to
the Higher standard. Slot in the WP-1/WP-2/WP-10/WP-11 interactives per the §4a table.
- **Acceptance:** notes trimmed; eq-cards render true 2-D fractions; each card ends in a scored
  interactive; `Check your booklet work` retained separately; badge math re-checked.

### WP-14 — Concept-card reframe: S3 what-is-an-engineer  ·  P1 / P2  ·  `s3-engineering/what-is-an-engineer.html`
Reframe the four concept sections (C1–C4) plus the page quiz to the card model, **in the same change as
the WP-7 engine wiring** (they touch the same page — do them together). Trim notes; add explainer +
worked example per card; the `wie-*` interactives become each card's scored slot.
- **Acceptance:** cards read short and end in a scored interactive; WP-7 wiring + hub surfacing intact;
  `Check your booklet work` retained separately; `s3-engineering` badge unlocks on all five challenges.

---

## 6. Out of scope (record so it isn't re-litigated)

- The six S3 Engineering **"Coming Soon" stubs** (`logic`, `electronics`, `energy`, `mechanisms`,
  `pneumatics`, `computer-control`) — these need *content first*; they are a `/new-page` build job, not
  interactive polish. Flag for a separate content plan.
- Cross-subject profiles / leaderboards — explicitly excluded by the rollout plan.
- Retiring PhET — decided against (kept as sandbox).

---

## 7. Build order (sequenced, ready to implement)

Work the steps **in order**. Each step names its files, what it depends on, and its **ship point**
(commit + optionally open a PR). One commit per WP, `feat(interactives):` prefix. Tick §9 before each
ship. **Build the kit (Step 1) before any WP that consumes it.**

> **Step 0 — Branch & baseline.** `git switch main && git pull && git switch -c interactives-enrichment`.
> Read §2 + `progress-system-guide.md`; open the canonical wired example (contexts page ~L1762–1830) and
> the structural reference (Higher CPR page). Confirm `test/progress.html` runs.

| # | Phase | Step / WP | Files | Depends on | Ship point |
|---|-------|-----------|-------|------------|------------|
| 1 | **Kit** | Build `live-sim`, `poe-card`, `drag-place` helpers + smoke-test on a scratch page | (helper JS, reused inline per page) | Step 0 | commit `feat(interactives): shared widget kit` |
| 2 | **Fix** | **WP-1** — wire the dead `eng-energy` badge | `energy-and-efficiency.html` | — | PR (immediate value, no UI) |
| 3 | **S3 Physics** | **WP-3** — live series/parallel circuit sim | `electricity1.html` | Step 1 | commit |
| 4 | S3 Physics | **WP-4** — live Ohm's-law explorer + V–I graph | `electricity1.html` | Step 1 | commit |
| 5 | S3 Physics | **WP-5** — drag-to-place meters | `electricity1.html` | Step 1 | commit |
| 6 | S3 Physics | **WP-8** — live combined-resistance sim (closes L5 gap) | `electricity1.html`, `s3-physics.js` | Step 3 | PR — S3 Physics now fully covered (L1–L6) |
| 7 | **N5 energy** | **WP-2** + **WP-10** + **WP-11** — Sankey, energy-balance, calc generator | `energy-and-efficiency.html`, `eng-n5.js` | Steps 1–2 | commit per WP |
| 8 | N5 energy | **WP-13** — concept-card reframe (incl. C4 eq-cards) | `energy-and-efficiency.html` | Step 7 | PR — N5 energy reframed + fully covered |
| 9 | **N5 contexts** | **WP-6** + **WP-9** — runnable control loop, sustainability sort | `engineering-contexts-and-systems.html`, `eng-n5.js` | Step 1 | commit per WP |
| 10 | N5 contexts | **WP-12** — concept-card reframe | `engineering-contexts-and-systems.html` | Step 9 | PR — N5 contexts reframed + fully covered |
| 11 | **S3 Eng** | **WP-7** + **WP-14** *(same change)* — new `s3-engineering.js`, engine wiring, case-study interactive, card reframe, hub wiring | `what-is-an-engineer.html`, `s3-engineering.js`, `s3-engineering-science.html` | Step 1 | PR — largest single job; S3 Eng onboarded, reframed, fully covered |

**Phase boundaries are independently shippable.** "Done" for the whole plan = every row above merged;
per-concept coverage (§3a) is met once WP-7 case-study + WP-8/9/10/11 ship; the Engineering pages count
as "reframed" once WP-12/13/14 ship.

---

## 8. Guardrails (hard rules — must hold for every step)

**Engine / data**
- One engine, never forked — page logic lives in `assets/js/progress.js`; pages only add neutral hooks +
  a subject config. Do **not** hand-roll progress JS or call `Progress._internals` (test harness only).
- One storage key per subject `progress-<ns>-v1`. Exploratory widget state uses an `s3-…`/`eng-…`/`wie-…`
  prefix — **never** the progress key.
- Every new `data-prog-challenge` raises the page total → re-check badge math against `test/progress.html`
  before shipping. Keep IDs stable; if you replace one, update the config count consistently.

**Pedagogy / structure**
- Every concept ends in a scored manipulable interactive (§3a). Predict → Manipulate → See → Score;
  wrong predictions never cost points.
- Reframe (WP-12/13/14): each card = `concept-tag` → `<h2>` → brief `lead` notes (no `.tbl` tables, no
  "Booklet p.X" refs) → guided explainer → worked example → scored interactive. `Check your booklet work`
  stays as its own foot section.

**Design system** (`CLAUDE.md`)
- Correct subject tokens: S3 Physics `#00747c` · N5 Eng `#d74a84` · Eng Sci orange `#f28c28`.
- Equations serif with quantity symbols in `<var>`; `.frac` uses `fr-n`/`fr-d` (**never** `num`/`den`).
- Banner & overlay rules untouched; no new per-subject progress stylesheet (engine injects token-driven
  CSS).

**Accessibility** (`page-checklist.md`)
- Sliders labelled + keyboard-driveable; drag has a tap-only fallback; readouts `aria-live="polite"`.
- `prefers-reduced-motion` freezes animation (current dots, Sankey, loop → instant/stepwise).
- Focus rings ≥3px; tap targets ≥44–48px; status **never colour-only**; no `alert`/`confirm` (unlock =
  engine `aria-live` toast; reset = two-tap inline confirm).

**iPad-first / platform**
- SVG + rAF-throttled updates; canvas/iframe lazy-loaded (PhET stays click-to-load).
- No parallax, scroll-driven animation, `background-attachment: fixed`, or blueprint/grid/circuit
  background patterns.

---

## 9. Definition of done (tick for every WP before shipping)

- [ ] Challenge(s) registered via `data-prog-challenge`; success → `Progress.complete(id)`, fail →
      `Progress.miss()`; page calls `markSeen(badgeId)` once on mount.
- [ ] Badge math correct: page total in the config matches the number of tracked challenges; badge
      unlocks; hub total increments. Sanity-checked against `test/progress.html`.
- [ ] All §8 guardrails hold (engine/data, pedagogy/structure, design system, a11y, iPad).
- [ ] **Reframe WPs (12–14) only:** card anatomy per §4a; no `.tbl` definition tables / "Booklet p.X"
      refs remain in the concept cards; `Check your booklet work` retained as its own foot section.
- [ ] Verified live with `/verify` or the `run` skill on the actual page (real iPad-width viewport).

---

## 10. Quick-start for a cold session

1. `git switch main && git pull && git switch -c interactives-enrichment`
2. Read §2 (engine API) + §8 (guardrails) + `progress-system-guide.md`.
3. Open the canonical wired example (`engineering-contexts-and-systems.html` ~L1762–1830) and the
   structural reference (`classes/higher/electricity/current-pd-power-resistance.html`).
4. Execute the **§7 build order top-to-bottom** (Step 0 → Step 11). Tick §9 for each WP.
5. Skills: `/improve-page` (polish existing), `/add-progress` (engine wiring), `/new-page` (scaffold),
   `/verify` (live check).
