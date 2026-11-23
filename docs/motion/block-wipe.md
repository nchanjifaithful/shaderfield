<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Block Wipe

A grid of blocks fills from one corner, the scene swaps, and the blocks clear in the same direction.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.blockWipe` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#block-wipe) |

## Signature

```js
Shaderfield.motion.blockWipe(el, { cell, from, color, onSwap })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `cell`
- `from`
- `color`
- `onSwap`

Blocks fill from a corner, swap, then clear the same way.

## Example

```js
Shaderfield.motion.blockWipe(stage, { from: "tr", color: "#0ea5e9", onSwap: () => showNext() });
// from: "tr" | "tl" | "br" | "bl" | "r" | "l"
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
