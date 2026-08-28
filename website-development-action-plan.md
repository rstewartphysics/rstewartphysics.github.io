# Website development — prioritised action plan

Audit date: 2026-08-11 · branch `n5-engineering-pages`. Goals: **(1)** ship finished work,
**(2)** standardise legacy pages to the modern look, **(3)** bring the "temporarily offline for
checks" materials back online, **(4)** a build order for future pages, **(5)** clean out redundant
files and keep CLAUDE.md/skills current.

**How to read the model column** — recommendation for which Claude model to run each task with:

| Model | Use for |
|---|---|
| **Haiku 4.5** | Mechanical sweeps: deletions, link flips, banner removals, cache-bust bumps, branch pruning. Cheapest/fastest. |
| **Sonnet 5** | The default workhorse: standard page edits, hub modernisation, applying an already-written spec, docs updates. |
| **Opus 5** | New interactive topic pages, SVG diagram work, multi-widget builds, page splits. `/fast` mode helps on long runs. |
| **Fable 5** | Repo-wide audits, architecture decisions (new level + progress config), multi-page refactors in one session, and reviewing big branches before merge (`/code-review`, or `/code-review ultra` for the cloud multi-agent review). |

Rule of thumb: if a task has a written spec and a proven template, drop a tier. If it involves
inventing structure, judging pedagogy/design, or touching many pages coherently, go up a tier.

---

## Phase 0 — Ship what's already built (do first, this week)

> **Correction (2026-08-11):** the first draft of this plan claimed the June–August work was
> unmerged and the live site had none of it. That was wrong — it compared against a stale local
> `origin/main` ref. The Electricity 1 split and all six N5 Engineering pages had **already** been
> merged to `main` via GitHub PRs #41, #42 and #43, and were live. Always `git fetch` before
> judging branch state.

