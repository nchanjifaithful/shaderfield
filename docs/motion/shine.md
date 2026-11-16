<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Shine

A crisp glint sweeps across a button once.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.shine` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#shine) |

## Signature

```js
Shaderfield.motion.shine(el, { duration, size, color })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `size`
- `color`

One diagonal glint across the element.

## Example

```js
Shaderfield.motion.shine(button, { duration: 0.75 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
