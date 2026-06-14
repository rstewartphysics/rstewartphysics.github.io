# SITE_AUDITv2.md

Audit date: 2026-06-03. Post-fix audit following Priority 1, 2, 3 repairs from the previous SITE_AUDIT.md cycle.

---

## 1. Broken internal links and missing pages

### 1.1 Missing image asset — sim-placeholder.png
- **File:** `classes/electronics/simulations.html:154`
- `<img src="/assets/electronics/sim-placeholder.png" alt="">` — this file does not exist on disk. The page even has a TODO comment acknowledging this (`simulations.html:153`). The `<img>` renders as a broken image for all users.

### 1.2 Broken relative path link — electricity1.html
- **File:** `classes/s3-physics/electricity1.html:726`
- Link: `href="assets/electronics/revision/N5 Practical Electronics PPQ Nov25 Update-2.pdf"` — this is a **relative path** (no leading `/`). When served from `/classes/s3-physics/`, the browser resolves it as `/classes/s3-physics/assets/electronics/...` which does not exist. The correct absolute path is `/assets/electronics/revision/N5%20Practical%20Electronics%20PPQ%20Nov25%20Update-2.pdf`.

### 1.3 electricity-2-tools.html — orphaned page (not linked from anywhere)
- **File:** `classes/s3-physics/electricity-2-tools.html` exists in the repo but is not referenced by any other HTML page. Students cannot reach it via the site navigation.

### 1.4 All internal page links from the nav drawer verified OK
All six pages listed in `_includes/site-menu.html` resolve to existing files:
- `/classes/science.html` ✓
- `/classes/engineering-science.html` ✓
- `/classes/s3-physics.html`, `/classes/s3-n5-physics.html`, `/classes/higher-physics.html`, `/classes/adv-higher-physics.html` ✓
- `/classes/electronics.html` ✓
- `/classes/s3-engineering-science.html`, `/classes/n5-engineering-science.html` ✓

---

## 2. Missing or broken asset/image references

### 2.1 sim-placeholder.png missing (see §1.1 above)
- `classes/electronics/simulations.html:154` → `/assets/electronics/sim-placeholder.png` — **file does not exist**.

### 2.2 Relative-path PDF broken (see §1.2 above)
- `classes/s3-physics/electricity1.html:726` → `assets/electronics/revision/N5 Practical...` — resolves incorrectly.

### 2.3 All other referenced assets verified to exist
All other `/assets/...` `src=` and `href=` values were checked against the filesystem. No additional missing assets were found (URL-encoded paths confirmed to match actual filenames on disk).

---

## 3. Inconsistent or poor filenames

### 3.1 Uppercase/mixed-case asset names in `/assets/` root
The following files use uppercase letters, which will cause 404 errors on case-sensitive servers (Linux/GitHub Pages):

| File | Risk |
|------|------|
| `/assets/Wavesbaner.png` | Referenced correctly from `science.html`, but capitalised |
| `/assets/Engeneringbanner.png` | Typo: "Engenering" instead of "Engineering". Referenced consistently across all Eng Science pages so it works, but the typo is a maintenance trap. |
| `/assets/Electronicsbanner.png` | Uppercase E, referenced consistently |
| `/assets/Energybanner.png` | Uppercase E, referenced consistently |
| `/assets/s3/Electricity2/` (directory) | Mixed-case folder; images inside are orphaned (see §5) |

### 3.2 Files with spaces in filenames
Over 30 asset and class files have spaces in their names (e.g. `RS Electricity B1 N5 2025.pdf`, `S1 Waves Practice Tests.pdf`, `N5 Engineering Science past papers by topic 2014-2023.pdf`). These are served correctly when URL-encoded in HTML, but are risky on some servers and awkward to reference. Full list of space-containing files is below (subset shown):

- `classes/s3-physics/RS Electricity B1 N5 2025.pdf`
- `classes/s3-physics/Electricity Block 1 Practice Test.pdf`
- `classes/s3-physics/RS Electricity B2 N5 2025.pdf`
- `classes/s3-physics/N5 Practical Electronics PPQ Nov25 Update.pdf`
- `assets/s3/Electricity B2 (s3_n5) — Knowledge Organiser.pdf`
- `assets/s3/Electricity3/Block 3 Practice Questions.pdf` (and others in that folder)
- `assets/engineering-science/national-5/.../BHS N5 EngSci 1 - Contexts and Systems PPT.pdf`
- `assets/engineering-science/shared/past-papers/N5 Engineering Science past papers by topic 2014-2023.pdf`
- `classes/n5-physics/N5 Physics Past Papers (September 2025 Update).pdf`
- `classes/higher/Higher Physics Past Papers (September 2025 Update).pdf`

