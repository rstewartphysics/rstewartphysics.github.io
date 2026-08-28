# Electricity 1 — Audit & Improvement Options

**Page:** `classes/s3-physics/electricity1.html`
**Audience (confirmed):** S3 pupils *and* N5 revision (dual-purpose)
**Date:** 2026-06-29
**Brief:** Reduce cognitive overload, fix collapsibles that stay open, demote
"fun-not-educational" interactives, refocus interactives on self-assessment, and
generally stop overwhelming an S3 (~14 yo) reader. Open to splitting the page.

> **DECISION (locked): Option B — split into a short page-set** (three lesson
> pages + one shared Practice page), layered with Option D's per-lesson discipline
> and the §3 per-widget cuts. See §4 (Option B) and §5 for the progress-engine
> work. All per-widget calls are settled in §3 (keep symbol game / cut colour game;
> keep PhET in Explore / cut custom sim; V–I explorer + formula triangle → Explore;
> combine kept in-flow lean; trim 30-sec checks on L1, L2, L4a; N5 markers on L4b /
> L6 / past papers). Only implementation work remains — see §7.

---

## ▶ Resume point (last touched 2026-06-30)

**Status:** 🎉 ALL PHASES DONE — Phase 0 ✅ · 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 5 ✅ · 6 ✅ ·
7 ✅. Implementation complete; **nothing committed** (branch `interactives-enrichment`),
awaiting review. No local Jekyll available, so render-testing (light/dark visual pass +
click-through) is the one thing left to do in a browser before/at review.

**Phase 6 result (S3 hub wiring + retire `elec1`):** `classes/s3-physics.html` Electricity 1
tile now `data-prog-badges="elec1a elec1b elec1c elec1-test"` (aggregates to 🎖 x/4). The
retired `elec1` TOPIC entry was **deleted** from `s3-physics.js` (accept-the-reset decision;
no `migrateFrom`). `ALL_IDS`/`ach-start`/ranks auto-adapt. Nav drawer untouched (no part
pages added). Verified: config well-formed (4 badges), **zero** stray un-suffixed `elec1`
references anywhere in `classes/` or `assets/js/`.

**Phase 7 result (full verification, read-only):** all 5 files exist; every part-page
stepper links all 4 siblings + the hub; both referenced PDFs exist; `widget-kit.js` linked
only on A/B/C (the pages with live-sim widgets), not hub/practice; each part page links both
engine scripts + calls its `markSeen`; **19 distinct tracked challenge ids** total (A 6 · B 8
· C 4 · P 1) — none lost vs. the original's tracked set minus the §3 cuts. ⚠ Jekyll build +
in-browser click-through still pending (no local Jekyll).

**Phase 5 result (`electricity1.html` → Electricity 1 HUB):** the original 2,865-line
page is rebuilt as a **123-line hub** (URL preserved, never 404s). Banner overlay kept
(topic title), short intro, booklet download, **four `.tile` part tiles** each with
`data-prog-badges` (`elec1a`/`elec1b`/`elec1c`/`elec1-test`) so the engine renders a
per-part 🎖 chip, the **Useful Links** panel, and the credits note. No lesson content /
widgets / challenges remain (all live in the four subfolder pages). Standard S3 page
(links `s3-physics.css`, includes menu+footer, overflow-fix head). Self-verified (4 tiles
→ correct part pages + badges, 0 leftover challenges, details 1/1, both includes).

**Phase 4 result (Practice · `electricity1/practice.html`, badge `elec1-test`):** built.
**1 tracked challenge:** `ch-quiz-main` (the 10-Q self-marking quiz). UX call: the quiz
is the page's whole purpose, so it's rendered in a **plain always-visible `section.quiz-host`,
not a `<details>`** — satisfies the "no `<details open>`" guardrail with good UX. N5 PPQ +
N5 past-paper indexes sit in a default-closed panel, **N5-tagged** with `.going-further`.
AI-tutor launch in its own default-closed panel. `markSeen("elec1-test")`. Badge added.
**Practice is now a live link in all of A/B/C steppers** (perl-swapped). Self-verified
(1 challenge, 0 `<details open>`, balance 2/2 details · 5/5 scripts, all 5 `elec1*` badges
registered).

**Phase 3 result (Part C · `electricity1/combining-resistors.html`, badge `elec1c`):**
built from L5–L6. **4 tracked challenges:** `ch-combine-target`, `ch-check-l5`,
`ch-order-combo`, `ch-check-l6`. Combine-resistors sim kept **in-flow (lean)** — hint
reframed around the under-4-Ω target task (sliders de-emphasised, JS unchanged). Order-
the-steps kept. L6 **N5-tagged** with `.going-further`. Kept the 🔥 Stretch-power reveal,
all exam-style Qs + booklet answers, See videos. Prefix `s3e1c-`; `markSeen("elec1c")`.
Badge added to `s3-physics.js`. C now a live link in Part A **and** Part B steppers.
Self-verified (4 challenges, balance 10/10 details · 8/8 scripts, no Practice content
leaked in).

