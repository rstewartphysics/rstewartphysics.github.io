# Higher Physics — Electricity: remaining topic-page content plan

Content-first build plan for the Electricity topic pages still to be made. **Physics content,
question style and SQA (Qualifications Scotland) skills only** — interactivity/widgets are handled
separately at build time. Everything below (notes wording, worked examples, practice + solutions,
MC items, RAG criteria) is written **import-ready**: drop it into the concept-block skeleton from
`higher-topic-page-guide.md`, wrapping quantity symbols in `<var>` and laying calculations out the
SQA way (relationship → substitution with units → answer with unit).

Source documents used: `h-course-spec-physics.pdf` (Version 4.0 — Electricity mandatory content,
spec pp. 15–17 and 51–57) and `Higher Physics Past Papers (September 2025 Update).pdf` (question
style: e.g. EMF/internal-resistance pp. 104/107/159/161/297–298, band-theory MC p. 13, LED band
explain p. 105). Reference build: `classes/higher/electricity/current-pd-power-resistance.html`.

`[DIAGRAM: …]` marks every place a figure/SVG is needed later (none drawn yet).

---

## 1. The five Electricity pages (after the merge)

| # | Page (hub label) | File | Status |
|---|------------------|------|--------|
| 1 | Monitoring & measuring a.c. | `classes/higher/electricity/monitoring-measuring-ac.html` | to build |
| 2 | Current, p.d., power & resistance | `classes/higher/electricity/current-pd-power-resistance.html` | **built** (reference) |
| 3 | Electrical sources & internal resistance | `classes/higher/electricity/electrical-sources-internal-resistance.html` | **build next** |
| 4 | Capacitors | `classes/higher/electricity/capacitors.html` | to build |
| 5 | Conductors, semiconductors & insulators **+** p–n junctions (merged) | `classes/higher/electricity/semiconductors-pn-junctions.html` | to build |

The SQA spec lists topic 5 as a single area ("Semiconductors and p-n junctions"), so merging the
hub's two placeholders (`Conductors, semiconductors & insulators` and `p–n junctions`) onto one page
matches the spec. **Hub housekeeping:** when each page goes live, flip its `<span class="topic-link
soon">` to an `<a class="topic-link" href="…">` in `classes/higher-physics.html`. For the merge,
make `Conductors, semiconductors & insulators` the live link to the merged page and **delete** the
separate `p–n junctions` placeholder (or point both at the same file — prefer one link).

`localStorage` prefixes (unique per page): a.c. → `hp-ac-`; internal resistance → `hp-emf-`;
capacitors → `hp-cap-`; semiconductors → `hp-semi-`.

---

## 2. Coverage matrix — every SQA mandatory point is placed

This guarantees that across the five pages **all** Electricity mandatory content and skills appear.
Page 2 is already built; its column records what it already covers so nothing is duplicated or
dropped.

