<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Pen Trail

A pen leaves a fading, tapering stroke and reveals a wordmark.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.penTrail` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#pen-trail) |

## Signature

```js
Shaderfield.motion.penTrail(el, { color, width, fade, reveal, auto })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `width`
- `fade`
- `reveal`
- `auto`

A fading pen stroke, plus an optional element revealed behind it.

## Example

```js
const stop = Shaderfield.motion.penTrail(stage, {
  color: "#0ea5e9", width: 6, fade: 0.9,
  reveal: wordmark        // optional: masked in behind the pen
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
