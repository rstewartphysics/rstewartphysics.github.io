"""The Hertzsprung-Russell diagram as inline SVG — matplotlib, themed like
`graphs.py`'s other figures (same `_fig`/`_out` pipeline), not hand-coded
paths, because log scales and a reversed axis are what matplotlib is for.

Built for Advanced Higher Stellar Physics (every diet's question, 2016-2025,
reads or plots one). AH prints a full stop, never the middle dot
(DECK-RULES rule 28) — unlike `graphs.py`'s N5/Higher figures, tick labels
here are never passed through `_dot()`.

The axes copy the SQA figures (2017 Q6, 2023 Q6): temperature ticks at
40 000, 20 000, 10 000, 5000 and 2500 K, luminosity in solar units from
10⁻⁴ to 10⁶, and dashed lines of constant radius from 10⁻³ to 10³ solar
radii — so a pupil meets the same grid here as on the exam page.

    from hr_diagram import hr_diagram
    hr_diagram(points=[(9602, 1.0, "Vega")], mark=(9000, 100),
               label="H-R diagram with Vega plotted and a star to place")
"""
import math

from matplotlib.ticker import FixedLocator, FixedFormatter, NullLocator

from graphs import _fig, _out, PLOT_INK

TMIN, TMAX = 2500.0, 40000.0
LMIN, LMAX = 1e-4, 1e6
T_SUN = 5800.0

# The main sequence's real T-L anchors (O to M), the same run the deck's own
# `art.render_hr_diagram` uses — one source for the slope, so a pupil never
# meets two different-looking main sequences between the deck and the test.
_MS_ANCHORS = [(32000, 4e4), (18000, 2e3), (10000, 55), (7200, 5.0),
              (5800, 1.0), (4700, 0.32), (3800, 0.055), (3000, 0.006)]

# (tlo, thi, llo, lhi) — the shaded boxes, and where each name sits
_REGIONS = {
    "supergiants": ((3000, 20000, 3e4, 1e6), (8000, 2.5e5)),
    "giants": ((3000, 6000, 10, 1e3), (4300, 1e2)),
    "white dwarfs": ((8000, 40000, 1e-4, 1e-2), (16000, 1e-3)),
}

_T_TICKS = [40000, 20000, 10000, 5000, 2500]
# a stand-in fill swapped for the page colour after export, so a label box
# is paper-coloured in both themes rather than white on a dark page
_PAGE = "#fefefe"
_SUP = str.maketrans("-0123456789", "⁻⁰¹²³⁴⁵⁶⁷⁸⁹")


def luminosity(T, R):
    """Solar-unit luminosity of a star of radius R solar radii at T kelvin:
    L = 4πr²σT⁴ divided through by the Sun's own."""
    return R * R * (T / T_SUN) ** 4


def _radius_labels(ax):
    """Each constant-radius line named along its own length, near its cool
    end, turned to its slope — the SQA figures' own placement, and the only
    one that reaches the 10⁻² and 10⁻³ lines, which leave through the bottom
    axis."""
    for e in range(-3, 4):
        R = 10.0 ** e
        T = TMIN * 1.12
        while luminosity(T, R) < LMIN * 6 and T < TMAX:
            T *= 1.05
        while luminosity(T, R) > LMAX / 4 and T < TMAX:
            T *= 1.05
        L = luminosity(T, R)
        (x1, y1), (x2, y2) = ax.transData.transform([(T, L), (T * 1.2, luminosity(T * 1.2, R))])
        ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
        if ang > 90:
            ang -= 180
        elif ang < -90:
            ang += 180
        txt = "1 solar radius" if e == 0 else "10%s solar radii" % (
            "" if e == 1 else str(e).translate(_SUP))
        ax.text(T, L, txt, fontsize=8, color=PLOT_INK, rotation=ang,
                rotation_mode="anchor", ha="left", va="center", zorder=2,
                bbox=dict(boxstyle="square,pad=0.1", facecolor=_PAGE,
                          edgecolor="none"))


