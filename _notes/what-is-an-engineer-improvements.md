# Suggested improvements — *What is an Engineer?* (S3 Engineering Science)

**Page:** `classes/s3-engineering/what-is-an-engineer.html`
**Reference exemplar:** `classes/s3-physics/electricity1.html`
**Source booklet:** `assets/engineering-science/s3/what-is-an-engineer/S3-EngSci-1-What-is-an-Engineer.pdf` (16 pp)

---

## 1. The core problem to solve

The page must do **three jobs at once**, for three different students arriving in three different states of mind:

1. **Topic revision** — a student who *did* the lessons and wants to test/refresh before assessment.
2. **Case study prep & help** — a student working on the **Duns Park / Bluidy Burn** project who needs a method and scaffolding (not answers).
3. **Answer scheme + catch-up** — a student who *missed lessons* or wants to mark their own booklet. **The booklet's Case Study task (p.14) must be excluded from the answer scheme** — it is open-ended research the teacher assigns, so there is no single "right" answer to give away.

The current page is a strong, attractive **revision** resource but only partly serves jobs 2 and 3. The biggest single gap is that **it does not mirror the booklet** — `electricity1.html` has a dedicated "Booklet answers" section keyed to booklet pages; this page has nothing equivalent. Everything below flows from closing that gap while keeping the page light enough for S3 pupils on iPads.

---

## ⚠️ Guardrails — what NOT to break

Read this before changing anything. These are the things that are already correct and must survive every improvement. If a change would violate one of these, stop and reconsider.

### Content & curriculum
- **Never put Duns Park / case-study answers into the answer scheme.** The booklet Case Study (p.14) is the pupil's own research. Provide *method and prompts*, never a model "answer." This is the one hard rule from the brief.
- **Don't water down "what + why."** It is the spine of the topic (success criterion 8). Every model answer must keep the *what + why* shape.
- **Don't change the SQA-aligned content or definitions** of engineer types, system parts (input/process/output/feedback) or impact types (social/economic/environmental). Align *wording* to the booklet — don't invent new material.
- **Keep British spelling, S3 reading level and a calm tone.** Short sentences, lead with the answer. Do not raise the reading age.
- **No teacher-only notes, internal references, or extra school branding/logos** (per `CLAUDE.md`).

### Interactivity (iPad-critical)
- **Every drag interaction must keep its tap-to-place fallback.** Pupils are on iPads — never ship a drag-only widget. The quiz, system sim and impact sorter all currently support tap *and* drag; preserve both.
- **Don't break the existing widget logic** (quiz scoring, order-tile placement, sorter shake/return, sim congrats, RAG summary). Add new widgets alongside; don't refactor the working ones unless required.
- **Use a unique `wie-` `localStorage` prefix.** Do not reuse `electricity1`'s keys (`e1gar-…`) — keys must not collide across pages.
- **Keep the jump-nav auto-open behaviour** that opens the target `<details>` then smooth-scrolls, and the "X of 8 sections explored" progress counter (update the count if you add/remove panels).

### Accessibility (must stay compliant with `CLAUDE.md`)
- **Never remove focus outlines.** Keep `:focus-visible` rings ≥3px on all interactive elements.
- **Keep** the skip link, `id="mainContent"`, `aria-label`s, `aria-live` feedback regions, and `prefers-reduced-motion` block.
- **Maintain 44–48px tap targets** on any new buttons/reveals.
- **All collapsibles must stay keyboard-operable** `<summary>` elements; all new widgets must be reachable and announce results.

### Structure & platform
- **Keep `layout: none` and the inline-everything pattern.** No external JS frameworks, no build step. The only shared dependencies are `site-menu.css` / `site-menu.js` and `engineering-science.css`.
- **Don't break the site menu:** keep the `{% include site-menu.html %}`, the script/style links, the required IDs, and the orange `--page-accent` / `--menu-accent`.
- **Don't break asset links:** the PDF booklet, PPT-slides PDF, and Scottish Borders Council source URLs must keep working.
- **Stay mobile/overflow-safe:** `overflow-x:hidden`, `max-width:100%`, tables inside scroll wrappers, `env(safe-area-inset-*)` on fixed/sticky controls. Introduce no horizontal scroll.
- **Don't break the print feature** (`print-ko-only` knowledge-organiser print path).

