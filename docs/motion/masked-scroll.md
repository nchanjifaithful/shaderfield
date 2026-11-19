<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Masked Scroll

A list glides under a fade mask so rows dissolve at the edge.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.maskedScroll` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#masked-scroll) |

## Signature

```js
Shaderfield.motion.maskedScroll(el, { duration, hold, distance })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `hold`
- `distance`

The first child glides under a bottom fade mask.

## Example

```js
<div id="viewport" style="height:220px"><div>…rows…</div></div>

const stop = Shaderfield.motion.maskedScroll(viewport, { duration: 2, hold: 1.2 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
