#!/usr/bin/env python3
"""S3 Engineering Test 1 — Practice Tests A and B.

    python3 build.py a      # or b
    python3 build.py a OUT  # write the page somewhere other than this repo

Only the two calculations are numeric, and both answers are computed from the
test's `@values`. Everything else is a written answer, self-marked against the
scheme. The drawings are themed inline SVG: CSS variables with printed
fallbacks, so the page follows light and dark mode and the teacher PDF still prints.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
sys.path.insert(0, HERE)

import pagebuild as P
import profile as PROF

SITE = os.environ.get("SITE", P.REPO)

INK = "var(--dia-ink, #211a0e)"
IN_C = "var(--eng-orange, #fd9700)"
USE_C = "var(--good, #15803d)"
WASTE_C = "var(--bad, #b91c1c)"
BOARD = "var(--eng-surface-2, #fbf0e4)"
BALL = "var(--eng-orange, #fd9700)"


def spaced(x):
    """27000 → 27 000, the way the papers print a five-figure number."""
    s = "%d" % x
    return s if len(s) < 5 else "{:,}".format(x).replace(",", " ")


# ------------------------------------------------------------------ physics

def compute_a(v):
    n = {k: float(x) for k, x in v.items()}
    eff = n["eff_out"] / n["eff_in"] * 100
    pw = n["pow_e"] / n["pow_t"]
    assert eff == int(eff) and pw == int(pw), "keep S3 answers whole numbers"
    d = {"eff_in_d": spaced(int(n["eff_in"])), "eff_out_d": spaced(int(n["eff_out"])),
         "eff_ans": "%d" % eff, "pow_e_d": spaced(int(n["pow_e"])),
         "pow_t": "%d" % n["pow_t"], "pow_ans": "%d" % pw}
    d["_num"] = {"eff": (eff, "%"), "pow": (pw, "W")}
    d["q12a_model"] = etd("electric drill", "electrical", ["kinetic"], ["heat", "sound"])
    return d


# ----------------------------------------------------------------- drawings

def arrow(x1, y1, x2, y2, colour, w=14, head=26):
    """A thick block arrow, horizontal or vertical."""
    if y1 == y2:
        s = 1 if x2 > x1 else -1
        xb = x2 - s * head
        pts = [(x1, y1 - w / 2), (xb, y1 - w / 2), (xb, y1 - w), (x2, y1), (xb, y1 + w),
               (xb, y1 + w / 2), (x1, y1 + w / 2)]
    else:
        s = 1 if y2 > y1 else -1
        yb = y2 - s * head
        pts = [(x1 - w / 2, y1), (x1 - w / 2, yb), (x1 - w, yb), (x1, y2), (x1 + w, yb),
               (x1 + w / 2, yb), (x1 + w / 2, y1)]
    return '<polygon points="%s" style="fill:%s"/>' % (
        " ".join("%g,%g" % p for p in pts), colour)


def text(x, y, s, anchor="middle", size=22, weight=700):
    return ('<text x="%g" y="%g" text-anchor="%s" style="font-size:%dpx;font-weight:%d;'
            'fill:%s;font-family:inherit">%s</text>' % (x, y, anchor, size, weight, INK, s))


def etd(device, inp, useful, wasted):
    """Energy transfer diagram in the booklet's shape: input in from the left,
    useful out to the right, wasted on its own arrow going down."""
    W, H = 540, 250
    bx, by, bw, bh = 160, 56, 190, 72
    cy = by + bh / 2
    parts = ['<svg class="etd" style="display:block;width:100%%;max-width:420px;height:auto;margin:.4rem 0" viewBox="0 0 %d %d" role="img" aria-label="Energy transfer '
             'diagram: %s energy in to the %s; useful output %s; wasted %s on its own '
             'arrow going down.">' % (W, H, inp, device, " and ".join(useful),
                                      " and ".join(wasted))]
    parts.append(arrow(14, cy, bx - 6, cy, IN_C))
    parts.append(text((14 + bx) / 2 - 4, cy - 24, inp))
    parts.append('<rect x="%d" y="%d" width="%d" height="%d" rx="10" style="fill:%s;'
                 'stroke:%s;stroke-width:2.5"/>' % (bx, by, bw, bh, BOARD, INK))
    parts.append(text(bx + bw / 2, cy + 5, device))
    ys = [cy] if len(useful) == 1 else [cy - 16, cy + 16]
    for y, u in zip(ys, useful):
        parts.append(arrow(bx + bw + 6, y, W - 90, y, USE_C, w=12, head=22))
        parts.append(text(W - 84, y + 7, u, anchor="start"))
    parts.append(text((bx + bw + W - 90) / 2, by - 10, "useful", size=17, weight=900))
    parts.append(arrow(bx + bw / 2, by + bh + 6, bx + bw / 2, H - 20, WASTE_C))
    parts.append(text(bx + bw / 2 + 26, H - 34, " and ".join(wasted), anchor="start"))
    parts.append(text(bx + bw / 2 + 26, H - 64, "wasted", anchor="start", size=17, weight=900))
    parts.append("</svg>")
    return "".join(parts)


def marble_run_fault():
    """Two slopes that zig-zag down a board, then a long flat section. The
    marble is drawn where it stopped, short of the cup; the start is a dashed
    outline so the drawing shows where it began without two solid marbles."""
    rail = 'style="stroke:%s;stroke-width:6;stroke-linecap:round"' % INK
    wall = 'style="stroke:%s;stroke-width:5;stroke-linecap:round"' % INK
    s = ['<svg class="run" viewBox="0 0 470 300" role="img" aria-label="A marble run on a '
         'board. The marble starts at the top left, rolls down a slope to the right, then '
         'down a second slope to the left, and drops onto a long flat section at the '
         'bottom. The marble has stopped part way along the flat section, before the cup '
         'at the right-hand end.">']
    s.append('<rect x="14" y="8" width="442" height="262" rx="10" style="fill:%s;stroke:%s;'
             'stroke-width:2"/>' % (BOARD, INK))
    s.append('<line x1="50" y1="70" x2="400" y2="118" %s/>' % rail)
    s.append('<line x1="416" y1="96" x2="416" y2="150" %s/>' % wall)
    s.append('<line x1="408" y1="150" x2="80" y2="198" %s/>' % rail)
    s.append('<line x1="36" y1="180" x2="36" y2="238" %s/>' % wall)
    s.append('<line x1="44" y1="238" x2="360" y2="238" %s/>' % rail)
    s.append('<path d="M366 206 L372 244 L414 244 L420 206" style="fill:none;stroke:%s;'
             'stroke-width:4;stroke-linejoin:round"/>' % INK)
    s.append('<circle cx="60" cy="58" r="10" style="fill:none;stroke:%s;stroke-width:2;'
             'stroke-dasharray:4 3"/>' % INK)
    s.append('<circle cx="236" cy="226" r="10" style="fill:%s;stroke:%s;stroke-width:2"/>'
             % (BALL, INK))
    s.append(text(70, 36, "start", size=20))
    s.append(text(300, 84, "slope 1", size=20))
    s.append(text(236, 148, "slope 2", size=20))
    s.append(text(200, 262, "flat section", size=20))
    s.append(text(393, 194, "cup", size=19))
    s.append(text(236, 209, "marble stops here", size=16, weight=900))
    s.append("</svg>")
    return "".join(s)


def compute_b(v):
    n = {k: float(x) for k, x in v.items()}
    eff = n["eff_out"] / n["eff_in"] * 100
    pw = n["pow_e"] / n["pow_t"]
    assert eff == int(eff) and pw == int(pw), "keep S3 answers whole numbers"
    d = {"eff_in_d": spaced(int(n["eff_in"])), "eff_out_d": spaced(int(n["eff_out"])),
         "eff_ans": "%d" % eff, "pow_e_d": spaced(int(n["pow_e"])),
         "pow_t": "%d" % n["pow_t"], "pow_ans": "%d" % pw}
    d["_num"] = {"eff": (eff, "%"), "pow": (pw, "W")}
    d["q12a_model"] = etd("hand dryer", "electrical", ["heat", "kinetic"], ["sound"])
    return d


def coaster():
    """A rollercoaster side view: a chain lift up to the highest hill, a big
    drop, then smaller hills to the end. The car waits at the top."""
    track = "M20 250 L60 250 L150 50 Q170 34 190 50 L250 238 Q270 256 290 238 L330 140 " \
            "Q350 124 370 140 L410 222 Q428 240 446 224 L470 200 L500 200"
    s = ['<svg class="run" viewBox="0 0 520 300" role="img" aria-label="Side view of a '
         'rollercoaster. From the start on the left, a chain lift climbs to the top of the '
         'first hill, the highest point. The track drops steeply, then goes over a smaller '
         'second hill and a smaller third rise to the end of the ride. The car is at the top '
         'of the first hill.">']
    s.append('<rect x="6" y="6" width="508" height="288" rx="10" style="fill:%s;stroke:%s;'
             'stroke-width:2"/>' % (BOARD, INK))
    s.append('<line x1="14" y1="270" x2="506" y2="270" style="stroke:%s;stroke-width:4"/>' % INK)
    for x, top in ((105, 150), (170, 44), (270, 250), (350, 132), (428, 236)):
        s.append('<line x1="%d" y1="%d" x2="%d" y2="270" style="stroke:%s;stroke-width:3;'
                 'stroke-dasharray:5 4"/>' % (x, top, x, INK))
    s.append('<path d="%s" style="fill:none;stroke:%s;stroke-width:6;stroke-linejoin:round;'
             'stroke-linecap:round"/>' % (track, INK))
    for k in range(9):
        x = 66 + k * 9.5
        y = 250 - (x - 60) * 200 / 90
        s.append('<line x1="%g" y1="%g" x2="%g" y2="%g" style="stroke:%s;stroke-width:3"/>'
                 % (x - 6, y - 3, x + 6, y + 3, INK))
    s.append('<rect x="152" y="18" width="36" height="20" rx="5" style="fill:%s;stroke:%s;'
             'stroke-width:2"/>' % (BALL, INK))
    s.append('<circle cx="160" cy="40" r="4" style="fill:%s"/><circle cx="180" cy="40" r="4" '
             'style="fill:%s"/>' % (INK, INK))
    s.append(text(30, 164, "chain", size=20, anchor="start"))
    s.append(text(30, 188, "lift", size=20, anchor="start"))
    s.append(text(206, 36, "first hill", size=20, anchor="start"))
    s.append(text(350, 110, "second hill", size=20))
    s.append(text(484, 188, "end", size=20))
    s.append("</svg>")
    return "".join(s)


TESTS = {"a": dict(src="test-a.md", compute=compute_a,
                   diagrams=lambda d: {"run": marble_run_fault()}),
         "b": dict(src="test-b.md", compute=compute_b,
                   diagrams=lambda d: {"coaster": coaster()})}


def main(which, out=None):
    t = TESTS[which]
    meta, values, qs = P.parse(open(os.path.join(HERE, t["src"]), encoding="utf-8").read())
    PROF.apply(meta)
    d = t["compute"](values)
    dia = t["diagrams"](d)
    data = P.payload(qs, d)
    html = P.page(meta, qs, d, dia, data)

    errs, warns = P.check(html, meta, qs, d, values)
    for w in warns:
        print("WARN  " + w)
    for e in errs:
        print("ERROR " + e)
    if errs:
        print("\n%d error(s) — not written." % len(errs))
        return 1

    out = out or os.path.join(SITE, "classes/s3-engineering/%s.html" % meta["slug"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(html)
    open(os.path.join(HERE, "provenance-%s.csv" % which), "w", encoding="utf-8").write(
        P.provenance(qs, d))
    open(os.path.join(HERE, "marking-instructions-%s.html" % which), "w",
         encoding="utf-8").write(P.marking_instructions(meta, qs, d))
    open(os.path.join(HERE, "answers-%s.json" % which), "w", encoding="utf-8").write(
        json.dumps({k: x for k, x in d.items() if not k.startswith("_")},
                   ensure_ascii=False, indent=1))
    print("built %s  (%d questions, %s marks, %d bytes)"
          % (out, len(qs), meta["marks"], len(html)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None))
