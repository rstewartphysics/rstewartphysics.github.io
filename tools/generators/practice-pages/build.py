"""Practice pages: one per deck part (DECK-RULES rule 99 draft; ODU6-PRACTICE-PLAN.md).

    python3 tools/generators/practice-pages/build.py            every src/*.json
    python3 tools/generators/practice-pages/build.py h-odu6-1   one page

Each src/<id>.json lists the real SQA items for the part: crops already in /assets, keys,
feedback for every option, Scotland facility where one exists. Never edit the page.
Standard library only (CI re-runs it).
"""
import html
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
LETTERS = "ABCDE"

# Course chrome. A page's JSON may carry "course": {...}; Higher is the default, so the Higher
# pages are unchanged. AH added 23 Nov 2026 (j 3.1b Magnetic Fields).
COURSE = {
    "name": "Higher Physics", "short": "Higher",
    "progress": "/assets/js/progress/higher-physics.js",
    "css": "/assets/css/higher-physics.css?v=hp-20261014b",
    "bb": "higher",  # drawn banner subject, _includes/band-banner.html
    "lessons": "/classes/higher/slides.html",
    "p2_title": "Paper 2 questions", "theme_dark": "#0a0f1f",
}


def q(s):
    return s.replace('"', "&quot;")


def band(fac):
    """Teacher, 23 Nov 2026: only items with a real Scotland mean are rated."""
    if fac is None:
        return None
    return "Core" if fac >= 0.70 else "Middle" if fac >= 0.50 else "Challenge"


def weighted(item):
    """A multi-part question is placed by its mark-weighted facility (Phase 0 §0)."""
    parts = [p for p in item.get("parts", []) if p.get("facility") is not None]
    if parts:
        item["facility"] = sum(p["facility"] * p["marks"] for p in parts) / sum(p["marks"] for p in parts)
    return item


def order(items):
    items = [weighted(i) for i in items]
    rated = sorted((i for i in items if i.get("facility") is not None), key=lambda i: -i["facility"])
    rest = sorted((i for i in items if i.get("facility") is None), key=lambda i: -i["year"])
    return rated + rest


def esc(s):
    return html.escape(s, quote=True)


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s)


def img(d, cls="pp-img"):
    """A tall crop may come as "pieces" cut at paragraph gaps, so each prints on one A4 page;
    on screen they stack as one picture and the first carries the alt text."""
    if d.get("text") and not (d.get("img") or d.get("pieces")):
        return f'<div class="pp-text">{d["text"]}</div>'   # ORIGINAL item, no crop (S3, rule 99a)
    ps = d.get("pieces") or [d]
    tags = "".join(
        f'<img class="{cls}{" pp-piece" if len(ps) > 1 else ""}" src="{p["img"]}" width="{p["w"]}" height="{p["h"]}" '
        f'loading="lazy" style="--minw:{d["minw"]}px" alt="{esc(d["alt"]) if k == 0 else ""}">'
        for k, p in enumerate(ps))
    return f'<div class="pan">{tags}</div>'


def chip(item):
    if item.get("parts"):
        chips = "".join(
            f'<span class="band-part">{p["label"]}</span><span class="band band-{band(p["facility"]).lower()}">'
            f'{band(p["facility"])}</span>' for p in item["parts"])
        pcts = ", ".join(f'{round(p["facility"] * 100)}%' for p in item["parts"])
        return chips + f'<span class="band-note">{pcts} of marks scored in Scotland</span>'
    b = band(item.get("facility"))
    if not b:
        return ""
    pct = round(item["facility"] * 100)
    return (f'<span class="band band-{b.lower()}">{b}</span>'
            f'<span class="band-note">{pct}% of marks scored in Scotland</span>')


def cloze(c):
    n = [0]

    def gap(m):
        opts = m.group(1).split("|")
        n[0] += 1
        o = "".join(f"<option>{esc(x)}</option>" for x in sorted(opts, key=str.lower))
        return (f'<select class="cl-sel" data-answer="{esc(opts[0])}" aria-label="gap {n[0]}">'
                f'<option value="">…</option>{o}</select>')

    paras = [re.sub(r"\[\[([^\]]+)\]\]", gap, para) for para in c["text"].split("\n\n")]
    body = "".join(f'<p class="cl-text">{p}</p>' for p in paras)
    return f'''<div class="prog-cloze" data-prog-challenge="{c["id"]}" aria-label="Fill the gaps">
        <h3>{c["title"]}</h3>
        {body}
        <div class="btnrow"><button class="btn primary cl-check" type="button">Check</button><button class="btn cl-reset" type="button">Reset</button></div>
        <p class="fb-line" aria-live="polite"></p>
      </div>'''


