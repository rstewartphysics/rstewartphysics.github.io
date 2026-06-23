# Electronics interactives & progress/badges — build plan

**Goal:** add a set of **scored interactive widgets** across the National 5 Electronics pages, and a
**progress + badge system** surfaced on the **Electronics hub** (`classes/electronics.html`) that ties
the Theory sub-pages and the practical pages (Simulation, Planning, Construction) together. Students
unlock **electronics-themed badges by mastering** each interactive, and can chase a few **extra
achievement badges** on top.

This plan extends — and supersedes — **§8 of `electronics-theory-restructure-plan.md`** (the
"interactives second pass"). The theory split (§1–7 there) is done and verified; this is the next phase.

No code written yet — plan only.

---

## 0. Decisions (agreed 2026-06-23)

| Decision | Choice | Consequence |
|----------|--------|-------------|
| **Badge logic** | **Mastery-based** | A badge unlocks only when a scored interactive is passed at a **threshold (default 80%, e.g. 8/10)**. Every interactive needs a *scored* mode, not just an exploratory one. |
| **"Design" section** | **Spread across practical pages** | No new `design.html`. Design-process interactives live inside **Simulation, Planning, Construction**. Theory's 6 sub-pages carry the knowledge interactives (per §8). |
| **Progress storage** | **localStorage only, per-device** | One JSON key, with a **Reset my progress** button. No accounts, no cross-device sync (a school-iPad caveat we accept). Works fully offline. |

**Mastery rule of thumb:** store the student's *best* score per badge; unlocking is sticky (a later
worse attempt never re-locks a badge). Threshold is **≥ 80%** of that interactive's max unless noted.

---

## 1. Page & interactive inventory

The course is **3 parts** (circuit design / simulation / construction), delivered across these pages.
Each already carries a RAG "Check your understanding" block except `revision.html`.

| Page | Existing interactive(s) | **New scored interactive (this plan)** | Badge |
|------|-------------------------|----------------------------------------|-------|
| **Theory — Quantities & calculations** | — | Prefix / sci-notation converter **+ Ohm's-law & power solver**, with a timed *challenge* round | 🧮 **Number Cruncher** |
| **Theory — Resistor circuits** | voltage-divider/comparator widget | **Series/parallel resistance calculator** with a scored "find the total" set | 🔗 **Network Navigator** |
| **Theory — Transistor switching** ⭐ | — | **Transistor-switch simulator** (LDR/thermistor slider, 0.7 V threshold, output toggles) + scored "make it switch" scenarios | 💡 **Bright Spark** |
| **Theory — Signals & capacitors** | — | **Oscilloscope trace reader** + **RC charging curve** with "read the period/peak/time-constant" questions | 🌊 **Wave Reader** |
| **Theory — Components & devices** | static symbol grid | **Symbol-matching quiz** (symbol → name/function), scored | 🔌 **Component Collector** |
| **Theory — Logic & ICs** | gate explorer | **Truth-table builder** (fill the table, self-mark) + link to `555-astable.html` | 🚦 **Logic Lord** |
| **Simulation** | — *(links to 555/stripboard tools)* | **Input → Process → Output system designer**: pick blocks to satisfy a design brief, scored against the brief | 🎛️ **The Operator** |
| **Planning** | — | **Design-stage sequencer**: order the five marked stages / match artefacts to stages, scored | 🗂️ **Master Planner** |
| **Construction** | (1 static widget) | **Resistor colour-code reader/challenge** + tie-in to existing `stripboard-builder.html` | 🪛 **Solder Master** |
| **Testing** *(optional, phase 3)* | — | **Fault-finding challenge** (symptom → likely fault, multimeter reading check) | 🔬 **Fault Finder** |

Existing full-page tools (`555-astable.html`, `stripboard-builder.html`) stay as-is but can each award
their badge by adding a small scored "challenge" panel later (optional, phase 3).

---

## 2. Badge registry

### 2a. Topic-mastery badges (one per interactive — the core set)

