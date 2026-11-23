<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Column Rise

Stepped columns of colour rise to cover the frame, the scene swaps, then they retreat upward.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.columnWipe` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#column-rise) |

## Signature

```js
Shaderfield.motion.columnWipe(el, { cols, color, step, mode, onSwap })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `cols`
- `color`
- `step`
- `mode`
- `onSwap`

Stepped columns rise to cover, swap, then retreat upward.

## Example

```js
Shaderfield.motion.columnWipe(stage, { cols: 16, color: "#0ea5e9", onSwap: () => showNext() });
// mode: "both" | "in" | "out"
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
