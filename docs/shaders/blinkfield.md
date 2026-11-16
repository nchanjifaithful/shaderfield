<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Square Field

<img src="../../assets/shader-previews/square-field.png" width="320" height="200" alt="Square Field preview">

A floor of blinking squares rises and falls on a slow tide with a bright crest.

| | |
|---|---|
| **ID** | `blinkfield` |
| **Renderer** | Canvas 2D |
| **Interaction** | Move to stir the squares |
| **Default palette** | `sky` |
| **Works with** | `sky`, `mint`, `ledger`, `phosphor`, `cobalt`, `ember` |
| **Live demo** | [Open in the library](../../components.html#blinkfield) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="blinkfield" palette="sky" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "blinkfield",
  palette: "sky",
  params: { square: 44 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Square | `square` | 4 – 80 | 44 |
| Gap | `gap` | 0 – 24 | 10 |
| Height | `field` | 0.1 – 1 | 0.92 |
| Tide | `cycle` | 3 – 20s | 8 |
| Density | `density` | 0.02 – 0.4 | 0.16 |
| Edge fade | `edges` | 0 – 3 | 0 |
| Paper | `paper` | 0 – 1 | 1 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
