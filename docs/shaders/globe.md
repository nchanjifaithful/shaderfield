<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Dot Globe

<img src="../../assets/shader-previews/dot-globe.png" width="320" height="200" alt="Dot Globe preview">

A globe of dots turns slowly. Land on the near side lights up and pings.

| | |
|---|---|
| **ID** | `globe` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to turn the globe |
| **Default palette** | `cobalt` |
| **Works with** | `cobalt`, `aqua`, `mint`, `ember`, `mono` |
| **Live demo** | [Open in the library](../../components.html#globe) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="globe" palette="cobalt" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "globe",
  palette: "cobalt",
  params: { size: 0.62 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Size | `size` | 0.3 – 1.4 | 0.62 |
| Spin | `rate` | 0 – 2 | 0.45 |
| Tilt | `tilt` | −40 – 40° | 16 |
| Land | `density` | 0.1 – 1 | 0.5 |
| Dot | `dot` | 0.4 – 3 | 1 |
| Glow | `glow` | 0 – 1.5 | 0.7 |
| Pings | `pings` | 0 – 1 | 0.6 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
