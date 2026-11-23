<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Toast Stack

Notifications land stacked behind each other, then fan out into a list.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.toastStack` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#toast-stack) |

## Signature

```js
Shaderfield.motion.toastStack(el, { stagger, gap, peek, expand })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `stagger`
- `gap`
- `peek`
- `expand`

Child toasts land stacked, then fan out into a list.

## Example

```js
<div id="toasts" style="position:relative;height:340px">
  <div>Shipped: Bulk export</div> …
</div>

Shaderfield.motion.toastStack(toasts, { stagger: 0.18 });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
