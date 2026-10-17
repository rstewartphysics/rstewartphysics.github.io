"""Simple harmonic motion diagrams — apparatus as inline SVG, traces plotted.

The Advanced Higher sibling of `circuit.py` (schematics) and `fields.py` (field
patterns). Two kinds of picture are needed for SHM and they are drawn two
different ways, for the same reason as everywhere else in the kit:

  * **apparatus** — a mass on a spring, a pendulum, a beam — is hand-drawn SVG
    here, themed with `var(--dia-ink)` so dark mode inverts it;
  * **traces** — displacement, velocity or energy against time or displacement —
    are plotted with matplotlib through `graphs.py`, because a hand-drawn
    sine curve is exactly the thing global rule §7 forbids.

Every oscillation diagram shows the motion with an arrow and marks the
equilibrium position, which is the convention the AH decks already follow.
"""
import math

import graphs as G
from graphs import PLOT_INK, _fig, _out

INK = "var(--dia-ink, currentColor)"
FONT = '"Trebuchet MS","Segoe UI",system-ui,-apple-system,sans-serif'
SW = 2.0


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
    back, wing = size * 1.7, size * 0.72
    pts = [(x, y)]
    for k in (1, -1):
        pts.append((x - back * math.cos(ang) + k * wing * math.sin(ang),
                    y - back * math.sin(ang) - k * wing * math.cos(ang)))
    return ('<polygon points="%s" fill="%s"/>'
            % (" ".join("%.1f,%.1f" % p for p in pts), INK))


def _arrow(x1, y1, x2, y2, w=SW, head=7.0):
    ang = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - head * 1.5 * math.cos(ang), y2 - head * 1.5 * math.sin(ang)
    return _line(x1, y1, bx, by, w) + _head(x2, y2, ang, head)


def svg(parts, w, h, label, cls="osc"):
    aria = ' role="img" aria-label="%s"' % esc(label) if label else ' aria-hidden="true"'
    return ('<svg class="%s" viewBox="0 0 %.0f %.0f" width="100%%" '
            'preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"%s>'
            '%s</svg>' % (cls, w, h, aria, "".join(parts)))


def _ceiling(x0, x1, y, n=9):
    """A fixed support: a solid rule with hatching beneath it."""
    out = [_line(x0, y, x1, y, 2.6)]
    step = (x1 - x0) / float(n)
    for i in range(n):
        x = x0 + step * (i + 0.5)
        out.append(_line(x, y, x - 7, y - 9, 1.5))
    return "".join(out)


def _coil(cx, y0, y1, turns=7, width=15.0):
    """A helical spring drawn as a zig-zag between two points on one vertical.

    A spring is not a circuit symbol, so the BS-IEC rectangle rule does not
    reach it — but it is centred on its own axis and meets the mass and the
    support squarely, which is the same discipline.
    """
    pts, span = [], (y1 - y0)
    lead = span * 0.12
    pts.append((cx, y0))
    pts.append((cx, y0 + lead))
    for i in range(turns * 2):
        side = 1 if i % 2 == 0 else -1
        y = y0 + lead + (span - 2 * lead) * (i + 0.5) / (turns * 2.0)
        pts.append((cx + side * width, y))
    pts.append((cx, y1 - lead))
    pts.append((cx, y1))
    return ('<polyline points="%s" fill="none" stroke="%s" stroke-width="%.1f" '
            'stroke-linejoin="round" stroke-linecap="round"/>'
            % (" ".join("%.1f,%.1f" % p for p in pts), INK, SW))


