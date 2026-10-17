#!/usr/bin/env python3
"""Electricity 1 graphing practice — the one artefact done by hand.

Builds three things from `graphing.md`, all from the same computed data:
  * `graphing-practice.html` on the website — method, data, gated answers;
  * a pupil worksheet PDF with printable 1 mm graph paper bound in;
  * a teacher answer PDF with the three graphs drawn and the gradients worked.

The data is generated from a stated resistance plus a small scatter, so the
best-fit gradient is a known number and the answer sheet cannot disagree with
the table the pupils are given.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))

import gridpaper
import pagebuild as P

SRC = os.path.join(HERE, "graphing.md")
OUT = (P.REPO + "/classes/s3-physics/"
       "electricity1/graphing-practice.html")


def _nice_step(span, squares=10):
    """The largest 1/2/5-per-square step that still puts the data across most of
    the grid — the scales a pupil is allowed to have chosen."""
    import math
    raw = span / float(squares)
    mag = 10 ** math.floor(math.log10(raw))
    for m in (1, 2, 5, 10):
        if m * mag >= raw - 1e-12:
            return m * mag
    return 10 * mag


def nums(s):
    return [float(x) for x in s.split(",")]


def compute(v):
    d = {}
    for tag in ("t1", "t2"):
        r = float(v[tag + "_resistance"])
        cur = nums(v[tag + "_currents"])
        sca = nums(v[tag + "_scatter"])
        volts = [round(r * i + s, 2) for i, s in zip(cur, sca)]
        d[tag + "_r"] = P.fm(r)
        d[tag + "_pairs"] = list(zip(cur, volts))
        # least-squares gradient through the origin: the line the pupil should draw
        grad = sum(i * u for i, u in zip(cur, volts)) / sum(i * i for i in cur)
        # The answer quoted is the resistance the data was built from; the
        # least-squares fit is kept only to check that the scattered points
        # really do give it back (see main()).
        d[tag + "_grad"] = P.fm(r)
        d[tag + "_gradf"] = grad
        d[tag + "_lo"] = P.fm(r * 0.95, 2)
        d[tag + "_hi"] = P.fm(r * 1.05, 2)
        # a worked point that lies on the line and whose voltage is exact to one
        # decimal place, so V / I divides back to the quoted resistance
        mid = cur[len(cur) // 2]
        exact = [i for i in cur if abs(round(i * r, 1) - i * r) < 1e-9]
        pt = min(exact or cur, key=lambda i: abs(i - mid))
        d[tag + "_pt_i"] = P.fixed(pt, 2)
        d[tag + "_pt_v"] = P.fixed(pt * r, 1)
        d[tag + "_imax"] = P.fixed(max(cur), 2)
        d[tag + "_vmax"] = P.fixed(max(volts), 2)
        d[tag + "_xstep"] = P.fixed(_nice_step(max(cur)), 2)
        d[tag + "_xstep2"] = P.fixed(_nice_step(max(cur), 8), 2)
        d[tag + "_ystep"] = P.fm(_nice_step(max(volts)), 2)
        d[tag + "_ystep2"] = P.fm(_nice_step(max(volts), 8), 2)
        d[tag + "_xbad"] = P.fixed(_nice_step(max(cur)) * 3, 2)

    cur = nums(v["t3_currents"])
    volts = nums(v["t3_voltages"])
    d["t3_pairs"] = list(zip(cur, volts))
    lo_i, hi_i = cur[1], cur[-1]
    lo_v, hi_v = volts[1], volts[-1]
    d["t3_lo_i"] = P.fixed(lo_i, 2)
    d["t3_hi_i"] = P.fixed(hi_i, 2)
    d["t3_lo_v"] = P.fixed(lo_v, 2)
    d["t3_hi_v"] = P.fixed(hi_v, 2)
    d["t3_lo_r"] = P.fm(lo_v / lo_i, 2)
    d["t3_hi_r"] = P.fm(hi_v / hi_i, 2)
    d["t3_factor"] = P.fm((hi_v / hi_i) / (lo_v / lo_i), 2)
    d["t3_xstep"] = P.fixed(_nice_step(max(cur)), 2)
    d["t3_ystep"] = P.fm(_nice_step(max(volts)), 2)
    return d


def table(pairs, quantity="R"):
    head = ("<tr><th>current in %s (A)</th>%s</tr>"
            % (quantity, "".join("<td>%s</td>" % P.fixed(i, 2) for i, _ in pairs)))
    row = ("<tr><th>voltage across %s (V)</th>%s</tr>"
           % (quantity, "".join("<td>%s</td>" % P.fixed(u, 2) for _, u in pairs)))
    return ('<div class="tablewrap"><table class="data">%s%s</table></div>'
            % (head, row))


METHOD = [
    ("Put the right quantity on the right axis.",
     "The quantity you changed goes across the bottom — here that is the "
     "<strong>current</strong>. The quantity you measured because of it goes up the "
     "side — the <strong>voltage</strong>."),
    ("Label both axes with the quantity <em>and</em> its unit.",
     "<code>current in R (A)</code>, not <code>I</code> and not <code>amps</code>. "
     "An unlabelled axis loses the mark every time."),
    ("Mark the origin 0.",
     "Both axes start at zero for a V–I graph, because no current means no voltage."),
    ("Choose a scale that fills the paper.",
     "Your points should spread over <strong>more than half</strong> the grid in both "
     "directions. Make each big square worth 1, 2, 5 or 10 — never 3, 7 or 15, because "
     "you will misread it."),
    ("Plot each point as a small neat cross.",
     "A fat blob is worth about three squares of uncertainty."),
    ("Draw one best-fit line, not dot-to-dot.",
     "A straight line if the points lie on one; a smooth curve if they clearly bend. "
     "Roughly as many points should sit above the line as below it."),
    ("Read your <em>line</em>, not your points, to get the resistance.",
     "Pick a point that lies exactly on the line — ideally where it crosses a heavy "
     "grid line so both values are easy to read — and use "
     "<var>R</var> = <var>V</var> &divide; <var>I</var>. Read a point off the line even "
     "if none of your measured crosses sits there; that is what the line is for."),
    ("Steeper line, bigger resistance.",
     "You will not be asked to <em>calculate</em> a gradient at National 5 in S3 — that "
     "comes in S4 — but you do need to say what a steeper line means: more volts are "
     "needed to push the same current through, so the resistance is larger."),
]

MISTAKES = [
    "Axes swapped — voltage across the bottom. Read the question: it says plot voltage "
    "<em>against</em> current, and the first-named quantity goes up the side.",
    "A scale like 3 V per big square, so every reading is a guess.",
    "Points joined dot-to-dot in a zig-zag instead of one best-fit line.",
    "Using a measured cross that does not sit on the best-fit line. Read the line.",
    "Units left off the axes, or off the final answer.",
]

CSS = """
*, *::before, *::after { box-sizing: border-box; }
html, body { max-width: 100%; }
body { margin: 0; overflow-x: hidden; }
img, iframe { max-width: 100%; height: auto; display: block; }
main.page-wrap { padding-bottom: calc(5rem + env(safe-area-inset-bottom)); }
.wrap { max-width: 860px; margin: 0 auto; }
.lead { border: 1px solid var(--border-accent); border-left: 4px solid var(--accent);
  border-radius: 14px; background: var(--card); padding: 1rem 1.1rem; margin: 1rem 0; }
