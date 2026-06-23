# Electronics interactives — enrichment plan (Phase 4)

**Goal:** make *every* learning interaction on the National 5 Electronics pages count, and add the
interaction types the pages are currently missing — **interactive fill-in-the-blank worked examples**
and a **cloze ("fill the gaps") text in each section** — taking the **Higher Physics electricity
pages as the model**. This builds on the existing badge/progress system (Phases 0–3) without
throwing it away.

Status: **plan only — no code written yet.**

---

## 1. What the Higher electricity pages do (the inspiration)

The five `classes/higher/electricity/*.html` pages already run a richer engine than electronics. Worth
copying the *patterns*, restyled into the electronics teal-green dark theme.

| Higher pattern | Markup / hook | What it gives the student |
|----------------|---------------|---------------------------|
| **Cloze text** | `<p class="cloze-text">` with inline `<select class="cl-sel" data-answer="…">` gaps + a `Check`/`Reset` `.btnrow` + `<p class="fb-line" aria-live>` | A "fill the gaps" sentence per concept, self-marked |
| **Tracked widgets** | every interactive carries `data-challenge="ch-cloze | ch-graph | ch-order | ch-calc | ch-predict"`; JS auto-collects them with `querySelectorAll("[data-challenge]")` | *Nothing is untracked* — each interaction is a counted "challenge" |
| **Per-page progress** | a `#ghud` "Your progress" panel + a sticky `.sticky-prog` 🏆 "X / Y challenges done" pill + per-page badges (`first`, `halfway`, `all`) + points/streak | Immediate per-page feedback; a reason to finish a page |
| **Interactive worked steps** | `Substitute & solve` examples paired with a checkable `ch-calc` widget | Worked maths the student completes, not just reads |
| **Self-marking everywhere** | numeric/select inputs with `data-answer`, marked green/red with an `aria-live` feedback line | Consistent check/feedback UX |

Electronics already has the *cross-page* half of this (the badge wall + corner counter). What it lacks
is the Higher pages' **per-section, every-interaction** tracking and the **cloze / interactive
fill-in** content types.

---

## 2. Current electronics state (audit)

Per-page inventory (10 participating pages). "Tracked" = wired to `ElProgress`.

| Scaffold / widget | Where | State today |
|-------------------|-------|-------------|
| **Flagship scored challenge** (1 per page) | all 10 pages | ✅ **tracked** → its mastery badge |
| **MC "Check your understanding" quiz** (`#quiz`) | all 10 pages | ❌ **untracked** — only a private `…quizbest` localStorage key; never feeds progress |
| **RAG self-check** (`#rag`) | all 10 pages | ❌ untracked (self-report; fine to leave, but could mark a page "reviewed") |
| **Guided fill-the-gaps** (`.guided` + `.blank`) | 6 pages (5–13 blanks each) | ⚠️ **static** — blanks are plain text revealed by a `<details>`, not typeable/checkable |
| **Writing frame** (`.frame` + `.blank`) | 6 pages | ⚠️ static sentence-starters with a reveal |
| **Live explore widgets** (`.widget`: voltage divider, gate explorer, resistor decoder, transistor sim) | several | ➖ exploratory; not all need scoring |
| **Cloze text per section** | — | ❌ **does not exist yet** |

**Three concrete gaps the user named:**
1. The **MC quizzes are untracked.** They should count toward progress (Higher counts its `ch-graph`
   quiz the same way).
2. The **fill-in-the-blank worked examples are a missed opportunity** — make the `.guided` blanks
   interactive inputs that are checked and tracked.
3. **No cloze text** — add one "fill the gaps" sentence per concept/section, self-marked.

---

## 3. Design — extend the progress engine with a "challenge" layer

Keep the **badge** system exactly as-is (the 10 mastery badges + 5 achievements are the headline
reward). Add a **second, lighter tier underneath it: tracked "challenges"** — the cloze, the
interactive fill-ins, and the MC quiz — mirroring Higher's `data-challenge` model.

### 3a. New `ElProgress` API (additive, in `electronics-progress.js`)

```js
ElProgress.registerChallenges()      // auto-scan the page for [data-el-challenge] and count them
ElProgress.complete(id)              // mark a small challenge done (cloze/fill-in/MC); idempotent
ElProgress.challengeState()          // { page:{done,total}, global:{done,total} }
```

- **Storage:** extend the single `el-progress-v1` key with a `"challenges": { "<pageKey>:<chId>": true }`
  map. One key still → one Reset clears everything.
