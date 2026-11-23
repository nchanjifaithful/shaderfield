<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Kinetic Letters

Letters orbit in and collapse into the word, settle off an arch, tumble about, or the words push apart.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.kinetic` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#kinetic) |

## Signature

```js
Shaderfield.motion.kinetic(el, { mode, duration, radius, height, spin, delay })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `mode`
- `duration`
- `radius`
- `height`
- `spin`
- `delay`

Letter choreography. `mode`: `orbit`, `arch`, `jumble`, `spread` (words).

## Example

```js
Shaderfield.motion.kinetic(el, { mode: "orbit" });
// mode: "orbit" | "arch" | "jumble" | "spread"
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