### Monitoring & measuring a.c. (Page 1)
- AC = current that changes direction and instantaneous value with time. ✔ C1
- *V*rms = *V*peak/√2 and *I*rms = *I*peak/√2 (problem solving). ✔ C2
- Determine **frequency, peak and rms** values from graphical (oscilloscope) data. ✔ C3
- *T* = 1/*f*. ✔ C3

### Current, p.d., power & resistance (Page 2 — **built**, for reference)
- *V* = *IR*; *P* = *IV* = *I²R* = *V²/R*; series & parallel *R*; potential dividers. ✔ (on page)
- Multi-step problem solving, significant figures, "show that". ✔ (on page)

### Electrical sources & internal resistance (Page 3)
- Terms: EMF, internal resistance, lost volts, t.p.d., ideal supply, short circuit, open circuit. ✔ C1
- *E* = *V* + *Ir* and *V* = *IR* (problem solving). ✔ C1/C2
- Describe an experiment to measure EMF and internal resistance of a cell. ✔ C3
- Determine EMF, internal resistance and **short-circuit current** by graphical analysis. ✔ C3

### Capacitors (Page 4)
- 1 F stores 1 C when p.d. is 1 V; *C* = *Q/V*. ✔ C1
- *Q* = *It* for a constant charging current. ✔ C1
- Energy = **area under the *Q*–*V* graph**; *E* = ½*QV* = ½*CV²* = ½*Q²/C*. ✔ C2
- Variation of *I* and *V* with time for charging **and** discharging (RC curves). ✔ C3
- Effect of *R* and *C* on the charging/discharging curves. ✔ C3
- Describe experiments to investigate *I* (in the capacitor) and *V* (across it) vs time. ✔ C3

### Semiconductors & p–n junctions (Page 5 — merged)
- Terms 'conduction band' and 'valence band'. ✔ C1
- Classify solids (conductor/semiconductor/insulator) by band structure & ability to conduct;
  conduction needs both free electrons **and** accessible empty states. ✔ C1
- Qualitative explanation of conductor/insulator/semiconductor using band population + gap size
  (**no Fermi levels**); temperature ↑ → conductivity ↑ in a semiconductor. ✔ C1
- Doping with impurities → p-type and n-type. ✔ C2
- p-n junction (adjacent p/n layers) has an electric field; forward bias **reduces**, reverse bias
  **increases** the junction field. ✔ C2
- LED = forward-biased p-n diode; electrons move n→p conduction band; photons emitted when
  electrons fall conduction → valence band. ✔ C3
- Solar cell = p-n junction; photovoltaic effect; photons raise electrons valence → conduction; field
  drives electrons to n-type; p.d. produced. ✔ C3

> Pages 1 & 2 between them also cover the *standard circuit symbols* and the *Q = It* foundation; the
> capacitors page **reuses** *Q = It* (link back to Page 2's charge section rather than re-teaching).

---

## 3. PAGE 3 — Electrical sources & internal resistance  *(build next)*

- **File:** `classes/higher/electricity/electrical-sources-internal-resistance.html`
- **Banner subtitle:** `Higher Physics · Electricity`
- **Sub-nav concepts:** `EMF & lost volts` · `Solving circuits` · `Graphs & experiment` · `Check`
- **Relationships (sheet):** *E* = *V* + *Ir*; *V* = *IR*
- **Command words seen in this topic:** *State what is meant by…*, *Show that…*, *Determine…*,
  *Calculate…*, *Explain/Justify…* (effect of a change).

### Concept 1 — EMF, terminal p.d. & lost volts

**Equation card(s)**
- `EMF` — *E* = *V* + *Ir* — "EMF = terminal p.d. + lost volts"
- (secondary card) `Lost volts` — lost volts = *Ir* = *E* − *V*

**Notes (import-ready)**
- A real cell is modelled as an **ideal source of EMF *E*** in series with a small **internal
  resistance *r***. The two cannot be separated physically — *r* lives inside the cell.
- **EMF (*E*)** is the energy given to **each coulomb** of charge passing through the source
  (unit: volt = joule per coulomb). An EMF of 1.5 V means **1.5 J is given to every coulomb**.
- **Terminal p.d. (t.p.d., *V*)** is the p.d. measured across the cell's terminals — this equals the
  p.d. across the external components (*V* = *IR*).
- **Lost volts (*Ir*)** is the energy lost **per coulomb** driving current through the internal
  resistance. Lost volts = *E* − *V*. They only appear when a **current flows**.
- **Ideal supply:** *r* = 0, so there are no lost volts and the t.p.d. always equals the EMF.
- **Open circuit:** no current (*I* = 0), so no lost volts → a voltmeter across the terminals reads
  the **full EMF**. (This is how you measure *E*.)
- **Short circuit:** external resistance ≈ 0, so the t.p.d. ≈ 0 and the current is at its **maximum**,
  *I*short = *E* / *r*.

`[DIAGRAM: cell drawn as a dashed box containing an EMF source (E) in series with internal resistance r,
two external terminals, connected to an external resistor R; voltmeter across the terminals. UK symbols.]`

**Worked example 1 — Substitute & solve**
> A cell of EMF 1.5 V has an internal resistance of 0.50 Ω. It is connected to a 2.5 Ω resistor.
> Calculate the current in the circuit. *(3 marks)*
```
E = I(R + r)
1.5 = I(2.5 + 0.50)
I = 1.5 ÷ 3.0
I = 0.50 A
```

**Worked example 2 — Rearrange / multi-step (numbers in first)**
> A battery of EMF 6.0 V has an internal resistance of 0.40 Ω. When connected to a lamp the current
> is 1.5 A. Calculate the terminal potential difference across the battery. *(3 marks)*
```
E = V + Ir
6.0 = V + (1.5 × 0.40)      ← numbers in first
V = 6.0 − 0.60             ← now rearrange
V = 5.4 V
```
> Note-cell coaching: "lost volts = Ir = 0.60 V"; "t.p.d. = EMF − lost volts".

**Practice 1** *(import as `.practice` with a `details.reveal` "Answer")*
> A car battery has an EMF of 12.8 V and an internal resistance of 0.10 Ω. The starter motor draws a
> current of 80 A. **Show that** the terminal p.d. falls to 4.8 V while the motor turns. *(3 marks)*
> **Answer (mark scheme):**
> ```
> V = E − Ir              (relationship — a "show" Q must start from a correct formula)
> V = 12.8 − (80 × 0.10)
> V = 12.8 − 8.0
> V = 4.8 V               (target value with unit)
> ```
> Coaching note: never start from 4.8 and work back — that scores 0 in a "show that".

### Concept 2 — Solving circuits with internal resistance

**Equation card:** `Whole circuit` — *E* = *I*(*R* + *r*) — "EMF drives current through R **and** r"

**Notes**
- Treat the internal resistance *r* as **just another series resistor**: total resistance = *R* + *r*.
- Routine method: find total resistance → find current from *E* = *I*(*R* + *r*) → then work out any
  t.p.d. (*V* = *IR*), lost volts (*Ir*) or power as needed.
- **Power:** power delivered to the external circuit = *I*²*R*; power wasted inside the cell =
  *I*²*r*; total power from the source = *EI*. (Load matching — maximum power transfer when *R* = *r* —
  is a nice "go further" but is *not* mandatory content; keep it in a `details.reveal`.)

**Worked example 1 — Substitute & solve**
> A battery of EMF 9.0 V and internal resistance 1.0 Ω is connected to a 3.5 Ω resistor in series with
> a 0.5 Ω resistor. Calculate the current in the circuit. *(3 marks)*
```
E = I(R + r)
9.0 = I(3.5 + 0.5 + 1.0)     ← include r in the total
I = 9.0 ÷ 5.0
I = 1.8 A
```

**Worked example 2 — Multi-step (find lost volts, then r)**
> A cell of EMF 1.50 V is connected to a 4.0 Ω resistor. The current is 0.30 A. Calculate the internal
> resistance of the cell. *(4 marks)*
```
V = IR                       ← terminal p.d. first
V = 0.30 × 4.0 = 1.2 V
E = V + Ir
1.50 = 1.2 + (0.30 × r)      ← numbers in first
0.30 r = 0.30
r = 1.0 Ω
```

**Practice 2**
> Two identical cells, each of EMF 1.5 V and internal resistance 0.20 Ω, are connected **in series**
> with a 2.6 Ω resistor. Calculate (a) the current and (b) the terminal p.d. of the battery. *(4 marks)*
> **Answer:**
> ```
> Series cells: E = 1.5 + 1.5 = 3.0 V ;  r = 0.20 + 0.20 = 0.40 Ω
> E = I(R + r) → 3.0 = I(2.6 + 0.40) → I = 3.0 ÷ 3.0 = 1.0 A
> t.p.d.  V = IR = 1.0 × 2.6 = 2.6 V     (or V = E − Ir = 3.0 − 0.40 = 2.6 V)
> ```

**Qualitative practice (effect of a change — Justify style, from real papers)**
> A battery of EMF 12.8 V and internal resistance 0.10 Ω supplies two identical lamps. A switch adds a
> second lamp **in parallel**. State and **justify** the effect on the terminal p.d. *(3 marks)*
> **Answer:** terminal p.d. **decreases**. Adding a parallel lamp **lowers the total external
> resistance**, so the **current increases**; larger current → **larger lost volts (*Ir*)**, so the
> t.p.d. (= *E* − *Ir*) falls. (Mark scheme: correct direction first; any wrong physics in the
> justification caps the marks.)

### Concept 3 — Measuring EMF & internal resistance graphically

**Equation card:** `Straight line` — *V* = *E* − *Ir* (rearranged from *E* = *V* + *Ir*)

**Notes**
- Rearranged, *V* = −*r I* + *E*. Plotting **terminal p.d. *V* (y-axis)** against **current *I*
  (x-axis)** gives a **straight line**:
  - **y-intercept = EMF *E*** (the t.p.d. when *I* = 0, i.e. open circuit);
  - **gradient = −*r*** (so internal resistance = magnitude of the gradient);
  - **x-intercept = short-circuit current**, *I*short = *E* / *r* (where *V* = 0).
- **Experiment to measure *E* and *r*:** connect the cell to a **variable resistor**, with an
  **ammeter in series** and a **voltmeter across the cell's terminals**. Change the variable resistor
  to get a range of values; for each setting record the **current *I*** and **terminal p.d. *V***.
  Plot *V* against *I*, draw the best-fit straight line: the **y-intercept is the EMF** and the
  **magnitude of the gradient is the internal resistance**.

`[DIAGRAM: experiment circuit — cell, ammeter (A) in series, variable resistor, voltmeter (V) across the
terminals. UK symbols, resistor = rectangle, variable resistor = rectangle + arrow.]`
`[DIAGRAM: graph of terminal p.d. V (y-axis) against current I (x-axis): straight line of negative gradient,
y-intercept labelled E, gradient labelled −r, x-intercept labelled I_short. Axis labels + arrowheads, legend
in clear space.]`

**Worked example 1 — Read EMF, r and short-circuit current from a graph**
> The graph of terminal p.d. against current for a cell is a straight line. It cuts the p.d. axis at
> 6.0 V and has a gradient of −2.0 V A⁻¹. Determine (a) the EMF, (b) the internal resistance and
> (c) the short-circuit current. *(4 marks)*
```
(a) EMF = y-intercept = 6.0 V
(b) gradient = −r → r = 2.0 Ω
(c) short circuit: V = 0  → E = I_short r
    I_short = E ÷ r = 6.0 ÷ 2.0 = 3.0 A
```

**Worked example 2 — Two-point data, no graph drawn**
> When the current from a cell is 0.50 A the terminal p.d. is 1.40 V; when the current is 1.00 A the
> terminal p.d. is 1.20 V. Determine the EMF and the internal resistance of the cell. *(4 marks)*
```
r = −gradient = −(1.20 − 1.40) ÷ (1.00 − 0.50) = −(−0.20 ÷ 0.50) = 0.40 Ω
E = V + Ir = 1.40 + (0.50 × 0.40) = 1.60 V        (check: 1.20 + 1.00 × 0.40 = 1.60 V ✓)
```

**Practice 3**
> In an experiment to find the EMF and internal resistance of a cell, a graph of terminal p.d. against
> current is plotted. The line meets the p.d. axis at 1.50 V and the current axis at 5.0 A.
> Determine (a) the EMF, (b) the short-circuit current and (c) the internal resistance. *(4 marks)*
> **Answer:**
> ```
> (a) EMF = y-intercept = 1.50 V
> (b) short-circuit current = x-intercept = 5.0 A
> (c) I_short = E ÷ r → r = E ÷ I_short = 1.50 ÷ 5.0 = 0.30 Ω
> ```

**Go further (`details.reveal`)** — the *R* vs 1/*I* method that appears in some papers:
rearrange *E* = *I*(*R* + *r*) to *R* = *E*(1/*I*) − *r*. A graph of *R* (y) against 1/*I* (x) is a
straight line of **gradient = *E*** and **y-intercept = −*r***. (Same physics, different axes.)

### Check section (Page 3)

**MC quiz (~6, each with a tricky/conversion step; `a` = correct option index in the JS `QS` array)**
1. The EMF of a battery is best described as: **the energy supplied to each coulomb of charge passing
   through it** ✔ / the energy lost in the internal resistance / the total charge it can deliver /
   the current per second. *(definition, from 2019 SPQ MC)*
2. A cell of EMF 1.5 V and internal resistance 0.50 Ω drives 0.20 A. The lost volts are:
   **0.10 V** ✔ / 0.30 V / 0.75 V / 3.0 V.  (*Ir* = 0.20 × 0.50)
3. A 6.0 V battery (r = 0.50 Ω) is connected to a 2.5 Ω resistor. The current is: **2.0 A** ✔ /
   2.4 A / 12 A / 0.42 A.  (6.0 ÷ 3.0)
4. A graph of terminal p.d. against current has gradient −0.25 V A⁻¹ and y-intercept 1.5 V. The
   internal resistance is: **0.25 Ω** ✔ / −0.25 Ω / 1.5 Ω / 6.0 Ω.
5. For the cell in Q4, the short-circuit current is: **6.0 A** ✔ / 0.17 A / 1.5 A / 0.38 A.
   (*E*/*r* = 1.5 ÷ 0.25)
