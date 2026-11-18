<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Disc Stack

Tilted discs cycle: the top one lifts away and returns at the back.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.discStack` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#disc-stack) |

## Signature

```js
Shaderfield.motion.discStack(el, faces, { size, tilt, hold, duration, ring, surface })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `faces` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `size`
- `tilt`
- `hold`
- `duration`
- `ring`
- `surface`

Tilted discs cycle: top lifts away, returns at the bottom. `faces`: image URLs or colours.

## Example

```js
Shaderfield.motion.discStack(el, ["a.jpg", "b.jpg", "#0ea5e9"], {
  tilt: 58, hold: 1.1, surface: "#17171b", ring: "rgba(242,242,244,0.18)"
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
