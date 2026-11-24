<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Word Trail

Words land one by one and the earlier ones dim back, so the eye follows the newest.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.wordTrail` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#word-trail) |

## Signature

```js
Shaderfield.motion.wordTrail(el, { stagger, dim, keep, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `stagger`
- `dim`
- `keep`
- `duration`

Words land one by one and the earlier ones dim back.

## Example

```js
Shaderfield.motion.wordTrail(el, { stagger: 0.24, dim: 0.4, keep: 2 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
