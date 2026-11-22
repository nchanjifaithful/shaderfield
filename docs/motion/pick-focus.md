<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Pick Focus

All options pulse, then the chosen one lights up and the rest dim.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.pickFocus` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#pick-focus) |

## Signature

```js
Shaderfield.motion.pickFocus(items, index, { color, dim, duration, pulse })
```

| Argument | Description |
|---|---|
| `items` | The elements to animate. |
| `index` | See the example. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `dim`
- `duration`
- `pulse`

All options pulse once, then `items[index]` lights up while the rest dim. `index: -1` resets.

## Example

```js
await Shaderfield.motion.pickFocus(cards, 0, { color: "#0ea5e9", dim: 0.72 });
Shaderfield.motion.pickFocus(cards, -1); // reset
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
