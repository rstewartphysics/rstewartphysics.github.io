# Coverage analysis & prioritised improvements — Higher Physics: *Current, p.d., power & resistance*

**Page analysed:** `classes/higher/electricity/current-pd-power-resistance.html` (live, 6 concepts + check section)
**Checked against:**
- `classes/higher/h-course-spec-physics.pdf` — SQA Higher Physics Course Specification v4.0 (mandatory content p.15, suggested activities p.52, skills/units/uncertainties pp.5–6, 19)
- `classes/higher/Higher Physics Past Papers (September 2025 Update).pdf` — every question filed under *current, potential difference, power, and resistance* across the 2015–2025 diets (plus the SQP), **with their marking instructions**

PDF page numbers below refer to pages of the past-paper compilation so you can jump straight to the evidence.

**This file replaces the old build plan (`higher-current-pd-power-resistance-plan.md`).** Do not write a new HTML page from this — these are edits to the existing live page.

---

## 1. Verdict in one paragraph

The page is **accurate** (every worked example, practice answer and quiz key checks out numerically — see §5) and its equation set matches the SQA relationships sheet. Its weakness is **exam realism**: the course spec says, verbatim, *"Solutions may involve several steps"*, and the past papers confirm that almost every question on this sub-topic since 2015 is multi-step — mixed series–parallel networks, finding the p.d. or power in *one* element of a network, square-root rearrangements of the power trio, and "state whether… justify your answer" reasoning. The page currently teaches and practises only **single-formula, single-step** calculations (plus a unit conversion). One whole concept (Two dividers) has **zero past-paper presence in 11 diets**, while the most-examined question style (network reduction) has **no worked example at all**. The fix is mostly *adding* examples/practice to existing sections, not restructuring.

---

## 2. Coverage against the course spec (mandatory content, spec p.15)

| Spec requirement | Page status |
|---|---|
| `V = IR` — solve problems involving p.d., current, resistance | ✅ Concept 2, worked both ways |
| `P = IV = I²R = V²/R` — solve power problems | ⚠️ Concept 4 covers `P = IV` and `I²R` forwards; **never uses `V²/R` in a worked example, and never rearranges with a square root** (exam favourite — see §3) |
| `Rᴛ = R₁ + R₂ + …` and `1/Rᴛ = 1/R₁ + 1/R₂ + …` | ⚠️ Concept 3 does pure series and pure parallel only; **no combined network** |
| **"Solutions may involve several steps."** | ❌ The page's single biggest gap. No multi-step example anywhere |
| Divider: `V₁ = (R₁/(R₁+R₂))·Vₛ` and `V₁/V₂ = R₁/R₂` | ✅ Concept 5 covers both forms. ⚠️ The relationships sheet states the output across **R₁**; the page's convention is output = V₂ across the bottom resistor. Correct, but pupils must be able to map between the two — add a note |
| *(Suggested activities)* circuits with switches; dividers to set/control voltages | ⚠️ Simulators exist, but no practice question involves a switch opening/closing |

**Content on the page that is NOT in this Higher sub-topic** (not wrong, but know what it is):

- **Concept 1 (`Q = It`)** — at Higher this relationship lives under *Capacitors* ("charge stored for a constant charging current", spec p.16). As N5 consolidation it's a sensible opener; reframe it as such and signpost where it returns.
- **`E = Pt`** (Concept 4) — N5 background, not in the Higher list. Fine as a side note; exam questions don't ask it here.
- **Concept 6 (two dividers across one supply)** — not in the spec relationship list, and see §3: zero exam appearances 2015–2025.

---

## 3. Coverage against the past papers — what is actually asked

Every question filed under this sub-topic in the compilation, what it demands, and whether the page prepares pupils for it:

