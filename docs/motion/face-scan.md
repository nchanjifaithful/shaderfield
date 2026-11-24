<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Face Scan

A tick ring fills while a scanline sweeps a face glyph, then it folds into a filled check.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.faceScan` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#face-scan) |

## Signature

```js
Shaderfield.motion.faceScan(el, { size, color, ink, track })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `size`
- `color`
- `ink`
- `track`

A tick ring fills while a scanline sweeps a face, then it folds into a check.

## Example

```js
await Shaderfield.motion.faceScan(el, { size: 200, color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
