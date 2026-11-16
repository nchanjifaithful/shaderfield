<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Progress Bars

Bars fill one after another on an expo ease.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.bars` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#progress-bars) |

## Signature

```js
Shaderfield.motion.bars(el, { values, color, height, stagger })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `values`
- `color`
- `height`
- `stagger`

Staggered progress bars.

## Example

```js
Shaderfield.motion.bars(el, { values: [1, 1, 1, 0.6], color: "#0ea5e9", stagger: 0.28 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
