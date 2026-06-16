# Engineering Science — visual upgrade plan (match the Higher look)

**Goal:** bring every Engineering Science page up to the polish of the Higher topic/hub
pages, using the **exact colours pulled from `assets/Engeneringbanner.png`** as the
Engineering identity. **Banner and sticky sub-nav must mirror the Higher pages.**
**Grey is to be avoided at all costs** — surfaces, borders, muted text and feature
chrome must read as warm/coloured, not slate.

Status: **Stage 1 — plan only.** No page edits yet. Answer the clarifying questions
at the end before Stage 2 begins.

---

## 1. Colours sampled from the banner (the new source of truth)

Sampled directly from `assets/Engeneringbanner.png` (1536×1024). These are the
identity colours to build the Engineering theme around:

| Role in banner | Hex | RGB | AA on black text | AA on white text |
|---|---|---|---|---|
| Gear / beam **orange** (primary) | `#fd9700` | 253,151,0 | 8.64 ✅ | 2.19 ❌ |
| Leaf/globe + left-gradient **green** | `#34ae54` | 52,174,84 | 6.59 ✅ | 2.87 ❌ |
| Bridge/gear-circle **teal** | `#00a7b0` | 0,167,176 | 6.43 ✅ | 2.94 ❌ |
| Flask / right-gradient **coral-red** | `#ec514a` | 236,81,74 | 5.25 ✅ | 3.59 ❌ |
| Deep right-edge **orange-red** | `#ee5a2d` | — | ~7 ✅ | — |
| Bridge-circle **grey** | `#3c4a45` | — | — | — |

**Guardrail:** every accent above passes AA with **black/near-black** text but **fails
on white** — so accent chips/buttons keep dark (`#111`) text, exactly as the current
`.cta` does. Never put white text on these fills at body sizes.

**Do NOT adopt** the grey bridge circle colour (`#3c4a45`) — it is the one banner
colour we deliberately skip, per the "no grey" rule.

### Current Engineering tokens that are too grey (to be re-tinted)

From `assets/css/engineering-science.css`:

- `--eng-surface-2:#eef2f6` → cool grey panel fill
- `--eng-muted:#52616f` → blue-grey body/secondary text
- `--eng-border:rgba(23,32,42,.16)` → neutral grey hairline
- `--c-concept:#64748b` (slate) in the beta feature-grammar → **literally grey**
- table zebra `rgba(0,0,0,.025)` → grey wash

**Decision needed (Q1):** primary accent. The established brand orange is `#f28c28`
(contrast 7.69 on black); the *exact* banner orange is `#fd9700` (8.64). The brief says
use exact banner colours → recommend switching `--eng-orange` to `#fd9700` (with
`--eng-orange-dark` → `#c86c13`/`#ee5a2d`). Confirm before global change.

---

## 2. What Higher does that Engineering doesn't (the gap)

Reference Higher page: `classes/higher/electricity/current-pd-power-resistance.html`
+ shared `assets/css/higher-physics.css`. Reference Engineering pages:
`classes/engineering-science.html` (bare hub) and
`classes/n5-engineering/engineering-contexts-and-systems-beta.html` (most advanced).

### 2.1 Banner — biggest visible gap
- **Higher:** `<header class="banner-wrap">` = full-bleed `.banner` image +
  `.banner-tint` (decorative `mix-blend-mode:multiply` wash) + `.banner-overlay-text`
  (frosted title bar pinned bottom: `rgba(255,255,255,.84)` light / `rgba(0,0,0,.42)`
  dark) holding the page `<h1>` + one-line descriptor (+ optional `.beta-flag`).
  Height `clamp(220px,32vh,420px)`, bottom border + soft shadow.
- **Engineering:** bare `<img class="banner">` sitting in `.container`,
  `border-radius:20px`, `clamp(170px,24vh,300px)`, **no wrapper, no tint, no overlay
  text** — the `<h1>` lives separately in `.intro` below. Looks flatter/cheaper.
- **Fix:** add a `banner-wrap` / `banner-tint` / `banner-overlay-text` component to
  `engineering-science.css`, mirroring Higher's exact structure but with the
  Engineering palette (tint wash from green→orange, eng theme-color). Every page's
  title moves onto the banner.

### 2.2 Sticky sub-nav — exists, but only on two topic pages, and inline
- **Higher:** `.subnav-wrap` (sticky, `backdrop-filter` blur, bottom border) →
  `.subnav` rounded pill → `.subnav-links` (horizontal scroll, hidden scrollbar) +
  `.subnav-cta` accent button. Lives in the **shared sheet**, so every Higher page
  gets it for free. Active link underline driven by JS scroll-spy.
- **Engineering:** the subnav markup/CSS is **duplicated inline** on
  `engineering-contexts-and-systems(-beta).html` and `energy-and-efficiency.html`
  only. The **hubs and assignment-prep pages have no subnav at all.**
