"""Oscilloscope screens, straight-line data graphs and energy-band diagrams —
the Higher Electricity vocabulary (17 Sep 2026).

A trace is a sine curve, so it is plotted with matplotlib through `graphs.py`
(global rule §7: plotted, never hand-drawn). The screen is the SQA drawing:
a 10 × 8 division graticule, no numbers on it, and the Y-gain and timebase
given in the question text rather than printed on the screen.

Band diagrams are plain rectangles, so they are SVG, following the E5 deck's
own convention: shaded = occupied by electrons, white = empty.
"""
import math

import graphs as G
from graphs import PLOT_INK, _fig, _out

INK = "var(--dia-ink, currentColor)"
FONT = '"Trebuchet MS","Segoe UI",system-ui,-apple-system,sans-serif'


def scope_trace(period_div, peak_div, label, cols=10, rows=8, start_div=0.0):
    """A sine trace on a blank graticule. `period_div` and `peak_div` are in
    divisions; the trace is centred vertically, as a zeroed Y-offset puts it."""
    import numpy as np
    fig, ax = _fig(4.2, 4.2 * rows / cols)
    for side in ("top", "right", "left", "bottom"):
        ax.spines[side].set_visible(True)
        ax.spines[side].set_color(PLOT_INK)
        ax.spines[side].set_linewidth(1.6)
    ax.set_xlim(0, cols)
    ax.set_ylim(-rows / 2.0, rows / 2.0)
    ax.set_xticks(range(cols + 1))
    ax.set_yticks([y - rows / 2.0 for y in range(rows + 1)])
    ax.set_xticklabels([])
    ax.set_yticklabels([])
    ax.tick_params(length=0)
    ax.grid(True, color=PLOT_INK, alpha=0.28, linewidth=0.8)
    # the two centre lines carry the small sub-division ticks a real graticule has
    for k in range(cols * 5 + 1):
        x = k / 5.0
        ax.plot([x, x], [-0.08, 0.08], color=PLOT_INK, linewidth=0.7, alpha=0.55)
    for k in range(rows * 5 + 1):
        y = k / 5.0 - rows / 2.0
        ax.plot([cols / 2.0 - 0.08, cols / 2.0 + 0.08], [y, y], color=PLOT_INK,
                linewidth=0.7, alpha=0.55)
    xs = np.linspace(0, cols, 800)
    ys = peak_div * np.sin(2 * math.pi * (xs - start_div) / period_div)
    ax.plot(xs, ys, color=PLOT_INK, linewidth=2.2)
    ax.set_aspect("equal")
    return _out(fig, label)


def straight_line(x_pts, m, c, xlabel, ylabel, xlim, ylim, xticks, yticks, label,
                  x_from=0.0):
    """A plotted straight line with its data points, for reading a gradient and
    an intercept. The line is drawn from `x_from` so an intercept can be read
    straight off the axis, as the SQA graphs are."""
    fig, ax = _fig(4.6, 3.4)
    xe = [x_from, xlim[1] * 0.97]
    ax.plot(xe, [m * x + c for x in xe], color=PLOT_INK, linewidth=1.8, zorder=2)
    ax.plot(x_pts, [m * x + c for x in x_pts], "x", color=PLOT_INK, markersize=7,
            markeredgewidth=1.6, zorder=3)
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    # the axis stays at the foot of the plot, so tick labels never sit on the
    # line; R = 0 is drawn as its own heavier grid line
    ax.axhline(0, color=PLOT_INK, linewidth=1.2, zorder=1)
    ax.set_xticks(xticks)
    ax.set_yticks(yticks)
    ax.set_xticklabels(["0" if t == 0 else G._dot("%g" % t) for t in xticks])
    ax.set_yticklabels(["0" if t == 0 else G._dot("%g" % t).replace("-", "−")
                        for t in yticks])
    ax.grid(True, color=PLOT_INK, alpha=0.16, linewidth=0.7)
    ax.set_xlabel(xlabel, fontsize=10, color=PLOT_INK, fontweight="bold")
    ax.set_ylabel(ylabel, fontsize=10, color=PLOT_INK, fontweight="bold")
    return _out(fig, label)


def _t(x, y, s, size=13, anchor="middle", weight=700):
    return ('<text x="%.1f" y="%.1f" fill="%s" font-family=\'%s\' font-size="%d" '
            'font-weight="%d" text-anchor="%s">%s</text>'
            % (x, y, INK, FONT, size, weight, anchor, s))


def _band(x, y, w, h, fill):
    shade = ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s" '
             'fill-opacity="0.38"/>' % (x, y + h * (1 - fill), w, h * fill, INK)
             if fill > 0 else "")
    return (shade + '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" '
            'stroke="%s" stroke-width="2"/>' % (x, y, w, h, INK))


def band_materials(materials, label):
    """Side-by-side band diagrams. Each material is (name, gap, valence_fill,
    conduction_fill) with `gap` in px. The energy axis runs up the left-hand
    edge, clear of every band."""
    col, bw, bh = 150, 112, 46
    left, top, height = 44, 30, 250
    parts = []
    for i, (name, gap, vfill, cfill) in enumerate(materials):
        x = left + i * col + (col - bw) / 2.0
        vy = height - 40 - bh
        cy = vy - gap - bh
        parts.append(_band(x, cy, bw, bh, cfill))
        parts.append(_band(x, vy, bw, bh, vfill))
        parts.append(_t(x + bw / 2.0, cy - 7, "conduction band", 11, weight=800))
        parts.append(_t(x + bw / 2.0, vy + bh / 2.0 + 5, "valence band", 11, weight=800))
        parts.append(_t(x + bw / 2.0, height - 10, name, 14, weight=900))
    ax = 18
    parts.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.6"/>'
                 % (ax, height - 40, ax, top, INK))
    parts.append('<path d="M %d %d l -5 10 l 10 0 z" fill="%s"/>' % (ax, top - 6, INK))
    parts.append('<text transform="translate(%d,%d) rotate(-90)" fill="%s" '
                 'font-family=\'%s\' font-size="11" font-weight="700" '
                 'text-anchor="middle">energy of electrons</text>'
                 % (ax + 14, (height - 40 + top) / 2.0, INK, FONT))
    w = left + col * len(materials) + 4
    return ('<svg class="ckt" style="width:min(100%%, 480px)" viewBox="0 0 %d %d" '
            'width="100%%" preserveAspectRatio="xMidYMid meet" '
            'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s">%s</svg>'
            % (w, height, label.replace('"', "&quot;"), "".join(parts)))
