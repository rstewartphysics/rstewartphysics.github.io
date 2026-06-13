# Improvements document — N5 Engineering Science Topic 1: Engineering Contexts & Systems

**Page reviewed:** `classes/n5-engineering/engineering-contexts-and-systems.html` (1,456 lines, built and committed `b14b6f7`)
**Reviewed against (primary sources):**

| Source | File |
|---|---|
| Course specification | `assets/engineering-science/national-5/EngineeringScienceCourseSpecN5.pdf` (C823 75, v2.0) |
| Topic 1 booklet | `…/national-5/01-engineering-contexts-and-systems/N5EngSci 1 - Contexts and Systems FINAL.pdf` (26 pp) |
| Topic 1 slides | `…/01-engineering-contexts-and-systems/BHS N5 EngSci 1 - Contexts and Systems PPT.pdf` |
| Question papers | `…/shared/past-papers/N5_Engineering-Science_QP_2024.pdf`, `…_QP_2025.pdf` |
| QP marking instructions | `…/shared/past-papers/mi_N5_Engineering-Science_mi_2024.pdf`, `…_mi_2025.pdf` |
| Assignment tasks | `…/shared/past-papers/N5_Engineering-Science_Assignment_2024-2.pdf`, `…_2025-2.pdf` |
| Assignment marking instructions | `…/shared/past-papers/mi_N5_Engineering-Science_Assignment_2024.pdf`, `…_2025.pdf` |
| Hub page | `classes/n5-engineering-science.html` |

**Prepared:** 2026-06-13 · **Status:** review only — no live edits made.

---

## How to read this document

Every finding below is tied to a **named source** (booklet page, spec area, QP/assignment year + question, or page line number). Where the page is already correct, it says so — the goal is targeted edits, not a rewrite. The single most important finding is in **§2**: the system-/sub-system-diagram convention that is worth roughly **8 marks in the SQA assignment every year** is the one piece of Topic 1 the page currently under-teaches.

**Headline verdict.** The page is accurate, closely mirrors the booklet, and is exam-aligned on terminology and structure. It needs **no major content rewrite**. The high-value work is: (1) bring the four block diagrams up to the SQA *assignment* convention (system boundary, drivers, external inputs/outputs, two-headed feedback); (2) adopt SQA's exact wording (*external* input/output, *transducer*, *driver*) alongside the friendlier terms already used; (3) sharpen the *describe* vs *explain* command-word distinction; and (4) add evidence-based "exam / assignment" badges so pupils can see where each idea is tested.

---

## 1. Content accuracy & SQA alignment findings

### 1.0 What is already correct (do not change)

These were checked against the booklet and spec and are accurate — listing them so they are not "fixed" by mistake:

- **Definition of engineering** (line 377) — matches booklet p.4 and the page's own knowledge organiser (line 1111). ✓
- **Seven engineering actions** table (lines 384–390) — verbatim from booklet p.4 (research, design, simulate, implement, test, control, evaluate). ✓
- **Seven branches** (lines 397–403) — match booklet p.5 exactly. Note the course spec lists the branches as *environmental, civil, structural, mechanical, chemical, electrical and electronic* (spec p.4, "Engineering roles and disciplines"); the page's seven match. ✓
- **Constraints** *are* present** — Section 1 Practice Q6 (line 459) and the knowledge organiser (line 1113). The booklet only assesses constraints via the p.4 "Identify the Problem Context" task and Practice Q6; the page covers both. No gap here. ✓
- **Durability/repairability** is already a sustainability bullet (line 561) and a booklet-answer (line 997). ✓
- **Emerging-tech answers are already modelled** — Practice 3 Q4, Q7, Q8 (lines 591–600) give worked smart-sensor/electric-bus answers. ✓
- **`what + why` answer frame** (lines 493–498) — this is pedagogically sound and matches SQA marking principle (k): *"Where a question asks candidates to explain, they must relate cause and effect"* (2025 MI p.02). Impact questions are literally marked "1 mark for cause, 1 mark for effect" (2024 MI Q9(d)–(f); 2025 MI Q12(a)). Keep it — see §1.4 for one refinement.

The page is also **lean** — there is very little unassessed bloat to trim (see §1.5). This is a strength worth preserving.

### 1.1 Terminology: adopt SQA's exact diagram wording (HIGH value, low effort)

