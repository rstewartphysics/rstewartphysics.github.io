# CLAUDE.md — Site design reference

This file documents the design system, page structure, CSS patterns, and conventions used across mrstewartphysics.co.uk. Read it before creating or editing any page.

---

## Site overview

Static HTML site hosted on GitHub Pages via Jekyll. Audience: Scottish secondary school pupils (S1–Advanced Higher), primarily on iPads and mobile devices. Pages use `layout: none` in Jekyll front matter and contain all their own CSS inline. The only shared files are the navigation components and the Engineering Science stylesheet.

---

## File layout

```
_includes/site-menu.html      — navigation drawer markup (included on every page)
assets/css/site-menu.css      — navigation drawer styles (linked on every page)
assets/js/site-menu.js        — navigation drawer behaviour (linked on every page)
assets/css/engineering-science.css — shared stylesheet for all Engineering Science pages
assets/style.css              — legacy/unused, do not reference
classes/                      — all subject pages
index.html                    — home page
```

---

## Standard page template

Every page follows this skeleton. Do not deviate from it.

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
  <meta name="color-scheme" content="light" />        <!-- "dark" for Electronics -->
  <meta name="theme-color" content="#eaf7fa" />        <!-- match page accent -->
  <title>Page Title</title>

  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <script src="/assets/js/site-menu.js" defer></script>

  <style>
    /* Global overflow fix — always first */
    *, *::before, *::after { box-sizing: border-box; }
    html, body { max-width: 100%; }
    body { margin: 0; overflow-x: hidden; }
    img, iframe { max-width: 100%; height: auto; display: block; }

    /* A11y helpers */
    .visually-hidden { ... }
    .skip-link { ... }

    /* Theme variables */
    :root { ... }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      * { scroll-behavior: auto !important; transition: none !important; animation: none !important; }
    }

    /* Page styles */
    ...
  </style>
</head>
<body>
  <a class="skip-link" href="#mainContent">Skip to content</a>

  {% include site-menu.html %}

  <header class="banner-wrap">
    <img src="/assets/pagebanner.png" alt="Descriptive alt text" class="banner" loading="eager">
    <div class="banner-tint"></div>
    <div class="banner-overlay-text">
      <h1>Page Title</h1>
      <p>One-line descriptor.</p>
    </div>
  </header>

  <main class="page-wrap" id="mainContent">
    <h1 class="visually-hidden">Page Title</h1>
    <!-- page content -->
  </main>

  <footer>© Mr R Stewart's Science, Physics, Electronics &amp; Engineering</footer>
