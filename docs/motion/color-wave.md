<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Colour Wave

Letters rise out of a blur in an accent colour, then settle into the text colour. Also steps by word.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.colorWave` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#color-wave) |

## Signature

```js
Shaderfield.motion.colorWave(el, { from, to, by, stagger, duration, blur, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `from`
- `to`
- `by`
- `stagger`
- `duration`
- `blur`
- `delay`

Letters (or words) rise out of a blur in an accent colour, then settle into the text colour.

## Example

```js
Shaderfield.motion.colorWave(el, { from: "#0ea5e9", stagger: 0.035 });
Shaderfield.motion.colorWave(el, { by: "word", from: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
