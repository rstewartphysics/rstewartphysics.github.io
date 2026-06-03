# SITE_AUDIT.md

Audit date: 2026-06-03. Every HTML file read; all internal links and asset references cross-checked against the actual file tree and CLAUDE.md design standards.

---

## 1. Broken internal links and missing pages

### 1a. Page that does not exist

`/classes/s3-physics/electricity-2-practical.html` is referenced in three places but the file does not exist in the repo.

| File | Line | Reference |
|------|------|-----------|
| `classes/s3-physics/electricity-2b.html` | 609 | `<a href="…electricity-2-practical.html">` (button) |
| `classes/s3-physics/electricity-2b.html` | 729 | `<a href="…electricity-2-practical.html">` (list item) |
| `classes/s3-physics/electricity-2b.html` | 745 | `<a href="…electricity-2-practical.html">` (inline link) |
| `classes/s3-physics/electricity-2-tools.html` | 530 | `<a href="…electricity-2-practical.html">` (button) |

### 1b. PDF linked as file that is .docx only

`/classes/s2/physics/Transport%20and%20Forces%20KBC.pdf` — only a `.docx` version exists (`Transport and Forces KBC.docx`). No PDF counterpart.

| File | Line |
|------|------|
| `classes/s2-forces.html` | 644 |

---

## 2. Missing images

Six `src` attributes reference filenames that do not match any file in the repo. In every case the real file exists with a different name.

| File | Line | Broken `src` | Correct filename |
|------|------|-------------|-----------------|
| `classes/s1-cells.html` | 105 | `cellsbaner.png` | `cellsbanner.png` |
| `classes/s1-chemical-reactions.html` | 105 | `chemicalbaner.png` | `chemicalbanner.png` |
| `classes/s1-energy.html` | 105 | `Energysbaner.png` | `Energybanner.png` |
| `classes/s2-fuels-and-metals.html` | 105 | `fuelsbaner.png` | `fuelsbanner.png` |
| `classes/s1-sampling.html` | 105 | `samplingbaner.png` | `samplingbanner.png` |
| `classes/electronics/simulations.html` | 147 | `sim-placeholder.png` | **does not exist** — file missing from repo entirely |

---

## 3. Inconsistent or poor filenames

### 3a. Typo in booklet filename (committed to git)
`assets/engineering-science/national-5/01-engineering-contexts-and-systems/N5EngSci 1 - Contenxt and systems FINAL.pdf`
— "Contenxt" should be "Contexts". The page links already use the misspelled name so both would need to change together.

### 3b. Unprofessional image filename
`assets/engineering/ChatGPT Image Jan 15, 2026, 03_31_39 PM.png` — contains spaces, a date stamp, and "ChatGPT" in the name. Not linked from any page.

### 3c. Filenames with trailing spaces (in `classes/s2/physics/`)
- `Speed Experment Questions .pdf` — trailing space and "Experment" typo
- `Speed Questions .pdf` — trailing space
- `Success Criteria .pdf` — trailing space

### 3d. Folder casing inconsistency
- `assets/S3/` and `classes/S1/` use uppercase
- `assets/s3physicsbanner.png` and `assets/s3/` (engineering science) use lowercase
- `assets/BGE/` uses uppercase; `assets/n5/`, `assets/adv/` use lowercase

---

## 4. Pages referenced in the nav that don't exist

The global nav drawer (`_includes/site-menu.html`) is correct — all links in it resolve to existing pages. No issues in the nav itself.

---

## 5. Files in the repo not linked from anywhere

### 5a. Orphaned HTML pages (unlinked)

