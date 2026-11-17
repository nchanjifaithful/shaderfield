<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Type Log

Log lines type out one by one and check off when done.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.typeLines` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#type-log) |

## Signature

```js
Shaderfield.motion.typeLines(el, lines, { accent, perLine, gap, prompt })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `lines` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `accent`
- `perLine`
- `gap`
- `prompt`

Log lines type out and check off.

## Example

```js
Shaderfield.motion.typeLines(el, [
  "Fetching repository",
  "Running test suite",
  "Opening pull request"
], { accent: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
