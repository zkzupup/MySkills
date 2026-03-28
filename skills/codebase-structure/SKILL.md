---
name: codebase-structure
description: >-
  Perform comprehensive codebase structure analysis as a Senior System Architect.
  Uses a dual-axis model: detects structural modules (directory-based technical organization)
  AND feature modules (cross-cutting business features that
  span multiple directories). Builds dependency graphs, identifies architecture patterns,
  and produces an annotated MasterIndex with priority matrix, feature module matrix, and
  directory tree. Use when asked to analyze a codebase structure, map project architecture,
  build a module inventory, or prepare for deep documentation.
  Outputs a MasterIndex consumed by the codebase-documentation skill.
---

# Codebase Structure Analysis Skill

> **HARD RULES — Violations are never acceptable.**
>
> 1. **No vague language**: Never write "handles various", "uses several patterns", "data flows through the system", or "etc." Name every module, pattern, and dependency explicitly.
> 2. **Every claim verifiable**: Every module boundary, dependency edge, and pattern identification MUST cite specific files or directories as evidence.
> 3. **File references**: Always use `path/file.ext` format. When referencing classes, use `ClassName` in `path/file.ext`.
> 4. **Self-check**: After completing the inventory, verify every structural module appears in BOTH the Priority Matrix AND the Directory Tree, and every feature module's constituent locations have `{feature:Name}` tags in the Directory Tree.
> 5. **Readability**: No paragraph >4 sentences. Lead sections with a **bolded summary sentence**. Use tables for ≥4 items.
> 6. **Language**: Headings and prose default to **Chinese**; switch to English only when the user explicitly requests it. Technical identifiers (class names, file paths) always English.

## Trigger Protocol

When this skill is activated, BEFORE performing any analysis, present the user with configuration options using the AskQuestion tool:

1. **Analysis Detail Level** (single-select, required):
   - **Quick Overview (Tier 1)**: Quick directory scan, basic module list, no dependency analysis. For first-time project orientation.
   - **Standard Analysis (Tier 2)** *(default)*: Full module inventory with dependency analysis and architecture diagrams. For routine analysis work.
   - **Deep Analysis (Tier 3)**: Maximum depth sub-module detection, exhaustive dependency graph, full pattern recognition. For critical projects or legacy system takeover.

2. **Documentation Language** (single-select):
   - **Chinese** *(default)*: Headings, prose, and descriptive text in Chinese
   - **English**: Headings, prose, and descriptive text in English

Technical identifiers (class names, file paths) always stay English regardless of this setting. Record the selected tier and language in the MasterIndex header for downstream consumption by `codebase-documentation`.

## Role

Act as a **Senior System Architect** specializing in codebase exploration and structural analysis. Produce a complete, accurate module inventory and dependency map that serves as the foundation for all subsequent documentation.

## Module Model: Dual-Axis Analysis

This skill produces two complementary module taxonomies:

| Axis | Unit | Basis | Answers |
|------|------|-------|---------|
| **Structural** | Structural Module | Directory/namespace boundaries | "How is the code organized technically?" |
| **Feature** | Feature Module | Business/domain functionality | "What business features does this codebase implement?" |

**Structural modules** map to directory subtrees and represent the technical architecture (frameworks, engines, utilities). They are detected via filesystem signals (§1.2).

**Feature modules** represent end-user-facing business features that typically span multiple structural modules. A cross-cutting feature (e.g., "Payment Processing") may touch `Logic/Payment/`, `UI/PaymentPanel/`, `Network/PaymentMsg/`, and `Data/PaymentCfg/` — none of these directories alone captures the feature, but together they form a cohesive analysis unit.

**Relationship**: Feature modules *compose* parts of structural modules. A single structural module (e.g., `Logic/`) may contain components of multiple features. A single feature module references specific subdirectories or file groups across multiple structural modules.

Both module types appear in the MasterIndex: structural modules in the Priority Matrix (§10), feature modules in the Feature Module Matrix (§20). Both receive priority classification and feed into the documentation execution plan.

## Output Specification (Data Contract)

This skill produces artifacts consumed by `codebase-documentation`:

```
Document/
├── MasterIndex.md              # Module inventory, priority matrix, dependency summary, directory tree
└── diagrams/
    └── Global/
        ├── Project_Architecture.excalidraw
        └── Project_Architecture.png
```

The MasterIndex MUST contain these sections in order:

