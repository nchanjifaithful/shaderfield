<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Pill Words

An outlined pill opens and the words grow into it one at a time.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.pillWords` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#pill-words) |

## Signature

```js
Shaderfield.motion.pillWords(el, { stagger, color })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `stagger`
- `color`

## Example

```js
Shaderfield.motion.pillWords(el, { stagger: 0.35 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
