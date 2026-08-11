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
- [ ] **0.2 Tidy the working tree.** Commit the 1-line CLAUDE.md audience fix; delete
      `Electricity Updates.rtf` (fully superseded by `website-fixes-plan.md`); commit or
      `.gitignore` the four untracked planning files so the tree is clean. **Model: Haiku 4.5.**
- [ ] **0.3 Branch triage.** Delete the 21 local branches already merged into main (plus their
      remotes and the stale `codex/*` remotes). Two branches are **not** contained anywhere:
      `home-coffee-float` (Buy-Me-a-Coffee float + electronics content fixes: costing/safety/
      wiring/testing tables + "Phase 1 quick wins") and `chore/copyright-cleanup-phase0-1`
      (copyright-checklist progress notes). Diff each against main, harvest anything not already
      re-landed, then delete. **Model: Sonnet 5** (harvest judgement), Haiku for the pruning.

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
- [ ] **1.4 `classes/higher/simulations.html`** — two "More Coming Soon" tiles are live links to
      `#`. Make them inert spans (`.soon` pattern). **Model: Haiku 4.5.**
- [ ] **1.4b Broken Higher favicon** — `/assets/higher/Delta.png` is referenced by
      `<link rel="icon">` + `apple-touch-icon` on the Higher topic pages but no such file exists
      (no `*delta*` anywhere in `assets/`). Either add the asset or drop the two `<link>` lines.
      Found during the 0.1 link sweep. **Model: Haiku 4.5.**
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

- [ ] `classes/n5-engineering/engineering-contexts-and-systems-beta.html` — leftover beta
      duplicate, nothing links to it → **delete**.
- [ ] `classes/s3-physics/electricity1-tools.html` and `electricity-2-tools.html` — no page
      references either (verify once more, including JS fetches) → **delete** and remove the
      `<topic>-tools.html` line from CLAUDE.md's S3 filing structure if both go.
- [ ] `assets/style.css` — legacy, unreferenced → **delete** + drop its CLAUDE.md mention.
- [ ] `assets/js/electronics-progress.js` — deprecated shim kept for rollback; once Phase 0 has
      merged and the site has been stable for a couple of weeks → **delete**.
- [ ] `Electricity Updates.rtf` — superseded → **delete** (task 0.2).
- [ ] **Archive completed planning docs** — `AUDIT-PLAN.md`, `electricity1-audit-and-improvements.md`,
      `interactive-components-improvement-plan.md`, the three `electronics-*-plan.md` files, and
      `website-fixes-plan.md` once Phase 1 lands. Move to `docs/archive/` (git-tracked, out of the
      root) rather than delete — they hold decisions. **Keep live at root:** the two topic-page
      guides, `progress-system-guide.md`, `progress-system-rollout-plan.md`, the two pages
      outlines, the two audit CSVs (until Phase 3/5 complete), this plan.
- [ ] `classes/engineering.html` + `classes/engineering/n5.html` — redirect stubs, orphaned
      internally but cheap insurance for old external bookmarks → **keep** (record the decision
      here so it isn't re-litigated).
- [ ] Remote branch prune (with 0.3): merged branches + `codex/*` + `rstewartphysics-patch-1` +
      `to-be-pulled` (verify content first).

---

## Phase 6 — CLAUDE.md & skills upkeep (after each phase, not one big rewrite)

- [ ] **CLAUDE.md corrections now:** the Science subject no longer exists on the site — remove the
      drawer-order entry (`/classes/science.html`), the Science colour-table row, and the Science
      component/footer references; fix the drawer-order section to match the real
      `_includes/site-menu.html` (Home · Physics group · Electronics · Engineering Science group ·
      About & Contact). **Model: Sonnet 5.**
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
