<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Wire Draw

Curved connectors draw from one element to several others.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.wire` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#wire-draw) |

## Signature

```js
Shaderfield.motion.wire(stage, from, to, { color, width, bend, duration, delay, fromSide, toSide, glow, head })
```

| Argument | Description |
|---|---|
| `stage` | The positioned container the effect draws into. |
| `from` | The element to move from or to. |
| `to` | The element to move from or to. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `width`
- `bend`
- `duration`
- `delay`
- `fromSide`
- `toSide`
- `glow`
- `head`

Draws a cubic connector between two elements with a bright head on its tip. Resolves with the path.

## Example

```js
outputs.forEach((out, i) =>
  Shaderfield.motion.wire(stage, hub, out, { color: "#0ea5e9", delay: i * 0.14 })
);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
