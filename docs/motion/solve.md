<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Scramble Solve

Words roll in as scrambled glyphs, then resolve letter by letter.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.solve` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#solve) |

## Signature

```js
Shaderfield.motion.solve(el, { perWord, solveAfter, duration, stagger, glyphs })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `perWord`
- `solveAfter`
- `duration`
- `stagger`
- `glyphs`

## Example

```js
Shaderfield.motion.solve(el, { perWord: 0.55, solveAfter: 0.3 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