.lead h2 { margin: 0 0 .4rem; font-size: 1.2rem; font-weight: 900; }
.lead p { margin: 0 0 .5rem; line-height: 1.55; }
.kit { display: flex; flex-wrap: wrap; gap: 8px; margin: .6rem 0 0; padding: 0; list-style: none; }
.kit li { border: 1px solid var(--border-soft); border-radius: 999px; background: var(--surface-2);
  padding: .35rem .8rem; font-weight: 800; font-size: .88rem; }
h2.sec { margin: 1.8rem 0 .6rem; font-size: 1.15rem; font-weight: 900; color: var(--text);
  border-bottom: 3px solid var(--accent); padding-bottom: .25rem; }
ol.method { counter-reset: m; list-style: none; padding: 0; margin: 0; }
ol.method li { counter-increment: m; position: relative; padding: .1rem 0 .8rem 2.4rem;
  line-height: 1.55; }
ol.method li::before { content: counter(m); position: absolute; left: 0; top: .05rem;
  width: 1.7rem; height: 1.7rem; border-radius: 50%; background: var(--accent); color: #fff;
  font-weight: 900; display: grid; place-items: center; font-size: .9rem; }
ol.method b { display: block; font-weight: 900; }
ul.mistakes { margin: 0; padding-left: 1.1rem; }
ul.mistakes li { margin: .35rem 0; line-height: 1.5; }
.task { border: 1px solid var(--border-accent); border-radius: 14px; background: var(--card);
  padding: 1rem 1.05rem 1.1rem; margin: 1rem 0; }
