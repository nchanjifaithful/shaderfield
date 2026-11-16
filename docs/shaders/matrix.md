<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Matrix

<img src="../../assets/shader-previews/matrix.png" width="320" height="200" alt="Matrix preview">

Columns of green glyph rain fall over a line of text. Each falling head lights the words it passes.

| | |
|---|---|
| **ID** | `matrix` |
| **Renderer** | GLSL · WebGL 2 |
| **Interaction** | None |
| **Default palette** | `phosphor` |
| **Works with** | `phosphor`, `cobalt`, `ember`, `mono` |
| **Default text** | “Are we living in the matrix?” |
| **Live demo** | [Open in the library](../../components.html#matrix) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="matrix" palette="phosphor"
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "matrix",
  palette: "phosphor",
  params: { cell: 15 }
});
```

Set your own text with the `text` attribute or `field.setText()`. Separate lines with `|`.

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Cell | `cell` | 8 – 40 | 15 |
| Fall | `rate` | 0.05 – 1 | 0.2 |
| Density | `density` | 0.02 – 0.8 | 0.32 |
| Trail | `trail` | 0.2 – 3 | 1.4 |
| Glow | `glow` | 0 – 3 | 1.75 |
| Light | `light` | 0 – 3 | 1.2 |
| Layers | `layers` | 1 – 3 | 2 |
| Mutate | `mutate` | 0 – 3 | 0 |
| Text | `show` | 0 – 1 | 1 |
| Text size | `size` | 0.02 – 0.14 | 0.056 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
