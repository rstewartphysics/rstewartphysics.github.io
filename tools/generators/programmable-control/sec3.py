"""Section 3 — Reading Programs (deck L3; WEB-PLAN W6/W7).

Exam program form, line <-> box, counting loops, two tasks (Read the program; Trace it), MI
model answers, the loop-back Watch Out, three ways to write one program, exam-style practice.
Programs and flowcharts are the deck's own (L3 BARRIER, BEEPER, CONVEYOR, TRACE, BUG).
"""
from html import escape

import svgfig as F

ID, NAV = "s3", "Reading programs"


def prog(rows, steps=None, label=None, start=1):
    """An exam-form listing. rows = [(label, instruction)]; steps[i] = data-step of line i."""
    lis = []
    for i, (lab, ins) in enumerate(rows):
        st = f' data-step="{steps[i]}"' if steps and steps[i] else ""
        lis.append(f'<li{st}><span class="lab">{escape(lab)}</span><span>{escape(ins)}</span></li>')
    aria = f' aria-label="{escape(label)}"' if label else ""
    s = f' start="{start}" style="--start:{start}"' if start != 1 else ""
    return f'<ol class="prog"{aria}{s}>' + "".join(lis) + "</ol>"


BARRIER = [("main:", "if input1 is off then main"), ("", "switch on 6"), ("", "pause 4000"),
           ("", "switch off 6"), ("", "goto main")]
BEEPER = [("main:", "let count = 0"), ("label_1:", "switch on 5"), ("", "pause 200"),
          ("", "switch off 5"), ("", "pause 200"), ("", "let count = count + 1"),
          ("", "if count = 4 then label_2"), ("", "goto label_1"), ("label_2:", "end")]
CONVEYOR = [("main:", "if input2 is off then main"), ("", "let count = 0"),
            ("label_1:", "switch on 7"), ("", "pause 1500"), ("", "switch off 7"),
            ("", "let count = count + 1"), ("", "if count = 8 then label_2"),
            ("", "goto label_1"), ("label_2:", "pause 2500"), ("", "goto main")]
TRACE = [("main:", "let count = 0"), ("label_1:", "switch on 4"), ("", "let count = count + 1"),
         ("", "switch off 4"), ("", "if count = 3 then label_2"), ("", "goto label_1"),
         ("label_2:", "end")]
BUG = [("main:", "let count = 0"), ("label_1:", "switch on 7"), ("", "pause 300"),
       ("", "switch off 7"), ("", "pause 300"), ("", "let count = count + 1"),
       ("", "if count = 10 then label_2"), ("", "goto main"), ("label_2:", "switch on 5"),
       ("", "end")]
WASH = [("main:", "if input2 is off then main"), ("", "let count = 0"),
        ("label_1:", "switch on 6"), ("", "pause 3000"), ("", "switch off 6"),
        ("", "let count = count + 1"), ("", "if count = 4 then main"), ("", "goto label_1")]

