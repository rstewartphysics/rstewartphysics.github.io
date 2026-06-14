# Build plan — N5 Engineering Science Topic 1: Engineering Contexts & Systems

**Proposed file:** `classes/n5-engineering/engineering-contexts-and-systems.html` (new `n5-engineering/` folder, mirroring `classes/s3-engineering/`)
**Sources reviewed:**
- `classes/n5-engineering-science.html` — N5 hub (Topic 1 booklet + PPT already linked under a `<details>`)
- `assets/engineering-science/national-5/EngineeringScienceCourseSpecN5.pdf` — spec pp.3–4 (course content + assessed skills table) and pp.16–18 (support notes for *Engineering contexts and challenges*)
- `…/01-engineering-contexts-and-systems/N5EngSci 1 - Contexts and Systems FINAL.pdf` — 26-page booklet, **primary source** (5 sections + knowledge organiser + common mistakes)
- `…/BHS N5 EngSci 1 - Contexts and Systems PPT.pdf` — 134 slides; confirms lesson sequence, the **what + why answer structure**, the checkpoint question sets, and the canonical block-diagram layouts (slides 70, 82, 96, 107)
- `CLAUDE.md`, `higher-topic-page-guide.md`, `higher-current-pd-power-resistance-improvements.md`, `what-is-an-engineer-improvements.md`
- `classes/higher/electricity/current-pd-power-resistance.html` and `classes/s3-engineering/what-is-an-engineer.html` — inspiration pages

---

## 1. What this page is for (three jobs, copied from the S3 page's proven model)

1. **Revise the topic** — learn sections, quiz, RAG self-check before an assessment.
2. **Check my booklet / I missed a lesson** — answer scheme keyed to booklet page numbers.
3. **Exam practice** — N5 differs from S3 here: this is a certificated course with a question paper, so the third mode points at SQA-style practice (command-word questions with reveal answers) and the existing Past Paper Finder rather than a case study.

The S3 page's three-mode chooser sits directly under the hero and is the single biggest cognitive-load reducer for pupils on iPads — reuse it with the modes above.

## 2. Why this topic page looks different from the Higher Physics page

Topic 1 is **entirely qualitative** — no relationships, no calculations (those start in Topic 2, Energy & Efficiency). So from `higher-topic-page-guide.md` I take the *skeleton* (sticky/jump sub-nav → numbered concept blocks → one Check section with quiz + RAG; one practice callout per concept; SQA command words; inline themeable SVG diagrams; pre-commit checklist) but **not** the equation cards, `.calc` grid, fraction component, or "numbers in first" examples — there is nothing to calculate. The "worked example" equivalent here is a **modelled what + why answer** (PPT slide 34: *What — say what the impact is. Why — say why it matters or how it happens*), shown as a labelled two-line answer frame.

From the S3 Engineering page I take the *interaction patterns* (collapsible section panels with progress counter, tap-to-sort sorter, tap-to-place order tiles, booklet-answers reveals keyed to page numbers, persisted RAG tracker, mode chooser) — because the audience, subject palette, and "mirror the booklet" job are the same. The `what-is-an-engineer-improvements.md` guardrails (tap fallback for every drag, unique localStorage prefix, no `alert()`, aria-live feedback, dark-mode override for every bespoke component) all carry over.

## 3. Chrome, palette, navigation, banner

