"""Lessons page: one card per topic, one row per deck part (HIGHER-HUB-PRACTICE-PLAN, 23 Nov 2026).

    python3 tools/generators/lessons/build.py          every src/*.json
    python3 tools/generators/lessons/build.py higher   one course (or ah)

Writes the cards between the <!-- lessons:start --> and <!-- lessons:end --> markers of the
course's slides page; the page's head, banner and credits stay hand-written. Edit the JSON,
never the cards. deck-ship and the practice-page skill add rows here.
Standard library only (CI re-runs it).
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
START, END = "<!-- lessons:start -->", "<!-- lessons:end -->"
NEW_TAB = "Opens in a new tab"


def plain(s):
    return re.sub(r"&amp;", "and", re.sub(r"<[^>]+>", "", s)).replace("&rsquo;", "'").replace("’", "'")


def pill(href, text, label, new_tab=True):
    tgt = ' target="_blank" rel="noopener"' if new_tab else ""
    arrow = "↗" if new_tab else "→"
    return (f'<a class="deck-pill" href="{href}"{tgt}\n'
            f'                   aria-label="{label}">{text} <span aria-hidden="true">{arrow}</span></a>')


def part_row(c, t, p, n, multi):
    base = c["base"] + p["file"]
    who = t.get("say") or plain(t["name"])
    if multi:
        who = f'{who} {n}, {p.get("say") or plain(p["name"])}'
    slides = f'{p["count"]} slides'
    pills = [pill(base + ".pdf", "Slides", f"{who} — slides, PDF, {slides}. {NEW_TAB}")]
    if p.get("answers"):
        pills.append(pill(base + "-answers.pdf", "With answers", f"{who} — slides with answers, PDF, {slides}. {NEW_TAB}"))
    pr = p.get("practice")
    if isinstance(pr, list):        # one deck in several parts: a Practice pill per part (AH j)
        pills += [pill(x["href"], x["label"], f'{who} — {x["say"]} practice page', new_tab=False) for x in pr]
    elif pr:
        pills.append(pill(pr["href"], "Practice", f"{who} — practice page", new_tab=False))
    rid = f'{t["id"]}-{n}' if multi else f'{t["id"]}-slides'
    name = (f'<span class="lp-name"><span class="lp-num" aria-hidden="true">{n}</span>{p["name"]}</span>'
            if multi else "")
    pills_html = "\n                 ".join(pills)
    return f'''<li class="lesson-part" id="{rid}">
              {name}<span class="deck-meta">PDF · {slides}</span>
              <span class="deck-pills">
                 {pills_html}
              </span>
            </li>'''


def extra_row(e):
    return f'''<li class="lesson-part">
              <span class="lp-name">{e["label"]}</span><span class="deck-meta">PDF · {e["meta"]}</span>
              <span class="deck-pills">
                 {pill(e["href"], "PDF", f'{e["label"]}, {e["say"]} — PDF, {e["meta"]}. {NEW_TAB}')}
              </span>
            </li>'''


def badges(t):
    ids = [x["badge"] for p in t.get("parts", []) if p.get("practice")
           for x in (p["practice"] if isinstance(p["practice"], list) else [p["practice"]])]
    ids += [x["badge"] for x in [t.get("topic_page"), t.get("sim"), *t.get("tests", [])] if x and x.get("badge")]
    return " ".join(ids)


def topic_card(c, t):
    if t.get("soon"):
        return f'''<div class="lesson-card soon" id="{t["id"]}">
          <div class="lesson-head">
            <svg class="deck-ic" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#{t["icon"]}"/></svg>
            <span class="lesson-title"><span class="deck-name">{t["name"]}</span><span class="deck-meta">Coming soon</span></span>
          </div>
        </div>'''
    parts = t["parts"]
    multi = len(parts) > 1
    rows = [part_row(c, t, p, n, multi) for n, p in enumerate(parts, 1)]
    rows += [extra_row(e) for e in t.get("extras", [])]
    tag = "ol" if multi else "ul"
    sim = ""
    if t.get("sim"):
        sim = (f'<a class="lesson-sim" href="{t["sim"]["href"]}">{t["sim"]["label"]} '
               f'<span aria-hidden="true">→</span></a>')
    more = []
    if not any(p.get("practice") for p in parts):        # D5: until the topic has practice pages
        if t.get("topic_page"):
            more.append(pill(t["topic_page"]["href"], "Topic page", f'{t.get("say") or plain(t["name"])} — topic page', False))
        for x in t.get("tests", []):
            more.append(pill(x["href"], x["label"], f'{t.get("say") or plain(t["name"])} — {x["label"].lower()}', False))
    more_html = ""
    if more:
        joined = "\n               ".join(more)
        more_html = f'''
          <div class="lesson-more deck-pills">
               {joined}
          </div>'''
    b = badges(t)
    battr = f' data-prog-badges="{b}"' if b else ""
    rows_html = "\n            ".join(rows)
    return f'''<article class="lesson-card" id="{t["id"]}" aria-labelledby="{t["id"]}-name"{battr}>
          <div class="lesson-head">
            <svg class="deck-ic" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#{t["icon"]}"/></svg>
            <span class="lesson-title"><h3 class="deck-name" id="{t["id"]}-name">{t["name"]}</h3>{sim}</span>
          </div>
          <{tag} class="lesson-parts">
            {rows_html}
          </{tag}>{more_html}
        </article>'''


def unit(c, u):
    cards = "\n\n        ".join(topic_card(c, t) for t in u["topics"])
    links = ""
    if u.get("unit_links"):
        ps = "\n             ".join(pill(x["href"], x["label"], f'{u.get("say") or plain(u["title"])} — {x["label"].lower()}', False)
                                   for x in u["unit_links"])
        links = f'''
      <div class="lesson-unit">
        <h3>Whole unit</h3>
        <div class="deck-pills">
             {ps}
        </div>
      </div>'''
    return f'''<section class="panel" id="{u["id"]}" aria-labelledby="{u["id"]}-title">
      <h2 id="{u["id"]}-title">{u["title"]}</h2>
      <p class="unit-note">{u["note"]}</p>

      <div class="lesson-list" aria-label="{u.get("say") or plain(u["title"])} lessons">
        {cards}
      </div>{links}
    </section>'''


def build(name):
    c = json.loads((HERE / "src" / f"{name}.json").read_text(encoding="utf-8"))
    path = REPO / c["page"]
    page = path.read_text(encoding="utf-8")
    a, b = page.index(START) + len(START), page.index(END)
    body = "\n\n    ".join(unit(c, u) for u in c["units"])
    note = f"\n    <!-- Generated by tools/generators/lessons/build.py from src/{name}.json. Do not edit. -->\n    "
    path.write_text(page[:a] + note + body + "\n    " + page[b:], encoding="utf-8")
    print(path.relative_to(REPO))


if __name__ == "__main__":
    for n in sys.argv[1:] or sorted(p.stem for p in (HERE / "src").glob("*.json")):
        build(n)
