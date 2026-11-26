<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Runway Wipe

The next page rises from the bottom like a curtain while its content lifts into place.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.runway` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#runway) |

## Signature

```js
Shaderfield.motion.runway(el, { duration, lift, out })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `lift`
- `out`

The page rises from the bottom like a curtain.

## Example

```js
await Shaderfield.motion.runway(nextPage);
Shaderfield.motion.runway(nextPage, { out: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
