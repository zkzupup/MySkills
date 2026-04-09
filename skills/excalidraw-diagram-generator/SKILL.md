---
name: excalidraw-diagram-generator
description: 'Generate Excalidraw diagrams from natural language descriptions. Use when asked to "create a diagram", "make a flowchart", "visualize a process", "draw a system architecture", "create a mind map", or "generate an Excalidraw file". Supports flowcharts, relationship diagrams, mind maps, architecture, DFD, swimlane, class, sequence, and ER diagrams. Outputs .excalidraw JSON files. Visual standards and JSON schema are in references/excalidraw-reference.md.'
---

# Excalidraw Diagram Generator

Generate Excalidraw-format diagrams from natural language descriptions.

## Supported Diagram Types

| Type | Best For | Keywords |
|------|----------|----------|
| Flowchart | Sequential processes, decision trees | "workflow", "process", "steps" |
| Relationship Diagram | Entity connections, dependencies | "relationship", "connections", "structure" |
| Mind Map | Concept hierarchies, brainstorming | "mind map", "concepts", "breakdown" |
| Architecture Diagram | System design, module interactions | "architecture", "system", "components" |
| Data Flow Diagram (DFD) | Data flow, transformation processes | "data flow", "data processing" |
| Business Flow (Swimlane) | Cross-functional workflows, actor responsibilities | "swimlane", "business process", "actors" |
| Class Diagram | OOP design, class structures | "class", "inheritance", "OOP" |
| Sequence Diagram | Interaction sequences, message flows | "sequence", "interaction", "messages" |
| ER Diagram | Database schemas, entity relationships | "database", "entity", "data model" |

## Workflow

### Step 1: Understand the Request

Determine: diagram type, key elements, relationships, complexity.

### Step 2: Extract Structured Information

**Flowcharts:** Sequential steps, decision points, start/end points.

**Relationship Diagrams:** Entities/nodes (name + description), relationships (from → to + label).

**Mind Maps:** Central topic, main branches (3-6), sub-topics per branch.

**Data Flow Diagrams:** External entities, processes (transformations), data stores, data flows. Show data flow direction, not process order.

**Business Flow (Swimlane):** Actors/roles as header columns, process lanes, process boxes, cross-lane flow arrows.

