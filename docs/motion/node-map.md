<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Node Map

Clips pop onto a board, the chosen ones ring up, dotted links draw between them and the rest dim and strike through.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.nodeMap` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#node-map) |

## Signature

```js
Shaderfield.motion.nodeMap(stage, nodes, { links, pick, color })
```

| Argument | Description |
|---|---|
| `stage` | The positioned container the effect draws into. |
| `nodes` | The elements to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `links`
- `pick`
- `color`

Nodes pop in, picked ones ring up, dotted links draw with labels, the rest dim.

## Example

```js
Shaderfield.motion.nodeMap(board, clips, {
  links: [[0, 5, "match cut"], [5, 2, "motion flow"], [2, 7, "beat drop"]],
  color: "#0ea5e9"
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