The page uses pupil-friendly terms that are *correct* but not the words SQA prints and marks. Because the systems diagram is assessed in the assignment with strict wording (§2), the page should introduce SQA's terms as the primary label and keep the friendly phrase as a gloss.

| Page currently says | SQA marks / prints | Where it matters | Recommended page wording |
|---|---|---|---|
| "real-world input / output" (lines 642, 718–721) | **external input / external output** | 2024 Assignment Task 3a(i), 2025 Task 1a(i): *"clearly show the external input and output"* | "the **external input** (sometimes called the real-world input) — e.g. a person approaching, a temperature" |
| "input device / output device" (line 642) | input device / output device, **transducer** | Success criterion 4.7: *"input and output devices/transducers"* (booklet p.3) | add "(also called **transducers** — they convert between the real world and the electrical signals inside the system)" |
| (not mentioned) | **driver** | Both assignments: *"any output device requires its own driver"*, *"one driver per output device"* | introduce in Section 4 sub-systems (see §2) |
| "control" block in closed-loop (line 822) | "control" / **microcontroller** | 2024 MI Q11(a), 2025 MI Q12(c) use "control sub-system" / "microcontroller" | keep "control"; note that in a microcontroller system the control block is the microcontroller |

**Edit:** in the Section 4 note (line 642) and the Practice 4 Q9/Q10 answers (lines 719, 721), lead with "external input/output" and add "(real-world …)" as the gloss. Add "transducer" to the input-device sentence. Add "driver" when sub-systems are introduced.

### 1.2 Command words: separate *describe* from *explain* (MEDIUM value)

SQA's two general marking principles are explicit (2025 MI p.02):

- **(j) describe** — *"provide an account or structure of characteristics and/or features."*
- **(k) explain** — *"relate cause and effect, or provide a relationship between two aspects."*

The page's `what + why` frame is perfect for **explain** but is applied to some **describe** items where it isn't required, which can mislead pupils into thinking every answer needs a "why."

- Practice 2 Q3 (line 527) and Q4 (line 529) are *Describe* questions but the answers read like explains. They are acceptable, but the modelling blurs the line.
- The "How to answer" box (line 493) is headed generically; it only teaches the *explain* pattern.

**Recommended edit:** retitle the box (line 494) to *"How to answer 'explain' questions — what + why (cause + effect)"* and add one sentence: *"For 'describe' questions you only need to give the features — you don't always need a 'why'. 'Explain' questions always need the cause and effect."* This is a two-line addition that directly mirrors SQA principles (j)/(k) and the **Common Mistakes** card already on the page (line 1159).

### 1.3 Examples: swap in 2–3 real past-paper contexts (MEDIUM value)

The page's worked contexts (automatic door, flood defence, central heating) are good and booklet-faithful, but every example is generic. The exam consistently sets these ideas in **named, real contexts**. Adding a couple of these makes practice feel like the real paper without changing any teaching:

| Real SQA context | Where it appeared | Topic 1 idea it tested | Suggested use on page |
|---|---|---|---|
| Electric bike / cycling | 2024 QP Q9(d)–(f) | environmental, social, economic impacts (one mark each) | rework one impacts practice item around an e-bike |
| Hydroelectric scheme | 2025 QP Q7 | environmental impacts (2 marks; *"do not accept renewable on its own"*) | add as a Section 2/3 example — note the marker rejects "renewable" alone |
| Air fryer | 2025 QP Q12(a),(c) | economic impact + closed-loop control description | strong Section 5 example: it is both an impact and a closed-loop question |
| Lifeboat slipway / leisure pool | 2025 Assignment, 2025 QP Q10 | roles, simulation, system diagrams | mention as assignment-style contexts |

Marker nuances worth teaching (straight from the MIs): *"do not accept 'renewable'/'does not use fossil fuel' on its own"* (2025 MI Q7); for impacts you must name **a specific gas/emission** ("greenhouse"/CO₂, not just "pollution") (2024 MI Q12(a)).

### 1.4 Emerging technologies: add the one marker rule pupils always miss (LOW effort, HIGH yield)

The emerging-tech content (lines 565–600) is good, but both years' MIs share a rule the page doesn't state:

> *"If an established or developing technology is named, such as AI, graphene, self-driving cars etc, then a maximum of 1 mark… No mark for only stating an emerging technology."* (2025 MI Q12(f); 2024 MI Q10(e))

