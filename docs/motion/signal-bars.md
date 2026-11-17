<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Signal Bars

Thin status bars grow in a staggered sweep to show uptime.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.signalBars` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#signal-bars) |

## Signature

```js
Shaderfield.motion.signalBars(el, { rows, count, height })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `rows`
- `count`
- `height`

Status bars sweep in. `rows: [{ label, state, color, filled }]`.

## Example

```js
Shaderfield.motion.signalBars(el, {
  count: 32,
  rows: [
    { label: "API", state: "Operational", color: "#0ea5e9", filled: 32 },
    { label: "Database", state: "Degraded", color: "#fbbf24", filled: 22 }
  ]
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
