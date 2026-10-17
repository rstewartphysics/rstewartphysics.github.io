"""Closing blocks: #answers (Booklet 4b keys, from work/ans_b4b.md, teacher-approved 9 Oct),
#check (mixed quiz, every option with feedback — DECK-RULES 42; RAG self-check of the booklet's
success criteria, device-only), #recap (what loses marks), glossary with pictures (D17), and
"where this comes up next"."""
from html import escape
import json

import svgfig as F

ID, NAV = "answers", "Answers"
NAVS = [("answers", "Answers"), ("check", "Check yourself"), ("recap", "Recap")]

ANSWERS = [
    ("Task 1 — Microcontrollers in use (page 3)", """<div class="tblwrap"><table class="tbl"><thead><tr><th scope="col">Product</th><th scope="col">Why a microcontroller suits it (any valid reason)</th></tr></thead><tbody>
<tr><td>Microwave oven</td><td>Runs a timed sequence; reads the door switch and buttons; switches the heater, motor and lamp from one chip.</td></tr>
<tr><td>Traffic lights</td><td>A repeating timed sequence; the timings change by editing the program, not rewiring.</td></tr>
<tr><td>Robot arm in a factory</td><td>Controls several motors in order from sensor inputs; reprogrammed for a new task.</td></tr>
<tr><td>Smart heating thermostat</td><td>Reads a temperature sensor, decides, follows a time schedule; settings change in the program.</td></tr>
</tbody></table></div>"""),
    ("Practice — Programming structures (page 7)", """<ol>
<li>A continuous loop repeats for ever, until the power is removed.</li>
<li>A fixed loop repeats a set number of times, then the program carries on.</li>
<li>A time delay pauses the program for a set time; the outputs stay as they are.</li>
<li>A branch makes a yes or no decision, so the program follows one of two paths.</li>
<li>A fixed loop (6 repeats).</li>
<li>A continuous loop, with a branch inside it to test the sensor.</li></ol>"""),
    ("Practice — Flowcharts (pages 9 to 13)", """<ol>
<li>The missing process box: <b>Wait 4 s (4000 ms)</b>.</li>
<li><b>Wait 5 s (5000 ms)</b>; <b>Wait 2 s (2000 ms)</b>; <b>Buzzer (output, pin 8) OFF</b>.</li>
<li><b>LED (output, pin 13) ON</b>; <b>Wait 1 s</b>; <b>LED (output, pin 13) OFF</b>; <b>Wait 1 s</b>. The question gives no pin: any pin scores, the same one on and off.</li>
<li>The decision <b>Pressed?</b> (No loops back); <b>Buzzer (output, pin 8) ON for 2 s (2000 ms)</b>; <b>Buzzer (output, pin 8) OFF</b>.</li>
<li><b>count = 0</b>; <b>LED ON</b>; <b>Wait 0.5 s</b>; <b>LED OFF</b>; <b>Wait 0.5 s</b>; <b>count = count + 1</b>; the decision <b>count &lt; 5?</b> (Yes loops back, No goes to Stop).</li></ol>"""),
    ("Worked examples — Try changing this (pages 15 to 19)", """<p><b>Worked example 1.</b> (1) Both delays 200: it flashes faster: 0.4&nbsp;s a flash, so 2.5 times a second. (2) 100 on, 900 off: a short blink once a second. (3) The board only drives the pin named in the code, so pinMode, digitalWrite and the wire must all use the same pin.</p>
<p><b>Worked example 2.</b> (1) Change the delay after green comes on: delay(3000) becomes delay(6000). (2) Yes, it still runs: // starts a comment, which the board ignores. (3) Nothing goes wrong: setup() still makes all three pins outputs. Swap the pins in the digitalWrite lines instead and the colours change places.</p>
<p><b>Worked example 3.</b> (1) 300 to 600: it triggers more easily; it counts as dark at a brighter light level. (2) i &lt; 10: the LED flashes 10 times. (3) &lt; swapped for &gt;: the alarm goes off in the light, not the dark.</p>"""),
    ("Find and fix (pages 20 and 21)", """<p><b>Debug build 1.</b> setup() has no <b>pinMode(13, OUTPUT);</b>. <b>delay(1)</b> should be <b>delay(1000)</b>.</p>
<p><b>Debug build 2.</b> <b>digitalRead(2) = HIGH</b> should be <b>== HIGH</b>. loop() is missing its closing <b>}</b>.</p>"""),
    ("Practice — Programming in real life (pages 22 and 23)", """<ol>
<li>setup() runs once when the board starts; it sets which pins are inputs and outputs.</li>
<li>loop() runs over and over, for ever, after setup(); it holds the main control program.</li>
<li><b>digitalWrite(13, HIGH);</b></li>
<li><b>pinMode(4, INPUT);</b></li>
<li>2.5 s (2500 ms).</li>
<li>(4 marks) <b>for count = 1 to 4</b> / <b>high LED</b> / <b>pause 0.5 seconds</b> / <b>low LED</b> / <b>pause 0.5 seconds</b> / <b>next count</b> / <b>end</b>. Repeats 4 times (1); LED on (1); LED off (1); both pauses 0.5 s with a unit, then end (1).</li>
<li>(4 marks) setup(): <b>pinMode(2, INPUT); pinMode(8, OUTPUT);</b> loop(): <b>if (digitalRead(2) == HIGH) { digitalWrite(8, HIGH); delay(3000); digitalWrite(8, LOW); }</b>. Both pinMode lines (1); inside loop() so it repeats (1); if with digitalRead(2) (1); buzzer on, delay(3000), buzzer off (1).</li>
<li>(4 marks) The question gives no pin: use any pin, the same in all three lines. setup(): <b>pinMode(13, OUTPUT);</b> loop(): <b>digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);</b> pinMode in setup (1); code inside loop() (1); HIGH then LOW (1); both delays 1000 (1).</li></ol>"""),
]

