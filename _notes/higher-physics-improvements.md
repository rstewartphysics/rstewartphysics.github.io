# Suggested improvements — Higher Physics (course hub)

**Page:** `classes/higher-physics.html`
**Reference exemplars:** `classes/s3-physics/electricity1.html` (topic-page quality bar), `classes/s3-n5-physics.html` (closest landing-page peer)
**Type:** Whole-course landing / hub page — *not* a topic page.

---

## 0. Read this first — what kind of page this is

`electricity1.html` and *What is an Engineer?* are **topic pages**: they teach, quiz, and self-check one unit. This is a **hub page**: its job is **orientation and routing** — get a Higher pupil to the right resource in the fewest taps, and tell them *what each thing is and when to use it*.

So the lessons we borrow from electricity1 are about **polish, performance, dark mode, accessibility, and "how to use this page" framing** — **not** about bolting quizzes, sorters, or `localStorage` widgets onto the hub. Deep interactivity belongs on the topic pages this hub should eventually link to. The single most electricity1-flavoured idea worth importing is the *"two/three ways to use this page"* front door; everything else is hub hygiene.

The current page is clean, on-brand, and works. Its weaknesses are: it's **heavy** (≈13 MB of images), **under-labelled** (cryptic one-word tiles), **flat** (no learning structure for a 3-unit course), and it **claims dark mode it doesn't ship**.

---

## ⚠️ Guardrails — what NOT to break

Read before changing anything. These are already correct and must survive every edit.

### Structure & platform
- **Keep `layout: none` and the inline-everything pattern.** No frameworks, no build step. Only shared deps are `site-menu.css` / `site-menu.js`.
- **Don't break the site menu:** keep `{% include site-menu.html %}`, the script/style links, the required IDs, and the blue `--page-accent` / `--menu-accent` (`#2b59ff`).
- **Don't break the existing IDs/anchors** the sticky sub-nav scrolls to (`#overview`, `#resources`, `#morelinks`). If you rename a section, update both the anchor and the `subnav-link`, and the `scroll-margin-top` rule.
- **Keep every external resource link working and `target="_blank" rel="noopener noreferrer"`.** Don't silently drop any of: Past Papers PDF, DELTA, Mr Stewart's Materials, Flash Physics, Scholar, AI Tutor, Practice Tests, Tricky Questions, Interactive Simulations, Self-Marking MC, Quizlets, BBC Bitesize, YouTube, Mrs Physics, SQA. These are the teacher's curated set.
- **Keep the internal links to `/classes/higher/simulations.html`** (and the relativity sim it leads to) — that's the site's own content.
- **Keep the PWA manifest-injection script and apple-touch-icon** unless deliberately replacing them (see §4.6).

### Visual identity (Higher Physics = blue)
- **Blue stays the accent** (`--accent:#2b59ff`, `--accent-2:#1636b8`). Don't drift to teal (Physics/Home), pink (N5), or gold (AH). The blue radial-gradient body background is the Higher identity — keep it.
- **None of the `CLAUDE.md` banned effects:** no parallax, no `background-attachment:fixed`, no scroll-driven animation, no blueprint/grid/circuit-board patterns. (The page is clean here — keep it that way.)
- **Keep the banner + frosted overlay-text pattern** and the sticky frosted sub-nav.

### Accessibility (must stay `CLAUDE.md`-compliant)
- **Never remove focus outlines.** Keep `:focus-visible` rings ≥3px on the skip link, sub-nav links, and every tile.
- **Keep** the skip link, `id="mainContent"`, the `aria-label` on each tile/grid/section, the `visually-hidden` helper, and the `prefers-reduced-motion` block.
- **Keep decorative tile images `alt=""`** and the meaningful description in the tile's `aria-label` (current pattern: `aria-label="… opens in a new tab"`). Don't regress to bare `alt` text that duplicates the visible title.
- **Maintain 44–48px tap targets.** Tiles are large — keep them so; don't shrink labels below tappable size on mobile.

