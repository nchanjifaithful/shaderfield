<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Letter Pop

Letters rise, overshoot and sharpen out of a blur.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.pop` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#pop) |

## Signature

```js
Shaderfield.motion.pop(el, { by, stagger, duration, lift, blur, from, out })
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
- `lift`
- `blur`
- `from`
- `out`

Rise, overshoot scale and de-blur per letter or word.

## Example

```js
Shaderfield.motion.pop(el, { by: "char", stagger: 0.04 });
Shaderfield.motion.pop(el, { out: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
