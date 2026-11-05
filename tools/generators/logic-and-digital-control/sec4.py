"""Section 4 — Boolean Expressions (deck L4; WEB-PLAN section 4).

Notation (dot, plus, bar) beside each gate, words to Boolean, diagram to Boolean (L4 Worked
Example 1), Boolean to diagram (L4 Worked Example 2), the Match task, the exam-ref line and one
credited SQA crop (2019 S1 Q6) with its MI. The bar is a combining overline (U+0305).
"""
from html import escape

from svgart import fig

ID, NAV = "s4", "Boolean"
SITE = "/assets/engineering-science/national-5/04a-logic-and-digital-control"
BAR = "̅"


def nt(x):
    return f'<span class="nb">{x}{BAR}</span>'


# Match: (figure, alt, right expression)
MATCH = [
    ("l3_we2", "A into a NOT gate; B and C into an OR gate; both into an AND gate, output Z.", "Z = A" + BAR + " • (B + C)"),
    ("m_and_or", "A and B into an AND gate; that and C into an OR gate, output Z.", "Z = (A • B) + C"),
    ("m_or_and", "B and C into an AND gate; A and that into an OR gate, output Z.", "Z = A + (B • C)"),
    ("l4_yt2", "A and B into an OR gate; C into a NOT gate; both into an AND gate, output Z.", "Z = (A + B) • C" + BAR),
]


def _match():
    opts = [m[2] for m in MATCH]
    order = [1, 3, 0, 2]
    rows = []
    for i, (name, alt, right) in enumerate(MATCH, 1):
        sel = '<option value="">Choose…</option>' + "".join(
            f'<option value="{escape(opts[k])}">{escape(opts[k])}</option>' for k in order)
        rows.append(f'<div class="match-card"><p class="mc-lab">Diagram {i}</p>{fig(name, alt="Diagram " + str(i) + ": " + alt, max_w=340)}'
                    f'<label class="mc-pick">Its Boolean <select data-answer="{escape(right)}" aria-label="Boolean for diagram {i}">{sel}</select>'
                    f'<span class="match-mark" aria-hidden="true"></span></label></div>')
    return f"""
      <div class="widget" data-match data-prog-challenge="ch-boolean" id="s4-match">
        <h3>Task: match the expression to the diagram</h3>
        <p>Choose the Boolean expression for each diagram. Find the first gates (the brackets) before the last gate. Then press <strong>Check</strong>.</p>
        <div class="match-grid">{''.join(rows)}</div>
        <div class="match-ctl btnrow">
          <button class="btn" type="button" data-check>Check</button>
          <button class="btn" type="button" data-clear>Reset</button>
        </div>
        <p class="score" data-out aria-live="polite"></p>
      </div>"""


def _sqa():
    return f"""
        <div class="sqa-item">
          <p class="stem"><b>From a real paper:</b> 2019 Section 1, Question 6. <span class="marks">3 marks</span></p>
          <img src="{SITE}/sqa-2019-s1-q6-boolean-to-diagram.png" width="1209" height="820" loading="lazy"
               alt="Exam question: the Boolean equation (A + B with a bar over B) • C = Z. Draw the logic diagram for this Boolean equation, between inputs A, B and C on the left and output Z on the right.">
          <details class="reveal"><summary>Marking instructions</summary><div class="reveal-body">
            <img src="{SITE}/sqa-2019-s1-q6-boolean-to-diagram-mi.png" width="1444" height="400" loading="lazy"
                 alt="Marking instructions for 2019 Question 6: a NOT gate on B; an OR gate on A and NOT B; an AND gate on that and C, giving Z. 1 mark for each gate wired correctly. No follow-through error from a gate.">
            <p>1 mark for each gate wired to the right inputs. <b>No FTE from a gate</b>: a gate wired wrongly loses the marks after it too.</p>
          </div></details>
          <p data-credit-note>Sources &amp; credits: © Qualifications Scotland (SQA). 2019 National 5 Engineering Science Section 1, Q6.</p>
        </div>"""


