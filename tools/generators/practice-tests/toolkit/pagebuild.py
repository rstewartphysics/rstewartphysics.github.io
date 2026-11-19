#!/usr/bin/env python3
"""The shared practice-test page builder.

One template, one set of guardrails, one marking-instructions format for every
test in the programme. A test supplies only its source `.md`, its `compute()`
(the physics) and its `diagrams()`; everything below is common, so a layout bug
is fixed once and every test is rebuilt (plan §6, layer 1).
"""
import base64
import html as _html
import json
import os
import re

# The site repo this toolkit sits in; PT_REPO points the pages somewhere else.
REPO = os.environ.get("PT_REPO", os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..")))

# ------------------------------------------------------------------ profile
#
# Everything a course changes about the page — palette, banner, progress
# namespace, relationship sheet, units, credit line — lives here rather than in
# the template, so Higher and N5 share one builder and a layout fix reaches
# both (plan §6, layer 1).  `use()` is called by a test's build.py before
# `page()`; the defaults below are the N5/S3 Electricity profile the pilot was
# written against, so that build is unchanged by this.

def use(**kw):
    unknown = [k for k in kw if k not in PROFILE]
    if unknown:
        raise KeyError("unknown profile key(s): %r" % unknown)
    PROFILE.update(kw)


RELATIONSHIPS = ["Q = It", "V = IR", "R total = R₁ + R₂ + …",
                 "1 / R total = 1 / R₁ + 1 / R₂ + …", "P = IV", "P = I²R",
                 "P = V² / R", "E = QV", "V₁ / V₂ = R₁ / R₂"]

# the source names a relationship by key, so the displayed wording can change
# without touching test-a.md
REL_KEY = {"charge": 0, "ohm": 1, "series": 2, "parallel": 3, "power": 4,
           "power_ir": 5, "power_vr": 6, "energy": 7, "divider": 8}

# the same relationships in house style for the mark scheme, where markup is fine
RELATIONSHIPS_HTML = [
    "<var>Q</var> = <var>I</var><var>t</var>",
    "<var>V</var> = <var>I</var><var>R</var>",
    "<var>R</var><sub>T</sub> = <var>R</var><sub>1</sub> + <var>R</var><sub>2</sub> + …",
    "1 / <var>R</var><sub>T</sub> = 1 / <var>R</var><sub>1</sub> + 1 / <var>R</var><sub>2</sub> + …",
    "<var>P</var> = <var>I</var><var>V</var>",
    "<var>P</var> = <var>I</var><sup>2</sup><var>R</var>",
    "<var>P</var> = <var>V</var><sup>2</sup> / <var>R</var>",
    "<var>E</var> = <var>Q</var><var>V</var>",
    "<var>V</var><sub>1</sub> / <var>V</var><sub>2</sub> = <var>R</var><sub>1</sub> / <var>R</var><sub>2</sub>"]

SECTIONS = [("warmup", "Warm-up", "Everyone should aim for full marks here. One step, no rearranging."),
            ("core", "Core", "The demand of the real test — one rearrangement, one conversion or one intermediate step."),
            ("push", "Push", "Two or more steps, an unfamiliar context, and a judgement to justify.")]

BANDS = [(70, "A"), (60, "B"), (50, "C"), (40, "D")]


# ------------------------------------------------------------------ numbers

def sig_figs(text):
    """Significant figures the SQA way: a decimal point makes trailing zeros
    count, a bare integer's trailing zeros do not. 3·0 is 2; 30 is 1."""
    t = str(text).strip().replace("·", ".").replace("\u2212", "-").lstrip("+-")
    t = t.split("e")[0].split("\u00d7")[0].strip()
    if not t or not any(c.isdigit() for c in t):
        return None
    if "." in t:
        whole, frac = t.split(".", 1)
        digits = (whole + frac).lstrip("0")
        return len(digits) if digits else len(frac)
    return len(t.strip("0")) or 1


def round_sig(x, n):
    """Round half away from zero, as SQA does — Python's round() is half-to-even,
    which would turn 7·05 into 7·0 rather than 7·1."""
    if x == 0 or n is None or n < 1:
        return x
    import decimal, math
    places = -int(math.floor(math.log10(abs(x)))) + (n - 1)
    q = decimal.Decimal(1).scaleb(-places)
    return float(decimal.Decimal(repr(x)).quantize(q, rounding=decimal.ROUND_HALF_UP))


def fm_sf(x, n):
    """Format to exactly n significant figures, keeping the trailing zeros that
    make the figure count visible: 8·0, not 8; 0·020, not 0·02."""
    import math
    if x == 0:
        return "0"
    v = round_sig(x, n)
    dp = n - 1 - int(math.floor(math.log10(abs(v))))
    return dot(("%." + str(max(dp, 0)) + "f") % v)


SUP = {"-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵",
       "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"}


def sci(x, n):
    """`fm_sf` in scientific form once the plain decimal stops being readable —
    7·2 × 10⁻¹⁶, not 0·00000000000000072. Higher answers are almost all powers
    of ten; N5's never were, which is why this arrived with the Higher tests."""
    import math
    if x == 0:
        return "0"
    e = int(math.floor(math.log10(abs(round_sig(x, n)))))
    if -2 <= e <= 4 and sig_figs(fm_sf(x, n)) == n:
        return fm_sf(x, n)
    m = round_sig(x, n) / (10.0 ** e)
    mant = dot(("%." + str(max(n - 1, 0)) + "f") % m)
    return "%s × 10%s" % (mant, "".join(SUP[c] for c in str(e)))


def dot(s):
    """The decimal separator the course's own papers use. SQA still prints the
    middle dot at N5 and Higher; the Advanced Higher papers moved to a full
    stop in 2022, and the AH decks followed (DECK-RULES rule 28), so the
    profile carries it rather than the formatter assuming one."""
    return str(s).replace(".", PROFILE["decimal"])


def fm(x, sf=3, strip=True):
    """SQA number formatting — significant figures, middle-dot separator."""
    if x == 0:
        return "0"
    from decimal import Decimal
    q = float("%.*g" % (sf, x))
    s = ("%.10f" % q).rstrip("0").rstrip(".") if abs(q) >= 1e-4 else repr(q)
    if strip and s.endswith(".0"):
        s = s[:-2]
    return dot(s)


def fixed(x, dp):
    return dot("%.*f" % (dp, x))


# ------------------------------------------------- resistor colour code

COLOUR_DIGIT = {"black": 0, "brown": 1, "red": 2, "orange": 3, "yellow": 4,
                "green": 5, "blue": 6, "violet": 7, "grey": 8, "white": 9}
COLOUR_MULT = {"black": 1, "brown": 10, "red": 100, "orange": 1000,
               "yellow": 10000, "green": 100000, "blue": 1000000}
COLOUR_TOL = {"brown": 1, "red": 2, "gold": 5, "silver": 10}


# ------------------------------------------------------------------ parser

def parse(text):
    meta, values, questions = {}, {}, []
    lines = text.split("\n")
    i, mode, cur, part = 0, None, None, None
    while i < len(lines):
        ln = lines[i]
        s = ln.strip()
        if s == "@meta":
            mode = "meta"
        elif s == "@values":
            mode = "values"
        elif s.startswith("@q "):
            bits = [b.strip() for b in s[3:].split("|")]
            cur = {"id": bits[0], "section": bits[1], "type": bits[2],
                   "marks": int(bits[3]), "parts": [], "options": [], "auto": 0,
                   "self": 0}
            if len(bits) > 4:
                kind, n = bits[4].split()
                cur[kind] = int(n)
                if kind == "auto":
                    cur["self"] = cur["marks"] - int(n)
                else:
                    cur["auto"] = cur["marks"] - int(n)
            mode = "q"
            part = None
        elif s.startswith("@part "):
            bits = [b.strip() for b in s[6:].split("|")]
            part = {"id": bits[0], "marks": int(bits[1]), "type": bits[2],
                    "auto": 0, "self": 0}
            if len(bits) > 3:
                kind, n = bits[3].split()
                part[kind] = int(n)
                part["self" if kind == "auto" else "auto"] = part["marks"] - int(n)
            cur["parts"].append(part)
            mode = "part"
        elif s == "@end":
            if mode == "part":
                part = None
                mode = "q"
            elif mode == "q":
                questions.append(cur)
                cur = None
                mode = None
            else:
                mode = None
        elif mode in ("meta", "values") and ":" in s:
            k, v = s.split(":", 1)
            (meta if mode == "meta" else values)[k.strip()] = v.strip()
        elif mode in ("q", "part") and ":" in s and re.match(r"^[a-z_]+:", s):
            k, v = s.split(":", 1)
            k, v = k.strip(), v.strip()
            tgt = part if mode == "part" else cur
            if k == "option":
                cur["options"].append(v)
            else:
                tgt[k] = (tgt.get(k, "") + "<br>" + v) if k in tgt else v
        i += 1
    return meta, values, questions


# ------------------------------------------------------------------ render

def sub(text, d):
    """Substitute {key} placeholders with computed values; **bold** is the only
    Markdown the mark schemes use, so that is the only conversion done here."""
    def rep(m):
        k = m.group(1)
        if k not in d:
            raise KeyError("no computed value for {%s}" % k)
        return str(d[k])
    out = re.sub(r"\{([a-z0-9_]+)\}", rep, text or "")
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)


def rel_select(pid, correct):
    opts = ['<option value="">— choose a relationship —</option>']
    for i, r in enumerate(PROFILE["relationships"]):
        opts.append('<option value="%d">%s</option>' % (i, r))
    return ('<label class="ans-lab" for="%s-rel">Relationship</label>'
            '<select class="ans-rel" id="%s-rel" data-part="%s">%s</select>'
            % (pid, pid, pid, "".join(opts)))


UNITS = ["Ω", "kΩ", "A", "mA", "V", "C", "W"]

# name -> (multiple of the SI unit, the quantity it measures).  The dimension
# tag is what stops "3 A" earning a mark for a resistance.
UNIT_JS = {"Ω": [1, "R"], "kΩ": [1000, "R"], "A": [1, "I"], "mA": [0.001, "I"],
           "V": [1, "V"], "C": [1, "Q"], "W": [1, "P"]}


# The worked example appears in every answer box and on the cover, so it must
# not be an answer on this page: repeated beside each calculation, a careless
# example hands one of them over (teacher, 10 Sep 2026).
EXAMPLE_CANDIDATES = [("2.5", 4), ("6.1", -3), ("8.3", 7), ("4.7", -8),
                      ("1.6", 5), ("9.2", -6), ("3.8", 2), ("7.4", -11)]


def example_number(d):
    """(plain, scientific, mantissa, exponent) for a number this test never
    asks for. A mantissa is enough to give an answer away, so the exponent is
    not allowed to rescue a clashing one."""
    import math
    if "_example" in d:
        return d["_example"]
    used = set()
    for val, _unit in (d.get("_num") or {}).values():
        try:
            f = float(val)
        except (TypeError, ValueError):
            continue
        if f == 0:
            continue
        e = int(math.floor(math.log10(abs(f))))
        m = abs(f) / (10.0 ** e)
        for n in range(1, 5):
            used.add(("%." + str(n - 1) + "f") % m)
    for mant, expo in EXAMPLE_CANDIDATES:
        if mant in used:
            continue
        d["_example"] = ("%se%d" % (mant, expo), "%s × 10%s"
                         % (dot(mant), "".join(SUP[c] for c in str(expo))),
                         mant, expo)
        return d["_example"]
    raise ValueError("every example number clashes with an answer on this page")


def num_row(pid, unit, label="Answer", example="2.5e4"):
    # The unit is not pre-selected: choosing it is part of the answer, and SQA
    # drops the final mark without it (teacher, 3 Sep 2026).
    opts = ('<option value="" selected>&mdash;</option>'
            + "".join("<option>%s</option>" % u for u in PROFILE["units"]))
    return ('<label class="ans-lab" for="%s-num">%s</label>'
            '<span class="ans-numrow"><input class="ans-num" id="%s-num" type="text" '
            'inputmode="decimal" autocomplete="off" data-part="%s" '
            'placeholder="e.g. %s" '
            'aria-label="%s value"><select class="ans-unit" data-part="%s" '
            'aria-label="%s unit">%s</select></span>'
            % (pid, label, pid, pid, example, label, pid, label, opts))


def part_inputs(qid, part, d):
    pid = "%s%s" % (qid, part["id"])
    t = part["type"]
    # Working is done in the jotter, so a calculation asks only for the
    # relationship and the final answer with its unit (teacher, 2 Sep 2026).
    if t == "calc":
        return ('<div class="ans-grid">%s%s</div>'
                % (rel_select(pid, part.get("relationship", "")),
                   num_row(pid, part.get("unit", "Ω"),
                           example=PROFILE["example"] or example_number(d)[0])))
    if t in ("value", "working"):
        return ('<div class="ans-grid">%s</div>'
                % num_row(pid, part.get("unit", "Ω"),
                          example=PROFILE["example"] or example_number(d)[0]))
    # A derivation is written out line by line in the jotter and marked against
    # the scheme, so it takes no input at all — a textarea would invite a
    # pupil to type algebra they cannot type (AH, 5 Sep 2026).
    if t == "draw":
        return ('<p class="derive-note">Draw this in your jotter. When you have finished, '
                'reveal the mark scheme and compare your drawing with the model answer.</p>')
    if t == "derive":
        return ('<p class="derive-note">Write this out in your jotter, one line at a '
                'time. When you have finished, reveal the mark scheme and award '
                'yourself the marks line by line.</p>')
    rows = 3 if t == "open" else 2
    return ('<label class="ans-lab" for="%s-txt">Your answer</label>'
            '<textarea class="ans-area" id="%s-txt" rows="%d" data-part="%s"></textarea>'
            % (pid, pid, rows, pid))


