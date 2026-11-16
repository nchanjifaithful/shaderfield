<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Line Draw

A hairline frame and an underline draw themselves in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.drawLine` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#line-draw) |

## Signature

```js
Shaderfield.motion.drawLine(el, { delay, duration, origin })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `delay`
- `duration`
- `origin`

An underline draws in with `scaleX`.

## Example

```js
Shaderfield.motion.drawFrame(box, { color: "#0ea5e9" });
Shaderfield.motion.drawLine(rule, { delay: 0.4 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
