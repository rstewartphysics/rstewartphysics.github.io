"""Closing blocks: #answers (Booklet 4a keys, from the answer slides of decks L1-L5, shipped
4 Nov 2026), #check (mixed quiz, every option with feedback — DECK-RULES 42; RAG self-check of
the decks' I Can statements, device-only), #recap (what loses marks), a glossary with pictures
(D17) and "where this comes up next"."""
from html import escape
import json

from svgart import fig

ID, NAV = "answers", "Answers"
NAVS = [("answers", "Answers"), ("check", "Check yourself"), ("recap", "Recap")]
BAR = "̅"


def nt(x):
    return f'<span class="nb">{x}{BAR}</span>'


def _tt(heads, rows, cls="tbl tt"):
    th = "".join(f'<th scope="col">{h}</th>' for h in heads)
    body = "".join("<tr>" + "".join(f"<td>{v}</td>" for v in r) + "</tr>" for r in rows)
    return f'<div class="tblwrap"><table class="{cls}"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'


def _ab(fn):
    return [(a, b, fn(a, b)) for a in (0, 1) for b in (0, 1)]


def _abc(fn):
    return [(a, b, c, *fn(a, b, c)) for a in (0, 1) for b in (0, 1) for c in (0, 1)]


ANSWERS = [
    ("Task 1 — Logic states (page 4)", _tt(["Situation", "Logic state"], [
        ("A switch is being pressed.", 1), ("A switch is not being pressed.", 0),
        ("A guard sensor detects the guard is in place.", 1), ("A buzzer is silent.", 0), ("A motor is running.", 1)], cls="tbl")),
    ("Lesson 1 Review Questions", """<ol>
<li>Analogue: any value in a range. Digital: only two values.</li>
<li>Any two: push button, limit switch.</li>
<li>Any two: LED or lamp, buzzer.</li>
<li>Near 5 V.</li>
<li>Near 0 V.</li>
<li>Logic 1.</li>
<li>The guard is not in place.</li>
<li>A buzzer sounds, to warn the user.</li>
<li>It has only two levels, so noise can't flip it.</li>
<li>Analogue.</li></ol>"""),
    ("Lesson 2 Review Questions", """<ol>
<li>AND, OR, NOT.</li>
<li>The output is 1 only when all inputs are 1.</li>
<li>The output is 1 when any input is 1.</li>
<li>The output is the opposite of the input.</li>
<li>Q column: 0, 0, 0, 1.</li>
<li>Q column: 0, 1, 1, 1.</li>
<li>AND gate.</li>
<li>OR gate.</li>
<li>Logic 0.</li>
<li>It inverts: the output is the opposite of the input.</li></ol>"""),
    ("Practical Task 1 — Testing the gates (page 7)", '<div class="tt-row">' +
     _tt(["A", "B", "Z (AND)"], _ab(lambda a, b: a & b)) + _tt(["A", "B", "Z (OR)"], _ab(lambda a, b: a | b)) +
     _tt(["A", "Z (NOT)"], [(0, 1), (1, 0)]) + "</div>"),
    ("Task 4 — Truth tables (page 11)", '<div class="tt-row">' +
     _tt(["A", "B", "X", "Q"], [(a, b, 1 - b, a | (1 - b)) for a in (0, 1) for b in (0, 1)]).replace('<table class="tbl tt">', '<table class="tbl tt"><caption>(a)</caption>') +
     _tt(["A", "B", "X", "Q"], [(a, b, 1 - a, (1 - a) & b) for a in (0, 1) for b in (0, 1)]).replace('<table class="tbl tt">', '<table class="tbl tt"><caption>(b)</caption>') + "</div>"),
    ("Task 5 — Three inputs (page 12)", _tt(["A", "B", "C", "X", "Q"], _abc(lambda a, b, c: (a & b, (a & b) | c)))),
    ("Lesson 3 Review Questions (page 13)", """<ol>
<li>Rows = 2<sup>n</sup>.</li>
<li>4.</li>
<li>8.</li>
<li>The output depends on the inputs now only.</li>
<li>One gate at a time, so mistakes are easy to spot.</li></ol>"""),
    ("Task 6 — Words to Boolean (page 14)", _tt(["Description", "Boolean"], [
        ("Buzzer: either of two doors", "Q = A + B"), ("Warning light: door open and engine on", "Q = A • B"),
        ("Pump off: no water detected", f"Q = {nt('A')}"), ("Heater: temperature low and timer on", "Q = A • B")], cls="tbl")),
    ("Task 7 — Drawing diagrams (pages 14 to 15)", f"""<p>Check each diagram has every input and output line.</p>
<ul><li>Q = A.B: one AND gate.</li><li>Q = A + B: one OR gate.</li>
<li>Q = {nt('A')}.B: A through a NOT gate, then AND with B.</li>
<li>Q = A + (B.C): B AND C first, then OR with A.</li></ul>"""),
    ("Lesson 4 Review Questions", f"""<ol>
<li>Q = A • B</li><li>Q = A + B</li><li>Q = {nt('A')}</li><li>Q = A • B • {nt('C')}</li>
<li value="8">Q = (A • B) + C</li><li>Q = A + (B • C)</li></ol>
<p>Questions 5, 6, 7 and 10 are diagrams. Check them against the With Answers slides for Lesson 4.</p>"""),
    ("Task 8 — Design problems (pages 18 to 20)", _tt(["Part", "Inputs", "Boolean"], [
        ("(a)", "A front door, B back door", "Q = A + B"), ("(b)", "A door closed, B start", "Q = A • B"),
        ("(c)", "A dark, B movement", "Q = A • B"), ("(d)", "A stop button (1 = not pressed)", "Q = A")], cls="tbl")),
    ("Lesson 5 Review Questions (pages 21 to 22)", f"""<ol>
<li>AND; Q = A • B</li><li>OR; Q = A + B + C</li><li>Q = A • B • {nt('C')}</li><li>OR; Q = A + B</li>
<li>AND (three inputs)</li><li>AND</li><li>Q = A • B</li><li>Q = {nt('A')} • B</li><li>Q = (A • B) + {nt('C')}</li></ol>
<p>Question 10:</p>""" + _tt(["A", "B", "C", "Q"], _abc(lambda a, b, c: ((a | b) & c,)))),
]

