<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Coverflow

Cards fan out in 3D around the one in focus and glide when it changes.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.coverflow` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#coverflow) |

## Signature

```js
Shaderfield.motion.coverflow(el, faces, { width, height, spread, rotate, hold, auto })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `faces` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `width`
- `height`
- `spread`
- `rotate`
- `hold`
- `auto`

Cards fan out in 3D around the focused one. `stop.next()`, `stop.set(i)`

## Example

```js
const flow = Shaderfield.motion.coverflow(el, ["a.jpg", "b.jpg", "c.jpg", "#0ea5e9"], { hold: 1.4 });
flow.next();
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