def mass_spring(mass_label="", spring_label="", displacement=None,
                equilibrium="equilibrium position", motion=True, label=""):
    """A mass hanging from a spring, displaced below its equilibrium position.

    `displacement` is the label on the downward displacement arrow (e.g.
    "0.045 m"); pass None for a system drawn at rest.
    """
    w, h = 360.0, 246.0
    cx = 150.0
    top, box_y, box_h, box_w = 26.0, 176.0, 46.0, 74.0
    eq_y = box_y - 34.0
    out = [_ceiling(cx - 62, cx + 62, top)]
    out.append(_coil(cx, top, box_y))
    out.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="5" '
               'fill="var(--dia-page, transparent)" stroke="%s" stroke-width="%.1f"/>'
               % (cx - box_w / 2, box_y, box_w, box_h, INK, SW))
    if mass_label:
        out.append(_text(cx, box_y + box_h / 2 + 5, mass_label, 14))
    if spring_label:
        out.append(_text(cx + 34, top + 62, spring_label, 13, anchor="start"))

    # The equilibrium position is dashed, and its label sits past the right-hand
    # end of the line, level with it: above the line it landed on the spring,
    # and further right it ran off the viewBox.
    out.append(_line(cx - 100, eq_y, cx + 80, eq_y, 1.5, dash="6 5"))
    out.append(_text(cx + 86, eq_y + 4, equilibrium, 11, anchor="start"))

    if displacement:
        x = cx - 70
        out.append(_arrow(x, eq_y, x, box_y + 4))
        out.append(_arrow(x, box_y + 4, x, eq_y))
        out.append(_text(x - 8, (eq_y + box_y) / 2 + 6, displacement, 13,
                         anchor="end"))
    if motion:
        mx = cx + box_w / 2 + 22
        out.append(_arrow(mx, box_y + box_h / 2 - 22, mx, box_y + box_h / 2 + 22))
        out.append(_arrow(mx, box_y + box_h / 2 + 22, mx, box_y + box_h / 2 - 22))
        out.append(_text(mx + 8, box_y + box_h / 2 + 5, "oscillates", 12,
                         anchor="start"))
    return svg(out, w, h, label)


def beam_on_supports(load_label="", span_label="", label=""):
    """A footbridge deck between two supports, sagging under a load, with the
    up-and-down arrow that says the deck oscillates."""
    w, h = 340.0, 190.0
    y = 92.0
    out = ['<path d="M40 %.1f Q170 %.1f 300 %.1f" fill="none" stroke="%s" '
           'stroke-width="3"/>' % (y, y + 26, y, INK)]
    for x in (40.0, 300.0):
        out.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" '
                   'stroke="%s" stroke-width="%.1f"/>'
                   % (x, y + 2, x - 15, y + 30, x + 15, y + 30, INK, SW))
        out.append(_line(x - 22, y + 30, x + 22, y + 30, 2.4))
        for k in range(4):
            bx = x - 18 + k * 12
            out.append(_line(bx, y + 30, bx - 7, y + 39, 1.4))
    out.append(_arrow(170, y + 4, 170, y - 34))
    out.append(_arrow(170, y - 34, 170, y + 4))
    out.append(_text(178, y - 16, "oscillates", 12, anchor="start"))
    if load_label:
        out.append(_text(170, 44, load_label, 13))
    if span_label:
        out.append(_line(40, y + 56, 300, y + 56, 1.4))
        out.append(_text(170, y + 74, span_label, 12))
    return svg(out, w, h, label)


# ------------------------------------------------------------------ traces

# The four harmonic traces are drawn over exactly one period, because that is
# what "sketch the first full oscillation" asks for; the damping traces need
# several, so the cycle count follows the kind.
HARMONIC = {"cos": 1, "negcos": 1, "sin": 1, "negsin": 1}


def _trace_xy(kind, cycles=None, n=400):
    """Displacement (or acceleration, or velocity) against time, as an SQA
    sketch: the damping kinds run for a few cycles, the plain harmonic ones for
    exactly one."""
    cycles = cycles or HARMONIC.get(kind, 2.6)
    xs = [cycles * i / float(n - 1) for i in range(n)]
    out = []
    for t in xs:
        w = 2.0 * math.pi * t
        if kind == "cos":
            out.append(math.cos(w))
        elif kind == "negcos":
            out.append(-math.cos(w))
        elif kind == "sin":
            out.append(math.sin(w))
        elif kind == "negsin":
            out.append(-math.sin(w))
        elif kind == "undamped":
            out.append(math.cos(w))
        elif kind == "under":
            out.append(math.cos(w) * math.exp(-0.55 * t))
        elif kind == "critical":
            # returns to zero without crossing it, and fastest of the three
            out.append((1.0 + 4.2 * t) * math.exp(-4.2 * t))
        elif kind == "over":
            out.append((1.0 + 1.15 * t) * math.exp(-1.15 * t))
        else:
            raise ValueError(kind)
    return xs, out


