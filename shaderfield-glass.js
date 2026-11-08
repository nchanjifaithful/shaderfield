/*! Shaderfield Glass add-on — 3D glass effects (Glass Icons, Glass Coins). Loads three.js from esm.sh on first use.
 * Load after shaderfield.js:  <script src="shaderfield.js"></script><script src="shaderfield-glass.js"></script>
 */
(function () {
  "use strict";
  const SF = window.Shaderfield; if (!SF || SF.EFFECTS.glassicons) return;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const Easing = { easeOutCubic: (t) => 1 - Math.pow(1 - t, 3), easeInCubic: (t) => t * t * t, easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2 };
  const W = 1920, H = 1080, BG = "#06070a";
  const ICONS = ["Cloud", "Dev", "Robot", "Sparkle"], ENTER = 1.0, EXIT = 0.55, EDGE = Math.PI / 2;
  let threeP = null;
  const loadThree = () => threeP || (threeP = Promise.all([import("https://esm.sh/three@0.170.0"), import("https://esm.sh/three@0.170.0/examples/jsm/utils/BufferGeometryUtils.js")]).then(([THREE, U]) => ({ THREE, toCreasedNormals: U.toCreasedNormals })));
  const hex = (c) => "#" + c.map(v => Math.round(clamp(v) * 255).toString(16).padStart(2, "0")).join("");

  const R = 400;
  function drawIcon(name) {
    const c = document.createElement('canvas');
    c.width = c.height = R;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.strokeStyle = '#fff';
    const circle = (cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
    const rr = (a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); x.fill(); };
    if (name === 'Cloud') {
      circle(140, 225, 72); circle(212, 172, 98); circle(292, 222, 74);
      rr(66, 212, 298, 92, 46);
    } else if (name === 'Dev') {
      x.lineWidth = 36; x.lineCap = 'round'; x.lineJoin = 'round';
      x.beginPath(); x.moveTo(128, 118); x.lineTo(52, 200); x.lineTo(128, 282); x.stroke();
      x.beginPath(); x.moveTo(272, 118); x.lineTo(348, 200); x.lineTo(272, 282); x.stroke();
      x.beginPath(); x.moveTo(228, 92); x.lineTo(172, 308); x.stroke();
    } else if (name === 'Robot') {
      rr(80, 130, 240, 196, 52);
      rr(46, 196, 44, 74, 18); rr(310, 196, 44, 74, 18);
      rr(189, 86, 22, 56, 6); circle(200, 76, 24);
      x.globalCompositeOperation = 'destination-out';
      circle(154, 216, 25); circle(246, 216, 25);
      rr(158, 266, 84, 18, 9);
      x.globalCompositeOperation = 'source-over';
    } else {
      const star = (cx, cy, r, k) => {
        x.beginPath(); x.moveTo(cx, cy - r);
        x.quadraticCurveTo(cx + k, cy - k, cx + r, cy);
        x.quadraticCurveTo(cx + k, cy + k, cx, cy + r);
        x.quadraticCurveTo(cx - k, cy + k, cx - r, cy);
        x.quadraticCurveTo(cx - k, cy - k, cx, cy - r);
        x.fill();
      };
      star(186, 214, 160, 22); star(326, 78, 52, 8);
    }
    return x.getImageData(0, 0, R, R);
  }
  
  // ---------- tracing (ported from the glass object source) ----------
  function traceContours(mask, w, h) {
    const at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x] === 1 ? 1 : 0);
    const seg = [];
    const T = (cx, cy) => [cx - 0.5, cy - 1], B = (cx, cy) => [cx - 0.5, cy];
    const L = (cx, cy) => [cx - 1, cy - 0.5], Rr = (cx, cy) => [cx, cy - 0.5];
    for (let cy = 0; cy <= h; cy++) for (let cx = 0; cx <= w; cx++) {
      const code = at(cx - 1, cy - 1) * 8 + at(cx, cy - 1) * 4 + at(cx, cy) * 2 + at(cx - 1, cy);
      const p = (a, b) => seg.push([a(cx, cy), b(cx, cy)]);
      switch (code) {
        case 1: case 14: p(L, B); break;
        case 2: case 13: p(B, Rr); break;
        case 3: case 12: p(L, Rr); break;
        case 4: case 11: p(T, Rr); break;
        case 5: p(L, T); p(B, Rr); break;
        case 6: case 9: p(T, B); break;
        case 7: case 8: p(L, T); break;
        case 10: p(T, Rr); p(L, B); break;
      }
    }
    const key = (p) => (Math.round(p[0] * 2) + 4) * 8192 + Math.round(p[1] * 2) + 4;
    const adj = new Map();
    seg.forEach((s, i) => s.forEach((p) => { const k = key(p); (adj.get(k) || adj.set(k, []).get(k)).push(i); }));
    const used = new Uint8Array(seg.length), loops = [];
    for (let s = 0; s < seg.length; s++) {
      if (used[s]) continue;
      used[s] = 1;
      const loop = [seg[s][0]]; let pt = seg[s][1]; const sk = key(seg[s][0]);
      while (key(pt) !== sk) {
        loop.push(pt);
        const next = (adj.get(key(pt)) || []).find((c) => !used[c]);
        if (next === undefined) break;
        used[next] = 1;
        const [a, b] = seg[next]; pt = key(a) === key(pt) ? b : a;
      }
      if (loop.length >= 4) loops.push(loop);
    }
    return loops;
  }
  function simplifyLoop(pts, eps) {
    if (pts.length < 6) return pts;
    const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
    const st = [[0, pts.length - 1]];
    while (st.length) {
      const [lo, hi] = st.pop(); const [ax, ay] = pts[lo], [bx, by] = pts[hi];
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
      let worst = -1, wd = eps;
      for (let i = lo + 1; i < hi; i++) {
        const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
        if (d > wd) { wd = d; worst = i; }
      }
      if (worst > 0) { keep[worst] = 1; st.push([lo, worst], [worst, hi]); }
    }
    return pts.filter((_, i) => keep[i]);
  }
  function chaikin(pts, n) {
    let cur = pts;
    for (let k = 0; k < n; k++) {
      const nx = [];
      for (let i = 0; i < cur.length; i++) {
        const [ax, ay] = cur[i], [bx, by] = cur[(i + 1) % cur.length];
        nx.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
      }
      cur = nx;
    }
    return cur;
  }
  const area = (p) => p.reduce((s, [ax, ay], i) => { const [bx, by] = p[(i + 1) % p.length]; return s + ax * by - bx * ay; }, 0) / 2;
  function inside(loop, x, y) {
    let o = false;
    for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
      const [xi, yi] = loop[i], [xj, yj] = loop[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) o = !o;
    }
    return o;
  }
  function shapesFromImage(THREE, data) {
    const { width: w, height: h } = data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) mask[i] = data.data[i * 4 + 3] >= 64 ? 1 : 0;
    let loops = traceContours(mask, w, h).map((l) => chaikin(simplifyLoop(l, 1), 2)).filter((l) => Math.abs(area(l)) > 12);
    loops.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
    const depth = loops.map((l, i) => loops.reduce((d, o, j) => d + (j !== i && inside(o, l[0][0], l[0][1]) ? 1 : 0), 0));
    const owners = [];
    loops.forEach((l, i) => {
      if (depth[i] % 2) return;
      owners.push({ l, a: Math.abs(area(l)), s: new THREE.Shape(l.map(([x, y]) => new THREE.Vector2(x, y))) });
    });
    loops.forEach((l, i) => {
      if (!(depth[i] % 2)) return;
      let ow = null;
      for (const c of owners) if (inside(c.l, l[0][0], l[0][1]) && (!ow || c.a < ow.a)) ow = c;
      if (ow) ow.s.holes.push(new THREE.Path(l.map(([x, y]) => new THREE.Vector2(x, y))));
    });
    return owners.map((o) => o.s);
  }
  function roundLoop(THREE, pts, r) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const pv = pts[(i - 1 + n) % n], cu = pts[i], nx = pts[(i + 1) % n];
      const a = cu.clone().sub(pv), b = nx.clone().sub(cu), la = a.length(), lb = b.length();
      if (la < 1e-9 || lb < 1e-9) continue;
      a.divideScalar(la); b.divideScalar(lb);
      const ang = Math.acos(clamp(a.dot(b), -1, 1));
      if (ang < 0.1) { out.push(cu.clone()); continue; }
      const tr = Math.min(r, la * 0.5, lb * 0.5);
      const p0 = cu.clone().addScaledVector(a, -tr), p1 = cu.clone().addScaledVector(b, tr);
      const steps = Math.max(2, Math.ceil(ang / 0.3));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, A = (1 - t) * (1 - t), Bq = 2 * (1 - t) * t, C = t * t;
        out.push(new THREE.Vector2(A * p0.x + Bq * cu.x + C * p1.x, A * p0.y + Bq * cu.y + C * p1.y));
      }
    }
    return out.length >= 3 ? out : pts;
  }
  const dedupe = (p) => (p.length > 1 && p[0].distanceToSquared(p[p.length - 1]) < 1e-12 ? p.slice(0, -1) : p);
  function flattenCaps(THREE, g) {
    const pos = g.getAttribute('position'), nor = g.getAttribute('normal');
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), cb = new THREE.Vector3(), ab = new THREE.Vector3();
    for (const gr of g.groups) {
      if (gr.materialIndex !== 0) continue;
      for (let i = gr.start; i < gr.start + gr.count; i += 3) {
        a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
        cb.subVectors(c, b); ab.subVectors(a, b); cb.cross(ab).normalize();
        for (let j = 0; j < 3; j++) nor.setXYZ(i + j, cb.x, cb.y, cb.z);
      }
    }
    nor.needsUpdate = true;
  }
  function buildIconMesh(THREE, creased, name, material, depthFrac, bevelFrac) {
    const raw = shapesFromImage(THREE, drawIcon(name));
    const box = new THREE.Box2();
    raw.forEach((s) => s.getPoints(4).forEach((p) => box.expandByPoint(p)));
    const size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y);
    const depthU = depthFrac * size, bev = bevelFrac * depthU * 0.5;
    const shapes = raw.map((s) => {
      const ex = s.extractPoints(24);
      const ns = new THREE.Shape(roundLoop(THREE, dedupe(ex.shape), bev * 1.25));
      ex.holes.forEach((h) => ns.holes.push(new THREE.Path(roundLoop(THREE, dedupe(h), bev * 1.25))));
      return ns;
    });
    let g = new THREE.ExtrudeGeometry(shapes, {
      depth: Math.max(depthU - bev * 2, depthU * 0.1), bevelEnabled: bev > 1e-4,
      bevelThickness: bev, bevelSize: bev * 0.9, bevelSegments: 12, curveSegments: 24,
    });
    g = creased(g, Math.PI / 7);
    flattenCaps(THREE, g);
    g.rotateX(Math.PI);
    g.computeBoundingBox();
    const ctr = g.boundingBox.getCenter(new THREE.Vector3());
    g.translate(-ctr.x, -ctr.y, -ctr.z);
    const mesh = new THREE.Mesh(g, material);
    mesh.userData.maxDim = size;
    return mesh;
  }
  
  // ---------- studio environment (ported) ----------
  const ROOM_BLOCKS = [
    [[-10.906, -1, 1.846], [0, -0.195, 0], [2.328, 7.905, 4.651]],
    [[-5.607, -0.754, -0.758], [0, 0.994, 0], [1.97, 1.534, 3.955]],
    [[6.167, -0.16, 7.803], [0, 0.561, 0], [3.927, 6.285, 3.687]],
    [[-2.017, 0.018, 6.124], [0, 0.333, 0], [2.002, 4.566, 2.064]],
    [[2.291, -0.756, -2.621], [0, -0.286, 0], [1.546, 1.552, 1.496]],
    [[-2.193, -0.369, -5.547], [0, 0.516, 0], [3.875, 3.487, 2.986]],
  ];
  const FORMERS = [
    ['ring', 15, [2, 3, -2], [10, 10, 10], true, false],
    ['box', 80, [-14, 10, 8], [0.1, 2.5, 2.5], false, false],
    ['box', 80, [-14, 14, -4], [0.1, 2.5, 2.5], false, true],
    ['box', 23, [14, 12, 0], [0.1, 5, 5], false, true],
    ['box', 16, [0, 9, 14], [5, 5, 0.1], false, true],
    ['box', 80, [7, 8, -14], [2.5, 2.5, 0.1], false, true],
    ['box', 80, [-7, 16, -14], [2.5, 2.5, 0.1], false, true],
    ['box', 1, [0, 20, 0], [0.1, 0.1, 0.1], false, true],
    ['box', 20, [0, 15, 0], [10, 1, 10], false, true],
  ];
  function buildRoom(THREE, highlight) {
    const scene = new THREE.Scene(), room = new THREE.Group();
    room.position.set(0, -0.5, 0); scene.add(room);
    [[-15, 15], [15, 15], [15, -15], [-15, -15]].forEach(([x, z]) => {
      const s = new THREE.SpotLight(0xffffff, 2, 0, 0.2, 1, 0); s.position.set(x, 20, z); room.add(s, s.target);
    });
    const pl = new THREE.PointLight(0xffffff, 100, 28, 2); pl.position.set(0.5, 14, 0.5); room.add(pl);
    const box = new THREE.BoxGeometry();
    const shell = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: 'gray', side: THREE.BackSide }));
    shell.position.set(0, 13.2, 0); shell.scale.set(31.5, 28.5, 31.5); room.add(shell);
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff });
    ROOM_BLOCKS.forEach(([p, r, s]) => { const m = new THREE.Mesh(box, white); m.position.set(...p); m.rotation.set(...r); m.scale.set(...s); room.add(m); });
    FORMERS.forEach(([kind, inten, p, s, look, light]) => {
      const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false });
      mat.color.set(kind === 'ring' ? highlight : '#ffffff').multiplyScalar(inten);
      const m = new THREE.Mesh(kind === 'ring' ? new THREE.RingGeometry(0.5, 1, 64) : box, mat);
      m.position.set(...p); m.scale.set(...s); if (look) m.lookAt(0, 0, 0); room.add(m);
      if (light) { const l = new THREE.PointLight(0xffffff, 100, 28, 2); l.position.set(...p); room.add(l); }
    });
    return scene;
  }
  
  function backdropCanvas(highlight) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = BG; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W * 0.5, H * 0.46, 0, W * 0.5, H * 0.46, H * 0.62);
    g.addColorStop(0, highlight + '55'); g.addColorStop(0.55, highlight + '14'); g.addColorStop(1, highlight + '00');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(255,255,255,0.05)'; x.lineWidth = 1;
    for (let i = 0; i <= W; i += 60) { x.beginPath(); x.moveTo(i + 0.5, 0); x.lineTo(i + 0.5, H); x.stroke(); }
    for (let j = 0; j <= H; j += 60) { x.beginPath(); x.moveTo(0, j + 0.5); x.lineTo(W, j + 0.5); x.stroke(); }
    return c;
  }
  
  
  function coinProfile(THREE, R, h) {
    const pts = [], face = h * 0.3, rimIn = R * 0.8, e = h / 2;
    pts.push(new THREE.Vector2(0, face));
    pts.push(new THREE.Vector2(rimIn, face));
    pts.push(new THREE.Vector2(rimIn + e * 0.25, e * 0.96));
    const cx = R - e;
    for (let i = 0; i <= 28; i++) {
      const a = Math.PI / 2 - (i / 28) * Math.PI;
      pts.push(new THREE.Vector2(cx + Math.cos(a) * e, Math.sin(a) * e));
    }
    pts.push(new THREE.Vector2(rimIn + e * 0.25, -e * 0.96));
    pts.push(new THREE.Vector2(rimIn, -face));
    pts.push(new THREE.Vector2(0, -face));
    return pts;
  }
  
  function studioEnv(THREE, renderer) {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })));
    const strip = (w, hgt, x, y, z, ry, c) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hgt), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); m.rotateZ(ry); s.add(m);
    };
    strip(40, 3, 0, 18, 10, 0.5, 0xffffff);
    strip(4, 30, -22, 0, 8, 0, 0xffffff);
    strip(3, 30, 20, -4, -6, 0.3, 0xdedcd6);
    strip(30, 2, 0, -16, 14, -0.4, 0x9a9892);
    strip(10, 10, 6, 6, 24, 0, 0xffffff);
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(s, 0.02).texture;
    pm.dispose();
    return tex;
  }
  
  
  class ThreeRenderer {
    constructor(canvas, e) { this.kind = "three"; this.canvas = canvas; this.e = e; this.g = null; this.key = ""; loadThree().then(ns => { this.ns = ns; }).catch(err => console.error("[shaderfield-glass]", err)); }
    draw(c, id, p, palette) {
      if (!this.ns) return;
      const key = this.e.key(p, palette);
      if (!this.g || this.key !== key) { this.dispose(); this.g = this.e.build(this.ns, this.canvas, p, palette, c); this.key = key; }
      const r = this.g.renderer; if (this.g.w !== c.w || this.g.h !== c.h) { r.setSize(c.w, c.h, false); this.g.camera.aspect = c.w / c.h; this.g.camera.updateProjectionMatrix(); this.g.w = c.w; this.g.h = c.h; }
      this.e.frame(this.g, c, p); r.render(this.g.scene, this.g.camera);
    }
    dispose() { if (this.g) { this.g.renderer.dispose(); this.g = null; } }
    destroy() { this.dispose(); }
  }
  const P = (key, label, min, max, step, def, unit) => ({ key, label, min, max, step, def, unit: unit || "" });

  SF.EFFECTS.glassicons = {
    name: "Glass Icons", from: "Glass Icons", kind: "WebGL 3D", res: 1, palette: "cobalt", palettes: ["cobalt", "ion", "aurora", "ember"], Renderer: ThreeRenderer,
    desc: "Flat icons traced into dispersive glass. Each spins in from edge-on, settles, and whips out into a match cut to the next.",
    hint: "Move to tilt the glass",
    params: [P("hold", "Hold", 1.5, 6, 0.1, 3, "s"), P("dispersion", "Dispersion", 0, 4, 0.05, 1.5), P("depth", "Depth", 0.05, 0.4, 0.01, 0.14)],
    key: (p, pal) => [pal, p.dispersion, p.depth].join("|"),
    build({ THREE, toCreasedNormals }, canvas, p, pal) {
      const hl = hex(SF.PALETTES[pal][0]);
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const scene = new THREE.Scene(); scene.background = new THREE.Color(BG);
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200); scene.add(camera);
      const bdTex = new THREE.CanvasTexture(backdropCanvas(hl)); bdTex.colorSpace = THREE.SRGBColorSpace;
      const dist = 30, bh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(55) / 2);
      const bd = new THREE.Mesh(new THREE.PlaneGeometry(bh * (W / H) * 1.6, bh * 1.6), new THREE.MeshBasicMaterial({ map: bdTex, toneMapped: false })); bd.position.set(0, 0, -dist); camera.add(bd);
      const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(buildRoom(THREE, hl), 0.6, 0.1, 1000).texture;
      const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, transmission: 1, clearcoatRoughness: 0.06, specularIntensity: 1, ior: 1.75, roughness: 0.25, dispersion: p.dispersion, clearcoat: 0.5 });
      const floatG = new THREE.Group(); scene.add(floatG);
      const meshes = ICONS.map((n) => { const m = buildIconMesh(THREE, toCreasedNormals, n, glass, p.depth, 1); const fit = new THREE.Group(); fit.scale.setScalar(3 / m.userData.maxDim); fit.add(m); floatG.add(fit); return { fit, mesh: m }; });
      glass.thickness = 4 / meshes[0].fit.scale.x;
      return { renderer, scene, camera, floatG, meshes, dir: new THREE.Vector3(0, -1, 4).normalize() };
    },
    frame(g, c, p) {
      const T = c.t, len = p.hold, k = Math.floor(T / len) % ICONS.length, local = T - Math.floor(T / len) * len;
      let rot; if (local >= len - EXIT) rot = EDGE * Easing.easeInCubic(clamp((local - (len - EXIT)) / EXIT)); else rot = EDGE + (Math.PI * 2 - EDGE) * Easing.easeOutCubic(clamp(local / ENTER));
      const mx = (c.mouse[0] / c.w - 0.5) * c.mouse[2], my = (c.mouse[1] / c.h - 0.5) * c.mouse[2];
      g.meshes.forEach((m, i) => { m.fit.visible = i === k; m.fit.rotation.y = rot + mx * 0.9; });
      g.floatG.rotation.x = Math.cos(T * 0.5) / 12 + my * 0.5; g.floatG.rotation.z = Math.sin(T * 0.5) / 30; g.floatG.position.y = 0.3 + Math.sin(T * 1.3) / 12;
      const d = (4.3 - 0.35 * Easing.easeInOutSine(clamp(local / len))) * Math.max(1, (16 / 9) / (c.w / c.h)); g.camera.position.copy(g.dir).multiplyScalar(d); g.camera.lookAt(0, 0, 0);
    },
  };
  const COIN_THEMES = { paper: { bg: "#f6f5f2", tint: "#ffffff", env: 1.4 }, ink: { bg: "#0d0d0c", tint: "#f4f3ef", env: 1.25 } };
  SF.EFFECTS.coins = {
    name: "Glass Coins", from: "Cryptar Glass Coins", kind: "WebGL 3D", res: 1, palette: "mono", palettes: ["mono"], Renderer: ThreeRenderer,
    desc: "Two clear glass coins, rim to rim, roll against each other on a tilted axis under studio strip lights.",
    hint: "Move to turn the axis",
    params: [P("loop", "Loop", 3, 16, 0.05, 7.25, "s"), P("paper", "Paper", 0, 1, 1, 1)],
    key: () => "coins",
    build({ THREE }, canvas) {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3; renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene(); scene.environment = studioEnv(THREE, renderer);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100); camera.position.set(0, 0, 11);
      const R = 2.1, h = 0.78, geo = new THREE.LatheGeometry(coinProfile(THREE, R, h), 128); geo.computeVertexNormals();
      const mat = new THREE.MeshPhysicalMaterial({ transmission: 1, thickness: 0.5, roughness: 0.02, ior: 1.52, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, envMapIntensity: 1 });
      const axis = new THREE.Group(); axis.rotation.z = Math.PI / 4; axis.rotation.y = -0.35; scene.add(axis);
      const coins = [-1, 1].map(sgn => { const pivot = new THREE.Group(); pivot.position.x = sgn * (R + 0.005); pivot.add(new THREE.Mesh(geo, mat)); axis.add(pivot); return pivot; });
      return { renderer, scene, camera, coins, axis, mat, THREE };
    },
    frame(g, c, p) {
      const th = COIN_THEMES[p.paper >= 0.5 ? "paper" : "ink"], u = (c.t % p.loop) / p.loop, turn = Math.PI * 2 * (u - Math.sin(u * Math.PI * 4) / (Math.PI * 4) * 0.55);
      g.coins[0].rotation.x = turn + 0.35; g.coins[1].rotation.x = -turn + Math.PI / 2 + 0.35;
      g.axis.rotation.y = -0.35 + 0.12 * Math.sin(u * Math.PI * 2) + (c.mouse[0] / c.w - 0.5) * 1.2 * c.mouse[2];
      const asp = c.w / c.h; g.camera.position.set(0.25 * Math.sin(u * Math.PI * 2), 0, 11 * Math.max(1, 1 / asp)); g.camera.lookAt(0, 0, 0);
      g.scene.background = new g.THREE.Color(th.bg); g.mat.color.set(th.tint); g.mat.envMapIntensity = th.env;
    },
  };
  SF.ORDER.push("glassicons", "coins");
  window.dispatchEvent(new Event("shaderfield-glass"));
})();
