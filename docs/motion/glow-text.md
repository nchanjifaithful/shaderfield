<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Light</sub>

# Glow Sheen

A bright band drifts through gradient text under a soft glow.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.glowText` |
| **Category** | Light |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#glow-sheen) |

## Signature

```js
Shaderfield.motion.glowText(el, { colors, period, band, glow, glowColor, bloom })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `colors`
- `period`
- `band`
- `glow`
- `glowColor`
- `bloom`

A highlight band drifts through gradient-filled text under a soft bloom.

## Example

```js
const stop = Shaderfield.motion.glowText(word, {
  colors: ["#0ea5e9", "#e0f2fe"], period: 3.6, glow: 16
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
