<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Scan Beam

A glowing scanline sweeps a card and lights up each field.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.scanBeam` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#scan-beam) |

## Signature

```js
Shaderfield.motion.scanBeam(el, { color, duration, trail, direction, targets, pad, keep, onHit })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `duration`
- `trail`
- `direction`
- `targets`
- `pad`
- `keep`
- `onHit`

A glowing scanline sweeps the element. Items matching `targets` (default `[data-scan]`) light up as it crosses them.

## Example

```js
<div id="doc">
  <span data-scan>INV-2048</span>
  …
</div>

await Shaderfield.motion.scanBeam(doc, {
  color: "#0ea5e9", duration: 0.9,
  onHit: (item, i) => {}
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