| File | Notes |
|------|-------|
| `classes/physics2.html` | Old dark-theme version of Physics hub. Superseded by `physics.html`. |
| `classes/higher-physics2.html` | Duplicate of `higher-physics.html`. Identical content. |
| `classes/s1-periodic-table2.html` | Unlinked duplicate of `s1-periodic-table.html`. |
| `classes/s2-body-systems.html` | Never linked; the science hub links to `classes/s2/bodysystems.html` instead. |
| `classes/s3-physics/electricity1b.html` | Variant of `electricity1.html`. Unlinked. |
| `classes/s3-physics/electricity-2b.html` | Contains broken links to `electricity-2-practical.html`. Unlinked. |
| `classes/electronics/stripboardbuilder2.html` | Duplicate of `stripboard-builder.html`. Unlinked. |
| `classes/electronics/555-astable2.html` | Duplicate of `555-astable.html`. Unlinked. |
| `classes/engineering.html` | Meta-refresh redirect to `engineering-science.html`. Intentional? |
| `classes/engineering/n5.html` | Meta-refresh redirect to `n5-engineering-science.html`. Intentional? |

### 5b. Orphaned assets (not referenced from any HTML)

| File | Notes |
|------|-------|
| `assets/homepagebanner.png` | Not referenced anywhere. |
| `assets/homepagebanner2.png` | Not referenced anywhere. |
| `assets/style.css` | Not linked from any page. |
| `assets/n5/n5physicsacademy.png` | Image exists but no page links to it. |
| `assets/engineering/ChatGPT Image Jan 15, 2026, 03_31_39 PM.png` | Not linked. Bad filename. |
| `assets/higher/physicsscotland.png` | Image exists but no page uses it. |

---

## 6. .DS_Store and Mac junk files

`.DS_Store` files are present on disk in multiple directories but are **not tracked in git** (cleaned up in commit `604b611`). The `.gitignore` pattern `.DS_Store` (without a leading `/`) correctly covers all subdirectories, so future adds will be blocked. No action needed beyond confirming the pattern works on your system.

Disk-only `.DS_Store` locations: `.`, `assets/`, `assets/engineering-science/`, `assets/engineering-science/national-5/`, `assets/engineering-science/national-5/02-energy-and-efficiency/`, `assets/engineering-science/s3/`, `assets/engineering-science/shared/`, `classes/`.

---

## 7. Pages missing the standard navigation drawer

21 pages do not include `{% include site-menu.html %}` or link `site-menu.css` — these have no hamburger menu at all.

| File |
|------|
| `classes/physics2.html` |
| `classes/workinprogress.html` |
| `classes/s1-waves.html` |
| `classes/s1-cells.html` |
| `classes/s1-energy.html` |
| `classes/s1-sampling.html` |
| `classes/s1-chemical-reactions.html` |
| `classes/s2-health-and-disease.html` |
| `classes/s2-fuels-and-metals.html` |
| `classes/s2-body-systems.html` |
| `classes/engineering.html` |
| `classes/engineering/n5.html` |
| `classes/higher/simulations.html` |
| `classes/higher/relativity-simulation.html` |
| `classes/electronics/notes.html` |
| `classes/electronics/videos.html` |
| `classes/electronics/simulations.html` |
| `classes/electronics/555-astable.html` |
| `classes/electronics/555-astable2.html` |
| `classes/electronics/stripboard-builder.html` |
| `classes/electronics/stripboardbuilder2.html` |

---

## 8. Wrong colour theme for subject

| File | Current theme | Expected per CLAUDE.md |
|------|--------------|------------------------|
| `classes/s3-n5-physics.html` | Pink (`--accent:#d74a84`) | Teal physics theme (`--accent:#0aa8b5`) — pink is undocumented |
| `classes/adv-higher-physics.html` | Gold/cream (`--accent:#b8860b`) | Not in CLAUDE.md; arguably acceptable as distinct AH identity but not documented |

---

## 9. Missing required accessibility features

### 9a. Skip link missing (30 pages)
All pages are required to have `<a class="skip-link" href="#mainContent">Skip to content</a>`. Missing from:

