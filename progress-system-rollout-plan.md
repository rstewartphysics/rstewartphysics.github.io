# Site-wide progress & badge system — long-term rollout plan

**Goal:** make the electronics-style **progress + badge tracking the default across five areas** —
**Electronics**, **Higher Physics**, and the **three Engineering Science levels (S3, National 5,
Higher)** — with each area's progress **aggregated and surfaced on its own level hub**. One shared,
**config-driven engine** powers them all; each subject supplies a small config (its palette tokens,
badge registry and storage namespace) rather than a forked copy of the JS.

This is a **long-term, multi-phase** goal. It supersedes the per-subject scope of
`electronics-interactives-progress-plan.md` and `electronics-interactives-enrichment-plan.md` (those
describe the *electronics* build that is now largely done — Phases 0–4 in git) and lifts that proven
pattern to a **site-wide standard**. **Phase 0 below exists to get the foundation right** before any
rollout, so we never fork the engine five ways.

Status: **plan only — no code written yet.**

---

## 0. Where we are today (analysis)

Three states exist across the site. They must be reconciled, not bolted together.

### A. Electronics — the model (most developed, hub-linked) ✅
`assets/js/electronics-progress.js` is a single shared module, loaded `defer` on every electronics
page, exposing `window.ElProgress`. It already does almost everything we want:

| Capability | Where in the module |
|------------|---------------------|
| **Single storage key** `el-progress-v1` (per device), private-mode safe (`try/catch`) | `load`/`save` |
| **Topic-badge registry** (10 badges, each with id/name/emoji/section/href/threshold) | `TOPIC[]` |
| **Achievement badges** (7, auto-derived via `test(badges,data)` functions) | `ACH[]`, `recomputeAchievements` |
| **Scored API** `markSeen` / `record(id,score,max)` (stores *best*, sticky unlock at ≥80%) | `record` |
| **Section-challenge layer** — auto-binds `.elp-cloze`, `.elp-fillin`, `#quiz`; `complete(id)` is idempotent; per-page total auto-counts from `[data-el-challenge]` | `registerChallenges` |
| **Hub aggregation** — compact strip (`#elProgressHub`), per-tile chips (`[data-el-badges]`), badge-guide dialog, corner counter on every page, unlock toast | `renderHub`, `decorateTiles`, `openDetails`, `renderCounter`, `toast` |
| **Palette-aware CSS** injected by the JS using `var(--token, fallback)` so it themes to any page | `injectCSS` |
| **Accessibility** — `role="progressbar"`, `aria-live` toasts, focus-trapped dialog, reduced-motion, print hiding, two-tap reset | throughout |

**Coupling to electronics** (what blocks reuse) is shallow and enumerable:
1. Hardcoded `KEY = "el-progress-v1"`.
2. Hardcoded `TOPIC`/`ACH` arrays with electronics page hrefs + section names (`Theory`, etc.).
3. Global name `window.ElProgress`; dialog title "🎖 Electronics badges".
4. Markup hook names: `data-el-badges`, `data-el-challenge`, `id="elProgressHub"`, `.elp-*` classes.
5. `bindQuiz` expects the electronics `#quiz` / `#quiz-mark` / `#quiz-score` markup convention.
6. CSS fallback colours are electronics teal/charcoal (harmless — real values come from each page's
   `:root` tokens, *if* the page sets them).

None of these are architectural; they are configuration baked in as constants. Phase 0 lifts them out.

### B. Higher Physics — a richer but divergent, copy-pasted engine ⚠️
The five `classes/higher/electricity/*.html` pages each carry **~200 lines of inline JS+CSS** for a
*per-page* engine that the electronics module does **not** have:
- `#ghud` "Your progress" panel with **points** + **streak 🔥** gamification;
- `data-challenge="ch-cloze | ch-graph | ch-order | ch-calc | ch-predict"` auto-collected per page;
- **per-page** badges (`first` / `halfway` / `all`, plus `streak`) — *not* cross-page;
- a `sticky-prog` 🏆 "X / Y" pill linking to `#ghud`;
- per-page `localStorage` keys (`hp-cpr-…`).

It is **not aggregated to the Higher hub** — every page is an island — and the engine is **duplicated
in each page** (5 copies today, growing as Dynamic Universe / Particles & Waves ship). It has features
electronics lacks (points/streak, per-page badges); electronics has features it lacks (cross-page
aggregation, a hub badge wall, a corner counter site-wide). **Neither is a superset — the unified
engine must be.**

