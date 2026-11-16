<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Shock Ring

A thin glowing ring bursts out from a point.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.shock` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#shock) |

## Signature

```js
Shaderfield.motion.shock(stage, x, y, { from, to, duration, width, color })
```

| Argument | Description |
|---|---|
| `stage` | The positioned container the effect draws into. |
| `x` | See the example. |
| `y` | See the example. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `from`
- `to`
- `duration`
- `width`
- `color`

A glowing ring bursts out from a point.

## Example

```js
Shaderfield.motion.shock(stage, x, y, { to: 300, duration: 0.7 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
