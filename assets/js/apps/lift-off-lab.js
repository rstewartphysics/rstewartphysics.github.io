/* A1 Lift-off Lab — forces on a rocket at lift-off, drawn to scale (WidgetKit.forceArrows).
   Load after widget-kit.js, both with defer. Markup: _includes/lift-off-lab.html. */
(function () {
  "use strict";
  function start() {
    var K = window.WidgetKit, root = document.getElementById("liftOffLab");
    if (!K || !root) { return; }
    var $ = function (id) { return document.getElementById(id); };
    // data sheet values (N/kg)
    var PLACES = { earth: ["Earth", 9.8], moon: ["Moon", 1.6], mars: ["Mars", 3.7] };
    var FUEL = 0.6, BURN_TIME = 10;          // fuel is 60% of lift-off mass, burnt in 10 s
    var MAX_F = 60000, MAX_LEN = 150;        // fixed scale: 60 kN = 150 px, so every setting is to scale
    var arrows = K.forceArrows($("lol-draw"), { scale: MAX_LEN / MAX_F });
    var burnt = 0, lastM = null, sim = null, used = false;

    function n(x) { return Math.round(x).toLocaleString("en-GB").replace(/,/g, "\u202f"); }
    function kn(x) { return K.si(x, "N"); }
    function fuelLeft(m0) { return Math.max(0, 1 - burnt / (FUEL * m0)); }

    // Steps the model 4 s ahead from now: from rest, thrust fixed; with burn, mass falls at the burn rate
    // until the fuel runs out. On the pad until thrust beats weight (weight only falls, so it never lands again).
    function ahead(m, m0, T, g, burn) {
      var rate = burn ? FUEL * m0 / BURN_TIME : 0, mDry = m0 * (1 - FUEL);
      var dt = 0.001, v = 0, out = [];
      for (var i = 1; i <= 4000; i++) {
        var F = Math.max(0, T - m * g), a = F / m;
        v += a * dt;
        m = Math.max(mDry, m - rate * dt);
        if (i % 1000 === 0) { out.push({ m: m, a: Math.max(0, T - m * g) / m, v: v }); }
      }
      return out;
    }

    function render(s) {
      var m0 = s.m;
      if (lastM !== null && m0 !== lastM) { burnt = 0; if (clock.running()) { clock.pause(); showBurning(false); } }
      lastM = m0;
      var place = PLACES[s.place] || PLACES.earth, g = place[1];
      var m = m0 - burnt, T = Math.round(s.T * 1000), W = Math.round(m * g * 100) / 100;
      var lifts = T - W > 0.005, F = lifts ? T - W : 0, a = F / m;

      arrows.draw([
        { key: "thrust", value: T, dir: "up", at: { x: 200, y: 195 }, cls: "c3", label: "thrust " + kn(T) },
        { key: "weight", value: W, dir: "down", at: { x: 200, y: 195 }, label: "weight " + kn(W) },
        { key: "unbal", value: F, dir: "up", at: { x: 310, y: 195 }, cls: "c1", dashed: true,
          label: "unbalanced " + (F > 0 ? kn(F) : "0 N") }
      ]);

      $("lol-place").textContent = place[0] + " · g = " + g + " N/kg";
      var left = fuelLeft(m0);
      $("lol-fuel").setAttribute("y", (160 + 104 * (1 - left)).toFixed(1));
      $("lol-fuel").setAttribute("height", (104 * left).toFixed(1));
      $("lol-fuel-left").textContent = Math.round(left * 100) + "%";
      var fl = T / MAX_F;
      $("lol-flame").setAttribute("d", fl > 0 ? "M64 276 L73 " + (276 + 18 * fl).toFixed(1) + " L82 276 Z" : "M73 276 Z");

      $("lol-w").textContent = kn(W);
      $("lol-f").textContent = kn(F);
      $("lol-a").textContent = K.fmt(a) + " m s⁻²";
      $("lol-mnow").textContent = n(m) + " kg";
      var rows = ahead(m, m0, T, g, s.burnTable === "on");
      rows.forEach(function (r, i) {
        $("lol-m" + (i + 1)).textContent = n(r.m);
        $("lol-a" + (i + 1)).textContent = K.fmt(r.a);
        $("lol-v" + (i + 1)).textContent = K.fmt(r.v);
      });
      var rate = n(FUEL * m0 / BURN_TIME);
      $("lol-speed-note").innerHTML = s.burnTable === "on"
        ? (rows[3].v > 0
          ? "The engines burn " + rate + " kg of fuel every second. The mass and the weight fall, so the unbalanced force and the acceleration grow. The speed gained each second grows too."
          : "The engines burn " + rate + " kg of fuel every second, but in 4 s the weight is still not below the thrust. It stays on the pad.")
        : (lifts
          ? "Mass kept the same: <var>v</var> = <var>a</var> × <var>t</var>. It gains " + K.fmt(a) + " m s<sup>−1</sup> every second."
          : "It does not lift off, so its speed stays at 0.");
      var steps = [
        "<b>Thrust</b> " + s.T + " kN = " + n(T) + " N",
        "<b>Weight</b> <var>W</var> = <var>mg</var> = " + n(m) + " × " + g + " = " + n(W) + " N"
      ];
      if (lifts) {
        steps.push("<b>Unbalanced force</b> <var>F</var> = thrust − weight = " + n(T) + " − " + n(W) + " = " + n(F) + " N");
        steps.push("<b>Acceleration</b> <var>a</var> = <var>F</var> ÷ <var>m</var> = " + n(F) + " ÷ " + n(m) + " = <b>" + K.fmt(a) + " m s<sup>−2</sup></b>");
      }
      $("lol-steps").innerHTML = steps.map(function (x) { return "<li>" + x + "</li>"; }).join("");
      $("lol-status").textContent = T > W
        ? "Thrust is bigger than the weight, so there is an unbalanced force upwards. The rocket accelerates up."
        : Math.abs(T - W) <= 0.005
          ? "Thrust equals the weight. The forces are balanced, so the rocket does not accelerate. It stays on the pad."
          : "Thrust is smaller than the weight. There is no unbalanced force upwards, so the rocket stays on the pad.";
      root.classList.toggle("is-flying", lifts);
    }

    var burnBtn = $("lol-burn");
    // the burn button is driven here, not by clock's own button, so it keeps its own words
    function showBurning(on) {
      burnBtn.setAttribute("aria-pressed", on ? "true" : "false");
      burnBtn.textContent = on ? "Pause burn" : "Burn fuel";
      $("lol-outs").setAttribute("aria-busy", on ? "true" : "false");
    }
    var clock = K.clock({
      onFrame: function (dt) {
        var m0 = sim.state.m, fuel = FUEL * m0;
        burnt = Math.min(fuel, burnt + fuel * dt / BURN_TIME);
        if (burnt >= fuel) { clock.pause(); showBurning(false); }
        sim.refresh();
      }
    });
    burnBtn.addEventListener("click", function () {
      if (clock.running()) { clock.pause(); showBurning(false); return; }
      if (fuelLeft(sim.state.m) <= 0) { burnt = 0; }
      clock.play(); showBurning(true);
    });
    $("lol-refuel").addEventListener("click", function () { clock.pause(); showBurning(false); burnt = 0; sim.refresh(); });

    sim = K.liveSim(root, { render: render });
    function firstUse() {
      if (used) { return; }
      used = true;
      if (window.Progress && root.dataset.progId) { window.Progress.markSeen(root.dataset.progId); }
    }
    root.querySelector(".sim-stage").addEventListener("input", firstUse);
    root.querySelector(".sim-stage").addEventListener("click", firstUse);
    var predict = $("lol-predict");
    K.poeCard(predict, { answer: "pad" });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }
})();
