<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Text</sub>

# Line Rise

Each line rises from below its mask, then leaves upward.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.lineRise` |
| **Category** | Text |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#line-rise) |

## Signature

```js
Shaderfield.motion.lineRise(el, { out, stagger, duration })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `out`
- `stagger`
- `duration`

Each child element rises as one line.

## Example

```js
<div id="head">
  <div>02 / Settings</div>
  <div>Every setting,</div>
  <div>one tap away.</div>
</div>

Shaderfield.motion.lineRise(head);
Shaderfield.motion.lineRise(head, { out: true });
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
