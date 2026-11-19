#!/usr/bin/env python3
"""Check _data/resources.yml: every non-null site path exists on disk. Exit 1 on a missing file."""
import os, sys, yaml
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = yaml.safe_load(open(os.path.join(root, "_data", "resources.yml")))
bad = []
def chk(p):
    if p and not os.path.isfile(os.path.join(root, p)):
        bad.append(p)
for t in d["topics"]:
    pg = t["page"].lstrip("/")
    if not (os.path.isfile(os.path.join(root, pg)) or os.path.isfile(os.path.join(root, pg.replace(".html", "/index.html")))):
        bad.append(t["page"])
    chk(t["booklet"]["web"])
    for l in t["lessons"]:
        chk(l["deck"]["notes"]); chk(l["deck"]["answers"]); chk(l["review_questions"])
n = sum(len(t["lessons"]) for t in d["topics"])
print(f"{n} lessons checked; {len(bad)} missing")
for b in bad: print("MISSING", b)
sys.exit(1 if bad else 0)
