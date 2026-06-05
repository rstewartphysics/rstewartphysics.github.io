# Electricity 1 — Page Improvement Suggestions

Review of `classes/s3-physics/electricity1.html` against its source materials:

- **Booklet:** `RS Electricity B1 N5 2025.pdf` (success criteria L1–L6, 12 pages of tasks)
- **Test prep:** `Electricity Block 1 Practice Test.pdf` (Practice Papers 1–2, Challenge Papers 1–2, all with full marking answers)
- **Sibling reference:** `electricity-2.html` + `electricity-2-tools.html` (the newer, more developed pattern)

The page must serve **two audiences**:

1. **Revisers** — pupils who attended class and want to consolidate before the test.
2. **Learners** — pupils who missed the class and must learn the material from scratch.

The current page is built almost entirely for audience 1. It is a *revision summary*, not a *teaching resource*. The biggest single weakness is that **it does not actually teach any of the booklet content** — a pupil who missed class cannot learn circuit symbols, multimeter use, colour coding, V–I graphs, temperature effects, or combination circuits from this page. It also does **not** include the booklet answers or the test answers, both of which the brief requires.

---

## Priority summary

| # | Area | Why it matters | Effort |
|---|------|----------------|--------|
| **P1** | Teach the L1–L6 content (currently absent) | Without it the "learner" use case fails entirely | High |
| **P2** | Add booklet model answers (every task has a blank to fill) | Brief: "effectively include answers to the booklet" | Medium |
| **P3** | Add a self-marking test-prep quiz built from the 4 practice papers | Brief: "prep for the test" | Medium |
| **P4** | Fix the dead/orphaned interactive code already in the file | 3 quiz functions exist but nothing calls them — wasted, broken intent | Low |
| **P5** | Add the missing engagement pieces: symbol drag-and-drop, chunked videos, saveable self-check | Engagement + reduces overload | Medium |
| **P6** | Move heavy interactives into `electricity1-tools.html` | Avoid cognitive overload; matches `electricity-2` pattern | Low |
| **P7** | Bring the page up to the `CLAUDE.md` template (a11y, skip link, banner) | Consistency + accessibility | Low |

---

## P1 — Actually teach the content (the critical gap)

A pupil who missed the lesson opens this page and finds definitions and a summary grid, but **no instruction**. Add a teaching section per success-criteria level, each as its own collapsible `details.block` so nothing is forced on screen at once (good chunking). Structure each level the same way so it is predictable:

> **Learn it → See it → Try it → Check it**

### L1 — Circuit symbols *(currently: nothing on the page)*

- The booklet asks pupils to draw 10 symbols (cell, battery, lamp, switch, voltmeter, ammeter, motor, microphone, loudspeaker, photovoltaic cell). **The page shows none of them.**
- Add a **labelled symbol gallery** — one small SVG/PNG per component with its name and one-line function (SQA wording from booklet p.2). SVG is preferred (crisp on iPad, dark-mode friendly via `currentColor`, tiny file size).
- Follow with the **drag-and-drop symbol-matching game** (see P5) as the "Try it" step.

### L2 — Current & voltage *(page has definitions only)*

- Keep the definitions, but add the **SQA fill-in answers** the booklet leaves blank:
  - Voltage = "Energy supplied to each coulomb of **charge** passing through the supply."
  - Current = "The amount of **charge** passing a point every second."
- Add a **multimeter explainer**: an annotated multimeter image showing which port (COM, V/Ω, 10A) and which dial position to select for (a) cell voltage 1.5 V, (b) current 0.3 A, (c) 12 V DC. This is booklet L2 Task 2 and L3 Task 4 — currently untaught and a common test banker.
- Add the completed **series vs parallel rules table** (booklet L2 Task 2):

  |  | Series | Parallel |
  |--|--------|----------|
  | Current | Same everywhere | Splits between branches, then rejoins |
  | Voltage | Splits between components | Same across every branch |

### L3 — Measuring resistance *(page has a colour calculator but no teaching)*

- Define resistance with the booklet's blank filled: "A measure of how **difficult** it is for charge to flow through a material."
- Resistor + variable resistor symbols and functions.
- **Teach the colour code** before offering the calculator: a short worked example ("Orange-Orange-Brown = 3, 3, ×10 = 330 Ω") then the existing calculator as practice. Right now the calculator assumes knowledge the page never gives.