### Visual identity
- **Orange stays the primary accent; graphite the base.** Don't drift to Physics teal or any other subject's palette. Teal/blue/green are *secondary semantic* colours for social/economic/environmental only.
- **Dark mode must keep working.** This page fixes dark-mode contrast in its own `@media (prefers-color-scheme: dark)` block because inline `:root` can't be overridden by the linked sheet — so **any new component needs a matching dark-mode override**. Don't regress contrast (recent commits specifically fixed this).
- **None of the `CLAUDE.md` banned effects:** no parallax, no `background-attachment:fixed`, no scroll-driven animation, no blueprint/grid/circuit-board background patterns.

---

## 2. Booklet → page coverage map

This is the most important diagnostic. Every booklet exercise with a definite answer should be checkable on the page; open-ended ones should get a *model* answer.

| Booklet page | Exercise | Has a fixed answer? | On the page now? | Action |
|---|---|---|---|---|
| p.1 | 8 success criteria (R/A/G) | n/a (self-rating) | Partially — RAG self-check uses 7 *different* Duns-Park questions | Mirror the booklet's **exact 8 success criteria** in the self-check |
| p.2 | Quick Match (4 jobs → engineer) | ✅ Yes | ❌ No | Add interactive match + reveal answer |
| p.3 | Sort the jobs (8 jobs → 4 columns) | ✅ Yes | ❌ No | Reuse the existing sorter widget |
| p.3 | Check understanding (4 sentence completions) | ✅ Yes | ❌ No | Add to booklet-answers reveal |
| p.4 | Systems intro + automatic doors example | model given | ✅ Yes (systems section + sim) | Keep; link explicitly to booklet p.4 |
| p.5 | Edinburgh Trams (modelled) | model given | ❌ Not shown | Surface as a worked example |
| p.5 | Queensferry Crossing table | open | ❌ No | Provide **example** answers (not "the" answer) |
| p.6 | SpaceX Rockets table + challenge | open | ❌ No | Provide example answers |
| p.7 | Quick starter — 6 × impact type | ✅ Yes | ❌ No | Add to reveal / interactive |
| p.8 | Quick Sort — 8 × social/economic/environmental | ✅ Yes | Partially (sorter uses Duns-Park items) | Add a booklet-matched sorter set |
| p.9 | Check understanding (4) + 3 sentence completions | mixed | ❌ No | Definitions = answers; completions = models |
| p.10 | Smartphones / Online gaming | open | ❌ No | Model answers |
| p.11 | Leisure centre / self-checkout | open | ❌ No | Model answers |
| p.12 | Wind farm + Practice summary (5) | mixed | Partially | Summary = answers; wind farm = model |
| p.13 | Final reflection checklist | self-rating | Partially | Fold into success-criteria self-check |
| **p.14** | **Case study research template** | **open (Duns Park)** | ✅ Yes (case-study section) | **Scaffold only — NOT in answer scheme** |
| p.15 | Knowledge Organiser | reference | ✅ Yes (KO table) | Align wording; add missing key terms |
| p.16 | What + Why, key words, End-of-Topic Self-Check (5) | mostly answers | Partially | Add key-word defs + self-check answers |

---

## 3. Content

### 3.1 Add a "Booklet answers" section (highest priority)
Mirror `electricity1.html`'s pattern exactly: one collapsible panel ("Check your booklet work") containing nested `details.reveal` blocks, **keyed to booklet page numbers**, so a pupil can try a task then reveal the answer.