</body>
</html>
```

**Engineering Science pages** omit the inline `<style>` block entirely and link the shared stylesheet instead:

```html
<link rel="stylesheet" href="/assets/css/site-menu.css">
<script src="/assets/js/site-menu.js" defer></script>
<link rel="stylesheet" href="/assets/css/engineering-science.css?v=eng-20260501">
```

They use `<main class="container">` (not `page-wrap`) and `<img class="banner" ...>` (not `banner-wrap`).

---

## Navigation drawer

Defined in `_includes/site-menu.html`, styled by `site-menu.css`, driven by `site-menu.js`.

### HTML IDs required (must match JS)

| ID | Element |
|----|---------|
| `siteMenuButton` | Open/close toggle button |
| `siteMenuOverlay` | Background overlay |
| `siteMenuDrawer` | The `<aside>` drawer |
| `siteMenuClose` | Close button inside the drawer |

### Behaviour (site-menu.js)

- Drawer slides in from the right (`translateX(105%)` → `translateX(0)`).
- Opening adds `.is-open` to drawer and overlay, `site-menu-open` to `<body>`.
- ESC key closes the drawer.
- Clicking the overlay closes the drawer.
- Tab focus is trapped inside the drawer while it is open.
- `markCurrentPage()` sets `aria-current="page"` on the matching link and opens its parent `<details>` group.

### Menu order

1. Home — `/`
2. Science — `/classes/science.html`
3. Engineering Science — `/classes/engineering-science.html`
4. Physics (group)
   - S3 — `/classes/s3-physics.html`
   - National 5 — `/classes/s3-n5-physics.html`
   - Higher — `/classes/higher-physics.html`
   - Advanced Higher — `/classes/adv-higher-physics.html`
5. Electronics — `/classes/electronics.html`
6. Engineering Science (group)
   - S3 Engineering Science — `/classes/s3-engineering-science.html`
   - National 5 Engineering Science — `/classes/n5-engineering-science.html`
   - Higher Engineering Science — coming soon (`.site-menu-soon`)

Do not add individual topic pages to the drawer.

### Accent colouring

Pages customise the menu accent by setting `--page-accent` or `--menu-accent` in their own `:root`. The menu CSS picks this up via `--menu-accent: var(--page-accent, #2563eb)`.

---

## Colour themes by subject

Each subject area has its own colour identity. Always use the correct theme for the subject being worked on.

### Home / Physics — teal light

```css
:root {
  --bg0: #f6fbfc;
  --bg1: #eef8fb;
  --bg2: #ffffff;
  --text: #0a2a30;
  --muted: #2f5b63;          /* rgba(47,91,99,0.95) */
  --accent: #0aa8b5;
  --card: #ffffff;
  --glass: rgba(255,255,255,0.84);
  --border: rgba(8,50,58,0.14);
  --shadow-soft: 0 10px 22px rgba(0,0,0,0.08);
  --radius: 18px;
  --focus-ring: 3px solid rgba(10,168,181,0.75);
  --focus-offset: 4px;
}
```

Body background: layered radial gradients in teal over the linear gradient. Theme colour meta tag: `#eaf7fa`.

### Science (S1/S2) — pastel multicolour light

```css
:root {
  --text-main: #0b1220;
  --text-soft: rgba(11,18,32,.78);
  --page-accent: #16a34a;          /* green */
  --glass: rgba(255,255,255,.76);
  --glass-strong: rgba(255,255,255,.84);
  --border: rgba(11,18,32,.12);
  --shadow-soft: 0 14px 30px rgba(0,0,0,.12);
  --shadow-card: 0 20px 46px rgba(0,0,0,.16);
  --radius-lg: 1.2rem;
  --radius-md: 1rem;
  --focus-ring: 3px solid rgba(0,0,0,.82);
}
```

Body background: complex radial gradient mixing whites, blues, pinks, greens. S1 year header: blue-white gradient. S2 year header: pink-purple gradient. Theme colour: `#eef7ff`.

### Electronics — dark green

```css
:root {
  --bg0: #071712;
  --bg1: #0b1f1a;
  --bg2: #081410;
  --text: #ffffff;
  --muted: rgba(255,255,255,0.84);
  --accent: #00e6b3;               /* electric teal-green */
  --accent-soft: rgba(0,230,179,0.18);
  --card: rgba(255,255,255,0.06);
  --glass: rgba(255,255,255,0.08);
  --border: rgba(255,255,255,0.14);
  --border-strong: rgba(0,230,179,0.42);
  --shadow-soft: 0 10px 22px rgba(0,0,0,0.26);
  --radius: 18px;
  --focus-ring: 3px solid rgba(0,230,179,0.85);
}
```

Dark page (`color-scheme: dark`). Body background: radial gradients in teal over dark linear gradient. Theme colour: `#0b1f1a`. Skip link uses `#00e6b3` background.

### Higher Physics — blue light

```css
:root {
  --bg0: #f6f8ff;
  --bg1: #eef2ff;
  --text: #0b1630;
  --muted: #2c466a;
  --accent: #2b59ff;
}
```

Theme colour: `#2b59ff`. Skip link uses `#2b59ff` background with white text.

### Engineering Science — graphite + orange (external CSS)

Defined in `/assets/css/engineering-science.css`. Has built-in dark mode via `prefers-color-scheme`.

```css
/* Light mode */
--eng-bg: #f5f7fa;
--eng-surface: #ffffff;
--eng-surface-2: #eef2f6;
--eng-text: #17202a;
--eng-muted: #52616f;
--eng-border: rgba(23,32,42,.16);
--eng-orange: #f28c28;
--eng-orange-dark: #c86c13;
--eng-shadow: 0 14px 30px rgba(15,23,42,.10);
--eng-radius: 20px;

/* Dark mode (prefers-color-scheme: dark) */
--eng-bg: #111820;
--eng-surface: #18212b;
--eng-surface-2: #22303d;
--eng-text: #f4f7fb;
--eng-muted: #b9c4d0;
--eng-border: rgba(255,255,255,.18);
--eng-shadow: 0 16px 34px rgba(0,0,0,.35);
```

---

## Typography

- **Font stack** (all subjects): `"Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif`
- Body uses `-webkit-font-smoothing: antialiased`
- `font-weight: 900` for headings, card titles, and labels
- `font-weight: 800` for muted/descriptive text
- `line-height: 1.5` base; `1.55` for body paragraphs; `1.3` for card titles

---

## Banner

```css
.banner-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  height: clamp(220px, 32vh, 420px);  /* Science uses 30vh/400px variant */
  box-shadow: 0 10px 24px rgba(0,0,0,0.10);
  border-bottom: 1px solid rgba(8,50,58,0.10);
}
.banner {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  display: block;
}
.banner-tint {          /* decorative colour wash, pointer-events:none */
  position: absolute; inset: 0;
  mix-blend-mode: multiply;
}
.banner-overlay-text {  /* title bar pinned to bottom of banner */
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(255,255,255,0.84);   /* dark theme: rgba(0,0,0,0.42) */
  backdrop-filter: blur(10px);
  text-align: center;
  padding: 0.9rem 1rem;
  border-top: 1px solid rgba(8,50,58,0.12);
}
.banner-overlay-text h1 { margin: 0; font-size: 1.08rem; font-weight: 900; }
.banner-overlay-text p  { margin: 0.22rem 0 0; font-size: 0.95rem; font-weight: 800; }
```

Engineering Science pages use `<img class="banner">` directly inside `.container` — no wrapper, no overlay text. Height is `clamp(170px, 24vh, 300px)` with `border-radius: 20px`.

### Banner image assets

| Subject | Asset |
|---------|-------|
| Home | `/assets/homelogo.png` |
| Science | `/assets/sciencebanner.png` |
| Physics | `/assets/physicsbanner.png` |
| Electronics | `/assets/Electronicsbanner.png` |
| Engineering Science | `/assets/Engeneringbanner.png` |
| S3 Physics | `/assets/s3physicsbanner.png` |
| National 5 Physics | `/assets/n5physicsbanner.png` |
| Higher Physics | `/assets/hphysicsbanner.png` |
| Advanced Higher | `/assets/advbanner.png` |

---

## Main layout

```css
main.page-wrap {
  max-width: 1100px;        /* 1200px on Science pages */
  margin: 1rem auto 2rem;
  padding: 0 12px 4rem;
  width: 100%;
  flex: 1;                  /* fills remaining viewport height */
}
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
```

On mobile (`max-width: 700px`): `padding: 0 10px 3rem`.

Engineering Science pages use `<main class="container">` with `width: min(1100px, 92vw)`.

---

## Core component patterns

### Panel

White (or glass) content block. Used to group sections.

```css
.panel {
  background: var(--card);        /* white */
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.08);
  padding: 1.05rem;
  margin: 0.95rem 0;
}
.panel.soft {                     /* frosted glass variant */
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

### Tile grid

Responsive card grid used on all hub pages.

```css
.tile-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  margin-top: 0.8rem;
  align-items: stretch;
}
```

### Navigation card (`a.card`) — teal/Physics theme

Flex column card with image header and text body. Used on home and Physics pages.

```css
a.card {
  display: flex; flex-direction: column;
  border-radius: 18px;
  border: 1px solid rgba(8,50,58,0.14);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 10px 22px rgba(0,0,0,0.08);
  text-decoration: none; color: #0a2a30;
  overflow: hidden; min-height: 150px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
a.card:hover, a.card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(10,168,181,0.14);
  border-color: rgba(10,168,181,0.28);
}
a.card:active { transform: translateY(1px); }

