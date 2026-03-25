---
name: excalidraw-workflow
description: >-
  Generate Excalidraw diagrams and export them to PNG. Covers architecture
  overviews, class diagrams, flowcharts, data flow, mind maps, sequence diagrams,
  and ER diagrams. Includes visual standards, complexity budgets, and a bundled
  Node.js PNG export pipeline (portable across machines). Use when asked to create
  a diagram, visualize architecture, generate excalidraw files, or export diagrams
  to PNG.
---
# Excalidraw Workflow Skill

## 1. Supported Diagram Types

| Type                  | Best For                                               |
| --------------------- | ------------------------------------------------------ |
| Architecture overview | System topology, layer diagrams, module relationships  |
| Class diagram         | Object-oriented designs, especially 10+ classes        |
| Data flow / swimlane  | Cross-functional workflows, data pipelines             |
| Complex flowchart     | Decision trees, process flows with 8+ nodes            |
| Mind map              | Concept hierarchies, brainstorming, topic organization |
| Sequence diagram      | Object interactions over time (horizontal layout)      |
| ER diagram            | Database schemas, entity relationships                 |

## 2. Generation Workflow

1. **Analyze the request** -- determine diagram type, key entities, relationships, complexity
2. **Check complexity** -- if >20 elements, split into overview + detail diagrams (see section 5)
3. **Invoke `excalidraw-workflow`** skill for Excalidraw JSON generation
4. **Save** as `<descriptive-name>.excalidraw` in the project's diagram directory
5. **Export to PNG** using the bundled script (see section 4)
6. **Reference the `.png`** in documentation for broad compatibility (`.excalidraw` is the editable source, `.png` is the viewable output)

## 3. Visual Standards

### Color scheme

| Role                | Color       | Hex         |
| ------------------- | ----------- | ----------- |
| Primary elements    | Light blue  | `#a5d8ff` |
| Secondary elements  | Light green | `#b2f2bb` |
| Central / important | Yellow      | `#ffd43b` |
| Alerts / warnings   | Light red   | `#ffc9c9` |

### Typography

- All text elements: `fontFamily: 5` (Excalifont)
- Font size: 16-24px for readability

### Layout

- Horizontal gap between elements: 200-300px
- Vertical gap between rows: 100-150px
- Center important elements; use consistent spacing

### File naming

- Single diagram: `<system-name>.excalidraw` (Chinese or English, descriptive)
- Multi-level split: `<system>-overview.excalidraw` + `<system>-<subsystem>.excalidraw`
- Output directory: place in the project's designated diagram directory (e.g., `Document/diagrams/`)

## 4. PNG Export Pipeline

The skill bundles a portable Node.js export tool in `scripts/`. It uses Excalidraw's native renderer (roughjs hand-drawn style + Excalidraw fonts) via headless Chromium -- output is identical to web export.

> **Note**: `<skill-root>` in the commands below refers to the installation directory of this skill. Replace it with the actual path when executing commands.

### First-time setup (once per machine)

```bash
cd <skill-root>/scripts && npm install
```

Prerequisites: Node.js >= 18. The `npm install` downloads Puppeteer + Chromium (~200MB, cached after first run).

### Export commands

```bash
# Export a single diagram directory (incremental -- skips files that already have a .png)
node <skill-root>/scripts/export_excalidraw_png.js ./Document/diagrams

# Export multiple directories at once
node <skill-root>/scripts/export_excalidraw_png.js ./diagrams ./docs/images

# Force re-export all (overwrite existing PNGs)
node <skill-root>/scripts/export_excalidraw_png.js --force ./diagrams
```

### Configuration

Edit the constants at the top of `export_excalidraw_png.js`:

| Setting            | Default       | Description                              |
| ------------------ | ------------- | ---------------------------------------- |
| `SCALE`          | `2`         | Export resolution multiplier (2 = 2x HD) |
| `EXPORT_PADDING` | `20`        | Padding around diagram edges (px)        |
| `BG_COLOR`       | `'#ffffff'` | Background color                         |

### How it works

1. Launches one headless Chromium instance
2. Loads Excalidraw renderer from esm.sh CDN (first load ~3-5s, then cached)
3. Calls `exportToBlob()` per `.excalidraw` file
4. Writes `.png` next to the source file
5. Reuses the same browser page for all files (fast batch processing)

## 5. Complexity Budget

- **Target**: max 20 elements per diagram for clarity
- **If a system exceeds 20 elements**: split into overview + detail diagrams
  - Overview: shows major subsystems as single boxes with connecting arrows
  - Detail: one diagram per subsystem with internal components
- **Each diagram should be self-contained**: include a title text element and brief legend if needed

## 6. Post-Generation Checklist

After creating any diagram:

- [ ] `.excalidraw` file is valid JSON (opens in Excalidraw VS Code extension or excalidraw.com)
- [ ] PNG exported using the bundled export script
- [ ] `.png` file referenced in the analysis document (not the raw `.excalidraw`)
- [ ] Diagram registered in the project's master index document (if one exists)
- [ ] Element count is within the complexity budget (<= 20)
- [ ] Color scheme follows the visual standards table
- [ ] All text uses `fontFamily: 5`

## 7. Viewing and Editing

The generated `.excalidraw` files can be opened in:

- **Excalidraw VS Code extension** (recommended for in-IDE editing)
- **https://excalidraw.com** (drag-and-drop or File -> Open)
- Any tool that supports the Excalidraw JSON format

The exported `.png` files can be viewed in any image viewer or embedded in Markdown documentation.