QUIZ = [
    ("<b>Choose</b> the right ending. A digital signal…", [
        ("changes smoothly over a range", False, "That is an analogue signal. A digital signal jumps between two values."),
        ("has only two values, 1 or 0", True, "Right. Digital means two states: on or off, 1 or 0."),
        ("is always 5 V", False, "Logic 1 is near 5 V, but logic 0 is near 0 V. It has two values."),
        ("cannot be used for control", False, "Digital signals are what logic gates and microcontrollers use to control things."),
    ]),
    ("<b>Choose</b> the right ending. An AND gate gives an output of 1 when…", [
        ("any input is 1", False, "That is OR. AND needs every input to be 1."),
        ("all inputs are 1", True, "Right. AND is like switches in series: all must be on."),
        ("the input is 0", False, "That is NOT. AND has two or more inputs and needs them all at 1."),
        ("the inputs are different", False, "AND gives 1 only when all the inputs are 1, not when they differ."),
    ]),
    ("<b>Choose</b> the right ending. A truth table for three inputs needs…", [
        ("3 rows", False, "One row for every set of inputs: 2 × 2 × 2 = 8."),
        ("4 rows", False, "4 rows is two inputs. Three inputs need 2³ = 8."),
        ("6 rows", False, "Rows = 2ⁿ, not 2 × n. For 3 inputs that is 8."),
        ("8 rows", True, "Right. Rows = 2ⁿ, and 2³ = 8."),
    ]),
    ("<b>Choose</b> the right ending. Z = A • B describes…", [
        ("an OR gate", False, "OR is written with a plus: A + B."),
        ("a NOT gate", False, "NOT is a bar over one letter."),
        ("an AND gate", True, "Right. The dot means AND."),
        ("two NOT gates", False, "There are no bars, so no NOT gates. The dot means AND."),
    ]),
    ("<b>Choose</b> the reason. In a truth table, why give D and E their own columns?", [
        ("The exam needs fewer rows", False, "The number of rows depends only on the inputs."),
        ("Each column scores a mark", True, "Right. Each column is marked, so one slip doesn't lose them all."),
        ("D and E are inputs", False, "D and E are the outputs of the first gates, not inputs."),
        ("It makes Z come first", False, "Z comes last, worked out from D and E."),
    ]),
    ("<b>Choose</b> the Boolean. A lamp is on when it is dark (A) and a switch (B) is not pressed.", [
        ("Z = A + B", False, "Plus is OR. Here both conditions are needed, and B must be not pressed."),
        (f"Z = A • B{BAR}", True, "Right. AND joins the two, and the bar on B means not pressed."),
        ("Z = A • B", False, "Close, but B must be not pressed. That needs a bar on B."),
        (f"Z = A{BAR} • B", False, "The bar is on the wrong letter. It is B that must be not pressed."),
    ]),
]

