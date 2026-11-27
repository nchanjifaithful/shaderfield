<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Centre Split

The middle letter stands up, then the word opens outward from it.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.centerSplit` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#center-split) |

## Signature

```js
Shaderfield.motion.centerSplit(el, { from, duration, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `from`
- `duration`
- `delay`

## Example

```js
Shaderfield.motion.centerSplit(wordmark, { duration: 0.45 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
