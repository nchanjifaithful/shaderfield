<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Caption Pop

Subtitle words pop in one at a time. The word being spoken sits on an accent pill.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.captions` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#caption-pop) |

## Signature

```js
Shaderfield.motion.captions(el, words, { accent, per, ink, pill })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `words` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `accent`
- `per`
- `ink`
- `pill`

Subtitle words pop in. The word being spoken sits on an accent pill.

## Example

```js
Shaderfield.motion.captions(el, "Spring, but louder.", { accent: "#0ea5e9", per: 0.3 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