### L4 — Ohm's Law *(page mentions V=IR; never shows a worked solution)*

- Worked examples for the three rearrangements, using the booklet's own numbers (L4 Task 2) so revisers recognise them:
  - V from I and R: 0.2 A × 33 Ω = **6.6 V**
  - I from V and R: 230 V ÷ 5 Ω = **46 A**
  - R from V and I: 8 V ÷ 0.002 A = **4000 Ω (4 kΩ)** — *note the mA→A conversion; this is the trap.*
- **V–I graphs** (a named success criterion, entirely absent): show two sketches side by side — straight line through origin (ohmic / fixed resistor) vs upward-curving line (filament lamp). State "gradient is steeper ⇒ higher resistance" and "gradient = R".
- **Temperature & resistance** (two success criteria, absent): wire/conductor hotter ⇒ resistance **up**; thermistor hotter ⇒ resistance **down**. One sentence each plus the "why" (charge-carrier vibration vs more carriers) — this is tested directly in Practice Paper 1 Q9 and Challenge papers.

### L5 / L6 — Combining resistors *(page states the rules; never demonstrates the method)*

- Series: R_T = R₁ + R₂ + … (worked: 10 + 20 = 30 Ω).
- Parallel, equal values: R_T = R₁ ÷ (no. of branches) — the quick method most miss.
- Parallel, different values: reciprocal method, worked with the **booklet's own combination example** (1 kΩ ∥ 1.5 kΩ = 600 Ω, then + 2.2 kΩ = 2.8 kΩ). This worked example exists in the booklet (p.10) but not on the page — porting it is high-value.
- A "**which method do I use?**" mini decision aid (series? same-value parallel? different-value parallel?) prevents the most common method error.

---

## P2 — Include the booklet answers

The brief says the page should "effectively include answers to the booklet." Every booklet task is a blank for the pupil to fill, and there is currently **no answer key anywhere**. Add a collapsible **"Booklet answers (check your work)"** section, ideally with each answer behind its own `<details>` so pupils attempt first and reveal second (supports retrieval practice, avoids hand-feeding). Cover at minimum:

- L1 symbol table (the 10 symbols + functions).
- L2 definitions + series/parallel rules table.
- L3 resistance definition, and the **colour-code table** (Orange-Orange-Brown-Silver = 330 Ω ±10%, etc.) — the calculator can verify these but the worked values should be listed.
- L4 the three Ohm's-law calculations above, plus the V–I / temperature question answers.
- L5/L6 series and parallel prediction rules + the combination worked example, and answers to the four "Task 2" combination circuits on booklet p.11.

A reveal-on-click pattern is more engaging and lower-overload than a wall of answers.

---

## P3 — Self-marking test-prep quiz

The "Practice Questions" section currently only *lists* which past-paper questions to attempt (good signposting, but it sends pupils away to PDFs and gives no feedback). The supplied **Practice Test PDF already contains four complete papers with full marking instructions** — use them.

- Build an on-page **self-marking quiz** from the Practice Paper 1 & 2 MCQs (10 ready-made questions with answers: P1 = 1C 2D 3B 4B 5A, P2 = 1B 2D 3B 4B 5C). Instant right/wrong feedback with a one-line explanation drives engagement far more than a PDF link.
- For the structured questions, use a **reveal-the-marking-scheme** pattern: show the question, an answer box, then a "Show mark scheme" toggle with the worked solution from the PDF (e.g. P1 Q6: 30 Ω; I = 9/30 = 0.30 A).
- Keep the **Challenge papers** in a separate "Stretch" collapsible so they don't intimidate or overload pupils still securing the basics — clear difficulty signalling.
- Keep the existing PPQ signpost lists, but frame them as "next steps once you've passed the on-page quiz."

---

## P4 — Fix what's already broken in the file

`electricity1.html` contains three JavaScript functions — `mt_feedback1`, `mt_feedback2`, `mt_feedback3` (lines ~660–696) — that reference elements `mt1`/`mt2`/`mt3`. **Nothing in the HTML ever calls them, and those elements don't exist.** Someone intended three mini-tasks ("Is current the same in series?", "What unit is current?", "Which formula finds I?") and never wired up the markup.

