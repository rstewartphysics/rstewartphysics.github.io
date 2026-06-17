# S3 Electricity 1 — improvement plan

Target file: `classes/s3-physics/electricity1.html`
Style references: the five Higher Electricity pages in `classes/higher/electricity/`, canonical =
`current-pd-power-resistance.html`; construction rules = `higher-topic-page-guide.md`.

**Goal:** bring the S3 page's *look, layout grammar and worked-example conventions* as close to the
Higher Physics topic pages as practicable — **while keeping the S3 teal identity and the existing
gamification/self-check the page already ships.** This is a refinement of a live student page, not a
rebuild.

---

## 0. Guiding principle & scope decision

The Higher pages and this page already share a lot (sticky sub-nav, `.eq-cards`, `.widget`, banner +
overlay, dark mode, sub-nav CTA). The visible gaps are: worked-example formatting, the formula
triangle shape, two wrong circuit symbols, an over-long L4, and a long tail of "extra" sections at
the bottom that Higher folds into each concept.

**Structural decision (recommended, baked into this plan):**
- **Keep** the S3 collapsible `<details>` lesson structure (`.collapsible-panel`) — it suits the
  younger S3/iPad audience and the per-lesson gamification depends on it. Do **not** convert to
  Higher's always-open `<section class="panel" id="cN">` blocks.
- **Adopt** Higher's *internal* conventions inside each lesson: equation cards → notes → diagram →
  **two worked examples in the `.calc` grid** → **per-lesson practice callout with a reveal mark
  scheme** — i.e. fold the booklet answers / exam questions / videos into the lesson they belong to.
- **Port** the Higher worked-example CSS components (`.calc`, `.calc-row`, `.lhs/.eq/.rhs/.note-cell`,
  `.frac`/`.fr-n`/`.fr-d`, `.example`, `.ex-q`, `.ex-type`, `.ex-conv`, `.ex-flow`, `.practice`,
  `.practice-tag`, `.ms`, `.marks`) **inline** into the S3 page, themed with the existing teal tokens
  (`var(--accent)`, `var(--accent-2)`, `var(--c-ex)` etc.) — copy the exact rules from
  `current-pd-power-resistance.html` and recolour, do **not** invent new values.

> If the site owner instead wants a full conversion to always-open Higher-style concept panels, that
> is a larger separate job — flag before starting; this plan assumes the recommended approach above.

---

## 1. Fix the two wrong circuit symbols (L1, `symbol-grid`)

### 1a. Microphone — should be a **circle with a flat line above it**
Current (≈ lines 459–467) draws a "D" shape: a vertical bar plus a right-bulging arc in line with one
wire. That is not the BS microphone symbol.

- **Replace** with: a **full circle** (the capsule) with a **horizontal straight line tangent across
  its top**, sitting in line between two leads.
- Suggested geometry in the existing `viewBox="0 0 100 60"`:
  `circle cx="50" cy="34" r="14"`; flat line `x1="34" y1="20" x2="66" y2="20"` (tangent to the top of
  the circle); leads `line 0,30→36,30` and `64,30→100,30` meeting the circle's sides.
- Keep `stroke="currentColor"`, `fill="none"`, the same `stroke-width`, `role="img"` and
  `aria-label="Circuit symbol for a microphone"`. Tune coords so the flat line just touches the
  circle and the leads land on the circle, not through it.

### 1b. Loudspeaker — must show **two connections, not one**
Current (≈ lines 469–477) has a single left lead into the rectangle. A loudspeaker has **two
terminals**.

- **Add a second lead** so the rectangle (driver body) has two connection wires. Standard form:
  rectangle on the left with the trapezoid "horn" to its right, and **two leads** off the rectangle's
  left edge (top-left and bottom-left), e.g. leads at `y≈22` and `y≈38` running out to `x=0`, instead
  of the single centre lead at `y=30`.
- Keep the trapezoid cone (`M…Z` path), `currentColor`, `aria-label="Circuit symbol for a
  loudspeaker"`.