def render_question(q, num, d, dia):
    out = ['<article class="q q-%s" id="q-%s" data-q="%s">'
           % (q["section"], q["id"], q["id"])]
    out.append('<div class="q-head"><span class="q-num">%d</span>'
               '<span class="q-marks">%d mark%s</span></div>'
               % (num, q["marks"], "" if q["marks"] == 1 else "s"))
    out.append('<div class="q-body">')

    if q.get("context"):
        out.append('<p class="stem">%s</p>' % sub(q["context"], d))
    if q.get("stem"):
        out.append('<p class="stem">%s</p>' % sub(q["stem"], d))
    if q.get("diagram"):
        out.append('<figure class="dia">%s</figure>' % dia[q["diagram"]])

    if q["type"] == "mcq":
        opts = q["options"] or d[q["id"].lower() + "_options"]
        out.append('<fieldset class="mcq" data-part="%s"><legend class="visually-hidden">'
                   'Options for question %d</legend>' % (q["id"], num))
        for i, o in enumerate(opts):
            letter = "ABCDE"[i]
            out.append('<label class="mcq-opt"><input type="radio" name="%s" value="%d">'
                       '<span class="mcq-let">%s</span><span class="mcq-txt">%s</span>'
                       '</label>' % (q["id"], i, letter, sub(o, d)))
        out.append('</fieldset>')
    elif q["type"] == "open":
        out.append(part_inputs(q["id"], {"id": "", "type": "open"}, d))
    else:
        for p in q["parts"]:
            pid = "%s%s" % (q["id"], p["id"])
            out.append('<div class="part" id="p-%s">' % pid)
            # a part id of "_" is a one-part question that shows no letter
            out.append('<p class="part-ask">%s%s<span class="part-marks">%d</span></p>'
                       % ("" if p["id"] == "_" else '<span class="part-let">(%s)</span> ' % p["id"],
                          sub(p["ask"], d), p["marks"]))
            if p.get("diagram"):
                out.append('<figure class="dia">%s</figure>' % dia[p["diagram"]])
            out.append(part_inputs(q["id"], p, d))
            out.append('<div class="mi" id="mi-%s" hidden></div>' % pid)
            out.append('</div>')

    if q["type"] in ("mcq", "open"):
        out.append('<div class="mi" id="mi-%s" hidden></div>' % q["id"])
    out.append('<button type="button" class="peek" data-peek="%s">Show the mark scheme '
               'for this question</button>' % q["id"])
    out.append('</div></article>')
    return "".join(out)


# ------------------------------------------------------------------ payload

def question_sf(q, part, d):
    """The answer is expected to the fewest significant figures of any value the
    question gives the pupil (SQA convention). Only the text they can see counts
    — never the mark scheme."""
    if q.get("given"):
        keys = [k.strip() for k in q["given"].split(",") if k.strip()]
    else:
        seen = " ".join([q.get("context", ""), q.get("stem", ""),
                         part.get("ask", "")])
        keys = re.findall(r"\{([a-z0-9_]+)\}", seen)
    best = None
    for key in keys:
        n = sig_figs(d.get(key, ""))
        if n and (best is None or n < best):
            best = n
    return best


def payload(qs, d):
    """Answers and mark schemes, kept out of the raw HTML.

    Base64 is a lock on a garden gate: it stops casual View Source, and the
    plan does not pretend it is anything more (§6, layer 3).
    """
    out = []
    for q in qs:
        e = {"id": q["id"], "type": q["type"], "section": q["section"],
             "marks": q["marks"], "auto": q.get("auto", 0), "self": q.get("self", 0),
             "keyarea": sub(q.get("keyarea", ""), d),
             "parent": sub(q.get("parent", ""), d)}
        if q["type"] == "mcq":
            e["key"] = q["key"] if q.get("key") != "computed" else d[q["id"].lower() + "_key"]
            if isinstance(e["key"], str):
                e["key"] = "ABCDE".index(e["key"])
            e["mi"] = sub(q.get("mi", ""), d)
            e["wrong"] = sub(q.get("wrong", ""), d)
        elif q["type"] == "open":
            e["mi"] = sub(q.get("mi", ""), d)
        else:
            e["parts"] = []
            for p in q["parts"]:
                pe = {"id": p["id"], "type": p["type"], "marks": p["marks"],
                      "auto": p.get("auto", 0), "self": p.get("self", 0),
                      "mi": sub(p.get("mi", ""), d)}
                if p.get("relationship"):
                    pe["rel"] = PROFILE["rel_key"][p["relationship"]]
                if p.get("answer"):
                    val, unit = d["_num"][p["answer"]]
                    pe["num"] = [val, unit]
                    if p.get("tol"):
                        pe["tol"] = float(p["tol"])
                    sf = int(p["sf"]) if p.get("sf") else question_sf(q, p, d)
                    if sf:
                        pe["sf"] = sf
                        ideal = sci(val, sf)
                        pe["sfstr"] = ideal
                        pe["mi"] += (
                            '<br><span class="sfnote">Significant figures: give the '
                            "answer to <strong>%d</strong> — the fewest in the data — "
                            "as <strong>%s %s</strong>. Accept %d to %d significant "
                            "figures.</span>"
                            % (sf, ideal, unit, max(1, sf - 1), sf + 2))
                e["parts"].append(pe)
        out.append(e)
    return base64.b64encode(json.dumps(out, ensure_ascii=False).encode("utf-8")).decode("ascii")


# --------------------------------------------------------------------- CSS

