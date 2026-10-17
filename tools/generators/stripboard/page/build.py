#!/usr/bin/env python3
"""Assemble the page from the template + the engine sources.

The point of building rather than hand-copying: the JavaScript that runs on the
page and the JavaScript the test harness proves are the same bytes.  There is no
second implementation to drift (STATE.md, phase 1).

    ./build.py            -> the four pages in classes/electronics/ (Jekyll)
    ./build.py --preview  -> also ../preview/page-preview.html, includes expanded
                             and site-root URLs made absolute, so Chrome can
                             screenshot it without running Jekyll
"""
import json, os, re, sys, pathlib

HERE = pathlib.Path(__file__).parent
ENGINE = HERE.parent / "engine"
# SBD_SITE=<dir>: write the pages (and preview against the _includes) somewhere other than this repo
SITE = pathlib.Path(os.environ.get("SBD_SITE", HERE.parents[3])).expanduser().resolve()
OUT = SITE / "classes" / "electronics"
# the UI drivers are test harness, kept on the Mac with the screenshot scripts
DRIVERS = pathlib.Path.home() / "claude-work" / "stripboard-builder" / "page" / "drivers"

src = (HERE / "stripboard-builder.template.html").read_text()


def make_inline(overrides):
    def inline(m):
        name = overrides.get(m.group(1), m.group(1))
        body = (ENGINE / name).read_text().rstrip()
        return f"/* ---- {name} ---- */\n{body}"
    return inline


# The four pages are one template with a different set of modes: the marked
# course (Trace/Convert/Fault-finder/Reverse/Test points) and the blank-board
# workbench, once per board family.  Same engine bytes in all four — the
# engine reads its topology off the board (BB-PLAN.md §0, BB-3) — except the
# Learn pages' question banks, which are content, not engine: a breadboard
# circuit is laid out differently from the same circuit on stripboard, so
# `files` swaps in the bb-*.js bank for that one variant (15 Sep 2026).
VARIANTS = [
    {"file": "stripboard-builder.html",
     "title": "Learn to Plan a Stripboard Schematic",
     "modes": ["choose", "trace", "convert", "fault", "reverse", "points"],
     "boards": ["34-0410", "34-0411"],
     "id": "learn", "challenge": "sbd-learn", "reading": True},
    {"file": "stripboard-planner.html",
     "title": "Plan your own Stripboard Schematic",
     "modes": ["free"],
     "boards": ["34-0410", "34-0411"],
     # `features` = Undo/Redo, Renumber and the save/open/picture/print row,
     # which were tried on a beta page (25 Sep 2026: promoted, page removed).
     "id": "plan", "challenge": "sbd-plan", "features": True, "reading": True},
    {"file": "breadboard-planner.html",
     "title": "Plan your own Breadboard Circuit",
     "modes": ["free"],
     "boards": ["bb-400", "bb-830"],
     # tools and reading layout as the stripboard planner (OPEN-JOBS job 4, 17 Oct 2026)
     "id": "bread", "challenge": "sbd-bread", "features": True, "reading": True},
    # Fourth page: the Learn suite's breadboard sibling.  Same modes as the
    # stripboard Learn page, same engine, a different question bank.
    {"file": "breadboard-builder.html",
     "title": "Learn to Plan a Breadboard Schematic",
     "modes": ["choose", "trace", "convert", "fault", "reverse", "points"],
     "boards": ["bb-400", "bb-830"],
     "id": "bread-learn", "challenge": "sbd-bread-learn", "reading": True,
     "files": {"questions.js": "bb-questions.js",
               "trace-questions.js": "bb-trace-questions.js",
               "fault-questions.js": "bb-fault-questions.js",
               "reverse-questions.js": "bb-reverse-questions.js"}},
]


