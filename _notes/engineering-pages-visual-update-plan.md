# Engineering Science pages — visual coherence plan

First written 23 August 2026 as a density plan. **Rewritten 27 August 2026** after reading the
page source, the shared sheets, the Higher slides work, and
`~/claude-work/n5-engineering/N5-ENGINEERING-B3-8-PPTX-PLAN.md`.

Companion notes: `_notes/n5-energy-and-efficiency-audit.md` · `higher-topic-page-guide.md` ·
`~/claude-work/_deckkit/DECK-RULES.md` (rules 3a, 6a, 11a) · CLAUDE.md
"Interactive pupil tasks — one-screen layout rule".

The original problem statement stands: **the Engineering Science pages read as scroll-heavy next
to the Higher Physics pages.** What the first draft missed is that density is only half of it. The
other half is that Engineering and Higher have grown two different vocabularies for the same three
things — *here is a class deck*, *here is a booklet reference*, *here is a thing to do* — and ~35
Engineering decks are about to land on a site that has nowhere to put them.

---

## 0. What changed in this revision

| # | Change | Why |
|---|---|---|
| 1 | **Phase 0 rewritten.** The components it edits are not in the shared sheet — they are inline in all eight pages. | §2.1. As written, the old Phase 0 edited nothing. |
| 2 | **New Phase 1: the deck-link layer.** A slides hub, `.top-pill` row and `.reslink` grammar for Engineering, mirroring Higher. | §2.2. Booklet 3 L1 shipped 27 Aug; Electronics L1 is due **Mon 31 Aug**. Every deck now ships a PDF (DECK-RULES 3a) and there is no page that lists one. |
| 3 | **New Phase 4: `§n` → `Booklet p.N`.** 50 references across five N5 pages. | §2.3. DECK-RULES **6a** (27 Aug) is global; the decks for these exact booklets will say `p.4` while the page says `§1`. |
| 4 | **Teal chip spec corrected.** `--eng-teal` is 2.94:1 on white — it fails AA as text exactly as orange does. New token `--eng-ink-teal`. | §3, decision 2a. The old Phase 0 said "teal-tinted fill" without saying what colour the *label* is. |
| 5 | **The one-screen iPad rule is now a measured target**, not an assumption. | §3, decision 8. It is the rule that is working; the widget-heavy pages (topics 5/6/7 carry 12–17 sim/builder blocks) were never measured against it. |
| 6 | **Phase 5 (was Phase 4) rewritten.** The S3 Engineering pages use *none* of these components. | §2.4. There is nothing to regress — but there is a template to set before those pages are built. |
| 7 | **The two-column gate is unchanged and still deferred.** | Decision 5 of 23 August is binding; this revision does not reopen it. |
| 8 | **Phase order changed.** Deck-link layer moves ahead of the density proof. | §6.0. A deck nobody can reach is worth less than a page that is 2,000 px too long. |

---

## 1. What the measurements say (unchanged, 23 August)

Measured in headless Chrome at 1280 px against the built site.

| Page | Height | Words | px per 1000 words |
|---|---|---|---|
| Higher — current, pd, power, resistance | 17,871 | 3,473 | **5,146** |
| N5 Energy & Efficiency | 21,427 | 4,013 | **5,339** |
| N5 Pneumatics | 16,490 | 3,162 | **5,215** |

**The base CSS is not the problem.** Panel padding is identical (19.2 px), body text is 16 px on
both, line-heights are within 3%, and per-word density is only 1–4% looser than Higher. Three
other things cause the impression:

1. **Preamble.** 775 px before Lesson 1 on the energy page; 83 px before the first section on the
   Higher page. Nine times the housekeeping — roughly a full iPad screen before any teaching.
   Intro panel 390 px/119 words, mode chooser 179 px/98 words, two legend paragraphs plus toolbar
   ~110 px, progress meter 42 px. The intro and the mode chooser say the same thing twice.
2. **Frame-in-frame stacking.** 484 framed containers (border and/or background) against Higher's
   269, for 15% more words. Framed containers contribute 7,087 px of vertical padding against
   Higher's 4,215 px. Lesson 1 stacks six frames — key idea, exam ref, button, prose, note, widget
   — before the first activity, four of them tinted.
