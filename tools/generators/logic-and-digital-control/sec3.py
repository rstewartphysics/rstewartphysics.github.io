"""Section 3 — Truth Tables for Combinations (deck L3; WEB-PLAN section 3).

Rows = 2^n, the binary order of the input columns, one gate at a time with D and E (bridged once
to the booklet's X), Worked Example 1 column by column with its marks, the Fill-the-table task,
the exam-ref line and one credited SQA crop (2021 S2 Q8(e)) with its MI in a reveal.
Diagrams are the deck's own (art.py, saved as SVG in figures/ by svgart.py).
"""
from itertools import product

from svgart import fig

ID, NAV = "s3", "Truth tables"
SITE = "/assets/engineering-science/national-5/04a-logic-and-digital-control"

NOT_ = lambda a: 1 - a          # noqa: E731
AND_ = lambda a, b: a & b       # noqa: E731
OR_ = lambda a, b: a | b        # noqa: E731

# Fill the table: D = A AND B, E = NOT C, Z = D AND E (the L3 Your Turn 2 circuit)
TASK = [(a, b, c, AND_(a, b), NOT_(c), AND_(AND_(a, b), NOT_(c)))
        for a, b, c in product((0, 1), repeat=3)]
TASK_FB = {
    "D": "D is A AND B. It is 1 only in the rows where A and B are both 1.",
    "E": "E is NOT C. Write the opposite of the C column.",
    "Z": "Z is D AND E. Look along the row at your D and E. Z is 1 only when both are 1.",
}


def _tbl(heads, rows, cls="tbl tt", caption=None):
    cap = f"<caption>{caption}</caption>" if caption else ""
    th = "".join(f'<th scope="col">{h}</th>' for h in heads)
    body = "".join("<tr>" + "".join(f"<td>{v}</td>" for v in r) + "</tr>" for r in rows)
    return f'<div class="tblwrap"><table class="{cls}">{cap}<thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'


def _rows_fig():
    one = _tbl(["A"], [[0], [1]], caption="1 input: 2 rows")
    two = _tbl(["A", "B"], [list(r) for r in product((0, 1), repeat=2)], caption="2 inputs: 4 rows")
    return f'<div class="tt-row">{one}{two}</div>'


def _we1():
    rows = []
    for a, b in product((0, 1), repeat=2):
        d, e = NOT_(a), NOT_(b)
        rows.append(f"<tr><td>{a}</td><td>{b}</td><td data-col=\"1\">{d}</td>"
                    f"<td data-col=\"2\">{e}</td><td data-col=\"3\">{AND_(d, e)}</td></tr>")
    diagram = fig("l3_we1", alt="Logic diagram: A into a NOT gate gives D. B into a NOT gate gives E. "
                         "D and E go into an AND gate. Its output is Z.")
    return f"""
      <div class="dual wide-fig s3-we" id="s3-we1">
        <div class="dual-text">
          <h3>Worked example: one column at a time</h3>
          <p class="stem"><b>Complete</b> the truth table for the logic diagram. <span class="marks">3 marks</span></p>
          <ol class="mark-steps">
            <li data-col="1"><b>Column D</b> = NOT A. <span class="mk">1 mark</span></li>
            <li data-col="2"><b>Column E</b> = NOT B. <span class="mk">1 mark</span></li>
            <li data-col="3"><b>Column Z</b> = D AND E. <span class="mk">1 mark</span></li>
          </ol>
          <p>Each column scores its own mark. If D is wrong, Z can still score if it is right <b>from your D</b>.</p>
        </div>
        <figure class="dual-fig">
          {diagram}
          <div class="tblwrap"><table class="tbl tt we">
            <thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col" data-col="1">D</th><th scope="col" data-col="2">E</th><th scope="col" data-col="3">Z</th></tr></thead>
            <tbody>{''.join(rows)}</tbody>
          </table></div>
          <div class="step-ctl"><button class="btn" type="button" data-step-next>Show me, column by column</button></div>
          <figcaption class="step-say" aria-live="polite">Press the button to fill one column at a time.</figcaption>
        </figure>
      </div>"""


