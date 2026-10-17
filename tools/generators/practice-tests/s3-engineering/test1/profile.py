"""The S3 Engineering Science profile for the Test 1 practice pair (Contexts and Energy).

These two tests mirror the real test's shape rather than the programme's unit
spec: 30 marks, Section 1 (10 × 1) and Section 2 (20), because rehearsing the
paper pupils will sit is the point (TEST-PLAN §6, teacher 18 Sep 2026). Most
marks are written answers, so they are self-marked; only the two calculations
are marked by the page. Test A and Test B both call `apply()`.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
import pagebuild as P

BOOKLET = "/assets/engineering-science/shared/data-sheets/n4-n5-engineering-science-data-booklet-2.pdf"
HUB = "/classes/s3-engineering/contexts-and-energy.html"

RELATIONSHIPS = ["P = E / t", "E = P t", "η = E out / E in (× 100 for a percentage)",
                 "P = I V", "V = I R"]
REL_KEY = {"power": 0, "energy": 1, "eff": 2, "piv": 3, "ohm": 4}
RELATIONSHIPS_HTML = [
    "<var>P</var> = <var>E</var> / <var>t</var>",
    "<var>E</var> = <var>P</var><var>t</var>",
    "<var>η</var> = <var>E</var><sub>out</sub> / <var>E</var><sub>in</sub> (× 100 for a percentage)",
    "<var>P</var> = <var>I</var><var>V</var>",
    "<var>V</var> = <var>I</var><var>R</var>"]

UNITS = ["J", "kJ", "W", "kW", "s", "%"]
UNIT_JS = {"J": [1, "E"], "kJ": [1000, "E"], "W": [1, "P"], "kW": [1000, "P"],
           "s": [1, "t"], "%": [1, "pc"]}

SECTIONS = [("s1", "Section 1", "Short answers — one mark each."),
            ("s2", "Section 2", "Longer answers. Where a question says "
                                "<em>explain</em>, say what happens <strong>and</strong> why.")]

REFS = [("Data booklet and calculator",
         '<p style="margin:.2rem 0 .6rem;text-align:left">You may use a calculator and the '
         'N4/N5 Engineering Science data booklet, as in the real test. '
         '<a href="%s" target="_blank" rel="noopener">Open the data booklet (PDF)</a>.</p>'
         % BOOKLET)]

EXTRA_CSS = """
:root { --cta-1: #9a5410; --cta-2: #b5441f; --bg2: var(--eng-surface);
  --good: #15803d; --bad: #b91c1c; --radius: var(--eng-radius); --focus-ring: 3px solid rgba(154,84,16,.55);
  --focus-offset: 3px; }
@media (prefers-color-scheme: dark) {
  :root { --good: #5dd693; --bad: #ff9d8a; --focus-ring: 3px solid rgba(245,201,122,.75); } }
main.page-wrap { width: 100%; max-width: 1100px; margin: 0 auto; padding-left: 16px; padding-right: 16px; }
.begin, .finish { box-shadow: 0 8px 20px rgba(154,84,16,.30); }
.dia svg.run { max-width: 460px; }
.dia svg.etd { max-width: 440px; }
.mi svg.etd { --dia-ink: var(--text); display: block; width: 100%; max-width: 420px;
  margin: .5rem 0 .7rem; height: auto; }
@media print { .dia svg.run { max-width: 340px; } .mi:empty { display: none !important; } }
"""

CREDIT = ("Sources &amp; credits: questions written for this site for S3 Engineering Science "
          "Test 1 revision. The N4/N5 Engineering Science Data Booklet is linked, not "
          "reproduced &mdash; &copy; Qualifications Scotland (SQA). Diagrams drawn for this "
          "site. &copy; R Stewart Physics, Electronics and Engineering &middot; R Stewart - "
          "September 2026.")


def apply(meta):
    P.use(css="/assets/css/engineering-science.css?v=eng-20260827b",
          progress_js="/assets/js/progress/eng-s3.js",
          banner="/assets/s3-engineering-science-banner.jpeg",
          banner_alt="S3 Engineering Science banner",
          theme_light="#fbf6ef", theme_dark="#15110b",
          back_href=HUB, back_label="⬅ Back to Contexts and Energy",
          back_class="backlink", subnav=None,
          relationships=RELATIONSHIPS, relationships_html=RELATIONSHIPS_HTML,
          rel_key=REL_KEY, units=UNITS, unit_js=UNIT_JS, refs=REFS,
          sections=SECTIONS, split=(10, 20), powers_note=False, example="42",
          paper_note=("✏️ Write your answers in the boxes — a few words or a sentence is "
                      "enough. Do any working and the energy diagram in your jotter. When "
                      "you finish, the page marks the two calculations and you mark the "
                      "rest against the mark scheme."),
          self_prompt="Compare your answer with the scheme above",
          credit=CREDIT, source_note="questions written for this site",
          page_url="mrstewartphysics.co.uk/classes/s3-engineering/%s.html" % meta["slug"],
          builder="tools/generators/practice-tests/s3-engineering/test1/build.py",
          cover_note=("<strong>Have a pen, your jotter and a calculator beside you.</strong> "
                      "30 marks in 30 minutes — about a minute a mark, like the real test."),
          extra_css=EXTRA_CSS,
          mi_palette={"ink": "#9a5410", "rule": "#b86a17", "text": "#211a0e",
                      "muted": "#6f5238", "muted2": "#7d6348",
                      "border": "#e3cdb2", "head": "#fbf0e4"})
