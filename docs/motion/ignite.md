<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Light</sub>

# Glass Ignite

A hollow glass shape blurs in, flares as a sheen sweeps across it, then cools to a thin glowing outline.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.ignite` |
| **Category** | Light |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#glass-ignite) |

## Signature

```js
Shaderfield.motion.ignite(el, { color, glow, rest })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `glow`
- `rest`

## Example

```js
Shaderfield.motion.ignite(badge, { color: "#0ea5e9", glow: 1 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