- **Auto-registration:** every tracked interaction gets `data-el-challenge="<id>"` on its wrapper
  (e.g. `data-el-challenge="cloze-1"`, `"fillin-2"`, `"quiz"`). On load the module counts them per
  page (`location.pathname` as the page key) so the per-page total is automatic — add a widget, the
  denominator updates itself (exactly how Higher does it).
- **`complete(id)`** is called by each widget when the student gets it right (cloze all-correct, fill-in
  all-correct, MC ≥ pass mark). Sticky: never un-completes.

### 3b. Surfacing it (UI)

- **Per-page meter:** a small inline `📋 Section challenges: X / Y` bar at the top of each page's
  `<main>` (compact, like the badge mini-strip), painted by the module from `data-el-challenge`
  counts. Updates live via the existing `refreshAll()`.
- **Corner counter stays badge-focused** but gains a second line / tooltip: `🎖 4/15 · 📋 12/30`.
  (Badges = mastery; challenges = engagement. Two numbers, one pill.)
- **Two new achievement badges** (recompute automatically, no new quizzes):
  - `ach-curious` **Page Perfect** 🧩 — every challenge on any one page completed.
  - `ach-scholar` **Completionist** 📚 — every challenge on every page completed.
  These reuse the existing achievement recompute path.

> **Key decision to confirm:** do challenges (a) feed only the two new achievement badges and the
> per-page meter (recommended — keeps the 10 mastery badges meaningful), or (b) also gate the
> existing topic badges? Recommendation: **(a)** — additive, no regressions.

---

## 4. The two new content types (modelled on Higher)

All CSS for these ships **injected by `electronics-progress.js`** (same approach as the badge CSS), so
it works on every electronics page including the self-contained tool pages, and uses
`var(--token, fallback)` to stay on-theme.

### 4a. Cloze text — one per concept/section

Port Higher's `.cloze-text` pattern, restyled:

```html
<div class="elp-cloze" data-el-challenge="cloze-1" aria-label="Fill the gaps">
  <p class="cl-text">A transistor switch lets a small input at the
    <select class="cl-sel" data-answer="base"><option value="">choose…</option>…</select>
    turn on a bigger current. It switches on at about
    <select class="cl-sel" data-answer="0.7"><option value="">choose…</option>…</select> volts.</p>
  <div class="btnrow"><button class="btn primary cl-check">Check</button>
    <button class="btn cl-reset">Reset</button></div>
  <p class="fb-line" aria-live="polite"></p>
</div>
```

- Marked by a small shared handler (added to the module): on **Check**, compare each `<select>` value
  to its `data-answer`, colour right/wrong, write the `fb-line`, and `ElProgress.complete()` when all
  gaps are right.
- **Dropdown gaps** (not free text) keep it phone-friendly and unambiguous — same choice Higher made.
- One cloze per concept section (each page has 1–5 concepts), drawn from that concept's key words.

### 4b. Interactive fill-in worked example

Upgrade the existing static `.guided` blocks: turn each `<span class="blank">____</span>` into a
checkable input.

```html
<div class="guided" data-el-challenge="fillin-1">
  <span class="ex-type">We do — fill the gaps</span>
  <div class="gwork">
    <div>T = 4.0 × 5.0 = <input class="gap-in" data-answer="20" inputmode="decimal"> ms</div>
    <div>T = <input class="gap-in" data-answer="0.020"> s</div>
    <div>f = 1 ÷ 0.020 = <input class="gap-in" data-answer="50"> Hz</div>
  </div>
  <div class="btnrow"><button class="btn primary gp-check">Check</button>…</div>
  <p class="fb-line" aria-live="polite"></p>
  <details class="reveal"><summary>See the full answer</summary>…keep existing model answer…</details>
</div>
```

- Numeric gaps checked with the **same ±tolerance helper** the scored challenges already use; word
  gaps checked case-insensitively against `data-answer` (allow simple synonyms via `data-answer="base|b"`).
- Keep the existing `<details>` model answer as a fallback/scaffold.
- `ElProgress.complete()` when all gaps correct.
- This reuses the existing `.guided`/`.gwork` layout — only the blanks change to inputs + a check button.

### 4c. Track the MC quizzes

Wire the existing `#quiz` "Check your understanding" blocks into the challenge layer:
- Add `data-el-challenge="quiz"` to the quiz wrapper.
- On **Mark answers**, if score ≥ pass mark (e.g. ≥ 70% of questions), call `ElProgress.complete("quiz")`.
- No markup rewrite needed beyond the wrapper attribute + two lines in each page's existing quiz
  handler (or, better, centralise quiz marking into the module so all 10 pages share one
  implementation — see §6).

---

