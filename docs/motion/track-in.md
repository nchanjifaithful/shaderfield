<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Track In

A tagline tightens its letter spacing as it sharpens.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.trackIn` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#track-in) |

## Signature

```js
Shaderfield.motion.trackIn(el, { from, to, blur, duration, by, stagger })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `from`
- `to`
- `blur`
- `duration`
- `by`
- `stagger`

Letter spacing tightens from wide (em) while the text sharpens. Made for taglines. `by: "char"` blurs each letter up in turn.

## Example

```js
Shaderfield.motion.trackIn(tagline, { from: 0.32, to: 0.02, duration: 0.8 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
