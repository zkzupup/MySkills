# Excalidraw Reference

JSON schema, element types, and visual standards for Excalidraw diagram generation.

## Top-Level Structure

```typescript
interface ExcalidrawFile {
  type: "excalidraw";
  version: 2;
  source: "https://excalidraw.com";
  elements: ExcalidrawElement[];
  appState: { viewBackgroundColor: string; gridSize: number };
  files: Record<string, any>; // Usually {}
}
```

## Base Element Properties

All elements share these properties:

```typescript
interface BaseElement {
  id: string;                  // Unique identifier
  type: ElementType;
  x: number; y: number;       // Position (origin = top-left, Y increases downward)
  width: number; height: number;
  angle: number;               // Radians (usually 0)
  strokeColor: string;         // Default "#1e1e1e"
  backgroundColor: string;     // Hex or "transparent"
  fillStyle: "solid" | "hachure" | "cross-hatch";
  strokeWidth: number;         // 1-4 typically
  strokeStyle: "solid" | "dashed" | "dotted";
  roughness: number;           // 0-2 (1 = default hand-drawn)
  opacity: number;             // 0-100
  groupIds: string[];
  frameId: null;
  index: string;               // Stacking order (e.g., "a0", "a1")
  roundness: Roundness | null;
  seed: number;                // Math.floor(Math.random() * 2147483647)
  version: number;             // >= 1, increment on edit
  versionNonce: number;        // Random, changed on edit
  isDeleted: false;
  boundElements: BoundElement[] | null;
  updated: number;             // Timestamp ms
  link: null;
  locked: false;
}
```

## Element Types

### Rectangle

```typescript
{ type: "rectangle", roundness: { type: 3 } }  // type 3 = rounded corners
```

| Content | Width | Height |
|---------|-------|--------|
| Single word | 120-150px | 60-80px |
| Short phrase (2-4 words) | 180-220px | 80-100px |
| Sentence | 250-300px | 100-120px |

Use cases: process steps (green `#b2f2bb`), entities (blue `#a5d8ff`), system components, data stores.

### Ellipse

```typescript
{ type: "ellipse" }  // For circles: width === height
```

| Content | Diameter |
|---------|----------|
| Icon/Symbol | 60-80px |
| Short text | 100-120px |
| Longer text | 150-180px |

Use cases: start/end points, states, emphasis.

### Diamond

```typescript
{ type: "diamond" }  // Needs more space than rectangles for same text
```

| Content | Size |
|---------|------|
| Yes/No decision | 120-140px |
| Short question | 160-180px |
| Longer question | 200-220px |

Use cases: decision points, conditional branches.

### Arrow

```typescript
{
  type: "arrow",
  points: [[0, 0], [endX, endY]],   // Relative to (x, y)
  roundness: { type: 2 },            // Curved
  startBinding: Binding | null,
  endBinding: Binding | null
}
```

| Style | strokeStyle | Use Case |
|-------|-------------|----------|
| Standard | `"solid"` | Normal flow |
| Optional | `"dashed"` | Optional paths |
| Indirect | `"dotted"` | Indirect relationships |

Arrow labels: use a separate text element near the arrow midpoint.

### Line

```typescript
{ type: "line", points: [[0, 0], [x2, y2], ...] }
```

Use cases: non-directional connections, dividers, borders.

### Text

```typescript
{
  type: "text",
  text: string,
  fontSize: number,
  fontFamily: number,           // 2 = Helvetica (required default)
  textAlign: "left" | "center" | "right",
  verticalAlign: "top" | "middle" | "bottom"
}
```

| Purpose | Font Size |
|---------|-----------|
| Main title | 28-36 |
| Section header | 24-28 |
| Element label | 18-22 |
| Annotation | 14-16 |
| Small note | 12-14 |

### Text Width Estimation (fontFamily 2)

Excalidraw Helvetica font (`fontFamily: 2`) renders clean sans-serif text. CJK (Chinese/Japanese/Korean) characters are significantly wider than Latin characters.

**Character width factors:**

| Character type | Width per character | How to identify |
|----------------|--------------------|----|
| Latin / ASCII (a-z, 0-9, punctuation) | `fontSize * 0.6` | Unicode < 0x2E80 |
| CJK / fullwidth (中文, ひらがな, etc.) | `fontSize * 1.0` | Unicode >= 0x2E80 |

**Container sizing formula:**

```
lineWidth = Σ (per-character width based on type above)
containerWidth = max(lineWidth + 40, minWidth)     // 40 = 20px padding × 2 sides
availableTextWidth = containerWidth - 40
```

