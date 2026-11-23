<sub><a href="../../README.md">Shaderfield</a> / <a href="../README.md">Components</a> / Motion / Interface</sub>

# Prompt Send

A request types into a composer, the send button lights and is pressed, the box rises and the reply follows.

| | |
|---|---|
| **Helper** | `Shaderfield.motion.promptSend` |
| **Category** | Interface |
| **Returns** | A `Promise` that resolves when the effect finishes. |
| **Live demo** | [Open in the library](../../components.html#prompt-send) |

## Signature

```js
Shaderfield.motion.promptSend(el, { text, color, reply, steps, cps, placeholder })
```

| Argument | Description |
|---|---|
| `el` | The element to animate. |
| `options` | Optional settings. See below. |

## Options

All options are optional. Durations and delays are in seconds.

- `text`
- `color`
- `reply`
- `steps`
- `cps`
- `placeholder`

A request types into a composer, send is pressed, the box rises and the reply follows.

## Example

```js
Shaderfield.motion.promptSend(stage, {
  text: "Build a coverflow carousel", color: "#0ea5e9",
  reply: "Agent is building your carousel",
  steps: ["read   examples/coverflow", "write  Carousel.tsx"]
});
```

Load `shaderfield.js` once on the page. Helpers respect `prefers-reduced-motion`.
