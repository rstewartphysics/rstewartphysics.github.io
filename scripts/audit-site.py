#!/usr/bin/env python3
"""Static standards audit over the built site (website audit Phase 2, 19 Nov 2026). Read-only.

Ported from the audit's scripts/audit_static.py. Plain script, no network, no Claude.

  python3 scripts/audit-site.py --build _site --baseline scripts/audit-baseline.json
          [--changed FILE]     source paths changed by the PR, one per line; omit to judge every page
          [--summary FILE]     write a Markdown summary (the workflow adds it to the job summary)
          [--update-baseline]  rewrite the baseline from this build and exit 0

Exit 1 if there is a NEW P1 or P2 finding (not in the baseline) in a touched page. New P3 findings
only warn. A finding is keyed by page, rule and message with digits blanked, so a changed word count
or file size is not "new". Shared files (includes, layouts, data, config, site CSS/JS) touch every page.
"""
import argparse, collections, json, os, re, sys, urllib.parse
from lxml import html as LH

BUILD = "_site"

EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐⬆✅❌✨⬛⬜]")
US = re.compile(r"\b(analyze[sd]?|analyzing|behavior|colors?|centers?|centered|defense|gray|labeled|labeling|"
                r"organize[sd]?|recognize[sd]?|realize[sd]?|summarize[sd]?|neighbor|meter(?!s? ?\()|favorite|"
                r"practice(?= (?:the|a|your)\b)|program(?!me)(?= (?:the|a)\b)|offense|licen[cs]e)\b", re.I)
PLACEHOLDER = re.compile(r"lorem ipsum|coming soon|under construction|work in progress|\bTODO\b|\bFIXME\b|\bTBC\b|\bXXX\b|"
                         r"placeholder|temporarily offline|currently being built|to be added", re.I)
TEACHER_NOTE = re.compile(r"teacher note|for the teacher|teacher only|STATE\.md|PLAN\.md|DECK-RULES|ROADMAP|\bovernight\b", re.I)
TEACHER_NOTE_CS = re.compile(r"\bRS to\b|\bRS:|\bClaude\b|\bdraft\b")

def course_of(rel):
    p = rel.lower()
    for k, v in [("advanced-higher", "AH"), ("ah-", "AH"), ("higher", "Higher"), ("n5-engineering", "N5 Eng"),
                 ("s3-engineering", "S3 Eng"), ("engineering", "Eng"), ("electronics", "Electronics"),
                 ("n5-physics", "N5 Physics"), ("n5", "N5"), ("s3-physics", "S3 Physics"), ("s3", "S3"),
                 ("space", "S3 Space"), ("cover", "Cover"), ("assignment", "Assignment"), ("physics", "Physics")]:
        if k in p:
            return v
    return "Site/other"

def resolve(href, page_rel):
    """Return built-file path (relative to BUILD) for an internal href, or None."""
    u = urllib.parse.urlparse(href)
    path = urllib.parse.unquote(u.path)
    if not path:
        return page_rel, u.fragment
    if path.startswith("/"):
        cand = path.lstrip("/")
    else:
        cand = os.path.normpath(os.path.join(os.path.dirname(page_rel), path))
    opts = [cand, cand + ".html", os.path.join(cand, "index.html")]
    for o in opts:
        if o and os.path.isfile(os.path.join(BUILD, o)):
            return o, u.fragment
    return None, u.fragment

