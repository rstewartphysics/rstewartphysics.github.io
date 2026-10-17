"""Phase 0a — BS-IEC circuit schematics as inline SVG.

Themed with CSS variables so the same drawing inverts correctly in dark mode
and prints crisply.  UK convention throughout: a resistor is a plain rectangle,
components sit centred within equal leads, and every real node carries a
junction dot.

Layout model: the circuit is one rectangular loop.  `top` elements sit on the
top rail, `bottom` elements on the bottom rail, and a `Par` group on either rail
expands away from it.  That covers the N5 circuit vocabulary without a router.

SVG first (web + print PDF).  A PNG path for python-pptx can wrap this later.
"""

INK = "var(--dia-ink, currentColor)"
FONT = '"Trebuchet MS","Segoe UI",system-ui,-apple-system,sans-serif'

LEAD = 16          # wire either side of a symbol body
SW = 2.0           # stroke width
DOT = 3.4          # junction dot radius
LABEL_GAP = 11     # label baseline offset from the body edge
ACROSS_DROP = 50   # how far a parallel-connected meter sits off the rail


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def _line(x1, y1, x2, y2, w=SW):
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
            'stroke-width="%.1f" stroke-linecap="round"/>' % (x1, y1, x2, y2, INK, w))


def _text(x, y, s, size=13, anchor="middle", weight=700, style=""):
    return ('<text x="%.1f" y="%.1f" fill="%s" font-family=%s font-size="%d" '
            'font-weight="%d" text-anchor="%s"%s>%s</text>'
            % (x, y, INK, '\'%s\'' % FONT, size, weight, anchor,
               ' font-style="italic"' if style == "i" else "", esc(s)))


def _dot(x, y):
    return '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/>' % (x, y, DOT, INK)


# ---------------------------------------------------------------- components

class Element(object):
    """A two-terminal symbol.  `w` is its full footprint including leads."""
    body = 44
    label_above = True

    def __init__(self, label="", sub="", across=None):
        self.label = label
        self.sub = sub
        self.across = across          # a meter connected in parallel with this body

    @property
    def w(self):
        return max(self.body, self.across.w if self.across else 0) + 2 * LEAD

    @property
    def h_up(self):
        return 26 if self.label else 18

    @property
    def h_down(self):
        return 18

    @property
    def across_clear(self):
        return ACROSS_DROP + self.across.body / 2.0 + 16 if self.across else 0

    @property
    def across_w(self):
        return max(self.body, self.across.w) if self.across else 0

    def draw(self, x, cy, direction=1):
        """x is the left edge of the footprint; the body is centred in it.
        `direction` is where the rail's parallel groups expand, so an `across`
        meter is hung on the opposite side and stays clear of them."""
        bx = x + LEAD
        out = [_line(x, cy, bx, cy), _line(bx + self.body, cy, x + self.w, cy)]
        out.append(self.symbol(bx, cy))
        out.extend(self.labels(x + self.w / 2.0, cy))
        if self.across:
            out.append(self._draw_across(x, cy, direction))
        return "".join(out)

    def _draw_across(self, x, cy, direction):
        """Hang a parallel-connected meter off the rail.  The tap span never
        narrows below the meter's own footprint, so its leads cannot overhang."""
        m = self.across
        cx = x + self.w / 2.0
        span = max(self.body, m.w)
        xl, xr = cx - span / 2.0, cx + span / 2.0
        my = cy - direction * ACROSS_DROP
        out = [_dot(xl, cy), _dot(xr, cy),
               _line(xl, cy, xl, my), _line(xr, cy, xr, my)]
        out.append(m.draw(cx - m.w / 2.0, my, direction))
        if span > m.w:
            out.append(_line(xl, my, cx - m.w / 2.0, my))
            out.append(_line(cx + m.w / 2.0, my, xr, my))
        return "".join(out)

    def labels(self, cx, cy):
        out = []
        if self.label:
            out.append(_text(cx, cy - self.body / 2.0 - LABEL_GAP, self.label))
        if self.sub:
            out.append(_text(cx, cy + self.body / 2.0 + LABEL_GAP + 4, self.sub, size=12))
        return out

    def symbol(self, bx, cy):
        raise NotImplementedError


class R(Element):
    """Resistor — plain BS-IEC rectangle, never a zig-zag."""
    bh = 20

    def symbol(self, bx, cy):
        return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1.5" '
                'fill="none" stroke="%s" stroke-width="%.1f"/>'
                % (bx, cy - self.bh / 2.0, self.body, self.bh, INK, SW))