.card-media    { width: 100%; height: 96px; object-fit: cover; }
.card-media.linkhead {           /* emoji/icon header instead of image */
  height: 92px; display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 900;
}
.card-body     { padding: 14px; display: flex; flex-direction: column; flex: 1; }
.card-title    { margin: 0; font-size: 1.04rem; font-weight: 900; line-height: 1.3; text-align: center; }
.card-desc     { margin: 0; color: rgba(47,91,99,0.96); font-weight: 800; line-height: 1.45; }
```

### Topic tile — Science pages

Image-background tile with a frosted label pinned to the bottom.

```css
.topic-tile {
  position: relative; display: block;
  min-height: 156px; border-radius: 1rem;
  background-size: cover; background-position: center;
  border: 1px solid rgba(11,18,32,.10);
  outline: 2px solid rgba(255,255,255,.52); outline-offset: -6px;
  box-shadow: 0 20px 46px rgba(0,0,0,.16);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  touch-action: manipulation;
}
.topic-tile:hover, .topic-tile:focus-visible {
  transform: translateY(-3px);
  filter: brightness(1.04);
  outline: 3px solid rgba(0,0,0,.75); outline-offset: 3px;
}
.tile-label {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: .62rem .75rem; text-align: center;
  background: rgba(255,255,255,.78);
  backdrop-filter: blur(10px) saturate(160%);
  border-top: 1px solid rgba(11,18,32,.12);
  font-weight: 900; font-size: 1rem;
}
```

Topic tile background images are set via modifier classes, e.g. `.tile-waves { background-image: url("/assets/Wavesbaner.png"); }`.

### Class tile — Electronics pages

Dark-theme image tile with caption overlay.

```css
.class-tile {
  position: relative; display: block;
  height: 140px; border-radius: 18px; overflow: hidden;
  color: #fff; border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.28);
  box-shadow: 0 18px 34px rgba(0,0,0,0.30);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  touch-action: manipulation;
}
.class-tile:hover, .class-tile:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(0,230,179,0.36);
  box-shadow: 0 18px 34px rgba(0,230,179,0.16);
}
.class-tile.featured {
  border: 2px solid rgba(0,230,179,0.42);
  box-shadow: 0 18px 34px rgba(0,230,179,0.18);
}
.tile-caption {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
  padding: 0.58rem 0.75rem;
  background: rgba(0,0,0,0.50);
  backdrop-filter: blur(10px) saturate(155%);
  border-top: 1px solid rgba(255,255,255,0.12);
}
.cap-title { font-weight: 900; font-size: 0.98rem; }
.cap-sub   { display: block; opacity: 0.92; font-weight: 750; font-size: 0.86rem; }
```

### Collapsible section (`details.block`)

Used to hide long lists of links (e.g. quick links) by default.

```css
details.block {
  border-radius: 16px;
  border: 1px solid rgba(8,50,58,0.14);
  background: rgba(255,255,255,0.88);
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.06);
  margin-top: 0.8rem;
}
details.block > summary {
  cursor: pointer; padding: 12px;
  font-weight: 900; list-style: none;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  background: linear-gradient(135deg, rgba(10,168,181,0.10), rgba(255,255,255,0.78));
  border-bottom: 1px solid rgba(8,50,58,0.10);
}
details.block > summary::-webkit-details-marker { display: none; }
.details-inner { padding: 12px 12px 14px; }
```

### Tag / pill badge

```css
.tag {
  display: inline-block; font-size: 0.85rem;
  padding: 4px 10px; border-radius: 999px;
  border: 1px solid rgba(8,50,58,0.14);
  background: rgba(255,255,255,0.82);
  color: rgba(10,42,48,0.86);
  font-weight: 900; white-space: nowrap;
}
```

### Year section — Science hub

Container that groups topic tiles by year group.

```css
.year-section {
  margin-top: 1rem; overflow: hidden;
  background: var(--glass);
  border: 1px solid var(--border-strong);
  border-radius: 1.2rem;
  box-shadow: 0 14px 30px rgba(0,0,0,.12);
}
.year-header      { padding: 1rem; border-bottom: 1px solid rgba(11,18,32,.10); }
.year-header.s1   { background: linear-gradient(135deg, rgba(232,245,255,.95), rgba(242,255,248,.92), rgba(255,255,255,.78)); }
.year-header.s2   { background: linear-gradient(135deg, rgba(255,243,248,.94), rgba(243,240,255,.92), rgba(255,255,255,.78)); }
.year-title       { margin: 0; font-size: 1.35rem; font-weight: 900; }
.year-count       { padding: .2rem .65rem; border-radius: 999px; font-size: .9rem; font-weight: 900; }
.year-body        { padding: 1rem; }
```

### Engineering Science components (from shared CSS)

```css
.container       { width: min(1100px, 92vw); margin: 0 auto; padding: 14px 0 ...; }
.intro           { background, border, border-radius, padding as .card }
.card            { surface card, hover: translateY(-2px), border-color orange tint }
.card-featured   { border: 2px solid var(--eng-orange); orange glow shadow }
.cta             { orange call-to-action button, min-height: 48px }
.cta.soon        { disabled state, muted colours, pointer-events: none }
.resource-grid   { repeat(auto-fit, minmax(230px, 1fr)), gap: 12px }
.resource-card   { flex column, surface-2 background, orange hover border }
.resource-title  { font-weight: 800 }
.resource-meta   { muted colour, font-size: .92rem }
.resource-spotlight { grid, one-col mobile, two-col (1fr auto) ≥720px }
.resource-list   { muted ul for notes }
.grid-3          { repeat(auto-fit, minmax(220px, 1fr)) }
.stack-gap       { margin-top: 14px }
```

---

## Accessibility requirements

These apply to every page.

- **Skip link**: `<a class="skip-link" href="#mainContent">Skip to content</a>` — visible on focus, off-screen at rest.
- **`id="mainContent"`** on `<main>`.
- **Focus rings**: `outline: var(--focus-ring); outline-offset: var(--focus-offset)` on `:focus-visible`. Never remove outlines. Minimum 3px width.
- **`aria-label`** on all `<a class="card">`, `<section>`, and `<div class="tile-grid">` elements.
- **`aria-hidden="true"`** and empty `alt=""` on decorative images.
- **`.visually-hidden`** spans for additional screen-reader context inside tiles.
- **`touch-action: manipulation`** and **`-webkit-tap-highlight-color: transparent`** on all tappable cards.
- **`prefers-reduced-motion`** block always present, setting `transition/animation/scroll-behavior` to none.
- **Minimum tap target**: 48×48px for buttons, 44px for nav links (enforced in `site-menu.css`).

---

## Footer

```html
<footer>© Mr R Stewart's Science, Physics, Electronics &amp; Engineering</footer>
```

Science pages use a shorter variant: `© Mr Stewart's Science`.

