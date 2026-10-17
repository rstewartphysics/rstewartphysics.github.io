"""
Inline-SVG figures for the 4b web page, drawn in the decks' geometry and words (WEB-PLAN).

    f = Flow(x0, y0)                          # inches, as fcdraw.py
    a = f.box("start", 0, 0, "start")
    with f.step(1):
        b = f.box("decision", 0, 1.4, "pin 1 on?")
        f.down(a, b)
    svg = f.svg("Flowchart: ...")             # role="img", <title>, viewBox fitted to the drawing

Same API and units as the deck's `fcdraw.Flow`, so a deck flowchart ports line for line. Output
is themed by the page: strokes and text are `currentColor`, box fill `var(--fc-fill)`, so it
works in both appearances. Shapes inside `step(k)` sit in `<g data-step="k">`, which the page
uses to light a box together with its program line.
"""
from contextlib import contextmanager
from html import escape

S = 72                     # px per deck inch
ARROW = 0.13
FONT = 15                  # px at 1:1


class Node:
    def __init__(self, cx, cy, w, h):
        self.cx, self.cy, self.w, self.h = cx, cy, w, h

    top = property(lambda n: (n.cx, n.cy - n.h / 2))
    bottom = property(lambda n: (n.cx, n.cy + n.h / 2))
    left = property(lambda n: (n.cx - n.w / 2, n.cy))
    right = property(lambda n: (n.cx + n.w / 2, n.cy))


def _n(v):
    return f"{v * S:.1f}".rstrip("0").rstrip(".")


class Flow:
    def __init__(self, x0=0.0, y0=0.0, col_w=2.90, row_h=0.80, box_w=2.15, box_h=0.50,
                 dec_w=2.45, dec_h=0.66):
        self.x0, self.y0 = x0, y0
        self.col_w, self.row_h = col_w, row_h
        self.box_w, self.box_h, self.dec_w, self.dec_h = box_w, box_h, dec_w, dec_h
        self.parts, self._step = [], None
        self.xs, self.ys = [], []

    # ---- layout, as fcdraw
    def at(self, col, row):
        return (self.x0 + col * self.col_w + self.col_w / 2,
                self.y0 + row * self.row_h + self.row_h / 2)

    @contextmanager
    def step(self, k):
        start = len(self.parts)
        yield
        inner = self.parts[start:]
        del self.parts[start:]
        self.parts.append(f'<g data-step="{k}">' + "".join(inner) + "</g>")

    def _grow(self, *pts):
        for x, y in pts:
            self.xs.append(x)
            self.ys.append(y)

    # ---- shapes
    def box(self, kind, col, row, text, dx=0.0, dy=0.0):
        cx, cy = self.at(col, row)
        cx, cy = cx + dx, cy + dy
        w, h = (self.dec_w, self.dec_h) if kind == "decision" else (self.box_w, self.box_h)
        if kind == "io":
            w += 0.30
        l, r, t, b = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
        if kind in ("start", "end"):
            shape = (f'<rect x="{_n(l)}" y="{_n(t)}" width="{_n(w)}" height="{_n(h)}" '
                     f'rx="{_n(h / 2)}"/>')
        elif kind == "io":
            k = 0.25
            shape = (f'<polygon points="{_n(l + k)},{_n(t)} {_n(r)},{_n(t)} {_n(r - k)},{_n(b)} '
                     f'{_n(l)},{_n(b)}"/>')
        elif kind == "decision":
            shape = (f'<polygon points="{_n(cx)},{_n(t)} {_n(r)},{_n(cy)} {_n(cx)},{_n(b)} '
                     f'{_n(l)},{_n(cy)}"/>')
        elif kind == "sub":
            k = 0.16
            shape = (f'<rect x="{_n(l)}" y="{_n(t)}" width="{_n(w)}" height="{_n(h)}"/>'
                     f'<path d="M{_n(l + k)} {_n(t)}V{_n(b)}M{_n(r - k)} {_n(t)}V{_n(b)}"/>')
        else:
            shape = f'<rect x="{_n(l)}" y="{_n(t)}" width="{_n(w)}" height="{_n(h)}"/>'
        self.parts.append(f'<g class="fc-box">{shape}</g>')
        if text:
            self.parts.append(self._text(cx, cy, text))
        self._grow((l, t), (r, b))
        return Node(cx, cy, w, h)

    def _text(self, x, y, text, anchor="middle", bold=False):
        w = ' font-weight="700"' if bold else ""
        return (f'<text x="{_n(x)}" y="{_n(y)}" text-anchor="{anchor}" dominant-baseline="central"'
                f'{w}>{escape(text)}</text>')

    def path(self, pts, arrow=True):
        pts = list(pts)
        if arrow:
            (x1, y1), (x2, y2) = pts[-2], pts[-1]
            dx, dy = x2 - x1, y2 - y1
            L = abs(dx) + abs(dy) or 1
            ux, uy = dx / L, dy / L
            tip = (x2, y2)
            pts[-1] = (x2 - ux * ARROW * 0.8, y2 - uy * ARROW * 0.8)
            a = ARROW
            base = (tip[0] - ux * a, tip[1] - uy * a)
            px, py = -uy * a * 0.55, ux * a * 0.55
            head = (f'<polygon class="fc-arrow" points="{_n(tip[0])},{_n(tip[1])} '
                    f'{_n(base[0] + px)},{_n(base[1] + py)} {_n(base[0] - px)},{_n(base[1] - py)}"/>')
        d = "M" + " L".join(f"{_n(x)} {_n(y)}" for x, y in pts)
        self.parts.append(f'<path class="fc-line" d="{d}"/>')
        if arrow:
            self.parts.append(head)
        self._grow(*pts)

    def down(self, a, b):
        self.path([a.bottom, b.top])

    def label(self, x, y, text, anchor_x="left"):
        anchor = {"left": "start", "right": "end", "centre": "middle"}[anchor_x]
        self.parts.append(self._text(x, y, text, anchor=anchor, bold=True))
        self._grow((x - 0.15, y - 0.15), (x + 0.15, y + 0.15))

    # ---- output
    def svg(self, title, pad=0.12):
        x0, x1 = min(self.xs) - pad, max(self.xs) + pad
        y0, y1 = min(self.ys) - pad, max(self.ys) + pad
        vb = f"{_n(x0)} {_n(y0)} {_n(x1 - x0)} {_n(y1 - y0)}"
        return (f'<svg class="fc" viewBox="{vb}" role="img" aria-label="{escape(title)}" '
                f'focusable="false" font-size="{FONT}"><title>{escape(title)}</title>'
                + "".join(self.parts) + "</svg>")