# Read the program: (question, [(option, right?, feedback)])
READ_QS = [
    ("Which line has a time delay?", [
        ("Line 2", False, "Line 2 sets the count to 0. A delay line starts with pause."),
        ("Line 4", True, "Right. pause 1500 waits 1.5 s. Line 9 is a delay too."),
        ("Line 6", False, "Line 6 adds 1 to the count. Look for a line that starts with pause."),
        ("Line 7", False, "Line 7 is a decision: it checks the count. A delay starts with pause."),
    ]),
    ("How many times does pin 7 turn on?", [
        ("7", False, "The count goes up before it is checked: 1, 2, 3 … It stops when it reaches 8."),
        ("8", True, "Right. Line 6 adds 1 each time. When the count reaches 8, line 7 jumps out."),
        ("9", False, "Line 7 checks straight after line 6 adds 1. At 8 it jumps to label_2, so there is no ninth time."),
        ("For ever", False, "Line 7 jumps out to label_2 when the count reaches 8, so it stops."),
    ]),
    ("Lines 3 to 8 make which type of loop?", [
        ("A fixed loop", True, "Right. It repeats a set number of times (8), then moves on."),
        ("A continuous loop", False, "A continuous loop repeats for ever. This one stops when the count reaches 8."),
        ("Not a loop", False, "Line 8 jumps back up to line 3. Jumping back up is what makes a loop."),
        ("A time delay", False, "A time delay is one pause line. Lines 3 to 8 repeat: that is a loop."),
    ]),
    ("What does line 5 do?", [
        ("Switches pin 7 on", False, "That is line 3. Line 5 says switch off 7."),
        ("Switches pin 7 off", True, "Right. switch off 7 turns the output on pin 7 off."),
        ("Waits 5 seconds", False, "Waiting is a pause line. Line 5 switches an output."),
        ("Jumps to line 7", False, "Jumping is a goto line. Line 5 switches an output."),
    ]),
    ("How long is the delay on line 9?", [
        ("0.25 s", False, "pause counts in milliseconds. 1000 ms is 1 s, so 2500 ms is more than 1 s."),
        ("2.5 s", True, "Right. pause is in milliseconds: 2500 ms = 2.5 s."),
        ("25 s", False, "Divide by 1000, not by 100: 2500 ms = 2.5 s."),
        ("2500 s", False, "pause counts in milliseconds, not seconds: 2500 ms = 2.5 s."),
    ]),
]

# Trace it: pass -> (count after line 3, is count = 3?, line it goes to after line 5)
TRACE_ROWS = [("1", "1", "no", "2"), ("2", "2", "no", "2"), ("3", "3", "yes", "7")]


def _select(answer, options, label):
    opts = '<option value="">Choose…</option>' + "".join(
        f'<option value="{o}">{o}</option>' for o in options)
    return (f'<select data-answer="{answer}" aria-label="{escape(label)}">{opts}</select>'
            f'<span class="match-mark" aria-hidden="true"></span>')


def _read_task():
    qs = []
    for qi, (q, opts) in enumerate(READ_QS, 1):
        bs = "".join(
            f'<button type="button" class="mcq-opt" data-right="{1 if ok else 0}" '
            f'data-fb="{escape(fb)}">{escape(o)}</button>' for o, ok, fb in opts)
        qs.append(f'<div class="mcq" data-q="{qi}"><p class="qstem">{qi}. {escape(q)}</p>'
                  f'<div class="mcq-opts">{bs}</div><p class="mcq-fb" aria-live="polite"></p></div>')
    return f"""
      <div class="widget" id="s3-read" data-prog-challenge="ch-read-program">
        <h3>Task: read the program</h3>
        <p>A conveyor counts boxes. Read the program, then tap an answer to each question. Every answer tells you why.</p>
        <div class="dual">
          <div class="dual-text">{prog(CONVEYOR, label="Conveyor program")}</div>
          <div class="dual-fig">{''.join(qs)}
            <p class="score" id="s3-read-score" aria-live="polite"></p>
          </div>
        </div>
      </div>"""


def _trace_task():
    rows = []
    for run, count, eq, nxt in TRACE_ROWS:
        rows.append(f"<tr><th scope=\"row\">{run}</th>"
                    f"<td>{_select(count, ['0', '1', '2', '3', '4'], f'Pass {run}: count')}</td>"
                    f"<td>{_select(eq, ['yes', 'no'], f'Pass {run}: is count = 3?')}</td>"
                    f"<td>{_select(nxt, ['2', '6', '7'], f'Pass {run}: goes to line')}</td></tr>")
    return f"""
      <div class="widget" data-match data-prog-challenge="ch-trace" id="s3-trace">
        <h3>Task: trace it, pass by pass</h3>
        <p>Pin 4 should flash 3 times. Work through the program one pass at a time. Fill in the table, then check it. Then press <strong>Run it</strong> to watch each line.</p>
        <div class="dual">
          <div class="dual-text">
            {prog(TRACE, label="Program to trace")}
            <div class="step-ctl">
              <button class="btn" type="button" id="s3-run">Run it</button>
              <button class="btn" type="button" id="s3-run-reset">Start again</button>
            </div>
            <p class="step-say" id="s3-run-say" aria-live="polite"></p>
          </div>
          <div class="dual-fig">
            <div class="tblwrap"><table class="tbl trace">
              <thead><tr><th scope="col">Pass</th><th scope="col">count</th><th scope="col">count = 3?</th><th scope="col">Goes to line</th></tr></thead>
              <tbody>{''.join(rows)}</tbody>
            </table></div>
            <div class="match-ctl btnrow">
              <button class="btn" type="button" data-check>Check</button>
              <button class="btn" type="button" data-clear>Reset</button>
            </div>
            <p class="score" data-out aria-live="polite"></p>
          </div>
        </div>
      </div>"""


