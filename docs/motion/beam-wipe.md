<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Beam Wipe

A bundle of slanted beams sweeps across. The next scene is revealed behind its trailing edge.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.beamWipe` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#beam-wipe) |

## Signature

```js
Shaderfield.motion.beamWipe(el, { next, colors, angle, duration, onSwap })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `next`
- `colors`
- `angle`
- `duration`
- `onSwap`

Slanted glass beams sweep across. `next` is revealed behind them.

## Example

```js
Shaderfield.motion.beamWipe(stage, { next: nextScene, angle: 21, duration: 1.2 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