**Phase 2 result (Part B · `electricity1/resistance-ohms-law.html`, badge `elec1b`):**
built from L3–L4. **8 tracked challenges** gate the badge: `ch-colour-reverse`,
`ch-check-l3`, `ch-fade`, `ch-error`, `ch-vir`, `ch-calc-ma`, `ch-predict-r`,
`ch-check-l4b`. **§0 finding 5 resolved:** the forward "Colour code → value" widget
(orig line 1074) has **no** `data-prog-challenge` — it's an untracked calculator; kept
as a free tool. **Cut:** colour-code game (`ch-tool-colour`) + 30-sec check L4a. **Demoted
to `Explore` AND untracked** (removed `data-prog-challenge` + award calls so they can't
gate the badge): formula triangle and V–I explorer (`ch-graph-live`). **N5-tagged** the
L4b panel with a `.going-further` marker. Prefix `s3e1b-`; `markSeen("elec1b")`. Badge
added to `s3-physics.js`. Part A stepper updated: B is now a live link. Self-verified
(8 challenges, demoted widgets carry no attr, balance 11/11 details · 10/10 scripts).

**Phase 1 result (Part A · `electricity1/circuits-symbols-meters.html`):** built from
L1–L2. Kept recall quiz (`ch-quiz-l1`), symbol-matching game (`ch-tool-symbol`),
place-meters (`ch-meter-place`), predict (`ch-predict-parallel`), what-if
(`ch-whatif`), cloze (`ch-cloze-meters`) = **6 challenges**. **Cut** the custom live
sim + 30-sec checks L1/L2. **PhET → Explore** (collapsed `details.explore`, off the
spine). Single-open/default-closed accordion (new toggle JS). Part stepper (A active;
B/C/Practice `.subnav-link.soon` inert spans, to be flipped live in their phases) +
"Electricity 1 hub" CTA + back-link → `electricity1.html`. GAR self-rate L1/L2 with
prefix `s3e1a-`. `markSeen("elec1a")`. Badge `elec1a` "Symbols & Meters"
(`unlock:"page"`) added to `s3-physics.js` (old `elec1` left in place until Phase 6).
Verified: tag balance, includes, challenge ids, badge/href/prefix all correct (no
local Jekyll to render-test — do a visual light/dark pass when convenient).

**Only remaining task (not a build phase):** a browser pass once a Jekyll preview is
available — light/dark visual check + click-through hub → each part → practice at mobile
width, confirm steppers/back-links work, the corner counter + per-tile 🎖 chips update, and
progress persists across pages. Then it's ready to commit (no commit has been made — ask first).

**Reusable JS already proven** (copy forward): `buildQuiz`, `buildGAR`/`setGarButtons`,
the `S3Beta`→`Progress` bridge, and the single-open accordion snippet. **Pattern for
demoted Explore widgets:** strip their `data-prog-challenge` + drop their Progress
`complete`/`miss` calls so they stay off the badge-gating spine (used for triangle + V–I).

**Open decision blocking Phase 6 only (not 1–5):** progress-key URL remap —
**(a)** accept the reset *(recommended, recent rollout)* vs **(b)** one-time remap
shim. *(Appendix A, finding 4.)* Pick before wiring the S3 hub.

**Deferred build-time check (Phase 2):** confirm the `data-prog-challenge` id on the
"Colour code → value" widget (≈line 1074 of the original).

---

## 1. What's actually on the page

A single **2,865-line** page. One scroll holds the entire block.

| Thing | Count |
|---|---|
| Collapsible panels (`.collapsible-panel`) | 11 |
| `<details>` elements total | 27 |
| Lessons (L1–L6), each a full *Learn → Try → See → Check* cycle | 6 |
| Interactive widgets (`.widget`) | 19 |
| Tracked challenges (`data-prog-challenge`) | 34 |
| Quizzes + "30-second checks" + self-rating bars | ~7 + 6 |

**Progress model:** the engine treats the whole page as **one badge** —
`elec1` "Circuit Starter" in `assets/js/progress/s3-physics.js`, unlocked by
finishing *every* challenge on the page (all 34). The S3 hub tile references it
via `data-prog-badges="elec1"`. This matters for any split (see §5).

So an S3 pupil arriving here meets **~30+ interactive touchpoints** plus N5-depth
material (resistor colour codes, two circuit simulators, past-paper indexes), all
on one URL. That is the overload.

---

## 2. Findings against the stated issues

### 2.1 Cognitive overload — confirmed, structural
Every lesson repeats a four-beat cycle: **Learn → Try (multiple widgets) → See
(worked examples) → Check (30-second check) → self-rate**. With six lessons that
is the same demanding pattern six times in one sitting. The page never signals
"you can stop here" — there is no core spine vs. optional depth.