class VR(R):
    """Variable resistor — rectangle with a diagonal arrow through it."""
    def symbol(self, bx, cy):
        s = R.symbol(self, bx, cy)
        x1, y1 = bx + 3, cy + 15
        x2, y2 = bx + self.body - 3, cy - 15
        s += _line(x1, y1, x2, y2)
        s += ('<path d="M %.1f %.1f L %.1f %.1f L %.1f %.1f Z" fill="%s"/>'
              % (x2, y2, x2 - 9.5, y2 + 3.2, x2 - 3.2, y2 + 9.5, INK))
        return s

    @property
    def h_up(self):
        return 34 if self.label else 22

    @property
    def h_down(self):
        return 24


class Fuse(R):
    """Fuse — rectangle with the conductor drawn straight through it."""
    def symbol(self, bx, cy):
        return R.symbol(self, bx, cy) + _line(bx, cy, bx + self.body, cy)


class Circle(Element):
    body = 34
    glyph = ""
    glyph_style = ""

    def symbol(self, bx, cy):
        r = self.body / 2.0
        s = ('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" '
             'stroke-width="%.1f"/>' % (bx + r, cy, r, INK, SW))
        if self.glyph:
            s += _text(bx + r, cy + 5.5, self.glyph, size=15, weight=800,
                       style=self.glyph_style)
        return s


class A(Circle):
    glyph = "A"


class V(Circle):
    glyph = "V"


class Ohm(Circle):
    glyph = "Ω"


class Motor(Circle):
    glyph = "M"


class Lamp(Circle):
    """Lamp — circle with a cross, the UK schematic symbol."""
    def symbol(self, bx, cy):
        r = self.body / 2.0
        cx = bx + r
        d = r * 0.7071
        return (Circle.symbol(self, bx, cy)
                + _line(cx - d, cy - d, cx + d, cy + d)
                + _line(cx - d, cy + d, cx + d, cy - d))


class Cell(Element):
    """One cell: long thin plate pair."""
    body = 26

    def symbol(self, bx, cy):
        return (_line(bx + 8, cy - 15, bx + 8, cy + 15)          # long  (+)
                + _line(bx + 18, cy - 7, bx + 18, cy + 7))       # short (−)


class Battery(Element):
    """Battery of cells — two cell pairs with the standard gap."""
    body = 44

    def symbol(self, bx, cy):
        return (_line(bx + 6, cy - 15, bx + 6, cy + 15)
                + _line(bx + 15, cy - 7, bx + 15, cy + 7)
                + _line(bx + 29, cy - 15, bx + 29, cy + 15)
                + _line(bx + 38, cy - 7, bx + 38, cy + 7))


class Switch(Element):
    """Switch — closed lies flat, open lifts to 30°."""
    body = 40

    def __init__(self, label="", sub="", closed=False):
        Element.__init__(self, label, sub)
        self.closed = closed

    def symbol(self, bx, cy):
        x2 = bx + self.body
        s = _dot(bx, cy) + _dot(x2, cy)
        if self.closed:
            s += _line(bx, cy, x2, cy)
        else:
            s += _line(bx, cy, x2 - 4, cy - 18)
        return s

    @property
    def h_up(self):
        return 34 if self.label else 24


class Wire(Element):
    """Plain span of wire — used to pad a parallel branch."""
    def __init__(self, w=60):
        Element.__init__(self)
        self._w = w

    @property
    def w(self):
        return self._w

    @property
    def h_up(self):
        return 8

    @property
    def h_down(self):
        return 8

    def draw(self, x, cy, direction=1):
        return _line(x, cy, x + self._w, cy)


class Par(object):
    """Parallel group: branches stacked away from the rail it sits on."""
    def __init__(self, branches, gap=64):
        self.branches = branches
        self.gap = gap

    @property
    def w(self):
        return max(sum(e.w for e in b) for b in self.branches) + 2 * LEAD

    @property
    def span(self):
        return self.gap * (len(self.branches) - 1)


# ---------------------------------------------------------------- the loop

def _flip(e):
    """Copy of an element with its label moved under the body."""
    if isinstance(e, Par) or not getattr(e, "label", ""):
        return e
    import copy
    c = copy.copy(e)
    c.label, c.sub = "", e.sub or e.label
    return c


def _rail_width(elems):
    return sum(e.w for e in elems)