- **Fix:** lift the subnav CSS into `engineering-science.css` (single source), delete
  the inline copies, and add a subnav to every multi-section page (incl. the hubs:
  Levels / Topics / Resources style jump links). Mirror Higher 1:1 with eng accent.

### 2.3 Feature colour-grammar uses a grey "concept" colour
- **Higher:** concept = accent blue, equations = deep blue, interactives = gold,
  practice = warm orange, examples = green — all drawn from the Higher logo palette,
  applied to **left borders + small swatches only** (never behind text → AA safe).
- **Engineering beta:** concept = `#64748b` **slate-grey** ❌; int = orange, ex =
  `#28649e` blue (not a banner colour), prac = green.
- **Fix — map the grammar straight onto the 5 banner icon colours:**
  - concept panels → **teal `#00a7b0`** (replaces slate)
  - interactives → **orange `#fd9700`**
  - worked examples → **green `#34ae54`** (or teal, see Q3)
  - practice → **coral-red `#ec514a`**
  - equations (where present) → **deep orange-red `#ee5a2d`**
  Keep colour on borders/swatches only; always paired with a visible text label.

### 2.4 Surfaces, borders, muted text read grey
- Re-tint `--eng-surface-2`, `--eng-border`, `--eng-muted` and the table zebra with a
  faint **warm** cast (orange/green) instead of cool slate. The `wie-*` styling on
  `s3-engineering/what-is-an-engineer.html` already does this well (cream surfaces
  `#fff7e8`, warm muted) and is a good internal reference for the warmth target.

### 2.5 Equation cards (only where the topic has formulae)
- Higher's `.eq-card` (serif formula, real 2-D `.frac` with `.fr-n`/`.fr-d`, worded
  `aria-label`) is the gold standard. Engineering topics with maths — **Energy &
  Efficiency** (efficiency %, energy), **Mechanisms** (MA, VR), **Electronics** (Ohm's
  law, voltage divider) — should adopt eq-cards. Contexts & Systems (non-numeric)
  doesn't need them. Follow `higher-topic-page-guide.md` fraction rules exactly
  (`fr-n`/`fr-d`, **never** `num`/`den`).

### 2.6 Hub tiles
- Higher hubs use coloured `.class-tile`s (`t-blue`, `t-cyan`, `t-teal`…). Engineering
  hubs use plain grey-bordered `.card`s. **Fix:** give eng hub tiles a coloured
  left-edge / accent cycling through the banner palette (green, teal, orange, coral),
  echoing the five banner icons.

---

## 3. Page inventory & per-page scope

| Page | Today | Action |
|---|---|---|
| `classes/engineering-science.html` (top hub) | bare img banner, plain cards, no subnav | banner-wrap + overlay title, coloured tiles, add subnav |
| `classes/n5-engineering-science.html` (N5 hub) | same | same |
| `classes/s3-engineering-science.html` (S3 hub) | same | same |
| `classes/n5-engineering-assignment-prep.html` | bare, `<details>` stubs | banner-wrap + overlay title, re-tint |
| `classes/n5-engineering/engineering-contexts-and-systems.html` (live) | inline subnav, img banner | banner-wrap, move subnav to shared sheet, palette fix |
| `…/engineering-contexts-and-systems-beta.html` | most complete; slate concept colour, blue ex | banner-wrap, re-map feature colours to banner, de-grey |
| `classes/n5-engineering/energy-and-efficiency.html` | inline subnav, img banner | banner-wrap, eq-cards, palette fix |
| `classes/s3-engineering/what-is-an-engineer.html` | separate `wie-*` system | **Q4:** reconcile to shared system, or keep as-is |
| `classes/engineering.html` | meta-refresh redirect | leave untouched |

**Beta vs live:** `engineering-contexts-and-systems.html` (live) and `-beta.html`
both exist. Decide (Q5) whether the upgrade lands on beta first then promotes, or
whether beta is retired and the live page becomes canonical.

---

## 4. Implementation approach (recommended)

1. **Do it in the shared sheet first.** Add banner-wrap, banner-tint,
   banner-overlay-text and the subnav component to `engineering-science.css`, plus the
   re-tinted token block and the banner-palette feature-grammar variables. Bump the
   cache-buster (`?v=eng-YYYYMMDD`). This upgrades chrome on every page in one edit and
   keeps per-page CSS minimal — matching how Higher centralises in `higher-physics.css`.
2. **Per-page HTML:** swap the bare `<img class="banner">` for the Higher banner
   skeleton (header → img + tint + overlay text with the page title), add a subnav
   block where sections exist, delete now-duplicated inline subnav CSS.
3. **Roll out in order:** hubs → live Contexts & Systems → Energy & Efficiency →
   beta/the rest. Verify dark mode + AA after each.
4. **Verify:** light & dark, iPad/mobile widths (700/520/480), focus rings, AA on every
   new accent pairing, no horizontal scroll, `prefers-reduced-motion` respected.

