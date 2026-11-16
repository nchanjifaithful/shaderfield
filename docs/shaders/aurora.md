<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Aurora

<img src="../../assets/shader-previews/aurora.png" width="320" height="200" alt="Aurora preview">

Aurora curtains sweep in from the left over a ridge and a rippling lake, flare, then fade to start again.

| | |
|---|---|
| **ID** | `aurora` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to lead the sweep |
| **Default palette** | `aurora` |
| **Works with** | `aurora`, `ember`, `aqua` |
| **Live demo** | [Open in the library](../../components.html#aurora) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="aurora" palette="aurora" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "aurora",
  palette: "aurora",
  params: { intensity: 1 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Intensity | `intensity` | 0.2 – 2 | 1 |
| Cycle | `cycle` | 5 – 20s | 9 |
| Reflection | `reflection` | 0 – 1 | 1 |
| Stars | `stars` | 0 – 1 | 1 |
| Grain | `grain` | 0 – 0.2 | 0.07 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
