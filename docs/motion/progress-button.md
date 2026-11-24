<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Progress Button

The button squeezes, fills with progress under a busy label, then pops into a completed state as its check draws in.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.progressButton` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#progress-button) |

## Signature

```js
Shaderfield.motion.progressButton(btn, { busy, done, duration, doneColor, doneInk, reset })
```

| Argument | Description |
|---|---|
| `btn` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `busy`
- `done`
- `duration`
- `doneColor`
- `doneInk`
- `reset`

Squeeze, progress fill, then a completed state with a check that draws in.

## Example

```js
await Shaderfield.motion.progressButton(button, { busy: "Publishing…", done: "Published", duration: 0.8 });
Shaderfield.motion.progressButton(button, { reset: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