### 3.3 Typo in CLAUDE.md-listed banner filename
`assets/Engeneringbanner.png` — "Engenering" is consistently misspelled. All Engineering Science pages reference this filename so the site functions, but renaming to `Engineeringbanner.png` would require updating all references simultaneously.

---

## 4. Nav drawer — pages or links missing

The nav drawer (`_includes/site-menu.html`) is correct and complete per CLAUDE.md specification:
- Home → `/`
- Science → `/classes/science.html`
- Engineering Science → `/classes/engineering-science.html`
- Physics group (S3, N5, Higher, Advanced Higher)
- Electronics → `/classes/electronics.html`
- Engineering Science group (S3, N5, Higher coming soon)

**No pages are missing from the nav.** Individual topic pages (s3-physics subpages, electronics subpages, s1/s2 topic pages) are correctly excluded per CLAUDE.md.

**Note:** The menu has two separate "Engineering Science" entries — a direct link and a group. This matches the CLAUDE.md specification, but may be slightly confusing UX for users.

---

## 5. Orphaned files (not linked from anywhere)

These files exist in the repo but are not referenced by any HTML page (confirmed by cross-referencing all `href=` and `src=` values):

| File | Notes |
|------|-------|
| `assets/electronics/555.jpg` | Older version of the 555 image; `555new.jpg` is used instead |
| `assets/electronics/simslogo.png` | Not referenced from any page |
| `assets/electronics/stripboard/mockprocess.jpeg` | `.jpeg` version orphaned; `.jpg` version is used |
| `assets/s3/Electricity2/booklet.png` | Orphaned; the folder and all its images are unused |
| `assets/s3/Electricity2/electronicsPPQ.png` | Orphaned |
| `assets/s3/Electricity2/ko.png` | Orphaned |
| `assets/s3/Electricity2/physicsPPQ.png` | Orphaned |
| `assets/engineering-science/national-5/CfE_CourseSpec_N4_Technologies_EngineeringScience.pdf` | Not linked from any page |

**Note:** Files in `classes/s3-physics/electricity-2-tools.html` page itself is orphaned (no HTML links to it — see §1.3).

---

## 6. Mac junk files tracked in git

Running `git ls-files | grep -i DS_Store` returns no output — no `.DS_Store` files are tracked in git. However, the following `.DS_Store` files **exist on disk** (not tracked):

- `./.DS_Store`
- `./assets/.DS_Store`
- `./assets/engineering-science/.DS_Store`
- `./assets/engineering-science/higher/.DS_Store`
- `./assets/engineering-science/national-5/.DS_Store`
- `./assets/engineering-science/s3/.DS_Store`
- `./assets/engineering-science/shared/.DS_Store`
- `./classes/.DS_Store`

These are not in git, so no action is required from a repo perspective. Confirm `.gitignore` covers `**/.DS_Store`.

---

## 7. Pages missing navigation drawer

All pages that should have `{% include site-menu.html %}` do include it. Confirmed across:
- All hub pages (index, science, physics, electronics, engineering-science, s3-physics, s3-n5-physics, higher-physics, adv-higher-physics)
- All Electronics subpages (notes, revision, videos, 555-astable, prel-checklist, simulations, stripboard-builder)
- All S3 Engineering subpages
- All S3 Physics subpages (electricity1, electricity-2, electricity-3, electricity-2-tools)
- All Engineering Science hub pages (engineering-science, n5-engineering-science, s3-engineering-science, n5-engineering-assignment-prep)
- S1/S2 topic pages (s1-waves, s1-periodic-table, s2-acids-and-alkalis, s2-electricity, s2-forces, s2/bodysystems)
- Higher subpages (simulations, relativity-simulation)

**No pages are missing the nav drawer.**

However, `classes/s3-physics/electricity1.html` includes the site menu but is **missing the `<a class="skip-link" href="#mainContent">Skip to content</a>`** element that should precede it (line 309 — body opens directly with `{% include site-menu.html %}`).

