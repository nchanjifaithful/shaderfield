<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Echo Converge

Two faint copies above and below slide into the word as it sharpens.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.converge` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#converge) |

## Signature

```js
Shaderfield.motion.converge(el, { gap, ghost, ghostColor, duration, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `gap`
- `ghost`
- `ghostColor`
- `duration`
- `delay`

## Example

```js
Shaderfield.motion.converge(el, { gap: 0.92, ghost: 0.16 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
