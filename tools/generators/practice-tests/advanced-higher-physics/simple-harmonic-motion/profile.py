"""The Advanced Higher Physics profile for the shared practice-test builder.

Third course on the one builder, after N5/S3 and Higher. Everything AH changes
about the page lives here: palette, banner, progress namespace, the
relationships picker, the units offered and the credit line.

Two things differ from the other two courses and are deliberate:

* **Decimal separator is a full stop.** SQA moved the AH papers to a full stop
  with the X857 series in 2022, and the AH decks followed (DECK-RULES rule 28,
  28 Aug 2026). N5 and Higher keep the middle dot, so this is a profile switch
  rather than a change to the formatter.
* **The tokens `--accent-2`, `--border-accent`, `--cta-*`, `--good` and
  `--warm` are defined here.** `adv-higher-physics.css` never defines them,
  although the AH topic pages already use the first two — a gap on those pages
  that this profile does not depend on and does not fix.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                "..", "..", "toolkit"))
import pagebuild as P

# The picker offers the SHM block of the AH relationships sheet plus the three
# lines a candidate reaches for around it, so choosing is a real decision.
RELATIONSHIPS = ["ω = 2πf", "T = 1 / f", "a = −ω²y", "y = A cos ωt",
                 "y = A sin ωt", "v = ±ω√(A² − y²)", "Ek = ½mω²(A² − y²)",
                 "Ep = ½mω²y²", "F = ma", "F = −ky", "T = 2π / ω",
                 "ω = √(k / m)"]

REL_KEY = {"omega": 0, "period": 1, "accel": 2, "ycos": 3, "ysin": 4,
           "vel": 5, "ek": 6, "ep": 7, "fma": 8, "hooke": 9,
           "period_omega": 10, "spring": 11}

RELATIONSHIPS_HTML = [
    "<var>ω</var> = 2π<var>f</var>",
    "<var>T</var> = 1 / <var>f</var>",
    "<var>a</var> = −<var>ω</var><sup>2</sup><var>y</var>",
    "<var>y</var> = <var>A</var> cos <var>ωt</var>",
    "<var>y</var> = <var>A</var> sin <var>ωt</var>",
    "<var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>)",
    "<var>E</var><sub>k</sub> = ½<var>mω</var><sup>2</sup>(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>)",
    "<var>E</var><sub>p</sub> = ½<var>mω</var><sup>2</sup><var>y</var><sup>2</sup>",
    "<var>F</var> = <var>ma</var>",
    "<var>F</var> = −<var>ky</var>",
    "<var>T</var> = 2π / <var>ω</var>",
    "<var>ω</var> = √(<var>k</var> / <var>m</var>)"]

UNITS = ["rad s⁻¹", "m s⁻¹", "m s⁻²", "m", "mm", "s", "J", "mJ", "N", "N m⁻¹",
         "Hz", "kg"]

# name -> (multiple of the SI unit, the quantity it measures). The dimension
# tag is what stops "0.41 m s⁻²" earning the mark for a speed.
UNIT_JS = {"rad s⁻¹": [1, "w"], "m s⁻¹": [1, "v"], "m s⁻²": [1, "a"],
           "m": [1, "y"], "mm": [0.001, "y"], "s": [1, "t"], "J": [1, "E"],
           "mJ": [0.001, "E"], "N": [1, "F"], "N m⁻¹": [1, "k"],
           "Hz": [1, "f"], "kg": [1, "m"]}

REL_SHEET = """
<table><caption class="visually-hidden">Relationships needed for this test</caption>
<thead><tr><th>Quantity</th><th>Relationship</th></tr></thead><tbody>
<tr><td>Angular frequency, and period</td><td class="eqn"><var>ω</var> = 2π<var>f</var>&emsp;<var>T</var> = 1 / <var>f</var>&emsp;<var>T</var> = 2π / <var>ω</var></td></tr>
<tr><td>The condition for SHM</td><td class="eqn"><var>a</var> = d<sup>2</sup><var>y</var>/d<var>t</var><sup>2</sup> = −<var>ω</var><sup>2</sup><var>y</var></td></tr>
<tr><td>Displacement</td><td class="eqn"><var>y</var> = <var>A</var> cos <var>ωt</var>&emsp;or&emsp;<var>y</var> = <var>A</var> sin <var>ωt</var></td></tr>
<tr><td>Velocity at displacement <var>y</var></td><td class="eqn"><var>v</var> = ±<var>ω</var>√(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>)</td></tr>
<tr><td>Kinetic and potential energy</td><td class="eqn"><var>E</var><sub>k</sub> = ½<var>mω</var><sup>2</sup>(<var>A</var><sup>2</sup> − <var>y</var><sup>2</sup>)&emsp;<var>E</var><sub>p</sub> = ½<var>mω</var><sup>2</sup><var>y</var><sup>2</sup></td></tr>
</tbody></table>
<p class="refs-note">The mass–spring result <var>ω</var> = √(<var>k</var>/<var>m</var>)
is <strong>not</strong> on the relationships sheet. The exam gives it to you when it
needs it — or expects you to reach it from <var>F</var> = −<var>ky</var> and
<var>F</var> = <var>ma</var>, which is exactly the derivation in this test.</p>
"""

DATA_SHEET = """
<table><caption class="visually-hidden">Data sheet extract</caption>
<thead><tr><th>Quantity</th><th>Symbol</th><th>Value</th></tr></thead><tbody>
<tr><td>Gravitational acceleration on Earth</td><td class="eqn"><var>g</var></td><td>9.8 m s⁻²</td></tr>
</tbody></table>
"""

# AH gold is 3.25:1 on white, so it can never carry white ink or small text —
# the call-to-action and verdict colours below are darkened from it rather than
# taken from it. White on --cta-1 measures 5.94:1, on --cta-2 8.13:1; --accent-2
# is 5.31:1 as text on --card, which is what the mark-scheme labels need.
EXTRA_CSS = """
:root {
  --cta-1:#8a6508; --cta-2:#6b4e06;
  --good:#15803d; --warm:#9a3412; --bad:var(--warm);
}
@media (prefers-color-scheme: dark) { :root { --good:#5dd693; --warm:#ff9d6e; } }
.backlink { display:inline-flex; align-items:center; gap:.4rem; font-weight:900;
  color:var(--accent-2); text-decoration:none; margin:0 0 .5rem; }
.backlink:focus-visible { outline:3px solid var(--accent); outline-offset:3px; border-radius:6px; }
.dia svg { --dia-page: var(--card); }
.dia svg.osc { max-width: 420px; }
.refs-note { margin:.5rem 0 0; font-size:.9rem; color:var(--muted); font-weight:700; }
.stmts { margin:.5rem 0 .2rem 1.1rem; padding:0; }
.stmts li { margin:.15rem 0; }
/* a derivation is marked line by line, so its scheme is a numbered list and
   each row carries the reason beside the algebra, as the decks do */
.deriv { margin:.4rem 0 .2rem 1.15rem; padding:0; }
.deriv li { margin:.2rem 0; }
"""

CREDIT = ("Sources &amp; credits: questions are adapted from Advanced Higher Physics past "
          "papers, reproduced and adapted for educational use — past papers and marking "
          "instructions &copy; Qualifications Scotland (SQA). Numbers, apparatus and "
          "contexts have been changed, and two questions are original to this site. "
          "Oscillation diagrams and graphs drawn for this site &copy; R Stewart, 2026.")


def apply(meta):
    """Point the shared builder at Advanced Higher, for the test in `meta`."""
    P.use(css="/assets/css/adv-higher-physics.css?v=ah-20261014b",
          progress_js="/assets/js/progress/ah-physics.js",
          banner="/assets/advanced-higher-physics-banner.jpeg",
          banner_alt="Advanced Higher Physics banner",
          theme_light="#f6efdc", theme_dark="#14100a",
          back_href="/classes/adv/practice-tests.html",
          back_label="← Back to Advanced Higher practice tests",
          back_class="backlink",
          subnav=None,
          relationships=RELATIONSHIPS,
          relationships_html=RELATIONSHIPS_HTML,
          rel_key=REL_KEY,
          units=UNITS,
          unit_js=UNIT_JS,
          refs=[("Relationships you may need", REL_SHEET),
                ("Data sheet — the value this test needs", DATA_SHEET)],
          split=(5, 13, 7),
          decimal=".",
          credit=CREDIT,
          source_note="Advanced Higher Physics past papers",
          page_url="mrstewartphysics.co.uk/classes/adv/practice-tests/%s.html"
                   % meta["slug"],
          builder="tools/generators/practice-tests/advanced-higher-physics/"
                  "simple-harmonic-motion/build.py",
          cover_note=("<strong>Have your jotter and a pen beside you.</strong> Do every "
                      "calculation and every derivation in your jotter, showing each line "
                      "exactly as you would in the exam — this page asks you only for the "
                      "relationship you used and your final answer with its unit, and the "
                      "two derivations are marked against the scheme, line by line."),
          mi_palette={"ink": "#8a6508", "rule": "#b8860b", "text": "#1b1b1b",
                      "muted": "#4a4335", "muted2": "#5c5343",
                      "border": "#ddcfa4", "head": "#fbf4de"},
          extra_css=EXTRA_CSS)
