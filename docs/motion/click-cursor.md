<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Click Cursor

A pointer arcs in, clicks, and fires sparks and a ripple.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.clickCursor` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#click-cursor) |

## Signature

```js
Shaderfield.motion.clickCursor(stage, target, { color, ink, size, from, at, duration, linger, stay, press, label, onClick })
```

| Argument | Description |
|---|---|
| `stage` | The positioned container the effect draws into. |
| `target` | The element to move from or to. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `ink`
- `size`
- `from`
- `at`
- `duration`
- `linger`
- `stay`
- `press`
- `label`
- `onClick`

A pointer arcs onto `target` (element or `{ x, y }`), squashes, and fires three sparks, a ripple and a colour flash. `onClick` runs on the press.

## Example

```js
await Shaderfield.motion.clickCursor(stage, button, {
  color: "#0ea5e9", size: 28,
  onClick: () => {}   // runs on the press
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