### Mobile / overflow safety
- `overflow-x:hidden`, `max-width:100%`, `img{max-width:100%}` must stay.
- `env(safe-area-inset-*)` must stay on the sticky sub-nav (already correct).
- Introduce **no horizontal scroll**. The `subnav-links` horizontal scroll is intentional and fine.

---

## 1. Performance — the single biggest usability problem

The audience is Scottish pupils on **iPads and phones**, often on school Wi-Fi or mobile data. The page currently ships **~13 MB of tile thumbnails**:

| Image | Size |
|---|---|
| higherpastpapers.png | 1.46 MB |
| AI.png | 1.34 MB |
| mrstewartsmaterials.png | 1.24 MB |
| quizlet.png | 1.21 MB |
| bbc.png | 1.21 MB | 
| mc.png | 1.20 MB |
| practicetests.png | 1.19 MB |
| scholar.png | 1.18 MB |
| flashphsyics.png | 1.18 MB |
| tricky.png | 1.16 MB |
| Delta.png | 0.77 MB |

Each is a full-resolution PNG screenshot displayed in a ~240–300px-wide tile. The JS adds `loading="lazy"` to all but the first two, which helps below the fold but does nothing for the resources the pupil actually came for.

**Actions (highest priority on the whole page):**
1. **Resize** every tile image to ~2× its display size (≈600px wide max) and **convert to WebP/optimised JPG**. Target **< 60 KB each**. This alone should cut the page from ~13 MB to well under 1 MB.
2. Add explicit `width`/`height` (or an aspect-ratio box) to tile `<img>` to stop layout shift as lazy images load.
3. Keep the existing `loading`/`decoding` hints (the JS already sets them — fine to keep, but bake `loading="lazy"` straight into the markup so it works before JS runs).
4. The **Past Papers PDF is 22 MB** — opening it on mobile is brutal. At minimum, label the tile with the size (see §2) so pupils on data can choose; ideally host a lighter/split version.

> Guardrail: don't change *which* image represents which link, and keep `alt=""` (decorative) — just make the files small.

---

## 2. Content & labelling — say what each thing is

This is the biggest *content* gap versus the N5 hub. Higher tiles show **only a title**, and several are opaque to a pupil:

- "DELTA", "Scholar", "Flash Physics", "Mrs Physics" — a pupil who hasn't been told in class won't know what these are or when to use them.
- The `.tile-sub` element exists in the markup but is hard-set `display:none`, so the design *has a slot for a description and deliberately hides it*.

The N5 page does this right: every card has a one-line `card-desc` ("Fast explanations and quick practice", "Train exam skills one topic at a time").

**Actions:**
1. **Un-hide `.tile-sub`** (or add a one-line description) and give every tile a plain-English subtitle. Suggested copy (adjust to taste):
   - **Past Papers Finder** — "Find past-paper questions by topic. Large PDF (22 MB)."
   - **DELTA** — "Quick multiple-choice practice you mark instantly."
   - **Mr Stewart's Materials** — "Class booklets, notes and tasks. *Glow login needed.*"
   - **Flash Physics** — "Fast explanations and quick-fire practice."
   - **Scholar** — "Heriot-Watt's full Higher course. *Glow/Scholar login needed.*"
   - **AI Tutor** — "Guided hints and self-checking (MagicSchool)."
   - **Practice Tests / Tricky Questions** — "Targeted practice sets. *Glow login needed.*"
   - **Interactive Simulations** — "Play with the physics — on this site."
   - **Self-Marking Multiple Choice / Quizlets** — "Self-check key ideas and key words."
   - **BBC Bitesize** — "Short revision notes and tests."
