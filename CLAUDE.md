# CLAUDE.md — Site design reference

Design system, structure and conventions for mrstewartphysics.co.uk. Read before creating or
editing any page. This file holds the **rules and the map**; exact CSS values live in the files
named below, and long specs live in `tools/build-guides/`. Open them rather than guessing.

Global rules in `~/.claude/CLAUDE.md` apply on top, credits (§6) in particular. Why a rule exists,
and the full text before the 23 Nov 2026 trim: `docs/archive/CLAUDE-2026-11-23-before-trim.md`.

**Canonical reference page** (copy its structure and components, with the *subject's* palette):
`classes/higher/electricity/current-pd-power-resistance.html`.

---

## Open jobs, and cloud or Mac

- Mac-side jobs left by cloud sessions: **`tools/OPEN-JOBS.md`**. Read it at the start of a Mac session.
- Where each job runs: `tools/build-guides/site-workflow.md`. Mac-only: generated pages, SQA figures,
  decks and booklets, pupil data. Fetch first, never commit to `main`, never hand-edit a generated page.

## Site overview

Static HTML on GitHub Pages via Jekyll. Audience: Scottish secondary pupils (S3–Advanced Higher),
mostly on iPads. Pages use `layout: none` and carry their own inline CSS; the shared files are the nav
components and the subject stylesheets.

**No new Higher, Advanced Higher or (when it comes off hold) N5 Engineering topic pages or practice
tests.** Practice pages replace them (`tools/generators/practice-pages/`, DECK-RULES-physics 99,
engineering 106). Editing an existing page: Higher `docs/archive/higher-topic-page-guide.md`, N5 Eng
`tools/build-guides/n5-engineering-topic-pages.md`.

## File layout

```
_includes/site-menu.html              — nav drawer markup (every page includes it)
assets/css/site-menu.css, js/site-menu.js — nav drawer styles and behaviour
assets/js/site-search.js              — drawer search, loaded by site-menu.js on first use
scripts/build-search.mjs              — builds the search index after Jekyll (`npm run search`)
scripts/sim-check.mjs                 — checks every simulator in a browser (`npm run sims`)
scripts/build-stripboard.mjs          — checks the stripboard bundle (`npm run stripboard -- --check`)
assets/css/sims.css, js/widget-kit.js — the shared simulator component
assets/js/stripboard.js, test-bench-engine.js — generated (do not edit)
_data/search.yml, search-synonyms.yml — pages left out of search; pupils' words → site words
.github/workflows/pages.yml           — builds, indexes and deploys the site
assets/css/<subject>.css              — subject sheets (table below)
classes/                              — all subject pages
tools/generators/                     — generated pages (practice pages, Lessons, tests, mcq-bank, stripboard)
```

### S3 Physics topic pages — filing

A topic too large for one page becomes a **topic hub + lesson sub-pages**, keeping the topic URL as
the hub: `classes/s3-physics/<topic>.html` (hub), `classes/s3-physics/<topic>/<lesson>.html` (kebab-case
of the part label), plus generated `practice-test-a.html` and `graphing-practice.html`. Each lesson has
its own badge (`unlock:"page"`) in `progress/s3-physics.js`; the level-hub tile aggregates them
(`data-prog-badges`). Per-page `localStorage` keys use a unique lesson prefix. Links stay absolute.

---

## Standard page template

Every page follows this skeleton.

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
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#eef2ff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0a0f1f" media="(prefers-color-scheme: dark)" />
  <title>Page Title</title>

  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <script src="/assets/js/site-menu.js" defer></script>
  <!-- the subject sheet, e.g. /assets/css/higher-physics.css?v=hp-YYYYMMDDx -->

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

Older inline-themed pages may keep a single `light` color-scheme unless the page is being modernised.

**Engineering Science pages** link `/assets/css/engineering-science.css?v=eng-YYYYMMDD` instead of the
inline block and use `<main class="container">`. New and rebuilt Engineering pages open with the drawn
`.band-banner` (a `.bb-chip` holding the page's hub-tile sprite mark, a real-text `<h1>` and one `<p>`;
pattern `classes/s3-engineering/pneumatics.html`), never the photo banner. Older pages move on next touch.

| Banner colours (`--bb-a` / `--bb-b`; white text ≥ 5.75:1) | | Chip accent |
|-------|---------------------|------------------|
| Engineering hub, N5 level and topic pages | `#9a5410` / `#b3352e` (N5 hub `#9a5410` / `#9a3412`) | `--eng-ink-accent` |
| S3 level and topic pages | `#006e74` / `#0a5f57` | `--eng-ink-teal` |
| Pneumatic component pages | valves `#1F5A99`/`#184778` · cylinders `#5B3A8C`/`#472D6E` · air supply `#1D6363`/`#164D4D` · flow and timing `#2B6A2F`/`#215224` | per page |

---

## Navigation drawer and search

Full spec: `tools/build-guides/nav-drawer.md` (IDs, behaviour, menu order, level rows, Pagefind).
The rules that matter day to day:

- Markup `_includes/site-menu.html`, styles `site-menu.css`, behaviour `site-menu.js`. Every page
  includes it; never hand-write a menu.
- **Never add individual topic pages to the drawer.** A level with more than its hub gets a split row;
  Higher and Advanced Higher list the hub and **Lessons** (Higher also Past papers).
- Drawer text is 18px. Every folder collapses when the menu closes.
- **A new course folder needs one line in `COURSES`** in `scripts/build-search.mjs`. Searches stay on
  the device. `search: false` in front matter leaves a page out.
- Accent: pages set `--page-accent` (or `--menu-accent`); with none, the menu uses the site teal.

---

## Colour themes by subject

Copy exact token blocks from the source sheet or page.

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

Every subject follows the device appearance. Main column 1100px (Science 1200px).
Engineering: `--eng-ink-accent` (light `#9a5410`, dark `#f5c97a`) is the AA-safe text accent;
`--eng-orange` on text fails.

## Typography

- Font stack: `"Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif`; antialiased.
- `font-weight: 900` headings and labels, `800` muted text; `line-height` 1.5 base, 1.55 body, 1.3 titles.
- The font's own letter and word spacing; no extra spacing.
- **Equations are serif** (`"Times New Roman", Times, Georgia, serif`), quantity symbols in `<var>`
  (italic), numbers, units and operators upright — as the SQA relationship sheet.

## Banner

Banners are finished 3:1 artwork in `/assets/` (`<subject>-banner.jpeg`; topic pages reuse their
subject's). `.banner-wrap` is `aspect-ratio: 3 / 1`, **never a fixed height** (that crops the art);
`.banner` is `object-fit:cover`; `.banner-tint` stays in the markup, disabled. Hubs hide the overlay
title (`<header class="banner-wrap is-hub">`) because the art shows the subject; topic pages keep it.

## Main layout

`main.page-wrap`: `max-width:1100px` (1200 Science), `margin:1rem auto 2rem`, `padding:0 12px 4rem`;
`body` is a `min-height:100vh` flex column. Under 700px: padding `0 10px 3rem`. Engineering:
`<main class="container">` at `width: min(1100px, 92vw)`.

---

## Interactive pupil tasks — one-screen rule

**A task page (drag-and-drop, sorting, matching, labelling, building, answering) fits the question,
the pieces and the working area on one landscape iPad screen (≈1180 × 760 CSS px) without
scrolling.** Reference: `classes/electronics/block-diagram-builder.html`.

- Pieces beside the working area, never below: `grid-template-columns: minmax(0,1fr) 212px`, the bank
  scrolling internally; one column below 821px. Order: problem → working area + bank → buttons.
- Scale the working area with `transform: scale()` from the space available (width and height), floor
  ≈ 0.62, then pan.
- Short landscape screens (`min-width:821px and max-height:900px`): slim banner (~76px), `<h1>` in the
  page, intro hidden, no sticky sub-nav.
- Three inputs: Pointer Events drag (`touch-action:none`, never HTML5 drag-and-drop), tap then tap,
  and keyboard. Taps through a delegated `click` listener.
- Check: a screenshot at 1180 × 760 shows problem, pieces and working area at once.

## Simulations

Full spec: `tools/build-guides/simulations.md`. Every simulator is one component, `assets/css/sims.css`
+ `assets/js/widget-kit.js` (`window.WidgetKit`); pages never hand-roll sliders, axes or loops.
Predict first (`.sim-predict`, feedback on every option); every slider has a number box; the picture
moves with the numbers; graphs from `WidgetKit.graph`; the stage fits one screen. `npm run sims`
checks them all in the PR build. Still look in headless Chrome.

## Core component patterns

Exact CSS lives in the reference page or shared sheets; copy from there.

- **Shared / Physics / Science:** `.panel` (`.soft`), `.tile-grid`, `a.card` (`.card-media`,
  `.card-body`, `.card-title`, `.card-desc`), `.topic-tile` + `.tile-label`, `details.block` +
  `.details-inner`, `.tag`, `.year-section` (Science hub).
- **Electronics:** `.class-tile` (+ `.featured`) with `.tile-caption` / `.cap-title` / `.cap-sub`.
- **Engineering Science:** `.container`, `.intro`, `.card` (+ `.card-featured`), `.cta` (+ `.soon`;
  orange, `min-height:48px`), `.resource-grid`, `.resource-card`, `.resource-list`, `.grid-3`.
- **Higher topic pages:** `docs/archive/higher-topic-page-guide.md` (`.frac` uses `.fr-n` / `.fr-d`,
  never `num`/`den`).
- **Hub tiles:** `tools/build-guides/hub-tiles.md` before touching a hub (`hub-tiles.css`, whole tile is
  the link).
- **Slides index:** `tools/build-guides/slides-index.md`. Higher and AH indexes are generated Lessons
  pages: edit `tools/generators/lessons/src/higher.json` / `ah.json`, never the page.
- **AH lab pages:** `tools/build-guides/ah-lab-pages.md`; copy
  `classes/adv/electromagnetism/lab-f-bil-top-pan-balance.html`.

## Accessibility (every page)

- No skip link; keep `id="mainContent"` on `<main>`.
- Focus rings `outline: var(--focus-ring); outline-offset: var(--focus-offset)` on `:focus-visible`,
  never removed, ≥ 3px.
- `aria-label` on every `a.card`, `<section>` and `.tile-grid`. Decorative images `aria-hidden="true"`
  + `alt=""`.
- `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` on tappable cards.
- A `prefers-reduced-motion` block on every page.
- Tap targets ≥ 48px buttons, ≥ 44px nav links. Results announce via `aria-live="polite"`; no `alert()`.

---

## Site logo

The logo (`assets/logo/mark.svg`, drawn by R Stewart) comes from the shared includes, **never per
page**: the fixed home badge (`.site-home-badge`, hidden over a bannerless top row by
`holdBadgeClearOfTopRow()`), the drawer's `.site-menu-brand` row and the footer's `.footer-brand`.
Beside it, "MrStewartPhysics.co.uk" is real text, never a `lockup-*.svg`.

## Report a problem / Request a feature

**Every app-style page** (tool, builder, planner, test bench, simulation, on-screen test or quiz)
carries `{% include feedback-button.html about="<short page name>" %}` at the top. Not on plain
topic, hub or practice pages. Generated pages get it from their generator. A beta tool adds the
orange `Beta` tag and one line. Check: one `.feedback-btn`, 44px, `?about=` in the link.

## Footer

Every page uses `{% include site-footer.html %}`; never hand-write a `<footer>`. It renders
`© R Stewart Physics, Electronics and Engineering` and the Home, About & Contact and Credits links.
The `footer` element is styled per page (centred, frosted, `margin-top:auto`).

---

## Past-paper items

The private SQA question bank, through the Mac's **`web-exam-items`** skill (H/AH: practice pages,
skill `practice-page`). Every question that could be a real item is one, credited with the bank's
`Credit` wording in the `data-credit-note`; originals only where none fits, flagged ORIGINAL
(global CLAUDE.md §4). **Never committed here:** the bank CSVs, box coordinates or question text
pulled from the papers.

## Credits & copyright

Global `~/.claude/CLAUDE.md` §6; this is the site mechanism.

- A page carrying material that isn't the site owner's has a `data-credit-note` "Sources &amp;
  credits: …" paragraph under it (`font-size:0.82rem;opacity:0.78`; house wording on
  `classes/higher-physics.html`).