### Guardrails for 1a/1b
- **UK / BS-IEC symbols only** (per `CLAUDE.md` "What not to do" and guide §7). No US styling.
- Wires must **meet** the component, never pass through it.
- The **symbol-matching game** `matchData` (≈ line 2246) does **not** currently include microphone or
  loudspeaker, so these SVG edits don't touch the game. If you later add them to the game, copy the
  corrected inner SVG verbatim.
- The **booklet-answer** descriptions (mic = sound→electrical, speaker = electrical→sound) stay
  correct — no wording change.

---

## 2. Split L4 into **L4a** and **L4b**

Current L4 = "Ohm's Law, V–I graphs & temperature" — too broad. Split into two collapsible panels:

- **L4a — Ohm's Law: equations & calculations**
  Contents: the three `.eq-cards`, the **formula triangle** (see §3), the "common mistakes"
  misconception box, the worked example, the **fill-the-gaps** widget (see §4), the *Spot the
  mistake* widget, the **practice generator** (see §5), the "check your calculation (mA trap)" widget,
  the L4 30-second check (calculation items), and a calculation self-check row.
- **L4b — V–I graphs & temperature (experiment)**
  Contents: the "V–I graphs" section + `.vi-graphs`, the graph-comparison challenge, the
  "Temperature & resistance" notes, the predict-&-justify (series resistor → current) widget, plus a
  graphs/experiment 30-second check and self-check row. Frame it around the **experiment** (plot V up,
  I across; gradient = R) to match the SQA practical.

### Wiring updates required when splitting (do all of these)
- **Sub-nav** (≈ line 285): replace the single `#l4 Ohm's law` link with `#l4a` and `#l4b`
  (labels e.g. "Ohm's law" and "V–I graphs"). Keep the scrollspy `IntersectionObserver` working —
  it reads `href` slugs, so new IDs auto-register **as long as elements with those IDs exist**.
- **Panel IDs:** `id="l4"` → two panels `id="l4a"` and `id="l4b"`.
- **30-second checks:** rename `check-l4` → `check-l4a` / `check-l4b`, split the three current items
  into calc items (4a) and graph/temperature items (4b); update both the `<div id>` and the
  `buildQuiz('check-l4', …)` calls and their `data-challenge`/`*-done` IDs.
- **Self-check (GAR):** `garCriteria` **already has `l4a` and `l4b` item ids** (lines ≈ 1763–1766) but
  both currently sit under one `data-gar-level="L4"`. Change to **two groups** `level:'L4a'` /
  `level:'L4b'` and put a `data-gar-level="L4a"` row in panel 4a and `data-gar-level="L4b"` in 4b.
- **`data-challenge` ids:** keep existing ids unique; if a check splits into two, give the new one a
  new id (e.g. `ch-check-l4a`, `ch-check-l4b`). The gamification `total` is counted from
  `[data-challenge]` elements, so the progress bar/badges auto-adjust — **just avoid duplicate ids**.

---

## 3. Formula triangle — make it an actual **triangle**, not a rectangle

Current `.tri` (CSS ≈ lines 155–166; markup ≈ lines 872–875) is a bordered **rectangle** split into a
top row (V) and a bottom row (I | R). Replace with a true triangle.