### 2.2 "Too many collapsibles that stay open" — confirmed
- The panels are plain `<details>` with **no single-open (accordion) behaviour** —
  open one and the previous stays open, so a pupil quickly has several 400-line
  lessons expanded at once, each with its own scroll of widgets.
- Inside lessons there are **nested** `<details>` (`.reveal` mark schemes,
  "check your booklet" answers) — disclosure inside disclosure.
- The final practice quiz is `<details open>` (line 1711) — it's expanded on load,
  adding to first-paint density.

### 2.3 "Some interactives are fun more than educational" — confirmed
Several widgets are **exploratory toys or duplicates**, not self-assessment:
- **Two circuit simulators** doing nearly the same job — the custom `⚡ Live
  circuit` (`#circuitSim`) *and* the `🔧 PhET Circuit builder` embed.
- **Two "game" framings** that duplicate adjacent self-checks — `🧩 Symbol-matching
  game` (duplicates the L1 recall quiz) and `🎨 Resistor colour-code game`
  (duplicates the two colour-code self-checks beside it).
- A **formula triangle** tool (`ch-triangle`) — a memory crutch that SQA marking
  rewards *rearranging*, not triangles; it's a learning aid, not assessment.

### 2.4 "Interactives should mainly be self-assessment" — partly true already
The genuinely good self-assessment widgets are here and worth keeping: cloze,
spot-the-mistake, predict-and-justify, "what happens if…", place-the-meters,
fading practice, calculation/units check, order-the-steps, and the quizzes. The
problem is they're **diluted** by the exploratory toys and by **redundant
assessment** (a Try-quiz *and* a 30-second check *and* a self-rate in most lessons,
plus a 10-question quiz at the end — the same knowledge tested 3–4 ways per lesson).

### 2.5 Dual S3/N5 audience is a hidden driver of overload
The booklet is *"RS Electricity B1 N5 2025"*, and the practice section indexes
**N5 PPQs and N5 past papers**. Resistor colour codes and the V–I/temperature
graph work also lean N5. An S3 pupil currently has no way to see "the core S3 bit"
without wading through N5 depth. Separating the two tiers is the single biggest
clarity win available.

---

## 3. Per-widget call (keep / demote / cut)

You asked for a per-widget judgement. "Demote" = keep it but move it into a clearly
**optional "Explore"** area so it's off the main self-assessment spine. "Cut" =
remove (usually because something else already does the job).

| Lesson | Widget (id) | Type | Verdict | Why |
|---|---|---|---|---|
| L1 | Recall quiz (`ch-quiz-l1`) | Assessment | **Keep** | Core symbol retrieval. |
| L1 | 🧩 Symbol-matching game (`ch-tool-symbol`) | Game/retrieval | **Keep** ✅ | Kept as the retained retrieval game (the "keep one" of the two games). |
| L1 | 30-second check (`ch-check-l1`) | Assessment | **Trim** ✅ | L1 already has quiz + matching game testing symbols — drop this third check. |
| L1 | Self-rate bar | Metacognition | **Keep** | One per lesson is good practice. |
| L2 | 🧲 Place the meters (`ch-meter-place`) | Assessment | **Keep** | Strong — applies series/parallel + meter rules. |
| L2 | Predict first (`ch-predict-parallel`) | Assessment | **Keep** | Predict-and-justify; high pedagogical value. |
| L2 | ⚡ Live circuit sim (`ch-sim-parallel-equal`) | Exploratory | **Cut** ✅ | Removed — PhET is the single retained simulator. |
| L2 | 🔧 PhET circuit builder | Exploratory embed | **Keep → Explore** ✅ | Retained as the one simulator, inside an optional "Explore" block. |
| L2 | What happens if…? (`ch-whatif`) | Assessment | **Keep** | Reasoning check. |
| L2 | Fill the gaps cloze (`ch-cloze-meters`) | Assessment | **Keep** | Good retrieval. |
| L2 | 30-second check (`ch-check-l2`) | Assessment | **Trim** ✅ | L2 already carries place-meters + predict + what-if + cloze — drop this check. |
| L3 | Colour code → value (`ch-colour-?`) | Assessment | **Keep** ✅ | Core S3, in-flow — **not** N5-tagged (colour codes left untagged per the tagging decision). |
| L3 | Reverse: value → bands (`ch-colour-reverse`) | Assessment | **Keep** ✅ | Second colour self-check; core S3 in-flow. |
| L3 | 🎨 Colour-code game (`ch-tool-colour`) | Game | **Cut** ✅ | The "cut one" of the two games; duplicates the two colour self-checks above. |
| L3 | 30-second check (`ch-check-l3`) | Assessment | **Keep** | The single L3 self-check. |
| L4a | Formula triangle (`ch-triangle`) | Tool/aid | **Demote** ✅ | To Explore (optional). Learning crutch, not assessment; SQA rewards rearranging. |
| L4a | Fading practice (`ch-fade`) | Assessment | **Keep** | Excellent scaffolded self-assessment. |
| L4a | Spot the mistake (`ch-error`) | Assessment | **Keep** | High value. |
| L4a | Practice generator V=IR (`ch-vir`) | Assessment | **Keep** | Core calculation practice. |
| L4a | Check your calculation/units (`ch-calc-ma`) | Assessment | **Keep** | Targets a real misconception. |
| L4a | 30-second check (`ch-check-l4a`) | Assessment | **Trim** ✅ | L4a already has fading + spot-mistake + generator + calc-check. |
| L4b | 📈 V–I explorer (`ch-graph-live`) | Exploratory | **Demote** ✅ | To Explore (optional). Engaging but exploratory; N5-leaning (block N5-tagged). |
| L4b | Predict & justify (`ch-predict-r`) | Assessment | **Keep** | Good. |
| L4b | 30-second check (`ch-check-l4b`) | Assessment | **Keep** | The single L4b self-check. |
| L5 | 🧮 Combine resistors live (`ch-combine-target`) | Calc tool + task | **Keep (lean)** ✅ | In-flow; keep the target-task self-check, de-emphasise the free-play sliders. |
| L5 | 30-second check (`ch-check-l5`) | Assessment | **Keep** | |
| L6 | Order the steps (`ch-order-combo`) | Assessment | **Keep** | Good sequencing task. |
| L6 | 30-second check (`ch-check-l6`) | Assessment | **Keep** | |
| Practice | Self-marking quiz, 10 Q (`ch-quiz-main`) | Assessment | **Keep** | The anchor end-of-block check; should not be `open` by default. |
| Practice | Past-paper PPQ / past-paper indexes | Reference (N5) | **Keep, tag N5** | Belongs in an N5/extension area, not the S3 core. |
| Practice | AI tutor launch | Tool | **Keep** | Fine as an optional tail panel. |