2. **Flag login-gated links.** Several go to `glowscotland …sharepoint.com` and need a Glow login; Scholar needs a Scholar account. A small "Glow login" pill (reuse the `.tag`/`.badge` pattern) stops dead-end taps.
3. **Note "opens in a new tab" visibly** is already handled via the `↗` mark and `aria-label` — good, keep it.
4. **Fix the truncation risk:** `.tile-title` uses `-webkit-line-clamp:1`, which will clip "Self-Marking Multiple Choice". Allow two lines, or shorten the label.

---

## 3. Information architecture — reflect the course, fix the arbitrary split

Two structural problems:

**3.1 The Resources vs "More links" split is arbitrary.** "Past Papers" is a top Resource, but "Practice Tests", "Tricky Questions", "Self-Marking MC" and "Quizlets" — all practice — are buried under "More links". A pupil can't predict where anything lives.

Re-group by **what the pupil wants to do**, not by curation tier:
- **Learn / revise** — Flash Physics, BBC Bitesize, Scholar, YouTube, Mrs Physics, Mr Stewart's Materials, AI Tutor.
- **Practise** — DELTA, Self-Marking MC, Quizlets, Practice Tests, Tricky Questions, Interactive Simulations.
- **Exam prep** — Past Papers Finder, SQA Higher Physics.

The sub-nav then becomes Overview · Learn · Practise · Exam prep (update anchors + `scroll-margin-top`).

**3.2 The three SQA units are invisible.** Higher Physics is **Electricity · Our Dynamic Universe · Particles & Waves**. The Overview's outline names them (good), but nothing on the page lets a pupil enter *by unit* — which is how they actually revise ("I'm stuck on capacitors"). Right now every external tool is whole-course.

- **Short term:** keep the outline, but add a "Units & topics" section (see §3.4) that lets a pupil enter *by unit* and points to the best per-unit resources (e.g. the Past Papers Finder + relevant playlist).
- **Long term (the electricity1 opportunity):** the S3 course has rich topic pages (`electricity1.html`); **Higher has none yet** beyond the simulations page. The highest-value future work is building per-unit Higher topic pages on the electricity1 model — see §3.4 for how to stage them now and §5 for the shared stylesheet that should back them.

**3.3 Surface the site's own content.** "Interactive Simulations" is this site's own teaching content but sits anonymously among external links. Give it a featured tile (the `.class-tile.featured` pattern exists on Electronics) so first-party content stands out.

**3.4 Add the topic pages now — as "Coming soon" placeholders.** Build the *map* of Higher topic pages immediately, even though the pages don't exist yet. This sets the navigation structure, tells pupils what's coming, and means each real page just fills a slot that's already linked. Add a "Units & topics" section with one tile per topic, grouped by the three SQA units. Until a page exists, render the tile as a **non-clickable "⏳ Coming soon" placeholder**.

Suggested topic map (adjust granularity to your booklets/teaching order — one page per topic, or merge small ones):

- **Electricity** — Monitoring & measuring a.c. · Current, p.d., power & resistance · Electrical sources & internal resistance · Capacitors · Conductors, semiconductors & insulators · p–n junctions
- **Our Dynamic Universe** — Motion (equations & graphs) · Forces, energy & power · Collisions, explosions & impulse · Gravitation · Special relativity · The expanding universe
- **Particles & Waves** — Forces on charged particles · The Standard Model · Nuclear reactions · Wave–particle duality / photoelectric effect · Interference & diffraction · Refraction of light · Spectra

Implementation notes for the placeholders:
- **Make them genuinely unclickable and not focusable** — don't ship a dead `<a href>`. Reuse the site's existing patterns: Engineering's `.cta.soon` uses `pointer-events:none` + muted styling; N5 uses a `.badge.wip` "⏳ Coming soon" pill. Use a non-anchor element (or an `<a>` with **no `href`**, `aria-disabled="true"`, `tabindex="-1"`) so keyboard users don't tab into a link that goes nowhere.
- **Label state clearly:** visible "⏳ Coming soon" badge *and* an `aria-label` like "Capacitors — coming soon" so screen-reader users aren't told it's a link.
- **Flip a placeholder to live by changing two things:** add the `href` and remove the disabled styling/badge. Keep the tile markup otherwise identical so going live is a one-line change, not a redesign.
- Do **not** point placeholders at `/classes/workinprogress.html` *as if live* — a non-clickable placeholder is clearer than a tap that lands on a generic "work in progress" page. (The N5 `.card.wip → workinprogress.html` route is the older pattern; the inert placeholder is better here.)

