# Docs-to-Interactive-Site: 8-Phase Workflow

## Quick Reference — Template & Reference Files

| Phase | Files to Load |
|-------|--------------|
| 2 | `architecture.md` |
| 3 | `templates/build-script-py.md` |
| 4 | `templates/index-html.md`, `templates/style-css.md`, `templates/app-js.md`, `reference/vendor-libs.md` |
| 5 | `templates/vis-shared-js.md` |
| 6 | `templates/vis-module-template.md`, `reference/vis-patterns.md`, `reference/color-palette.md` |

---

## Phase 1: Analyze Documentation

**Goal**: Understand the documentation structure, identify modules, count files, detect language.

**Inputs**: Path to documentation root directory.

**Steps**:
1. Scan the doc root directory for subdirectories. Each subdirectory = one module.
2. Detect naming convention:
   - Numeric prefix: `010-LuaFramework/`, `020-MatchEngine/`
   - Feature prefix: `F01-AISystem/`, `F04-SkillSystem/`
   - Plain names: `Authentication/`, `GameLogic/`
3. Count markdown files per module.
4. Look for a `diagrams/` or `images/` folder (per-module or at doc root).
5. Detect primary language from file content (Chinese/English/mixed).
6. Identify module relationships from cross-references in the docs.

**Output**: Module inventory — a table with:

| Module Dir | ID | Name | File Count | Language | Has Diagrams |
|-----------|-----|------|------------|----------|-------------|
| 010-LuaFramework | 010 | Lua Framework | 8 | zh | yes |

**Decision Gate**: Present inventory to user. Ask:
- Are there modules to exclude?
- Are the module names/groupings correct?
- Which modules are most important (P0/P1/P2)?

---

## Phase 2: Design Site Architecture

**Goal**: Plan the site structure, assign IDs, decide visualization strategy.

**Reference**: Load `architecture.md` for routing and data patterns.

**Inputs**: Module inventory from Phase 1, user priority feedback.

**Steps**:
1. Assign module IDs:
   - Use existing numeric prefixes if available (010, 020, etc.)
   - Otherwise assign 3-digit IDs: structural=0xx, features=Fxx
2. Group modules for sidebar:
   - Group 1: Structural/foundational modules
   - Group 2: Feature/business modules
   - (Optional) Group 3: Infrastructure/tooling
3. Prioritize modules:
   - P0 = Critical, gets custom visualization + detailed treatment
   - P1 = Important, gets custom visualization
   - P2 = Standard, text-only with doc navigation
4. For each P0/P1 module, pre-select a visualization pattern from `reference/vis-patterns.md`:
   - Boot/init sequence -> Waterfall
   - State machine -> FSM
   - Data flow -> Pipeline
   - Cross-layer interaction -> Swimlane
   - Architecture layers -> Layered Stack
   - Central registry -> Hub-Spoke

**Output**: Site design document:

```
Project: {{PROJECT_NAME}}
Language: {{LANG}}
Sidebar Groups: [structural, features]
Modules:
  010: { name: "...", group: "structural", priority: "P0", vis: "waterfall" }
  020: { name: "...", group: "structural", priority: "P0", vis: "fsm" }
  F01: { name: "...", group: "features",   priority: "P1", vis: "hub-spoke" }
  ...
Reading Paths:
  fullstack: [010, 060, 020, 030, 040, ...]
  gameplay: [020, F01, F04, 050, 030, ...]
```

**Decision Gate**: Present design to user for approval before generating files.

---

## Phase 3: Generate Build Script

**Goal**: Create `build_site.py` that converts markdown docs into site data.

**Reference**: Load `templates/build-script-py.md`.

**Inputs**: Site design from Phase 2, doc root path.

**Steps**:
1. Copy the build script skeleton from template.
2. Adapt these sections (marked `/* ADAPT */`):
   - `MODULE_PATTERN`: Regex matching directory names (e.g., `r'(\d{3})-(.+)'`)
   - `MODULE_META`: Dict mapping module IDs to metadata (name, group, priority, layer)
   - `DOC_ROOT`: Path to documentation
   - `SITE_DIR`: Output directory
3. Configure metadata extraction:
   - Title: first `#` heading in markdown
   - Summary: first paragraph after title
   - File references: extract `code` mentions