def cloze_answers(c):
    gaps = re.findall(r"\[\[([^\]|]+)", c["text"])
    return " · ".join(f"({i}) {esc(g)}" for i, g in enumerate(gaps, 1))


def mc(q, n):
    opts = "".join(
        f'<button class="opt pp-opt" type="button" data-l="{L}" aria-label="Answer {L}">{L}</button>'
        for L in LETTERS)
    fbs = "".join(f'<template data-l="{L}">{f}</template>' for L, f in zip(LETTERS, q["fb"]))
    return f'''<article class="q pp-mc" id="{q["id"]}" data-key="{q["key"]}">
          <p class="qno">{n}. {q["ref"]} <span class="marks">({q["marks"]} mark)</span></p>
          {img(q)}
          <div class="opts pp-opts" role="group" aria-label="Question {n}: choose A to E">{opts}</div>
          <p class="q-fb" aria-live="polite" hidden></p>
          {fbs}
        </article>'''


def p2(q, n):
    m = "mark" if q["marks"] == 1 else "marks"
    return f'''<article class="q pp-p2" id="{q["id"]}">
          <p class="qno">{n}. {q["ref"]} <span class="marks">({q["marks"]} {m})</span> {chip(q)}</p>
          {f'<p class="lead-note">{q["lead"]}</p>' if q.get("lead") else ""}{img(q)}
          <details class="reveal"><summary>Show the marking</summary><div class="reveal-body">{mi_body(q)}</div></details>
        </article>'''


def mi_body(q, cls="pp-img"):
    if q.get("mi"):
        return img(q["mi"], cls)
    return f'<p class="mi-note">{q["mi_note"]}</p>'


def answers(d, warm, mcs, p2s):
    out = [f'<h3>Say it the exam way</h3><p>{cloze_answers(d["cloze"])}</p>']
    for n, q in enumerate(warm + mcs, 1):
        fb = "".join(f"<li><b>{L}</b> {f}</li>" for L, f in zip(LETTERS, q["fb"]))
        out.append(f'<div class="ans-mc"><h3>{q["ref"]}: answer {q["key"]}</h3><ul>{fb}</ul></div>')
    for q in p2s:
        out.append(f'<div class="ans-p2"><h3>{q["ref"]}</h3>{mi_body(q, "pp-img print-mi")}</div>')
    return "\n        ".join(out)


def answers_href(d):
    """DECK-RULES 29a: the answers copy is <name>-answers.pdf beside the plain file."""
    return d["deck"]["href"][:-4] + "-answers.pdf"


