<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Split Tone

Letters light up from the edges inward, then a second colour sweeps through the line from right to left.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.splitTone` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#split-tone) |

## Signature

```js
Shaderfield.motion.splitTone(el, { colors, from, to, soft, duration, ignite })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `colors`
- `from`
- `to`
- `soft`
- `duration`
- `ignite`

Letters light up from the edges inward, then the first colour sweeps through the line from `from` to `to` (0–1 of its width).

## Example

```js
Shaderfield.motion.splitTone(el, {
  colors: ["#0ea5e9", "#f2f2f4"],  // swept colour, starting colour
  from: 1.05, to: -0.05, soft: 0.05, duration: 1.4
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
