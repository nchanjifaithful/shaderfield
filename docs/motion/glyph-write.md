<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Glyph Write

Letters resolve left to right behind a short run of scrambled glyphs.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.glyphWrite` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#glyph-write) |

## Signature

```js
Shaderfield.motion.glyphWrite(el, { glyphs, front, duration, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `glyphs`
- `front`
- `duration`
- `delay`

## Example

```js
Shaderfield.motion.glyphWrite(el, { front: 3, duration: 0.6 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