**Class Diagrams:** Classes (name, attributes with visibility +/-/#, methods), relationships (inheritance, association, aggregation, composition, dependency), multiplicity notations.

**Sequence Diagrams:** Objects/actors (horizontal top), lifelines (vertical dashed), messages (horizontal arrows), activation boxes. Time flows top to bottom.

**ER Diagrams:** Entities with attributes, PK/FK markers, relationship lines with cardinality (1:1, 1:N, N:M), junction entities for many-to-many.

### Step 3: Generate Excalidraw JSON

Create the `.excalidraw` file following the schema and visual standards in `references/excalidraw-reference.md`.

**Text-First Sizing (mandatory order):**
1. Collect all text labels and determine `fontSize` for each
2. Compute each container's size from its text (CJK chars use `fontSize * 1.0` width, Latin uses `fontSize * 0.6`; add 40px horizontal + 40px vertical padding)
3. Lay out containers using the computed sizes: `x[i] = x[i-1] + width[i-1] + gap`
4. Never hardcode container x/y positions before computing text-driven sizes

**Key requirements:**
- All text: `fontFamily: 2` (Helvetica)
- Font size: 16-24px for readability
- Colors: see color scheme in reference
- Spacing: 200-300px horizontal, 100-150px vertical
- Max ~20 elements per diagram for clarity

**Arrow connection rules:**
- Vertical flow (parent above children): arrows exit from parent's **bottom** face, enter children's **top** face
- Horizontal flow (left to right): arrows exit from **right** face, enter **left** face
- When N arrows share the same face: distribute endpoints evenly (see `excalidraw-workflow` skill section 3.4)
- Never route arrows through intermediate boxes — use L-shaped orthogonal paths to detour

### Step 4: Save and Provide Instructions

1. Save as `<descriptive-name>.excalidraw`
2. Tell user how to open: Excalidraw VS Code extension, or drag-and-drop at excalidraw.com

## Element Count Guidelines

| Diagram Type | Recommended | Maximum |
|--------------|-------------|---------|
| Flowchart steps | 3-10 | 15 |
| Relationship entities | 3-8 | 12 |
| Mind map branches | 4-6 | 8 |
| Mind map sub-topics/branch | 2-4 | 6 |

If a request exceeds these limits, suggest splitting into overview + detail diagrams.

## Layout Algorithms

### Grid Layout (Relationship Diagrams)
```javascript
const columns = Math.ceil(Math.sqrt(entityCount));
const x = startX + (index % columns) * horizontalGap;
const y = startY + Math.floor(index / columns) * verticalGap;
```

### Radial Layout (Mind Maps)
```javascript
const angle = (2 * Math.PI * index) / branchCount;
const x = centerX + radius * Math.cos(angle);
const y = centerY + radius * Math.sin(angle);
```

## Validation Checklist

Before delivering:
- [ ] All elements have unique IDs
- [ ] Container sizes computed from text content (Text-First Sizing), not hardcoded
- [ ] CJK text uses `fontSize * 1.0` width factor (not 0.6)
- [ ] Coordinates prevent overlapping (>= 20px gap between same-level elements)
- [ ] Text is readable (font size 16+) and fully contained within its box
- [ ] All text elements use `fontFamily: 2`
- [ ] Arrows use correct connection faces (bottom→top for vertical flow, right→left for horizontal)
- [ ] Multiple arrows on same face are evenly distributed, not all at center
- [ ] No arrows route through intermediate boxes (use L-shaped detour if needed)
- [ ] Colors follow the scheme in `references/excalidraw-reference.md`
- [ ] File is valid JSON
- [ ] Element count <= 20

## Icon Libraries (Optional)

For specialized diagrams (AWS/GCP/Azure architecture), use pre-made icon libraries.

### Setup

1. **Check if library exists**: `libraries/<library-name>/reference.md`
2. **If not**: direct user to set up:
   - Download `.excalidrawlib` from https://libraries.excalidraw.com/
   - Place in `libraries/<library-name>/`
   - Run: `python scripts/split-excalidraw-library.py libraries/<library-name>/`
   - This creates `reference.md` (lookup table) and `icons/` (individual JSON files)

### Adding Icons (Recommended: Python Scripts)

```bash
# Add icon with label
python scripts/add-icon-to-diagram.py <diagram> <icon-name> <x> <y> --label "Text"

# Add icon from different library
python scripts/add-icon-to-diagram.py <diagram> <icon-name> <x> <y> \
  --library-path libraries/<library-name> --label "Text"

# Add connecting arrow
python scripts/add-arrow.py <diagram> <from-x> <from-y> <to-x> <to-y> \
  [--label "Text"] [--style solid|dashed|dotted] [--color HEX]
```

Edit via `.excalidraw.edit` is enabled by default; pass `--no-use-edit-suffix` to disable.

**Benefits:** No token consumption for icon JSON data, deterministic coordinate transforms, automatic unique ID generation.

### Example: AWS Architecture Diagram

```bash
# 1. Create base .excalidraw with title and structure
# 2. Add icons
python scripts/add-icon-to-diagram.py my-diagram.excalidraw "Internet-gateway" 150 100 --label "Internet Gateway"
python scripts/add-icon-to-diagram.py my-diagram.excalidraw VPC 200 200
python scripts/add-icon-to-diagram.py my-diagram.excalidraw ELB 350 250 --label "Load Balancer"
python scripts/add-icon-to-diagram.py my-diagram.excalidraw EC2 500 300 --label "Web Server"
python scripts/add-icon-to-diagram.py my-diagram.excalidraw RDS 650 350 --label "Database"
# 3. Add arrows
python scripts/add-arrow.py my-diagram.excalidraw 200 150 250 200
python scripts/add-arrow.py my-diagram.excalidraw 265 230 350 250
python scripts/add-arrow.py my-diagram.excalidraw 415 280 500 300
python scripts/add-arrow.py my-diagram.excalidraw 565 330 650 350 --label "SQL" --style dashed
```

### Manual Icon Integration (Fallback)

Only if Python scripts are unavailable:
1. Read `libraries/<name>/reference.md` for icon lookup
2. Load needed icon JSON files from `icons/` (200-1000 lines each — high token cost)
3. Extract elements, calculate bounding boxes, transform coordinates, regenerate IDs
4. Merge into diagram

### No Icons Available

Create diagrams with basic shapes + color coding + text labels. Inform user they can add icons later.

## References

- `references/excalidraw-reference.md` — JSON schema, element types, visual standards
- `templates/` — Starter templates for each diagram type
- `scripts/README.md` — Python script documentation

## Limitations

- Complex curves simplified to straight/basic curved lines
- Hand-drawn roughness set to default (1)
- No embedded images in auto-generation
- Max ~20 elements per diagram
- No automatic collision detection (use spacing guidelines)
