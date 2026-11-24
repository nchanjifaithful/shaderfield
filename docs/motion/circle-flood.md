<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Circle Flood

A disc of colour bursts out of the pressed button until it covers the frame.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.circleFlood` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#circle-flood) |

## Signature

```js
Shaderfield.motion.circleFlood(stage, { origin, color, next, keep, onSwap })
```

| Argument | Description |
|---|---|
| `stage` | The positioned container the effect draws into. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `origin`
- `color`
- `next`
- `keep`
- `onSwap`

A disc bursts out of a point (a pressed button) to cover the frame.

## Example

```js
Shaderfield.motion.circleFlood(stage, { origin: button, color: "#0ea5e9", onSwap: () => showEndCard() });
// next: el — the next scene follows inside the disc
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
