# Shared page checklist (HTML/CSS pages)

Used by `/new-page`, `/improve-page`, `/from-pdf`. Read this once per task.

## Canonical references (read the ones that apply)
- **Design system + rules:** `/CLAUDE.md` (repo root).
- **Reference implementation (copy its structure/conventions, NOT its colours):**
  `classes/higher/electricity/current-pd-power-resistance.html`.
- **Higher topic pages only:** also read `/higher-topic-page-guide.md`.

## Use the right theme (never the reference page's blue if the subject differs)
Pick the subject's palette from the CLAUDE.md colour table: Physics/Home teal,
Science pastel, Electronics dark green, N5 pink, Higher blue, Adv Higher gold,
Engineering Science graphite+orange (external CSS). Set `--page-accent`/`--menu-accent`,
the two `theme-color` metas, and the skip-link colour to match.

## Non-negotiable guardrails (from CLAUDE.md)
- Standard head block: `color-scheme: light dark`, dual `theme-color` metas, shared
  menu CSS/JS, page-specific CSS/JS inline, absolute `/assets/…` `/classes/…` links.
- A11y: skip link, `id="mainContent"`, focus rings ≥3px, tap targets ≥44–48px,
  `aria-label` on cards/sections/grids, decorative imgs `aria-hidden`+`alt=""`,
  `prefers-reduced-motion` block, `aria-live` on widget results, no `alert()`.
- No parallax / `background-attachment: fixed` / blueprint-grid backgrounds.
- `overflow-x:hidden`, `max-width:100%`, `env(safe-area-inset-*)` on sticky controls.
- **Liquid safety:** no `{{`, `{%`, `%}` in inline CSS/JS (only `{% include site-menu.html %}`).
- Per-page `localStorage` keys use a unique topic prefix; never reuse another page's.

## Pre-commit validation (run before reporting done)
- Tags balanced: `<section> <div> <details> <svg> <figure> <script> <style>` open == close.
- JS `{} () []` balanced; every element ID referenced by JS exists in the HTML.
- `grep -nE "\{\{|\{%|%\}"` returns only the menu include.
- For Higher pages also run the checklist in `higher-topic-page-guide.md` §11.
