<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Magnet Snap

<img src="../../assets/shader-previews/magnet-snap.png" width="320" height="200" alt="Magnet Snap preview">

Filings at rest catch a passing magnet, then collapse inward and lock into a 5×5 mark around it before letting go.

| | |
|---|---|
| **ID** | `gather` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to pull the filings |
| **Default palette** | `mono` |
| **Works with** | `mono` |
| **Live demo** | [Open in the library](../../components.html#gather) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="gather" palette="mono" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "gather",
  palette: "mono",
  params: { cell: 60 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Cell | `cell` | 24 – 120 | 60 |
| Zoom | `zoom` | 1 – 2.5 | 1.6 |
| Cycle | `cycle` | 6 – 24s | 10 |
| Paper | `paper` | 0 – 1 | 1 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
