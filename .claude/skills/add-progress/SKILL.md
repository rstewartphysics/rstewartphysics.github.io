---
name: add-progress
description: Put a page or a whole subject on the shared progress/badge engine (assets/js/progress.js), or migrate a page off a legacy/inline progress engine onto it. Use when asked to "add badges/progress/points to this page", "wire up the progress engine", "migrate <subject> onto the shared engine", or roll out the badge system to a new subject. Encodes the proven Phase-1 electronics procedure.
---

# /add-progress — wire a page/subject onto the shared engine

**One engine, never a fork.** All logic is in `assets/js/progress.js` (`window.Progress`); a subject is
a config file, not a copy. Pages add markup hooks + a flagship widget's two calls, nothing more.

## 0. Read first (source of truth)
- `progress-system-guide.md` (repo root) — the real engine API: config shape, hooks, storage, theming.
- `progress-system-rollout-plan.md` **§5 guardrails** + the **Phase 1 guardrails** block — hard rules.
- `.claude/skills/shared/page-checklist.md` — all a11y/platform rules still apply.
Decide the mode: **A** = add tracking to a page whose subject already has a config; **B** = migrate a
page off a legacy/inline engine; **C** = stand up a brand-new subject (do C's config first, then A/B).

## A. Add tracking to a page (subject config already exists)
1. **Scripts** in `<head>`, after `site-menu.js`, both `defer`, **engine before config**:
   `progress.js` then `progress/<ns>.js`. Never hand-roll progress JS.
2. **Challenges:** wrap each tracked challenge in `data-prog-challenge="<id>"`; use `.prog-cloze`
   (`.cl-sel[data-answer]`, `.cl-check`, optional `.cl-reset`, `.fb-line`) and `.prog-fillin`
   (`.gap-in[data-answer]`, `.gp-check`, optional `.gp-reset`, `.fb-line`). The engine auto-binds them.
3. **Flagship scored widget** — its *only* progress code: `Progress.markSeen("<id>")` on mount,
   `Progress.record("<id>", score, max)` on finish. `record()` **fires the unlock + achievement toasts
   itself** — do NOT also call `Progress.toast(...)`, and never `alert()`/`confirm()`. Keep the widget's
   own inline result text. The badge `<id>` must exist in `progress/<ns>.js`.
   *Page-completion alternative (many small pass/fail challenges, no single score — Higher's model):*
   give the badge `unlock:"page"` in the config and skip `record()`; just wire each challenge to
   `Progress.complete(id)`/`Progress.miss()` and call `Progress.markSeen("<id>")` once. The engine
   unlocks the badge when every `data-prog-challenge` on its `href` page is done. **Defer `markSeen` to
   `DOMContentLoaded`** (inline body scripts run before the deferred engine, so `window.Progress` isn't
   ready at top level). Note the engine auto-tags a `#quiz` block as a `quiz` challenge — it counts too.
4. **Hub** (once per subject): an empty `<div id="progressHub">` inside a "My progress" panel, and
   `data-prog-badges="id1 id2"` on the relevant hub tiles.

## B. Migrate a page off a legacy/inline engine (the proven electronics steps)
1. **Swap scripts:** replace the legacy `<script>` with `progress.js` + `progress/<ns>.js` (order above).
2. **Rename hooks to neutral names** (leave nothing legacy to rot):
   `data-el-challenge`/`data-challenge="ch-*"` → `data-prog-challenge`; `data-el-badges` →
   `data-prog-badges`; `.elp-cloze`/`.elp-fillin` → `.prog-cloze`/`.prog-fillin`; `#elProgressHub`/`#ghud`
   → `#progressHub` **on the container id AND every `href="…#…"` anchor that targets it**.
   **Do NOT rename the inner element classes** `.cl-sel/.cl-check/.cl-reset/.fb-line/.gap-in/.gp-check/
   .gp-reset` — those are the engine's canonical names.
3. **Kill hand-rolled toasts (double-toast trap):** delete any page code that looks up the registry and
   toasts on unlock (`…registry…filter(…)` → `.toast(def)`, `res.newAchievements.forEach(.toast)`), and
   delete inline points/streak engines. The engine now owns all of that. Keep the widget's inline message.
4. **Rename the JS global** `ElProgress.*`/inline calls → `Progress.*` (the `markSeen`/`record` calls).
5. **Migration shim:** if students have a legacy key, set `migrateFrom:"<old-key>"` in the config so the
   engine copies it once, losslessly, into `progress-<ns>-v1`. **Never** delete the old key or the legacy
   JS file in the migration commit — leave them for rollback; clean up later, human-confirmed.

## C. Stand up a new subject
1. Author `assets/js/progress/<ns>.js` calling `Progress.init({ ns, hubTitle, topic[], ach[], ranks[],
   points?, migrateFrom? })` — see guide §2. `ns` is unique per level → key `progress-<ns>-v1`.
   Subject knowledge lives ONLY here; never hardcode it in `progress.js`.
2. Confirm the subject's stylesheet exposes the engine's palette tokens (`--accent`, `--accent-2`,
   `--surface-2`, `--card`, `--border*`, `--warm`, `--font-stack`, …) or add a one-time alias block
   (e.g. Engineering's `--eng-*`). Never add a per-subject progress stylesheet — the engine injects CSS.
3. Then do A on each page and the hub.

## Verify before reporting (every mode)
- **No legacy tokens remain:** grep the touched pages for the old script src, `data-el-*`/`data-challenge`,
  `.elp-*`, `#elProgressHub`/`#ghud`, `ElProgress`/inline-engine globals → all zero.
- **New hooks present + script order** (engine before config, both `defer`).
- **Brace/paren + `<script>` balance unchanged** per edited file (deletions must be self-balanced).
- **One unlock = one toast** (manual check): score the flagship past threshold → exactly one badge toast,
  plus the inline message; trigger an achievement → one achievement toast.
- **Storage:** one key `progress-<ns>-v1`; exploratory widget state stays in its own `el-…`/`hp-…` prefix.
- Run the rollout-plan **§6 QA checklist** (dark mode, ≤700 px, reduced-motion, private mode, reset,
  sticky unlock, migration carry-over). Commit/push only if asked.
