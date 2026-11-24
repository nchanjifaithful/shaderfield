/* Shaderfield site demos: one stage per motion helper. Not needed in your project; shaderfield.js is the library. */
(function () {
  const M = () => window.Shaderfield.motion;
  const INK = "#f2f2f4", MUTE = "#a4a6b0", DIM = "#7d7f89";
  let ACC = "#0ea5e9", ACC2 = "#e0f2fe";
  const wait = (s) => new Promise(r => setTimeout(r, s * 1000));
  const stage = (el, big, html, extra) => {
    el.innerHTML = html;
    const pos = getComputedStyle(el).position === "static" ? "position:relative;" : "";
    el.style.cssText += `;font-size:${big ? 16 : 10}px;color:${INK};${pos}overflow:hidden;` + (extra || "");
    return (s) => el.querySelector(s);
  };
  const center = "display:flex;align-items:center;justify-content:center;";
  const D = [];
  const once = (fn) => { let r = null; return () => r || (r = Promise.resolve().then(fn).finally(() => { r = null; })); };
  const add = (d) => D.push(d);

  add({ id: "letter-rise", name: "Letter Rise", cat: "Text", from: "Gloww · Blastlabs · Closebook", desc: "Each letter rises through its own mask on an expo ease.",
    code: `Shaderfield.motion.rise(el, { by: "char", stagger: 0.045, duration: 1.1 });\n// exit: Shaderfield.motion.rise(el, { by: "char", out: true });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:5.4em;font-weight:500;letter-spacing:-0.05em;line-height:1">Shaderfield</div>`, center); return { play: () => M().rise(q("[data-t]"), { by: "char" }) }; } });

  add({ id: "word-rise", name: "Word Rise", cat: "Text", from: "Orfa Agents Launch", desc: "Words roll up through masks one after another, then roll out.",
    code: `Shaderfield.motion.rise(el, { by: "word", stagger: 0.07, duration: 0.6 });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:3em;font-weight:600;letter-spacing:-0.035em;line-height:1.1;max-width:13em;padding:0 1em">The control room for AI agents.</div>`, center);
      return { play: async () => { await M().rise(q("[data-t]"), { by: "word" }); await wait(0.6); await M().rise(q("[data-t]"), { by: "word", out: true, stagger: 0.04, duration: 0.45 }); return M().rise(q("[data-t]"), { by: "word" }); } }; } });

  add({ id: "line-rise", name: "Line Rise", cat: "Text", from: "App Features · Desktop Features", desc: "Each line rises from below its mask, then leaves upward.",
    code: `<div id="head">\n  <div>02 / Settings</div>\n  <div>Every setting,</div>\n  <div>one tap away.</div>\n</div>\n\nShaderfield.motion.lineRise(head);\nShaderfield.motion.lineRise(head, { out: true });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="display:flex;flex-direction:column;padding:0 2.4em"><div style="font-size:1.1em;color:${MUTE};margin-bottom:0.6em">02 / Settings</div><div style="font-size:3.6em;font-weight:600;letter-spacing:-0.045em;line-height:1.02">Every setting,</div><div style="font-size:3.6em;font-weight:600;letter-spacing:-0.045em;line-height:1.02">one tap away.</div></div>`, "display:flex;align-items:center;");
      return { play: async () => { await M().lineRise(q("[data-t]")); await wait(0.6); await M().lineRise(q("[data-t]"), { out: true }); return M().lineRise(q("[data-t]")); } }; } });

  add({ id: "cut-reveal", name: "Block Reveal", cat: "Text", from: "Dev Agency Services", desc: "A solid block wipes open, then its words roll up.",
    code: `Shaderfield.motion.stripes(section);\nShaderfield.motion.cut(label, { color: "#09090b" });\nShaderfield.motion.cut(title, { color: "#09090b", delay: 0.25 });`,
    build(el, big) { const q = stage(el, big, `<div style="position:absolute;inset:0;${center}flex-direction:column;gap:1em"><div data-a style="font-family:'Geist Mono',monospace;font-size:1em;text-transform:uppercase;letter-spacing:0.15em;color:#38bdf8;padding:0.4em 0.7em">Development studio</div><div data-b style="font-size:3.8em;font-weight:600;letter-spacing:-0.05em;padding:0.15em 0.4em 0.25em">We build software.</div></div>`); const stop = M().stripes(el);
      return { play: () => Promise.all([M().cut(q("[data-a]"), { color: "#0b0b0e" }), M().cut(q("[data-b]"), { color: "#0b0b0e", delay: 0.25 })]), stop }; } });

  add({ id: "type-log", name: "Type Log", cat: "Text", from: "Orfa Agents Launch", desc: "Log lines type out one by one and check off when done.",
    code: `Shaderfield.motion.typeLines(el, [\n  "Fetching repository",\n  "Running test suite",\n  "Opening pull request"\n], { accent: "#0ea5e9" });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-family:'Geist Mono',monospace;font-size:1.25em;width:min(26em,80%)"></div>`, center); const lines = ["Fetching repository", "Running test suite", "Patching 3 files", "Opening pull request"];
      const p = () => M().typeLines(q("[data-t]"), lines, { accent: ACC, perLine: 0.32, gap: 0.4 }); return { play: p }; } });

  add({ id: "count-up", name: "Count Up", cat: "Text", from: "Tended HR · Closebook", desc: "Numbers count up on an expo ease with steady-width digits.",
    code: `Shaderfield.motion.countUp(el, { to: 4212.5, decimals: 2, prefix: "€", duration: 1.6 });`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;align-items:center;gap:0.6em"><div style="font-size:1.1em;color:${MUTE}">Net pay · March</div><div data-t style="font-size:5em;font-weight:500;letter-spacing:-0.04em">€0.00</div></div>`, center);
      return { play: () => M().countUp(q("[data-t]"), { to: 4212.5, decimals: 2, prefix: "€", duration: 1.1 }) }; } });

  add({ id: "tick-pop", name: "Tick Pop", cat: "Interface", from: "Tended HR · Closebook", desc: "A check pops out of an empty ring with a little overshoot.",
    code: `items.forEach((row, i) =>\n  Shaderfield.motion.tick(row.querySelector(".tick"), { color: "#0ea5e9", delay: i * 0.55 })\n);`,
    build(el, big) { const items = ["Contract signed", "Laptop shipped", "Buddy intro with Leo", "Team lunch booked"];
      const q = stage(el, big, `<div style="display:flex;flex-direction:column;gap:0.9em;width:min(22em,80%)">${items.map(t => `<div style="display:flex;align-items:center;gap:0.9em;font-size:1.3em"><span data-k></span><span>${t}</span></div>`).join("")}</div>`, center);
      return { play: () => Promise.all([...el.querySelectorAll("[data-k]")].map((k, i) => M().tick(k, { color: ACC, delay: i * 0.5, size: big ? 26 : 18 }))) }; } });

  add({ id: "progress-bars", name: "Progress Bars", cat: "Interface", from: "Tended HR · Orfa Agents", desc: "Bars fill one after another on an expo ease.",
    code: `Shaderfield.motion.bars(el, { values: [1, 1, 1, 0.6], color: "#0ea5e9", stagger: 0.28 });`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;gap:1em;width:min(26em,80%)"><div style="display:flex;justify-content:space-between;font-size:1.1em;color:${MUTE}"><span>Amara · scorecard</span><span>4 interviewers</span></div><div data-t></div></div>`, center);
      return { play: () => M().bars(q("[data-t]"), { values: [1, 1, 1, 0.6], color: ACC, height: big ? 8 : 6 }) }; } });

  add({ id: "focus-card", name: "Focus Card", cat: "Interface", from: "Orfa Agents Launch", desc: "On hover, corner brackets snap in over a dot grid and spotlight.",
    code: `const stop = Shaderfield.motion.focusCard(card, { color: "#0ea5e9" });`,
    build(el, big) { const q = stage(el, big, `<div data-c style="position:relative;width:min(24em,78%);aspect-ratio:16/10;background:#0a0a0a;outline:1px solid rgba(242,242,244,0.1);padding:1.6em;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between"><div style="display:flex;justify-content:space-between;font-size:1em;color:${MUTE};text-transform:uppercase;letter-spacing:0.05em"><span>12 min</span><span style="font-family:'Geist Mono',monospace">agt_03</span></div><div style="font-size:1.9em;font-weight:500;letter-spacing:-0.02em">Refactor auth module</div></div>`, center);
      const stop = M().focusCard(q("[data-c]"), { color: ACC }); return { play: async () => { stop.set(1); await wait(1.6); stop.set(0); }, stop }; } });

  add({ id: "press-ripple", name: "Press Ripple", cat: "Interface", from: "Desktop Features · Closebook", desc: "A press squeezes the button and sends out layered ripples.",
    code: `const stop = Shaderfield.motion.pressable(button, {\n  depth: 0.06, spread: 2.6, rings: 3, center: true,\n  color: "rgba(9,9,11,0.45)", haloColor: "#f2f2f4"\n});\nstop.press(); // trigger from code`,
    build(el, big) { const q = stage(el, big, `<button data-b style="all:unset;cursor:pointer;display:flex;align-items:center;gap:0.6em;height:3.2em;padding:0 1.6em;border-radius:999px;background:${INK};color:#09090b;font-size:1.25em;font-weight:500">Dispatch 6 agents</button>`, center);
      const stop = M().pressable(q("[data-b]"), { color: "rgba(9,9,11,0.45)", haloColor: INK, center: true }); return { play: () => { stop.press(); return wait(0.9); }, stop }; } });

  add({ id: "signal-bars", name: "Signal Bars", cat: "Interface", from: "Desktop Features", desc: "Thin status bars grow in a staggered sweep to show uptime.",
    code: `Shaderfield.motion.signalBars(el, {\n  count: 32,\n  rows: [\n    { label: "API", state: "Operational", color: "#0ea5e9", filled: 32 },\n    { label: "Database", state: "Degraded", color: "#fbbf24", filled: 22 }\n  ]\n});`,
    build(el, big) { const q = stage(el, big, `<div data-t style="width:min(28em,82%);font-size:1.05em"></div>`, center); const n = big ? 40 : 28;
      return { play: () => M().signalBars(q("[data-t]"), { count: n, height: big ? 30 : 22, rows: [{ label: "API", state: "Operational", color: ACC, filled: n }, { label: "Database", state: "Degraded", color: "#fbbf24", filled: Math.round(n * 0.7) }, { label: "Storage", state: "Operational", color: ACC, filled: n }] }) }; } });

  add({ id: "tab-morph", name: "Tab Morph", cat: "Interface", from: "App Features Video", desc: "The active icon tab springs open to show its label.",
    code: `const tabs = Shaderfield.motion.tabMorph(el, { tabs: ["Dashboard", "Notifications", "Settings"] });\ntabs.set(2);`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:${big ? 14 : 11}px"></div>`, center); const stop = M().tabMorph(q("[data-t]"), { tabs: ["Dashboard", "Notifications", "Settings", "Changelog", "Security"] });
      const iv = setInterval(() => { if (!stop.user) stop.next(); }, 1600); return { play: () => stop.next(), stop: () => { clearInterval(iv); stop(); } }; } });

  add({ id: "masked-scroll", name: "Masked Scroll", cat: "Interface", from: "Desktop Features · App Features", desc: "A list glides under a fade mask so rows dissolve at the edge.",
    code: `<div id="viewport" style="height:220px"><div>…rows…</div></div>\n\nconst stop = Shaderfield.motion.maskedScroll(viewport, { duration: 2, hold: 1.2 });`,
    build(el, big) { const rows = ["Deploy finished", "New comment on PR #42", "Invoice paid", "Agent 02 done", "Weekly report ready", "2 new sign-ups", "Backup complete", "Storage at 80%", "Payout scheduled", "New device sign-in"];
      const q = stage(el, big, `<div data-v style="height:68%;width:min(24em,80%)"><div style="display:flex;flex-direction:column;gap:0.3em">${rows.map(r => `<div style="padding:0.7em 0.8em;border-radius:0.6em;background:#141418;font-size:1.15em">${r}</div>`).join("")}</div></div>`, center);
      const stop = M().maskedScroll(q("[data-v]")); return { play: () => {}, stop }; } });

  add({ id: "pen-trail", name: "Pen Trail", cat: "Interface", from: "Drawing Cursor Film", desc: "A pen leaves a fading, tapering stroke and reveals a wordmark.",
    code: `const stop = Shaderfield.motion.penTrail(stage, {\n  color: "#0ea5e9", width: 6, fade: 0.9,\n  reveal: wordmark        // optional: masked in behind the pen\n});`,
    build(el, big) { const q = stage(el, big, `<div data-w style="position:absolute;inset:0;${center}font-size:5em;letter-spacing:-0.05em;white-space:nowrap">Shaderfield</div>`, "background:#0b0b0e;color:#fff;cursor:none;");
      const stop = M().penTrail(el, { color: ACC, width: big ? 6 : 3.5, reveal: q("[data-w]") }); return { play: () => stop.reset(), stop }; } });

  add({ id: "iris", name: "Iris Close", cat: "Transitions", from: "Orfa Agents · Dev Agency", desc: "A card closes to a hairline, pinches to the centre, then reopens.",
    code: `await Shaderfield.motion.iris(card, { content: scene, color: "#0ea5e9" });\nawait Shaderfield.motion.iris(card, { content: scene, open: true });\n// Shaderfield.motion.iris(card, { shutter: true });`,
    build(el, big) { const q = stage(el, big, `<div data-f style="position:absolute;inset:14% 16%;border-radius:0.8em;overflow:hidden;background:#0a0a0c;outline:1px solid rgba(242,242,244,0.14)"><div data-c style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:1px;background:rgba(242,242,244,0.1)">${["Triage inbox", "Refactor auth", "Write release notes", "Fix flaky test", "Update pricing", "Migrate DB"].map(t => `<div style="background:#0a0a0a;padding:0.8em;font-size:1em;display:flex;align-items:flex-end">${t}</div>`).join("")}</div></div>`);
      return { play: async () => { const f = q("[data-f]"); await M().iris(f, { content: q("[data-c]"), color: ACC }); await wait(0.4); return M().iris(f, { content: q("[data-c]"), color: ACC, open: true }); } }; } });

  add({ id: "line-draw", name: "Line Draw", cat: "Transitions", from: "Dev Agency · Gloww · Shader Trials", desc: "A hairline frame and an underline draw themselves in.",
    code: `Shaderfield.motion.drawFrame(box, { color: "#0ea5e9" });\nShaderfield.motion.drawLine(rule, { delay: 0.4 });`,
    build(el, big) { const q = stage(el, big, `<div data-f style="position:absolute;inset:12%;${center}flex-direction:column;gap:1.2em"><div style="font-size:4em;font-weight:500;letter-spacing:-0.05em">Gloww</div><div style="width:14em;display:flex;flex-direction:column;gap:0.8em"><div data-l style="height:2px;background:${ACC};transform:scaleX(0)"></div><div style="font-family:'Geist Mono',monospace;font-size:1em;letter-spacing:0.14em;text-transform:uppercase;color:${ACC}">Coming soon</div></div></div>`);
      return { play: () => Promise.all([M().drawFrame(q("[data-f]"), { color: ACC }), M().drawLine(q("[data-l]"), { delay: 0.4 })]) }; } });

  add({ id: "stripe-wipe", name: "Stripe Wipe", cat: "Transitions", from: "Dev Agency Services", desc: "Diagonal stripes wipe in from the left and keep drifting.",
    code: `const stop = Shaderfield.motion.stripes(section, { angle: -60, gap: 13, drift: 10 });`,
    build(el, big) { stage(el, big, `<div style="position:absolute;inset:0;${center}"><div style="font-family:'Geist Mono',monospace;font-size:1.3em;letter-spacing:0.04em;color:${MUTE};background:#0b0b0e;padding:0.5em 0.8em">Software for teams that ship</div></div>`); let stop = M().stripes(el);
      return { play: () => { stop(); stop = M().stripes(el); }, stop: () => stop() }; } });

  add({ id: "camera-push", name: "Camera Push", cat: "Transitions", from: "Orfa Agents · Closebook · Desktop Features", desc: "The layout scales and pans until one element fills the frame.",
    code: `await Shaderfield.motion.cameraPush(world, targetCard, { scale: 2.4, back: true });`,
    build(el, big) { const q = stage(el, big, `<div data-w style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:0.8em;padding:1.2em;box-sizing:border-box">${["Triage inbox", "Refactor auth", "Release notes", "Fix flaky test", "Update pricing", "Migrate DB"].map((t, i) => `<div ${i === 4 ? "data-target" : ""} style="background:#121216;border-radius:0.6em;padding:0.9em;font-size:1.1em;display:flex;flex-direction:column;justify-content:space-between;outline:1px solid ${i === 4 ? ACC : "rgba(242,242,244,0.08)"}"><span style="color:${MUTE};font-size:0.8em">agt_0${i + 1}</span><span>${t}</span></div>`).join("")}</div>`);
      return { play: () => M().cameraPush(q("[data-w]"), q("[data-target]"), { scale: 2.2, back: true }) }; } });

  add({ id: "push-through", name: "Push Through", cat: "Transitions", from: "Document AI Teaser", desc: "The scene zooms toward one point while it blurs away.",
    code: `await Shaderfield.motion.pushThrough(scene, { origin: card, scale: 2.4, blur: 16 });\nawait Shaderfield.motion.pushThrough(scene, { reverse: true });`,
    build(el, big) { const q = stage(el, big, `<div data-w style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:0.8em;padding:1.2em;box-sizing:border-box">${["Triage inbox", "Refactor auth", "Release notes", "Fix flaky test", "Update pricing", "Migrate DB"].map((t, i) => `<div ${i === 1 ? "data-target" : ""} style="background:#121216;border-radius:0.6em;padding:0.9em;font-size:1.1em;display:flex;flex-direction:column;justify-content:space-between;outline:1px solid ${i === 1 ? ACC : "rgba(242,242,244,0.08)"}"><span style="color:${MUTE};font-size:0.8em">agt_0${i + 1}</span><span>${t}</span></div>`).join("")}</div>`);
      return { play: once(async () => { const w = q("[data-w]"); await M().pushThrough(w, { origin: q("[data-target]"), scale: 2.2, blur: 14 }); await wait(0.25); await M().pushThrough(w, { reverse: true }); }) }; } });

  add({ id: "flash", name: "Light Flash", cat: "Transitions", from: "Blastlabs Flow", desc: "The frame snaps to light on a hit, then falls off fast.",
    code: `Shaderfield.motion.flash(stage, { peak: 0.8, duration: 0.9 });`,
    build(el, big) { const q = stage(el, big, `<div data-s style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 50% 60%, ${ACC} 0%, #1e3a8a 45%, #050816 100%)"></div><div data-t style="position:absolute;inset:0;${center}font-size:6em;font-weight:600;letter-spacing:-0.05em">Blast</div>`);
      let on = true; const run = async () => { await wait(0.4); while (on) { const t = q("[data-t]"); t.style.transform = "scale(1.06)"; M().play(0.5, s => { t.style.transform = `scale(${(1.06 - 0.06 * M().ease.out(s / 0.5)).toFixed(4)})`; }); await M().flash(el, { peak: 0.85 }); await wait(0.8); } }; run();
      return { play: () => wait(0.1), stop: () => { on = false; } }; } });

  add({ id: "radial-reveal", name: "Radial Reveal", cat: "Transitions", from: "Kinetic Opening", desc: "Elements appear in a ring that grows from the centre.",
    code: `Shaderfield.motion.radialReveal(grid, { duration: 1.4, spread: 0.25 });`,
    build(el, big) { const n = big ? 24 : 16, m = big ? 12 : 9; const q = stage(el, big, `<div data-g style="position:absolute;inset:8%;display:grid;grid-template-columns:repeat(${n},1fr);grid-template-rows:repeat(${m},1fr);place-items:center">${Array.from({ length: n * m }, () => `<span style="width:4px;height:4px;border-radius:50%;background:${ACC};opacity:0"></span>`).join("")}</div>`);
      return { play: () => M().radialReveal(q("[data-g]")) }; } });

  add({ id: "footer-reveal", name: "Footer Reveal", cat: "Transitions", from: "Dev Agency Services", desc: "The page lifts away to reveal the footer underneath.",
    code: `Shaderfield.motion.underlayReveal(page, footer, { duration: 1.5 });\nShaderfield.motion.underlayReveal(page, footer, { reverse: true });`,
    build(el, big) { const q = stage(el, big, `<div data-u style="position:absolute;left:0;right:0;bottom:0;height:62%;background:${ACC};color:#0a0c0d;padding:1.4em;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;opacity:0"><div style="font-size:2em;font-weight:600;letter-spacing:-0.035em">Have something to build?</div><div style="font-size:4.4em;font-weight:600;letter-spacing:-0.06em;line-height:0.8">Studio</div></div><div data-p style="position:absolute;inset:0;background:#0b0b0e;${center}"><div style="font-size:2.6em;font-weight:600;letter-spacing:-0.04em">We build software.</div></div>`);
      return { play: async () => { await M().underlayReveal(q("[data-p]"), q("[data-u]"), { distance: el.clientHeight * 0.62 }); await wait(1); return M().underlayReveal(q("[data-p]"), q("[data-u]"), { distance: el.clientHeight * 0.62, reverse: true }); } }; } });

  const loopDemo = (start) => { let s = null; return { play: () => { if (!s) s = start(); return wait(2.5); }, stop: () => { s && s(); s = null; } }; };

  add({ id: "type-swap", name: "Type Swap", cat: "Text", from: "Signpost Typewriter", desc: "The last word deletes, then the next one types in.",
    code: `Shaderfield.motion.typeSwap(el, ["BRANDS", "APPS", "LOGOS", "WEBSITES"], {\n  caret: "bar", caretColor: "#0ea5e9", hold: 1.6\n});`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;gap:0.6em;padding:0 2.4em"><div style="font-size:1.6em;font-weight:700;letter-spacing:-0.03em">We design</div><div data-t style="font-size:5em;font-weight:800;letter-spacing:-0.045em;line-height:1;height:1.1em"></div></div>`, "display:flex;align-items:center;");
      return loopDemo(() => M().typeSwap(q("[data-t]"), ["BRANDS", "APPS", "LOGOS", "IDENTITIES", "WEBSITES"], { caretColor: ACC, hold: 1 })); } });

  add({ id: "roll-words", name: "Roll Words", cat: "Text", from: "Keep Marching", desc: "Each word pushes the last out with a per-letter roll.",
    code: `Shaderfield.motion.rollWords(el, ["Build", "ship", "repeat"], {\n  duration: 0.5, stagger: 0.025, hold: 0.75\n});`,
    build(el, big) { const q = stage(el, big, `<div data-t style="width:100%;font-size:5.4em;font-weight:800;letter-spacing:-0.05em;text-transform:uppercase"></div>`, center);
      return loopDemo(() => M().rollWords(q("[data-t]"), ["Build", "ship", "repeat"], { hold: 0.5 })); } });

  add({ id: "solve", name: "Scramble Solve", cat: "Text", from: "Keep Marching", desc: "Words roll in as scrambled glyphs, then resolve letter by letter.",
    code: `Shaderfield.motion.solve(el, { perWord: 0.55, solveAfter: 0.3 });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:2.7em;font-weight:800;letter-spacing:-0.05em;text-transform:uppercase;justify-content:center;max-width:9em;line-height:1.2">Keep marching forward</div>`, center);
      return { play: () => M().solve(q("[data-t]"), { perWord: 0.4, solveAfter: 0.2 }) }; } });

  add({ id: "pop", name: "Letter Pop", cat: "Text", from: "Product Video", desc: "Letters rise, overshoot and sharpen out of a blur.",
    code: `Shaderfield.motion.pop(el, { by: "char", stagger: 0.04 });\nShaderfield.motion.pop(el, { out: true });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:5.4em;font-weight:600;letter-spacing:-0.04em">Antithesis</div>`, center);
      return { play: async () => { await M().pop(q("[data-t]")); await wait(0.5); await M().pop(q("[data-t]"), { out: true }); return M().pop(q("[data-t]")); } }; } });

  add({ id: "lyric-flow", name: "Lyric Flow", cat: "Text", from: "Lyrics That Flow · Lyric Scroll", desc: "The current line lights up and the list glides to keep it centred.",
    code: `Shaderfield.motion.lyricFlow(el, lines, {\n  mode: "word",        // "line" or "word"\n  accent: "#0ea5e9", focus: 0.38\n});`,
    build(el, big) { const q = stage(el, big, `<div data-t style="position:absolute;inset:0 2em;font-size:2.6em;font-weight:700;letter-spacing:-0.02em;line-height:1.1"></div>`);
      return loopDemo(() => M().lyricFlow(q("[data-t]"), ["The current line stays bright", "Everything else fades back", "And the whole view glides up", "To keep your place in the song", "Thanks for watching"], { mode: "word", accent: ACC })); } });

  add({ id: "bracket-hop", name: "Bracket Hop", cat: "Interface", from: "Clause Film", desc: "Corner brackets spin between targets and snap open around each.",
    code: `Shaderfield.motion.bracketHop(stage, [...stage.querySelectorAll(".tile")], {\n  hold: 1.1, press: true\n});`,
    build(el, big) { const tiles = ["Formation", "Fundraising", "Contracts", "Hiring"].map(n => `<div data-k style="border:2px dashed rgba(255,255,255,0.27);padding:1em 1.2em;font-size:1.5em;font-weight:540">${n}</div>`).join("");
      const q = stage(el, big, `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.6em">${tiles}</div>`, center + "background:#0a1210;");
      return loopDemo(() => M().bracketHop(el, [...el.querySelectorAll("[data-k]")], { press: true })); } });

  add({ id: "bracket-cursor", name: "Bracket Cursor", cat: "Interface", from: "Clause Legal", desc: "The pointer becomes a reticle that snaps around links.",
    code: `<a href="#" data-magnetic>Book a call</a>\n\nconst stop = Shaderfield.motion.bracketCursor(document.body, {\n  spin: 90, pull: 0.08\n});`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;align-items:center;gap:1.6em"><div style="display:flex;align-items:center;gap:0.4em;font-size:1.25em;font-weight:540"><span data-magnetic style="padding:0.45em 0.8em">Services</span><span data-magnetic style="padding:0.45em 0.8em">Pricing</span><span data-magnetic style="padding:0.45em 0.9em;border-radius:999px;outline:1px solid rgba(255,255,255,0.3)">Book a call</span></div><div style="color:#7d7f89;font-size:1.05em">Move over the links</div></div>`, center + "background:#0a1210;");
      return loopDemo(() => M().bracketCursor(el)); } });

  add({ id: "color-index", name: "Color Index", cat: "Interface", from: "Color List", desc: "A project list steps row by row as the background changes colour.",
    code: `Shaderfield.motion.colorIndex(el, [\n  { name: "Aarzoo", badge: "Print Design", bg: "#ff0000" },\n  { name: "Eternal Echoes", badge: "Typography", bg: "#8b5cf6" }\n]);`,
    build(el, big) { const q = stage(el, big, `<div data-t style="position:absolute;inset:0;font-size:4.4em;letter-spacing:-0.05em;color:#000"></div>`);
      return loopDemo(() => M().colorIndex(q("[data-t]"), [{ name: "Aarzoo", badge: "Print Design", bg: "#ff0000" }, { name: "Lost Horizons", badge: "Concept Art", bg: "#ffffff" }, { name: "Eternal Echoes", badge: "Typography", bg: "#8b5cf6" }, { name: "Abstract Dimensions", badge: "Experimental Media", bg: "#e5389b" }, { name: "Silent Stories", badge: "Photography", bg: "#06b6d4" }, { name: "Fading Memories", badge: "Editorial Design", bg: "#10b981" }, { name: "Weekend", badge: "Sound Design", bg: "#adcaba" }])); } });

  add({ id: "disc-stack", name: "Disc Stack", cat: "Interface", from: "Cryptar Launch Portrait", desc: "Tilted discs cycle: the top one lifts away and returns at the back.",
    code: `Shaderfield.motion.discStack(el, ["a.jpg", "b.jpg", "#0ea5e9"], {\n  tilt: 58, hold: 1.1, surface: "#17171b", ring: "rgba(242,242,244,0.18)"\n});`,
    build(el, big) { stage(el, big, "", "background:radial-gradient(120% 90% at 50% 40%, #16161b, #09090b 70%);");
      const faces = [`radial-gradient(circle at 35% 30%, #ffffff66, transparent 45%), ${ACC}`, `radial-gradient(circle at 35% 30%, #ffffff66, transparent 45%), #facc15`, `radial-gradient(circle at 35% 30%, #ffffff66, transparent 45%), #ef4444`, `radial-gradient(circle at 35% 30%, #ffffff66, transparent 45%), #a855f7`];
      return loopDemo(() => M().discStack(el, faces, { size: Math.min(el.clientWidth, el.clientHeight) * 0.62, tilt: 58, hold: 1.1, surface: "#17171b", ring: "rgba(242,242,244,0.18)" })); } });

  add({ id: "shine", name: "Shine", cat: "Interface", from: "Product Video", desc: "A crisp glint sweeps across a button once.",
    code: `Shaderfield.motion.shine(button, { duration: 0.75 });`,
    build(el, big) { const q = stage(el, big, `<div data-b style="padding:0.8em 1.6em;border-radius:999px;background:${ACC};color:#06140d;font-size:1.8em;font-weight:600">Try it free</div>`, center);
      return { play: async () => { await wait(0.2); return M().shine(q("[data-b]")); } }; } });

  add({ id: "typing-dots", name: "Typing Dots", cat: "Interface", from: "Product Video", desc: "Three dots bounce in a wave while a reply is coming.",
    code: `const stop = Shaderfield.motion.typingDots(el, { size: 10, color: "#9a9a96" });`,
    build(el, big) { const q = stage(el, big, `<div style="padding:1em 1.3em;border-radius:1.2em;background:#1b1b20"><span data-d></span></div>`, center);
      return loopDemo(() => M().typingDots(q("[data-d]"), { size: big ? 12 : 8, color: "#9a9a96" })); } });

  add({ id: "shock", name: "Shock Ring", cat: "Transitions", from: "Product Video", desc: "A thin glowing ring bursts out from a point.",
    code: `Shaderfield.motion.shock(stage, x, y, { to: 300, duration: 0.7 });`,
    build(el, big) { stage(el, big, `<div style="width:1.2em;height:1.2em;border-radius:50%;background:#f2f2f4;font-size:1.6em"></div>`, center);
      return { play: async () => { const x = el.clientWidth / 2, y = el.clientHeight / 2, r = Math.min(x, y) * 0.9; M().shock(el, x, y, { to: r }); await wait(0.18); return M().shock(el, x, y, { to: r * 0.6, width: 2 }); } }; } });

  const card = (extra) => `border-radius:0.7em;background:rgba(242,242,244,0.05);outline:1px solid rgba(242,242,244,0.14);${extra || ""}`;

  add({ id: "glow-sheen", name: "Glow Sheen", cat: "Light", from: "Document AI Teaser", desc: "A bright band drifts through gradient text under a soft glow.",
    code: `const stop = Shaderfield.motion.glowText(word, {\n  colors: ["#0ea5e9", "#e0f2fe"], period: 3.6, glow: 16\n});`,
    build(el, big) { const q = stage(el, big, `<div style="font-size:4.6em;font-weight:600;letter-spacing:-0.04em;line-height:1.1;text-align:center;padding:0 0.6em">Stays <span data-t>private</span></div>`, center);
      return loopDemo(() => M().glowText(q("[data-t]"), { colors: [ACC, ACC2], glow: big ? 16 : 10 })); } });

  add({ id: "neon-type", name: "Neon Type", cat: "Text", from: "Document AI Teaser", desc: "Letters type on and flicker like neon before they hold.",
    code: `Shaderfield.motion.neonType(el, { cps: 26, glowColor: "#0ea5e9", hold: 1.2 });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:2.6em;font-weight:600;letter-spacing:-0.035em;line-height:1.1;text-align:center;max-width:76%;text-wrap:balance">Ship your next release</div>`, center);
      return { play: once(() => M().neonType(q("[data-t]"), { glowColor: ACC, cps: 34, hold: 0.6 })) }; } });

  add({ id: "focus-pull", name: "Focus Pull", cat: "Text", from: "Document AI Teaser", desc: "Text racks into focus out of a blur, by line or by letter.",
    code: `await Shaderfield.motion.focusPull(el);\nawait Shaderfield.motion.focusPull(el, { out: true });\nShaderfield.motion.focusPull(el, { by: "char", spread: 0.3 });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:3.4em;font-weight:600;letter-spacing:-0.04em;white-space:nowrap">Automatically.</div>`, center);
      return { play: once(async () => { const t = q("[data-t]"); await M().focusPull(t); await wait(0.4); await M().focusPull(t, { out: true }); await M().focusPull(t, { by: "char" }); }) }; } });

  add({ id: "track-in", name: "Track In", cat: "Text", from: "Document AI Teaser", desc: "A tagline tightens its letter spacing as it sharpens.",
    code: `Shaderfield.motion.trackIn(tagline, { from: 0.32, to: 0.02, duration: 0.8 });`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;flex-direction:column;align-items:center;gap:0.5em"><div style="font-size:4.4em;font-weight:600;letter-spacing:-0.045em;line-height:1">Fieldnote</div><div data-t style="font-size:1.6em;color:#c9cad1;white-space:nowrap">Notes that sort themselves</div></div>`, center);
      return { play: once(() => M().trackIn(q("[data-t]"), { duration: 0.6 })) }; } });

  add({ id: "click-cursor", name: "Click Cursor", cat: "Interface", from: "Document AI Teaser", desc: "A pointer arcs in, clicks, and fires sparks and a ripple.",
    code: `await Shaderfield.motion.clickCursor(stage, button, {\n  color: "#0ea5e9", size: 28,\n  onClick: () => {}   // runs on the press\n});`,
    build(el, big) { const q = stage(el, big, `<div data-b style="display:flex;align-items:center;gap:0.6em;padding:0.85em 1.7em;border-radius:999px;background:${ACC};color:#09090b;font-size:1.7em;font-weight:600;box-shadow:0 0 2.2em rgba(14,165,233,0.35)">Book a demo<span>→</span></div>`, center);
      return { play: once(async () => { await wait(0.15); const b = q("[data-b]"); return M().clickCursor(el, b, { color: ACC, size: big ? 30 : 20 }); }) }; } });

  add({ id: "scan-beam", name: "Scan Beam", cat: "Interface", from: "Document AI Teaser", desc: "A glowing scanline sweeps a card and lights up each field.",
    code: `<div id="doc">\n  <span data-scan>INV-2048</span>\n  …\n</div>\n\nawait Shaderfield.motion.scanBeam(doc, {\n  color: "#0ea5e9", duration: 0.9,\n  onHit: (item, i) => {}\n});`,
    build(el, big) { const rows = [["Vendor", "Harbor & Co"], ["Invoice no.", "INV-2048"], ["Date", "12 Mar 2026"], ["Total", "€504.00"]].map(([k, v]) => `<div style="display:flex;justify-content:space-between;gap:1.6em"><span style="color:#7d7f89">${k}</span><span data-scan style="color:#f2f2f4">${v}</span></div>`).join("");
      const q = stage(el, big, `<div data-d style="width:16em;padding:1.2em 1.3em;box-sizing:border-box;display:flex;flex-direction:column;gap:0.8em;font-size:1.2em;${card("border-radius:0.8em;")}"><div style="width:40%;height:0.5em;border-radius:1em;background:rgba(242,242,244,0.8);margin-bottom:0.2em"></div>${rows}</div>`, center);
      return { play: once(() => M().scanBeam(q("[data-d]"), { color: ACC, pad: big ? 4 : 3 })) }; } });

  add({ id: "wire-draw", name: "Wire Draw", cat: "Interface", from: "Document AI Teaser", desc: "Curved connectors draw from one element to several others.",
    code: `outputs.forEach((out, i) =>\n  Shaderfield.motion.wire(stage, hub, out, { color: "#0ea5e9", delay: i * 0.14 })\n);`,
    build(el, big) { const outs = ["JSON", "CSV", "Spreadsheet", "Webhook"].map(n => `<div data-k style="padding:0.5em 1em;font-size:1.3em;color:#e4e5ea;${card("border-radius:0.6em;")}">${n}</div>`).join("");
      const q = stage(el, big, `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 14%"><div data-h style="width:4.6em;height:4.6em;border-radius:50%;background:#121216;box-shadow:inset 0 0 0 1.5px ${ACC},0 0 1.4em ${ACC}55;display:flex;align-items:center;justify-content:center"><span style="width:1.1em;height:1.1em;border-radius:50%;background:${ACC}"></span></div><div style="display:flex;flex-direction:column;gap:0.8em">${outs}</div></div>`);
      return { play: once(async () => { if (el._sfWire) el._sfWire.textContent = ""; const h = q("[data-h]"); await Promise.all([...el.querySelectorAll("[data-k]")].map((k, i) => M().wire(el, h, k, { color: ACC, delay: i * 0.14, width: big ? 2 : 1.5 }))); }) }; } });

  add({ id: "pick-focus", name: "Pick Focus", cat: "Interface", from: "Document AI Teaser", desc: "All options pulse, then the chosen one lights up and the rest dim.",
    code: `await Shaderfield.motion.pickFocus(cards, 0, { color: "#0ea5e9", dim: 0.72 });\nShaderfield.motion.pickFocus(cards, -1); // reset`,
    build(el, big) { const opts = [["JSON", ".json"], ["CSV", ".csv"], ["Excel", ".xlsx"], ["XML", ".xml"]].map(([a, b]) => `<div data-k style="display:flex;justify-content:space-between;align-items:center;width:14em;padding:0.65em 1.1em;box-sizing:border-box;font-size:1.25em;${card()}"><span style="font-weight:600;color:#f2f2f4">${a}</span><span style="color:#7d7f89">${b}</span></div>`).join("");
      stage(el, big, `<div style="display:flex;flex-direction:column;gap:0.55em">${opts}</div>`, center);
      return { play: once(async () => { const ks = [...el.querySelectorAll("[data-k]")]; await M().pickFocus(ks, -1, { duration: 0.3, color: ACC }); await M().clickCursor(el, ks[0], { color: ACC, size: big ? 28 : 18, at: [0.6, 0.6], onClick: () => M().pickFocus(ks, 0, { color: ACC }) }); }) }; } });

  add({ id: "lock-click", name: "Lock Click", cat: "Interface", from: "Document AI Teaser", desc: "A padlock drops in, snaps shut, then turns into a check.",
    code: `await Shaderfield.motion.lockClick(el, {\n  size: 120, color: "#0ea5e9", tick: true\n});`,
    build(el, big) { const q = stage(el, big, `<div data-l></div>`, center);
      return { play: once(() => M().lockClick(q("[data-l]"), { size: big ? 220 : 110, color: ACC, tick: true })) }; } });

  add({ id: "impact-glow", name: "Impact Glow", cat: "Light", from: "Document AI Teaser", desc: "A halo behind an element flares each time something lands.",
    code: `const glow = Shaderfield.motion.glowHub(el, { color: "#0ea5e9", size: 1.9 });\nglow.hit();      // flare\nglow.hit(0.5);   // softer`,
    build(el, big) { const q = stage(el, big, `<div data-h style="width:13em;height:13em;border-radius:50%;background:#101013;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.2em"><span data-n style="font-size:2.2em;font-weight:600;letter-spacing:-0.03em;font-variant-numeric:tabular-nums">1,204</span><span style="font-size:1em;color:#7d7f89">fields read</span></div>`, center);
      const glow = M().glowHub(q("[data-h]"), { color: ACC }); let n = 1204;
      return { play: once(async () => { for (const s of [1, 0.6, 0.6, 1]) { glow.hit(s); n += 1; q("[data-n]").textContent = n.toLocaleString("en-US"); await wait(0.45); } }), stop: glow }; } });

  // ── Motion Tryouts ──
  const TILE = [["#2c2f36", "#141619", 18, 48], ["#202329", "#0f1114", 82, 26], ["#32353c", "#18191d", 42, 38], ["#25282e", "#121418", 90, 18], ["#2e3138", "#151619", 8, 56], ["#22252a", "#101113", 62, 32]];
  const tileBg = (i) => { const [a, b, x, k] = TILE[i % TILE.length]; return `radial-gradient(120% 85% at ${x}% 0%, color-mix(in srgb, ${ACC} ${k}%, transparent) 0%, transparent 62%), linear-gradient(170deg, ${a} 0%, ${b} 100%)`; };
  const remake = (n, text) => { if (n._base == null) n._base = n.getAttribute("style") || ""; const m = n.cloneNode(false); m._base = n._base; m.setAttribute("style", n._base); m.removeAttribute("aria-label"); delete m.dataset.sfText; m.textContent = text; n.replaceWith(m); return m; };
  const flipB = (q) => () => { const b = q("[data-b]"); b.style.visibility = b.style.visibility === "hidden" ? "" : "hidden"; };
  const MONO = "'Geist Mono',monospace", BG1 = "#0d0d10", BG2 = "#16161a", PANEL = "#121216", LINE = "rgba(242,242,244,0.1)";
  const H1 = "font-weight:600;letter-spacing:-0.04em;line-height:1.05;";
  const scene = (k, text, bg, col, hid, fs = 3.6) => `<div data-${k} style="position:absolute;inset:0;${center}text-align:center;background:${bg};color:${col};font-size:${fs}em;${H1}${hid ? "visibility:hidden;" : ""}">${text}</div>`;
  const swap2 = (a, b, bgB = BG2) => scene("a", a, BG1, INK) + scene("b", b, bgB, INK, true);

  add({ id: "glyph-write", name: "Glyph Write", cat: "Text", from: "Bllind Launch", desc: "Letters resolve left to right behind a short run of scrambled glyphs.",
    code: `Shaderfield.motion.glyphWrite(el, { front: 3, duration: 0.6 });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:${big ? 6 : 4}em;${H1}line-height:1.15">Shaderfield</div>`, center); return { play: once(() => M().glyphWrite(q("[data-t]"), { duration: 0.7 })) }; } });

  add({ id: "slam-in", name: "Slam In", cat: "Text", from: "Echoform · Kinetik · Bllind · Gridd", desc: "Oversized words fly in out of a blur, or drop from a giant zoom, then keep drifting.",
    code: `Shaderfield.motion.slamIn(line1, { from: "right" });\nShaderfield.motion.slamIn(line2, { from: "left", delay: 0.12 });\n// from: "left" | "right" | "up" | "down" | "zoom"`,
    build(el, big) { const L = "position:absolute;font-weight:700;letter-spacing:-0.055em;line-height:0.9;color:#09090b;white-space:nowrap;";
      const q = stage(el, big, `<div data-a style="${L}left:-0.05em;top:6%;font-size:8em">All feedback</div><div data-b style="${L}left:24%;top:52%;font-size:9em">one inbox</div>`, `background:${ACC};`); let s = [], n = 0;
      const go = () => { s.forEach(f => f()); const z = n++ % 2, dr = big ? 30 : 14; el.style.background = ACC; s = [M().slamIn(q("[data-a]"), { from: z ? "zoom" : "right", scale: 6, drift: dr }), M().slamIn(q("[data-b]"), { from: z ? "up" : "left", delay: 0.12, distance: z ? 500 : 1100, drift: dr })]; };
      return { play: () => { go(); return wait(1.6); }, stop: () => s.forEach(f => f()) }; } });

  add({ id: "kinetic", name: "Kinetic Letters", cat: "Text", from: "Gridd Launch", desc: "Letters orbit in and collapse into the word, settle off an arch, tumble about, or the words push apart.",
    code: `Shaderfield.motion.kinetic(el, { mode: "orbit" });\n// mode: "orbit" | "arch" | "jumble" | "spread"`,
    build(el, big) { const W = ["complicated", "freeing", "headache", "charging made simple"], MD = ["orbit", "arch", "jumble", "spread"]; let i = 0;
      const q = stage(el, big, `<div style="display:flex;flex-direction:column;align-items:center;gap:1.6em"><div data-t style="font-size:3.4em;font-weight:500;letter-spacing:-0.02em;white-space:nowrap;justify-content:center"></div><div data-m style="font-family:${MONO};font-size:1em;color:${DIM}"></div></div>`, center);
      return { play: once(async () => { const k = i++ % 4, t = remake(q("[data-t]"), W[k]); q("[data-m]").textContent = `mode: "${MD[k]}"`; await M().kinetic(t, { mode: MD[k], radius: big ? 5.5 : 3.6 }); await wait(0.5); }) }; } });

  add({ id: "color-wave", name: "Colour Wave", cat: "Text", from: "Vaulton Launch · Invois App", desc: "Letters rise out of a blur in an accent colour, then settle into the text colour. Also steps by word.",
    code: `Shaderfield.motion.colorWave(el, { from: "#0ea5e9", stagger: 0.035 });\nShaderfield.motion.colorWave(el, { by: "word", from: "#0ea5e9" });`,
    build(el, big) { let n = 0; const q = stage(el, big, `<div data-t style="font-size:4em;${H1}white-space:nowrap;justify-content:center"></div>`, center);
      return { play: once(async () => { const w = n++ % 2, t = remake(q("[data-t]"), w ? "A new motion kit" : "Worlds to build?"); await M().colorWave(t, w ? { by: "word", from: ACC } : { from: ACC }); await wait(0.4); }) }; } });

  add({ id: "converge", name: "Echo Converge", cat: "Text", from: "Vaulton Launch", desc: "Two faint copies above and below slide into the word as it sharpens.",
    code: `Shaderfield.motion.converge(el, { gap: 0.92, ghost: 0.16 });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:7em;${H1}">Meet</div>`, center);
      return { play: once(() => M().converge(q("[data-t]"), { ghostColor: ACC, ghost: 0.3 })) }; } });

  add({ id: "slot-roll", name: "Slot Roll", cat: "Text", from: "Vaulton Launch", desc: "Words roll through a slot that resizes to fit each one, with faint echoes as it lands.",
    code: `Shaderfield.motion.slotRoll(el, ["dynamic", "flexible", "adaptive", "fastest"], { hold: 0.8 });`,
    build(el, big) { const q = stage(el, big, `<div style="font-size:${big ? 4.2 : 3.4}em;font-weight:500;letter-spacing:-0.03em;white-space:nowrap;display:flex;align-items:center;line-height:1.15em"><span style="display:block;height:1.15em">the&nbsp;</span><span data-s style="color:${ACC}"></span></div>`, center);
      return loopDemo(() => M().slotRoll(q("[data-s]"), ["dynamic", "flexible", "adaptive", "fastest"])); } });

  add({ id: "split-tone", name: "Split Tone", cat: "Text", from: "Invois Reveal", desc: "Letters light up from the edges inward, then a second colour sweeps through the line from right to left.",
    code: `Shaderfield.motion.splitTone(el, {\n  colors: ["#0ea5e9", "#f2f2f4"],  // swept colour, starting colour\n  from: 1.05, to: -0.05, soft: 0.05, duration: 1.4\n});`,
    build(el, big) { const q = stage(el, big, `<div data-t style="font-size:${big ? 2.7 : 1.7}em;font-weight:600;letter-spacing:-0.03em;line-height:1.2;white-space:nowrap">The beginning of something new</div>`, center);
      return { play: once(async () => { await M().splitTone(q("[data-t]"), { colors: [ACC, INK], from: 1.05, to: -0.05, soft: 0.05, duration: 1.4 }); await wait(0.6); }) }; } });

  add({ id: "odometer", name: "Odometer", cat: "Interface", from: "Echoform · Kinetik", desc: "A count rolls to its next value. The old number blurs up and out as the new one rises in.",
    code: `const votes = Shaderfield.motion.odometer(el, { value: 47 });\nvotes.set(48);`,
    build(el, big) { const q = stage(el, big, `<div style="display:flex;align-items:center;gap:1.2em;padding:1em 1.2em;border-radius:1em;background:${PANEL};outline:1px solid ${LINE}"><div data-b style="width:4.4em;height:4.4em;border-radius:0.9em;background:${BG2};outline:1.5px solid rgba(242,242,244,0.14);display:flex;flex-direction:column;align-items:center;justify-content:center"><span data-a style="font-size:1em;font-weight:700;color:${MUTE}">▲</span><span data-n style="font-size:1.6em;font-weight:600"></span></div><div><div style="font-size:1.45em;font-weight:600;letter-spacing:-0.02em">Bulk export to CSV</div><div style="color:${MUTE};margin-top:0.3em">Requested by Northwind and 46 more</div></div></div>`, center);
      const od = M().odometer(q("[data-n]"), { value: 47 });
      return { play: once(async () => { const b = q("[data-b]"), v = od.value() >= 52 ? 47 : od.value() + 1; M().play(0.22, t => (b.style.transform = `scale(${(1 - 0.12 * Math.sin((Math.PI * t) / 0.22)).toFixed(3)})`)); b.style.outlineColor = ACC; q("[data-a]").style.color = ACC; await od.set(v); await wait(0.7); }), stop: od }; } });

  add({ id: "dot-morph", name: "Dot Morph", cat: "Interface", from: "Echoform · Kinetik", desc: "A dot of colour stretches into the pill behind a label, and the label flips to ink.",
    code: `Shaderfield.motion.dotMorph(tag, { color: "#0ea5e9", ink: "#09090b" });`,
    build(el, big) { const q = stage(el, big, `<div data-t style="display:flex;align-items:center;gap:0.6em;padding:0 1.5em;height:3em;font-size:2em;font-weight:500;letter-spacing:-0.02em;white-space:nowrap">Export<span style="font-family:${MONO};font-size:0.7em;opacity:0.6">48</span></div>`, center);
      return { play: once(async () => { await M().dotMorph(q("[data-t]"), { color: ACC, ink: "#09090b" }); await wait(0.6); }) }; } });

  add({ id: "toast-stack", name: "Toast Stack", cat: "Interface", from: "Echoform · Kinetik", desc: "Notifications land stacked behind each other, then fan out into a list.",
    code: `<div id="toasts" style="position:relative;height:340px">\n  <div>Shipped: Bulk export</div> …\n</div>\n\nShaderfield.motion.toastStack(toasts, { stagger: 0.18 });`,
    build(el, big) { const ts = [["Shipped: Bulk export", "Linked to 48 requests"], ["48 customers notified", "Release note sent"], ["Northwind replied", "“This saves us an hour a week.”"]];
      const q = stage(el, big, `<div data-s style="position:relative;width:min(24em,80%);height:86%"></div>`, center);
      return { play: once(async () => { const s = q("[data-s]"); s.innerHTML = ts.map(([a, b]) => `<div style="display:flex;align-items:center;gap:0.9em;padding:0.8em 1em;border-radius:0.9em;background:${BG2};outline:1px solid ${LINE};box-shadow:0 1em 2em rgba(0,0,0,0.4)"><span style="flex:none;width:1.9em;height:1.9em;border-radius:50%;outline:1.5px solid ${ACC};display:flex;align-items:center;justify-content:center;color:${ACC};font-weight:700">✓</span><div><div style="font-weight:600;font-size:1.1em">${a}</div><div style="color:${MUTE};margin-top:0.2em">${b}</div></div></div>`).join(""); if (!big) s.style.fontSize = "0.85em"; await M().toastStack(s, { gap: big ? 14 : 6, peek: big ? 16 : 8 }); await wait(1); }) }; } });

  add({ id: "prompt-send", name: "Prompt Send", cat: "Interface", from: "Echoform · Kinetik · Vindora", desc: "A request types into a composer, the send button lights and is pressed, the box rises and the reply follows.",
    code: `Shaderfield.motion.promptSend(stage, {\n  text: "Build a coverflow carousel", color: "#0ea5e9",\n  reply: "Agent is building your carousel",\n  steps: ["read   examples/coverflow", "write  Carousel.tsx"]\n});`,
    build(el, big) { stage(el, big, "", `font-size:${big ? 20 : 11}px;`);
      return { play: once(async () => { await M().promptSend(el, { text: "Build a coverflow carousel", color: ACC, background: PANEL, border: "rgba(242,242,244,0.14)", reply: "● Agent is building your carousel", steps: ["read   examples/coverflow", "write  components/Carousel.tsx", "add    drag + snap"], cps: 26 }); await wait(0.8); }) }; } });

  add({ id: "coverflow", name: "Coverflow", cat: "Interface", from: "Kinetik Plus", desc: "Cards fan out in 3D around the one in focus and glide when it changes.",
    code: `const flow = Shaderfield.motion.coverflow(el, ["a.jpg", "b.jpg", "c.jpg", "#0ea5e9"], { hold: 1.4 });\nflow.next();`,
    build(el, big) { stage(el, big, ""); const s = big ? 0.66 : 0.34; return loopDemo(() => M().coverflow(el, Array.from({ length: 7 }, (_, i) => tileBg(i)), { width: 300 * s, height: 380 * s, spread: 200 * s, tail: 70 * s, rotate: 48, radius: big ? 12 : 8, hold: 1.4 })); } });

  add({ id: "card-drift", name: "Card Drift", cat: "Interface", from: "Kinetik Plus", desc: "A deck of cards turned in 3D drifts along a diagonal, endlessly.",
    code: `Shaderfield.motion.cardDrift(el, ["a.jpg", "b.jpg", "c.jpg"], { rate: 1.8, rotate: -48 });`,
    build(el, big) { stage(el, big, ""); const s = big ? 0.6 : 0.3; return loopDemo(() => M().cardDrift(el, Array.from({ length: 9 }, (_, i) => tileBg(i)), { width: 300 * s, height: 400 * s, dx: 100 * s, dy: -60 * s, dz: -150 * s, rate: 1.2, radius: big ? 14 : 8 })); } });

  add({ id: "shared-morph", name: "Shared Morph", cat: "Interface", from: "Kinetik · Vindora · Gridd", desc: "An open card glides and resizes into its slot in the grid while its details fold away.",
    code: `await Shaderfield.motion.morph(modal, gridSlot, { duration: 0.6 });`,
    build(el, big) { const q = stage(el, big, `<div data-g style="position:absolute;inset:12% 18%;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:0.8em">${[0, 1, 2, 3].map(i => `<div style="border-radius:0.8em;background:${tileBg(i + 1)}"></div>`).join("")}</div><div data-m style="position:absolute;overflow:hidden;background:${BG2};box-shadow:0 2em 5em rgba(0,0,0,0.6)"><div data-i style="background:${tileBg(1)}"></div><div data-x style="padding:${big ? "0.8em 1em" : "0.6em 0.7em"}"><div style="font-size:1.4em;font-weight:600;letter-spacing:-0.02em;white-space:nowrap">Shared layout</div><div style="color:${MUTE};margin-top:0.3em;${big ? "" : "display:none"}">One element, two states.</div></div></div>`);
      const m = q("[data-m]"), img = q("[data-i]"), tx = q("[data-x]"), ks = [...q("[data-g]").children];
      const open = () => { Object.assign(m.style, { left: "30%", top: "7%", width: "40%", height: "86%", borderRadius: "0.8em" }); img.style.height = big ? "64%" : "56%"; tx.style.opacity = 1; ks.forEach((k, i) => (k.style.opacity = i ? 0.25 : 0)); }; open();
      return { play: once(async () => { open(); await wait(0.5); const h0 = big ? 64 : 56; M().play(0.6, t => { const k = M().ease.inOut(t / 0.6); img.style.height = h0 + (100 - h0) * k + "%"; tx.style.opacity = (1 - Math.min(1, k * 2.5)).toFixed(3); ks.forEach((c, i) => i && (c.style.opacity = (0.25 + 0.75 * k).toFixed(3))); });
        await M().morph(m, ks[0]); await wait(1.2); }) }; } });

  add({ id: "card-flip", name: "Card Flip", cat: "Interface", from: "Vaulton Product", desc: "The card turns edge-on and comes back showing its other face.",
    code: `<div id="card"><div>front</div><div style="display:none">back</div></div>\n\nawait Shaderfield.motion.flipCard(card);\nShaderfield.motion.flipCard(card, { back: false });`,
    build(el, big) { const q = stage(el, big, `<div data-c style="width:12em;height:15em"><div style="height:100%;border-radius:1em;background:${PANEL};outline:1px solid ${LINE};overflow:hidden"><div style="height:52%;background:${tileBg(1)}"></div><div style="padding:0.9em 1.1em"><div style="font-family:${MONO};font-size:0.7em;color:${MUTE};letter-spacing:0.1em">REAL ESTATE</div><div style="font-size:1.5em;font-weight:600;letter-spacing:-0.02em;margin-top:0.2em">Harbor Tower</div><div style="font-family:${MONO};font-size:1.15em;margin-top:0.5em">$48,000,000</div></div></div><div style="display:none;height:100%"><div style="height:100%;border-radius:1em;background:${PANEL};outline:1.5px solid ${ACC};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.8em"><div style="width:6em;height:6em;border-radius:50%;border:0.4em solid ${ACC};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-weight:700"><span style="font-size:1.7em">HRB</span></div><div style="font-weight:600;font-size:1.2em">Harbor Tower</div><div style="font-family:${MONO};color:${MUTE}">40,000 units</div></div></div></div>`, center);
      return { play: once(async () => { const c = q("[data-c]"); await M().flipCard(c); await wait(0.9); await M().flipCard(c, { back: false }); }) }; } });

  add({ id: "progress-button", name: "Progress Button", cat: "Interface", from: "Vaulton Product", desc: "The button squeezes, fills with progress under a busy label, then pops into a completed state as its check draws in.",
    code: `await Shaderfield.motion.progressButton(button, { busy: "Publishing…", done: "Published", duration: 0.8 });\nShaderfield.motion.progressButton(button, { reset: true });`,
    build(el, big) { const q = stage(el, big, `<div data-b style="padding:0 1.8em;height:3.2em;border-radius:999px;background:${INK};color:#09090b;font-size:1.4em;font-weight:600;display:flex;align-items:center;white-space:nowrap">Publish</div>`, center);
      return { play: once(async () => { const b = q("[data-b]"); await M().progressButton(b, { reset: true }); await wait(0.25); await M().progressButton(b, { busy: "Publishing…", done: "Published", duration: 0.9, doneColor: ACC, doneInk: "#09090b" }); await wait(1.1); return M().progressButton(b, { reset: true }); }) }; } });

  add({ id: "live-feed", name: "Live Feed", cat: "Interface", from: "Vaulton Product", desc: "New rows push in at the top while the older ones slide down and dim.",
    code: `Shaderfield.motion.liveFeed(list, rowsHtml, { interval: 0.66, max: 5 });`,
    build(el, big) { const rows = [["Lisbon", 12], ["Singapore", 40], ["Dubai", 250], ["London", 8], ["Toronto", 30], ["Zurich", 1200], ["São Paulo", 20], ["Seoul", 90]].map(([c, u]) => `<span style="flex:none;width:1.3em;height:1.3em;border-radius:50%;border:2px solid ${ACC};box-sizing:border-box"></span><span style="font-weight:600">${c}</span><span style="margin-left:auto;font-family:${MONO};color:${MUTE}">+${u.toLocaleString("en-US")} units</span>`);
      const q = stage(el, big, `<div data-f style="width:min(24em,80%);height:${big ? 280 : 150}px;font-size:1.2em"></div>`, center);
      return loopDemo(() => M().liveFeed(q("[data-f]"), rows, { rowHeight: big ? 52 : 30, interval: 0.7 })); } });

  add({ id: "blinds", name: "Blinds", cat: "Transitions", from: "Bllind Launch", desc: "Horizontal bands close from their centre lines in a ragged order, the scene swaps, and they open again.",
    code: `Shaderfield.motion.blinds(stage, { bands: 12, color: "#0ea5e9", onSwap: () => showNext() });`,
    build(el, big) { const q = stage(el, big, scene("a", "Hire on skill.", BG1, INK) + scene("b", "Bias out.", ACC, "#09090b", true, 5.6)); const flip = flipB(q);
      return { play: once(async () => { const toB = q("[data-b]").style.visibility === "hidden"; q("[data-b]").style.background = ACC; await M().blinds(el, { color: toB ? ACC : BG1, onSwap: flip }); await wait(0.5); }) }; } });

  add({ id: "column-rise", name: "Column Rise", cat: "Transitions", from: "Corporate Presentation", desc: "Stepped columns of colour rise to cover the frame, the scene swaps, then they retreat upward.",
    code: `Shaderfield.motion.columnWipe(stage, { cols: 16, color: "#0ea5e9", onSwap: () => showNext() });\n// mode: "both" | "in" | "out"`,
    build(el, big) { const q = stage(el, big, swap2("A step into<br>the digital world", "Present your<br>company")); const flip = flipB(q);
      return { play: once(async () => { await M().columnWipe(el, { color: ACC, background: ACC, onSwap: flip }); await wait(0.5); }) }; } });

  add({ id: "block-wipe", name: "Block Wipe", cat: "Transitions", from: "Corporate Presentation", desc: "A grid of blocks fills from one corner, the scene swaps, and the blocks clear in the same direction.",
    code: `Shaderfield.motion.blockWipe(stage, { from: "tr", color: "#0ea5e9", onSwap: () => showNext() });\n// from: "tr" | "tl" | "br" | "bl" | "r" | "l"`,
    build(el, big) { const q = stage(el, big, swap2("Our team", "Our history")); const flip = flipB(q); let n = 0;
      return { play: once(async () => { await M().blockWipe(el, { color: ACC, from: ["tr", "r", "bl"][n++ % 3], onSwap: flip }); await wait(0.5); }) }; } });

  add({ id: "doors", name: "Doors", cat: "Transitions", from: "Corporate Presentation", desc: "Two panels slide in from the sides with ragged edges, meet in the middle for the swap, then part.",
    code: `Shaderfield.motion.doors(stage, { color: "#0ea5e9", onSwap: () => showNext() });`,
    build(el, big) { const q = stage(el, big, swap2("Achievements", "Milestones")); const flip = flipB(q);
      return { play: once(async () => { await M().doors(el, { color: ACC, onSwap: flip }); await wait(0.5); }) }; } });

  add({ id: "beam-wipe", name: "Beam Wipe", cat: "Transitions", from: "Invois Reveal · Corporate Presentation", desc: "A bundle of slanted beams sweeps across. The next scene is revealed behind its trailing edge.",
    code: `Shaderfield.motion.beamWipe(stage, { next: nextScene, angle: 21, duration: 1.2 });`,
    build(el, big) { const q = stage(el, big, scene("s", "March 24th", BG1, INK) + scene("s", "Coming soon", BG2, INK, true)); let cur = 0;
      const cs = () => [ACC, `color-mix(in srgb, ${ACC} 70%, #000)`, `color-mix(in srgb, ${ACC} 65%, #fff)`, `color-mix(in srgb, ${ACC} 80%, #000)`, ACC, ACC2];
      return { play: once(async () => { const ss = [...el.querySelectorAll("[data-s]")], a = ss[cur], b = ss[1 - cur]; a.style.zIndex = 1; b.style.zIndex = 2; b.style.visibility = ""; await M().beamWipe(el, { next: b, colors: cs(), backing: "rgba(9,9,11,0.85)" }); a.style.visibility = "hidden"; cur = 1 - cur; await wait(0.5); }) }; } });

  add({ id: "mark-expand", name: "Mark Expand", cat: "Transitions", from: "Echoform · Kinetik Plus", desc: "The logo mark grows until it fills the frame with its colour, ready for the next scene.",
    code: `await Shaderfield.motion.markExpand(mark, { stage, keep: true });`,
    build(el, big) { const q = stage(el, big, `<div data-b style="position:absolute;inset:0;background:${ACC};color:#09090b;font-size:7em;font-weight:700;letter-spacing:-0.055em;line-height:0.88;padding:0.15em 0.2em;box-sizing:border-box">Live<br>insights</div><div data-a style="position:absolute;inset:0;${center}gap:0.9em;background:${BG1}"><span data-m style="width:3.6em;height:3.6em;border-radius:1em;background:${ACC}"></span><span style="font-size:3.6em;${H1}">Shaderfield</span></div>`);
      return { play: once(async () => { const a = q("[data-a]"), b = q("[data-b]"), m = q("[data-m]"); a.style.visibility = ""; m.style.background = b.style.background = ACC; await wait(0.3); const f = await M().markExpand(m, { stage: el, keep: true }); a.style.visibility = "hidden"; f.remove(); await wait(1.2); }) }; } });

  // Group related components together: list order drives the grid and the sidebar
  const ORDER_IDS = ["letter-rise","word-rise","line-rise","pop","focus-pull","track-in","color-wave","converge","slam-in","kinetic","roll-words","slot-roll","type-swap","solve","glyph-write","split-tone","word-trail","marquee","pill-words","underline-cycle","neon-type","typewriter","type-log","count-up","lyric-flow","caption-pop","cut-reveal","square-reveal","center-split","rule-list","strike","click-cursor","bracket-cursor","bracket-hop","pen-trail","press-ripple","shine","pick-focus","focus-card","tick-pop","lock-click","face-scan","progress-button","switch","odometer","dot-morph","coin-pill","progress-bars","signal-bars","streak-dots","typing-dots","tab-morph","masked-scroll","live-feed","toast-stack","prompt-send","color-index","step-list","disc-stack","coverflow","card-drift","card-flip","shared-morph","drag-swap","photo-flicker","tile-pop","flicker-on","swatch-rise","scan-beam","wire-draw","node-map","timeline-draw","candles","waveform","iris","blinds","column-rise","block-wipe","doors","beam-wipe","stripe-wipe","line-draw","radial-reveal","runway","footer-reveal","whip-pan","mark-expand","circle-flood","circle-sweep","squeeze","camera-push","camera-path","push-through","flash","shock","glow-sheen","impact-glow","border-comet","glass-ignite","glitch-slices"];
  const rank = (d) => { const i = ORDER_IDS.indexOf(d.id); return i < 0 ? 999 : i; };
  D.sort((a, b) => rank(a) - rank(b));
  window.SFDemos = D;
  window.SFDemoTheme = { get accent() { return ACC; }, set(c, c2) { ACC = c; ACC2 = c2 || "#f4f4f5"; } };
})();