- **`CREDITS.md` and `classes/credits.html` change together**, with a row in
  `copyright-provenance-checklist.csv` for each new asset, in the same commit.
- Photos use `<figure>` with a linked `<figcaption>` credit. Unknown provenance is not publishable.

## Dual coding and the learning standard

- Dual coding: skill `dual-coding` and DECK-RULES 34. A `.dual` two-column block (text first in the
  DOM, collapsing at the mobile breakpoint); the figure is the mechanism, as inline SVG with the page's
  CSS variables, working in both appearances; SVG `role="img"` with a `<title>`.
- Learning standard: every quiz option teaches (wrong picks say why without naming the letter; the key
  starts "Right."; pattern `classes/n5-engineering/checkpoint-revision.html`); one new idea per section;
  retrieval and 1–3 self-rating stay on the device; a glossary beside each equation. No page opts in to
  `reading.css` or the reading-options panel.

## Progress and badges

One engine, `assets/js/progress.js` (`window.Progress`); each subject supplies only a config
`assets/js/progress/<ns>.js` and writes one key `progress-<ns>-v1`. Pages add only the hooks (the two
`<script>` tags, `id="progressHub"`, `data-prog-badges`, `data-prog-challenge`, `.prog-cloze` /
`.prog-fillin`, or `Progress.markSeen` / `Progress.record`). No blocking dialogs. New interactive pages
ship with tracking: run `/add-progress` and follow `progress-system-guide.md`. Design, guardrails and
status: `progress-system-rollout-plan.md`.

