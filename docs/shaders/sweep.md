<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Glyph Sweep

<img src="../../assets/shader-previews/glyph-sweep.png" width="320" height="200" alt="Glyph Sweep preview">

A band of glyphs sweeps across the frame, tears the scanlines and swaps one line of text for the next.

| | |
|---|---|
| **ID** | `sweep` |
| **Renderer** | GLSL · WebGL 2 |
| **Interaction** | Move across to scrub the sweep |
| **Default palette** | `phosphor` |
| **Works with** | `phosphor`, `cobalt`, `ledger`, `ember` |
| **Default text** | “Every few centuries, the ground shifts.”<br>“AI is turning thought into infrastructure.”<br>“This is our industrial revolution.” |
| **Live demo** | [Open in the library](../../components.html#sweep) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="sweep" palette="phosphor" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "sweep",
  palette: "phosphor",
  params: { glyph: 2 }
});
```

Set your own text with the `text` attribute or `field.setText()`. Separate lines with `|`.

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Glyph | `glyph` | 0.5 – 4 | 2 |
| Band | `band` | 0.05 – 0.6 | 0.28 |
| Trail | `trail` | 0 – 2 | 0.75 |
| Turbulence | `turbulence` | 0 – 1 | 0.5 |
| Glow | `glow` | 0 – 2 | 2 |
| Chroma split | `split` | 0 – 12 | 5 |
| Tear | `tear` | 0 – 40 | 14 |
| Flicker | `flicker` | 0 – 1 | 0.35 |
| Hold | `hold` | 0.4 – 6s | 1.1 |
| Charset | `charset` | 0 – 2 | 0 |
| Text size | `size` | 0.02 – 0.12 | 0.045 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
