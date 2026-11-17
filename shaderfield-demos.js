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

  add({ id: "bracket-hop", name: "Bracket Hop", cat: "Interface", from: "Clause Film", desc: "Corner brackets spin between targets and snap open around each.",
    code: `Shaderfield.motion.bracketHop(stage, [...stage.querySelectorAll(".tile")], {\n  hold: 1.1, press: true\n});`,
    build(el, big) { const tiles = ["Formation", "Fundraising", "Contracts", "Hiring"].map(n => `<div data-k style="border:2px dashed rgba(255,255,255,0.27);padding:1em 1.2em;font-size:1.5em;font-weight:540">${n}</div>`).join("");
      const q = stage(el, big, `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.6em">${tiles}</div>`, center + "background:#0a1210;");
      return loopDemo(() => M().bracketHop(el, [...el.querySelectorAll("[data-k]")], { press: true })); } });

  add({ id: "color-index", name: "Color Index", cat: "Interface", from: "Color List", desc: "A project list steps row by row as the background changes colour.",
    code: `Shaderfield.motion.colorIndex(el, [\n  { name: "Aarzoo", badge: "Print Design", bg: "#ff0000" },\n  { name: "Eternal Echoes", badge: "Typography", bg: "#8b5cf6" }\n]);`,
    build(el, big) { const q = stage(el, big, `<div data-t style="position:absolute;inset:0;font-size:4.4em;letter-spacing:-0.05em;color:#000"></div>`);
      return loopDemo(() => M().colorIndex(q("[data-t]"), [{ name: "Aarzoo", badge: "Print Design", bg: "#ff0000" }, { name: "Lost Horizons", badge: "Concept Art", bg: "#ffffff" }, { name: "Eternal Echoes", badge: "Typography", bg: "#8b5cf6" }, { name: "Abstract Dimensions", badge: "Experimental Media", bg: "#e5389b" }, { name: "Silent Stories", badge: "Photography", bg: "#06b6d4" }, { name: "Fading Memories", badge: "Editorial Design", bg: "#10b981" }, { name: "Weekend", badge: "Sound Design", bg: "#adcaba" }])); } });

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
