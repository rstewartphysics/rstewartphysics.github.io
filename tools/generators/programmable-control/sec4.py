"""Section 4 — Build, Test and Fix (deck L4; WEB-PLAN W6/W7/W8).

Flowchart -> code -> wires -> upload; the booklet's Worked Examples 1-3 re-pinned to the exam
pins (4; 4-6; A0 + 4), each with its code, deck figure and breadboard; Task: match the C line;
Find and Fix; the assignment-shaped test table with the crossing; the "never write code"
Watch Out (spec p.9); downloads (practical sheets, crossing sim file).
"""
from html import escape

from assets import SHEETS, SIM_FILE, WEB
from pdfsvg import cut

ID, NAV = "s4", "Build, test and fix"
L4 = "L4 - Build, Test and Fix.pdf"

WE1 = """void setup() {
  pinMode(4, OUTPUT);
}
void loop() {
  digitalWrite(4, HIGH);
  delay(1000);
  digitalWrite(4, LOW);
  delay(1000);
}"""
WE2 = """void setup() {
  pinMode(4, OUTPUT);   // red
  pinMode(5, OUTPUT);   // amber
  pinMode(6, OUTPUT);   // green
}
void loop() {
  digitalWrite(4, HIGH);
  delay(3000);
  digitalWrite(5, HIGH);
  delay(1000);
  digitalWrite(4, LOW);
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
  delay(3000);
  digitalWrite(6, LOW);
  digitalWrite(5, HIGH);
  delay(1000);
  digitalWrite(5, LOW);
}"""
WE3 = """void setup() {
  pinMode(4, OUTPUT);
  // A0 is an analogue input: no pinMode
}
void loop() {
  int light = analogRead(A0);
  if (light < 300) {
    for (int i = 0; i < 5; i++) {
      digitalWrite(4, HIGH);
      delay(500);
      digitalWrite(4, LOW);
      delay(500);
    }
  }
}"""
DB1 = """void setup() {
}
void loop() {
  digitalWrite(4, HIGH);
  delay(1);
  digitalWrite(4, LOW);
  delay(1000);
}"""
DB2 = """void setup() {
  pinMode(2, INPUT);
  pinMode(7, OUTPUT);
}
void loop() {
  if (digitalRead(2) = HIGH) {
    digitalWrite(7, HIGH);
    delay(2000);
    digitalWrite(7, LOW);
  }"""

JOBS = ["Sets pin 4 as an output", "Switches pin 4 on", "Pauses for 2.5 s", "Reads the light sensor",
        "Repeats the code 5 times"]
MATCH = [("pinMode(4, OUTPUT);", JOBS[0]), ("digitalWrite(4, HIGH);", JOBS[1]),
         ("delay(2500);", JOBS[2]), ("analogRead(A0)", JOBS[3]),
         ("for (int i = 0; i < 5; i++) { … }", JOBS[4])]


def code(text, label):
    return f'<pre class="code" aria-label="{escape(label)}"><code>{escape(text)}</code></pre>'


def board(name, alt):
    return (f'<figure class="board"><img src="{WEB}/figures/{name}.svg" alt="{escape(alt)}" '
            f'loading="lazy"><figcaption>Breadboard, with the Uno\'s pins along the top.</figcaption></figure>')


def _match():
    opts = '<option value="">Choose…</option>' + "".join(
        f'<option value="{escape(j)}">{escape(j)}</option>' for j in JOBS)
    rows = "".join(
        f'<div class="match-row"><code class="match-q">{escape(line)}</code>'
        f'<select data-answer="{escape(ans)}" aria-label="What does {escape(line)} do?">{opts}</select>'
        f'<span class="match-mark" aria-hidden="true"></span></div>' for line, ans in MATCH)
    return f"""
      <div class="widget" data-match data-prog-challenge="ch-code-match" id="s4-match">
        <h3>Task: match the C line</h3>
        <p>Choose what each line of Arduino C does. Then check.</p>
        <div class="match-rows">{rows}</div>
        <div class="match-ctl btnrow">
          <button class="btn" type="button" data-check>Check</button>
          <button class="btn" type="button" data-clear>Reset</button>
        </div>
        <p class="score" data-out aria-live="polite"></p>
      </div>"""


def _downloads():
    sheets = "".join(
        f'<a class="reslink" href="{WEB}/practicals/{dst}" target="_blank" rel="noopener" '
        f'aria-label="{escape(name)}. PDF, 2 pages. Opens in a new tab"><svg class="res-ic" viewBox="0 0 48 48" '
        f'aria-hidden="true" focusable="false"><use href="#ic-paper"/></svg>{escape(name)}</a>'
        for _, dst, name in SHEETS)
    sim = (f'<a class="reslink" href="{WEB}/sim/{SIM_FILE[1]}" download aria-label="The faulty crossing, '
           f'a NoSyntaxSim file. Downloads to your device"><svg class="res-ic" viewBox="0 0 48 48" '
           f'aria-hidden="true" focusable="false"><use href="#ic-flow"/></svg>The faulty crossing (NoSyntaxSim file)</a>')
    return f"""
      <h3>Practical sheets and the sim file</h3>
      <div class="btnrow">{sheets}</div>
      <div class="btnrow">{sim}</div>
      <p>To open the crossing, press <b>Load Flowchart</b> in NoSyntaxSim and choose the file.</p>"""