Additionally, `classes/s3-physics/electricity1.html` uses `<main class="page-wrap">` without `id="mainContent"` (line 326), so the skip link target does not exist even if the skip link were added.

---

## 8. Wrong colour theme for subject

### 8.1 S1/S2 stub pages use wrong accent colour
The following pages are "Work in Progress" stubs that use `--page-accent: #2563eb` (generic blue) instead of the Science green (`#16a34a`):

- `classes/s1-cells.html:20`
- `classes/s1-chemical-reactions.html:20`
- `classes/s1-energy.html:20`
- `classes/s1-sampling.html:20`
- `classes/s2-fuels-and-metals.html:20`
- `classes/s2-health-and-disease.html:20`

### 8.2 s1-waves.html uses wrong accent colour
- `classes/s1-waves.html:22` — uses `--page-accent: #2563eb` (blue). Science pages should use `#16a34a` (green).

### 8.3 s2-forces.html uses slightly wrong accent
- `classes/s2-forces.html:57` — uses `--accent: #2c63ff` (blue). Should be teal/blue matching the S2 Science palette per CLAUDE.md rather than a custom blue.

### 8.4 electronics/revision.html — uses `color-scheme: light` (should be dark)
- `classes/electronics/revision.html:11` — `<meta name="color-scheme" content="light">`. The Electronics theme is dark-themed (`color-scheme: dark` per CLAUDE.md). The hub page (`electronics.html`) correctly uses `dark`. The revision subpage should match.

---

## 9. Missing accessibility features

### 9.1 Skip link missing — electricity1.html
- `classes/s3-physics/electricity1.html` — no `<a class="skip-link" href="#mainContent">Skip to content</a>` in the page body.

### 9.2 `id="mainContent"` missing on `<main>` — electricity1.html
- `classes/s3-physics/electricity1.html:326` — `<main class="page-wrap">` has no `id="mainContent"`. The skip link target is missing.

### 9.3 `prefers-reduced-motion` missing — electricity1.html and electricity-3.html
These two pages have no `@media (prefers-reduced-motion: reduce)` block in their inline styles:
- `classes/s3-physics/electricity1.html`
- `classes/s3-physics/electricity-3.html`

(Engineering Science pages, S1/S2 stub pages, and redirect pages are covered via `engineering-science.css` or are non-animated stubs.)

### 9.4 `<meta name="color-scheme">` missing — multiple pages
Pages missing this meta tag (excluding redirect pages and Engineering Science pages covered by external CSS):
- `classes/electronics/555-astable.html`
- `classes/electronics/notes.html`
- `classes/electronics/simulations.html`
- `classes/electronics/stripboard-builder.html`
- `classes/electronics/videos.html`
- `classes/higher/relativity-simulation.html`
- `classes/higher/simulations.html`
- `classes/s1-cells.html`, `classes/s1-chemical-reactions.html`, `classes/s1-energy.html`, `classes/s1-sampling.html`
- `classes/s2-fuels-and-metals.html`, `classes/s2-health-and-disease.html`
- `classes/s3-physics/electricity1.html`
- `classes/workinprogress.html`

### 9.5 `<!DOCTYPE html>` and `<meta charset>` missing — multiple pages
All the following pages are missing both `<!DOCTYPE html>` and `<meta charset="UTF-8">`:
- `classes/electronics/555-astable.html`
- `classes/electronics/notes.html`
- `classes/electronics/simulations.html`
- `classes/electronics/stripboard-builder.html`
- `classes/electronics/videos.html`
- `classes/higher/simulations.html`
- `classes/s1-cells.html`, `classes/s1-chemical-reactions.html`, `classes/s1-energy.html`, `classes/s1-sampling.html`
- `classes/s2-fuels-and-metals.html`, `classes/s2-health-and-disease.html`

`classes/workinprogress.html` has `<!DOCTYPE html>` but no `<meta charset>`.

---

## 10. Wrong layout class

### 10.1 No wrong layout class found on hub pages
Hub pages that should use `<main class="page-wrap">` all do so correctly. Engineering Science pages all correctly use `<main class="container">`.