CSS = """
/* Trebuchet MS draws U+221A as something very like an integral sign, so
   "±ω√(A² − y²)" reads as an integral on screen and in print. This maps just
   the radical and the proportionality sign onto a font that draws them
   properly, and leaves every other glyph in the site's own face. */
@font-face { font-family: "pt-math";
  src: local("Helvetica Neue"), local("Helvetica"), local("Arial");
  unicode-range: U+221A, U+221D; }
.cover, .paper, .card-score, .mi, .refs, .q,
select, option, input, textarea, button {
  font-family: "pt-math", var(--font-stack, "Trebuchet MS","Segoe UI",system-ui,sans-serif); }
:root { --pt-accent: var(--accent); --pt-warm: var(--warm); }
.cover, .paper { max-width: 860px; margin: 0 auto; }
/* the Finish button must clear the home indicator on a phone */
main.page-wrap { padding-bottom: calc(5rem + env(safe-area-inset-bottom)); }
.cover {
  border: 1px solid var(--border-accent); border-radius: var(--radius);
  background: var(--card); box-shadow: var(--shadow-soft); padding: 1.4rem 1.2rem 1.6rem;
  text-align: center; margin-top: 1rem;
}
.cover .eyebrow { font-weight: 900; letter-spacing: .09em; text-transform: uppercase;
  font-size: .72rem; color: var(--muted); margin: 0 0 .3rem; }
.cover h2 { margin: 0 0 .15rem; font-size: 1.5rem; font-weight: 900; color: var(--text); }
.cover .sub { margin: 0 0 1rem; color: var(--muted); font-weight: 800; font-size: .95rem; }
.cover-facts { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin: 0 0 1.1rem; }
.fact { border: 1px solid var(--border-accent); border-radius: 12px; background: var(--surface-2);
  padding: .5rem .85rem; min-width: 92px; }
.fact b { display: block; font-size: 1.25rem; font-weight: 900; color: var(--text); line-height: 1.1; }
.fact span { font-size: .74rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
.begin { display: inline-flex; align-items: center; gap: .45rem; min-height: 52px;
  padding: .8rem 2rem; border: 0; border-radius: 14px; cursor: pointer;
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2)); color: #fff;
  font-family: inherit; font-weight: 900; font-size: 1.05rem;
  box-shadow: 0 8px 20px rgba(0,138,145,.32); touch-action: manipulation;
  -webkit-tap-highlight-color: transparent; }
.begin:hover { filter: brightness(1.06); }
.begin:focus-visible { outline: var(--focus-ring, 3px solid var(--accent)); outline-offset: var(--focus-offset); }
.cover-note { margin: .9rem 0 0; font-size: .84rem; color: var(--muted); font-weight: 800; }
.cover-jotter { margin: 1rem 0 0; padding: .6rem .85rem; border-radius: 12px;
  border: 1px solid var(--border-accent); background: var(--surface-2);
  font-size: .9rem; font-weight: 800; color: var(--text); text-align: left; }
.jotter-note { margin: 0 0 .2rem; padding: .55rem .85rem; border-radius: 12px;
  border: 1px dashed var(--border-strong); background: var(--surface-2);
  font-size: .88rem; font-weight: 800; color: var(--text); }

.refs { margin: 1rem 0 0; text-align: left; }
.refs > summary { cursor: pointer; font-weight: 900; color: var(--text); padding: .6rem .2rem;
  min-height: 44px; display: flex; align-items: center; gap: .4rem; }
.refs > summary:focus-visible { outline: var(--focus-ring, 3px solid var(--accent)); outline-offset: 2px; }
.refs table { width: 100%; border-collapse: collapse; font-size: .92rem; }
.refs th, .refs td { border: 1px solid var(--border-soft); padding: .38rem .5rem; text-align: left; }
.refs th { background: var(--surface-2); font-weight: 900; }
.refs .eqn { font-family: "Times New Roman", Times, Georgia, serif; font-size: 1.05rem; }
.refs var { font-style: italic; }

.sec { margin: 1.6rem 0 .8rem; border-radius: 14px; overflow: hidden;
  border: 1px solid var(--border-accent); }
.sec-head { display: flex; align-items: baseline; gap: .6rem; flex-wrap: wrap;
  padding: .6rem .9rem; background: linear-gradient(135deg, var(--cta-1), var(--cta-2)); color: #fff; }
.sec-head h2 { margin: 0; font-size: 1.05rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
.sec-head .sec-marks { font-weight: 900; font-size: .95rem; opacity: .95; }
.sec-head p { margin: 0; flex: 1 1 100%; font-size: .84rem; font-weight: 800; opacity: .95; }

.q { display: grid; grid-template-columns: 46px 1fr; border-top: 1px solid var(--border-soft);
  background: var(--card); }
.sec .q:first-of-type { border-top: 0; }
.q-head { grid-column: 1; display: flex; flex-direction: column; align-items: center; gap: .3rem;
  padding: 1rem .2rem; background: var(--surface-2); border-right: 3px solid var(--pt-accent); }
.q-num { font-weight: 900; font-size: 1.1rem; color: var(--text); }
.q-marks { font-size: .62rem; font-weight: 900; color: var(--muted); text-align: center;
  line-height: 1.15; text-transform: uppercase; letter-spacing: .03em; }
.q-body { grid-column: 2; padding: 1rem .95rem 1.1rem; min-width: 0; }
.stem { margin: 0 0 .7rem; line-height: 1.55; color: var(--text); }
.stmts { margin: .5rem 0 .2rem 1.1rem; padding: 0; }
.stmts li { margin: .22rem 0; }
.stmts { list-style: none; counter-reset: st; }
.stmts li::before { content: counter(st, upper-roman) "  "; counter-increment: st; font-weight: 900; }
blockquote { margin: .6rem 0; padding: .55rem .8rem; border-left: 4px solid var(--pt-accent);
  background: var(--surface-2); border-radius: 0 10px 10px 0; font-style: italic; }

.dia { margin: .8rem 0 1rem; padding: .6rem; border: 1px solid var(--border-soft);
  border-radius: 12px; background: var(--bg2); overflow-x: auto; }
.dia svg { --dia-ink: var(--text); --dia-body: #e8ddc4; display: block; max-width: 380px;
  margin: 0 auto; height: auto; }
.dia svg text { fill: var(--text); }

.mcq { border: 0; margin: 0; padding: 0; display: grid; gap: 6px; }
.mcq-opt { display: grid; grid-template-columns: 22px 26px 1fr; align-items: center; gap: 6px;
  min-height: 48px; padding: .3rem .5rem; border: 1px solid var(--border-soft); border-radius: 10px;
  background: var(--bg2); cursor: pointer; touch-action: manipulation;
  -webkit-tap-highlight-color: transparent; }
.mcq-opt:hover { border-color: var(--border-strong); }
.mcq-opt input { width: 20px; height: 20px; accent-color: var(--pt-accent); }
.mcq-opt input:focus-visible { outline: var(--focus-ring, 3px solid var(--accent)); outline-offset: 2px; }
.mcq-let { font-weight: 900; color: var(--muted); }
.mcq-txt { line-height: 1.4; }
.mcq-opt.is-key { border-color: var(--good); background: color-mix(in srgb, var(--good) 10%, var(--bg2)); }
.mcq-opt.is-chosen-wrong { border-color: var(--pt-warm); background: color-mix(in srgb, var(--pt-warm) 10%, var(--bg2)); }

.part { border-top: 1px dashed var(--border-soft); padding: .8rem 0 .2rem; }
.q-body > .part:first-of-type { border-top: 0; }
.part-ask { margin: 0 0 .55rem; line-height: 1.5; }
.part-let { font-weight: 900; margin-right: .25rem; }
.derive-note { margin:.4rem 0 .2rem; font-weight:700; color:var(--muted);
  border-left:3px solid var(--border-accent); padding:.15rem 0 .15rem .6rem; }
.part-marks { float: right; margin-left: .6rem; font-weight: 900; font-size: .78rem;
  color: var(--muted); border: 1px solid var(--border-soft); border-radius: 999px; padding: 1px 9px; }

.ans-grid { display: grid; gap: .3rem .6rem; margin: 0 0 .3rem; }
.ans-lab { font-size: .74rem; font-weight: 900; text-transform: uppercase; letter-spacing: .04em;
  color: var(--muted); }
.ans-rel, .ans-text, .ans-num, .ans-unit, .ans-area {
  font-family: inherit; font-size: 1rem; color: var(--text); background: var(--bg2);
  border: 1px solid var(--border); border-radius: 10px; padding: .55rem .6rem; min-height: 46px;
  width: 100%; }
.ans-area { min-height: 76px; line-height: 1.5; resize: vertical; }
.ans-rel:focus-visible, .ans-text:focus-visible, .ans-num:focus-visible,
.ans-unit:focus-visible, .ans-area:focus-visible { outline: var(--focus-ring, 3px solid var(--accent)); outline-offset: 2px; }
.ans-numrow { display: grid; grid-template-columns: 1fr 92px; gap: 6px; }
.ans-ok { border-color: var(--good); box-shadow: inset 0 0 0 1px var(--good); }
.ans-no { border-color: var(--pt-warm); box-shadow: inset 0 0 0 1px var(--pt-warm); }

.peek { margin: .8rem 0 0; min-height: 44px; padding: .5rem .8rem; border-radius: 10px;
  border: 1px dashed var(--border-strong); background: transparent; color: var(--muted);
  font-family: inherit; font-weight: 800; font-size: .84rem; cursor: pointer;
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.peek:hover { color: var(--text); }
.peek:focus-visible { outline: var(--focus-ring, 3px solid var(--accent)); outline-offset: 2px; }

.mi { margin: .7rem 0 0; padding: .7rem .85rem; border-radius: 12px;
  border: 1px solid var(--border-accent); border-left: 4px solid var(--pt-accent);
  background: var(--surface-2); font-size: .93rem; line-height: 1.55; }
.mi h4 { margin: 0 0 .35rem; font-size: .74rem; font-weight: 900; text-transform: uppercase;
  letter-spacing: .05em; color: var(--muted); }
.mi .verdict { font-weight: 900; }
.mi .verdict.ok { color: var(--good); }
.mi .verdict.no { color: var(--pt-warm); }
.mi .sfnote { display: block; margin-top: .35rem; font-size: .88rem; color: var(--muted); }
.sfwarn { color: var(--pt-warm); font-weight: 900; }
.selfmark { margin: .6rem 0 0; padding: .55rem .7rem; border: 1px dashed var(--border-strong);
  border-radius: 10px; background: var(--bg2); min-width: 0; }
.selfmark.is-todo { border: 2px dashed var(--pt-warm); }
/* floated, so the legend sits inside the box rather than on its border */
.selfmark legend { float: left; width: 100%; padding: 0; margin: 0 0 .4rem;
  font-size: .82rem; font-weight: 900; color: var(--muted); line-height: 1.5; }
.selfmark .opts { clear: both; display: flex; gap: 8px; flex-wrap: wrap; }
.sm-chip { display: inline-block; margin-left: .3rem; padding: .05rem .55rem; border-radius: 99px;
  border: 1px dashed var(--pt-warm); background: var(--card); color: var(--text); font-size: .75rem; font-weight: 900; }
.sm-chip.is-set { border: 1px solid var(--cta-2); }
.selfmark label { display: inline-flex; align-items: center; gap: .3rem; min-height: 44px;
  padding: .35rem .7rem; border: 1px solid var(--border-soft); border-radius: 999px;
  background: var(--card); font-weight: 900; cursor: pointer; }
.selfmark input { width: 18px; height: 18px; accent-color: var(--pt-accent); }

/* ---- the sticky bar: answering, marking one step at a time, the result ---- */
.paper [hidden] { display: none !important; }
.pt-bar { position: sticky; top: 0; z-index: 40; margin: 0 auto .9rem;
  background: var(--card); border: 1px solid var(--border-accent); border-top: 0;
  border-radius: 0 0 14px 14px; box-shadow: var(--shadow-soft); padding: .55rem 64px .6rem; }
.pt-bar-row { display: flex; align-items: center; gap: .4rem .9rem; flex-wrap: wrap; }
.pt-bar-txt { flex: 1 1 14rem; margin: 0; font-weight: 900; font-size: .95rem; color: var(--text);
  line-height: 1.35; }
.pt-bar-sub { display: block; font-weight: 800; font-size: .8rem; color: var(--muted); }
.pt-bar-acts { display: flex; align-items: center; gap: .3rem .6rem; flex-wrap: wrap; }
.pt-btn { min-height: 44px; padding: .5rem 1rem; border-radius: 12px; border: 0; cursor: pointer;
  font-family: inherit; font-weight: 900; font-size: .9rem; color: #fff;
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2));
  touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.pt-btn.ghost { background: var(--card); color: var(--text); border: 1px solid var(--border-strong); }
.pt-link { min-height: 44px; padding: .3rem .4rem; background: none; border: 0; cursor: pointer;
  font-family: inherit; font-weight: 800; font-size: .84rem; color: var(--muted);
  text-decoration: underline; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.pt-btn:focus-visible, .pt-link:focus-visible, .pt-warn a:focus-visible, .card-next a:focus-visible {
  outline: var(--focus-ring, 3px solid var(--accent)); outline-offset: var(--focus-offset); }
.pt-steps { display: flex; gap: 4px; margin: .45rem 0 0; padding: 0 0 3px; list-style: none;
  overflow-x: auto; scrollbar-width: thin; }
.pt-steps li { flex: 1 0 auto; display: inline-flex; align-items: center; justify-content: center;
  gap: 3px; min-width: 2.6rem; padding: .12rem .45rem; border-radius: 99px;
  border: 1px solid var(--border-soft); background: var(--surface-2); color: var(--muted);
  font-size: .72rem; font-weight: 900; white-space: nowrap; }
.pt-steps li.is-now { background: var(--card); border: 2px solid var(--cta-1); color: var(--text); }
.pt-steps li.is-done { background: var(--cta-2); border-color: var(--cta-2); color: #fff; }
.pt-steps li.is-todo { border: 1px dashed var(--pt-warm); color: var(--text); }
.st-tick { width: 11px; height: 11px; flex: none; }
.pt-warn { margin: .55rem 0 .1rem; border: 2px solid var(--pt-warm); border-radius: 14px;
  background: var(--card); padding: .8rem .9rem; }
.pt-warn p { margin: 0 0 .6rem; font-weight: 900; line-height: 1.45; color: var(--text); }
.pt-qlist { display: flex; flex-wrap: wrap; gap: 6px; }
.pt-qlist a { display: inline-flex; align-items: center; justify-content: center; min-width: 44px;
  min-height: 44px; border: 1px solid var(--border-strong); border-radius: 10px;
  background: var(--surface-2); color: var(--text); font-weight: 900; }
.mk-row { display: flex; gap: .6rem; flex-wrap: wrap; }
.mk-next { display: flex; justify-content: space-between; gap: .6rem; margin: 1rem 0 0; flex-wrap: wrap; }
.mk-done { display: inline-block; margin: 0 0 .45rem; padding: .1rem .6rem; border-radius: 99px;
  border: 1px solid var(--border-accent); font-size: .78rem; font-weight: 900; color: var(--muted); }
.q { scroll-margin-top: calc(var(--ptbar, 0px) + 10px); }
.q:focus { outline: none; }
.q:focus-visible { outline: var(--focus-ring, 3px solid var(--accent)); outline-offset: -3px; }
.card-score, #paper { scroll-margin-top: calc(var(--ptbar, 0px) + 10px); }
.q.is-locked .mcq-opt { cursor: default; }
.q.is-locked .ans-num, .q.is-locked .ans-area, .q.is-locked .ans-text { background: var(--surface-2); }
/* the corner badge would sit on the marking; the live score is in the bar (B1) */
body.pt-marking .prog-counter { display: none !important; }

.card-score { margin: 0 auto 1rem; border: 1px solid var(--border-accent); border-radius: var(--radius);
  background: var(--card); box-shadow: var(--shadow-soft); padding: 1.1rem 1rem 1.2rem; }
.card-score h2 { margin: 0 0 .8rem; font-size: 1.2rem; font-weight: 900; text-align: center; }
.score-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem; }
.score-row .fact b { font-size: 1.5rem; }
.bars { display: grid; gap: .5rem; margin: 0 0 .9rem; }
.bar-row { display: grid; grid-template-columns: 74px 1fr 58px; align-items: center; gap: 8px;
  font-weight: 900; font-size: .85rem; }
.bar { height: 12px; border-radius: 999px; background: var(--surface-2); overflow: hidden;
  border: 1px solid var(--border-soft); }
.bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--cta-1), var(--cta-2)); }
.split { font-size: .86rem; color: var(--muted); font-weight: 800; text-align: center; line-height: 1.6; }
.split b { color: var(--text); }
.card-line { margin: -.4rem 0 .8rem; text-align: center; font-size: .86rem; font-weight: 800;
  color: var(--muted); }
.bar-row.is-untried .bar { border-style: dashed; background: transparent; }
.bar-row.is-untried > span:last-child { color: var(--muted); font-weight: 800; }
.card-next { margin: 1rem 0 0; padding: .8rem .95rem; border-radius: 12px; text-align: left;
  border: 1px solid var(--border-accent); background: var(--surface-2); }
.card-next h3 { margin: 0 0 .3rem; font-size: 1rem; font-weight: 900; color: var(--text); }
.card-next ul { margin: 0; padding-left: 1.1rem; }
.card-next li { margin: .3rem 0; line-height: 1.5; }
.nx-ka { display: block; font-size: .88rem; font-weight: 800; color: var(--muted); }
.nx-links { display: flex; flex-wrap: wrap; gap: 0 .9rem; }
.nx-q, .nx-links a { display: inline-flex; align-items: center; min-height: 44px; font-weight: 900;
  color: var(--text); }
.mk-actions { display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap; margin: 1rem 0 0; }
.card-score .pt-warn { text-align: left; }
.card-attempts { margin: .9rem 0 0; font-size: .86rem; font-weight: 800; color: var(--muted);
  text-align: center; }
.card-attempts p { margin: 0; }
.card-attempts ul { list-style: none; margin: .25rem 0 .35rem; padding: 0; color: var(--text); }

[data-credit-note] { max-width: 860px; margin: 1.5rem auto 0; }

@media (max-width: 700px) {
  .q { grid-template-columns: 38px 1fr; }
  .q-body { padding: .85rem .7rem 1rem; }
  .ans-numrow { grid-template-columns: 1fr 84px; }
  .pt-bar { padding: .5rem 50px .55rem; border-radius: 0 0 12px 12px; }
  .pt-bar-row { gap: .3rem .6rem; }
  .pt-bar-txt { font-size: .88rem; }
  .pt-btn { padding: .5rem .8rem; font-size: .85rem; }
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}

@media print {
  @page { size: A4; margin: 12.7mm; }
  .banner-wrap, .subnav-wrap, footer,
  .begin, .pt-bar, .mk-next, .mk-done, .mk-actions, .peek, .back-to-s3, .backlink,
  .cover-note,
  .site-menu-button, .site-menu-drawer, .site-menu-overlay,
  .prog-counter, .prog-toast, .prog-dialog, .prog-dialog-overlay { display: none !important; }
  body { background: #fff; color: #000; }
  /* the on-screen 5rem is there to clear a phone's home indicator; in print it
     is 80pt of empty space that spills a whole blank page off the end */
  main.page-wrap { padding-bottom: 0; margin-bottom: 0; }
  .cover, .paper { display: block !important; max-width: none; }
  /* Only blocks that reliably fit a page may refuse to break: an element taller
     than A4 with break-inside:avoid pushes itself onto a fresh page and leaves
     the previous one blank. A question may split between its parts, as SQA
     papers do. */
  .part, .mi, .dia, .refs table, .card-score, .mcq-opt { break-inside: avoid; }
  /* five options are never taller than a page, and splitting them across one
     leaves a candidate choosing between A, B, C here and D, E overleaf. A
     warm-up question is a one-marker and always fits, so it is kept whole —
     which also stops a stem being orphaned from its own options. */
  .mcq { break-inside: avoid; }
  .q-warmup { break-inside: avoid; }
  .q, .sec, .cover, .card-score { box-shadow: none; }
  .stem, .part-ask, .sec-head { break-after: avoid; break-inside: avoid; }
  .automark, .verdict { display: none !important; }   /* on-screen marking feedback only */
  .mi { display: block !important; }
  .refs[open] > summary, .refs > summary { list-style: none; }
  .refs > table { display: table; }
  .dia svg { max-width: 300px; }
}
"""


