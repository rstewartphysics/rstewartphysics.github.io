"""Section 1 — Digital Signals and Logic States (deck L1; WEB-PLAN section 1).

Analogue vs digital (the deck's two graphs, cut from the L1 PDF), logic 1 and logic 0, digital
inputs and outputs (the deck's symbols), the dimmer photo, Task 1 as a tap quiz. The bank has no
past-paper item for this key area on its own, so there is no exam-ref line or crop here.
"""
from html import escape

from pdfsvg import cut

ID, NAV = "s1", "Digital signals"
SITE = "/assets/engineering-science/national-5/04a-logic-and-digital-control"
L1 = "L1 - Digital Signals and Logic States.pdf"
FIG = (4.9, 1.4, 12.75, 7.1)

TASK1 = [
    ("A switch is being pressed.", "1", "Pressed is on: logic 1.", "Pressed means the switch is on. On is logic 1."),
    ("A switch is not being pressed.", "0", "Not pressed is off: logic 0.", "Not pressed means off. Off is logic 0."),
    ("A guard sensor detects the guard is in place.", "1", "Detected is true: logic 1.", "The sensor detects the guard, so its signal is true: logic 1."),
    ("A buzzer is silent.", "0", "Silent is off: logic 0.", "Silent means the buzzer is off. Off is logic 0."),
    ("A motor is running.", "1", "Running is on: logic 1.", "Running means the motor is on. On is logic 1."),
]


def _task1():
    rows = []
    for i, (sit, ans, right, wrong) in enumerate(TASK1, 1):
        bs = "".join(
            f'<button type="button" class="mcq-opt" data-right="{1 if v == ans else 0}" '
            f'data-fb="{escape("Right. " + right if v == ans else wrong)}">Logic {v}</button>' for v in ("1", "0"))
        rows.append(f'<div class="mcq" data-q="{i}"><p class="qstem">{i}. <b>State</b> the logic state. {escape(sit)}</p>'
                    f'<div class="mcq-opts">{bs}</div><p class="mcq-fb" aria-live="polite"></p></div>')
    return f"""
      <div class="widget" id="s1-states" data-prog-challenge="ch-logic-states">
        <h3>Task: logic 1 or logic 0?</h3>
        <p>Tap the logic state for each situation. Every answer tells you why.</p>
        <span class="page-ref">Booklet Task 1, p.4</span>
        {''.join(rows)}
        <p class="score" id="s1-states-score" aria-live="polite"></p>
      </div>"""


def html():
    analogue = cut(L1, "Analogue Signals", FIG,
                   "An LDR voltage divider and a graph of its output voltage against time: a smooth curve that rises and falls.")
    digital = cut(L1, "Digital Signals", FIG,
                  "A graph of voltage against time for a digital signal: it jumps between 0 V and 5 V, with nothing in between.")
    devices = cut(L1, "Digital Inputs and Outputs", FIG,
                  "Circuit symbols for a switch, LED, buzzer, motor, relay and lamp.")
    return f"""
    <!-- ================= SECTION 1 — L1 Digital Signals and Logic States ================= -->
    <section class="panel sec" id="s1" aria-labelledby="s1-title">
      <span class="concept-tag">Section 1 · Lesson 1</span>
      <h2 id="s1-title">Digital signals and logic states</h2>
      <p class="keypoint">An <strong>analogue</strong> signal can take any value in a range. A <strong>digital</strong> signal has only two values: <strong>logic 1</strong> (high, on, true) and <strong>logic 0</strong> (low, off, false).</p>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>A dimmer and a light switch</h3>
          <p>Both control a lamp. A <b>dimmer</b> can set any brightness: that is analogue. A <b>light switch</b> is on or off: that is digital.</p>
        </div>
        <figure class="dual-fig photo">
          <img src="{SITE}/photos/dimmer-switch.jpg" width="900" height="675" loading="lazy" alt="A dimmer switch with a round knob, mounted on a wall beside a light switch.">
          <figcaption>Photo: Paolomarco, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noopener">CC BY-SA 4.0</a>, via <a href="https://commons.wikimedia.org/wiki/File:Dimmer_Light_Switch.jpg" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption>
        </figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Analogue signals</h3>
          <p>Can take <b>any value</b> in a range. Change <b>smoothly</b>.</p>
          <p>An LDR divider: V<sub>out</sub> <b>rises</b> as it gets darker.</p>
        </div>
        <figure class="dual-fig">{analogue}</figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Digital signals</h3>
          <p>Only <b>two</b> values: ON or OFF, HIGH or LOW, 1 or 0.</p>
          <p>A push switch is digital: pressed or not.</p>
          <ul>
            <li><b>Pressed:</b> near 5 V, <b>logic 1</b> (high, on, true).</li>
            <li><b>Released:</b> near 0 V, <b>logic 0</b> (low, off, false).</li>
          </ul>
        </div>
        <figure class="dual-fig">{digital}</figure>
      </div>

      <div class="dual wide-fig">
        <div class="dual-text">
          <h3>Digital inputs and outputs</h3>
          <p><b>Inputs</b> give 1 or 0: push button, limit switch, guard switch, infrared sensor.</p>
          <p><b>Outputs</b> are on or off: LED, buzzer, motor, relay.</p>
        </div>
        <figure class="dual-fig">{devices}</figure>
      </div>
{_task1()}

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span>
        <p class="stem">1. <b>Describe</b> the difference between an analogue and a digital signal. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">An analogue signal can take any value in a range (1). A digital signal has only two values, 1 or 0 (1).</div></details>
        <p class="stem">2. <b>Explain</b> why a digital signal is not upset by a small amount of noise. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">It has only two levels, far apart (1), <b>so</b> a little noise can't flip a 1 into a 0 (1).</div></details>
      </div>
    </section>"""


JS = r"""
    /* Section 1 task: logic 1 or logic 0 — every option explains itself */
    (function(){
      var w=$("s1-states"); if(!w) return;
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
            $("s1-states-score").textContent=n+" of "+qs.length+" right"+(n===qs.length?". All five: well done.":"");
            if(n===qs.length) award("ch-logic-states", true);
          });
        });
      });
    })();
"""
