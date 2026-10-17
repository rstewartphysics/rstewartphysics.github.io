"""Electric and magnetic field diagrams as inline SVG.

The sibling of `circuit.py`, built for Higher Particles and Waves: point-charge
field patterns, charged parallel plates, regions of magnetic field drawn as
crosses or dots, and the two accelerator geometries.

Same conventions as `circuit.py` and the site's `higher-topic-page-guide.md`
§7 — themed with `var(--dia-ink)` so dark mode inverts, arrowheads drawn as
polygons rather than SVG markers (a marker needs an id, and two diagrams on one
page would collide), field lines evenly spaced and always carrying a direction.

The one rule that governs every function here: **a field line shows the
direction of the force on a POSITIVE charge**, so lines leave a positive charge
and enter a negative one.
"""
import math

INK = "var(--dia-ink, currentColor)"
FONT = '"Trebuchet MS","Segoe UI",system-ui,-apple-system,sans-serif'
SW = 2.0
FIELD_SW = 1.6


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _line(x1, y1, x2, y2, w=SW, dash=None):
    d = ' stroke-dasharray="%s"' % dash if dash else ""
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
            'stroke-width="%.1f" stroke-linecap="round"%s/>'
            % (x1, y1, x2, y2, INK, w, d))


def _text(x, y, s, size=13, anchor="middle", weight=700, style=""):
    return ('<text x="%.1f" y="%.1f" fill="%s" font-family=\'%s\' font-size="%d" '
            'font-weight="%d" text-anchor="%s"%s>%s</text>'
            % (x, y, INK, FONT, size, weight, anchor,
               ' font-style="italic"' if style == "i" else "", esc(s)))


def _head(x, y, ang, size=7.0):
    """An arrowhead sitting at (x, y), pointing along `ang` radians."""
    back, wing = size * 1.7, size * 0.72
    pts = []
    for k in (0, 1, -1):
        if k == 0:
            pts.append((x, y))
        else:
            bx = x - back * math.cos(ang) + k * wing * math.sin(ang)
            by = y - back * math.sin(ang) - k * wing * math.cos(ang)
            pts.append((bx, by))
    return ('<polygon points="%s" fill="%s"/>'
            % (" ".join("%.1f,%.1f" % p for p in pts), INK))


def _arrow(x1, y1, x2, y2, w=SW, head=7.0, shorten=0.0):
    """A straight line finished with an arrowhead at the (x2, y2) end."""
    ang = math.atan2(y2 - y1, x2 - x1)
    ex, ey = x2 - shorten * math.cos(ang), y2 - shorten * math.sin(ang)
    bx = ex - head * 1.5 * math.cos(ang)
    by = ey - head * 1.5 * math.sin(ang)
    return _line(x1, y1, bx, by, w) + _head(ex, ey, ang, head)


def _mid_head(x1, y1, x2, y2, t=0.55, size=6.4):
    """An arrowhead part-way along a line — how a field line is marked."""
    ang = math.atan2(y2 - y1, x2 - x1)
    return _head(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, ang, size)


def svg(parts, w, h, label, cls="fld"):
    aria = ' role="img" aria-label="%s"' % esc(label) if label else ' aria-hidden="true"'
    return ('<svg class="%s" viewBox="0 0 %.0f %.0f" width="100%%" '
            'preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"%s>'
            '%s</svg>' % (cls, w, h, aria, "".join(parts)))


# --------------------------------------------------------- point charges

CHARGE_R = 13.0


def _charge(cx, cy, sign, r=CHARGE_R):
    """The charge itself: a circle carrying + or −, drawn not filled so the
    symbol inside stays legible in both themes."""
    out = ['<circle cx="%.1f" cy="%.1f" r="%.1f" fill="var(--dia-page, transparent)" '
           'stroke="%s" stroke-width="%.1f"/>' % (cx, cy, r, INK, SW)]
    out.append(_line(cx - 6, cy, cx + 6, cy, 2.4))
    if sign > 0:
        out.append(_line(cx, cy - 6, cx, cy + 6, 2.4))
    return "".join(out)


