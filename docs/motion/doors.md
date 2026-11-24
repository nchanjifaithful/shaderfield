<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Doors

Two panels slide in from the sides with ragged edges, meet in the middle for the swap, then part.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.doors` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#doors) |

## Signature

```js
Shaderfield.motion.doors(el, { color, close, open, onSwap })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `close`
- `open`
- `onSwap`

Two ragged panels meet in the middle, swap, then part.

## Example

```js
Shaderfield.motion.doors(stage, { color: "#0ea5e9", onSwap: () => showNext() });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