```css
footer {
  text-align: center; padding: 1rem;
  background: rgba(255,255,255,0.72);   /* dark: rgba(0,0,0,0.25) */
  border-top: 1px solid rgba(8,50,58,0.10);
  font-size: 0.92rem; color: rgba(47,91,99,0.95);
  margin-top: auto;
}
```

---

## Mobile breakpoints

| Breakpoint | Changes |
|------------|---------|
| `max-width: 700px` | `page-wrap` padding reduces to `0 10px 3rem`; panel padding to `0.95rem`; grid gap to `10px` |
| `max-width: 520px` | Menu drawer narrows to `min(340px, 92vw)`; nav links reduce to `1rem` font |
| `max-width: 480px` | Electronics tile caption font reduces |
| `max-width: 768px` (Electronics) | Banner max-height reduces to `260px` |

---

## Safe area insets

Use `env(safe-area-inset-*)` wherever fixed controls are near screen edges:

```css
/* Menu button */
top: calc(14px + env(safe-area-inset-top));
right: calc(14px + env(safe-area-inset-right));

/* Main padding bottom */
padding-bottom: calc(4rem + env(safe-area-inset-bottom));
```

---

## Engineering Science course structure

### National 5 — topic order

1. Engineering Contexts & Systems
2. Energy & Efficiency
3. Electronics & Analogue Control
4. Logic & Programmable Control
5. Mechanisms & Drive Systems
6. Pneumatics
7. Structures & Materials
8. Assignment Preparation & Mixed Revision

---

## What not to do

- Do not add parallax, scroll-driven animations, or CSS `background-attachment: fixed` (breaks on iOS).
- Do not use blueprint, grid, or circuit-board background patterns.
- Do not add school branding or logos beyond what already exists.
- Do not include teacher-only notes or internal references in student-facing pages.
- Do not add a seventh S3 Engineering topic to the global nav drawer — link them from the S3 Engineering Science hub page only.
- Do not create documentation files unless asked.
- Do not add comments explaining what code does — only comment when the reason is non-obvious.
