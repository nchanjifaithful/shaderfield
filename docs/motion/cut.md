<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Block Reveal

A solid block wipes open, then its words roll up.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.cut` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#cut-reveal) |

## Signature

```js
Shaderfield.motion.cut(el, { color, delay, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `delay`
- `duration`

A block wipes open, then its words roll up.

## Example

```js
Shaderfield.motion.stripes(section);
Shaderfield.motion.cut(label, { color: "#09090b" });
Shaderfield.motion.cut(title, { color: "#09090b", delay: 0.25 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