def audit():
    dates = {}
    pages = []
    for root, _, files in os.walk(BUILD):
        for f in files:
            if f.endswith(".html"):
                pages.append(os.path.relpath(os.path.join(root, f), BUILD))
    pages.sort()
    inv, find, links_out, ids_of = [], [], [], {}
    inbound = collections.Counter()
    docs = {}
    for rel in pages:
        raw = open(os.path.join(BUILD, rel), encoding="utf-8", errors="replace").read()
        try:
            doc = LH.fromstring(raw)
        except Exception as e:
            find.append((rel, "P1", "parse", f"HTML will not parse: {e}"))
            continue
        docs[rel] = (doc, raw)
        ids_of[rel] = set(doc.xpath("//@id"))

    def add(rel, sev, rule, msg):
        find.append((rel, sev, rule, msg))

    for rel, (doc, raw) in docs.items():
        vis = " ".join(t.strip() for t in doc.xpath("//body//text()[not(ancestor::script) and not(ancestor::style) and not(ancestor::*[@id='siteMenuOverlay']) and not(ancestor::footer) and not(ancestor::*[contains(@class,'site-menu')])]") if t.strip())
        title = (doc.xpath("string(//title)") or "").strip()
        h1s = doc.xpath("//h1")
        srcrel = rel
        mtime = dates.get(srcrel, dates.get(srcrel.replace(".html", ""), ""))
        size = len(raw)
        words = len(vis.split())
        inv.append(dict(path=rel, course=course_of(rel), title=title, h1=len(h1s), words=words, bytes=size,
                        last_git_change=mtime, images=len(doc.xpath("//img")), scripts=len(doc.xpath("//script")),
                        has_menu=int("site-menu" in raw), has_footer_include=int("footer-nav" in raw)))
        rf = doc.xpath("string(//meta[@http-equiv='refresh']/@content)")
        if rf:
            m_ = re.search(r"url=([^\s;]+)", rf, re.I)
            tgt_ = m_.group(1) if m_ else ""
            inv[-1]["title"] = "[REDIRECT] " + title
            if tgt_.startswith("/") and not tgt_.startswith("//"):
                t2, _ = resolve(tgt_, rel)
                if t2 is None and not os.path.isfile(os.path.join(BUILD, tgt_.lstrip("/"))):
                    add(rel, "P1", "broken", f"redirect target missing: {tgt_[:100]}")
                else: inbound[t2 or tgt_] += 1
            add(rel, "P3", "legacy", f"redirect stub -> {tgt_[:90]}")
            if "site-menu" in raw and "viewport" not in raw: pass
            continue
        # head / template
        if not title: add(rel, "P2", "template", "no <title>")
        if not doc.xpath("//html/@lang"): add(rel, "P2", "a11y", "html has no lang")
        if not doc.xpath("//meta[@name='viewport']"): add(rel, "P1", "mobile", "no viewport meta")
        elif "viewport-fit" not in raw: add(rel, "P3", "template", "viewport lacks viewport-fit=cover")
        cs = doc.xpath("string(//meta[@name='color-scheme']/@content)")
        if not cs: add(rel, "P3", "template", "no color-scheme meta")
        elif cs.strip() == "light": add(rel, "P3", "legacy", "color-scheme is light only (older inline-themed page)")
        if not doc.xpath("//meta[@name='description']"): add(rel, "P3", "seo", "no meta description")
        if "site-menu.css" not in raw: add(rel, "P2", "template", "site-menu.css not linked")
        if "site-menu.js" not in raw: add(rel, "P2", "template", "site-menu.js not linked")
        if not doc.xpath("//*[@id='mainContent']"): add(rel, "P2", "a11y", "no id=mainContent")
        if not doc.xpath("//main"): add(rel, "P3", "a11y", "no <main>")
        if len(h1s) == 0: add(rel, "P2", "a11y", "no <h1>")
        if "box-sizing" not in raw and "engineering-science.css" not in raw and "hub-tiles" not in raw:
            add(rel, "P3", "template", "overflow-fix (box-sizing) not found inline or via known sheet")
        # footer
        if "footer-copy" in raw and "© R Stewart Physics, Electronics and Engineering" in raw:
            add(rel, "P3", "footer", "footer reads '© R Stewart Physics…' but CLAUDE.md says '© Mr Stewart's Physics…' (include vs doc mismatch, site-wide)")
        elif "footer-copy" not in raw:
            add(rel, "P2", "footer", "canonical footer line missing")
        if "footer-nav" not in raw: add(rel, "P2", "footer", "no .footer-nav (shared footer include missing)")
        if "credits.html" not in raw: add(rel, "P2", "footer", "no link to credits page")
        # logo
        if "site-home-badge" not in raw: add(rel, "P2", "logo", "no home badge from shared menu include")
        # skip link (removed site-wide)
        if re.search(r'class="[^"]*skip[-_ ]?link|href="#mainContent"', raw): add(rel, "P3", "a11y", "skip link present (removed site-wide 14 Oct)")
        # focus / motion
        if "focus-visible" not in raw and "focus-ring" not in raw and ".css" not in raw:
            add(rel, "P2", "a11y", "no :focus-visible rule and no stylesheet")
        has_sheet = bool(doc.xpath("//link[@rel='stylesheet']"))
        if "prefers-reduced-motion" not in raw and not has_sheet:
            add(rel, "P3", "a11y", "no prefers-reduced-motion block")
        # images
        for img in doc.xpath("//img"):
            alt = img.get("alt")
            src = img.get("src") or ""
            if alt is None: add(rel, "P2", "a11y", f"img with no alt attribute: {src[:80]}")
            elif alt.strip() == "" and img.get("aria-hidden") != "true" and not img.xpath("ancestor::a[@aria-label]"):
                add(rel, "P3", "a11y", f"empty alt without aria-hidden: {src[:80]}")
            if src and not src.startswith(("data:", "http")):
                tgt, _ = resolve(src, rel)
                if tgt is None: add(rel, "P1", "broken", f"image file missing: {src[:90]}")
            if src.startswith("http://"): add(rel, "P2", "security", f"http:// image: {src[:80]}")
        for el in doc.xpath("//a[contains(concat(' ',normalize-space(@class),' '),' card ')][not(@aria-label)]"):
            add(rel, "P3", "a11y", f"a.card without aria-label: {(el.get('href') or '')[:70]}")
        for el in doc.xpath("//section[not(@aria-label) and not(@aria-labelledby)]")[:3]:
            add(rel, "P3", "a11y", "<section> without aria-label/labelledby")
        # content hygiene
        em = set(EMOJI.findall(vis))
        em_true = {c for c in em if ord(c) >= 0x1F300 or c in "\u2705\u274C\u2728\u2B50\u26A0"}
        if em_true: add(rel, "P2", "no-emoji", "emoji in visible text: " + "".join(sorted(em_true)))
        glyph = set(re.findall("[\u2713\u2717\u2715\u2605\u2606\u2714\u2716]", vis))
        if glyph: add(rel, "P3", "no-emoji", "check/cross/star glyphs (not emoji; confirm they are drawn marks or text): " + "".join(sorted(glyph)))
        if re.search(r"\bsafari\b", vis, re.I): add(rel, "P3", "legacy", "mentions Safari in visible text")
        if re.search(r"berwickshire|\bBHS\b", vis, re.I): add(rel, "P2", "no-school-logo", "mentions Berwickshire/BHS in visible text")
        if re.search(r"berwickshire|bhs[-_]?logo|school[-_]?crest", raw, re.I) and not re.search(r"berwickshire|\bBHS\b", vis, re.I):
            add(rel, "P3", "no-school-logo", "Berwickshire/BHS/crest string in markup")
        m = PLACEHOLDER.search(vis)
        if m: add(rel, "P2", "placeholder", f"placeholder wording: '{m.group(0)}'")
        m = TEACHER_NOTE.search(vis) or TEACHER_NOTE_CS.search(vis)
        if m and "teacher" not in rel.lower(): add(rel, "P2", "internal-note", f"possible internal/teacher text: '{m.group(0)}'")
        m = re.findall(r"\bstudents?\b", vis, re.I)
        if m: add(rel, "P3", "voice", f"'student(s)' x{len(m)} (house style: pupils)")
        us = set(x.lower() for x in US.findall(vis))
        if us: add(rel, "P3", "spelling", "possible US spelling: " + ", ".join(sorted(us))[:80])
        if re.search(r"\balert\(", raw): add(rel, "P2", "a11y", "alert() used (standard: aria-live, no alert)")
        if re.search(r"background-attachment\s*:\s*fixed", raw): add(rel, "P2", "no-parallax", "background-attachment: fixed")
        if "reading.css" in raw: add(rel, "P3", "legacy", "uses retired reading.css / reading options")
        if "Mr Stewart's Materials" in raw or "Mr Stewart&#39;s Materials" in raw or "Mr Stewart’s Materials" in raw:
            add(rel, "P2", "retired", "retired 'Mr Stewart's Materials' tile/link")
        if "materials-unavailable" in raw: add(rel, "P2", "legacy", "links to materials-unavailable placeholder")
        if "workinprogress" in raw: add(rel, "P2", "legacy", "links to workinprogress placeholder")
        if re.search(r"electricity1.*(practice|quiz|test)|ai[-_ ]tutor", raw, re.I) and "electricity" in rel.lower():
            add(rel, "P3", "retired", "possible retired Electricity 1 quiz/AI tutor remnant")
        if raw.count("<footer") > 0 and "footer-nav" not in raw: add(rel, "P2", "footer", "hand-written <footer> without shared include")
        # feedback button on app-style pages
        appish = len(doc.xpath("//canvas")) > 0 or len(doc.xpath("//input|//button")) > 15
        fb = raw.count("feedback-btn")
        if appish and fb == 0: add(rel, "P3", "feedback-button", "REVIEW: page has canvas or >15 controls but no feedback button; needed only if it is a tool, sim or on-screen quiz")
        if fb > 3 and fb != 0: pass
        if fb and "contact.html?about=" not in raw: add(rel, "P2", "feedback-button", "feedback button without ?about=")
        # credits
        if doc.xpath("//img") and len(doc.xpath("//img")) > 2 and "data-credit-note" not in raw and "credit" not in vis.lower() and "©" not in vis.replace("© Mr Stewart", ""):
            add(rel, "P2", "credits", "images present but no credit note / © line")
        if re.search(r"Qualifications Scotland|SQA|past paper", vis, re.I) and "Qualifications Scotland (SQA)" not in raw and "credit" not in vis.lower():
            add(rel, "P2", "credits", "mentions SQA/past paper without '© Qualifications Scotland (SQA)' credit")
        if doc.xpath("//*[contains(@class,'exam-ref')]/@title"): add(rel, "P3", "exam-ref", ".exam-ref uses title= (must be visible text)")
        # external links hygiene
        for a in doc.xpath("//a[@target='_blank']"):
            rl = (a.get("rel") or "")
            if "noopener" not in rl and (a.get("href") or "").startswith("http"):
                add(rel, "P3", "security", f"target=_blank without noopener: {(a.get('href') or '')[:70]}"); break
        for a in doc.xpath("//a[starts-with(@href,'http://')]"):
            add(rel, "P3", "security", f"http:// (not https) link: {a.get('href')[:80]}"); break
        # links
        for a in doc.xpath("//a[@href]"):
            h = a.get("href").strip()
            if not h or h.startswith(("mailto:", "tel:", "javascript:", "data:")): continue
            if h.startswith(("http://", "https://", "//")):
                links_out.append((rel, h)); continue
            if h == "#": add(rel, "P3", "links", "href='#' dead link"); continue
            tgt, frag = resolve(h, rel)
            if tgt is None:
                add(rel, "P1", "broken", f"internal link broken: {h[:100]}")
            else:
                if tgt != rel: inbound[tgt] += 1
                if frag and tgt.endswith(".html") and tgt in ids_of and frag not in ids_of[tgt] and "{" not in frag:
                    add(rel, "P2", "broken", f"anchor #{frag} not found in {tgt}")
        # css/js refs
        for el in doc.xpath("//link[@href]|//script[@src]"):
            u = el.get("href") or el.get("src") or ""
            if not u or u.startswith(("http", "//", "data:", "#", "mailto:")): continue
            if resolve(u, rel)[0] is None and not os.path.isfile(os.path.join(BUILD, urllib.parse.urlparse(u).path.lstrip("/"))):
                add(rel, "P1", "broken", f"missing stylesheet/script: {u[:90]}")
        for el in doc.xpath("//*[contains(@id,'-ex') or @id]"):
            pass
        # size heuristics
        if size > 400_000: add(rel, "P3", "weight", f"page HTML is {size//1024} KB")
        if words < 40 and "index" not in rel: add(rel, "P3", "thin", f"very little visible text ({words} words)")

    # orphans / duplicates
    nav = set()
    for rel in docs:
        if inbound[rel] == 0 and rel != "index.html":
            add(rel, "P2", "orphan", "no other page links here (may be reachable only via nav include/search/QR)")
    titles = collections.defaultdict(list)
    for r in inv: titles[r["title"]].append(r["path"])
    for t, ps in titles.items():
        if t and len(ps) > 1:
            for p in ps: add(p, "P3", "duplicate", f"title shared with {len(ps)-1} other page(s): {t[:60]}")
    for r in inv:
        r["inbound_links"] = inbound[r["path"]]

    # non-html files in the build that are not referenced at all
    ref_blob = "\n".join(raw for _, raw in docs.values())
    for root, _, files in os.walk(os.path.join(BUILD, "assets")):
        pass

    return find, [r['path'] for r in inv]


