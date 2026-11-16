<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Typing Dots

Three dots bounce in a wave while a reply is coming.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.typingDots` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#typing-dots) |

## Signature

```js
Shaderfield.motion.typingDots(el, { size, gap, color })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `size`
- `gap`
- `color`

Three bouncing dots.

## Example

```js
const stop = Shaderfield.motion.typingDots(el, { size: 10, color: "#9a9a96" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