def html():
    return f"""
    <!-- ================= SECTION 3 — L3 Reading Programs ================= -->
    <section class="panel sec" id="s3" aria-labelledby="s3-title">
      <span class="concept-tag">Section 3 · Lesson 3</span>
      <h2 id="s3-title">Reading programs <span class="badge exam">Exam</span></h2>
      <p class="keypoint">The exam prints a program as <strong>numbered lines</strong>. Each line is one box of a flowchart. You will be asked to <strong>read</strong> it: find a line, count the loops, say what a line does. You are never asked to write code.</p>
      <p class="exam-ref"><span class="exam-ref-lab">In the exam</span> Reading a program: 3 of the last 6 papers. <b>2022 Q9(b)(c)</b> · <b>2023 Q9(c)</b> · <b>2025 Q2</b></p>

      <div class="dual wide-fig s3-link" data-link="barrier">
        <div class="dual-text">
          <h3>The words the exam uses</h3>
          <div class="tblwrap"><table class="tbl">
            <thead><tr><th scope="col">In the program</th><th scope="col">It means</th></tr></thead>
            <tbody>
              <tr><td><b>switch on 6</b></td><td>pin 6 on</td></tr>
              <tr><td><b>pause 4000</b></td><td>wait 4000&nbsp;ms = 4&nbsp;s</td></tr>
              <tr><td><b>main:</b> &nbsp;<b>label_1:</b></td><td>a name for a line</td></tr>
              <tr><td><b>goto main</b></td><td>jump to that line</td></tr>
              <tr><td><b>if … then main</b></td><td>a decision</td></tr>
              <tr><td><b>let count = …</b></td><td>a counter</td></tr>
            </tbody>
          </table></div>
          <p><strong>pause is in milliseconds.</strong> 1000&nbsp;ms is 1&nbsp;s. The flowchart writes the same step as <b>pause 4&nbsp;s</b>.</p>
        </div>
        <figure class="dual-fig">
          <div class="fig-pair">
            {prog(BARRIER, steps=[1, 2, 3, 4, 5], label="Barrier program")}
            {F.barrier()}
          </div>
          <div class="step-ctl"><button class="btn" type="button" data-step-next>Show me, line by line</button></div>
          <figcaption class="step-say" aria-live="polite">A car-park barrier light. Each line is one box.</figcaption>
        </figure>
      </div>

      <div class="dual wide-fig s3-link" data-link="beeper">
        <div class="dual-text">
          <h3>Counting: the fixed loop</h3>
          <p>The flowchart's <b>x4?</b> becomes three lines:</p>
          <ul>
            <li><b>line 1</b> sets the count to 0,</li>
            <li><b>line 6</b> adds 1 each time round,</li>
            <li><b>line 7</b> checks it.</li>
          </ul>
          <p><b>Line 8</b> jumps back to <b>label_1</b>, which is <em>below</em> line 1. So the count is not reset, and the buzzer beeps 4 times.</p>
        </div>
        <figure class="dual-fig">
          <div class="fig-pair">
            {prog(BEEPER, steps=[3, 2, 2, 2, 2, 3, 3, 3, 4], label="Beeper program")}
            {F.beeper()}
          </div>
          <div class="step-ctl"><button class="btn" type="button" data-step-next>Show me, part by part</button></div>
          <figcaption class="step-say" aria-live="polite">A buzzer on pin 5 beeps 4 times.</figcaption>
        </figure>
      </div>
{_read_task()}
{_trace_task()}

      <h3>Model answers</h3>
      <div class="dual">
        <div class="dual-text">
          <p class="stem"><b>Describe</b> the function of line 5 in the barrier program. <span class="marks">1 mark</span></p>
          <div class="ma-line"><span>It sends the program back to line 1, so it repeats for ever.</span><span class="mk">(1)</span></div>
          <p><b>Scores 0:</b> "It goes to main." Say what that <em>does</em>.</p>
          <p class="hint">Marking instructions, 2022 Q9(b).</p>
        </div>
        <div class="dual-fig">{prog(BARRIER, label="Barrier program")}</div>
      </div>
      <div class="dual">
        <div class="dual-text">
          <p class="stem"><b>Explain</b> why lines 2 to 7 do not run 10 times. <span class="marks">2 marks</span></p>
          <div class="ma-line"><span><b>Cause:</b> line 8 goes back to line 1, <b>let count = 0</b>,</span><span class="mk">(1)</span></div>
          <div class="ma-line"><span><b>Effect:</b> so the count resets and never reaches 10.</span><span class="mk">(1)</span></div>
          <p>The word <b>so</b> joins the cause to its effect.</p>
          <p class="hint">Marking instructions, 2022 Q9(c).</p>
        </div>
        <div class="dual-fig">{prog(BUG, label="Program with a loop that never ends")}</div>
      </div>
      <div class="warn">
        <strong>Watch out: loop back below the count.</strong> A <b>goto</b> that jumps above <b>let count = 0</b> resets the count every time round, so a fixed loop never ends. Jump to the label just below it: <b>goto label_1</b>, not <b>goto main</b>.
      </div>

      <div class="dual">
        <div class="dual-text">
          <h3>Your turn: program to flowchart</h3>
          <p>Draw the flowchart for this program on paper. Check every pin, every unit and every arrow. Then open the answer.</p>
          {prog([("main:", "if input3 is off then main"), ("", "switch on 5"), ("", "switch on 4"),
                 ("", "pause 2000"), ("", "switch off 5"), ("", "pause 1000"), ("", "switch off 4"),
                 ("", "goto main")], label="Program to draw")}
        </div>
        <div class="dual-fig">
          <details class="reveal"><summary>Answer</summary><div class="reveal-body">{F.your_turn()}</div></details>
        </div>
      </div>

      <h3>Three ways to write one program</h3>
      <p>The same buzzer program, written the exam's way, the booklet's way and in Arduino C. Watch the times: the exam's <b>pause 500</b> and Arduino's <b>delay(500)</b> are milliseconds. The booklet says <b>0.5 seconds</b>.</p>
      <div class="code3">
        <div><h4>The exam</h4><pre>main:
switch on 5
pause 500
switch off 5
pause 1000
goto main</pre></div>
        <div><h4>The booklet</h4><pre>loop
high buzzer
pause 0.5 seconds
low buzzer
pause 1 second
end loop</pre></div>
        <div><h4>Arduino C</h4><pre>void loop() {{
  digitalWrite(5, HIGH);
  delay(500);
  digitalWrite(5, LOW);
  delay(1000);
}}</pre></div>
      </div>

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span> <span class="page-ref">Booklet p.14</span>
        <p>A car wash brush is controlled by this program.</p>
        {prog(WASH, label="Car wash program")}
        <p class="stem">1. <b>State</b> the line number that contains a time delay. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Line 4.</div></details>
        <p class="stem">2. <b>State</b> how many times pin 6 switches on each time input 2 comes on. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">4 times.</div></details>
        <p class="stem">3. <b>State</b> the type of loop in lines 3 to 8. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">A fixed (finite) loop.</div></details>
        <p class="stem">4. Line 8 is changed to <b>goto main</b>. <b>Explain</b> what happens to the brush. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body"><strong>Cause:</strong> the program goes back to line 1 and line 2 sets the count to 0 again (1), <strong>effect:</strong> so the count never reaches 4 (1). The brush switches on once each time round, and keeps going while input 2 is on.</div></details>
      </div>
    </section>"""


