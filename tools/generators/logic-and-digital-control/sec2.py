"""Section 2 — AND, OR and NOT Gates (deck L2; WEB-PLAN section 2).

One block per gate (symbol, truth table, switch picture, use), the Draw-the-lines Watch Out
(2024 S1 Q1(b), 59%), the Name-the-gate task, testing a gate on the logic board or in Yenka.
The only bank item for this key area (2024 S1 Q1) is used in the L2 deck, so there is no crop.
"""
from html import escape

from svgart import fig

ID, NAV = "s2", "Gates"
SITE = "/assets/engineering-science/national-5/04a-logic-and-digital-control"

GATES = [
    ("AND", "l2_gate_and", "Z = 1 only when <b>all</b> inputs are 1.", "Like two switches in <b>series</b>.",
     "the two-hand press: it moves only when both hands are on the buttons.", "l2_series",
     [(0, 0, 0), (0, 1, 0), (1, 0, 0), (1, 1, 1)],
     "Two push switches A and B in series with a lamp and a cell. Both must be pressed to light the lamp."),
    ("OR", "l2_gate_or", "Z = 1 when <b>any</b> input is 1.", "Like two switches in <b>parallel</b>.",
     "an alarm that sounds when any door opens.", "l2_parallel",
     [(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 1)],
     "Two push switches A and B in parallel, in series with a lamp and a cell. Either one lights the lamp."),
    ("NOT", "l2_gate_not", "One input. The output is the <b>opposite</b>.", "Also called an <b>inverter</b>.",
     "a fridge light that is on when the door is not closed.", None,
     [(0, 1), (1, 0)], None),
]

# Name the gate: (what is shown, html clue, right gate, feedback per option)
NAME_QS = [
    ("It has this truth table.", "Z column: 0, 0, 0, 1",
     "AND", {"AND": "Right. Z is 1 only in the last row, where A and B are both 1.",
             "OR": "OR gives 1 whenever any input is 1, so its Z column is 0, 1, 1, 1.",
             "NOT": "NOT has one input, so its table has only two rows."}),
    ("It has this truth table.", "Z column: 0, 1, 1, 1",
     "OR", {"AND": "AND gives 1 only when all inputs are 1: 0, 0, 0, 1.",
            "OR": "Right. Z is 1 whenever A or B (or both) is 1.",
            "NOT": "NOT has one input, so its table has only two rows."}),
    ("It has only one input.", "",
     "NOT", {"AND": "AND needs at least two inputs to compare.",
             "OR": "OR needs at least two inputs.",
             "NOT": "Right. NOT has one input and gives the opposite."}),
    ("A machine runs only when the guard is closed and the start button is pressed.", "",
     "AND", {"AND": "Right. Both conditions must be true: that is AND.",
             "OR": "OR would run it with just one of them. Here both are needed.",
             "NOT": "NOT turns one signal round. Here two conditions must both be true."}),
    ("A bell rings when the front door or the back door opens.", "",
     "OR", {"AND": "AND would need both doors open at once.",
            "OR": "Right. Either door is enough: that is OR.",
            "NOT": "NOT turns one signal round. Here either of two inputs will do."}),
    ("It changes a high input to a low output.", "",
     "NOT", {"AND": "AND has two inputs and does not turn a single high into a low.",
             "OR": "OR gives a high output when any input is high.",
             "NOT": "Right. NOT inverts: high in, low out."}),
]


def _tt(rows, n):
    heads = ["A", "B", "Z"] if n == 2 else ["A", "Z"]
    th = "".join(f'<th scope="col">{h}</th>' for h in heads)
    body = "".join("<tr>" + "".join(f"<td>{v}</td>" for v in r) + "</tr>" for r in rows)
    return f'<div class="tblwrap"><table class="tbl tt"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'


def _gate_block(name, sym, rule, like, use, pic, rows, pic_alt):
    alt = (f"The {name} gate symbol: " + ("one input on the left, the output Z on the right, with a small circle at its tip."
                                         if name == "NOT" else "inputs A and B on the left, output Z on the right."))
    switches = f'<figure class="sw-fig">{fig(pic, alt=pic_alt, max_w=300)}</figure>' if pic else ""
    return f"""
      <div class="dual wide-fig gate-block">
        <div class="dual-text">
          <h3>{name} gate</h3>
          <p>{rule}</p>
          <p>{like}</p>
          <p><b>Use:</b> {use}</p>
        </div>
        <figure class="dual-fig">
          <div class="gate-pair">{fig(sym, alt=alt, max_w=260)}{_tt(rows, 1 if name == "NOT" else 2)}</div>
          {switches}
        </figure>
      </div>"""