- **Stylesheet:** link `/assets/css/engineering-science.css?v=eng-20260501` + `site-menu.css`/`site-menu.js`, per CLAUDE.md. Graphite + orange identity; dark mode comes free from the shared sheet. Page-specific widget CSS stays inline, and — lesson from the S3 improvements file — **every bespoke inline component gets a matching `@media (prefers-color-scheme: dark)` override**, preferably by building on `--eng-*` tokens instead of new literals.
- **Layout:** `<main class="container">`, `<img class="banner" src="/assets/Engeneringbanner.png">` (no banner-wrap/overlay — the Engineering Science variant). Hero panel (`.intro`-style) carries the eyebrow "National 5 Engineering Science · Topic 1", title, one-paragraph descriptor, and two CTAs: *Open the booklet PDF* and *Go to self-check*.
- **Drawer:** unchanged — CLAUDE.md forbids topic pages in the global nav. Publishing = editing the N5 hub's Topic 1 `<details>`: add a `card-featured`-style resource card / CTA "Topic 1 revision page" alongside the existing booklet + slides cards.
- **Jump nav:** S3-style in-page jump nav (not the Higher sticky subnav — the eng shared sheet has no subnav component and the S3 pattern with "X of N sections explored" counter already works on this palette): `Section 1 · Section 2 · Section 3 · Section 4 · Section 5 · Booklet answers · Key ideas · Quiz · Self-check`.
- **localStorage prefix:** `n5ecs-` (new, unique — never reuse `wie-` or `e1gar-` keys).

## 4. Page structure — mapped to the booklet and spec

Five learn sections matching the booklet's five sections exactly (same numbering, so the page doubles as the booklet's companion). Each is a collapsible panel (S3 pattern) containing: short notes → diagram/table → one interactive → a **Practice callout** using the booklet's own practice questions with reveal answers.

### Section 1 — Engineering and engineers *(booklet pp.4–7)*
- What engineering is; the seven **engineering actions** (research, design, simulate, implement, test, control, evaluate) as a compact term table.
- The seven **branches** (civil, structural, mechanical, electrical, electronic, chemical, environmental) as a card grid — note: N5 has **seven** branches, not the S3 page's four; and the booklet's *Electrical or Electronic?* contrast table gets its own mini-card because the booklet's Common Mistakes list names it as the #1 confusion.
- Engineers working together: the booklet's two worked tables (automatic school door; flood defence scheme) as static "modelled example" cards.
- **Interactive:** tap-to-sort "Match the engineer" (booklet p.5 task: 6 jobs → branch), reusing the S3 sorter widget pattern.
- **Practice 1:** booklet p.7 questions 1–6 with reveal answers.
- Spec link: *Engineering roles and disciplines* row of the assessed-skills table (spec p.4).

### Section 2 — Engineering contexts and impacts *(booklet pp.8–10)*
- Context → problem/need → solution structure (booklet's three examples table).
- Social / economic / environmental impacts, **positive and negative**, with the booklet's example table.
- **The what + why answer frame** (PPT slide 34) presented as a highlighted "How to answer" box with one modelled answer — this is the topic's core exam skill and the booklet's Common Mistakes flag it ("forgetting the what + why structure on explain questions").
- **Interactive:** 3-column impact sorter (social/economic/environmental), S3 sorter reuse with booklet-matched items.
- **Practice 2:** booklet p.10 questions 1–7 with reveal answers (model answers in what + why shape, labelled "Example of a strong answer" where open).

### Section 3 — Sustainability and emerging technologies *(booklet pp.11–13)*
- Engineering vs climate change; what makes a solution sustainable; emerging technologies with advantages/disadvantages.
- The **emerging-technology research task (booklet p.12) is open research — scaffold it, don't answer it** (same hard rule as the S3 page's Duns Park case study): provide the six prompts, sentence starters, and a "reliable sources" note; explicitly excluded from the answer scheme.
- **Practice 3:** booklet p.13 questions 1–8 with reveal answers.
- Spec link: *Impacts of engineering* row — climate change + emerging technologies are explicitly assessed.

### Section 4 — The systems approach *(booklet pp.14–17)*
- System / input / process / output / sub-system / system boundary term table.
- **SVG diagram 1:** universal system diagram `INPUT → PROCESS → OUTPUT` (PPT slide 70 layout).
- **SVG diagram 2:** automatic door sub-system diagram `SENSOR → CONTROL → MOTOR → DOOR` with a one-line function under each block (PPT slide 82) — this is also booklet practice Q8, so the diagram doubles as its answer.
- Real-world input vs **input device** vs output device vs real-world output distinction (booklet practice Q9–10 and a Common Mistakes item).
- **Interactive:** "Build the system" tap-to-place order tiles (adapting the S3 system sim): pupil places blocks for e.g. a fan system (temperature rise → sensor → control → motor → air movement). Tap-first, drag optional.
- **Practice 4:** booklet p.17 questions 1–10 with reveal answers; the two "draw a diagram" answers shown as SVG reveals.
- Spec link: *The systems approach* row — "systems and sub-system diagrams; function in terms of input—process—output and feedback loops; interaction of sub-systems".