## 5. Per-page content map (what to add where)

Each theory/practical page gets: **one cloze per concept**, **its guided example(s) made interactive**,
and **its MC quiz tracked**. Counts below are the *new* tracked challenges added per page (the existing
flagship badge challenge is unchanged).

| Page | Concepts → cloze | Guided fill-ins to activate | MC quiz | New challenges |
|------|------------------|-----------------------------|---------|----------------|
| Quantities & calculations | 2 | 1 (prefix/Ohm steps) | ✓ | ~4 |
| Resistor circuits | 2 | 2 (divider working) | ✓ | ~5 |
| Transistor switching | 1 | activate the writing-frame as cloze | ✓ | ~3 |
| Signals & capacitors | 2 | 1 (T, f working) | ✓ | ~4 |
| Components & devices | 1 | writing-frame → cloze | ✓ | ~3 |
| Logic & ICs | 1 | — (add a cloze on gate behaviour) | ✓ | ~3 |
| Simulation | 1 | 1 (IPO description) | ✓ | ~3 |
| Planning | 1 | activate the 13 existing blanks | ✓ | ~3 |
| Construction | 1 | add a BS1852 fill-in | ✓ | ~3 |
| Testing | 1 | add a fault-reasoning cloze | ✓ | ~3 |

Approx. **30 new tracked challenges** across the course, all feeding the per-page meter and the two
new achievement badges.

---

## 6. Architecture / DRY

- **Centralise shared handlers in `electronics-progress.js`:** add three small auto-binding behaviours
  that scan for and wire up `.elp-cloze`, `.guided[data-el-challenge]`, and `#quiz[data-el-challenge]`
  on load. Pages then only supply *markup + data-answer values* — no per-page JS for cloze/fill-in,
  and the MC-quiz logic stops being copy-pasted 10×.
- **One CSS source:** cloze/fill-in/meter styles injected by the module (joins the badge CSS already
  there). No per-page `<style>` additions, no `electronics.css` change.
- **Storage:** still one `el-progress-v1` key; `challenges` map added alongside `badges`.

---

## 7. Accessibility & house style (unchanged rules)

- Dropdowns/inputs ≥44 px tap targets; `:focus-visible` rings kept.
- Right/wrong conveyed by **text + icon in the `fb-line`**, not colour alone (`aria-live="polite"`).
- No blocking `alert()`/`confirm()`; reset stays the two-tap inline pattern.
- Respect `prefers-reduced-motion`; keep the teal-green dark theme via `var(--token, fallback)`.
- Cloze gaps get `aria-label="gap N"`; each interactive block an `aria-label`.

---

## 8. Build order

**Phase 4a — engine (do first):**
1. Extend `electronics-progress.js`: `challenges` storage, `complete()`, auto-registration, per-page
   meter render, corner-counter second number, two new achievement badges, shared cloze/fill-in/quiz
   handlers + injected CSS. Ship against pages that have no challenges yet (meter shows 0/0 gracefully).

**Phase 4b — wire the MC quizzes (fast win, all 10 pages):**
2. Add `data-el-challenge="quiz"` + route marking through the shared handler.

**Phase 4c — cloze per section:**
3. Add one `.elp-cloze` per concept across the pages (start with the 6 theory pages).

**Phase 4d — interactive fill-ins:**
4. Convert the existing `.guided`/`.frame` blanks to checkable inputs page by page.

**Phase 4e — polish:**
5. Page Perfect / Completionist achievements verified; per-page meter + corner counter reflect state;
   Reset clears challenges too.

**QA each phase:** completion is sticky and idempotent; per-page total auto-counts from
`data-el-challenge`; achievements recompute; Reset clears badges *and* challenges; dark mode +
reduced-motion + ≤700 px; private-mode (no localStorage) degrades to "not saved"; no blocking dialogs;
cloze/fill-in marking matches the model answers exactly.

---

## 9. Open questions to confirm before building

1. **Challenges vs badges (§3b):** keep challenges feeding only the per-page meter + two new
   achievements (recommended), or also influence the 10 mastery badges?
2. **MC pass mark for "complete":** ≥70% or all-correct? (Recommend ≥70%, with the existing
   per-question feedback unchanged.)
3. **Corner counter:** show two numbers `🎖 4/15 · 📋 12/30` (recommended) or keep it badge-only and
   put challenges solely in the per-page meter?
4. **Cloze density:** one per concept (recommended) vs one per page.
5. **Free-text vs dropdown cloze:** dropdowns recommended (mobile-friendly, matches Higher); free-text
   only where a single unambiguous answer exists (e.g. "0.7").
