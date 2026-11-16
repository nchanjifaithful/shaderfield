<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Curtain

Pixel cells cover, `onSwap` runs, then they clear.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.curtain` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |

## Signature

```js
Shaderfield.motion.curtain(el, { color, cols, cover, fade, hold, seed, onSwap })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `cols`
- `cover`
- `fade`
- `hold`
- `seed`
- `onSwap`

## Example

```js
Shaderfield.motion.curtain(el, {});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
