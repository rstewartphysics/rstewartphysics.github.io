"""Graphs for practice tests — matplotlib to inline SVG, themed like the
schematics so both invert correctly in dark mode.

Global rule §7: axes carry `quantity (unit)`, the origin is marked 0, and
plotted curves are separated with a legend rather than labels on the lines.
"""
import io
import re

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

INK = "var(--dia-ink, currentColor)"
FONT = ["Trebuchet MS", "DejaVu Sans", "sans-serif"]
PLOT_INK = "#111111"


def _dot(v):
    """SQA decimal separator — a middle dot, never a full stop."""
    t = v if isinstance(v, str) else ("%g" % v)
    return t.replace(".", "\u00b7") if t != "0" else "0"


def label_slug(label):
    """A prefix for this figure's element ids, unique to the figure.

    matplotlib stamps random ids on its clip paths, and `_out` renames them so
    a rebuild is not a spurious diff. Two figures whose labels begin with the
    same ten characters used to get the SAME prefix — and two SVGs sharing an
    id in one document means the second one's curves are clipped away by the
    first one's clip path, which is how the four acceleration graphs came out
    as flat lines (5 Sep 2026). The hash of the whole label keeps the prefix
    stable across rebuilds and distinct between figures.
    """
    import hashlib
    base = re.sub(r"[^a-z0-9]+", "", label.lower())[:10] or "g"
    return base + hashlib.md5(label.encode("utf-8")).hexdigest()[:6]


def _fig(w=4.6, h=3.2):
    matplotlib.rcParams["svg.fonttype"] = "none"
    matplotlib.rcParams["font.family"] = FONT
    fig, ax = plt.subplots(figsize=(w, h))
    fig.patch.set_alpha(0)
    ax.patch.set_alpha(0)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(PLOT_INK)
        ax.spines[side].set_linewidth(1.4)
    ax.tick_params(colors=PLOT_INK, labelsize=9, width=1.2)
    return fig, ax


def _out(fig, label):
    buf = io.StringIO()
    fig.savefig(buf, format="svg", bbox_inches="tight", transparent=True)
    plt.close(fig)
    s = buf.getvalue()
    s = s[s.index("<svg"):]
    s = re.sub(r'<\?xml[^>]*\?>', '', s)
    # one ink colour in, one CSS variable out
    s = s.replace(PLOT_INK, INK).replace(PLOT_INK.upper(), INK)
    s = re.sub(r'(width|height)="[\d.]+pt"', '', s, count=2)
    # matplotlib stamps a date and random element ids, which would make every
    # rebuild a spurious diff on a generated, version-controlled page
    s = re.sub(r"<metadata>.*?</metadata>", "", s, flags=re.S)
    ids = []
    for m in re.finditer(r'id="([a-z][0-9a-f]{8,})"', s):
        if m.group(1) not in ids:
            ids.append(m.group(1))
    for i, old in enumerate(ids):
        s = s.replace(old, "%s-%02d" % (label_slug(label), i))
    # a graph is an image with meaning, so it carries its description; this
    # line sat after the return until 5 Sep 2026 and never ran
    return s.replace('<svg ', '<svg class="ckt" role="img" aria-label="%s" '
                     'width="100%%" preserveAspectRatio="xMidYMid meet" '
                     % label.replace('"', "&quot;"), 1)


