<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Marquee Light

An oversized line drifts sideways while its letters brighten one after another.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.marquee` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#marquee) |

## Signature

```js
Shaderfield.motion.marquee(el, { distance, duration, dim, stagger })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `distance`
- `duration`
- `dim`
- `stagger`

An oversized line drifts sideways while its letters brighten in turn.

## Example

```js
Shaderfield.motion.marquee(el, { distance: -0.6, duration: 2.6, dim: 0.18 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