def render(v):
    inline = make_inline(v.get("files", {}))
    p = re.sub(r"/\*@INLINE:([\w.\-]+)\*/", inline, src)
    p = p.replace("@@TITLE@@", v["title"]).replace("@@CHALLENGE@@", v["challenge"])
    # Marked blocks sit between two whole-line /*@X*/ … /*@/X*/ markers: kept
    # (markers removed) where the variant has them, deleted outright elsewhere, so
    # the pages without them are byte-for-byte what they were before the block
    # existed.  READ = the dyslexia-standard styling (the `reading` variants,
    # 29 Sep 2026); PLAN = planner-only copy.
    # ownership line (global CLAUDE.md §6): month last revised, beside the credit note
    p = p.replace("@@OWNER@@", " R Stewart - October 2026" if v.get("reading") else "", 1)
    # every page links the planner's guide (RS, 17 Oct 2026); only the planner calls it "this planner"
    if v["id"] == "plan":
        help_, sub = "How to use this planner", "Step-by-step guide with pictures."
    elif v["id"] == "bread":
        help_, sub = "How to use the planner", "The stripboard planner’s guide — the tools work the same way here."
    else:
        help_, sub = "How to use the tools", "The planner’s step-by-step guide — the tools are the same."
    p = p.replace("@@HELPSUB@@", sub).replace("@@HELP@@", help_)
    # FREE = the free-build pages' copy (both planners)
    for tag, keep in (("READ", v.get("reading")), ("PLAN", v["id"] == "plan"), ("FREE", "free" in v["modes"])):
        if keep:
            p = re.sub(r"^[ \t]*/\*@/?%s\*/[ \t]*\n" % tag, "", p, flags=re.M)
        else:
            p = re.sub(r"^[ \t]*/\*@%s\*/[ \t]*\n.*?^[ \t]*/\*@/%s\*/[ \t]*\n" % (tag, tag), "", p, flags=re.M | re.S)
    if v.get("reading"):
        p = re.sub(r"^<body>$", '<body class="v-read">', p, count=1, flags=re.M)
    # `beta` drives the beta notice and the version chip; `features` the
    # Free-build tools.  Absent means off.  No variant is in beta now.
    cfg = "{ id: \"%s\", modes: %s, boards: %s, beta: %s, features: %s }" % (
        v["id"], json.dumps(v["modes"]), json.dumps(v["boards"]),
        json.dumps(bool(v.get("beta", False))),
        json.dumps(bool(v.get("features", False))))
    p = re.sub(r"/\*@VARIANT\*/[^;]+;", "/*@VARIANT*/ " + cfg + ";", p, count=1)
    return p


built = {}
for v in VARIANTS:
    p = render(v)
    (OUT / v["file"]).write_text(p)
    built[v["file"]] = p
    print(f"wrote {v['file']}  ({len(p):,} bytes)")

if "--preview" in sys.argv:
    # the preview drives ONE page; --page= picks which, default the learn page
    want = "stripboard-builder.html"
    for a in sys.argv:
        if a.startswith("--page="):
            want = a.split("=", 1)[1]
    p = built[want]
    # front matter is Jekyll's, not the browser's
    p = re.sub(r"\A---.*?---\n", "", p, flags=re.S)
    for inc in re.findall(r"\{%\s*include\s+([\w.\-]+)\s*%\}", p):
        f = SITE / "_includes" / inc
        text = f.read_text() if f.exists() else ""
        # a {% comment %} block's body is not page text (it showed as a stray line at the top)
        text = re.sub(r"\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}", "", text, flags=re.S)
        # the footer's one Liquid tag is a year; the preview does not need it
        text = re.sub(r"\{%.*?%\}", "", text, flags=re.S)
        text = re.sub(r"\{\{.*?\}\}", "", text, flags=re.S)
        p = p.replace("{% include " + inc + " %}", text)
    p = re.sub(r'((?:href|src)=")/(?!/)', r"\1" + f"file://{SITE}/", p)
    driver = ""
    for a in sys.argv:
        if a.startswith("--drive="):
            driver = (DRIVERS / a.split("=", 1)[1]).read_text()
    if driver:
        # a driver script exercises the real UI through synthetic events, so the
        # screenshot proves the page works and not merely that it renders
        p = p.replace("</body>", f"<script>\n{driver}\n</script>\n</body>")
    name = "page-preview.html" if not driver else "page-driven.html"
    dest = HERE.parent / "preview" / name
    dest.write_text(p)
    print(f"wrote {dest}  ({len(p):,} bytes)")
