"""Section 5 — Designing Logic (deck L5; WEB-PLAN section 5).

The four-step design method, Worked Example 1 (the fan) and 2 (the lift) with their check
tables, the lift practical in one block, truth table to Boolean, the Pick-the-gate task, the
exam-ref line and one credited SQA crop (2019 S2 Q9(d)). The crop's MI stops above its
"accept alternatives" lines: they name a gate N5 pupils are not shown.
"""
from html import escape
from itertools import product

from svgart import fig

ID, NAV = "s5", "Designing"
SITE = "/assets/engineering-science/national-5/04a-logic-and-digital-control"
BAR = "̅"

# Pick the gate: (problem, right, feedback per option)
PICK = [
    ("A drill runs only when the guard is down and the trigger is pressed.", "AND",
     {"AND": "Right. Both must be true: guard down and trigger pressed.",
      "OR": "OR would run the drill with only one of them. Safety needs both.",
      "NOT": "NOT turns one signal round. Here two things must both be true."}),
    ("A shop buzzer sounds when the front door or the back door opens.", "OR",
     {"AND": "AND would need both doors open at once.",
      "OR": "Right. Either door is enough to sound it.",
      "NOT": "NOT turns one signal round. Here there are two doors, and either will do."}),
    ("A porch light comes on when it is not daylight.", "NOT",
     {"AND": "AND needs two inputs. Here there is one: daylight.",
      "OR": "OR needs two inputs. Here there is one: daylight.",
      "NOT": "Right. Light on when daylight is 0: the opposite of the input."}),
    ("A lift moves when the door is closed and the floor or the call button is pressed.", "AND and OR",
     {"AND": "Close, but the floor and call buttons are an either-or. That needs an OR first.",
      "OR": "The buttons need OR, but the door must also be closed: an AND joins them.",
      "NOT": "Nothing here is turned round. Look for and and or in the words.",
      "AND and OR": "Right. B OR C first, then AND with A: Z = A • (B + C)."}),
    ("A fan runs when it is hot and the door is not open.", "AND and NOT",
     {"AND": "Close, but the door must be not open. That needs a NOT on the door.",
      "NOT": "The door needs a NOT, but it is also hot AND the door: an AND joins them.",
      "OR": "The fan needs both conditions, not either one.",
      "AND and NOT": f"Right. NOT on the door, then AND: Z = A • B{BAR}."}),
]


def nt(x):
    return f'<span class="nb">{x}{BAR}</span>'


def _tt(heads, rows, hl=None):
    th = "".join(f'<th scope="col">{h}</th>' for h in heads)
    body = "".join("<tr" + (' class="hl"' if hl and r[-1] == 1 else "") + ">" +
                   "".join(f"<td>{v}</td>" for v in r) + "</tr>" for r in rows)
    return f'<div class="tblwrap"><table class="tbl tt"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'


def _pick():
    qs = []
    for qi, (q, right, fb) in enumerate(PICK, 1):
        bs = "".join(f'<button type="button" class="mcq-opt" data-right="{1 if g == right else 0}" '
                     f'data-fb="{escape(f)}">{escape(g)}</button>' for g, f in fb.items())
        qs.append(f'<div class="mcq" data-q="{qi}"><p class="qstem">{qi}. <b>Choose</b> the gates. {escape(q)}</p>'
                  f'<div class="mcq-opts">{bs}</div><p class="mcq-fb" aria-live="polite"></p></div>')
    return f"""
      <div class="widget" id="s5-pick" data-prog-challenge="ch-design">
        <h3>Task: pick the gates for the problem</h3>
        <p>Underline the inputs in your head, then pick. Every answer tells you why.</p>
        {''.join(qs)}
        <p class="score" id="s5-pick-score" aria-live="polite"></p>
      </div>"""


def _sqa():
    return f"""
        <div class="sqa-item">
          <p class="stem"><b>From a real paper:</b> 2019 Section 2, Question 9(d). <span class="marks">3 marks</span></p>
          <img src="{SITE}/sqa-2019-s2-q9d-table-to-boolean.png" width="1158" height="674" loading="lazy"
               alt="Exam question: a logic circuit in a hospital bed has this truth table. A B Z: 0 0 1, 0 1 0, 1 0 0, 1 1 1. Part (d) asks you to complete the Boolean equation for output Z in terms of inputs A and B.">
          <details class="reveal"><summary>Marking instructions</summary><div class="reveal-body">
            <img src="{SITE}/sqa-2019-s2-q9d-table-to-boolean-mi.png" width="1444" height="325" loading="lazy"
                 alt="Marking instructions for 2019 Question 9(d): Z = (A-bar • B-bar) + (A • B). 1 mark for each bracket, 1 mark for OR-ing them.">
            <p>One bracket for each row with Z = 1, a bar on each 0, then OR the brackets.</p>
          </div></details>
          <p data-credit-note>Sources &amp; credits: © Qualifications Scotland (SQA). 2019 National 5 Engineering Science Section 2, Q9.</p>
        </div>"""