**Edit:** add to the Section 3 note (line 566) or the Common Mistakes card: *"In the exam you must (a) name a genuinely **new/emerging** technology — AI and self-driving cars are treated as already-established and capped at 1 mark — and (b) give a **cause and effect**, not just name it."* Also worth noting the real exemplar answers used: *ammonia-fuelled engines* and *nuclear-diamond batteries* (2024/2025 MI).

### 1.5 Trim candidates (content present but lightly assessed)

The page is tightly scoped; there is little to remove. Two minor points:

- The **seven engineering actions** table (lines 384–390) is the most "definitional" block. Keep it — it is booklet p.4 content **and** it is assessed: 2024 QP Q13(a) and 2025 QP Q10(a)/Q13(f) all ask candidates to give an engineer's *design/test/simulate* activity, and the assignment's five stages (analyse → design → build → test → evaluate, spec p.10) mirror it. Verdict: **retain**.
- The **modelled examples** (lines 413–424) duplicate the booklet-answer reveals (lines 936–947). This is deliberate reinforcement, not bloat. Verdict: **retain**, but the booklet-answer version could `→` link back to the Section 1 example to avoid the reader feeling they've read it twice.

No removals are recommended. The over-coverage risk on this page is near zero.

### 1.6 Spec-coverage cross-check (every assessed point is present)

Against spec p.4 ("Engineering roles and disciplines", "Impacts of engineering") and p.6 ("The systems approach"):

| Spec assessment point | On the page? |
|---|---|
| Applications of the 7 branches | ✓ branch grid + quick reference |
| Branches integrating to solve a challenge | ✓ modelled examples + Practice 1 Q5 |
| Varied roles in designing/implementing/testing/controlling | ✓ engineering-actions table |
| Social & economic impacts (positive & negative) | ✓ impacts table + Practice 2 |
| Environmental impacts (positive & negative) | ✓ |
| Engineering & climate change | ✓ Section 3 |
| Emerging technologies → improved solutions | ✓ Section 3 (+ §1.4 refinement) |
| Systems & sub-system diagrams | ⚠ present but missing the assignment convention — **see §2** |
| Input–process–output + feedback loops | ✓ (diagram upgrade in §2) |
| Open- and closed-loop control | ✓ Section 5 |
| Interaction of sub-systems | ✓ Practice 4 Q7 |

**Conclusion:** content coverage is complete. The only substantive gap is *how the diagrams are drawn* — covered next.

---

## 2. Subsystem / block-diagram findings — the priority fix

### 2.1 What I checked, and what the evidence actually says

The brief asked whether each diagram shows a **dashed-line system boundary** separating the real world from the transducers/system components. I checked this against the booklet, the spec support notes, **both** question papers + MIs, and **both** assignments + MIs. The picture is more specific — and more useful — than "add a boundary to everything":

- **The course spec never uses the term "system boundary."** Its systems support notes (spec pp.16–17) talk about input devices, output devices, transducers and feedback loops, not a boundary line.
- **The booklet mentions "system boundary" once** (p.14 term table: *"a line showing what is included inside the system being studied"*) and then **drops it** — it is not in the knowledge organiser (p.25) and not in any success criterion (pp.2–3). The page faithfully copied this: the term is defined (line 619) but never illustrated.
- **The question paper does not mark a boundary.** The QP closed-loop/system-diagram questions (2024 QP Q11(a) "draw"; 2025 QP Q6(a) "label input/output", Q12(c) "describe") award marks for the blocks, the input/output labels, the sensor, and the **feedback loop with both arrowheads** — never for a boundary line. 2025 QP Q6(a) even says *"do not accept any additional words."*
- **The assignment DOES mark it — every year, and it is the highest-value Topic 1 task there.** This is the key finding:

> **2025 Assignment, Task 1a (pool heating, 8 marks)** and **2024 Assignment, Task 3a (motorised cover, 8 marks)** both run the same two-part structure:
> - **(i) System diagram (2 marks):** *"clearly show the **external input and output**."* Marked: external input identified, external output identified — *"do not accept input or output components."*
> - **(ii) Sub-system diagram (6 marks):** *"clearly show the external input and output, all sub-systems, **the system boundary** and interactions between sub-systems. **Any output device requires its own driver.**"* Marked (per MI): **"system boundary around sub-systems only"**, each output device in its own box, **"one driver per output device"** wired to the microcontroller, input sensor wired to the microcontroller, and **"feedback loop … with both arrowheads."**

