# Site Audit & Remediation Plan

> **Status (2026-06-20): Phases 1–6 implemented.** Subnav mobile-scroll fix, footer
> standardisation (shared `_includes/site-footer.html` across ~47 pages), Contact → About &
> Contact, electronics zig-zag removal, Concept-10 rebuild (half-adder + bi-stable out; transistor
> switch, op-amp comparator, 555 astable, 555 monostable in, each with a new UK-standard SVG
> schematic verified by rasterised render), and electronics diagram verification are all done.
> Outstanding: the **"About Mr Stewart" bio is placeholder text** (marked with a `TODO` in
> `contact.html`) awaiting the user's own wording.

Audit date: 2026-06-20. Branch context: `banner-refresh`.
Scope: sticky-subnav mobile bug (site-wide), footer standardisation (site-wide),
Contact → About & Contact rework, and a full Electronics circuit/symbol cleanup.

**No HTML/CSS has been written yet — this document is the plan only.** Phases are ordered so the
cheap site-wide CSS fixes land first and the heavier Electronics rebuild last. Each phase lists the
exact files and the code locations found during the audit.

---

## Decisions (confirmed 2026-06-20)

1. **Bi-stable circuit — REMOVE.** Concept 10's bi-stable is dropped along with the half-adder, so
   the page teaches exactly the four named circuits (transistor switch, op-amp comparator, 555
   astable, 555 monostable). See Phase 5b.
2. **New circuit diagrams — ADD ONE EACH.** The rebuilt Concept 10 gets a clean UK-standard SVG
   schematic for each of the four circuits. See Phase 5d.
3. **555 monostable — THEORY ONLY.** Cover monostable with a description + schematic in
   `theory.html`; **no** new interactive page (the astable interactive stays the only one).
4. **Footer Science exception — UPDATE `CLAUDE.md`.** The new footer drops "Science" entirely, so the
   "Science pages use the shorter `© Mr Stewart's Science`" rule must be removed. See Phase 2.

---

## Phase 1 — Sticky subnav: horizontal scroll on mobile (site-wide)

**Problem.** The base `.subnav-links` rule is correct (`flex-wrap:nowrap; overflow:auto`), but every
copy is overridden at `@media (max-width:560px)` with `flex-wrap:wrap; overflow:visible`. On pages
with many links (e.g. `theory.html` has 12) this stacks the links into many rows, and because the
bar is `position:sticky`, that block covers a large part of the phone screen.

