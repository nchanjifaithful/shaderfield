<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Glow Bed

<img src="../../assets/thumbs/hearth.png" width="320" height="200" alt="Glow Bed preview">

A bed of soft light breathes and sways along the bottom edge.

| | |
|---|---|
| **ID** | `hearth` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to stoke the glow; flames near the cursor grow taller and brighter |
| **Default palette** | `aurora` |
| **Works with** | `aurora`, `ion`, `ember`, `synth` |
| **Live demo** | [Open in the library](../../components.html#hearth) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="hearth" palette="aurora" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "hearth",
  palette: "aurora",
  params: { intensity: 1 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Intensity | `intensity` | 0.2 – 2 | 1 |
| Height | `height` | 0.4 – 1.8 | 1 |
| Sway | `sway` | 0 – 3 | 1 |
| Dot grid | `dots` | 0 – 1 | 1 |
| Grain | `grain` | 0 – 0.2 | 0.06 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
