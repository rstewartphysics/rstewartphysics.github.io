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
  `_includes/eng-icons.html` (13), `_includes/electronics-icons.html` (26) and
  `_includes/higher-hub-icons.html` (14 — one per Higher hub tile, `ic-hh-*`, RS-picked 29 Sep 2026), with `ah-hub-icons.html` (`ic-ah-*`) and `s3-hub-icons.html` (`ic-s3-*`) adding
  only the marks those hubs don't share with Higher.
- **Paint must be inline `style=` on every shape.** Document CSS cannot reach into a `<use>` shadow
  tree and class-styled shapes render solid black. Custom properties *do* inherit in.
- An icon's accent is `var(--ic-accent, <subject accent>)`. **In a tile band the mark sits on a
  card-coloured chip** (`.tile-ic`, 46px, in `hub-tiles.css`) so it keeps its two colours — ink +
  subject accent — instead of going mono on the band (RS, 26 Sep 2026; site-wide 29 Sep 2026).
- **No emoji in tile names or section headings** — legacy. The drawn mark is the picture.
- **External sites carry a `.tile-tag` "External" pill in the band**; the site's own tiles carry
  none. This replaced the old in-text "Mr Stewart's / External site" badges and their legend.
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

**Section tile (28 Sep 2026).** A landing page's few big choices — Home's subjects, the Physics
hub's levels — use `a.sec-tile` from the same sheet: banner art, a round badge overlapping it, then
name and one line. `--c` colours the badge and `--c-dk` is its lifted dark-mode twin. The badge
holds a drawn mark (`.sec-ic`) or short real text (`.sec-abbr` — the level letters S3/N5/H/AH).
A level with no artwork of its own swaps the image and the ring for `.sec-band` (level colour into
the page accent, a faint grid, one 60px `.sec-chip` two-colour mark with the level letters
`.sec-lvl` beside it) — the Engineering level page, 29 Sep 2026. Never a ring and a chip together:
they read as two icons. The Engineering hubs' banner is drawn to match (`.band-banner` in
`engineering-science.css`, colours per page via `--bb-a`/`--bb-b`): real-text title with a chip
beside it, both centred so the fixed logo and menu button never cover them. A level not built yet is `<span class="sec-tile soon">`: not a link, art and ring faded,
words full contrast.

**Media variant.** `.tile-head.is-media` swaps the drawn mark for bespoke artwork. Use it only where real artwork exists for that tile; the
drawn icon is the default.

**Not for document lists.** A grid of past papers or data sheets stays `.resource-card` — hub tiles
are for navigating to a *page*, not for a list of PDFs.

**Adopted so far:** all three Engineering Science hubs, Higher Physics, Electronics, S3 Physics and
Advanced Higher — 104 tiles. Only the Science (S1/S2) hub still uses its own `a.card` /
`.topic-tile` variants.

**A subject sheet comes before the component sheet, and both come after `site-menu.css`.**
`site-menu.css` defines generic rules at the same specificity as a subject's, so a subject sheet
loaded before it silently loses. That is what an inline `<style>` block placed above the links does.

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
one colour. Use it where the grouping already carries meaning: Higher's topic index colours by course unit
(electricity azure, dynamic universe indigo, particles teal) — the Higher *hub* instead gives every
tile its own `.t-*` colour (darker `--g2` stop, white ink ≥7.2:1) and puts Topic pages, Lesson
slides and Practice tests first under "Start here" (RS, 29 Sep 2026) — Advanced Higher does the same
(rotational bronze, quanta sienna, electromagnetism teal, and slate for the non-content strand —
Researching Physics, slides and question pages — so a resource row never reads as a course unit),
Engineering rotates by position.

**Ink is per subject, and must be checked in BOTH themes.** Engineering uses dark ink on its banner
colours; Higher and Advanced Higher use white on their unit colours. **A subject accent is not
automatically usable as a band** — Advanced Higher's gold `#b8860b` is only 3.25:1 against white
ink, so its unit-1 band is a darkened bronze `#8a6508` (5.32:1) and the accent stays off the bands
entirely (quanta 7.31:1, electromagnetism 5.47:1, research 7.58:1). A subject whose `--accent`
lightens in dark mode needs an `--on-accent` token for anything filled with it — Higher's dark accent is a light blue, and
white text on it measured 1.88:1.

---
