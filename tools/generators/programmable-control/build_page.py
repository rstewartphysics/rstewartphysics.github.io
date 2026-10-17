#!/usr/bin/env python3
"""Build the N5 Engineering Science Booklet 4b page (WEB-PLAN.md, decisions W1-W8).

    python3 build_page.py [--out <repo root>] [--copy-assets] [--recut]

Writes classes/n5-engineering/programmable-control.html into this repo. --copy-assets and
--recut read the Mac-only sources (photos, practical sheets on OneDrive, the lesson decks);
without them the page builds from the repo alone. Generated:
edit the section modules here, never the HTML. Shell after checkpoint-revision.html (newest N5
Eng standard); topic-page parts after energy-and-efficiency.html; task JS after the July Logic
page. Widget state prefix n5p4b-; progress badge eng-programmable.
"""
import argparse
import os
import re

import assets
import closing
import pdfsvg
import sec1
import sec2
import sec3
import sec4

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", "..", ".."))
PAGE = "classes/n5-engineering/programmable-control.html"
EMOJI = "[\U0001F300-\U0001FAFF\u2600-\u26FF\u2B50\u2B55\uFE0F]"   # real emoji only; ✓ ✗ are marks

SECTIONS = [sec1, sec2, sec3, sec4, closing]

CSS = r"""
    .warn { max-width: 52ch; }
    :root { --page-accent: var(--eng-orange); --menu-accent: var(--eng-orange);
            --good: #15803d; --bad: #b91c1c; --fc-fill: var(--eng-surface); --hl: rgba(232,146,58,.28); }
    @media (prefers-color-scheme: dark) { :root { --good: #5dd693; --bad: #ff9d8a; --hl: rgba(245,201,122,.22); } }
    :root { --key-bg: rgba(242,140,40,.09); --key-bd: rgba(242,140,40,.42); --do-bg: rgba(242,140,40,.05); }
    @media (prefers-color-scheme: dark) { :root { --key-bg: rgba(245,201,122,.13); --key-bd: rgba(245,201,122,.42); --do-bg: rgba(245,201,122,.09); } }
    /* topic-page parts the July page kept inline (energy-and-efficiency.html template) */
    .keypoint { margin: .35rem 0 0; padding: .75rem .95rem; max-width: 64ch; background: var(--key-bg);
                border: 1px solid var(--key-bd); border-left: 4px solid var(--eng-orange); border-radius: 0 12px 12px 0;
                color: var(--eng-text); font-weight: 600; line-height: 1.6; }
    .practice { border: 1px solid var(--eng-border); border-left: 5px solid var(--eng-orange); border-radius: 12px;
                background: var(--do-bg); padding: .75rem .9rem; margin-top: 1.2rem; }
    .widget { margin-top: 1.2rem; padding: 1rem; border: 1px solid var(--key-bd); border-radius: 14px; background: var(--do-bg); }
    details.reveal .reveal-body { padding: .65rem .8rem; color: var(--eng-text); line-height: 1.6; }
    .sec .dual { align-items: start; margin-top: 1.2rem; }
    .dual.wide-fig { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); }
    @media (max-width: 820px) { .dual.wide-fig { grid-template-columns: minmax(0, 1fr); } }
    .reveal .fc { max-width: 440px; }
    /* flowcharts: drawn in currentColor so they follow the appearance */
    .fc { width: 100%; height: auto; display: block; color: var(--eng-text); max-width: 300px; margin: 0 auto; }
    .fc text { fill: currentColor; font-family: inherit; }
    .fc .fc-box rect, .fc .fc-box polygon, .fc .fc-box path { fill: var(--fc-fill); stroke: currentColor; stroke-width: 1.8; }
    .fc .fc-line { fill: none; stroke: currentColor; stroke-width: 1.8; }
    .fc .fc-arrow { fill: currentColor; }
    .fc g[data-step].on .fc-box rect, .fc g[data-step].on .fc-box polygon { fill: var(--hl); stroke-width: 3; }
    .fig-pair { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: .8rem; align-items: start; }
    @media (max-width: 560px) { .fig-pair { grid-template-columns: minmax(0, 1fr); } }
    /* program listings in the exam's form: line number, label, instruction */
    ol.prog { list-style: none; margin: .4rem 0; padding: .5rem .6rem; border: 1px solid var(--eng-border);
              border-radius: 10px; background: var(--eng-surface); counter-reset: ln; }
    ol.prog li { counter-increment: ln; display: grid; grid-template-columns: 2ch 7.5ch minmax(0, 1fr);
                 gap: .5ch; padding: .1rem .3rem; border-radius: 6px; }
    ol.prog li::before { content: counter(ln); color: var(--eng-muted); text-align: right; }
    ol.prog[start] { counter-reset: ln calc(var(--start, 1) - 1); }
    ol.prog .lab { font-weight: 700; }
    ol.prog li.on { background: var(--hl); outline: 2px solid var(--eng-ink-accent); }
    .step-ctl { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .5rem; }
    .step-say { font-weight: 700; min-height: 1.5em; }
    .lamp-dot { display: inline-block; width: .9em; height: .9em; border-radius: 50%; border: 2px solid currentColor;
                vertical-align: -.1em; margin-right: .3em; }
    .lamp-dot.lit { background: #f59e0b; border-color: #b45309; }
    /* tap-to-answer questions: every option gives feedback (DECK-RULES 42) */
    .mcq { margin-top: .8rem; padding: .7rem; border: 1px solid var(--eng-border); border-radius: 12px; background: var(--eng-surface); }
    .mcq .qstem { margin: 0 0 .5rem; font-weight: 900; color: var(--eng-text); }
    .mcq-opts { display: grid; gap: .4rem; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); }
    .mcq-opt { display: flex; align-items: center; gap: .5rem; width: 100%; min-height: 48px; padding: .5rem .7rem;
               border: 1.5px solid var(--eng-border); border-radius: 10px; background: var(--eng-surface);
               color: var(--eng-text); font: inherit; font-weight: 700; text-align: left; cursor: pointer;
               touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
    .mcq-opt:focus-visible { outline: 3px solid var(--eng-ink-teal); outline-offset: 2px; }
    .mcq-opt.right { border-color: var(--good); background: rgba(21,128,61,.12); }
    .mcq-opt.right::after { content: "right"; margin-left: auto; color: var(--good); font-weight: 900; }
    .mcq-opt.wrong { border-color: var(--bad); background: rgba(185,28,28,.10); }
    .mcq-opt.wrong::after { content: "not this one"; margin-left: auto; color: var(--bad); font-weight: 900; }
    .mcq-fb { margin: .5rem 0 0; padding: .5rem .7rem; border-radius: 10px; background: var(--eng-surface-2); }
    .mcq-fb:empty { display: none; }
    .ma-line { display: flex; gap: .8rem; justify-content: space-between; border-bottom: 1px dashed var(--eng-border); padding: .25rem 0; }
    .ma-line .mk { font-weight: 900; color: var(--eng-ink-accent); white-space: nowrap; }
    .slot { display: inline-flex; align-items: center; justify-content: center; gap: .35rem; min-height: 48px; min-width: 240px;
            padding: .4rem .6rem; border: 2px dashed var(--eng-border); border-radius: 10px; background: var(--eng-surface);
            color: var(--eng-muted); font-family: inherit; font-weight: 900; font-size: .92rem; cursor: pointer;
            -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    .bank { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .7rem; justify-content: center; }
    pre.code { margin: .5rem 0; padding: .6rem .75rem; border: 1px solid var(--eng-border); border-radius: 10px;
               background: var(--eng-surface); white-space: pre; overflow-x: auto; font-size: .92rem; line-height: 1.45; }
    .deckfig { width: 100%; height: auto; display: block; color: var(--eng-text); max-width: 560px; margin: 0 auto; }
    .dual-fig figure { margin: 0 0 1rem; }
    .dual-fig figcaption, .sector figcaption, figure.board figcaption { font-size: .92rem; color: var(--eng-muted); margin-top: .3rem; }
    figure.board img, .dual-fig img { width: 100%; height: auto; display: block; border-radius: 10px; border: 1px solid var(--eng-border); }
    .sector-grid { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); margin-top: .6rem; }
    .sector { margin: 0; }
    .sector img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; border-radius: 10px; }
    .sector .credit { display: block; font-size: .8rem; }
    .sector .credit a { color: var(--eng-ink-teal); }
    .case-grid { display: grid; gap: .9rem; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); margin-top: .6rem; }
    .case { border: 1px solid var(--eng-border); border-radius: 12px; padding: .7rem .8rem; background: var(--eng-surface); }
    .case h4 { margin: 0 0 .3rem; color: var(--eng-ink-accent); }
    .case figure { margin: .4rem 0 0; }
    .case .deckfig { max-width: 220px; }
    .symtbl .symcell { width: 120px; }
    .fc-sym { max-width: 110px; margin: 0; }
    .fc-ans .fc, .reveal .fc { max-width: 380px; }
    .gloss { display: grid; gap: .7rem; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); margin: .6rem 0 0; }
    .gl-item { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: .1rem .7rem; align-items: center;
               border: 1px solid var(--eng-border); border-radius: 12px; padding: .5rem .7rem; background: var(--eng-surface); }
    .gl-pic { grid-row: span 2; color: var(--eng-text); }
    .gl-pic .fc-sym { max-width: 70px; }
    .gl-ic { width: 48px; height: 48px; color: var(--eng-ink-accent); }
    .gloss dt { font-weight: 900; color: var(--eng-text); }
    .gloss dd { margin: 0; }
    .match-row code.match-q { font-size: .95rem; }
    .trace td select { min-height: 44px; font: inherit; }
    .code3 { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); }
    .code3 h4 { margin: 0 0 .3rem; color: var(--eng-ink-accent); }
    .code3 pre { margin: 0; padding: .6rem; border: 1px solid var(--eng-border); border-radius: 10px;
                 background: var(--eng-surface); white-space: pre-wrap; font-size: .95rem; }
"""