6. When a second resistor is added in parallel across a real battery, the terminal p.d.:
   **decreases (current rises, lost volts rise)** ✔ / increases / stays the same / becomes the EMF.

**RAG self-check criteria**
- I can define EMF, terminal p.d., lost volts, internal resistance, ideal supply, short circuit and
  open circuit.
- I can use *E* = *V* + *Ir* and *E* = *I*(*R* + *r*) in multi-step problems.
- I can find lost volts and terminal p.d. for a circuit with internal resistance.
- I can describe the experiment to measure a cell's EMF and internal resistance.
- I can read EMF (intercept), internal resistance (gradient) and short-circuit current from a *V*–*I*
  graph.

---

## 4. PAGE 4 — Capacitors

- **File:** `classes/higher/electricity/capacitors.html`
- **Sub-nav concepts:** `Capacitance` · `Energy stored` · `Charging & discharging` · `Check`
- **Relationships (sheet):** *C* = *Q/V*; *Q* = *It*; *E* = ½*QV* = ½*CV²* = ½*Q²/C*

### Concept 1 — Capacitance & charge

**Equation card(s)**
- `Capacitance` — *C* = *Q/V* — "capacitance = charge ÷ p.d." (use a real 2-D fraction `fr-n`/`fr-d`)
- `Charge stored` — *Q* = *It* — "for a constant charging current"

