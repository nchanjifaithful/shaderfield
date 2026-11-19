<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Transitions</sub>

# Footer Reveal

The page lifts away to reveal the footer underneath.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.underlayReveal` |
| **Category** | Transitions |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#footer-reveal) |

## Signature

```js
Shaderfield.motion.underlayReveal(page, under, { duration, distance, reverse })
```

| Argument | Description |
|---|---|
| `page` | See the example. |
| `under` | See the example. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `duration`
- `distance`
- `reverse`

The page lifts away to reveal a footer beneath.

## Example

```js
Shaderfield.motion.underlayReveal(page, footer, { duration: 1.5 });
Shaderfield.motion.underlayReveal(page, footer, { reverse: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