- Either build the three mini-tasks (quick win — the logic is already written) or delete the dead code. Leaving orphaned handlers is a maintenance trap.
- Recommendation: **build them** — they're exactly the lightweight, low-overload retrieval checks the brief asks for, and they're 90% done.

---

## P5 — Engagement pieces

The brief explicitly asks for interactive simulations, drag-and-drop, and quizzes, applied without cognitive overload.

- **Drag-and-drop symbol matching (L1):** match the 10 circuit symbols to their names/functions. This is the single best engagement win — L1 is pure recall and perfectly suited to drag-and-drop. Touch-friendly is essential (audience is on iPads): use Pointer Events, not mouse-only, with large 48px+ targets per `CLAUDE.md`.
- **Chunk and label the videos:** there are 7 unlabelled embedded videos in one grid — that's a load-time and choice-overload hit. Give each a visible title (Ohm's Law, non-ohmic conductor, series, parallel, resistance calcs, worked example, colour bands) and group them under the matching L1–L6 teaching section ("watch only what you need", as `electricity-2.html` already does). Lazy-loading is already set — good.
- **Saveable self-check:** the current L1–L6 checklist is static (CSS `☐` bullets, nothing is recorded). Replace with the **Green / Amber / Red self-rating saved to the device** (`localStorage`) exactly as `electricity-2.html` does. Lets revisers track readiness across sessions and instantly see what to study.
- **V=IR generator:** keep it (it's good), but move it next to the L4 teaching so practice follows instruction, and add a "show working" line on check, not just the final answer.

---

## P6 — Split heavy interactives into a tools page

`electricity-2` already established the pattern: a lean revision page plus `electricity-2-tools.html` for the heavyweight interactives. The PhET Circuit Construction Kit iframe in particular is large and slow on iPads and dominates the page.

- Create **`electricity1-tools.html`** and move into it: the PhET simulation, the resistor colour calculator, the V=IR generator, and the new drag-and-drop game.
- Replace them on the main page with a single clear **"⚙️ Interactive Tools"** card linking across (matching the existing back-link styling). This keeps the revision page fast and low-overload while still one tap from the tools.
- Keep the iframe `loading="lazy"` and consider a "tap to load simulation" placeholder so the PhET frame only loads on demand.

---

## P7 — Template / accessibility alignment

`electricity1.html` predates the current `CLAUDE.md` template and is missing several required items:

- **Skip link** (`<a class="skip-link" href="#mainContent">`) and **`id="mainContent"`** on `<main>` — both absent.
- **`<meta name="theme-color">`** and a single **`<meta name="color-scheme">`** — the page declares `light dark`; the template standard for Physics is `light` with theme colour `#eaf7fa` (or keep `light dark` deliberately since this page now has a real dark-mode variable system — fine, but set a `theme-color` for both schemes).
- **`aria-label`s** on the interactive widgets and a **`.visually-hidden`** page `<h1>` inside `<main>` (the banner `<h1>` is overlaid on an image).
- The `prefers-reduced-motion` block is present (good) but the banner `fadeIn` animation should be covered by it.
- Banner uses `max-height: 360px`; template uses `clamp(220px, 32vh, 420px)` — minor, align if convenient.
- Confirm the `{% include site-menu.html %}` drawer marks this page current (`markCurrentPage()` needs the nav to contain the S3 Physics path).

None of these block the page, but they're quick and bring it in line with every other page.

---

## Suggested final page order (chunked, low-overload)

1. Intro / "how to use this page" (1 line for revisers, 1 line for learners) + booklet download.
2. **What the test covers** (no spoilers) — keep.
3. **Learn the topic** — six collapsibles L1→L6, each *Learn → See → Try → Check* (P1).
4. **Booklet answers** — reveal-on-click (P2).
5. **Practice the test** — self-marking quiz + mark-scheme reveals; Challenge papers in a "Stretch" sub-panel (P3).
6. **Track your progress** — G/A/R self-check saved on device (P5).
7. **Videos** — distributed into the L1–L6 sections, or one labelled, chunked panel.
8. **Tools** — single link card to `electricity1-tools.html` (P6).
9. **AI tutor** + useful links — keep.

This keeps everything one tap from collapsed, teaches first/tests second, and gives both audiences a clear path: learners go top-to-bottom; revisers jump to the self-check and quiz.
