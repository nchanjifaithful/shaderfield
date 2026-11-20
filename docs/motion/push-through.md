<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Push Through

The scene zooms toward one point while it blurs away.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.pushThrough` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#push-through) |

## Signature

```js
Shaderfield.motion.pushThrough(el, { origin, scale, blur, duration, reverse })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `origin`
- `scale`
- `blur`
- `duration`
- `reverse`

The scene scales toward `origin` (an element or `[x, y]` fractions) while it blurs and fades. `reverse: true` arrives from it.

## Example

```js
await Shaderfield.motion.pushThrough(scene, { origin: card, scale: 2.4, blur: 16 });
await Shaderfield.motion.pushThrough(scene, { reverse: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