`classes/physics2.html`, `classes/n5-engineering-assignment-prep.html`, `classes/s2-health-and-disease.html`, `classes/s1-sampling.html`, `classes/workinprogress.html`, `classes/s1-cells.html`, `classes/engineering.html`, `classes/s2-fuels-and-metals.html`, `classes/s3-engineering-science.html`, `classes/s1-chemical-reactions.html`, `classes/n5-engineering-science.html`, `classes/s2-body-systems.html`, `classes/s1-energy.html`, `classes/engineering-science.html`, `classes/s1-waves.html`, `classes/s3-physics/electricity1b.html`, `classes/higher/simulations.html`, `classes/electronics/555-astable.html`, `classes/s3-physics/electricity1.html`, `classes/electronics/notes.html`, `classes/electronics/videos.html`, `classes/higher/relativity-simulation.html`, `classes/electronics/simulations.html`, `classes/electronics/555-astable2.html`, `classes/electronics/stripboardbuilder2.html`, `classes/s3-engineering/electronics.html`, `classes/s3-engineering/logic.html`, `classes/s3-engineering/energy.html`, `classes/s3-engineering/what-is-an-engineer.html`, `classes/s3-engineering/mechanisms.html`, `classes/s3-engineering/pneumatics.html`, `classes/electronics/stripboard-builder.html`, `classes/engineering/n5.html`, `classes/s3-engineering/computer-control.html`

### 9b. `prefers-reduced-motion` block missing (30 pages)
Required on all pages. Missing from same set as skip link, plus: `classes/s3-physics/electricity-3.html`, `classes/s3-physics/electricity1b.html`, `classes/s3-physics/electricity1.html`.

### 9c. `lang="en"` missing on `<html>` element (19 pages)
`classes/physics2.html`, `classes/s2-health-and-disease.html`, `classes/s1-sampling.html`, `classes/workinprogress.html`, `classes/s1-cells.html`, `classes/engineering.html`, `classes/s2-body-systems.html`, `classes/s1-chemical-reactions.html`, `classes/s1-waves.html`, `classes/s2-fuels-and-metals.html`, `classes/higher/simulations.html`, `classes/s1-energy.html`, `classes/electronics/videos.html`, `classes/electronics/stripboardbuilder2.html`, `classes/electronics/555-astable.html`, `classes/electronics/simulations.html`, `classes/electronics/stripboard-builder.html`, `classes/electronics/555-astable2.html`, `classes/engineering/n5.html`, `classes/electronics/notes.html`

### 9d. `viewport-fit=cover` missing (32 pages)
Required for safe-area support on iOS. Notable omissions: `classes/s3-n5-physics.html`, `classes/adv-higher-physics.html`, `classes/s2-electricity.html`, and all older S1/S2 topic pages, all electronics sub-pages.

---

## 10. Wrong layout class

`classes/higher-physics.html` and `classes/higher-physics2.html` use `<main class="page-wrap">` with `max-width: 1200px` instead of the standard `1100px`. Minor but inconsistent with all other Physics pages.

Engineering Science pages correctly use `<main class="container">` as required.

---

## 11. Non-standard banner markup

| File | Issue |
|------|-------|
| `classes/adv-higher-physics.html` | Banner uses `<div class="banner-wrap">` not `<header class="banner-wrap">` |
| `classes/s3-n5-physics.html` | Banner uses `<div class="banner-wrap">` not `<header class="banner-wrap">` |
| `classes/s3-physics.html` | Banner uses `<header class="banner-wrap">` with `max-height` instead of `height: clamp(…)` |
| `classes/physics2.html` | Banner uses `<div class="banner-wrap">` — entirely non-standard |
| Several old S1/S2 pages | Banner uses raw `<div>` with no `banner-overlay-text` bottom bar at all |

---

## 12. Pages missing the standard footer

27 pages have no `<footer>` element. Most notably the Engineering Science hub pages and all S3 Engineering topic pages:

