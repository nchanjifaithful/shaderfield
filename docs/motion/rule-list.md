<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Rule List

Rows rise out of a blur while a hairline draws under each one.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.ruleList` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#rule-list) |

## Signature

```js
Shaderfield.motion.ruleList(el, { stagger, color, opacity })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `stagger`
- `color`
- `opacity`

Child rows rise out of a blur while a hairline draws under each.

## Example

```js
Shaderfield.motion.ruleList(list, { stagger: 0.14 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
