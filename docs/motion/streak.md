<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Streak Dots

A row of day dots fills with colour one by one, each with a small pop.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.streak` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#streak-dots) |

## Signature

```js
Shaderfield.motion.streak(el, { labels, fill, color, track })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `labels`
- `fill`
- `color`
- `track`

Day dots fill with colour one by one.

## Example

```js
Shaderfield.motion.streak(el, { labels: ["M", "T", "W", "T", "F"], color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
