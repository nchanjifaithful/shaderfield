<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Timeline Draw

The rule draws across, stems grow to each milestone, the boxes open and the copy settles in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.timeline` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#timeline-draw) |

## Signature

```js
Shaderfield.motion.timeline(el, items, { color, line, box, labelWidth })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `items` | The elements to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `line`
- `box`
- `labelWidth`

The rule draws, stems grow, boxes open, copy settles.

## Example

```js
Shaderfield.motion.timeline(el, [
  { x: 0.14, year: "1987", text: "The idea is born." },
  { x: 0.38, year: "1989", text: "First office opens." }
], { color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