3. **Wasted width.** `.panel p` is capped at 600 px (~64 ch) inside a 1062 px content box, so 43% of
   every prose row is blank, and the tinted boxes are capped too. Higher has no cap
   (`max-width: none`), which is most of the remaining gap.

Buttons, separately: nine `📽 Lesson N slides (PDF)` links use `.btn` — white, 1 px border at 22%
opacity. On the Higher pages `.btn` is used **only** for widget controls. Here it does double duty
for controls and resource links, so the most useful things on the page are the quietest, while four
widget **Check** buttons are solid orange. Orange currently means nothing.

---

## 2. What the first draft got wrong

Four findings from reading the source. Each changes a phase.

### 2.1 The components Phase 0 edits are not in the shared sheet

`assets/css/engineering-science.css` is 243 lines and owns **chrome only**: `:root` tokens,
banner, subnav, `.container`, `.intro`, `.card`, `.cta`, `.resource-grid`, `.grid-3`, `.stack-gap`.
It contains **no** `.btn`, `.note`, `.exam-ref`, `.keypoint`, `.mode-grid`, `.widget`, `.practice`,
`.simcard` or `.page-ref`. Those live in a ~500-line inline `<style>` block copied into each of the
eight topic pages.

So "Phase 0 — shared sheet" would have changed nothing, and Phase 2's "same six steps per page"
would silently have meant *eight near-identical hand-edits to eight copies of the same CSS* — which
§7 of the first draft correctly named as where copy-paste errors live, without noticing it had
written that risk into its own plan.

**Fix:** promote the topic-page component layer out of the eight pages into a second shared sheet,
`assets/css/engineering-topic.css`, *before* any visual change. Extraction is mechanical and
verifiable: the extracted sheet must be byte-equivalent in effect, proved by a zero-diff render
comparison (§8) before a single value is altered. Then every later change in this plan is one edit
in one file.

Do the extraction and the visual change as **two separate commits**. A render diff that is supposed
to be empty is the only cheap way to prove a 500-line move was lossless, and that proof is
destroyed if the same commit also changes how things look.

### 2.2 There is no deck-link layer, and the decks are already arriving

Site-wide census of links into a `slides/` folder:

| File | Deck links |
|---|---|
| `classes/higher/slides.html` | the hub — 18 deck slots, 2 live |
| `classes/higher/electricity/capacitors.html` | `.top-pills` row: *Class slides (PDF)* + *All lesson slides →* |
| `classes/n5-engineering/energy-and-efficiency.html` | 9 in-section `.btn` + 1 prose link |
| everything else | **none** |

Meanwhile the N5 Engineering deck programme is live and moving fast: Booklet 3 L1 shipped
27 Aug 2026, **Electronics L1 is needed Monday 31 August**, and the plan covers roughly 35 decks
across booklets 3, 4a, 4b, 5, 6, 7 and 8. DECK-RULES **3a** (27 Aug) makes a `.pdf` a mandatory
output of every deck — which only means something if there is a page it lands on.

Higher already solved this, and solved it well. Engineering should not invent a second answer; it
should take Higher's, and the pattern should be written down once so S3 Physics (whose own deck
plan is waiting on approval) and Electronics inherit it rather than each growing a third.

### 2.3 Five pages cite booklet sections, against a global rule set four days ago

`.page-ref` content, by page:

| Page | Form used | Count |
|---|---|---|
| engineering-contexts-and-systems | `p.10`, `p.11`, `p.13` ✅ | 22 |
| energy-and-efficiency | `Booklet p.6`, `Booklet pp.13–14` ✅ | 15 |
| mechanisms-and-drive-systems | `§1`, `§2 · enrichment` ❌ | 14 |
| electronics-and-analogue-control | `§1`, `§2–7`, `§11–12` ❌ | 10 |
| logic-and-programmable-control | `4a §1`, `4a §3–4` ❌ | 9 |
| structures-and-materials | `§1`, `§3–5` ❌ | 9 |
| pneumatics | `§1`–`§4` ❌ | 8 |

**50 section references across five pages.** DECK-RULES **6a**, set 27 August 2026 and global to
every deck in every subject, is: *cite a booklet by page number, never section number — a pupil
finds a page; nobody hunts for "§1".* The same reasoning applies with more force on the website,
where the pupil has the booklet open beside the iPad. Topics 1 and 2 already comply; the five pages
built in July do not.

