/* ============================================================================
   Test bench — part models, real-life spread and the class meter
   ----------------------------------------------------------------------------
   Every part on a bench board is a real part (BENCH-PLAN §2.1). Each quantity
   is drawn once, at random within its tolerance, when the board loads, and kept
   for the whole job so readings repeat. A draw is a number u in [0, 1) per
   quantity, keyed by the part and the quantity, so adding a part never shifts
   another part's values. Seeds "lo", "mid" and "hi" give the corner boards the
   tests also run (every u = 0, 0.5 or 1).

   Runs in the browser and under Node (tb-tests.js). No dependencies.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB = root.TB || {};

  /* ------------------------------------------------------------ the draws */

  function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^ h >>> 16) >>> 0;
  }
  function mulberry(a) {
    return function () {
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const CORNER = { lo: 0, mid: 0.5, hi: 1 };

  /* draws(seed).u("R1.tol") is the same number every time for that seed. */
  function draws(seed) {
    seed = String(seed);
    if (seed in CORNER) return { seed, u: () => CORNER[seed] };
    return { seed, u: key => mulberry(hash(seed + "|" + key))() };
  }
  /* A stream for things that change on every touch (contact resistance, the
     last digit flicking). Separate from the board's draws. */
  function stream(seed) { return mulberry(hash(String(seed) + "|stream")); }

  const span = (u, lo, hi) => lo + (hi - lo) * u;

  /* ----------------------------------------------------- resistor colours */

  const COLOURS = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"];

  /* Four-band code, gold (±5 %) fourth. 270 kΩ -> [2, 7, 4]. */
  function bandsOf(ohms) {
    let m = 0, v = ohms;
    while (v >= 100 - 1e-9) { v /= 10; m++; }
    while (v < 10 - 1e-9) { v *= 10; m--; }
    v = Math.round(v);
    if (v === 100) { v = 10; m++; }
    return [Math.floor(v / 10), v % 10, m];
  }
  const valueOfBands = b => (b[0] * 10 + b[1]) * Math.pow(10, b[2]);

  function ohmsText(r) {
    if (r >= 1e6) return +(r / 1e6).toPrecision(3) + " MΩ";
    if (r >= 1e3) return +(r / 1e3).toPrecision(3) + " kΩ";
    return +r.toPrecision(3) + " Ω";
  }
  function faradsText(c) {
    if (c >= 1e-6) return +(c * 1e6).toPrecision(3) + " µF";
    return +(c * 1e9).toPrecision(3) + " nF";
  }

  /* ---------------------------------------------------------- part models
     draw(value, u, id) -> the real part's parameters. `value` is the nominal
     value printed on it (or read from its bands); u(key) the board's draws. */

  const LED_COLOURS = {
    // forward volts at 10 mA. Plan §2: red 1.9 V, green 2.1 V; §2.1 red 1.82-2.05 V
    red:   { vf: [1.82, 2.05] },
    green: { vf: [2.00, 2.20] }
  };

  /* Pin roles from the data sheets (the engine's GATES table, sbd-engine.js). */
  const QUAD = [[["1", "2"], "3"], [["4", "5"], "6"], [["9", "10"], "8"], [["12", "13"], "11"]];
  const HEX = [[["1"], "2"], [["3"], "4"], [["5"], "6"], [["9"], "8"], [["11"], "10"], [["13"], "12"]];
  const LOGIC = { and: v => v.every(Boolean), nand: v => !v.every(Boolean), not: v => !v[0] };
  const CHIP_PRINT = { hc08: "74HC08", hc00: "74HC00", hc04: "74HC04" };
  function hc(kind) {
    const gates = (kind === "not" ? HEX : QUAD).map(([ins, out]) => ({ ins, out }));
    return {
      pins: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
      build: "hc", kind, gates, logic: LOGIC[kind],
      draw(value, u, id) {
        const pick = {};
        for (const g of gates) for (const p of g.ins) pick[p] = {
          f1: span(u(id + ".f1." + p), 0.6, 1.3), f2: span(u(id + ".f2." + p), 2.0, 3.1),
          p1: span(u(id + ".p1." + p), 0, 6.283), p2: span(u(id + ".p2." + p), 0, 6.283)
        };
        return { kth: span(u(id + ".kth"), 0.45, 0.55), roh: span(u(id + ".roh"), 35, 60),
                 rol: span(u(id + ".rol"), 25, 45), rpick: 5e6, pick };
      }
    };
  }
  /* What a floating input picks up at time t (s). */
  const pickup = (pk, t) => 2.8 + 1.5 * (0.6 * Math.sin(6.283 * pk.f1 * t + pk.p1) + 0.4 * Math.sin(6.283 * pk.f2 * t + pk.p2));

  const PARTS = {
    res: {
      pins: ["1", "2"],
      draw: (value, u, id) => ({ R: value * span(u(id + ".tol"), 0.95, 1.05) })
    },

    /* A Shockley diode plus a few ohms of bulk resistance. The slope (n·Vt about
       0.05 V) puts a red LED near 1.4 V at the 0.4 µA a 10 MΩ meter draws, which
       is why an LED that is "off" still drops volts (plan §2). */
    led: {
      pins: ["a", "k"],
      draw(value, u, id, spec) {
        const c = LED_COLOURS[spec.colour], vf = span(u(id + ".vf"), c.vf[0], c.vf[1]);
        const nvt = span(u(id + ".n"), 0.045, 0.050), rs = span(u(id + ".rs"), 4, 8);
        const is = 0.01 / Math.expm1((vf - 0.01 * rs) / nvt);
        return { colour: spec.colour, vf10: vf, nvt, rs, is };
      }
    },

    /* Radial electrolytic: ±10 % (teacher, 20 Oct 2026, P1), plus its leakage. */
    ecap: {
      pins: ["+", "-"],
      draw: (value, u, id) => ({
        C: value * span(u(id + ".tol"), 0.90, 1.10),
        Rleak: span(u(id + ".leak"), 2e6, 20e6) * (100e-6 / value)
      })
    },

    /* A slide switch (SPDT): the middle pin joins one outer pin or the other,
       through a few tens of milliohms of contact. */
    spdt: {
      pins: ["1", "c", "2"],
      draw: (value, u, id) => ({ rc: span(u(id + ".rc"), 0.01, 0.05) })
    },

    /* BC548 (Ebers–Moll), plan §2.1: β 110-450, VBE 0.62-0.72 V at 2 mA, and
       a few ohms in the collector so VCE(sat) is 0.05-0.20 V at buzzer currents. */
    npn: {
      pins: ["c", "b", "e"],
      draw(value, u, id) {
        const nvt = 0.0259, vbe = span(u(id + ".vbe"), 0.62, 0.72);
        return { nvt, is: 2e-3 / Math.exp(vbe / nvt), vbe2: vbe, bf: span(u(id + ".bf"), 110, 450),
                 br: span(u(id + ".br"), 2, 8), rc: span(u(id + ".rc"), 1.5, 5) };
      }
    },

    /* An active 5 V piezo buzzer (teacher, 21 Oct 2026, K1): it has its own
       oscillator inside, so it is not a resistor. A soft knee near 1.4-1.9 V,
       20-30 mA at 5 V, silent below about 3 V. Reversed, only a leak flows. */
    buzzer: {
      pins: ["+", "-"],
      draw(value, u, id) {
        const nvt = 0.2, vk = span(u(id + ".vk"), 1.4, 1.9), i5 = span(u(id + ".i5"), 0.020, 0.030);
        const is = 1e-3 / Math.expm1(vk / nvt), vd5 = nvt * Math.log(i5 / is + 1);
        return { nvt, is, rs: (5 - vd5) / i5, i5, vsound: span(u(id + ".vs"), 2.8, 3.2),
                 rleak: span(u(id + ".leak"), 150e3, 400e3) };
      }
    },

    /* NORP12 LDR on flying leads (teacher, 22 Oct 2026, M5): under the lamp
       300-600 Ω; under its black cap 100 kΩ-1 MΩ. */
    ldr: {
      pins: ["1", "2"],
      draw: (value, u, id) => ({
        light: span(u(id + ".light"), 300, 600),
        covered: Math.exp(span(u(id + ".dark"), Math.log(100e3), Math.log(1e6)))
      })
    },

    /* The 5 V pump, off the board (K2): a small DC motor, 60-100 mA running.
       It turns once 30 mA flows. */
    pump: {
      pins: ["1", "2"],
      draw: (value, u, id) => ({ R: span(u(id + ".r"), 50, 80), run: 0.03 })
    },

    /* 74HC chips. Outputs switch to pin 14 or pin 7 through tens of ohms; an
       input switches at about half the supply and draws nothing. An input
       joined to nothing picks up the board around it (plan §2: "drifts"), shown
       here as a source of 1.3-4.3 V that wanders, behind 5 MΩ: a 10 kΩ pull-
       down holds it under 0.01 V; a meter on it reads 1-3 V and wanders; the
       gate behind it switches on its own. Unpowered, the chip is dead
       (teacher, 22 Oct 2026, M2). */
    hc08: hc("and"), hc00: hc("nand"), hc04: hc("not"),

    /* The bench supply: "5 V" is 4.95-5.08 V and sags 0.01-0.03 V on load. */
    supply: {
      draw: (value, u, id) => ({ V: span(u(id + ".v"), 4.95, 5.08), Rint: span(u(id + ".rint"), 0.6, 1.6) })
    },

    /* NE555, bipolar. Output HIGH sits 1.15-1.5 V below the supply on our load
       (3.4-3.9 V), LOW about 0.1 V. Comparators at 1/3 and 2/3 of the supply
       (internal 3 × 5 kΩ divider). Reset below about 0.7 V. */
    ne555: {
      pins: ["1", "2", "3", "4", "5", "6", "7", "8"],
      draw: (value, u, id) => ({
        drop: span(u(id + ".drop"), 1.15, 1.50), roh: span(u(id + ".roh"), 8, 14),
        vol: span(u(id + ".vol"), 0.03, 0.06), rol: span(u(id + ".rol"), 5, 9),
        iq: span(u(id + ".iq"), 3e-3, 5e-3), rdis: span(u(id + ".rdis"), 8, 15),
        kth: (2 / 3) * span(u(id + ".kth"), 0.99, 1.01), ktr: (1 / 3) * span(u(id + ".ktr"), 0.99, 1.01),
        vreset: span(u(id + ".vrst"), 0.5, 0.9)
      })
    }
  };

  /* ------------------------------------------------------- the class meter
     The dial is the booklet's (b6fig.multimeter, ref/class-meter.js): the same
     positions in the same order. Each position: what the meter puts across its
     leads, and how the 3½-digit display shows the result.
       scale  display units per SI unit;  dp  decimal places shown.
     The display holds 1999 counts; past that it shows "1" (over range). */

  const DIAL = [].concat(
    ["200", "2k", "20k", "200k", "2M", "20M"].map(x => ["OHM", x]),
    ["D", "200m", "2", "20", "200", "1000"].map(x => ["DCV", x]),
    ["750", "200", "20", "2", "200m"].map(x => ["ACV", x]),
    ["20µ", "200µ", "2m", "20m", "200m", "2", "20"].map(x => ["ACA", x]),
    ["20", "2", "200m", "20m", "2m", "200µ", "20µ"].map(x => ["DCA", x]),
    [["hFE", ""]]).map(([g, r]) => g + (r ? " " + r : ""));

  const FMT = {
    "OHM 200": [1, 1], "OHM 2k": [1e-3, 3], "OHM 20k": [1e-3, 2], "OHM 200k": [1e-3, 1],
    "OHM 2M": [1e-6, 3], "OHM 20M": [1e-6, 2],
    "DCV D": [1e3, 0], "DCV 200m": [1e3, 1], "DCV 2": [1, 3], "DCV 20": [1, 2], "DCV 200": [1, 1], "DCV 1000": [1, 0],
    "ACV 750": [1, 0], "ACV 200": [1, 1], "ACV 20": [1, 2], "ACV 2": [1, 3], "ACV 200m": [1e3, 1],
    "DCA 20µ": [1e6, 2], "DCA 200µ": [1e6, 1], "DCA 2m": [1e3, 3], "DCA 20m": [1e3, 2], "DCA 200m": [1e3, 1],
    "DCA 2": [1, 3], "DCA 20": [1, 2],
    "ACA 20µ": [1e6, 2], "ACA 200µ": [1e6, 1], "ACA 2m": [1e3, 3], "ACA 20m": [1e3, 2], "ACA 200m": [1e3, 1],
    "ACA 2": [1, 3], "ACA 20": [1, 2],
    "hFE": [1, 0]
  };
  const FULL = { "DCV 1000": 1000, "ACV 750": 750 };   // these two read to their label, not 1999

  /* Ohms ranges drive a test current from 2.8 V through a range resistor; the
     diode position the same at about 1 mA. Shunt (burden) resistance per DCA range. */
  const OHM_RS = { "200": 2.8e3, "2k": 2.8e3, "20k": 18e3, "200k": 180e3, "2M": 1.8e6, "20M": 18e6 };
  const SHUNT = { "20µ": 10e3, "200µ": 1e3, "2m": 100, "20m": 10, "200m": 1, "2": 0.1, "20": 0.01 };

  /* What the meter puts between its red and black leads.
       { kind: "load", R }            voltmeter or ammeter: a resistance
       { kind: "source", V, R }       ohms and diode check: red is +
       { kind: "open" }               nothing joined (e.g. DCA with the red lead in V/Ω)
     socket: "V" (V/Ω), "A" (mA, fused), "20A". `lead` = both leads + contacts. */
  function meterElement(setting, socket, lead) {
    const [g, r] = setting.split(" ");
    if (socket === "A" || socket === "20A") {
      // the A sockets go straight to the shunt, whatever the dial says
      if (socket === "20A") return { kind: "load", R: SHUNT["20"] + lead };
      if (g === "DCA" || g === "ACA") return r === "20" ? { kind: "open" } : { kind: "load", R: SHUNT[r] + lead };
      return { kind: "load", R: 1 + lead };
    }
    if (g === "DCV" && r === "D") return { kind: "source", V: 2.8, R: 2.8e3 + lead };
    if (g === "DCV" || g === "ACV") return { kind: "load", R: 10e6 + lead };
    if (g === "OHM") return { kind: "source", V: 2.8, R: OHM_RS[r] + lead };
    return { kind: "open" };
  }

  /* 3½-digit display. `flick` moves the last digit by whole counts. */
  function display(setting, value, flick) {
    const f = FMT[setting];
    if (!f || !isFinite(value)) return "1";
    const [scale, dp] = f, counts = Math.round(value * scale * Math.pow(10, dp)) + (flick || 0);
    const limit = FULL[setting] ? FULL[setting] * Math.pow(10, dp) : 1999;
    if (Math.abs(counts) > limit) return counts < 0 ? "-1" : "1";
    const s = (Math.abs(counts) / Math.pow(10, dp)).toFixed(dp);
    return (counts < 0 ? "-" : "") + s;
  }

  /* What the meter reads, from the voltage across its leads and the current
     through it (red to black inside the meter). Returns the SI value. */
  function meterValue(setting, socket, v, i) {
    const [g] = setting.split(" ");
    const el = meterElement(setting, socket, 0);
    if (el.kind === "open") return 0;
    if (socket === "A" || socket === "20A") return g === "DCA" ? i : 0;
    if (g === "DCV") return v;
    if (g === "OHM") return i >= -1e-15 ? Infinity : v / -i;   // i runs black to red inside: out of red into the part
    return 0;   // ACV / ACA on a DC circuit; hFE with nothing in its socket
  }

  TB.parts = { draws, stream, span, PARTS, LED_COLOURS, COLOURS, CHIP_PRINT, pickup, bandsOf, valueOfBands, ohmsText, faradsText };
  TB.meter = {
    DIAL, FMT, element: meterElement, display, value: meterValue,
    BEEP_BELOW: 50,              // continuity: OHM 200 beeps below 50 Ω
    LEAD: [0.25, 0.6],           // both leads, per meter
    CONTACT: [0.05, 0.6],        // per touch
    groupOf: s => s.split(" ")[0], rangeOf: s => s.split(" ")[1] || ""
  };

  /* The logic probe, powered from its clips (plan §2): Hi above 2.0 V, Lo below
     0.8 V on TTL; 70 % / 30 % of its supply on CMOS. Dead below 4 V. The pulse
     LED stays lit 0.1 s after any change. Its tip sits at 35 % of its supply
     through 1 MΩ, between the Lo and Hi levels in either mode, so a point
     joined to nothing lights neither LED, as a real probe does. */
  TB.probe = { DRAW: 500, TIP: 1e6, BIAS: 0.35, MIN_SUPPLY: 4.0, PULSE: 0.1,
    TTL: [0.8, 2.0], CMOS: [0.3, 0.7] };

  /* An LED's look from its current. Below 20 µA it is too dim to see; up to
     1 mA a faint glow; above that, on. */
  TB.ledLook = { OFF_BELOW: 20e-6, ON_ABOVE: 1e-3 };

})(typeof globalThis !== "undefined" ? globalThis : this);
