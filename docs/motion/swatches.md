<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Swatch Rise

Palette columns rise from below one after another, then their names and values fade in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.swatches` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#swatch-rise) |

## Signature

```js
Shaderfield.motion.swatches(el, colors, { stagger })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `colors` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `stagger`

Palette columns rise in turn, then names fade in.

## Example

```js
Shaderfield.motion.swatches(el, [
  { color: "#09090b", name: "Ink", ratio: 34 },
  { color: "#0ea5e9", name: "Accent", ratio: 18, ink: "#09090b" }
]);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