JS = r"""
    /* Section 3: light a program line with its flowchart box, one step per press */
    [].forEach.call(document.querySelectorAll(".s3-link"), function(block){
      var btn=block.querySelector("[data-step-next]"), say=block.querySelector(".step-say");
      if(!btn) return;
      var lis=[].slice.call(block.querySelectorAll("ol.prog li[data-step]"));
      var steps=[]; lis.forEach(function(li){ var k=+li.dataset.step; if(steps.indexOf(k)<0) steps.push(k); });
      steps.sort(function(a,b){ return a-b; });
      var at=-1, first=say.textContent;
      btn.addEventListener("click", function(){
        at=(at+1)%(steps.length+1);
        [].forEach.call(block.querySelectorAll(".on"), function(e){ e.classList.remove("on"); });
        if(at===steps.length){ say.textContent=first; btn.textContent=btn.textContent.replace("Start again","Show me"); return; }
        var k=steps[at], words=[];
        [].forEach.call(block.querySelectorAll('[data-step="'+k+'"]'), function(e){ e.classList.add("on"); });
        lis.forEach(function(li, i){ if(+li.dataset.step===k) words.push("line "+(i+1)+": "+li.textContent.replace(/\s+/g," ").trim()); });
        say.textContent="Step "+(at+1)+" of "+steps.length+". "+words.join("; ")+".";
      });
    });

    /* Section 3 task: read the program — every option explains itself */
    (function(){
      var w=$("s3-read"); if(!w) return;
      var qs=[].slice.call(w.querySelectorAll(".mcq")), got={};
      function score(){
        var n=Object.keys(got).length;
        $("s3-read-score").textContent=n+" of "+qs.length+" right"+(n===qs.length?". All five: well done.":"");
        if(n===qs.length) award("ch-read-program", true);
      }
      qs.forEach(function(q){
        var fb=q.querySelector(".mcq-fb");
        [].forEach.call(q.querySelectorAll(".mcq-opt"), function(b){
          b.addEventListener("click", function(){
            [].forEach.call(q.querySelectorAll(".mcq-opt"), function(x){ x.classList.remove("right","wrong"); });
            var ok=b.dataset.right==="1";
            b.classList.add(ok?"right":"wrong");
            fb.textContent=b.dataset.fb;
            if(ok){ got[q.dataset.q]=1; score(); } else if(window.Progress){ window.Progress.miss(); }
          });
        });
      });
    })();

    /* Section 3 task: run the trace program line by line */
    (function(){
      var w=$("s3-trace"); if(!w) return;
      var lis=[].slice.call(w.querySelectorAll("ol.prog li")), say=$("s3-run-say");
      var RUN=[], count=0, lamp=false, i, pass;
      RUN.push([1,0,false,"count set to 0"]);
      for(pass=1; pass<=3; pass++){
        RUN.push([2,count,true,"pin 4 on"]);
        count++; RUN.push([3,count,true,"count goes up to "+count]);
        RUN.push([4,count,false,"pin 4 off"]);
        RUN.push([5,count,false,"is count = 3? "+(count===3?"yes: go to line 7":"no")]);
        if(count<3) RUN.push([6,count,false,"goto label_1: back to line 2"]);
      }
      RUN.push([7,count,false,"end. Pin 4 flashed 3 times"]);
      var at=-1;
      function show(){
        lis.forEach(function(li){ li.classList.remove("on"); });
        if(at<0){ say.textContent=""; return; }
        var s=RUN[at]; lis[s[0]-1].classList.add("on");
        say.innerHTML='<span class="lamp-dot'+(s[2]?' lit':'')+'" aria-hidden="true"></span>Line '+s[0]+": "+s[3]+". count = "+s[1]+", pin 4 "+(s[2]?"on":"off")+".";
      }
      $("s3-run").addEventListener("click", function(){ if(at<RUN.length-1){ at++; show(); } });
      $("s3-run-reset").addEventListener("click", function(){ at=-1; show(); });
    })();
"""
