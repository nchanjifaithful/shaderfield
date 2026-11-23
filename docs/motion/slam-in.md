<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Slam In

Oversized words fly in out of a blur, or drop from a giant zoom, then keep drifting.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.slamIn` |
| **Category** | Text |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#slam-in) |

## Signature

```js
Shaderfield.motion.slamIn(el, { from, distance, drift, blur, scale, duration, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `from`
- `distance`
- `drift`
- `blur`
- `scale`
- `duration`
- `delay`

Oversized type flies in out of a blur and keeps drifting. `from`: `left`, `right`, `up`, `down`, `zoom`.

## Example

```js
Shaderfield.motion.slamIn(line1, { from: "right" });
Shaderfield.motion.slamIn(line2, { from: "left", delay: 0.12 });
// from: "left" | "right" | "up" | "down" | "zoom"
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
