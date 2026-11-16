<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Light Surge

<img src="../../assets/thumbs/lightsurge.png" width="320" height="200" alt="Light Surge preview">

Columns of light rise from the floor over a colour wash, sway, then lift away on a cycle. Time a cut to the peak.

| | |
|---|---|
| **ID** | `lightsurge` |
| **Renderer** | Canvas 2D |
| **Interaction** | None |
| **Default palette** | `aurora` |
| **Works with** | `aurora`, `ion`, `ember`, `synth` |
| **Live demo** | [Open in the library](../../components.html#lightsurge) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="lightsurge" palette="aurora"
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "lightsurge",
  palette: "aurora",
  params: { intensity: 1 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Intensity | `intensity` | 0.2 – 2 | 1 |
| Cycle | `cycle` | 4 – 16s | 6 |
| Dot grid | `dots` | 0 – 1 | 0 |
| Grain | `grain` | 0 – 0.2 | 0.05 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
