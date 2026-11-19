<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Radial Reveal

Elements appear in a ring that grows from the centre.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.radialReveal` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#radial-reveal) |

## Signature

```js
Shaderfield.motion.radialReveal(el, { duration, spread, shape, jitter, out })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `spread`
- `shape`
- `jitter`
- `out`

Children appear by distance from the centre. `shape: "square"` grows in rings, `out: true` pops them away.

## Example

```js
Shaderfield.motion.radialReveal(grid, { duration: 1.4, spread: 0.25 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
