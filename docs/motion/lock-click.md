<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Lock Click

A padlock drops in, snaps shut, then turns into a check.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.lockClick` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#lock-click) |

## Signature

```js
Shaderfield.motion.lockClick(el, { size, color, ink, background, tick, label })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `size`
- `color`
- `ink`
- `background`
- `tick`
- `label`

A ring draws, a padlock drops in and its shackle snaps shut. `tick: true` folds it into a check.

## Example

```js
await Shaderfield.motion.lockClick(el, {
  size: 120, color: "#0ea5e9", tick: true
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
