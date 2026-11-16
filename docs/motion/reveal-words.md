<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Reveal words

Scroll-linked word reveal. Wrap words in `*asterisks*` to accent them.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.revealWords` |
| **Category** | Text |
| **Returns** | A stop function. Call it to end the effect. |

## Signature

```js
Shaderfield.motion.revealWords(el, { dim, accent })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `dim`
- `accent`

## Example

```js
Shaderfield.motion.revealWords(el, {});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
