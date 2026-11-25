<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Step List

A dot and an arrow mark the active item and step down the list. The rest stay muted.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.stepList` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#step-list) |

## Signature

```js
Shaderfield.motion.stepList(el, { interval, color, arrow })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `interval`
- `color`
- `arrow`

A dot and arrow step down the child items. `stop.set(i)`

## Example

```js
const steps = Shaderfield.motion.stepList(list, { interval: 0.8, color: "#0ea5e9" });
steps.set(2);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