JS = r"""
(function () {
  "use strict";
  var DATA = JSON.parse(new TextDecoder().decode(
    Uint8Array.from(atob(document.getElementById("pt-data").textContent.trim()),
                    function (c) { return c.charCodeAt(0); })));
  var PREFIX = "__PREFIX__", BADGE = "__BADGE__", TOTAL = __TOTAL__;
  var REL = __RELS__;
  var SECKEYS = __SECKEYS__;
  function zeroes() {
    var o = {};
    SECKEYS.forEach(function (k) { o[k] = [0, 0]; });
    return o;
  }
  var UNITS = __UNITS__;
  var SECNAMES = __SECNAMES__;
  var REVISE = __REVISE__;
  /* selfMarks is the one record of every self-mark, keyed by radio name, so a
     mark scheme box can be redrawn (peek, then marking, then a reload) without
     losing a tick (PT-1). A name that is missing has not been marked yet,
     which is not the same as 0 (PT-8). autoById and autoByPart freeze the
     auto-marks when marking starts, so the bars, the headline and "what to do
     next" agree (PT-6). */
  var revealed = {}, selfMarks = {}, autoById = {}, autoByPart = {}, autoSum = 0;
  /* phase: "answer" (working on the paper), "marking" (one step at a time),
     "paused" (marking, but looking at the whole paper) or "result" */
  var phase = "answer", step = 0, visited = [], drawn = {};
  var ATTEMPT = null, STEPS = [], STEP_OF = {};

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- persistence: never the progress key ---------- */
  function store(k, v) {
    try { localStorage.setItem(PREFIX + k, v); } catch (e) {}
  }
  function load(k) {
    try { return localStorage.getItem(PREFIX + k); } catch (e) { return null; }
  }
  function unstore(k) {
    try { localStorage.removeItem(PREFIX + k); } catch (e) {}
  }
  function stamp() { store("saved", String(Date.now())); }
  function saveMarks() {
    store("sm", JSON.stringify(selfMarks));
    store("phase", phase === "answer" ? "" : phase);
    store("step", String(step));
    store("visited", JSON.stringify(visited));
    stamp();
  }
  /* The badge keeps the best of finished attempts, and within one attempt the
     latest self-marked score, so a correction downwards sticks (PT-2). "Try
     again" starts a new attempt and keeps this one in the list (D11). */
  function attemptId() {
    if (!ATTEMPT) {
      ATTEMPT = load("attempt");
      if (!ATTEMPT) { ATTEMPT = String(Date.now()); store("attempt", ATTEMPT); }
    }
    return ATTEMPT;
  }
  function saveAll() {
    var o = {};
    $$("[data-part]").forEach(function (el) {
      if (el.type === "radio") { if (el.checked) { o[el.name] = el.value; } }
      else if (el.value) { o[el.id || (el.dataset.part + "-u")] = el.value; }
    });
    $$(".mcq input[type=radio]:checked").forEach(function (el) { o[el.name] = el.value; });
    store("ans", JSON.stringify(o));
    store("peek", JSON.stringify(revealed));
    stamp();
    renderBar();
  }
  function parsed(k, dflt) {
    try { var v = JSON.parse(load(k) || "null"); return v === null ? dflt : v; }
    catch (e) { return dflt; }
  }
  function restore() {
    var o = parsed("ans", {});
    Object.keys(o).forEach(function (k) {
      var el = document.getElementById(k);
      if (el) { el.value = o[k]; return; }
      var r = $$('input[name="' + k + '"]');
      if (r.length && o[k] !== "") { r[+o[k]] && (r[+o[k]].checked = true); }
      var u = $$('.ans-unit[data-part="' + k.replace(/-u$/, "") + '"]');
      if (u.length) { u[0].value = o[k]; }
    });
    revealed = parsed("peek", {});
    selfMarks = parsed("sm", {});
    visited = parsed("visited", []);
    step = Math.min(Math.max(0, +(load("step") || 0)), STEPS.length - 1);
    phase = load("phase") || "";
    /* a paper marked before marking went step by step comes back as a result */
    if (!phase && load("marked") === "1") {
      phase = "result";
      visited = STEPS.map(function (s, i) { return i; });
    }
    if (["marking", "paused", "result"].indexOf(phase) < 0) { phase = "answer"; }
    if (load("begun") === "1") { showPaper(); }
    /* a peeked mark scheme comes back with the page, so "you revealed the mark
       scheme for N questions" never refers to something the pupil cannot see */
    Object.keys(revealed).forEach(function (id) {
      var q = byId(id), b = $('.peek[data-peek="' + id + '"]');
      if (q) { draw(q); lockQ(q); }
      if (b) { b.hidden = true; }
    });
    if (phase !== "answer") { startMarking(true); } else { render(false); }
  }
  function byId(id) {
    return DATA.filter(function (x) { return x.id === id; })[0];
  }

  /* ---------- the cover gate ---------- */
  function showPaper() {
    $("#cover").hidden = true;
    $("#paper").hidden = false;
    store("begun", "1");
  }
  $("#beginBtn").addEventListener("click", function () {
    showPaper();
    var h = [].filter.call($("#paper").querySelectorAll("h2, h3"), function (e) {
      return e.offsetParent !== null; })[0];
    if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
  });

  /* ---------- number handling ---------- */
  /* One normaliser feeds both the value and the significant-figure count. They
     used to parse separately, so "7.2*10^-16" read as 7.2 in one and as nine
     figures in the other, and the pupil was told the sig figs were wrong
     (pupil bug report, 10 Sep 2026). The iPad "decimal" keypad offers * and ^
     but no ×, so those are the keys pupils actually reach for. */
  function normNum(s) {
    if (s === null || s === undefined) { return ""; }
    s = String(s).replace(/·/g, ".").replace(/\s/g, "");
    /* "12,000" is a thousands comma; a lone comma with no point, as in "2,5",
       is a decimal comma. It used to be stripped, so "2,5" read as 25 (PT-5). */
    if (/^[+\-−–]?\d{1,3}(?:,\d{3})+(?![\d,])/.test(s)) { s = s.replace(/,/g, ""); }
    else if (/^[^,]*,[^,]*$/.test(s) && s.indexOf(".") < 0) { s = s.replace(",", "."); }
    else { s = s.replace(/,/g, ""); }
    /* superscript exponents, which is how a pupil copies a power of ten off the
       page: rewrite them as an ordinary caret exponent, before the minus
       signs are normalised, so the ⁻ stays attached to its own digits. */
    s = s.replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (m) {
      return "^" + m.replace(/⁻/g, "-").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function (c) {
        return "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c);
      });
    });
    s = s.replace(/[−–—]/g, "-").replace(/⁻/g, "-");
    /* every "times ten to the" a pupil can type, folded to one "e". A
       multiplication mark is required, or "1910000" would have its own "10"
       eaten; and without a caret the exponent must carry a sign, so the
       genuinely ambiguous "7.2*100" is left to fail as unreadable rather than
       be read as 7.2. */
    s = s.replace(/[*x×✕]+10(?:\^|\*\*)([+-]?\d+)$/i, "e$1");
    s = s.replace(/[*x×✕]+10([+-]\d+)$/i, "e$1");
    /* a bare "10^-16", meaning 1 × 10⁻¹⁶ */
    s = s.replace(/^10(?:\^|\*\*)([+-]?\d+)$/, "1e$1");
    return s;
  }
  /* Anything the normaliser could not turn into a plain number is reported as
     unreadable rather than silently parsed to its leading digits. */
  function parseNum(s) {
    var t = normNum(s);
    if (t === "") { return { v: NaN, err: "empty" }; }
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(t)) {
      return { v: NaN, err: "unreadable" };
    }
    var v = parseFloat(t);
    return isNaN(v) ? { v: NaN, err: "unreadable" } : { v: v, err: null };
  }
  function num(s) { return parseNum(s).v; }
  function baseOf(val, unit) {
    var u = UNITS[unit];
    return u ? { v: val * u[0], dim: u[1] } : null;
  }
  function roundSig(x, n) {
    if (x === 0 || !n) { return x; }
    var f = Math.pow(10, n - Math.ceil(Math.log10(Math.abs(x))));
    return Math.sign(x) * Math.round(Math.abs(x) * f) / f;
  }
  function close(a, b) {
    return Math.abs(a - b) <= Math.max(Math.abs(b), 1e-12) * 1e-9;
  }
  /* SQA significant figures. The answer is expected to the fewest sig figs in
     the data; anything from one fewer to two more is accepted. What counts is
     how many figures the pupil WROTE, not the size of the number — 8·000 is
     four figures even though it equals 8·0. Inside the band the mark is
     awarded, and the pupil is told when it is not the expected figure but is
     never penalised for it (teacher, 3 Sep 2026). */
  function typedSigFigs(t) {
    t = normNum(t).replace(/^[+-]/, "");
    t = t.split(/e/i)[0];
    if (!/\d/.test(t)) { return null; }
    if (t.indexOf(".") >= 0) {
      var d = t.replace(".", "").replace(/^0+/, "");
      return d.length || t.split(".")[1].length;
    }
    return t.replace(/0+$/, "").length || 1;
  }
  /* A pupil writes "= 12 V." because that is how an answer is written on
     paper. The "=", a unit typed in the box and a closing full stop are set
     aside before the number is read; the unit is still marked from the list
     (PT-5). The unit starts at the first letter that is not the e of "2.5e4"
     or the x of "2.5x10^4". */
  function unitStart(s) {
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), rest = s.slice(i + 1);
      if (/[eE]/.test(c) && i > 0 && /[\d.·]/.test(s.charAt(i - 1)) &&
          /^[+\-−–]?\d/.test(rest)) { continue; }
      if (/[xX]/.test(c) && /^\s*10/.test(rest)) { continue; }
      if (/[A-Za-z°µͰ-ϿΩ%]/.test(c)) { return i; }
    }
    return -1;
  }
  function cleanAnswer(raw) {
    var s = String(raw === null || raw === undefined ? "" : raw).trim();
    s = s.replace(/^=+\s*/, "");
    var i = unitStart(s);
    var unit = i < 0 ? "" : s.slice(i).trim().replace(/[.]+$/, "");
    s = (i < 0 ? s : s.slice(0, i)).trim().replace(/[.·]+$/, "");
    return { text: s, unit: unit };
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function markNumber(rawText, gUnit, want, wUnit, sf, idealStr, tol) {
    var c = cleanAnswer(rawText);
    var res = markClean(c.text, gUnit, want, wUnit, sf, idealStr, tol);
    if (c.unit && !gUnit && res.why === "no unit chosen — SQA needs the unit") {
      res.why = "no unit chosen. You typed <b>" + esc(c.unit) + "</b> in the box," +
                " but only the list is marked. Choose the unit there";
    } else if (c.unit) {
      res.typedUnit = c.unit;
    }
    return res;
  }
  function markClean(rawText, gUnit, want, wUnit, sf, idealStr, tol) {
    var g = parseNum(rawText);
    if (g.err === "empty") { return { ok: false, why: "no answer given" }; }
    if (g.err) {
      return { ok: false, why: "answer not understood: write it as __EXPLAIN__" };
    }
    var given = g.v;
    if (!gUnit) { return { ok: false, why: "no unit chosen — SQA needs the unit" }; }
    var a = baseOf(given, gUnit), b = baseOf(want, wUnit);
    if (!a || !b) { return { ok: false, why: "unit not recognised" }; }
    if (a.dim !== b.dim) {
      return { ok: false, why: "that unit measures the wrong quantity" };
    }
    if (!sf) {
      return { ok: Math.abs(a.v - b.v) <= Math.abs(b.v) * (tol === undefined ? 0.02 : tol),
               why: "not the expected value" };
    }
    var n = typedSigFigs(rawText);
    var lo = Math.max(1, sf - 1), hi = sf + 2;
    if (n === null) { return { ok: false, why: "no answer given" }; }
    /* the value is judged before the figures, so a wrong number is never
       handed back a significant-figure reason it can be "corrected" against */
    if (!close(a.v, roundSig(b.v, n))) {
      return { ok: false, why: "not the expected value" };
    }
    if (n < lo || n > hi) {
      return { ok: false, why: "written to " + n + " significant figure" +
               (n === 1 ? "" : "s") + "; this question takes " + lo + " to " + hi };
    }
    var t = normNum(rawText).replace(/\+/g, "");
    var i = normNum(idealStr || "").replace(/\+/g, "");
    if (n !== sf && t !== i) { return { ok: true, sfWarn: sf }; }
    return { ok: true };
  }
  /* ---------- mark scheme rendering ---------- */
  function miBox(id, title, body, verdict) {
    var box = document.getElementById("mi-" + id);
    if (!box) { return; }
    var v = "";
    if (verdict) {
      v = '<p class="verdict ' + verdict.cls + '">' + verdict.text + "</p>";
    }
    box.innerHTML = "<h4>" + title + "</h4>" + v + body;
    box.hidden = false;
  }

  function chipHtml(name) {
    var had = selfMarks[name];
    return typeof had === "number"
      ? '<span class="sm-chip is-set">You gave ' + had + "</span>"
      : '<span class="sm-chip">Not marked yet</span>';
  }
  /* No radio starts ticked: an unmarked part must not look like a 0 (PT-8).
     A fieldset and legend, so a screen reader hears the question with the
     numbers (PT-10). */
  function selfControl(id, max) {
    var name = "sm-" + id, opts = "", had = selfMarks[name];
    var on = (typeof had === "number" && had >= 0 && had <= max) ? had : -1;
    for (var i = 0; i <= max; i++) {
      opts += '<label><input type="radio" name="' + name + '" value="' + i + '"' +
              (i === on ? " checked" : "") + '>' + i + "</label>";
    }
    var ask = max === 1 ? "did you earn this mark?"
                        : "how many of these " + max + " marks did you earn?";
    return '<fieldset class="selfmark' + (on < 0 ? " is-todo" : "") + '" data-sm="' + name + '">' +
           "<legend>__SELFPROMPT__ — " + ask + " " + chipHtml(name) + "</legend>" +
           '<div class="opts">' + opts + "</div></fieldset>";
  }

  /* ---------- marking ---------- */
  function markQuestion(q, live) {
    var auto = 0, selfMax = 0;
    if (q.type === "mcq") {
      var chosen = $('input[name="' + q.id + '"]:checked');
      var picked = chosen ? +chosen.value : -1;
      var right = picked === q.key;
      if (live) {
        $$('#q-' + q.id + " .mcq-opt").forEach(function (el, i) {
          if (i === q.key) { el.classList.add("is-key"); }
          else if (i === picked) { el.classList.add("is-chosen-wrong"); }
        });
        miBox(q.id, "Mark scheme",
              "<p>" + q.mi + "</p>" + (right || picked < 0 ? "" : "<p>" + q.wrong + "</p>"),
              { cls: right ? "ok" : "no",
                text: right ? "Correct — 1 mark" :
                      (picked < 0 ? "Not attempted — 0 marks"
                                  : "The answer is " + "ABCDE"[q.key] + " — 0 marks") });
      }
      if (right) { auto = q.auto; }
      autoByPart[q.id] = auto;
      return { auto: auto, selfMax: 0 };
    }
    if (q.type === "open") {
      if (live) {
        miBox(q.id, "Mark scheme", q.mi + selfControl(q.id, q.self), null);
      }
      return { auto: 0, selfMax: q.self };
    }
    q.parts.forEach(function (p) {
      var pid = q.id + p.id, got = 0, lines = [];
      if (typeof p.rel === "number") {
        var sel = document.getElementById(pid + "-rel");
        var ok = sel && sel.value !== "" && +sel.value === p.rel;
        if (ok) { got += 1; }
        if (live && sel) {
          sel.classList.add(ok ? "ans-ok" : "ans-no");
          lines.push("<p class=\"automark\"><strong>Relationship:</strong> " + REL[p.rel] +
                     (ok ? " — correct (1 mark)" : " — not the one you chose (0 marks)") + "</p>");
        }
      }
      if (p.num) {
        var inp = document.getElementById(pid + "-num");
        var unitSel = $('.ans-unit[data-part="' + pid + '"]');
        var res = inp ? markNumber(inp.value, unitSel ? unitSel.value : "",
                                   p.num[0], p.num[1], p.sf, p.sfstr, p.tol)
                      : { ok: false, why: "no answer given" };
        if (res.ok) { got += 1; }
        if (live && inp) {
          inp.classList.add(res.ok ? "ans-ok" : "ans-no");
          var msg = res.ok ? "correct (1 mark)" : "0 marks — " + res.why;
          if (res.sfWarn) {
            msg += ' <span class="sfwarn">— mark awarded, but SQA would want this to '
                 + res.sfWarn + " significant figure"
                 + (res.sfWarn === 1 ? "" : "s") + "</span>";
          }
          if (res.typedUnit) {
            msg += " (You typed the unit <b>" + esc(res.typedUnit) + "</b> in the box." +
                   " The box only reads the number. The unit is marked from the list.)";
          }
          lines.push('<p class="automark"><strong>Answer:</strong> ' + msg + "</p>");
        }
      }
      got = Math.min(got, p.auto);
      autoByPart[pid] = got;
      auto += got;
      selfMax += p.self;
      if (live) {
        miBox(pid, (p.id === "_" ? "Mark scheme, " : "Mark scheme — part (" + p.id + "), ") + p.marks +
              (p.marks === 1 ? " mark" : " marks"),
              lines.join("") + "<p>" + p.mi + "</p>" +
              (p.self > 0 ? selfControl(pid, p.self) : ""),
              p.auto ? { cls: got === p.auto ? "ok" : "no",
                         text: got + " of " + p.auto + (p.auto === 1 ? " mark" : " marks") + " awarded automatically" } : null);
      }
    });
    return { auto: auto, selfMax: selfMax };
  }

  /* ---------- score card ---------- */
  function band(pc) {
    return pc >= 70 ? "A" : pc >= 60 ? "B" : pc >= 50 ? "C" : pc >= 40 ? "D" : "no award";
  }

  /* each question's own self-mark groups, by exact name: a prefix match made
     sm-A1 also pick up sm-A10 to sm-A13 (PT-6) */
  function selfNames(q) {
    if (q.type === "mcq") { return []; }
    if (q.type === "open") { return q.self > 0 ? ["sm-" + q.id] : []; }
    return q.parts.filter(function (p) { return p.self > 0; })
                  .map(function (p) { return "sm-" + q.id + p.id; });
  }
  function smVal(n) { return typeof selfMarks[n] === "number" ? selfMarks[n] : null; }

  function autoTotal() {
    var t = 0;
    DATA.forEach(function (q) {
      if (q.type === "mcq") { t += q.auto; }
      else if (q.parts) { q.parts.forEach(function (p) { t += p.auto; }); }
    });
    return t;
  }

  /* ---------- the paper's own questions ---------- */
  function qNum(id) {
    var n = $("#q-" + id + " .q-num");
    return n ? n.textContent : id;
  }
  function inputsOf(q) {
    var art = document.getElementById("q-" + q.id);
    return art ? $$(".ans-rel, .ans-num, .ans-unit, .ans-area, .ans-text, .mcq input", art) : [];
  }
  /* a question with nothing to type (a derivation or a drawing) is done in
     the jotter, so it never counts as left blank */
  function answeredQ(q) {
    var els = inputsOf(q);
    if (!els.length) { return true; }
    return els.some(function (el) {
      return el.type === "radio" ? el.checked
           : (el.classList.contains("ans-unit") ? false : (el.value || "").trim() !== "");
    });
  }
  function hasInputs(q) { return inputsOf(q).length > 0; }
  /* answers lock once their mark scheme has been seen (PT-7, D11) */
  function lockQ(q) {
    inputsOf(q).forEach(function (el) {
      if (el.tagName === "SELECT" || el.type === "radio") { el.disabled = true; }
      else { el.readOnly = true; }
    });
    var art = document.getElementById("q-" + q.id);
    if (art) { art.classList.add("is-locked"); }
  }
  function draw(q) {
    if (drawn[q.id]) { return; }
    drawn[q.id] = 1;
    markQuestion(q, true);
  }

  /* ---------- marking steps ---------- */
  /* Every multiple-choice question is one step, marked by the page in one go
     (teacher, 19 Nov 2026: B6); every other question is a step of its own. */
  function buildSteps() {
    var mcq = DATA.filter(function (q) { return q.type === "mcq"; });
    if (mcq.length) {
      var secs = mcq.map(function (q) { return q.section; })
                    .filter(function (s, i, a) { return a.indexOf(s) === i; });
      var name = secs.length === 1 ? SECNAMES[secs[0]] : "Multiple choice";
      STEPS.push({ label: name, long: "the " + name.toLowerCase(), back: name,
                   ids: mcq.map(function (q) { return q.id; }) });
    }
    DATA.forEach(function (q) {
      if (q.type === "mcq") { return; }
      var n = qNum(q.id);
      STEPS.push({ label: "Q" + n, long: "question " + n, back: "Question " + n, ids: [q.id] });
    });
    STEPS.forEach(function (s, i) { s.ids.forEach(function (id) { STEP_OF[id] = i; }); });
  }
  function stepNames(i) {
    var out = [];
    STEPS[i].ids.forEach(function (id) { out = out.concat(selfNames(byId(id))); });
    return out;
  }
  function stepComplete(i) {
    return stepNames(i).every(function (n) { return smVal(n) !== null; });
  }
  function isVisited(i) { return visited.indexOf(i) >= 0; }

  function totals() {
    var t = { self: 0, sec: zeroes(), setN: 0, groups: 0, soFar: 0, tried: {} };
    SECKEYS.forEach(function (k) { t.tried[k] = false; });
    DATA.forEach(function (q) {
      t.sec[q.section][1] += q.marks;
      var s = 0, anySelf = false;
      selfNames(q).forEach(function (n) {
        t.groups += 1;
        var v = smVal(n);
        if (v !== null) { t.setN += 1; s += v; if (v > 0) { anySelf = true; } }
      });
      t.self += s;
      t.sec[q.section][0] += (autoById[q.id] || 0) + s;
      if (isVisited(STEP_OF[q.id])) { t.soFar += (autoById[q.id] || 0) + s; }
      if ((hasInputs(q) && answeredQ(q)) || anySelf) { t.tried[q.section] = true; }
    });
    t.score = autoSum + t.self;
    t.pc = Math.round((t.score / TOTAL) * 100);
    return t;
  }

  /* ---------- saved time and attempts ---------- */
  function when(ms) {
    var d = new Date(+ms), now = new Date();
    var time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === now.toDateString()) { return "at " + time; }
    return "on " + d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) +
           " at " + time;
  }
  function savedLine() {
    var t = load("saved");
    return t ? "Saved on this device " + when(t) : "Saved on this device as you go";
  }
  function pastAttempts() {
    var h = parsed("hist", []);
    return Array.isArray(h) ? h : [];
  }
  function noteAttempt(score) {
    var h = pastAttempts(), a = attemptId();
    var e = h.filter(function (x) { return x.a === a; })[0];
    if (!e) { e = { a: a, t: Date.now() }; h.unshift(e); }
    e.s = score;
    e.m = TOTAL;
    store("hist", JSON.stringify(h.slice(0, 3)));
  }

  /* ---------- drawing the page for its phase ---------- */
  var TICK = '<svg class="st-tick" viewBox="0 0 12 12" aria-hidden="true" focusable="false">' +
             '<path d="M2.2 6.4l2.5 2.5 5.1-5.6" fill="none" stroke="currentColor" ' +
             'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var stepNav = document.createElement("div");
  stepNav.className = "mk-next";

  function show(el, on) { if (el) { el.hidden = !on; } }

  function renderBar() {
    var main = $("#barMain"), sub = $("#barSub");
    show($("#finishBtn"), phase === "answer");
    show($("#barBack"), phase === "marking");
    show($("#barResume"), phase === "paused");
    show($("#ptSteps"), phase === "marking" || phase === "paused");
    if (phase === "answer") {
      var n = DATA.filter(answeredQ).length;
      main.textContent = "Answered " + n + " of " + DATA.length + " questions";
      sub.textContent = savedLine();
      return;
    }
    var t = totals();
    var selfLine = t.groups ? " · self-marked " + t.setN + " of " + t.groups +
                              (t.groups === 1 ? " part" : " parts") : "";
    if (phase === "marking") {
      main.textContent = "Marking " + STEPS[step].long + " · step " + (step + 1) +
                         " of " + STEPS.length;
      sub.textContent = "Score so far " + t.soFar + selfLine;
    } else if (phase === "paused") {
      main.textContent = "Marked " + STEPS.filter(function (s, i) { return isVisited(i); }).length +
                         " of " + STEPS.length + " steps";
      sub.textContent = "Score so far " + t.soFar + selfLine;
    } else {
      main.textContent = "Your score: " + t.score + " out of " + TOTAL + " (" + t.pc + "%)";
      sub.textContent = savedLine();
    }
    $("#ptSteps").innerHTML = STEPS.map(function (s, i) {
      var now = phase === "marking" && i === step;
      var done = isVisited(i) && !now && stepComplete(i);
      var todo = isVisited(i) && !now && !done;
      return '<li class="' + (done ? "is-done" : todo ? "is-todo" : now ? "is-now" : "") + '"' +
             (now ? ' aria-current="step"' : "") + ">" + (done ? TICK : "") + s.label +
             (done ? '<span class="visually-hidden"> marked</span>'
                   : todo ? '<span class="visually-hidden"> not all self-marked</span>' : "") +
             "</li>";
    }).join("");
    var cur = $("#ptSteps .is-now");
    if (cur) { cur.parentNode.scrollLeft = Math.max(0, cur.offsetLeft - 40); }
  }

  function render(move) {
    document.body.classList.toggle("pt-marking", phase === "marking" || phase === "paused");
    DATA.forEach(function (q) {
      var si = STEP_OF[q.id], vis;
      if (phase === "answer") { vis = !!revealed[q.id]; }
      else if (phase === "marking") { vis = si === step; }
      else if (phase === "paused") { vis = isVisited(si) || !!revealed[q.id]; }
      else { vis = true; }
      if (vis) { draw(q); }
      var art = document.getElementById("q-" + q.id);
      $$(".mi", art).forEach(function (m) { if (m.innerHTML) { m.hidden = !vis; } });
      var marked = phase === "result" || (phase !== "answer" && isVisited(si) &&
                                          !(phase === "marking" && si === step));
      show($(".mk-done", art), marked);
    });
    if (phase === "marking") {
      var s = STEPS[step], last = document.getElementById("q-" + s.ids[s.ids.length - 1]);
      var prev = step > 0 ? '<button type="button" class="pt-btn ghost" data-go="' + (step - 1) +
                 '">&larr; ' + STEPS[step - 1].back + "</button>" : "<span></span>";
      var next = step < STEPS.length - 1
        ? '<button type="button" class="pt-btn" data-go="' + (step + 1) + '">Next: ' +
          STEPS[step + 1].long + " &rarr;</button>"
        : '<button type="button" class="pt-btn" data-go="result">See my result &rarr;</button>';
      stepNav.innerHTML = prev + next;
      $(".q-body", last).appendChild(stepNav);
      stepNav.hidden = false;
    } else {
      stepNav.hidden = true;
    }
    show($("#scoreCard"), phase === "result");
    if (phase !== "answer") { recount(); }
    renderBar();
    sizeBar();
    if (!move) { return; }
    if (phase === "marking") {
      var first = document.getElementById("q-" + STEPS[step].ids[0]);
      first.scrollIntoView({ block: "start" });
      first.focus({ preventScroll: true });
    } else if (phase === "result") {
      $("#scoreCard").scrollIntoView({ block: "start" });
      $("#scoreCard").focus({ preventScroll: true });
    } else if (phase === "paused") {
      $("#paper").scrollIntoView({ block: "start" });
      $("#barResume").focus({ preventScroll: true });
    }
  }
  /* the questions scroll to just under the sticky bar, whatever its height */
  function sizeBar() {
    var bar = $("#ptBar");
    if (bar) { document.documentElement.style.setProperty("--ptbar", bar.offsetHeight + "px"); }
  }
  window.addEventListener("resize", sizeBar);

  function computeAuto() {
    autoSum = 0;
    DATA.forEach(function (q) {
      var r = markQuestion(q, false);
      autoById[q.id] = r.auto;
      autoSum += r.auto;
    });
  }
  function startMarking(restoring) {
    computeAuto();
    DATA.forEach(lockQ);
    $$(".peek").forEach(function (b) { b.hidden = true; });
    if (!restoring) {
      phase = "marking";
      step = 0;
      visited = [0];
      saveMarks();
    }
    render(!restoring);
  }
  function goStep(i) {
    if (i === "result") {
      phase = "result";
      STEPS.forEach(function (s, k) { if (!isVisited(k)) { visited.push(k); } });
    } else {
      phase = "marking";
      step = +i;
      if (!isVisited(step)) { visited.push(step); }
    }
    saveMarks();
    render(true);
  }

  function recount() {
    var t = totals();
    var peeked = Object.keys(revealed).length;
    $("#scoreVal").textContent = t.score;
    $("#scorePc").textContent = t.pc + "%";
    $("#scoreBand").textContent = band(t.pc);
    $("#cardLine").textContent = "Marked " + STEPS.length + " of " + STEPS.length +
      (t.groups ? " · self-marked " + t.setN + " of " + t.groups +
                  (t.groups === 1 ? " part" : " parts") : "");
    $("#splitLine").innerHTML = "Marked by the page: <b>" + autoSum + "</b>. " +
      "Marked by you: <b>" + t.self + "</b> of " + (TOTAL - autoTotal()) + " self-marked marks." +
      (peeked ? " You revealed the mark scheme for <b>" + peeked +
                "</b> question" + (peeked === 1 ? "" : "s") + " before marking." : "");
    SECKEYS.forEach(function (k) {
      var got = t.sec[k][0], max = t.sec[k][1], row = $("#bar-" + k).parentNode;
      /* a section with nothing written in it was not tried, which an empty
         bar would make look like 0 marks earned (B5) */
      var untried = !t.tried[k];
      row.classList.toggle("is-untried", untried);
      $("#bar-" + k + " i").style.width = untried ? "0" : Math.round((got / max) * 100) + "%";
      $("#barv-" + k).textContent = untried ? "not tried" : got + " / " + max;
    });
    if (phase === "result") {
      noteAttempt(t.score);
      nextSteps();
      attempts();
    }
    if (window.Progress && Progress.record) {
      Progress.record(BADGE, t.score, TOTAL, { attempt: attemptId() });
    }
  }

  /* "What to do next": every question that lost marks, the parts that lost
     them, and where on the site to go over it (teacher, 19 Nov 2026: B2) */
  function nextSteps() {
    var items = [];
    DATA.forEach(function (q) {
      var lost = 0, parts = [], unmarked = false;
      if (q.type === "mcq") {
        lost = q.marks - (autoById[q.id] || 0);
      } else if (q.type === "open") {
        var v = smVal("sm-" + q.id);
        if (v === null) { unmarked = true; }
        lost = q.marks - (v || 0);
      } else {
        q.parts.forEach(function (p) {
          var pv = p.self > 0 ? smVal("sm-" + q.id + p.id) : 0;
          if (pv === null) { unmarked = true; }
          var got = (autoByPart[q.id + p.id] || 0) + (pv || 0);
          if (got < p.marks) {
            lost += p.marks - got;
            if (p.id !== "_") { parts.push("(" + p.id + ")"); }
          }
        });
      }
      if (lost <= 0) { return; }
      var r = REVISE[q.id] || [];
      var links = "";
      if (r[0]) { links += '<a href="' + r[0] + '">' + r[1] + "</a>"; }
      if (r[2]) { links += '<a href="' + r[2] + '">Review Questions</a>'; }
      items.push("<li><a class=\"nx-q\" href=\"#q-" + q.id + "\">Question " + qNum(q.id) +
                 (parts.length && parts.length < q.parts.length ? " " + parts.join(" ") : "") +
                 "</a>: " + lost + " of " + q.marks + (q.marks === 1 ? " mark" : " marks") +
                 " lost" + (unmarked ? " (not all self-marked yet)" : "") + ". " +
                 (q.keyarea ? '<span class="nx-ka">' + q.keyarea + "</span>" : "") +
                 (links ? '<span class="nx-links">' + links + "</span>" : "") + "</li>");
    });
    $("#nextList").innerHTML = items.length ? items.join("")
      : "<li>Full marks. Nothing from this test to go over: try the other practice test.</li>";
  }
  function attempts() {
    var h = pastAttempts(), a = attemptId();
    show($("#attemptWrap"), h.length > 1);
    $("#attemptList").innerHTML = h.map(function (e) {
      return "<li>" + when(e.t).replace(/^(at|on) /, "") + ": <b>" + e.s + " / " + e.m +
             "</b> (" + Math.round(e.s / e.m * 100) + "%)" +
             (e.a === a ? " — this attempt" : "") + "</li>";
    }).join("");
  }

  /* ---------- inline confirms: the site never uses confirm() ---------- */
  var opener = null;
  function openWarn(id, from) {
    $$(".pt-warn").forEach(function (w) { w.hidden = true; });
    opener = from || null;
    var w = document.getElementById(id);
    w.hidden = false;
    sizeBar();
    $(".pt-btn", w).focus();
  }
  function closeWarn(w) {
    w.hidden = true;
    sizeBar();
    if (opener) { opener.focus(); opener = null; }
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") { return; }
    $$(".pt-warn").forEach(function (w) { if (!w.hidden) { closeWarn(w); } });
  });

  /* ---------- wiring ---------- */
  $$(".peek").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.dataset.peek, q = byId(id);
      revealed[id] = 1;
      draw(q);
      lockQ(q);
      b.hidden = true;
      saveAll();
    });
  });

  /* Finish says what is still blank, with links to it, and that marking
     locks the answers; nothing is marked until the pupil says so (PT-4, B3) */
  $("#finishBtn").addEventListener("click", function () {
    var blank = DATA.filter(function (q) { return !answeredQ(q); });
    var chips = blank.map(function (q) {
      return '<a href="#q-' + q.id + '" aria-label="Question ' + qNum(q.id) + '">' +
             qNum(q.id) + "</a>";
    }).join("");
    $("#finishMsg").innerHTML = (blank.length
      ? "<p>" + (blank.length === 1 ? "1 question has" : blank.length + " questions have") +
        ' no answer. Tap a number to go to it.</p><p class="pt-qlist">' + chips + "</p>"
      : "<p>Every question has an answer.</p>") +
      "<p>Once you mark your paper, your answers lock.</p>";
    $("#markGo").textContent = blank.length ? "Mark my paper anyway" : "Mark my paper";
    openWarn("finishWarn", $("#finishBtn"));
  });
  $("#finishMsg").addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) { return; }
    e.preventDefault();
    closeWarn($("#finishWarn"));
    var art = document.querySelector(a.getAttribute("href"));
    art.scrollIntoView({ block: "start" });
    var f = $(".ans-rel, .ans-num, .ans-area, .mcq input", art);
    (f || art).focus({ preventScroll: true });
  });
  $("#markGo").addEventListener("click", function () {
    $("#finishWarn").hidden = true;
    opener = null;
    startMarking(false);
  });
  $("#markBack").addEventListener("click", function () { closeWarn($("#finishWarn")); });

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-go]");
    if (b) { goStep(b.getAttribute("data-go")); }
  });
  $("#barBack").addEventListener("click", function () {
    phase = "paused";
    saveMarks();
    render(true);
  });
  $("#barResume").addEventListener("click", function () { goStep(step); });
  $("#readBtn").addEventListener("click", function () {
    var first = document.getElementById("q-" + DATA[0].id);
    first.scrollIntoView({ block: "start" });
    first.focus({ preventScroll: true });
  });

  /* one listener for every self-mark, whenever its box was drawn (PT-1) */
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.matches && t.matches(".selfmark input")) {
      selfMarks[t.name] = +t.value;
      var fs = t.closest(".selfmark");
      fs.classList.remove("is-todo");
      var chip = $(".sm-chip", fs);
      if (chip) { chip.outerHTML = chipHtml(t.name); }
      saveMarks();
      if (phase !== "answer") { recount(); renderBar(); }
      return;
    }
    if (phase === "answer") { saveAll(); }
  });
  document.addEventListener("input", function () { if (phase === "answer") { saveAll(); } });

  /* "Clear this test" lives in the bar only, behind one confirm (B4). It is
     for a shared PC: every answer, mark and attempt for this test goes. */
  $("#clearBtn").addEventListener("click", function () { openWarn("clearWarn", $("#clearBtn")); });
  $("#clearKeep").addEventListener("click", function () { closeWarn($("#clearWarn")); });
  $("#clearGo").addEventListener("click", function () {
    try {
      Object.keys(localStorage).filter(function (k) { return k.indexOf(PREFIX) === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    location.reload();
  });
  /* "Try again" keeps this attempt's score in the list and the badge on the
     best; the answers and self-marks clear for a fresh go (D11) */
  $("#againBtn").addEventListener("click", function () { openWarn("againWarn", $("#againBtn")); });
  $("#againKeep").addEventListener("click", function () { closeWarn($("#againWarn")); });
  $("#againGo").addEventListener("click", function () {
    noteAttempt(totals().score);
    ["ans", "peek", "sm", "phase", "step", "visited", "attempt", "marked"].forEach(unstore);
    stamp();
    location.reload();
  });

  $$(".q").forEach(function (art) {
    art.setAttribute("tabindex", "-1");
    $(".q-body", art).insertAdjacentHTML("afterbegin", '<span class="mk-done" hidden>Marked</span>');
  });
  buildSteps();
  if (window.Progress && Progress.markSeen) { Progress.markSeen(BADGE); }
  restore();
})();
"""


