# Progress & badge system — construction guide

How to put a page (or a whole subject) on the shared progress engine. This documents the **real API**
of `assets/js/progress.js` as built in Phase 0. It is the source of truth referenced by
`new-page` / the topic-page guides; the strategic plan lives in
[`progress-system-rollout-plan.md`](progress-system-rollout-plan.md), the hard rules in its §5.

> **One engine, never a fork.** All logic is in `assets/js/progress.js` (`window.Progress`). A subject
> is a **config file**, not a copy of the engine. If you are editing `progress.js` to add subject
> knowledge, stop — it belongs in the config.

---

## 1. The two files a subject needs

```
assets/js/progress.js              ← the engine (shared, never edited per-subject)
assets/js/progress/<ns>.js         ← this subject's config — calls Progress.init(cfg)
```

A participating page loads both, **after `site-menu.js`**, in the `<head>`:

```html
<script src="/assets/js/progress.js" defer></script>
<script src="/assets/js/progress/electronics.js" defer></script>
```

The config calls `Progress.init(cfg)` on load; the engine then injects its CSS, binds challenges,
paints the corner counter, and — if present — renders the hub panel and per-tile chips. **No per-page
progress JS.** A page's only progress code is its flagship widget's two calls (§4).

---

## 2. Config shape (`progress/<ns>.js`)

```js
window.Progress.init({
  ns: "electronics",                 // REQUIRED → storage key "progress-electronics-v1"
  hubTitle: "🎖 Electronics badges",  // REQUIRED → dialog + hub heading
  threshold: 0.8,                    // default mastery (per-badge `thr` overrides)
  migrateFrom: "el-progress-v1",     // optional: one-time lossless copy of a legacy key
  points: { challenge: 10, badge: 25 },   // point awards (defaults shown)
  ranks: [ { at: 0, name: "Trainee" }, { at: 60, name: "Apprentice" }, … ],  // ascending
  layers: { badges:true, challenges:true, pointsStreak:true,
            perPageBadges:true, hubTotals:true, ranks:true },  // all on by default
  topic: [ /* one per scored interactive */
    { id:"thy-rc", name:"Network Navigator", emoji:"🔗", section:"Theory",
      href:"/classes/.../resistor-circuits.html", thr:0.8, cond:"Get 8/10 resistor totals right" }
  ],
  ach: [ /* auto-derived meta badges */
    { id:"ach-full", name:"Circuit Master", emoji:"🏆", cond:"Unlock every topic badge",
      test: function (badges, data) { /* return true when earned */ } }
  ]
});
```

| Field | Req | Notes |
|-------|-----|-------|
| `ns` | ✅ | Unique per **level/subject**. Storage key is `progress-<ns>-v1`. |
| `hubTitle` | ✅ | Heading for the badge dialog + hub panel. |
| `threshold` | — | Default mastery fraction (0.8). |
| `migrateFrom` | — | Legacy key to copy **once** into this subject's key (one-way, lossless). |
| `points` | — | `{ challenge, badge }` award sizes. |
| `ranks[]` | — | `{ at:<points>, name }` — sorted ascending by the engine. |
| `layers` | — | Feature toggles; omit = all on (the standard model). |
| `topic[]` | ✅ | `{ id, name, emoji, section, href, thr?, cond, unlock? }` per tracked interactive. |
| `ach[]` | — | `{ id, name, emoji, cond, test(badges,data) }`. Tests are **pure** and re-run on every change — never store achievement state as truth; derive it. |

