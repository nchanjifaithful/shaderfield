<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Dot Morph

A dot of colour stretches into the pill behind a label, and the label flips to ink.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.dotMorph` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#dot-morph) |

## Signature

```js
Shaderfield.motion.dotMorph(el, { color, ink, size, offset })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `ink`
- `size`
- `offset`

A dot of colour stretches into the pill behind a label.

## Example

```js
Shaderfield.motion.dotMorph(tag, { color: "#0ea5e9", ink: "#09090b" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