### Section 5 — Control systems *(booklet pp.18–24)*
The longest booklet section, so it gets sub-headed chunks:
- What control is; the full term table (control system, manual/automatic, set value, actual value, feedback, error, error detector).
- Manual vs automatic — **interactive:** 2-column quick-sort (booklet p.19 task items).
- **Open-loop**: definition + **SVG diagram 3** `INPUT → CONTROL SYSTEM → OUTPUT DEVICE → OUTPUT` (PPT slide 96).
- **Feedback and closed-loop**: central-heating walkthrough (set value 20 °C / actual 16 °C / error 4 °C / control action) + **SVG diagram 4**: closed-loop diagram with labelled feedback arrow `SET VALUE → ERROR DETECTOR → CONTROL → HEATER → ROOM TEMP`, sensor on the feedback path (PPT slide 107) — this is booklet practice Q10's required answer, drawn exactly the way the PPT teaches it.
- Open-loop vs closed-loop contrast table (from the knowledge organiser p.26).
- **Interactive (the page's flagship):** "Build the closed-loop diagram" — six labelled tiles (set value, error detector, control, heater, room temperature, sensor/feedback) placed into an SVG skeleton, tap-to-place with check + aria-live feedback. Directly rehearses the assessment-critical drawing skill (PPT checkpoint slide 114 spells out exactly these six labels).
- **Practice 5:** booklet p.24 questions 1–10 with reveal answers.
- Spec link: *open- and closed-loop control* — explicitly in the question-paper/assignment sampling table.

### Check & reference sections (after the five learn sections)
- **Booklet answers** (`#booklet-answers`): the S3 page's highest-value pattern — one collapsible panel of nested `details` reveals **keyed to booklet page numbers**, covering every fixed-answer booklet task (the five practice sets are already inside their sections; this panel covers the in-section *tasks*: identify-the-context p.8, identify-impacts p.9, climate-change p.11, make-it-sustainable p.11, input/output devices p.15, describe-the-system p.15, sub-system diagram p.16, what-is-controlled p.19, manual-or-automatic p.19, open-loop table p.20, feedback table p.21, error detection p.22, control diagrams p.23). Open-ended tasks get "Example of a strong answer — yours can be different, check it has what + why". The p.12 research task is excluded with a pointer to the Section 3 scaffold.
- **Key ideas at a glance** (`#knowledge-organiser`): booklet p.25 knowledge organiser verbatim (18 key definitions), the branches quick-reference, the open-vs-closed table, and the **Common Mistakes** list (booklet p.26) styled as a warning card — pupils sit this content the night before a test; keep it printable (reuse the S3 page's print-KO-only pattern if cheap, otherwise skip — see open questions).
- **Quiz** (`#quiz`): ~10 MCQs sampling all five sections, weighted toward the assessed skills (1 branches, 1 electrical-vs-electronic, 2 impacts incl. one "which impact type is this?", 1 sustainability/emerging tech, 2 systems (input device vs input; sub-system interaction), 3 control (manual/auto, open vs closed, identify the feedback)). Tap options, mark with **glyph + text, not colour alone** (carrying the U-P1 colour-only lesson from the Higher improvements file).
- **RAG self-check** (`#self-check`): the booklet's success criteria **verbatim** (pp.2–3). There are 28 across 5 groups — present them grouped under the five section headings with R/A/G buttons (≥44 px), persisted to `localStorage` (`n5ecs-rag-…`), with a summary line suggesting which section to revisit. The S3 improvements file's "mirror the booklet's exact criteria" rule applies here from day one.

## 5. Reused vs new components — summary

| Component | Source | Adaptation |
|---|---|---|
| Three-mode chooser | S3 page | Modes: Revise / Check my booklet / Exam practice |
| Jump nav + "explored" counter | S3 page | 9 targets; counter count updated |
| Collapsible section panels | S3 page | Five sections, all collapsed except hero/revision-focus |
| Tap-to-sort sorter | S3 page | ×3: match-the-engineer (6→7 branches), impact sorter (3 cols), manual-vs-auto (2 cols) |
| Order-tiles / build-a-diagram sim | S3 page | ×2: input→process→output builder; closed-loop diagram builder (new SVG-skeleton variant) |
| Booklet answers reveals w/ page refs | S3 page | Keyed to this booklet's pages 4–24 |
| RAG tracker w/ localStorage | S3 page | 28 booklet criteria, grouped; `n5ecs-` prefix |
| Concept→practice→check skeleton, practice callouts, SQA command words, MC quiz in Check | Higher guide | Practice = booklet questions verbatim; no `.calc`/equation cards (no maths in this topic) |
| Inline themeable SVG diagrams | Higher guide | 4 block diagrams (system, sub-system, open-loop, closed-loop) — `var(--eng-text)`/`var(--eng-surface)` strokes, `role="img"` + titles |
| What + why answer frame | PPT slide 34 / S3 page | Highlighted how-to-answer box + model-answer tags on every open reveal |
| Common Mistakes warning card | Booklet p.26 | New, simple styled list |

## 6. Guardrails (inherited, all apply)

- iPad-first: every drag has tap fallback; tap targets ≥44–48 px; no hover-only; no `alert()` — inline `aria-live="polite"` messages.
- A11y: skip link, `id="mainContent"`, ≥3 px focus rings, `prefers-reduced-motion`, quiz marking never colour-only, all reveals are keyboard-operable `<summary>`s.
- Orange/graphite identity only; any new colour via `--eng-*` tokens; bespoke inline styles get dark-mode overrides.
- No parallax / fixed backgrounds / blueprint patterns; `overflow-x` contained; `env(safe-area-inset-*)` on anything sticky.
- British spelling, N5 reading level, short sentences; booklet wording verbatim for definitions; no teacher-only notes.
- Liquid safety: no `{{`/`{%` in inline CSS/JS.
- Pre-commit checks from the Higher guide: tag balance, JS brace balance, all JS-referenced IDs exist.

## 7. Open questions / assumptions to confirm before building

1. **File location** — I've assumed `classes/n5-engineering/engineering-contexts-and-systems.html` (new folder, mirroring `s3-engineering/`). Alternative: flat `classes/n5-engineering-contexts-and-systems.html` next to the existing assignment-prep page. Confirm preferred path before I create the folder.
2. **Hub link style** — add the topic page as a third `resource-card` inside the Topic 1 `<details>` on the N5 hub, or as a more prominent orange `.cta` row? I've assumed resource card + making it the first item.
3. **Third mode** — I've replaced the S3 page's "case study help" mode with "Exam practice" (linking the practice callouts + Past Paper Finder). If you'd rather keep a research-scaffold mode centred on the p.12 emerging-technology task, say so.
4. **RAG size** — all 28 booklet success criteria verbatim (faithful but long), or condensed to ~10 with the booklet numbering noted? I've planned **verbatim, grouped by section** per the S3 improvements rule.
5. **Print path** — is the printable knowledge-organiser feature (from the S3 page) wanted here too? Cheap to include; assumed **yes** for the Key Ideas section only.
6. **Past-paper tie-in** — the shared Past Paper Finder PDF covers this topic; I've assumed a simple link-out in the Exam practice mode rather than embedding any past-paper questions (copyright + maintenance).
7. **Booklet answer policy** — assumed the same rule as the S3 page: every fixed-answer task gets a real answer; open tasks get a labelled model; the p.12 research task gets scaffolding only. Flag if any other task should be excluded from the scheme.
