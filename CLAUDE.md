# CLAUDE.md — Site design reference

Design system, structure and conventions for mrstewartphysics.co.uk. Read before creating or
editing any page. This file holds the **rules and the map**; exact CSS values live in the files
named below — open them rather than guessing.

**Canonical reference page** (copy its structure/components/conventions, but use the *subject's*
palette, not its blue): `classes/higher/electricity/current-pd-power-resistance.html`.

---

## Site overview

Static HTML on GitHub Pages via Jekyll. Audience: Scottish secondary pupils (S1–Advanced Higher),
mostly on iPads/mobile. Pages use `layout: none` and carry their own inline CSS. The only shared
files are the nav components and the two shared stylesheets (Engineering Science, Higher Physics).

## File layout

```
_includes/site-menu.html              — nav drawer markup (every page includes it)
assets/css/site-menu.css              — nav drawer styles (every page links it)
assets/js/site-menu.js                — nav drawer behaviour (every page links it)
assets/css/engineering-science.css    — shared sheet for all Engineering Science pages
assets/css/higher-physics.css         — shared sheet for Higher hub + topic pages
assets/style.css                      — legacy/unused, do not reference
classes/                              — all subject pages
index.html                            — home page
```

### Higher Physics topic pages — filing structure

Grouped by SQA unit so new pages drop in cleanly:

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
| Advanced Higher | `#b8860b` gold | `#b8860b` | `#111827` bg, white | inline; cream→gold radial bg |
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

## Engineering Science — National 5 topic order

1. Engineering Contexts & Systems · 2. Energy & Efficiency · 3. Electronics & Analogue Control ·
4. Logic & Programmable Control · 5. Mechanisms & Drive Systems · 6. Pneumatics ·
7. Structures & Materials · 8. Assignment Preparation & Mixed Revision

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

**Current status (mid-rollout):** Phase 0 has **shipped the shared engine** — `assets/js/progress.js`
(`window.Progress`) plus the electronics config `assets/js/progress/electronics.js`, the construction
guide [`progress-system-guide.md`](progress-system-guide.md), and the `test/progress.html` logic harness.
**No live page is migrated yet:** **Electronics** pages still run the legacy `assets/js/electronics-progress.js`
(`window.ElProgress`, now kept as a transitional alias of `Progress`) and **Higher Physics** pages still
carry per-page inline engines — both migrate onto the shared engine in Phases 1–2 per the rollout plan.
**New interactive pages follow the rollout plan**; wire pages via the neutral hooks above and the
`progress-system-guide.md` API (the `new-page` skill bakes this in).

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