`classes/n5-engineering-assignment-prep.html`, `classes/s2-health-and-disease.html`, `classes/s1-sampling.html`, `classes/s1-cells.html`, `classes/s2-fuels-and-metals.html`, `classes/s3-engineering-science.html`, `classes/engineering.html`, `classes/n5-engineering-science.html`, `classes/s2-body-systems.html`, `classes/s1-chemical-reactions.html`, `classes/s1-energy.html`, `classes/engineering-science.html`, `classes/higher/relativity-simulation.html`, `classes/electronics/videos.html`, `classes/electronics/555-astable.html`, `classes/electronics/stripboardbuilder2.html`, `classes/electronics/notes.html`, `classes/electronics/555-astable2.html`, `classes/electronics/stripboard-builder.html`, `classes/s3-engineering/energy.html`, `classes/s3-engineering/logic.html`, `classes/s3-engineering/electronics.html`, `classes/s3-engineering/pneumatics.html`, `classes/s3-engineering/computer-control.html`, `classes/s3-engineering/what-is-an-engineer.html`, `classes/s3-engineering/mechanisms.html`, `classes/engineering/n5.html`

---

## 13. Broken or non-standard tile/card styles

| File | Issue |
|------|-------|
| `classes/s3-physics.html` | Uses custom `.tile` class not in the design system; the source has stray CSS fragments in the `<style>` block between lines 111–129 (floating property declarations with no selector — leftover from a removed custom menu) |
| `classes/s3-n5-physics.html` | Contains dead JS at lines 601–628 (event listener fragments with no context, referencing undefined `focusables` variable) |
| `classes/adv-higher-physics.html` | Contains a broken inline `<script>` block (lines 638–691) referencing undefined `closeLink`, `overlay`, and `focusables` — will throw `ReferenceError` in the browser console |
| `classes/physics2.html` | Uses CSS `background-image` tiles with no overlay text — no accessible label |

---

## 14. `background-attachment: fixed` (banned pattern)

Renders as `scroll` on iOS Safari causing visual glitches. Present on 12 pages:

| File | Line |
|------|------|
| `classes/workinprogress.html` | 25 |
| `classes/physics2.html` | 33 |
| `classes/s1-waves.html` | 26 |
| `classes/s3-physics/electricity1.html` | 67 |
| `classes/s3-physics/electricity1b.html` | 67 |
| `classes/electronics/prel-checklist.html` | 63 |
| `classes/electronics/555-astable.html` | 39 |
| `classes/electronics/555-astable2.html` | 39 |
| `classes/electronics/stripboard-builder.html` | 26 |
| `classes/electronics/simulations.html` | 25 |
| `classes/higher/simulations.html` | 41 |
| `classes/higher/relativity-simulation.html` | 16 |

Note: `classes/electronics/prel-checklist.html:75` already has the iOS override (`body{ background-attachment: scroll; }`). The same fix should be applied to the others, or the property removed.

---

## 15. Other visual inconsistencies

| File | Issue |
|------|-------|
| `classes/higher-physics.html` | `site-menu.css` and `site-menu.js` are linked **twice** (lines 22–23 and 27–28) — causes duplicate network requests |
| `classes/workinprogress.html` | Has no `<html>`, `<head>`, or `<body>` tags; starts directly with `<meta>` — not valid HTML |
| `classes/physics2.html` | Dark blue/purple theme, no nav, no skip link, not linked from anywhere — should be deleted |
| `classes/higher-physics2.html` | Exact duplicate of `higher-physics.html` content (both correct) — one should be deleted |
| `classes/s1-periodic-table2.html` | Unlinked duplicate of `s1-periodic-table.html` |

---

## Priority fix list

### Priority 1 — Broken, affects all users

1. **Fix 5 broken banner image `src` attributes** — single-character typos causing missing images on five S1/S2 topic pages.
   - `s1-cells.html:105` `cellsbaner` → `cellsbanner`
   - `s1-chemical-reactions.html:105` `chemicalbaner` → `chemicalbanner`
   - `s1-energy.html:105` `Energysbaner` → `Energybanner`
   - `s2-fuels-and-metals.html:105` `fuelsbaner` → `fuelsbanner`
   - `s1-sampling.html:105` `samplingbaner` → `samplingbanner`

2. **Fix broken `electricity-2-practical.html` links** — create the missing page or redirect links to the existing `electricity-2.html`. Affects `electricity-2b.html` (lines 609, 729, 745) and `electricity-2-tools.html` (line 530).

