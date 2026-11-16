<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Orbit Rings

<img src="../../assets/shader-previews/orbit-rings.png" width="320" height="200" alt="Orbit Rings preview">

Tilted rings with tick marks sway round a haloed core over a faint starfield. Comets with fading tails pass behind and in front of the core.

| | |
|---|---|
| **ID** | `orbits` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to tilt the rings |
| **Default palette** | `mono` |
| **Works with** | `mono`, `aqua`, `ember`, `aurora` |
| **Live demo** | [Open in the library](../../components.html#orbits) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="orbits" palette="mono" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "orbits",
  palette: "mono",
  params: { scale: 0.9 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Scale | `scale` | 0.3 – 1.6 | 0.9 |
| Orbit | `rate` | 0 – 3 | 1 |
| Sway | `sway` | 0 – 3 | 1 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
