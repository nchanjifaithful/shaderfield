<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Tab Morph

The active icon tab springs open to show its label.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.tabMorph` |
| **Category** | Interface |
| **Returns** | A stop function. Call it to end the effect. |
| **Live demo** | [Open in the library](../../components.html#tab-morph) |

## Signature

```js
Shaderfield.motion.tabMorph(el, { tabs, active })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `tabs`
- `active`

The active tab springs open to show its label. Use `stop.set(i)` and `stop.next()`.

## Example

```js
const tabs = Shaderfield.motion.tabMorph(el, { tabs: ["Dashboard", "Notifications", "Settings"] });
tabs.set(2);
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
