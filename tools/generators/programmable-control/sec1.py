"""Section 1 — Microcontrollers (deck L1; WEB-PLAN W6).

What a microcontroller is, where you meet one (four sectors, a photo each), hard-wired vs
programmable, advantages in MI wording with the "easier to change" Watch Out (rule 48), and
wiring an input and a transistor-driven output. Figures are cut from the L1 deck PDF.
"""
from html import escape

from assets import PHOTOS, WEB
from pdfsvg import cut

ID, NAV = "s1", "Microcontrollers"
L1 = "L1 - Microcontrollers.pdf"


def _sectors():
    cards = []
    for name, (sector, alt, credit, lic, src) in PHOTOS.items():
        cards.append(
            f'<figure class="sector"><img src="{WEB}/photos/{name}.jpg" alt="{escape(alt)}" '
            f'loading="lazy">'
            f'<figcaption><b>{sector}</b>: {escape(alt[0].lower() + alt[1:])}'
            f'<span class="credit"><a href="{escape(src)}" target="_blank" rel="noopener">'
            f'{escape(credit)}</a></span></figcaption></figure>')
    return '<div class="sector-grid">' + "".join(cards) + "</div>"


def html():
    hard = cut(L1, "Hard-Wired Control", (6.0, 1.4, 12.71, 7.1),
               "Hard-wired circuit: a resistor and an LDR divider feed a transistor through a "
               "base resistor; the transistor switches a lamp. The job is fixed by the wiring.")
    prog = cut(L1, "Programmable Control", (4.7, 1.4, 12.71, 7.1),
               "Programmable circuit: a switch into the microcontroller's pin 2, a buzzer on "
               "pin 4, and a motor on pin 7 through a transistor. The job is in the program.")
    block = cut(L1, "The Exam's Microcontroller", (4.7, 1.4, 12.71, 7.1),
                "The exam's microcontroller: an 8-pin block, pins 0 to 3 on the left and 7 to "
                "4 on the right, between a 5 V rail and a 0 V rail.")
    driver = cut(L1, "The Transistor Driver", (4.7, 1.4, 12.71, 7.1),
                 "Wiring: a switch from 5 V into pin 2; a buzzer from pin 4 to 0 V; pin 7 "
                 "through a base resistor to a transistor, which switches a motor with a diode "
                 "across it.")
    return f"""
    <!-- ================= SECTION 1 — L1 Microcontrollers ================= -->
    <section class="panel sec" id="s1" aria-labelledby="s1-title">
      <span class="concept-tag">Section 1 · Lesson 1</span>
      <h2 id="s1-title">Microcontrollers <span class="badge exam">Exam</span></h2>
      <p class="keypoint">A <strong>microcontroller</strong> is a small, programmable chip that controls a system. It runs a <strong>program</strong> stored in its memory. It <strong>reads inputs</strong> and <strong>switches outputs</strong>.</p>
      <p class="exam-ref"><span class="exam-ref-lab">In the exam</span> Advantages over hard-wired control, and wiring a microcontroller. <b>2021 Q7(b)</b> · <b>2022 Q14(c)</b> · <b>2023 Q9(d)</b> · <b>2025 Q8(c)</b> · <b>2026 Q13(e)</b></p>

      <div class="dual">
        <div class="dual-text">
          <h3>The exam's microcontroller</h3>
          <ul>
            <li><b>8 pins</b>: each one is an input or an output.</li>
            <li><b>The I/O table</b> in the question says which.</li>
            <li><b>In our room</b>: inputs on pins 2 and 3, outputs on pins 4 to 7.</li>
          </ul>
          <p><b>Input</b> (a switch or a sensor) → <b>process</b> (the microcontroller and its program) → <b>output</b> (a lamp, buzzer or motor).</p>
        </div>
        <figure class="dual-fig">{block}</figure>
      </div>

      <h3>Where you meet one</h3>
      <p>The booklet sorts examples into sectors. One of each:</p>
      {_sectors()}

      <div class="dual">
        <div class="dual-text">
          <h3>Hard-wired or programmable?</h3>
          <div class="tblwrap"><table class="tbl">
            <thead><tr><th scope="col"></th><th scope="col">Hard-wired</th><th scope="col">Programmable</th></tr></thead>
            <tbody>
              <tr><th scope="row">Made of</th><td>fixed components and wires</td><td>a microcontroller and a program</td></tr>
              <tr><th scope="row">The job is</th><td>in the wiring</td><td>in the program</td></tr>
              <tr><th scope="row">To change the job</th><td>new parts, new wiring</td><td>change the program</td></tr>
            </tbody>
          </table></div>
        </div>
        <div class="dual-fig">
          <figure>{hard}<figcaption>Hard-wired: the job is in the wiring.</figcaption></figure>
          <figure>{prog}<figcaption>Programmable: the job is in the program.</figcaption></figure>
        </div>
      </div>

      <h3>Advantages and disadvantages</h3>
      <div class="tblwrap"><table class="tbl">
        <thead><tr><th scope="col">Advantage</th><th scope="col">Why</th></tr></thead>
        <tbody>
          <tr><td><b>Reprogrammed</b></td><td>change the program, not the wiring</td></tr>
          <tr><td><b>Re-used</b></td><td>one board, many products</td></tr>
          <tr><td><b>Fewer components</b></td><td>so more reliable, and faster to assemble</td></tr>
        </tbody>
      </table></div>
      <div class="tblwrap"><table class="tbl">
        <thead><tr><th scope="col">Disadvantage</th><th scope="col">Why</th></tr></thead>
        <tbody>
          <tr><td><b>Needs a programmer</b></td><td>someone must write and test the program</td></tr>
          <tr><td><b>Needs a power supply</b></td><td>the chip needs one to run</td></tr>
          <tr><td><b>Harder to follow</b></td><td>you cannot see the job by looking at the parts</td></tr>
        </tbody>
      </table></div>
      <div class="warn">
        <strong>Watch out: "easier to change" scores 0 on its own.</strong> So do "it is cheaper", "it is programmable" and "fewer components" with no reason. Say <em>how</em>: <b>it can be reprogrammed, with no rewiring</b>; <b>it needs fewer components, so it costs less</b>; <b>one board can be re-used for a new job</b>. (Marking instructions 2021, 2022 and 2025.)
      </div>

      <h3>Model answer</h3>
      <p class="stem"><b>Describe</b> two advantages of a microcontroller over a hard-wired circuit for a bus's doors. <span class="marks">2 marks</span></p>
      <div class="ma-line"><span>The door times can be reprogrammed with no rewiring.</span><span class="mk">(1)</span></div>
      <div class="ma-line"><span>Fewer components, so the doors are more reliable.</span><span class="mk">(1)</span></div>

      <div class="dual">
        <div class="dual-text">
          <h3>Wiring inputs and outputs</h3>
          <ul>
            <li><b>Input</b>: a switch from 5&nbsp;V to the pin. Pressed, the pin gets 5&nbsp;V and the program reads it as on.</li>
            <li><b>Output</b>: from the pin to 0&nbsp;V. Switched on, the pin gives 5&nbsp;V, current flows and the buzzer sounds.</li>
            <li><b>A motor needs a transistor.</b> A pin gives a small current, about 20&nbsp;mA. A motor needs much more.</li>
          </ul>
          <p><b>The transistor driver</b>: the <b>base</b> lead goes pin → resistor → base. The <b>collector</b> has the motor, with a diode across it. The <b>emitter</b> goes to 0&nbsp;V.</p>
          <p><b>Watch out:</b> "driver" on its own scores 0. Say it is a transistor.</p>
        </div>
        <figure class="dual-fig">{driver}</figure>
      </div>

      <div class="practice">
        <span class="practice-tag">Practice — exam style</span> <span class="page-ref">Booklet p.3</span>
        <p class="stem">1. <b>Describe</b> two advantages of using a microcontroller rather than a hard-wired circuit to control a lift. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">Any two: it can be reprogrammed (for example new floor times) with no rewiring (1); it needs fewer components, so it is more reliable or cheaper to make (1); one board can be re-used for a different job (1). "Easier to change" on its own scores 0.</div></details>
        <p class="stem">2. <b>Explain</b> why a microcontroller is used in an automatic washing machine. <span class="marks">2 marks</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body"><strong>Cause:</strong> the program can be changed (1), <strong>effect:</strong> so new wash programmes can be added with no change to the circuit (1).</div></details>
        <p class="stem">3. <b>State</b> why a transistor is connected between pin 7 and a motor. <span class="marks">1 mark</span></p>
        <details class="reveal"><summary>Answer</summary><div class="reveal-body">The pin gives only a small current; the transistor switches the larger current the motor needs (1). "A driver" on its own scores 0.</div></details>
      </div>
    </section>"""


JS = ""
