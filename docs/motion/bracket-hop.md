<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Bracket Hop

Corner brackets spin between targets and snap open around each.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.bracketHop` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#bracket-hop) |

## Signature

```js
Shaderfield.motion.bracketHop(stage, targets, { hold, travel, idle, pad, press, color })
```

| Argument | Description |
|---|---|
| `stage` | The positioned container the effect draws into. |
| `targets` | See the example. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `hold`
- `travel`
- `idle`
- `pad`
- `press`
- `color`

Corner brackets collapse to a spinning reticle between targets and snap open around each.

## Example

```js
Shaderfield.motion.bracketHop(stage, [...stage.querySelectorAll(".tile")], {
  hold: 1.1, press: true
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