**Fix.** Delete the mobile wrap override (or replace it with the nowrap+scroll behaviour) so the
sticky bar stays one row and scrolls horizontally on all widths. Keep the hidden-scrollbar styling
already present (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`). Optionally add a small
right-edge fade/affordance so users know it scrolls — decide during implementation.

**Files carrying the bad override (9):**

Shared stylesheets (each fixes many pages at once):
- `assets/css/higher-physics.css` — line ~263–265 (`@media (max-width:560px){ .subnav-links{flex-wrap:wrap;overflow:visible} }`). Covers Higher hub + all Higher topic pages.
- `assets/css/electronics.css` — line ~263–264. Covers electronics hub + theory/glossary/planning/simulation/construction/testing.
- `assets/css/engineering-science.css` — line ~61. Covers N5 Engineering pages that link it.

Inline copies (per-page `<style>`):
- `classes/adv-higher-physics.html`
- `classes/s3-n5-physics.html`
- `classes/s3-physics/electricity1.html` (override at line ~283)
- `classes/s3-physics/electricity-2.html`
- `classes/s3-physics/electricity-3.html`
- `classes/electronics/revision.html` (inline; does **not** link `electronics.css`)

**Already correct (no override — leave alone):** all `classes/higher/electricity/*` topic pages,
`classes/n5-engineering/*`, `classes/s3-engineering/what-is-an-engineer.html` (these inherit the
shared sheets or already use nowrap+scroll with no wrap override).

**Bump cache-bust versions** on the three shared sheets (`?v=hp-…`, `?v=el-…`, `?v=eng-…`) so phones
pick up the change.

**QA:** on a ~360px viewport, every subnav stays a single horizontally-scrollable row; the sticky bar
height is unchanged whether a page has 4 links or 12; active-link highlight still tracks scroll.

---

## Phase 2 — Standardise the footer (site-wide)

**Target footer** (replaces all current variants), with three links:

> © Mr Stewart's Physics, Electronics and Engineering · [Home] · [About & Contact] · [Credits]

Decisions baked in from the brief: drop "Science" and the middle initial "R", use "and" not "&",
add links to **Home (`/`)**, **Contact (`/classes/contact.html`)**, and **Credits
(`/classes/credits.html`)**. Links must meet the a11y rules (≥44px tap targets, visible focus ring,
inherit the frosted footer styling). Keep the existing centred / frosted / `margin-top:auto` look.

**Current state (needs unifying — 4+ inconsistent variants across ~41 pages):**
- `© Mr R Stewart's Science, Physics, Electronics &amp; Engineering` (straight apostrophe) ×27
- `© Mr R Stewart’s …` (curly apostrophe) ×11
- `… Electronics & Engineering` (raw ampersand, not entity) ×2 (`higher/simulations.html`, `workinprogress.html`)
- `classes/higher/relativity-simulation.html` — footer with a bespoke inline `style="…"` block
- Multi-line markup: `index.html`, `classes/electronics/revision.html`

**Approach.** Since the footer text + links are now identical everywhere, this is a near-mechanical
find/replace across all `*.html` pages. Two non-standard ones (`relativity-simulation.html` inline
style, plus the two multi-line ones) need hand-editing. Because pages don't share a footer include,
each page is edited in place (≈41 files). Consider whether to convert to a shared
`_includes/site-footer.html` include while we're here — recommended, to prevent future drift — but
that's optional and can be a follow-up.

**Also update `CLAUDE.md`:** the "Footer" section and the "What not to do" expectations — change the
canonical footer string and remove the "Science pages use the shorter `© Mr Stewart's Science`" rule.

**QA:** grep confirms a single footer string site-wide; all three links resolve; footer renders
correctly in light and dark; links are keyboard-focusable.

---

## Phase 3 — Contact → "About & Contact" page

**File:** `classes/contact.html` (196 lines; already uses a working Formspree form at
`https://formspree.io/f/xbdevnev`, honeypot + `_subject` hidden fields intact).

**Rework into three stacked sections** under the banner (`main.page-wrap`, max-width 760px stays):
1. **About the site** — what mrstewartphysics.co.uk is, who it's for (S1–Advanced Higher Scottish
   pupils), subjects covered (Physics, Electronics, Engineering Science). Short, student-facing.
2. **About Mr Stewart** — brief teacher bio. *Content to be supplied by the user* — leave a clearly
   marked placeholder if not provided.
3. **Contact** — keep the existing Formspree form exactly as-is (do not change the endpoint or hidden
   fields); just reposition it as the third section with its own `<h2>`.

**Supporting changes:**
- Update `<title>` and banner `overlay-text h1` from "Contact" to "About & Contact".
- Update the nav drawer label in `_includes/site-menu.html` line 61 from "✉️ Contact" to
  "About & Contact" (keep the same `/classes/contact.html` href so existing links and the new
  standardised footer link still resolve). Consider whether the URL/filename stays `contact.html`
  (recommended — avoids breaking inbound links and the Phase 2 footer link).
- Keep accessibility: each section gets an `aria-label`, the form keeps its labels/`required`/live
  validation, tap targets ≥48px.

**Open item:** confirm "About & Contact" vs "About" as the menu/title wording, and whether to also add
this page to the footer (Phase 2 links to it as "About & Contact").

---

## Phase 4 — Electronics circuit **symbols** cleanup

**Primary file:** `classes/electronics/theory.html` (holds all 40 symbol/circuit SVGs). Concept 8
("Component symbols & functions") is the symbol reference.

### 4a. Remove the ANSI zig-zag resistor family entirely
Keep only UK-standard (rectangular) resistor symbols. Delete:
- The intro `<div class="note">` at lines ~1131–1134 ("In the SQA exam you'll also meet the ANSI
  forms… zig-zag…").
- The entire second `<div class="sym-grid" aria-label="ANSI zig-zag resistor forms…">` block,
  lines ~1135–1175, containing four cells: **Resistor (ANSI)**, **Variable (ANSI)**, **LDR (ANSI)**,
  **Thermistor (ANSI)** — all `polyline` zig-zags.
- After deletion, re-flow the trailing `<div class="note">` (logic gates / pin-out cross-references,
  ~1176) so it still reads correctly.
- Sweep the rest of the page (and other electronics pages) for any remaining "zig-zag" / "ANSI"
  wording referring to resistors and remove it.

> Note: `classes/s3-physics/electricity1.html` also references "zig-zag" — **out of scope** (brief
> says only Electronics needs this; non-electronics diagrams already done). Leave it.

### 4b. Review/realign arrow-bearing symbols (UK standard, correctly positioned)
The brief calls out poor positioning "especially any containing arrows." Review each of these in
Concept 8 and fix arrowhead placement/alignment so heads sit on the lead and point the correct way;
verify each renders cleanly in its `120×56` viewBox and is centred in its `.sym-cell`:
- **Variable resistor** (~982) — slider arrow across the rectangle.
- **LDR** (~990) — two incoming light arrows.
- **Thermistor** (~999).
- **Diode** (~1007) — triangle + bar (check bar/triangle alignment).
- **LED** (~1014) — diode triangle + two emitted-light arrows (cramped near top edge).
- **NPN transistor** (~1036) — emitter arrowhead `polygon points="74,46 66,42 68,38"` looks
  off the emitter lead; verify it sits on the line and points outward (NPN).
- **N-channel MOSFET** (~1045) — channel arrow `polygon points="62,28 56,25 56,31"`; verify
  direction (n-channel points toward the channel) and that the three gate segments align.
- **741 op-amp** (~1054) — check the `−`/`+` `<text>` labels don't overlap the triangle body.
- **Switch** (~1062), **NPN/relay/solenoid** coils — visual centring pass.

16 `polygon` arrowheads exist in the file; treat every one as suspect until visually checked.

### 4c. Verify all symbols display
Open `theory.html` and confirm every Concept 8 symbol (and the logic gates in Concept 9, pin-outs in
Concept 11) renders — no clipped strokes, no `class="s"/"sf"/"fill"` styling gaps, consistent stroke
weight. Confirm UK conventions throughout (rectangular resistors, BS logic gate shapes as used).

---

## Phase 5 — Electronics "circuits to describe" content

**File:** `classes/electronics/theory.html`, Concept 10 (`id="c10"`, lines ~1317–1380), plus
glossary cross-references.

**Target set of describe-circuits (per brief):** transistor switching circuit, **op-amp
comparator**, **555 astable**, **555 monostable**.

### 5a. Remove the half-adder completely
Delete every half-adder reference:
- Concept 10 keyword `<dt>Half-adder</dt>` (~1325).
- Concept 10 notes bullet "Half-adder: adds two single bits…" (~1340–1341).
- The half-adder truth `<table>` (~1343–1354).
- Practice 10 question + answer about Sum/Carry (~1366–1372).
- "You can now…" bullet mentioning half-adder (~1377).
- `classes/electronics/glossary.html` line 152 `<dt>Half-adder</dt>` entry.

### 5b. Remove bi-stable (confirmed)
Remove Concept 10 keyword + notes bullet (~1324, 1338–1339), the "you can now" mention, and
`classes/electronics/glossary.html` line 103 `<dt>Bi-stable</dt>`.

### 5c. Add 555 astable + 555 monostable descriptions
- Add short "how it works" descriptions for **555 astable** (continuous HIGH–LOW square wave;
  charge/discharge through R1, R2, C; mention frequency/mark-space at N5 level) and **555 monostable**
  (one-shot: trigger → output HIGH for a fixed time set by R and C → returns LOW).
- Keep the existing "✍️ How to say it" frame for the transistor switch; consider adding matching
  fill-in frames for the comparator and the two 555 circuits for consistency.
- Update Concept 10 heading/intro and the "✅ You can now…" list to name exactly the four circuits.
- Refresh the "Check your understanding" quiz (`id="check"`, ~1513+) and any pin-out/cross-links so
  no question still references the half-adder/bi-stable; add 555 astable/monostable items.
- Cross-link the **555 astable** description to the existing `classes/electronics/555-astable.html`
  interactive.

### 5d. Schematics (confirmed)
Add one clean UK-standard SVG schematic each for the transistor switch, comparator, 555 astable, and
555 monostable within Concept 10 (rectangular resistors, BS symbols, arrows correctly placed per
Phase 4 standards). 555 monostable is theory-only — no new interactive page.

---

## Phase 6 — Verify circuit **diagrams** on all Electronics pages

Brief: "double check circuit diagrams on all electronic pages… no need to do this outwith
electronics." Inventory and visually verify every diagram across the electronics directory:

- `classes/electronics/theory.html` — all 40 SVGs (symbols Concept 8, logic gates Concept 9,
  pin-outs Concept 11, plus the scope wave ~773 and the relay/diode circuit ~902–922) render
  correctly after Phases 4–5.
- `classes/electronics/555-astable.html` — schematic/stripboard is a raster image
  `/assets/electronics/555new.jpg` (line ~401); confirm it loads, is legible, has good `alt`, and the
  schematic itself uses correct UK symbols (no zig-zag resistors). If the image shows ANSI resistors,
  flag for re-export.
- `classes/electronics/testing.html` and `classes/electronics/simulation.html` — 1 SVG each
  (input/process/output block diagrams, not component schematics) — confirm they display.
- Remaining electronics pages (`glossary`, `planning`, `construction`, `revision`, `notes`,
  `videos`, `stripboard-builder`) have no inline circuit SVGs — confirm no broken `<img>` diagrams.

Produce a short pass/fail checklist per diagram.

---

## Phase 7 — QA & regression

- Cache-bust versions bumped on `higher-physics.css`, `electronics.css`, `engineering-science.css`.
- Subnav: manual check at 320/360/414px on 2–3 representative pages per shared sheet.
- Footer: `grep` proves one canonical string; all three links resolve on a nested page (absolute
  paths) and on `index.html`.
- Electronics: no remaining "zig-zag", "ANSI", "half-adder", "bi-stable" (if removed) strings;
  every symbol/diagram renders; arrows correctly placed.
- Accessibility re-check on edited pages (skip link, focus rings, `aria-label`s, reduced-motion
  block intact, tap targets).
- Update `CLAUDE.md` (footer rule; note zig-zag removal if the design notes ever referenced it).
- Run the site locally / open changed pages before committing.

---

## File-touch summary

| Phase | Files |
|-------|-------|
| 1 Subnav | 3 shared CSS sheets + 6 inline HTML pages (9 total) |
| 2 Footer | ~41 HTML pages (or 1 new `_includes/site-footer.html` + swap) + `CLAUDE.md` |
| 3 About&Contact | `classes/contact.html`, `_includes/site-menu.html` |
| 4 Symbols | `classes/electronics/theory.html` |
| 5 Circuits | `classes/electronics/theory.html`, `classes/electronics/glossary.html` |
| 6 Diagrams | all `classes/electronics/*` (verification; edits only where broken), poss. `assets/electronics/555new.jpg` |
| 7 QA | cross-cutting + `CLAUDE.md` |
