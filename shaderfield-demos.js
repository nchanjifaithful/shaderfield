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

  add({ id: "letter-rise", name: "Letter Rise", cat: "Text", from: "Gloww · Blastlabs · Closebook", desc: "Each letter rises through its own mask on an expo ease. Works well for wordmarks and short headlines.",
    code: `Shaderfield.motion.rise(el, { by: "char", stagger: 0.045, duration: 1.1 });\n// exit: Shaderfield.motion.rise(el, { by: "char", out: true });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:5.4em;font-weight:500;letter-spacing:-0.05em;line-height:1">Shaderfield</div>`, center); return { play: () => M().rise(q("[data-t]"), { by: "char" }) }; } });

  add({ id: "word-rise", name: "Word Rise", cat: "Text", from: "Orfa Agents Launch", desc: "Words roll up through masks one after another, and roll out the same way.",
    code: `Shaderfield.motion.rise(el, { by: "word", stagger: 0.07, duration: 0.6 });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:3em;font-weight:600;letter-spacing:-0.035em;line-height:1.1;max-width:13em;padding:0 1em">The control room for AI agents.</div>`, center);
      return { play: async () => { await M().rise(q("[data-t]"), { by: "word" }); await wait(1); await M().rise(q("[data-t]"), { by: "word", out: true, stagger: 0.04, duration: 0.45 }); return M().rise(q("[data-t]"), { by: "word" }); } }; } });

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

  add({ id: "iris", name: "Iris", cat: "Transitions", from: "Orfa Agents · Dev Agency", desc: "The frame closes top and bottom to a hairline, the line pinches to the centre, then everything reopens. A shutter variant closes vertically only.",
    code: `await Shaderfield.motion.iris(stage, { content: scene, color: "#34d399" });\nawait Shaderfield.motion.iris(stage, { content: scene, open: true });\n// Shaderfield.motion.iris(stage, { shutter: true });`,
    build(el, big) { const q = stage(el, big, `<div data-c style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:1px;background:rgba(242,242,244,0.1)">${["Triage inbox", "Refactor auth", "Write release notes", "Fix flaky test", "Update pricing", "Migrate DB"].map(t => `<div style="background:#0a0a0a;padding:1em;font-size:1.2em;display:flex;align-items:flex-end">${t}</div>`).join("")}</div>`);
      return { play: async () => { await M().iris(el, { content: q("[data-c]"), color: ACC }); await wait(0.4); return M().iris(el, { content: q("[data-c]"), color: ACC, open: true }); } }; } });

  const loopDemo = (start) => { let s = null; return { play: () => { if (!s) s = start(); return wait(2.5); }, stop: () => { s && s(); s = null; } }; };

  add({ id: "type-swap", name: "Type Swap", cat: "Text", from: "Signpost Typewriter", desc: "The last word deletes letter by letter, a beat passes, the next one types in. The caret blinks only while idle.",
    code: `Shaderfield.motion.typeSwap(el, ["BRANDS", "APPS", "LOGOS", "WEBSITES"], {\n  caret: "bar", caretColor: "#f59e0b", hold: 1.6\n});`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;gap:0.6em;padding:0 2.4em"><div style="font-size:1.6em;font-weight:700;letter-spacing:-0.03em">We design</div><div data-t style="font-size:5em;font-weight:800;letter-spacing:-0.045em;line-height:1;height:1.1em"></div></div>`, "display:flex;align-items:center;");
      return loopDemo(() => M().typeSwap(q("[data-t]"), ["BRANDS", "APPS", "LOGOS", "IDENTITIES", "WEBSITES"], { caretColor: "#f59e0b" })); } });

  add({ id: "pop", name: "Pop", cat: "Text", from: "Product Video", desc: "Letters rise, overshoot their scale and sharpen out of a blur. The exit flies them up and away.",
    code: `Shaderfield.motion.pop(el, { by: "char", stagger: 0.04 });\nShaderfield.motion.pop(el, { out: true });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:5.4em;font-weight:600;letter-spacing:-0.04em">Antithesis</div>`, center);
      return { play: async () => { await M().pop(q("[data-t]")); await wait(0.9); await M().pop(q("[data-t]"), { out: true }); return M().pop(q("[data-t]")); } }; } });

  window.SFDemos = D;
})();
