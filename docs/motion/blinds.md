<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Blinds

Horizontal bands close from their centre lines in a ragged order, the scene swaps, and they open again.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.blinds` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#blinds) |

## Signature

```js
Shaderfield.motion.blinds(el, { bands, color, close, open, onSwap })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `bands`
- `color`
- `close`
- `open`
- `onSwap`

Bands close from their centre lines, the scene swaps, they open.

## Example

```js
Shaderfield.motion.blinds(stage, { bands: 12, color: "#0ea5e9", onSwap: () => showNext() });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