1. **§00 Analysis Configuration** — selected tier, analysis date, total file count
2. **§10 Module Priority Matrix** — structural modules with priority, directory, file count, language, detected patterns
3. **§20 Feature Module Matrix** — cross-cutting business features with constituent structural locations, entry points, and complexity
4. **§30 Dependency Summary** — layer assignments, dependency edges, anomalies
5. **§40 Project Directory Tree** — annotated tree with feature cross-references (see Phase 3.2 for format)
6. **§50 Documentation Execution Plan** — ordered list of both structural and feature modules for the documentation phase
7. **§60–§91** — populated by `codebase-documentation` skill (analysis docs, diagrams, annotations, excluded modules, references)

## Phase 1: Project Exploration & Module Inventory

### 1.1 Directory Scanning

1. List all top-level directories; classify each as: source code, configuration, documentation, build artifact, third-party, data, or other
2. For source directories, recursively explore to identify functional boundaries
3. Count files per directory (approximate for large directories: `~N files`)
4. Identify primary language per directory by file extension distribution

### 1.2 Structural Module Boundary Detection

**A structural module is a directory-aligned cohesive unit of code with identifiable filesystem boundaries.** This section detects the technical organization of the codebase. For cross-cutting business features that span multiple structural modules, see §1.5 Feature Module Detection.

Apply these detection signals in priority order:

| Signal | Strength | Example |
|--------|----------|---------|
| Explicit build unit (`CMakeLists.txt`, `package.json`, `__init__.py` with `__all__`) | Strongest | Directory with its own `CMakeLists.txt` |
| Namespace/package declaration | Strong | C++ `namespace`, Python package, Java package |
| Directory with mixed public interface + private implementation | Strong | `include/` + `src/` pair |
| Cohesive directory with ≥5 files sharing naming prefix or domain | Medium | `combat_*.py`, `ai_*.cpp` |
| Directory name matches recognized domain concept | Medium | `auth/`, `rendering/`, `network/` |
| Single file implementing a complete subsystem (>500 lines) | Weak | `physics_engine.cpp` as standalone module |

**Merge heuristic**: Two adjacent directories with <5 files each AND >50% shared imports → consider merging into one module.

**Split heuristic**: A directory with >100 files AND ≥3 distinct functional clusters (identifiable by naming patterns or import subgroups) → split into sub-modules.

### 1.3 Sub-Module Granularity Control

**Within each module, identify sub-modules at appropriate granularity based on file count.**

| Module Size | Granularity Guidance |
|------------|---------------------|
| <20 files | Flat — no sub-modules needed |
| 20–100 files | 2–5 functional groups by naming/imports |
| 100–500 files | Mandatory split by functional area; each sub-module 20–100 files |
| >500 files | Multi-level hierarchy; no leaf sub-module >200 files |

**Functional group detection** (apply in order):

1. **Import clustering**: files importing the same base classes likely belong together
2. **Naming convention**: prefix/suffix patterns (`*_manager.py`, `*_component.py`)
3. **Directory structure**: subdirectories are natural boundaries
4. **If ambiguous**: prefer directory-based splitting over name-based

### 1.4 Architecture Pattern Recognition

**Scan for common patterns and tag modules with evidence.** Record the specific files/classes that support each identification.

| Pattern | Detection Signals |
|---------|------------------|
| MVC / MVP / MVVM | Separate Model/View/Controller directories or class suffixes (`*Model`, `*View`, `*Controller`) |
| Entity Component System | `Component`, `Entity`, `System` base classes; archetype/chunk storage structures |
| Pipeline / Chain | Sequential stage classes with uniform input→output interface |
| Event-Driven / Pub-Sub | `EventBus`, `EventEmitter`, `subscribe`/`publish`/`dispatch` methods |
| Repository / DAO | Data access objects, query builders, ORM model base classes |
| State Machine | State enum/class + transition table/matrix or `OnEnter`/`OnExit` methods |
| Plugin / Extension | Plugin interface, registry pattern, dynamic loading (`dlopen`, `importlib`) |
| Actor Model | Message passing primitives, mailbox queues, actor base class |
| Blackboard | Shared data store read/written by multiple independent processors |

### 1.5 Feature Module Detection

**A feature module is a cohesive business feature that spans multiple structural modules.** These are end-user-visible functionalities (e.g., "Payment Processing", "Real-time Collaboration", "Trading System") that deserve dedicated analysis even though their code is distributed across framework directories like `Logic/`, `UI/`, `Network/`, `Data/`.

**When to detect**: After structural modules are identified (§1.2–1.4), scan for cross-cutting features that no single structural module fully captures.

