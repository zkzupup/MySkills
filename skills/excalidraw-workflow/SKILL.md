---
name: excalidraw-workflow
description: >-
  Export Excalidraw diagrams to PNG and validate JSON correctness. Includes a
  bundled Node.js PNG export pipeline (Puppeteer + headless Chromium) and JSON
  correctness rules discovered from batch-exporting 378 diagrams. Use after
  generating an .excalidraw file to export it to PNG, or when diagrams show
  rendering defects (empty boxes, arrows through boxes, overlapping elements).
---
# Excalidraw Workflow — Export & Validation

This skill handles **PNG export** and **JSON correctness validation** for Excalidraw diagrams. For diagram generation (types, templates, visual standards), see the `excalidraw-diagram-generator` skill.

## 1. Workflow Overview

1. Generate `.excalidraw` JSON using the `excalidraw-diagram-generator` skill
2. Validate JSON against the correctness rules below (section 3)
3. Export to PNG using the bundled script (section 2)
4. Reference the `.png` in documentation (`.excalidraw` is the editable source)

## 2. PNG Export Pipeline

The skill bundles a portable Node.js export tool in `scripts/`. It uses Excalidraw's native renderer (roughjs hand-drawn style + Excalidraw fonts) via headless Chromium — output is identical to web export.

> **Note**: `<skill-root>` in the commands below refers to the installation directory of this skill. Replace it with the actual path when executing commands.

### First-time setup (once per machine)

```bash
cd <skill-root>/scripts && npm install
```

Prerequisites: Node.js >= 18. The `npm install` downloads Puppeteer + Chromium (~200MB, cached after first run).

### Export commands

```bash
# Export a single diagram directory (incremental — skips files that already have a .png)
node <skill-root>/scripts/export_excalidraw_png.js ./Document/diagrams

# Export multiple directories at once
node <skill-root>/scripts/export_excalidraw_png.js ./diagrams ./docs/images

# Force re-export all (overwrite existing PNGs)
node <skill-root>/scripts/export_excalidraw_png.js --force ./diagrams
```

### Configuration

Edit the constants at the top of `export_excalidraw_png.js`:

| Setting          | Default     | Description                            |
| ---------------- | ----------- | -------------------------------------- |
| `SCALE`          | `2`         | Export resolution multiplier (2 = 2x HD) |
| `EXPORT_PADDING` | `20`        | Padding around diagram edges (px)      |
| `BG_COLOR`       | `'#ffffff'` | Background color                       |

### How it works

1. Launches one headless Chromium instance
2. Loads Excalidraw renderer from esm.sh CDN (first load ~3-5s, then cached)
3. Calls `exportToBlob()` per `.excalidraw` file
4. Writes `.png` next to the source file
5. Reuses the same browser page for all files (fast batch processing)

## 3. JSON Correctness Rules

These rules prevent rendering defects discovered during batch export of 378 diagrams. Violations cause visual artifacts (empty boxes, arrows through boxes, overlapping elements) that are only visible in the exported PNG — the raw JSON may appear syntactically valid.

### 3.1 Text-container binding must be bidirectional

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

### 3.2 Arrow connection face selection

When an arrow connects two elements, the **connection face** (top/bottom/left/right) determines where the arrow touches each element. Wrong face selection causes arrows to cross through boxes or take visually bizarre routes.

**Face selection rules (in priority order):**

1. **Vertical flow (parent above children):** exit from parent's **bottom** face → enter child's **top** face
2. **Horizontal flow (source left of target):** exit from source's **right** face → enter target's **left** face
3. **Diagonal:** prefer the faces that match the dominant direction — if `|dy| > |dx|`, use top/bottom faces; if `|dx| > |dy|`, use left/right faces
4. **Loop/cycle connections (e.g., state machines):** use non-primary faces to avoid crossing the element itself — e.g., exit from **right** face, loop around, enter from **top** face

**Coordinate formulas (gap = 4px):**

