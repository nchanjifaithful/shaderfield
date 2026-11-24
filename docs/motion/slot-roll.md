<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Slot Roll

Words roll through a slot that resizes to fit each one, with faint echoes as it lands.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.slotRoll` |
| **Category** | Text |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#slot-roll) |

## Signature

```js
Shaderfield.motion.slotRoll(el, words, { hold, roll, blur, ghosts })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `words` | The list of values to show. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `hold`
- `roll`
- `blur`
- `ghosts`

Words roll through a slot that resizes to fit each one.

## Example

```js
Shaderfield.motion.slotRoll(el, ["dynamic", "flexible", "adaptive", "fastest"], { hold: 0.8 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