This is not a cosmetic tidy. It is the same pupil action, and after Phase 1 the page and its deck
will sit one tap apart and disagree with each other in the first line each of them prints.

### 2.4 The S3 Engineering pages have nothing to regress

Phase 4 of the first draft was "verify the shared-sheet changes did not regress the seven S3
pages". Census of `classes/s3-engineering/*.html`: zero `.btn`, zero `.note`, zero `.exam-ref`,
zero `.mode-grid`, zero widgets. They are the skeletons that `s3-engineering-pages-outline.md`
specs and that job has not started.

So the verification is near-empty — but the opportunity is real and larger: **the S3 pages get
built to the finished template, so they never need the retrofit at all.** Same for the seven N5
pages that still owe an `.exam-ref` retrofit under the August template conventions: de-box *first*,
then retrofit into the de-boxed form. Adding seven pages of boxes and then removing them is pure
waste.

---

## 3. Decisions

**Binding, agreed 23 August 2026 — not reopened here:**

1. **Rollout:** energy page first as the proof; on approval, the same treatment across the seven
   other N5 pages.
2. **Buttons:** three weights, and each means one thing. Resources teal, actions orange, furniture
   neutral outline.
3. **Preamble:** cut hard. One-line intro; SQA credit to the page-foot credit note; Unit 1 slides
   becomes a button; mode chooser compressed to a row of chips.
4. **Layout:** **de-box, do not restructure.** Keep the 64 ch cap — a shorter page is not worth
   110-character lines for S4 pupils.
5. **Two-column is deferred, not rejected.** Prototype it on the de-boxed page and look at a render
   before deciding. Nothing in this revision reopens it.

**Amended:**

- **2a — the teal chip needs its own ink token.** `--eng-teal` `#00a7b0` measures **2.94:1** on
  white: it fails AA as text for exactly the reason `--eng-ink-accent` exists for orange. The chip
  is *teal edge + teal tint + dark-teal label*, never teal text.

  ```
  --eng-ink-teal: #006e74;   /* 6.03:1 on #fff · 5.37:1 on --eng-surface-2 */
  --eng-ink-teal: #5fd8de;   /* dark mode — 10.3:1 on --eng-surface */
  ```

  This also **retires risk "teal on a warm palette"** from the first draft. Teal is not a foreign
  colour here: `--accent-2` *is* `--eng-teal`, `.card` already carries a 5 px teal left border, and
  Higher's `.top-pill` already draws its label from `--accent-2`. Teal already means *go somewhere /
  get something* in both sheets. The fallback to "orange in three weights" is dropped.

**New — proposed, for approval before Phase 1 starts:**

6. **One deck-link pattern for the whole site**, owned by the shared sheets, not by pages:
   `.deck-card` (hub grid), `.top-pill` (topic page), `.reslink` (in-section resource chip).
   Higher's inline versions move into `assets/css/higher-physics.css`; Engineering gets the mirror
   in `engineering-topic.css`. Same markup, same aria wording, subject palette only.
7. **A level owns a slides hub** at `/classes/<level>/slides.html`, listing every deck the course
   will have — built ones as links, the rest as inert `soon` cards, so a pupil sees the shape of the
   year. Higher's hub is the template, including the "How to use these" panel.
   **Engineering wording differs in one place:** Higher's *"the notes slides are marked Jotter
   Notes"* is wrong for Engineering, where deviation **E1** removes the jotter pill because the
   booklet is the pupils' permanent record. The Engineering wording points at the booklet page
   instead.
8. **The one-screen iPad rule is measured on topic pages too.** CLAUDE.md's task-page rule is
   working and stays as written. The generalisation for topic pages, which are read-*and*-do:
   **once a pupil has scrolled to a widget, the widget's question, its working area and its Check
   button fit in one 1180 × 760 landscape viewport without further scrolling.** Topics 5, 6 and 7
   carry 12, 17 and 13 sim/builder blocks and have never been measured against it.
9. **Engineering topic pages adopt the short-landscape media query** already proven on the task
   pages — `@media (min-width:821px) and (max-height:900px)`: banner to a ~76 px strip, overlay
   title dropped, intro paragraph hidden, notices to their one-line short form. On an iPad in
   landscape this reclaims more than the entire intro-panel cut in decision 3, and it is
   pre-existing, tested CSS.
