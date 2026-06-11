# Build plan — Higher Physics topic page: *Current, p.d., power & resistance*

**Target file:** `classes/higher/current-pd-power-resistance.html`
**Links from:** the "Electricity" unit list in `classes/higher-physics.html` (currently the `Current, p.d., power & resistance` placeholder — flip it to a live `<a href>` when shipped).
**Shared styling:** `assets/css/higher-physics.css` (chrome + dark mode already done). Topic-specific widget CSS/JS stays inline on this page.
**Exemplar to mirror:** `classes/s3-physics/electricity1.html` (teach → try → self-check structure, reveal mark schemes, RAG tracker, `localStorage`).
**Source mined:** `classes/higher/Higher Physics Past Papers (September 2025 Update).pdf` (761 pp, full 2023–2025 papers + marking instructions).

---

## 0. What the past-paper document tells us

I searched the whole 761-page document. Findings that shape this page:

- **This topic is heavily examined**, as multiple-choice *and* extended response: page-hits for `power` (41), `internal resistance` (39), `resistor` (36), `resistance of` (32).
- **Representative command words + contexts found** (verbatim stems):
  - "Determine the resistance of resistor R."
  - "Calculate the power dissipated by the motor."
  - "(i) Calculate the effective resistance of the part of the person's body…"
  - "Calculate the initial charging current."
  - "State the potential difference across…"
  - "Explain why the current decreases with time."
  - MC: *"A potential divider circuit is set up as shown … The p.d. across the 7·0 kΩ resistor is …"* (p68) — a ratio calculation with 5 options.
- **Potential dividers ARE examined** (MC ratio questions; sensor-divider context). Keep this central.
- **"Wheatstone" = 0 hits in 761 pages, "potentiometer" = 0 — by design.** The bridge circuit **is still examined at Higher**, but the SQA no longer uses the *terms* "Wheatstone bridge", "balanced" or "unbalanced". It is now taught and assessed as an **application of the potential divider**: two dividers across the same supply, with pupils expected to **calculate the p.d. between the two midpoints** (the voltage "across the bridge"). The zero hits confirm exactly this — the circuit and its maths are there, the named terminology is not.

> Implication: the **assessable core** is Q=It, V=IR, series/parallel resistance, the power trio, and potential dividers **including the two-divider "across the bridge" p.d. calculation**. There is no separate "Wheatstone" topic — it lives inside the potential-divider section, and the simulator stays (reframed, with no bridge/balance vocabulary in the UI).

---

## ⚠️ Guardrails — what must hold

### Curriculum accuracy (exam-focused site)
- **Do NOT use the terms "Wheatstone bridge", "balanced", or "unbalanced" in student-facing content.** The SQA has dropped this vocabulary. Teach the circuit as **two potential dividers across one supply** and ask pupils to **find the p.d. between the two midpoints** (the voltage "across the bridge"). It **is** assessable at Higher — keep it inside the core potential-divider section, *not* flagged as extension/AH.
- **Potential dividers stay in the assessable core** (they are examined). Cover the **unloaded** divider ratio/output, the **sensor (LDR/thermistor) divider**, and the **two-divider p.d.** ("across the bridge") calculation.
- **Don't smuggle in non-Higher relationships.** Resistivity `R = ρL/A` is N5/AH — at most a one-line boundary note, not a worked method. `emf`/internal resistance (`E = V + Ir`) belongs to the sibling page *Electrical sources & internal resistance* — reference and link it, include only the minimum overlap.
- **Match the SQA relationships sheet wording and symbols** for every equation. Use the SQA command words (Calculate / Determine / Show that / Explain / State) in all practice.
- **British spelling, calm tone, lead with the answer.** Higher reading level but plain.
- **No teacher-only notes or extra branding** (per `CLAUDE.md`).

### Circuit symbols (explicit user requirement)
- **Use UK / BS-IEC symbols throughout**, drawn as inline SVG (crisp, themeable, light + dark):
  - **Resistor = open rectangle** (never the US zig-zag).
  - **Variable resistor / rheostat** = rectangle with a diagonal arrow through it; **potentiometer** = rectangle with a third (wiper) terminal.
  - Cell / battery (long-thin = +), lamp (circle ⊗), switch, **ammeter (A)** and **voltmeter (V)** in circles.
  - **Thermistor** (rectangle + diagonal line with hooked end) and **LDR** (rectangle in a circle with two inward arrows) — needed for sensor dividers.