def _sketch_axes(ax, ylab="displacement (m)", xlab="time (s)", size=9):
    """SQA sketch axes: the time axis runs through the origin, because the
    displacement is negative for half of every cycle and a separate baseline
    along the bottom of the box would be a second, meaningless line."""
    ax.spines["bottom"].set_position("zero")
    ax.set_xticks([])
    ax.set_yticks([])
    ax.text(-0.012, 0, "0", transform=ax.get_yaxis_transform(), ha="right",
            va="center", fontsize=size - 1, color=PLOT_INK)
    # the time axis now runs through the middle of the box, so the axis label
    # has to be placed below the box by hand or it lands on the curve
    ax.text(0.5, -0.06, xlab, transform=ax.transAxes, ha="center", va="top",
            fontsize=size, color=PLOT_INK, fontweight="bold")
    # labelpad clears the "0" sitting at the origin — without it the zero
    # lands inside the word "displacement"
    ax.set_ylabel(ylab, fontsize=size, color=PLOT_INK, fontweight="bold",
                  labelpad=10)


def damping_trace(kind, label, ylab="displacement (m)"):
    """One displacement-time trace, for "state the type of damping shown"."""
    fig, ax = _fig(4.2, 2.6)
    xs, ys = _trace_xy(kind)
    ax.plot(xs, ys, color=PLOT_INK, linewidth=1.9, zorder=3)
    ax.set_xlim(0, max(xs))
    ax.set_ylim(-1.15, 1.2)
    _sketch_axes(ax, ylab, "time (s)", size=10)
    return _out(fig, label)


def graph_options(kinds, label, letters="ABCD", ylab="displacement (m)",
                  xlab="time (s)", curve=None):
    """Four labelled sketch graphs in one figure, for a "which graph" question.

    `kinds` are keys for `_trace_xy`, or, when `curve` is given, a callable of
    x returning y so the same panel can show energy against displacement.
    """
    import matplotlib.pyplot as plt
    import matplotlib
    matplotlib.rcParams["svg.fonttype"] = "none"
    matplotlib.rcParams["font.family"] = ["Trebuchet MS", "DejaVu Sans", "sans-serif"]
    fig, axes = plt.subplots(2, 2, figsize=(6.4, 4.4))
    fig.patch.set_alpha(0)
    for ax, kind, letter in zip(axes.ravel(), kinds, letters):
        ax.patch.set_alpha(0)
        for side in ("top", "right"):
            ax.spines[side].set_visible(False)
        for side in ("left", "bottom"):
            ax.spines[side].set_color(PLOT_INK)
            ax.spines[side].set_linewidth(1.3)
        ax.tick_params(colors=PLOT_INK, labelsize=8, width=1.1)
        if curve:
            xs = [-1.0 + 2.0 * i / 199.0 for i in range(200)]
            ys = [curve(kind, x) for x in xs]
            ax.set_xlim(-1.08, 1.08)
            ax.set_xticks([-1, 0, 1])
            ax.set_xticklabels(["−A", "0", "+A"], fontsize=8, color=PLOT_INK)
            ax.set_yticks([])
            ax.set_ylim(min(ys) - 0.12, max(ys) * 1.15 + 0.05)
        else:
            xs, ys = _trace_xy(kind)
            ax.set_xlim(0, max(xs))
            ax.set_ylim(-1.2, 1.25)
            ax.plot(xs, ys, color=PLOT_INK, linewidth=1.8, zorder=3)
            _sketch_axes(ax, ylab, xlab, size=9)
        if curve:
            ax.plot(xs, ys, color=PLOT_INK, linewidth=1.8, zorder=3)
            ax.set_xlabel(xlab, fontsize=9, color=PLOT_INK, fontweight="bold")
            ax.set_ylabel(ylab, fontsize=9, color=PLOT_INK, fontweight="bold")
        ax.set_title(letter, fontsize=12, color=PLOT_INK, fontweight="bold",
                     loc="left", pad=6)
    fig.subplots_adjust(hspace=0.62, wspace=0.34)
    return _out(fig, label)