### C. Engineering Science (S3 / N5 / Higher) — greenfield 🟡
- Hubs exist: `classes/s3-engineering-science.html`, `classes/n5-engineering-science.html`,
  `classes/engineering-science.html` (Higher = a "Coming Soon" card).
- Built on `engineering-science.css` (`.container`/`.card`/`.cta`, full `prefers-color-scheme` dark).
- **Most topic pages are stubs / "Coming Soon"** (see `legacy-wip-audit.csv`). A couple of N5/S3 pages
  carry ad-hoc progress markup, but there is **no shared engine**.
- So Engineering is *mostly* a content build; the progress layer should drop in as pages are written.

**Conclusion:** we have one proven cross-page engine (electronics), one richer-per-page-but-siloed
engine (Higher), and three greenfield levels (engineering). The right move is **one engine, five
configs**, with the unified engine a **superset** of A and B.

---

## 1. Decisions (locked 2026-06-23)

| Decision | Choice | Consequence |
|----------|--------|-------------|
| **One engine, many configs** | Generalize `electronics-progress.js` → `assets/js/progress.js` (`window.Progress`), driven by a per-subject **config object**. | No forks. A new subject = a config file, not a copy of the engine. |
| **Storage scope** | **One key per level/subject**: `progress-electronics-v1`, `progress-higher-physics-v1`, `progress-eng-s3-v1`, `progress-eng-n5-v1`, `progress-eng-higher-v1`. | Each hub aggregates only its own level. One Reset per subject. Export-friendly single-key JSON kept (per the electronics schema). |
| **Electronics data migration** | **Migration shim**: one-time read-old (`el-progress-v1`) → write-new (`progress-electronics-v1`), then ignore the old key. | Existing electronics students keep their badges; naming is consistent from day one. |
| **Gamification stays site-wide** | Unify a **two-tier model on every subject**: cross-page **mastery badges** + per-page **points / streak / section-challenge meter** + corner counter. **Standardise & streamline** today's electronics + Higher features so all five areas behave identically. | One consistent student experience. Removes ~200 duplicated lines per Higher page. |
| **Per-level hub totals** | Each level hub aggregates a running total — **points + streak + badge count + a "% of this course explored" bar** — not just a badge wall. | The hub becomes a true progress dashboard for its level. |
| **Progression ladder (ranks)** | Points accumulate into **named ranks per subject** (e.g. Apprentice → Technician → Engineer; Trainee → Physicist). Rank shows on the hub + corner counter. | A long-term ladder beyond individual badges. Rank thresholds live in each config. |
| **No cross-subject profile** | Gamification stops at the **level/subject** boundary — no site-wide aggregate score across all five areas. | Smaller scope; no shared cross-key read; each subject self-contained. |
| **Clean, neutral markup hooks** | Rename hooks site-wide to subject-neutral: `id="progressHub"`, `data-prog-badges`, `data-prog-challenge`, `.prog-cloze`, `.prog-fillin`. Engine keeps `el-*`/`elp-*` + Higher's `ch-*` aliases **transitionally only**; the tidy pass removes legacy names. | One naming scheme everywhere. Higher's `data-challenge="ch-*"` and electronics' `data-el-*` are rewritten during their tidy phases, not kept forever. |
| **Config defines everything subject-specific** | `topic[]`, `ach[]`, section groupings, hub title, threshold, **rank ladder**, and which layers are on all live in the config — not the engine. | Engine has zero subject knowledge. |
| **Hub linkage is the headline** | Every level hub gets a **"My progress"** panel (`#progressHub`) + per-tile chips, exactly like the electronics hub. | "Tracking linked to the topic/level hub" satisfied uniformly. |
| **Default on all new pages** | After the existing pages are tidied/migrated, the progress layer is **included by default** in every new topic page (baked into `new-page` / the topic-page guides). | No subject ever ships without tracking again. |

---

## 2. Target architecture

```
assets/js/progress.js                  ← generalized engine (window.Progress); subject-agnostic
assets/js/progress/electronics.js      ← config: registry + storage ns + options  → Progress.init(cfg)
assets/js/progress/higher-physics.js   ← config
assets/js/progress/eng-s3.js           ← config
assets/js/progress/eng-n5.js           ← config
assets/js/progress/eng-higher.js       ← config
```

A participating page loads two scripts (after `site-menu.js`):

```html
<script src="/assets/js/progress.js" defer></script>
<script src="/assets/js/progress/higher-physics.js" defer></script>
```