So the brief's premise is correct — there *is* a marked boundary convention — but it lives in the **assignment**, not the exam, and it comes bundled with **drivers** and **external inputs/outputs** that the page also omits. The page currently teaches a simpler diagram than the one worth 8 marks.

### 2.2 The four diagrams on the page, judged against the assignment convention

| # | Diagram | Lines | Boundary? | External in/out shown? | Driver shown? | Two-headed feedback? | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Input → Process → Output | 625–637 | ✗ | ✗ (generic INPUT/OUTPUT) | n/a | n/a | Fine as a *first* diagram; see §2.3 |
| 2 | Automatic door sub-system (SENSOR→CONTROL→MOTOR→DOOR) | 648–673 | ✗ | ✗ | ✗ | n/a | **Closest to the assignment task — upgrade this one** |
| 3 | Open-loop (INPUT→CONTROL SYSTEM→OUTPUT DEVICE→OUTPUT) | 771–789 | ✗ | partly (has explicit OUTPUT) | ✗ | n/a (open-loop) | Acceptable; label the external output |
| 4 | Closed-loop central heating (with feedback path) | 803–832 | ✗ | ✗ (ROOM TEMP is inside the row) | ✗ | ✓ feedback path drawn, single arrowhead | Good; align to the QP-marked version |

Diagram 4 is already strong: it has an error detector, a sensor on the feedback path, and a feedback arrow (line 826–831). Two refinements: (a) the feedback path uses one arrowhead (line 830) — the assignment MI specifically wants **both arrowheads**, so add a second; (b) "ROOM TEMP" is drawn as an in-line block, but conceptually it is the **external output** — fine for a QP-style answer, but if you add a boundary version it should sit *outside* the boundary.

### 2.3 Recommended fix — add ONE boundary worked example, don't bolt boundaries onto all four

Bolting a dashed box onto every diagram would (a) contradict the QP convention (where no boundary is wanted) and (b) clutter the simple first diagram. The better, evidence-led fix mirrors the assignment's own two-step build:

1. **Keep diagrams 1, 3, 4 as the "question-paper" versions** (simple blocks + arrows + feedback). They match how the *exam* marks these (2024/2025 QP). Add the missing external-output label to diagram 3 and the second feedback arrowhead to diagram 4.

