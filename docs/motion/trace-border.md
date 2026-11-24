<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Light</sub>

# Border Comet

A glowing comet races around a border, in one colour or a blend of hues.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.traceBorder` |
| **Category** | Light |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#border-comet) |

## Signature

```js
Shaderfield.motion.traceBorder(el, { color, hues, length, speed, width, glow, tail, radius })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `hues`
- `length`
- `speed`
- `width`
- `glow`
- `tail`
- `radius`

A glowing comet with a fading tail races around the border. Keep `el` free of `overflow: hidden`.

## Example

```js
const stop = Shaderfield.motion.traceBorder(button, {
  color: "#0ea5e9", length: 0.3, speed: 0.3
});
// multi-hue: { hues: ["#a78bfa", "#60a5fa", "#0ea5e9"] }
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