def _name_task():
    qs = []
    for qi, (q, clue, right, fb) in enumerate(NAME_QS, 1):
        bs = "".join(f'<button type="button" class="mcq-opt" data-right="{1 if g == right else 0}" '
                     f'data-fb="{escape(fb[g])}">{g}</button>' for g in ("AND", "OR", "NOT"))
        c = f' <span class="clue">{escape(clue)}</span>' if clue else ""
        qs.append(f'<div class="mcq" data-q="{qi}"><p class="qstem">{qi}. <b>Name</b> the gate. {escape(q)}{c}</p>'
                  f'<div class="mcq-opts">{bs}</div><p class="mcq-fb" aria-live="polite"></p></div>')
    return f"""
      <div class="widget" id="s2-name" data-prog-challenge="ch-name-gate">
        <h3>Task: name the gate</h3>
        <p>Tap AND, OR or NOT. Every answer tells you why.</p>
        {''.join(qs)}
        <p class="score" id="s2-name-score" aria-live="polite"></p>
      </div>"""


def html():
    blocks = "".join(_gate_block(*g) for g in GATES)
    shape = fig("l2_and_shape", alt="An AND gate shape on its own, with no input or output lines.", max_w=200)
    lines = fig("l2_and_lines", alt="An AND gate with its two input lines and its output line drawn.", max_w=300)
    rig = fig("l2_test_rig", alt="Testing a gate: switch A and switch B from +5 V into an AND gate. Its output Z lights an LED to 0 V.",
              max_w=460)
    return f"""
    <!-- ================= SECTION 2 — L2 AND, OR and NOT Gates ================= -->
    <section class="panel sec" id="s2" aria-labelledby="s2-title">
      <span class="concept-tag">Section 2 · Lesson 2</span>
      <h2 id="s2-title">AND, OR and NOT gates <span class="badge exam">Exam</span></h2>
      <p class="keypoint">A logic gate takes digital inputs (1 or 0) and gives one digital output, Z. At National 5 you use three: <strong>AND</strong>, <strong>OR</strong> and <strong>NOT</strong>.</p>
      <p class="exam-ref"><span class="exam-ref-lab">Past papers</span> <b>2024 S1 Q1(a), (b)</b></p>
      <p class="bridge">The exam calls the output <b>Z</b>. Your booklet calls it <b>Q</b>.</p>
{blocks}

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Drawing the symbols</h3>
          <ol>
            <li>Draw the shape.</li>
            <li>Add the input lines.</li>
            <li>Add the output line.</li>
          </ol>
          <div class="warn">
            <strong>Watch out: draw the lines.</strong> A shape on its own scores 0. The inputs and output drawn score the mark. In 2024, only 59% of pupils in Scotland got this right.
          </div>
        </div>
        <figure class="dual-fig">
          <div class="mistake-pair">
            <div><p class="mk-lab bad">The mistake: 0 marks</p>{shape}</div>
            <div><p class="mk-lab good">The answer: 1 mark</p>{lines}</div>
          </div>
        </figure>
      </div>
{_name_task()}

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Testing a gate</h3>
          <p>Put a <b>switch</b> on every input and label them <b>A</b> and <b>B</b>. Switch up = 1. LED on = 1.</p>
          <p>Test <b>00, 01, 10, 11</b> in order, then compare with the truth table.</p>
          <p>In class you build it on the <b>logic board</b>: switches J and K are A and B. No kit? Do the same test in <b>Yenka</b>.</p>
          <p class="safety"><b>Safety:</b> never join two outputs.</p>
        </div>
        <figure class="dual-fig">
          {rig}
          <img class="board" src="{SITE}/figures/logic-board.png" width="1400" height="718" loading="lazy"
               alt="The logic section of the Logic and Arithmetic board: switches J, K and L on the left, two rows of AND, OR and NOT gates, and output LEDs X, Y and Z on the right.">
          <figcaption>The logic board, drawn from the UKESF / University of Southampton Logic and Arithmetic kit.</figcaption>
        </figure>
      </div>

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span>
        <p class="stem">1. <b>State</b> the output of an AND gate when A = 1 and B = 0. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">0. AND needs both inputs at 1.</div></details>
        <p class="stem">2. <b>Draw</b> the symbol for an OR gate. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">{fig("l2_gate_or", alt="The OR gate symbol with inputs A and B and output Z.", max_w=240)}<p>Draw both input lines and the output line, or the mark is lost.</p></div></details>
        <p class="stem">3. <b>Describe</b> what a NOT gate does. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Its output is the opposite of its input (it inverts).</div></details>
      </div>
    </section>"""


JS = r"""
    /* Section 2 task: name the gate — every option explains itself */
    (function(){
      var w=$("s2-name"); if(!w) return;
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
            $("s2-name-score").textContent=n+" of "+qs.length+" right"+(n===qs.length?". All six: well done.":"");
            if(n===qs.length) award("ch-name-gate", true);
          });
        });
      });
    })();
"""
