/* Shaderfield site demos: one stage per motion helper. Not needed in your project; shaderfield.js is the library. */
(function () {
  const M = () => window.Shaderfield.motion;
  const INK = "#f2f2f4", MUTE = "#a4a6b0", DIM = "#7d7f89", ACC = "#34d399";
  const wait = (s) => new Promise(r => setTimeout(r, s * 1000));
  const stage = (el, big, html, extra) => {
    el.innerHTML = html;
    const pos = getComputedStyle(el).position === "static" ? "position:relative;" : "";
    el.style.cssText += `;font-size:${big ? 16 : 10}px;color:${INK};${pos}overflow:hidden;` + (extra || "");
    return (s) => el.querySelector(s);
  };
  const center = "display:flex;align-items:center;justify-content:center;";
  const D = [];
  const add = (d) => D.push(d);

  add({ id: "count-up", name: "Count Up", cat: "Text", from: "Tended HR · Closebook", desc: "Figures tween on an expo ease with tabular numerals so the width never jitters.",
    code: `Shaderfield.motion.countUp(el, { to: 4212.5, decimals: 2, prefix: "€", duration: 1.6 });`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;align-items:center;gap:0.6em"><div style="font-size:1.1em;color:${MUTE}">Net pay · March</div><div data-t style="font-size:5em;font-weight:500;letter-spacing:-0.04em">€0.00</div></div>`, center);
      return { play: () => M().countUp(q("[data-t]"), { to: 4212.5, decimals: 2, prefix: "€" }) }; } });

  add({ id: "tick-pop", name: "Tick Pop", cat: "Interface", from: "Tended HR · Closebook", desc: "A filled check pops out of an empty ring with a little overshoot. Staggered down a checklist.",
    code: `items.forEach((row, i) =>\n  Shaderfield.motion.tick(row.querySelector(".tick"), { color: "#34d399", delay: i * 0.55 })\n);`,
    build(el, big) { const items = ["Contract signed", "Laptop shipped", "Buddy intro with Leo", "Team lunch booked"];
      const q = stage(el, big, `<div style="display:flex;flex-direction:column;gap:0.9em;width:min(22em,80%)">${items.map(t => `<div style="display:flex;align-items:center;gap:0.9em;font-size:1.3em"><span data-k></span><span>${t}</span></div>`).join("")}</div>`, center);
      return { play: () => Promise.all([...el.querySelectorAll("[data-k]")].map((k, i) => M().tick(k, { color: ACC, delay: i * 0.5, size: big ? 26 : 18 }))) }; } });

  add({ id: "progress-bars", name: "Progress Bars", cat: "Interface", from: "Tended HR · Orfa Agents", desc: "A row of bars fills one after another, each on an expo ease.",
    code: `Shaderfield.motion.bars(el, { values: [1, 1, 1, 0.6], color: "#a78bfa", stagger: 0.28 });`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;gap:1em;width:min(26em,80%)"><div style="display:flex;justify-content:space-between;font-size:1.1em;color:${MUTE}"><span>Amara · scorecard</span><span>4 interviewers</span></div><div data-t></div></div>`, center);
      return { play: () => M().bars(q("[data-t]"), { values: [1, 1, 1, 0.6], color: "#a78bfa", height: big ? 8 : 6 }) }; } });

  window.SFDemos = D;
})();
