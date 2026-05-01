# AGENTS.md

## Project

This repository powers mrstewartphysics.co.uk.

The site is mostly static HTML pages with front matter where required. Pages are designed for Scottish secondary school pupils, mostly using iPads and mobile devices.

## Global page standards

For all new and updated pages:

- Use a mobile-first layout.
- Prevent horizontal overflow:
  - `*, *::before, *::after { box-sizing: border-box; }`
  - `html, body { max-width: 100%; }`
  - `body { overflow-x: hidden; }`
  - `img, iframe { max-width: 100%; height: auto; display: block; }`
- Include:
  - `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
  - safe-area padding for fixed controls where needed.
- Use large iPad-friendly buttons and cards.
- Keep student-facing wording.
- Do not include teacher-only notes.
- Keep emojis minimal.
- Use high contrast text.
- Use visible focus outlines.
- Use collapsed sections where long content would overload the page.
- Do not use parallax effects.

## Navigation drawer

Use the established blurred side drawer pattern:

- Drawer opens from the side.
- Overlay click closes the drawer.
- ESC closes the drawer.
- Drawer has a visible close button.
- Focus states must be visible.
- Drawer order:
  1. Home
  2. Science
  3. Physics
  4. Electronics
  5. Engineering

Engineering should link to:

- `/classes/engineering-science.html`

Engineering submenu should include:

- `/classes/s3-engineering-science.html`
- `/classes/n5-engineering-science.html`
- Higher Engineering Science — Coming Soon

Do not add all seven S3 topic pages to the global drawer. They should be linked from the S3 Engineering Science hub.

## Engineering Science theme

Engineering Science pages should have their own identity, separate from Physics and Electronics.

Use a light/dark Engineering theme:

- Light mode:
  - clean light background
  - white or pale grey cards
  - graphite/blue-grey text
  - orange accent
- Dark mode:
  - technical graphite background
  - darker panels
  - orange accent
- Use plain backgrounds. Do not add blueprint, grid or circuit-board patterns.
- Use shared Engineering Science banner image.
- Use CSS cards and sections below the banner.
- Do not use BHS logo or direct school branding.

Suggested CSS variables:

```css
:root{
  --eng-bg:#f5f7fa;
  --eng-surface:#ffffff;
  --eng-surface-2:#eef2f6;
  --eng-text:#17202a;
  --eng-muted:#52616f;
  --eng-border:rgba(23,32,42,.14);
  --eng-dark:#18212b;
  --eng-panel:#22303d;
  --eng-orange:#f28c28;
  --eng-orange-dark:#c86c13;
  --eng-bluegrey:#34495e;
  --eng-shadow:0 18px 45px rgba(15,23,42,.12);
  --eng-radius:24px;
}

@media (prefers-color-scheme: dark){
  :root{
    --eng-bg:#111820;
    --eng-surface:#18212b;
    --eng-surface-2:#22303d;
    --eng-text:#f4f7fb;
    --eng-muted:#b9c4d0;
    --eng-border:rgba(255,255,255,.16);
    --eng-shadow:0 18px 45px rgba(0,0,0,.35);
  }
}
