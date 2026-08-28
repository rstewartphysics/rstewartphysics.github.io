# Electronics Theory restructure — build plan

**Goal:** break the single 1,681-line `classes/electronics/theory.html` into a short **Theory index**
plus **6 balanced topic sub-pages**, keeping every word of content. Chosen approach: **Option A**
(grouped sub-pages, matching the Higher Physics hub-and-topic pattern). Self-check: **per-page
mini-checks**. Scope: **theory split + a light audit of the other electronics pages**.

**Transistor switching circuits is its own page**, placed **after Resistor circuits and before
Signals** (decided 2026-06-22). It takes only the sensor/voltage-divider transistor switch from
Concept 10; the relay/back-EMF/flyback content stays with magnetism in Components & devices.

No code has been written yet — this is the plan only.

---

## 1. Audit findings (whole section)

| Page | Lines | Verdict |
|------|-------|---------|
| `theory.html` | **1,681** | **Outlier — split this.** 11 concepts + combined check on one scroll. |
| `stripboard-builder.html` | 1,134 | Interactive tool, fine as-is. |
| `555-astable.html` | 996 | Interactive tool, fine as-is. |
| `simulation.html` | 511 | Balanced (9 sections, own check). Leave. |
| `construction.html` | 498 | Balanced (6 sections, own check). Leave. |
| `testing.html` | 449 | Balanced (6 sections, own check). Leave. |
| `planning.html` | 446 | Balanced (7 sections, own check). Leave. |
| `revision.html` | 408 | Balanced (6 sections). Leave. |
| `glossary.html` | 329 | Reference list, fine. |
| `notes.html` | 116 | Thin, but it's a link/booklet stub — acceptable. |
| `videos.html` | 106 | Thin, but it's a video stub — acceptable. |

**Conclusion:** the over-/under-loading is concentrated almost entirely in `theory.html`. The five
satellite pages are already well-balanced and each carries its own "Check your understanding," so
they need **no structural change** — only the two inbound-anchor fixes in §5. Within `theory.html`
itself the imbalance is internal: Concept 8 (Component symbols, ~200 lines) is overweight and
Concept 6 (Capacitance, ~36 lines) is thin; the grouping below fixes both.

---

## 2. Current concept inventory (source line ranges in `theory.html`)

| # | Concept (anchor) | Lines | Notable widgets |
|---|------------------|-------|-----------------|
| 1 | Units, notation & prefixes (`#c1`) | 315–379 | — |
| 2 | Current, voltage, resistance & power (`#c2`) | 379–506 | eq-cards |
| 3 | Resistor networks (`#c3`) | 506–626 | eq-cards |
| 4 | Voltage dividers (`#c4`) | 626–721 | voltage-divider & comparator widget |
| 5 | Analogue vs digital & the oscilloscope (`#c5`) | 721–815 | — |
| 6 | Capacitance & timing (`#c6`) | 815–851 | — (thin) |
| 7 | Magnetic effect & electromechanical devices (`#c7`) | 851–908 | — |
| 8 | Component symbols & functions (`#c8`) | 908–1108 | large SVG symbol grid (heavy) |
| 9 | Logic gates & truth tables (`#c9`) | 1108–1237 | gate explorer widget |
| 10 | Circuits you must describe (`#c10`) | 1237–1331 | **splits:** transistor switch (~1243–1311) → new Transistor page; op-amp comparator + 555 refs → Logic & ICs |
| 11 | IC pin-out reference (`#c11`) | 1331–1436 | 741 / 555 / 7400-series pin-outs |
| — | Learning booklets (`#booklets`) | 1436–1448 | link list |
| — | Check your understanding + RAG self-check (`#check`) | 1448–1681 | MCQs + RAG table + inline CSS/JS |

---

## 3. Target structure

`theory.html` becomes a **Theory index** (short sub-hub). Content moves into a new
`classes/electronics/theory/` folder. Absolute asset/menu links mean the extra nesting needs no
path changes inside copied blocks.

```
classes/electronics/theory.html                                → REWRITTEN as the Theory index
classes/electronics/theory/quantities-and-calculations.html    ← Concepts 1 + 2
classes/electronics/theory/resistor-circuits.html              ← Concepts 3 + 4
classes/electronics/theory/transistor-switching-circuits.html  ← transistor switch (from Concept 10)
classes/electronics/theory/signals-and-capacitors.html         ← Concepts 5 + 6
classes/electronics/theory/components-and-devices.html         ← Concepts 7 + 8
classes/electronics/theory/logic-and-ics.html                  ← Concept 9 + 11 + comparator/555 (rest of 10)
```