**Line wrapping and height:**

- If `lineWidth > availableTextWidth`: insert `\n` to wrap, or widen the container
- `requiredHeight = lineCount * fontSize * 1.25 + 40`  (40 = 20px vertical padding × 2)
- Set `originalText` to unwrapped version, `text` to wrapped version with `\n`
- Max container width: 1000px — beyond this, force line wrapping

**Text-First Sizing rule (critical):**

Always determine text content and compute container size BEFORE laying out positions. Never hardcode container positions first and fill text later — this causes text overflow and overlap between adjacent boxes.

```
Step 1: Collect all text labels
Step 2: Compute each container's width/height from its text
Step 3: Lay out containers left-to-right or top-to-bottom using computed sizes
         x[i] = x[i-1] + width[i-1] + gap
```

## Bindings

```typescript
interface Binding {
  elementId: string;   // ID of bound element
  focus: number;       // -1 to 1, position along edge
  gap: number;         // Distance from element edge
}
```

## Color Scheme

| Role | Color | Hex |
|------|-------|-----|
| Default stroke | Black | `#1e1e1e` |
| Primary elements | Light blue | `#a5d8ff` |
| Process steps | Light green | `#b2f2bb` |
| Central / important | Yellow | `#ffd43b` |
| Alerts / warnings | Light red | `#ffc9c9` |
| Secondary items | Cyan | `#96f2d7` |
| No fill | Transparent | `transparent` |
| Background | White | `#ffffff` |

## Font Families

| ID | Name | Description |
|----|------|-------------|
| 2 | Helvetica | Clean sans-serif (**required default for all text**) |
| 5 | Excalifont | Hand-drawn style |
| 1 | Virgil | Legacy hand-drawn style |
| 3 | Cascadia | Monospace |

## Layout Spacing

| Context | Spacing |
|---------|---------|
| Horizontal gap between elements | 200-300px |
| Vertical gap between rows | 100-150px |
| Minimum margin from edge | 50px |
| Arrow-to-box clearance | 20-30px |

## ID Generation

```javascript
const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
```

## Combining Elements — Common Patterns

### Labeled Box

```json
[
  { "type": "rectangle", "id": "box1", "x": 100, "y": 100, "width": 200, "height": 100,
    "text": "Component", "textAlign": "center", "verticalAlign": "middle" }
]
```

### Connected Boxes

```json
[
  { "type": "rectangle", "id": "box1", "x": 100, "y": 100, "width": 150, "height": 80, "text": "Step 1" },
  { "type": "arrow", "id": "arrow1", "x": 250, "y": 140, "points": [[0, 0], [100, 0]] },
  { "type": "rectangle", "id": "box2", "x": 350, "y": 100, "width": 150, "height": 80, "text": "Step 2" }
]
```

### Decision Tree

```json
[
  { "type": "diamond", "id": "d1", "x": 100, "y": 100, "width": 140, "height": 140, "text": "Valid?" },
  { "type": "arrow", "id": "a1", "x": 240, "y": 170, "points": [[0, 0], [60, 0]] },
  { "type": "text", "id": "t1", "x": 250, "y": 150, "text": "Yes", "fontSize": 14 },
  { "type": "rectangle", "id": "r1", "x": 300, "y": 140, "width": 120, "height": 60, "text": "Process" }
]
```

## Validation Rules

**Required:**
- All IDs must be unique
- `type` must match actual element type
- `version` >= 1, `opacity` 0-100, `isDeleted` = false
- All text elements use `fontFamily: 2`

**Recommended:**
- `roughness` = 1, `strokeWidth` = 2
- `locked` = false, `frameId` = null, `link` = null

## Complete Minimal Example

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "box1", "type": "rectangle",
      "x": 100, "y": 100, "width": 200, "height": 100,
      "angle": 0, "strokeColor": "#1e1e1e", "backgroundColor": "#a5d8ff",
      "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid",
      "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null,
      "index": "a0", "roundness": { "type": 3 },
      "seed": 1234567890, "version": 1, "versionNonce": 987654321,
      "isDeleted": false, "boundElements": null,
      "updated": 1706659200000, "link": null, "locked": false,
      "text": "Hello", "fontSize": 20, "fontFamily": 2,
      "textAlign": "center", "verticalAlign": "middle"
    }
  ],
  "appState": { "viewBackgroundColor": "#ffffff", "gridSize": 20 },
  "files": {}
}
```
