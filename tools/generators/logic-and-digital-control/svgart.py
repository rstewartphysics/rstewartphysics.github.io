"""Draw the deck's logic diagrams as inline SVG for the web page (one drawing, two outputs).

art.py draws with figlib.Canvas (Pillow -> PNG). SvgCanvas has the same methods, so the same
art.py function draws the page figure: same gates, wires, D/E labels and terminals as the
slides. Ink is currentColor and bubbles are filled with the page surface, so both appearances work.

    python3 build_page.py --redraw      # Mac only: draw every figure in FIGS into figures/
    svg = fig("l3_we2", alt="...")      # the page reads the saved drawing; works in CI
"""
import os
import re
import sys
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
FIGDIR = os.path.join(HERE, "figures", "drawn")
ART = os.path.expanduser("~/claude-work/n5-engineering/b4a/_build")
LW = 5
SS = 4

# name: (art.py function, its arguments, keywords). "@" in the arguments is the figure's name;
# with no "@" the name goes first. Same drawings as the deck figures of the same name.
FIGS = {
    "l2_gate_and": ("gate", ("AND", "@"), {}),
    "l2_gate_or": ("gate", ("OR", "@"), {}),
    "l2_gate_not": ("gate", ("NOT", "@"), {}),
    "l2_and_shape": ("gate", ("AND", "@"), {"stage": 1, "terminals": False}),
    "l2_and_lines": ("gate", ("AND", "@"), {"terminals": False}),
    "l2_series": ("switch_lamp", ("@", "series"), {}),
    "l2_parallel": ("switch_lamp", ("@", "parallel"), {}),
    "l2_test_rig": ("test_rig", (), {}),
    "l3_we1": ("two_not_and", (), {}),
    "l3_we2": ("three_input", ("NOT", "OR", "AND"), {}),
    "l3_yt2": ("three_input", ("AND", "NOT", "AND"), {}),
    "l4_we1": ("three_input", ("AND", "NOT", "OR"), {}),
    "l4_we2": ("three_input", ("NOT", "AND", "OR"), {}),
    "l4_yt2": ("three_input", ("OR", "NOT", "AND"), {}),
    "l5_fan": ("two_with_not", (), {"neg": "B"}),
    "m_and_or": ("pass_through", ("AND", "AB", "OR"), {}),
    "m_or_and": ("pass_through", ("AND", "BC", "OR"), {}),
    "p_or_and": ("pass_through", ("OR", "AB", "AND"), {}),
    "l5_lift": ("pass_through", ("OR", "BC", "AND"), {}),
}