.task h3 { margin: 0 0 .1rem; font-size: 1.05rem; font-weight: 900; }
.task .ctx { margin: 0 0 .7rem; color: var(--muted); font-weight: 800; font-size: .92rem; }
.tablewrap { overflow-x: auto; margin: .6rem 0 .9rem; }
table.data { border-collapse: collapse; font-size: .93rem; min-width: 100%; }
table.data th, table.data td { border: 1px solid var(--border-soft); padding: .4rem .55rem;
  text-align: center; white-space: nowrap; }
table.data th { background: var(--surface-2); font-weight: 900; text-align: left; }
ol.asks { margin: 0; padding-left: 1.2rem; }
ol.asks li { margin: .3rem 0; line-height: 1.5; }
details.answers { margin: 1.4rem 0 0; border: 1px solid var(--border-accent);
  border-radius: 14px; background: var(--surface-2); }
details.answers > summary { cursor: pointer; padding: .8rem 1rem; font-weight: 900;
  min-height: 48px; display: flex; align-items: center; gap: .5rem; color: var(--text); }
details.answers > summary:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
details.answers .inner { padding: 0 1rem 1rem; }
details.answers h4 { margin: .8rem 0 .3rem; font-size: .95rem; font-weight: 900; }
details.answers p { margin: .25rem 0; line-height: 1.55; }
var { font-style: italic; font-family: "Times New Roman", Times, Georgia, serif; }
.dl { display: inline-flex; align-items: center; gap: .45rem; min-height: 48px;
  padding: .7rem 1.2rem; border-radius: 12px; text-decoration: none; font-weight: 900;
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2)); color: #fff;
  box-shadow: 0 6px 16px rgba(0,138,145,.3); touch-action: manipulation; }
.dl:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-offset); }
.beta-note { margin: 1rem auto 0; max-width: 860px; border: 1px solid var(--border-accent);
  border-left: 4px solid var(--accent); border-radius: 12px; background: var(--surface-2);
  padding: .6rem .85rem; font-size: .86rem; font-weight: 800; color: var(--text); }
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}
/* the graph paper is a print-only artefact; declared before the print block so
   the print rule that shows it wins */