def _task():
    rows = []
    for i, (a, b, c, d, e, z) in enumerate(TASK):
        cells = "".join(
            f'<td><button type="button" class="ttcell" data-col="{k}" data-answer="{v}" '
            f'aria-label="Row {i + 1}, column {k}: empty. Tap to set 0 or 1.">–</button></td>'
            for k, v in (("D", d), ("E", e), ("Z", z)))
        rows.append(f"<tr><td>{a}</td><td>{b}</td><td>{c}</td>{cells}</tr>")
    diagram = fig("l3_yt2", alt="Logic diagram: A and B go into an AND gate, giving D. C goes into a NOT "
                         "gate, giving E. D and E go into an AND gate. Its output is Z.")
    return f"""
      <div class="widget" id="s3-fill" data-prog-challenge="ch-ttable">
        <h3>Task: fill the truth table</h3>
        <p>Tap a cell to set it: <b>–</b> then <b>0</b> then <b>1</b>. Do column <b>D</b> first, then <b>E</b>, then <b>Z</b>. Then press <strong>Check</strong>.</p>
        <div class="dual wide-fig">
          <div class="dual-text">{diagram}</div>
          <div class="dual-fig">
            <div class="tblwrap"><table class="tbl tt fill">
              <thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th><th scope="col">D</th><th scope="col">E</th><th scope="col">Z</th></tr></thead>
              <tbody>{''.join(rows)}</tbody>
            </table></div>
            <div class="btnrow">
              <button class="btn" type="button" id="s3-fill-check">Check</button>
              <button class="btn" type="button" id="s3-fill-clear">Start again</button>
            </div>
            <ul class="fill-fb" id="s3-fill-fb" aria-live="polite"></ul>
          </div>
        </div>
      </div>"""


def _sqa():
    return f"""
        <div class="sqa-item">
          <p class="stem"><b>From a real paper:</b> 2021 Section 2, Question 8(e). <span class="marks">3 marks</span></p>
          <img src="{SITE}/sqa-2021-s2-q8e-truth-table.png" width="1216" height="1184" loading="lazy"
               alt="Exam question: part of a logic diagram for a camera flash unit. A and B go into an AND gate, giving D. B and C go into a second AND gate, giving E. D and E go into an OR gate, giving Z. Part (e) asks you to complete the D, E and Z columns of an 8-row truth table for inputs A, B and C.">
          <details class="reveal"><summary>Marking instructions</summary><div class="reveal-body">
            <img src="{SITE}/sqa-2021-s2-q8e-truth-table-mi.png" width="1444" height="880" loading="lazy"
                 alt="Marking instructions for 2021 Question 8(e): the D, E and Z columns, 1 mark for each correct column, follow-through error allowed.">
            <p>1 mark for each correct column. <b>FTE</b> (follow-through error) means a later column can still score if it is right from your earlier, wrong one.</p>
          </div></details>
          <p data-credit-note>Sources &amp; credits: © Qualifications Scotland (SQA). 2021 National 5 Engineering Science Section 2, Q8.</p>
        </div>"""


def html():
    bridge = fig("l3_we2", alt="Logic diagram: A into a NOT gate gives D. B and C into an OR gate give E. "
                        "D and E go into an AND gate. Its output is Z.")
    return f"""
    <!-- ================= SECTION 3 — L3 Truth Tables for Combinations ================= -->
    <section class="panel sec" id="s3" aria-labelledby="s3-title">
      <span class="concept-tag">Section 3 · Lesson 3</span>
      <h2 id="s3-title">Truth tables for combinations <span class="badge exam">Exam</span></h2>
      <p class="keypoint">A truth table shows the output for <strong>every</strong> set of inputs. Work it out <strong>one gate at a time</strong>. Give each gate's output its own column, D and E. Do Z last. Each column scores a mark.</p>
      <p class="exam-ref"><span class="exam-ref-lab">Past papers</span> <b>2026 S2 Q14(d)</b> <b>2025 S2 Q11(c)</b> <b>2024 S2 Q14(c)</b> <b>2023 S2 Q12(f)</b> <b>2022 S2 Q12(a)</b> <b>2021 S2 Q8(e)</b> <b>2019 S2 Q9(e)</b> <b>2018 S2 Q12(a)(ii)</b> · asked in 8 of 8 exam years</p>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>How many rows?</h3>
          <p class="formula">Rows = 2<sup>n</sup></p>
          <p><b>n</b> is the number of inputs.</p>
          <ul>
            <li>1 input: <b>2</b> rows</li>
            <li>2 inputs: <b>4</b> rows</li>
            <li>3 inputs: <b>8</b> rows</li>
          </ul>
        </div>
        <figure class="dual-fig">{_rows_fig()}</figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Filling the input columns</h3>
          <ul>
            <li><b>C</b> column: 0 1 0 1 0 1 0 1</li>
            <li><b>B</b> column: 0 0 1 1 0 0 1 1</li>
            <li><b>A</b> column: 0 0 0 0 1 1 1 1</li>
          </ul>
          <p>This is counting in binary, from 000 to 111. Fill them this way and no row is missed. The exam always prints them in this order.</p>
        </div>
        <figure class="dual-fig">{_tbl(["A", "B", "C"], [list(r) for r in product((0, 1), repeat=3)], caption="3 inputs: 8 rows")}</figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>One gate at a time</h3>
          <p>A logic circuit has <b>no memory</b>. The output depends only on the inputs now.</p>
          <p><b>Label</b> each gate's output: <b>D</b>, <b>E</b>. Give each one a column. Do <b>Z</b> last, from D and E.</p>
          <p class="bridge">The exam uses <b>D</b> and <b>E</b> for these points and <b>Z</b> for the output. Your booklet calls them <b>X</b> and <b>Q</b>. They mean the same thing.</p>
        </div>
        <figure class="dual-fig">{bridge}</figure>
      </div>
{_we1()}
{_task()}

      <div class="warn">
        <strong>Watch out: one column per gate.</strong> Jumping straight to Z loses the D and E marks, and a slip can't be found. Fill D, then E, then Z.
      </div>

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span> <span class="page-ref">Booklet p.13</span>
        <p class="stem">1. <b>State</b> how many rows a truth table needs for 3 inputs. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">8 rows (2<sup>3</sup> = 8).</div></details>
        <p class="stem">2. <b>State</b> the row that comes after 1 0 1. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">1 1 0.</div></details>
        <p class="stem">3. <b>Explain</b> why D and E are given their own columns. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Each column scores its own mark, so a slip in one column does not lose them all.</div></details>
{_sqa()}
      </div>
    </section>"""


