# N5 Electronics sub-page — construction guide (for Claude)

Read this before building or editing any National 5 Electronics sub-page. It is the Electronics
sibling of [`higher-topic-page-guide.md`](higher-topic-page-guide.md): the **structure** is the same
as the Higher topic pages, but the **palette is Electronics teal-green** and several **conventions
diverge** (symbols, content framing). The plan of record is
[`electronics-revamp-plan.md`](electronics-revamp-plan.md); the **source of truth for content** is the
SQA course spec C884 75 v3.0 (Jan 2026) in `assets/electronics/sqa-source-docs/`.

---

## 1. Where files go

```
classes/electronics.html                  — HUB (5 primary tiles + tools/resources row)
classes/electronics/theory.html           — Circuit design
classes/electronics/simulation.html        — Circuit simulation
classes/electronics/construction.html      — Circuit construction
classes/electronics/testing.html           — Test equipment & methods
classes/electronics/planning.html          — Practical activity
```
- All asset/menu links are **absolute** (`/assets/…`, `/classes/…`).
- The nav drawer points only at `/classes/electronics.html` — **never add sub-pages to the drawer.**

## 2. Head / chrome (copy verbatim, change titles)

- `layout: none` front matter with a `title`.
- `<meta name="color-scheme" content="light dark">` + **two** `theme-color` metas
  (light `#e8fbf5`, dark `#06140f`).
- Link shared chrome: `/assets/css/site-menu.css`, `/assets/js/site-menu.js` (defer), and
  **`/assets/css/electronics.css?v=el-YYYYMMDDx`** (teal tokens + chrome + dark mode).
  Bump `?v=` only when you change the shared sheet.
- Page-specific component + widget CSS/JS stays **inline** (same rule as Higher).
- Skip link, `{% include site-menu.html %}`, banner (`/assets/Electronicsbanner.png`), sticky sub-nav.
- Per-page `localStorage` prefix is unique: `el-thy-`, `el-sim-`, `el-con-`, `el-tst-`, `el-pln-`.

## 3. Page skeleton

A sequence of **concept blocks**, then one **Check** section (MC quiz + RAG self-check). Each concept:

```
Concept N → [1] equation card(s) (where numeric) → [2] notes → [3] diagram/symbol (if it helps)
          → [4] worked example ×2 (sub-&-solve + rearrange) → [5] practice callout
```

Non-numeric concepts (symbols, soldering, cables, the practical activity) drop the equation card and
worked examples and lead with notes + a reference diagram/table + a practice/identify task.

- `<section class="panel" id="cN">` with `<span class="concept-tag">Concept N</span>` + `<h2>`.
- `.backlink` → `/classes/electronics.html` at the top.
- Sticky sub-nav: one short link per concept + a final `Check`, plus a `subnav-cta` back to the hub.
- **Pare back:** at most 1–2 interactive widgets per page, inside the concept they belong to.

## 4. Colour & components

The teal sheet provides all chrome tokens. Inline components reuse the Higher names so they re-theme
automatically: `.eq-cards`/`.eq-card`, `.frac` (`fr-n`/`fr-d`, **never** `num`/`den`), `.calc` 4-col
grid, `.example`/`.ex-type`/`.ex-q`, `.practice`/`.practice-tag`, `details.reveal`/`.ms`, `.widget`,
`.q`/`.opt` quiz, `.rag-item`. **Recolour the Higher blue gradients to teal**
(`linear-gradient(135deg,#00c79a,#00705a)`) on `.practice-tag`, `.btn.primary`, `.seg [aria-pressed]`,
`.meterbar`. Use `--warm` for cautions (soldering safety, back-EMF) — it has a dark-mode value.

## 5. Equations & maths (same SQA rules as Higher)

- Equation font is serif; wrap every quantity symbol in `<var>` (italic); numbers/units/operators stay
  upright. Fractions are real 2-D `.frac` with a worded `aria-label`.
- Two worked examples per equation in the `.calc` grid (every `.calc-row` has **exactly 4 cells**);
  rearrange examples **substitute numbers first, then rearrange**; conversions pulled into `.ex-conv`.
