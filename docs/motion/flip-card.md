<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Card Flip

The card turns edge-on and comes back showing its other face.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.flipCard` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#card-flip) |

## Signature

```js
Shaderfield.motion.flipCard(el, { back, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `back`
- `duration`

The card turns edge-on and shows its second child.

## Example

```js
<div id="card"><div>front</div><div style="display:none">back</div></div>

await Shaderfield.motion.flipCard(card);
Shaderfield.motion.flipCard(card, { back: false });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