def point_charge(cx, cy, sign, reach=52.0, n=8, r=CHARGE_R):
    """Radial field lines around a single point charge, evenly spread.

    Lines point away from a positive charge and towards a negative one — the
    single most-marked mistake in this topic, so the arrowhead is drawn on
    every line, not just one."""
    out = [_charge(cx, cy, sign, r)]
    for i in range(n):
        a = 2 * math.pi * i / n - math.pi / 2
        x0, y0 = cx + (r + 3) * math.cos(a), cy + (r + 3) * math.sin(a)
        x1, y1 = cx + reach * math.cos(a), cy + reach * math.sin(a)
        out.append(_line(x0, y0, x1, y1, FIELD_SW))
        if sign > 0:
            out.append(_mid_head(x0, y0, x1, y1, 0.62))
        else:
            out.append(_mid_head(x1, y1, x0, y0, 0.62))
    return "".join(out)


def charge_row(signs, letters, label=""):
    """A row of independent point-charge patterns, lettered — the SQA
    "which row in the table shows the charges" idiom."""
    cell, h = 132.0, 150.0
    parts = []
    for i, s in enumerate(signs):
        cx = i * cell + cell / 2.0
        parts.append(point_charge(cx, 78, s))
        parts.append(_text(cx, 142, letters[i], size=15, weight=800))
    return svg(parts, cell * len(signs), h, label)


# ------------------------------------------------------------------ plates

def plates(top="+", bottom="−", pd="", field=True, field_dir=None, particle=None,
           particle_pos=0.5, left_label="", right_label="", label="",
           beam=None, h=176.0):
    """Two charged parallel plates seen edge-on.

    `field=True` draws the uniform field: straight, equally spaced, at right
    angles to the plates, starting and finishing on them, pointing from the
    positive plate to the negative one. `field_dir` overrides that direction for
    a question whose plates are lettered rather than signed, where the sign is
    what is being asked for.

    A field line that would run through the particle is drawn in two segments
    with a gap around it, and its arrowhead is moved into the longer segment.
    Equal spacing is what SQA marks, so no line is ever dropped or shifted —
    it passes *behind* the particle, which is how the papers draw it.
    """
    w = 400.0
    px0, px1 = 62.0, 268.0
    ty, by = 44.0, h - 62.0
    parts = [_line(px0, ty, px1, ty, 3.0), _line(px0, by, px1, by, 3.0)]
    parts.append(_text(px0 - 12, ty + 5, top, size=17, anchor="end", weight=800))
    parts.append(_text(px0 - 12, by + 5, bottom, size=17, anchor="end", weight=800))

    pcx = pcy = None
    prad = 11.0
    if particle:
        pcx = (px0 + px1) / 2.0
        pcy = ty + (by - ty) * particle_pos

    if field:
        n = 5
        down = (top == "+") if field_dir is None else (field_dir == "down")
        clear = prad + 7.0          # gap left around the particle, each side
        for i in range(n):
            x = px0 + 20 + i * (px1 - px0 - 40) / (n - 1.0)
            y0, y1 = (ty + 3, by - 3) if down else (by - 3, ty + 3)
            hits = pcx is not None and abs(x - pcx) < clear
            if not hits:
                parts.append(_line(x, y0, x, y1, FIELD_SW))
                parts.append(_mid_head(x, y0, x, y1, 0.58))
                continue
            # split the line around the particle and give the arrowhead to the
            # longer of the two pieces, so every line still shows its direction
            top_end, bot_start = pcy - clear, pcy + clear
            first = (y0, top_end) if down else (y0, bot_start)
            second = (bot_start, y1) if down else (top_end, y1)
            for seg in (first, second):
                parts.append(_line(x, seg[0], x, seg[1], FIELD_SW))
            longer = max((first, second), key=lambda s: abs(s[1] - s[0]))
            parts.append(_mid_head(x, longer[0], x, longer[1], 0.55))

    if beam:
        y = (ty + by) / 2.0
        parts.append(_arrow(px0 - 30, y, px1 + 18, y, SW, 7.5))
        parts.append(_text((px0 + px1) / 2.0, y - 12, beam, size=12, weight=700))
    if particle:
        sym, sign, note = particle
        parts.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="var(--dia-page, #fff)" '
                     'stroke="%s" stroke-width="%.1f"/>' % (pcx, pcy, prad, INK, SW))
        parts.append(_text(pcx, pcy + 4, sym, size=11, weight=800))
        if note:
            parts.append(_text(pcx + prad + 7, pcy + 4, note, size=11.5,
                               anchor="start", weight=600))
    if pd:
        parts.append(_line(px1 + 22, ty, px1 + 22, by, 1.4, dash="4 3"))
        parts.append(_line(px1 + 17, ty, px1 + 27, ty, 1.4))
        parts.append(_line(px1 + 17, by, px1 + 27, by, 1.4))
        parts.append(_text(px1 + 34, (ty + by) / 2.0 + 4, pd, size=13, anchor="start"))
    if left_label:
        parts.append(_text(px0, ty - 14, left_label, size=12, anchor="start", weight=600))
    if right_label:
        parts.append(_text(px1, by + 22, right_label, size=12, anchor="end", weight=600))
    return svg(parts, w, h, label)