**Notes**
- A **capacitor** stores charge (and energy) when a p.d. is applied. **Capacitance *C*** is the
  charge stored **per volt**: *C* = *Q/V*, unit the **farad (F)**.
- **Definition to learn:** a capacitor of **1 farad stores 1 coulomb of charge when the p.d. across it
  is 1 volt**. A farad is huge — real capacitors are µF (×10⁻⁶), nF (×10⁻⁹), pF (×10⁻¹²).
- As a capacitor charges, the p.d. across it **rises** until it equals the supply p.d.; then charging
  stops. The charge on it is *Q* = *CV*.
- If a capacitor is charged with a **constant current** for a time *t*, the charge delivered is
  *Q* = *It* — the same charge relationship from the **Current, p.d., power & resistance** page (link
  back rather than re-teaching).

`[DIAGRAM: capacitor symbol (two parallel plates) in a simple charging circuit with a cell, switch,
resistor and ammeter; voltmeter across the capacitor. UK symbols.]`

**Worked example 1 — Substitute & solve**
> A 470 µF capacitor has a p.d. of 9.0 V across it. Calculate the charge stored. *(3 marks)*
```
Convert first:  C = 470 × 10⁻⁶ = 4.70 × 10⁻⁴ F        ← µF → F
Q = CV
Q = 4.70 × 10⁻⁴ × 9.0
Q = 4.2 × 10⁻³ C
```

**Worked example 2 — Rearrange (numbers in first)**
> A capacitor stores 6.0 × 10⁻⁴ C of charge when the p.d. across it is 12 V. Calculate its
> capacitance. *(3 marks)*
```
C = Q ÷ V
C = 6.0 × 10⁻⁴ ÷ 12          ← numbers in
C = 5.0 × 10⁻⁵ F   (50 µF)
```

**Practice 1**
> A constant current of 2.0 mA charges a capacitor for 5.0 s. The final p.d. across the capacitor is
> 8.0 V. Calculate (a) the charge stored and (b) the capacitance. *(4 marks)*
> **Answer:**
> ```
> I = 2.0 × 10⁻³ A         (mA → A)
> (a) Q = It = 2.0 × 10⁻³ × 5.0 = 1.0 × 10⁻² C
> (b) C = Q ÷ V = 1.0 × 10⁻² ÷ 8.0 = 1.25 × 10⁻³ F  (1.3 mF)
> ```

### Concept 2 — Energy stored in a capacitor

**Equation card(s)** (three forms on the sheet — give all three)
- `Energy` — *E* = ½*QV*
- *E* = ½*CV²*
- *E* = ½ *Q²/C* (real 2-D fraction inside the ½ … term)

**Notes**
- The **energy stored** in a charged capacitor equals the **area under its charge–p.d. (*Q*–*V*)
  graph**. Because *Q* ∝ *V*, that graph is a straight line through the origin, so the area is a
  triangle: ½ × *V* × *Q* — hence *E* = ½*QV*.
- The other two forms come from substituting *Q* = *CV*: *E* = ½*CV²* and *E* = ½*Q²/C*. Pick the
  form that uses the quantities you are given.
- Watch the **½** and watch the **square** — these are the two commonest slips. (Contrast with a
  *resistor*, where energy is *not* ½: a capacitor only reaches full p.d. gradually, so on average the
  charge moves through half the final p.d.)

`[DIAGRAM: Q–V graph — straight line from origin, area underneath shaded as a triangle, labelled
"energy = area = ½QV". Axis labels charge Q (y) and p.d. V (x), arrowheads.]`

**Worked example 1 — Substitute & solve**
> A 220 µF capacitor is charged to a p.d. of 12 V. Calculate the energy stored. *(3 marks)*
```
Convert first:  C = 220 × 10⁻⁶ = 2.20 × 10⁻⁴ F        ← µF → F
E = ½CV²
E = 0.5 × 2.20 × 10⁻⁴ × 12²          ← square the p.d.
E = 0.5 × 2.20 × 10⁻⁴ × 144
E = 1.6 × 10⁻² J
```