### 10.2 electricity1.html — `<main>` missing `id` (layout-adjacent issue, see §9.2)
`classes/s3-physics/electricity1.html:326` — `<main class="page-wrap">` has no `id="mainContent"`.

### 10.3 relativity-simulation.html — `<main>` uses non-standard structure
`classes/higher/relativity-simulation.html` — uses `<div class="page-wrap" id="mainContent">` not `<main class="page-wrap" id="mainContent">`. The semantic `<main>` element is missing.

---

## 11. Non-standard or missing banner markup

### 11.1 `<div>` used instead of `<header>` for banner-wrap — widespread
CLAUDE.md requires `<header class="banner-wrap">`. The following pages use `<div class="banner-wrap">` instead:

- `classes/s3-physics/electricity1.html:317`
- `classes/s3-physics/electricity-2.html:945`
- `classes/s3-physics/electricity-3.html:554`
- `classes/s3-physics/electricity-2-tools.html:504`
- `classes/s1-periodic-table.html:648`
- `classes/s1-waves.html:183`
- `classes/s1-cells.html:109`, `classes/s1-chemical-reactions.html:109`, `classes/s1-energy.html:109`, `classes/s1-sampling.html:109`
- `classes/s2-forces.html:526`
- `classes/s2-fuels-and-metals.html:109`, `classes/s2-health-and-disease.html:109`
- `classes/s2/bodysystems.html:628`
- `classes/higher/simulations.html:161`
- `classes/electronics/notes.html:86`
- `classes/electronics/videos.html:63`
- `classes/electronics/simulations.html:135`
- `classes/electronics/prel-checklist.html:443`

### 11.2 science.html — banner uses `.banner-titlebar` not `.banner-overlay-text`
- `classes/science.html:385` — the banner title bar uses `<div class="banner-titlebar">` rather than `<div class="banner-overlay-text">`. This is a Science-specific variant with consistent styling, but deviates from the CLAUDE.md template name.

### 11.3 electronics/revision.html — banner uses non-standard `color-scheme: light`
- `classes/electronics/revision.html:11` — uses light color-scheme. All Electronics pages should use `dark` (see §8.4).

---

## 12. Missing footer

No pages are missing a `<footer>` element. All pages audited have a footer.

**Minor inconsistency:** `classes/s3-physics/electricity1.html:1002` — footer text uses `&` unencoded: `© Mr R Stewart's Science, Physics, Electronics & Engineering` (missing `&amp;`). All other pages use `&amp;` correctly.

---

## 13. Inconsistent tile/card styles

### 13.1 s3-physics sub-pages use custom tile class `.tile` not `a.card`
Pages `electricity-2.html`, `electricity-3.html`, `s3-physics.html` use a custom `.tile` class with its own CSS rather than the `a.card` component defined in CLAUDE.md for the Physics/teal theme. This is a consistent local pattern (not a broken style) but diverges from the design system.

### 13.2 S1/S2 WIP stubs — do not use Science tile styles
The six WIP Science stub pages (`s1-cells`, `s1-chemical-reactions`, `s1-energy`, `s1-sampling`, `s2-fuels-and-metals`, `s2-health-and-disease`) use an older dark full-page background (`radial-gradient` multicolour) with download-link based layouts rather than the Science hub tile grid design from `science.html`. These are pre-redesign stubs and need full rewrites to match the current Science design.

---

## 14. Banned CSS patterns

### 14.1 `background-attachment: scroll` — widespread, acceptable
The following pages use `background-attachment: scroll` (not `fixed`) — **this is the correct iOS-safe value**. These are fine.

- `classes/s3-physics/electricity1.html:67`
- `classes/electronics.html:113` (inside `@supports (-webkit-touch-callout: none)`)
- `classes/electronics/prel-checklist.html:63, 75`
- `classes/electronics/555-astable.html:43`
- `classes/electronics/simulations.html:29`
- `classes/electronics/stripboard-builder.html:30`
- `classes/higher/simulations.html:45`
- `classes/higher/relativity-simulation.html:19`
- `classes/s1-waves.html:30`
- `classes/workinprogress.html:30`

None use the banned `background-attachment: fixed`. No `parallax` patterns found. **No violations of banned CSS patterns.**

---

## 15. Dead inline scripts