**Net effect (decisions locked):**
- **Cut 2:** custom Live-circuit sim, Resistor colour-code game.
- **Keep → Explore (optional):** PhET circuit builder (the one retained sim),
  V–I explorer, formula triangle. *(All confirmed.)*
- **Keep in-flow:** Symbol-matching game (as retrieval), the combine-resistors
  target-task (lean — free-play de-emphasised), + all the genuine self-assessment
  widgets.
- **N5 / Going further markers:** L4b V–I & temperature graphs, L6 combination
  circuits, and the Practice-page past-paper indexes. Resistor colour codes (L3)
  stay **untagged** as core S3.
- **Trim:** the 30-second checks on L1, L2 and L4a (lessons already carrying 2+
  assessment widgets); keep them on L3, L4b, L5, L6.
- **Result:** each lesson ≈ **one Learn block → one or two genuine self-checks →
  one worked example → self-rate**, with depth/exploration clearly optional.

---

## 4. Improvement options

Four routes. They are not mutually exclusive — the per-widget cuts in §3 and the
accordion fix in §6 apply to all of them. Pick a structural route (A–D) and layer
those fixes on top.

### Option A — Trim & tier *in place* (keep one URL)
Keep the single page, but:
- Make the lesson panels a **single-open accordion**, all **default-closed**
  (incl. the practice quiz — remove `open`).
- Apply the §3 cuts; move demoted widgets into a per-lesson **"Explore (optional)"**
  `<details>` so the visible spine is Learn + self-check.
- Tag N5-depth blocks (colour codes, graphs, past papers) with a visible **"N5 /
  Going further"** marker.

*Pros:* lowest risk; one URL/one badge unchanged; quickest to ship.
*Cons:* still a long page; "too much on one page" only partly solved.

### Option B — Split into a short page-set ✅ CHOSEN

**Locked file structure** (subfolder + descriptive slugs; `electricity1.html`
becomes the Electricity 1 hub):

```
classes/s3-physics/
  electricity1.html                         ← Electricity 1 HUB (overview + 4 tiles)
  electricity1/
    circuits-symbols-meters.html            ← Part A  (L1–L2)   badge elec1a
    resistance-ohms-law.html                ← Part B  (L3–L4)   badge elec1b
    combining-resistors.html                ← Part C  (L5–L6)   badge elec1c
    practice.html                           ← Practice          badge elec1-test
```

- **Electricity 1 hub** (`electricity1.html`): short intro, the booklet download +
  useful links, and **four tiles** (Part A / B / C / Practice) each carrying
  `data-prog-badges` so the hub shows per-part progress. *(All lesson content moves
  out to the part pages.)*
- **Part pages**: short, default-closed accordion, ~one self-check per lesson, §3
  cuts applied, exploration in optional "Explore" blocks. Each carries a **stepper**
  (Part A · B · C · Practice) for lateral navigation + a back-link to the hub.
- **Practice page**: the 10-Q self-marking quiz, the N5 PPQ / past-paper indexes
  (N5-tagged), and the AI-tutor launch.