---

## Mobile breakpoints and safe areas

| Breakpoint | Changes |
|------------|---------|
| `max-width: 700px` | `page-wrap` padding `0 10px 3rem`; panel padding `.95rem`; grid gap `10px` |
| `max-width: 520px` | Drawer `min(340px, 92vw)`; nav rows `min-height:52px` |
| `max-width: 480px` | Electronics tile caption font reduces |
| `max-width: 768px` (Electronics) | Banner max-height `260px` |

Fixed controls near screen edges use `env(safe-area-inset-*)` (menu button
`calc(14px + env(safe-area-inset-*))`; main padding-bottom `calc(4rem + env(safe-area-inset-bottom))`).

## Build, preview and deploy

- Ruby via chruby: `source /opt/homebrew/opt/chruby/share/chruby/chruby.sh && chruby ruby-3.3.11 &&
  bundle exec jekyll build`. For search in a preview: `npm install` once, then `npm run search` after
  each build, and serve `_site` (`npx pagefind --site _site --serve`).
- The live site is built by `.github/workflows/pages.yml`. Pull requests build and index too; only
  `main` deploys.

---

## Retired — remove on sight

Strip these from any page you touch; never add them.

- "Mr Stewart's Materials" tiles and links. (`classes/materials-unavailable.html` stays only because
  three unrelated tiles use it.)
- The Electricity 1 practice quiz, its AI-tutor panel and the printable practice test.
- `.beta-note` banners and Higher's `.wip-notice`.
- Explanatory "bumf": a paragraph telling pupils how to use a page they can see. A note earns its place
  only for a deadline, a warning or what changed.
- Emojis (drawn sprite marks instead).

## What not to do

- No parallax, scroll-driven animation or `background-attachment: fixed` (breaks on iOS).
- No blueprint, grid or circuit-board backgrounds, except the faint grid on an Engineering `.sec-band`
  and the drawn `.band-banner`.
- No school branding or logos beyond what already exists.
- No teacher-only notes or internal references on pupil pages.
- Don't add S3 Engineering topics to the drawer; link them from the S3 Engineering hub.
- Don't create documentation files unless asked. Comment code only where the reason is non-obvious.