### 15.1 Undeclared variables `focusables`, `closeLink`, `lastFocusEl` — 10 pages
The following pages contain a leftover inline `<script>` block that was written for an old manual menu system. The script references `focusables` and `closeLink` which are never declared. The code runs at page load, references undefined variables, and `lastFocusEl` is declared but never used. The site menu is now handled entirely by `site-menu.js`, so this code is dead weight and generates JS errors:

- `classes/s1-periodic-table.html` (lines ~889–1232)
- `classes/s2-electricity.html` (lines ~939–1269)
- `classes/s2-acids-and-alkalis.html`
- `classes/s2-forces.html` (line 774–801)
- `classes/s3-physics/electricity-3.html`
- `classes/s3-physics/electricity-2.html`
- `classes/s2/bodysystems.html`
- `classes/s3-physics/electricity-2-tools.html`
- `classes/electronics/revision.html`
- `classes/electronics/prel-checklist.html`

The event listener binds to `document.addEventListener("keydown", ...)` but the function body references undeclared `focusables` and `closeLink`, causing a `ReferenceError` at runtime.

---

## 16. Other structural/consistency issues

### 16.1 adv-higher-physics.html — `site-menu.css` link positioned after inline `<style>` block
- `classes/adv-higher-physics.html:412` — `<link rel="stylesheet" href="/assets/css/site-menu.css">` appears at line 412, just before `</head>`, **after** the inline `<style>` block (lines 14–411). Same pattern in `s3-n5-physics.html:386` and `s3-physics.html` (style at ~15, link at ~367).
- Per CLAUDE.md template, the link should come **before** the inline `<style>` block. While the site works, this means overriding site-menu styles with inline styles is unintentional rather than deliberate.

### 16.2 engineering.html and engineering/n5.html — redirect pages include site-menu unnecessarily
- `classes/engineering.html:4` and `classes/engineering/n5.html:4` — these are instant meta-refresh redirects. They include `site-menu.css`, `site-menu.js`, and `{% include site-menu.html %}` which will flash briefly before the redirect fires. This is harmless but unnecessary.

### 16.3 higher-physics.html — inline PWA manifest injection script
- `classes/higher-physics.html:738–773` — contains an inline script that creates a Blob PWA manifest at runtime. This is the only page with this pattern and is low-risk, but is non-standard for the site.

### 16.4 electricity-2.html — banner uses `<div>` not `<header>`; no `<header>` at all for a large page
- `classes/s3-physics/electricity-2.html:945` — a very large, feature-rich page that is missing the `<header>` element entirely (uses `<div class="banner-wrap">` instead).

### 16.5 s3-engineering-science.html and n5-engineering-science.html — cramped single-line HTML
Both hub pages have their entire `<main>` content condensed to a single line of HTML (no formatting). This is not a functional issue but makes future editing extremely difficult.

### 16.6 s3-physics.html — link to Past Paper PDF uses absolute external URL
- `classes/s3-physics.html:482` — `href="https://rstewartphysics.github.io/classes/n5-physics/N5%20Physics%20Past%20Papers%20(September%202025%20Update).pdf"` — uses the full external domain. All other internal PDF links use root-relative paths (`/classes/...`). This is inconsistent but works.

### 16.7 engineering-science.html cards are missing `aria-label`
- `classes/engineering-science.html` — the three `<a class="card">` elements do not have `aria-label` attributes. CLAUDE.md requires `aria-label` on all `<a class="card">` elements.

### 16.8 s3-engineering-science.html cards missing `aria-label`
- `classes/s3-engineering-science.html` — the seven `<a class="card">` elements for S3 Engineering topics do not have `aria-label` attributes.

---

## Priority fix list

### Priority 1 — Broken, affects all users

| # | Issue | File(s) | Action |
|---|-------|---------|--------|
| P1-1 | `sim-placeholder.png` missing — broken `<img>` visible to all users | `classes/electronics/simulations.html:154` | Add `assets/electronics/sim-placeholder.png` or remove the `<img>` |
| P1-2 | Relative path PDF link resolves to wrong location | `classes/s3-physics/electricity1.html:726` | Change `href="assets/electronics/..."` to `href="/assets/electronics/..."` |
| P1-3 | `electricity1.html` missing skip link and `id="mainContent"` on `<main>` | `classes/s3-physics/electricity1.html:309, 326` | Add `<a class="skip-link" href="#mainContent">Skip to content</a>` before `{% include site-menu.html %}` and add `id="mainContent"` to `<main>` |
| P1-4 | Dead inline JS with undeclared variables causes `ReferenceError` on load | 10 pages (see §15.1) | Remove the entire old `MENU: ESC closes + overlay click + close link + focus trap` script block from each affected page |

