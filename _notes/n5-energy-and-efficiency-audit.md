# Audit — `classes/n5-engineering/energy-and-efficiency.html`

> **Status: all findings actioned, 23 August 2026.** Every item below (P1, P2, P3 and the content
> notes) has been implemented and verified. What was built, and how it was tested, is recorded in
> `~/claude-work/n5-energy-page/STATE.md`. The template conventions this changed are written up in
> the repo `CLAUDE.md` and in `n5-engineering-pages-outline.md`; **topics 3–8 have not been
> retrofitted** and still follow the old layout.

Date: 22 August 2026. Page as built at `_site` from the current working tree (1,646 lines, 118 KB).

**How it was checked:** rendered with headless Chrome at 1280 px, 1440 px and 390 px, light and dark
(dark forced by rewriting `prefers-color-scheme` in a throwaway copy), full-page capture inspected in
slices; layout, overflow and the progress engine's counts measured in the live DOM through a
same-origin probe frame; contrast ratios computed from the actual token values; every `/assets/` link
resolved against the repo; formulae compared against
`n4-n5-engineering-science-data-booklet-2.pdf` (extracted with `fitz`).

**Verdict.** Structurally the strongest N5 Engineering page — it is the only one of the seven carrying
exam-style practice with mark allocations (18 questions), and the one the outline names as the
template. Nothing is broken: all 15 asset links resolve, the progress meter's `0 / 7` is correct (six
authored challenges plus the MC quiz, which `progress.js` auto-binds), all ten quiz keys are right,
dark mode is clean, there is no horizontal overflow at 390 px, and the print stylesheet works. The
problems are (a) a handful of accessibility/accuracy defects that are worth fixing before anything
else, and (b) a layout of the *learning* that puts the best material where pupils will not find it.

---

## P1 — fix first

### 1. The sub-nav clips 84 px at every screen width; "Check" is never visible
Measured in the live DOM: `.subnav-links` `scrollWidth` 1072 px vs `clientWidth` 988 px — identical at
1280 px and 1440 px, because `.subnav` is capped at `min(1100px, 92vw)`. So "Answers" is always cut
mid-word and "Check" is always off-strip. It scrolls (`overflow:auto`) but the scrollbar is hidden and
there is no fade or arrow, so on a laptop it reads as a truncation, not a scroller.

Fix, cheapest first: shorten the labels (`Forms`, `Conservation`, `Work`, `Ek & Ep`, `Ee & Eh`,
`Power`, `Efficiency`, `Audits`, `Decisions`, `Answers`, `Check` saves ~90 px on its own); or add a
right-edge fade mask on `.subnav-links` plus `scroll-snap`; or let the strip wrap to two rows above
900 px. Worth doing in the shared sheet — every N5 topic page inherits this.

### 2. The exam intelligence is in `title=` tooltips, which do not exist on iPad
Nine `title` attributes carry the page's most valuable content — the past-paper mapping
(`2024 Q7(b), Q9(c)`; `2022 Q3 — a workbench pushed 12 m by a 2200 N force`; `2022 Q11(c) — the lift:
44 kJ in, 32 kJ useful`). On touch there is no hover, so the primary audience never sees any of it,
and it is invisible in print too.

Fix: promote it to visible text. A small line under each `<h2>` — `Examined: 2021 Q10(b)(ii) ·
2022 Q14(d) · 2025 Q10(d)(i)` — in the `.page-ref` pill style already defined, or a `details.reveal`
"Where this comes up in the exam" per section. This is the single highest-value change on the page.

### 3. Light-mode contrast — `--tagink` fails AA across nine components
Computed against the real token values:

| Pair | Ratio | Where |
|---|---|---|
| `#c86c13` on `#fbf0e4` | **3.33** | `.eq-name`, `.ex-type`, `.slot-head`, `.conv-label`, `.practice-tag` |
| `#c86c13` on `#ffffff` | **3.74** | `.concept-tag`, `.eyebrow`, `.model-tag`, `.marks` |
| `#c86c13` on `.example` bg | **3.50** | `.calc .note-cell` — the "numbers in first / now rearrange" annotations |
| `#c86c13` (`--eng-orange-dark`) on `--eng-bg` | **3.48** | `.backlink` |
| `#ffffff` on `#2e8b57` | **4.25** | `.effsim-useful` bar label |

All are ≤ 12.5 px text, so AA needs 4.5:1 — bold does not exempt them (large = 18.66 px bold). Dark
mode is fine throughout (10:1+).

Fix: light-mode `--tagink: #9a5410` (5.75 / 5.12 / 5.25 against white / surface-2 / key-bg) and the
same for `--eng-orange-dark` where it is used as text. For the bar, `#15803d` — the `--good` token —
gives 5.02:1 and unifies the colour grammar (see 15). Orange stays as a *background* (`.badge.exam`,
`.cta`, `.btn.primary` are all 8.6:1 with `#111`) — only orange-as-text is the problem.

