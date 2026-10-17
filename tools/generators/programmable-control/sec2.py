"""Section 2 — Flowcharts (deck L2; WEB-PLAN W6/W7).

The six data-booklet symbols (each drawn), lines and arrows, what goes in each box, the four
structures with a flowchart each, how the marks are given, the method and a worked example,
Task: order the flowchart, NoSyntaxSim and Yenka, and the car-wash Your Turn. 2025 Q9(a) and
2026 Q12(a) are held for the topic test and are not referenced.
"""
from html import escape

import svgfig as F
from assets import WEB
from pdfsvg import cut

ID, NAV = "s2", "Flowcharts"
L2 = "L2 - Flowcharts.pdf"

SYMBOLS = [("start", "Terminator", "Start or end of a program or sub-procedure."),
           ("line", "Line", "The direction of flow. Arrows are needed going up or left."),
           ("io", "Input / output", "Switches an output, or reads an input. Give the pin."),
           ("process", "Process", "An operation, for example a delay. Give the unit."),
           ("decision", "Decision", "A yes or no question. Label the paths Y and N."),
           ("sub", "Sub-procedure", "Runs a separate section of program, then comes back.")]

STRUCTURES = [
    ("Continuous loop", "Continuous Loop", "Repeats for ever, until the power goes off. Drawn as a line back up, with an arrow.",
     "Flowchart: start; pin 5 on, pause 2 s, pin 5 off, pause 2 s; a line back up to pin 5 on."),
    ("Fixed loop", "Fixed Loop", "Repeats a set number of times, then moves on. Drawn as a decision, x3?, with N looping back.",
     "Flowchart: start; pin 6 on, pause 0.2 s, pin 6 off, pause 0.2 s; decision x3? with N back to pin 6 on and Y to end."),
    ("Time delay", "Time Delay", "The program waits for a set time. Outputs stay as they are while it waits.",
     "Flowchart: start; pin 4 on; pause 10 s; pin 4 off; end."),
    ("Branch", "Branch", "A yes or no decision. Each answer has its own path, labelled Y and N.",
     "Flowchart: start; decision pin 2 on? with N back to itself; Y to pin 4 on, pause 3 s, pin 4 off; back to the decision."),
]

# Task: order the flowchart — booklet Flowchart Q1, exam form, exam pin
ORDER = ["start", "pin 4 on", "pause 4 s", "pin 4 off", "end"]
DISTRACT = ["pause 4", "lamp on"]


def _symbols():
    rows = "".join(
        f'<tr><td class="symcell">{F.symbol(k, name + " symbol")}</td><td><b>{name}</b></td>'
        f"<td>{escape(job)}</td></tr>" for k, name, job in SYMBOLS)
    return ('<div class="tblwrap"><table class="tbl symtbl"><thead><tr><th scope="col">Symbol</th>'
            '<th scope="col">Name</th><th scope="col">Its job</th></tr></thead>'
            f"<tbody>{rows}</tbody></table></div>")


def _structures():
    cards = []
    for name, title, words, alt in STRUCTURES:
        fig = cut(L2, title, (8.4, 1.4, 12.71, 7.1), alt)
        cards.append(f'<div class="case"><h4>{name}</h4><p>{escape(words)}</p>'
                     f'<figure>{fig}</figure></div>')
    return '<div class="case-grid">' + "".join(cards) + "</div>"