def vi_line(gradient, i_max, label, step=0.02):
    """Straight-line V-I graph through the origin for an ohmic resistor."""
    fig, ax = _fig()
    xs = [round(step * n, 4) for n in range(int(round(i_max / step)) + 1)]
    ys = [round(x * gradient, 4) for x in xs]
    ax.plot(xs, ys, color=PLOT_INK, linewidth=1.8, zorder=2)
    ax.plot(xs, ys, "o", color=PLOT_INK, markersize=4, zorder=3)
    ax.set_xlabel("current in R (A)", fontsize=10, color=PLOT_INK, fontweight="bold")
    ax.set_ylabel("voltage across R (V)", fontsize=10, color=PLOT_INK, fontweight="bold")
    ax.set_xlim(0, i_max * 1.08)
    ax.set_ylim(0, i_max * gradient * 1.08)
    ax.grid(True, color=PLOT_INK, alpha=0.18, linewidth=0.7)
    ax.set_xticks(xs)
    ax.set_xticklabels(["0" if x == 0 else _dot("%.2f" % x) for x in xs])
    yt = [t for t in ax.get_yticks() if 0 <= t <= i_max * gradient * 1.08]
    ax.set_yticks(yt)
    ax.set_yticklabels([_dot("%g" % t) for t in yt])
    return _out(fig, label)


def vi_lamp(label):
    """Sketch of a filament lamp's V-I characteristic — shape only, no values."""
    fig, ax = _fig(4.0, 2.8)
    xs = [n / 200.0 for n in range(201)]
    ys = [x ** 1.85 for x in xs]
    ax.plot(xs, ys, color=PLOT_INK, linewidth=2.0)
    ax.set_xlabel("current in lamp (A)", fontsize=10, color=PLOT_INK, fontweight="bold")
    ax.set_ylabel("voltage across\nlamp (V)", fontsize=10, color=PLOT_INK, fontweight="bold")
    ax.set_xlim(0, 1.06)
    ax.set_ylim(0, 1.12)
    ax.set_xticks([0]); ax.set_xticklabels(["0"])
    ax.set_yticks([]);
    return _out(fig, label)


def plotted(pairs, grad=None, quantity="R", curve=False, label="", mark=None):
    """A worked version of a pupil's graph: their points, plus the best-fit line
    (or smooth curve) and, for a straight line, the gradient triangle."""
    fig, ax = _fig(4.4, 3.2)
    xs = [p[0] for p in pairs]
    ys = [p[1] for p in pairs]
    ax.plot(xs, ys, "x", color=PLOT_INK, markersize=7, markeredgewidth=1.6,
            zorder=3, label="measured points")
    xmax = max(xs) * 1.1
    if curve:
        import numpy as np
        c = np.polyfit(xs, ys, 2)
        fx = [xmax * n / 60.0 for n in range(61)]
        fy = [c[0] * x * x + c[1] * x + c[2] for x in fx]
        ax.plot(fx, fy, "-", color=PLOT_INK, linewidth=1.6, zorder=2,
                label="best-fit curve")
    else:
        ax.plot([0, xmax], [0, grad * xmax], "-", color=PLOT_INK, linewidth=1.6,
                zorder=2, label="best-fit line")
        if mark:
            mx, my = mark
            # dotted leaders to the axes: read the point, do not measure a gradient
            ax.plot([mx, mx, 0], [0, my, my], ":", color=PLOT_INK, linewidth=1.2,
                    alpha=0.8, zorder=1)
            ax.plot([mx], [my], "o", markerfacecolor="none", markeredgecolor=PLOT_INK,
                    markersize=10, markeredgewidth=1.8, zorder=4,
                    label="point read off the line")
    ax.set_xlabel("current in %s (A)" % quantity, fontsize=10, color=PLOT_INK,
                  fontweight="bold")
    ax.set_ylabel("voltage across %s (V)" % quantity, fontsize=10, color=PLOT_INK,
                  fontweight="bold")
    ax.set_xlim(0, xmax)
    ax.set_ylim(0, max(ys) * 1.15)
    ax.grid(True, color=PLOT_INK, alpha=0.16, linewidth=0.7)
    ax.set_xticklabels([_dot("%g" % t) for t in ax.get_xticks()])
    ax.set_yticklabels([_dot("%g" % t) for t in ax.get_yticks()])
    leg = ax.legend(fontsize=8, frameon=False, loc="upper left")
    for t in leg.get_texts():
        t.set_color(PLOT_INK)
    return _out(fig, label)