QUIZ = [
    ("A microcontroller is…", [
        ("a small, programmable chip that controls a system", True, "Right. It runs a program, reads inputs and switches outputs."),
        ("a sensor that detects light", False, "A sensor is an input. The microcontroller reads the sensor and decides."),
        ("a switch that turns a motor on", False, "A switch is an input. The microcontroller switches the outputs, through a transistor for a motor."),
        ("a wire that carries the program", False, "The program is stored in the chip's memory, not in a wire."),
    ]),
    ("Which advantage scores a mark?", [
        ("It is easier to change.", False, "On its own this scores 0. Say how: reprogrammed, with no rewiring."),
        ("It can be reprogrammed, with no rewiring.", True, "Right. It says how the change is made."),
        ("It is programmable.", False, "That just restates what it is. Say what being programmable lets you do."),
        ("It is cheaper.", False, "On its own this scores 0. Say why: fewer components, so it costs less."),
    ]),
    ("On a flowchart, a diamond is…", [
        ("a decision", True, "Right. It asks a yes or no question; label the paths Y and N."),
        ("a process", False, "A process, such as a delay, is a rectangle."),
        ("an input or output", False, "An input or output is a parallelogram."),
        ("a terminator", False, "Start and end are rounded terminators."),
    ]),
    ("Which delay box scores the mark?", [
        ("pause 4", False, "No unit: the mark is lost. Write pause 4 s."),
        ("pause 4 s", True, "Right. Every delay needs its unit."),
        ("wait", False, "No time and no unit. Write pause 4 s."),
        ("delay(4000);", False, "That is Arduino C. The exam wants the flowchart's words, pause 4 s."),
    ]),
    ("A fixed loop…", [
        ("repeats a set number of times, then moves on", True, "Right. On a flowchart it is a decision such as x3?."),
        ("repeats for ever", False, "That is a continuous loop. A fixed loop stops after a set number."),
        ("waits for an input", False, "Waiting for an input is a decision that loops back to itself."),
        ("stops the program", False, "An end box stops the program. A fixed loop repeats, then moves on."),
    ]),
    ("In the exam's program, pause 750 waits…", [
        ("0.75 s", True, "Right. pause is in milliseconds: 750 ms = 0.75 s."),
        ("750 s", False, "pause counts in milliseconds, not seconds. Divide by 1000."),
        ("7.5 s", False, "Divide by 1000, not 100: 750 ms = 0.75 s."),
        ("75 s", False, "pause counts in milliseconds. 750 ms is less than one second."),
    ]),
    ("A goto jumps above let count = 0. What happens?", [
        ("The count resets each time, so the loop never ends.", True, "Right. Jump to the label just below the reset instead."),
        ("The count goes up twice as fast.", False, "Jumping above the reset sets the count back to 0, not up."),
        ("The program stops.", False, "Nothing stops it. It keeps going round, because the count never reaches its limit."),
        ("Nothing changes.", False, "Line 1, let count = 0, runs again every time round, so the count resets."),
    ]),
    ("In the exam, answer a programmable control question with…", [
        ("a flowchart or pseudocode", True, "Right. The course specification says you are never asked to write code."),
        ("Arduino C", False, "Arduino C is for building on the Uno. The exam wants a flowchart or pseudocode."),
        ("a circuit diagram", False, "A circuit shows the wiring. The program is a flowchart or pseudocode."),
        ("a truth table", False, "Truth tables are for logic (Booklet 4a). A program is a flowchart."),
    ]),
    ("Why does a motor need a transistor?", [
        ("A pin gives only a small current; the motor needs more.", True, "Right. The transistor switches the larger current."),
        ("The transistor makes the motor faster.", False, "It switches the motor on and off. It does not change its speed."),
        ("It is the motor's driver.", False, "\"Driver\" on its own scores 0. Say why: a pin gives only a small current."),
        ("It protects the pin from light.", False, "Light has nothing to do with it. A pin cannot give the motor's current."),
    ]),
    ("Which test-table entry is best?", [
        ("The beeper stayed on after 5 s.", True, "Right. It names the part and what it did."),
        ("It didn't work.", False, "This names no part and no result. Say what you saw."),
        ("Fixed it.", False, "Say what you changed, and then re-test it."),
        ("Works now.", False, "Say which test you re-ran and what happened."),
    ]),
]

