# CLAUDE.md — Site design reference

Design system, structure and conventions for mrstewartphysics.co.uk. Read before creating or
editing any page. This file holds the **rules and the map**; exact CSS values live in the files
named below — open them rather than guessing.

Global rules in `~/.claude/CLAUDE.md` apply on top of this — credits and references (§6) in
particular, since everything here is published.

**Canonical reference page** (copy its structure/components/conventions, but use the *subject's*
palette, not its blue): `classes/higher/electricity/current-pd-power-resistance.html`.

---

## Site overview

Static HTML on GitHub Pages via Jekyll. Audience: Scottish secondary pupils (S3–Advanced Higher),
mostly on iPads/mobile. Pages use `layout: none` and carry their own inline CSS. The only shared
files are the nav components and the two shared stylesheets (Engineering Science, Higher Physics).

## File layout

```
_includes/site-menu.html              — nav drawer markup (every page includes it)
assets/css/site-menu.css              — nav drawer styles (every page links it)
assets/js/site-menu.js                — nav drawer behaviour (every page links it)
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
classes/s3-physics/<topic>/practice.html             — quiz + past papers for the topic
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
    /* .visually-hidden, .skip-link, :root tokens, prefers-reduced-motion block, page styles */
  </style>
</head>
<body>
  <a class="skip-link" href="#mainContent">Skip to content</a>
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
ESC and overlay-click close it; focus is trapped while open. `markCurrentPage()` sets
`aria-current="page"` on the matching link and opens its parent `<details>`.

### Menu order
1. Home `/` · 2. Science `/classes/science.html` · 3. Engineering Science
`/classes/engineering-science.html` · 4. **Physics** (group): S3 / National 5 / Higher / Advanced
Higher · 5. Electronics `/classes/electronics.html` · 6. **Engineering Science** (group): S3 / N5 /
Higher (coming soon, `.site-menu-soon`). **Do not add individual topic pages to the drawer.**

### Accent colouring
Pages set `--page-accent` or `--menu-accent` in their own `:root`; the menu CSS reads
`--menu-accent: var(--page-accent, #2563eb)`.

---

## Colour themes by subject

Each subject has its own identity — always use the right one. Full `:root` token blocks live in the
page itself (inline-themed subjects) or the shared CSS (Higher, Engineering Science). This table is
the quick map; copy exact values from the source.

| Subject | Accent | `theme-color` (light) | Skip-link | Token source |
|---------|--------|-----------------------|-----------|--------------|
| Home / Physics | `#0aa8b5` teal | `#eaf7fa` | teal | inline per page |
| S3 Physics | `#00747c` blue-teal | `#eaf7fa` | teal | `assets/css/s3-physics.css` |
| Science (S1/S2) | `#16a34a` green | `#eef7ff` | dark | inline per page |
| Electronics | `#00e6b3` teal-green | `#0b1f1a` (dark page) | `#00e6b3` bg | inline; `color-scheme: dark` |
| National 5 | `#d74a84` pink | `#d74a84` | `#d74a84` bg / `#2a0a1a` text | inline per page |
| Higher | `#0a6fbf` azure | `#eef8ff` (dark `#0a0f1f`) | `#0a6fbf` bg, white | `assets/css/higher-physics.css` |
| Advanced Higher | `#b8860b` gold | `#b8860b` | `#111827` bg, white | `assets/css/adv-higher-physics.css` |
| Engineering Science | `#f28c28` orange | — | — | `assets/css/engineering-science.css` |

- **Electronics** and **Engineering Science** are dark-capable; Engineering Science has full
  `prefers-color-scheme` dark mode built into its sheet (`--eng-*` tokens).
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

## Hub tiles — the site standard (set 27 August 2026)

**The goal this serves: every page on the site should look like the same site. What differs is the
content and the theme colour — nothing else.** A component that exists in two subjects must be one
component with two palettes, never two components.

`assets/css/hub-tiles.css` is the shared navigation tile. It is **token-driven and subject-agnostic**
— it reads `--accent`, `--card`, `--text`, `--muted`, `--border`, `--surface-2`, `--shadow-soft` and
`--shadow`, all of which every subject sheet already defines. Link it and it themes itself.

```html
<div class="hub-grid">            <!-- .hub-grid.few for one or two tiles -->
  <a class="hub-tile" href="…" data-prog-badges="…" aria-label="…">
    <span class="tile-head">
      <svg class="tile-ic" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#ic-x"/></svg>
      <span class="tile-name">Title</span>
    </span>
    <span class="tile-body">One line on what is inside.</span>
  </a>
</div>
```

**The whole tile is the link.** A hub therefore never carries a row of filled accent buttons — that
was the old `.resource-card` + `.cta` pattern, and eight orange buttons in one view is exactly the
"the accent means nothing" problem. The accent stays reserved for *do the one main thing on this
page*. A hub should have **at most one** `.cta`.

**Every tile carries a drawn mark** from its subject's icon sprite, so a topic is recognisable by the
same symbol wherever it appears — the hub tile, the slides hub, the topic page.

- Three sprites, included as needed: `_includes/resource-icons.html` (12 generic marks — slides,
  notes, folder, simulation, book, scholar, tutor, video, quiz, cards, paper, doc),
  `_includes/physics-icons.html` (18 topic marks shared across the Physics levels — S3 Electricity 1
  and Higher current/p.d./resistance are the same idea, so they are the same mark),
  `_includes/eng-icons.html` (14) and `_includes/electronics-icons.html` (3).
- **Paint must be inline `style=` on every shape.** Document CSS cannot reach into a `<use>` shadow
  tree and class-styled shapes render solid black. Custom properties *do* inherit in.
- An icon's accent is `var(--ic-accent, <subject accent>)`, because on a coloured tile band the
  accent colour would be invisible against the band. `.tile-head` sets `--ic-accent: currentColor`,
  so inside a band the mark draws mono in the band's ink and keeps its colours anywhere else.
- **Draw at 48×48 and then look at it at 34px.** Hairlines radiating from a circle read as a
  sunburst; two stacked flowchart shapes merge into an hourglass; a dome over two lines reads as an
  earth symbol. All three were caught only by rendering and zooming — see global CLAUDE.md §7.

**Per-subject palette.** The four band colours rotate down a grid so a long list does not read as one
block. A subject opts in by declaring them; without them every band is the subject accent:

```css
--tile-1: …; --tile-2: …; --tile-3: …; --tile-4: …;   /* the rotation */
--tile-ink: …;                                        /* text/icon on the band */
```

**Check `--tile-ink` against all four bands** — it must reach 4.5:1 on every one. Engineering uses
dark ink `#1c1408` on its banner colours: green 6.36:1, teal 6.21:1, orange 8.33:1, coral 5.07:1.

**Progress badges are automatic.** `progress.js` appends its `.prog-chip` into
`tile.querySelector(".tile-head") || tile`, so naming the header `.tile-head` puts the badge in the
band with no extra code. Keep `data-prog-badges` on the tile itself.

**A tile with nothing behind it yet** is `<span class="hub-tile soon">` — a `<span>`, never an
`<a>`, so it is not focusable and not announced as a link.

**Media variant.** `.tile-head.is-media` swaps the drawn mark for bespoke artwork (the level banners
on `classes/engineering-science.html`). Use it only where real artwork exists for that tile; the
drawn icon is the default.

**Not for document lists.** A grid of past papers or data sheets stays `.resource-card` — hub tiles
are for navigating to a *page*, not for a list of PDFs.

**Adopted so far:** all three Engineering Science hubs, Higher Physics, Electronics, S3 Physics and
Advanced Higher — 104 tiles. Only the Science (S1/S2) hub still uses its own `a.card` /
`.topic-tile` variants.

**A subject sheet comes before the component sheet, and both come after `site-menu.css`.**
`site-menu.css` defines a generic `.skip-link` at the same specificity as a subject's, so a subject
sheet loaded before it silently loses. That is what an inline `<style>` block placed above the links
does — the Advanced Higher page had a 3.25:1 skip link for exactly that reason, and extracting its
CSS to a linked sheet in the right position fixed it.

**Stage a course before its pages exist.** The Advanced Higher hub carries all 17 topics as inert
`soon` tiles, grouped by unit and captioned, before a single topic page is written. Publishing one
is then a flip — `<span class="hub-tile soon">` to `<a class="hub-tile" href="…">` — and it picks
up its band colour automatically. A hub built this way shows a pupil the shape of the whole course
on day one, and it stops the hub drifting from the build plan.

**A tile may name its own colour.** The positional rotation sets `--tile-rot`, not `--tile-accent`,
so a class on the tile (Electronics keeps its six `.t-*` section colours) always wins over the
rotation regardless of stylesheet order. Write it at tile specificity — `.hub-tile.t-teal` — so it
also beats the base `.hub-tile` declaration.

**Two sprites, not one per page.** `_includes/resource-icons.html` holds the generic marks every
subject needs — slides, notes, folder, simulation, book, scholar, tutor, video, quiz, cards, paper,
doc — and each subject adds only its own topic marks (`eng-icons.html`, `higher-icons.html`).
Include both on a hub that needs both.

**A group can override the rotation.** Set `--tile-group` on a `.hub-grid` to give every tile in it
one colour. Use it where the grouping already carries meaning: Higher colours by course unit
(electricity azure, dynamic universe indigo, particles teal), Engineering rotates by position.

**Ink is per subject, and must be checked in BOTH themes.** Engineering uses dark ink on its banner
colours; Higher uses white on its unit colours. A subject whose `--accent` lightens in dark mode
needs an `--on-accent` token for anything filled with it — Higher's dark accent is a light blue, and
white text on it measured 1.88:1.

---

## Accessibility requirements (every page)

- **Skip link** `<a class="skip-link" href="#mainContent">Skip to content</a>` — off-screen, visible
  on focus. `id="mainContent"` on `<main>`.
- **Focus rings** `outline: var(--focus-ring); outline-offset: var(--focus-offset)` on
  `:focus-visible` — never removed, ≥3px.
- **`aria-label`** on every `a.card`, `<section>`, and `.tile-grid`.
- **Decorative images**: `aria-hidden="true"` + `alt=""`. `.visually-hidden` spans for extra SR context.
- **`touch-action: manipulation`** + **`-webkit-tap-highlight-color: transparent`** on tappable cards.
- **`prefers-reduced-motion`** block always present (transition/animation/scroll-behavior → none).
- **Tap targets** ≥48×48px buttons, ≥44px nav links. Widget results announce via `aria-live="polite"`;
  no `alert()`.

---

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

---

## Mobile breakpoints

| Breakpoint | Changes |
|------------|---------|
| `max-width: 700px` | `page-wrap` padding → `0 10px 3rem`; panel padding → `.95rem`; grid gap → `10px` |
| `max-width: 520px` | Drawer → `min(340px, 92vw)`; nav links → `1rem` |
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
▶ simulate-it tasks. **Every new page carries a `.beta-note` beta-testing banner under the back-link**
(a deliberate, shared style — remove all of them together when the pages leave beta). The booklet-PDF
buttons on topics 3/5/6/7 are `cta soon` placeholders until the PDFs land in
`assets/engineering-science/national-5/<nn-topic>/`. **The build spec for these pages is
`n5-engineering-pages-outline.md`** (repo root, git-excluded); its §8 is the phased build order.
**Unit 1 Question Bank** (`classes/n5-engineering/unit-1-question-bank.html`, linked from the hub's
`#unit1` card): a 236-question random MCQ generator covering Topics 1–2, one question at a time with
immediate right/wrong marking. It is **generated**, not hand-edited — the source bank and build script
live in `~/claude-work/n5-eng-mcq-bank/` (`bank_src.md` + `build_all.py`, which writes this page
directly into the repo). Edit the source and re-run the script; do not edit the page's embedded JSON.
localStorage prefix `n5q1-`. No progress badge is wired to it.

A sibling **`s3-engineering-pages-outline.md`** specs the S3 Engineering pages — that job is **not yet
started**.

To build/preview locally the repo uses **chruby** (system Ruby is too old):
`source /opt/homebrew/opt/chruby/share/chruby/chruby.sh && chruby ruby-3.3.11 && bundle exec jekyll build`.

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
+ its three lesson pages + practice under `classes/s3-physics/electricity1/`, four per-page badges
`elec1a`/`elec1b`/`elec1c`/`elec1-test` aggregated on the S3 hub tile). Each writes a single
`progress-<ns>-v1` key. The legacy `electronics-progress.js` engine and its `window.ElProgress` API
have been deleted — `progress.js` + `progress/electronics.js` are the only electronics path.
**Remaining:** Higher Engineering Science (Coming Soon — its
`eng-higher.js` config drops in when those pages are built); coming-soon topic stubs stay unwired until
they have content (behind-content guardrail). **New interactive pages ship with tracking by default** —
run **`/add-progress`** and follow `progress-system-guide.md` (API) + the rollout plan's §5 guardrails;
the `new-page` skill and the topic-page guides bake this in.

---

## What not to do

- No parallax, scroll-driven animation, or CSS `background-attachment: fixed` (breaks on iOS).
- No blueprint, grid, or circuit-board background patterns.
- No school branding or logos beyond what already exists.
- No teacher-only notes or internal references in student-facing pages.
- Do not add a seventh S3 Engineering topic to the global nav drawer — link them from the S3
  Engineering Science hub page only.
- Do not create documentation files unless asked.
- Do not add comments explaining what code does — only comment when the reason is non-obvious.