4. Test run: `python build_site.py --dry-run` to verify module detection.

**Output**: Working `build_site.py` in site directory. When run, generates:
- `data/modules.json` — module tree with doc lists
- `data/search-index.json` — flat array for Fuse.js
- `data/all-docs.js` — inline data for file:// mode
- `site/images/` — copied diagram images

**Decision Gate**: Run build, verify output JSON is correct.

---

## Phase 4: Generate SPA Shell

**Goal**: Create the HTML + CSS + JS framework.

**Reference**: Load `templates/index-html.md`, `templates/style-css.md`, `templates/app-js.md`, `reference/vendor-libs.md`.

**Steps**:

### 4a. HTML Shell
1. Copy from `templates/index-html.md`.
2. Replace `{{PROJECT_NAME}}` with actual project name.
3. Replace `{{LANG}}` with language code.
4. Add `<script>` tags for each module visualization file.

### 4b. CSS
1. Copy from `templates/style-css.md`.
2. Customize font families if needed (CJK fonts for Chinese, etc.).
3. Optionally adjust layer colors in `:root` variables.

### 4c. App.js
1. Copy skeleton from `templates/app-js.md`.
2. Fill in `READING_PATHS` with actual module routes.
3. Fill in `MODULE_VIS_REGISTRY` — map module IDs to render functions.
4. Adapt `renderHomepage()` content (project intro, architecture overview, scenario cards).
5. Set sidebar group names.

### 4d. Vendor Libraries
1. Download vendor JS files per `reference/vendor-libs.md`:
   - `js/vendor/rough.min.js` (rough.js)
   - `js/vendor/mermaid.min.js` (mermaid)
   - `js/vendor/fuse.min.js` (fuse.js)
2. Each loads with `onerror` fallback handler.

### 4e. Diagram.js (Optional)
If the homepage has an interactive architecture overview SVG (most projects do), create `js/diagram.js` with:
- SVG node definitions for module boxes
- Click-to-navigate handlers
- Hover tooltips
- Rough.js rendering

**Output**: Complete site directory structure:
```
site/
  index.html
  css/style.css
  js/app.js
  js/diagram.js
  js/vendor/rough.min.js
  js/vendor/mermaid.min.js
  js/vendor/fuse.min.js
  data/  (generated by build script)
```

**Decision Gate**: Open `index.html` — should show loading state gracefully.

---

## Phase 5: Generate Shared Visualization Utilities

**Goal**: Create `js/vis-shared.js` — the reusable visualization toolkit.

**Reference**: Load `templates/vis-shared-js.md`.

**Steps**:
1. Copy `vis-shared.js` from template **nearly verbatim** — it is project-agnostic.
2. Only customize if:
   - Font family needs adjustment (line with `"Microsoft YaHei"`)
   - Default SVG dimensions need changing
3. Verify `VisShared` API is available in browser console.

**Output**: `js/vis-shared.js` (~600 lines). Provides:
- `createSVG()` — SVG with zoom button and lightbox
- `drawBox()`, `drawLine()`, `drawArrow()` — Rough.js wrappers with fallbacks
- `fadeIn()`, `animateDot()` — animation helpers
- `createDetailPanel()` — click-to-show info panel
- `createToolbar()` — play/scenario button bar
- `renderModuleHeader()`, `renderDocFooter()` — page structure
- `createSequenceView()`, `createFsmExplorer()` — high-level widgets

**Decision Gate**: None — this file rarely needs changes.

---

## Phase 6: Generate Module Visualizations

**Goal**: For each P0/P1 module, create a custom interactive visualization.

**Reference**: Load `templates/vis-module-template.md`, `reference/vis-patterns.md`, `reference/color-palette.md`.

**Steps** (repeat for each module):

1. **Read all docs** in the module thoroughly. Understand:
   - Key components/classes/systems
   - Relationships and data flow
   - State transitions (if any)
   - Performance-critical paths
   - Architecture layers

2. **Choose visualization pattern** from `reference/vis-patterns.md`:
   - Match pattern to module's primary abstraction
   - Consider what will be most informative to a reader

3. **Design SVG layout**:
   - Determine dimensions (typically 860x400 to 920x560)
   - Plan box positions, arrow routes, zone backgrounds
   - Allocate space for labels, legends, detail panel triggers
   - Avoid text overlapping boxes (common bug — padding matters)

