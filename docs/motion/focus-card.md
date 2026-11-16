<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Focus Card

On hover, corner brackets snap in over a dot grid and spotlight.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.focusCard` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#focus-card) |

## Signature

```js
Shaderfield.motion.focusCard(el, { color })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`

Corner brackets, dot grid and spotlight on hover. `stop.set(1)` forces it on.

## Example

```js
const stop = Shaderfield.motion.focusCard(card, { color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