REL_SHEET = """
<table><caption class="visually-hidden">Relationships needed for this test</caption>
<thead><tr><th>Quantity</th><th>Relationship</th></tr></thead><tbody>
<tr><td>Voltage, current, resistance</td><td class="eqn"><var>V</var> = <var>I</var><var>R</var></td></tr>
<tr><td>Resistors in series</td><td class="eqn"><var>R</var><sub>T</sub> = <var>R</var><sub>1</sub> + <var>R</var><sub>2</sub> + …</td></tr>
<tr><td>Resistors in parallel</td><td class="eqn">1 / <var>R</var><sub>T</sub> = 1 / <var>R</var><sub>1</sub> + 1 / <var>R</var><sub>2</sub> + …</td></tr>
<tr><td>Power</td><td class="eqn"><var>P</var> = <var>I</var><var>V</var></td></tr>
</tbody></table>
"""

COLOUR_SHEET = """
<table><caption class="visually-hidden">Resistor colour band reference</caption>
<thead><tr><th>Colour</th><th>Digit</th><th>Multiplier</th><th>Tolerance</th></tr></thead><tbody>
<tr><td>black</td><td>0</td><td>×1</td><td>—</td></tr>
<tr><td>brown</td><td>1</td><td>×10</td><td>±1%</td></tr>
<tr><td>red</td><td>2</td><td>×100</td><td>±2%</td></tr>
<tr><td>orange</td><td>3</td><td>×1000</td><td>—</td></tr>
<tr><td>yellow</td><td>4</td><td>×10 000</td><td>—</td></tr>
<tr><td>green</td><td>5</td><td>×100 000</td><td>—</td></tr>
<tr><td>blue</td><td>6</td><td>×1 000 000</td><td>—</td></tr>
<tr><td>violet</td><td>7</td><td>—</td><td>—</td></tr>
<tr><td>grey</td><td>8</td><td>—</td><td>—</td></tr>
<tr><td>white</td><td>9</td><td>—</td><td>—</td></tr>
<tr><td>gold</td><td>—</td><td>—</td><td>±5%</td></tr>
<tr><td>silver</td><td>—</td><td>—</td><td>±10%</td></tr>
</tbody></table>
"""