RAG = [
    ("1 Microcontrollers", ["I can describe what a microcontroller is.",
                             "I can give commercial and industrial examples of microcontroller use.",
                             "I can describe advantages and disadvantages of programmable control compared to hard-wired control."]),
    ("2 Flowchart symbols", ["I can identify start, stop, input, output, branch and loop symbols.",
                              "I can complete a flowchart for a simple control problem."]),
    ("3 Programming structures", ["I can describe a continuous loop.",
                                   "I can describe a fixed loop and use it in a flowchart.",
                                   "I can describe and use a time delay.",
                                   "I can use an if/then branch in a flowchart."]),
    ("4 Programming in real life", ["I can describe the role of setup() and loop().",
                                     "I can write pseudocode using high, low, pause, if/then, for…next and end.",
                                     "I can write Arduino C using pinMode(), digitalWrite(), digitalRead() and delay().",
                                     "I can use an if branch and a for (fixed) loop in Arduino C.",
                                     "I can read a sensor with analogRead() and act on its value.",
                                     "I can convert between a flowchart, pseudocode and Arduino C, and build it on real hardware.",
                                     "I can find and fix common mistakes in a program."]),
]

GLOSSARY = [  # term, meaning, picture: ("sym", kind) | ("ic", sprite id)
    ("Microcontroller", "A small, programmable chip that controls a system.", ("ic", "ic-mcu")),
    ("Input / output", "A box that reads an input or switches an output. Give the pin.", ("sym", "io")),
    ("Process", "A box for an operation, such as a delay. Give the unit.", ("sym", "process")),
    ("Decision", "A yes or no question. Its paths are labelled Y and N.", ("sym", "decision")),
    ("Terminator", "Start or end of a program.", ("sym", "start")),
    ("Sub-procedure", "Runs a separate section of program, then comes back.", ("sym", "sub")),
    ("Continuous loop", "Repeats for ever: a line back up, with an arrow.", ("sym", "line")),
    ("Fixed loop", "Repeats a set number of times: a decision such as x3?.", ("sym", "decision")),
    ("Label", "A name for a line, such as main: or label_1:, so goto can jump there.", ("ic", "ic-flow")),
    ("Arduino C", "The code the Uno runs: setup() once, then loop() for ever.", ("ic", "ic-slides")),
    ("Transistor driver", "Lets a pin's small current switch a motor's large current.", ("ic", "ic-resistor")),
    ("Debugging", "Finding and fixing faults: change one thing, then test again.", ("ic", "ic-challenge")),
]


