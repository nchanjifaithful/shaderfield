<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Count Up

Numbers count up on an expo ease with steady-width digits.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.countUp` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#count-up) |

## Signature

```js
Shaderfield.motion.countUp(el, { from, to, decimals, prefix, suffix, duration, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `from`
- `to`
- `decimals`
- `prefix`
- `suffix`
- `duration`
- `delay`

Expo number tween with tabular figures.

## Example

```js
Shaderfield.motion.countUp(el, { to: 4212.5, decimals: 2, prefix: "€", duration: 1.6 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