2. **Add a new, clearly-labelled "assignment diagram" pair in Section 4** — a *system diagram* then a *sub-system diagram with boundary* — modelled exactly on Assignment Task 1a/3a. Use the automatic door (the page's existing context) so nothing new has to be learned:

   - **System diagram:** `person approaching (external input) → [ AUTOMATIC DOOR SYSTEM ] → door open/closed (external output)` — teaches "external input/output, not components."
   - **Sub-system diagram with boundary:** a dashed box (the system boundary) containing `motion sensor → microcontroller → driver → motor`, with the **external input** (person) entering from the left *outside* the box, the **external output** (door movement) leaving to the right *outside* the box, a **driver** between microcontroller and motor, and a **feedback** path from after the motor (via a position/limit switch) back into the microcontroller **with arrowheads on both ends**.

   Caption it: *"This is the diagram the assignment asks for (Task 1, 8 marks). The dashed line is the **system boundary** — everything inside is the system; the external input and output stay outside it. Every output device needs its own **driver**."*

3. **Re-purpose the "Build the system diagram" widget (lines 677–698)** so its check awards the assignment-style marks: it currently builds `Temperature sensor → Control circuit → Motor (fan)`. Add an optional "driver" tile and a boundary toggle so pupils rehearse the marked version. (Low priority — the teaching diagram in step 2 is the essential part.)

### 2.4 Implementation note for the new boundary diagram (SVG, themeable)

Match the existing `.bd` SVG pattern (lines 202–214) so it inherits light/dark theming. The boundary is a dashed `rect`, not a new colour:

```svg
<!-- inside the existing .bd SVG, drawn BEFORE the blocks so it sits behind them -->
<rect class="sysbound" x="64" y="8" width="300" height="96" rx="8"/>
```

```css
/* add to the .bd block, ~line 214 */
.bd .sysbound { fill: none; stroke: var(--eng-muted); stroke-width: 1.6; stroke-dasharray: 5 4; }
.bd .ext      { fill: var(--eng-muted); font-size: 10.5px; font-weight: 800; }  /* external in/out labels */
.bd .drv .blk { stroke-dasharray: 2 2; }  /* optional: visually distinguish the driver block */
```

No new tokens, no literal colours — `var(--eng-muted)` already has a dark-mode value (CLAUDE.md). The second feedback arrowhead on diagram 4 is one extra `<polygon class="fbh">` mirrored at the room-temp end of the path (line 830).

---

## 3. Exam / Assignment relevance badges — evidence-based

### 3.1 The evidence (this replaces guesswork with mark ranges + real questions)

The course spec fixes how many marks each Topic 1 strand carries **in every question paper** (spec pp.8–9, "Range of marks"):

| Strand | Marks **every** QP (of 110) | This is Topic 1? |
|---|---|---|
| **Systems** (systems/sub-system diagrams, input–process–output, open/closed-loop, sub-system interaction) | **5–9** | ✓ Sections 4 & 5 |
| **Engineering roles** | **3–7** | ✓ Section 1 |
| **Engineering impacts** | **5–9** | ✓ Sections 2 & 3 |

So **Topic 1 is worth roughly 13–25 marks of the 110-mark paper, every single year** — the largest non-electronics block. That headline alone justifies a prominent "this is heavily examined" framing on the page.

Verified question-level appearances (so badges can be justified, not assumed):

| Topic 1 idea | 2024 QP | 2025 QP | Assignment |
|---|---|---|---|
| Name the branch / role | Q5(a) civil, environmental | Q3(a–c) structural, electronic, mechanical | framed as "a team of engineers" (context only) |
| Engineer's design activity (research/design/test/simulate) | Q13(a)(i–iii) | Q10(a), Q13(f) | the 5 assignment stages mirror this |
| Social / economic / environmental impact | Q9(d),(e),(f); Q12(a) | Q7; Q12(a) | "improve & justify" tasks (2d, 5c) use the same reasoning |
| Sustainability / climate change | Q12(a) | Q7 | — |
| Emerging technology (cause + effect) | Q10(e) | Q12(f) | — |
| Open-/closed-loop control (identify) | Q5(c) | Q6(b) | — |
| **System diagram — external input/output** | — | Q6(a) | **2024 Task 3a(i), 2025 Task 1a(i)** ✓ |
| **Sub-system diagram — boundary + driver + feedback** | — | — | **2024 Task 3a(ii), 2025 Task 1a(ii)** ✓ (6 marks) |
| Draw/describe closed-loop diagram | Q11(a) "draw" | Q12(c) "describe" | Task 1a control narrative |

**The honest nuance the old draft missed:** roles, impacts, sustainability and emerging tech are **strongly examined but barely touched in the assignment** (the assignment is a closed-book *build*: electronics, gears, logic, pneumatics). The systems/sub-system diagram is the one Topic 1 idea that is **both** examined *and* a big assignment earner. Badges should reflect that, not paint everything as "assignment too."

### 3.2 Recommended badge taxonomy

Two badges, evidence-gated:

- **🎯 Exam** — appears in the QP most years (cite the strand's spec mark range and/or a real question).
- **📘 Assignment** — the *skill* is directly produced and marked in the assignment (cite the task).

| Page location | Badge(s) | Justification to encode |
|---|---|---|
| Section 1 heading (line 376) | 🎯 Exam | roles 3–7 marks/paper; 2024 Q5/Q13, 2025 Q3/Q10/Q13 |
| Section 2 heading (line 467) | 🎯 Exam | impacts 5–9 marks/paper; 2024 Q9/Q12, 2025 Q7/Q12 |
| Section 3 heading (line 542) | 🎯 Exam | emerging tech every year; 2024 Q10(e), 2025 Q12(f) |
| Section 4 heading (line 607) | 🎯 Exam · 📘 Assignment | systems 5–9 marks/paper **and** Assignment Task 1/3 (8 marks) |
| Section 5 heading (line 728) | 🎯 Exam · 📘 Assignment | open/closed-loop in QP; closed-loop narrative in Assignment Task 1a |
| The new boundary diagram (§2.3) | 📘 Assignment | "this exact diagram = 8 marks in the assignment" |
| Practice 4 Q8 (draw sub-system, line 716) | 📘 Assignment | the assignment's marked diagram |
| Practice 5 Q10 (draw closed-loop, line 898) | 🎯 Exam | 2024 QP Q11(a) |
| Emerging-tech note (line 566) | 🎯 Exam | with the "must be genuinely emerging" rule (§1.4) |

Add a one-line legend under the intro (after line 365): *"🎯 Exam = tested in the written paper most years. 📘 Assignment = a skill you produce in the SQA assignment."*

### 3.3 Badge styling (consistent with the existing design system)

Reuse the existing token palette and the `.concept-tag` / `.practice-tag` pattern already in the page (lines 93–97, 168–172). No new colours:

```css
/* place near .concept-tag, ~line 97 */
.badge { display:inline-block; font-size:.68rem; font-weight:900; letter-spacing:.04em;
         text-transform:uppercase; padding:2px 8px; border-radius:999px; margin-left:.4rem;
         vertical-align:middle; white-space:nowrap; }
.badge.exam   { color:#111; background:var(--eng-orange); }
.badge.assign { color:var(--eng-text); background:transparent; border:1.5px solid var(--eng-orange); }
```

Orange fill = exam; orange outline = assignment. Both already have dark-mode behaviour because `--eng-orange`/`--eng-text` are themed in the shared sheet. Markup:

```html
<h2 id="s4-title">The systems approach
  <span class="badge exam" title="Systems is worth 5–9 marks in every question paper">🎯 Exam</span>
  <span class="badge assign" title="Assignment Task 1 — system & sub-system diagram (8 marks)">📘 Assignment</span>
</h2>
```

Put the justification in the `title=` attribute so it is discoverable but not cluttering. Don't badge the sub-nav (it's already dense) or individual table rows (too noisy) — section headings, the new diagram, and the two "draw" practice questions are enough.

---

## 4. Visual / UX improvement recommendations

### 4.0 What's already good (keep)

The page is **not** a cognitive-overload mess — it has a sticky jump-nav with scroll-spy (lines 335–349, 1425–1439), collapsible answer reveals (`details.reveal`), an aria-live'd quiz and RAG tracker, print support that auto-opens reveals (lines 1441–1452), and full dark-mode. These are genuinely good and ahead of most revision pages. The findings below are refinements, not rescue work.

### 4.1 The five learn sections never collapse — the page is one ~1,450-line scroll (HIGH value)

The five teaching sections are `<section class="panel">` (lines 374, 465, 541, 605, 726) — always fully expanded. Only the *answers* collapse. So a pupil who wants to revise just "control" still scrolls past everything. The original Topic 1 plan called for "**collapsible section panels (S3 pattern)**" but the build shipped static panels.

**Recommended:** make each of the five learn sections collapsible (a `<details class="section">` wrapper, or a per-section "collapse" affordance), defaulting open, with the jump-nav still scrolling to them. This is the same accordion pattern used on the S3 "What is an Engineer?" page and keeps the page's strengths while cutting the scroll. If full accordions are too invasive, a lighter win is a **"collapse all / expand all"** control plus per-section collapse, so the page can become a five-line contents list on demand.

### 4.2 No "mode chooser" / entry point (MEDIUM value — decision needed)

The plan's headline feature — a three-mode chooser (*Revise / Check my booklet / Exam practice*) directly under the hero — was not built. The page instead opens straight into Section 1. For a multi-use page (revision, missed-lesson catch-up, pre-assignment), a small chooser reduces "where do I start?" friction on an iPad.

**Recommended (if wanted):** add a compact 3-card chooser after the intro (line 371), linking to `#s1` (revise), `#answers` (check booklet), `#check` (test myself). This is pure HTML/CSS — the scroll-spy already handles highlighting. The S3 page's mode chooser and the Higher CPR page's "mode" entry pattern are the references. *This is a genuine product decision — the page works without it — so it's flagged, not mandated.*

### 4.3 Concept density spots (LOW–MEDIUM value)

- **Impacts table** (lines 482–491) is 3 rows × 4 columns (type / meaning / positive / negative) — the widest table on the page. On a phone it scrolls horizontally inside `.tblwrap`. Option: split into a 2-column *definitions* table + a separate *examples* table (the booklet itself separates these across p.9). Minor; only do it if §4.1 doesn't already reduce the felt density.
- **Section 5** is the longest section (term table + match widget + 2 diagrams + open/closed table + the flagship builder + 10 practice). It is the most examined section so the length is justified, but it benefits most from §4.1 collapsibility, and from a sub-heading "anchor" within it (Manual/auto · Open-loop · Closed-loop) so the jump-nav could deep-link.
- **Spacing:** practice blocks (`.practice`, line 164) butt up against the preceding widget. A `margin-top` bump and a hairline `border-top` would visually separate "learn" from "test yourself." Cosmetic.

### 4.4 Sub-nav on mobile (LOW value — already handled)

The sub-nav already wraps on narrow screens (`@media (max-width: 640px){ .subnav-links{ flex-wrap:wrap; overflow:visible } }`, line 62), so the old concern about horizontal scrolling doesn't apply. If the section count grows (e.g. deep-links from §4.3), re-check that it still wraps to at most two rows.

### 4.5 Quiz marking already avoids colour-only (keep)

The quiz marks with **glyph + text** ("✓ correct answer" / "✗ your answer", lines 1326, 1330) and tinted backgrounds — so it satisfies the "never colour alone" rule without change. Likewise the RAG buttons carry R/A/G letters and aria-labels, not just colour (lines 315–318, 1405). No action.

---

## 5. Prioritised action list for implementation

### 🔴 Priority 1 — assignment-critical diagram convention (§2)
1. Add the **system-diagram → sub-system-diagram-with-boundary** worked pair to Section 4, modelled on Assignment Task 1a/3a: dashed **system boundary** around the sub-systems, **external input/output** outside it, a **driver** per output device, **feedback with both arrowheads**. Caption it as "the 8-mark assignment diagram."
2. Add the **second feedback arrowhead** to the closed-loop diagram (line 830) and the **external-output label** to the open-loop diagram (line 789).
3. Badge the new diagram and Practice 4 Q8 / Practice 5 Q10 (§3.2).

### 🟠 Priority 2 — terminology + command words (§1.1, §1.2)
4. Lead with **external input/output**, add **transducer** and **driver**, in Section 4 (lines 642, 718–721) and the knowledge organiser.
5. Retitle the "How to answer" box to scope it to **explain (cause+effect)** and add the one-line describe-vs-explain distinction (§1.2).

### 🟠 Priority 3 — evidence-based badges (§3)
6. Add the `.badge` styles, the section-heading badges, and the one-line legend, with justifications in `title=` attributes (spec mark ranges + real question refs).

### 🟡 Priority 4 — content sharpening (§1.3, §1.4)
7. Add the emerging-tech marker rule ("must be genuinely emerging; AI/self-driving capped at 1 mark; needs cause+effect").
8. Swap 2–3 generic examples for real past-paper contexts (e-bike, hydroelectric, air fryer), including the "don't accept 'renewable' alone" / "name a specific gas" marker notes.

### 🟢 Priority 5 — UX (§4)
9. Make the five learn sections **collapsible** (or add collapse-all) to cut the single-scroll length (§4.1).
10. *(Decision)* Add the **3-mode chooser** under the hero (§4.2) if you want a clearer entry point.
11. Cosmetic spacing/`border-top` on `.practice`; consider splitting the impacts table only if density still feels high.

### Guardrails for all edits
- Use existing `--eng-*` tokens only; every bespoke style needs a dark-mode result (boundary uses `var(--eng-muted)`, badges use `--eng-orange`/`--eng-text` — all already themed).
- Keep `localStorage` prefix `n5ecs-`; don't touch the quiz/RAG keys.
- British spelling; booklet wording verbatim for definitions; no teacher-only notes on the page.
- No Liquid `{{`/`{%` inside inline CSS/JS; keep tap targets ≥44 px; keep the `prefers-reduced-motion` and print blocks intact.

---

## Appendix — quick-reference evidence map (for the badge `title=` text)

| Claim used on the page | Source citation |
|---|---|
| Topic 1 ≈ 13–25 marks/paper | Spec pp.8–9: Systems 5–9, Roles 3–7, Impacts 5–9 |
| "explain = cause + effect" | 2025 QP MI p.02, principle (k) |
| Impacts marked 1 (cause) + 1 (effect) | 2024 MI Q9(d)–(f); 2025 MI Q12(a) |
| System diagram needs external input/output, not components | 2024 Assignment MI Task 3a(i); 2025 Task 1a(i) |
| Sub-system diagram: boundary + driver + 2-headed feedback | 2024 Assignment MI Task 3a(ii); 2025 Task 1a(ii) |
| Draw closed-loop diagram in the exam | 2024 QP MI Q11(a) |
| Emerging tech must be genuinely new; AI capped at 1 mark | 2024 MI Q10(e); 2025 MI Q12(f) |
| "renewable" alone not accepted; name a specific gas | 2025 MI Q7; 2024 MI Q12(a) |
