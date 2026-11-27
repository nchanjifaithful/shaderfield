<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Whip Pan

One window whips off to the side with a speed blur as the next whips in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.whip` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#whip-pan) |

## Signature

```js
Shaderfield.motion.whip(out, next, { direction, duration, blur })
```

| Argument | Description |
|---|---|
| `out` | The element to move from or to. |
| `next` | The element to move from or to. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `direction`
- `duration`
- `blur`

One scene whips off with a speed blur as the next whips in.

## Example

```js
await Shaderfield.motion.whip(currentWindow, nextWindow, { direction: "left" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