def html():
    fan_rows = [(a, b, 1 - b, a & (1 - b)) for a, b in product((0, 1), repeat=2)]
    lift_rows = [(a, b, c, b | c, a & (b | c)) for a, b, c in product((0, 1), repeat=3)]
    xr = [(a, b, a ^ b) for a, b in product((0, 1), repeat=2)]
    return f"""
    <!-- ================= SECTION 5 — L5 Designing Logic ================= -->
    <section class="panel sec" id="s5" aria-labelledby="s5-title">
      <span class="concept-tag">Section 5 · Lesson 5</span>
      <h2 id="s5-title">Designing logic for engineering problems <span class="badge exam">Exam</span></h2>
      <p class="keypoint">To design a control system, <strong>underline</strong> the inputs and the output. <strong>Choose</strong> AND, OR or NOT. <strong>Write</strong> the Boolean. Then <strong>draw</strong> it and check it with a truth table.</p>
      <p class="exam-ref"><span class="exam-ref-lab">Past papers</span> <b>2023 S2 Q12(g)</b> <b>2019 S2 Q9(d)</b></p>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Worked example 1: a fan</h3>
          <p class="stem">A fan runs when it is <b>hot</b> and the <b>door is not open</b>.</p>
          <ol>
            <li>A = hot, B = door open. Z = fan.</li>
            <li>AND, with NOT on B.</li>
            <li><b>Z = A • {nt('B')}</b></li>
            <li>Draw it, then check: is Z = 1 only when it is hot and the door is shut?</li>
          </ol>
        </div>
        <figure class="dual-fig">
          {fig("l5_fan", alt="A goes straight to an AND gate. B goes through a NOT gate to the same AND gate. Its output is Z.")}
          {_tt(["A", "B", "D", "Z"], fan_rows, hl=True)}
          <figcaption>D = {nt('B')}, Z = A • D. Z = 1 only in the shaded row.</figcaption>
        </figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Worked example 2: a lift</h3>
          <p class="stem">A lift moves when the <b>door is closed</b> and the <b>floor</b> or <b>call</b> button is pressed.</p>
          <ol>
            <li>A = door closed, B = floor button, C = call button.</li>
            <li>B OR C first, then AND with A.</li>
            <li><b>Z = A • (B + C)</b></li>
            <li>Check: the lift moves only with the door closed (A = 1).</li>
          </ol>
          <p><b>In class:</b> you build this on the logic board and test all 8 rows. Switches J, K, L are A, B, C.</p>
        </div>
        <figure class="dual-fig">
          {fig("l5_lift", alt="B and C go into an OR gate. A and the OR output go into an AND gate. Its output is Z.")}
          {_tt(["A", "B", "C", "D", "Z"], lift_rows, hl=True)}
          <figcaption>D = B + C, Z = A • D. Z = 1 only in the shaded rows.</figcaption>
        </figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>From a truth table to Boolean</h3>
          <ol>
            <li>Find each row with <b>Z = 1</b>.</li>
            <li>AND its inputs, with a <b>bar on each 0</b>.
              <ul><li>Row 0 1: ({nt('A')} • B)</li><li>Row 1 0: (A • {nt('B')})</li></ul></li>
            <li><b>OR</b> the brackets: <b>Z = ({nt('A')} • B) + (A • {nt('B')})</b></li>
          </ol>
        </div>
        <figure class="dual-fig">{_tt(["A", "B", "Z"], xr, hl=True)}<figcaption>The rows with Z = 1 are shaded.</figcaption></figure>
      </div>
{_pick()}

      <div class="warn">
        <strong>Watch out: a bracket for every row.</strong> In 2023 only 37% of pupils in Scotland scored well on writing Boolean from a table. Write one bracket for <b>each</b> row with Z = 1, put a bar on every 0, then join them with +.
      </div>

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span> <span class="page-ref">Booklet pp.21–22</span>
        <p class="stem">1. <b>State</b> the gate and <b>write</b> the Boolean. An alarm sounds when any one of three windows (A, B, C) is opened. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">OR (1). Z = A + B + C (1).</div></details>
        <p class="stem">2. <b>Write</b> the Boolean. A press works when the start button (A) and the guard (B) are on. The emergency stop (C) must <b>not</b> be pressed. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Z = A • B • {nt('C')}</div></details>
        <p class="stem">3. <b>Write</b> the Boolean. A truth table has Z = 1 only in row A = 1, B = 1, C = 0. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Z = A • B • {nt('C')}: one bracket, a bar on the 0.</div></details>
{_sqa()}
      </div>
    </section>"""


JS = r"""
    /* Section 5 task: pick the gates — every option explains itself */
    (function(){
      var w=$("s5-pick"); if(!w) return;
      var qs=[].slice.call(w.querySelectorAll(".mcq")), got={};
      qs.forEach(function(q){
        var fb=q.querySelector(".mcq-fb");
        [].forEach.call(q.querySelectorAll(".mcq-opt"), function(b){
          b.addEventListener("click", function(){
            [].forEach.call(q.querySelectorAll(".mcq-opt"), function(x){ x.classList.remove("right","wrong"); });
            var ok=b.dataset.right==="1";
            b.classList.add(ok?"right":"wrong");
            fb.textContent=b.dataset.fb;
            if(ok){ got[q.dataset.q]=1; } else if(window.Progress){ window.Progress.miss(); }
            var n=Object.keys(got).length;
            $("s5-pick-score").textContent=n+" of "+qs.length+" right"+(n===qs.length?". All five: well done.":"");
            if(n===qs.length) award("ch-design", true);
          });
        });
      });
    })();
"""
