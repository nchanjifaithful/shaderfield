<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Drag Swap

A card lifts with a tilt and a shadow, travels to another slot while that card glides back, and the two trade places.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.dragSwap` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#drag-swap) |

## Signature

```js
Shaderfield.motion.dragSwap(a, b, { duration, commit })
```

| Argument | Description |
|---|---|
| `a` | The element to move from or to. |
| `b` | The element to move from or to. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `commit`

`a` lifts and trades places with `b`.

## Example

```js
await Shaderfield.motion.dragSwap(cardD, cardB);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
