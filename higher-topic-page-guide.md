# Higher Physics topic page — construction guide (for Claude)

Read this before building any new Higher Physics topic page. The **reference implementation** is
`classes/higher/electricity/current-pd-power-resistance.html` — copy its structure, components and
conventions. This guide captures the rules that page settled on so every Higher topic page is consistent.

---

## 1. Where the file goes

```
classes/higher/<unit>/<topic>.html
```
- Units: `electricity/`, `dynamic-universe/`, `particles-waves/`.
- File name = kebab-case of the hub's topic label (e.g. `capacitors.html`, `gravitation.html`).
- All asset/menu links are **absolute** (`/assets/…`, `/classes/…`) so nesting depth never matters.
- When the page is ready, **flip its hub placeholder** in `classes/higher-physics.html` from
  `<span class="topic-link soon">Label</span>` to
  `<a class="topic-link" href="/classes/higher/<unit>/<topic>.html">Label <span class="go" aria-hidden="true">→</span></a>`.
- **If the topic's lesson slides are already published**, the page owes a pill link. Check
  `classes/higher/slides/` for a matching PDF; if one is there, add the `.top-pills` row directly
  under the `.backlink` — a "Class slides (PDF)" pill to that file and an "All lesson slides" pill
  to `/classes/higher/slides.html`. `classes/higher/electricity/capacitors.html` is the reference.
  As of 26 Aug 2026 `forces-on-charged-particles.html` is the one page that owes this.

## 2. Head / boilerplate (copy verbatim, change titles)

- `layout: none` front matter with a `title`.
- `<meta name="color-scheme" content="light dark">` + **two** `theme-color` metas (light `#eef2ff`, dark `#0a0f1f`).
- Link **shared chrome**: `/assets/css/site-menu.css`, `/assets/js/site-menu.js` (defer), and
  `/assets/css/higher-physics.css?v=hp-YYYYMMDDx`. **Bump the `?v=` only if you change the shared sheet**;
  if you only change the page's inline `<style>`, no bump is needed (the page is served fresh).
- Page-specific widget CSS/JS stays **inline** on the page. No external frameworks, no build step.
- Skip link, `{% include site-menu.html %}`, banner (`/assets/hphysicsbanner.png`), then the sticky sub-nav.

## 3. Page skeleton — concept blocks

The page is a sequence of **concept blocks**, then one **Check** section. Order inside every concept is fixed:

```
Concept N  →  [1] Equation card(s)  →  [2] Notes  →  [3] Diagram (if it helps)
           →  [4] Worked example ×2 (sub-&-solve + rearrange)  →  [5] Practice callout
```

- Sub-nav: one short link per concept + a final `Check`, plus the `subnav-cta` to the Higher hub.
- Each concept is `<section class="panel" id="cN">` with a `<span class="concept-tag">Concept N</span>` and `<h2>`.
- A `← Back to Higher hub` link (`.backlink`) sits at the top of the page.
- **Check section** (`id="check"`): one **mixed MC quiz** + one **RAG self-check**. Nothing else.

**Pare back.** Notes-led, few tools. Keep at most 1–2 interactive tools across the whole page, placed
inside the concept they belong to. Do **not** stack many widgets. (We removed matching games, generators
and redundant calculators from the reference page for exactly this reason.)

## 4. Equation cards — make equations stand out (with real 2-D fractions)

Each concept opens with its relationship(s) in an **equation card**:

```html
<div class="eq-cards">
  <div class="eq-card">
    <div class="eq-name">Ohm's law</div>
    <div class="eq-formula"><var>V</var> = <var>I</var> <var>R</var></div>
    <div class="eq-desc">p.d. = current × resistance</div>
  </div>
</div>
```

### SQA typography — match the relationship sheet, past papers & marking instructions

The SQA documents (in `classes/higher/`) set body text in **Trebuchet** (which the whole site already
uses) and **equations in Times New Roman with the *variables in italic*** (Symbol font for Ω, μ, etc.).
So match that for every equation and worked example:

- **Equation/calc font is serif:** `font-family: "Times New Roman", Times, Georgia, serif;` — already
  applied to `.eq-formula`, `.calc` and `.ms` on the reference page.
- **Wrap every physics quantity symbol in `<var>`** (V, I, R, P, Q, t, E, …) so it renders *italic*,
  exactly like the relationship sheet. **Numbers, units, operators and subscripts stay upright (roman).**
  E.g. `<var>V</var> = <var>I</var> <var>R</var>`, `<var>R</var><sub>T</sub>`, `<var>V</var><sub>s</sub>`.
- Keep the body/notes/`note-cell` in Trebuchet (the site default) — that already matches SQA body text.

