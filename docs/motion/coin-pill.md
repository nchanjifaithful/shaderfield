<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Coin Pill

A currency coin pops in, a pill slides out of it and the country name types in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.coinPill` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#coin-pill) |

## Signature

```js
Shaderfield.motion.coinPill(el, { symbol, code, label, color, ink })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `symbol`
- `code`
- `label`
- `color`
- `ink`

A coin pops, a pill slides out and the name types in.

## Example

```js
Shaderfield.motion.coinPill(el, { symbol: "₦", code: "NGN", label: "Nigeria", color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