# ---------------------------------------------------------------- the L3 flowcharts
def _self_loop(f, d, side="right"):
    cx = d.cx
    xo = cx + f.col_w / 2 + 0.05 if side == "right" else cx - f.col_w / 2 - 0.05
    jy = d.top[1] - 0.18
    f.path([d.right if side == "right" else d.left, (xo, d.cy), (xo, jy), (cx, jy)])
    f.label((d.right[0] + 0.10) if side == "right" else (d.left[0] - 0.10), d.cy - 0.28, "N",
            anchor_x="left" if side == "right" else "right")
    f.label(cx + 0.16, d.bottom[1] + 0.14, "Y")


def barrier():
    """L3: if input1 is off then main / switch on 6 / pause 4000 / switch off 6 / goto main."""
    f = Flow(row_h=0.78)
    st = f.box("start", 0, 0, "start")
    cx = st.cx
    with f.step(1):
        d0 = f.box("decision", 0, 1.4, "pin 1 on?")
        f.down(st, d0)
        _self_loop(f, d0, "right")
    prev = d0
    for k, (kind, text) in enumerate((("io", "pin 6 on"), ("process", "pause 4 s"),
                                      ("io", "pin 6 off")), 2):
        with f.step(k):
            n = f.box(kind, 0, 2.6 + (k - 2) * 1.05, text)
            f.down(prev, n)
        prev = n
    with f.step(5):
        xl, jy2 = cx - f.col_w / 2, st.bottom[1] + 0.16
        f.path([prev.bottom, (cx, prev.bottom[1] + 0.25), (xl, prev.bottom[1] + 0.25), (xl, jy2),
                (cx, jy2)])
    return f.svg("Flowchart: start; decision pin 1 on? with N back to itself; Y to pin 6 on, "
                 "pause 4 s, pin 6 off; then back to the decision.")


def beeper():
    """L3: a buzzer on pin 5 beeps 4 times (0.2 s on, 0.2 s off), then the program ends."""
    f = Flow()
    st = f.box("start", 0, 0, "start")
    prev, first = st, None
    for k, (kind, text) in enumerate((("io", "pin 5 on"), ("process", "pause 0.2 s"),
                                      ("io", "pin 5 off"), ("process", "pause 0.2 s"))):
        with f.step(2):
            n = f.box(kind, 0, 1.15 + k, text)
            f.down(prev, n)
        first = first or n
        prev = n
    with f.step(3):
        dx = f.box("decision", 0, 5.2, "x4?")
        f.down(prev, dx)
        xl, jy = st.cx - f.col_w / 2, first.top[1] - 0.15
        f.path([dx.left, (xl, dx.cy), (xl, jy), (first.cx, jy)])
        f.label((dx.left[0] + xl) / 2, dx.cy - 0.24, "N", anchor_x="centre")
    with f.step(4):
        en = f.box("end", 0, 6.6, "end")
        f.down(dx, en)
        f.label(dx.cx + 0.16, dx.bottom[1] + 0.14, "Y")
    return f.svg("Flowchart: start; pin 5 on, pause 0.2 s, pin 5 off, pause 0.2 s; decision x4? "
                 "with N back to pin 5 on and Y to end.")