def _draw_rail(elems, x0, cy, direction):
    """Lay elements left to right from x0 along y=cy.  `direction` is +1 when
    the rail's parallel branches expand downwards (top rail), −1 upwards."""
    out, x = [], x0
    for e in elems:
        if isinstance(e, Par):
            out.append(_draw_par(e, x, cy, direction))
        else:
            out.append(e.draw(x, cy, direction))
        x += e.w
    return "".join(out), x


def _draw_par(par, x, cy, direction):
    """Branches are listed top to bottom whichever rail the group sits on, and
    each one's labels go on the side away from its neighbour."""
    out = []
    w = par.w
    branches = par.branches
    n = len(branches)
    ys = [cy + direction * par.gap * (i if direction > 0 else n - 1 - i)
          for i in range(n)]
    mid = (min(ys) + max(ys)) / 2.0
    xl, xr = x, x + w
    out.append(_line(xl, cy, xl + LEAD, cy))
    out.append(_line(xr - LEAD, cy, xr, cy))
    out.append(_line(xl + LEAD, ys[0], xl + LEAD, ys[-1]))
    out.append(_line(xr - LEAD, ys[0], xr - LEAD, ys[-1]))
    for i, y in enumerate(ys):
        inner = w - 2 * LEAD
        br = branches[i]
        if y > mid:
            br = [_flip(e) for e in br]
        bw = sum(e.w for e in br)
        bx = xl + LEAD + (inner - bw) / 2.0
        out.append(_line(xl + LEAD, y, bx, y))
        out.append(_line(bx + bw, y, xr - LEAD, y))
        s, _ = _draw_rail(br, bx, y, direction)
        out.append(s)
    out.append(_dot(xl + LEAD, cy))
    out.append(_dot(xr - LEAD, cy))
    return "".join(out)


def _extent(elems, direction):
    """(away-from-rail, toward-rail) clearance a rail needs."""
    away = tow = 0
    for e in elems:
        if isinstance(e, Par):
            clear = max(max(max(b.h_up, b.h_down) for b in br)
                        for br in e.branches)
            away = max(away, e.span + clear)
            tow = max(tow, clear)
        else:
            away = max(away, e.h_down if direction > 0 else e.h_up)
            tow = max(tow, (e.h_up if direction > 0 else e.h_down)
                      + getattr(e, "across_clear", 0))
    return away, tow


def schematic(top=None, bottom=None, pad=14, min_side=90, label="", edge=22):
    """One rectangular loop.  Top-rail parallel groups hang downwards, bottom-rail
    groups rise upwards, so both stay inside the loop."""
    top = list(top or [])
    bottom = list(bottom or [])
    if not top:
        top = [Wire(160)]
    if not bottom:
        bottom = [Wire(160)]
    # keep every component clear of the corners, so a parallel group's rails are
    # never mistaken for the side of the loop
    top = [Wire(edge)] + top + [Wire(edge)]
    bottom = [Wire(edge)] + bottom + [Wire(edge)]

    inner = max(_rail_width(top), _rail_width(bottom))
    top_pad = (inner - _rail_width(top)) / 2.0
    bot_pad = (inner - _rail_width(bottom)) / 2.0

    t_in, t_out = _extent(top, +1)
    b_in, b_out = _extent(bottom, -1)

    side = max(min_side, t_in + b_in + 30)
    x0 = pad + 4
    ty = pad + t_out + 4
    by = ty + side
    x1 = x0 + inner

    parts = []
    s, _ = _draw_rail(top, x0 + top_pad, ty, +1)
    parts.append(s)
    s, _ = _draw_rail(bottom, x0 + bot_pad, by, -1)
    parts.append(s)
    if top_pad:
        parts.append(_line(x0, ty, x0 + top_pad, ty))
        parts.append(_line(x1 - top_pad, ty, x1, ty))
    if bot_pad:
        parts.append(_line(x0, by, x0 + bot_pad, by))
        parts.append(_line(x1 - bot_pad, by, x1, by))
    parts.append(_line(x0, ty, x0, by))
    parts.append(_line(x1, ty, x1, by))

    w = x1 + pad + 4
    h = by + b_out + pad + 4
    return _svg(parts, w, h, label)


