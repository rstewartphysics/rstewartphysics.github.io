# Page generators

These scripts build the site's generated pages. **Edit the source here and re-run; never edit
the page.** `tools/` is excluded from the Jekyll build. Each script writes into this repo,
worked out from where the script sits, so it runs from any folder.

| Generator | Run | Writes |
|---|---|---|
| Programmable Control | `python3 tools/generators/programmable-control/build_page.py` | `classes/n5-engineering/programmable-control.html` |
| Practice tests | `cd` into the test's folder, then `python3 build.py` / `build_b.py` (S3 Eng and AH Stellar: `build.py a` / `build.py b`; S3 Electricity 1 graphing: `build_graphing.py`) | `classes/{s3-physics/electricity1,s3-engineering,higher/practice-tests,adv/practice-tests}/…` |
| Unit 1 question bank | `python3 tools/generators/mcq-bank/build_all.py` | `classes/n5-engineering/unit-1-question-bank.html` |
| Block 6 build guides (Node) | `node tools/build-guides/build-guides.mjs` | `assets/guides/*.json`, read by `assets/js/build-guide.js` |
| Test bench solver (Node) | `npm run bench` (tests, then writes; `-- --check` in CI, `-- --report f.md` for every reading's range) | `assets/js/test-bench-engine.js`, from `test-bench/` and the build guide's layouts |
| Stripboard / breadboard pages | `python3 tools/generators/stripboard/page/build.py` | the four Builder / Planner pages in `classes/electronics/`, and `assets/js/stripboard.js` |

**Re-run them all:** `python3 tools/generators/regen_all.py`. With `--check` it then fails if git
sees any change — CI runs that first on every pull request, so a hand edit to a generated page,
or a generator change that was never re-run, is caught before it is lost. Run it from a clean
tree. The packages are pinned in `requirements.txt` to the Mac's versions, because matplotlib's
SVG output changes between releases; CI also installs Trebuchet MS (Microsoft's core fonts),
the graphs' font. A new generator goes in `RUNS` in `regen_all.py` as well as in the table above.

Engine tests (macOS JavaScriptCore, no Node needed): `sh run.sh`, `sh run-bb.sh` and
`sh run-verify.sh` in `stripboard/engine/`. The stripboard `build.py` also writes the shared
engine bundle `assets/js/stripboard.js`, which the four pages load; `npm run stripboard -- --check`
(CI) proves it matches `engine/`.

## Mac-only steps

The repo is public, so some inputs stay on the Mac. Without them every page still builds.

- **Programmable Control.** `--recut` cuts the figures again from the lesson decks into
  `figures/` (commit the result). `--copy-assets` copies the photos, practical sheets (OneDrive)
  and sim file into `assets/`.
- **Practice tests.** The past-paper blacklists live in `~/claude-work/practice-tests/`. When
  they are there, the Higher and AH builds check every quantity against them; when they are not
  (CI), the build prints "blacklist: not on this machine" and carries on. Planning notes for
  each test are in the `~/claude-work/practice-tests/` copy of its `.md` file.
- **Stripboard.** `build.py --preview --drive=…` reads the UI drivers from
  `~/claude-work/stripboard-builder/page/drivers/`.

Side outputs (marking instructions, answer files, the stand-alone quiz, previews) are written
beside each script and ignored by git.