RAG = [
    ["Lesson 1 — Digital signals", ["I can describe the difference between analogue and digital signals",
                                     "I can identify logic 1 (high) and logic 0 (low)",
                                     "I can give examples of digital input and output devices"]],
    ["Lesson 2 — AND, OR and NOT", ["I can draw the AND, OR and NOT symbols", "I can describe what each gate does",
                                     "I can complete the truth table for each gate",
                                     "I can test every input combination in order"]],
    ["Lesson 3 — Truth tables", ["I can state how many rows a truth table needs", "I can fill in the input columns in order",
                                  "I can complete a truth table one gate at a time", "I can complete a three-input truth table"]],
    ["Lesson 4 — Boolean", ["I can write the Boolean for AND, OR and NOT", "I can write a Boolean expression from words",
                             "I can write a Boolean expression from a diagram", "I can draw a diagram from a Boolean expression"]],
    ["Lesson 5 — Designing logic", ["I can pick out the inputs and the output",
                                     "I can choose AND, OR or NOT and write the Boolean",
                                     "I can draw the diagram and check it with a truth table",
                                     "I can write Boolean from a truth table"]],
]

WAVE = ('<svg class="gl-svg" viewBox="0 0 72 40" role="img" aria-label="{a}"><path d="{d}" fill="none" '
        'stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>')
GLOSSARY = [
    ("Analogue signal", "Can take any value in a range. Changes smoothly.",
     WAVE.format(a="A smooth wave", d="M4 20 C14 2 22 2 32 20 S50 38 60 20 66 8 68 8")),
    ("Digital signal", "Only two values: 1 or 0, on or off.",
     WAVE.format(a="A square wave", d="M4 32 H16 V8 H32 V32 H48 V8 H64 V32 H68")),
    ("Logic 1 / logic 0", "Logic 1 is high, on, true (near 5 V). Logic 0 is low, off, false (near 0 V).",
     '<span class="gl-big" aria-hidden="true">1 / 0</span>'),
    ("AND gate", "Output 1 only when all inputs are 1.", ("fig", "l2_gate_and", "AND gate symbol")),
    ("OR gate", "Output 1 when any input is 1.", ("fig", "l2_gate_or", "OR gate symbol")),
    ("NOT gate (inverter)", "Output is the opposite of the input.", ("fig", "l2_gate_not", "NOT gate symbol")),
    ("Truth table", "Every set of inputs and its output. Rows = 2ⁿ.",
     '<span class="gl-big" aria-hidden="true">2ⁿ</span>'),
    ("Boolean expression", "A circuit in one line: • for AND, + for OR, a bar for NOT.",
     '<span class="gl-big" aria-hidden="true">A • B</span>'),
    ("Combinational logic", "The output depends only on the inputs now. No memory.",
     ("fig", "l3_we1", "Two gates feeding a third")),
]


def _quiz():
    out = []
    for qi, (q, opts) in enumerate(QUIZ, 1):
        bs = "".join(f'<button type="button" class="mcq-opt" data-right="{1 if ok else 0}" '
                     f'data-fb="{escape(fb)}">{escape(o)}</button>' for o, ok, fb in opts)
        out.append(f'<div class="mcq" data-q="{qi}"><p class="qstem">{qi}. {q}</p>'
                   f'<div class="mcq-opts">{bs}</div><p class="mcq-fb" aria-live="polite"></p></div>')
    return "".join(out)


def _gloss():
    return '<dl class="gloss">' + "".join(
        f'<div class="gl-item"><div class="gl-pic">{fig(pic[1], alt=pic[2], max_w=72) if isinstance(pic, tuple) else pic}</div>'
        f'<dt>{escape(t)}</dt><dd>{escape(m)}</dd></div>'
        for t, m, pic in GLOSSARY) + "</dl>"