3. **Fix or remove `sim-placeholder.png` reference** — `electronics/simulations.html:147` references a file that does not exist.

4. **Fix broken PDF link** — `s2-forces.html:644` links to a `.pdf` that only exists as `.docx`. Either export a PDF or update the link.

5. **Add the global nav to 21 pages** — Students on these pages cannot navigate elsewhere. Most critical: `s1-waves.html`, `s1-cells.html`, `s1-energy.html`, `s1-sampling.html`, `s1-chemical-reactions.html`, `s2-health-and-disease.html`, `s2-fuels-and-metals.html`, `electronics/notes.html`, `electronics/videos.html`, `electronics/simulations.html`, `electronics/555-astable.html`, `electronics/stripboard-builder.html`, `higher/simulations.html`, `higher/relativity-simulation.html`.

6. **Remove `background-attachment: fixed` from 12 pages** — replace with `scroll` or remove the declaration. Breaks the visual on every iPad and iPhone in the school.

### Priority 2 — Design inconsistency, affects experience

7. **Fix broken inline scripts** in `adv-higher-physics.html` (lines 638–691), `s3-n5-physics.html` (lines 601–628), and `s3-physics.html` (lines 111–129 stray CSS). These throw console errors or contain invisible dead code.

8. **Remove duplicate stylesheet/script links** in `higher-physics.html` (lines 27–28).

9. **Add skip link** to the 30 pages that are missing it — especially `n5-engineering-science.html`, `s3-engineering-science.html`, `engineering-science.html`, `n5-engineering-assignment-prep.html`, and all `s3-engineering/` topic pages.

10. **Add `<footer>`** to 27 pages — especially all Engineering Science pages which currently have no footer.

11. **Add `prefers-reduced-motion` block** to 30 pages.

12. **Fix banner `<div>` → `<header>`** in `adv-higher-physics.html` and `s3-n5-physics.html`.

13. **Document or correct N5 Physics pink theme** — `s3-n5-physics.html` uses `#d74a84` which is not in CLAUDE.md. Either add it to CLAUDE.md or align it with the teal Physics theme.

14. **Fix `workinprogress.html`** — add proper `<html lang="en"><head><body>` structure, nav, skip link, and footer. Remove `background-attachment: fixed`.

15. **Add `lang="en"`** to 19 pages and **`viewport-fit=cover`** to 32 pages.

### Priority 3 — Housekeeping and minor issues

16. **Delete or archive orphaned duplicate pages**: `physics2.html`, `higher-physics2.html`, `s1-periodic-table2.html`, `electricity1b.html`, `electricity-2b.html`, `stripboardbuilder2.html`, `555-astable2.html`, `s2-body-systems.html`.

17. **Remove unlinked assets**: `homepagebanner.png`, `homepagebanner2.png`, `style.css`, `n5/n5physicsacademy.png`, `higher/physicsscotland.png`, `engineering/ChatGPT Image Jan 15, 2026, 03_31_39 PM.png`.

18. **Fix filename typo** — rename `N5EngSci 1 - Contenxt and systems FINAL.pdf` to `N5EngSci 1 - Contexts and Systems FINAL.pdf` and update the two links that reference it.

19. **Fix trailing-space filenames** in `classes/s2/physics/` (`Speed Experment Questions .pdf`, `Success Criteria .pdf`, `Speed Questions .pdf`).

20. **Rename** `assets/engineering/ChatGPT Image Jan 15, 2026, 03_31_39 PM.png` to something descriptive without spaces.

21. **Standardise asset folder casing** — decide on lowercase and rename `assets/S3/` → `assets/s3/`, `assets/BGE/` → `assets/bge/`, `classes/S1/` → `classes/s1/` (update all links accordingly).

22. **Add `**/.DS_Store` to `.gitignore`** as a belt-and-braces measure alongside the existing `.DS_Store` entry, to make the pattern explicit for all nested directories regardless of git version.
