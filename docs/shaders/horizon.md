<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Synth Valley

<img src="../../assets/thumbs/horizon.png" width="320" height="200" alt="Synth Valley preview">

A striped sun rises behind a wireframe valley that flies toward the camera.

| | |
|---|---|
| **ID** | `horizon` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to steer |
| **Default palette** | `synth` |
| **Works with** | `synth`, `aqua`, `aurora`, `ember` |
| **Live demo** | [Open in the library](../../components.html#horizon) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="horizon" palette="synth" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "horizon",
  palette: "synth",
  params: { rate: 2 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Flight | `rate` | 0 – 6 | 2 |
| Peaks | `peaks` | 0 – 2.5 | 1 |
| Sun | `sun` | 0.4 – 1.6 | 1 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