---

## 4. Design, parity & polish

### 4.1 Dark mode — claimed but not shipped (bug)
`<meta name="color-scheme" content="light dark">` tells the browser the page supports dark mode, but there is **no dark `@media (prefers-color-scheme: dark)` block** — unlike electricity1, which implements it fully. Result: on a dark-mode iPad the browser may dark-style form controls/scrollbars while the page stays light, and the declared support is a lie.

**Pick one, don't leave it half-done:**
- **(Recommended)** Implement real dark mode like electricity1: move colours to `:root` variables (the page already uses variables — good), add a `@media (prefers-color-scheme: dark)` override, and add the matching dark `theme-color` meta (`<meta name="theme-color" media="(prefers-color-scheme: dark)">`). Re-check tile-label and frosted-overlay contrast.
- **Or** drop the claim: set `content="light"` and keep the page light-only (matches N5, which only declares the meta but is light).

### 4.2 Component vocabulary parity
Per `CLAUDE.md`, Physics pages use `a.card` / `card-body` / `card-desc` (as N5 does). This page uses the **Electronics** `.class-tile` naming in a light theme. It looks fine, but it's divergent. Not urgent — but if tiles are reworked for §2, align them to the `a.card` pattern so all Physics hubs share one vocabulary, or document the deliberate exception.

### 4.3 Add a light "how to use this page" / revision plan
N5's hub has a collapsed *"A simple revision plan"* `details`. The Higher Overview only says "Use this page to open core resources." Borrow the N5 pattern (learn → practise calculations → past papers by topic → little and often). This is the right *amount* of electricity1 energy for a hub — guidance, not widgets. The existing **SQA marking principles** `details` is excellent — keep it.

### 4.4 The electricity1 front door, hub-sized
A small "ways to use this page" chooser under the hero (Revise · Practise · Exam prep) that scrolls to the matching section makes the IA from §3.1 self-explanatory. Plain-language front door above the sub-nav — no persistence, no scoring.

### 4.5 Minor CSS cleanups
- **Duplicate `--menu-accent`** declared twice in `:root` (lines ~81 and ~84). Remove one.
- `scroll-margin-top:190px` is tuned for the full-height banner; once the banner shrinks on mobile the offset over-scrolls slightly. Verify against the shrunk banner breakpoint.

### 4.6 PWA icon
The injected manifest and apple-touch-icon use **`Delta.png`** — that's the third-party DELTA tool's logo, used here as the "Higher Physics" app icon. Odd branding if a pupil adds the page to their home screen. Consider a neutral Higher-Physics icon (the blue `Δ` theme would suit). Low priority.

---

## 5. Architecture — create a shared `higher-physics.css` now

Higher topic pages are coming (§3.4). Decide the CSS strategy **before** the first one is built, because extracting shared styles from one page is cheap and doing it after five inline pages exist is a painful, drift-prone refactor.

**Decision: create `assets/css/higher-physics.css`** — a shared stylesheet for the Higher hub and all Higher topic pages, mirroring the proven `engineering-science.css` pattern (which already backs every Engineering page and is cache-busted with `?v=…`). The deciding factor is this page's own history: recent commits `6e31489`, `58daeda`, `9962e03` are all dark-mode/contrast fixes — with inline CSS, every such fix must be repeated on every page and *will* drift. A shared sheet means **fix once, fixed everywhere.**