def html():
    keys = "".join(f'<details class="reveal"><summary>{escape(t)}</summary><div class="reveal-body">{b}</div></details>'
                   for t, b in ANSWERS)
    return f"""
    <!-- ================= ANSWERS ================= -->
    <section class="panel sec" id="answers" aria-labelledby="answers-title">
      <span class="concept-tag">Booklet check</span>
      <h2 id="answers-title">Check your booklet work</h2>
      <p>Answers to Booklet 4a. Try each one first, then open it. These use the booklet's letters, X and Q.</p>
      {keys}
    </section>

    <!-- ================= CHECK YOURSELF ================= -->
    <section class="panel sec" id="check" aria-labelledby="check-title">
      <span class="concept-tag">Check yourself</span>
      <h2 id="check-title">Check yourself</h2>
      <div class="widget" id="check-quiz" data-prog-challenge="ch-4a-quiz">
        <h3>Mixed quiz</h3>
        <p>Tap an answer. Every answer tells you why.</p>
        {_quiz()}
        <p class="score" id="check-quiz-score" aria-live="polite"></p>
      </div>
      <h3>Rate your confidence: the I Can statements</h3>
      <p class="hint">R not yet, A getting there, G confident. Saved on this device only.</p>
      <div id="rag"></div>
      <p class="rag-summary" id="rag-summary" aria-live="polite"></p>
      <div class="btnrow"><button class="btn" type="button" id="rag-reset">Reset ratings</button></div>
    </section>

    <!-- ================= RECAP ================= -->
    <section class="panel sec" id="recap" aria-labelledby="recap-title">
      <span class="concept-tag">Recap</span>
      <h2 id="recap-title">Recap and words</h2>
      <div class="warn">
        <h3>What loses marks</h3>
        <ul>
          <li>A gate shape with no input or output lines.</li>
          <li>Jumping straight to Z: fill D, then E, then Z.</li>
          <li>Input columns out of order: count in binary, 000 to 111.</li>
          <li>Boolean with the brackets left out.</li>
          <li>A bar missing, or on the wrong letter.</li>
          <li>Writing Boolean from a table with a bracket missing for a row with Z = 1.</li>
        </ul>
      </div>
      <h3>Glossary</h3>
      {_gloss()}
      <h3>Where this comes up next</h3>
      <div class="resource-grid">
        <a class="resource-card" href="/classes/n5-engineering/programmable-control.html"><span class="resource-title">Programmable Control →</span><span class="resource-meta">Booklet 4b: microcontrollers and flowcharts</span></a>
        <a class="resource-card" href="/classes/n5-engineering/pneumatics.html"><span class="resource-title">Pneumatics →</span><span class="resource-meta">AND and OR with air: two valves in series or a shuttle valve</span></a>
      </div>
    </section>"""


JS = r"""
    /* Mixed quiz: every option explains itself; all right -> challenge done */
    (function(){
      var w=$("check-quiz"); if(!w) return;
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
            $("check-quiz-score").textContent=n+" of "+qs.length+" right";
            if(n===qs.length){ award("ch-4a-quiz", true); }
          });
        });
      });
    })();

    /* RAG self-check: the I Can statements, saved on this device only */
    (function(){
      var GROUPS=__RAG__;
      var box=$("rag"), state=load("rag",{}), total=0;
      if(!box) return;
      GROUPS.forEach(function(g){ total+=g[1].length; });
      function summary(){
        var gr=0,am=0,re=0,i;
        for(i=0;i<total;i++){ var s=state[i]; if(s==="G")gr++; else if(s==="A")am++; else if(s==="R")re++; }
        $("rag-summary").textContent=gr+" green · "+am+" amber · "+re+" red  (of "+total+")";
      }
      var idx=0;
      GROUPS.forEach(function(g){
        var head=document.createElement("div"); head.className="rag-group"; head.textContent=g[0]; box.appendChild(head);
        g[1].forEach(function(c){
          var i=idx++;
          var row=document.createElement("div"); row.className="rag-item";
          var lab=document.createElement("span"); lab.className="crit"; lab.textContent=c; row.appendChild(lab);
          var btns=document.createElement("span"); btns.className="rag-btns";
          ["R","A","G"].forEach(function(k){
            var b=document.createElement("button"); b.type="button"; b.dataset.on=k; b.textContent=k;
            b.setAttribute("aria-label", c+" — "+(k==="R"?"not yet":k==="A"?"getting there":"confident"));
            b.setAttribute("aria-pressed", state[i]===k);
            b.addEventListener("click", function(){
              state[i]=k; save("rag",state);
              [].forEach.call(btns.querySelectorAll("button"), function(x){ x.setAttribute("aria-pressed", x.dataset.on===k); });
              summary();
            });
            btns.appendChild(b);
          });
          row.appendChild(btns); box.appendChild(row);
        });
      });
      $("rag-reset").addEventListener("click", function(){
        state={}; save("rag",state);
        [].forEach.call(box.querySelectorAll(".rag-btns button"), function(b){ b.setAttribute("aria-pressed","false"); });
        summary();
      });
      summary();
    })();
""".replace("__RAG__", json.dumps(RAG))