JS = r"""
    /* Section 3: worked example, one column per press */
    [].forEach.call(document.querySelectorAll(".s3-we"), function(w){
      var btn=w.querySelector("[data-step-next]"), say=w.querySelector(".step-say"), first=say.textContent;
      var words=["Column D = NOT A: the opposite of A. 1 mark.","Column E = NOT B: the opposite of B. 1 mark.","Column Z = D AND E: 1 only when D and E are both 1. 1 mark."];
      var at=0;
      function show(){
        [].forEach.call(w.querySelectorAll("[data-col]"), function(e){
          var k=+e.dataset.col;
          e.classList.toggle("hidecol", k>at && e.tagName==="TD");
          e.classList.toggle("on", k===at);
        });
        say.textContent = at===0 ? first : words[at-1];
        btn.textContent = at===3 ? "Start again" : "Show me, column by column";
      }
      btn.addEventListener("click", function(){ at=(at+1)%4; show(); });
      show();
    });

    /* Section 3 task: fill the truth table, feedback per column */
    (function(){
      var w=$("s3-fill"); if(!w) return;
      var cells=[].slice.call(w.querySelectorAll(".ttcell")), fb=$("s3-fill-fb");
      var FB=""" + "{" + ",".join(f'"{k}":"{v}"' for k, v in TASK_FB.items()) + "}" + r""";
      function label(c){ var r=c.closest("tr").rowIndex; c.setAttribute("aria-label","Row "+r+", column "+c.dataset.col+": "+(c.textContent==="–"?"empty":c.textContent)+". Tap to change."); }
      cells.forEach(function(c){
        c.addEventListener("click", function(){
          c.textContent = c.textContent==="–" ? "0" : (c.textContent==="0" ? "1" : "–");
          c.classList.remove("ok","no"); label(c);
        });
      });
      $("s3-fill-check").addEventListener("click", function(){
        var bad={}, empty=0, right=0;
        cells.forEach(function(c){
          c.classList.remove("ok","no");
          if(c.textContent==="–"){ empty++; return; }
          var ok=c.textContent===c.dataset.answer;
          c.classList.add(ok?"ok":"no");
          if(ok) right++; else bad[c.dataset.col]=1;
        });
        fb.innerHTML="";
        function line(t, cls){ var li=document.createElement("li"); li.textContent=t; if(cls) li.className=cls; fb.appendChild(li); }
        if(right===cells.length){ line("All 24 cells right. Three columns, three marks.","good"); award("ch-ttable", true); return; }
        line(right+" of "+cells.length+" cells right."+(empty?" "+empty+" still empty.":""));
        ["D","E","Z"].forEach(function(k){ if(bad[k]) line("Column "+k+": "+FB[k]); });
        if(window.Progress && Object.keys(bad).length) window.Progress.miss();
      });
      $("s3-fill-clear").addEventListener("click", function(){
        cells.forEach(function(c){ c.textContent="–"; c.classList.remove("ok","no"); label(c); });
        fb.innerHTML="";
      });
    })();
"""