- Cover every fixed-answer exercise from the map above.
- For **open-ended** tasks (Queensferry Crossing, SpaceX, smartphones, leisure centre, wind farm) label the reveal *"Example of a strong answer"* and add a line: *"Yours can be different — check it has **what + why**."* This avoids teaching pupils there is one correct answer while still helping catch-up.
- **Explicitly exclude the Case Study (p.14).** Add a small note in that part of the answer scheme: *"Your case study (Duns Park) is your own research — there's no answer sheet. Use the Case study help section instead."*

### 3.2 Re-frame the Duns Park section as case-study *help* (job 2)
The booklet's case study (p.14) is a 6-question research template. Right now the page presents Duns Park as "the main example." Re-frame it to **scaffold the pupil's own research** against those exact six prompts:

1. What is the project?
2. Why is it being built/developed?
3. What materials or technology are used?
4. Who is it designed to help?
5. What are the positive impacts?
6. What are the negative impacts?

Keep the existing source links (already present and good) and the "Big question." Add **sentence starters** and a "what makes a strong case-study answer" checklist — method, not answers.

### 3.3 Surface the booklet's named real examples
Success criterion 7 is *"I can use real examples."* The booklet teaches **Edinburgh Trams, Queensferry Crossing, SpaceX** (p.5–6) plus leisure centre / wind farm / smartphones. The page currently uses almost only Duns Park. Add a short "Real examples from class" card set so revision matches what was taught.

### 3.4 Fix curriculum/terminology mismatches
- Booklet says **"Chemical engineer"** (p.2, p.15). The page says *"Chemical / materials engineer"*. For an answer scheme, **match the booklet's wording** (mention materials as a sub-area) so it agrees with what pupils wrote.
- Knowledge Organiser is missing p.16 key words: **reliable, efficient, fit for purpose, impact**. Add them.
- The self-check should use the booklet's **8 success criteria verbatim** so the page doubles as the booklet's R/A/G tracker.

---

## 4. Cognitive load

The page is ~2,600 lines with six interactive widgets — rich, but at risk of overwhelming an S3 pupil on an iPad.

- **Add a 3-mode chooser at the top** (see §6). This is the single biggest load reducer: each pupil sees one clear path instead of scanning eight panels. Model it on electricity1's *"Two ways to use this page"* card, expanded to three.
- **Keep one idea per card.** A few cards (engineer types, impacts) pack *Works with / Example / Duns Park link / sentence starter* into one block. For S3, consider trimming to the essential line plus one example; move extra detail into a reveal.
- **Default state:** keep all section panels collapsed except a short intro (current behaviour is good). The *"X of 8 sections explored"* counter is motivating — keep it, but make sure the 3-mode chooser sits *above* it so the counter doesn't imply "you must open all 8."
- **Group widgets with their content, not in a pile.** The system sim (next to Systems) and impact sorter (next to Impacts) are well placed. Avoid stacking the 8-question quiz + sorter + sim in one mega-section.
- **Reading level:** booklet sentences are short and concrete; keep page copy at that level. Avoid sub-clauses; lead with the answer.
- **Progress persistence** (see §5) reduces re-work load across sessions.

---

## 5. Interactivity

Current interactivity is genuinely good (MCQ, drag/tap-order, match dropdowns, system sim, impact sorter, RAG). Improvements:

- **Persist state to `localStorage`** like electricity1's GAR tracker. The RAG self-check and quiz currently reset on reload; for revision across days, saving matters. Use a page-specific key prefix (e.g. `wie-…`).
- **Turn booklet exercises into self-checking widgets.** Two map directly onto existing code:
  - *Sort the jobs* (p.3) → existing `.wie-sorter` with 4 columns.
  - *Quick Sort impacts* (p.8) → existing 3-column sorter (add a booklet-matched item set).
  - *Quick Match* (p.2) → existing match-dropdown pattern from the quiz.
  This serves "interactive," "answer scheme," and "catch-up" simultaneously.
- **Add a "what + why" answer reveal** for the open tasks: pupil types/thinks, taps *Show a model answer*. Reinforces the core skill (success criteria 8).
- **Replace `alert()` in the impact sorter** ("Place all six…") with an inline `aria-live` message — `alert()` is jarring on iPad and weaker for accessibility.
- Keep the celebrate-on-complete feedback (sim congrats) — good motivation.