| Year/paper | Question (PDF page) | Demand | Page prepares? |
|---|---|---|---|
| 2016 P1 Q18 (p69) | Divider 3·0 kΩ/7·0 kΩ across 12 V → p.d. across 7·0 kΩ | Divider output | ✅ **Identical to the Concept 5 worked example and quiz Q5** |
| 2016 P1 Q19 (p70) | As variable R increases, trend of power dissipated in it (battery has internal resistance) | Trend/limit reasoning, not a calculation | ❌ |
| 2016 P2 Q12 (p105) | Car battery EMF 12·8 V, r = 0·10 Ω, lamps, switch S open/closed → voltmeter reading; effect + justify | Multi-step + justify + switch | ❌ (justify style absent) |
| 2017 P2 Q12 (p160–161) | Cells in series: "Show that lost volts = 0·32 V"; voltmeter reading; lamp power; then LED at 3·6 V/60 mA → find R | "Show that" technique, multi-step chain | ⚠️ chain maths yes, "show that" rule no |
| 2018 P1 Q15 (p182) | Three 10 Ω + switch: which of statements I/II/III about meter readings are correct | Switch logic + I/II/III MC format | ❌ |
| 2018 P1 Q16 (p182) | P = 4·8 W in 120 Ω → I | `I = √(P/R)` — square root | ❌ |
| 2018 P2 Q2(a)(ii) (p193) | Motor on 12 V, resistance given → power | `V²/R`, embedded in a dynamics question | ⚠️ (form never worked) |
| 2018 P2 Q12(b) (p234) | Signal generator, 68 Ω + 82 Ω series → rms voltage across the 82 Ω (5 marks) | Divider-style calc inside AC context | ✅ method, ❌ context |
| 2019 P1 Q22 (p324) | Uncertainty in R = V/I from (10·0 ± 0·1) V, (0·50 ± 0·01) A | % uncertainties skill applied here | ❌ (arguably the Uncertainties topic) |
| 2019 P1 Q23 (p324) | 3·0 Ω in series with 6·0 Ω across 6·0 V → power in the 3·0 Ω | Power in **one element** of a circuit | ❌ |
| 2019 P2 Q12 (p365–366) | EMF from open switch; r; explain voltmeter drop; lamp current `E = I(R+r)`; lamp power | Multi-step + explain | ❌ |
| 2020 P1 Q21 (p392) | Four-resistor mixed network → Rᴛ between X and Y | Network reduction | ❌ |
| 2020 P1 Q22 (p393) | 100 Ω rated 4 W → max voltage | `V = √(PR)` | ❌ |
| 2020 P2 Q14(b,c) (p440–441) | Four cells + motor + variable R → find R; then R increased → voltmeter reading? Justify (3) | Multi-step + justify | ❌ |
| 2022 P1 Q19 (p461) | 9·0/6·0/6·0 Ω mixed network → total power dissipated | Network + power, several steps | ❌ |
| 2022 P1 Q20 (p461) | Six 5 Ω network → Rᴛ **and** p.d. across X–Y | Network + working back out | ❌ |
| 2023 P1 Q20 (p537) | Six 36 Ω network → Rᴛ between X and Y | Network reduction | ❌ |
| 2023 P1 Q22 (p539) | "One coulomb per volt is equivalent to one…" | Unit equivalence fluency | ⚠️ |
| 2023 P2 Q12 (p586–589) | 12 V battery, 16 Ω trio (parallel pair + series), I = 0·38 A → t.p.d. (5 marks); r; power in r; rearranged circuit → greater/equal/less + justify | The full multi-step package; MI awards: relationship (1), substitution (1), answer (1) | ❌ for the network/justify parts |
| 2024 P1 Q18 (p606) | 20/30/60 Ω ladder → p.d. across the 60 Ω | Reduce → current → work back | ❌ |
| 2024 P1 Q19 (p607) | 2·2 kΩ rated 0·25 W → p.d. at rated power | `V = √(PR)` + kΩ conversion | ❌ |
| 2024 P2 Q15(a) (p673–675) | Ten 220 Ω branches in parallel → Rᴛ; MI explicitly accepts the **R/n shortcut** | n identical parallel resistors | ❌ shortcut never taught |
| 2025 P1 Q19 (p694) | 4·0 Ω + (8·0 ∥ 2·0) → Rᴛ | Network reduction | ❌ |
| 2025 P1 Q20 (p695) | Five circuits of identical lamps → which dissipates greatest power in the lamp | Series/parallel + power reasoning, no numbers to plug | ❌ |
| 2025 P2 Q11(a,c) (p749–751) | 6·0 V rms supply, R in series with 1·8 kΩ ∥ 1·8 kΩ, I = 2·0 mA → R (4 marks); switch closed → amplitude? Justify. MI: **"voltage through / current across" = 0 marks** | Multi-step network + justify + terminology discipline | ❌ |