### 4. `g = 9.8 N/kg` does not match the booklet pupils get in the exam
The N4/N5 Engineering Science data booklet (p.4) prints `g = 9·8 ms⁻²`; it also gives
`c_water = 4180 J kg⁻¹ K⁻¹`, where the page writes `4180 J/kg°C`. The page states "the exam gives you
the data booklet with this relationship" and then quotes different notation in the key idea, the
`.eq-desc` and four worked examples. Dimensionally identical, but a pupil looking for "9.8 N/kg" on
the relationship sheet will not find it.

Fix: lead with the booklet's form and gloss it once — `g = 9.8 ms⁻² (9.8 N/kg)`, `c = 4180 J kg⁻¹K⁻¹
(J/kg°C — a change of 1 K is a change of 1 °C)`.

Related, smaller: Lesson 6's key idea says "the data booklet with all six formulae". The booklet's
efficiency entry is only the ratio — `η = Energy_out / Energy_in` — the ×100 percentage form is *not*
printed, which is exactly why pupils drop that mark. Say so explicitly in §7 rather than presenting
both as data-booklet cards.

### 5. The energy-balance widget marks a physically impossible answer correct
`bal-check` passes on any pair summing to 1000 J, so useful 1000 / wasted 0 returns
"✓ Balanced — every joule in is accounted for" — directly contradicting the Lesson 7 key idea, "No
real system is 100% efficient". A pupil can, and will, slam the useful slider to the top.

Fix: keep conservation as the pass condition but add a second line when wasted = 0 — "the numbers add
up, but no real system wastes nothing: try again with some waste" — or clamp `Eu` to ≤ 950.

---

## P2 — structure and pedagogy

### 6. The best practice material is three layers deep at the bottom of the page
18 marked exam-style questions (`Practice 2–5`) sit inside `details.reveal` → `details.reveal` →
`.practice`, inside a section called **"Check your booklet work"**, ~13,000 px down. A pupil revising
Ek has to scroll past everything, guess that "Practice 4" is the calculations set, open it, then open
each answer. Meanwhile Lessons 3, 4, 5, 8 and 9 contain no questions at all.

Fix (the big one): move each practice set up beside the concept it tests — Practice 2 → §1,
Practice 3 → §2, Practice 4 split across §3–§6, Practice 5 → §7 — as a `.practice` block with the
`.practice-tag` pill (already styled, currently unused) and per-question `details.reveal` answers.
That is the pattern the site standard describes and the CSS already supports. Keep `#answers` for the
booklet task keys only, and retitle it honestly ("Booklet answer keys").

### 7. The interactive load is lopsided
§1 has two widgets, §2 two, §6 one, §7 one — §3, §4, §5, §8, §9 have none. §8 (Energy audits) is one
of the most directly examined ideas on the page (`2022 Q11(c)`) and is the shortest section: a key
idea, a diagram and a note.

Fix: an audit fill-in for §8 is the obvious missing widget and reuses the existing `.kit-task`
machinery — give input and useful, ask for wasted and efficiency; then vary it (given wasted; given
efficiency), which is precisely the "working backwards" the note flags. §3–§5 need nothing new beyond
the relocated practice from 6.

### 8. Lesson 6 promises "choosing the right formula" and never delivers one
There is no formula-finder anywhere, and — uniquely among the seven N5 pages — this page contains
**zero tables** (mechanisms has 5, pneumatics 7, electronics 8). `.tbl` / `.tblwrap` are styled and
unused.

Fix: a "what you're given → what to use" table in §6, six rows keyed on the symbols in the question
(`F` and `d` → `E_w = F d`; `m` and `v` → `E_k = ½mv²`; `V`, `I`, `t` → `E_e = VIt`; …), plus the two
conversion traps as a column. This is the page's most useful single revision object and it is also
what the section title already claims.

### 9. The endless-question generator avoids all the traps the page teaches
`GENS` produces four question types, all "substitute and solve", all answered in joules, all with
time already in seconds and ΔT given directly as "heated by 40 °C". So it never practises: converting
minutes → seconds, subtracting to get ΔT, rearranging, power, work done, or answering in kJ — i.e.
every mistake the key ideas warn about. Wrong answers reveal the number immediately with no second
attempt and no working.

Fix: add generators for `E_w = F d` and `P = E/t`; express some times in minutes; give heat questions
"from 18 °C to 80 °C"; add a rearrange variant ("…uses 138 000 J in 2 minutes, find the current") with
its own unit in the answer field. On a wrong answer, show the substitution line before the number.

### 10. Every worked example is closed, and nothing opens them
15 `details.reveal` worked examples start collapsed; `Expand all` only toggles `section.sec`, so the
"Worked examples" mode card lands the pupil on a wall of identical closed bars.

Fix: make `Expand all` / `Collapse all` also drive `details.reveal` inside sections (one extra loop in
the existing handler), and make the mode card do something real — "Worked examples" could open every
example and collapse the notes.

