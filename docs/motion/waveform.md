<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Waveform

Bars grow up out of a line, then a playhead sweeps through and colours them.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.waveform` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#waveform) |

## Signature

```js
Shaderfield.motion.waveform(el, { bars, color, track, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `bars`
- `color`
- `track`
- `duration`

Bars grow, then a playhead colours them.

## Example

```js
Shaderfield.motion.waveform(el, { bars: 46, color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
