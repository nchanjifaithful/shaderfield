<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Particle Portrait

<img src="../../assets/shader-previews/particle-portrait.png" width="320" height="200" alt="Particle Portrait preview">

Thousands of particles orbit in a tilted ring, then swirl in to rebuild an image, catch a sweep of light and unravel again.

| | |
|---|---|
| **ID** | `assemble` |
| **Renderer** | GLSL · WebGL |
| **Interaction** | Move to turn it · set src for your own image |
| **Default palette** | `solar` |
| **Works with** | `solar`, `mono`, `ember` |
| **Live demo** | [Open in the library](../../components.html#assemble) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="assemble" palette="solar" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "assemble",
  palette: "solar",
  params: { grain: 3 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Density | `grain` | 2 – 6 | 3 |
| Scale | `scale` | 0.4 – 1.6 | 1 |
| Offset | `offset` | -0.4 – 0.4 | 0 |
| Cycle | `cycle` | 5 – 20s | 10 |
| Bloom | `bloom` | 0 – 1.5 | 0.9 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