**Detection signals (apply in priority order):**

| Signal | Strength | Example |
|--------|----------|---------|
| User declaration | Strongest | User states "Payments is a major feature" |
| Cross-directory naming pattern: same domain keyword in ≥2 structural modules | Strong | `Payment` appearing in `Logic/Payment/`, `UI/PaymentPanel/`, `Network/PaymentMsg/` |
| Domain-specific config/data cluster referencing classes across directories | Strong | `payment_config.json` with references to both Logic and UI classes |
| Entry-point tracing: a UI panel or command triggers logic across ≥3 structural modules | Medium | `PaymentPanel` imports from Logic, Network, and Data modules |
| Shared domain base class or interface implemented across directories | Medium | `IPaymentComponent` with implementations in multiple structural modules |
| Cohesive protocol/message definitions for a single domain | Medium | `PaymentRequest`, `PaymentResponse`, `PaymentSync` message types grouped by domain |

**Feature module record format:**

| Field | Content |
|-------|---------|
| Name | Business feature name (default Chinese; English only if user explicitly requests) |
| Domain | Brief description of what the feature does for end users |
| Constituent locations | List of `structural_module/subdirectory` or `structural_module/file_pattern` for each structural module involved, with approximate file counts |
| Entry points | Primary classes/functions that initiate the feature |
| Estimated complexity | Simple (<30 files, ≤2 modules) / Medium (30–150 files, 2–4 modules) / Complex (>150 files or >4 modules) |

**Scan strategy:**

1. **Name-based scan**: For each structural module's subdirectories, extract directory-name keywords. Find keywords appearing in ≥2 different top-level structural modules → candidate features
2. **Import-based scan** (Tier 2+): Sample files from candidate feature locations; verify cross-module imports exist to confirm the feature's constituent parts actually interact
3. **Config/data anchoring**: Scan configuration and data directories for domain-specific files; trace which code modules reference them
4. **User consultation**: Present candidate feature list to user; ask for additions, corrections, or merges
5. **Complexity assessment**: For each confirmed feature, sum total files across all locations, count structural modules spanned, identify key interaction patterns (sync/async, data flow direction)

**Merge heuristic**: If two candidate features share >70% of their constituent locations, propose merging them into one feature module.

**Split heuristic**: If a candidate feature contains ≥3 clearly separable sub-workflows with different user-facing purposes, propose splitting.

**Minimum threshold**: A feature module must span ≥2 structural modules to justify separate tracking. Single-module features are already captured by structural module analysis.

### 1.6 Priority Classification

**Classify each module with explicit evidence.** Every assignment must cite the reason.

**Structural module priority:**

| Priority | Category | Evidence Required |
|----------|----------|-------------------|
| P0 | Core business logic | Name ≥3 downstream dependents OR demonstrate it implements primary user-facing functionality |
| P1 | Supporting systems | Name which P0 modules depend on it |
| P2 | Infrastructure | List the specific infrastructure function (build, deploy, logging, config) |
| P3 | UI templates / generated | Identify the generation source or template engine |
| SKIP | Third-party, backups, data | Name the library or state the exclusion reason |

**Feature module priority** (classified independently from structural modules):

| Priority | Evidence for Feature Modules |
|----------|------------------------------|
| P0 | Core user-facing feature; revenue-critical or daily-use by majority of users; or high-complexity cross-module interaction |
| P1 | Important secondary feature; significant complexity or user engagement |
| P2 | Minor feature; limited scope or usage |
| SKIP | Deprecated feature or placeholder with no active usage |

**Cross-reference rule**: A P0 feature module elevates the priority floor of its constituent structural locations — no constituent directory of a P0 feature may be classified lower than P1.

### 1.7 Diagram Planning

**Plan required diagram types per module based on characteristics.**

| Module Characteristic | Required Diagram Types |
|---|---|
| Any module (P0–P2) | Architecture overview |
| ≥3 interacting classes | Class diagram |
| Multi-step data transformation | Data flow diagram |
| Distinct lifecycle phases | Lifecycle diagram |
| Explicit state transitions | State machine diagram |
| Cross-module request/response | Sequence diagram |
| Database / persistence layer | ER diagram |
| SoA/AoS storage, memory pools | Memory layout diagram |

### 1.8 Interactive Module Confirmation

**After completing both structural and feature module inventories, present results to the user for validation.**

**Structural modules:**

