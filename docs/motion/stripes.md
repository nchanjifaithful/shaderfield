<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Block Reveal

A solid block wipes open, then its words roll up.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.stripes` |
| **Category** | Transitions |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#cut-reveal) |

## Signature

```js
Shaderfield.motion.stripes(el, { angle, gap, color, drift, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `angle`
- `gap`
- `color`
- `drift`
- `duration`

Diagonal stripes wipe in and drift.

## Example

```js
Shaderfield.motion.stripes(section);
Shaderfield.motion.cut(label, { color: "#09090b" });
Shaderfield.motion.cut(title, { color: "#09090b", delay: 0.25 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