- All SVG strokes use `currentColor` / theme vars so symbols invert correctly in dark mode.

### Platform / structure (same as the hub)
- **`layout: none`**, inline-everything for this page's widgets; only shared deps are `site-menu.*` and `higher-physics.css?v=…`.
- **Keep the site menu** (`{% include site-menu.html %}`, required IDs, blue `--page-accent`/`--menu-accent`).
- Reuse the hub's chrome: banner pattern, sticky sub-nav, `.panel`, `details.mini`. Add a **jump nav** to the sections.
- **Stay overflow-safe:** `overflow-x:hidden`, `max-width:100%`, wrap any wide tables/SVGs in a scroll container, `env(safe-area-inset-*)` on sticky controls. No horizontal scroll.

### Interactivity (iPad-critical)
- **Every drag control needs a tap/number-input fallback.** Pupils are on iPads — no drag-only widget. Sliders must also be operable by typing a value and by keyboard.
- **Use a page-scoped `localStorage` prefix: `hp-cpr-…`** (don't collide with `e1gar-…` / `wie-…`). One small save/reset helper shared by RAG + quiz + question generator.
- **Replace any `alert()` with inline `aria-live="polite"` status.**

### Accessibility (CLAUDE.md)
- Skip link, `id="mainContent"`, focus rings ≥3px on every control, 44–48px tap targets, `prefers-reduced-motion` block, `aria-live` on every widget result.
- All collapsibles are keyboard-operable `<summary>`; SVG diagrams have `role="img"` + `<title>`/`aria-label`; decorative SVG `aria-hidden`.
- **Dark-mode parity for every new widget** (the shared sheet handles chrome; bespoke widget colours need dark overrides).

---

## 1. Page structure (jump-nav sections)

1. **Overview & "how to use"** — 2 short lines + a "What you'll be able to do" checklist (maps to SQA outcomes).
2. **The equations** — the full relationship set with "when to use" (see §2). Collapsible derivations.
3. **Current & charge** — `Q = It`; conventional current; a.c./d.c. pointer to sibling topic.
4. **Potential difference, Ohm's law & resistance** — `V = IR`; V–I graphs; ohmic vs non-ohmic.
5. **Resistors in series & parallel** — combination rules + worked examples + calculator.
6. **Electrical power** — the power trio + energy; "which equation?" chooser.
7. **Potential dividers** — unloaded ratio, output voltage, **sensor dividers (LDR/thermistor)**, and **two dividers across one supply: the p.d. between the midpoints** ("voltage across the bridge"); both simulators.
8. **Circuit symbols (UK)** — reference chart + matching game.
9. **Practice** — MC quiz + self-marking generator + exam-style extended questions with mark schemes.
10. **Check yourself (RAG)** — success-criteria self-check, saved to `localStorage`.

---

## 2. All equations (with SQA-sheet wording)

Present each with: symbol form, words, units, and "use when". Keep a one-line worked example per equation.

**Core (assessable at Higher):**
| Relationship | Words | Use when |
|---|---|---|
| `Q = It` | charge = current × time | charge moved, average current |
| `V = IR` | p.d. = current × resistance (Ohm's law) | single component / whole circuit |
| `R_T = R₁ + R₂ + R₃ + …` | series total resistance | components in series |
| `1/R_T = 1/R₁ + 1/R₂ + …` | parallel total resistance | components in parallel |
| `P = IV` | power = current × p.d. | given I and V |
| `P = I²R` | power = current² × resistance | given I and R |
| `P = V²/R` | power = p.d.² ÷ resistance | given V and R |
| `E = Pt` (and `P = E/t`) | energy transferred | energy/heat dissipated |
| `V₁/V₂ = R₁/R₂` | potential divider ratio | comparing two series resistors |
| `V₁ = (R₁ /(R₁+R₂)) × V_s` | output of a potential divider | find V across one resistor |
| `V = V_P − V_Q` (each `V = (R/(R₁+R₂))V_s`) | p.d. between the midpoints of **two dividers across one supply** ("across the bridge") | two-divider / sensor-comparison circuits |

**Overlap (link to *Electrical sources & internal resistance*, include lightly):**
| `E = V + Ir` / `E = I(R + r)` | emf, terminal p.d., lost volts | real supplies with internal resistance |

**On the "across the bridge" p.d.:** the midpoint p.d. is **zero when the two dividers share the same resistance ratio** (`R₁/R₂ = R₃/R₄`) — state it that way, **never** as "balanced". Do not use "Wheatstone", "balanced" or "unbalanced".

**Boundary note (do NOT teach as a method):** `R = ρL/A` (resistivity) is N5/AH, not Higher — one sentence only.

---

## 3. Notes content (key teaching points)

- **Current & charge:** conventional current direction; `Q = It`; current is the same everywhere in a series loop; splits at junctions (conservation of charge).
- **p.d. & Ohm's law:** p.d. as energy per unit charge; `V = IR`; **V–I graphs** — straight line through origin = ohmic (constant R); curved (e.g. lamp filament) = resistance rises with temperature. Gradient interpretation.
- **Series vs parallel** (the spine):
  - Series: same current; p.d.s add; `R_T` increases.
  - Parallel: same p.d. across branches; currents add; `R_T` is **less than the smallest branch**.
  - Worked mixed-network example (series + parallel), step-by-step.
- **Power:** choose the power equation from what's given; `E = Pt` for energy/heat; real-context examples (motor, heater) mirroring the past-paper stems found.
- **Potential dividers:**
  - Unloaded ratio `V₁/V₂ = R₁/R₂`; output `V₁ = (R₁/(R₁+R₂))V_s`.
  - **Sensor dividers:** swap one resistor for an **LDR** (resistance ↓ as light ↑) or **thermistor** (resistance ↓ as temperature ↑) → output voltage changes → drives a transistor/comparator. This is the examined application — show how V_out moves as the sensor changes.
- **Two dividers across one supply ("voltage across the bridge"):** build two potential dividers between the same supply rails and find the **p.d. between their midpoints**, `V = V_P − V_Q`. Each midpoint voltage is just a divider output — work out both and subtract. The p.d. is **zero when the two dividers have the same resistance ratio** (`R₁/R₂ = R₃/R₄`); say it like that, **not** "balanced". Common context: one side fixed, the other a sensor (LDR/thermistor), so the midpoint p.d. changes with light/temperature. **Avoid the words "Wheatstone", "balanced", "unbalanced"** — they are no longer used at Higher.
- **UK symbols section:** annotated reference chart; emphasise rectangle resistor vs US zig-zag; show variable resistor, potentiometer, thermistor, LDR, A/V/G meters.

---

## 4. Interactive elements

Mark = **M**ust / **S**hould / **N**ice.

1. **(M) Series/parallel resistance calculator.** Add/remove resistor inputs, toggle series ↔ parallel, shows `R_T` **with the substituted working line**, not just the number. Tap to add, type values.
2. **(M) Potential divider simulator.** SVG divider (UK symbols). Sliders **and** number inputs for `R₁`, `R₂`, `V_s`; live `V_out` + the substituted formula. **Toggle R₂ → LDR or thermistor**: a "light"/"temperature" slider changes its resistance and you watch `V_out` swing. `aria-live` announces V_out.
3. **(M) "Voltage across the bridge" simulator** — two potential dividers across one supply; pupil calculates/observes the p.d. between the midpoints. The requested bridge sim, reframed as dividers; full spec in §6. **Core Higher — no bridge/balance vocabulary in the UI.**
4. **(M) "Which power equation?" + calculator.** Pick the two known quantities → it selects `P=IV` / `P=I²R` / `P=V²/R`, rearranges, and computes.
5. **(S) Self-marking question generator.** Random sensible values for `Q=It`, `V=IR`, power, divider ratio (model on electricity1's `vir` widget). Enter answer → instant right/wrong with the worked solution; tolerance on rounding.
6. **(S) MC quiz** (6–8) mirroring past-paper MC: divider ratio, parallel `R_T`, choose-the-power-equation, V–I graph reading. Scored, `aria-live`, saved to `hp-cpr-quiz`.
7. **(S) Exam-style extended questions** with `<details class="reveal">` **mark schemes** using SQA command words and "show the relationship → substitute → answer with unit" structure (mirror electricity1's reveal pattern).
8. **(N) UK circuit-symbol matching game.** Drag **or tap** to match symbol ↔ name (resistor, variable resistor, potentiometer, LDR, thermistor, A, V, G, lamp, cell). Reinforces the symbols requirement.
9. **(M) RAG self-check** tied to the success criteria, persisted (`hp-cpr-rag`), with a "X of N explored / G-A-R" summary.

---

## 5. Past-paper alignment (what practice must cover)

Drive the practice items directly from the question types found:
- **MC ratio:** "p.d. across one resistor in a divider" (p68 style, 5 options).
- **Determine R:** find an unknown resistor in a network ("Determine the resistance of resistor R").
- **Calculate power dissipated** in a real device (motor/heater).
- **Effective resistance** of a parallel combination in a real context.
- **Explain** trends ("why the current decreases…") — wire the reveal mark schemes to reward cause→effect.
- **State** values from a circuit (p.d. across a component).
- Always model the **mark-gaining layout**: relationship → substitution with units → final answer with unit (matches the hub's "SQA marking principles" panel).

---

## 6. "Voltage across the bridge" simulator — detailed spec

**Goal:** let a pupil **calculate and see the p.d. between the midpoints of two potential dividers** across one supply. **Core Higher**, framed entirely as potential dividers — **no "Wheatstone", "balanced" or "unbalanced" anywhere in the UI or labels.**

**Visual (inline SVG, UK symbols, themeable):**
- Two potential dividers drawn side by side between the same `+V_s` and `0 V` rails. Left divider = `R₁` (top) / `R₂` (bottom) with midpoint **P**; right divider = `R₃` (top) / `R₄` (bottom) with midpoint **Q**.
- A **voltmeter (V in a circle)** connected between **P** and **Q**, reading the p.d. "across the bridge". (A voltmeter measuring the midpoint p.d. — not a galvanometer/null detector, since that framing is gone.)

**Controls (drag + type, keyboard-operable):**
- Sliders + number inputs for `R₁…R₄`; supply voltage `V_s`.
- Optional: swap one resistor for an **LDR/thermistor** with a light/temperature slider, so the midpoint p.d. changes with the sensor.
- Mode toggle: **Show the p.d.** (read `V_PQ` for any settings) | **Find the unknown** (one R hidden; set the p.d. to zero, then reveal it via equal ratios `R₁/R₂ = R₃/R₄`).

**Maths:**
- Midpoint voltages by divider: `V_P = V_s·R₂/(R₁+R₂)`, `V_Q = V_s·R₄/(R₃+R₄)`.
- **Voltage across the bridge:** `V_PQ = V_P − V_Q` (show the substituted working, with sign = which midpoint is higher).
- Reads **zero when `R₁/R₂ = R₃/R₄`** — described as "the two dividers have the same ratio", never "balanced".

**Behaviour & feedback:**
- Live `V_PQ` readout + the substituted calculation; sign indicates polarity.
- When `V_PQ` reaches 0: voltmeter shows 0·0 V, an `aria-live` note explains *why* (equal ratios), and (in "find the unknown" mode) the hidden R is revealed.
- No `alert()`; all status in an `aria-live="polite"` region.

**A11y / theming:** SVG `role="img"` + `<title>`; controls labelled; strokes use theme vars for dark mode; respects `prefers-reduced-motion`.

---

## 7. Technical / build notes

- **Reuse `higher-physics.css`** for chrome; bump its `?v=` only if shared rules change. Add a single inline `<style>` for this page's widgets (calculators, SVG circuits, RAG), with a matching `@media (prefers-color-scheme: dark)` block for any bespoke colours.
- **One IIFE**, small modules per widget; a shared `hp-cpr-` `localStorage` helper (save/load/reset) used by RAG + quiz + generator.
- **SVG, not images**, for all circuit diagrams and symbols (crisp on iPad retina, themeable, zero extra asset weight — consistent with the hub's image-light direction).
- Keep the file self-contained; no build step, no frameworks.

---

## 8. Prioritised build order

**Phase 1 — core teach + assessable practice (ship-worthy on its own):**
1. Page scaffold (shared CSS, jump-nav, sections), Overview + success criteria.
2. Equations section (§2 core) + Current/charge, Ohm's law, series/parallel notes with **UK-symbol SVGs**.
3. Series/parallel calculator + "which power equation?" calculator.
4. Potential dividers notes + **potential divider simulator** (incl. LDR/thermistor toggle) **and the "voltage across the bridge" two-divider simulator** (§6) — both are core Higher.
5. MC quiz + exam-style extended questions with mark schemes; RAG self-check with `localStorage`.

**Phase 2 — engagement + polish:**
6. Self-marking question generator.
7. UK circuit-symbol reference chart + matching game.

**Phase 3 — finish:**
9. Dark-mode pass on every widget; a11y audit (focus, `aria-live`, tap targets, reduced motion).
10. Flip the hub placeholder to a live link; smoke-test on iPad (light + dark), confirm no horizontal scroll.
</content>