.gridpage { display: none; }
@media print {
  @page { size: A4; margin: 12.7mm; }
  .banner-wrap, .subnav-wrap, .site-menu-button, .site-menu-drawer, .site-menu-overlay,
  .skip-link, footer, .dl, .beta-note, .prog-counter, .back-to-s3 { display: none !important; }
  body { background: #fff; color: #000; }
  /* the screen layout's bottom padding and 100vh body both add a blank page */
  main.page-wrap { padding: 0; }
  body { min-height: 0; display: block; }
  .wrap { max-width: none; }
  .task, .lead, ol.method li { break-inside: avoid; }
  details.answers { display: none !important; }
  /* the graph paper only exists for the printed sheet */
  .gridpage { display: block; break-before: page; break-after: avoid; }
  .gridpage:last-of-type { break-after: auto; }
  [data-credit-note] { break-before: avoid; }
  .gridcap { margin: 0 0 2mm; font-weight: 900; font-size: 10pt; }
  .gridpaper { display: block; }
}
"""


TASKS = [
    dict(id="t1", title="Task 1 — a resistor",
         ctx="A pupil measures the current in a resistor and the voltage across it, "
             "for six different settings of a variable resistor.",
         quantity="R",
         asks=["Plot a graph of <strong>voltage across R</strong> against "
               "<strong>current in R</strong>.",
               "Draw the best-fit line.",
               "Read a point that lies on your line and use "
               "<var>R</var> = <var>V</var> ÷ <var>I</var> to determine the resistance "
               "of R. Write down the point you used.",
               "State one thing about the graph that tells you the resistor obeys "
               "Ohm's law."]),
    dict(id="t2", title="Task 2 — a different resistor",
         ctx="The pupil repeats the experiment with a second resistor.",
         quantity="R",
         asks=["Plot this data on a <strong>new</strong> pair of axes and draw the "
               "best-fit line.",
               "Read a point on your line and determine the resistance of this "
               "resistor.",
               "Sketch, on one set of axes, how the two lines would compare. State "
               "whether the <strong>steeper</strong> line belongs to the "
               "<strong>larger</strong> or the smaller resistance, and say why."]),
    dict(id="t3", title="Task 3 — a filament lamp",
         ctx="The pupil now replaces the resistor with a filament lamp and repeats "
             "the experiment again.",
         quantity="the lamp",
         asks=["Plot the data and draw a <strong>smooth best-fit curve</strong>. "
               "Do not force a straight line through these points.",
               "Determine the resistance of the lamp when the current in it is "
               "{t3_lo_i} A.",
               "Determine the resistance of the lamp when the current in it is "
               "{t3_hi_i} A.",
               "State what happens to the resistance of the lamp as the current "
               "increases, and explain why."]),
]


def answers_html(d):
    return """
<h4>Task 1</h4>
<p>Read a point that lies on your line — for example ({t1_pt_i}, {t1_pt_v}) — and use
<var>R</var> = <var>V</var> ÷ <var>I</var>: {t1_pt_v} ÷ {t1_pt_i} =
<strong>{t1_grad} Ω</strong>. Anything from about {t1_lo} Ω to {t1_hi} Ω is a good
answer, because you are reading a hand-drawn line.</p>
<p>The line is <strong>straight and passes through the origin</strong>, so the voltage
is directly proportional to the current — that is Ohm's law, and it means the
resistance is the same at every current.</p>
<h4>Task 2</h4>
<p>Using ({t2_pt_i}, {t2_pt_v}) from the line: {t2_pt_v} ÷ {t2_pt_i} =
<strong>{t2_grad} Ω</strong> (accept about {t2_lo} Ω to {t2_hi} Ω).</p>
<p>The <strong>steeper</strong> line is the <strong>larger</strong> resistance: a steeper
line means more volts are needed to push the same current through, which is exactly what
a bigger resistance does. So Task 1's resistor ({t1_grad} Ω) gives the steeper line.
<em>You are not asked to calculate a gradient at National 5 in S3 — only to say what a
steeper line means.</em></p>
<h4>Task 3</h4>
<p>At {t3_lo_i} A the voltage is {t3_lo_v} V, so
<var>R</var> = <var>V</var> ÷ <var>I</var> = {t3_lo_v} ÷ {t3_lo_i} =
<strong>{t3_lo_r} Ω</strong>.</p>
<p>At {t3_hi_i} A the voltage is {t3_hi_v} V, so
<var>R</var> = {t3_hi_v} ÷ {t3_hi_i} = <strong>{t3_hi_r} Ω</strong>.</p>
<p>The resistance <strong>increases</strong> — by a factor of about {t3_factor}. The
larger current heats the filament, the metal ions vibrate more, the electrons collide
with them more often, and the resistance rises. That is why the graph
<strong>curves upwards</strong> instead of staying straight.</p>
<p><strong>Watch out:</strong> for a curve there is no single answer to "what is the
resistance" — it depends where you look. You must read one point off the curve and
divide, and say which current it belongs to.</p>
"""


def page(meta, d, values):
    method = "".join("<li><b>%s</b>%s</li>" % (t, b) for t, b in METHOD)
    mistakes = "".join("<li>%s</li>" % m for m in MISTAKES)

    tasks = []
    for t in TASKS:
        asks = "".join("<li>%s</li>" % P.sub(a, d) for a in t["asks"])
        tasks.append(
            '<section class="task" aria-label="%s"><h3>%s</h3>'
            '<p class="ctx">%s</p>%s<ol class="asks">%s</ol></section>'
            % (t["title"], t["title"], t["ctx"],
               table(d[t["id"] + "_pairs"], t["quantity"]), asks))

    grids = "".join(
        '<div class="gridpage"><p class="gridcap">%s — graph paper</p>%s</div>'
        % (t["title"], gridpaper.grid(178, 232)) for t in TASKS)

    return """---
layout: none
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" content="#eaf7fa" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0d1f1a" media="(prefers-color-scheme: dark)" />
<title>%(title)s</title>

  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <script src="/assets/js/site-menu.js" defer></script>
  <script src="/assets/js/progress.js" defer></script>
  <script src="/assets/js/progress/s3-physics.js" defer></script>
  <link rel="stylesheet" href="/assets/css/s3-physics.css?v=s3-20260828a">

<style>
/* Generated by build_graphing.py from graphing.md — edit the source, not this file. */
%(css)s
</style>
</head>
<body>
  <a class="skip-link" href="#mainContent">Skip to content</a>

  {%% include site-menu.html %%}

<div class="banner-wrap">
  <img src="/assets/s3-physics-banner.jpeg" alt="S3 Physics banner" class="banner" loading="eager">
  <div class="banner-tint"></div>
  <div class="banner-overlay-text">
    <h1>%(topic)s · %(short)s</h1>
  </div>
</div>

%(subnav)s
<main class="page-wrap" id="mainContent">
<h1 class="visually-hidden">%(title)s</h1>

<a href="/classes/s3-physics/electricity1.html" class="back-to-s3">⬅ Back to Electricity 1</a>

<p class="beta-note">New page — if anything looks wrong, tell Mr Stewart.</p>

<div class="wrap">

<div class="lead">
  <h2>📈 Drawing V–I graphs by hand</h2>
  <p>Every other page in this topic marks itself. This one does not, because the skill
  being practised is one only your own hand can learn: choosing a scale, plotting
  accurately and reading a value off a line you drew yourself. It is worth marks in the
  real test, and it is the part pupils most often lose them on.</p>

  <ul class="kit">
    <li>📄 graph paper</li><li>📏 a ruler</li><li>✏️ a sharp pencil</li>
    <li>🧮 a calculator</li>
  </ul>
  <p style="margin-top:.9rem"><a class="dl" href="/classes/s3-physics/electricity1/Electricity 1 Graphing Practice.pdf" target="_blank">📄 Print the worksheet (with graph paper)</a></p>
</div>

<h2 class="sec">How to draw the graph</h2>
<ol class="method">%(method)s</ol>

<h2 class="sec">What loses marks</h2>
<ul class="mistakes">%(mistakes)s</ul>

<h2 class="sec">The tasks</h2>
%(tasks)s

<details class="answers" id="answers">
  <summary>✅ Check your graphs — answers and marking notes</summary>
  <div class="inner">%(answers)s</div>
</details>

%(grids)s

<p data-credit-note style="font-size:0.82rem;opacity:0.78;margin-top:1.5rem;">Sources &amp; credits: the graphing method and the data on this page are original to this site, written to match the V–I experiment examined at National 5 — past papers and marking instructions &copy; Qualifications Scotland (SQA). Graph paper and diagrams drawn for this site &copy; R Stewart, 2026.</p>

</div>
</main>

{%% include site-footer.html %%}

<script>
(function () {
  "use strict";
  var seen = false;
  var a = document.getElementById("answers");
  a.addEventListener("toggle", function () {
    if (a.open && !seen && window.Progress && Progress.markSeen) {
      seen = true;
      Progress.markSeen("%(badge)s");
    }
  });
  if (window.Progress && Progress.markSeen) { Progress.markSeen("%(badge)s"); }
})();
</script>
</body>
</html>
""" % {"title": meta["title"], "topic": meta["topic"], "short": meta["short"],
       "css": CSS, "subnav": P.subnav("graphing-practice"), "method": method, "mistakes": mistakes,
       "tasks": "".join(tasks), "answers": P.sub(answers_html(d), d),
       "grids": grids, "badge": meta["badge"]}


def main():
    meta, values, _ = P.parse(open(SRC, encoding="utf-8").read())
    d = compute(values)
    html = page(meta, d, values)

    errs = []
    for tag, want in (("t1", float(values["t1_resistance"])),
                      ("t2", float(values["t2_resistance"]))):
        if abs(d[tag + "_gradf"] - want) / want > 0.03:
            errs.append("%s best-fit gradient %.2f is not within 3%% of the stated %g Ω"
                        % (tag, d[tag + "_gradf"], want))
    if "data-credit-note" not in html:
        errs.append("credit line missing")
    if "@page" not in html:
        errs.append("no print stylesheet")
    for e in errs:
        print("ERROR " + e)
    if errs:
        return 1

    open(OUT, "w", encoding="utf-8").write(html)
    open(os.path.join(HERE, "graphing-answer-sheet.html"), "w", encoding="utf-8").write(
        answer_sheet(meta, d))
    open(os.path.join(HERE, "graphing-answers.json"), "w", encoding="utf-8").write(
        json.dumps({k: v for k, v in d.items() if not k.endswith("_pairs")},
                   ensure_ascii=False, indent=1, default=str))
    print("built %s  (%d bytes)" % (OUT, len(html)))
    return 0



ANSWER_CSS = """
@page { size: A4; margin: 14mm 12.7mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "Trebuchet MS","Segoe UI",system-ui,sans-serif;
  color: #10231f; font-size: 10.5pt; line-height: 1.45; }
h1 { font-size: 15pt; margin: 0 0 .1rem; font-weight: 900; }
.sub { margin: 0 0 1rem; font-weight: 800; color: #3a5f59; font-size: 10pt; }
h2 { font-size: 11pt; margin: 1rem 0 .4rem; font-weight: 900; text-transform: uppercase;
  letter-spacing: .05em; color: #00666b; border-bottom: 2px solid #00747c; padding-bottom: 2px; }
.task { break-inside: avoid; margin: 0 0 1rem; }
.row { display: flex; gap: 14px; align-items: flex-start; }
.row .fig { flex: 0 0 62%; }
.row .fig svg { --dia-ink: #10231f; width: 100%; height: auto; }
.row .note { flex: 1 1 auto; font-size: 9.5pt; }
p { margin: .25rem 0; }
ul { margin: .3rem 0; padding-left: 1.1rem; }
li { margin: .15rem 0; }
var { font-style: italic; font-family: "Times New Roman", Times, serif; }
ol.mk { margin: .2rem 0 .4rem; padding-left: 1.15rem; }
ol.mk li { margin: .1rem 0; }
.foot { margin-top: 1rem; font-size: 8.5pt; color: #4a6a65; border-top: 1px solid #b9cfcb;
  padding-top: .4rem; }
"""


def answer_sheet(meta, d):
    import graphs as G
    def pt(tag):
        return (float(d[tag + "_pt_i"].replace("\u00b7", ".")),
                float(d[tag + "_pt_v"].replace("\u00b7", ".")))
    t1 = G.plotted(d["t1_pairs"], d["t1_gradf"], "R", label="Task 1 worked graph",
                   mark=pt("t1"))
    t2 = G.plotted(d["t2_pairs"], d["t2_gradf"], "R", label="Task 2 worked graph",
                   mark=pt("t2"))
    t3 = G.plotted(d["t3_pairs"], None, "the lamp", curve=True,
                   label="Task 3 worked graph")
    body = """
<h2>Task 1 — a resistor</h2>
<div class="task"><div class="row"><div class="fig">%(t1)s</div><div class="note">
<p><strong>Answer.</strong> Read a point that lies <em>on the line</em> — the marked
point is ({t1_pt_i} A, {t1_pt_v} V) — and use <var>R</var> = <var>V</var> ÷ <var>I</var>
= {t1_pt_v} ÷ {t1_pt_i} = <strong>{t1_grad} Ω</strong>. Accept {t1_lo}–{t1_hi} Ω.</p>
<p><strong>Marking, 5 marks.</strong></p>
<ol class="mk">
<li>Current across the bottom, voltage up the side, both labelled with quantity
<em>and</em> unit.</li>
<li>Scale on each axis is 1, 2 or 5 per big square, and the points cover more than half
the grid in both directions.</li>
<li>All six points plotted to within half a small square.</li>
<li>One straight best-fit line drawn with a ruler, through the origin, with points
scattered on both sides of it.</li>
<li>Resistance from a point on the line, with the unit Ω.</li>
</ol>
<p><strong>Acceptable scales.</strong> The data reaches {t1_imax} A and {t1_vmax} V.
On a ten-big-square grid, <strong>{t1_xstep} A</strong> per big square across and
<strong>{t1_ystep} V</strong> up are the natural choice; <strong>{t1_ystep2} V</strong> up
is equally acceptable and still fills the paper. Any scale that leaves the points inside
half the grid loses the scale mark, and so does {t1_xbad} A per square — or anything else
that is not 1, 2 or 5 times a power of ten.</p>
<p><strong>Also creditable.</strong> The line is straight and passes through the origin,
so <var>V</var> ∝ <var>I</var> — Ohm's law holds and the resistance is the same at every
current.</p>
</div></div></div>

<h2>Task 2 — a different resistor</h2>
<div class="task"><div class="row"><div class="fig">%(t2)s</div><div class="note">
<p><strong>Answer.</strong> From ({t2_pt_i} A, {t2_pt_v} V):
<strong>{t2_grad} Ω</strong>. Accept {t2_lo}–{t2_hi} Ω.</p>
<p><strong>Marking, 4 marks.</strong> Axes and units (1); scale and spread (1); points
and best-fit line (1); resistance from a point on the line, with unit (1).</p>
<p><strong>Acceptable scales.</strong> This data reaches {t2_imax} A and {t2_vmax} V, so
the current axis needs a different scale from Task 1 — <strong>{t2_xstep} A</strong> per
big square, with <strong>{t2_ystep} V</strong> or <strong>{t2_ystep2} V</strong> up.
Reusing Task 1's scale is the commonest error here and squeezes every point into one
corner.</p>
<p><strong>The comparison.</strong> The <strong>steeper</strong> line is the
<strong>larger</strong> resistance. Accept any correct qualitative reason: more volts are
needed to push the same current through, or <var>V</var> ÷ <var>I</var> is bigger.
<strong>Do not require a gradient calculation</strong> — that is S4 work. A pupil who
writes "Δ<var>V</var>/Δ<var>I</var>" has not done anything wrong, but nobody should lose
a mark for not doing it.</p>
</div></div></div>

<h2>Task 3 — a filament lamp</h2>
<div class="task"><div class="row"><div class="fig">%(t3)s</div><div class="note">
<p><strong>Answers.</strong> At {t3_lo_i} A: <var>R</var> = {t3_lo_v} ÷ {t3_lo_i} =
<strong>{t3_lo_r} Ω</strong>. At {t3_hi_i} A: <var>R</var> = {t3_hi_v} ÷ {t3_hi_i} =
<strong>{t3_hi_r} Ω</strong>. The resistance <strong>increases</strong>, by a factor of
about {t3_factor}.</p>
<p><strong>Marking, 5 marks.</strong> Axes and units (1); scale and spread (1); smooth
curve, not dot-to-dot and not a ruled line (1); a resistance at each of the two currents,
with units (1); resistance increases <em>because</em> the filament heats up and the ions
vibrate more, impeding the electrons (1).</p>
<p><strong>Acceptable scales.</strong> The data reaches {t3_hi_i} A and {t3_hi_v} V, so
{t3_xstep} A and {t3_ystep} V per big square both work. A pupil who plots this on the same
axes as Task 1 or 2 has not read the question, but do not penalise it twice.</p>
<p><strong>The trap.</strong> There is no single resistance for a lamp, so a pupil who
gives one value without saying which current it belongs to has not answered. Nothing here
is a gradient: the curve's steepness is not <var>V</var> ÷ <var>I</var>.</p>
</div></div></div>

<h2>What to look for across all three</h2>
<ul>
<li>Both axes carry the quantity <em>and</em> its unit; origin marked 0.</li>
<li>Scale runs 1, 2, 5 or 10 per big square — never 3 or 7.</li>
<li>Points fill more than half the grid in both directions.</li>
<li>One best-fit line or smooth curve, not dot-to-dot.</li>
<li>Gradient taken from two well-separated points on the line, not from a data point,
and the final answer carries Ω.</li>
</ul>
""" % {"t1": t1, "t2": t2, "t3": t3}
    return ("""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>%(topic)s — %(short)s — Answers</title><style>%(css)s</style></head><body>
<h1>%(course)s · %(topic)s</h1>
<p class="sub">%(short)s — answers and marking notes</p>
%(body)s
<p class="foot">Generated from <code>graphing.md</code> by <code>build_graphing.py</code>;
the data, the best-fit gradients and the graphs above all come from the same numbers the
pupils are given, so this sheet cannot disagree with their table. Pupils work from
<code>mrstewartphysics.co.uk/classes/s3-physics/electricity1/graphing-practice.html</code>.
Original to this site &copy; R Stewart, 2026; written to match the V–I experiment
examined at National 5, past papers &copy; Qualifications Scotland (SQA).</p>
</body></html>""" % {"course": meta["course"], "topic": meta["topic"],
                     "short": meta["short"], "css": ANSWER_CSS,
                     "body": P.sub(body, d)})
if __name__ == "__main__":
    sys.exit(main())