- **Navigation topology (two-level):** the S3 subject hub keeps **one** "Electricity
  1" tile → the Electricity 1 hub → the four part pages (+ in-page stepper). The
  global nav **drawer is unchanged** — no part pages added to it (CLAUDE.md rule).

*Pros:* directly fixes overload; each page is digestible; natural mobile fit;
`electricity1.html` URL stays live (now the hub), so inbound links don't 404.
*Cons:* touches the progress config and hub (see §5); more files to maintain.

### Option C — One URL, two tracks: "Core S3" vs "Go further (N5)"
Keep a single page but add a **mode toggle** (or strong visual tiering) at the top:
- **Core S3** shows a lean spine — Learn + one self-check per lesson + the final
  quiz. (~6 self-checks total.)
- **Go further (N5)** reveals the depth: colour codes, the simulators/explorers,
  extra worked examples, PPQ/past-paper indexes.

*Pros:* preserves the single shareable URL and single badge; squarely addresses the
dual S3/N5 audience; an S3 pupil sees a short, finishable page.
*Cons:* needs a small amount of toggle JS + a rethink of what counts toward the
badge (core challenges vs optional); more design work than A.

### Option D — Self-assessment-first rebuild (pedagogy layer)
Independent of A–D's structure: re-discipline **every** lesson to the model
**short Learn → ONE gating self-assessment → optional Explore**. Delete redundant
assessment (no Try-quiz *and* 30-sec check *and* self-rate all testing the same
thing). Cut all "fun-only" widgets per §3. Best applied *with* B or C.

---

## 5. Progress-engine implications (read before splitting)

The page is currently one badge (`elec1`) gated on all 34 `data-prog-challenge`s.

- **Options A & C (one URL):** no config change needed. Challenge IDs stay; the
  badge still unlocks when all *present* challenges are done. If C makes some
  challenges optional, decide whether the badge counts core-only (cleaner) — that's
  just which elements carry `data-prog-challenge`.
