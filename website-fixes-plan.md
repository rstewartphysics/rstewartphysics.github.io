# Website fixes — plan

Fixes for three Higher Physics pages. No HTML written yet; this is the agreed task list.
All work stays within the existing design system (shared `higher-physics.css`, inline widget CSS,
UK SVG conventions). Bump the `?v=hp-…` stylesheet query only if shared CSS changes (it shouldn't —
all changes below are per-page markup/inline-SVG).

---

## 1. Higher Physics hub — `classes/higher-physics.html`

**Goal:** make ownership obvious — distinguish *Mr Stewart's own materials* from *external sites*,
and clarify the AI Tutor. Remove the Tricky Questions tile.

### 1a. Clarify what is external vs. Mr Stewart's own
Currently external tiles already carry the `↗` `.ext-mark` + "opens in a new tab", but there is no
positive signal for *which resources are Mr Stewart's own*. Add a consistent ownership cue.

- Introduce two small inline badge styles (scoped to the hub, in the shared sheet's spirit):
  - **"Mr Stewart's"** badge — for resources he made/owns.
  - **"External site"** badge — for third-party sites (keeps the existing `↗` too).
- Add a one-line legend above the first tile grid (Learn) explaining the two badges, e.g.
  *"Badges show whether a resource is mine or an external site."*
- Apply badges to each tile:

  | Tile | Ownership | Action |
  |------|-----------|--------|
  | Mr Stewart's Materials | Mr Stewart's (Glow login) | "Mr Stewart's" badge; note Glow login |
  | Flash Physics (Mr Bappoo) | External | "External site" badge |
  | BBC Bitesize | External | "External site" badge |
  | Scholar (Heriot-Watt) | External | "External site" badge |
  | **AI Tutor** | Mr Stewart's (built by him) on MagicSchool | see 1b |
  | The other (better) Mr Stewart (YouTube) | External | "External site" badge |
  | Mrs Physics | External | "External site" badge |
  | Interactive Simulations | Mr Stewart's (on this site) | "Mr Stewart's" badge |
  | DELTA (Mr Taylor) | External | "External site" badge |
  | **Quizlets** | Mr Stewart's (his own sets) | "Mr Stewart's" badge — update copy below |
  | Practice Tests | Mr Stewart's (Glow login) | "Mr Stewart's" badge; note Glow login |
  | SQA Higher Physics | External | "External site" badge |
  | Past Papers Finder | External-sourced (already credited at foot) | leave credit note as-is |

### 1b. AI Tutor — clarify "built by Mr Stewart, runs on MagicSchool"
- Update the tile sub-text and `aria-label` to make clear: *the tutor was set up/programmed by Mr
  Stewart, hosted on MagicSchool.* Tag it as Mr Stewart's own (with an "External site" sense only
  for the MagicSchool host). Keep the `↗` since it opens MagicSchool in a new tab.

### 1c. Quizlets — mark as Mr Stewart's own
- Update sub-text from "Flashcards for key words and definitions." to make clear these are
  *Mr Stewart's own Quizlet sets*. Add the "Mr Stewart's" badge. Keep `↗` (Quizlet is the host).

### 1d. Remove the Tricky Questions tile
- Delete the `Tricky Questions` `.class-tile` (currently the pink `t-pink` tile in the Practise
  grid). No replacement; grid reflows automatically.

---

## 2. Monitoring & measuring a.c. — `classes/higher/electricity/monitoring-measuring-ac.html`

**Goal:** remove WIP notice, sharpen the a.c. definition, fix the diagrams and the given/derived
equation tagging, and add an rms graph.

### 2a. Remove the WIP notice
- Delete the `.panel.wip-notice` block (the "⚠️ Work in progress" note). Leave the `.wip-notice`
  CSS in place (harmless) or remove it too — removing markup is enough.

### 2b. Concept 1 — strengthen the a.c. definition (often examined)
- Keep the existing "Key idea" card but make the **definition** prominent and exam-worded: a.c.
  *changes direction and instantaneous value with time; d.c. flows in one direction only*.
- Consider promoting it visually (it already has a model-answer example — keep that). Ensure the
  definition wording in the key-idea card, notes, and model answer all match exactly.

### 2c. Concept 1 — split the oscilloscope diagram into two labelled boxes
- Replace the single combined SVG (one screen showing both a sine trace and a flat d.c. line) with
  **two separate oscilloscope boxes side by side**:
  - **Left box:** a.c. — sine trace, labelled "a.c." with peak and one period `T` marked.
  - **Right box:** d.c. — flat horizontal line, labelled "d.c.".
- Use a flex/grid wrapper (same pattern as the capacitors charging/discharging two-figure row) so
  they sit side by side on desktop and stack on narrow phones. Each gets its own `<figure>` +
  `figcaption` and an accurate `aria-label`.