---

## 6. Information architecture / "three ways to use this page"

Add a mode chooser directly under the hero (three buttons/cards), each scrolling to the right entry point:

```
┌─────────────────────────────────────────────┐
│  How do you want to use this page?            │
│                                               │
│  📖 Revise the topic                          │
│     → Learn sections + quiz + self-check      │
│                                               │
│  🌊 Case study help (Duns Park)               │
│     → Method, prompts, sources                │
│                                               │
│  ✅ Check my booklet / I missed a lesson       │
│     → Booklet answers + learn sections        │
└─────────────────────────────────────────────┘
```

This makes the three jobs explicit and keeps each audience out of the others' way. The jump-nav already exists — the mode chooser sits above it as a friendlier, plain-language front door.

---

## 7. Style / visual consistency

- The page defines a bespoke `--wie-*` token set **and** links `engineering-science.css`. Per `CLAUDE.md`, Engineering Science pages should lean on the shared `--eng-*` system (graphite + **orange** identity, built-in dark mode). The bespoke tokens duplicate that and re-implement dark mode by hand (large `@media (prefers-color-scheme: dark)` block) — a maintenance risk.
  - Keep **orange as the primary accent**; the teal/blue/green card variants are fine as secondary semantic colours (social/economic/environmental) but should be derived consistently.
  - Where possible, map `--wie-*` onto `--eng-*` so dark mode comes "for free" from the shared sheet rather than being re-declared.
- **Banner:** page uses `clamp(150px,22vw,240px)`; the documented Engineering banner is `clamp(170px,24vh,300px)` with `border-radius:20px`. Align for consistency with sibling pages.
- Button radius/shadow/padding should track the shared `.cta` tokens so all Engineering pages feel like one site.

---

## 8. Accessibility (maintain CLAUDE.md requirements)

Mostly compliant (skip link, focus rings, tap targets, reduced-motion, drag **with** tap fallback — important for iPads). To tighten:

- Replace the sorter `alert()` with an inline `aria-live="polite"` status (also a UX win).
- Ensure every interactive widget announces results via `aria-live` (quiz and RAG already do; verify the new booklet widgets do too).
- Keep all new collapsibles keyboard-operable and `summary`-based like the existing ones.
- Maintain 44–48px tap targets on any new buttons (booklet-answer reveals, mode chooser).

---

## 9. Technical / maintainability

- Single 2,600-line file is consistent with the site's inline-everything pattern — acceptable, but the hand-rolled dark-mode block is the main bloat. Reducing it via §7 is the highest-value cleanup.
- Use a single page-scoped `localStorage` prefix and a small helper so all persistent widgets (RAG, quiz, booklet self-check) share one save/reset path.
- Keep the existing IIFE structure; add new widgets as small modules inside it.

---

## 10. Prioritised action list

**Must do (unlocks jobs 2 & 3):**
1. Add the **Booklet answers** section keyed to booklet pages — fixed answers + model answers for open tasks; **exclude the Case Study (p.14)**.
2. Re-frame **Duns Park** as case-study *help* scaffolded on the booklet's 6 research prompts.
3. Add the **3-mode chooser** at the top.
4. Align the **self-check to the booklet's 8 success criteria** and persist with `localStorage`.

**Should do (quality + engagement):**
5. Convert *Sort the jobs* (p.3) and *Quick Sort* (p.8) into interactive self-checking widgets; add a *Quick Match* (p.2).
6. Surface the booklet's **named real examples** (Trams, Queensferry, SpaceX).
7. Fix **"Chemical engineer"** wording; add missing key-word definitions (reliable / efficient / fit for purpose / impact).
8. Replace `alert()` with inline `aria-live`; persist quiz/RAG state.

**Nice to have (consistency):**
9. Map `--wie-*` onto the shared `--eng-*` tokens; drop the duplicated dark-mode block.
10. Align banner sizing and button tokens with the shared Engineering Science stylesheet.
```
