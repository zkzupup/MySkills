# Template: Per-Module Visualization File (vis-{id}.js)

Guide for writing custom interactive visualizations for individual modules.
Each module that needs a visual overview gets its own `js/modules/vis-{id}.js` file.

## File Structure

```
js/modules/
  vis-010.js      -- structural module 010
  vis-020.js      -- structural module 020
  vis-F01.js      -- feature module F01
  ...
```

## Naming Convention

Every vis file defines exactly **one global function**:

```
renderVis{ID}(container, mod)
```

- `{ID}` matches the module's ID exactly (case-sensitive): `010`, `020`, `F01`, `F04`, `e2e`
- `container` is the DOM element (`<div id="vis-container">`) to render into
- `mod` is the module record from `modules.json` (has `.id`, `.name`, `.docs`, etc.)

Examples:
- Module `020` defines `renderVis020(container, mod)`
- Module `F01` defines `renderVisF01(container, mod)`
- The E2E flow page defines `renderVisE2E(container, flowId)`

## Registration in app.js

The vis functions are registered via a simple typeof-check registry in `app.js`.
When you add a new vis file, you must also:

1. Add a `<script>` tag in `index.html` (in the `<!-- ADAPT -->` section)
2. Add an entry in the `getModuleVis()` function inside `app.js`:

```javascript
/* --- Module Visualization Registry --- */
function getModuleVis(id) {
  var registry = {
    '010': typeof renderVis010 !== 'undefined' ? renderVis010 : null,
    '020': typeof renderVis020 !== 'undefined' ? renderVis020 : null,
    // Add your new module here:
    'XXX': typeof renderVisXXX !== 'undefined' ? renderVisXXX : null,
  };
  return registry[id] || null;
}
```

The `typeof` guard ensures the page does not crash if the script fails to load.

## VisShared API

All vis files use the shared utility object `VisShared` (defined in `vis-shared.js`).
Key methods:

| Method | Purpose |
|---|---|
| `V.createSVG(container, w, h)` | Create an SVG element with zoom button |
| `V.getRc(svg)` | Get a rough.js canvas bound to the SVG |
| `V.svgGroup(className)` | Create an SVG `<g>` element |
| `V.svgEl(tag, attrs)` | Create any SVG element with attributes |
| `V.svgText(text, x, y, size, opts)` | Render centered text in SVG |
| `V.drawBox(rc, x, y, w, h, fill, opts)` | Draw a rough.js rectangle |
| `V.drawArrow(rc, x1, y1, x2, y2, opts)` | Draw a rough.js arrow |
| `V.fadeIn(el, delayMs)` | Animate element appearance |
| `V.renderModuleHeader(container, mod, subtitle)` | Standard module header |
| `V.createToolbar(container)` | Interactive toolbar with buttons |
| `V.createDetailPanel(container)` | Collapsible detail/info panel |

---

## Minimal Working Example: Vertical Waterfall Diagram

This example renders a simple top-to-bottom flow of processing stages,
suitable for pipelines, state sequences, or layered architectures.