1. Show the full structural module list with boundaries and priorities
2. Mark all inferred subsystems with `[inferred]`
3. Highlight ambiguous boundaries with `[boundary-uncertain]`

**Feature modules:**

4. Show the feature module list with constituent structural locations and complexity
5. Mark auto-detected features with `[inferred]`; user-declared features with `[user-declared]`
6. Explicitly ask: "Are there major business features not captured in either list? Complex features often hide inside framework directories (Logic, UI, Network) without their own top-level folder."

**Wait for user confirmation on both lists before proceeding to Phase 2.**

## Phase 2: Dependency Analysis

### 2.1 Import/Include Scanning

For each module from Phase 1:

1. Sample representative files (≥3 per module, or all if <10 files)
2. Extract all import/include/require statements
3. Classify each dependency as **internal** (another project module), **external** (third-party library), or **standard** (language stdlib)

### 2.2 Dependency Graph Construction

**Build a directed graph: nodes = modules, edges = dependencies.** Label each edge with the primary interface (class name or header file).

### 2.3 Layer Assignment

**Assign layers using topological sort of the dependency graph.**

| Layer | Definition | Typical Content |
|-------|-----------|----------------|
| Foundation | Zero internal dependencies | Math libraries, base types, utilities |
| Core | Depends only on Foundation | Engine subsystems, base frameworks |
| Feature | Depends on Core + Foundation | Game logic, business rules |
| Presentation | Depends on Feature layer | UI, rendering, user interaction |
| Peripheral | Not depended upon by others | Tools, tests, standalone scripts |

### 2.4 Anomaly Detection

| Anomaly | Detection Rule | Action |
|---------|---------------|--------|
| Circular dependency | Topological sort fails for a subset | Document the cycle: list all involved modules and specific cross-referencing interfaces |
| Bottleneck | ≥3 downstream dependents | Mark `[bottleneck]`, ensure P0 or P1 priority |
| Orphan | 0 upstream AND 0 downstream | Mark `[orphan]`, flag for user review (dead code or undiscovered entry point) |
| Layer violation | Lower layer imports from higher layer | Mark `[layer-violation]`, document the specific import path |

## Phase 3: Synthesis & Output

### 3.1 Global Architecture Diagram

Generate a diagram showing:

- All P0 and P1 modules as labeled boxes grouped by layer
- Dependency arrows with edge weights between modules
- Detected architecture patterns annotated on each module

Use `excalidraw-workflow` skill if available (Path A); otherwise produce a detailed mermaid diagram inline in MasterIndex (Path B).

### 3.2 Annotated Directory Tree

**Construct the Project Directory Tree with the following format per line:**

```
├── directory_name/              # [status] Domain: specifics (~N files, Language) [role]
```

**Status tags**: `[done]` completed | `[annotated]` completed + source annotations | `[partial]` partially done (state what subset) | `[todo]` pending | `[skip]` excluded

**Role tags** (module-level directories only): `[core]` = P0 | `[supporting]` = P1 | `[infra]` = P2

**Rules:**

1. **Depth**: expand to functional sub-module level (typically 3–4 levels), never to individual files
2. **Description**: state what the directory DOES, not what it IS; use colon to separate domain from specifics (e.g., `AI decision: behavior trees, state machines, pathfinding`)
3. **File count**: `(~N files)` format, approximate to nearest 10 for counts >10
4. **Language**: annotate only when the primary language first differs from the parent directory; children inherit
5. **`[partial]`**: MUST specify which subset is complete
6. **`[skip]`**: list one level only, do not expand children; briefly state reason
7. **Role tags**: only on module-level directories (depth 2–3); must align with Priority Matrix
8. **Structural cross-reference**: every module in Priority Matrix must be locatable in the tree; every `[core]` directory must correspond to a P0 entry
9. **Feature tags**: When a directory is a constituent of a feature module, append `{feature:FeatureName}` after the role tag. Multiple features are comma-separated: `{feature:Payment,Trading}`. This makes cross-cutting features visible in the directory tree without disrupting the structural hierarchy.

### 3.3 Feature Module Matrix Assembly

**Construct the Feature Module Matrix with cross-references to the structural tree.**

For each feature module from §1.5:

1. Record the feature name, priority, domain description, all constituent locations (with file counts), primary entry points, and complexity rating
2. Build a **Feature–Structure Cross-Reference** table showing which structural modules contain parts of which features
3. Verify every feature's constituent locations are marked with `{feature:Name}` tags in the directory tree (Phase 3.2)

### 3.4 Master Index Assembly