def key(rel, rule, msg):
    return "|".join([rel, rule, re.sub(r"\d+", "N", msg)])

SHARED = ("_includes/", "_layouts/", "_data/", "_config.yml", "assets/css/", "assets/js/")

def touched_pages(changed, pages):
    if changed is None:
        return set(pages), "every page"
    if any(c.startswith(SHARED) for c in changed):
        return set(pages), "every page (a shared file changed)"
    hit = set()
    for c in changed:
        for cand in (c, re.sub(r"\.md$", ".html", c), re.sub(r"/index\.md$", "/index.html", c)):
            if cand in pages:
                hit.add(cand)
    return hit, f"{len(hit)} touched page(s)"

def main():
    global BUILD
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", default="_site")
    ap.add_argument("--baseline", default="scripts/audit-baseline.json")
    ap.add_argument("--changed")
    ap.add_argument("--summary")
    ap.add_argument("--update-baseline", action="store_true")
    a = ap.parse_args()
    BUILD = os.path.abspath(a.build)
    find, pages = audit()
    found = {key(p, r, m): (p, s, r, m) for p, s, r, m in find}
    if a.update_baseline:
        by = collections.Counter(v[1] for v in found.values())
        json.dump({"note": "Accepted findings from main. Shrinks as the legacy clear-out (Phase 5) proceeds.",
                   "counts": dict(by), "findings": sorted(found)}, open(a.baseline, "w"), indent=1)
        print("baseline written:", dict(by), "from", len(pages), "pages")
        return 0
    base = set(json.load(open(a.baseline))["findings"])
    changed = None
    if a.changed:
        changed = [l.strip() for l in open(a.changed) if l.strip()]
    scope, why = touched_pages(changed, set(pages))
    new = [v for k, v in found.items() if k not in base and v[0] in scope]
    gone = len([k for k in base if k not in found])
    errs = [v for v in new if v[1] in ("P1", "P2")]
    warns = [v for v in new if v[1] == "P3"]
    lines = [f"### Site audit: {'FAIL' if errs else 'pass'}",
             f"Checked {why} of {len(pages)}. New P1/P2: **{len(errs)}**. New P3 (warning): {len(warns)}. "
             f"Baseline findings now fixed: {gone}."]
    for title, rows in (("New P1/P2 (fail)", errs), ("New P3 (warn)", warns)):
        if rows:
            lines += ["", f"**{title}**", "", "| Page | Sev | Rule | Finding |", "|---|---|---|---|"]
            lines += [f"| {p} | {s} | {r} | {m[:160]} |" for p, s, r, m in sorted(rows)[:60]]
    out = "\n".join(lines)
    print(out)
    for p, s, r, m in errs:
        print(f"::error file={p}::{s} {r}: {m[:150]}")
    for p, s, r, m in warns[:30]:
        print(f"::warning file={p}::{s} {r}: {m[:150]}")
    if a.summary:
        open(a.summary, "a").write(out + "\n")
    return 1 if errs else 0

if __name__ == "__main__":
    sys.exit(main())
