<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Typewriter

Plain typing behind a blinking caret, for prompts, form fields and drafts.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.typewriter` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#typewriter) |

## Signature

```js
Shaderfield.motion.typewriter(el, { text, cps, caretColor, caret, hold })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `text`
- `cps`
- `caretColor`
- `caret`
- `hold`

Plain typing behind a blinking caret.

## Example

```js
Shaderfield.motion.typewriter(field, { cps: 30, caretColor: "#0ea5e9" });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