### Priority 2 — Design inconsistency, affects experience

| # | Issue | File(s) | Action |
|---|-------|---------|--------|
| P2-1 | `<div class="banner-wrap">` should be `<header class="banner-wrap">` | 18 pages (see §11.1) | Replace `<div class="banner-wrap">` with `<header class="banner-wrap">` and close with `</header>` |
| P2-2 | `prefers-reduced-motion` missing | `electricity1.html`, `electricity-3.html` | Add the standard `@media (prefers-reduced-motion: reduce)` block to inline styles |
| P2-3 | electronics/revision.html uses `color-scheme: light` (should be `dark`) | `classes/electronics/revision.html:11` | Change to `content="dark"` and verify dark theme colours are applied |
| P2-4 | Missing `aria-label` on `<a class="card">` elements | `engineering-science.html`, `s3-engineering-science.html` | Add descriptive `aria-label` to each card anchor |
| P2-5 | `relativity-simulation.html` uses `<div>` not `<main>` for main content | `classes/higher/relativity-simulation.html` | Change `<div class="page-wrap" id="mainContent">` to `<main class="page-wrap" id="mainContent">` |
| P2-6 | `electricity-2-tools.html` is unreachable (not linked from any page) | `classes/s3-physics/electricity-2-tools.html` | Either link it from `electricity-2.html` or remove it if superseded |
| P2-7 | WIP Science stub pages use wrong blue accent instead of Science green | `s1-cells`, `s1-chemical-reactions`, `s1-energy`, `s1-sampling`, `s2-fuels-and-metals`, `s2-health-and-disease`, `s1-waves` | Update `--page-accent` and `--menu-accent` to `#16a34a` (green) |

### Priority 3 — Housekeeping and minor issues

| # | Issue | File(s) | Action |
|---|-------|---------|--------|
| P3-1 | Missing `<!DOCTYPE html>` and `<meta charset="UTF-8">` | 14 pages (see §9.5) | Add both to `<head>` |
| P3-2 | Missing `<meta name="color-scheme">` | 15 pages (see §9.4) | Add with the appropriate value (`dark` for electronics, `light` for others) |
| P3-3 | Orphaned asset files | `assets/electronics/555.jpg`, `assets/electronics/simslogo.png`, `assets/electronics/stripboard/mockprocess.jpeg`, `assets/s3/Electricity2/*.png` | Confirm unused and delete, or link from appropriate pages |
| P3-4 | `site-menu.css` link placed after inline `<style>` block | `adv-higher-physics.html`, `s3-n5-physics.html`, `s3-physics.html`, and others | Move `<link rel="stylesheet" href="/assets/css/site-menu.css">` above the `<style>` block |
| P3-5 | Banner text `&` unencoded in footer | `classes/s3-physics/electricity1.html:1002` | Change `&` to `&amp;` in footer |
| P3-6 | `Engeneringbanner.png` filename typo | `assets/Engeneringbanner.png` (referenced in 6+ pages) | Rename to `Engineeringbanner.png` and update all references in one commit |
| P3-7 | S3 Engineering and N5 Engineering main HTML content on one line | `s3-engineering-science.html`, `n5-engineering-science.html`, `engineering-science.html`, `n5-engineering-assignment-prep.html` | Reformat HTML for readability (no functional impact) |
| P3-8 | `engineering.html` and `engineering/n5.html` redirect pages include unnecessary nav assets | `classes/engineering.html`, `classes/engineering/n5.html` | Remove `site-menu.css`, `site-menu.js`, and `{% include site-menu.html %}` from redirect pages |
| P3-9 | `electricity-2-tools.html` has orphaned dead-menu script (same issue as §15.1) | `classes/s3-physics/electricity-2-tools.html` | Remove dead script block |
| P3-10 | `assets/engineering-science/national-5/CfE_CourseSpec_N4_Technologies_EngineeringScience.pdf` is not linked from any page | Asset only | Link it from `n5-engineering-science.html` course documents section, or delete if superseded |