### Higher banner skeleton to mirror (eng palette)

```html
<header class="banner-wrap">
  <img src="/assets/Engeneringbanner.png" alt="…descriptive…" class="banner" loading="eager" decoding="async">
  <div class="banner-tint"></div>
  <div class="banner-overlay-text">
    <h1>Page Title</h1>
    <p>One-line descriptor.</p>
  </div>
</header>
<div class="subnav-wrap">
  <nav class="subnav" aria-label="Jump to sections">
    <div class="subnav-links"> … .subnav-link … </div>
    <a class="subnav-cta" href="…">Hub ↗</a>
  </nav>
</div>
```

Note: Higher uses `<main class="page-wrap">`; Engineering uses `<main class="container">`.
Keep `.container` — only add the new chrome above it. `scroll-margin-top` on sections
so the sticky subnav doesn't hide headings.

---

## 5. Guardrails (do-not-break list)

- **No grey.** No slate/`#64748b`, no neutral `rgba(0,0,0,…)` washes for fills or
  borders — re-tint warm. The only banner colour we skip is its grey bridge circle.
- **Exact banner colours only** for the Engineering identity — don't invent new hues
  (the beta page's `#28649e` blue is not in the banner; replace it).
- **Dark text on accent fills** (`#111`). All five accents fail AA on white text.
- **Colour is never the only signal** — feature hues stay on borders/swatches paired
  with a visible label; AA contrast of text is untouched.
- **Mirror Higher, don't reinvent** — copy the banner-wrap / subnav structure and
  class names from the reference, adapt palette only.
- **Centralise in `engineering-science.css`;** keep page-specific widget CSS inline,
  exactly as the design doc prescribes. Bump the `?v=` cache-buster on change.
- **Engineering Science page conventions stay:** `<main class="container">`, absolute
  asset paths, the standard footer, skip-link + `#mainContent`.
- **Accessibility unchanged-or-better:** ≥48px tap targets, ≥44px nav links, focus
  rings ≥3px, `aria-label` on cards/sections/subnav, `prefers-reduced-motion` block,
  decorative images `aria-hidden`+`alt=""`.
- **No iOS-breaking effects** — no parallax, no `background-attachment:fixed`, no
  blueprint/circuit-board background patterns (per CLAUDE.md).
- **Don't touch** the `engineering.html` redirect; don't add topic pages to the global
  nav drawer.
- **Notes/plan stay out of the build** — this file lives in `_notes/` (Jekyll-excluded)
  because it contains Liquid-like `{% … %}` / `{{ … }}` snippets.

---

## 5a. Decisions locked (answered 2026-06-16)

- **Q1 Accent → SWITCH** `--eng-orange` to the exact banner orange `#fd9700`
  (`--eng-orange-dark` → `#c86c13`/`#ee5a2d`). Keep dark `#111` text on it.
- **Q2 Banner titles → OVERLAY ON ALL PAGES** (hubs + topic pages), mirroring Higher.
- **Q3 Feature mapping → as proposed** (concept=teal, int=orange, ex=green,
  prac=coral, eq=deep-orange). Unchanged.
- **Q5/Q6 Scope → CHROME + DE-GREY FIRST** across all pages (banner, subnav, palette,
  no-grey); eq-cards/HUD/gamification on maths topics in a **later** pass.
- **Q4 `wie-*` S3 page → ALIGN BANNER/SUBNAV ONLY**; leave its warm internals as-is.
- Q5 (beta vs live Contexts & Systems) still open — confirm at Stage 2 start.

## 6. Clarifying questions (original list)

1. **Primary accent:** switch `--eng-orange` from the current brand `#f28c28` to the
   *exact* banner orange `#fd9700` (brighter, more saturated)? The brief says use exact
   banner colours → recommend **yes**, but it changes every orange on the site section.
2. **Banner titles on hubs:** put the page title onto the banner (frosted overlay) for
   the **hub** pages too, or keep hubs' title in `.intro` and only add the overlay
   treatment to topic pages? (Recommend overlay everywhere for consistency with Higher.)
3. **Feature-colour mapping:** confirm the concept=teal / int=orange / ex=green /
   prac=coral / eq=deep-orange mapping. Any preference on which banner colour means
   "examples" vs "practice"?
4. **The `wie-*` S3 page** (`what-is-an-engineer.html`): fold it into the shared
   system now, or leave it (it already avoids grey with warm cream surfaces) and only
   align its banner/subnav?
5. **Beta vs live Contexts & Systems:** upgrade the beta page and promote it over the
   live one, or apply changes to the live page directly?
6. **Scope of this pass:** chrome only (banner + subnav + palette/de-grey) across all
   pages first, *then* a later pass for eq-cards/HUD/gamification on the maths topics?
   Or do the full treatment page-by-page?
```