JS_COLLAPSE = open(os.path.join(HERE, "js_common.js")).read()


def shell(sections, data_booklet_link):
    navs = [n for m in sections for n in getattr(m, "NAVS", [(m.ID, m.NAV)])]
    subnav = "".join(f'\n        <a class="subnav-link" href="#{i}">{n}</a>' for i, n in navs)
    body = "\n".join(m.html() for m in sections)
    js = "\n".join(getattr(m, "JS", "") for m in sections)
    return f"""---
layout: none
title: Programmable Control — National 5 Engineering Science
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#fbf6ef" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#15110b" media="(prefers-color-scheme: dark)" />
  <title>Programmable Control — National 5 Engineering Science</title>
  {{% include site-head-icons.html %}}
  <!-- generated by ~/claude-work/n5-engineering/b4b/web/build_page.py: edit there, not here -->
  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <script src="/assets/js/site-menu.js" defer></script>
  <script src="/assets/js/progress.js" defer></script>
  <script src="/assets/js/progress/eng-n5.js" defer></script>
  <link rel="stylesheet" href="/assets/css/engineering-science.css?v=eng-20261014c">
  <link rel="stylesheet" href="/assets/css/engineering-topic.css?v=engt-20261014a">
  <link rel="stylesheet" href="/assets/css/reading.css">
  <style>{CSS}  </style>
</head>
<body class="reading">
  {{% include site-menu.html %}}
  {{% include resource-icons.html %}}
  {{% include eng-icons.html %}}

  <header class="band-banner">
    <span class="bb-chip" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><use href="#ic-mcu"/></svg></span>
    <div>
      <h1>Programmable Control</h1>
      <p>N5 Engineering Science · Booklet 4b</p>
    </div>
  </header>

  <div class="subnav-wrap">
    <nav class="subnav" aria-label="Jump to sections">
      <div class="subnav-links">{subnav}
      </div>
      <a class="subnav-cta" href="/classes/n5-engineering-science.html">N5 hub</a>
    </nav>
  </div>

  <main class="container" id="mainContent">
    <a class="backlink" href="/classes/n5-engineering-science.html">← Back to N5 Engineering Science</a>

    <div class="panel-pair">
      <section class="panel" id="about" aria-labelledby="about-title">
        <h2 id="about-title">What this topic is</h2>
        <p>A microcontroller is a small computer on one chip. It reads its inputs, follows a program and switches its outputs.</p>
        <p>You plan the program as a flowchart, read it as numbered lines the way the exam prints it, then build it on an Arduino Uno and test it.</p>
      </section>
      <section class="panel" id="resources" aria-labelledby="resources-title">
        <h2 id="resources-title">Slides and resources</h2>
        <p>Every lesson's slides, with and without answers.</p>
        <div class="btnrow">
          <a class="reslink" href="/classes/n5-engineering/slides.html#b4b"><svg class="res-ic" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#ic-slides"/></svg>Booklet 4b slides</a>
          {data_booklet_link}
        </div>
      </section>
    </div>

{body}

    <p data-credit-note style="max-width:1100px;margin:0.5rem auto 0;padding:0 12px;font-size:0.82rem;opacity:0.78;">Sources &amp; credits: the text, programs, flowcharts, wiring and breadboard drawings are by R Stewart, written for Booklet 4b. Past paper references, marking instruction wording and the course specification © Qualifications Scotland (SQA). Photos via Wikimedia Commons: Infrastorian (CC0), SimónK (CC BY-SA 4.0), Leif Jørgensen (CC BY-SA 4.0), Danielrosehill (CC BY 4.0). NoSyntaxSim V2 by Peter Strain (NoStrainSims). R Stewart - October 2026.</p>
  </main>

  {{% include site-footer.html %}}

  <script>
  (function(){{
    "use strict";
    var KEY = "n5p4b-";
    function save(k,v){{ try{{ localStorage.setItem(KEY+k, JSON.stringify(v)); }}catch(e){{}} }}
    function load(k,d){{ try{{ var x=localStorage.getItem(KEY+k); return x?JSON.parse(x):d; }}catch(e){{ return d; }} }}
    function $(id){{ return document.getElementById(id); }}
    function award(id, ok){{ if(!window.Progress) return; if(ok) window.Progress.complete(id); else window.Progress.miss(); }}
    document.addEventListener("DOMContentLoaded", function(){{ if(window.Progress) window.Progress.markSeen("eng-programmable"); }});
{JS_COLLAPSE}
{js}
  }})();
  </script>
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=REPO)
    ap.add_argument("--copy-assets", action="store_true")
    ap.add_argument("--recut", action="store_true")
    a = ap.parse_args()
    cp = open(os.path.join(a.out, "classes/n5-engineering/checkpoint-revision.html")).read()
    m = re.search(r'<a class="reslink" href="/assets/engineering-science/shared/data-sheets/[^\n]*?</a>', cp)
    if a.copy_assets:
        assets.copy_all(a.out)
    if a.recut:
        pdfsvg.recut()
    html = shell(SECTIONS, m.group(0).replace("PDF · formulae", "PDF · flowchart symbols p.6"))
    if re.search(EMOJI, html):
        raise SystemExit("emoji in the page (site rule: none outside the progress tool)")
    out = os.path.join(a.out, PAGE)
    open(out, "w").write(html)
    print("wrote", out, f"({len(html) // 1024} KB)")


if __name__ == "__main__":
    main()
