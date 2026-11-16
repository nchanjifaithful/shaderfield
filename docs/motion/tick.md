<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Tick Pop

A check pops out of an empty ring with a little overshoot.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.tick` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#tick-pop) |

## Signature

```js
Shaderfield.motion.tick(el, { color, size, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `size`
- `delay`

A check pops in with overshoot.

## Example

```js
items.forEach((row, i) =>
  Shaderfield.motion.tick(row.querySelector(".tick"), { color: "#0ea5e9", delay: i * 0.55 })
);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
