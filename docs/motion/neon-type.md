<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Neon Type

Letters type on and flicker like neon before they hold.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.neonType` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#neon-type) |

## Signature

```js
Shaderfield.motion.neonType(el, { cps, glowColor, caretColor, glow, hold, caret })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `cps`
- `glowColor`
- `caretColor`
- `glow`
- `hold`
- `caret`

Types on behind a caret. Each letter flickers like a neon tube catching, then holds with a glow.

## Example

```js
Shaderfield.motion.neonType(el, { cps: 26, glowColor: "#0ea5e9", hold: 1.2 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
