<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Tile Pop

Photo tiles pop up from small with a tint that clears. Name tiles fill top-down in steps and their text fades in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.tilePop` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#tile-pop) |

## Signature

```js
Shaderfield.motion.tilePop(grid, { color, tint, steps, spread })
```

| Argument | Description |
|---|---|
| `grid` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `tint`
- `steps`
- `spread`

Tiles pop from small with a clearing tint. `[data-fill]` tiles fill in steps.

## Example

```js
<div id="grid">
  <div><img …></div>
  <div data-fill>Adam Jordan</div>
</div>

Shaderfield.motion.tilePop(grid, { color: "#0ea5e9", tint: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