def html():
    gates = "".join(
        f'<div class="nota"><span class="nota-x">{x}</span>{fig(f, alt=a, max_w=200)}<span class="nota-w">{w}</span></div>'
        for x, f, a, w in (
            ("Z = A • B", "l2_gate_and", "AND gate, inputs A and B, output Z.", "AND is a dot"),
            ("Z = A + B", "l2_gate_or", "OR gate, inputs A and B, output Z.", "OR is a plus"),
            (f"Z = {nt('A')}", "l2_gate_not", "NOT gate, input A, output Z.", "NOT is a bar")))
    we1 = fig("l4_we1", alt="A and B into an AND gate, giving D. C into a NOT gate, giving E. D and E into an OR gate, giving Z.")
    we2 = fig("l4_we2", alt="A into a NOT gate. B and C into an AND gate. Both outputs into an OR gate, giving Z.")
    return f"""
    <!-- ================= SECTION 4 — L4 Boolean Expressions ================= -->
    <section class="panel sec" id="s4" aria-labelledby="s4-title">
      <span class="concept-tag">Section 4 · Lesson 4</span>
      <h2 id="s4-title">Boolean expressions <span class="badge exam">Exam</span></h2>
      <p class="keypoint">A Boolean expression writes a whole circuit in one line. <strong>AND</strong> is a dot, <strong>OR</strong> is a plus, <strong>NOT</strong> is a bar over the letter. Brackets show which gates come first.</p>
      <p class="exam-ref"><span class="exam-ref-lab">Past papers</span> <b>2026 S1 Q5</b> <b>2025 S2 Q11(d)</b> <b>2024 S2 Q12(c)</b> <b>2023 S1 Q3</b> <b>2022 S2 Q12(b)</b> <b>2021 S2 Q8(f)</b> <b>2019 S1 Q6</b> <b>2018 S1 Q9</b> · asked in 8 of 8 exam years</p>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Boolean for each gate</h3>
          <ul>
            <li><b>AND</b> is a dot: A • B</li>
            <li><b>OR</b> is a plus: A + B</li>
            <li><b>NOT</b> is a bar: {nt('A')}</li>
          </ul>
          <p class="bridge">Your booklet writes AND as <b>A.B</b> and the output as <b>Q</b>. The exam writes <b>A • B</b> and <b>Z</b>.</p>
        </div>
        <figure class="dual-fig"><div class="nota-row">{gates}</div></figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>From words to Boolean</h3>
          <p class="stem">A motor turns on when the start button is pressed <b>and</b> the guard is in place.</p>
          <ol>
            <li>Name the inputs: <b>A</b> = start button, <b>B</b> = guard.</li>
            <li>"and" means AND: a dot.</li>
            <li><b>Z = A • B</b></li>
          </ol>
        </div>
        <figure class="dual-fig">{fig("l2_gate_and", alt="AND gate: A is the start button, B is the guard, Z is the motor.", max_w=260)}</figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>From a diagram to Boolean</h3>
          <ol>
            <li>Label each first gate: <b>D</b>, <b>E</b>.</li>
            <li>Write each one: D = A • B, E = {nt('C')}.</li>
            <li>The last gate joins them: Z = D + E.</li>
            <li>Put brackets round each first gate: <b>Z = (A • B) + {nt('C')}</b></li>
          </ol>
        </div>
        <figure class="dual-fig">{we1}</figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>From Boolean to a diagram</h3>
          <p class="stem">Draw <b>Z = {nt('A')} + (B • C)</b>.</p>
          <ol>
            <li>A, B, C on the left. Z on the right.</li>
            <li>The bracket first: B • C is an AND gate.</li>
            <li>{nt('A')} is a NOT gate.</li>
            <li>The + outside the bracket is the last gate: OR.</li>
          </ol>
          <p>Draw every input and output line. A gate with a line missing loses its mark.</p>
        </div>
        <figure class="dual-fig">{we2}</figure>
      </div>
{_match()}

      <div class="warn">
        <strong>Watch out: keep the brackets.</strong> (A • B) + C and A • (B + C) are different circuits. Without brackets, A • B + C can be read either way.
      </div>

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span> <span class="page-ref">Booklet pp.14–15</span>
        <p class="stem">1. <b>Write</b> the Boolean expression. A warning light comes on when a door is open (A) <b>and</b> the engine is running (B). <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Z = A • B</div></details>
        <p class="stem">2. <b>Write</b> the Boolean expression. A pump runs when no water is detected (A). <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Z = {nt('A')}</div></details>
        <p class="stem">3. <b>Draw</b> the logic diagram for Z = (A + B) • C. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">{fig("p_or_and", alt="A and B into an OR gate. Its output and C into an AND gate, giving Z.")}<p>1 mark for each gate wired to the right inputs.</p></div></details>
{_sqa()}
      </div>
    </section>"""


JS = ""
