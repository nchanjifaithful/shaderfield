<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Spring follow

A label follows the cursor on a spring. Use `stop.set({ stiffness, damping })`.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.springFollow` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |

## Signature

```js
Shaderfield.motion.springFollow(el, area, { stiffness, damping })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `area` | See the example. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `stiffness`
- `damping`

## Example

```js
Shaderfield.motion.springFollow(el, area, {});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