```javascript
/* ===== Module XXX: Example Pipeline Visualization ===== */
function renderVisXXX(container, mod) {
  var V = VisShared;
  V.renderModuleHeader(container, mod, 'Processing Pipeline Overview');

  /* ---------- Configuration ---------- */
  var W = 520, H = 400;
  var BOX_W = 180, BOX_H = 36;
  var GAP_Y = 56;
  var START_X = (W - BOX_W) / 2;
  var START_Y = 30;

  /* ---------- Data ---------- */
  var stages = [
    { id: 'input',   label: 'Input Parser',     color: '#93c5fd' },
    { id: 'validate',label: 'Validation',        color: '#86efac' },
    { id: 'process', label: 'Core Processing',   color: '#fde68a' },
    { id: 'enrich',  label: 'Data Enrichment',   color: '#c4b5fd' },
    { id: 'output',  label: 'Output Formatter',  color: '#fca5a5' },
  ];

  /* ---------- SVG canvas ---------- */
  var svg = V.createSVG(container, W, H);
  var rc = V.getRc(svg);

  /* ---------- Detail panel (click to reveal info) ---------- */
  var detail = V.createDetailPanel(container);

  /* ---------- Draw arrows first (behind boxes) ---------- */
  for (var i = 0; i < stages.length - 1; i++) {
    var y1 = START_Y + i * GAP_Y + BOX_H;
    var y2 = START_Y + (i + 1) * GAP_Y;
    var arrowG = V.svgGroup('');
    arrowG.appendChild(
      V.drawArrow(rc, START_X + BOX_W / 2, y1, START_X + BOX_W / 2, y2, {
        stroke: '#888', strokeWidth: 1.5
      })
    );
    V.fadeIn(arrowG, i * 80 + 40);
    svg.appendChild(arrowG);
  }

  /* ---------- Draw boxes ---------- */
  stages.forEach(function (stage, idx) {
    var x = START_X;
    var y = START_Y + idx * GAP_Y;

    var g = V.svgGroup('vis-node-hover');
    g.style.cursor = 'pointer';

    // Rough.js box
    var box = V.drawBox(rc, x, y, BOX_W, BOX_H, stage.color, { roughness: 1 });
    g.appendChild(box);

    // Label
    var txt = V.svgText(stage.label, x + BOX_W / 2, y + BOX_H / 2, 13, {
      weight: '600'
    });
    g.appendChild(txt);

    // Click hitbox (transparent rect over the box)
    var hit = V.svgEl('rect', {
      x: x, y: y, width: BOX_W, height: BOX_H, fill: 'transparent'
    });
    hit.addEventListener('click', function () {
      detail.show(
        stage.label,
        '<p>Stage <strong>' + stage.id + '</strong> handles: ...</p>' +
        '<p>Related docs: <a href="#/doc/XXX/' + stage.id + '">' +
        stage.label + ' details</a></p>'
      );
    });
    g.appendChild(hit);

    // Staggered fade-in animation
    V.fadeIn(g, idx * 80);
    svg.appendChild(g);
  });

  /* ---------- Doc footer ---------- */
  var footer = document.createElement('div');
  footer.className = 'vis-doc-footer';
  footer.innerHTML = '<p>Click any stage to see details. ' +
    'See <a href="#/module/XXX">module docs</a> for full analysis.</p>';
  container.appendChild(footer);
}
```

## Checklist

Before shipping a new vis file, verify:

- [ ] **SVG dimensions**: `W` and `H` are large enough for all elements; the SVG uses `viewBox` so it scales responsively
- [ ] **Detail panel**: Clicking nodes shows meaningful info via `V.createDetailPanel()` -- not just empty strings
- [ ] **fadeIn**: All visual elements use `V.fadeIn(el, delay)` for staggered entrance; delays should increment (e.g. `idx * 60`)
- [ ] **Doc footer**: A `div.vis-doc-footer` at the bottom with links back to module docs
- [ ] **Click handlers**: Interactive elements (boxes, nodes) have transparent hit-rect overlays with `click` listeners
- [ ] **Color consistency**: Colors come from the project palette (see `color-palette.md`)
- [ ] **Vendor fallback**: If using `rc` (rough.js), the code still works when `window.__vendorStatus.rough === false` -- either skip rough drawing or use plain SVG rects
- [ ] **No global pollution**: The function is the only global; all other variables are scoped inside it
- [ ] **Script tag added**: `index.html` has a `<script src="js/modules/vis-{id}.js">` tag
- [ ] **Registry entry added**: `app.js` `getModuleVis()` includes the new ID

## Choosing a Visualization Pattern

See **vis-patterns.md** for the full catalog of proven patterns:

| Pattern | Best for | Complexity |
|---|---|---|
| Vertical waterfall | Pipelines, sequential flows | Low |
| State machine (FSM) | Game states, protocol states | Medium |
| Two-column split | Paired concepts (client/server, before/after) | Medium |
| Layered architecture | Framework layers, dependency stacks | Medium |
| Decision tree | AI logic, branching rules | High |
| Animated simulation | Real-time data flows, game loops | High |

## Color Reference

See **color-palette.md** for the standard color tokens. Quick reference:

```
Core / Framework:   #93c5fd (blue)
Feature / Logic:    #86efac (green)
Data / Config:      #fde68a (yellow)
Extension / Plugin: #c4b5fd (purple)
Warning / Error:    #fca5a5 (red/pink)
Peripheral:         #d1d5db (gray)
```

These map to the `stateColors` / `layerColors` objects used across all vis files
and ensure visual consistency site-wide.
