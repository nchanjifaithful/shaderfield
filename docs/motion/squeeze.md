<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Squeeze

An image between two words pinches down to a sliver and the words close in around it.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.squeeze` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#squeeze) |

## Signature

```js
Shaderfield.motion.squeeze(el, { to, open, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `to`
- `open`
- `duration`

An element pinches to a sliver, or opens back.

## Example

```js
await Shaderfield.motion.squeeze(photo, { to: 18 });
Shaderfield.motion.squeeze(photo, { open: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