**Two ways a topic badge unlocks** (set per badge):
- **Scored (default)** — a flagship widget calls `Progress.record(id, score, max)`; unlocks at `thr`
  (or `threshold`). Use for pages with one scored interactive (electronics' model).
- **Page-completion** — set `unlock:"page"`. The badge earns itself when **every** `data-prog-challenge`
  on the badge's `href` page is complete (the engine matches `href` to the current page). Use for pages
  with many small pass/fail challenges and no single score (Higher's model). No `record()` call needed —
  the page only wires each challenge to `complete()`/`miss()` and calls `markSeen(id)` once.

The config file owns all subject-specific helpers (e.g. computing `THEORY_IDS` from `topic` for an
`ach.test`). The engine receives only `cfg`.

---

## 3. Markup hooks (the page contract)

Subject-neutral attributes are the **only** thing a page adds. New work uses the `prog-` names; the
engine also accepts the legacy `el-*` / `data-challenge="ch-*"` names **transitionally** (removed
page-by-page during each subject's tidy phase).

| Hook | Where | Meaning |
|------|-------|---------|
| `id="progressHub"` | one empty `<div>` in the hub's "My progress" panel | Engine paints the strip + totals + rank here. |
| `data-prog-badges="id1 id2"` | hub tiles | Adds the per-tile earned chip (into `.tile-head` if present). |
| `data-prog-challenge="cloze-1"` | each tracked challenge wrapper | Auto-counted into the page total; `complete()` keys off it. |
| `.prog-cloze` | a cloze block | Auto-bound: needs `.cl-sel[data-answer]` selects, `.cl-check`, optional `.cl-reset`, `.fb-line`. |
| `.prog-fillin` | a fill-in block (also carries `data-prog-challenge`) | Auto-bound: `.gap-in[data-answer]` inputs, `.gp-check`, optional `.gp-reset`, `.fb-line`. |
| `#quiz` / `#quiz-mark` / `#quiz-score` | an MC quiz | Auto-bound; completes when the page's own scorer shows ≥70%. |

Cloze/fill-in answers: `data-answer` accepts `a|b|c` alternatives; numbers match within ±2%, words
case-insensitively. A correct check calls `complete(id)`; a wrong check breaks the streak.

---

## 4. Flagship scored widget (the page's only progress JS)

A page's main interactive reports its score through two calls:

```js
Progress.markSeen("thy-rc");          // on mount — feeds the "explorer" achievement, never scores
Progress.record("thy-rc", score, max);// on finish — stores BEST; unlock is sticky at the threshold
```

`record` returns `{ unlocked, justUnlocked, best, max, newAchievements }` and fires the unlock toast
itself — don't hand-roll an `alert()`.

---

## 5. Public API (`window.Progress`)

| Method | Purpose |
|--------|---------|
| `init(cfg)` | Boot the engine (called by the config file). |
| `markSeen(id)` / `record(id,score,max)` | Mark seen / log a scored attempt (best, sticky). |
| `complete(id)` | Mark a section challenge done — idempotent, keyed `pageKey::id`; awards challenge points + streak. |
| `addPoints(n,{streak})` / `miss()` | Award points (and optionally advance streak) / reset the streak. |
| `rank()` | `{ name, points, at, next }` from `cfg.ranks` + total points. |
| `get(id)` / `all()` / `snapshot()` | Read state (single badge / registry+state / aggregate totals). |
| `challengeState()` / `challengeDone(id)` / `pageBadges()` | Per-page challenge meter + derived per-page badges. |
| `renderHub(el)` / `decorateTiles()` | Paint the hub panel / per-tile chips (auto-run on init if hooks present). |
| `openGuide()` | Open the focus-trapped badge dialog. |
| `reset()` | Clear **this subject's** key only (UI uses a two-tap confirm). |
| `toast(def)` | Accessible `aria-live` unlock announce. |

`Progress._internals` exists **only** for the headless test harness — pages must not call it.

---

## 6. Storage schema (v2 — one key per subject)

```jsonc
// key: "progress-<ns>-v1"
{ "v":2,
  "badges":     { "thy-rc": { "best":9,"max":10,"unlocked":true,"at":"2026-06-23","seen":true } },
  "challenges": { "/classes/.../resistor-circuits.html::cloze-1": true },
  "pageDone":   { "/classes/.../resistor-circuits.html": true },
  "points":120, "streak":4, "bestStreak":7 }
```

- **One key per subject.** Never a global key, never per-page progress keys. Exploratory widget state
  (slider positions, etc.) keeps its own `el-…`/`hp-…` page prefix and is **never** written here.
- Every read/write is `try/catch` wrapped → private-mode degrades to "progress saving is off", never errors.
- `migrateFrom` copies a legacy key into the new key **once, only if the new key is empty**, bumping
  `v:1 → v:2` and adding `points/streak/bestStreak`. The old key is left intact and ignored after.

---

## 7. Theming

The engine **injects all its CSS**, token-driven via `var(--token, fallback)`, so it adopts each
subject's palette through that page's existing `:root`. Tokens used: `--text --muted --accent
--accent-2 --surface-2 --card --border --border-accent --border-strong --border-soft --warm
--font-stack --shadow --shadow-soft`. **Never** add a per-subject progress stylesheet; **never**
hardcode a colour that won't adapt to dark mode. If a subject's sheet uses different token names (e.g.
Engineering's `--eng-*`), add **aliases** in that sheet (see the rollout plan §8) — not engine edits.

---

## 8. Accessibility & guardrails (inherit `.claude/skills/shared/page-checklist.md`, plus)

- **No blocking dialogs** — unlocks use the `aria-live` toast; reset is the two-tap inline pattern.
- **Never colour-only** — locked/unlocked, right/wrong and rank are text + icon, not hue alone.
- Tap targets ≥44–48 px; focus rings ≥3 px; `role="progressbar"` carries `aria-valuemin/now/max`;
  the counter + dialog hide under `@media print`; `prefers-reduced-motion` disables badge/toast motion.
- **Unlocks sticky, scores store best, achievements derived, `complete()`/points idempotent,
  migration one-way & lossless** — all asserted by `test/progress.html` (open it in a browser; the
  summary turns green when all assertions pass).

---

## 9. Adding a new subject — checklist

1. Write `assets/js/progress/<ns>.js`: `ns`, `hubTitle`, `topic[]`, `ach[]`, `ranks[]` (+ `migrateFrom`
   only if replacing a legacy key).
2. Confirm the subject sheet exposes the §7 tokens (or add aliases).
3. On the **hub**: an empty `<div id="progressHub">` in a "My progress" panel; `data-prog-badges` on tiles.
4. On each **topic page**: the two `<script>` tags; `data-prog-challenge` wrappers / `.prog-cloze` /
   `.prog-fillin`; the flagship widget's `markSeen` + `record`.
5. Tune the rank ladder so ranks feel earnable, not grindy.
6. Verify against `test/progress.html` and the rollout plan §6 QA checklist (dark mode, ≤700 px,
   private mode, reduced motion).
