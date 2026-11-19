<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Light Flash

The frame snaps to light on a hit, then falls off fast.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.flash` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#flash) |

## Signature

```js
Shaderfield.motion.flash(el, { peak, color, blend, duration, attack })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `peak`
- `color`
- `blend`
- `duration`
- `attack`

The frame snaps to light, then falls off fast. Screen blend, `peak: 0.8`.

## Example

```js
Shaderfield.motion.flash(stage, { peak: 0.8, duration: 0.9 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