class _Draw:
    """The two Pillow calls art.py makes directly on canvas.d (coordinates are supersampled)."""
    def __init__(self, c, ss):
        self.c, self.ss = c, ss

    def polygon(self, pts, fill="black"):
        p = [(x / self.ss, y / self.ss) for x, y in pts]
        for x, y in p:
            self.c._grow(x, y, x, y)
        d = " ".join(f"{x:.1f},{y:.1f}" for x, y in p)
        col = "var(--eng-surface)" if fill == "white" else "currentColor"
        self.c.parts.append(f'<polygon points="{d}" fill="{col}"/>')

    def ellipse(self, box, outline=None, width=0, fill=None):
        x0, y0, x1, y1 = (v / self.ss for v in box)
        self.c._grow(x0, y0, x1, y1)
        f = "none" if fill is None else ("var(--eng-surface)" if fill == "white" else "currentColor")
        st = f' stroke="currentColor" stroke-width="{width / self.ss:.1f}"' if outline else ""
        self.c.parts.append(f'<ellipse cx="{(x0 + x1) / 2:.1f}" cy="{(y0 + y1) / 2:.1f}" rx="{(x1 - x0) / 2:.1f}" '
                            f'ry="{(y1 - y0) / 2:.1f}" fill="{f}"{st}/>')

    def line(self, pts, fill="black", width=1, joint=None):
        self.c.line([(x / self.ss, y / self.ss) for x, y in pts], width / self.ss)

    def rectangle(self, box, fill="white", outline=None, width=0):
        x0, y0, x1, y1 = (v / self.ss for v in box)
        self.c._grow(x0, y0, x1, y1)
        col = "var(--eng-surface)" if fill == "white" else "currentColor"
        self.c.parts.append(f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{x1 - x0:.1f}" height="{y1 - y0:.1f}" fill="{col}"/>')


class SvgCanvas:  # same methods as figlib.Canvas
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.parts = []
        self.box = [1e9, 1e9, -1e9, -1e9]
        self.d = _Draw(self, SS)

    def _grow(self, x0, y0, x1, y1):
        b = self.box
        self.box = [min(b[0], x0), min(b[1], y0), max(b[2], x1), max(b[3], y1)]

    def line(self, pts, width=LW):
        for x, y in pts:
            self._grow(x - width, y - width, x + width, y + width)
        d = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        self.parts.append(f'<polyline points="{d}" fill="none" stroke="currentColor" '
                          f'stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>')

    def poly(self, pts, width=LW, close=True):
        self.line(list(pts) + ([pts[0]] if close else []), width)

    def dot(self, x, y, r=9):
        self._grow(x - r, y - r, x + r, y + r)
        self.parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="currentColor"/>')

    def bubble(self, x, y, r=11, width=LW):
        self._grow(x - r - width, y - r - width, x + r + width, y + r + width)
        self.parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="var(--eng-surface)" '
                          f'stroke="currentColor" stroke-width="{width}"/>')

    def text(self, x, y, s, size=34, anchor="mm", bold=False, fill="black"):
        w = 0.62 * size * len(s)
        self._grow(x - w / 2, y - size / 2, x + w / 2, y + size / 2)
        fw = ' font-weight="700"' if bold else ""
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="middle" '
                          f'dominant-baseline="central" fill="currentColor"{fw}>{escape(s)}</text>')

    def rect(self, x0, y0, x1, y1, width=LW, dash=None):
        self._grow(x0, y0, x1, y1)
        da = f' stroke-dasharray="{dash[0]} {dash[1]}"' if dash else ""
        self.parts.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="none" '
                          f'stroke="currentColor" stroke-width="{width}"{da}/>')

    def dashline(self, pts, dash=(18, 12), width=LW):
        self.line(pts, width)
        self.parts[-1] = self.parts[-1].replace("/>", f' stroke-dasharray="{dash[0]} {dash[1]}"/>')

    def save(self, path, trim=True, margin=14):
        x0, y0, x1, y1 = self.box
        if not trim:
            x0, y0, x1, y1 = 0, 0, self.w, self.h
        else:
            x0, y0, x1, y1 = x0 - margin, y0 - margin, x1 + margin, y1 + margin
        self.svg = (f'viewBox="{x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}"', "".join(self.parts))


_last = {}


def _capture(cls):
    class C(cls):
        def save(self, path, trim=True, margin=14):
            super().save(path, trim, margin)
            _last["svg"] = self.svg
    return C


def redraw():
    """Mac only: run each art.py function on an SvgCanvas and save figures/<name>.svg."""
    sys.path.insert(0, ART)
    import art
    import figlib
    global LW
    LW = figlib.LW
    old_a, old_f = art.Canvas, figlib.Canvas
    art.Canvas = figlib.Canvas = _capture(SvgCanvas)
    try:
        os.makedirs(FIGDIR, exist_ok=True)
        for name, (fn, args, kw) in FIGS.items():
            args = [name if a == "@" else a for a in args] if "@" in args else [name, *args]
            getattr(art, fn)(*args, **kw)
            vb, body = _last.pop("svg")
            with open(os.path.join(FIGDIR, name + ".svg"), "w") as f:
                f.write(f'<svg xmlns="http://www.w3.org/2000/svg" {vb}>{body}</svg>\n')
            print("drew", name)
    finally:
        art.Canvas, figlib.Canvas = old_a, old_f


def fig(name, alt, max_w=420):
    """The saved drawing as an inline, themed <svg> with its alt text."""
    src = open(os.path.join(FIGDIR, name + ".svg")).read()
    vb = re.search(r'viewBox="[^"]+"', src).group(0)
    body = src[src.index(">") + 1:src.rindex("</svg>")]
    return (f'<svg class="logicfig" {vb} role="img" aria-label="{escape(alt)}" focusable="false" '
            f'style="max-width:{max_w}px"><title>{escape(alt)}</title>{body}</svg>')