def symbol_row(items, cell_w=112, label_h=26, letters=None):
    """A row of standalone symbols under letters — the SQA 'which row identifies
    these components' idiom."""
    parts = []
    h = 92
    for i, e in enumerate(items):
        cx = i * cell_w + cell_w / 2.0
        if letters:
            parts.append(_text(cx, 18, letters[i], size=15, weight=800))
        x = cx - e.w / 2.0
        parts.append(e.draw(x, h / 2.0 + 12))
    return _svg(parts, cell_w * len(items), h, "")


def _svg(parts, w, h, label):
    aria = ' role="img" aria-label="%s"' % esc(label) if label else ' aria-hidden="true"'
    return ('<svg class="ckt" viewBox="0 0 %.0f %.0f" width="100%%" '
            'preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"%s>'
            '%s</svg>' % (w, h, aria, "".join(parts)))


def network(elems, terminals=("X", "Y"), pad=16, stub=30):
    """An open two-terminal network — the 'total resistance between X and Y'
    idiom.  Parallel groups are centred on the rail so the network stays
    symmetric about its own axis."""
    up = dn = 0
    for e in elems:
        if isinstance(e, Par):
            half = e.span / 2.0
            clear = max(max(max(b.h_up, b.h_down) for b in br) for br in e.branches)
            up = max(up, half + clear)
            dn = max(dn, half + clear)
        else:
            up = max(up, e.h_up)
            dn = max(dn, e.h_down)

    cy = pad + up
    x0 = pad + stub
    parts, x = [], x0
    for e in elems:
        if isinstance(e, Par):
            parts.append(_draw_par_centred(e, x, cy))
        else:
            parts.append(e.draw(x, cy, 1))
        x += e.w

    parts.insert(0, _line(pad, cy, x0, cy))
    parts.append(_line(x, cy, x + stub, cy))
    parts.append(_dot(pad, cy))
    parts.append(_dot(x + stub, cy))
    parts.append(_text(pad - 6, cy + 5, terminals[0], size=14, anchor="end", weight=800))
    parts.append(_text(x + stub + 6, cy + 5, terminals[1], size=14, anchor="start", weight=800))
    return _svg(parts, x + stub + pad + 14, cy + dn + pad, "")


def _draw_par_centred(par, x, cy):
    """Parallel group straddling the rail — used by `network`."""
    n = len(par.branches)
    ys = [cy + par.gap * (i - (n - 1) / 2.0) for i in range(n)]
    out, w = [], par.w
    xl, xr = x, x + w
    out.append(_line(xl, cy, xl + LEAD, cy))
    out.append(_line(xr - LEAD, cy, xr, cy))
    out.append(_line(xl + LEAD, ys[0], xl + LEAD, ys[-1]))
    out.append(_line(xr - LEAD, ys[0], xr - LEAD, ys[-1]))
    for i, y in enumerate(ys):
        inner = w - 2 * LEAD
        bw = sum(e.w for e in par.branches[i])
        bx = xl + LEAD + (inner - bw) / 2.0
        out.append(_line(xl + LEAD, y, bx, y))
        out.append(_line(bx + bw, y, xr - LEAD, y))
        br = par.branches[i]
        if y > cy:
            br = [_flip(e) for e in br]
        s, _ = _draw_rail(br, bx, y, +1)
        out.append(s)
    out.append(_dot(xl + LEAD, cy))
    out.append(_dot(xr - LEAD, cy))
    return "".join(out)


BAND_HEX = {
    "black": "#111111", "brown": "#7a4a1e", "red": "#cc2222",
    "orange": "#e07820", "yellow": "#e8c027", "green": "#1f8a3c",
    "blue": "#2060c0", "violet": "#7a3fb0", "grey": "#8a8a8a",
    "white": "#f2f2f2", "gold": "#c9a227", "silver": "#b8b8b8",
}


def resistor_bands(colours, w=300, h=104, name_h=52):
    """A physical resistor with its colour bands — the colour-code idiom.

    The band colours are also named in the stem and in the aria-label, so the
    question never depends on colour alone.
    """
    bw, bh = 168.0, 46.0
    bx, by = (w - bw) / 2.0, (h - bh) / 2.0
    parts = [_line(6, h / 2.0, bx, h / 2.0), _line(bx + bw, h / 2.0, w - 6, h / 2.0)]
    parts.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="16" '
                 'fill="var(--dia-body, #e8ddc4)" stroke="%s" stroke-width="%.1f"/>'
                 % (bx, by, bw, bh, INK, SW))
    n = len(colours)
    start = bx + 22
    step = 26
    for i, c in enumerate(colours):
        x = start + i * step + (18 if i == n - 1 else 0)
        parts.append('<rect x="%.1f" y="%.1f" width="11" height="%.1f" fill="%s" '
                     'stroke="%s" stroke-width="0.8"/>'
                     % (x, by + 2, bh - 4, BAND_HEX.get(c, "#111"), INK))
        parts.append('<g transform="translate(%.1f,%.1f) rotate(90)">%s</g>'
                     % (x + 9.5, by + bh + 8, _text(0, 0, c, size=10, weight=700,
                                                    anchor="start")))
    label = "Resistor with colour bands: " + ", ".join(colours)
    return _svg(parts, w, h + name_h, label)