**Fractions must be real stacked fractions** (to match the SQA relationship sheet), using the `.frac`
component — **never** a one-line `a/b` in a card. Put `<var>` inside the fraction parts too:

```html
<span class="frac" aria-label="R 2 over R 1 plus R 2">
  <span class="fr-n"><var>R</var><sub>2</sub></span><span class="fr-d"><var>R</var><sub>1</sub> + <var>R</var><sub>2</sub></span>
</span>
```

- ⚠️ **Use `fr-n` / `fr-d` for fraction parts — NOT `num`/`den`.** `class="num"` collides with the
  number-input style and renders a white box over the numerator. (This bug already bit us once.)
- Give every `.frac` an `aria-label` in words.

## 5. Worked examples — TWO per equation, centred, aligned, annotated

For **each equation** give **two** worked examples:
1. **`Substitute & solve`** — the unknown is already the subject.
2. **`Rearrange — numbers in first`** — must be rearranged.

**SQA method rule (hard):** when rearranging, **substitute the numbers first, then rearrange.**
Show it as: relationship → numbers in (unknown still a symbol) → rearrange → answer with unit.

Use the `.calc` grid (a 4-column grid: `lhs`, `eq`, `rhs`, `note-cell`). Every row **must** have all four
cells (empty `note-cell` if no note) or the `=` column mis-aligns. The grid centres on the page and lines
up every `=` vertically.

```html
<div class="example">
  <span class="ex-type">Rearrange — numbers in first</span>
  <div class="ex-q">A 12 V supply drives 50 mA through a resistor. Find its resistance.</div>
  <div class="calc">
    <div class="calc-row"><span class="lhs"><var>I</var></span><span class="eq">=</span><span class="rhs">50 ÷ 1000 = 0.050 A</span><span class="note-cell">mA → A</span></div>
    <div class="calc-row"><span class="lhs"><var>V</var></span><span class="eq">=</span><span class="rhs"><var>I</var> <var>R</var></span><span class="note-cell"></span></div>
    <div class="calc-row"><span class="lhs">12</span><span class="eq">=</span><span class="rhs">0.050 × <var>R</var></span><span class="note-cell">numbers in first</span></div>
    <div class="calc-row"><span class="lhs"><var>R</var></span><span class="eq">=</span><span class="rhs">12 ÷ 0.050</span><span class="note-cell">now rearrange</span></div>
    <div class="calc-row"><span class="lhs"><var>R</var></span><span class="eq">=</span><span class="rhs">240 Ω</span><span class="note-cell"></span></div>
  </div>
</div>
```

- **Unit conversions go to the LEFT, not in the main working.** A conversion is a prep step, so pull it
  out into an `.ex-conv` block (a "Convert first" panel) and wrap it with the `.calc` in an `.ex-flow`
  grid — this keeps the **main working centred** and the conversions off to the left. Only do this when
  the example actually has a unit conversion; otherwise the `.calc` sits centred on its own.

```html
<div class="ex-flow">
  <div class="ex-conv">
    <span class="conv-label">Convert first</span>
    <div><var>I</var> = 50 ÷ 1000 = 0.050 A <span class="u">mA → A</span></div>
  </div>
  <div class="calc"> … main working rows … </div>
</div>
```

- **Side-notes** (the `note-cell`) explain every other extra step: squaring, "find the other
  p.d. first", "flip back at the end", "numbers in first", "now rearrange". Keep them short (≤ ~17 chars wrap).
- `rhs` is monospace and `nowrap`; the `.example` has `overflow-x:auto` for narrow screens.

## 6. Question design rules (examples, practice AND multiple choice)

**Every question must contain at least one "extra step"** — a conversion or a slightly tricky move — so
pupils can't just key numbers in. Use at least one of:
- a **prefix** to convert: kΩ→Ω, mA→A, kW→W, kC→C, µF→F, etc.;
- **time in minutes** → seconds (×60);
- a **square** (`P = I²R`), a **flip-back** (parallel `R_T`), or a **multi-step** (find V₂ = V_s − V₁ first);
- recognising when **units cancel** (ratios like potential dividers — note "kΩ cancel, no need to convert").

Other content rules:
- Lay everything out the **SQA way**: relationship → substitution (with units) → final answer **with a unit**.
- Each **concept has one Practice callout** (`.practice` + `.practice-tag` "Practice N") with a `details.reveal`
  "Answer" mark scheme that also shows the conversion line.
- The **MC quiz** (in the Check section JS `QS` array) has ~6 items, each needing a conversion/tricky step,
  4 options, `a` = correct index.

## 7. Diagrams & symbols (SVG, UK / BS-IEC)