# --------------------------------------------------- magnetic field regions

def _cross(x, y, s=4.6):
    return _line(x - s, y - s, x + s, y + s, 1.5) + _line(x - s, y + s, x + s, y - s, 1.5)


def _dotmark(x, y):
    return '<circle cx="%.1f" cy="%.1f" r="2.6" fill="%s"/>' % (x, y, INK)


def field_region(into=True, w=260.0, h=150.0, x0=30.0, y0=30.0, cols=5, rows=4):
    """The box of crosses (into the page) or dots (out of the page)."""
    parts = ['<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" '
             'stroke="%s" stroke-width="1.4" stroke-dasharray="5 4"/>'
             % (x0, y0, w, h, INK)]
    for r in range(rows):
        for c in range(cols):
            x = x0 + w * (c + 0.5) / cols
            y = y0 + h * (r + 0.5) / rows
            parts.append(_cross(x, y) if into else _dotmark(x, y))
    return parts


def particle_in_field(into=True, particle="proton", motion="right",
                      region_label="region of magnetic field into page", label=""):
    """A charged particle entering a region of magnetic field — the SQA
    left-hand-rule idiom. `motion` is the direction the particle travels.

    The particle enters **between** two rows or columns of marks rather than
    along one of them, so the arrow never runs through a cross or a dot, and
    its name is set clear of the region box.
    """
    W, H = 360.0, 224.0
    bx, by, bw, bh = 104.0, 34.0, 224.0, 132.0
    cols, rows = 5, 4
    parts = field_region(into, bw, bh, bx, by, cols, rows)
    colx = [bx + bw * (c + 0.5) / cols for c in range(cols)]
    rowy = [by + bh * (r + 0.5) / rows for r in range(rows)]
    # enter between the two central marks, never down a line of them
    mid_x = (colx[cols // 2 - 1] + colx[cols // 2]) / 2.0
    mid_y = (rowy[rows // 2 - 1] + rowy[rows // 2]) / 2.0

    starts = {"right": (bx - 74, mid_y), "left": (bx + bw + 74, mid_y),
              "down": (mid_x, by - 30), "up": (mid_x, by + bh + 30)}
    ends = {"right": (bx + 30, mid_y), "left": (bx + bw - 30, mid_y),
            "down": (mid_x, by + 32), "up": (mid_x, by + bh - 32)}
    sx, sy = starts[motion]
    ex, ey = ends[motion]
    parts.append(_arrow(sx, sy, ex, ey, SW, 8.0))
    # the label sits above the arrow shaft, outside the box on a horizontal
    # entry and beside the shaft on a vertical one
    # a horizontal entry has no room beside the box for a name like "alpha
    # particle", so it goes above the box instead, aligned with the arrow tail
    if motion == "right":
        parts.append(_text(sx - 4, by - 12, particle, size=12, anchor="start", weight=700))
    elif motion == "left":
        parts.append(_text(sx + 4, by - 12, particle, size=12, anchor="end", weight=700))
    else:
        parts.append(_text(sx + 10, sy + 4, particle, size=12, anchor="start", weight=700))
    parts.append(_text(W / 2.0, by + bh + 30, region_label, size=11.5, weight=600))
    return svg(parts, W, H, label)


def curved_beam(into=True, curve="up", beam="beam of electrons",
                region_label="region of uniform magnetic field", label=""):
    """A beam entering a field region and following a curved path — the form
    that asks for the field direction rather than the force direction, so the
    box is deliberately left blank."""
    W, H = 340.0, 210.0
    bx, by, bw, bh = 70.0, 28.0, 236.0, 136.0
    parts = ['<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" '
             'stroke="%s" stroke-width="1.4" stroke-dasharray="5 4"/>'
             % (bx, by, bw, bh, INK)]
    y = by + bh * (0.72 if curve == "up" else 0.28)
    ctrl = by + bh * (0.12 if curve == "up" else 0.88)
    d = ("M %.1f %.1f Q %.1f %.1f %.1f %.1f"
         % (bx - 44, y, bx + bw * 0.55, ctrl, bx + bw + 26,
            by + bh * (0.16 if curve == "up" else 0.84)))
    parts.append('<path d="%s" fill="none" stroke="%s" stroke-width="%.1f"/>'
                 % (d, INK, SW))
    ang = -0.85 if curve == "up" else 0.85
    parts.append(_head(bx + bw + 26, by + bh * (0.16 if curve == "up" else 0.84),
                       ang, 7.5))
    parts.append(_text(bx - 46, by - 10, beam, size=12, anchor="start", weight=700))
    parts.append(_text(W / 2.0, by + bh + 30, region_label, size=11.5, weight=600))
    return svg(parts, W, H, label)


# ------------------------------------------------------------ accelerators

def linac(supply="alternating supply", tubes=4, r_label="R", s_label="S",
          pd_label="", beam="proton beam", label=""):
    """A linear accelerator: hollow drift tubes in a vacuum, each longer than
    the last, with the beam accelerated in the gaps between them.

    Alternate tubes are wired to opposite terminals of the alternating supply.
    The two bus bars sit at different heights and stop short of the supply,
    which hangs below both on its own leads — the earlier version ran a bus bar
    straight through the supply symbol. Where tube 2's drop crosses the upper
    bus there is deliberately **no junction dot**, which is the convention for
    wires that cross without connecting.
    """
    W, H = 400.0, 210.0
    y, th = 62.0, 40.0
    x = 34.0
    widths = [40 + i * 20 for i in range(tubes)]
    gap = 18.0
    boxes = []
    for tw in widths:
        boxes.append((x, x + tw))
        x += tw + gap
    parts = ['<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3" '
             'fill="none" stroke="%s" stroke-width="%.1f"/>'
             % (x0, y, x1 - x0, th, INK, SW) for x0, x1 in boxes]

    parts.append(_arrow(24, y + th / 2.0, boxes[-1][1] + 26, y + th / 2.0, 1.6, 7.0))
    parts.append(_text(24, y - 30, beam, size=12, anchor="start", weight=700))

    # the two accelerating gaps that the question refers to
    for lab, i in ((r_label, 0), (s_label, 1)):
        gx = (boxes[i][1] + boxes[i + 1][0]) / 2.0
        parts.append(_text(gx, y - 12, lab, size=14, weight=800))
        parts.append(_line(gx, y - 8, gx, y + 2, 1.2))

    centres = [(a + b) / 2.0 for a, b in boxes]
    y_a = y + th + 20            # bus for tubes 1 and 3
    y_b = y + th + 38            # bus for tubes 2 and 4
    y_s = y + th + 68            # the supply, below both

    even = centres[0::2]
    odd = centres[1::2]
    parts.append(_line(even[0], y_a, even[-1], y_a, 1.4))
    parts.append(_line(odd[0], y_b, odd[-1], y_b, 1.4))
    for c in even:
        parts.append(_line(c, y + th, c, y_a, 1.4))
    for c in odd:
        parts.append(_line(c, y + th, c, y_b, 1.4))

    sx = (even[0] + odd[-1]) / 2.0
    parts.append('<circle cx="%.1f" cy="%.1f" r="14" fill="var(--dia-page, #fff)" '
                 'stroke="%s" stroke-width="%.1f"/>' % (sx, y_s, INK, SW))
    parts.append('<path d="M %.1f %.1f q 3.5 -7 7 0 q 3.5 7 7 0" fill="none" '
                 'stroke="%s" stroke-width="1.8"/>' % (sx - 7, y_s, INK))
    # leads run out sideways to a column clear of the other bus, then up
    parts.append(_line(sx - 14, y_s, even[0], y_s, 1.4))
    parts.append(_line(even[0], y_s, even[0], y_a, 1.4))
    parts.append(_line(sx + 14, y_s, odd[-1], y_s, 1.4))
    parts.append(_line(odd[-1], y_s, odd[-1], y_b, 1.4))
    parts.append(_text(sx, y_s + 30, supply, size=11.5, weight=600))

    parts.append(_text(W - 8, y - 12, "metal tubes", size=11.5, anchor="end", weight=600))
    if pd_label:
        parts.append(_text(W - 8, y - 30, pd_label, size=13, anchor="end", weight=700))
    return svg(parts, W, H, label)


def cyclotron(supply="alternating supply", pd_label="", r_label="R", s_label="S",
              label=""):
    """Two hollow D-shaped electrodes seen from above, with the gap the
    particle is accelerated across."""
    W, H = 340.0, 224.0
    cx, cy, r = 170.0, 96.0, 76.0
    g = 7.0
    parts = []
    for side in (-1, 1):
        x0 = cx + side * g
        sweep = 1 if side > 0 else 0
        d = ("M %.1f %.1f A %.1f %.1f 0 0 %d %.1f %.1f Z"
             % (x0, cy - r, r, r, sweep, x0, cy + r))
        parts.append('<path d="%s" fill="none" stroke="%s" stroke-width="%.1f"/>'
                     % (d, INK, SW))
    parts.append(_text(cx - 44, cy + 5, "dee", size=13, weight=700))
    parts.append(_text(cx + 44, cy + 5, "dee", size=13, weight=700))
    # the beam: released at R, crossing the gap to S
    parts.append(_arrow(cx - 34, cy - 26, cx + 30, cy - 26, 1.8, 7.0))
    parts.append(_text(cx - 40, cy - 22, r_label, size=14, anchor="end", weight=800))
    parts.append(_text(cx + 36, cy - 22, s_label, size=14, anchor="start", weight=800))
    # above the whole circle: inside the dees it would cross their flat edges
    parts.append(_text(cx, cy - r - 8, "proton beam", size=11.5, weight=600))
    sy = cy + r + 44
    parts.append('<circle cx="%.1f" cy="%.1f" r="14" fill="none" stroke="%s" '
                 'stroke-width="%.1f"/>' % (cx, sy, INK, SW))
    parts.append('<path d="M %.1f %.1f q 3.5 -7 7 0 q 3.5 7 7 0" fill="none" '
                 'stroke="%s" stroke-width="1.8"/>' % (cx - 7, sy, INK))
    parts.append(_line(cx - 14, sy, cx - 62, sy, 1.4))
    parts.append(_line(cx - 62, sy, cx - 62, cy + 40, 1.4))
    parts.append(_line(cx - 62, cy + 40, cx - g - 24, cy + 40, 1.4))
    parts.append(_line(cx + 14, sy, cx + 62, sy, 1.4))
    parts.append(_line(cx + 62, sy, cx + 62, cy + 40, 1.4))
    parts.append(_line(cx + 62, cy + 40, cx + g + 24, cy + 40, 1.4))
    parts.append(_text(cx, sy + 30, supply, size=11.5, weight=600))
    if pd_label:
        parts.append(_text(cx, sy - 26, pd_label, size=13, weight=700))
    return svg(parts, W, H, label)


# -------------------------------------------------------- gravitational fields
# Built for Advanced Higher Gravitation (2020 Q4(a)(ii) asks for exactly this
# sketch). Always attractive, so there is no sign and no positive/negative
# convention to get backwards — the one rule that matters here is that lines
# never cross and a two-body pattern's neutral point has to land in the right
# place, so the lines are traced through the real inverse-square field
# (`_g_line`), the same technique the deck's own PNG version
# (`advanced-higher-physics/.../_build/art.py`) uses, not drawn by eye.

MASS_R = 15.0


def _mass(cx, cy, r=MASS_R, label=None, size=13):
    """A mass: a filled circle, so it reads as mass rather than as a charge
    or an orbit. No +/- symbol — gravity has no sign to get wrong."""
    out = ['<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/>' % (cx, cy, r, INK)]
    if label:
        out.append(_text(cx, cy + r + 16, label, size=size, weight=800))
    return "".join(out)


def _g_field(p, masses):
    """Field direction at `p` from `masses` = [(x, y, m)] — attractive, so
    each term pulls towards that mass. Returns a unit vector, or None at a
    neutral point (both pulls cancel)."""
    gx = gy = 0.0
    for mx, my, m in masses:
        dx, dy = mx - p[0], my - p[1]
        d2 = dx * dx + dy * dy
        if d2 < 1.0:
            return None
        d = math.sqrt(d2)
        gx += m * dx / (d2 * d)
        gy += m * dy / (d2 * d)
    n = math.hypot(gx, gy)
    return None if n < 1e-9 else (gx / n, gy / n)


def _g_line(start, masses, radii, bounds, step=5.0, limit=400):
    """Trace one field line inward from `start`, stopping at a mass or the
    edge of the box. Returns the polyline as a list of (x, y) points."""
    pts, p = [start], start
    for _ in range(limit):
        d = _g_field(p, masses)
        if d is None:
            break
        p = (p[0] + d[0] * step, p[1] + d[1] * step)
        if not (bounds[0] < p[0] < bounds[2] and bounds[1] < p[1] < bounds[3]):
            break
        pts.append(p)
        if any(math.hypot(p[0] - mx, p[1] - my) <= r
               for (mx, my, _), r in zip(masses, radii)):
            break
    return pts


def _polyline(pts, w=FIELD_SW):
    if len(pts) < 2:
        return ""
    d = "M " + " L ".join("%.1f %.1f" % p for p in pts)
    return ('<path d="%s" fill="none" stroke="%s" stroke-width="%.1f" '
            'stroke-linejoin="round"/>' % (d, INK, w))


def one_mass(label="", mass_label="M", w=220.0, h=190.0, n=10):
    """The radial field around a single mass — every line points inward."""
    cx, cy = w / 2.0, h / 2.0
    reach = min(w, h) / 2.0 - 10.0
    masses = [(cx, cy, 1.0)]
    parts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        start = (cx + reach * math.cos(a), cy + reach * math.sin(a))
        pts = _g_line(start, masses, [MASS_R], (0, 0, w, h))
        parts.append(_polyline(pts))
        if len(pts) >= 4:
            parts.append(_mid_head(pts[-2][0], pts[-2][1], pts[-1][0],
                                   pts[-1][1], 0.7))
    parts.append(_mass(cx, cy, label=mass_label))
    return svg(parts, w, h, label)


def two_masses(label="", m1_label="M", m2_label="m", w=320.0, h=190.0, n=22):
    """
    Two masses' combined field, including the neutral point between them —
    the AH exam idiom (2020 Q4(a)(ii)): lines from further out curve in and
    terminate on whichever mass dominates; near the midpoint the two pulls
    cancel and the neutral point is marked as an open ring, so it reads as
    'nothing here', not as a third body.
    """
    cy = h / 2.0
    sep = min(w * 0.20, 62.0)
    x1, x2 = w / 2.0 - sep, w / 2.0 + sep
    masses = [(x1, cy, 1.0), (x2, cy, 1.0)]
    radii = [MASS_R, MASS_R]
    cx = (x1 + x2) / 2.0
    parts = []
    for i in range(n):
        a = 2 * math.pi * i / n + 0.11
        start = (cx + (w * 0.46) * math.cos(a), cy + (h * 0.46) * math.sin(a))
        pts = _g_line(start, masses, radii, (0, 0, w, h))
        parts.append(_polyline(pts))
        if len(pts) >= 4:
            parts.append(_mid_head(pts[-2][0], pts[-2][1], pts[-1][0], pts[-1][1],
                                   0.65))
    parts.append(_mass(x1, cy, label=m1_label))
    parts.append(_mass(x2, cy, label=m2_label))
    # the neutral point: an open ring, not a filled mark, so it reads as zero
    parts.append('<circle cx="%.1f" cy="%.1f" r="7" fill="none" stroke="%s" '
                 'stroke-width="%.1f"/>' % (cx, cy, INK, SW))
    return svg(parts, w, h, label)