def _order_task():
    import random
    tiles = ORDER + DISTRACT
    random.Random(4).shuffle(tiles)
    slots = "".join(
        f'<button type="button" class="slot" data-answer="{escape(a)}"><span class="slot-word">—</span>'
        f'<span class="slot-mark" aria-hidden="true"></span></button>'
        + ('<span class="flow" aria-hidden="true">↓</span>' if i < len(ORDER) - 1 else "")
        for i, a in enumerate(ORDER))
    tl = "".join(f'<button type="button" class="tile">{escape(t)}</button>' for t in tiles)
    return f"""
      <div class="widget" data-builder data-prog-challenge="ch-flowchart" id="s2-order">
        <h3>Task: order the flowchart</h3>
        <p>A warning lamp on pin 4 comes on for 4 seconds, then goes off, then the program stops. Tap the boxes into the right order. Two boxes lose marks: leave them out.</p>
        <div class="build-col" aria-label="Your flowchart, top to bottom">{slots}</div>
        <div class="bank" aria-label="Boxes to place">{tl}</div>
        <div class="match-ctl btnrow">
          <button class="btn" type="button" data-check>Check</button>
          <button class="btn" type="button" data-clear>Reset</button>
        </div>
        <p class="score" data-out aria-live="polite"></p>
        <p class="hint">Booklet page 9, question 1, written the exam's way.</p>
      </div>"""