4. **Write `vis-{id}.js`**:
   - Function name: `renderVis{ID}(container, mod)`
   - Use `VisShared` API exclusively (no direct DOM SVG creation)
   - Add click handlers on important elements -> detail panel
   - Add fade-in animations (stagger by layer/group)
   - Add toolbar for animation/scenario buttons if applicable
   - Include stats grid with key architectural metrics
   - End with `V.renderDocFooter(container, '{id}', mod.docs)`

5. **Register** in app.js's `MODULE_VIS_REGISTRY`.

**Common Pitfalls**:
- Text overlapping boxes: ensure `labelPad` offset for zone labels
- Arrows penetrating rectangles: use rectangle edge intersection math, not circular projection
- SVG elements stacking z-order: append hit-test rects last
- Animation intervals not cleaned up: store `intervalId`, clear on toggle

**Output**: `js/modules/vis-{id}.js` for each module.

**Decision Gate**: Open each module page, verify:
- All text is readable (no overlap, no clipping)
- Arrows connect correctly (edge-to-edge, not center-to-center)
- Click handlers show relevant detail
- Animation plays/stops cleanly
- Zoom lightbox works

---

## Phase 7: Generate Homepage

**Goal**: Create an engaging entry point with architecture overview and guided navigation.

**Steps**:

1. **Architecture Overview Diagram** (in `js/diagram.js`):
   - Create Rough.js SVG showing module relationships
   - Use Excalidraw color palette for module category colors
   - Make boxes clickable (navigate to module page)
   - Add hover tooltips with module summary
   - Show data flow arrows between key modules

2. **Reading Paths** (in `app.js` `READING_PATHS`):
   - Define 2-4 guided routes through the docs
   - Each path = array of `{ route, label }` objects
   - Include path selector UI (pill buttons)

3. **Scenario Cards**:
   - "I want to understand X" -> links to relevant module
   - 3-6 cards covering common reader intents

4. **Progress Tracking**:
   - Read markers on sidebar (localStorage-based)
   - Progress bar on homepage

5. **Glossary** (optional):
   - Key terms with definitions
   - Inline term popovers in doc content

**Output**: Homepage content integrated into app.js.

**Decision Gate**: Homepage should feel like a dashboard, not a file listing.

---

## Phase 8: Build & Test

**Goal**: Verify everything works end-to-end.

**Steps**:

1. **Run Build**:
   ```bash
   python build_site.py
   ```
   Verify:
   - No errors in output
   - `data/modules.json` has all modules
   - `data/search-index.json` has all docs
   - `data/all-docs.js` has inline data

2. **Test file:// Protocol**:
   - Double-click `index.html` in file explorer
   - Verify homepage loads (inline data from `all-docs.js`)
   - Navigate to a module -> should show visualization
   - Navigate to a doc -> should show HTML content
   - Search -> should return results
   - Dark mode toggle -> should switch themes
   - Reading path navigation -> prev/next should work

3. **Test HTTP Protocol**:
   ```bash
   python -m http.server 8080 -d site/
   ```
   - Open `http://localhost:8080`
   - Verify fetch-mode data loading works
   - All navigation should work

4. **Visual Audit**:
   - Check each visualization module for layout issues
   - Verify no text overlap, no arrows through boxes
   - Test zoom lightbox on each SVG
   - Test on narrow viewport (responsive layout)

5. **Fix Issues**:
   - Common: text overflow in boxes -> widen box or shrink font
   - Common: arrow endpoints wrong -> use edgePoint with rect intersection
   - Common: zone labels overlap items -> add labelPad offset

**Output**: Working site that passes all tests.

---

## Summary Checklist

- [ ] Phase 1: Module inventory generated
- [ ] Phase 2: Site design approved by user
- [ ] Phase 3: `build_site.py` generates correct data
- [ ] Phase 4: SPA shell loads without errors
- [ ] Phase 5: `vis-shared.js` API available
- [ ] Phase 6: All P0/P1 modules have working visualizations
- [ ] Phase 7: Homepage has overview diagram + reading paths
- [ ] Phase 8: file:// and HTTP both work; visual audit passed
