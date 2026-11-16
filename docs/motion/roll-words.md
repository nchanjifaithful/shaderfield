<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Roll Words

Each word pushes the last out with a per-letter roll.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.rollWords` |
| **Category** | Text |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#roll-words) |

## Signature

```js
Shaderfield.motion.rollWords(el, words, { duration, stagger, hold, align })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `words` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `stagger`
- `hold`
- `align`

## Example

```js
Shaderfield.motion.rollWords(el, ["Build", "ship", "repeat"], {
  duration: 0.5, stagger: 0.025, hold: 0.75
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
