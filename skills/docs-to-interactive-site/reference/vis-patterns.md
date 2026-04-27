# Visualization Patterns Reference

Eight reusable patterns for interactive SVG visualizations.
All patterns use the VisShared API for rendering and interactivity.

## 1. Vertical Waterfall

**When to use**: Boot sequences, initialization chains, ordered pipelines.
**SVG size**: 860 x 560
**Layout**: Column of step boxes at 100px y-increments, downward arrows between steps.

```js
steps.forEach((s, i) => {
  const y = 60 + i * 100;
  VisShared.drawBox(rc, svg, 80, y, 700, 60, s.label, pastelBlue);
  if (i > 0) VisShared.drawArrow(svg, 430, y - 40, 430, y);
});
```

**Reference**: vis-010 (Lua boot sequence).

## 2. FSM Ring / Grid

**When to use**: State machines with named states and typed transitions.
**SVG size**: 460 x 520
**Layout**: States in a grid/ring, color-coded by type. Arrows connect box edges.

```js
states.forEach(s => VisShared.drawBox(rc, svg, s.x, s.y, 120, 50, s.id, typeColor[s.type]));
// Edge intersection: use rectangle boundary math, NOT circular
transitions.forEach(t => {
  const [x1, y1, x2, y2] = VisShared.rectEdgePoints(from, to);
  VisShared.drawArrow(svg, x1, y1, x2, y2);
});
```

**Reference**: vis-020 left panel.

## 3. Decision Tree

**When to use**: Behavior trees, decision cascades, branching logic.
**SVG size**: 460 x 520
**Layout**: Root top-center, children fan out below via DFS. Nodes clickable for detail.

```js
function renderTree(node, x, y, spread) {
  VisShared.drawBox(rc, svg, x, y, 100, 40, node.label, pastelGreen);
  if (!node.children) return;
  const startX = x - (spread * (node.children.length - 1)) / 2;
  node.children.forEach((child, i) => {
    const cx = startX + i * spread, cy = y + 90;
    VisShared.drawArrow(svg, x + 50, y + 40, cx + 50, cy);
    renderTree(child, cx, cy, spread * 0.6);
  });
}
```

**Reference**: vis-020 right panel.

## 4. Horizontal Pipeline

**When to use**: Data flow across system boundaries (producer to consumer).
**SVG size**: 900 x 440
**Layout**: Three vertical zones with dashed dividers, parallel tracks, animated dots.

```js
zones.forEach((z, i) => VisShared.drawZoneBackground(svg, i*300, 0, 300, 440, z, zonePastels[i]));
tracks.forEach((t, i) => {
  const y = 80 + i * 70;
  VisShared.drawLine(svg, 20, y, 880, y, t.color);
  VisShared.animateDot(svg, 20, y, 880, y, t.color, 3000);
});
```

**Reference**: vis-030 (network protocol pipeline).

## 5. Dual Swim Lanes

**When to use**: Comparing two parallel workflows or patterns side by side.
**SVG size**: 860 x 560
**Layout**: Two 420px vertical lanes sharing a top entry point, step sequences flowing down.

```js
lanes.forEach((lane, li) => {
  const lx = li * 430;
  VisShared.drawBox(rc, svg, lx+10, 10, 410, 40, lane.title, pastelYellow);
  lane.steps.forEach((step, si) => {
    const y = 80 + si * 120;
    VisShared.drawBox(rc, svg, lx+60, y, 300, 60, step, pastelBlue);
    if (si > 0) VisShared.drawArrow(svg, lx+210, y-60, lx+210, y);
  });
});
```

**Reference**: vis-040 (MVC vs MVVM lifecycle).

## 6. Stacked Layer Architecture

**When to use**: Layer-cake architecture with categorized items inside each layer.
**SVG size**: 860 x 560
**Layout**: Full-width horizontal bands stacked bottom-to-top, item boxes in flex rows.

```js
layers.forEach((layer, i) => {
  const y = 460 - i * 160;
  VisShared.drawLayerBand(rc, svg, 20, y, 820, 140, layer.name, layer.color);
  layer.items.forEach((item, j) => {
    VisShared.drawBox(rc, svg, 80 + j*200, y+40, 160, 60, item, '#fff');
  });
});
```

**Reference**: vis-060 (module architecture).

## 7. Three-Band Cross-Module

**When to use**: Features spanning multiple architectural layers or subsystems.
**SVG size**: 860 x 380
**Layout**: Three horizontal color bands, components inside each, animated cross-band arrows.

```js
bands.forEach(b => VisShared.drawBand(rc, svg, 0, b.y, 860, b.h, b.label, b.color));
flows.forEach(f => VisShared.drawArrow(svg, f.x1, f.y1, f.x2, f.y2, { animated: true }));
```

**Reference**: vis-F01 (cross-module feature flow).

## 8. Hub-and-Spoke

**When to use**: Central system or service with radiating consumers/subscribers.
**SVG size**: 500 x 500
**Layout**: Central circle, consumer labels in a ring at fixed radius, rays from center.

```js
VisShared.drawCircle(rc, svg, hub.cx, hub.cy, hub.r*2, hub.label, pastelViolet);
spokes.forEach((s, i) => {
  const angle = (i / spokes.length) * Math.PI * 2 - Math.PI / 2;
  const sx = hub.cx + Math.cos(angle) * 180;
  const sy = hub.cy + Math.sin(angle) * 180;
  VisShared.drawArrow(svg, hub.cx, hub.cy, sx, sy);
  VisShared.drawLabel(svg, sx, sy, s);
});
```

**Reference**: vis-010 (EventSystem hub).
