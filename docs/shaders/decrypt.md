<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Decode Lens

<img src="../../assets/thumbs/decrypt.png" width="320" height="200" alt="Decode Lens preview">

Text is rebuilt from best-fit glyphs and kept scrambled. A lens with a glowing, aberrated rim decodes it as it passes.

| | |
|---|---|
| **ID** | `decrypt` |
| **Renderer** | GLSL · WebGL 2 |
| **Interaction** | Move to decode |
| **Default palette** | `aqua` |
| **Works with** | `aqua`, `ion`, `phosphor`, `ember` |
| **Default text** | “Something is thinking.” |
| **Live demo** | [Open in the library](../../components.html#decrypt) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="decrypt" palette="aqua" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "decrypt",
  palette: "aqua",
  params: { radius: 0.34 }
});
```

Set your own text with the `text` attribute or `field.setText()`. Separate lines with `|`.

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Lens | `radius` | 0.05 – 1 | 0.34 |
| Softness | `softness` | 0.02 – 1 | 0.5 |
| Cell | `cell` | 8 – 32 | 15 |
| Scramble | `scramble` | 0 – 1 | 0.1 |
| Edge glow | `edge` | 0 – 4 | 2 |
| Chroma split | `split` | 0 – 30 | 10 |
| Pass-through | `pass` | 0 – 1 | 0.15 |
| Text size | `size` | 0.04 – 0.25 | 0.12 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
