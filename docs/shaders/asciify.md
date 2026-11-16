<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# ASCII Text

<img src="../../assets/thumbs/asciify.png" width="320" height="200" alt="ASCII Text preview">

Crisp text wipes into ASCII glyphs, a scan band lights and densifies the characters it crosses, then the text wipes back.

| | |
|---|---|
| **ID** | `asciify` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to hold the ASCII and steer the scan |
| **Default palette** | `mint` |
| **Works with** | `mint`, `ledger`, `phosphor`, `cobalt` |
| **Default text** | “Quietly.” |
| **Live demo** | [Open in the library](../../components.html#asciify) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="asciify" palette="mint" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "asciify",
  palette: "mint",
  params: { cycle: 5.5 }
});
```

Set your own text with the `text` attribute or `field.setText()`. Separate lines with `|`.

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Cycle | `cycle` | 3 – 12s | 5.5 |
| Scan width | `radius` | 0.03 – 0.4 | 0.12 |
| Softness | `softness` | 0 – 1 | 0.5 |
| Glyph | `glyph` | 0.5 – 4 | 2 |
| Dots | `dots` | 0 – 1 | 0 |
| Charset | `charset` | 0 – 2 | 0 |
| Glow | `glow` | 0 – 1 | 0.6 |
| Chroma split | `split` | 0 – 1 | 0.3 |
| Invert | `invert` | 0 – 1 | 0 |
| Paper | `paper` | 0 – 1 | 0 |
| Text size | `size` | 0.05 – 0.5 | 0.34 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
