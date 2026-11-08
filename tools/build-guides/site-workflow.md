## Cloud or Mac — where each job runs (agreed 17 Oct 2026)

A cloud session (Claude Code on the web) sees only this repo. The Mac terminal also reaches the
page generators, the deck kit, the SQA source papers and figures, the learning-standard audit
scripts and the teacher's OneDrive. Pick the place before starting.

| Job | Where | Why |
|---|---|---|
| Site-wide sweeps: CSS, markup, contrast, nav, includes, search, removing old notices | Cloud | Everything needed is in the repo; it can screenshot every page in both appearances |
| Audits and plans written as repo docs (`tools/audits/`, `tools/build-guides/`) | Cloud | Reading and writing only; no Mac files needed |
| Edits to hand-built pages (no generator) | Either | Same result; use whichever session is open |
| **Generated pages** (practice tests, graphing, question bank, Programmable Control, pneumatic components, the four stripboard/breadboard pages) | **Mac** | The generators are in `tools/generators/` (README there), but some steps read Mac-only inputs; pneumatic components' generator is still on the Mac. A hand edit to the page is overwritten at the next run |
| Anything needing SQA figures, past papers or MIs | Mac | The source papers and figure library are not in the repo |
| Decks, booklets, tests, posters, then publishing their PDFs | Mac | The deck kit, OneDrive and LibreOffice are on the Mac |
| New topic pages and rebuilds (dual coding, dyslexia audit) | Mac | Needs the image library and the audit scripts |
| Yenka checks | Mac | Yenka runs on the Mac only |
| Anything touching pupil data | Mac only | Pupil data never leaves the Mac |
| Physics and wording judgement | The teacher | List what to check; don't guess |

**Rules for working in both places**

- **Fetch first.** Start every session with `git fetch` and work from `origin/main`. PRs are merged
  online, so a local `main` is often behind.
- **One session at a time on a shared stylesheet** (`assets/css/*.css` and the subject sheets). If
  another open branch touches the same sheet, finish and merge that one first.
- **Bump a stylesheet's `?v=` only in the last commit before the PR**, after rebasing on
  `origin/main`. That stops two branches fighting over the same `?v=` lines.
- **Cloud branches are `claude/<job>`; Mac branches are named for the job.** Neither commits to
  `main`.
- **Never hand-edit a generated page.** Change the generator, re-run it, and commit both. A cloud
  session that finds a generated page needing a change adds the job to `tools/OPEN-JOBS.md`.
  CI enforces this: `python3 tools/generators/regen_all.py --check` re-runs every generator in
  `tools/generators/` and fails if any committed page changes.

---