| Direction | arrow.x | arrow.y | endpoint dx, dy |
|-----------|---------|---------|----------------|
| Top→Bottom | start.x + start.width/2 | start.y + start.height + gap | 0, (end.y - gap) - arrow.y |
| Left→Right | start.x + start.width + gap | start.y + start.height/2 | (end.x - gap) - arrow.x, 0 |

- Set `width = abs(points[-1][0])`, `height = abs(points[-1][1])`
- **Common mistake**: arrow start point placed at the *end* element's boundary (swapped). This causes arrow to render through the box.

### 3.3 Element spacing — no unintended overlap

**Prerequisite: Text-First Sizing.** Container sizes must be computed from text content BEFORE laying out positions. Never hardcode x/y then fill text — this causes text overflow and box overlap.

**Layout flow:**
```
1. Compute each container's width/height from its text
   (CJK: fontSize * 1.0 per char, Latin: fontSize * 0.6; add 40px padding each axis)
2. Lay out positions: x[i] = x[i-1] + width[i-1] + gap
3. Validate: left_rect.x + left_rect.width + 20 <= right_rect.x
```

**Rules:**
- Same-level rectangles MUST have **>= 20px** horizontal gap between edges
- **Intentional containment** (parent rectangle holding children) is allowed — children must be fully within parent bbox
- When multiple boxes share the same y-level, use the computed widths for cumulative x positioning — never assume fixed widths

### 3.4 Arrow routing — fan-out, fan-in, and avoidance

#### 3.4.1 Fan-out / Fan-in endpoint distribution

When N arrows connect to the **same face** of an element, distribute endpoints evenly — never cluster all at the center point.

```
faceLength = element.width  (for top/bottom face)
           = element.height (for left/right face)
edgePadding = 20px
usable = faceLength - 2 * edgePadding
spacing = usable / (N + 1)

endpoint offset for arrow i (0-indexed):
  offset_i = edgePadding + spacing * (i + 1)
```

**Example:** 3 arrows exit from bottom face of a 300px-wide box:
```
usable = 300 - 40 = 260,  spacing = 260 / 4 = 65
offsets: 85, 150, 215  (evenly spread, not all at 150)
```

For fan-in (N arrows arriving at the same face), apply the same distribution to the arrival endpoints.

#### 3.4.2 Arrow avoidance — no crossing through boxes

When a straight line between start and end would intersect an intermediate element:

1. **Use L-shaped orthogonal routing** (2 segments): one horizontal + one vertical
   - `points: [[0, 0], [midX, 0], [midX, dy]]`
   - The turn point must be at least **30px** outside the intermediate element's bounding box
2. If L-shape still intersects, use **U-shaped routing** (3 segments):
   - Route around the obstacle with an additional offset segment
   - `points: [[0, 0], [0, -detourY], [dx, -detourY], [dx, dy]]`

#### 3.4.3 Parallel arrow separation

When multiple arrows run parallel paths (e.g., 3 vertical arrows side by side):
- Offset each by at least **15px** horizontally to prevent visual merging
- Arrows must not overlap text labels

## 4. Post-Export Checklist

After creating and exporting any diagram:

- [ ] `.excalidraw` file is valid JSON
- [ ] Container sizes match their text content (Text-First Sizing — no text overflow)
- [ ] CJK text width uses `fontSize * 1.0` factor
- [ ] PNG exported using the bundled export script
- [ ] `.png` referenced in documentation (not raw `.excalidraw`)
- [ ] Bidirectional binding: every `containerId` has matching `boundElements` entry (3.1)
- [ ] Arrow connection faces match flow direction — bottom→top for vertical, right→left for horizontal (3.2)
- [ ] Same-level elements have >= 20px gap (3.3)
- [ ] Fan-out/fan-in arrows distributed evenly across the face, not clustered at center (3.4.1)
- [ ] No arrows crossing through intermediate boxes (3.4.2)
- [ ] Parallel arrows offset by >= 15px (3.4.3)