**Scope it to the framework/chrome, keep widgets inline:**
- **In the shared sheet:** `:root` theme tokens (blue) + a proper `@media (prefers-color-scheme: dark)` block (fixing the gap in §4.1), body background, banner + frosted overlay, sticky sub-nav, `.panel`, `details.mini`/`.block`, `.tile-grid` + tile/card patterns, the "coming soon" placeholder styling (§3.4), footer, and the a11y helpers (skip link, focus rings, reduced-motion).
- **Stay inline per page:** each topic's bespoke interactive widget CSS/JS (quizzes, sims, sorters — the bulk of `electricity1.html`). A hybrid is correct and is exactly what the Engineering pages already do.

**How to roll it out:**
1. Extract the chrome from the current hub into `assets/css/higher-physics.css`; add the dark-mode block while doing it.
2. Link it the Engineering way: `<link rel="stylesheet" href="/assets/css/higher-physics.css?v=hp-YYYYMMDD">`, bumping the version string on each change to bust the cache.
3. Migrate the existing `higher-physics.html` hub to use it (removes most of its inline `<style>`); build every new topic page against it from day one.
4. Document it in `CLAUDE.md` next to the existing shared-stylesheet note, and add the Higher blue token set as a documented theme.

**Scope guardrails:**
- Keep it **Higher-only** (the contained, low-risk choice). A single variable-themed `physics-base.css` spanning S3/N5/Higher/AH is more powerful but couples four colour schemes and forces edits to live N5/AH pages — out of scope for this pass.
- Don't let the shared sheet swallow widget code; that belongs inline.
- Migrating the hub must not change its blue identity, the menu wiring, or any anchor/sub-nav IDs (see top-level guardrails).

## 6. Accessibility — already good, tighten these
The page is largely compliant (skip link, focus rings, `aria-label`s, reduced-motion, `aria-hidden` on the `↗` marks, decorative `alt=""`). To tighten:
- After §2, make sure the new **descriptions are real text** (not baked into the screenshot image) so they're readable by screen readers and at large text sizes.
- Keep each tile's `aria-label` as the *meaningful* description; don't let the visible subtitle and the `aria-label` drift out of sync.
- If two-line titles are allowed (§2.4), confirm the tile min-height still gives a 44px+ target and the label doesn't overflow the frosted bar.
- If dark mode is implemented (§4.1), re-test contrast on the frosted `.tile-label` and `.banner-overlay-text` (frosted whites over dark images are a common contrast trap).

---

## 7. Prioritised action list

**Must do (impact + correctness):**
1. **Shrink the tile images** to WebP/optimised, < 60 KB each, with width/height set. (~13 MB → < 1 MB.) §1
2. **Add a plain-English subtitle to every tile** and **flag login-gated links**; un-hide `.tile-sub`; fix title truncation. §2
3. **Create `assets/css/higher-physics.css`** (chrome only, with a real dark-mode block) and migrate the hub to it — *before* building topic pages. This also resolves the dark-mode bug in one place. §5, §4.1

**Should do (usability):**
4. **Add the "Units & topics" section with "Coming soon" placeholders** for every Higher topic, grouped by the 3 SQA units — non-clickable, non-focusable, one-line flip to live. §3.4, §3.2
5. **Re-group resources by purpose** (Learn / Practise / Exam prep) and update the sub-nav + anchors. §3.1
6. **Add a short "how to use / revision plan"** (N5 pattern) and a small **3-mode front door**. §4.3, §4.4
7. **Feature the site's own Interactive Simulations**; label the Past Papers PDF size. §3.3, §2.1
8. Remove the duplicate `--menu-accent`; verify `scroll-margin-top` on mobile. §4.5

**Nice to have / direction:**
9. **Build the Higher topic pages** on the electricity1 model, against the shared sheet, filling the placeholders one by one. §3.4, §5
10. Align tile markup to the Physics `a.card` vocabulary, or document the exception. §4.2
11. Replace the DELTA-logo PWA icon with a neutral Higher-Physics icon. §4.6
</content>
</invoke>
