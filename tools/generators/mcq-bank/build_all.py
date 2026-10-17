# -*- coding: utf-8 -*-
"""bank_src.md (options marked with *) -> question bank .md + quiz .html

    python3 tools/generators/mcq-bank/build_all.py

Writes classes/n5-engineering/unit-1-question-bank.html in this repo. The .md bank, quiz_data.json
and the stand-alone quiz are side outputs beside this file (not tracked).
"""
import os, re, json, random

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
from patch_options import P, STEM
from misconceptions import M as MISC

SRC = "bank_src.md"
lines = open(SRC).read().split("\n")

# ---- apply patched option sets ----
out, si, i, patched = [], -1, 0, 0
while i < len(lines):
    if re.match(r"^### Section", lines[i]): si += 1
    m = re.match(r"^(\d+)\. (.+)$", lines[i])
    if m and si >= 0 and i+4 < len(lines) and lines[i+1][:2] in ("* ", "- "):
        n = int(m.group(1))
        out.append("%d. %s" % (n, STEM[(si, n)]) if (si, n) in STEM else lines[i])
        if (si, n) in P:
            for o in P[(si, n)]:
                out.append(("* " + o[1:]) if o.startswith("*") else ("- " + o))
            patched += 1
        else:
            out += lines[i+1:i+5]
        i += 5; continue
    out.append(lines[i]); i += 1
open(SRC, "w").write("\n".join(out).rstrip() + "\n")
lines = out

# ---- parse ----
sections, questions, si, i = [], [], -1, 0
booklet = None
while i < len(lines):
    mb = re.match(r"^## BOOKLET (\d)", lines[i])
    if mb: booklet = int(mb.group(1))
    ms = re.match(r"^### Section (\d+) — (.+)$", lines[i])
    if ms:
        si += 1
        sections.append({"id": si, "booklet": booklet, "title": ms.group(2)})
    m = re.match(r"^(\d+)\. (.+)$", lines[i])
    if m and si >= 0 and i+4 < len(lines) and lines[i+1][:2] in ("* ", "- "):
        opts = [lines[i+1+j] for j in range(4)]
        ci = [j for j, o in enumerate(opts) if o.startswith("* ")]
        assert len(ci) == 1, (si, m.group(1))
        questions.append({"s": si, "n": int(m.group(1)), "q": m.group(2),
                          "o": [o[2:] for o in opts], "a": ci[0]})
        i += 5; continue
    i += 1

# ---- shuffle option order, balancing answer letters ----
random.seed(4172)
targets = [i % 4 for i in range(len(questions))]
random.shuffle(targets)
for q, tgt in zip(questions, targets):
    dis = [k for k in range(4) if k != q["a"]]
    random.shuffle(dis)
    order = dis[:]
    order.insert(tgt, q["a"])
    q["o"] = [q["o"][k] for k in order]
    q["a"] = tgt
from collections import Counter
print("answer spread:", dict(sorted(Counter("ABCD"[q["a"]] for q in questions).items())))

# ---- emit markdown ----
md, si, i, qi = [], -1, 0, 0
key = {}
while i < len(lines):
    if re.match(r"^### Section", lines[i]): si += 1
    m = re.match(r"^(\d+)\. (.+)$", lines[i])
    if m and si >= 0 and i+4 < len(lines) and lines[i+1][:2] in ("* ", "- "):
        q = questions[qi]; qi += 1
        md.append(lines[i])
        for j, o in enumerate(q["o"]):
            md.append("ABCD"[j] + ". " + o)
        key.setdefault(si, {})[q["n"]] = "ABCD"[q["a"]]
        i += 5; continue
    md.append(lines[i]); i += 1
while md and md[-1].strip() in ("", "---"): md.pop()
md += ["", "---", "", "## ANSWER KEY", ""]
for s in sections:
    md.append("Booklet %d, Section %d — %s" % (s["booklet"], s["id"] + 1, s["title"]))
    d = key[s["id"]]
    md.append(", ".join("%d %s" % (n, d[n]) for n in sorted(d)))
    md.append("")
# ---- misconception appendix ----
md += ["---", "", "## MISCONCEPTIONS COVERED", "",
       "Each one below is offered as a wrong option, so choosing it identifies the",
       "misunderstanding. Where marked (answer), it is the answer to a question that",
       "asks pupils to spot the mistake.", ""]
by_book = {1: {}, 2: {}}
for e in MISC:
    name, (s_i, q_n), mode = e[0], e[1], (e[3] if len(e) > 3 else "D")
    ref = "Section %d Q%d%s" % (s_i + 1, q_n, " (answer)" if mode == "A" else "")
    by_book[sections[s_i]["booklet"]].setdefault(name, []).append(ref)
for b in (1, 2):
    md.append("Booklet %d" % b)
    for name in sorted(by_book[b]):
        md.append("- %s — %s" % (name.split(" ", 1)[1], ", ".join(by_book[b][name])))
    md.append("")

open("n5-engsci-unit1-mcq-bank.md", "w").write("\n".join(md).rstrip() + "\n")

# ---- pretty text for the html ----
def fmt(t):
    t = t.replace("Eout", "E@out@").replace("Ein", "E@in@")
    t = t.replace("Pout", "P@out@").replace("Pin", "P@in@")
    for a in "kpehw":
        t = t.replace("E" + a, "E@%s@" % a)
    t = re.sub(r"@([a-z]+)@", r"<sub>\1</sub>", t)
    t = t.replace("v^2", "v²").replace("1/2", "½")
    t = t.replace("Jkg-1K-1", "Jkg⁻¹K⁻¹")
    t = t.replace("dT", "ΔT").replace("CO2", "CO₂")
    t = t.replace("x 100", "× 100")
    t = re.sub(r"(\d)\s?C\b", r"\1 °C", t)
    return t

data = {"sections": [{"id": s["id"], "booklet": s["booklet"], "title": fmt(s["title"])} for s in sections],
        "questions": [{"s": q["s"], "n": q["n"], "q": fmt(q["q"]),
                       "o": [fmt(o) for o in q["o"]], "a": q["a"]} for q in questions]}
open("quiz_data.json", "w").write(json.dumps(data, ensure_ascii=False))
html = open("page.html").read().replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
open("n5-engsci-unit1-quiz.html", "w").write(html)
print("patched %d option sets; rebuilt %d questions in %d sections" % (patched, len(questions), len(sections)))

# ---- site page for mrstewartphysics.co.uk ----
SITE = os.path.join(HERE, "..", "..", "..", "classes/n5-engineering/unit-1-question-bank.html")
tpl = open("site_page.html").read()
open(SITE, "w").write(tpl.replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/")))
print("site page ->", os.path.normpath(SITE))
