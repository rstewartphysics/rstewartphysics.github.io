"""The Higher Physics profile for the Electricity unit pair.

Forked from the Forces on Charged Particles profile, which stays as it is: the
palette, banner, back link and print palette are the same, and only the parts a
unit test changes differ — the relationship picker, the answer units, the
reference sheet, and the 8/24/13 split of a 45-mark unit test (plan §2).
Test A and Test B both call `apply()`, so the pair cannot drift apart.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
import importlib.util
import pagebuild as P

# both files are called profile.py, so the Particles one is loaded by path
_spec = importlib.util.spec_from_file_location(
    "focp_profile", os.path.join(HERE, "..", "forces-on-charged-particles", "profile.py"))
FOCP = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(FOCP)

# The Electricity lines of the Higher relationships sheet, in the sheet's own
# order. Every line is offered on every calculation, so the picker is a real
# choice between the three power and three energy forms.
RELATIONSHIPS = ["V peak = √2 V rms", "I peak = √2 I rms", "T = 1 / f", "Q = It",
                 "V = IR", "P = IV", "P = I²R", "P = V² / R",
                 "R T = R₁ + R₂ + …", "1 / R T = 1 / R₁ + 1 / R₂ + …",
                 "E = V + Ir", "V₁ = (R₁ / (R₁ + R₂)) V S", "C = Q / V",
                 "E = ½QV", "E = ½CV²", "E = ½Q² / C"]

REL_KEY = {"vpeak": 0, "ipeak": 1, "period": 2, "charge": 3, "ohm": 4,
           "p_iv": 5, "p_i2r": 6, "p_v2r": 7, "series": 8, "parallel": 9,
           "emf": 10, "divider": 11, "cap": 12, "e_qv": 13, "e_cv2": 14,
           "e_q2c": 15}

_V, _I = "<var>V</var>", "<var>I</var>"
RELATIONSHIPS_HTML = [
    "%s<sub>peak</sub> = √2 %s<sub>rms</sub>" % (_V, _V),
    "%s<sub>peak</sub> = √2 %s<sub>rms</sub>" % (_I, _I),
    "<var>T</var> = 1 / <var>f</var>",
    "<var>Q</var> = %s<var>t</var>" % _I,
    "%s = %s<var>R</var>" % (_V, _I),
    "<var>P</var> = %s%s" % (_I, _V),
    "<var>P</var> = %s<sup>2</sup><var>R</var>" % _I,
    "<var>P</var> = %s<sup>2</sup> / <var>R</var>" % _V,
    "<var>R</var><sub>T</sub> = <var>R</var><sub>1</sub> + <var>R</var><sub>2</sub> + …",
    "1 / <var>R</var><sub>T</sub> = 1 / <var>R</var><sub>1</sub> + 1 / <var>R</var><sub>2</sub> + …",
    "<var>E</var> = %s + %s<var>r</var>" % (_V, _I),
    "%s<sub>1</sub> = (<var>R</var><sub>1</sub> / (<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>)) %s<sub>S</sub>" % (_V, _V),
    "<var>C</var> = <var>Q</var> / %s" % _V,
    "<var>E</var> = ½<var>Q</var>%s" % _V,
    "<var>E</var> = ½<var>C</var>%s<sup>2</sup>" % _V,
    "<var>E</var> = ½<var>Q</var><sup>2</sup> / <var>C</var>"]

UNITS = ["V", "mV", "A", "mA", "Ω", "kΩ", "W", "J", "C", "mC", "F", "μF",
         "Hz", "s", "ms"]

UNIT_JS = {"V": [1, "V"], "mV": [0.001, "V"], "A": [1, "I"], "mA": [0.001, "I"],
           "Ω": [1, "R"], "kΩ": [1000, "R"], "W": [1, "P"], "J": [1, "E"],
           "C": [1, "Q"], "mC": [0.001, "Q"], "F": [1, "C"], "μF": [1e-6, "C"],
           "Hz": [1, "f"], "s": [1, "t"], "ms": [0.001, "t"]}

REL_SHEET = """
<table><caption class="visually-hidden">Relationships needed for this test</caption>
<thead><tr><th>Quantity</th><th>Relationship</th></tr></thead><tbody>
<tr><td>Peak and r.m.s.</td><td class="eqn">%s<br>%s</td></tr>
<tr><td>Period and frequency</td><td class="eqn">%s</td></tr>
<tr><td>Charge and current</td><td class="eqn">%s</td></tr>
<tr><td>Resistance and power</td><td class="eqn">%s<br>%s = %s = %s</td></tr>
<tr><td>Combining resistors</td><td class="eqn">%s<br>%s</td></tr>
<tr><td>E.m.f. and internal resistance</td><td class="eqn">%s</td></tr>
<tr><td>Potential divider</td><td class="eqn">%s</td></tr>
<tr><td>Capacitance and energy stored</td><td class="eqn">%s<br>%s = %s = %s</td></tr>
</tbody></table>
""" % (RELATIONSHIPS_HTML[0], RELATIONSHIPS_HTML[1], RELATIONSHIPS_HTML[2],
       RELATIONSHIPS_HTML[3], RELATIONSHIPS_HTML[4], RELATIONSHIPS_HTML[5],
       RELATIONSHIPS_HTML[6].split(" = ")[1], RELATIONSHIPS_HTML[7].split(" = ")[1],
       RELATIONSHIPS_HTML[8], RELATIONSHIPS_HTML[9], RELATIONSHIPS_HTML[10],
       RELATIONSHIPS_HTML[11], RELATIONSHIPS_HTML[12], RELATIONSHIPS_HTML[13],
       RELATIONSHIPS_HTML[14].split(" = ")[1], RELATIONSHIPS_HTML[15].split(" = ")[1])

EXTRA_CSS = FOCP.EXTRA_CSS + """
.dia .opt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr));
  gap:.8rem 1rem; align-items:end; }
.dia .opt-grid figure { margin:0; text-align:center; }
.dia .opt-grid figcaption { font-weight:900; margin-bottom:.2rem; }
/* a width, not a max-width: with width="100%" on the element and only a
   max-width here, Chrome sizes the height from the unclamped width and leaves
   a band of empty figure under every circuit */
.dia svg.ckt { width:min(100%, 420px); max-width:none; }
@media print { .dia svg.ckt { width:min(100%, 300px); } }
"""

CREDIT = ("Sources &amp; credits: questions are adapted from Higher Physics past papers, "
          "reproduced and adapted for educational use — past papers and marking "
          "instructions &copy; Qualifications Scotland (SQA). Numbers, circuits and "
          "contexts have been changed, and some questions are original to this site. "
          "Circuit diagrams, oscilloscope traces, graphs and band diagrams drawn for this "
          "site &copy; R Stewart Physics, Electronics and Engineering, 2026.")


def apply(meta):
    FOCP.apply(meta)
    P.use(relationships=RELATIONSHIPS,
          relationships_html=RELATIONSHIPS_HTML,
          rel_key=REL_KEY,
          units=UNITS,
          unit_js=UNIT_JS,
          refs=[("Relationships you may need", REL_SHEET)],
          split=(8, 24, 13),
          credit=CREDIT,
          builder="tools/generators/practice-tests/higher-physics/electricity/build.py",
          extra_css=EXTRA_CSS)