**Worked example 2 — Choose the right form / rearrange**
> A capacitor stores 3.6 × 10⁻³ J of energy when it holds a charge of 6.0 × 10⁻⁴ C. Calculate the p.d.
> across the capacitor. *(3 marks)*
```
E = ½QV
3.6 × 10⁻³ = 0.5 × 6.0 × 10⁻⁴ × V     ← numbers in first
3.6 × 10⁻³ = 3.0 × 10⁻⁴ × V
V = 3.6 × 10⁻³ ÷ 3.0 × 10⁻⁴
V = 12 V
```

**Practice 2**
> A 1000 µF capacitor is charged to 6.0 V. Calculate (a) the charge stored and (b) the energy stored.
> *(4 marks)*
> **Answer:**
> ```
> C = 1000 × 10⁻⁶ = 1.0 × 10⁻³ F        (µF → F)
> (a) Q = CV = 1.0 × 10⁻³ × 6.0 = 6.0 × 10⁻³ C
> (b) E = ½CV² = 0.5 × 1.0 × 10⁻³ × 6.0² = 0.5 × 1.0 × 10⁻³ × 36 = 1.8 × 10⁻² J
> ```

### Concept 3 — Charging & discharging in RC circuits

**Equation card:** none new — this concept is **graphical/qualitative**. Open it with a "Key idea"
card instead: *charging and discharging take time, set by R and C.*

**Notes**
- **Charging (through a resistor *R*):** at the instant the switch closes the capacitor is uncharged,
  so the **current is a maximum** and the **p.d. across the capacitor is zero**. As charge builds up,
  the capacitor p.d. **rises towards the supply voltage** while the **current falls towards zero**.
  Both curves are **exponential** in shape (charge/p.d. rise-to-a-limit; current decay).
- **Discharging:** the capacitor p.d. and the current **both fall from a maximum towards zero**; the
  current flows the **opposite way** to during charging.
- **Effect of *R* and *C* on the curves:** increasing **either *R* or *C* makes charging and
  discharging take longer** (a more gradual curve, smaller initial current for a given supply).
  Decreasing them makes the capacitor charge/discharge faster. (The product *RC* sets the timescale —
  the numerical time constant is not required at Higher, only the qualitative effect.)
- **Final (fully charged) state:** no current flows, the capacitor p.d. equals the supply p.d., and a
  capacitor **blocks steady d.c.** once charged.

**Experiment to investigate the curves (mandatory — be able to describe it):**
- Build a series circuit: supply, resistor *R*, capacitor *C*, switch. Put an **ammeter in series**
  (reads the capacitor current) and a **voltmeter across the capacitor** (reads its p.d.).
- Close the switch to charge; record **current and p.d. at regular time intervals** (use a stopwatch,
  or a **data logger** for fast changes). Reverse for discharging.
- Plot **current against time** and **p.d. against time** to get the charging/discharging curves.
  Repeat with a larger *R* (or larger *C*) to show the curves become more gradual.

`[DIAGRAM: charging curves — two graphs sharing a time axis: (1) capacitor p.d. rising to a limit, (2)
current decaying to zero. Then a discharging pair (both decaying). Axis labels + arrowheads, legend.]`
`[DIAGRAM: RC charging circuit with switch, R, capacitor C, ammeter in series, voltmeter across C.]`

**Practice 3 (qualitative — explain/identify)**
> A capacitor is charged through a resistor from a d.c. supply.
> (a) Describe and explain what happens to the current in the circuit from the instant the switch is
> closed. (b) The resistor is replaced with one of **larger** resistance. State the effect on the time
> taken to fully charge the capacitor. *(3 marks)*
> **Answer:**
> (a) The current is a **maximum at the instant the switch closes** (capacitor uncharged, p.d. across
> it is zero) and then **decreases towards zero** as the capacitor charges and its p.d. rises to
> oppose the supply. (b) The capacitor takes **longer** to fully charge.

### Check section (Page 4)

**MC quiz (~6)**
1. A 1 F capacitor stores: **1 C when the p.d. is 1 V** ✔ / 1 V per coulomb / 1 J per volt / 1 A for 1 s.
2. A 100 µF capacitor at 10 V stores a charge of: **1.0 × 10⁻³ C** ✔ / 1.0 × 10⁻⁵ C / 0.10 C / 10 C.
3. The energy stored in a 200 µF capacitor charged to 50 V is: **0.25 J** ✔ / 0.50 J / 5.0 × 10⁻³ J /
   0.010 J.  (½CV² with the square)
4. The energy stored in a charged capacitor equals: **the area under its Q–V graph** ✔ / the gradient
   of its Q–V graph / Q×V / the area under its I–t graph.
5. At the instant a capacitor begins charging through a resistor, the current is: **a maximum** ✔ /
   zero / equal to the final current / increasing.
6. Increasing the resistance in an RC charging circuit makes the capacitor charge: **more slowly** ✔ /
   faster / to a higher voltage / instantly.

**RAG self-check criteria**
- I can state what a capacitance of 1 farad means and use *C* = *Q/V*.
- I can find the charge stored for a constant charging current (*Q* = *It*).
- I can calculate energy using all three forms (½*QV*, ½*CV²*, ½*Q²/C*) and link energy to the *Q*–*V*
  area.
- I can describe how current and p.d. change with time when charging and discharging.
- I can state the effect of *R* and *C* on the curves and describe the experiment.

---

## 5. PAGE 5 — Conductors, semiconductors & insulators + p–n junctions  *(merged)*

