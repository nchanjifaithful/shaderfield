<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Sparkle

<img src="../../assets/shader-previews/sparkle.png" width="320" height="200" alt="Sparkle preview">

A sparkle spins in and punches through to colour, then the field closes back into a star and bursts into a twinkle of glints and sparks.

| | |
|---|---|
| **ID** | `sparkle` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to place the sparkle |
| **Default palette** | `idea` |
| **Works with** | `idea`, `ion`, `aurora`, `ember` |
| **Live demo** | [Open in the library](../../components.html#sparkle) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="sparkle" palette="idea" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "sparkle",
  palette: "idea",
  params: { size: 1.4 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Size | `size` | 0.4 – 3 | 1.4 |
| Cycle | `cycle` | 4 – 14s | 5 |
| Flow | `flow` | 0 – 4 | 1 |
| Glow | `glow` | 0.2 – 1.6 | 1 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