def page(d):
    warm, mcs, p2s = order(d.get("warmup_mc", [])), order(d.get("mc", [])), order(d["paper2"])
    warm_p2 = order(d.get("warmup_p2", []))
    s = d["store"]
    ican = "".join(f"<li>{x}</li>" for x in d["ican"])
    warm_html = "\n        ".join([mc(q, i) for i, q in enumerate(warm, 1)]
                                  + [p2(q, i) for i, q in enumerate(warm_p2, len(warm) + 1)])
    mc_html = "\n        ".join(mc(q, i) for i, q in enumerate(mcs, 1))
    p2_html = "\n        ".join(p2(q, i) for i, q in enumerate(p2s, 1))
    p2_hint = ("Answer on paper first. Then open the marking and mark your own answer." if p2s
               else d["paper2_note"])
    done = "; ".join(esc(x) for x in d["done_in_class"])
    errs = d.get("errors", [])
    errors_section = ("" if not errs else
        '\n    <section class="panel" id="errors" aria-labelledby="err-title">\n'
        '      <h2 id="err-title">Errors that cost marks</h2>\n'
        '      <ul class="err-list">' + "".join(f"<li>{esc(e)}</li>" for e in errs) + '</ul>\n'
        '    </section>')
    more = "".join(
        (f'<li><a class="try-link" href="{k["href"]}" target="_blank" rel="noopener">{esc(k["label"])} '
         f'<span aria-hidden="true">↗</span></a>' if k.get("href") else
         f'<li><span class="more-label">{esc(k["label"])}</span>')
        + f'<span class="more-role">{esc(k["role"])}</span></li>'
        for k in d["keep_going"])
    cred = "; ".join(d["credits"])
    n_mc = len(warm) + len(mcs)
    title_plain = strip_tags(d["title"])
    c = {**COURSE, **d.get("course", {})}
    mc_section = f'''
    <section class="panel" id="mc" aria-labelledby="mc-title">
      <h2 id="mc-title">Multiple choice</h2>
      <p class="hint">Real {c["short"]} questions, 1 mark each. Tap A to E. Each answer tells you why it is right or wrong.</p>
      <div class="pp-list">
        {mc_html}
      </div>
      <div class="pp-score" data-prog-challenge="mc-all" data-pp-total="{n_mc}">
        <p class="score" id="pp-score" aria-live="polite"></p>
        <button class="pp-reset" type="button" id="pp-reset">Reset my answers</button>
      </div>
    </section>
''' if n_mc else ""
    warm_list = f'''
      <div class="pp-list">
        {warm_html}
      </div>''' if warm_html else ""
    return f'''---
layout: none
title: {title_plain} — {c["name"]}
search_keywords: {d["search_keywords"]}
---
<!-- Generated by tools/generators/practice-pages/build.py from src/{d["_id"]}.json. Do not edit. -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="{d["theme_color"]}" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="{c["theme_dark"]}" media="(prefers-color-scheme: dark)" />

  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <link rel="stylesheet" href="/assets/css/band-banner.css?v=bb-20261126b">
  <script src="/assets/js/site-menu.js" defer></script>
  <script src="/assets/js/progress.js" defer></script>
  <script src="{c["progress"]}" defer></script>
  <script src="/assets/js/practice-page.js" defer></script>

  <link rel="stylesheet" href="{c["css"]}">
  <link rel="stylesheet" href="/assets/css/practice-page.css?v=pp-20261124s3">

  <title>{title_plain} — {c["name"]}</title>
  {{% include site-head-icons.html %}}
</head>

<body>
  {{% include site-menu.html %}}

  {{% include band-banner.html s="{c["bb"]}" title="{q(d["title"])}" sub="{q(d["kicker"])}" %}}

  <main class="page-wrap" id="mainContent" data-pp-store="{s}">
    <div class="pp-top">
      <a class="backlink" href="{c["lessons"]}#{d["lessons_anchor"]}"><span aria-hidden="true">←</span> Back to Lessons</a>
    </div>

    <section class="panel" id="intro" aria-labelledby="intro-title">
      <h2 id="intro-title">What this page practises</h2>
      <ul class="ican">{ican}</ul>
      <div class="top-pills">
        <a class="top-pill" href="{d["deck"]["href"]}" target="_blank" rel="noopener" aria-label="{esc(d["deck"]["aria"])}">{d["deck"]["label"]}</a>
        <a class="top-pill" href="{answers_href(d)}" target="_blank" rel="noopener" aria-label="{esc(d["deck"]["aria"].replace(". PDF", ", with answers. PDF"))}">{d["deck"]["label"].replace(" (PDF)", " with answers (PDF)")}</a>{"".join(f'{chr(10)}        <a class="top-pill" href="{x["href"]}"{" target=" + chr(34) + "_blank" + chr(34) + " rel=" + chr(34) + "noopener" + chr(34) if x.get("new_tab", True) else ""} aria-label="{esc(x["aria"])}">{x["label"]}</a>' for x in d.get("links", []))}
      </div>
    </section>

    <section class="panel" id="warm-up" aria-labelledby="warm-title">
      <h2 id="warm-title">Warm-up</h2>
      {cloze(d["cloze"])}{warm_list}
    </section>
{mc_section}{errors_section}
    <section class="panel" id="paper2" aria-labelledby="p2-title">
      <h2 id="p2-title">{c["p2_title"]}</h2>
      <p class="hint{"" if p2s else " p2-note"}">{p2_hint}</p>{f'{chr(10)}      <p class="p2-tip">{d["p2_tip"]}</p>' if d.get("p2_tip") else ""}
      <div class="pp-list">
        {p2_html}
      </div>
    </section>

    <section class="panel" id="more" aria-labelledby="more-title">
      <h2 id="more-title">Keep going</h2>
      <ul class="more-list">{more}</ul>
    </section>

    <section class="pp-answers" aria-labelledby="ans-title">
      <h2 id="ans-title">Answers</h2>
      {answers(d, warm, mcs, warm_p2 + p2s)}
    </section>

    <p class="done-line">Done in class, so not repeated here: {done}.</p>
    <p data-credit-note>Sources &amp; credits: past-paper questions and marking instructions from {cred}. © Qualifications Scotland (SQA), reproduced for educational use. Answer feedback and the gap-fill by R Stewart.{" " + d["credit_extra"] if d.get("credit_extra") else ""} {d["owner"]}.</p>
  </main>

  {{% include site-footer.html %}}
</body>
</html>
'''


def main():
    ids = sys.argv[1:] or sorted(p.stem for p in (HERE / "src").glob("*.json"))
    for i in ids:
        d = json.loads((HERE / "src" / f"{i}.json").read_text(encoding="utf-8"))
        d["_id"] = i
        out = REPO / d["out"]
        out.write_text(page(d), encoding="utf-8")
        print(out.relative_to(REPO))


if __name__ == "__main__":
    main()