10. **`Booklet p.N` is the site-wide form of a booklet reference**, matching DECK-RULES 6a. Page
    numbers come from the booklet's own printed footer and are taken from the deck build gate for
    that booklet (§6, Phase 4) — never guessed, never derived from the `.docx` body.

---

## 4. The shared vocabulary

One row per pattern. This table is the coherence deliverable: after this plan, a pupil moving
between a Higher page and an Engineering page meets the same components in the same colours doing
the same jobs.

| Job | Component | Higher today | Engineering today | After |
|---|---|---|---|---|
| Here is the deck for this page | `.top-pill` row | inline in `capacitors.html` | — | shared sheet, both subjects |
| Here is every deck in the course | `.deck-card` grid on `<level>/slides.html` | inline in `slides.html` | — | shared sheet, both subjects |
| Here is the deck for **this lesson** | `.reslink` in the `section.sec` | n/a (one deck per page) | `.btn` ✗ | `.reslink`, Engineering only |
| Here is a booklet / data booklet / past paper | `.reslink` | — | `.btn` ✗ | `.reslink` |
| Do the main thing on this page | `.cta` (filled orange) | filled accent | `.cta` | unchanged, **max one above the fold** |
| Operate this widget | `.btn` (neutral outline) | ✅ already widget-only | doubles as resource link ✗ | widget-only |
| Where this is in the booklet | `.page-ref` → `Booklet p.N` | n/a | `§n` on 5 pages ✗ | `Booklet p.N` everywhere |
| This page is unfinished | one notice | `.wip-notice` | `.beta-note` | keep both names, **same short form on short landscape** |

Two notes on the differences that are real and stay:

- **Higher has one deck per topic page; Engineering has one deck per lesson.** So Higher needs only
  the pill, and Engineering needs the pill *and* per-lesson `.reslink`s. That is a genuine
  structural difference, not drift.
- **Engineering carries no jotter-notes pill (E1)** because the booklet is the record. Hub copy
  differs accordingly; the components do not.

---

## 5. Scope

Eight N5 pages carry the topic-page pattern (`engineering-contexts-and-systems-beta.html` is a
530-byte stub — excluded):

| Page | Intro words | `.btn` resource links | `.page-ref` form | Widgets |
|---|---|---|---|---|
| energy-and-efficiency | 120 | 11 | ✅ pages | match/builder |
| mechanisms-and-drive-systems | 96 | 7 | ❌ §n ×14 | 12 sim/builder |
| n5-engineering-assignment-prep | 95 | 9 | — | — |
| electronics-and-analogue-control | 93 | 2 | ❌ §n ×10 | Ohm's law / divider |
| pneumatics | 93 | 9 | ❌ §n ×8 | 17 sim/builder |
| structures-and-materials | 89 | 8 | ❌ §n ×9 | 13 sim/builder |
| logic-and-programmable-control | 84 | 2 | ❌ §n ×9 | gate playground |
| engineering-contexts-and-systems | 68 | 2 | ✅ pages | — |

Plus: two Engineering hubs, one new `classes/n5-engineering/slides.html`, and the two shared
sheets. The seven S3 Engineering pages are skeletons and are handled by §6 Phase 5.

---

## 6. Phases

### 6.0 Why the order changed

The 23 August plan ran density-first because density was the question asked. Four days later the
deck programme is the thing with a date on it: Electronics L1 is due **Monday 31 August**, and
under DECK-RULES 3a every deck built from now on produces a PDF that currently has nowhere to go.
A deck a pupil cannot find is worth less than a page that is 2,000 px too long.

Phase 0 stays first because everything else edits the file it creates.

**If the teacher prefers the agreed order, Phases 1 and 2 swap — nothing else changes.**

---

### Phase 0 — extract the component layer *(no visual change)*

Create `assets/css/engineering-topic.css` from the inline `<style>` block of
`energy-and-efficiency.html` (the canonical template), covering: `.panel`, `.concept-tag`, `.lead`,
`.backlink`, `.btnrow`, `.modebar`/`.mode-grid`/`.mode-card`, `.legend`, `.exam-ref`(+`-lab`),
`.badge`, `.toolbar`/`.tb-btn`, `.sec-head`/`.sec-toggle`/`.sec-chev`, `.tbl`/`.tblwrap`, `.note`,
`.warn`, `.eq-*`/`.frac`, `.example`/`.calc`/`.ex-*`, `.practice`/`.stem`/`.marks`/`.page-ref`,
`.figure`/`.bd`, `.widget`, `.btn`, `.match-*`, `.slot`/`.bank`/`.tile`, `.q`/`.opt`, `.rag-*`,
`.simcard`.

