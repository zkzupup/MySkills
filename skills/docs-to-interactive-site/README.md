# docs-to-interactive-site

A Claude Code Skill that converts technical markdown documentation into a self-contained interactive visualization website.

## What It Produces

- Zero-dependency static SPA (no npm, no frameworks, no build tools at runtime)
- Hash-based routing: `#/`, `#/module/{id}`, `#/doc/{moduleId}/{docId}`
- Rough.js hand-drawn SVG diagrams (Excalidraw aesthetic)
- Mermaid.js client-side rendering for code-block diagrams
- Fuse.js fuzzy search
- Light/dark theme with CSS variables
- Per-module custom interactive visualizations
- Works offline via `file://` protocol (double-click `index.html`)

## How To Use

1. In Claude Code, say one of:
   - `"create documentation site"`
   - `"docs to interactive site"`
   - `"文档可视化"`
   - `"文档转网站"`

2. Provide the path to your documentation root directory

3. Claude will follow the 8-phase workflow:
   - Analyze docs -> Design -> Build script -> SPA shell -> Vis utilities -> Module vis -> Homepage -> Test

4. Run `python build_site.py` to convert your markdown docs, then open `index.html`

## File Structure

```
docs-to-interactive-site/
  skill.yaml           # Skill config + trigger phrases
  SKILL.md             # Main entry point (loaded on trigger)
  workflow.md          # 8-phase detailed guide
  architecture.md      # SPA architecture reference
  templates/
    index-html.md      # HTML shell template
    style-css.md       # Complete CSS with theming
    app-js.md          # Router + renderer skeleton
    vis-shared-js.md   # Reusable vis utilities library
    vis-module-template.md  # Guide for writing module vis
    build-script-py.md     # Python build script skeleton
  reference/
    color-palette.md   # Excalidraw color system
    vis-patterns.md    # 8 visualization patterns catalog
    vendor-libs.md     # Rough.js/Mermaid/Fuse.js integration
```

## Requirements

- Python 3.x (for one-time build script)
- A modern browser (for viewing the generated site)
- Markdown documentation organized in directories

## Visualization Patterns

| Pattern | Best For |
|---------|----------|
| Waterfall | Boot sequences, initialization chains |
| FSM | State machines, lifecycle flows |
| Pipeline | Data flow, producer-consumer |
| Swimlane | Cross-layer interactions |
| Layered Stack | Architecture layers |
| Three-Band | Timeline with parallel tracks |
| Hub-Spoke | Central registry/manager |
| Sequence | Step-by-step processes |

## Origin

Developed during the iGoal2 project documentation effort (121 markdown analysis documents covering a Unity soccer mobile game with Lua+C# dual-layer architecture). Extracted and generalized for cross-project reuse.