# The N5/S3 Electricity 1 profile — the defaults, because it is what the pilot
# was built against.  A Higher test calls `use(...)` to swap the parts it needs.
PROFILE = {
    "css": "/assets/css/s3-physics.css?v=s3-20261014c",
    "progress_js": "/assets/js/progress/s3-physics.js",
    "banner": "/assets/s3-physics-banner.jpeg",
    "banner_alt": "S3 Physics banner",
    "theme_light": "#eaf7fa",
    "theme_dark": "#0d1f1a",
    "back_href": "/classes/s3-physics/electricity1.html",
    "back_label": "← Back to Electricity 1",
    "back_class": "back-to-s3",
    "subnav": "links",                    # "links", None, or a callable(slug)
    "relationships": RELATIONSHIPS,
    "relationships_html": RELATIONSHIPS_HTML,
    "rel_key": REL_KEY,
    "units": UNITS,
    "unit_js": UNIT_JS,
    "refs": None,                         # [(summary, html), …]; None = the N5 pair
    "split": (5, 13, 7),
    "credit": ("Sources &amp; credits: questions are adapted from National 5 Physics past "
               "papers, reproduced and adapted for educational use — past papers and marking "
               "instructions &copy; Qualifications Scotland (SQA). Numbers, contexts and "
               "circuits have been changed; the resistor colour-code question is original. "
               "Circuit diagrams and graphs drawn for this site &copy; R Stewart, 2026."),
    "source_note": "National 5 Physics past papers",
    "page_url": "mrstewartphysics.co.uk/classes/s3-physics/electricity1/practice-test-a.html",
    "builder": "tools/generators/practice-tests/n5-physics/electricity1/build.py",
    "cover_note": ("<strong>Have your jotter and a pen beside you.</strong> Do every "
                   "calculation in your jotter, the way you would in the real test — this "
                   "page asks only for the relationship you used and your final answer "
                   "with its unit."),
    "extra_css": "",
    # the drawn banner, as {"style": …, "icon": …, "icon_style": …, "sub": …}; None = the photo
    "band": None,
    "sections": SECTIONS,                 # [(key, name, blurb), …] — split follows this order
    "powers_note": True,
    "example": None,                      # answer-box placeholder; None = a power-of-ten example                  # the cover's "powers of ten" typing note
    "paper_note": ("Working goes in your jotter. On this page you give the relationship "
                   "and the final answer only — the mark scheme at the end shows the "
                   "substitution you should have written down."),
    "self_prompt": "Check the working in your jotter against the scheme above",
    "decimal": "·",                       # AH sets this to "."
    # the teacher PDF is printed rather than themed by CSS variables, so its
    # palette is spelled out here and follows the subject as the page does
    "mi_palette": {"ink": "#00666b", "rule": "#00747c", "text": "#10231f",
                   "muted": "#3a5f59", "muted2": "#4a6a65",
                   "border": "#b9cfcb", "head": "#eaf5f3"},
}