Then, page by page, replace the inline block with
`<link rel="stylesheet" href="/assets/css/engineering-topic.css?v=engt-YYYYMMDDa">`, keeping only
what is genuinely page-specific inline (per-page widget rules, per-page `--*` overrides).

- Where two pages' copies have drifted, the **energy page's value wins** and the difference is
  recorded in the commit message. Do not silently take the newer one.
- **Verification is a zero-diff render comparison** (§8) — not "it still looks fine".
- **Commit this on its own**, before any value changes.

*This phase deliberately produces no visible change. That is the point.*

---

### Phase 1 — the deck-link layer *(unblocks the b3–b8 decks)*

**1a. Shared components.** Add `.reslink`, `.top-pill`(+`.top-pills`, `.pill-ic`) and `.deck-card`
(+`.deck-list`, `.deck-ic`, `.deck-txt`, `.deck-name`, `.deck-meta`, `.deck-card.soon`) to
`engineering-topic.css`, and lift Higher's inline copies of `.top-pill`/`.deck-card` into
`assets/css/higher-physics.css` unchanged. Spec for `.reslink`:

- `--eng-teal` left edge (5 px, matching `.card`), teal tint fill, label in `--eng-ink-teal`,
  document icon slot, `min-height: 48px`, full `:focus-visible` ring.
- Distinct at a glance from `.cta` (filled orange = *do this*) and `.btn` (neutral outline =
  *widget control*).
- Contrast checked against the **composited** tint in both themes before the value is committed.

**1b. `classes/n5-engineering/slides.html`.** Higher's `slides.html` is the template, copied
structurally, re-palettes to `--eng-*`, and grouped **by booklet, in booklet order** (1–8, with 4a
and 4b as separate groups, as the deck pack names them). Every planned deck appears; unbuilt ones
are inert `deck-card soon`. Deck names match the deck file names exactly (`L1 - Circuits and
Circuit Symbols`), so a pupil told "look at L3" finds L3.

- `📽 Lesson slides` panel with an *n of m ready* count tag.
- "How to use these" rewritten for Engineering: no jotter-notes line (E1); point at the booklet
  page instead; keep the *Show Me*, QR-codes and *a deck appears once it has been taught* lines.
- Deck icons: reuse the existing engineering SVG symbol set where one fits; draw new ones to the
  UK/BS-IEC convention of global CLAUDE.md §7. **Paint must be inline `style=` on each shape** —
  document CSS cannot reach into a `<use>` shadow tree, and class-styled shapes render solid black.
  This is a known trap from the Higher hub; do not rediscover it.
- Add to the N5 hub: a subnav link and a `📽 Lesson slides` tile in the resources row.

**1c. Topic-page pills.** A `.top-pills` row under the backlink on each of the eight pages:
*Class slides (PDF)* → the booklet's own group anchor on the slides hub, plus *All lesson slides →*.
On pages with no deck yet, the row carries only the second pill.

**1d. Per-lesson links.** In `energy-and-efficiency.html`, the nine `📽 Lesson N slides (PDF)`
`.btn`s become `.reslink`s. **Convert by element type, not by eye** — resource links are `<a>`,
widget controls are `<button>`; nothing carrying `data-check`, `data-clear` or a JS-bound `id` is
touched. Same conversion for the data-booklet and past-paper links.

**1e. Wire the decks as they ship.** Adding a built deck is then three edits: drop the PDF in
`assets/engineering-science/national-5/<nn-topic>/slides/`, flip its `deck-card soon` to an `<a>`
with `PDF · n slides`, and add the `.reslink` in the lesson's `section.sec`. Record that
three-step recipe in the N5 pack plan's publish step so it happens per deck, not as a later sweep.

**Stop after 1b + one wired deck. Render it, send it, wait.**

---

### Phase 2 — the energy page density proof

Unchanged from the agreed plan, plus decision 9:

1. Intro to ~22 words plus its button row; SQA data-booklet credit folded into the existing
   `data-credit-note`; Unit 1 slides paragraph becomes a `.reslink`.
