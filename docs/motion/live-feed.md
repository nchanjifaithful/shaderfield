<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Live Feed

New rows push in at the top while the older ones slide down and dim.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.liveFeed` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#live-feed) |

## Signature

```js
Shaderfield.motion.liveFeed(el, rows, { interval, max, rowHeight, row })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `rows` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `interval`
- `max`
- `rowHeight`
- `row`

New rows push in at the top while older ones slide down and dim.

## Example

```js
Shaderfield.motion.liveFeed(list, rowsHtml, { interval: 0.66, max: 5 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