- **File:** `classes/higher/electricity/semiconductors-pn-junctions.html`
- **Sub-nav concepts:** `Energy bands` · `Doping & the junction` · `LEDs & solar cells` · `Check`
- **No relationships** — this whole area is **qualitative**. So adapt the concept-block template:
  replace the *equation card* with a **"Key idea" card** (same `.eq-card` styling, the formula slot
  holds a short statement), and replace the *two worked examples* with **two model answers** — an SQA
  *explain/describe* question with a mark-scheme-style answer. Practice callouts then hold further
  *explain*/MC-style questions. This is the only Electricity page without calculations, so lean on
  precise wording (the marks are for using the right band-theory vocabulary).
- **Command words:** *State…*, *Explain (using band theory)…*, *Describe…*, plus band-statement MC.

### Concept 1 — Energy bands: conductors, insulators & semiconductors

**Key-idea card:** "Electrons in a solid sit in **energy bands** separated by **gaps**. Whether a
solid conducts depends on the **band populations** and the **size of the gap**."

**Notes**
- In a single atom electrons occupy discrete **energy levels**. When many atoms bond into a solid,
  these levels spread into **energy bands** separated by gaps.
- The two bands that matter:
  - **valence band** — the highest band that is **normally filled** with the atoms' outer electrons;
  - **conduction band** — the next band above it; electrons here are **free to move** and carry current.
- **For a solid to conduct it needs both free electrons *and* accessible empty states** to move into.
- **Conductors (metals):** one or more bands are **only partly filled** — either the valence band is
  partly filled, or the valence and conduction bands **overlap**. Electrons can move into empty states
  with almost no extra energy, so metals conduct **well**.
- **Insulators:** the valence band is **full** and the gap to the (empty) conduction band is **large**.
  At room temperature there is **not enough energy** to lift electrons across the gap, so **no
  conduction** occurs.
- **Semiconductors:** the valence band is full but the gap is **small**. At room temperature **some**
  electrons gain enough energy to cross into the conduction band, allowing **some** conduction.
- **Temperature effect (semiconductor):** raising the temperature gives more electrons enough energy
  to reach the conduction band, so a semiconductor's **conductivity increases** as it gets hotter
  (the opposite of a metal). *(Do **not** mention Fermi levels — not required.)*

`[DIAGRAM: three band diagrams side by side — conductor (overlapping/partly-filled band), semiconductor
(small gap, a few electrons in conduction band), insulator (large gap, empty conduction band). Label
valence band, conduction band, band gap; shade filled states.]`

**Model answer 1 — Explain (using band theory)**
> Explain, using band theory, why an insulator does not conduct electricity but a semiconductor
> conducts a little at room temperature. *(3 marks)*
> **Answer:** In an **insulator** the valence band is **full** and the gap to the conduction band is
> **large**, so at room temperature electrons **cannot gain enough energy** to reach the conduction
> band — there are no free electrons, so no conduction. In a **semiconductor** the band gap is
> **small**, so at room temperature **some** electrons gain enough energy to move into the conduction
> band, allowing **some conduction**.

**Model answer 2 — Explain (temperature)**
> A semiconductor's resistance falls as its temperature rises. Explain this using band theory. *(2 marks)*
> **Answer:** Heating gives **more electrons enough energy** to cross the small band gap into the
> **conduction band**; with **more free charge carriers** the material conducts better, so its
> **resistance decreases**.

**Practice 1 (band-statement MC, from real papers)**
> Which statement(s) is/are correct? I — In metals the highest occupied band is not completely full.
> II — In insulators the highest occupied band is full. III — The valence–conduction gap is smaller in
> semiconductors than in insulators. *(1 mark)*
> **Answer:** **All three (I, II and III) are correct.**

### Concept 2 — Doping & the p–n junction

**Key-idea card:** "**Doping** a semiconductor with impurities makes **p-type** or **n-type**
material; joining them forms a **p–n junction** with an **electric field** across it."

**Notes**
- Pure semiconductors barely conduct. During manufacture they are **doped** — small amounts of
  **impurity atoms** are added to **increase conductivity**, giving two types:
  - **n-type** — doped to provide extra **free (negative) electrons** as charge carriers;
  - **p-type** — doped to provide "holes" (effectively **positive** carriers / missing electrons).
  *(At Higher you only need: doping adds impurities to raise conductivity, producing p-type and
  n-type.)*
- When **p-type and n-type are formed in adjacent layers**, the boundary is a **p–n junction**. An
  **electric field** exists across the junction. The electrical properties of this junction are used
  in many devices (diodes, LEDs, solar cells).
- **Bias** (the p.d. applied across the junction):
  - **forward bias** — **reduces** the electric field in the junction (allows current to flow);
  - **reverse bias** — **increases** the electric field in the junction (blocks current).

`[DIAGRAM: p–n junction block — p-type layer and n-type layer meeting at a junction, arrow showing the
electric field across the junction. Plus two small circuits showing forward bias and reverse bias.]`

**Model answer 1 — State/Explain**
> State what is meant by *forward bias*, and describe its effect on the electric field at a p–n
> junction. *(2 marks)*
> **Answer:** Forward bias is connecting the supply across the junction so that it **reduces the
> electric field** in the p–n junction, allowing charge to cross and a current to flow. (Reverse bias
> would **increase** the junction field.)

**Practice 2 (state)**
> Explain how doping changes a pure semiconductor, and name the two types of doped semiconductor
> produced. *(2 marks)*
> **Answer:** Doping adds **impurity atoms** that **increase the conductivity** of the semiconductor;
> the two types are **p-type** and **n-type**.

### Concept 3 — p–n junction devices: LEDs & solar cells

**Key-idea card:** "An **LED** turns p.d. into light; a **solar cell** turns light into p.d. — both
are p–n junctions."

**Notes**
- **LED (light-emitting diode)** — a **forward-biased p–n junction diode that emits photons**. The
  forward-bias p.d. across the junction causes **electrons to move from the conduction band of the
  n-type towards the conduction band of the p-type**. **Photons are emitted when electrons "fall"
  from the conduction band into the valence band** either side of the junction. (Higher-energy/bluer
  light needs a bigger band gap → larger switch-on voltage.)
