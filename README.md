# Shaderfield

Live shaders and motion effects for websites and motion video. They come from the Shaders Lab launch films and ship as **one dependency-free JavaScript file**.

- **7 GPU shaders**: Current, Fret, Skein, Harmonia, Halo, Thermal and Mesh. Each has its own parameters, 8 palettes, cursor and click interaction, PNG export and video recording.
- **7 motion effects**: text entrances, interface micro-motion and scene transitions, all plain DOM.
- **3 ways to use it**: a `<shader-field>` HTML element for websites, a frame-accurate `render(t)` API for video tools, and a ready-made AI prompt generated in the lab.

The repository also contains the **Shaderfield site**, a component browser where you can try every effect live, tune it, and copy the code, an AI prompt or a video render.

---

## Contents

- [Quick start](#quick-start)
- [Repository layout](#repository-layout)
- [Using the shaders on a website](#using-the-shaders-on-a-website)
- [Using the shaders in motion video](#using-the-shaders-in-motion-video)
- [Using it with AI coding agents](#using-it-with-ai-coding-agents)
- [Shader reference](#shader-reference)
- [Palettes](#palettes)
- [JavaScript API](#javascript-api)
- [Motion effects reference](#motion-effects-reference)
- [Performance and accessibility](#performance-and-accessibility)
- [Browser support](#browser-support)
- [Credits and license](#credits-and-license)

---

## Quick start

```html
<script src="shaderfield.js"></script>

<section style="position: relative; height: 100vh">
  <shader-field effect="halo" palette="aqua" interactive
    style="position: absolute; inset: 0"></shader-field>

  <h1 style="position: relative; z-index: 1">Your content</h1>
</section>
```

That's all there is to it. The element fills its positioned parent, renders only while it is on screen, and holds a still frame for visitors who prefer reduced motion.

To see it working, open `examples/hero.html`.

---

## Repository layout

```
shaderfield/
├── index.html              The Shaderfield site (component browser + lab)
├── support.js              Runtime the site needs. Not needed for the library.
├── shaderfield-demos.js    Demo stages for the site. Not needed for the library.
├── shaderfield.js          ← THE LIBRARY. This is the only file your projects need.
├── examples/
│   ├── hero.html           Shader background behind a hero, with an effect switcher
│   ├── motion.html         typeIn, countUp, tick, bars, curtain, revealWords
│   └── video-frames.html   Frame-accurate render with a scrubber, plus recording
├── LICENSE                 MIT, plus third-party notices
├── .nojekyll               Stops GitHub Pages from processing the files
└── README.md
```

---

## Using the shaders on a website

### 1. Add the file

Copy `shaderfield.js` into your project and load it once:

```html
<script src="/shaderfield.js"></script>
```

### 2. Place the element

```html
<shader-field
  effect="current"
  palette="plasma"
  interactive
  scale="1.2" current="0.7" length="32" density="0.55" speed="1"
  style="position:absolute; inset:0">
</shader-field>
```

| Attribute     | Meaning |
|---------------|---------|
| `effect`      | Shader id: `current`, `fret`, `skein`, `harmonia`, `halo`, `thermal`, `mesh` |
| `palette`     | Palette name (see [Palettes](#palettes)). If omitted, the effect's default is used. |
| `interactive` | Turns on cursor and click input |
| `speed`       | Time multiplier. `0` freezes, `1` is normal, `3` is fast. |
| *any parameter* | Every parameter in the [Shader reference](#shader-reference) is an attribute |

Attributes are **live**: change them from JavaScript and the shader updates right away.

```js
const bg = document.querySelector("shader-field");
bg.setAttribute("effect", "fret");
bg.setAttribute("palette", "ember");
bg.setAttribute("cell", "32");
```

Use `bg.field` to get the underlying [Field](#javascript-api).

### 3. Layer your content

Give the parent `position: relative` and give the content `position: relative; z-index: 1`. If text sits directly over a bright shader, put a dark gradient between them (example: `examples/hero.html`).

### React, Vue, Svelte and others

`<shader-field>` is a standard custom element, so it works in any framework once `shaderfield.js` is loaded. In React:

```jsx
useEffect(() => { import("/shaderfield.js"); }, []);
return <shader-field effect="skein" palette="aurora" interactive style={{ position: "absolute", inset: 0 }} />;
```

Or mount it imperatively:

```js
const field = Shaderfield.mount(ref.current, { effect: "skein", palette: "aurora" });
return () => field.destroy();
```

---

## Using the shaders in motion video

You have two options.

### A. Record a plate

On any shader's page in the site, open the **Video** tab and press **Record 6 s · 1080p** or **4K**, or **Save PNG frame**. You can also call it in code:

```js
const blob = await field.record({ seconds: 6, width: 1920, height: 1080, fps: 60 });
```

The browser decides the container: MP4 in Safari, WebM in Chrome and Firefox. To get MP4 or ProRes from WebM, convert it:

```bash
ffmpeg -i plate.webm -c:v libx264 -pix_fmt yuv420p -crf 16 plate.mp4
ffmpeg -i plate.webm -c:v prores_ks -profile:v 3 plate.mov
```

### B. Render frame by frame (deterministic)

With `autoplay: false` the field draws only when you call `render(seconds)`, and the same time always gives the same frame. That is what Remotion, Motion Canvas, Revideo, or a Puppeteer capture loop need.

```js
const field = Shaderfield.mount(el, {
  effect: "skein",
  palette: "aurora",
  autoplay: false,
  interactive: false,
  params: { wave: 0.7 }
});

field.render(frame / fps);
```

**Remotion:**

```jsx
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";

export const ShaderPlate = () => {
  const ref = useRef(null), field = useRef(null);
  const frame = useCurrentFrame(), { fps } = useVideoConfig();

  useLayoutEffect(() => {
    field.current = window.Shaderfield.mount(ref.current, { effect: "current", palette: "plasma", autoplay: false, interactive: false });
    return () => field.current.destroy();
  }, []);

  useLayoutEffect(() => {
    field.current.set("speed", 1);
    field.current.render(frame / fps);
  }, [frame]);

  return <AbsoluteFill ref={ref} />;
};
```

To ramp a parameter over a scene (for example, raising energy for a beat), set it before each render:

```js
field.set("current", interpolate(frame, [30, 60], [0.4, 1.8]));
field.render(frame / fps);
```

> The Mesh shader is a physics simulation. Rendering is deterministic when frames are rendered in order from 0. Seeking backwards re-simulates from the start.

See `examples/video-frames.html` for a scrubber with recording.

---

## Using it with AI coding agents

Every shader page in the site has an **AI prompt** tab with two variants:

- **For a website**: tells the agent where `shaderfield.js` lives, gives it the exact `<shader-field>` tag with your tuned values, and sets the layering and contrast rules.
- **For a video**: tells the agent to build a frame-accurate background plate in Remotion (or any frame renderer) with `render(frame / fps)`.

Workflow:

1. Open a shader in the site and tune the palette and parameters.
2. Open **AI prompt**, choose *For a website* or *For a video*, and press **Copy**.
3. Put `shaderfield.js` in your project and paste the prompt into your agent.

Because the prompt includes every value, the agent reproduces the exact look you tuned instead of guessing.

---

## Shader reference

Every shader also accepts `speed` (0–3, default 1).

### Current, from *Blastlabs Flow*
Line-integral flow streaks that speed up, heat up and bend around the cursor. Renders at half resolution because it is heavy per pixel.
Interaction: the cursor bends the flow. Default palette: `plasma`.

| Param | Range | Default |
|---|---|---|
| `scale` | 0.4 – 3 | 1.2 |
| `current` | 0 – 2 | 0.7 |
| `length` (trail) | 6 – 80 | 32 |
| `density` | 0 – 1 | 0.55 |

### Fret, from *Nodepath Launch*
Truchet arcs that join into endless circuits, with light pulses running along every path.
Interaction: the cursor swirls the grid, and a click sends a shockwave. Default palette: `ion`.

| Param | Range | Default |
|---|---|---|
| `cell` | 10 – 60 | 24 |
| `line` | 0.5 – 4 | 1.3 |
| `glow` | 0 – 1 | 0.6 |
| `pulse` | 0 – 1.5 | 1 |
| `weld` | 0 – 1 | 0.2 |
| `warp` (swirl) | 0 – 1 | 0.15 |
| `split` (chroma split) | 0 – 4 | 0.6 |

### Skein, from *Weftline Launch*
Woven filaments that ripple at their own pace, drift sideways and draw in from the left.
Interaction: a click sends a shockwave. Default palette: `aurora`.

| Param | Range | Default |
|---|---|---|
| `cell` (spacing) | 10 – 60 | 22 |
| `line` | 0.5 – 4 | 1.3 |
| `wave` | 0 – 1.5 | 0.55 |
| `vary` (variety) | 0 – 1 | 0.7 |
| `tilt` | −45 – 45° | −8 |
| `scatter` | 0 – 1 | 0.5 |
| `depth` | 0 – 1 | 0.6 |
| `glow` | 0 – 1 | 0.6 |
| `draw` (draw-in) | 0 – 1 | 1 |
| `split` (chroma split) | 0 – 4 | 0.4 |

Tip: animate `draw` from 0 to 1 for an entrance.

### Harmonia, from *Harmonia Launch*
Times-table chords on a circle. As the multiplier drifts, cardioids, nephroids and roses appear.
Interaction: horizontal cursor position shifts the multiplier. Default palette: `ion`.

| Param | Range | Default |
|---|---|---|
| `points` | 20 – 150 | 120 |
| `mult` (multiplier) | 2 – 40 | 2 |
| `drift` | 0 – 0.5 | 0.06 |
| `radius` | 0.2 – 0.48 | 0.38 |
| `line` | 0.3 – 2 | 0.7 |
| `glow` | 0 – 1.5 | 0.8 |
| `dots` | 0 – 1 | 0.5 |
| `field` | 0 – 1 | 0.35 |
| `ring` | 0 – 1 | 0.5 |

### Halo, from *Gloww Announcement* and *Coming Soon*
A soft radial bloom with a slowly orbiting focal point. Made for hero backgrounds.
Interaction: the cursor pulls the focal point. Default palette: `aqua`.

| Param | Range | Default |
|---|---|---|
| `radius` | 0.1 – 1.4 | 0.8 |
| `falloff` | 0.05 – 0.6 | 0.24 |
| `focal` | 0 – 1 | 0.7 |
| `spin` (orbit, °/s) | 0 – 60 | 14 |
| `core` | 0 – 1 | 0.8 |
| `grain` | 0 – 0.15 | 0.03 |

### Thermal, from *Shader Trials Announcement*
Drifting heat sources merge into a banded thermal map.
Interaction: the cursor adds heat. Default palette: `heat`.

| Param | Range | Default |
|---|---|---|
| `blobs` (sources) | 1 – 6 | 5 |
| `size` | 0.4 – 2 | 1 |
| `bands` | 2 – 24 | 9 |
| `contour` | 0 – 1 | 0.5 |
| `glow` | 0 – 1 | 0.6 |
| `grain` | 0 – 0.15 | 0.03 |

### Mesh, from *Kinetic Opening* (Canvas 2D)
A spring lattice that glows by tension. Every kick travels across it like a struck net.
Interaction: moving the cursor pushes the lattice, and a click strikes it. Palettes: `ember`, `ion`, `aurora`, `mono`.

| Param | Range | Default |
|---|---|---|
| `energy` | 0 – 2 | 1 |
| `stiffness` | 0.04 – 0.3 | 0.12 |
| `damping` | 0.95 – 0.995 | 0.978 |
| `kicks` (per second) | 0 – 3 | 0.8 |

---

## Palettes

Each palette has four colours. The shaders blend between them.

| Name | Look | Default for |
|---|---|---|
| `ion` | blue, violet, cyan, rose | Fret, Harmonia |
| `plasma` | indigo, orange, magenta, deep violet | Current |
| `solar` | rust, cream, orange, oxblood | |
| `ember` | orange, gold, pink, purple | Mesh |
| `aurora` | mint, azure, lime, teal | Skein |
| `aqua` | sky, aqua, white, navy | Halo |
| `heat` | blue, red-orange, yellow, deep navy | Thermal |
| `mono` | cool greys | |

You can add your own at runtime. Use RGB values from 0 to 1:

```js
Shaderfield.PALETTES.brand = [[0.98, 0.36, 0.2], [1, 0.8, 0.4], [0.2, 0.5, 1], [0.08, 0.06, 0.2]];
field.setPalette("brand");
```

---

## JavaScript API

```js
const field = Shaderfield.mount(element, {
  effect: "current",       // shader id
  palette: "plasma",       // optional
  params: { scale: 1.2 },  // optional overrides
  interactive: true,       // cursor + click input (default true for mount)
  autoplay: true,          // false = draw only on render(t)
  time: 0                  // starting clock in seconds
});
```

| Method | Description |
|---|---|
| `field.setEffect(id, palette?, params?)` | Switch effect in place |
| `field.set(key, value)` / `field.set({ … })` | Change one or many parameters |
| `field.setPalette(name)` | Change palette |
| `field.render(seconds)` | Draw one deterministic frame |
| `field.record({ seconds, width, height, fps, bitrate, onProgress })` | Returns a `Promise<Blob>` video |
| `field.png()` | Returns a PNG data URL of the current frame |
| `field.paused` | Set `true` or `false` to stop or resume the clock |
| `field.params`, `field.palette`, `field.id` | Current state |
| `field.destroy()` | Remove the canvas and listeners |

Globals:

| | |
|---|---|
| `Shaderfield.EFFECTS` | Effect metadata: name, source, params with ranges and defaults, description |
| `Shaderfield.ORDER` | Effect ids in display order |
| `Shaderfield.PALETTES` | Palette table (mutable) |
| `Shaderfield.css(rgb)` | `[r,g,b]` (0–1) → `"rgb(…)"` |
| `Shaderfield.motion` | Motion helpers, below |

---

## Motion effects reference

All helpers are in `Shaderfield.motion`. Helpers that run once return a **Promise** that resolves when they finish. Helpers that run continuously return a **stop function**.

### Text

| Helper | From | Usage |
|---|---|---|
| `typeIn(el, { mode, accent, delay })` | Nodepath Launch | Letter entrances. `mode`: `soft`, `decode`, `flip`, `scatter`, `glitch`. `accent`: two colours used for the chromatic split. |
| `rise(el, { by, stagger, duration, ease, out, delay })` | Gloww, Blastlabs, Closebook, Orfa Agents | Masked rise per `"char"` or `"word"`. `out: true` runs the exit. |
| `countUp(el, { from, to, decimals, prefix, suffix, duration, delay })` | Tended HR, Closebook | Expo number tween with tabular figures. |
| `revealWords(el, { dim, accent })` → stop | Tended HR, Closebook | Scroll-linked word reveal. Wrap words in `*asterisks*` to accent them. |

### Interface

| Helper | From | Usage |
|---|---|---|
| `tick(el, { color, size, delay })` | Tended HR, Closebook | A check pops in with overshoot. |
| `bars(el, { values, color, height, stagger })` | Tended HR, Orfa Agents | Staggered progress bars. |
| `springFollow(el, area, { stiffness, damping })` → stop | Cursor Gallery | A label follows the cursor on a spring. Use `stop.set({ stiffness, damping })`. |

### Transitions

| Helper | From | Usage |
|---|---|---|
| `curtain(el, { color, cols, cover, fade, hold, seed, onSwap })` | Closebook Launch | Pixel cells cover, `onSwap` runs, then they clear. |

### Building blocks

| | |
|---|---|
| `ease` | `out`, `expo`, `back`, `in`, `inOut`, `smooth`, `pop`, `spring` (all take 0–1) |
| `play(seconds, fn)` | Calls `fn(t)` every frame for `seconds`, then resolves |
| `loop(fn)` → stop | Calls `fn(t)` every frame until stopped |

---

## Performance and accessibility

- **One shared GPU context.** Browsers cap live WebGL contexts at about 8–16. Shaderfield renders every shader through a single shared context and copies each frame into that field's own canvas, so any number of fields can be on a page.
- **Off-screen fields sleep.** Only fields in or near the viewport are drawn.
- **Resolution.** Fields render at device pixel ratio (capped at 2) times the effect's internal scale. Current renders at half resolution because it is heavy per pixel.
- **Reduced motion.** When `prefers-reduced-motion: reduce` is set, fields hold a still frame. Pass `respectReducedMotion: false` to `mount` to override this.
- **Text effects stay readable.** `typeIn` and `rise` put the full text in `aria-label` and mark their animated spans `aria-hidden`.

---

## Browser support

Current Chrome, Edge, Safari and Firefox on desktop and mobile. Requires WebGL 1. Video recording uses `MediaRecorder`: Safari records MP4, while Chrome and Firefox record WebM.

---

## Credits and license

MIT. See `LICENSE`.

- **Fret** and **Skein** are adapted from *fret (Burnish)* and *skein (Filament)* by E. T. Carter (shader.gallery), MIT.
- **Halo** and **Thermal** are native rewrites inspired by Paper Shaders' StaticRadialGradient and Heatmap. No Paper Shaders code is included.
- **Current**, **Harmonia**, **Mesh** and all motion helpers come from the Shaders Lab films.
