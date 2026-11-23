# N5 Engineering Science topic pages (existing pages)

Moved out of the site `CLAUDE.md` on 23 Nov 2026 (teacher-approved trim); CLAUDE.md keeps the summary and points here.

No new N5 Engineering topic pages once practice pages ship for a topic (DECK-RULES-engineering 106); this guide is for editing the existing ones. Booklet answer keys move to the practice page or the deck before a page is unlinked.

## Engineering Science — National 5 topic pages

**Topic order** (matches the hub tiles on `classes/n5-engineering-science.html`):

1. Engineering Contexts & Systems · 2. Energy & Efficiency · 3. Electronics & Analogue Control ·
4. Logic & Programmable Control · 5. Mechanisms & Drive Systems · 6. Pneumatics ·
7. Structures & Materials · 8. Assignment Preparation & Mixed Revision

**Filing & URLs.** Topic pages live at `classes/n5-engineering/<kebab-topic>.html` (e.g.
`mechanisms-and-drive-systems.html`), except Topic 8 which is `classes/n5-engineering-assignment-prep.html`
(kept at that pre-existing URL — it is also linked from the hub's resources row). All asset/menu
links are absolute; never add topic pages to the nav drawer. Each page follows the Engineering
Science convention: `<main class="container">`, links `/assets/css/engineering-science.css` +
`/assets/js/widget-kit.js`, orange `--eng-*` tokens, and **`energy-and-efficiency.html` is the
canonical template** to copy (concept-block `section.sec` panels with a collapse toggle, a mode-chooser
bar, sticky sub-nav, a `#recap` one-screen summary, an `#answers` section of `details.reveal` booklet
answer keys, and a `#check` section = MC quiz + RAG self-check from the booklet success criteria).
Per-page `localStorage` prefix is unique (`n5e2-`, `n5m5-`, `n5e3-`, `n5p6-`, `n5s7-`, `n5c4-`,
`n5a8-`, …). Equation/`<var>`/`.frac` and UK-SVG-symbol rules are the same as the Higher/Electronics
topic guides.

**Revised template conventions (August 2026 — from the Energy & Efficiency audit; topics 3–8 still
need retrofitting):**
- **Exam-style practice sits with the concept it tests**, as a `.practice` block (`.practice-tag` +
  `.page-ref` booklet reference) at the foot of its `section.sec`, each question a `.stem` with a
  `.marks` pill and its own `details.reveal` answer. `#answers` holds **booklet answer keys only**.
- **Past-paper references are visible text, never a `title=` tooltip** — there is no hover on an
  iPad. Use `.exam-ref` under the section's `.keypoint`, with each reference in its own `<b>`.
- **Past-paper references come from the SQA question bank** (site-wide rule: "Past-paper items — the SQA question bank"; the private `Qualifications-and-code`
  repo, through the Mac's `past-paper-evidence` skill; not the site's own question-bank page).
  Take the year, question and marks from its rows, using `Current = yes` items only. The bank's CSVs and
  crops are never committed or published here. Only the reference text goes on a page, and any SQA
  crop is credited at the point of use (`data-credit-note`) with the row's `Credit` text (30 Oct 2026).
- **Data-booklet notation leads**: `g = 9.8 ms⁻²`, `c = 4180 J kg⁻¹K⁻¹`, glossed once with the
  familiar form. The booklet gives efficiency as a **ratio only** — say where the `× 100` is lost.
- **Accent orange is a background, not small text.** `--eng-ink-accent` (light `#9a5410`, dark
  `#f5c97a`) is the AA-safe text accent; `--eng-orange` on text is ~3.4:1 and fails.
- **One colour grammar for energy**: useful `#15803d` green, wasted `#b91c1c` red, in both the SVG
  block diagrams and the live sim bars.
- A `#recap` section (relationships as `.eq-card`s, a `.warn` list of what loses marks, a unit-
  conversion `.tbl`) and a "Where this comes up next" `.resource-grid` close the page.

**Status (all 8 topics live).** Built on branch **`n5-engineering-pages`** (July 2026): topics 3–8
were authored from the source booklets, each with a flagship live widget (gear-train, Ohm's-law &
voltage-divider, cylinder-force, beam-reactions, gate-playground) plus match/builder challenges wired
to the progress engine, and NoStrainSim/NoPressureSim `.simcard` task cards where the booklet has
▶ simulate-it tasks. The pages left beta on 14 Oct 2026 and every `.beta-note` banner (and Higher's
`.wip-notice`) came off together, with their CSS; don't add a new one. The booklet-PDF
buttons on topics 3/5/6/7 are `cta soon` placeholders until the PDFs land in
`assets/engineering-science/national-5/<nn-topic>/`. **The build spec for these pages is
`n5-engineering-pages-outline.md`** (repo root, git-excluded); its §8 is the phased build order.
**Unit 1 Question Bank** (`classes/n5-engineering/unit-1-question-bank.html`, linked from the hub's
`#unit1` card): a 236-question random MCQ generator covering Topics 1–2, one question at a time with
immediate right/wrong marking. It is **generated**, not hand-edited — the source bank and build script
live in `tools/generators/mcq-bank/` (`bank_src.md` + `build_all.py`, which writes this page). Edit the source and re-run the script; do not edit the page's embedded JSON.
localStorage prefix `n5q1-`. No progress badge is wired to it.

A sibling **`s3-engineering-pages-outline.md`** specs the S3 Engineering pages — that job is **not yet
started**.