- **Solar cell (photovoltaic cell)** — a p–n junction designed so that **a p.d. is produced when
  photons are absorbed** (the **photovoltaic effect**). Absorbed photons give energy to **raise
  electrons from the valence band into the conduction band**; the junction's field **drives the
  conduction-band electrons towards the n-type side**, so a **p.d. is produced across the cell**.
- Memory hook: **LED = electricity → light** (electrons fall, photon out); **solar cell = light →
  electricity** (photon in, electron raised, p.d. out). They are the same junction run in opposite
  directions.

`[DIAGRAM: LED band diagram across the junction — forward bias, electron moving n→p in the conduction
band then dropping to the valence band emitting a photon (wavy arrow).]`
`[DIAGRAM: solar cell band diagram — incoming photon raises an electron valence→conduction; field arrow
pushes electron to n-type; output p.d. across the cell.]`

**Model answer 1 — Explain (using band theory) — LED**
> Using band theory, explain how a forward-biased LED emits light. *(3 marks)*
> **Answer:** The forward-bias p.d. makes **electrons move from the conduction band of the n-type
> towards the conduction band of the p-type** across the junction. When these electrons **fall from
> the conduction band into the valence band**, they **lose energy that is emitted as photons** (light).

**Model answer 2 — Explain — solar cell**
> Explain how a solar cell produces a potential difference when light shines on it. *(3 marks)*
> **Answer:** Absorbed **photons give energy to raise electrons from the valence band into the
> conduction band**. The **electric field at the p–n junction drives these conduction-band electrons
> towards the n-type side**, so a **potential difference is produced across the cell** (the
> photovoltaic effect).

**Practice 3 (compare)**
> State the energy change that takes place in (a) an LED and (b) a solar cell. *(2 marks)*
> **Answer:** (a) LED: **electrical energy → light energy**. (b) Solar cell: **light energy →
> electrical energy**.

### Check section (Page 5)

**MC quiz (~6, band-theory/qualitative)**
1. In a metal the highest occupied band is: **partly filled (or bands overlap)** ✔ / full with a large
   gap / empty / full with a small gap.
2. Compared with an insulator, a semiconductor has a band gap that is: **smaller** ✔ / larger / the
   same / zero.
3. As a semiconductor is heated its conductivity: **increases** ✔ / decreases / stays the same / falls
   to zero.
4. Forward biasing a p–n junction: **reduces the electric field in the junction** ✔ / increases it /
   removes the junction / has no effect.
5. An LED emits a photon when an electron: **falls from the conduction band to the valence band** ✔ /
   is raised to the conduction band / leaves the n-type / enters the valence band of the supply.
6. In a solar cell, absorbed photons: **raise electrons from the valence band to the conduction
   band** ✔ / are emitted by falling electrons / increase the junction field only / heat the n-type
   only.

**RAG self-check criteria**
- I can define 'conduction band' and 'valence band' and say what conduction requires.
- I can explain, using band populations and gap size, why metals/insulators/semiconductors differ.
- I can explain why a semiconductor conducts better when heated.
- I can describe doping (p-type, n-type) and the p–n junction field, with forward vs reverse bias.
- I can explain, using band theory, how an LED emits light and how a solar cell produces a p.d.

---

## 6. PAGE 1 — Monitoring & measuring a.c.

