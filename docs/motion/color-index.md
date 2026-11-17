<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Color Index

A project list steps row by row as the background changes colour.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.colorIndex` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#color-index) |

## Signature

```js
Shaderfield.motion.colorIndex(el, items, { step, move, pitch, active })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `items` | The elements to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `step`
- `move`
- `pitch`
- `active`

Index list steps row by row; background blends between each `item.bg`.

## Example

```js
Shaderfield.motion.colorIndex(el, [
  { name: "Aarzoo", badge: "Print Design", bg: "#ff0000" },
  { name: "Eternal Echoes", badge: "Typography", bg: "#8b5cf6" }
]);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