All diagrams are **inline SVG** (crisp on retina, themeable, zero asset weight). Rules:
- **UK symbols only:** resistor = plain **rectangle** (never US zig-zag); variable resistor = rectangle +
  diagonal arrow **with an arrowhead**; LDR = rectangle-in-circle with two inward light arrows (with heads);
  thermistor = rectangle + bent temperature line; cell, lamp (⊗), switch, ammeter (A), voltmeter (V).
- **Resistors must be centred within their leads** — equal lead lengths each side; the component group
  centred in the viewBox. Don't push resistors to one side.
- **Wires meet a resistor's ends** — never draw a wire through a rectangle. Put a **junction dot**
  (`.node`) at every real node. **Voltmeter leads must land on the meter's circle terminals.**
- **Graphs:** separate the curves so they don't overlap; put line names in a small **legend** (colour
  swatch + label) in clear space, not as text sitting on the trend-lines. Add axis labels and arrowheads.
- **Theme via CSS classes** so dark mode works: `.wire`/`.res`/`.node`/`.meter`/`text` use `var(--text)`
  / `var(--card)`; never hard-code black/white. Each SVG has `role="img"` + `<title>` (and a `<figcaption>`).

## 8. Tools / widgets (if any)

- Keep them few and inside the relevant concept. Reference page keeps: a series/parallel calculator and a
  potential-divider simulator; the secondary sim is demoted into a `<details>` "Go further".
- Sliders **must** pair with a number input (`bindPair`) so they're keyboard/iPad-typeable.
- Toggling visibility: use the `hidden` attribute **plus** a CSS rule `.field[hidden]{display:none}` —
  `.field{display:flex}` otherwise overrides plain `[hidden]`.
- Results announce via `aria-live="polite"`. No `alert()`.
- **`localStorage` prefix is per-topic and unique**, e.g. `hp-cpr-` for this page. Pick a new prefix per
  topic (`hp-<topic>-`); never reuse another page's keys. *(This applies to exploratory widget state.)*
- **Progress / points / streak / badges: use the shared engine — default on.** The old inline per-page
  engine (`#ghud`, points, streak, `data-challenge="ch-*"`, per-page badges) is **gone**; the 5
  electricity pages now run `assets/js/progress.js` + `assets/js/progress/higher-physics.js` with neutral
  `data-prog-*` hooks, and `classes/higher-physics.html` aggregates the level. **Never hand-roll progress
  JS.** A new Higher topic page wires up via **`/add-progress`**: the two `defer` scripts in `<head>`,
  `data-prog-challenge` on each challenge (`.prog-cloze`/`.prog-fillin` auto-bind), the flagship widget's
  `markSeen`/`record`, a badge entry in `progress/higher-physics.js`, and a `data-prog-badges` chip on the
  hub tile. See `progress-system-guide.md` (API) + `progress-system-rollout-plan.md` §5 (guardrails).

## 9. Accessibility & platform guardrails

- Skip link, `id="mainContent"`, focus rings ≥3px on every control, tap targets ≥44–48px,
  `prefers-reduced-motion` honoured, `aria-live` on widget results.
- Blue Higher identity; dark mode must work (the shared sheet handles chrome; any bespoke colour needs a
  dark value or a theme var).
- `overflow-x:hidden`, `max-width:100%`, `env(safe-area-inset-*)` on sticky controls. No horizontal scroll.
- **Liquid safety:** never put `{{`, `{%` or `%}` in inline CSS/JS (only `{% include site-menu.html %}` is allowed).

## 10. Curriculum notes

- Match the **SQA relationship-sheet wording and symbols**; use SQA command words (Calculate / Determine /
  Show that / Explain / State).
- Don't smuggle in non-Higher content; link sibling topics rather than duplicating them.
- **Potential dividers:** label **R₁ = top, R₂ = bottom**. The output is **V₂** (the p.d. across the
  bottom resistor): `V₂ = (R₂ / (R₁ + R₂)) × Vs`. V₂/R₂ always refer to the bottom resistor.
- **Bridge circuits:** teach as **two potential dividers**; pupils find the p.d. between the midpoints
  (`V = V_P − V_Q`). **Never use the words "Wheatstone bridge", "balanced" or "unbalanced"** — the SQA
  has dropped that vocabulary.

## 11. Pre-commit validation (run these)

- Tag balance: `<section>`, `<div>`, `<details>`, `<svg>`, `<figure>`, `<script>`, `<style>` open == close.
- **Every `.calc-row` has exactly 4 cells** (count `.lhs` == count `.note-cell`).
- Fraction parts use `fr-n`/`fr-d` (no stray `<span class="num">` except real inputs/value displays).
- No Liquid-unsafe sequences in JS/CSS (`grep -nE "\{\{|\{%|%\}"`, expect only the menu include).
- JS `{} () []` balanced; all element IDs referenced by JS exist in the HTML.
- Then commit and (if asked) push to `main`.
</content>
