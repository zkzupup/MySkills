---
name: docs-to-interactive-site
description: Convert technical markdown documentation into a zero-dependency interactive visualization SPA with hand-drawn SVG diagrams, per-module custom visualizations, fuzzy search, and dual file:///HTTP support.
---

# Docs-to-Interactive-Site

This skill converts a collection of **technical markdown documentation** into a **self-contained interactive visualization website**. The output is a pure static SPA that works by double-clicking `index.html` (file:// protocol) or serving via HTTP.

## Core Stack (Zero Dependencies at Runtime)
- **Rough.js** — hand-drawn SVG diagrams (Excalidraw aesthetic)
- **Mermaid.js** — renders code-block diagrams client-side
- **Fuse.js** — client-side fuzzy search
- **Python** — build script (one-time conversion, not a runtime dependency)
- **No frameworks, no npm, no build tools**

## When To Use

- User has a directory of organized markdown docs (by module/topic/chapter)
- User wants interactive presentation beyond static doc navigation
- User needs offline/local file support (file:// protocol)
- User wants Excalidraw-style hand-drawn visualizations
- User wants per-module custom diagrams (not generic templates for all)

## Inputs To Ask For (only if missing)

| Input | Required | Default |
|-------|----------|---------|
| Path to documentation root | Yes | — |
| Project name | Yes | directory name |
| Language | No | auto-detect from docs |
| Module naming convention | No | auto-detect (e.g., `010-Name/`, `ModuleName/`) |
| Diagram image location | No | look for `diagrams/` folder |
| Output directory | No | `{doc_root}/site/` |

## Workflow (8 Phases)

Follow the detailed guide in `workflow.md`. Overview:

1. **Analyze** — Scan docs, identify modules, count files, find diagrams
2. **Design** — Choose routing scheme, module IDs, which modules get custom vis
3. **Build Script** — Generate Python build_site.py (markdown → site data)
4. **SPA Shell** — Generate index.html + style.css + app.js
5. **Vis Utilities** — Generate vis-shared.js (reusable across all projects)
6. **Module Vis** — For each important module: read docs → choose pattern → generate vis-{id}.js
7. **Homepage** — Generate architecture overview diagram + guided reading paths
8. **Test** — Run build, verify file:// and HTTP, fix issues

## Reference Files (lazy-load as needed)

| File | When to load |
|------|-------------|
| `workflow.md` | Always — follow phase by phase |
| `architecture.md` | Phase 2 — when designing site structure |
| `templates/build-script-py.md` | Phase 3 — when generating build script |
| `templates/index-html.md` | Phase 4 — when generating HTML shell |
| `templates/style-css.md` | Phase 4 — when generating CSS |
| `templates/app-js.md` | Phase 4 — when generating router/renderer |
| `templates/vis-shared-js.md` | Phase 5 — when generating vis utilities |
| `templates/vis-module-template.md` | Phase 6 — when generating module vis |
| `reference/color-palette.md` | Phase 5-6 — when designing visuals |
| `reference/vis-patterns.md` | Phase 6 — when choosing vis patterns per module |
| `reference/vendor-libs.md` | Phase 4 — when setting up vendor libraries |

## Key Architecture Decisions (baked in)

- **Hash-based SPA routing**: `#/`, `#/module/{id}`, `#/doc/{moduleId}/{docId}`
- **Dual-mode data loading**: `window.DOCS_DATA` (file://), `fetch()` (HTTP)
- **Visualization registry**: `getModuleVis(id)` returns render function or null; modules without vis fall back to text
- **CSS variable theme system**: `:root` for light, `body.dark` for dark
- **ES5 JavaScript**: `var`, `function` — no arrow functions — maximum browser compatibility
- **Graceful degradation**: rough.js not loaded? use plain SVG rects. mermaid not loaded? show code blocks.

## Output Expectations

Generate **real, working files** — not instructions. The site should work immediately by:
1. Running `python build_site.py` to convert docs
2. Double-clicking `index.html` in a browser