- Every question (example, practice, MC) needs an **extra step** — a prefix to convert (p, n, µ, m, k, M),
  a square (`P = I²R`), or a multi-step (find the other p.d. first). Relationships from the spec:
  `V = IR`, `R_T = R₁+R₂+…`, `1/R_T = 1/R₁+1/R₂+…`, `P = IV`, `P = I²R`, `P = V²/R`,
  `V₁/V₂ = R₁/R₂`, `V₂ = (R₂/(R₁+R₂))·V_s`, `f = 1/T`.

## 6. Symbols & diagrams — **ANSI + IEC** (deliberate divergence from Higher)

The Electronics spec mandates **ANSI + IEC** symbols. **Do not** use the Higher UK/BS rectangle-resistor
or distinctive-shape-gate rules here.
- **Resistor:** ANSI **zig-zag** (and may also show the IEC rectangle as the alternative). Variable
  resistor = zig-zag + arrow. LDR/thermistor as per ANSI+IEC.
- **Logic gates:** ANSI **distinctive shapes** are the primary form (AND = D-shape, OR = curved-back
  shield, NOT = triangle + bubble, NAND/NOR/XOR accordingly); IEC rectangular (`&`, `≥1`, `=1`) shown as
  the alternative where useful.
- All diagrams are **inline SVG**, themed via classes (`.s`/`.sf`/`.wire`/`.res`/`.node`/`text` →
  `var(--text)`/`var(--card)`; never hard-code black/white). Each SVG: `role="img"` + `<title>`.
- Mandated symbol list to cover on **Construction**: power supplies; resistors (fixed, variable, LDR,
  thermistor); diodes; capacitors (electrolytic + non-electrolytic); transistors (bipolar +
  n-channel enhancement MOSFET); I/O (switch, relay, motor, buzzer, lamp, LED, solenoid, speaker);
  connectors/wires; fuses; logic gates (AND, OR, NOT, NOR, XOR, NAND); ICs (7400-series, 555 timer);
  741 comparator; voltmeter/ammeter.

## 7. Electronics-specific components (add inline, themed via tokens)

- **Truth tables** `.ttable` — bordered grid, monospace 0/1 cells, header row in `--surface-2`. Used for
  logic gates and combinational logic.
- **Symbol reference grid** `.sym-grid` / `.sym-cell` — SVG symbol + name + one-line function.
- **Checklist** `.chk-list` — the pre-power-up checklist and practical-activity evidence lists.

## 8. Curriculum framing (new spec language)

- The course is **National 5 Electronics** (C884 75), assessed by a **question paper** (60 → 30, 30%)
  and a **practical activity** (70 marks, 70%): analysis & design **7** · designing & simulating **7** ·
  construction **44** · testing **7** · reporting **5**. Use this language — **not** the old "PrEl".
- Three areas of study: **Circuit design · Circuit simulation · Circuit construction**.
- BS1852 / R-notation (270R, 27K, 5K8, 2M7); resistor colour code 3 bands + tolerance; prefixes
  p, n, µ, m, k, M; flyback diode across a relay coil (back-EMF); 741 comparator; half-adder; bi-stable.
- National 5 only — link S3 material separately; don't smuggle in non-N5 content.

## 9. Accessibility & platform guardrails (every page)

- Skip link + `id="mainContent"`, focus rings ≥3px, tap targets ≥44–48px, `prefers-reduced-motion`,
  widget results announce via `aria-live="polite"`, no `alert()`.
- `overflow-x:hidden`, `max-width:100%`, `env(safe-area-inset-*)` on sticky controls.
- **Liquid safety:** never put `{{`, `{%`, `%}` in inline CSS/JS (only `{% include site-menu.html %}`).

## 10. Pre-commit checklist (per page)

- Standard head (dual `theme-color`, `color-scheme`, overflow-fix); links the teal sheet.
- Every `.calc-row` has exactly 4 cells; fractions use `fr-n`/`fr-d`; `<var>` on every symbol.
- **ANSI+IEC** symbols (not the Higher rectangle convention).
- Tags balanced (`<section>`/`<div>`/`<details>`/`<svg>`/`<script>`/`<style>`); JS-referenced IDs exist.
- Absolute asset/menu paths; unique `localStorage` prefix; no Liquid-unsafe sequences in JS/CSS.
