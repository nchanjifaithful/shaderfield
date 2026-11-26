<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Square Reveal

A solid square pops in at the right and slides left, unmasking the title behind it.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.squareReveal` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#square-reveal) |

## Signature

```js
Shaderfield.motion.squareReveal(el, { color, size, duration, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `size`
- `duration`
- `delay`

A full-height bar pops in at the right and slides left, unmasking the title behind it.

## Example

```js
Shaderfield.motion.squareReveal(title, { color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