The config file calls `Progress.init({ … })` on load; the engine auto-inits (binds challenges,
renders the hub strip if `#progressHub` is present, decorates `[data-prog-badges]` tiles, paints the
corner counter). **CSS stays injected by the engine** using `var(--token, fallback)`, so each subject
themes itself through its existing `:root` tokens — no per-subject stylesheet edits, no new sheet.

### Config shape (illustrative)
```jsonc
Progress.init({
  ns: "higher-physics",                 // → storage key "progress-higher-physics-v1"
  hubTitle: "🎖 Higher Physics progress",
  threshold: 0.8,                        // default mastery
  // every layer is on for all subjects (standardised two-tier model)
  layers: { badges: true, challenges: true, pointsStreak: true, perPageBadges: true, hubTotals: true, ranks: true },
  topic: [ /* { id, name, emoji, section, href, thr?, cond } … */ ],
  ach:   [ /* { id, name, emoji, cond, test(badges,data) } … */ ],
  sections: { /* groupings for the hub + achievement helpers */ },
  challengeKinds: ["cloze","fillin","graph","order","calc","predict","quiz"],
  // progression ladder — points → named ranks (per subject)
  ranks: [
    { at: 0,   name: "Trainee" }, { at: 50,  name: "Apprentice" },
    { at: 150, name: "Technician" }, { at: 350, name: "Physicist" }
  ]
});
```

The engine's existing internals map almost 1:1 — `TOPIC`/`ACH`/`KEY`/`CHALLENGE_PAGES` become fields
read from `cfg`; `injectCSS` and all renderers are already token-driven and subject-neutral in spirit.
**New for the unified model:** a `hubTotals` summary (points + streak + badge count + "% explored")
in the hub panel, and a `ranks` resolver that maps the running points total to the current rank for
the hub + corner counter. Both are config-driven and reuse the existing `refreshAll()` sync path.

### 2.1 Public API (`window.Progress`)
Stable surface every page/widget calls. Names mirror today's `ElProgress` so the migration is a rename.

| Method | Purpose | Notes |
|--------|---------|-------|
| `Progress.init(cfg)` | Boot the engine for this page's subject | Called by the config file; idempotent. |
| `Progress.markSeen(id)` | Record that a topic interactive was opened | Feeds the "explorer" achievement; never scores. |
| `Progress.record(id, score, max)` | Log a scored attempt | Stores **best**; unlock is **sticky**; returns `{unlocked, justUnlocked, best, max, newAchievements}`. |
| `Progress.complete(id)` | Mark a section challenge done (cloze/fill-in/quiz) | Idempotent; keyed by `pageKey + "::" + id`. |
| `Progress.addPoints(n, opts)` | Award points / advance streak | `opts.streak:true` increments streak; a miss resets it. **One call per challenge** (no double-count). |
| `Progress.get(id)` / `Progress.all()` | Read badge state | Read-only snapshots. |
| `Progress.challengeState()` | `{ page:{done,total}, globalDone }` | Drives the per-page meter + counter. |
| `Progress.rank()` | Current `{ name, points, next }` | Resolved from `cfg.ranks` + total points. |
| `Progress.renderHub(el)` / `decorateTiles()` | Paint hub panel + per-tile chips | Auto-run on init if `#progressHub` / `[data-prog-badges]` present. |
| `Progress.openGuide()` | Open the badge-guide dialog | Focus-trapped, ESC/overlay close. |
| `Progress.reset()` | Clear **this subject's** key only | Two-tap confirm in UI; never touches other subjects. |
| `Progress.toast(def)` | Accessible "badge unlocked" announce | `aria-live="polite"`; never `alert()`. |

### 2.2 Storage schema (v2 — one key per subject)
```jsonc
// key: "progress-<ns>-v1"   e.g. "progress-higher-physics-v1"
{
  "v": 2,
  "badges":     { "thy-rc": { "best": 9, "max": 10, "unlocked": true, "at": "2026-06-23", "seen": true } },
  "challenges": { "/classes/.../resistor-circuits.html::cloze-1": true },
  "pageDone":   { "/classes/.../resistor-circuits.html": true },
  "points":     120,
  "streak":     4,
  "bestStreak": 7
}
```
- **One key per subject** → each hub aggregates only its own level; one Reset = one key.
- `v:2` adds `points`/`streak`/`bestStreak` to today's `v:1` electronics shape. The migration shim
  reads `el-progress-v1` (v1), writes `progress-electronics-v1` (v2) once, then ignores the old key.
