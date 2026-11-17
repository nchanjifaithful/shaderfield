<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Lyric Flow

The current line lights up and the list glides to keep it centred.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.lyricFlow` |
| **Category** | Text |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#lyric-flow) |

## Signature

```js
Shaderfield.motion.lyricFlow(el, lines, { mode, accent, dim, focus, perLine })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `lines` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `mode`
- `accent`
- `dim`
- `focus`
- `perLine`

Current line lights up and the list glides to keep it in focus. `mode: "word"` fills word by word.

## Example

```js
Shaderfield.motion.lyricFlow(el, lines, {
  mode: "word",        // "line" or "word"
  accent: "#0ea5e9", focus: 0.38
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