def html():
    we1w = cut(L4, "Worked Example 1: The Plan and the Wires", (5.1, 1.4, 12.71, 7.1),
               "Wiring: microcontroller pin 4 through a 220 ohm resistor and an LED to 0 V.")
    we2f = cut(L4, "Worked Example 2: Traffic Lights", (0.62, 1.4, 10.02, 7.1),
               "Flowchart in three columns: pin 4 on, pause 3 s, pin 5 on, pause 1 s; pin 4 off, "
               "pin 5 off, pin 6 on, pause 3 s; pin 6 off, pin 5 on, pause 1 s, pin 5 off; back "
               "to pin 4 on.")
    we2w = cut(L4, "Worked Example 2: The Wires", (0.62, 1.4, 12.71, 6.1),
               "Wiring: pins 4, 5 and 6 each through a 220 ohm resistor and an LED (red, amber, "
               "green) to 0 V.")
    we3w = cut(L4, "Worked Example 3: The LDR on A0", (0.5, 1.4, 8.06, 7.1),
               "Wiring: an LDR from 5 V to A0 with 10 kilohm from A0 to 0 V; pin 4 through 220 "
               "ohm and an LED to 0 V.")
    xing = cut(L4, "Why Engineers Test", (6.0, 1.4, 12.71, 7.1),
               "Flowchart of the crossing: pin 4 on; wait for pin 2; pin 4 off, pin 5 on, pin 7 "
               "on; pause 5 s; pin 5 off, pin 7 off; back to pin 4 on.", max_w=380)
    return f"""
    <!-- ================= SECTION 4 — L4 Build, Test and Fix ================= -->
    <section class="panel sec" id="s4" aria-labelledby="s4-title">
      <span class="concept-tag">Section 4 · Lesson 4</span>
      <h2 id="s4-title">Build, test and fix <span class="badge assign">Assignment</span></h2>
      <p class="keypoint">On the Uno, the plan becomes real: <strong>NoSyntaxSim → Duino.app: Verify → Upload → build it</strong>. Then you <strong>test</strong> every job, <strong>fix</strong> what fails, and <strong>test again</strong>. The assignment asks for exactly this.</p>
      <p class="exam-ref"><span class="exam-ref-lab">Pins</span> The exam uses inputs on pins <b>0–3</b> and outputs on <b>4–7</b>. Our Uno uses inputs <b>2–3</b> (pins 0 and 1 carry its USB link) and outputs <b>4–7</b>. The booklet's code uses pins 13, 9–11 and 8.</p>

      {{% include uno-getting-started.html %}}

      <div class="dual">
        <div class="dual-text">
          <h3>Worked example 1: the flashing lamp</h3>
          <p>A warning lamp flashes on and off the whole time the machine is on.</p>
          {code(WE1, "Worked example 1 code")}
          <p><b>setup()</b> runs once: pin 4 is an output. Everything in <b>loop()</b> repeats for ever: that is the continuous loop. <b>delay(1000)</b> holds the lamp for 1000&nbsp;ms, 1&nbsp;s.</p>
        </div>
        <div class="dual-fig">
          <figure>{we1w}<figcaption>Pin 4 → 220&nbsp;Ω → LED → 0&nbsp;V. The LED's long leg goes to the resistor.</figcaption></figure>
          {board("l4_we1", "Breadboard: a yellow lead from Uno pin 4 to a 220 ohm resistor and a red LED; the LED's link and the GND lead go to the minus rail.")}
        </div>
      </div>

      <div class="dual">
        <div class="dual-text">
          <h3>Worked example 2: traffic lights</h3>
          <p>The UK sequence: red; red and amber; green; amber; back to red. Red on 4, amber on 5, green on 6.</p>
          {code(WE2, "Worked example 2 code")}
          <p>Three outputs, so three <b>pinMode</b> lines, and each LED has its own 220&nbsp;Ω. Two outputs <b>HIGH</b> at once give the red and amber stage.</p>
        </div>
        <div class="dual-fig">
          <figure>{we2f}<figcaption>The same sequence as a flowchart, one column per two stages.</figcaption></figure>
          <figure>{we2w}</figure>
          {board("l4_we2", "Breadboard: red, amber and green LEDs on Uno pins 4, 5 and 6, each with a 220 ohm resistor.")}
        </div>
      </div>

      <div class="dual">
        <div class="dual-text">
          <h3>Worked example 3: the darkness alarm</h3>
          <p>When it gets dark, the LED flashes 5 times, then the system keeps watching.</p>
          {code(WE3, "Worked example 3 code")}
          <p><b>analogRead(A0)</b> gives a number from 0 to 1023. In the dark the LDR's resistance goes up, so A0 goes down. <b>if (light &lt; 300)</b> is the branch. <b>for (i = 0; i &lt; 5; i++)</b> is the fixed loop: i counts 0, 1, 2, 3, 4, which is five flashes.</p>
        </div>
        <div class="dual-fig">
          <figure>{we3w}<figcaption>The LDR and 10&nbsp;kΩ make a voltage divider into A0.</figcaption></figure>
          {board("l4_we3", "Breadboard: an LDR from the plus rail to the A0 column, a 10 kilohm resistor to the minus rail, and the LED on pin 4.")}
        </div>
      </div>
{_match()}

      <div class="dual">
        <div class="dual-text">
          <h3>Find and fix</h3>
          <p>Finding faults is called <b>debugging</b>. Change one thing at a time, then test again: change two things and you will not know which one fixed it.</p>
          <ol>
            <li>What should it do?</li><li>What does it do?</li><li>Which line?</li><li>Change one thing.</li><li>Test it again.</li>
          </ol>
          <p class="stem"><b>Debug build 1</b> should flash pin 4, 1&nbsp;s on and 1&nbsp;s off. It has 2 faults.</p>
          {code(DB1, "Debug build 1")}
          <details class="reveal"><summary>The faults</summary><div class="reveal-body">setup() is empty: add <b>pinMode(4, OUTPUT);</b>. <b>delay(1)</b> is 1&nbsp;ms, not 1&nbsp;s: it should be <b>delay(1000);</b>.</div></details>
        </div>
        <div class="dual-fig">
          <p class="stem"><b>Debug build 2</b> should sound the buzzer on pin 7 for 2&nbsp;s when the button on pin 2 is pressed. It has 2 faults.</p>
          {code(DB2, "Debug build 2")}
          <details class="reveal"><summary>The faults</summary><div class="reveal-body"><b>=</b> sets a value; to compare, use <b>==</b>: <b>if (digitalRead(2) == HIGH)</b>. And loop() has no closing <b>}}</b> after the if's own <b>}}</b>.</div></details>
          {board("l4_debug2", "Breadboard: a push button on Uno pin 2 with a 10 kilohm resistor to the minus rail, and a buzzer on pin 7.")}
        </div>
      </div>

      <div class="dual">
        <div class="dual-text">
          <h3>Test, amend, re-test</h3>
          <p>A pedestrian crossing: red until the button is pressed; then green and the beeper for 5&nbsp;s; then back to red. One test for each job:</p>
          <div class="tblwrap"><table class="tbl">
            <thead><tr><th scope="col">Test</th><th scope="col">Should happen</th><th scope="col">Initial result</th><th scope="col">Planned amendment</th><th scope="col">Re-test</th></tr></thead>
            <tbody>
              <tr><td>Press</td><td>red off, green on</td><td>red off, green on</td><td>none</td><td></td></tr>
              <tr><td>Wait 5&nbsp;s</td><td>green off, red on</td><td>green off, red on</td><td>none</td><td></td></tr>
              <tr><td>Beeper</td><td>stops after 5&nbsp;s</td><td>stays on</td><td>add pin 7 off</td><td>stops: pass</td></tr>
            </tbody>
          </table></div>
          <p><b>Say what you saw, by part.</b> "It didn't work" names no part and no result. "The beeper stayed on after 5&nbsp;s" does.</p>
          <p><b>Final version.</b> After the re-test, save it under a new name. The assignment asks for the final version.</p>
          <h3>Model answer</h3>
          <p class="stem"><b>Suggest</b> one improvement to the crossing. <b>Justify</b> it. <span class="marks">2 marks</span></p>
          <div class="ma-line"><span>Improvement: make the beeper pulse on and off,</span><span class="mk">(1)</span></div>
          <div class="ma-line"><span>so blind pedestrians know when it is safe to cross.</span><span class="mk">(1)</span></div>
          <p>"Make it better" scores 0: it names no improvement and gives no reason.</p>
        </div>
        <figure class="dual-fig">{xing}<figcaption>The crossing as planned. The sim file below has a different fault from the table: test every job to find it.</figcaption></figure>
      </div>
      <div class="warn">
        <strong>Watch out: the exam never asks for code.</strong> "Candidates are not asked to write code in response to a programmable control question. However, if developing a flowchart-based program sequence, sufficient and appropriate detail is required, such as input and output pin numbers and a delay unit." (Course specification, p.9.) Arduino C is for the Uno. In the exam, draw the flowchart, with <b>pin 4 on</b> and <b>pause 1&nbsp;s</b>.
      </div>
{_downloads()}
    </section>"""


JS = ""
