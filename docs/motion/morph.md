<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Shared Morph

An open card glides and resizes into its slot in the grid while its details fold away.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.morph` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#shared-morph) |

## Signature

```js
Shaderfield.motion.morph(el, target, { duration, radius })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `target` | The element to move from or to. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `radius`

`el` glides and resizes into `target`'s box.

## Example

```js
await Shaderfield.motion.morph(modal, gridSlot, { duration: 0.6 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