Unlocked at the per-interactive threshold. Each has a **locked label** (so it's never colour-only).

| ID | Badge | Emoji | Page | Unlock condition |
|----|-------|-------|------|------------------|
| `thy-qc` | Number Cruncher | 🧮 | Quantities | ≥ 8/10 in the converter + solver challenge |
| `thy-rc` | Network Navigator | 🔗 | Resistor circuits | ≥ 8/10 totals correct |
| `thy-ts` | Bright Spark ⭐ | 💡 | Transistor switching | Pass all switch scenarios (high/low light & temp) |
| `thy-sc` | Wave Reader | 🌊 | Signals & capacitors | ≥ 8/10 trace/RC reads |
| `thy-cd` | Component Collector | 🔌 | Components & devices | ≥ 80% of symbols matched |
| `thy-li` | Logic Lord | 🚦 | Logic & ICs | Truth tables for the target gates all correct |
| `sim-io` | The Operator | 🎛️ | Simulation | Design brief satisfied (input/process/output) |
| `pln-st` | Master Planner | 🗂️ | Planning | Five stages sequenced correctly |
| `con-cc` | Solder Master | 🪛 | Construction | ≥ 8/10 colour-code reads |
| `tst-ff` | Fault Finder | 🔬 | Testing *(phase 3)* | ≥ 8/10 faults diagnosed |

### 2b. Achievement badges ("extra progress")

Meta-badges that reward breadth/depth — derived from the topic badges, not separate quizzes.

| ID | Badge | Emoji | Earned when |
|----|-------|-------|-------------|
| `ach-theory` | Theory Triumph | 🎓 | All **6 Theory** mastery badges unlocked |
| `ach-practical` | Workshop Ready | 🛠️ | Simulation + Planning + Construction badges unlocked |
| `ach-full` | Circuit Master | 🏆 | **Every** topic badge unlocked (the full house) |
| `ach-perfect` | Flawless | ⚡ | Any interactive completed at **100%** (full marks) |
| `ach-explorer` | Tinkerer | 🧪 | Opened **every** interactive at least once (engagement, not score) |

Achievement badges recompute on every `record()` so they unlock automatically — no extra UI.

---

## 3. Architecture — shared progress module

Electronics already ships a shared sheet (`/assets/css/electronics.css`), so a shared progress layer
is consistent with the existing pattern (not a new precedent like the global nav).

**New shared files:**
- `assets/js/electronics-progress.js` — the single source of truth: badge registry + storage API + hub
  renderer + unlock toast. Loaded with `defer` on every electronics page that participates.
- Badge/dashboard/toast **CSS goes into the existing `assets/css/electronics.css`** (bump its
  `?v=el-YYYYMMDD` query when changed). No third stylesheet.

### 3a. localStorage schema (one key)

```jsonc
// key: "el-progress-v1"
{
  "v": 1,
  "badges": {
    "thy-rc": { "best": 9, "max": 10, "unlocked": true,  "at": "2026-06-23" },
    "thy-ts": { "best": 3, "max": 5,  "unlocked": false, "at": null },
    "thy-cd": { "seen": true }            // opened but not yet scored (feeds Tinkerer)
  }
}
```

Single key (not per-page prefixes) so the hub can aggregate and the Reset button is one operation.
All reads/writes wrapped in `try/catch` (private-mode safe), matching the existing reading-help toggle.

### 3b. Public API (consumed by each page)

```js
ElProgress.registry           // immutable badge definitions (id, name, emoji, page, threshold)
ElProgress.markSeen(id)       // call on interactive mount → feeds "Tinkerer"
ElProgress.record(id, score, max)  // call on scored attempt; stores best, returns {unlocked, justUnlocked}
ElProgress.get(id)            // current state for a badge
ElProgress.all()              // array of {def, state} for the hub
ElProgress.reset()            // clear the key (confirm first)
ElProgress.renderHub(el)      // paint the dashboard into a container
ElProgress.toast(badgeDef)    // accessible "Badge unlocked!" announcement
```

A page wires up with two calls: `ElProgress.markSeen("thy-rc")` when the widget loads, and
`ElProgress.record("thy-rc", correct, total)` when the student finishes the scored round.

---

## 4. Hub dashboard — `classes/electronics.html`

Add a **"My progress"** `panel` near the top of `<main>` (after Welcome, before Course sections).

- **Headline:** badge count + overall bar, e.g. `🎖 4 / 15 badges` with a progress meter (`role="progressbar"`, `aria-valuenow/min/max`).
- **Badge wall:** responsive grid (reuse `tile-grid` minmax pattern). Locked badges show a greyed
  silhouette **with their name + "Locked — <condition>"** as text; unlocked show emoji in the teal
  accent with the date earned. Achievement badges sit in a second, clearly labelled row.
- **Per-section cues:** each existing course-section `class-tile` gets a small inline badge-progress
  chip (e.g. `💡 ✓` or `2 / 3`) reading from `ElProgress`, so the hub tiles double as a map of what's
  left. Purely additive to current tile markup.
- **Reset:** a single `Reset my progress` button (confirm via an inline `details`/two-step press, **no
  `confirm()` blocking dialog if avoidable** — use an "Are you sure?" reveal), `aria-live` feedback.
- If `localStorage` is unavailable, the panel shows a friendly "progress saving is off in this browser"
  note instead of erroring.

The dashboard is **read-only on the hub** — scoring only happens on the interactive pages.

---

## 5. Per-page wiring (each interactive page)

Every participating page:
1. Adds `<script src="/assets/js/electronics-progress.js" defer></script>` (after `site-menu.js`).
2. Builds its scored interactive inline (own scoped CSS/JS, house style — see §6).
3. Calls `ElProgress.markSeen(id)` on mount and `ElProgress.record(id, score, max)` on completion.
4. On `justUnlocked`, shows the shared **accessible toast** ("🏅 Badge unlocked: Bright Spark") via
   `aria-live="polite"` — never `alert()`.
5. Adds a small **"View my progress →"** link back to the hub near the interactive.

Per-interactive **exploratory state** (e.g. last slider position) keeps its own `el-thy-…` key as today;
**only badge/score state** lives in the shared `el-progress-v1` key. The two don't mix.

---

## 6. House style & accessibility (every interactive + the dashboard)

Matches the site design system (CLAUDE.md) and the Higher topic-page interactive conventions:

- **Electronics dark theme** — teal-green accent `#00e6b3`, `color-scheme: dark`, inline `:root` tokens
  already on each page. Badge gold/lock greys must pass contrast in dark mode.
- **Self-contained**: inline scoped CSS/JS, **no external libraries**, works offline.
- **Keyboard-operable** controls, tap targets **≥ 44–48 px**, `touch-action: manipulation`.
- **`aria-live="polite"`** for score readouts and unlock toasts; locked/unlocked conveyed by **text +
  icon, not colour alone**.
- **`prefers-reduced-motion`** disables badge/sparkle animations.
- No blocking dialogs (`alert`/`confirm`), no parallax, no `background-attachment: fixed` (iOS).
- Sliders/canvas widgets degrade gracefully; provide a numeric/text fallback where a canvas is used.

---

## 7. Build order (phased, each step independently shippable)

**Phase 0 — foundation (do first):**
1. `electronics-progress.js` with the full **badge registry** (all 15 IDs), storage API, and toast.
2. Dashboard CSS in `electronics.css` + the **My progress panel** on the hub (everything locked, but
   the wall, bar, per-tile chips and Reset all work against an empty store).

**Phase 1 — flagship + theory (per §8 order):**
3. ⭐ **Transistor-switch simulator** (`thy-ts`) — highest-value, brand-new page. Wire to badge.
4. Quantities converters/solver (`thy-qc`).
5. Resistor series/parallel calculator (`thy-rc`).
6. Signals scope + RC reader (`thy-sc`).
7. Symbol-matching quiz (`thy-cd`).
8. Truth-table builder (`thy-li`).
   → unlocking #3–#8 trips **🎓 Theory Triumph** automatically.

**Phase 2 — practical/design interactives:**
9. Simulation input/process/output designer (`sim-io`).
10. Planning design-stage sequencer (`pln-st`).
11. Construction colour-code challenge (`con-cc`).
    → trips **🛠️ Workshop Ready**, and with all theory, **🏆 Circuit Master**.

**Phase 3 — optional extras:**
12. Testing fault-finder (`tst-ff`); challenge panels on `555-astable` / `stripboard-builder`.

**QA each phase:** badge unlocks at threshold and is sticky; achievement badges recompute correctly;
hub dashboard + per-tile chips reflect state; Reset clears everything; dark mode + reduced-motion +
mobile (≤ 700 px) all good; private-mode (no localStorage) degrades gracefully; no blocking dialogs.

---

## 8. Risks / open questions

- **Mastery threshold tuning:** 80% is the default; the transistor/logic/planning tasks are pass-all
  (small fixed sets) — confirm those feel fair, not punishing, during build.
- **No cross-device sync (accepted):** a student on a school iPad won't see home progress. If this bites
  later, the agreed fallback is to add a **copy/paste progress code** (the option not chosen today) —
  the single-key JSON schema in §3a is deliberately export-friendly, so it's a small later add.
- **Reset is destructive & local-only:** make the confirm step clear; nothing is recoverable.
- **Scope creep on widgets:** keep each interactive small and single-purpose; the badge layer is the
  connective tissue, not a reason to over-build any one widget.
- **`record()` idempotency:** re-attempts update *best* only; never decrement, never double-count toward
  achievements.
