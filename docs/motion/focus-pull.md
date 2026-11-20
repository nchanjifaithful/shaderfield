<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Focus Pull

Text racks into focus out of a blur, by line or by letter.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.focusPull` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#focus-pull) |

## Signature

```js
Shaderfield.motion.focusPull(el, { out, by, blur, scale, spread, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `out`
- `by`
- `blur`
- `scale`
- `spread`
- `duration`

The line racks into focus from a blur and a slight zoom. `by: "char"` drifts letters in one after another.

## Example

```js
await Shaderfield.motion.focusPull(el);
await Shaderfield.motion.focusPull(el, { out: true });
Shaderfield.motion.focusPull(el, { by: "char", spread: 0.3 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
