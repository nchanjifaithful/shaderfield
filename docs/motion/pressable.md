<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Press Ripple

A press squeezes the button and sends out layered ripples.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.pressable` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#press-ripple) |

## Signature

```js
Shaderfield.motion.pressable(el, { depth, spread, rings, center, color, fill, fillColor, halo, haloColor })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `depth`
- `spread`
- `rings`
- `center`
- `color`
- `fill`
- `fillColor`
- `halo`
- `haloColor`

Press squeeze with a springy release, an ink wave, staggered rings, a core flash and an outer halo. `center: true` ripples from the middle instead of the press point. `stop.press(x, y)` triggers it from code.

## Example

```js
const stop = Shaderfield.motion.pressable(button, {
  depth: 0.06, spread: 2.6, rings: 3, center: true,
  color: "rgba(9,9,11,0.45)", haloColor: "#f2f2f4"
});
stop.press(); // trigger from code
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
