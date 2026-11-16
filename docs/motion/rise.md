<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Letter Rise

Each letter rises through its own mask on an expo ease.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.rise` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#letter-rise) |

## Signature

```js
Shaderfield.motion.rise(el, { by, stagger, duration, ease, out, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `by`
- `stagger`
- `duration`
- `ease`
- `out`
- `delay`

Masked rise per `"char"` or `"word"`. `out: true` runs the exit.

## Example

```js
Shaderfield.motion.rise(el, { by: "char", stagger: 0.045, duration: 1.1 });
// exit: Shaderfield.motion.rise(el, { by: "char", out: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
