<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Underline Cycle

Value words take turns. Each one's underline draws in, then retracts to the right as it leaves.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.underlineCycle` |
| **Category** | Text |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#underline-cycle) |

## Signature

```js
Shaderfield.motion.underlineCycle(el, words, { color, hold, width })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `words` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `hold`
- `width`

Words take turns. Each underline draws in, then retracts to the right.

## Example

```js
Shaderfield.motion.underlineCycle(el, ["Crafted.", "Bold.", "Yours."], { color: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