def html():
    arrows = cut(L2, "Lines and Arrows", (8.4, 1.4, 12.71, 7.1),
                 "Flowchart: start; pin 5 on, pause 2 s, pin 5 off, pause 2 s; a line back up "
                 "with an arrow.", max_w=240)
    worked = cut(L2, "Worked Example: The Answer (9 marks)", (5.7, 1.4, 12.71, 7.1),
                 "Flowchart: start; decision pin 0 on? with N back to itself; Y to pin 7 on, "
                 "pause 0.5 s, pin 7 off, pause 0.5 s; decision x4? with N back to pin 7 on; Y "
                 "to pin 6 on, pause 6 s, pin 6 off; back to the start.", max_w=380)
    return f"""
    <!-- ================= SECTION 2 — L2 Flowcharts ================= -->
    <section class="panel sec" id="s2" aria-labelledby="s2-title">
      <span class="concept-tag">Section 2 · Lesson 2</span>
      <h2 id="s2-title">Flowcharts <span class="badge exam">Exam</span> <span class="badge assign">Assignment</span></h2>
      <p class="keypoint">A <strong>flowchart</strong> shows the steps of a program in order, using the <strong>six symbols</strong> in the data booklet. The exam asks you to <strong>complete a flowchart from an I/O table</strong> every year.</p>
      <p class="exam-ref"><span class="exam-ref-lab">In the exam</span> Completing a flowchart from an I/O table: every paper. <b>2021 Q13(b)</b> · <b>2022 Q9(a)</b> · <b>2023 Q8(a)</b> · <b>2024 Q11(b)</b></p>

      <h3>The six symbols</h3>
      <p>All six are on page 6 of the data booklet.</p>
      {_symbols()}

      <div class="dual">
        <div class="dual-text">
          <h3>Lines and arrows</h3>
          <ul>
            <li><b>Down or right</b>: an arrow is not needed.</li>
            <li><b>Up or left</b>: an arrow is needed.</li>
            <li><b>Every loop back</b>: draw its arrow. The marking instructions mark it.</li>
          </ul>
          <h3>What goes in the box</h3>
          <div class="tblwrap"><table class="tbl">
            <thead><tr><th scope="col">Box</th><th scope="col">The exam's way</th></tr></thead>
            <tbody>
              <tr><td>Output</td><td><b>pin 7 on</b> · <b>pin 7 off</b></td></tr>
              <tr><td>Input decision</td><td><b>pin 1 on?</b></td></tr>
              <tr><td>Delay</td><td><b>pause 0.5&nbsp;s</b> (always a unit)</td></tr>
              <tr><td>Fixed loop</td><td><b>x3?</b></td></tr>
            </tbody>
          </table></div>
          <p>The booklet writes the same boxes as <b>Lamp (output, pin 13) ON</b>, <b>Wait 1 s (1000 ms)</b> and <b>count &lt; 5?</b>. Both score. Either way, every output has its <b>pin</b> and every delay has its <b>unit</b>.</p>
        </div>
        <figure class="dual-fig">{arrows}<figcaption>A loop back up always has its arrow.</figcaption></figure>
      </div>

      <h3>The four structures</h3>
      {_structures()}

      <div class="dual">
        <div class="dual-text">
          <h3>How the marks are given</h3>
          <ul>
            <li>Each output: on and off, in the right place <b>(1)</b></li>
            <li>Each input decision: Y, N, a loop and an arrow <b>(1)</b></li>
            <li>Each delay: right place, with a unit <b>(1)</b></li>
            <li>x3?: Y, N, and an arrow back before the repeat <b>(1)</b></li>
            <li>A loop to the start with an arrow, or an end <b>(1)</b></li>
            <li>All the symbols right <b>(1)</b></li>
          </ul>
          <h3>The method</h3>
          <ol>
            <li>Read the I/O table: which pins are in, which are out.</li>
            <li>Draw one box per bullet, in order, top to bottom.</li>
            <li>Turn each input into a decision, <b>pin 1 on?</b>, with Y and N.</li>
            <li>Turn each repeat into <b>x3?</b>, with an arrow back.</li>
            <li>Finish: loop to the start, or end. Check pins, units and arrows.</li>
          </ol>
        </div>
        <div class="dual-fig">
          <p class="stem"><b>Worked example.</b> Input: train sensor, pin 0. Outputs: lamps, pin 7; barrier motor, pin 6. When the train sensor is on, the lamps flash 4 times, 0.5&nbsp;s on and 0.5&nbsp;s off. The barrier motor then turns on for 6&nbsp;s, then off. The sequence returns to the start. <span class="marks">9 marks</span></p>
          <details class="reveal"><summary>Answer</summary><div class="reveal-body"><figure>{worked}</figure>
            <p>pin 0 on?: Y, N, loop (1) · pin 7 on, off (1) · both pauses with units (1) · x4?: Y, N (1) · arrow back (1) · pin 6 on, off (1) · pause 6 s with unit (1) · loop to start (1) · all symbols right (1).</p></div></details>
        </div>
      </div>
{_order_task()}

      <div class="dual">
        <div class="dual-text">
          <h3>Build it in a simulator</h3>
          <p><b>NoSyntaxSim</b> draws the same symbols. Each input or output box picks a pin from the hardware panel. <b>Run Programme</b> lights each box as it runs. It writes a delay as <b>Wait 3000ms</b>; on paper we still write <b>pause 3&nbsp;s</b>.</p>
          <p><b>Yenka</b> builds the same flowchart with its own symbols. In class you use both, so you know both.</p>
        </div>
        <figure class="dual-fig"><img src="{WEB}/figures/sim_l2.png" alt="A flowchart in NoSyntaxSim: TRAIN_SENSOR = ON?, then LAMPS = ON, Wait 3000ms, LAMPS = OFF, beside the virtual microcontroller." loading="lazy">
          <figcaption>NoSyntaxSim V2 by Peter Strain (NoStrainSims), free and open to all.</figcaption></figure>
      </div>

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span> <span class="page-ref">Booklet p.9–13</span>
        <p class="stem">1. A car wash has a button on pin 1, a pump on pin 5 and a brush on pin 4. When the button is pressed, the pump runs for 20&nbsp;s, then stops; the brush then runs for 30&nbsp;s, then stops. The sequence repeats. <b>Complete</b> the flowchart. <span class="marks">6 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body"><figure class="fc-ans">{F.car_wash()}</figure>
          <p>pin 1 on? with Y, N, loop and arrow (1) · pin 5 on and off (1) · pin 4 on and off (1) · both pauses with units (1) · loop to the start with an arrow (1) · symbols (1).</p></div></details>
        <p class="stem">2. <b>State</b> the programming structure: a sign flashes all day. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">A continuous loop.</div></details>
        <p class="stem">3. <b>State</b> the programming structure: a bell rings 4 times, then stops. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">A fixed loop.</div></details>
      </div>
    </section>"""


JS = ""
