# CLAUDE.md — Site design reference

Design system, structure and conventions for mrstewartphysics.co.uk. Read before creating or
editing any page. This file holds the **rules and the map**; exact CSS values live in the files
named below — open them rather than guessing.

Global rules in `~/.claude/CLAUDE.md` apply on top of this — credits and references (§6) in
particular, since everything here is published.

**Canonical reference page** (copy its structure/components/conventions, but use the *subject's*
palette, not its blue): `classes/higher/electricity/current-pd-power-resistance.html`.

---

## Open jobs

Mac-side jobs left by cloud sessions are listed in **`tools/OPEN-JOBS.md`**. Read it at the
start of a Mac session, and when asked about open work. `tools/` is excluded from the build.

## Cloud or Mac

Where each job runs and the rules for working in both places: `tools/build-guides/site-workflow.md`. Mac-only: generated pages, SQA figures, decks and booklets, pupil data. Fetch first, never commit to `main`, never hand-edit a generated page.

## Site overview

Static HTML on GitHub Pages via Jekyll. Audience: Scottish secondary pupils (S3–Advanced Higher),
mostly on iPads/mobile. Pages use `layout: none` and carry their own inline CSS. The only shared
files are the nav components and the two shared stylesheets (Engineering Science, Higher Physics).

## File layout

```
_includes/site-menu.html              — nav drawer markup (every page includes it)
assets/css/site-menu.css              — nav drawer styles (every page links it)
assets/js/site-menu.js                — nav drawer behaviour (every page links it)
assets/js/site-search.js              — drawer search, loaded by site-menu.js on first use
scripts/build-search.mjs              — builds the search index after Jekyll (`npm run search`)
scripts/sim-check.mjs                 — checks every simulator in a browser (`npm run sims`)
scripts/build-stripboard.mjs          — checks the stripboard bundle against its sources (`npm run stripboard -- --check`)
assets/css/sims.css, js/widget-kit.js — the shared simulator component (see "Simulations")
assets/js/stripboard.js               — generated stripboard engine + renderer (do not edit)
assets/js/test-bench-engine.js        — generated test bench solver, from tools/generators/test-bench/ (`npm run bench`; do not edit)
_data/search.yml, search-synonyms.yml — pages left out of search; pupils' words → site words
.github/workflows/pages.yml           — builds, indexes and deploys the site (GitHub Actions)
assets/css/engineering-science.css    — shared sheet for all Engineering Science pages
assets/css/higher-physics.css         — shared sheet for Higher hub + topic pages
classes/                              — all subject pages
index.html                            — home page
```

### Higher Physics topic pages — filing structure

Grouped by course unit so new pages drop in cleanly:

```
classes/higher-physics.html                      — the hub
classes/higher/electricity/<topic>.html          — Electricity unit
classes/higher/dynamic-universe/<topic>.html     — Our Dynamic Universe unit
classes/higher/particles-waves/<topic>.html      — Particles & Waves unit
classes/higher/simulations.html, *.pdf           — shared Higher assets
```

Topic file = kebab-case of the hub's topic label (e.g. `current-pd-power-resistance.html`). Every
topic page links `/assets/css/higher-physics.css` for chrome + dark mode and keeps its own widget
CSS/JS inline. All asset/menu links are absolute (`/assets/…`, `/classes/…`) so nesting depth never
matters. To publish a topic, build it then flip the hub placeholder from
`<span class="topic-link soon">` to `<a class="topic-link" href="…">… <span class="go">→</span></a>`.
Per-page `localStorage` keys use a unique topic prefix (e.g. `hp-cpr-`).

**Before building any Higher topic page, read [`higher-topic-page-guide.md`](higher-topic-page-guide.md)**
(repo root) — the full construction spec: concept-block layout, equation cards with real 2-D
fractions (`fr-n`/`fr-d`, never `num`/`den`), two worked examples per equation, `.calc` grid,
question rules, UK SVG symbol/diagram rules, and the pre-commit checklist.

### S3 Physics topic pages — filing structure

S3 Physics is inline-themed (links `/assets/css/s3-physics.css`, not a shared topic sheet). When a
topic grows too large for one page, split it into a **topic hub + lesson sub-pages in a subfolder**,
keeping the original topic URL as the hub (established by the Electricity 1 split):

```
classes/s3-physics.html                              — the level hub
classes/s3-physics/<topic>.html                      — topic hub (short: intro, booklet, links, part tiles)
classes/s3-physics/<topic>/<lesson>.html             — the lesson pages (kebab-case of the part label)
classes/s3-physics/<topic>/practice-test-a.html      — self-marking practice tests (generated)
classes/s3-physics/<topic>/graphing-practice.html    — by-hand graphing practice (generated)
```

