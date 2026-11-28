<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Flicker On

Tiles switch on in a scattered order, each stepping up in a few hard flickers, as the wall settles back.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.flickerIn` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#flicker-on) |

## Signature

```js
Shaderfield.motion.flickerIn(items, { spread, steps, duration })
```

| Argument | Description |
|---|---|
| `items` | The elements to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `spread`
- `steps`
- `duration`

Items switch on in a scattered order with hard flickers.

## Example

```js
Shaderfield.motion.flickerIn(wall.children, { spread: 0.8, steps: 4 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
