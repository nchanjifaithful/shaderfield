<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Type in

Letter entrances. `mode`: `soft`, `decode`, `flip`, `scatter`, `glitch`. `accent`: two colours used for the chromatic split.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.typeIn` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |

## Signature

```js
Shaderfield.motion.typeIn(el, { mode, accent, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `mode`
- `accent`
- `delay`

## Example

```js
Shaderfield.motion.typeIn(el, {});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