Internal-resistance-flavoured MCs (2023 P1 Q21, 2024 P1 Q20, 2025 P1 Q21–22) sit on the boundary with the sibling topic and are listed there.

### What never appears (2015–2025, ~30 questions)

- **Two dividers across one supply / p.d. between midpoints — 0 questions.** No "bridge" calculation in any diet, and `V = Vₚ − V_Q` is not on the relationships sheet. *(The old plan asserted this is assessed at Higher; the evidence says otherwise. It's still good physics and feeds monitoring-circuit intuition, so keep it — but as "go further", not as a core concept competing for space with network reduction, which is examined nearly every year.)*
- **Sensor dividers (LDR/thermistor) — 0 questions.** "Thermistor" has zero hits in the entire 761-page document. The simulator is good teaching; just don't let pupils think it's the exam priority.
- **Bare `Q = It`** — only ever appears inside capacitor-charging questions.

### Recurring demands the page doesn't practise — ranked by frequency

1. **Mixed series–parallel network reduction** (2020, 2022, 2023, 2024, 2025 — essentially every diet)
2. **Find the p.d./power in one element of a circuit** (2019, 2022, 2023, 2024 — the "reduce → total current → work back out" routine)
3. **"State whether greater/less/same … you must justify"** (2016, 2020, 2023, 2024, 2025)
4. **Square-root rearrangements** of `P = I²R` / `V²/R` from rated power (2018, 2020, 2024)
5. **Switch open vs closed meter-reading logic** (2016, 2018, 2022, 2025)
6. **I/II/III statement multiple choice** (2018, 2023, 2024, 2025 — a fixed SQA format)
7. **"Show that" questions** (2017, 2025 — relationship + substitution + stated answer, no working backwards)

---

## 4. Skills coverage (spec pp.5–6: units, prefixes, uncertainties; assessment skills)

| Skill | Page status |
|---|---|
| SQA calculation layout (relationship → substitution → answer; MIs award exactly 1+1+1) | ✅ The `.calc` grid models this perfectly; RAG item exists |
| Prefixes — m, k covered (mA, kΩ, kW, min→s) | ⚠️ **µ and M never appear**; spec lists p, n, µ, m, k, M, G, T, and MIs express answers like `1·2 × 10³ Ω` (2025 P2 Q11 MI, p751) |
| Scientific notation | ❌ No example or answer on the page uses ×10ⁿ |
| Significant figures rule (final answer ≤ fewest sig figs given) | ⚠️ Followed implicitly, never stated |
| Correct circuit terminology — "current **in**", "p.d. **across**" | ⚠️ Page text is correct, but the rule is never taught, and SQA MIs award **0 marks** for "voltage through / current across" (p751) |
| Explain/justify answers supported by reasoning | ❌ No justify-style practice anywhere; quiz is 100% numeric |
| "Show that" technique | ❌ Absent |
| Uncertainties applied to R = V/I | ❌ Absent (acceptable — belongs mainly to the uncertainties topic; one MC in 11 years) |
| Graph interpretation | ✅ V–I ohmic/non-ohmic figure is good background (graphical EMF/r analysis belongs to the sibling topic) |

---

## 5. Accuracy audit of existing content (all verified — no errors found)

- Concept 1–6 worked examples: all arithmetic correct (30 C; 1·2 A; 9·4 V; 240 Ω; 1·2 kΩ; 3·2 kΩ; 800 W/96 kJ; 6·5 A; 8·4 V; 2·0 kΩ; 6·0/3·0/3·0 V; 4·5 V).
- Practice answers 1–6: all correct.
- Quiz: all six keys correct (360 C, 10 V, 2·0 kΩ, 4·0 W, 8·4 V, 360 kJ). **Quiz Q5 and the Concept 5 example are verbatim 2016 P1 Q18** — a genuine past-paper match, worth keeping exactly as is.
- Widgets (series/parallel calculator, divider sim, two-divider sim): logic checked, correct, with number-input fallbacks and `aria-live` readouts. ✅
- Divider convention (output across bottom R₂) is internally consistent and matches commit `35165ee`.

---

## 6. Prioritised improvements

### Priority 1 — close the "several steps" gap (highest exam impact)

1. **Concept 3 — add mixed-network material.** New worked example reducing a series + parallel combination (model on 2025 P1 Q19: `4·0 + (8·0 ∥ 2·0) = 5·6 Ω`), a second example in the 2023 P1 Q20 six-resistor style, and the **R/n shortcut** for n identical parallel resistors (2024 P2 Q15 MI accepts it outright). Add one practice question per style. Every question keeps the page's house rule (a conversion or tricky step).
2. **Concepts 3/4 — teach the "reduce → total current → work back out" routine.** Worked example finding the p.d. across one resistor of a ladder (2024 P1 Q18 style: 20/30/60 Ω across 12 V) and the power dissipated in one resistor of a series pair (2019 P1 Q23 style). This is the single most common written-paper demand and the page has nothing on it.
3. **Concept 4 — square-root rearrangements.** Worked example from rated power: 2·2 kΩ rated 0·25 W → `V = √(PR)` (2024 P1 Q19, includes the kΩ conversion the house style wants), and a practice for `I = √(P/R)` (2018 P1 Q16). Also give `V²/R` one outing as the *chosen* form in a worked example — it is currently the only member of the power trio never used.
4. **New "Justify it" practice block** (in Concept 3 or 4, plus one in Concept 5): two or three "state whether the reading/power is greater than, less than, or the same — justify" items with reveal answers in MI style (statement mark + reasoning mark), built around a switch opening/closing (2016 P2 Q12, 2025 P2 Q11(c)) and a circuit rearrangement (2023 P2 Q12(b)). Pair with a short **terminology tip box**: *current **in** a component, p.d. **across** it — SQA marking instructions give 0 marks for "voltage through" or "current across".*

### Priority 2 — exam-format and skills polish

5. **Quiz upgrade.** Add four exam-pattern MCs to the existing six: a network-reduction Rᴛ question, a "p.d. across one resistor of a ladder" question, a rated-power square-root question, and one **I/II/III statements** question (the SQA's fixed format, absent from the page). Keep all existing items.
6. **"Show that" mini-box** (Concept 2 or 4): the rule — start from the relationship, substitute, state the target value with its unit; never work backwards from the given answer (2017 P2 Q12(b)(i), 2025 P2 Q11(b)).
7. **Prefixes/notation.** Work µ or M into at least one example or practice (e.g. current in µA through a MΩ resistor), give at least one answer in scientific notation (`1·2 × 10³ Ω`), and add a one-line sig-fig note (final answer to the fewest sig figs given — spec p.18).
8. **Concept 5 — relationships-sheet note.** One line: the SQA sheet writes the divider output across **R₁** (`V₁ = (R₁/(R₁+R₂))Vₛ`); on this page the output is across the bottom resistor R₂ — read the question carefully to see *which* resistor's p.d. is wanted.
9. **Cross-links.** Concept 1: note that `Q = It` returns in *Capacitors* (constant charging current). Add a pointer to the *Electrical sources & internal resistance* page and explain the stem phrase "the supply has **negligible internal resistance**" (it appears in nearly every question here). Optionally note that rms a.c. questions (covered on the AC page) reuse these circuit methods.

### Priority 3 — rebalancing (do after P1/P2)

10. **Demote Concept 6 to "Go further".** Zero questions in 11 diets and not on the relationships sheet. Keep the content and simulator (it builds divider fluency), but badge the panel as extension, soften the subnav label, and reword its RAG criterion so pupils don't weight it like core content. It must not sit visually equal to network reduction.
11. **Sensor-divider reality check.** Keep the LDR/thermistor simulator; add one honest line that Higher exam divider questions are numeric (sensor dividers are N5-style context).
12. **Optional uncertainty extension** (collapsed `details.reveal`): the 2019 P1 Q22 pattern — biggest % uncertainty dominates R = V/I. Low priority; one MC in 11 years.
13. **RAG list refresh** once the above lands: add criteria for "reduce a mixed network", "find the p.d./power in one part of a circuit", "justify a greater/less/same answer", "answer a show-that question".

---

## 7. Guardrails (unchanged from the build plan — still apply)

- Edits go into the **existing live page**; shared chrome stays in `higher-physics.css` (bump `?v=` if it changes), widget CSS/JS stays inline, `localStorage` prefix stays `hp-cpr-`.
- UK/BS circuit symbols only (open-rectangle resistor, circled A/V meters); SVGs themeable for dark mode.
- Every question keeps a conversion or tricky step; worked examples in pairs (substitute-&-solve + rearrange "numbers in first"); real 2-D fractions (`fr-n`/`fr-d`).
- SQA command words (Calculate / Determine / Show that / State / Explain / Justify) in all new practice; MI-style reveal answers.
- iPad-first: tap targets ≥44 px, number-input fallbacks for sliders, no drag-only interactions, `aria-live` for dynamic readouts.
- Follow `higher-topic-page-guide.md` and its pre-commit checklist before shipping.

---

## 8. Visual & usability analysis

*Scope: the page's inline CSS/JS plus the shared chrome in `assets/css/higher-physics.css` (v `hp-20260611d`). This section is additive — it does not change any content suggestion in §6.*

### What already works (verified in code — keep it)

- **Focus, motion, dark mode all inherited correctly** from the shared sheet: global `:focus-visible` ring (3px), full `prefers-reduced-motion` block, complete light/dark token sets. The inline widget CSS uses the tokens throughout, so the whole page (SVGs included, via `var(--text)`/`var(--card)` strokes) themes properly in dark mode.
- **Text contrast is comfortably WCAG AA in both modes** (computed: muted text 9.6:1 light / 8.1:1 dark; accent-2 coaching notes 9.3:1 / 9.5:1; white-on-RAG buttons all ≥5:1).
- **Mobile-aware example layout**: `.ex-flow` collapses the "Convert first" block above the working on ≤600 px with the border flipping left→top — a genuinely nice touch.
- **Widget accessibility basics are right**: every slider has a paired number input (`inputmode="decimal"`), readouts are `aria-live="polite"`, toggle groups use `aria-pressed`, RAG buttons carry full `aria-label`s, the meter bar is `aria-hidden` with a text equivalent, circuit SVGs have `role="img"` + descriptive `aria-label`, and the symbol chart pairs `aria-hidden` SVGs with visible captions.
- **Sticky subnav + `scroll-margin-top: 170px`** means jump links land sections below the bar correctly; banner has fixed clamp height (no layout shift); no horizontal page scroll (overflow is contained per-example).

### Visual/usability improvements — prioritised

**U-P1 (fix first — affects learning or excludes users)**

1. **Quiz feedback is colour-only.** Marking adds a green tint (`.opt.correct`) or red tint (`.opt.wrong`) and nothing else — WCAG 1.4.1 failure, and the tinted borders sit at ~3.3:1 in dark mode (legal for non-text, but subtle). Add a glyph/text cue inside the option when marked (e.g. "✓ correct answer" / "✗ your answer") so colour-blind pupils and dark-mode users get the same information.
2. **Tap targets below the site's own floor** (CLAUDE.md: 48 px buttons / 44 px links). Measured from the CSS: RAG buttons 40×40; `details.reveal > summary` ("Answer") ≈ 37 px tall; quiz `.opt` rows ≈ 38 px; subnav links ≈ 33 px. These are the page's most-tapped controls on iPads — raise paddings/min-heights to ≥44 px.
3. **The coaching notes can be invisible on phones.** `.calc` rows are `white-space: nowrap` in a 4-column grid inside `.example { overflow-x: auto }`; on narrow screens the fourth column — the `← numbers in first` / `← now rearrange` notes, the page's signature scaffolding — can sit off-screen with no scrollbar or fade to hint it exists. On ≤600 px, wrap the note cell to a full-width row under its equation line (or add an edge-fade scroll hint). The pupils who most need those notes are the ones on phones.
4. **Subnav overflow is undiscoverable.** `.subnav-links` hides its scrollbar (`scrollbar-width: none`) with no fade or chevron; with seven links, "Two dividers" and "Check" are off-screen on a phone and nothing signals that the bar scrolls. Add an edge-fade gradient (or let links wrap to two rows ≤560 px).

**U-P2 (polish)**

5. **Reveal affordance**: `details.mini` (shared CSS) gets a ▾ chevron; the page's `details.reveal` ("Answer", "Circuit symbols…", "Go further…") gets nothing — they look like static boxes. Reuse the same `summary::after` chevron.
6. **Series/parallel calculator ergonomics**: "+ Add resistor" silently does nothing once 6 rows exist (disable it and say why); there is no way to remove a row; and every input is labelled identically "R (Ω)" — number them (R₁, R₂ …) for screen readers and to match the worked examples' notation.
7. **Quiz "Mark my answers" with nothing selected reveals every correct answer** in one tap, deflating its self-test value. Require at least one selection (or confirm first).
8. **Sub-11 px labels**: `.ex-type` .68rem, `.conv-label`/`.u` .70–.72rem are below comfortable minimums on small screens. Nudge everything to ≥.72rem and check the eyebrow style still reads.
9. **No current-section indication in the subnav** while scrolling. Optional: a light IntersectionObserver scrollspy that underlines the active link (must respect reduced motion; degrade gracefully without JS).

**U-P3 (nice-to-have)**

10. **Dark-mode graphic accents**: the lamp curve / "wrong" accents hard-code `#c2410c` (~3.3:1 on the dark card — passes non-text 3:1 but looks muddy). Consider a brighter orange for dark mode via a token rather than a literal.
11. **Print**: answers inside `<details>` print collapsed and widgets print as dead controls. If pupils print revision sheets, a tiny `@media print` block (force reveals open, hide widgets/quiz buttons) would make the page printable. Optional.
12. **RAG pressed state** is colour-fill only; the letter + `aria-pressed` carry the meaning, so this passes — but a subtle outline on the selected button would help at a glance.

### Visual & usability guardrails — do not break while editing

- **All chrome stays in `higher-physics.css`** — never fork its tokens or selectors inline on this page; if the shared sheet changes, bump `?v=hp-YYYYMMDD` everywhere it's linked.
- **Never weaken focus**: keep the global `:focus-visible` ring; no `outline: none`; any new interactive element must show a ≥3 px ring (the inline `.btn:focus-visible` pattern is the template).
- **Any new colour goes through the existing tokens** (`--text`, `--muted`, `--accent`, `--accent-2`, `--surface-2`, `--border-*`) so dark mode keeps working for free. The blue gradient pill (`#3b6bff → #1636b8` + white) is the one sanctioned hard-coded pair.
- **Keep the `.calc` grid's centred, `=`-aligned, serif/italic SQA typography** (commits `99920f9`, `ee66400`) and the `.ex-flow` conversions-on-the-left layout. Fixes to U-3 must not left-align the maths or break the 2-D fractions (`fr-n`/`fr-d`).
- **Keep every slider's number-input fallback** (`inputmode="decimal"`), `aria-live="polite"` readouts, `aria-pressed` toggles, and the `hp-cpr-` localStorage prefix. No drag-only or hover-only interactions — iPad first.
- **SVG diagrams stay inline, themeable, UK-symbol** (open-rectangle resistor, circled A/V meters, `var(--text)` strokes). No raster screenshots of circuits; new diagrams need `role="img"` + `aria-label` (or `aria-hidden` + visible caption for decorative repeats).
- **Don't "fix" the double h1** (banner h1 + visually-hidden h1 in `<main>`): it's the site-wide template in CLAUDE.md — change it centrally or not at all.
- **Sticky subnav and `scroll-margin-top: 170px` are a matched pair** — if the bar's height changes (e.g. wrapping links for U-4), retune the scroll margin.
- **Respect reduced motion** in anything new (scrollspy, reveals, meter animations) — the shared kill-switch must keep covering it.
- **No parallax, no `background-attachment: fixed`, no horizontal page scroll at 320 px** (CLAUDE.md iOS rules). Per-component `overflow-x: auto` like `.example`'s is the approved escape valve.