SUBNAV_LINKS = [
    ("circuits-symbols-meters", "A · Symbols &amp; meters"),
    ("resistance-ohms-law", "B · Resistance &amp; Ohm's law"),
    ("combining-resistors", "C · Combining resistors"),
    ("practice-test-a", "Test A"),
    ("practice-test-b", "Test B"),
    ("graphing-practice", "Graphs"),
]


def subnav(slug):
    """The part stepper. Generated, so every page in the topic shows the same
    set and the current one is marked exactly once.

    A course with no sibling pages to step through passes `subnav: None` and
    gets no stepper at all."""
    if PROFILE["subnav"] is None:
        return ""
    if callable(PROFILE["subnav"]):
        return PROFILE["subnav"](slug)
    out = []
    for href, label in SUBNAV_LINKS:
        active = (href == slug)
        out.append('      <a class="subnav-link%s" href="/classes/s3-physics/'
                   'electricity1/%s.html"%s>%s</a>'
                   % (" is-active" if active else "", href,
                      ' aria-current="page"' if active else "", label))
    return ('<div class="subnav-wrap">\n'
            '  <nav class="subnav" aria-label="Electricity 1 parts">\n'
            '    <div class="subnav-links">\n%s\n    </div>\n'
            '    <a class="subnav-cta" href="/classes/s3-physics/electricity1.html">'
            'Electricity 1 hub</a>\n  </nav>\n</div>\n' % "\n".join(out))



def revise_file():
    return os.path.join(REPO, os.path.dirname(PROFILE["builder"]), "revise.md")


def revise_map(meta):
    """Where "What to do next" sends a pupil who lost marks on a question.

    One line per question in the course folder's revise.md:
        test id | question | link | link text [| Review Questions link]
    Kept out of test-*.md so a change to the questions never touches it."""
    out = {}
    path = revise_file()
    if not os.path.exists(path):
        return out
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        cells = [c.strip() for c in line.split("|")]
        if len(cells) < 4 or cells[0] != meta["id"]:
            continue
        out[cells[1]] = [cells[2], _html.escape(cells[3], quote=False)] + (
            [cells[4]] if len(cells) > 4 and cells[4] else [])
    return out


def page(meta, qs, d, dia, data):
    secs = []
    num = 0
    for key, name, blurb in PROFILE["sections"]:
        inside = [q for q in qs if q["section"] == key]
        marks = sum(q["marks"] for q in inside)
        body = []
        for q in inside:
            num += 1
            body.append(render_question(q, num, d, dia))
        secs.append(
            '<section class="sec" aria-label="%s section, %d marks">'
            '<div class="sec-head"><h2>%s</h2><span class="sec-marks">%d marks</span>'
            '<p>%s</p></div>%s</section>'
            % (name, marks, name, marks, blurb, "".join(body)))

    refs = PROFILE["refs"]
    if refs is None:
        refs = [("Relationships you may need", REL_SHEET),
                ("Resistor colour-band reference", COLOUR_SHEET)]
    refs_html = "\n  ".join('<details class="refs"><summary>%s</summary>%s</details>'
                          % (title, body) for title, body in refs)

    cover = """
<div class="cover" id="cover">
  <p class="eyebrow">%(course)s · %(topic)s</p>
  <h2>%(short)s</h2>
  <p class="sub">Answer everything, then mark it one question at a time.</p>
  <div class="cover-facts">
    <div class="fact"><b>%(marks)s</b><span>marks</span></div>
    <div class="fact"><b>%(minutes)s min</b><span>suggested</span></div>
    <div class="fact"><b>%(qs)d</b><span>questions</span></div>
  </div>
  <button type="button" class="begin" id="beginBtn">Begin the test</button>
  <p class="cover-jotter">%(jotter)s</p>
  %(exforms)s
  <p class="cover-note">Nothing is timed and nothing is sent anywhere — your answers stay on this device, so you can close the tab and come back.</p>
  %(refs)s
</div>
""" % {"course": meta["course"], "topic": meta["topic"], "short": meta["short"],
       "marks": meta["marks"], "minutes": meta["minutes"],
       "qs": len(qs), "jotter": PROFILE["cover_note"], "refs": refs_html,
       "exforms": ("" if not PROFILE["powers_note"] else
                   '<p class="cover-note">Powers of ten can be typed any way you like '
                   "&mdash; <strong>%s</strong>, <strong>%s*10^%d</strong>, "
                   "<strong>%sx10^%d</strong> or <strong>%s</strong> are all read the same.</p>"
                   % (example_number(d)[0], example_number(d)[2],
                      example_number(d)[3], example_number(d)[2],
                      example_number(d)[3], example_number(d)[1]))}

    score = """
<section class="card-score" id="scoreCard" hidden tabindex="-1" aria-label="Your result">
  <h2>Your result</h2>
  <p class="card-line" id="cardLine"></p>
  <div class="score-row" aria-live="polite">
    <div class="fact"><b id="scoreVal">0</b><span>out of %(marks)s</span></div>
    <div class="fact"><b id="scorePc">0%%</b><span>percentage</span></div>
    <div class="fact"><b id="scoreBand">—</b><span>indicative band</span></div>
  </div>
  <div class="bars">
%(bars)s
  </div>
  <p class="split" id="splitLine"></p>
  <p class="split">Bands are indicative only — they are a guide to where you are, not a grade.</p>
  <div class="card-next"><h3>What to do next</h3><ul id="nextList"></ul></div>
  <div class="mk-actions">
    <button type="button" class="pt-btn" id="readBtn">Read the mark schemes from question 1</button>
    <button type="button" class="pt-btn ghost" id="againBtn">Try again</button>
  </div>
  <div class="pt-warn" id="againWarn" role="group" aria-labelledby="againMsg" hidden>
    <p id="againMsg">Start a new attempt? Your answers and self-marks clear. This score stays in your last attempts, and your badge keeps your best.</p>
    <div class="mk-row"><button type="button" class="pt-btn" id="againGo">Start again</button><button type="button" class="pt-btn ghost" id="againKeep">Keep this attempt</button></div>
  </div>
  <div class="card-attempts" id="attemptWrap" hidden>
    <p>Your last attempts on this device</p>
    <ul id="attemptList"></ul>
    <p>Your badge counts your best score.</p>
  </div>
</section>
""" % {"marks": meta["marks"], "bars": "\n".join(
        '    <div class="bar-row"><span>%s</span><span class="bar" id="bar-%s"><i style="width:0">'
        '</i></span><span id="barv-%s">0 / %d</span></div>' % (name, key, key, want)
        for (key, name, _), want in zip(PROFILE["sections"], PROFILE["split"]))}

    bar = """
<div class="pt-bar" id="ptBar" role="region" aria-label="Your test">
  <div class="pt-bar-row">
    <p class="pt-bar-txt"><span id="barMain" aria-live="polite">Answered 0 of %(qs)d questions</span><span class="pt-bar-sub" id="barSub">Saved on this device as you go</span></p>
    <div class="pt-bar-acts">
      <button type="button" class="pt-btn" id="finishBtn">Finish &amp; mark</button>
      <button type="button" class="pt-btn ghost" id="barBack" hidden>Back to the paper</button>
      <button type="button" class="pt-btn" id="barResume" hidden>Carry on marking</button>
      <button type="button" class="pt-link" id="clearBtn">Clear this test</button>
    </div>
  </div>
  <ol class="pt-steps" id="ptSteps" aria-label="Marking steps" hidden></ol>
  <div class="pt-warn" id="finishWarn" role="group" aria-labelledby="finishMsg" hidden>
    <div id="finishMsg"></div>
    <div class="mk-row"><button type="button" class="pt-btn" id="markGo">Mark my paper</button><button type="button" class="pt-btn ghost" id="markBack">Back to the paper</button></div>
  </div>
  <div class="pt-warn" id="clearWarn" role="group" aria-labelledby="clearMsg" hidden>
    <p id="clearMsg">Clear this test? Every answer, mark and past attempt for this test is removed from this device. Your badge is kept.</p>
    <div class="mk-row"><button type="button" class="pt-btn" id="clearGo">Clear this test</button><button type="button" class="pt-btn ghost" id="clearKeep">Keep my answers</button></div>
  </div>
</div>
""" % {"qs": len(qs)}

    js = (JS.replace("__PREFIX__", meta["prefix"])
            .replace("__BADGE__", meta["badge"])
            .replace("__TOTAL__", str(meta["marks"]))
            .replace("__SECKEYS__", json.dumps([k for k, _, _ in PROFILE["sections"]]))
            .replace("__SECNAMES__", json.dumps({k: n for k, n, _ in PROFILE["sections"]},
                                                ensure_ascii=False))
            .replace("__REVISE__", json.dumps(revise_map(meta), ensure_ascii=False))
            .replace("__SELFPROMPT__", PROFILE["self_prompt"])
            .replace("__RELS__", json.dumps(PROFILE["relationships_html"], ensure_ascii=False))
            .replace("__UNITS__", json.dumps(PROFILE["unit_js"], ensure_ascii=False))
            .replace("__EXPLAIN__", "%s or %s" % (example_number(d)[0],
                                                  example_number(d)[1])))

    title = "%s · %s" % (meta["topic"], meta["short"])
    band = PROFILE["band"]
    if band:
        # the drawn banner carries the page's only <h1>
        css = CSS.replace("  .banner-wrap, .subnav-wrap, footer,", "  .band-banner, .subnav-wrap, footer,")
        banner_html = ('<header class="band-banner" style="%s">\n'
                       '  <span class="bb-chip" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false" '
                       'style="%s"><use href="#%s"/></svg></span>\n'
                       '  <div>\n    <h1>%s</h1>\n    <p>%s</p>\n  </div>\n</header>'
                       % (band["style"], band["icon_style"], band["icon"], title, band["sub"]))
        icons, hidden_h1 = "\n  {% include resource-icons.html %}", ""
    else:
        css = CSS
        banner_html = ('<div class="banner-wrap">\n'
                       '  <img src="%s" alt="%s" class="banner" loading="eager">\n'
                       '  <div class="banner-tint"></div>\n'
                       '  <div class="banner-overlay-text">\n    <h1>%s</h1>\n  </div>\n</div>'
                       % (PROFILE["banner"], PROFILE["banner_alt"], title))
        icons, hidden_h1 = "", '<h1 class="visually-hidden">%s</h1>\n' % meta["title"]
    return """---
layout: none
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" content="%(tlight)s" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="%(tdark)s" media="(prefers-color-scheme: dark)" />
<title>%(title)s</title>
{%% include site-head-icons.html %%}

  <link rel="stylesheet" href="/assets/css/site-menu.css">
  <script src="/assets/js/site-menu.js" defer></script>
  <script src="/assets/js/progress.js" defer></script>
  <script src="%(progressjs)s" defer></script>
  <link rel="stylesheet" href="%(sitecss)s">

<style>
/* Generated by %(builder)s — edit the source .md and re-run, never this file. */
.pt-toprow { display: flex; align-items: center; justify-content: space-between; gap: 10px 16px; flex-wrap: wrap; }
%(css)s%(extracss)s
</style>
</head>
<body>

  {%% include site-menu.html %%}%(icons)s

%(banner_html)s

%(subnav)s

<main class="page-wrap" id="mainContent">
%(hidden_h1)s
<div class="pt-toprow">
<a href="%(backhref)s" class="%(backclass)s">%(backlabel)s</a>
{%% include feedback-button.html about="%(about)s" %%}
</div>

%(cover)s

<div class="paper" id="paper" hidden>
%(bar)s
%(score)s
<p class="jotter-note">%(papernote)s</p>
%(secs)s
</div>

<p data-credit-note style="font-size:0.82rem;opacity:0.78;margin-top:1.5rem;">%(credit)s</p>

</main>

{%% include site-footer.html %%}

<script type="application/json" id="pt-data">%(data)s</script>
<script>
%(js)s
</script>
</body>
</html>
""" % {"title": meta["title"], "topic": meta["topic"], "short": meta["short"],
       "css": css, "subnav": subnav(meta["slug"]), "cover": cover, "secs": "".join(secs),
       "score": score, "bar": bar, "data": data, "js": js,
       "tlight": PROFILE["theme_light"], "tdark": PROFILE["theme_dark"],
       "progressjs": PROFILE["progress_js"], "sitecss": PROFILE["css"],
       "builder": PROFILE["builder"], "extracss": PROFILE["extra_css"],
       "banner_html": banner_html, "icons": icons, "hidden_h1": hidden_h1,
       "backhref": PROFILE["back_href"], "backclass": PROFILE["back_class"],
       "backlabel": PROFILE["back_label"], "credit": PROFILE["credit"],
       "papernote": PROFILE["paper_note"],
       "about": meta["title"].replace('"', "'")}


