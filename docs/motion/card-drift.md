<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Card Drift

A deck of cards turned in 3D drifts along a diagonal, endlessly.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.cardDrift` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#card-drift) |

## Signature

```js
Shaderfield.motion.cardDrift(el, faces, { rate, rotate, dx, dy, dz })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `faces` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `rate`
- `rotate`
- `dx`
- `dy`
- `dz`

A deck turned in 3D drifts along a diagonal.

## Example

```js
Shaderfield.motion.cardDrift(el, ["a.jpg", "b.jpg", "c.jpg"], { rate: 1.8, rotate: -48 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
