<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Mark Expand

The logo mark grows until it fills the frame with its colour, ready for the next scene.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.markExpand` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#mark-expand) |

## Signature

```js
Shaderfield.motion.markExpand(mark, { stage, color, keep, onSwap })
```

| Argument | Description |
|---|---|
| `mark` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `stage`
- `color`
- `keep`
- `onSwap`

The logo mark grows to fill the frame with its colour.

## Example

```js
await Shaderfield.motion.markExpand(mark, { stage, keep: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
