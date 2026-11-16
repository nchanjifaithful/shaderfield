<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Type Swap

The last word deletes, then the next one types in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.typeSwap` |
| **Category** | Text |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#type-swap) |

## Signature

```js
Shaderfield.motion.typeSwap(el, words, { caret, caretColor, type, del, gap, hold })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `words` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `caret`
- `caretColor`
- `type`
- `del`
- `gap`
- `hold`

Deletes the last word, pauses, types the next. `caret`: `"bar"` or `"block"`.

## Example

```js
Shaderfield.motion.typeSwap(el, ["BRANDS", "APPS", "LOGOS", "WEBSITES"], {
  caret: "bar", caretColor: "#0ea5e9", hold: 1.6
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