Conventions: the topic-hub URL is preserved (so existing links don't break); lesson files are
kebab-case of their part label (e.g. `circuits-symbols-meters.html`); each lesson gets its **own
per-page badge** (`unlock:"page"`) registered in `progress/s3-physics.js`, and the level-hub tile
aggregates them via `data-prog-badges`. Per-page `localStorage` widget keys use a unique lesson
prefix (e.g. `s3e1a-`). All asset/menu links stay absolute so the extra nesting depth is transparent.

---

## Standard page template

Every page follows this skeleton — do not deviate.

```html
---
layout: none
title: Page Title
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />               <!-- "light" only for older pages -->
  <meta name="theme-color" content="#eef2ff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0a0f1f" media="(prefers-color-scheme: dark)" />
  <title>Page Title</title>

  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <script src="/assets/js/site-menu.js" defer></script>
  <!-- Higher pages also link: /assets/css/higher-physics.css?v=hp-YYYYMMDDx -->

  <style>
    *, *::before, *::after { box-sizing: border-box; }      /* overflow fix — always first */
    html, body { max-width: 100%; }
    body { margin: 0; overflow-x: hidden; }
    img, iframe { max-width: 100%; height: auto; display: block; }
    /* .visually-hidden, :root tokens, prefers-reduced-motion block, page styles */
  </style>
</head>
<body>
  {% include site-menu.html %}

  <header class="banner-wrap">
    <img src="/assets/pagebanner.png" alt="Descriptive alt text" class="banner" loading="eager">
    <div class="banner-tint"></div>
    <div class="banner-overlay-text">
      <h1>Page Title</h1><p>One-line descriptor.</p>
    </div>
  </header>

  <main class="page-wrap" id="mainContent">
    <h1 class="visually-hidden">Page Title</h1>
    <!-- page content -->
  </main>

  {% include site-footer.html %}
</body>
</html>
```

The dual `theme-color` + `color-scheme: light dark` head is the current standard (set by the
reference page). Older inline-themed pages may still use a single `light` value — keep theirs
unless you're modernising the page.

**Engineering Science pages** omit the inline `<style>` block and instead link
`/assets/css/engineering-science.css?v=eng-YYYYMMDD`. They use `<main class="container">` (not
`page-wrap`) and `<img class="banner">` directly inside it (no wrapper, no overlay text).
**New and rebuilt Engineering pages open with the drawn `.band-banner`, never the photo banner**
(teacher, 7 Oct 2026): `<header class="band-banner">` with a `.bb-chip` holding one sprite mark and
the page title as a real-text `<h1>` + one-line `<p>` (pattern: `classes/s3-engineering/pneumatics.html`,
`classes/n5-engineering/checkpoint-revision.html`). The banner carries the page's only `<h1>`. Older
pages with the photo banner move to it on their next touch.

**Banner colours (`--bb-a` → `--bb-b`), one per level, written down 14 Oct 2026.** White text
is 5.75:1 or more on every pair.

| Where | `--bb-a` / `--bb-b` | Chip mark accent |
|-------|---------------------|------------------|
| Engineering hub, N5 level and topic pages (sheet default) | `#9a5410` / `#b3352e` (N5 hub `#9a5410` / `#9a3412`) | `--eng-ink-accent` |
| S3 level and topic pages | `#006e74` / `#0a5f57` | `--eng-ink-teal` |
| Pneumatic component pages, by type | valves `#1F5A99`/`#184778` · cylinders `#5B3A8C`/`#472D6E` · air supply and exhaust `#1D6363`/`#164D4D` · flow and timing `#2B6A2F`/`#215224` | per page |

The chip holds the same sprite mark as that page's hub tile. On a `body.eng-dense` topic page a
short landscape screen slims the banner to a 76px strip (`engineering-topic.css`), as the
practical pages do.

---

## Navigation drawer

Markup in `_includes/site-menu.html`, styles in `site-menu.css`, behaviour in `site-menu.js`.

### Required HTML IDs (must match JS)

| ID | Element |
|----|---------|
| `siteMenuButton` | Open/close toggle button |
| `siteMenuOverlay` | Background overlay |
| `siteMenuDrawer` | The `<aside>` drawer |
| `siteMenuClose` | Close button inside the drawer |

### Behaviour
Slides in from the right; opening adds `.is-open` to drawer+overlay and `site-menu-open` to `<body>`.
ESC, overlay-click, the × and a swipe to the right close it; focus is trapped while open. On open
the drawer itself takes focus, not its first row — iOS Safari rings whatever takes focus after a tap.
While it is open the ☰ is hidden (the × is the one close button) and so is the progress counter.
**Every folder collapses when the menu closes** (RS, 28 Sep 2026), so each open starts from the same
short list. `markCurrentPage()` sets `aria-current="page"` on the matching link and puts a short
accent bar (`.has-current`) on the row of every folder above it, instead of opening them.

**Header.** One row: the logo mark and "MrStewartPhysics.co.uk" as plain text (not a link — the Home
row is), then the ×. No "Menu" title.

**Marks and colours.** Every top row carries a drawn mark (`.site-menu-ic`, 26px) — drawer copies
under `smi-` ids of the Home tiles' atom, logic gate, gears and chat, plus a drawer house (Home) and
the certificate (Credits). Each row sets `--c` / `--c-dk`, the same pair as its Home tile, which
colours its mark and its folder line. All drawer text is 18px (D2). The dark drawer uses the site's
dark teal grounds, not navy.

### Menu order
1. Home `/` · 2. **Physics** (group): All Physics courses (`physics.html`) / S3 / National 5 /
Higher / Advanced Higher · 3. **Electronics** (group): Electronics hub / Slides ·
4. **Engineering Science** (group): All Engineering courses (`engineering-science.html`) / S3 /
National 5 / Higher (coming soon, `.site-menu-soon`) · then, below a line (`.site-menu-info`),
5. About & Contact · 6. Credits. Every subject is a group, so every subject row does the same thing
when tapped: it opens. Level names inside a group are short and match across subjects (S3,
National 5, Higher); the toggles' `aria-label`s carry the full name. **Do not add individual topic
pages to the drawer.**

**Level rows (28 Sep 2026).** A level with more than its hub is a `.site-menu-level` split row: the
name links to the hub, and a separate arrow (`<details class="site-menu-level-more">`) opens its
hub, Topic pages, Slides and Practice tests (Higher adds Past papers, 12 Oct 2026). A level with only a hub is a plain link with no arrow —
never an arrow that opens onto nothing. When a level gains an index page, give it a split row (or
add the link to its list). Groups share `name="site-menu-group"` and level lists
`name="site-menu-level"`, so opening one closes the other with no JS. The list icons are drawer
copies of `resource-icons.html` marks under `smi-` ids, so a page that includes both sprites has no
duplicate ids. Group and level arrows are one glyph, size and colour (`--menu-muted`); the level
toggle's divider is a short faint line, not a full-height wall.

### Site search (12 Oct 2026)
A search box sits under the drawer header on every page (it is part of the include, so a page adds
nothing). Typing hides the folders and lists results; Esc empties the box first, then closes the
menu; closing the menu clears it. Chips filter by S3 / N5 / Higher / AH / Electronics /
Engineering. Each result shows a drawn mark for its type, the title, its course in the subject
colour and a line of matching text — the course/type line and the excerpt are 16px, the one
exception to the drawer's 18px. **Recent searches (last 5) and the chosen chip stay on the device**
(`site-search-recent-v1`, `site-search-course-v1`); nothing about a search is sent anywhere.

**How it is built.** Pagefind (MIT, credited) indexes the finished `_site` in GitHub Actions after
`jekyll build`, into `/pagefind/`, split so a search downloads only what it needs.
`scripts/build-search.mjs` decides what goes in:
- **Pages:** every Jekyll page, indexed from its `<main>` only. Answers (`.reveal`, `#answers`),
  quiz feedback, SVG labels, nav, footer and buttons are left out (`EXCLUDE_SELECTORS`).
- **Left out:** `search: false` or `sitemap: false` in front matter, a robots `noindex`, a redirect,
  or a pattern in `_data/search.yml` (teacher views, placeholders, alpha/beta tools, `/assets/`).
- **PDFs:** only PDFs a searchable page links to, each its own result, named from the link
  (a card's `.deck-name`/`.tile-name`/`.tile-title` first). A vague name ("the booklet") gets
  the page's title in front. Credits-page links don't count.
- **Course and type come from the URL** (`COURSES` and `typeOf()` in the script). A page in an
  existing folder needs nothing; **a new course folder needs one line in `COURSES`.**
- **Titles** are the front-matter `title` (or `search_title`), minus a course part like
  "— Higher Physics", which the result's label already shows. `search_keywords:` in front matter
  adds extra words a page should be found by.
- **Synonyms:** `_data/search-synonyms.yml` (`ohms law: resistance`). Add a line when pupils use a
  word the site doesn't.

### Accent colouring
Pages set `--page-accent` or `--menu-accent` in their own `:root`; the menu CSS reads
`--menu-accent: var(--page-accent, #0a7d88)` — the site teal, lifted to `#2fd0dc` in dark mode.
A page with no accent of its own (Home, About & Contact) therefore gets teal, never a stray blue.

---

## Colour themes by subject

Each subject has its own identity — always use the right one. Full `:root` token blocks live in the
page itself (inline-themed subjects) or the shared CSS (Higher, Engineering Science). This table is
the quick map; copy exact values from the source.

| Subject | Accent | `theme-color` (light) | Token source |
|---------|--------|-----------------------|--------------|
| Home / Physics | `#0aa8b5` teal | `#eaf7fa` | inline per page |
| S3 Physics | `#00747c` blue-teal | `#eaf7fa` (dark `#0d1f1a`) | `assets/css/s3-physics.css` |
| Science (S1/S2) | `#16a34a` green | `#eef7ff` | inline per page |
| Electronics | `#0a9d7f` green (dark `#00e6b3`) | `#e8fbf5` (dark `#06140f`) | `assets/css/electronics.css` |
| National 5 | `#d74a84` pink | `#fff0f7` (dark `#1d0b14`) | `assets/css/national-5-physics.css` |
| Higher | `#0a6fbf` azure | `#eef8ff` (dark `#0a0f1f`) | `assets/css/higher-physics.css` |
| Advanced Higher | `#b8860b` gold (dark `#e8bf55`) | `#f6efdc`, hub `#fff6d6` (dark `#14100a`) | `assets/css/adv-higher-physics.css` |
| Engineering Science | `#fd9700` orange | `#fbf6ef` (dark `#15110b`) | `assets/css/engineering-science.css` |

- **Every subject follows the device appearance** (light and dark) from its sheet. Engineering
  Science's dark mode uses its `--eng-*` tokens. Main column is 1100px in every subject (Science
  1200px).
- **Higher** topic pages also use these extra tokens from the shared sheet — reuse them, don't
  reinvent: `--accent-2`, `--border-accent`, `--surface-2`, `--font-stack`, and `--warm` (a warm
  accent that needs a brighter value on dark: `#c2410c` light / `#ff9d6e` dark).

---

## Typography

- Font stack (all subjects): `"Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif`
  (Higher exposes this as `--font-stack`). Body uses `-webkit-font-smoothing: antialiased`.
- `font-weight: 900` for headings/titles/labels; `800` for muted/descriptive text.
- `line-height`: `1.5` base, `1.55` body paragraphs, `1.3` card titles.
- **Equations are serif** (`"Times New Roman", Times, Georgia, serif`) with quantity symbols in
  `<var>` (italic); numbers/units/operators stay upright — matches the SQA relationship sheet.

---

## Banner

Banners are finished 3:1 artwork (the subject title + `MrStewartPhysics.co.uk` are baked into the
image). `.banner-wrap` is `position:relative; overflow:hidden; aspect-ratio: 3 / 1` with a bottom
border + soft shadow — **never a fixed `height`/`max-height`** (that would crop/zoom the art; the
whole banner must stay visible). Inside: `.banner` (`width:100%; height:100%; object-fit:cover` — no
crop since both are 3:1), `.banner-tint` (`display:none` — kept in markup but disabled so the
artwork shows its true colours), and `.banner-overlay-text` (frosted title bar pinned to the bottom).

**Overlay rule:** the art already shows the *subject* title, so on hub/landing pages the overlay is a
duplicate — hide it by adding `is-hub` to the header (`<header class="banner-wrap is-hub">`); the
shared sheets carry a `.banner-wrap.is-hub .banner-overlay-text` SR-only rule. On **topic/content
sub-pages keep the overlay** — there it shows the specific topic name, which the generic subject art
does not. Inline-themed pages replicate this inline (hide the overlay on the hub; keep it on topics).

### Banner image assets

All banners are 3:1 `.jpeg` in `/assets/`. Topic pages reuse their subject's banner.

| Subject | Asset | Subject | Asset |
|---------|-------|---------|-------|
| Home | `/assets/home-banner.jpeg` | S3 Physics | `/assets/s3-physics-banner.jpeg` |
| Physics | `/assets/physics-banner.jpeg` | National 5 Physics | `/assets/national-5-physics-banner.jpeg` |
| Higher | `/assets/higher-physics-banner.jpeg` | Advanced Higher | `/assets/advanced-higher-physics-banner.jpeg` |
| Electronics | `/assets/electronics-banner.jpeg` | Engineering Science (hub) | `/assets/engineering-science-banner.jpeg` |
| S3 Engineering Science | `/assets/s3-engineering-science-banner.jpeg` | National 5 Engineering Science | `/assets/national-5-engineering-science-banner.jpeg` |

---

## Main layout

`main.page-wrap`: `max-width:1100px` (1200 on Science), `margin:1rem auto 2rem`, `padding:0 12px 4rem`,
`flex:1`. `body` is a `min-height:100vh` flex column so the footer sits at the bottom. On
`max-width:700px`, padding → `0 10px 3rem`. Engineering Science uses `<main class="container">` at
`width: min(1100px, 92vw)`.

---

## Interactive pupil tasks — one-screen layout rule

**Any page where a pupil *does* a task — drag-and-drop, sorting, matching, labelling, building,
answering — must fit the question, the pieces and the working area on one landscape tablet screen
(≈1180 × 760 CSS px) without scrolling.** Pupils work on iPads held sideways; if they have to scroll
between reading the problem and reaching the pieces, they lose their place and the task stops
working. Reference implementation: `classes/electronics/block-diagram-builder.html`.

**The pattern**

- **Pieces go beside the working area, never below it.** A CSS grid —
  `grid-template-columns: minmax(0,1fr) 212px` — puts the working area left and a **scrollable**
  piece bank right. The bank scrolls internally (`overflow-y:auto`), so a long list never pushes the
  working area down. Below `821px` the grid collapses to one column and the bank wraps underneath.
- **Order down the page:** problem text → working area + bank side by side → buttons. The pupil reads,
  looks right, drags left.
- **Scale the working area, do not crop it.** Render it at fixed logical coordinates inside a
  `transform: scale()` wrapper and compute the factor from the space available — width *and*, on short
  screens, remaining viewport height. Floor the scale (≈`0.62`) so text stays legible, and let the
  wrapper pan horizontally below that rather than shrinking further.
- **Reclaim vertical space on short landscape screens** with
  `@media (min-width:821px) and (max-height:900px)`: slim the banner to a strip (~76px), drop the
  duplicate overlay title (`is-hub`) and put the `<h1>` in the page, hide the intro paragraph, and
  give any notice a one-line short form. No sticky sub-nav on a task page.
- **Every task takes three inputs:** pointer drag (mouse *and* touch — use Pointer Events with
  `touch-action:none`, never HTML5 drag-and-drop), tap-to-select then tap-to-place, and keyboard
  (`Tab` + `Enter`). Handle taps through a delegated `click` listener, not `pointerup`, so assistive
  technology works.

**Check it before calling it done:** screenshot at 1180 × 760 and confirm the problem, the pieces and
the working area are all visible at once.

---

## Simulations — the simulator standard (site standard, 13 October 2026)

Every simulator on the site is one component with each subject's palette: **`assets/css/sims.css`**
(layout, controls, readouts, graph styling, token-driven like `hub-tiles.css`) plus
**`assets/js/widget-kit.js`** (`window.WidgetKit`). Pages do not hand-roll slider pairing, graph
axes or animation loops. Link `sims.css` after the subject sheet, and load `widget-kit.js` with
`defer`.

```html
<div class="sim" id="sim-x">
  <div class="sim-head"><h3>…</h3><p class="sim-hint">One line on what to try.</p></div>
  <div class="sim-predict">…</div>                       <!-- predict first, before the stage -->
  <div class="sim-stage">
    <div class="sim-view">figures (.sim-figs/.sim-fig), .sim-graph, .sim-readouts</div>
    <div class="sim-controls">
      <label class="sim-field"><span class="sim-name">Resistance <var>R</var><sub>1</sub> (kΩ)</span>
        <span class="sim-row"><input type="range" data-sim="r1" …><input class="sim-num" type="number" data-sim="r1" …></span></label>
    </div>
  </div>
</div>
```

- **One screen.** At 1180 × 760 the stage — picture, graph and controls — fits on screen at once,
  controls **beside** the picture (the one-screen rule above, applied to a block inside a page).
- **Predict first.** A `.sim-predict` card asks what will happen before the pupil can find out;
  every option carries its own feedback (`<template data-feedback>` inside the button,
  `WidgetKit.poeCard`). Same rule as quizzes: a wrong pick says why, the right one starts "Right."
- **Every slider has a number box** (`WidgetKit.liveSim`, same `data-sim` key). A range that spans
  decades uses `data-scale="log"`; one that crowds against a limit (speeds near *c*) uses
  `data-scale="near"`. Values are clamped to the box's min/max when the pupil leaves it.
- **The picture moves with the numbers** (dual coding): a live diagram, labelled with the same
  words as the text, beside every simulator. UK symbols.
- **Graphs** come from `WidgetKit.graph`: "quantity (unit)" on both axes, numbered ticks, the origin
  at 0 unless the physics needs otherwise, a phone layout (`layouts`) so labels stay ≥ 12 px.
- **Readouts** use `WidgetKit.fmt` / `WidgetKit.si` (3 s.f., real minus sign, SI prefixes) and real
  `<var>`/`<sub>` — never `V_s`-style code subscripts. Results announce via `aria-live="polite"`.
- **Motion** runs on `WidgetKit.clock` (pauses with the tab, no autoplay under reduced motion).
- **Progress.** A simulator counts toward its page's badge (`Progress.markSeen` on first use).
- **Stripboard pictures** come from **`assets/js/stripboard.js`** (`SBD.render.renderBoard`), written
  from `tools/generators/stripboard/engine/` by the stripboard `build.py`; never edit it. A layout shown on a page is
  checked with `SBD.check` against its netlist before it is published.
- **Checked automatically.** `npm run sims` (`scripts/sim-check.mjs`) runs every `.sim` at
  1180 × 760 light and dark and at 390 px, in the PR build: no errors or sideways scroll, stage fits,
  slider ↔ box sync, 44 px controls, named drawings, labelled graph axes, nothing moving under
  reduced motion, every drawn stripboard matches its netlist. A slider outside a `.sim` fails.
  It prints the list of every simulator on the site — that list is the inventory.
- **Kit details worth knowing:** `WidgetKit.svgLabel(textEl, "<i>V</i><sub>2</sub>")` writes SVG
  labels with italic symbols and real subscripts; `graph.ref(…, { side, below })` places a guide
  line's label; a simulator may hide a slider for one mode (hidden sliders are not measured); a
  simulator inside a closed `<details>` is fine (the check opens it, as a pupil would). Engineering
  pages add `.sim { --sim-accent-ink: var(--eng-ink-accent); }` so accent text stays AA.
- **Adopted (13 Oct 2026): every simulator on the site** — 21 across Electronics (555, theory),
  Higher (electricity, relativity), N5 Engineering and S3 Physics. No page carries `bindPair`.
- **Still check by eye**, as for every page: a headless Chrome look, and the physics by the teacher.

---

## Core component patterns

Class names + purpose. **Exact CSS lives in the reference page / shared sheets — copy from there.**

### Shared / Physics-teal & Science (inline or reference page)
- `.panel` / `.panel.soft` — white (or frosted-glass) content block grouping a section.
- `.tile-grid` — responsive card grid: `repeat(auto-fit, minmax(min(260px,100%), 1fr))`.
- `a.card` + `.card-media`(`.linkhead`) / `.card-body` / `.card-title` / `.card-desc` — nav card
  (image or emoji header) used on home + Physics hubs.
- `.topic-tile` + `.tile-label` — Science image-background tile with frosted bottom label; bg set
  via modifier classes (e.g. `.tile-waves`).
- `details.block` + `.details-inner` — collapsible section hiding long link lists.
- `.tag` — pill/badge. `.year-section` + `.year-header.s1/.s2` + `.year-title/.year-count/.year-body`
  — Science hub year groupings.

### Electronics (dark, inline)
- `.class-tile` (+ `.featured`) + `.tile-caption` / `.cap-title` / `.cap-sub` — dark image tile with
  caption overlay.

### Engineering Science (`assets/css/engineering-science.css`)
- `.container`, `.intro`, `.card` (+ `.card-featured`), `.cta` (+ `.cta.soon`), `.resource-grid`,
  `.resource-card` / `.resource-title` / `.resource-meta`, `.resource-spotlight`, `.resource-list`,
  `.grid-3`, `.stack-gap`. CTAs are orange, `min-height:48px`.

### Higher topic pages (reference page, inline)
- `.eq-cards` / `.eq-card` (`.eq-name` / `.eq-formula` / `.eq-desc`) — standout equation cards.
- `.frac` with `.fr-n` / `.fr-d` — **real 2-D fractions; never `num`/`den`** (collides with input
  styling). Every `.frac` needs a worded `aria-label`.
- `.calc` (4-col grid: `.lhs` `.eq` `.rhs` `.note-cell`) — aligned worked-example working.
- `.example` / `.ex-type` / `.ex-q` / `.ex-conv` / `.ex-flow` — worked examples (two per equation).
- `.practice` / `.practice-tag` + `details.reveal` — per-concept practice with mark scheme.
- `.concept-tag`, `.backlink`, `.notes`, `.lead`. Higher hub uses `.class-tile` tiles (retained
  exception, not `a.card`). Coming-soon topics are inert `<span class="topic-link soon">`.

---

## Hub tiles

Full spec in `tools/build-guides/hub-tiles.md`; read it before touching a hub. One shared `assets/css/hub-tiles.css` tile, token-driven, whole tile is the link, no rows of filled accent buttons.

## Slides index — the deck card

Full spec in `tools/build-guides/slides-index.md` (shared with the `deck-ship` skill); read it before editing a slides index. Decks with answer pills use the two-pill card.

## AH lab pages

Full spec in `tools/build-guides/ah-lab-pages.md` (approved 11 Nov 2026); read it before building an AH lab sheet. Copy `classes/adv/electromagnetism/lab-f-bil-top-pan-balance.html`; shared `assets/css/ah-lab.css` + `assets/js/ah-lab.js`; results table from a `#labData` JSON block; one hub tile per lab in the Lab sheets row of `classes/adv/topics.html`.

## Accessibility requirements (every page)

- **No skip link** (teacher, 14 Oct 2026: removed site-wide; don't add one). Keep
  `id="mainContent"` on `<main>`.
- **Focus rings** `outline: var(--focus-ring); outline-offset: var(--focus-offset)` on
  `:focus-visible` — never removed, ≥3px.
- **`aria-label`** on every `a.card`, `<section>`, and `.tile-grid`.
- **Decorative images**: `aria-hidden="true"` + `alt=""`. `.visually-hidden` spans for extra SR context.
- **`touch-action: manipulation`** + **`-webkit-tap-highlight-color: transparent`** on tappable cards.
- **`prefers-reduced-motion`** block always present (transition/animation/scroll-behavior → none).
- **Tap targets** ≥48×48px buttons, ≥44px nav links. Widget results announce via `aria-live="polite"`;
  no `alert()`.

---

## Site logo (site standard, 26 September 2026)

The logo (a lightning bolt through a cog, `assets/logo/mark.svg`, drawn by R Stewart) appears on
every page through the shared includes — **never add it per page**:

- **Home badge**: `.site-home-badge` in `_includes/site-menu.html`, top-left, mirroring the menu
  button — and like it, `position:fixed`, so it stays in view while the page scrolls (28 Sep 2026).
  Where it would cover something when the page opens (the Electronics builders, planners and
  planning sheets, which have no banner), `holdBadgeClearOfTopRow()` in `site-menu.js` hides it
  until that top row has scrolled out from under it. Sticky `.subnav-wrap` bars get side padding
  from `site-menu.css` so their links clear both the logo and the menu button.
- **Menu drawer**: `.site-menu-brand` row at the top of the drawer.
- **Footer**: `.footer-brand` in `_includes/site-footer.html`, above the © line.
- Drawer and footer use the icon mark beside **real text** "MrStewartPhysics.co.uk" — never
  `lockup-*.svg`, whose wordmark is a picture of text (D18) in fixed dark ink that vanishes on a dark
  footer.

## Report a problem / Request a feature (site standard, 6 November 2026)

**Every app-style page carries the feedback button** — every tool, builder, planner, test bench,
simulation and on-screen practice test or quiz, new or rebuilt. Plain topic and hub pages don't.

- **One include, never hand-written:** `{% include feedback-button.html about="<short page name>" %}`.
  It links to `/classes/contact.html?about=…`; the contact page shows "About: <page>", sends it as a
  hidden `about` field and puts it in the email subject. Style is `.feedback-btn` in
  `site-menu.css` — don't restyle it per page.
- **Place it at the top**, in the title row or beside the back link, so it is on screen when the
  page opens. The label stays "Report a problem / Request a feature" (shipped and approved 6 Nov).
- **Generated pages get it from the generator**, not the page: the stripboard template,
  `practice-tests/toolkit/pagebuild.py` (`page()`), `build_graphing.py`. A new generator for an
  app-style page adds the include too, and lists `feedback-button.html` among any allowed includes.
- **A beta tool** also shows the orange `Beta` tag and one short line beside the button (pattern:
  `learn-to-test.html`). Remove the tag when it comes out of beta; the button stays.
- Check: one `.feedback-btn` on the page, 44 px tall, link carries `?about=`, no sideways scroll at
  390 px.

## Footer

Every page uses the shared include — do **not** hand-write a `<footer>` element:

```html
{% include site-footer.html %}
```

The include (`_includes/site-footer.html`) renders the single canonical line
`© Mr Stewart's Physics, Electronics and Engineering` plus a `.footer-nav` with three links —
**Home** (`/`), **About &amp; Contact** (`/classes/contact.html`), **Credits**
(`/classes/credits.html`) — and carries its own scoped link styling. The same string/links apply on
every subject, Science included (no shorter variant). The `footer` element itself is still styled per
page: centred, frosted (`rgba(255,255,255,.72)` light / `rgba(0,0,0,.25)` dark), `margin-top:auto`;
the shared sheets and inline-themed pages already define this. Link colour is `inherit`, so it adapts
to each page's footer text colour automatically.

---

## Past-paper items — the SQA question bank (site standard, 3 November 2026)

Every topic page, all courses, uses the private SQA question bank (`Qualifications-and-code`, Mac only)
through the Mac's **`web-exam-items`** skill. Pages already built get the `.exam-ref` lines in one batch
per course; crops are added on each page's next touch.

**Default check (teacher, 6 Nov 2026).** The question-bank check runs on every page built *or
improved*, not only when asked, and is part of "done" (global CLAUDE.md §4, DECK-RULES 80): every
question on the page that could be a real SQA item is one (crop, the bank's `Credit` wording in the
`data-credit-note`, a ledger row); quick quizzes and retrieval items come from the bank; an invented
question only where no current item fits, logged in the project's STATE.md.

- **`.exam-ref` under each section's `.keypoint`:** the current exam items for that key area, newest
  first, each in its own `<b>`, at most 8, then "asked in N of M exam years" (counted from the bank,
  left out under 3 years). Visible text, never a `title=`.
- **One credited SQA crop per section at most**, in the `.practice` block after the page's own
  questions: the most-asked current item, one page, 2–4 marks, its MI crop in a `details.reveal`.
  Not an item in a current prelim or test selection. Files `assets/<course>/sqa-<year>-<paper>-q<n>-<name>.png`,
  real `alt` text, a `data-credit-note` with the bank row's `Credit` wording, and `CREDITS.md`,
  `classes/credits.html` and `copyright-provenance-checklist.csv` in the same commit.
- **Never committed here:** the bank CSVs, box coordinates, or question text pulled from the papers.
- N5 Physics is not in the bank yet; its pages wait.

## Credits & copyright

Global rules `~/.claude/CLAUDE.md` §6; this is the site-side mechanism. Nothing published goes out
uncredited.

- **Per-page sources line.** A page carrying material that isn't the site owner's gets a
  `data-credit-note` paragraph under the content it credits. House wording and styling:
  `classes/higher-physics.html` — "Sources &amp; credits: …", `font-size:0.82rem;opacity:0.78`.
- **Both credit lists move together.** `CREDITS.md` (repo root, excluded from the build in
  `_config.yml`) is the master; `classes/credits.html` is its public twin, linked from every footer.
  Credited material added to a page means editing **both** in the same change.
- **Provenance is logged.** `copyright-provenance-checklist.csv` records each asset as original /
  with permission / to remove. A new third-party asset gets a row.
- **Qualifications Scotland material** — past papers, marking instructions, course specifications,
  data booklets and extracted images — is reproduced for educational use and credited with the exact
  string `© Qualifications Scotland (SQA)`. Qualification names (National 5, Higher, Advanced
  Higher) are unchanged; don't rewrite "SQA" where it is already established in a filename, an
  asset's own branding, or this credit string.
- **Colleagues' material only with permission** — named, with a year, as in `CREDITS.md`.
- **Declare AI-generated assets** (banner and logo artwork), as `CREDITS.md` already does.
- **Unknown provenance is not publishable.** Ask before it goes live.

### Images

Source priority and licence rules: global `CLAUDE.md` §7 and the `image-sourcing` skill. Site-specific: every published image also gets a row in `CREDITS.md`, `classes/credits.html` and `copyright-provenance-checklist.csv` in the same change. Photos use `<figure>` with a linked `<figcaption>` credit.

## Dual coding (site standard)

Procedure and rules: the `dual-coding` skill and DECK-RULES 34. Web specifics:

- Paragraph and figure share one block: side by side on desktop, text then figure below the mobile breakpoint.
- The figure is the mechanism, as inline SVG using the page's CSS variables, working in both appearances.
- **Component:** a `.dual` two-column block (grid, text first in the DOM, `minmax(0,1fr)`, collapsing at the mobile breakpoint). The first page to adopt it adds it to its subject CSS; later pages reuse it.
- **Accessible:** SVG `role="img"` with `<title>`/`aria-label`; photos have real `alt`; no meaning by colour alone.
- **Check:** one headless Chrome look per changed page (both widths and appearances only if CSS or layout changes).

---

## Learning standard (site standard)

The dyslexia audit and D-rules are dropped (8 Nov 2026). `assets/css/reading.css` and the reading-options
panel already exist: **retired in the docs, no new page opts in**; existing pages are left alone unless
touched for another reason. Still in force for pages:

- **Every quiz option teaches** (DECK-RULES 42): wrong pick says why and nudges without naming the letter; the right one starts "Right." and shows the reasoning. Pattern: `classes/n5-engineering/checkpoint-revision.html`.
- **Segment:** one new idea per section; long explanations use "next step" reveals.
- **Retrieval and self-rating:** quick-quiz blocks, a 1–3 confidence widget and a "come back to these" list, device-only, never sent anywhere.
- **Every symbol decoded:** a glossary with name and unit beside each equation. Every figure has `alt`.

---

## Mobile breakpoints

| Breakpoint | Changes |
|------------|---------|
| `max-width: 700px` | `page-wrap` padding → `0 10px 3rem`; panel padding → `.95rem`; grid gap → `10px` |
| `max-width: 520px` | Drawer → `min(340px, 92vw)`; nav rows → `min-height:52px` (text stays 18px) |
| `max-width: 480px` | Electronics tile caption font reduces |
| `max-width: 768px` (Electronics) | Banner max-height → `260px` |

## Safe-area insets

Use `env(safe-area-inset-*)` wherever fixed controls sit near screen edges — the menu button
(`top/right: calc(14px + env(safe-area-inset-*))`) and main padding-bottom
(`calc(4rem + env(safe-area-inset-bottom))`).

---

## Engineering Science — National 5 topic pages

**Topic order** (matches the hub tiles on `classes/n5-engineering-science.html`):

1. Engineering Contexts & Systems · 2. Energy & Efficiency · 3. Electronics & Analogue Control ·
4. Logic & Programmable Control · 5. Mechanisms & Drive Systems · 6. Pneumatics ·
7. Structures & Materials · 8. Assignment Preparation & Mixed Revision

**Filing & URLs.** Topic pages live at `classes/n5-engineering/<kebab-topic>.html` (e.g.
`mechanisms-and-drive-systems.html`), except Topic 8 which is `classes/n5-engineering-assignment-prep.html`
(kept at that pre-existing URL — it is also linked from the hub's resources row). All asset/menu
links are absolute; never add topic pages to the nav drawer. Each page follows the Engineering
Science convention: `<main class="container">`, links `/assets/css/engineering-science.css` +
`/assets/js/widget-kit.js`, orange `--eng-*` tokens, and **`energy-and-efficiency.html` is the
canonical template** to copy (concept-block `section.sec` panels with a collapse toggle, a mode-chooser
bar, sticky sub-nav, a `#recap` one-screen summary, an `#answers` section of `details.reveal` booklet
answer keys, and a `#check` section = MC quiz + RAG self-check from the booklet success criteria).
Per-page `localStorage` prefix is unique (`n5e2-`, `n5m5-`, `n5e3-`, `n5p6-`, `n5s7-`, `n5c4-`,
`n5a8-`, …). Equation/`<var>`/`.frac` and UK-SVG-symbol rules are the same as the Higher/Electronics
topic guides.

**Revised template conventions (August 2026 — from the Energy & Efficiency audit; topics 3–8 still
need retrofitting):**
- **Exam-style practice sits with the concept it tests**, as a `.practice` block (`.practice-tag` +
  `.page-ref` booklet reference) at the foot of its `section.sec`, each question a `.stem` with a
  `.marks` pill and its own `details.reveal` answer. `#answers` holds **booklet answer keys only**.
- **Past-paper references are visible text, never a `title=` tooltip** — there is no hover on an
  iPad. Use `.exam-ref` under the section's `.keypoint`, with each reference in its own `<b>`.
- **Past-paper references come from the SQA question bank** (site-wide rule: "Past-paper items — the SQA question bank"; the private `Qualifications-and-code`
  repo, through the Mac's `past-paper-evidence` skill; not the site's own question-bank page).
  Take the year, question and marks from its rows, using `Current = yes` items only. The bank's CSVs and
  crops are never committed or published here. Only the reference text goes on a page, and any SQA
  crop is credited at the point of use (`data-credit-note`) with the row's `Credit` text (30 Oct 2026).
- **Data-booklet notation leads**: `g = 9.8 ms⁻²`, `c = 4180 J kg⁻¹K⁻¹`, glossed once with the
  familiar form. The booklet gives efficiency as a **ratio only** — say where the `× 100` is lost.
- **Accent orange is a background, not small text.** `--eng-ink-accent` (light `#9a5410`, dark
  `#f5c97a`) is the AA-safe text accent; `--eng-orange` on text is ~3.4:1 and fails.
- **One colour grammar for energy**: useful `#15803d` green, wasted `#b91c1c` red, in both the SVG
  block diagrams and the live sim bars.
- A `#recap` section (relationships as `.eq-card`s, a `.warn` list of what loses marks, a unit-
  conversion `.tbl`) and a "Where this comes up next" `.resource-grid` close the page.

**Status (all 8 topics live).** Built on branch **`n5-engineering-pages`** (July 2026): topics 3–8
were authored from the source booklets, each with a flagship live widget (gear-train, Ohm's-law &
voltage-divider, cylinder-force, beam-reactions, gate-playground) plus match/builder challenges wired
to the progress engine, and NoStrainSim/NoPressureSim `.simcard` task cards where the booklet has
▶ simulate-it tasks. The pages left beta on 14 Oct 2026 and every `.beta-note` banner (and Higher's
`.wip-notice`) came off together, with their CSS; don't add a new one. The booklet-PDF
buttons on topics 3/5/6/7 are `cta soon` placeholders until the PDFs land in
`assets/engineering-science/national-5/<nn-topic>/`. **The build spec for these pages is
`n5-engineering-pages-outline.md`** (repo root, git-excluded); its §8 is the phased build order.
**Unit 1 Question Bank** (`classes/n5-engineering/unit-1-question-bank.html`, linked from the hub's
`#unit1` card): a 236-question random MCQ generator covering Topics 1–2, one question at a time with
immediate right/wrong marking. It is **generated**, not hand-edited — the source bank and build script
live in `tools/generators/mcq-bank/` (`bank_src.md` + `build_all.py`, which writes this page). Edit the source and re-run the script; do not edit the page's embedded JSON.
localStorage prefix `n5q1-`. No progress badge is wired to it.

A sibling **`s3-engineering-pages-outline.md`** specs the S3 Engineering pages — that job is **not yet
started**.

To build/preview locally the repo uses **chruby** (system Ruby is too old):
`source /opt/homebrew/opt/chruby/share/chruby/chruby.sh && chruby ruby-3.3.11 && bundle exec jekyll build`.
For search in the preview, run `npm install` once, then `npm run search` after each build and serve
`_site` (e.g. `npx pagefind --site _site --serve`, or any static server). Plain `jekyll serve`
works without it; the search box then says the index isn't built.

**Deploying.** The live site is built by `.github/workflows/pages.yml` (Settings → Pages → Source:
GitHub Actions), not the classic branch build, because the search index is built after Jekyll.
Pull requests build and index too, so a failure shows before merge; only `main` deploys.

---

## Progress & badge system (site standard)

The site is standardising on **one progress + badge engine across all interactive subjects** —
**Electronics, Higher Physics, and the three Engineering Science levels (S3 / N5 / Higher)** — with
each **level hub aggregating its own progress**. The full design, build order and **hard guardrails**
live in **[`progress-system-rollout-plan.md`](progress-system-rollout-plan.md)** (repo root) — read it
before touching any progress/badge code.

**The model (two tiers + gamification, identical everywhere):** cross-page **mastery badges** +
per-page **points / streak / section-challenge meter** + a **corner counter**, **per-level hub totals**
("% explored", points, badge count) and a **named rank ladder** per subject. No cross-subject profile.

**Architecture (the rules that matter day-to-day):**
- **One engine, never a fork.** Logic lives in `assets/js/progress.js` (`window.Progress`); each subject
  supplies only a config `assets/js/progress/<ns>.js` (its badge registry, palette via tokens, rank
  ladder, storage namespace). Pages must **not** hand-roll progress JS.
- **One `localStorage` key per subject:** `progress-<ns>-v1`. Exploratory widget state keeps its own
  per-page `el-…`/`hp-…` prefix and is never written into the progress key.
- **Neutral markup hooks** (the only thing a page adds): the two `<script>` tags, `id="progressHub"`
  on the hub, `data-prog-badges` on hub tiles, `data-prog-challenge` on tracked challenges, and
  `.prog-cloze`/`.prog-fillin` blocks auto-bound by the engine. A flagship scored widget calls
  `Progress.markSeen(id)` + `Progress.record(id,score,max)`.
- **CSS is injected by the engine, token-driven** (`var(--token, fallback)`) — no per-subject progress
  stylesheet. **No blocking dialogs** (`alert`/`confirm`); unlocks use an `aria-live` toast; reset is a
  two-tap inline confirm; status is never colour-only. All `page-checklist.md` a11y rules still apply.

**Current status (rollout essentially complete — default on):** the shared engine `assets/js/progress.js`
(`window.Progress`) is live with five subject configs — `progress/electronics.js`,
`progress/higher-physics.js`, `progress/eng-n5.js`, `progress/eng-s3.js`, `progress/s3-physics.js`.
**Migrated and live:** **Electronics** (all pages + hub, via the lossless `migrateFrom` shim),
**Higher Physics** (all 5 electricity pages + hub aggregation on `classes/higher-physics.html`),
**Engineering Science N5** (all 8 topic pages + hub — topics 3–8 added July 2026 on the
`n5-engineering-pages` branch, badges `eng-electronics`/`eng-control`/`eng-mechanisms`/`eng-pneumatics`/`eng-structures`/`eng-assignment`
joining the existing `eng-contexts`/`eng-energy` in `progress/eng-n5.js`), **S3** live topic pages + their hubs, and **S3 Physics** (Electricity 1 hub
+ its three lesson pages, two practice tests and a graphing practice under
`classes/s3-physics/electricity1/`, badges `elec1a`/`elec1b`/`elec1c`/`elec1-test-a`/`elec1-test-b`/`elec1-graphs`
aggregated on the S3 hub tile). Each writes a single
`progress-<ns>-v1` key. The legacy `electronics-progress.js` engine and its `window.ElProgress` API
have been deleted — `progress.js` + `progress/electronics.js` are the only electronics path.
**Remaining:** Higher Engineering Science (Coming Soon — its
`eng-higher.js` config drops in when those pages are built); coming-soon topic stubs stay unwired until
they have content (behind-content guardrail). **New interactive pages ship with tracking by default** —
run **`/add-progress`** and follow `progress-system-guide.md` (API) + the rollout plan's §5 guardrails;
the `new-page` skill and the topic-page guides bake this in.

---

## Retired — remove on sight

Things that have been withdrawn. **Whenever you touch a page for any reason, strip these if they are
on it** — do not wait to be asked, and do not add them to a new page.

- **"Mr Stewart's Materials" tiles and links** (retired 3 September 2026). The four hub tiles that
  pointed at `classes/materials-unavailable.html` are gone from S3/N5, Physics, Higher and Advanced
  Higher. The placeholder page itself is still there because three unrelated tiles use it; that is
  the only reason to link it.
- **The Electricity 1 practice quiz, its AI-tutor panel and the printable practice test.** Superseded
  by the self-marking practice tests and the graphing practice.
- **Explanatory "bumf".** A paragraph telling pupils how to use a page they can already see — "this
  topic is split into three lesson pages plus a practice page, work through them in order" — is not
  read and is not kept. Let the tiles and headings carry the structure. A note earns its place only
  when it says something the layout cannot: a deadline, a warning, or what changed.

---

## What not to do

- No parallax, scroll-driven animation, or CSS `background-attachment: fixed` (breaks on iOS).
- No blueprint, grid, or circuit-board background patterns. One exception (RS, 29 Sep 2026): the
  faint grid on a section tile's `.sec-band` (Engineering level tiles, `hub-tiles.css`) and the
  Engineering hubs' drawn `.band-banner` — not page or panel backgrounds.
- No school branding or logos beyond what already exists.
- No teacher-only notes or internal references in student-facing pages.
- Do not add a seventh S3 Engineering topic to the global nav drawer — link them from the S3
  Engineering Science hub page only.
- Do not create documentation files unless asked.
- Do not add comments explaining what code does — only comment when the reason is non-obvious.