# ------------------------------------------------------- static validation

def check(html, meta, qs, d, values):
    """Layer 3 — static validation, before anything ships."""
    errs, warns = [], []

    per_sec = {}
    for q in qs:
        per_sec[q["section"]] = per_sec.get(q["section"], 0) + q["marks"]
        parts = q.get("parts") or []
        if parts and sum(p["marks"] for p in parts) != q["marks"]:
            errs.append("%s: parts sum to %d, header says %d"
                        % (q["id"], sum(p["marks"] for p in parts), q["marks"]))
        for p in parts:
            if p["auto"] + p["self"] != p["marks"]:
                errs.append("%s(%s): auto+self != marks" % (q["id"], p["id"]))
            if not p.get("mi"):
                errs.append("%s(%s): no mark scheme" % (q["id"], p["id"]))
        if not parts and not q.get("mi"):
            errs.append("%s: no mark scheme" % q["id"])
        if not q.get("parent"):
            errs.append("%s: no parent recorded" % q["id"])
    total = sum(per_sec.values())
    if total != int(meta["marks"]):
        errs.append("total marks %d, expected %s" % (total, meta["marks"]))
    for (k, _, _), want in zip(PROFILE["sections"], PROFILE["split"]):
        if per_sec.get(k) != want:
            errs.append("%s section is %s marks, expected %d" % (k, per_sec.get(k), want))

    for tag in ("section", "div", "details", "svg", "figure", "script", "style",
                "article", "fieldset", "table", "main", "select", "textarea"):
        o = len(re.findall(r"<%s[\s>]" % tag, html))
        c = len(re.findall(r"</%s>" % tag, html))
        if o != c:
            errs.append("tag imbalance <%s>: %d open, %d close" % (tag, o, c))

    for ident in re.findall(r'getElementById\("([a-zA-Z0-9\-]+)"\)', html):
        if ('id="%s"' % ident) not in html:
            errs.append("JS references missing id #%s" % ident)

    ALLOWED_INCLUDES = ("site-menu.html", "site-footer.html", "site-head-icons.html",
                        "resource-icons.html", "feedback-button.html")
    liquid = [m for m in re.findall(r"\{\{.*?\}\}|\{%.*?%\}", html)
              if not any(("include " + i) in m for i in ALLOWED_INCLUDES)]
    if liquid:
        errs.append("unexpected Liquid tags: %r" % liquid[:3])

    for m in re.finditer(r'<(input|select|textarea)\b[^>]*id="([^"]+)"', html):
        ident = m.group(2)
        if ('for="%s"' % ident) not in html and 'aria-label' not in m.group(0):
            errs.append("input #%s has no label" % ident)

    # No auto-marked answer may be readable before Finish — placeholders and
    # worked examples included.  Given values from @values are exempt.
    body = html.split('id="pt-data"')[0]
    for tag in ("svg", "style", "script"):        # coordinates and CSS are not answers
        body = re.sub(r"<%s.*?</%s>" % (tag, tag), "", body, flags=re.S)
    body = re.sub(r'\sstyle="[^"]*"', "", body)  # nor are inline style attributes
    given = set()
    for x in values.values():
        for tok in re.split(r"[,\s]+", str(x)):
            try:
                given.add(float(tok))
            except ValueError:
                pass
    leaked = []
    for k, (val, unit) in d.get("_num", {}).items():
        for sf in (2, 3, 4):
            if float("%.*g" % (sf, val)) in given:
                continue
            # plain decimal, and the scientific form Higher answers are written
            # in — a leak in "7·2 × 10⁻¹⁶" would sail past the decimal test
            for token in (dot("%.*g" % (sf, val)), sci(val, sf)):
                if len(token) < 2:
                    continue
                sep = re.escape(PROFILE["decimal"])
                if re.search(r"(?<![\d" + sep + r"])" + re.escape(token)
                             + r"(?![\d" + sep + r"])", body):
                    leaked.append((k, token))
                    break
            else:
                continue
            break
    if leaked:
        errs.append("auto-marked answers readable before Finish: %r" % leaked[:5])

    rev = revise_map(meta)
    for q in qs:
        if q["id"] not in rev:
            errs.append("%s: no 'what to do next' link in %s" % (q["id"], os.path.basename(revise_file())))
    for qid, r in rev.items():
        for href in [r[0]] + r[2:]:
            path, _, anchor = href.partition("#")
            f = os.path.join(REPO, path.lstrip("/"))
            if not os.path.exists(f):
                errs.append("%s: revise link %s not found" % (qid, href))
            elif anchor and ('id="%s"' % anchor) not in open(f, encoding="utf-8", errors="ignore").read():
                errs.append("%s: revise link %s has no #%s" % (qid, path, anchor))
    if "data-credit-note" not in html or "Qualifications Scotland (SQA)" not in html:
        errs.append("credit line missing")
    if "alert(" in html:
        errs.append("alert() present")
    if "**" in html.split('id="pt-data"')[0]:
        errs.append("unconverted **bold** left in the page")
    if "@page" not in html:
        errs.append("no print stylesheet @page rule")
    return errs, warns


def provenance(qs, d):
    rows = ["question,section,marks,key_area,parent,what_changed"]
    for q in qs:
        par = re.sub(r"\s+", " ", sub(q.get("parent", ""), d))
        src = par.split("—")[0].strip()
        chg = par.split("—", 1)[1].strip() if "—" in par else ""
        rows.append('%s,%s,%d,"%s","%s","%s"'
                    % (q["id"], q["section"], q["marks"],
                       sub(q.get("keyarea", ""), d).replace('"', "'"),
                       src.replace('"', "'"), chg.replace('"', "'")))
    return "\n".join(rows) + "\n"


MI_CSS = """
/* Trebuchet MS draws U+221A as something very like an integral sign, so
   "±ω√(A² − y²)" reads as an integral on screen and in print. This maps just
   the radical and the proportionality sign onto a font that draws them
   properly, and leaves every other glyph in the site's own face. */
@font-face { font-family: "pt-math";
  src: local("Helvetica Neue"), local("Helvetica"), local("Arial");
  unicode-range: U+221A, U+221D; }
@page { size: A4; margin: 14mm 12.7mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "pt-math","Trebuchet MS","Segoe UI",system-ui,sans-serif;
  color: %(text)s; font-size: 10.5pt; line-height: 1.45; }
h1 { font-size: 15pt; margin: 0 0 .1rem; font-weight: 900; }
h2 { font-size: 11pt; margin: 1.1rem 0 .35rem; font-weight: 900;
  text-transform: uppercase; letter-spacing: .05em; color: %(ink)s;
  border-bottom: 2px solid %(rule)s; padding-bottom: 2px; break-after: avoid; }
.sub { margin: 0 0 .8rem; font-weight: 800; color: %(muted)s; font-size: 10pt; }
table { width: 100%%; border-collapse: collapse; margin: .4rem 0 .9rem; font-size: 9.5pt; }
th, td { border: 1px solid %(border)s; padding: 3px 6px; text-align: left; vertical-align: top; }
th { background: %(head)s; font-weight: 900; }
.q { break-inside: avoid; margin: 0 0 .7rem; border-left: 3px solid %(rule)s;
  padding: 0 0 0 .6rem; }
.q h3 { margin: 0 0 .2rem; font-size: 10.5pt; font-weight: 900; }
.q .ka { font-size: 9pt; color: %(muted)s; font-weight: 800; margin: 0 0 .25rem; }
.q .scheme { margin: 0 0 .3rem; }
.q .parent { font-size: 8.5pt; color: %(muted2)s; margin: .25rem 0 0; font-style: italic; }
var { font-style: italic; font-family: "Times New Roman", Times, serif; }
.tot { font-weight: 900; }
.foot { margin-top: 1.2rem; font-size: 8.5pt; color: %(muted2)s; border-top: 1px solid %(border)s;
  padding-top: .4rem; }
"""

SECTION_NAME = {k: n for k, n, _ in SECTIONS}


def marking_instructions(meta, qs, d):
    """The teacher's marking instructions, in SQA shape: a coverage table, then
    the scheme mark by mark. Same source as the page, so the two cannot disagree."""
    rows, num, running = [], 0, 0
    for key, name, _ in PROFILE["sections"]:
        for q in [x for x in qs if x["section"] == key]:
            num += 1
            running += q["marks"]
            rows.append("<tr><td>%d</td><td>%s</td><td>%s</td><td>%d</td><td>%d</td></tr>"
                        % (num, name, sub(q.get("keyarea", ""), d), q["marks"], running))
    cover = ('<table><thead><tr><th>Q</th><th>Section</th><th>Key area</th>'
             '<th>Marks</th><th>Running total</th></tr></thead><tbody>%s'
             '<tr class="tot"><td colspan="3">Total</td><td>%s</td><td>%s</td></tr>'
             '</tbody></table>' % ("".join(rows), meta["marks"], meta["marks"]))

    body, num = [], 0
    for key, name, _ in PROFILE["sections"]:
        inside = [x for x in qs if x["section"] == key]
        body.append("<h2>%s — %d marks</h2>"
                    % (name, sum(x["marks"] for x in inside)))
        for q in inside:
            num += 1
            out = ['<div class="q"><h3>%d.&nbsp; (%d mark%s)</h3>'
                   % (num, q["marks"], "" if q["marks"] == 1 else "s")]
            out.append('<p class="ka">%s</p>' % sub(q.get("keyarea", ""), d))
            if q["type"] == "mcq":
                opts = q["options"] or d[q["id"].lower() + "_options"]
                k = q["key"] if q.get("key") != "computed" else d[q["id"].lower() + "_key"]
                k = "ABCDE".index(k) if isinstance(k, str) else k
                out.append('<p class="scheme"><strong>Answer: %s</strong> — %s &nbsp;<strong>(1)</strong></p>'
                           % ("ABCDE"[k], sub(opts[k], d)))
                out.append('<p class="scheme">%s</p>' % sub(q.get("mi", ""), d))
                if q.get("wrong"):
                    out.append('<p class="scheme"><strong>Common wrong answers.</strong> %s</p>'
                               % sub(q["wrong"], d))
            elif q["type"] == "open":
                out.append('<p class="scheme">%s</p>' % sub(q.get("mi", ""), d))
            else:
                for p in q["parts"]:
                    out.append('<p class="scheme">%s%s '
                               '&nbsp;<strong>(%d)</strong><br>%s</p>'
                               % ("" if p["id"] == "_" else "<strong>(%s)</strong> &nbsp;" % p["id"],
                                  sub(p["ask"], d), p["marks"], sub(p["mi"], d)))
            out.append('<p class="parent">Source: %s</p></div>'
                       % sub(q.get("parent", ""), d))
            body.append("".join(out))

    return ("""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>%(topic)s — %(short)s — Marking Instructions</title><style>%(css)s</style></head><body>
<h1>%(course)s · %(topic)s</h1>
<p class="sub">%(short)s — Marking Instructions · %(marks)s marks · suggested %(minutes)s minutes</p>
<h2>Coverage</h2>%(cover)s
%(body)s
<p class="foot">Generated from the test's source <code>.md</code> by <code>build.py</code>; every value is
computed, not typed. The pupil sits this test at
<code>%(pageurl)s</code>, which
carries the same mark scheme. Questions are adapted from %(sourcenote)s —
past papers and marking instructions &copy; Qualifications Scotland (SQA), reproduced and
adapted for educational use — or original to this programme. Diagrams drawn for this test,
&copy; R Stewart, 2026.</p>
</body></html>""" % {"course": meta["course"], "topic": meta["topic"],
                     "short": meta["short"], "marks": meta["marks"],
                     "minutes": meta["minutes"], "css": MI_CSS % PROFILE["mi_palette"],
                     "cover": cover, "body": "".join(body),
                     "pageurl": PROFILE["page_url"],
                     "sourcenote": PROFILE["source_note"]})

