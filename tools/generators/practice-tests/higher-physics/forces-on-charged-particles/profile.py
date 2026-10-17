"""The Higher Physics profile for the shared practice-test builder.

Everything the course changes about the page lives here: palette, banner,
progress namespace, the relationship picker, the units offered, the data-sheet
extract on the cover and the credit line. Test A and Test B both call
`apply()`, so the pair cannot drift apart.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                "..", "..", "toolkit"))
import pagebuild as P

# The picker offers nine relationships from the Higher relationships sheet.
# Only two are wanted in this topic; the other seven are the ones a candidate
# actually reaches for, so the picker is a real choice rather than a giveaway.
RELATIONSHIPS = ["Ew = QV", "Ek = ½mv²", "W = Fd", "F = ma", "v = u + at",
                 "v² = u² + 2as", "E = mc²", "P = E / t", "V = IR"]

REL_KEY = {"work": 0, "ek": 1, "wfd": 2, "fma": 3, "suvat_v": 4,
           "suvat_v2": 5, "emc2": 6, "power": 7, "ohm": 8}

RELATIONSHIPS_HTML = [
    "<var>E</var><sub>w</sub> = <var>Q</var><var>V</var>",
    "<var>E</var><sub>k</sub> = ½<var>m</var><var>v</var><sup>2</sup>",
    "<var>W</var> = <var>F</var><var>d</var>",
    "<var>F</var> = <var>m</var><var>a</var>",
    "<var>v</var> = <var>u</var> + <var>a</var><var>t</var>",
    "<var>v</var><sup>2</sup> = <var>u</var><sup>2</sup> + 2<var>a</var><var>s</var>",
    "<var>E</var> = <var>m</var><var>c</var><sup>2</sup>",
    "<var>P</var> = <var>E</var> / <var>t</var>",
    "<var>V</var> = <var>I</var><var>R</var>"]

UNITS = ["J", "kJ", "V", "kV", "C", "m s⁻¹", "N", "W"]

UNIT_JS = {"J": [1, "E"], "kJ": [1000, "E"], "V": [1, "V"], "kV": [1000, "V"],
           "C": [1, "Q"], "m s⁻¹": [1, "v"], "N": [1, "F"], "W": [1, "P"]}

REL_SHEET = """
<table><caption class="visually-hidden">Relationships needed for this test</caption>
<thead><tr><th>Quantity</th><th>Relationship</th></tr></thead><tbody>
<tr><td>Work done moving a charge through a p.d.</td><td class="eqn"><var>E</var><sub>w</sub> = <var>Q</var><var>V</var></td></tr>
<tr><td>Kinetic energy</td><td class="eqn"><var>E</var><sub>k</sub> = ½<var>m</var><var>v</var><sup>2</sup></td></tr>
<tr><td>Work done by a force</td><td class="eqn"><var>W</var> = <var>F</var><var>d</var></td></tr>
<tr><td>Force and acceleration</td><td class="eqn"><var>F</var> = <var>m</var><var>a</var></td></tr>
</tbody></table>
<p class="refs-note">A charged particle accelerated from rest reaches a speed given by
<var>QV</var> = ½<var>m</var><var>v</var><sup>2</sup>. That rearrangement is
<strong>not</strong> on the relationships sheet — you are expected to derive it from these
two lines.</p>
"""

DATA_SHEET = """
<table><caption class="visually-hidden">Data sheet extract</caption>
<thead><tr><th>Quantity</th><th>Symbol</th><th>Value</th></tr></thead><tbody>
<tr><td>Magnitude of the charge on an electron</td><td class="eqn"><var>e</var></td><td>1·60 × 10⁻¹⁹ C</td></tr>
<tr><td>Mass of electron</td><td class="eqn"><var>m</var><sub>e</sub></td><td>9·11 × 10⁻³¹ kg</td></tr>
<tr><td>Mass of proton</td><td class="eqn"><var>m</var><sub>p</sub></td><td>1·673 × 10⁻²⁷ kg</td></tr>
<tr><td>Mass of alpha particle</td><td class="eqn"><var>m</var><sub>α</sub></td><td>6·645 × 10⁻²⁷ kg</td></tr>
</tbody></table>
"""

# `.backlink` is defined per page on the Higher pages rather than in the
# stylesheet, so the profile carries it; `--dia-page` gives a drawn particle an
# opaque middle so a field line cannot show through it.
EXTRA_CSS = """
/* higher-physics.css has no call-to-action, verdict or warning tokens — S3's
   sheet does, and the shared template expects them. Defined here in the Higher
   palette rather than added to the site stylesheet, so nothing else on the
   course moves. White ink on --cta-1 measures 5.20:1 in light and 5.12:1 in
   dark; on --cta-2, 8.8:1 and higher. */
:root {
  --cta-1:#0a6fbf; --cta-2:#084c85;
  --good:#15803d; --warm:#c2410c; --bad:var(--warm);
}
@media (prefers-color-scheme: dark) {
  :root {
    --cta-1:#1a72b3; --cta-2:#124e7d;
    --good:#5dd693; --warm:#ff9d6e; --bad:var(--warm);
  }
}
.backlink { display:inline-flex; align-items:center; gap:.4rem; font-weight:900;
  color:var(--accent-2); text-decoration:none; margin:0 0 .5rem; }
.backlink:focus-visible { outline:3px solid var(--accent); outline-offset:3px; border-radius:6px; }
.dia svg { --dia-page: var(--card); }
.dia svg.fld { max-width: 420px; }
.refs-note { margin:.5rem 0 0; font-size:.9rem; color:var(--muted); font-weight:700; }
.stmts { margin:.5rem 0 .2rem 1.1rem; padding:0; }
.stmts li { margin:.15rem 0; }
"""

CREDIT = ("Sources &amp; credits: questions are adapted from Higher Physics past papers, "
          "reproduced and adapted for educational use — past papers and marking "
          "instructions &copy; Qualifications Scotland (SQA). Numbers, particles and "
          "contexts have been changed, and one question is original to this site. "
          "Field and accelerator diagrams drawn for this site &copy; R Stewart, 2026.")


def apply(meta):
    """Point the shared builder at Higher, for the test described by `meta`."""
    P.use(css="/assets/css/higher-physics.css?v=hp-20261014b",
          progress_js="/assets/js/progress/higher-physics.js",
          banner="/assets/higher-physics-banner.jpeg",
          banner_alt="Higher Physics banner",
          theme_light="#eef8ff", theme_dark="#0a0f1f",
          back_href="/classes/higher/practice-tests.html",
          back_label="← Back to Higher practice tests",
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
          credit=CREDIT,
          source_note="Higher Physics past papers",
          page_url="mrstewartphysics.co.uk/classes/higher/practice-tests/%s.html"
                   % meta["slug"],
          builder="tools/generators/practice-tests/higher-physics/"
                  "forces-on-charged-particles/build.py",
          cover_note=("<strong>Have your jotter and a pen beside you.</strong> Do every "
                      "calculation in your jotter, showing the relationship, the "
                      "substitution and the final answer with its unit, exactly as you "
                      "would in the exam — this page asks you only for the relationship "
                      "you used and your final answer."),
          mi_palette={"ink": "#0a5c9e", "rule": "#0a6fbf", "text": "#0b1630",
                      "muted": "#3f5a7d", "muted2": "#4d688c",
                      "border": "#c3d5e8", "head": "#eaf2fb"},
          extra_css=EXTRA_CSS)