def _quiz():
    out = []
    for qi, (q, opts) in enumerate(QUIZ, 1):
        bs = "".join(f'<button type="button" class="mcq-opt" data-right="{1 if ok else 0}" '
                     f'data-fb="{escape(fb)}">{escape(o)}</button>' for o, ok, fb in opts)
        out.append(f'<div class="mcq" data-q="{qi}"><p class="qstem">{qi}. {escape(q)}</p>'
                   f'<div class="mcq-opts">{bs}</div><p class="mcq-fb" aria-live="polite"></p></div>')
    return "".join(out)


def _gloss():
    items = []
    for term, meaning, (kind, ref) in GLOSSARY:
        pic = (F.symbol(ref, term) if kind == "sym" else
               f'<svg class="gl-ic" viewBox="0 0 48 48" role="img" aria-label="{escape(term)}"><use href="#{ref}"/></svg>')
        items.append(f'<div class="gl-item"><div class="gl-pic">{pic}</div><dt>{escape(term)}</dt>'
                     f'<dd>{escape(meaning)}</dd></div>')
    return '<dl class="gloss">' + "".join(items) + "</dl>"


def html():
    keys = "".join(f'<details class="reveal"><summary>{escape(t)}</summary><div class="reveal-body">{b}</div></details>'
                   for t, b in ANSWERS)
    return f"""
    <!-- ================= ANSWERS ================= -->
    <section class="panel sec" id="answers" aria-labelledby="answers-title">
      <span class="concept-tag">Booklet check</span>
      <h2 id="answers-title">Check your booklet work</h2>
      <p>Answers to Booklet 4b. Try each one first, then open it. The booklet's own pins (13, 8) are kept here, because the questions use them.</p>
      {keys}
    </section>

    <!-- ================= CHECK YOURSELF ================= -->
    <section class="panel sec" id="check" aria-labelledby="check-title">
      <span class="concept-tag">Check yourself</span>
      <h2 id="check-title">Check yourself</h2>
      <div class="widget" id="check-quiz" data-prog-challenge="ch-4b-quiz">
        <h3>Mixed quiz</h3>
        <p>Tap an answer. Every answer tells you why.</p>
        {_quiz()}
        <p class="score" id="check-quiz-score" aria-live="polite"></p>
      </div>
      <h3>Rate your confidence: the booklet's success criteria</h3>
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
          <li>"Easier to change", "cheaper", "programmable" or "fewer components" on their own.</li>
          <li>An output box with no pin: write <b>pin 4 on</b>, not "lamp on".</li>
          <li>A delay with no unit: write <b>pause 4 s</b>.</li>
          <li>A loop back with no arrow, or a decision with no Y and N.</li>
          <li>"Goes to main" on its own: say what that does.</li>
          <li>An explain answer with a cause but no effect: join them with <b>so</b>.</li>
          <li>Answering a programmable control question in Arduino C.</li>
          <li>"Driver" on its own: say it is a transistor, and why.</li>
        </ul>
      </div>
      <h3>Glossary</h3>
      {_gloss()}
      <h3>Where this comes up next</h3>
      <div class="resource-grid">
        <a class="resource-card" href="/classes/n5-engineering/logic-and-programmable-control.html"><span class="resource-title">Logic &amp; Digital Control →</span><span class="resource-meta">Booklet 4a: gates and truth tables</span></a>
        <a class="resource-card" href="/classes/n5-engineering/pneumatics.html"><span class="resource-title">Pneumatics →</span><span class="resource-meta">Sequences and control with air</span></a>
        <a class="resource-card" href="/classes/n5-engineering-assignment-prep.html"><span class="resource-title">Assignment preparation →</span><span class="resource-meta">Task 2: simulate, test and amend</span></a>
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
            if(n===qs.length){ award("ch-4b-quiz", true); var best=Math.max(load("quizbest",0), n); save("quizbest", best); }
          });
        });
      });
    })();

    /* RAG self-check: the booklet's success criteria, saved on this device only */
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
