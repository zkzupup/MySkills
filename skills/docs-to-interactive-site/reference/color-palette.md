# Color Palette Reference

Excalidraw-inspired color system used across all generated visualizations.

## Pastel Backgrounds

Used as fill colors for SVG boxes, cards, and highlighted regions.

| Name   | Hex       | Usage                        |
|--------|-----------|------------------------------|
| Red    | `#fecaca` | Error states, removal        |
| Orange | `#fed7aa` | Warnings, pending            |
| Yellow | `#fef08a` | Highlights, attention        |
| Green  | `#bbf7d0` | Success, active, enabled     |
| Cyan   | `#a5f3fc` | Info, network, I/O           |
| Blue   | `#dbeafe` | Default containers, neutral  |
| Violet | `#c4b5fd` | Config, meta, abstract       |
| Pink   | `#fbcfe8` | User-facing, UI elements     |
| Purple | `#e9d5ff` | Plugins, extensions          |

### Semi-Transparent Variants

Append `88` or `99` to any hex value for overlay and watermark use.

- `#ffffff88` -- light overlay on grouped regions
- `#fef08a99` -- translucent highlight band
- `#dbeafe88` -- subtle container background

## Accent Strokes

Stronger saturated colors for borders, arrows, and emphasis lines.
Each pairs with its pastel counterpart above.

| Name   | Hex       |
|--------|-----------|
| Red    | `#ef4444` |
| Orange | `#f97316` |
| Yellow | `#eab308` |
| Green  | `#16a34a` |
| Cyan   | `#06b6d4` |
| Blue   | `#3b82f6` |
| Violet | `#7c3aed` |
| Pink   | `#ec4899` |

## Layer Colors (Architecture Diagrams)

Used in stacked-layer and cross-module visualizations.

| Layer      | Light          | Dark (rgba)                  |
|------------|----------------|------------------------------|
| Foundation | `#eebefa`      | `rgba(124,58,237,0.2)`       |
| Core       | `#ffec99`      | `rgba(202,138,4,0.2)`        |
| Feature    | `#b2f2bb`      | `rgba(22,163,74,0.2)`        |
| Peripheral | `#ffc9c9`      | `rgba(239,68,68,0.2)`        |
| Bridge     | `#a5d8ff`      | `rgba(59,130,246,0.2)`       |

Layer order from bottom to top: Foundation, Core, Feature, Peripheral.
Bridge is used for cross-cutting connections that span multiple layers.

## Priority Badges

Fixed-color badges for priority indicators. All use white (`#fff`) text.

| Priority | Background | Label    |
|----------|------------|----------|
| P0       | `#ef4444`  | Critical |
| P1       | `#f59e0b`  | High     |
| P2       | `#9ca3af`  | Normal   |

## Dark Mode Rules

1. Reduce background opacity -- use `rgba()` instead of solid hex fills.
2. Shift saturated accent colors toward muted variants (lower saturation by ~20%).
3. Swap stroke color from `#444` to `#ccc` for contrast on dark backgrounds.
4. Layer colors switch from their light hex to the dark rgba column above.
5. Text color shifts from `#1e293b` to `#e2e8f0`.
6. Priority badge backgrounds remain the same; their contrast is sufficient.

Example toggle logic:

```js
const isDark = document.documentElement.classList.contains('dark');
const stroke = isDark ? '#ccc' : '#444';
const textFill = isDark ? '#e2e8f0' : '#1e293b';
```

## Rough.js Style Parameters

Default options passed to every `rc.rectangle()`, `rc.circle()`, and `rc.line()` call:

```js
const defaultOpts = {
  roughness: 0.8,       // range 0.5 - 1.2; higher = sketchier
  strokeWidth: 1.5,     // consistent weight across diagrams
  fillStyle: 'solid',   // 'solid' | 'hachure' | 'cross-hatch'
  stroke: '#444',       // dark mode: '#ccc'
};
```

- `roughness` below 0.5 looks mechanical; above 1.2 looks messy.
- For small elements (badges, dots), reduce `strokeWidth` to 1.0.
- For large background regions, increase `roughness` to 1.0 for texture.
- Use `fillStyle: 'hachure'` only for disabled / placeholder elements.
