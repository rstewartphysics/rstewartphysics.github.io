## Slides index — the deck card (site standard, 24 September 2026)

Every course's `classes/<course>/slides.html` lists its decks as `.deck-card`s. **Holds at every
level of every subject** — Physics (S3, N5, Higher, Advanced Higher), Electronics, Engineering
Science (S3, N5, Higher) — and on any slides index built later. The deck-side rule this serves is
`~/claude-work/_deckkit/DECK-RULES.md` rules 29 and 29a; cite those, don't restate them.

**A deck with one PDF** stays as it is: the whole `<a class="deck-card">` is the link, icon + name
+ meta + a trailing `.go` arrow.

**A deck published as a PAIR** — a deck whose rounds carry answer pills ships two PDFs (rule 29a) —
is **one card carrying two named pills**:

```html
<div class="deck-card has-answers">
  <svg class="deck-ic" …><use href="#ic-…"/></svg>
  <span class="deck-txt">
    <span class="deck-name">L2 — Mass and Weight</span>
    <span class="deck-meta">PDF · 42 slides</span>
    <span class="deck-pills">
      <a class="deck-pill" href="…/l2-mass-and-weight.pdf" target="_blank" rel="noopener"
         aria-label="Mass and Weight — notes and questions, PDF, 42 slides. Opens in a new tab">Notes and Questions <span aria-hidden="true">↗</span></a>
      <a class="deck-pill" href="…/l2-mass-and-weight-answers.pdf" target="_blank" rel="noopener"
         aria-label="Mass and Weight — with answers, PDF, 42 slides. Opens in a new tab">With Answers <span aria-hidden="true">↗</span></a>
    </span>
  </span>
</div>
```

- **The card is a `<div>`, not a link.** The two pills are the links. That is the whole point: an
  `<a>` cannot be nested inside another `<a>`, so a card-wide link forces a stretched `::after`
  overlay and leaves one destination unnamed. Two pills need neither. **Drop the card's `.go`
  arrow** — each pill carries its own.
- **The words are fixed: "Notes and Questions" then "With Answers"**, in that order, on every
  course. A pupil who learns the pair on one index reads it on all of them.
- **The plain filename is the questions version**; the answers copy is `<name>-answers.pdf`. Links
  pupils already hold go on working.
- **Both pills stay outline-style, never filled.** A list of filled accent pills is the "the accent
  means nothing" problem from the hub-tiles standard above.
- **One component, per-subject palettes.** The three rules — `.deck-card.has-answers:hover,
  :focus-within`, `.deck-pills`, `.deck-pill` — are copied verbatim into the course's sheet and
  coloured by its own `--accent-2`, `--surface-2`, `--border-strong`, `--border-accent` and
  `--shadow-soft`. Live in `assets/css/s3-physics.css` and `assets/css/higher-physics.css`; copy
  from either, never write a second version.
- **Bump the sheet's `?v=` when the rules land** on a subject, or pupils keep the cached CSS and
  see unstyled pills.

**Check before it counts as done** (global `CLAUDE.md` §2, Tier 1 — it is shared CSS):

- Each pill ≥44 px tall and winning `elementFromPoint` at its own centre; the two consecutive in
  tab order; no `a a` in the card.
- Both PDFs' real page counts (`fitz`) equal to each other, to the card's `.deck-meta` and to both
  `aria-label`s.
- Both breakpoints and both appearances, in headless Chrome. **For the narrow width, set the
  viewport with the CDP device-metrics override** (or Playwright's `viewport`): `--window-size`
  alone will not render below ~450 px — it lays out wider and crops the screenshot, which looks
  exactly like horizontal overflow.

**Adopted so far:** S3 Physics (Space L2–L10) and Higher (ODU 1), 24 September 2026. Every other
already-published deck gets its pair, and this card, on its next touch.

---