### 2d. Concept 2 — fix given vs. derived (relationship sheet wording)
Per the SQA relationship sheet the **given** forms are:
`V_rms = V_peak / √2` and `I_rms = I_peak / √2`.
Currently the page tags `V_peak = √2 V_rms` / `I_peak = √2 I_rms` as "given" and the rms forms as
"derived" — this is reversed.

- Swap the tags so the **rms = peak / √2** forms carry `eq-tag given` ("On the relationship sheet")
  and the **peak = √2 × rms** forms carry `eq-tag derived`.
- Update the `.eq-desc`/notes copy to match.
- **Verify** against the actual SQA Higher Physics relationship sheet PDF before committing (the
  printed sheet has historically shown `V_peak = √2 V_rms`); follow the sheet's exact form. If the
  sheet shows the peak form, instead keep peak as given and clearly present the rms rearrangement —
  but per current instruction, present rms-over-√2 as the given form.

### 2e. Concept 2 — add an a.c. trace with the rms line marked
- Add a new `.figure` SVG: a sine a.c. trace with a **horizontal dashed line at the rms level**
  drawn in the correct place — at `V_rms = V_peak / √2 ≈ 0.707 × peak` (not at half the peak, not at
  the peak). Label the peak line and the rms line distinctly.
- `aria-label` + `figcaption` explaining the rms line sits at ~0.71 of the peak, and that it is the
  d.c. value delivering the same power.

### 2f. Concept 3 — fix given vs. derived for period/frequency
- The relationship sheet gives `T = 1/f`. `f = 1/T` is the **derived** rearrangement.
- Split the single eq-card into two clearly-tagged forms (or relabel): `T = 1/f` → `eq-tag given`;
  `f = 1/T` → `eq-tag derived`. Update surrounding copy so the derivation reads naturally.

---

## 3. Capacitors — `classes/higher/electricity/capacitors.html`

**Goal:** remove the tip note, fix the Concept 2 graph label overlap, reframe `τ = RC` as Advanced
Higher extra, and correct the discharging-current graph.

### 3a. Remove the tip note
- Remove the Concept 1 `.note` "**Watch the prefix.**" (the standalone tip callout).
  *(Confirm this is the intended "tip note"; the only other `.note` blocks are the Concept-3
  prediction feedback and are functional, not tips.)*

### 3b. Concept 2 — fix text overlapping the line in the Q–V graph
- In the energy `Q–V` graph SVG, the label `energy = ½QV` (at ~x=100, y=120) sits on top of the
  sloped line. Reposition the label clearly **inside the shaded triangle, below the line** (move it
  down/left so it no longer crosses the `vi-a` line), or shrink/anchor it so there's no overlap.
  Keep it readable in both light and dark mode.

### 3c. Concept 3 — reframe `τ = RC` as Advanced Higher extra
- The existing "Go further — the time constant RC" `<details>` already flags it as not required at
  Higher. Strengthen this: explicitly label it **Advanced Higher** and use the symbol **τ** —
  e.g. "Going beyond Higher — the time constant **τ = RC** (Advanced Higher)". Make the
  "this is extra / not needed for Higher" framing unmistakable (badge or bold lead-in).

### 3d. Concept 3 — fix the discharging current graph
- In the **Discharging** figure, the current curve (`vi-b`) currently decays from a positive value
  towards zero (above the axis). For discharging, the current flows the **opposite way**, so it
  should be drawn **negative — starting low (a large magnitude *below* the axis) and rising towards
  zero** from beneath.
- Redraw the discharging `vi-b` path so it begins at its most-negative point just after t=0 (below
  the horizontal axis) and curves up asymptotically to zero. Keep the capacitor p.d. curve
  (`vi-a`) decaying from max towards zero above the axis.
- The axis sits mid-height (not at the bottom) so there is room to show negative current. Adjust the
  axis/figure so the negative excursion is visible, and update the `aria-label`/`figcaption` to say
  the discharging current is negative (reverse direction) and returns to zero.
- Check the **charging-curve simulator** and the static charging figure still read correctly after
  any axis change (charging current stays positive, decaying to zero).

---

## Cross-cutting / checks
- Keep all changes within existing component classes and SVG `.scope`/`.circuit` styling; reuse
  `var(--accent)` / `var(--warm)` so light+dark both work.
- Preserve accessibility: every new/edited SVG needs an accurate `aria-label`; every figure a
  `figcaption`; tap targets and focus rings unchanged.
- These are content/markup-only edits — no shared CSS change expected, so the `?v=hp-20260620a`
  query string can stay unless a shared rule is touched.
- After edits: visually verify each page in light and dark mode (diagrams, no overlaps, side-by-side
  figures stack on mobile), and confirm the hub grid reflows cleanly after removing Tricky Questions.

### Open question to confirm before building
- **2d:** confirm the a.c. given/derived direction against the printed SQA relationship sheet
  (rms-over-√2 as given, per instruction) so the "On the relationship sheet" tag is accurate.