- Every read/write is `try/catch` wrapped → **private-mode safe** (the `off` flag drives the "saving is
  off" notice). Schema stays **single-key JSON** so a future copy/paste export remains trivial.

### 2.3 Markup hooks (the page contract)
A page participates purely through these neutral attributes — **no per-page progress JS**:

| Hook | Where | Meaning |
|------|-------|---------|
| `<script src="/assets/js/progress.js" defer>` + `…/progress/<ns>.js` | `<head>`, after `site-menu.js` | Loads engine + this subject's config. |
| `id="progressHub"` | one empty `<div>` in the hub's "My progress" panel | Engine paints the strip + totals + rank here. |
| `data-prog-badges="id1 id2 …"` | hub tiles | Engine adds the per-tile earned chip. |
| `data-prog-challenge="cloze-1"` | each tracked challenge wrapper | Auto-counted into the page total; `complete()` keys off it. |
| `.prog-cloze` / `.prog-fillin` | challenge blocks | Auto-bound by the shared cloze/fill-in handlers (no page JS). |
| flagship scored widget | inside the relevant concept | Calls `markSeen` on mount + `record(id,score,max)` on finish. |

Legacy `data-el-*` / `.elp-*` / `data-challenge="ch-*"` are accepted **transitionally** and removed
page-by-page during the tidy phases.

### 2.4 Config field reference
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `ns` | string | ✅ | Storage namespace → `progress-<ns>-v1`. Must be unique per level. |
| `hubTitle` | string | ✅ | Heading for the dialog + hub panel. |
| `threshold` | 0–1 | — | Default mastery (0.8); per-badge `thr` overrides. |
| `topic[]` | array | ✅ | `{id,name,emoji,section,href,thr?,cond}` — one per scored interactive. |
| `ach[]` | array | — | `{id,name,emoji,cond,test(badges,data)}` — auto-derived meta badges. |
| `sections` | object | — | Groupings for the hub + achievement helpers. |
| `challengeKinds[]` | string[] | — | Allowed `data-prog-challenge` kinds for this subject. |
| `ranks[]` | array | — | `{at:<points>, name}` ascending — the progression ladder. |
| `layers` | object | — | Feature toggles; **all on** in the standardised model. |

---

## 3. Build order

Follows the agreed sequence: **tidy electronics + Higher electricity first → build into the live
engineering pages → then default on all new pages.** Each phase is independently shippable, obeys the
**guardrails in §5**, and is QA'd against the checklist in §6.

### Pre-flight — validate before writing any engine code 🚦
Three quick, code-free checks that de-risk load-bearing assumptions. Do these first; they can change
the Phase 0 design.
1. **Engineering palette-token spike.** Confirm `assets/css/engineering-science.css` exposes tokens
   compatible with the engine's injected CSS (`--accent`, `--accent-2`, `--surface-2`, `--border-accent`,
   `--card`, `--text`, `--muted`, `--warm`, `--font-stack`) in **both** light and dark. If gaps exist,
   the fix is token **aliases** in that sheet — decide this *before* committing to injected CSS, since
   it's a go/no-go on the theming strategy for Phases 2–4.
2. **Progress-hooks audit** (a `legacy-wip-audit.csv` sibling, e.g. `progress-hooks-audit.csv`).
   Inventory every existing hook so the rename is a checklist, not a hunt: per page, which of
   `data-el-badges` / `data-el-challenge` / `#elProgressHub` / `.elp-*` (electronics) and
   `data-challenge="ch-*"` / `#ghud` / `sticky-prog` / per-page `hp-…` keys (Higher) are present, plus
   which element IDs each inline script references.
3. **Golden electronics baseline.** Save a representative `el-progress-v1` JSON fixture (a few unlocked
   badges + completed challenges) and note current behaviour, so Phase 0/1 can *prove* "electronics
   behaves identically" and "the migration shim is lossless" against a real before-state.

**Exit criteria:** palette tokens confirmed (or alias list written); hooks audit committed; baseline
fixture saved. Only then start Phase 0.

### Phase 0 — Foundation: generalize the engine (DO FIRST, no rollout) 🧱
**The whole point of this phase is to get the base right so the other phases are config, not code.**

1. **Extract config.** Refactor `electronics-progress.js` into `assets/js/progress.js`:
   - Replace the `KEY`, `TOPIC`, `ACH`, `THEORY_IDS`, `CHALLENGE_PAGES`, dialog-title and
     section-grouping constants with values read from a `cfg` passed to `Progress.init(cfg)`.
   - Expose `window.Progress`; keep `window.ElProgress` as a transitional alias.