- **File:** `classes/higher/electricity/monitoring-measuring-ac.html`
- **Sub-nav concepts:** `What a.c. is` · `Peak & rms` · `Reading the trace` · `Check`
- **Relationships (sheet):** *V*peak = √2 *V*rms (i.e. *V*rms = *V*peak/√2); *I*peak = √2 *I*rms;
  *T* = 1/*f*

### Concept 1 — What alternating current is

**Key-idea card:** "**a.c.** is a current that **changes direction and instantaneous value with
time**; **d.c.** flows one way only."

**Notes**
- **Alternating current (a.c.)** continually **changes direction**, and its **instantaneous value**
  changes with time (mains supply, signal generators). **Direct current (d.c.)** flows in **one
  direction** only.
- On an **oscilloscope**, a.c. shows as a repeating wave (sinusoidal for the mains); steady d.c. is a
  flat horizontal line.
- The **peak value** is the maximum value the wave reaches from zero; the **period *T*** is the time
  for one complete cycle; the **frequency *f*** is the number of cycles per second (*f* = 1/*T*).

`[DIAGRAM: oscilloscope screen showing a sine wave (a.c.) labelled with peak value and one period T,
and a flat line for steady d.c. for comparison.]`

**Model answer — State the difference**
> State one difference between alternating current and direct current. *(1 mark)*
> **Answer:** a.c. **changes direction (and instantaneous value) with time**, whereas d.c. flows in
> **one direction only**.

### Concept 2 — Peak & rms values

**Equation card(s)**
- `rms voltage` — *V*rms = *V*peak / √2 (real 2-D fraction)
- `rms current` — *I*rms = *I*peak / √2

**Notes**
- The **rms (root mean square)** value of an a.c. is the **d.c. value that would deliver the same
  power** to a resistor. It is what a.c. meters read and what "230 V mains" means (230 V is the rms,
  not the peak).
- For a sinusoidal a.c.: *V*peak = √2 × *V*rms ≈ 1.41 × *V*rms (and the same for current). Rearrange to
  *V*rms = *V*peak/√2.
- **Always check whether a value is peak or rms** before using it — mixing them is the classic error.
  Meters/quoted mains values are **rms**; an oscilloscope shows you the **peak**.

**Worked example 1 — Substitute & solve**
> The mains supply has an rms voltage of 230 V. Calculate the peak voltage of the supply. *(3 marks)*
```
V_peak = √2 × V_rms
V_peak = 1.41 × 230
V_peak = 325 V   (3.25 × 10² V)
```

**Worked example 2 — Rearrange (numbers in first)**
> An oscilloscope shows that an a.c. signal has a peak voltage of 12 V. Calculate the rms voltage.
> *(3 marks)*
```
V_rms = V_peak ÷ √2
V_rms = 12 ÷ 1.41
V_rms = 8.5 V
```

**Practice 1**
> An a.c. supply has a peak current of 0.50 A. Calculate the rms current. *(3 marks)*
> **Answer:**
> ```
> I_rms = I_peak ÷ √2 = 0.50 ÷ 1.41 = 0.35 A
> ```

### Concept 3 — Reading the oscilloscope (frequency, peak & rms from graphs)

**Equation card:** `Frequency` — *T* = 1/*f* (so *f* = 1/*T*)

**Notes**
- An oscilloscope has two control settings:
  - **volts/div (Y-gain):** volts per vertical division → **peak voltage** = (divisions from the
    centre line to the peak) × (volts/div);
  - **time-base (tim/div):** seconds per horizontal division → **period *T*** = (divisions for one
    complete wave) × (time/div).
- From the period, **frequency *f* = 1/*T***. From the peak voltage, **rms = peak/√2**.
- **Method to read a trace:** (1) count divisions for one full cycle → multiply by time/div → *T* → *f*
  = 1/*T*; (2) count divisions from the centre to the peak → multiply by volts/div → *V*peak → *V*rms.

`[DIAGRAM: oscilloscope grid (divisions) with a sine wave; mark the peak height in divisions and one full
period in divisions; annotate volts/div and time/div settings.]`

**Worked example 1 — Frequency from the time-base**
> On an oscilloscope, one complete wave occupies 4.0 divisions. The time-base is set to 5.0 ms per
> division. Calculate the frequency of the a.c. signal. *(4 marks)*
```
T = divisions × time/div
T = 4.0 × 5.0 × 10⁻³          ← ms → s
T = 0.020 s
f = 1 ÷ T
f = 1 ÷ 0.020 = 50 Hz
```

**Worked example 2 — Peak (then rms) from the Y-gain**
> The same trace reaches 3.0 divisions above the centre line. The Y-gain is 2.0 V per division.
> Calculate (a) the peak voltage and (b) the rms voltage. *(4 marks)*
```
(a) V_peak = divisions × volts/div = 3.0 × 2.0 = 6.0 V
(b) V_rms = V_peak ÷ √2 = 6.0 ÷ 1.41 = 4.2 V
```

**Practice 3**
> An a.c. trace shows a peak that is 2.5 divisions high with the Y-gain at 4.0 V/div, and one full
> cycle spanning 5.0 divisions with the time-base at 2.0 ms/div. Determine (a) the peak voltage,
> (b) the rms voltage and (c) the frequency. *(5 marks)*
> **Answer:**
> ```
> (a) V_peak = 2.5 × 4.0 = 10 V
> (b) V_rms = 10 ÷ 1.41 = 7.1 V
> (c) T = 5.0 × 2.0 × 10⁻³ = 0.010 s → f = 1 ÷ 0.010 = 100 Hz
> ```

### Check section (Page 1)

**MC quiz (~6)**
1. Alternating current is current that: **changes direction with time** ✔ / always increases / flows
   one way only / has no frequency.
2. The mains is quoted as 230 V. This value is the: **rms voltage** ✔ / peak voltage / peak-to-peak
   voltage / average voltage.
3. An a.c. supply has a peak voltage of 14.1 V. Its rms voltage is about: **10 V** ✔ / 20 V / 14.1 V /
   7.1 V.
4. A signal of rms current 2.0 A has a peak current of about: **2.8 A** ✔ / 1.4 A / 2.0 A / 4.0 A.
5. One cycle of an a.c. trace takes 0.020 s. The frequency is: **50 Hz** ✔ / 20 Hz / 0.020 Hz / 500 Hz.
6. On an oscilloscope, the **peak voltage** is found from: **divisions to the peak × volts/div** ✔ /
   divisions per cycle × time/div / volts/div ÷ time/div / 1 ÷ T.

**RAG self-check criteria**
- I can state what a.c. is and how it differs from d.c.
- I can convert between peak and rms values for current and voltage.
- I can explain what the rms value means (same power as the equivalent d.c.).
- I can find the period and frequency of an a.c. signal from an oscilloscope trace (*T* = 1/*f*).
- I can find the peak (and rms) voltage from an oscilloscope trace using the Y-gain.

---

## 7. Build-order & cross-page reminders

1. **Electrical sources & internal resistance** (next) → 2. **Capacitors** → 3. **Semiconductors &
   p–n junctions** (merged) → 4. **Monitoring & measuring a.c.** (or move a.c. earlier if teaching
   order prefers it — content is independent of the others).
- Each page: follow `higher-topic-page-guide.md` exactly (concept blocks, two worked examples per
  equation in the SQA layout, real `fr-n`/`fr-d` fractions, UK SVG symbols, Check = one MC quiz + one
  RAG). Use a **unique `localStorage` prefix** (§1).
- **Reuse, don't re-teach:** *Q* = *It* and circuit symbols already live on Page 2 — link back.
- Page 5 is **qualitative**: adapt the template (Key-idea cards + model-answer "examples"); the marks
  are awarded for **precise band-theory wording**, so keep the SQA phrasing above verbatim.
- Replace every `[DIAGRAM: …]` with an inline themeable SVG when the pages are built; until then they
  stay as placeholders.
