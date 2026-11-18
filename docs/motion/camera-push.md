<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Camera Push

The layout scales and pans until one element fills the frame.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.cameraPush` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#camera-push) |

## Signature

```js
Shaderfield.motion.cameraPush(world, target, { scale, duration, back, hold })
```

| Argument | Description |
|---|---|
| `world` | The positioned container the effect draws into. |
| `target` | The element to move from or to. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `scale`
- `duration`
- `back`
- `hold`

Scales and pans `world` so `target` lands centre frame.

## Example

```js
await Shaderfield.motion.cameraPush(world, targetCard, { scale: 2.4, back: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