def your_turn():
    """L3 Your Turn answer: pin 3 on? / pin 5 on / pin 4 on / pause 2 s / pin 5 off / pause 1 s
    / pin 4 off / back to the decision."""
    f = Flow()
    st = f.box("start", 0, 0, "start")
    cx = st.cx
    d0 = f.box("decision", 0, 1.4, "pin 3 on?")
    f.down(st, d0)
    xr = cx + f.col_w / 2 + 0.05
    jy = d0.top[1] - 0.18
    f.path([d0.right, (xr, d0.cy), (xr, jy), (cx, jy)])
    f.label(d0.right[0] + 0.10, d0.cy - 0.28, "N")
    f.label(cx + 0.16, d0.bottom[1] + 0.14, "Y")
    a = f.box("io", 0, 2.7, "pin 5 on")
    f.down(d0, a)
    b = f.box("io", 0, 3.7, "pin 4 on")
    f.down(a, b)
    c = f.box("process", 0, 4.7, "pause 2 s")
    f.down(b, c)
    c1 = cx + f.col_w
    m1 = f.box("io", 1, 2.7, "pin 5 off")
    xm = cx + f.col_w / 2
    low = c.bottom[1] + 0.25
    f.path([c.bottom, (cx, low), (xm, low), (xm, m1.top[1] - 0.22), (c1, m1.top[1] - 0.22),
            m1.top])
    m2 = f.box("process", 1, 3.7, "pause 1 s")
    f.down(m1, m2)
    m3 = f.box("io", 1, 4.7, "pin 4 off")
    f.down(m2, m3)
    xr2 = c1 + f.col_w / 2
    ly = m3.bottom[1] + 0.25
    jy2 = st.bottom[1] + 0.10
    f.path([m3.bottom, (c1, ly), (xr2, ly), (xr2, jy2), (cx, jy2)])
    return f.svg("Flowchart: start; decision pin 3 on? with N back to itself; Y to pin 5 on, "
                 "pin 4 on, pause 2 s; then pin 5 off, pause 1 s, pin 4 off; back to the "
                 "decision.")


# ---------------------------------------------------------------- L2 figures
def symbol(kind, title):
    """One data-booklet symbol on its own (N4/N5 data booklet p.6), for the symbol table."""
    f = Flow(box_w=1.6, box_h=0.55, dec_w=1.8, dec_h=0.8)
    if kind == "line":
        f.path([(0.2, 0.4), (1.9, 0.4)])
    else:
        f.box(kind, 0, 0, "")
    return f.svg(title, pad=0.06).replace('class="fc"', 'class="fc fc-sym"', 1)


def car_wash():
    """L2 Your Turn answer: pin 1 on? / pin 5 on / pause 20 s / pin 5 off / pin 4 on /
    pause 30 s / pin 4 off / back to the decision."""
    f = Flow(row_h=0.72)
    st = f.box("start", 0, 0, "start")
    d0 = f.box("decision", 0, 1.45, "pin 1 on?")
    f.down(st, d0)
    _self_loop(f, d0, "right")
    prev = d0
    for k, (kind, text) in enumerate((("io", "pin 5 on"), ("process", "pause 20 s"),
                                      ("io", "pin 5 off"), ("io", "pin 4 on"),
                                      ("process", "pause 30 s"), ("io", "pin 4 off"))):
        n = f.box(kind, 0, 2.85 + k * 1.05, text)
        f.down(prev, n)
        prev = n
    xl, jy = st.cx - f.col_w / 2, st.bottom[1] + 0.16
    f.path([prev.bottom, (st.cx, prev.bottom[1] + 0.25), (xl, prev.bottom[1] + 0.25), (xl, jy),
            (st.cx, jy)])
    return f.svg("Flowchart: start; decision pin 1 on? with N back to itself; Y to pin 5 on, "
                 "pause 20 s, pin 5 off, pin 4 on, pause 30 s, pin 4 off; then back to the "
                 "decision.")
