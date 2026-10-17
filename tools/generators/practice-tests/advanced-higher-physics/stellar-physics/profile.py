"""The Advanced Higher Stellar Physics profile for the shared practice-test
builder — SHM's profile (`../simple-harmonic-motion/profile.py`) with the
relationships, units, data sheet and credit line changed for this topic.
Palette, banner, progress namespace and the full-stop decimal are unchanged:
they are Advanced Higher's, not SHM's.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
import pagebuild as P

# The three Stellar Physics relationships plus five a candidate meets on the
# same sheet, so choosing is a real decision rather than a formality.
RELATIONSHIPS = ["P / A = σT⁴", "L = 4πr²σT⁴", "b = L / (4πd²)", "P = E / t",
                 "E = mc²", "d = vt", "F = GMm / r²", "v = √(2GM / r)"]

REL_KEY = {"pa": 0, "lum": 1, "bright": 2, "power": 3, "emc": 4, "dvt": 5,
           "grav": 6, "vesc": 7}

RELATIONSHIPS_HTML = [
    "<var>P</var> / <var>A</var> = <var>σT</var><sup>4</sup>",
    "<var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup>",
    "<var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>)",
    "<var>P</var> = <var>E</var> / <var>t</var>",
    "<var>E</var> = <var>mc</var><sup>2</sup>",
    "<var>d</var> = <var>vt</var>",
    "<var>F</var> = <var>GMm</var> / <var>r</var><sup>2</sup>",
    "<var>v</var> = √(2<var>GM</var> / <var>r</var>)"]

UNITS = ["W", "kW", "W m⁻²", "K", "m", "km", "J", "s"]

# P/A and apparent brightness share W m⁻², so they share a dimension tag
UNIT_JS = {"W": [1, "P"], "kW": [1000, "P"], "W m⁻²": [1, "b"], "K": [1, "T"],
           "m": [1, "d"], "km": [1000, "d"], "J": [1, "E"], "s": [1, "t"]}

REL_SHEET = """
<table><caption class="visually-hidden">Relationships needed for this test</caption>
<thead><tr><th>Quantity</th><th>Relationship</th></tr></thead><tbody>
<tr><td>Power per unit area</td><td class="eqn"><var>P</var> / <var>A</var> = <var>σT</var><sup>4</sup></td></tr>
<tr><td>Luminosity</td><td class="eqn"><var>L</var> = 4π<var>r</var><sup>2</sup><var>σT</var><sup>4</sup></td></tr>
<tr><td>Apparent brightness</td><td class="eqn"><var>b</var> = <var>L</var> / (4π<var>d</var><sup>2</sup>)</td></tr>
</tbody></table>
"""

DATA_SHEET = """
<table><caption class="visually-hidden">Data sheet extract</caption>
<thead><tr><th>Quantity</th><th>Symbol</th><th>Value</th></tr></thead><tbody>
<tr><td>Stefan–Boltzmann constant</td><td class="eqn"><var>σ</var></td><td>5.67 × 10⁻⁸ W m⁻² K⁻⁴</td></tr>
<tr><td>Speed of light in a vacuum</td><td class="eqn"><var>c</var></td><td>3.00 × 10⁸ m s⁻¹</td></tr>
</tbody></table>
<p class="refs-note">The light-year is <strong>not</strong> on the data sheet. Convert
it yourself: 1 ly = 3.00 × 10⁸ × 365.25 × 24 × 60 × 60 m. Using 365 days is
accepted too.</p>
"""

EXTRA_CSS = """
:root {
  --cta-1:#8a6508; --cta-2:#6b4e06;
  --good:#15803d; --warm:#9a3412; --bad:var(--warm);
}
@media (prefers-color-scheme: dark) { :root { --good:#5dd693; --warm:#ff9d6e; } }
.backlink { display:inline-flex; align-items:center; gap:.4rem; font-weight:900;
  color:var(--accent-2); text-decoration:none; margin:0 0 .5rem; }
.backlink:focus-visible { outline:3px solid var(--accent); outline-offset:3px; border-radius:6px; }
.dia svg { --dia-page: var(--card); max-width: 520px; }
.refs-note { margin:.5rem 0 0; font-size:.9rem; color:var(--muted); font-weight:700; }
.discuss { margin:.5rem 0 .2rem; padding:0; list-style:none; }
.discuss li { margin:.35rem 0; }
.star-table { border-collapse:collapse; margin:.4rem 0 .6rem; }
.star-table th, .star-table td { border:1px solid var(--border-soft); padding:.3rem .6rem; text-align:left; }
"""

CREDIT = ("Sources &amp; credits: questions are adapted from Advanced Higher Physics past "
          "papers, reproduced and adapted for educational use — past papers and marking "
          "instructions &copy; Qualifications Scotland (SQA). Stars, numbers and contexts "
          "have been changed, and questions marked as original were written for this site. "
          "H-R diagrams and spectra drawn for this site &copy; R Stewart, 2026. "
          "R Stewart - September 2026.")


def apply(meta, builder):
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
                ("Data sheet — the values this test needs", DATA_SHEET)],
          split=(5, 13, 7),
          decimal=".",
          credit=CREDIT,
          source_note="Advanced Higher Physics past papers",
          page_url="mrstewartphysics.co.uk/classes/adv/practice-tests/%s.html"
                   % meta["slug"],
          builder="tools/generators/practice-tests/advanced-higher-physics/"
                  "stellar-physics/" + builder,
          cover_note=("<strong>Have your jotter and a pen beside you.</strong> Do every "
                      "calculation in your jotter, showing each line exactly as you "
                      "would in the exam. This page asks you only for the relationship "
                      "you used and your final answer with its unit. Written answers "
                      "are marked by you, against the scheme."),
          mi_palette={"ink": "#8a6508", "rule": "#b8860b", "text": "#1b1b1b",
                      "muted": "#4a4335", "muted2": "#5c5343",
                      "border": "#ddcfa4", "head": "#fbf4de"},
          extra_css=EXTRA_CSS)