2. **Superset the layers.** Port Higher's per-page **points/streak** and **per-page badge** logic into
   the engine alongside electronics' **cross-page** badge wall + corner counter, and add the two new
   unified pieces — **`hubTotals`** (points + streak + badge count + "% explored" on the hub) and the
   **`ranks`** resolver (points → named rank, shown on hub + counter). All standardised on.
3. **Neutral hooks + transitional aliases.** Engine prefers new names (`data-prog-*`, `#progressHub`,
   `.prog-*`) but still recognises legacy `data-el-*`/`.elp-*` and Higher's `data-challenge="ch-*"` so
   nothing breaks mid-migration. Legacy names are removed page-by-page during the tidy phases.
4. **Author the electronics config** `assets/js/progress/electronics.js` reproducing today's exact
   registry (10 topic + 7 achievement badges, thresholds, hrefs, sections) + an electronics rank ladder.
5. **Write the standard doc** `progress-system-guide.md` (repo root) — the construction spec every
   subject follows: config shape, markup hooks, challenge kinds, rank ladders, accessibility, QA
   checklist. (Mirrors `higher-topic-page-guide.md` / `electronics-topic-page-guide.md`.) Write it
   *alongside* the engine so it documents the real API, not a guess.
6. **Add a logic test harness** — **no build step / no framework**: a single `test/progress.html` (or a
   small node script) that asserts the pure logic against the golden baseline — sticky unlock, *best*-score
   storage, idempotent `complete()`, achievement recompute, points/streak, and **the migration shim**
   specifically (it's the one piece that can destroy real student data, so it gets an explicit test).

**Exit criteria:** engine carries zero hardcoded subject data; the unified layers (badges + challenges
+ points/streak + hub totals + ranks) all work against an empty store; guide doc merged; logic tests
pass (incl. the shim). No page has been migrated yet.

### Phase 1 — Tidy & migrate Electronics (the proving ground) ⚡
1. Add the **migration shim**: on first load, copy `el-progress-v1` → `progress-electronics-v1`, then
   read only the new key. Existing students keep every badge.
2. Swap the two `<script>` tags on all electronics pages to `progress.js` + `progress/electronics.js`.
3. **Tidy the markup:** rename `data-el-badges`→`data-prog-badges`, `data-el-challenge`→
   `data-prog-challenge`, `#elProgressHub`→`#progressHub`, `.elp-*`/`.cl-sel`/`.gap-in` to the `prog-`
   scheme across the ~10 electronics pages + the hub.
4. **Electronics must behave the same or better** — same badges/counter/dialog/challenges, now plus
   hub totals + a rank on the counter. *If electronics is solid after this, the engine is proven.*
5. **Now (not before) capture the repeatable wiring steps as a skill.** ✅ **Done** —
   `.claude/skills/add-progress/SKILL.md` encodes the proven procedure (mode A add-tracking, mode B
   migrate-off-legacy, mode C new-subject) + the Phase 1 guardrails, so Phase 2's Higher pages and
   Phase 3's engineering pages are mechanical, not bespoke. `new-page` step 6 now points at it.

#### Phase 1 guardrails (discovered during migration prep, 2026-06-24 — non-negotiable)
- **No double toasts.** The shared engine's `record()` **fires the unlock toast itself** (topic badge +
  each new achievement). The legacy pages **also** fire it manually via
  `ElProgress.registry.topic.filter(…)` → `ElProgress.toast(def)` and
  `res.newAchievements.forEach(ElProgress.toast)`. Migration **must delete those page-side toast lines**
  or every unlock double-fires. **Keep** the widget's own inline result text (e.g.
  `msg += " — 🔗 Network Navigator unlocked!"`) — that is the widget's result line, not the toast.
- **`ElProgress.registry` is gone.** The shared engine does **not** expose `.registry`; its only use was
  the manual toast lookup above, which disappears with the de-dup — **no replacement needed**.
- **Rename the hub anchor, not just the hub id.** `#elProgressHub` is also an `href` target on every
  "View my progress →" link (~10 pages). Rename the hub's `id="elProgressHub"`→`progressHub` **and**
  every `href="…#elProgressHub"`→`#progressHub`, or those links break.
- **Inner element classes do NOT change.** `.cl-sel / .cl-check / .cl-reset / .fb-line / .gap-in /
  .gp-check / .gp-reset` are the engine's canonical names (guide §3) — keep them. Only the **wrappers**
  rename: `.elp-cloze`→`.prog-cloze`, `.elp-fillin`→`.prog-fillin`. (Supersedes the looser §3 wording.)