Page order (index tiles + each page's "next" link): Quantities → Resistor circuits → **Transistor
switching circuits** → Signals & capacitors → Components & devices → Logic & ICs.

**Why these groups (size after merge, source lines):**

| Sub-page | Concepts | ≈ source lines | Rationale |
|----------|----------|----------------|-----------|
| Quantities & calculations | 1, 2 | ~190 | Maths foundations; also carries the "📐 5 steps" box. |
| Resistor circuits | 3, 4 | ~215 | Networks → dividers is the natural calculation progression; keeps the divider/comparator widget. |
| **Transistor switching circuits** | transistor switch from 10 | ~80 | Own focused page: sensor in a voltage divider → base → 0.7 V → drives output; high/low light & temp variants; "how to say it" frame. Sits right after dividers (it builds on them) and before signals. |
| Signals & capacitors | 5, 6 | ~130 | Folds the thin capacitance block into the signals page. |
| Components & devices | 7, 8 | ~257 | Heavy symbol grid + magnetism/electromechanical, **incl. relay + back-EMF + flyback diode** (kept here, not on the transistor page). |
| Logic & ICs | 9, 11, rest of 10 | ~330 | Digital/IC cluster: gates → pin-out reference → op-amp comparator + 555 astable/monostable (the non-transistor "circuits to describe"); keeps the gate-explorer widget. |

Balanced ~80–330 lines per page vs. the current 1,400+. (The transistor page is deliberately short
and single-purpose — appropriate for a high-stakes describe-the-circuit topic.)

**Concept 10 split detail:** the transistor-switch material (the `dt`/notes, the four
HighLight/LowLight/HighTemp/LowTemp circuit photos, and the "✍️ How to say it — transistor switch"
frame) moves to the new page. The op-amp comparator and the 555 astable/monostable descriptions
remain together and move to **Logic & ICs**. The combined RAG/MCQ check items for Concept 10 split
the same way (see §6).

---

## 4. Per-sub-page build spec

Each sub-page is a standard **Electronics (dark) topic page** — copy the exact `<head>`,
`color-scheme: dark`, inline `:root` tokens, and `<style>` from the current `theory.html` so the
theme, equation/`.frac`, `.eq-card`, `.example`, `.practice`, widget and RAG CSS all come along.

For each new page:

1. **Head/template:** full standard skeleton (CLAUDE.md). Reuse banner `/assets/electronics-banner.jpeg`.
   Keep the `.banner-overlay-text` (topic sub-page → overlay shows the *topic* name, e.g.
   "Theory — Resistor circuits").
2. **Backlinks:** `← Back to Theory` → `/classes/electronics/theory.html`, plus the existing
   `📖 Glossary` backlink.
3. **In-page sub-nav:** trim the current 12-link `subnav` down to just this page's concept anchors
   (+ a "Check" link and the "Electronics hub →" CTA).
4. **Concept blocks:** move the relevant `<section class="panel" id="cN">` blocks **verbatim**,
   including their widgets. Renumber the `concept-tag` pills **per page** (Concept 1, 2…) or switch
   to descriptive tags — decide once and apply consistently. Update each section's `id` to a stable
   slug (e.g. `#networks`, `#dividers`) rather than the old global `#cN`.
5. **Per-page mini RAG self-check:** split the combined `#check` block (1448–1681) so each sub-page
   ends with a short check covering **only its own concepts** — carry the matching MCQ items and the
   matching RAG rows, plus the shared check CSS/JS. (See §6 for the JS/localStorage note.)
6. **Footer:** `{% include site-footer.html %}`.
7. **localStorage prefixes:** give each page a unique prefix per CLAUDE.md (e.g. `en-th-qc-`,
   `en-th-rc-`, `en-th-ts-` (transistor), `en-th-sc-`, `en-th-cd-`, `en-th-li-`) so RAG/quiz state
   doesn't collide.

### `theory.html` (the new index)

- Keep the banner (overlay "Circuit Design — Theory") and the `lead` paragraph.
- **Keep the "📐 5 steps for any calculation" box** on the index (it's general guidance) — or move it
  onto the Quantities page; pick one home, not both.
- Replace the body with a `tile-grid` of **6 `.class-tile` tiles** (the dark Electronics tile
  pattern used on `electronics.html`), one per sub-page in course order, each with a one-line
  `tile-sub` describing its concepts.
- Keep the **Learning booklets** list and the Tools/Glossary `topic-list` links.
- Remove the old in-page `#c1…#c11` subnav and the combined `#check` section (the check now lives
  per-page). Optionally link to `revision.html` for whole-course testing.

---

## 5. Cross-reference & navigation updates (must-do, or links break)

Inbound anchor links to the old concept IDs — repoint these to the new pages:

| File | Line(s) | Old target | New target |
|------|---------|-----------|-----------|
| `classes/electronics/simulation.html` | 233, 278 | `theory.html#c11` (pin-outs) | `theory/logic-and-ics.html#pinouts` |
| `classes/electronics/construction.html` | 139, 287 | `theory.html#c8` (symbols) | `theory/components-and-devices.html#symbols` |

Other navigation:

- `classes/electronics.html` — the **Theory** course-section tile still points to `theory.html`
  (now the index); update its `tile-sub` text to reflect "five focused topics" instead of the long
  inline list. No new tiles needed on the main hub.
- `glossary.html` references `theory.html` (no `#anchor`) — verify it still makes sense pointing at
  the index; likely fine.
- **Do not** add the new theory sub-pages to the global nav drawer (CLAUDE.md: no individual topic
  pages in the drawer). They're reachable from the Theory index only.

---

## 6. Risk notes / gotchas

- **RAG/quiz JS:** the check block has inline CSS (from ~1607) and JS. When splitting, each page
  needs its own copy of that script scoped to its own MCQs/RAG rows and its own localStorage prefix.
  Verify the script keys off per-page IDs, not a hard-coded global list.
- **Concept 10 check items split across two pages:** the MCQ at ~1568 (flyback diode) belongs with
  the relay content → **Components & devices**; the RAG line "Describe the transistor switch, op-amp
  comparator, 555 astable and 555 monostable" (~1620) splits — *transistor switch* → new Transistor
  page, *comparator/555* → Logic & ICs.
- **Widgets travel with their concept:** voltage-divider/comparator (C4 → Resistor circuits) and
  gate explorer (C9 → Logic & ICs). Test each widget after the move.
- **Anchor renaming:** moving from `#cN` to descriptive slugs means any *bookmarked* old anchors
  die, but the §5 internal links are the only in-repo ones and are all updated above.
- **Print styles:** `theory.html` has an `@media print` block — carry it to each sub-page.
- **Jekyll/GitHub Pages:** new folder + files publish automatically; no config change.

---

## 7. Suggested build order

1. Create `classes/electronics/theory/` and build **Quantities & calculations** first as the
   template-of-record (proves the head/theme/check/localStorage pattern on a real page).
2. Build the remaining five sub-pages from that template (incl. the new Transistor switching
   circuits page, placed after Resistor circuits and before Signals).
3. Rewrite `theory.html` as the index (6 tiles in course order + booklets + links).
4. Apply the §5 cross-reference and hub-tile updates.
5. QA pass: every widget works, each RAG check saves independently, all backlinks/subnav resolve,
   dark mode + print + mobile (≤700 px) all good, no `#cN` links remain anywhere.

---

## 8. Interactives (second pass — *after* the split lands)

**Sequencing decision (2026-06-22):** build the split first as a clean, mechanical migration; add
interactives afterward, **one page at a time**, each as its own small change. Rationale: the split
is low-risk content movement; interactives are net-new creative builds — keeping them separate makes
each change reviewable and stops a misbehaving widget from muddying the migration. The split also
gives every interactive a properly sized home that doesn't exist today.

**Carried over unchanged by the split** (do not rebuild — just verify after moving):
voltage-divider/comparator widget → *Resistor circuits*; gate explorer → *Logic & ICs*.

**House style:** match the Higher topic-page interactives — inline, self-contained widget with its
own scoped CSS/JS, `aria-live="polite"` result readouts, keyboard-operable controls (≥44 px),
honours `prefers-reduced-motion`, works offline, no external libraries, dark-mode aware. Each new
widget reuses the page's `en-th-…` localStorage prefix if it persists state.

**Candidate interactive per page** (flagship first):

| Page | Existing widget | New interactive to build | Notes |
|------|-----------------|--------------------------|-------|
| **Transistor switching circuits** ⭐ | — | **Transistor-switch simulator:** a slider for light (LDR) or temperature (thermistor); shows the divider's base voltage live, the 0.7 V threshold line, and the output device (LED/lamp/relay) toggling on/off as it crosses. Toggle which arm holds the sensor → switches on rising vs falling input. | Flagship — the page is brand new and this is the highest-value, most examinable circuit. Build first. |
| Signals & capacitors | — | **Oscilloscope trace explorer** (adjust frequency/amplitude/time-base, read period & peak off the grid) **+ RC charging curve** (vary R, C → watch the exponential and the time-constant marker). | Two small widgets or one tabbed widget. |
| Quantities & calculations | — | **Prefix / scientific-notation converter** and an **Ohm's-law + power solver** (enter any two of V/I/R/P, get the rest with working). | Reinforces the "📐 5 steps" box. |
| Resistor circuits | voltage-divider/comparator | **Series/parallel resistance calculator** (add up to three resistors, pick arrangement, see total + working). | Complements the carried-over divider widget. |
| Components & devices | symbol grid | **Symbol-matching quiz** (match symbol → name/function; scored, RAG-style). | Turns the static symbol grid into active recall. |
| Logic & ICs | gate explorer | **Truth-table builder** (pick a gate / small combination, fill the table, self-mark) and a clear link through to the existing `555-astable.html` simulator. | Extends, doesn't replace, the gate explorer. |

**Per-interactive build order (second pass):** (1) Transistor-switch simulator → (2) Signals/scope +
RC → (3) Quantities converters/solver → (4) Resistor calculator → (5) Symbol quiz → (6) Truth-table
builder. Each is independently shippable; stop or reorder at any point.
