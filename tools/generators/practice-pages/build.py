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
    return (f'<div class="pan"><img class="{cls}" src="{d["img"]}" width="{d["w"]}" height="{d["h"]}" '
            f'loading="lazy" style="--minw:{d["minw"]}px" alt="{esc(d["alt"])}"></div>')


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


def page(d):
    warm, mcs, p2s = order(d["warmup_mc"]), order(d["mc"]), order(d["paper2"])
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
    more = "".join(
        f'<li><a class="try-link" href="{k["href"]}" target="_blank" rel="noopener">{esc(k["label"])} '
        f'<span aria-hidden="true">↗</span></a><span class="more-role">{esc(k["role"])}</span></li>'
        for k in d["keep_going"])
    cred = "; ".join(d["credits"])
    n_mc = len(warm) + len(mcs)
    title_plain = strip_tags(d["title"])
    return f'''---
layout: none
title: {title_plain} — Higher Physics
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
  <meta name="theme-color" content="#0a0f1f" media="(prefers-color-scheme: dark)" />

  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <script src="/assets/js/site-menu.js" defer></script>
  <script src="/assets/js/progress.js" defer></script>
  <script src="/assets/js/progress/higher-physics.js" defer></script>
  <script src="/assets/js/practice-page.js" defer></script>

  <link rel="stylesheet" href="/assets/css/higher-physics.css?v=hp-20261014b">
  <link rel="stylesheet" href="/assets/css/practice-page.css?v=pp-20261123b">

  <title>{title_plain} — Higher Physics</title>
  {{% include site-head-icons.html %}}
</head>

<body>
  {{% include site-menu.html %}}

  <header class="banner-wrap">
    <img src="/assets/higher-physics-banner.jpeg" alt="Higher Physics banner" class="banner" loading="eager" decoding="async">
    <div class="banner-tint"></div>
    <div class="banner-overlay-text">
      <h1>{d["title"]}</h1>
      <p>{d["kicker"]}</p>
    </div>
  </header>

  <main class="page-wrap" id="mainContent" data-pp-store="{s}">
    <h1 class="visually-hidden">{title_plain}</h1>
    <div class="pp-top">
      <a class="backlink" href="{d["hub"]["href"]}"><span aria-hidden="true">←</span> Back to {d["hub"]["label"]}</a>
      {{% include feedback-button.html about="{d["about"]}" %}}
    </div>

    <section class="panel" id="intro" aria-labelledby="intro-title">
      <h2 id="intro-title">What this page practises</h2>
      <ul class="ican">{ican}</ul>
      <div class="top-pills">
        <a class="top-pill" href="{d["deck"]["href"]}" target="_blank" rel="noopener" aria-label="{esc(d["deck"]["aria"])}">{d["deck"]["label"]}</a>
      </div>
    </section>

    <section class="panel" id="warm-up" aria-labelledby="warm-title">
      <h2 id="warm-title">Warm-up</h2>
      {cloze(d["cloze"])}
      <div class="pp-list">
        {warm_html}
      </div>
    </section>

    <section class="panel" id="mc" aria-labelledby="mc-title">
      <h2 id="mc-title">Multiple choice</h2>
      <p class="hint">Real Higher questions, 1 mark each. Tap A to E. Each answer tells you why it is right or wrong.</p>
      <div class="pp-list">
        {mc_html}
      </div>
      <div class="pp-score" data-prog-challenge="mc-all" data-pp-total="{n_mc}">
        <p class="score" id="pp-score" aria-live="polite"></p>
        <button class="pp-reset" type="button" id="pp-reset">Reset my answers</button>
      </div>
    </section>

    <section class="panel" id="paper2" aria-labelledby="p2-title">
      <h2 id="p2-title">Paper 2 questions</h2>
      <p class="hint{"" if p2s else " p2-note"}">{p2_hint}</p>
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
    <p data-credit-note>Sources &amp; credits: past-paper questions and marking instructions from {cred}. © Qualifications Scotland (SQA), reproduced for educational use. Answer feedback and the gap-fill by R Stewart. {d["owner"]}.</p>
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
