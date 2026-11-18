<p align="center">
  <img src="assets/readme-banner.svg" alt="Shaderfield" width="640">
</p>

<p align="center">
  Live shaders and motion effects for websites and motion video.<br>
  One dependency-free JavaScript file.
</p>

<p align="center">
  <a href="https://shaderfield.pages.dev">Website</a> &nbsp;·&nbsp;
  <a href="https://shaderfield.pages.dev/components.html">Component library</a> &nbsp;·&nbsp;
  <a href="docs/README.md">Documentation</a> &nbsp;·&nbsp;
  <a href="LICENSE">MIT License</a>
</p>

## Overview

- **31 shaders.** GLSL fields, text and glyph shaders, particles, Canvas 2D scenes and an optional 3D glass add-on. Each has its own parameters, palettes, cursor interaction, PNG export and video recording.
- **32 motion effects.** Text entrances, interface micro-motion, scene transitions and light, all on plain DOM elements.
- **Three ways to use it.** A `<shader-field>` HTML element for websites, a frame-accurate `render(t)` API for video tools, and a ready-made prompt for AI coding agents.

The repository also contains the Shaderfield site: a component browser where you can try every effect live, tune it, and copy the code, a prompt or a video render.

## Contents

- [Quick start](#quick-start)
- [Using the shaders on a website](#using-the-shaders-on-a-website)
- [Using the shaders in motion video](#using-the-shaders-in-motion-video)
- [Using it with AI coding agents](#using-it-with-ai-coding-agents)
- [Components](#components)
- [Palettes](#palettes)
- [JavaScript API](#javascript-api)
- [Motion effects](#motion-effects)
- [Performance and accessibility](#performance-and-accessibility)
- [Browser support](#browser-support)
- [Repository layout](#repository-layout)
- [Author and license](#author-and-license)

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
| `effect`      | Shader id. See the [shader catalog](docs/README.md#shaders). |
| `palette`     | Palette name (see [Palettes](#palettes)). If omitted, the effect's default is used. |
| `interactive` | Turns on cursor and click input |
| `speed`       | Time multiplier. `0` freezes, `1` is normal, `3` is fast. |
| *any parameter* | Every parameter in the [shader catalog](docs/README.md#shaders) is an attribute |

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

## Using it with AI coding agents

Every shader page in the site has an **AI prompt** tab with two variants:

- **For a website**: tells the agent where `shaderfield.js` lives, gives it the exact `<shader-field>` tag with your tuned values, and sets the layering and contrast rules.
- **For a video**: tells the agent to build a frame-accurate background plate in Remotion (or any frame renderer) with `render(frame / fps)`.

Workflow:

1. Open a shader in the site and tune the palette and parameters.
2. Open **AI prompt**, choose *For a website* or *For a video*, and press **Copy**.
3. Put `shaderfield.js` in your project and paste the prompt into your agent.

Because the prompt includes every value, the agent reproduces the exact look you tuned instead of guessing.

## Components

Each component has its own page with usage, parameters or options, and a link to its live demo. Browse them all in the [component catalog](docs/README.md).

### Shaders

[Flow Streaks](docs/shaders/current.md) · [Circuit Arcs](docs/shaders/fret.md) · [Woven Lines](docs/shaders/skein.md) · [Chord Circle](docs/shaders/harmonia.md) · [Radial Bloom](docs/shaders/halo.md) · [Heat Map](docs/shaders/thermal.md) · [Spring Net](docs/shaders/mesh.md) · [Decode Lens](docs/shaders/decrypt.md) · [Cipher Wall](docs/shaders/datawall.md) · [Sand Text](docs/shaders/sand.md) · [Particle Portrait](docs/shaders/assemble.md) · [Aurora](docs/shaders/aurora.md) · [Synth Valley](docs/shaders/horizon.md) · [Square Text](docs/shaders/blink.md) · [Square Field](docs/shaders/blinkfield.md) · [Sparkle](docs/shaders/sparkle.md) · [Iron Filings](docs/shaders/filings.md) · [Magnet Snap](docs/shaders/gather.md) · [Cube Tunnel](docs/shaders/lattice.md) · [Orbit Rings](docs/shaders/orbits.md) · [Glow Bed](docs/shaders/hearth.md) · [Light Surge](docs/shaders/lightsurge.md) · [Silk Swirl](docs/shaders/swirl.md) · [Wave Bands](docs/shaders/waves.md) · [Stage Light](docs/shaders/stage.md) · [Dot Globe](docs/shaders/globe.md) · [Glyph Sweep](docs/shaders/sweep.md) · [Matrix](docs/shaders/matrix.md) · [ASCII Text](docs/shaders/asciify.md) · [Glyph Graph](docs/shaders/graph.md) · [Glass Icons](docs/shaders/glassicons.md)

Every shader also accepts `speed` (0–3, default 1).

### Text, images and switches
Shaders marked with a default text draw that text themselves. Set your own with the `text` attribute (or `Shaderfield.mount(el, { text })`, or `field.setText()`). Separate lines with `|`; effects that cycle (Sweep, Sand, Blink) step through them.

```html
<shader-field effect="sweep" text="Every few centuries, the ground shifts.|This is our industrial revolution."></shader-field>
<shader-field effect="assemble" src="statue.jpg"></shader-field>
```

`src` (or `field.setSource(imgOrCanvasOrVideo)`) gives Assemble its image; without one it uses `assets/assemble-default.jpg` next to the script. Params with a 0 – 1 range and step 1 (`paper`, `dots`, `invert`, `magnet`) are on/off switches. `charset`: 0 ascii, 1 blocks, 2 binary. Blink `edges`: 0 none, 1 left, 2 right, 3 radial.

WebGL2 shaders fall back to a blank canvas where WebGL2 is unavailable.

### 3D glass add-on
Glass Icons uses three.js, so it lives in a separate file that loads three.js from esm.sh the first time one is shown. The core file stays dependency-free.

```html
<script src="shaderfield.js"></script>
<script src="shaderfield-glass.js"></script>
<shader-field effect="glassicons"></shader-field>
```

### Motion effects

**Text.** [Type in](docs/motion/type-in.md) · [Letter Rise](docs/motion/rise.md) · [Line Rise](docs/motion/line-rise.md) · [Block Reveal](docs/motion/cut.md) · [Type Log](docs/motion/type-lines.md) · [Count Up](docs/motion/count-up.md) · [Reveal words](docs/motion/reveal-words.md) · [Type Swap](docs/motion/type-swap.md) · [Roll Words](docs/motion/roll-words.md) · [Scramble Solve](docs/motion/solve.md) · [Letter Pop](docs/motion/pop.md) · [Lyric Flow](docs/motion/lyric-flow.md)

**Interface.** [Tick Pop](docs/motion/tick.md) · [Progress Bars](docs/motion/bars.md) · [Focus Card](docs/motion/focus-card.md) · [Press Ripple](docs/motion/pressable.md) · [Signal Bars](docs/motion/signal-bars.md) · [Tab Morph](docs/motion/tab-morph.md) · [Spring follow](docs/motion/spring-follow.md) · [Bracket Hop](docs/motion/bracket-hop.md) · [Color Index](docs/motion/color-index.md) · [Disc Stack](docs/motion/disc-stack.md) · [Shine](docs/motion/shine.md) · [Typing Dots](docs/motion/typing-dots.md)

**Transitions.** [Curtain](docs/motion/curtain.md) · [Iris Close](docs/motion/iris.md) · [Line Draw](docs/motion/draw-frame.md) · [Line Draw](docs/motion/draw-line.md) · [Block Reveal](docs/motion/stripes.md) · [Camera Push](docs/motion/camera-push.md) · [Shock Ring](docs/motion/shock.md)

**Light.** [Glow Sheen](docs/motion/glow-text.md)

## Palettes

Each palette has four colours. The shaders blend between them.

| Name | Look | Default for |
|---|---|---|
| `ion` | blue, violet, cyan, rose | Circuit Arcs |
| `plasma` | indigo, orange, magenta, deep violet | Flow Streaks |
| `solar` | rust, cream, orange, oxblood | Chord Circle |
| `ember` | orange, gold, pink, purple | Mesh |
| `aurora` | mint, azure, lime, teal | Skein, Hearth |
| `aqua` | sky, aqua, white, navy | Halo |
| `heat` | blue, red-orange, yellow, deep navy | Thermal |
| `mono` | cool greys | Sand Text, Iron Filings, Magnet Snap, Cube Tunnel, Orbit Rings, Glass Icons |
| `phosphor` | terminal greens | Sweep, Matrix |
| `cobalt` | electric blues | Stage Light, Dot Globe |
| `sky` | sky blue, pale blue, ice, deep navy | Glyph Graph, Square Field |
| `dusk` | deep cobalt, muted violet, deep teal, clay | |
| `mint` | the site green, mint, pale mint, deep green | Square Text, Square Field, ASCII Text |
| `ledger` | green ink on paper | Asciify, Glyph Graph, Blink |
| `idea` | indigo, cyan, lilac, sky | Sparkle |
| `synth` | magenta, gold, pink, night | Horizon |
| `silk` | blush, coral, oxblood, maroon | Silk Swirl, Wave Bands |

You can add your own at runtime. Use RGB values from 0 to 1:

```js
Shaderfield.PALETTES.brand = [[0.98, 0.36, 0.2], [1, 0.8, 0.4], [0.2, 0.5, 1], [0.08, 0.06, 0.2]];
field.setPalette("brand");
```

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

## Motion effects

All helpers are in `Shaderfield.motion`. Helpers that run once return a **Promise** that resolves when they finish. Helpers that run continuously return a **stop function**. Each helper is documented on its own page in the [component catalog](docs/README.md#motion-effects).

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

## Browser support

Current Chrome, Edge, Safari and Firefox on desktop and mobile. Requires WebGL 1. Video recording uses `MediaRecorder`: Safari records MP4, while Chrome and Firefox record WebM.

## Repository layout

```
shaderfield/
├── shaderfield.js          The library. The only file most projects need.
├── shaderfield-glass.js    Optional add-on for the 3D glass shader (loads three.js).
├── docs/
│   ├── README.md           Component catalog
│   ├── shaders/            One page per shader
│   └── motion/             One page per motion effect
├── index.html              Landing page
├── components.html         Component library, lab and installation guide
├── Shaderfield.dc.html     Editable source of index.html
├── Components.dc.html      Editable source of components.html
├── support.js              Runtime for the site. Not needed for the library.
├── shaderfield-demos.js    Demo stages for the site. Not needed for the library.
├── assets/                 Logos, icons, social preview, shader previews and Assemble's default image
├── examples/               Hero background, motion and frame-by-frame examples
├── robots.txt, sitemap.xml, site.webmanifest
├── LICENSE
└── README.md
```

## Author and license

Shaderfield is designed and built by **Nchanji Faithful** ([GitHub](https://github.com/nchanjifaithful)).

Released under the [MIT License](LICENSE). You can use it in personal and commercial projects, modify it and redistribute it, as long as the copyright and license notice stay with the code.

- **Issues and ideas.** Open an issue on GitHub with the effect id, your browser and a short description or screen recording.
- **Contributing.** New shaders go in `shaderfield.js` with a 160 × 100 preview in `assets/shader-previews/` (named after the shader's display name, and added to `PREVIEW` in `index.html`) and a page in `docs/shaders/`. New motion helpers go in the `motion` export, with a demo in `shaderfield-demos.js` and a page in `docs/motion/`.
- **Versioning.** The site loads the library with a `?v=` cache key. Bump it on every release so visitors get the new file.
