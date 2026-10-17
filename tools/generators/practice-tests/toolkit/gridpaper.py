"""Printable graph paper — 1 mm minor, 5 mm medium, 10 mm major.

Sized in millimetres so a browser prints it at true scale: a pupil measuring a
gradient off this sheet gets the same numbers as off a shop-bought pad.
"""

INK = "var(--dia-ink, #1b3a34)"


def grid(w_mm=180, h_mm=240, label=""):
    lines = []
    for step, width, alpha in ((1, 0.13, 0.45), (5, 0.26, 0.7), (10, 0.5, 1.0)):
        x = 0
        while x <= w_mm:
            if step == 1 and x % 5 == 0:
                x += step
                continue
            if step == 5 and x % 10 == 0:
                x += step
                continue
            lines.append('<line x1="%g" y1="0" x2="%g" y2="%g" stroke="%s" '
                         'stroke-width="%g" stroke-opacity="%g"/>'
                         % (x, x, h_mm, INK, width, alpha))
            x += step
        y = 0
        while y <= h_mm:
            if step == 1 and y % 5 == 0:
                y += step
                continue
            if step == 5 and y % 10 == 0:
                y += step
                continue
            lines.append('<line x1="0" y1="%g" x2="%g" y2="%g" stroke="%s" '
                         'stroke-width="%g" stroke-opacity="%g"/>'
                         % (y, w_mm, y, INK, width, alpha))
            y += step
    cap = ('<text x="%g" y="-3" fill="%s" font-family="Trebuchet MS, sans-serif" '
           'font-size="4" font-weight="700">%s</text>' % (0, INK, label)) if label else ""
    return ('<svg class="gridpaper" width="%gmm" height="%gmm" viewBox="0 -6 %g %g" '
            'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">%s%s</svg>'
            % (w_mm, h_mm + 6, w_mm, h_mm + 6, cap, "".join(lines)))
