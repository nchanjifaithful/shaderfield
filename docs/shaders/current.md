<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Shaders</sub>

# Flow Streaks

<img src="../../assets/shader-previews/flow-streaks.png" width="320" height="200" alt="Flow Streaks preview">

Line-integral flow streaks that speed up, heat up and bend around the cursor. Renders at half resolution because it is heavy per pixel.

| | |
|---|---|
| **ID** | `current` |
| **Renderer** | GLSL · WebGL |
| **Interaction** | The cursor bends the flow |
| **Default palette** | `plasma` |
| **Live demo** | [Open in the library](../../components.html#current) |

## Usage

### HTML

```html
<script src="shaderfield.js"></script>

<shader-field effect="current" palette="plasma" interactive
  style="position:absolute; inset:0"></shader-field>
```

### JavaScript

```js
const field = Shaderfield.mount(element, {
  effect: "current",
  palette: "plasma",
  params: { scale: 1.2 }
});
```

## Parameters

Every parameter is also an HTML attribute. Attributes are live: change one and the shader updates on the next frame.

| Parameter | Attribute | Range | Default |
|---|---|---|---|
| Scale | `scale` | 0.4 – 3 | 1.2 |
| Current | `current` | 0 – 2 | 0.7 |
| Trail | `length` | 6 – 80 | 32 |
| Density | `density` | 0 – 1 | 0.55 |
| Speed | `speed` | 0 – 3 | 1 |

## Export

- **PNG:** `field.png()` returns a data URL of the current frame.
- **Video:** `field.record({ seconds, width, height, fps })` returns a `Promise<Blob>`.
- **Frame by frame:** mount with `autoplay: false` and call `field.render(seconds)`. The same time always draws the same frame.

See the [JavaScript API](../../README.md#javascript-api) for every method.
