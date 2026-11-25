<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Switch

Toggles slide their knobs across as the track fills with colour.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.toggle` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#switch) |

## Signature

```js
Shaderfield.motion.toggle(el, { on, color, off, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `on`
- `color`
- `off`
- `duration`

A switch slides its knob as the track fills.

## Example

```js
Shaderfield.motion.toggle(el, { on: true, color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
