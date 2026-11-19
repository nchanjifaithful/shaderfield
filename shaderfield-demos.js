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

  add({ id: "click-cursor", name: "Click Cursor", cat: "Interface", from: "Document AI Teaser", desc: "A pointer arcs in, clicks, and fires sparks and a ripple.",
    code: `await Shaderfield.motion.clickCursor(stage, button, {\n  color: "#0ea5e9", size: 28,\n  onClick: () => {}   // runs on the press\n});`,
    build(el, big) { const q = stage(el, big, `<div data-b style="display:flex;align-items:center;gap:0.6em;padding:0.85em 1.7em;border-radius:999px;background:${ACC};color:#09090b;font-size:1.7em;font-weight:600;box-shadow:0 0 2.2em rgba(14,165,233,0.35)">Book a demo<span>→</span></div>`, center);
      return { play: once(async () => { await wait(0.15); const b = q("[data-b]"); return M().clickCursor(el, b, { color: ACC, size: big ? 30 : 20 }); }) }; } });

  // ── Motion Tryouts ──
  const TILE = [["#2c2f36", "#141619", 18, 48], ["#202329", "#0f1114", 82, 26], ["#32353c", "#18191d", 42, 38], ["#25282e", "#121418", 90, 18], ["#2e3138", "#151619", 8, 56], ["#22252a", "#101113", 62, 32]];
  const tileBg = (i) => { const [a, b, x, k] = TILE[i % TILE.length]; return `radial-gradient(120% 85% at ${x}% 0%, color-mix(in srgb, ${ACC} ${k}%, transparent) 0%, transparent 62%), linear-gradient(170deg, ${a} 0%, ${b} 100%)`; };
  const remake = (n, text) => { if (n._base == null) n._base = n.getAttribute("style") || ""; const m = n.cloneNode(false); m._base = n._base; m.setAttribute("style", n._base); m.removeAttribute("aria-label"); delete m.dataset.sfText; m.textContent = text; n.replaceWith(m); return m; };
  const flipB = (q) => () => { const b = q("[data-b]"); b.style.visibility = b.style.visibility === "hidden" ? "" : "hidden"; };
  const MONO = "'Geist Mono',monospace", BG1 = "#0d0d10", BG2 = "#16161a", PANEL = "#121216", LINE = "rgba(242,242,244,0.1)";
  const H1 = "font-weight:600;letter-spacing:-0.04em;line-height:1.05;";
  const scene = (k, text, bg, col, hid, fs = 3.6) => `<div data-${k} style="position:absolute;inset:0;${center}text-align:center;background:${bg};color:${col};font-size:${fs}em;${H1}${hid ? "visibility:hidden;" : ""}">${text}</div>`;
  const swap2 = (a, b, bgB = BG2) => scene("a", a, BG1, INK) + scene("b", b, bgB, INK, true);

  // Group related components together: list order drives the grid and the sidebar
  const ORDER_IDS = ["letter-rise","word-rise","line-rise","pop","focus-pull","track-in","color-wave","converge","slam-in","kinetic","roll-words","slot-roll","type-swap","solve","glyph-write","split-tone","word-trail","marquee","pill-words","underline-cycle","neon-type","typewriter","type-log","count-up","lyric-flow","caption-pop","cut-reveal","square-reveal","center-split","rule-list","strike","click-cursor","bracket-cursor","bracket-hop","pen-trail","press-ripple","shine","pick-focus","focus-card","tick-pop","lock-click","face-scan","progress-button","switch","odometer","dot-morph","coin-pill","progress-bars","signal-bars","streak-dots","typing-dots","tab-morph","masked-scroll","live-feed","toast-stack","prompt-send","color-index","step-list","disc-stack","coverflow","card-drift","card-flip","shared-morph","drag-swap","photo-flicker","tile-pop","flicker-on","swatch-rise","scan-beam","wire-draw","node-map","timeline-draw","candles","waveform","iris","blinds","column-rise","block-wipe","doors","beam-wipe","stripe-wipe","line-draw","radial-reveal","runway","footer-reveal","whip-pan","mark-expand","circle-flood","circle-sweep","squeeze","camera-push","camera-path","push-through","flash","shock","glow-sheen","impact-glow","border-comet","glass-ignite","glitch-slices"];
  const rank = (d) => { const i = ORDER_IDS.indexOf(d.id); return i < 0 ? 999 : i; };
  D.sort((a, b) => rank(a) - rank(b));
  window.SFDemos = D;
  window.SFDemoTheme = { get accent() { return ACC; }, set(c, c2) { ACC = c; ACC2 = c2 || "#f4f4f5"; } };
})();