### 11. The page is a dead end
Only two links leave it, both to the hub. Nothing points to the topics that reuse this material —
efficiency of gear trains (Mechanisms), `P = VI` (Electronics), or the Assignment Prep page, where
energy/efficiency is core. `.badge.assign` is styled and never used.

Fix: a "Where this comes up next" row of three `.resource-card`s at the foot, plus `.badge.assign` on
§7 and §9.

### 12. The summary block that was planned was never built
`<!-- ================= KEY IDEAS ================= -->` sits between `#answers` and `#check` with
nothing under it. There is no one-screen recap: no consolidated formula list, no "the five things
markers take marks for". For a 2,400-word, 15,500 px page this is the thing pupils would screenshot.

Fix: build it — the six relationships as `.eq-card`s in a 3-column grid, the four unit rules, and the
"show substitution, then answer with a unit, 2 s.f." reminder.

---

## P3 — visual polish

13. **Lone equation cards stretch to 1100 px.** `.eq-cards` is `auto-fit minmax(240px, 1fr)`, so §2,
    §3 and §6 render one card across the full panel with the formula marooned in the middle. Cap it:
    `grid-template-columns: repeat(auto-fit, minmax(240px, 420px))` with `justify-content:center`.
14. **Two colour grammars for "wasted".** The SVG diagrams use red (`--bad`) for wasted energy; the
    two sims use amber `#e0a106`. Same page, same concept, two codes — and amber reads as the brand
    orange. Make both red, or both amber, and say which in the figcaption legend.
15. **Inconsistent measure.** `.lead` is capped at 64ch but unclassed `<p>` runs the full 1100 px, so
    §1 alternates between a 64-character column and a 130-character one. Apply the cap to
    `.sec-body > p` generally.
16. **Diagrams are small.** Both SVGs are `max-width:520px` with 10.5–12 px labels inside a 1100 px
    panel — thin on a projector and small on an iPad. `w560`/`w420` modifiers exist but are unused;
    take the two energy diagrams to ~640 px and 13 px labels.
17. **Four identical "Worked example — …" bars per section.** In §4 and §5 the two pairs are
    distinguished only by the `<h3>` above them. Name them for what they find: "Worked example — find
    E_k", "Worked example — find the speed".
18. **Subscript spacing in the equation cards.** `<var>E</var><sub>k</sub>` renders as a visibly
    detached "E k" at 1.5 rem serif, because the italic slant adds apparent space. `sub { margin-left:
    -0.06em }` inside `.eq-formula` closes it.
19. **First mode card has no colour.** The rule matches `[href="#answers"], [href="#s3"], [href="#check"]`
    — "Revise the topic" is `#s1`, so it keeps the default grey edge while its two neighbours are
    coloured. Add `[href="#s1"]`.
20. **`#check` prints its own name twice** — `<span class="concept-tag">Check yourself</span>`
    directly above `<h2>Check yourself</h2>`. Change the tag to "Self-assessment" or drop it.
21. **Collapse state is not remembered.** `setOpen(true)` runs unconditionally on load even though a
    `localStorage` prefix (`n5e2-`) is already in use for the quiz best score. Persist it.
22. **The progress meter appears unexplained** — `📋 Section challenges 0 / 7` plus three grey emoji,
    with nothing on the page saying what a challenge or a badge is. One `.hint` line under it.
23. **Dead CSS** (~40 lines): `.tbl` / `.tblwrap`, `.warn`, `.badge.assign`, `.practice-tag`,
    `.eyebrow`, `.notes`, `.bd.w420`, `.bd.w560`. Several of these mark features the page should have
    (13, 8, 11) — build them or delete the rules.

---

## Content notes (minor, accuracy)

- §1's "Match the energy form" widget has 6 rows; the booklet task it mirrors (p.3 key in `#answers`)
  has 7 — the LED/light row is missing on the page, so "Light" is an option that is never an answer.
- §5's rearrange example uses 168 000 J to get ΔT = 80 °C (2 s.f.), while the example immediately
  above computes 167 200 J for exactly 80 °C. Using 167 200 makes the pair reversible and drops the
  rounding caveat.
- The efficiency explorer lets useful output exceed input and then silently caps it ("useful capped at
  the input" in the readout). That is a good teaching moment — make it explicit rather than a
  parenthesis, or cap `eff-out`'s max to the current `eff-in`.
- The efficiency challenge is always "set it to 60%". Randomise the target so it can be repeated.

## Aside — not this page

Working notes at the repo root are being published: `_site/electricity1-audit-and-improvements.html`,
`_site/AUDIT-PLAN.html`, `_site/progress-system-rollout-plan.html` and five more render as live pages,
because `_config.yml`'s `exclude:` list names only some of them. Its own comment says working notes
"now live in `_notes/`" — but that folder did not exist until this file. Either move them there or add
them to `exclude:`.
