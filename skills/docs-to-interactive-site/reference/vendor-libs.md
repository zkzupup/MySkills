# Vendor Libraries Reference

Three external libraries used by generated interactive sites.
All loaded from CDN with local fallback behavior.

---

## Rough.js

**Version**: 4.6.6 (~28KB minified)
**Purpose**: Hand-drawn SVG rendering (Excalidraw style).
**CDN**: `https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.min.js`

### API

```js
const rc = rough.svg(svgElement);
rc.rectangle(x, y, w, h, opts);     // returns <g> element
rc.circle(cx, cy, diameter, opts);   // diameter, not radius
rc.line(x1, y1, x2, y2, opts);
rc.polygon([[x1,y1], [x2,y2], ...], opts);
```

### Standard Options

```js
{ fill: '#dbeafe', fillStyle: 'solid', roughness: 0.8, strokeWidth: 1.5, stroke: '#444' }
// fillStyle: 'solid' | 'hachure' | 'cross-hatch'
// roughness: 0.5 (clean) to 1.2 (sketchy)
// dark mode: stroke '#ccc', roughness 0.6
```

### Fallback

When not loaded, use plain SVG `<rect>`, `<line>`, `<circle>` elements:

```js
function fallbackRect(svg, x, y, w, h, fill) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  Object.entries({ x, y, width: w, height: h, fill, stroke: '#444', 'stroke-width': 1.5 })
    .forEach(([k, v]) => el.setAttribute(k, v));
  svg.appendChild(el);
}
```

- Append Rough.js elements to SVG: `svg.appendChild(rc.rectangle(...))`.
- Each call returns an SVG `<g>` that can be styled or transformed.

---

## Mermaid.js

**Version**: 10.9+ (~3.3MB minified)
**Purpose**: Render mermaid code blocks into SVG diagrams.
**CDN**: `https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js`

### Init and Render

```js
mermaid.initialize({ startOnLoad: false, theme: 'default', flowchart: { useMaxWidth: true } });
await mermaid.run({ nodes: Array.from(document.querySelectorAll('pre.mermaid')) });
```

### Dark Mode

Re-initialize with `theme: 'dark'` on toggle, then re-run:

```js
function setMermaidTheme(isDark) {
  mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default' });
  mermaid.run({ nodes: Array.from(document.querySelectorAll('pre.mermaid')) });
}
```

### Fallback

Without mermaid, `<pre class="mermaid">` blocks display as plain code text.

- Mermaid mutates DOM on render; store original source in `data-source` attribute.
- Supported types: flowchart, sequence, class, state, ER, gantt, pie, journey.

---

## Fuse.js

**Version**: 7.0.0 (~24KB minified)
**Purpose**: Client-side fuzzy search over the module/page index.
**CDN**: `https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js`

### Configuration

```js
const fuse = new Fuse(searchIndex, {
  keys: ['title', 'keywords', 'summary'],
  threshold: 0.3,        // 0 = exact, 1 = match anything
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2,
});
```

### Search Index Format

```js
{ id: 'mod-010', title: 'Boot Sequence', keywords: 'init startup lua',
  summary: 'System initialization and Lua VM bootstrap.', url: '#mod-010' }
```

### Usage

```js
const results = fuse.search(query);
// returns [{ item: {...}, score: 0.12, refIndex: 3 }, ...]
```

### Fallback

Without fuse, degrade to simple substring matching:

```js
function simpleFallbackSearch(index, query) {
  const q = query.toLowerCase();
  return index.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.keywords.toLowerCase().includes(q) ||
    item.summary.toLowerCase().includes(q)
  );
}
```

- Rebuild Fuse instance only when the index changes, not on every search.
- Debounce input by 200ms before calling `fuse.search()`.
- Keys support weighted search: `{ name: 'title', weight: 2 }`.
