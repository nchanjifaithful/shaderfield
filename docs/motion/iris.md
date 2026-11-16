<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Iris Close

A card closes to a hairline, pinches to the centre, then reopens.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.iris` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#iris) |

## Signature

```js
Shaderfield.motion.iris(el, { content, color, open, shutter })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `content`
- `color`
- `open`
- `shutter`

Closes to a hairline, then pinches to the centre. Pass `open: true` to reverse it.

## Example

```js
await Shaderfield.motion.iris(card, { content: scene, color: "#0ea5e9" });
await Shaderfield.motion.iris(card, { content: scene, open: true });
// Shaderfield.motion.iris(card, { shutter: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