Assemble `Document/MasterIndex.md` with the sections specified in Output Specification (§above). Use the MasterIndex template from [templates.md](templates.md) as the base format.

## Detail Tier Configurations

### Tier 1 — Quick Overview

- Directory scanning: top 2–3 levels only
- Structural module detection: directory-based only (no import analysis for boundary detection)
- Feature module detection: **skip** (user may manually declare features)
- No dependency graph construction (skip Phase 2 entirely)
- No architecture pattern recognition
- Priority classification: binary P0/SKIP only
- Output: MasterIndex with directory tree + basic structural module list
- No diagrams generated

### Tier 2 — Standard Analysis (Default)

- Full directory scanning to functional sub-module level
- Structural module detection with all heuristics (§1.2–1.4)
- Feature module detection: **name-based scan** + user consultation (§1.5 steps 1, 4, 5)
- Dependency graph: sample-based (3–5 files per module)
- Pattern recognition: top-level patterns only
- Full P0–P3 + SKIP classification for both structural and feature modules
- Output: complete MasterIndex (with Feature Module Matrix) + global architecture diagram
- Diagram planning for documentation phase

### Tier 3 — Deep Analysis

- Full directory scanning with mandatory sub-module splitting enforced
- Structural module detection with all heuristics + finest granularity
- Feature module detection: **full scan** — name-based + import-based + config anchoring + user consultation (all §1.5 steps)
- Dependency graph: exhaustive (all source files scanned)
- Pattern recognition: recursive (patterns within sub-modules)
- Full classification with detailed evidence for every module (structural and feature)
- Feature–structural interaction mapping: trace data flow paths within each P0 feature across its constituent structural modules
- Output: complete MasterIndex + global architecture + per-P0-module mini architecture diagrams + per-P0-feature cross-module flow diagrams
- Split threshold lowered: ≥2 subsystems triggers split (vs ≥3 in Tier 2)
- Mandatory `[inferred]` and `[boundary-uncertain]` confirmation with user for both structural and feature modules

## Project Scale Adaptation

| Scale | File Count | Adaptation |
|-------|-----------|------------|
| **Small** | <50 files | Single-pass scan; skip dependency graph; lightweight directory tree |
| **Medium** | 50–500 files | Standard workflow |
| **Large** | 500–2000 files | Sample-based scanning for Tier 1–2; phased output |
| **Very Large** | 2000+ files | Phased scanning by top-level directory; incremental MasterIndex; P0 modules first |

## Collaborative Protocol

### Key Checkpoints

| Checkpoint | When | User Validates |
|-----------|------|----------------|
| Module inventory draft | After Phase 1 | Boundaries, `[inferred]` subsystems, priorities, `[boundary-uncertain]` items |
| Dependency graph | After Phase 2 | Layer assignments, cycles, bottlenecks, `[orphan]` modules |
| Final MasterIndex | After Phase 3 | Completeness, accuracy, readiness for documentation phase |

### Risk Escalation

| Severity | Indicator | Action |
|----------|----------|--------|
| Critical | Architectural risk (circular deps in core), security hazard | Pause, report, wait for user |
| High | Layer violations in P0 modules | Tag `[layer-violation]`, present evidence |
| Medium | Multiple plausible module boundaries | Tag `[boundary-uncertain]`, list options |
| Low | Minor naming inconsistencies, small orphan modules | Record in MasterIndex notes section |

### Handoff to Documentation Skill

After user confirms the MasterIndex:

1. Verify all required sections are populated
2. Verify diagram files exist (Path A) or mermaid is embedded (Path B)
3. Confirm the selected detail tier is recorded in the header
4. Instruct user: invoke `codebase-documentation` to generate per-module analysis documents based on this MasterIndex

## Resume Protocol

When continuing structure analysis across conversations:

1. Re-read this SKILL.md (especially Hard Rules and the current phase)
2. Read the in-progress `Document/MasterIndex.md`
3. Read the latest Handoff Notes section at the bottom of MasterIndex
4. Continue from where the handoff notes indicate
5. After resuming, re-verify any `[boundary-uncertain]` or `[inferred]` items from prior sessions

## Companion Files & Skills

- [templates.md](templates.md) — MasterIndex template and output scaffold
- `codebase-documentation` — consumes MasterIndex to produce per-module L0–L3 analysis documents
- `excalidraw-workflow` — for architecture diagram generation (Path A)
- `code-annotation` — for file-level source annotations (invoked via documentation skill)
