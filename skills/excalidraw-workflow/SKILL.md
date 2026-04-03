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
- [ ] Every text with `containerId` has a matching `{"type": "text"}` entry in its container's `boundElements` (section 8.1)
- [ ] Every arrow's start point is at the start element's boundary, not inside or at the end element (section 8.2)
- [ ] No unintended horizontal overlap between same-level rectangles (>= 20px gap) (section 8.3)

## 7. Viewing and Editing

The generated `.excalidraw` files can be opened in:

- **Excalidraw VS Code extension** (recommended for in-IDE editing)
- **https://excalidraw.com** (drag-and-drop or File -> Open)
- Any tool that supports the Excalidraw JSON format

The exported `.png` files can be viewed in any image viewer or embedded in Markdown documentation.

## 8. JSON Correctness Rules

These rules prevent rendering defects discovered during batch export of 378 diagrams. Violations cause visual artifacts (empty boxes, arrows through boxes, overlapping elements) that are only visible in the exported PNG -- the raw JSON may appear syntactically valid.

### 8.1 Text-container binding must be bidirectional

When placing text inside a container (rectangle, diamond, ellipse):

1. The **text** element MUST set `"containerId": "<container-id>"`
2. The **container** element MUST include `{"type": "text", "id": "<text-id>"}` in its `boundElements` array
3. A one-sided reference (only containerId OR only boundElements) causes the text to **not render** inside the box in exported PNGs

Correct example:

```json
{"type": "rectangle", "id": "r1",
 "boundElements": [{"type": "text", "id": "t1"}, {"type": "arrow", "id": "a1"}],
 ...}

{"type": "text", "id": "t1",
 "containerId": "r1", "verticalAlign": "middle", "textAlign": "center",
 ...}
```

Similarly, when an arrow binds to a container, both sides must agree: the arrow's `startBinding`/`endBinding` must reference the container, and the container's `boundElements` must include `{"type": "arrow", "id": "<arrow-id>"}`.

### 8.2 Arrow coordinates must match bound elements

When an arrow has `startBinding` and `endBinding`, its `x`, `y`, and `points` must be geometrically consistent with the bound elements' positions.

**Rules:**

- Arrow start point `(x, y)` MUST be on or near the boundary of the **start** element
- Arrow end point `(x + points[-1][0], y + points[-1][1])` MUST be on or near the boundary of the **end** element
- Determine connection face by comparing element centers: horizontal neighbors use left/right faces; vertical neighbors use top/bottom faces
- Apply a `gap` of 4px between the arrow endpoint and the element edge
- Set `width = abs(points[-1][0])` and `height = abs(points[-1][1])`

**Horizontal arrow** (start element left of end element):

```
arrow.x = start.x + start.width + gap
arrow.y = start.y + start.height / 2
dx = end.x - gap - arrow.x
arrow.points = [[0, 0], [dx, 0]]
arrow.width = abs(dx);  arrow.height = 0
```

**Vertical arrow** (start element above end element):

```
arrow.x = start.x + start.width / 2
arrow.y = start.y + start.height + gap
dy = end.y - gap - arrow.y
arrow.points = [[0, 0], [0, dy]]
arrow.width = 0;  arrow.height = abs(dy)
```

**Common mistake**: placing the arrow's start point at the end element's boundary (coordinates swapped relative to the binding direction). This causes the arrow to render through the box.

### 8.3 Element spacing -- no unintended overlap

- Same-level rectangles MUST have a horizontal gap of at least **20px** between edges
- Validation formula: `left_rect.x + left_rect.width + 20 <= right_rect.x`
- **Intentional containment** (a background rectangle holding child boxes inside it) is allowed -- the child's bounding box should be fully within the parent's bounding box
- When multiple boxes share the same y-level, lay them out left-to-right with explicit gap calculations rather than hardcoding x positions

### 8.4 Text width estimation for fontFamily 5

Excalidraw's default font (`fontFamily: 5`, Excalifont/Virgil) has irregular character widths. Use these rules to prevent text overflow:

| Parameter | Value |
|-----------|-------|
| Character width factor | `fontSize * 0.75` per character |
| Container horizontal padding | 20px per side (40px total) |
| Available text width | `container.width - 40` |
| Max container width | 1000px |

- Estimate each line's pixel width: `lineWidth = charCount * fontSize * 0.75`
- If `lineWidth > availableWidth`: either insert `\n` line breaks or widen the container
- After wrapping, verify container height accommodates all lines: `requiredHeight = lineCount * fontSize * 1.25 + 2 * paddingY`
- Set text `originalText` to the unwrapped version and `text` to the wrapped version with `\n`
