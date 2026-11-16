<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Silk Swirl

<img src="../../assets/shader-previews/silk-swirl.png" width="320" height="200" alt="Silk Swirl preview">

Silk bands spiral in toward the centre and keep turning. A native rewrite; no third-party shader code.

| | |
|---|---|
| **ID** | `swirl` |
| **Renderer** | GLSL · WebGL |
| **Interaction** | Move to shift the centre |
| **Default palette** | `silk` |
| **Works with** | `silk`, `ember`, `dusk`, `aurora`, `mono` |
| **Live demo** | [Open in the library](../../components.html#swirl) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="swirl" palette="silk" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "swirl",
  palette: "silk",
  params: { bands: 4 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Bands | `bands` | 1 – 8 | 4 |
| Twist | `twist` | 0 – 1 | 0.42 |
| Spin | `spin` | 0 – 4 | 1.4 |
| Softness | `soft` | 0 – 1 | 0 |
| Noise | `noise` | 0 – 0.6 | 0.2 |
| Scale | `scale` | 0.4 – 2 | 1 |
| Grain | `grain` | 0 – 0.15 | 0.02 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
