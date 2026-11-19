#!/usr/bin/env python3
"""External-link check for the monthly audit (website audit Phase 2, 19 Nov 2026).

Reads every external http(s) link from the built pages and requests each once (HEAD, then GET).
Two seconds between requests to one host, and a longer wait before retrying on 429. 403 is listed
separately: it is usually bot blocking, so confirm in a browser. Writes Markdown; never fails the job.
"""
import argparse, collections, os, re, ssl, time, urllib.error, urllib.request
from lxml import html as LH

ap = argparse.ArgumentParser()
ap.add_argument("--build", default="_site")
ap.add_argument("--out", default="links.md")
a = ap.parse_args()

pages = collections.defaultdict(set)
for root, _, files in os.walk(a.build):
    for f in files:
        if not f.endswith(".html"):
            continue
        rel = os.path.relpath(os.path.join(root, f), a.build)
        try:
            doc = LH.fromstring(open(os.path.join(root, f), encoding="utf-8", errors="replace").read())
        except Exception:
            continue
        for h in doc.xpath("//a/@href"):
            h = h.strip()
            if h.startswith("//"):
                h = "https:" + h
            if re.match(r"https?://", h):
                pages[h.split("#")[0]].add(rel)

ctx = ssl.create_default_context()
last = collections.defaultdict(float)

def check(u):
    host = u.split("/")[2]
    res = (u, "ERR", "")
    for method in ("HEAD", "GET"):
        for attempt in range(3):
            wait = 2.0 - (time.time() - last[host])
            if wait > 0:
                time.sleep(wait)
            last[host] = time.time()
            try:
                req = urllib.request.Request(u, method=method, headers={"User-Agent": "Mozilla/5.0 (monthly link check)"})
                with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
                    return u, r.status, ""
            except urllib.error.HTTPError as e:
                res = (u, e.code, "")
                if e.code == 429:
                    time.sleep(30 * (attempt + 1))
                    continue
                break
            except Exception as e:
                res = (u, "ERR", str(e)[:80])
                break
        if res[1] in (404, 410):
            return res
    return res

# One host at a time keeps the spacing honest; ~130 links takes a few minutes.
results = [check(u) for u in sorted(pages)]
bad = [r for r in results if r[1] not in (200, 301, 302)]
dead = [r for r in bad if r[1] in (404, 410, "ERR")]
blocked = [r for r in bad if r[1] not in (404, 410, "ERR")]

def rows(rs):
    return [f"| {u} | {s} {e} | {', '.join(sorted(pages[u])[:3])} |" for u, s, e in rs]

out = [f"### External links: {len(results)} checked, {len(dead)} dead, {len(blocked)} blocked or odd", ""]
if dead:
    out += ["**Dead (404, 410 or no answer)**", "", "| Link | Status | Pages |", "|---|---|---|"] + rows(dead) + [""]
if blocked:
    out += ["**Other statuses (403 is usually bot blocking: confirm in a browser)**", "", "| Link | Status | Pages |", "|---|---|---|"] + rows(blocked) + [""]
if not bad:
    out.append("All external links answered.")
open(a.out, "w").write("\n".join(out) + "\n")
print("\n".join(out))