- **Renames can't break styling.** The engine injects CSS for **both** legacy (`.elp-*`, `#elProgressHub`,
  `data-el-*`) and new (`.prog-*`, `#progressHub`, `data-prog-*`) names, and pages carry no inline cloze
  CSS — so the swap is visually inert. This is why it's safe to swap scripts first, then rename.
- **Electronics gains points/streak/rank/hub-totals it never had.** That is intended (step 4, "same or
  better"), but it is *new* live behaviour — it must be on the human-check list, not assumed invisible.
- **Leave `electronics-progress.js` on disk.** After migration nothing references it; do **not** delete
  it in the migration commit — flag it for a separate, human-confirmed cleanup once the migration is
  verified live, so a rollback stays trivial.

### Phase 2 — Tidy & migrate Higher Physics electricity 🔵
Kills the worst duplication and lights up a hub that has no aggregation today.
1. Author `assets/js/progress/higher-physics.js`: badge registry spanning **all three units**
   (Electricity, Our Dynamic Universe, Particles & Waves), grouped by unit, + a physics rank ladder.
   `pointsStreak` + `perPageBadges` on, preserving the current per-page experience.
2. **Migrate the 5 electricity pages** off their inline engines onto `progress.js` + the config —
   delete the ~200 inline lines per page.
3. **Rename the markup:** rewrite each page's `data-challenge="ch-cloze|ch-graph|ch-order|ch-calc|
   ch-predict"` to `data-prog-challenge="…"` (the agreed clean rename, not aliasing).
4. Add the **"My progress" panel** (`#progressHub`) + hub totals to `classes/higher-physics.html` and
   per-tile chips (`data-prog-badges`) to its tiles — the hub now aggregates the whole level.

### Phase 3 — Build into the live Engineering Science pages 🟠🟢
The handful of **already-live** N5 + S3 engineering pages (e.g. `n5-engineering/energy-and-efficiency`,
`engineering-contexts-and-systems`, `s3-engineering/what-is-an-engineer`) get the layer retrofitted now;
stubs wait for content.
1. Configs `assets/js/progress/eng-n5.js` and `eng-s3.js`, keyed to the engineering topic orders
   (N5 order per CLAUDE.md), each with an engineering rank ladder (Apprentice → Technician → Engineer).
2. **"My progress" panel** + hub totals + per-tile chips on `classes/n5-engineering-science.html` and
   `classes/s3-engineering-science.html`.
3. Retrofit badge + challenge tracking (cloze / fill-in / quiz via the shared handlers) onto the live
   topic pages. **Verify the injected CSS tokens map to the `--eng-*` palette** (light + dark) — a
   quick Phase-0 spike de-risks this.
4. Higher Engineering Science stays a "Coming Soon" card; its config (`eng-higher.js`) is templated and
   drops in when those pages are built — config only, no engine work.

### Phase 4 — Default on all new pages 🔁
1. Bake the two `<script>` tags + the `#progressHub`/`data-prog-*` hooks into the **`new-page` skill**
   and the topic-page guides, so every new topic page ships with tracking by default.
2. As remaining stub pages (engineering, Higher units) are authored, they inherit the layer automatically.

### Cross-cutting (every phase)
- Keep CSS injected/token-driven; bump each subject sheet's `?v=` query **only** if a shared sheet
  actually changes (it shouldn't — the engine injects its own CSS).
- Point the relevant topic-page guide(s) at `progress-system-guide.md` as the source of truth.

---

## 4. Per-subject hub linkage (the "tracking linked to the hub" requirement)

| Hub | Panel container | Badge registry source | Per-tile chips |
|-----|-----------------|------------------------|----------------|
| `classes/electronics.html` | `#progressHub` (today `#elProgressHub`) | `progress/electronics.js` | `data-prog-badges` on course-section tiles |
| `classes/higher-physics.html` | `#progressHub` (new) | `progress/higher-physics.js` | on each unit/topic tile |
| `classes/n5-engineering-science.html` | `#progressHub` (new) | `progress/eng-n5.js` | on each topic card |
| `classes/s3-engineering-science.html` | `#progressHub` (new) | `progress/eng-s3.js` | on each topic card |
| `classes/engineering-science.html` (Higher) | `#progressHub` (new, when built) | `progress/eng-higher.js` | when topics exist |

Every participating **topic** page keeps the **corner counter** (its level's `earned/total`) and the
per-page **section-challenge meter**, exactly as electronics does now.

---

## 5. Guardrails — hard rules (apply to every phase, no exceptions)

These are **non-negotiable**. A change that breaks one of these is wrong even if it "works".

**Architecture**
- **One engine, never a fork.** All progress logic lives in `assets/js/progress.js`. Subjects differ
  only by their `progress/<ns>.js` config. If you're tempted to copy the engine, you're doing it wrong.
- **No inline progress engines.** Pages must not hand-roll points/streak/badge JS (the thing Higher
  does today is exactly what we're deleting). A page's only progress code is its flagship widget's two
  calls (`markSeen` + `record`); everything else is markup hooks + the shared handlers.
- **One storage key per subject** (`progress-<ns>-v1`). Never a global key, never per-page keys for
  progress. Exploratory widget state (slider positions, etc.) keeps its own `el-…`/`hp-…` page prefix
  and **must not** be written into the progress key.
- **Config is the only place subject knowledge lives.** No subject names, hrefs, palettes or thresholds
  hardcoded in `progress.js`.

**Data integrity**
- **Unlocks are sticky; scores store *best*.** A later worse attempt never re-locks a badge or lowers a best.
- **`complete()` and points awards are idempotent** — keyed per `pageKey::id`; a challenge counts **once**.
- **Achievements are derived, never stored as truth** — recomputed from badges/challenges every change.
- **Migration is one-way and lossless** — the shim copies `el-progress-v1` → `progress-electronics-v1`
  once; it must never drop or downgrade existing unlocks.

**Markup & theming**
- **Neutral hooks only on new work** (`data-prog-*`, `#progressHub`, `.prog-*`). Legacy `el-*`/`ch-*`
  names are transitional and must be removed in the tidy phase, not left to rot.
- **CSS is injected by the engine, token-driven** (`var(--token, fallback)`). Never add a per-subject
  progress stylesheet; never hardcode a colour that won't adapt to the subject's `:root` + dark mode.
- **Verify the subject's palette tokens exist** before rollout (the `--eng-*` check for Engineering).

**Accessibility & platform (inherit all of `page-checklist.md`, plus)**
- **No blocking dialogs.** `alert()`/`confirm()` are banned — unlocks use the `aria-live` toast; reset
  is the two-tap inline pattern.
- **Never colour-only.** Locked/unlocked, right/wrong, and rank are conveyed by **text + icon**, not hue.
- **Tap targets ≥44–48 px**, focus rings ≥3 px, `prefers-reduced-motion` disables badge/sparkle motion,
  `role="progressbar"` carries `aria-valuemin/now/max`, the corner counter + dialog hide under `@media print`.
- **Degrade, don't error.** No `localStorage` → show "progress saving is off", keep the page fully usable.

**Scope**
- **The engine is connective tissue, not a content generator.** Keep each widget small and
  single-purpose; don't over-build an interactive just because the badge layer exists.
- **Roll out behind content.** Never ship a badge wall whose tiles point at stub/"coming soon" pages.

---

## 6. QA checklist (run each phase)
- Badge unlock fires at threshold and is **sticky** (a worse re-attempt never re-locks).
- Achievement badges **recompute** correctly and idempotently on every `record()`/`complete()`.
- Per-page challenge total **auto-counts** from `data-prog-challenge`; meter + corner counter live-update.
- Hub panel + per-tile chips reflect state; **Reset** clears that subject's key only.
- **Dark mode** + **reduced-motion** + **≤700 px** mobile all correct, in each subject's palette.
- **Private-mode** (no `localStorage`) degrades to "progress saving is off" — never errors.
- **No blocking dialogs** (`alert`/`confirm`); reset is the two-tap inline pattern.
- **Points/streak** accumulate correctly; streak resets on a wrong attempt; best-streak persists.
- **Hub totals** (points + streak + badge count + "% explored") and **rank** match the underlying state.
- **Rank** advances at the configured point thresholds and shows on the hub + corner counter.
- Cloze/fill-in marking matches the model answers (numeric ±2% tolerance helper; case-insensitive words).
- **Electronics migration shim (Phase 1):** an existing `el-progress-v1` store carries over intact on first load.
- Electronics regression (Phase 1): behaviour identical to pre-migration, plus the new totals/rank.

---

## 7. Risks / remaining checks
- **Engineering palette tokens** *(de-risk in Phase 0)*: the injected CSS relies on `--accent`,
  `--surface-2`, `--border-accent`, etc. Verify `engineering-science.css` exposes equivalents (or add
  token aliases) so badges/cloze/hub-totals theme correctly in both light and dark before Phase 3.
- **Rank-ladder tuning:** point thresholds and rank names per subject need a first pass during build
  and a sanity check that ranks feel earnable, not grindy (especially on short/stub levels).
- **Markup-rename regressions:** renaming hooks across ~10 electronics + 5 Higher pages is mechanical
  but wide — do it page-by-page behind the transitional aliases and QA each before removing legacy names.
- **Cross-device sync (out of scope, accepted):** per-device only. The single-key JSON per subject stays
  export-friendly, so a future "copy/paste progress code" remains a small later add.
- **No cross-subject profile (decided):** if a site-wide score is ever wanted, it's an additive read
  over the five level keys — deliberately deferred, not designed out.
- **Scope discipline:** the engine is connective tissue. Per-subject widgets stay small and
  single-purpose; the unified engine must not become a reason to over-build any one interactive.

---

## 8. Pre-flight results (completed 2026-06-24) ✅

All three pre-flight checks done. **Exit criteria met — Phase 0 is unblocked.**

### Check 1 — Engineering palette-token spike → **GO (with a one-time alias block)**
`engineering-science.css` exposes a `--eng-*` palette, **not** the neutral token names the engine's
injected CSS reads. The injected CSS references: `--text --muted --accent --accent-2 --surface-2
--card --border --border-accent --border-strong --border-soft --warm --font-stack --shadow
--shadow-soft` (each with an electronics-teal fallback). The fix is a **single alias block** added to
the engineering sheet's light `:root`. Because CSS custom properties resolve at use-time, aliases that
point at `--eng-*` vars **auto-follow dark mode** (those vars are already redefined in the dark
`:root`) — so no second block is needed for them.

```css
/* engine-token aliases — lets the shared progress engine theme to the engineering palette */
:root{
  --text:var(--eng-text); --muted:var(--eng-muted);
  --accent:var(--eng-orange); --accent-2:var(--eng-teal);
  --surface-2:var(--eng-surface-2); --card:var(--eng-surface);
  --border:var(--eng-border);
  --border-accent:rgba(253,151,0,.30); --border-strong:rgba(253,151,0,.50);
  /* --border-soft already defined in this sheet (light + dark) */
  --warm:var(--eng-coral);
  --font-stack:"Trebuchet MS",Arial,sans-serif;
  --shadow:var(--eng-shadow); --shadow-soft:0 8px 18px rgba(120,70,15,.12);
}
```
Constants above (`--accent` orange, `--accent-2` teal, `--warm` coral, the two orange `--border-*`
rgba, `--font-stack`) all read correctly on the dark palette too, so they need no dark override.
**Caveat (acceptable):** the engine's correct/`is-ok` green (`#15803d` light / `#5dd693` dark) is
hardcoded, not token-driven — reads fine on the warm palette. **Decision: injected-CSS theming is
viable for Engineering; add this alias block in Phase 3, no per-subject progress stylesheet.**

### Check 2 — Progress-hooks audit → **committed** as [`progress-hooks-audit.csv`](progress-hooks-audit.csv)
Full per-page inventory of every electronics + Higher hook. Key findings that shape the tidy phases:
- **Electronics:** `el-progress.js` on **18 pages**; the real `id="elProgressHub"` container exists on
  **only** `classes/electronics.html` (the other 10 "hits" are `href="…#elProgressHub"` backlinks).
  `data-el-badges` is on 5 hub tiles; `data-el-challenge` spans 10 topic pages (counts 1–4 each).
- **Higher:** 5 inline engines, **5 distinct storage keys** (`hp-cpr-/cap-/emf-/ac-/semi-beta-`),
  each with `#ghud` + `sticky-prog`. The hub `classes/higher-physics.html` has **no progress at all** —
  Phase 2 adds `#progressHub` + tiles from scratch.
- ⚠️ **Plan correction:** Higher's challenge kinds are **richer than §0.B lists** — the live pages also
  use **`ch-check-cloze`** and **`ch-match`** (not just `ch-cloze/graph/order/calc/predict`). Phase 0's
  `challengeKinds` and the rename map in Phase 2 must cover all seven, plus electronics' `quiz`.

### Check 3 — Golden electronics baseline → **saved** as [`test/fixtures/el-progress-v1.golden.json`](test/fixtures/el-progress-v1.golden.json)
A representative v1 store: 3 topic badges unlocked (incl. a perfect `thy-ts` → `ach-perfect`), 2
seen-not-unlocked, one fully-done page (→ `ach-curious`), 4 challenges done — **5/17 earned**.
Carries an `expectedBehaviour` block so Phase 0/1 tests can assert sticky-unlock, best-score retention
and the **lossless migration shim** (v1 → `progress-electronics-v1` v2) against a real before-state.