2. Two legend paragraphs merged to one line.
3. Mode chooser to `.mode-grid.is-compact` — single row, label only, sub-line dropped.
4. `.note` lightened: drop the background and the 12 px block padding; keep a 3 px left rule and
   `padding-left`. A one-sentence note stops costing ~40 px of frame.
5. `.exam-ref` de-boxed to a plain labelled line — no tint, no border, no padding — keeping the
   `.exam-ref-lab` pill and references in `<b>`.
6. `.widget` un-nested: inside an already-framed `.panel` it does not need border + background +
   16 px padding. Hairline top rule and its `h3`; keep the background only for the "do" tint that
   separates practice from prose, at reduced padding.
7. Widget **Check** buttons demoted from solid orange to `.btn` weight, leaving the booklet `.cta`
   as the only filled orange above the fold.
8. **Add the short-landscape media query** (decision 9).
9. Remove any `.note` sitting immediately beside a `.keypoint` and saying the same thing.

`.keypoint` keeps its tint — it is the one anchor per section, and de-boxing it goes too far.

**Stop. Render it light and dark, desktop and iPad-landscape, send it, wait for approval.**

---

### Phase 3 — the other seven pages

Same steps per page, one page at a time, rebuild between each. Per-page checklist:

- [ ] intro ≤ 25 words + button row; credit lines moved to the foot note
- [ ] legend paragraphs merged to one line
- [ ] `.mode-grid.is-compact`
- [ ] every resource `<a class="btn">` → `.reslink`; every `<button class="btn">` untouched
- [ ] `.top-pills` row present
- [ ] at most one filled-orange action above the fold
- [ ] no `.note` immediately adjacent to a `.keypoint` saying the same thing
- [ ] short-landscape media query present
- [ ] **one-screen check on every widget** (decision 8) at 1180 × 760
- [ ] rebuild, measure height + frame count, screenshot light and dark

---

### Phase 4 — `§n` → `Booklet p.N` *(50 references, five pages)*

Do this **per booklet, at that booklet's deck build gate**, not as one sweep. The gate already
reads the booklet and produces the section → printed-page mapping for the deck's own `Booklet p.N`
lines (DECK-RULES 6a); the page conversion consumes the same mapping, from the same reading, on
the same day. Doing it separately means reading every booklet twice and risking two different
answers.

Order follows the deck build order: b3 (10 refs) → b4a/b4b (9) → b5 (14) → b6 (8) → b7 (9).

- Page numbers come from the booklet's **own printed footer**.
- A `.page-ref` covering a range keeps the range: `Booklet pp.13–14`.
- `mechanisms-and-drive-systems.html` carries `§2 · enrichment` / `§3 · enrichment` — keep the
  qualifier, convert only the reference: `Booklet p.7 · enrichment`.
- `logic-and-programmable-control.html` covers two booklets — keep the booklet marker:
  `Booklet 4a p.3`.
- Assert per page that zero `§` characters remain in a `.page-ref`, and that every new number
  exists in that booklet.

---

### Phase 5 — S3 Engineering, and the N5 `.exam-ref` retrofit

The S3 pages carry none of these components, so there is nothing to regress — but they are about
to be built. Two things:

1. **Fold the finished template into `s3-engineering-pages-outline.md` before that job starts**:
   `engineering-topic.css` as the sheet, de-boxed `.note`/`.exam-ref`, `.reslink` grammar,
   `Booklet p.N`, short-landscape query, one-screen widget rule, and its own `slides.html` when S3
   decks exist. The retrofit is then never needed there.
2. **The N5 `.exam-ref` retrofit** owed by the August template conventions (topics 3–8 have no
   past-paper references yet) is authored **into the de-boxed form**. Do not add seven pages of
   boxes and then remove them.

Spot-check one S3 page and one hub after Phase 0 and after Phase 1 for shared-sheet regressions —
the two hubs *do* use `.card`, `.cta` and `.resource-*` from the chrome sheet.

---

### Phase 6 — two-column prototype *(decision gate, unchanged)*

Build the de-boxed energy page a second time in the scratchpad with `.keypoint` and `.exam-ref`
floated into a right-hand column above 900 px. Render both at 1100 px and at iPad-portrait width,
send both, decide. **Do not touch the repo until that decision.** It may prove unnecessary once the
frames are gone — that was the reason for deferring it and it still stands.