def energy_curves(kind, x):
    """Energy against displacement: the two parabolas of the deck's slide 29."""
    if kind == "ek":                       # kinetic: maximum at y = 0
        return 1.0 - x * x
    if kind == "ep":                       # potential: zero at y = 0
        return x * x
    if kind == "flat":                     # the distractor: constant energy
        return 1.0 + 0.0 * x
    if kind == "linear":                   # the distractor: straight lines
        return abs(x)
    raise ValueError(kind)


def block_on_spring(mass_label="", spring_label="", equilibrium="equilibrium position",
                    label=""):
    """A block resting on top of a spring that stands on the ground.

    The compression case, drawn the other way up from `mass_spring`: the same
    coil, the same dashed equilibrium line, the same double-headed arrow saying
    the block oscillates vertically.
    """
    w, h = 420.0, 246.0
    cx = 150.0
    ground, box_h, box_w = 214.0, 46.0, 84.0
    box_y = 96.0
    eq_y = box_y + box_h / 2.0
    out = [_line(cx - 74, ground, cx + 74, ground, 2.6)]
    for i in range(8):
        x = cx - 66 + i * 19
        out.append(_line(x, ground, x - 7, ground + 9, 1.5))
    out.append(_coil(cx, box_y + box_h, ground, turns=5))
    out.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="5" '
               'fill="var(--dia-page, transparent)" stroke="%s" stroke-width="%.1f"/>'
               % (cx - box_w / 2, box_y, box_w, box_h, INK, SW))
    if mass_label:
        out.append(_text(cx, box_y + box_h / 2 + 5, mass_label, 14))
    if spring_label:
        out.append(_text(cx + 30, ground - 30, spring_label, 12, anchor="start"))
    # the dashed line starts clear of the block, or it runs through the block
    # and its mass label
    out.append(_line(cx + box_w / 2 + 8, eq_y, cx + 120, eq_y, 1.5, dash="6 5"))
    out.append(_text(cx + 126, eq_y + 4, equilibrium, 11, anchor="start"))
    mx = cx - box_w / 2 - 26
    out.append(_arrow(mx, eq_y - 24, mx, eq_y + 24))
    out.append(_arrow(mx, eq_y + 24, mx, eq_y - 24))
    out.append(_text(mx, eq_y + 44, "oscillates", 12))
    return svg(out, w, h, label)


def diving_board(board_label="", equilibrium="rest position", label=""):
    """A springboard clamped at one end, its free end oscillating."""
    w, h = 420.0, 180.0
    y = 86.0
    out = []
    # the clamped end: a solid block with hatching beneath it
    out.append('<rect x="26" y="%.1f" width="46" height="34" rx="3" fill="none" '
               'stroke="%s" stroke-width="%.1f"/>' % (y - 8, INK, SW))
    for i in range(5):
        out.append(_line(30 + i * 11, y + 26, 23 + i * 11, y + 35, 1.4))
    out.append(_line(26, y + 26, 72, y + 26, 2.4))
    # the board itself, and the rest position it swings about
    out.append(_line(66, y, 286, y, 3.0))
    out.append(_line(286, y, 330, y, 1.4, dash="6 5"))
    out.append(_text(336, y + 4, equilibrium, 11, anchor="start"))
    out.append(_arrow(250, y - 8, 250, y - 46))
    out.append(_arrow(250, y + 8, 250, y + 46))
    out.append(_text(242, y - 34, "oscillates", 12, anchor="end"))
    if board_label:
        out.append(_text(170, y - 16, board_label, 12))
    return svg(out, w, h, label)