- [x] **0.1 Browser pass + merge `n5-engineering-pages` → main.** ✅ **Done 2026-08-11.** Clean
      Jekyll build; light/dark render pass at 390px across all 11 changed pages (Electricity 1 hub +
      3 lessons + practice, six N5 Engineering pages); zero JS console errors on every page; badge
      IDs, `markSeen` calls and hub `data-prog-badges` all consistent (8 topic badges + 2
      achievements); no duplicate challenge IDs; challenge counts match the documented set
      (A 6 · B 8 · C 4 · P 1, N5 pages +1 for the engine's auto-tagged quiz). One fix applied and
      shipped: `widget-kit.js` was a dead 14KB request on Logic & Programmable Control and
      Assignment Prep (neither calls any kit function; the kit has no auto-init). Merged and pushed
      (`3b6ac31..b728696`) — the merge landed the CLAUDE.md docs commit plus that fix, the rest was
      already on main.
      *Known pre-existing issue found, not from this branch:* `/assets/higher/Delta.png` is
      referenced as the favicon/apple-touch-icon on the Higher topic pages but **does not exist** —
      broken on `main` too. Fix in Phase 1.
- [x] **0.2 Tidy the working tree.** ✅ **Done 2026-08-11.** Deleted `Electricity Updates.rtf`;
      committed the five planning docs (electricity1-audit-and-improvements.md,
      interactive-components-improvement-plan.md, legacy-wip-audit.csv, website-fixes-plan.md,
      website-development-action-plan.md) at repo root as decision history; tree is now clean.
      **Model: Haiku 4.5.**
- [x] **0.3 Branch triage.** ✅ **Done 2026-08-11.** Harvested the two unmerged branches first:
      diffed every file in both against current `main` before deleting anything.
      **`home-coffee-float`** — fully superseded: the electronics costing/safety/wiring/testing
      content, the WIP banners, the hub-link cleanups and the Topics-section removal all already
      exist on `main`, done later via different (better) implementations. Nothing to harvest.
      **`chore/copyright-cleanup-phase0-1`** — also fully superseded: the S1/S2 Science removal,
      `LICENSE`, `CREDITS.md`, `credits.html`, the EA-booklet removal, the Buy-Me-a-Coffee link and
      the provenance checklist are all already live on `main` (its `copyright-provenance-checklist.csv`
      is byte-identical to the one committed in 0.2). Its `contact.html` predates the
      already-merged About & Contact rewrite. `copyright-audit.md` and `electronics-revamp-plan.md`
      are stale planning docs for jobs that shipped via other branches — no unshipped content.
      *(This also disproved a claim in the original Phase 6 CLAUDE.md notes below: the nav drawer
      does **not** still link a removed Science page — checked directly, no `/classes/science.html`
      references exist anywhere on `main`.)*
      Deleted 25 local branches (23 confirmed merged + 2 confirmed-superseded) and pruned 34 remote
      branches (the same 23 plus 9 stale `codex/*`, `rstewartphysics-patch-1`, and `to-be-pulled` —
      all verified fully merged or superseded before deletion, not just old). `git branch -d`
      initially refused 4 already-merged branches because their remote-tracking refs were stale
      (not because they weren't merged) — re-verified each with `git merge-base --is-ancestor` before
      force-deleting. Repo now has exactly one branch, locally and on GitHub: `main`.
      **Model: Sonnet 5** (harvest judgement + pruning).

---

## Phase 1 — Pending fixes with specs already written (quick wins)

- [ ] **1.1 Higher: Monitoring & measuring a.c.** — apply `website-fixes-plan.md` §2: remove WIP
      banner, exam-worded a.c. definition, split the oscilloscope SVG into two labelled a.c./d.c.
      boxes, swap given/derived tags (rms forms are the given ones — verify against the SQA sheet),
      add the rms-line trace, fix T=1/f tagging. **Model: Opus 5** (the SVG redraws are the hard
      part; the rest is Sonnet-grade).
- [ ] **1.2 Higher: Capacitors** — apply §3: remove tip note, fix the Q–V label overlap, reframe
      τ=RC as Advanced Higher extra, redraw the discharging-current curve negative-below-axis.
      **Model: Opus 5** (same reasoning).
      *Note: §1 of that plan (the Higher hub badges + Tricky Questions removal) is already done —
      mark it complete in the doc.*
- [ ] **1.3 Higher: Semiconductors & p–n junctions** — still carries a WIP banner but has no
      written spec. Review the content, finalise, remove the banner. **Model: Sonnet 5.**
- [x] **1.4 `classes/higher/simulations.html`** ✅ **Done 28 Aug 2026.** The two tiles
      converted to inert `<span class="class-tile soon">`.
- [x] **1.4b Broken Higher favicon** ✅ **Done 28 Aug 2026.** No asset existed to add, so the
      `<link rel="icon">` + `apple-touch-icon` lines were dropped from all six pages, and the
      matching entry removed from the PWA manifest's `icons` array on the Higher hub.
- [ ] **1.5 N5 Engineering booklet PDFs** — you supply the PDFs for topics 03/04/05/06/07 +
      assignment-prep (folders exist, empty). Then flip the five `cta soon` booklet buttons live
      and add the new PDFs to `copyright-provenance-checklist.csv`. **Model: Haiku 4.5** (after
      the PDFs land).
- [ ] **1.6 Beta exit for the six new N5 Engineering pages** — once classroom-tested, remove all
      `.beta-note` banners together (deliberate shared style, one sweep). **Model: Haiku 4.5.**

---

## Phase 2 — Legacy-page standardisation (modern look everywhere)

Modern standard = the reference page's conventions: dual `theme-color` + `color-scheme` head,
shared menu/footer includes, `is-hub` banner-overlay rule, one-row scrolling subnav, a11y checklist.
Order is by visibility to pupils.

- [ ] **2.1 `classes/s3-n5-physics.html` (National 5 Physics hub)** — in the nav drawer, 634 lines,
      older inline theme; still has the mobile subnav wrap-override and two
      materials/mark-scheme tiles pointing at the offline page (see Phase 3). Modernise the head,
      subnav, and tile ownership labels. **Model: Sonnet 5** with `/improve-page`.
- [ ] **2.2 `classes/adv-higher-physics.html`** — same treatment (632 lines, same subnav bug).
      **Model: Sonnet 5.**
- [ ] **2.3 `classes/physics.html` landing hub** — light modernisation pass. **Model: Sonnet 5.**
- [ ] **2.4 `classes/workinprogress.html`** — restyle the stub to the modern template (audit note:
      "update style to newer preferences"). Keep it generic; it's the placeholder target until
      Space/Nuclear pages exist (Phase 4). **Model: Sonnet 5.**
- [ ] **2.5 `classes/s3-physics/electricity-2.html` — split it.** 2,828 lines: the same overload
      the Electricity 1 audit fixed. Reuse the proven recipe wholesale (hub + lesson sub-pages +
      practice, per-page badges, §3-style widget triage). Write the Phase-0 content map first.
      **Model: Fable 5** for the audit/mapping session, **Opus 5** for the page builds.
- [ ] **2.6 `classes/s3-physics/electricity-3.html`** — 1,009 lines; probably a modernise-in-place
      (subnav fix, accordion discipline, N5 tagging) rather than a split. Decide after a quick
      audit. **Model: Sonnet 5** (audit + in-place); escalate to Opus if it becomes a split.

---

## Phase 3 — Bring the "down for checks" materials back online

The whole offline story is: **8+ tiles** across index/physics/higher/adv-higher/s3-n5/s3-physics/
electricity1 point at `materials-unavailable.html`, plus **all six** electronics demo-video links in
`classes/electronics/videos.html`. The blocker is the copyright/provenance audit
(`copyright-provenance-checklist.csv`) — several booklets are marked "Not mine — REMOVE".

- [ ] **3.1 Finish the provenance decisions** (the human step): for each CSV row decide
      mine / remove / seek permission. A model can prep the decision sheet — group rows, check
      what each asset is linked from, flag which decisions unblock which tiles.
      **Model: Sonnet 5** (prep), decisions yours. Harvest the notes from
      `chore/copyright-cleanup-phase0-1` first (task 0.3).
- [ ] **3.2 Purge the "REMOVE" assets** — delete flagged files, sweep every page for links to
      them, update the CSV. **Model: Haiku 4.5.**
- [ ] **3.3 Videos back online** — rehost the six testing/demo videos (e.g. unlisted YouTube),
      repoint `videos.html`, drop its dependence on the offline page. **Model: Sonnet 5.**
- [ ] **3.4 Re-point the materials tiles** — for each cleared collection, link the real
      destination (Glow-hosted where that's the home; label "Glow login" per the hub-badge
      convention already on the Higher hub). The s3-n5 "Mark Scheme Booklets" tile is a
      *coming-soon* masquerading as *offline* — give it a proper `.soon` treatment instead.
      **Model: Sonnet 5.**
- [ ] **3.5 Retire or keep `materials-unavailable.html`** — once inbound links hit zero, either
      delete it or keep it as a reusable maintenance page (recommend keep, restyled to the modern
      template in the same pass as 2.4). **Model: Haiku 4.5.**

---

## Phase 4 — Future page build order

One page per session, one commit per page, `.beta-note` while in beta, progress wiring by default
(`/add-progress`), booklet-first via `/from-pdf` where a booklet exists.

| # | Build | Why this order | Model |
|---|---|---|---|
| 4.1 | **S3 Engineering set** — the six stubs (`what-is-an-engineer` is done; build `energy` sub-sections, then `logic`, `electronics`, `mechanisms`, `pneumatics`, `computer-control`) per `s3-engineering-pages-outline.md` | Spec already written; pupils hit "Coming Soon" today; N5 template pages are fresh and proven | **Fable 5** to kick off (hub/config/architecture + first page), **Opus 5** per subsequent page |
| 4.2 | **S3 Physics: Space, Nuclear Radiation** | The only two S3 tiles still dead-ending on `workinprogress.html` | **Opus 5** per page |
| 4.3 | **Higher Physics: Our Dynamic Universe topics** (6), then **Particles & Waves** (7), in hub order | Completes the Higher offer; `higher-topic-page-guide.md` + reference page make these formulaic | **Opus 5** per page (Sonnet 5 for lighter topics) |
| 4.4 | **Higher Engineering Science** — new level: hub, `progress/eng-higher.js` config, then topics | Last "coming soon" in the nav drawer; needs an outline doc first (mirror the N5 one) | **Fable 5** for the outline + hub + config, **Opus 5** per topic page |

---

## Phase 5 — Redundant-file cleanup

All verified orphans unless marked "verify". **Model: Haiku 4.5** for the sweep, with a Sonnet-grade
double-check of the orphan greps before deleting anything.

> **Status (2026-08-28): swept.** All deletions below carried out on branch
> `site-tidy-ah-cards-intro-trim` after a fresh grep of every candidate.

- [x] `classes/n5-engineering/engineering-contexts-and-systems-beta.html` — leftover beta
      duplicate, nothing links to it → **deleted**.
- [x] `classes/s3-physics/electricity1-tools.html` and `electricity-2-tools.html` — no page
      referenced either → **deleted**; the `<topic>-tools.html` line is out of CLAUDE.md's S3
      filing structure.
- [x] `assets/style.css` — was already gone; its CLAUDE.md mention is now dropped too. The two
      Jekyll pages that still linked it — `contact.md` (`/contact`) and `quick-links.md`
      (`/quick-links`) — were **deleted**: they declare `layout: page` but the repo has no
      `_layouts/`, nothing linked them, and `classes/contact.html` is the real contact page.
- [x] `assets/js/electronics-progress.js` — deprecated shim, Phase 0 merged 11 Aug and stable
      since → **deleted**; the comments in `electronics.css` and `electronics-topic-page-guide.md`
      now point at `progress.js`.
- [x] `Electricity Updates.rtf` — superseded → deleted (task 0.2).
- [x] **Archive completed planning docs** — `AUDIT-PLAN.md`, `electricity1-audit-and-improvements.md`,
      `interactive-components-improvement-plan.md`, the three `electronics-*-plan.md` files, and
      `website-fixes-plan.md` moved to `docs/archive/` (git-tracked, out of the root) rather than
      deleted — they hold decisions. **Kept live at root:** the two topic-page guides,
      `progress-system-guide.md`, `progress-system-rollout-plan.md`, the two pages outlines, the
      two audit CSVs (until Phase 3/5 complete), this plan.
- [x] **Stop publishing the internal docs.** `_config.yml`'s `exclude` was missing nine planning
      docs and both audit CSVs, so `AUDIT-PLAN.html`, `website-fixes-plan.html`,
      `progress-system-rollout-plan.html`, `legacy-wip-audit.csv` and the rest were building into
      `_site/` and going live. Added `progress-system-guide.md`, `progress-system-rollout-plan.md`,
      `website-development-action-plan.md`, `legacy-wip-audit.csv`, `progress-hooks-audit.csv` and
      `docs` to the exclude list — `docs/` needs it explicitly, since it is not an underscore dir.
- [ ] `classes/engineering.html` + `classes/engineering/n5.html` — redirect stubs, orphaned
      internally but cheap insurance for old external bookmarks → **keep** (record the decision
      here so it isn't re-litigated).
- [ ] Remote branch prune (with 0.3): merged branches + `codex/*` + `rstewartphysics-patch-1` +
      `to-be-pulled` (verify content first).

---

## Phase 6 — CLAUDE.md & skills upkeep (after each phase, not one big rewrite)

- [ ] **CLAUDE.md corrections now:** the Science subject was already fully removed from the site
      during the 0.3 branch audit (2026-08-11) — no `/classes/science.html` link exists anywhere on
      `main`, confirmed by direct grep. What's actually stale is CLAUDE.md's own **menu-order and
      colour-theme sections**, which still describe a "Science `/classes/science.html`" drawer entry
      and a Science colour row that don't match the real `_includes/site-menu.html` (Home · Physics
      group · Electronics · Engineering Science group · About & Contact). Fix CLAUDE.md's
      description to match reality — the site itself needs no further change here. **Model: Sonnet 5.**
- [ ] **After Phase 0 merge:** update the N5 Engineering status block (built → merged/live) and the
      S3 Physics section if anything moved. **Model: Haiku 4.5.**
- [ ] **After Phase 2.5:** document the Electricity 2 split structure alongside the Electricity 1
      precedent. **Model: Haiku 4.5.**
- [ ] **Skills pass:** `new-page` / `improve-page` should name the N5 Engineering canonical
      template (`energy-and-efficiency.html`) and the `.beta-note` convention; `add-progress`
      stays as-is (already encodes the proven procedure). Review once after Phase 0.
      **Model: Sonnet 5.**
- [ ] Keep this file's checkboxes current at the end of each working session. **Model: any.**

---

## Suggested sequence at a glance

1. **This week:** 0.1 → 0.2 → 0.3 (ship it), then 1.4 + 6 (CLAUDE.md corrections) as same-day
   quick wins.
2. **Next:** Phase 1 Higher fixes (1.1–1.3) — specs are ready, high pupil visibility.
3. **Then alternate:** one Phase 2 standardisation task ↔ one Phase 4 build per session, so legacy
   debt shrinks while new content grows.
4. **In parallel (your decisions):** Phase 3 provenance calls + supplying the 1.5 PDFs — model work
   there is blocked on you, not the other way round.
5. **Continuous:** Phase 5 deletions ride along with whichever phase touches the area; Phase 6
   doc updates close every session.
