<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Circle Sweep

Two large discs sweep in, cover the frame for the swap, then sweep out the other side.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.circleSweep` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#circle-sweep) |

## Signature

```js
Shaderfield.motion.circleSweep(el, { color, color2, duration, lag, onSwap })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `color2`
- `duration`
- `lag`
- `onSwap`

Two large discs sweep in, cover the frame for the swap, then sweep out.

## Example

```js
Shaderfield.motion.circleSweep(stage, { color: "#0ea5e9", onSwap: () => showNext() });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
