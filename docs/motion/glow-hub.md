<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Light</sub>

# Impact Glow

A halo behind an element flares each time something lands.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.glowHub` |
| **Category** | Light |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#impact-glow) |

## Signature

```js
Shaderfield.motion.glowHub(el, { color, size, base, breathe, ring, pulse })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `color`
- `size`
- `base`
- `breathe`
- `ring`
- `pulse`

A breathing halo behind `el`. `stop.hit(strength)` makes it swell and flare. Centre `el` with margins or flex, not transforms.

## Example

```js
const glow = Shaderfield.motion.glowHub(el, { color: "#0ea5e9", size: 1.9 });
glow.hit();      // flare
glow.hit(0.5);   // softer
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