# ------------------------------------------- Higher Electricity additions
# Added 17 Sep 2026 for the Higher Electricity unit pair. New classes only —
# nothing above changes, so every earlier test rebuilds byte-for-byte.

class Capacitor(Element):
    """Capacitor — two equal parallel plates across the wire, BS-IEC."""
    body = 22

    def symbol(self, bx, cy):
        return (_line(bx, cy, bx + 7, cy) + _line(bx + 15, cy, bx + 22, cy)
                + _line(bx + 7, cy - 15, bx + 7, cy + 15, w=2.6)
                + _line(bx + 15, cy - 15, bx + 15, cy + 15, w=2.6))

    @property
    def h_up(self):
        return 30 if self.label else 20

    @property
    def h_down(self):
        return 26 if self.sub else 18


class ACSupply(Circle):
    """a.c. supply — a circle carrying one cycle of a sine wave."""
    def symbol(self, bx, cy):
        r = self.body / 2.0
        cx = bx + r
        s = Circle.symbol(self, bx, cy)
        s += ('<path d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f '
              'C %.1f %.1f %.1f %.1f %.1f %.1f" fill="none" stroke="%s" '
              'stroke-width="%.1f" stroke-linecap="round"/>'
              % (cx - 10, cy, cx - 7, cy - 11, cx - 3, cy - 11, cx, cy,
                 cx + 3, cy + 11, cx + 7, cy + 11, cx + 10, cy, INK, SW))
        return s


class Source(Element):
    """A cell with its internal resistance, drawn the SQA way: the cell and a
    resistor r inside one dashed box, with the e.m.f. named on the cell."""
    body = 118

    def __init__(self, emf="E", r="r", label="", sub="", across=None):
        Element.__init__(self, label, sub, across)
        self.emf, self.r = emf, r

    @property
    def h_up(self):
        return 44 if self.label else 36

    @property
    def h_down(self):
        return 30

    def symbol(self, bx, cy):
        cell = Cell()
        res = R()
        res.body = 40
        out = [('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="4" fill="none" '
                'stroke="%s" stroke-width="1.4" stroke-dasharray="5 4"/>'
                % (bx, cy - 26, self.body, 52, INK))]
        x = bx + 8
        out.append(_line(bx, cy, x, cy))
        out.append(cell.symbol(x + 4, cy))
        out.append(_line(x, cy, x + 12, cy))
        out.append(_line(x + 22, cy, x + 40, cy))
        out.append(res.symbol(x + 40, cy))
        out.append(_line(x + 80, cy, bx + self.body, cy))
        out.append(_text(x + 16, cy - 30 - 3, self.emf, size=13, style="i"))
        out.append(_text(x + 60, cy - 30 - 3, self.r, size=13, style="i"))
        return "".join(out)

    def labels(self, cx, cy):
        out = []
        if self.label:
            out.append(_text(cx, cy - 26 - 22, self.label))
        if self.sub:
            out.append(_text(cx, cy + 26 + 16, self.sub, size=12))
        return out

    # A meter across the terminals hangs further off the rail than across a
    # plain resistor, so it clears the dashed box and the E and r labels above it.
    DROP = 78

    @property
    def across_clear(self):
        return self.DROP + self.across.body / 2.0 + 10 if self.across else 0

    def _draw_across(self, x, cy, direction):
        m = self.across
        cx = x + self.w / 2.0
        span = max(self.body, m.w) + 12
        xl, xr = cx - span / 2.0, cx + span / 2.0
        my = cy - direction * self.DROP
        out = [_dot(xl, cy), _dot(xr, cy),
               _line(xl, cy, xl, my), _line(xr, cy, xr, my),
               m.draw(cx - m.w / 2.0, my, direction),
               _line(xl, my, cx - m.w / 2.0, my),
               _line(cx + m.w / 2.0, my, xr, my)]
        return "".join(out)