def hr_diagram(points=None, mark=None, show_regions=True, show_main_sequence=True,
              radius_lines=True, region_labels=None,
              label="H-R diagram: luminosity against surface temperature"):
    """
    `points`: [(T, L, name), ...] plotted and labelled — real stars given in
    the question, or letters A-D for a pick-the-point question.
    `mark`: (T, L) — a single unlabelled circled point, for a marking-
    instruction or model-answer version of the same figure.
    `radius_lines`: the dashed constant-radius diagonals the SQA figures carry.
    `region_labels`: {"giants": "Q", ...} — writes that text in the region
    (a letter for "which region" questions, or the name itself). Only the
    regions named are labelled; "main sequence" is placed beside the line.
    """
    # drawn small so its text stays legible when a phone scales it to ~330 px
    fig, ax = _fig(4.3, 3.8)
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlim(TMAX, TMIN)          # reversed: hot on the left
    ax.set_ylim(LMIN, LMAX)

    if radius_lines:
        ts = [TMAX * (TMIN / TMAX) ** (i / 60.0) for i in range(61)]
        for e in range(-3, 4):
            R = 10.0 ** e
            ax.plot(ts, [luminosity(t, R) for t in ts], "--", color=PLOT_INK,
                    linewidth=0.8, alpha=0.45, zorder=0.5)
    if show_regions:
        import matplotlib.patches as mpatches
        for name, ((tlo, thi, llo, lhi), _) in _REGIONS.items():
            ax.add_patch(mpatches.Rectangle((tlo, llo), thi - tlo, lhi - llo,
                                            facecolor=PLOT_INK, alpha=0.07,
                                            edgecolor="none", zorder=0))
    for name, text in (region_labels or {}).items():
        if name == "main sequence":
            xy = (13000, 3)
        else:
            xy = _REGIONS[name][1]
        ax.text(xy[0], xy[1], text, fontsize=10, color=PLOT_INK,
                fontweight="bold", ha="center", va="center", zorder=5,
                bbox=dict(boxstyle="round,pad=0.25", facecolor=_PAGE,
                          edgecolor=PLOT_INK, linewidth=0.8))

    if show_main_sequence:
        xs = [t for t, _ in _MS_ANCHORS]
        ys = [l for _, l in _MS_ANCHORS]
        ax.plot(xs, ys, "-", color=PLOT_INK, linewidth=2.6, zorder=1,
                solid_capstyle="round")

    for T, L, name in (points or []):
        ax.plot([T], [L], "o", color=PLOT_INK, markersize=7, zorder=3)
        ax.annotate(name, (T, L), textcoords="offset points", xytext=(6, 6),
                    fontsize=10, color=PLOT_INK, fontweight="bold")

    if mark:
        T, L = mark
        ax.plot([T], [L], "o", markerfacecolor="none", markeredgecolor=PLOT_INK,
                markersize=16, markeredgewidth=2.2, zorder=4)

    ax.xaxis.set_major_locator(FixedLocator(_T_TICKS))
    ax.xaxis.set_major_formatter(FixedFormatter(
        ["40 000", "20 000", "10 000", "5000", "2500"]))
    ax.xaxis.set_minor_locator(NullLocator())
    ys = [10.0 ** e for e in range(-4, 7)]
    ax.yaxis.set_major_locator(FixedLocator(ys))
    ax.yaxis.set_major_formatter(FixedFormatter(
        ["1" if e == 0 else "10" if e == 1 else "10" + str(e).translate(_SUP)
         for e in range(-4, 7)]))
    ax.yaxis.set_minor_locator(NullLocator())

    if radius_lines:
        _radius_labels(ax)

    ax.set_xlabel("surface temperature (K)", fontsize=10, color=PLOT_INK,
                  fontweight="bold")
    ax.set_ylabel("luminosity (solar units)", fontsize=10, color=PLOT_INK,
                  fontweight="bold")
    return _out(fig, label).replace(_PAGE, "var(--dia-page, #fff)")


def spectra(temps, label="Four black-body spectra, intensity against wavelength"):
    """Black-body spectra in labelled panels, 0-1200 nm, each scaled to its own
    peak as the 2025 Q5(c) figure is — so only the PEAK POSITION tells the
    stars apart, which is the physics the question tests.
    `temps`: [("spectrum A", T), ...] in panel order."""
    import numpy as np
    h, c, k = 6.63e-34, 3.00e8, 1.38e-23
    n = len(temps)
    fig, axes = _fig(5.6, 1.55 * ((n + 1) // 2) + 0.4)
    fig.clf()
    lam = np.linspace(40, 1200, 400) * 1e-9
    for i, (name, T) in enumerate(temps):
        ax = fig.add_subplot((n + 1) // 2, 2, i + 1)
        ax.patch.set_alpha(0)
        for side in ("top", "right"):
            ax.spines[side].set_visible(False)
        for side in ("left", "bottom"):
            ax.spines[side].set_color(PLOT_INK)
            ax.spines[side].set_linewidth(1.2)
        y = 1.0 / (lam ** 5 * (np.exp(h * c / (lam * k * T)) - 1))
        ax.plot(lam * 1e9, y / y.max(), color=PLOT_INK, linewidth=2)
        ax.set_xlim(0, 1200)
        ax.set_ylim(0, 1.08)
        ax.set_xticks([0, 400, 800, 1200])
        ax.set_yticks([])
        ax.tick_params(colors=PLOT_INK, labelsize=8, width=1)
        ax.set_title(name, fontsize=9, color=PLOT_INK, fontweight="bold", loc="left")
        ax.set_xlabel("λ (nm)", fontsize=8, color=PLOT_INK)
        ax.set_ylabel("intensity", fontsize=8, color=PLOT_INK)
    fig.tight_layout(h_pad=1.0, w_pad=1.6)
    return _out(fig, label)


if __name__ == "__main__":
    print(hr_diagram(points=[(9602, 1.0, "Vega")], mark=(4300, 0.02))[:200])
