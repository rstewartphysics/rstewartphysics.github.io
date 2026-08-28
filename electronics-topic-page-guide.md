# N5 Electronics sub-page — construction guide (for Claude)

Read this before building or editing any National 5 Electronics sub-page. It is the Electronics
sibling of [`higher-topic-page-guide.md`](higher-topic-page-guide.md): the **structure** is the same
as the Higher topic pages, but the **palette is Electronics teal-green** and several **conventions
diverge** (symbols, content framing). The **source of truth for content** is the
SQA course spec C884 75 v3.0 (Jan 2026) in `assets/electronics/sqa-source-docs/`.

---

## 1. Where files go

```
classes/electronics.html                  — HUB (5 primary tiles + tools/resources row)
classes/electronics/theory.html           — Circuit design: ALL theory (incl. symbols, logic, IC pin-outs)
classes/electronics/simulation.html        — Using simulation software (why/when/how) + fault-finding + costing
classes/electronics/construction.html      — Building: resistor codes, boards, soldering, cables, diagrams
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

## 6. Symbols & diagrams — **UK / IEC rectangle** (consistent with Higher)

A deliberate teacher's choice: use the **UK / IEC rectangle** form for resistors and **distinctive
shapes** for logic gates — the same convention as the Higher Physics pages. This diverges from the
spec's literal "ANSI and IEC" wording, but keeps the site consistent. **Do not** use the ANSI zig-zag
resistor here.
- **Resistor:** **rectangle**. Variable resistor = rectangle + diagonal arrow. LDR = rectangle in a
  circle with two arrows pointing in. Thermistor = rectangle with the diagonal line + foot.
- **Logic gates:** **distinctive shapes** (AND = D-shape, OR = curved-back shield, NOT = triangle +
  bubble, NAND/NOR/XOR accordingly); the IEC operator (`&`, `≥1`, `=1`) is shown in brackets in the label.
- All diagrams are **inline SVG**, themed via classes (`.s`/`.sf`/`.wire`/`.res`/`.node`/`text` →
  `var(--text)`/`var(--card)`; never hard-code black/white). Each SVG: `role="img"` + `<title>`.
- Mandated symbol list to cover on **Theory** (Concept 8): power supplies; resistors (fixed, variable,
  LDR, thermistor); diodes; capacitors (electrolytic + non-electrolytic); transistors (NPN +
  n-channel enhancement MOSFET, **no PNP**); I/O (switch, relay, motor, buzzer, lamp, LED, solenoid,
  speaker); connectors/wires; fuses; 741 op-amp; voltmeter/ammeter. Logic gates (AND, OR, NOT, NAND,
  NOR, XOR) are Concept 9; the 741 / 555 / 7400-series IC pin-outs are Concept 11.

## 7. Electronics-specific components (add inline, themed via tokens)

- **Truth tables** `.ttable` — bordered grid, monospace 0/1 cells, header row in `--surface-2`. Used for
  logic gates and combinational logic.
- **Symbol reference grid** `.sym-grid` / `.sym-cell` — SVG symbol + name + one-line function.
- **Checklist** `.chk-list` — the pre-power-up checklist and practical-activity evidence lists.

**Progress, badges & section challenges** are handled by the **shared progress engine — default on**, not
per-page code. Electronics runs `assets/js/progress.js` + `assets/js/progress/electronics.js`
(`window.Progress`) with neutral `data-prog-*` hooks: the badge wall, corner counter, `data-prog-badges`
hub chips, and `data-prog-challenge` cloze/fill-in/quiz tracking. *(The legacy
`electronics-progress.js` / `window.ElProgress` engine has been deleted.)* Wire a new page via **`/add-progress`**: the two `defer` scripts in
`<head>`, markup hooks, and the flagship widget's `markSeen`/`record` calls only — never hand-roll progress
JS. See `progress-system-guide.md` (API) + `progress-system-rollout-plan.md` §5 (guardrails) before
changing any progress/badge behaviour.

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
- **UK / IEC rectangle** resistors + distinctive-shape gates (same as Higher); no ANSI zig-zag.
- Tags balanced (`<section>`/`<div>`/`<details>`/`<svg>`/`<script>`/`<style>`); JS-referenced IDs exist.
- Absolute asset/menu paths; unique `localStorage` prefix; no Liquid-unsafe sequences in JS/CSS.