- **Option B (CHOSEN):** replace the single `elec1` badge with **four** —
  `elec1a`, `elec1b`, `elec1c`, `elec1-test` (each `unlock:"page"` with its own
  subfolder `href`). The S3 subject hub keeps **one** "Electricity 1" tile whose
  `data-prog-badges="elec1a elec1b elec1c elec1-test"` aggregates the set; the
  Electricity 1 hub page's four tiles each carry their single badge. **Challenge
  IDs stay unchanged** and move with their lesson, so completed challenges still
  count. Cut widgets (custom sim, colour game) and trimmed 30-sec checks simply
  drop their `data-prog-challenge` from the page (lowering that page's count).
  The hub already aggregates per-subject, so % explored / points / ranks keep
  working. **Confirm against `progress-system-guide.md`** whether retiring `elec1`
  needs a `migrateFrom` mapping so existing learners' progress isn't orphaned.

---

## 6. Cross-cutting fixes (apply to whichever option)

1. **Single-open accordion, default-closed.** Opening a lesson closes the others;
   nothing open on load. (Today panels are independent `<details>`; the practice
   quiz is `open`.)
2. **One self-check per lesson.** Collapse the Try-quiz / 30-second check / self-rate
   triple into: a couple of self-assessment widgets + one self-rate. Stop testing
   the same idea four ways.
3. **Cut the duplicate toys** — the custom Live-circuit sim (keep PhET instead, in
   Explore) and the Resistor colour-code game (keep the symbol-matching game).
4. **Demote exploratory widgets** into an explicit, collapsed "Explore (optional)"
   block per lesson — never on the default path.
5. **Tag N5 depth** visibly so S3 pupils know what's beyond their level and can skip
   it without feeling they've missed core work.
6. **Reduce first-paint density** — colour-key card and "Useful links" can be
   slimmed; the page should open showing a short lesson list, not a wall.
7. **Re-examine the formula triangle** — consider replacing with a "rearrange it
   yourself" prompt to match SQA expectations.

---

## 7. Decision & next steps

**Chosen route: Option B — split into a short page-set** (1a L1–L2, 1b L3–L4,
1c L5–L6, + a shared Practice page), layered with Option D's per-lesson discipline
and the §3 per-widget cuts. (Option C was the single-URL fallback; not taken.)

**Resolved:**
- Split boundaries — 3 lesson pages + shared Practice page (§4 Option B).
- Contested per-widget calls — keep symbol game / cut colour game; keep PhET
  (in Explore) / cut custom live sim; trim 30-second checks on L1, L2, L4a (§3).

- Remaining demotions — V–I explorer + formula triangle → "Explore (optional)";
  combine-resistors kept in-flow (lean). (§3)
- N5 tagging scope — markers on L4b graphs, L6 combination circuits, and the
  past-paper indexes; resistor colour codes left untagged as core S3. (§3)

**All design questions are settled.** Only implementation remains — see the
**guardrails (§8)** and the **phased build order (§9)**. The §6 cross-cutting
fixes apply to every resulting page.

---

## 8. Guardrails (hard rules for the build)

**Content integrity**
- **No content silently lost.** Every existing block — booklet answers, mark
  schemes, worked examples, definitions, past-paper lists — lands on exactly one
  destination page. Phase 0 produces a mapping table; nothing is dropped except
  the explicit §3 cuts (custom sim, colour game, trimmed 30-sec checks).
- **Keep `data-prog-challenge` IDs stable** when moving a widget, so completed
  challenges still count. Only the §3-cut widgets lose their IDs.

**Progress engine** (per CLAUDE.md + `progress-system-rollout-plan.md` §5)
- **One engine, never a fork** — use `assets/js/progress.js` + the
  `assets/js/progress/s3-physics.js` config only. No hand-rolled progress JS.
- **One key:** `progress-s3-physics-v1`. Exploratory widget state keeps its own
  per-page prefix (e.g. `s3e1a-…`) and is **never** written into the progress key.
- **Behind-content guardrail:** a badge is wired only once its page has real
  content — no badge on an empty stub.
- Confirm the `elec1 → elec1a/b/c/-test` transition against
  `progress-system-guide.md` (migrateFrom if needed).

**Page conventions** (per CLAUDE.md + `page-checklist.md`)
- Each part/hub page is a standard S3 Physics page: `layout: none`, links
  `/assets/css/s3-physics.css`, includes `site-menu.html` + `site-footer.html`,
  absolute asset paths, the overflow-fix `<style>` head.
- **Banner overlay kept** on every part page *and* the Electricity 1 hub — the
  generic S3 banner art doesn't show the specific topic name, so it's not a
  duplicate (the `is-hub` overlay-hide rule does **not** apply here).
- **Accordion:** single-open, default-closed. **No `<details open>`.** Nested
  reveals (mark schemes) allowed but kept minimal.
- **Interactives are self-assessment first.** Exploratory items (PhET, V–I
  explorer, formula triangle) live only inside a collapsed **"Explore (optional)"**
  block — never on the default path.
- **N5 markers** on the L4b graphs, L6 combination circuits, and Practice-page
  past papers. Resistor colour codes stay untagged (core S3).
- **A11y, every page:** skip link, ≥3px focus rings, `aria-label`s, decorative
  images `aria-hidden`, `prefers-reduced-motion` block, ≥48px tap targets,
  `aria-live="polite"` results, **no `alert()`/`confirm()`**.

**Navigation & scope**
- **Do not** add part pages to the global nav drawer — link them only from the
  Electricity 1 hub + the in-page stepper (CLAUDE.md rule).
- `electricity1.html` must stay a live URL (now the hub) — never 404 it.
- No new dependencies; no parallax / fixed-bg / blueprint patterns; no school
  branding (CLAUDE.md "what not to do").

**Process**
- Work on the current branch (`interactives-enrichment`). **Do not commit or push
  unless asked.**
- A phase is "done" only after the page renders in light **and** dark mode, passes
  the a11y checks, and its challenges/badge register in `localStorage`.

---

## 9. Phased build order

Build and verify **one page at a time**; each phase is independently shippable and
leaves the site working. Wire each badge only when its page has real content.

### Phase 0 — Prep & mapping (no user-facing change)
- Re-read `progress-system-guide.md`, `page-checklist.md`, and the reference page
  `classes/higher/electricity/current-pd-power-resistance.html`.
- Create the `classes/s3-physics/electricity1/` subfolder.
- Produce a **content-mapping table**: every block / widget / `data-prog-challenge`
  in today's `electricity1.html` → its destination page (or "cut" per §3). Confirm
  nothing is orphaned.
- **Done when:** mapping table reviewed; subfolder exists.

### Phase 1 — Part A · `circuits-symbols-meters.html` (L1–L2)
- Build from L1–L2 content. Apply: accordion/default-closed; keep symbol-matching
  game + recall quiz; **cut** custom Live-circuit sim; **PhET → Explore**; keep
  place-meters / predict / what-if / cloze; **trim** `ch-check-l1` + `ch-check-l2`;
  self-rate per lesson. Add stepper + hub back-link.
- Wire badge `elec1a` (`unlock:"page"`) in `s3-physics.js`; add neutral hooks.
- **Done when:** renders (light+dark), a11y pass, challenges + `elec1a` register.

### Phase 2 — Part B · `resistance-ohms-law.html` (L3–L4)
- Build from L3–L4. Apply: keep both colour self-checks (core S3); **cut** colour
  game; **demote** formula triangle + V–I explorer → Explore; keep fading / spot-
  mistake / V=IR generator / calc-check / predict-justify; **trim** `ch-check-l4a`;
  keep `ch-check-l4b`; **N5-tag** the L4b graphs block. Stepper + hub back-link.
- Wire badge `elec1b`.
- **Done when:** as Phase 1's checklist.

### Phase 3 — Part C · `combining-resistors.html` (L5–L6)
- Build from L5–L6. Combine-resistors sim kept in-flow (lean); keep order-the-steps
  + the L5/L6 checks; **N5-tag** combination circuits. Stepper + hub back-link.
- Wire badge `elec1c`.
- **Done when:** as above.

### Phase 4 — Practice · `practice.html`
- 10-Q self-marking quiz (`ch-quiz-main`), N5 PPQ / past-paper indexes (N5-tagged),
  AI-tutor launch. Stepper + hub back-link.
- Wire badge `elec1-test`.
- **Done when:** quiz registers `elec1-test`; renders + a11y pass.

### Phase 5 — Convert `electricity1.html` into the Electricity 1 hub
- Strip the now-moved lesson content. Rebuild as: banner (overlay kept), short
  intro, booklet download + useful links, and **four tiles** (Part A/B/C/Practice)
  with `data-prog-badges`. Keep the credits note.
- **Done when:** hub renders; tiles link correctly; per-part badge state shows.

### Phase 6 — S3 hub wiring + cleanup
- S3 subject hub (`classes/s3-physics.html`): keep the single "Electricity 1" tile
  → `electricity1.html`, set
  `data-prog-badges="elec1a elec1b elec1c elec1-test"`.
- Remove the retired `elec1` badge from `s3-physics.js` (or add `migrateFrom` if
  the guide requires it). No part pages added to the nav drawer.
- **Done when:** S3 hub %-explored / points / ranks aggregate across all four
  badges; no dangling links.

### Phase 7 — Full verification
- Jekyll build clean; click through hub → each part → practice at mobile width;
  steppers + back-links work; progress persists across pages; old `electricity1.html`
  URL resolves to the hub.
- **Done when:** all of the above confirmed; ready for review (no commit unless asked).

---

## Appendix A — Phase 0 content map (DONE 2026-06-29)

Subfolder `classes/s3-physics/electricity1/` created. Guides re-read:
`progress-system-guide.md`, `.claude/skills/shared/page-checklist.md`. Source page
`electricity1.html` is 2,865 lines (markup ~440–1796, inline JS ~1808–2865).

**Destinations:** **HUB** = `electricity1.html` (overview) · **A** =
`electricity1/circuits-symbols-meters.html` (L1–L2, badge `elec1a`) · **B** =
`electricity1/resistance-ohms-law.html` (L3–L4, badge `elec1b`) · **C** =
`electricity1/combining-resistors.html` (L5–L6, badge `elec1c`) · **P** =
`electricity1/practice.html` (badge `elec1-test`).

### Block-by-block map

| Lines | Block | → | Action |
|---|---|---|---|
| 442 | "Electricity 1 – Learn & Revise" H2 | HUB | Reframe as hub intro |
| 445–452 | Colour-key card | HUB + each part | Slim legend documents the step-labels used on parts |
| 454–460 | Booklet download button | HUB | Link from parts |
| 465–482 | Useful Links (collapsible) | HUB | — |
| 488–489 | "Learn the topic" head/sub | — | Drop (replaced by hub tiles) |
| 501–627 | L1 Learn + 10 symbol cards | A | Keep |
| 629–631 | L1 recall quiz `ch-quiz-l1` | A | **Keep** |
| 633–642 | 🧩 Symbol-matching game `ch-tool-symbol` | A | **Keep** (retrieval) |
| 644–659 | Booklet component-functions reveal | A | Keep |
| 661–666 | 30-sec check L1 `ch-check-l1` | — | **Cut (trim)** |
| 668–670 | L1 Check para + self-rate `gar L1` | A | Keep |
| 687–710 | L2 Learn: defns table + multimeter list | A | Keep |
| 712–717 | Misconception "where the meters go" | A | Keep |
| 719–753 | 🧲 Place the meters `ch-meter-place` | A | **Keep** |
| 755–772 | Predict first `ch-predict-parallel` | A | **Keep** |
| 774–823 | Series-vs-parallel table + ckt-pair SVGs | A | Keep |
| 825 | Everyday-uses para | A | Keep |
| 829–929 | ⚡ Live circuit sim `ch-sim-parallel-equal` | — | **Cut** |
| 930–941 | 🔧 PhET circuit builder (untracked) | A | **Keep → Explore** |
| 942–962 | What happens if…? `ch-whatif` | A | **Keep** |
| 963–981 | Cloze `ch-cloze-meters` | A | **Keep** |
| 982–992 | Booklet defns & rules reveal | A | Keep |
| 993–998 | 30-sec check L2 `ch-check-l2` | — | **Cut (trim)** |
| 1000–1002 | L2 Check + self-rate `gar L2` | A | Keep |
| 1019–1071 | L3 Learn: resistance + colour-code reading | B | Keep |
| 1074–1093 | Colour code → value (verify chal id) | B | **Keep** (core S3) |
| 1094–1107 | Reverse: value → bands `ch-colour-reverse` | B | **Keep** (core S3) |
| 1108–1117 | 🎨 Colour-code game `ch-tool-colour` | — | **Cut** |
| 1118–1140 | L3 See + booklet colour-code table reveal | B | Keep |
| 1141–1146 | 30-sec check L3 `ch-check-l3` | B | **Keep** (only L3 check) |
| 1148–1150 | L3 Check + self-rate `gar L3` | B | Keep |
| 1167–1187 | L4a Learn: Ohm's-law eq-cards | B | Keep |
| 1188–1198 | Formula triangle `ch-triangle` | B | **Demote → Explore** |
| 1199–1214 | Misconception + worked example | B | Keep |
| 1215–1250 | Fading practice `ch-fade` | B | **Keep** |
| 1253–1263 | Spot the mistake `ch-error` | B | **Keep** |
| 1264–1272 | Practice generator `ch-vir` | B | **Keep** |
| 1273–1282 | Check your calculation `ch-calc-ma` | B | **Keep** |
| 1283–1307 | L4a See + booklet calcs + mark scheme | B | Keep |
| 1308–1313 | 30-sec check L4a `ch-check-l4a` | — | **Cut (trim)** |
| 1315–1317 | L4a Check + self-rate `gar L4a` | B | Keep |
| 1335–1365 | L4b Learn: V–I experiment + temp & resistance | B | Keep · **N5-tag** |
| 1368–1420 | 📈 V–I explorer `ch-graph-live` | B | **Demote → Explore** |
| 1421–1431 | Predict & justify `ch-predict-r` | B | **Keep** |
| 1432–1464 | L4b See + booklet graph/temp + mark schemes | B | Keep |
| 1465–1470 | 30-sec check L4b `ch-check-l4b` | B | **Keep** |
| 1472–1474 | L4b Check + self-rate `gar L4b` | B | Keep |
| 1491–1505 | L5 Learn: combining intro | C | Keep |
| 1508–1546 | 🧮 Combine resistors `ch-combine-target` | C | **Keep (lean)** |
| 1547–1565 | L5 mark-scheme reveals + See | C | Keep |
| 1566–1571 | 30-sec check L5 `ch-check-l5` | C | **Keep** |
| 1573–1575 | L5 Check + self-rate `gar L5` | C | Keep |
| 1592–1612 | L6 Learn: combination circuits intro | C | Keep · **N5-tag** |
| 1613–1631 | Order the steps `ch-order-combo` | C | **Keep** |
| 1632–1657 | L6 Try + mark schemes + booklet answers | C | Keep |
| 1658–1668 | 🔥 Stretch — power (beyond Block 1) reveal | C | Keep (stretch) |
| 1672–1683 | L6 See | C | Keep |
| 1684–1689 | 30-sec check L6 `ch-check-l6` | C | **Keep** |
| 1691–1693 | L6 Check + self-rate `gar L6` | C | Keep |
| 1710–1722 | Self-marking quiz 10Q `ch-quiz-main` | P | **Keep** (registers `elec1-test`) |
| 1725–1769 | Past-paper PPQ / past-paper indexes | P | Keep · **N5-tag** |
| 1777–1791 | AI Tutor launch | P | Keep |
| 1796 | Sources & credits note | HUB + P | Split by what each page sources |

### Phase 0 findings (carry into build)

1. **JS must travel with its widget.** Each widget's inline JS (≈1808–2865) moves to
   the page hosting it. Shared helpers needed on **multiple** pages: `buildQuiz`
   (A, B, C, P), `buildGAR`/`setGarButtons` self-rate (A, B, C), and the local
   `S3Beta`→`Progress` bridge/`award`/`complete` glue. Cut widgets' JS
   (`circuitSim`, colour game, trimmed checks) is dropped.
2. **`markSeen` per page.** Today line 2217 calls `markSeen("elec1")` once. Replace
   with `markSeen("elec1a")` on A, `"elec1b"` on B, `"elec1c"` on C, `"elec1-test"`
   on P. All four badges are `unlock:"page"`.
3. **Exploratory state is already namespaced** — the self-rate uses a `s3e1…-gar-`
   `localStorage` prefix (separate from the progress key ✅). Give each part page its
   own unique prefix (e.g. `s3e1a-`, `s3e1b-`, `s3e1c-`).
4. **⚠ Progress-key remap risk (DECISION before Phase 6).** Per-challenge progress is
   stored keyed by **page URL** (`<href>::<challengeId>`), and `pageDone` by page URL.
   Moving challenges to new subfolder URLs means existing learners' completions on the
   old `electricity1.html` **won't carry over** — and `migrateFrom` can't fix this (it
   copies a whole *key*, it doesn't remap page URLs). Options: **(a)** accept the reset
   (S3 progress rollout is recent — June 2026, low impact), or **(b)** write a tiny
   one-time URL-remap shim. *Recommend (a) unless there's known active usage.* Does not
   block Phases 1–5.
5. **Colour-code challenge id (1074 widget)** needs confirming at Phase 2 build — the
   "Colour code → value" widget's `data-prog-challenge` wasn't explicit in the scan.