- **Recommended approach — inline SVG triangle** (matches the site's SVG-first rule, themeable, crisp):
  an outline triangle with a **horizontal divider** separating the top apex region (**V**) from the
  base, and a **vertical divider** splitting the base into **I** (left) and **R** (right). Put `V`,
  `I`, `R` as serif italic `<var>` text in each region.
- **Keep it interactive & accessible:** overlay three `<button>` hit-areas (one per region) so tap /
  keyboard still work; on activate, add `.active`, announce the rearranged relationship in
  `#tri-result` via the existing `ch-triangle` logic (≈ lines 2056–2073) — that JS keys off
  `data-solve="V|I|R"`, so preserve those attributes on the new buttons.
- **Alternative:** CSS `clip-path: polygon(50% 0, 0 100%, 100% 100%)` on a container — workable but
  harder to place three clean tap regions and the dividing lines; prefer the SVG.
- Keep the teal theming (`var(--c-learn)` border, `.active` → teal fill, white text) and the caption
  ("V on top; I × R underneath"). Maintain ≥44px tap targets and focus rings.

### Guardrail
- Don't remove the `data-challenge="ch-triangle"` hook or the `#tri-result` `aria-live` region — the
  triangle is a tracked challenge.

---

## 4. Fill-in-the-blanks → **standard 3-mark physics layout**

Current "fading practice" widget (≈ lines 891–904) writes the whole solution on **one line**
(`I = V ÷ R = 230 ÷ 5 = [input] A`). The SQA / Higher convention is **three stacked lines**:

```
relationship              (e.g.  I = V / R )
substitution (numbers in) (e.g.  I = 230 / 5 )      ← input(s) live here
final answer with unit    (e.g.  I = [__] A )       ← input + unit
```

- **Rebuild the widget on the ported `.calc` grid** (§0) so each step is its own `.calc-row` with the
  four cells (`lhs`/`eq`/`rhs`/`note-cell`), exactly like the Higher worked examples — but with
  `<input class="fade-in">` boxes in the substitution and/or answer rows. Every row must have all four
  cells (empty `note-cell` allowed) or the `=` column misaligns (guide §5, §11).
- Apply to **both** faded examples (the 230 V ÷ 5 Ω one, and the 8 V / 2 mA one). Keep the unit
  **conversion** as a separate prep line — use an `.ex-conv` "Convert first" block to the left
  (2 mA → 0.002 A), matching guide §5, rather than burying the conversion mid-line.
- Final-answer rows must end **with the unit** (A, Ω, V).
- **Preserve the checking JS** (`fade-check`, ids `fd-2`, `fd-3a/b/c`, the `award('ch-fade',…)` call,
  the `ok/no` classes). Keep the same input ids so `≈ lines 2076–2099` keep working; only the
  surrounding markup changes. If you add/rename inputs, update that script in lockstep.

### Guardrail
- Use `.fade-in` for inputs, **never** `class="num"` (it collides with input styling — guide §4).
- This widget lives in **L4a** after the split.

---

## 5. Practice generator — reword output as a **question**

Current `newVIR()` (≈ lines 1703–1728) prints terse stems: `"Calculate V:  I = 0.5 A,  R = 50 Ω"`.

- **Reword to read like a real question**, e.g.:
  - V: `"Find the voltage if the current is 0.5 A and the resistance is 50 Ω."`
  - I: `"Find the current if the voltage is 6.0 V and the resistance is 50 Ω."`
  - R: `"Find the resistance if the voltage is 6.0 V and the current is 0.5 A."`
- Keep SQA command-word style ("Find" / "Calculate") and **include the unit on every quantity**.
- Only the `question = …` strings change; **leave the number generation, `currentAnswer`, tolerance
  check and `award('ch-vir',…)` untouched**.
- Consider (optional) nudging the generator toward at least one "extra step" (e.g. occasional mA or
  kΩ values) to match guide §6 — but this is a *nice-to-have*, not required; if added, update the
  answer maths and tolerance carefully.

### Guardrail
- Keep the answer-format/precision the same so the existing `Math.abs(user-currentAnswer)<0.05`
  tolerance still passes. This widget lives in **L4a** after the split.

---

## 6. Fold the "extra" bottom sections into the relevant lessons

Higher pages keep almost everything **inside the concept it belongs to**, with one consolidated Check.
Fold the long tail (booklet answers, exam questions, videos) into lessons; keep genuinely page-wide
tools at the bottom. Practicable folding:

| Bottom section (current) | Action | Destination |
|---|---|---|
| **Booklet answers** L1 (component functions) | fold as a `details.reveal` answer/practice callout | inside **L1** |
| Booklet answers L2 (definitions & rules) | fold | inside **L2** |
| Booklet answers L3 (resistance & colour table) | fold | inside **L3** |
| Booklet answers L4 (Ohm's law calcs) | fold calc answers → **L4a**, graphs/temperature → **L4b** | L4a / L4b |
| Booklet answers L5/L6 (combination) | fold | inside **L5** and **L6** |
| **Exam-style questions** Q1–Q5 + mark schemes | convert each to a per-lesson **`.practice` callout** (Higher style: one practice per concept, with reveal `.ms` mark scheme) | Q1→L5, Q2→L4a, Q3→L5, Q4→L4b, Q5→L6 |
| Exam **stretch** C1–C4 | C1→L6, C2→L4b; **C3/C4 use P=I²R (power)** which is beyond this V=IR block — keep as an optional "stretch" reveal (L4a) or drop, owner's call | L6 / L4b / L4a |
| **Videos** — Ohm's law group | embed in the lesson's **"See"** step | **L4a** |
| Videos — series & parallel group | fold | **L2** (and link from L5) |
| Videos — components & resistance group | fold (components → L1, non-ohmic → L4b, colour bands → L3) | L1 / L3 / L4b |

**Keep at the bottom (folding would hurt usability — guardrail against over-folding):**
- **Self-marking 10-question quiz** → keep as the page's consolidated **"Check / Practice for the
  test"** section (mirrors Higher's single mixed-MC Check). It spans all lessons, so it stays whole.
- **Past-paper signposts** → keep as one reference section; the lists are organised **by year**, not
  by lesson, so splitting them per lesson would fragment them unhelpfully.
- **AI Tutor** launch → whole-topic tool, keep at the bottom.

### Folding mechanics & guardrails
- The L1 "See" step already says *"watch … in the Video revision section below"* — once videos are
  folded in, **embed the clip in place** and update/remove that pointer so it isn't a dead reference.
- When moving a booklet `details.reveal`, move the **whole** `<details>` block; don't split markup.
- Watch the **`section-head` anchors**: `#answers` and `#practice` are sub-nav targets. After folding
  booklet answers into lessons, the `#answers` link should be **removed from the sub-nav** (or
  repointed). Keep `#practice` for the consolidated quiz. Update the sub-nav and the scrollspy map
  together so no link points at a missing id.
- Don't duplicate content: if a fact now lives in the lesson, delete the bottom copy rather than
  leaving both.
- Lazy-loaded video `<iframe>`s must keep `loading="lazy"` and `title=…`; embedding many at once can
  hurt iPad performance — keep them inside the already-collapsed `<details>` lessons so they don't all
  load on open.

---

## 7. Whole-page style alignment to Higher (lower-risk polish)

Apply alongside the above so the page reads as a sibling of the Higher pages:

- **Worked examples** everywhere use the ported `.calc` grid + `.example`/`.ex-type`/`.ex-q` shell
  (replace the ad-hoc `.worked` `<p>` chains in L3/L5/L6 where a calculation is shown). Keep `.worked`
  for prose-style notes if simpler, but calculations should use `.calc`.
- **Equations are serif** with `<var>` italic quantity symbols; numbers/units/operators upright
  (guide §4). The page mostly does this already in `.eq-formula`/`.fade-line`; extend to the new
  `.calc` rows and any `R_T`, `R₁`, `Rₚ` usages (use `<var>R</var><sub>T</sub>` etc.).
- **Per-lesson practice callouts** use `.practice` + `.practice-tag` "Practice N" with a
  `details.reveal` `.ms` mark scheme — the format already used on Higher.
- **Marks tags:** add `<span class="marks">3 marks</span>` to exam-style/practice stems (port the
  `.marks` style from the reference page).
- Keep the existing **teal palette, tokens, banner, footer wording, sub-nav CTA** — mirror Higher's
  *structure and component grammar*, not its blue. (`CLAUDE.md` colour table: S3 = blue-teal
  `#00747c`, teal accent; do not switch to Higher azure.)

---

## 8. Cross-cutting GUARDRAILS (apply to every change)

**Don't break the gamification / progress system**
- Preserve `localStorage` prefixes exactly: `s3-elec-beta-g-` (beta engine) and `s3e1b-gar-`
  (self-check). Changing them silently wipes pupils' saved progress.
- `total` challenges = count of `[data-challenge]` elements. Keep every `data-challenge` id **unique**;
  when you split a lesson, give new tracked widgets new ids; when you fold/merge, don't leave
  orphaned ids referenced by JS that no longer have a DOM element (and vice-versa).
- Keep the public `window.S3Beta` API and all `award(...)`/`complete(...)` calls intact.
- The **Reset progress** button clears both prefixes — keep that behaviour.

**ID / nav integrity**
- Every sub-nav `href="#…"` must have a matching element id; the scrollspy observes ids from the
  sub-nav map. After the L4 split and the folding, re-sync: sub-nav links ↔ panel ids ↔ scrollspy.
- All element ids referenced by JS must exist (guide §11). After renaming `check-l4` etc., grep for
  every old id and update its `buildQuiz`, `*-done`, and `data-challenge`.

**Markup / platform safety (guide §11)**
- Tag balance: `<section>`, `<div>`, `<details>`, `<svg>`, `<figure>`, `<script>`, `<style>` open ==
  close after edits.
- **Every `.calc-row` has exactly 4 cells** (`lhs`, `eq`, `rhs`, `note-cell`).
- Fractions use **`fr-n`/`fr-d`**, never `num`/`den`.
- No Liquid-unsafe sequences (`{{`, `{%`, `%}`) in inline CSS/JS — only `{% include site-menu.html %}`
  is allowed.
- `overflow-x:hidden`, `max-width:100%`, `env(safe-area-inset-*)` on the sticky controls; no
  horizontal scroll on mobile.

**Accessibility (CLAUDE.md a11y section)**
- New SVGs: `role="img"` + `aria-label`/`<title>`; decorative bits `aria-hidden="true"`.
- Tap targets ≥44–48px (triangle regions, buttons); focus rings ≥3px never removed.
- Widget results announce via `aria-live="polite"`; no `alert()`.
- `prefers-reduced-motion` block stays.

**Content correctness**
- Keep SQA wording/symbols and command words. Don't smuggle in non-Block-1 content (e.g. the P=I²R
  stretch is borderline — mark clearly as stretch or drop).
- This is a **live student page** — don't delete working content; move it. Verify each folded block
  still renders and its reveal/answer still matches.

---

## 9. Suggested execution order (smallest-risk first)

1. **Symbols** (§1) — self-contained SVG edits, no JS impact.
2. **Practice-generator wording** (§5) — string-only change.
3. **Formula triangle** (§3) — markup + CSS swap, JS hook preserved.
4. **Port `.calc`/`.frac`/`.example`/`.practice` CSS** inline (§0) — additive, themed teal.
5. **Fill-in-the-blanks → 3-line `.calc` layout** (§4) — uses the ported CSS, same input ids.
6. **Split L4 → L4a/L4b** (§2) — sub-nav, ids, checks, GAR all updated together.
7. **Fold bottom sections into lessons** (§6) — biggest churn; do last, re-sync sub-nav + scrollspy.
8. **Whole-page polish** (§7).
9. **Validate** (§8 markup/ID/Liquid checks) in the browser on a narrow viewport + dark mode, confirm
   progress saving still works, then commit (branch first; current branch is a style branch).

---

## 10. Pre-commit checklist

- [ ] Microphone = circle + flat line above, leads meet the circle; loudspeaker has **2** leads.
- [ ] L4 split into L4a (calcs) / L4b (graphs+experiment); sub-nav, panel ids, checks, GAR groups all
      updated and consistent.
- [ ] Formula triangle renders as a triangle; tap/keyboard still solve V/I/R; `ch-triangle` still
      awards.
- [ ] Fill-in widget shows relationship / substitution / answer-with-unit on separate `.calc` rows;
      `fade-check` still marks correctly.
- [ ] Practice generator stems read as questions with units; answers still validate.
- [ ] Booklet answers, exam questions and videos folded into their lessons; `#answers` removed/retired
      from sub-nav; consolidated quiz, past-paper signposts and AI tutor remain at the bottom.
- [ ] Every `.calc-row` has 4 cells; fractions use `fr-n`/`fr-d`; tags balanced; no Liquid-unsafe
      sequences; all JS-referenced ids exist; no duplicate `data-challenge` ids.
- [ ] `localStorage` prefixes unchanged; progress + reset still work; dark mode + narrow viewport
      clean; teal identity preserved.
