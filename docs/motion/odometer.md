<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Odometer

A count rolls to its next value. The old number blurs up and out as the new one rises in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.odometer` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#odometer) |

## Signature

```js
Shaderfield.motion.odometer(el, { value, format, duration, blur })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `value`
- `format`
- `duration`
- `blur`

A count rolls to its next value. `stop.set(n)`

## Example

```js
const votes = Shaderfield.motion.odometer(el, { value: 47 });
votes.set(48);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
