<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Bracket Cursor

The pointer becomes a reticle that snaps around links.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.bracketCursor` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#bracket-cursor) |

## Signature

```js
Shaderfield.motion.bracketCursor(root, { spin, pull, pad, idle, selector, color, hideCursor })
```

| Argument | Description |
|---|---|
| `root` | See the example. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `spin`
- `pull`
- `pad`
- `idle`
- `selector`
- `color`
- `hideCursor`

Pointer reticle that springs around `[data-magnetic]` elements.

## Example

```js
<a href="#" data-magnetic>Book a call</a>

const stop = Shaderfield.motion.bracketCursor(document.body, {
  spin: 90, pull: 0.08
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