---

## 7. Targets

| Measure | Now (energy) | Target |
|---|---|---|
| Preamble above Lesson 1 | 775 px | **< 380 px** |
| Framed containers | 484 | **< 340** |
| Page height | 21,427 px | **~19,000 px** |
| px per 1000 words | 5,339 | **≤ 5,100** (at or below Higher) |
| Filled-orange actions above the fold | 2 | **1** |
| Preamble at 1180 × 760 landscape | full screen | **< 200 px** (decision 9) |
| Widgets failing the one-screen check | unmeasured | **0** |
| Copies of the topic component CSS | 8 | **1** |
| `§n` booklet references | 50 | **0** |
| N5 decks reachable from the site | 0 of ~35 | **every built deck, within two taps** |

---

## 8. Verification

**Phase 0 is verified differently from everything else.** Before and after the extraction, render
all eight pages at 390 px and 1280 px, light and dark, and diff the screenshots. **The diff must be
empty.** Also diff the computed style of every element carrying one of the moved classes. A visual
change in this phase is a bug, not an improvement.

Every other phase, per page:

- Rebuild with Jekyll (`source /opt/homebrew/opt/chruby/share/chruby/chruby.sh &&
  chruby ruby-3.3.11 && bundle exec jekyll build`); serve `_site`; drive in headless Chrome.
- Existing probes: horizontal overflow at 390 px and 1280 px, tap targets ≥ 44 px, sub-nav hidden
  px, contrast of every text/background pair against **composited** backgrounds (translucent panel
  tints must be blended, not read as opaque — this caught two false failures last time).
- **The `.btn` → `.reslink` swap must not touch anything carrying `data-check`, `data-clear` or a
  JS-bound `id`.** Re-run every widget after the swap.
- **One-screen check** (decision 8): screenshot at 1180 × 760 scrolled to each widget; confirm
  question, working area and Check are all visible.
- Screenshot light and dark, desktop and mobile — **and look at them.**
- Phase 1 only: every `.deck-card` link resolves to a PDF that exists and opens; every `soon` card
  is inert and not focusable as a link; `<use>` icon shapes are not rendering black.
- Phase 4 only: zero `§` in any `.page-ref`; every page number checked against the booklet.
- `?v=` bump on both sheets, and on every page that links them (8 topic pages + 2 hubs + 7 S3
  pages + the new slides hub).

---

## 9. Risks

- **The Phase 0 extraction is the highest-risk step in the plan**, because it touches every page
  and is supposed to change nothing. Mitigation: zero-diff render comparison, own commit, one page
  at a time, energy-page values win on any drift.
- **The `.btn` swap is the one that can break behaviour.** Convert by element type, not by eye.
- **`<use>` shadow-tree paint.** Class-styled shapes inside a `<symbol>` render solid black —
  Phase 1b must use inline `style=` per shape, as the Higher hub already learned.
- **Deck names must match the built decks exactly**, or the slides hub says one thing and the
  teacher says another. Take names from the pack plan's deck tables, not from the topic page's
  lesson headings.
- **Phase 4 page numbers are only as good as the reading.** Tying it to the deck build gate is what
  makes it safe; a standalone sweep from memory or from the `.docx` body is not.
- **Eight pages of near-identical edits** is where copy-paste errors live — which is exactly why
  Phase 0 reduces eight copies to one before Phase 2 starts.
- **De-boxing can go too far.** `.keypoint` keeps its tint. Only `.note` and `.exam-ref` lose frames.
- ~~Teal on a warm palette.~~ Retired — see decision 2a.

---

## 10. Not doing

- Two-column concept blocks (deferred to the Phase 6 gate).
- Removing the 64 ch measure, or changing panel padding, body type or line-height — measured as fine.
- Rebuilding or restyling the Higher topic pages. Phase 1a *moves* their `.top-pill`/`.deck-card`
  CSS into the shared sheet unchanged; it changes nothing about how they look. Giving Higher the
  64 ch cap is a separate job with its own approval.
- Editing any booklet `.docx`. Phase 4 reads page numbers out of them; it does not touch them.
- Adding topic or slides pages to the global nav drawer — they are linked from their level hub only.
- The progress engine's `.prog-counter` chip (40 px, below the 44 px minimum) — shared
  `progress.js` chrome, site-wide, out of scope here.
