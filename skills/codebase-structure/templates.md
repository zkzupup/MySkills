# Structure Analysis Templates

## 0. Document Output Directory Scaffold

Use this as the starting scaffold when initializing a new project's documentation directory. Adapt the numbered folders and diagram subfolders to the project's actual subsystems.

```
Document/
├── MasterIndex.md                       # Master index (created by this skill)
│
├── 01-<TopicA>/                         # First topic folder (typically high-level overview)
│   ├── 01_<Module>_Overview.md
│   └── 02_<Module>_Analysis.md
│
├── 02-<TopicB>/                         # One folder per major subsystem or domain
│   ├── 01_<Module>_Framework_Analysis.md
│   └── 02_<Module>_E2EFlow.md
│
├── ...                                  # Continue numbering as needed
│
├── NN-<TopicN>/                         # Last numbered topic folder
│   └── 01_<Module>_Analysis.md
│
├── diagrams/                            # ALL diagrams, grouped by domain
│   ├── Global/                          # Global architecture diagrams (created by this skill)
│   │   ├── Project_Architecture.excalidraw
│   │   └── Project_Architecture.png
│   ├── <DomainA>/                       # One subfolder per topic domain
│   │   ├── <System>_Architecture.excalidraw
│   │   ├── <Process>_Pipeline.excalidraw
│   │   └── <Object>_Lifecycle.excalidraw
│   ├── <DomainB>/
│   └── Misc/                            # Cross-cutting or uncategorized diagrams
│
└── Presentation/                        # (Optional) Presentation materials
    ├── <PresentationDoc>.md
    └── diagrams/
        ├── D01-<Description>.excalidraw
        └── 01-<Description>.excalidraw
```

### Scaffold Initialization Checklist

When starting a new project analysis, verify:

- [ ] `Document/` root created with `MasterIndex.md`
- [ ] `diagrams/Global/` subfolder created for global architecture diagrams
- [ ] Diagram subfolders planned to match topic domains
- [ ] No orphan files — every file is registered in master index

---

## 1. Master Index Document Template

The master index is the single-source-of-truth navigation hub for the entire project analysis. Sections 00–40 are populated by this skill; sections 50+ are populated by `codebase-documentation`.

```markdown
# [Project Name] Analysis Master Index

> Global navigation index for all analysis documents, diagrams, and source annotations.

---

## 00 Analysis Configuration

- **Analysis Date**: YYYY-MM-DD
- **Detail Tier**: Tier N — [Quick Overview / Standard Analysis / Deep Analysis]
- **Total Source Files**: ~N files
- **Primary Languages**: [list]

---

## 10 Module Priority Matrix (Structural)

| # | Priority | Module | Directory | Files | Language | Detected Patterns | Layer | Reason |
|---|----------|--------|-----------|-------|----------|-------------------|-------|--------|
| 1 | P0 | [Name] | `path/` | ~N | C++ | `[pattern:ecs]` | Core | Core business logic; ≥3 dependents: [list] |
| 2 | P1 | [Name] | `path/` | ~N | Python | `[pattern:event-driven]` | Feature | Supports [P0 module names] |
| 3 | SKIP | [Name] | `path/` | ~N | — | — | — | Third-party library |

---

## 20 Feature Module Matrix

> Cross-cutting business features that span multiple structural modules. Each feature is a cohesive
> user-facing functionality whose code is distributed across framework directories.

| # | Priority | Feature | Domain Description | Constituent Locations | Entry Points | Complexity | Status |
|---|----------|---------|-------------------|----------------------|--------------|------------|--------|
| 1 | P0 | [FeatureA] | <what the feature does for end users> | `Logic/FeatureA/` (~80 files), `UI/FeatureAPanel/` (~40 files), `Network/FeatureAMsg/` (~20 files), `Data/FeatureACfg/` (~15 files) | `FeatureAManager.init()` in `Logic/FeatureA/FeatureAManager.py` | Complex | [todo] |
| 2 | P1 | [FeatureB] | <what the feature does for end users> | `path/a/` (~N files), `path/b/` (~N files) | `EntryClass.method()` in `path/file.ext` | Medium | [todo] |

### Feature–Structure Cross-Reference

> Shows which structural modules contain components of which features.

| Structural Module | Contains Feature Components |
|-------------------|---------------------------|
| [Logic] | [FeatureA], [FeatureB], [FeatureC] |
| [UI] | [FeatureA], [FeatureB] |
| [Network] | [FeatureA], [FeatureB] |
| [Data] | [FeatureA] |

---

## 30 Dependency Summary

### Layer Diagram

![Global Architecture](diagrams/Global/Project_Architecture.png)

**Diagram walkthrough:** <2-5 sentences explaining the layer structure, major dependency flows, and notable architectural decisions visible in the diagram.>

### Layer Assignments

| Layer | Modules |
|-------|---------|
| Foundation | [Module A], [Module B] |
| Core | [Module C] |
| Feature | [Module D], [Module E] |
| Presentation | [Module F] |
| Peripheral | [Module G] |

### Anomalies

| Type | Modules Involved | Details |
|------|-----------------|---------|
| Circular dependency | Module A ↔ Module B | Via `InterfaceX` in `path/file.ext` |
| Bottleneck | Module C | 5 downstream dependents |
| Layer violation | Module D → Module F | Feature imports from Presentation via `path/file.ext` |

(Write "None detected" if no anomalies found.)

---

## 40 Project Directory Tree

> Annotated project directory structure. Each directory shows its main content, file count, language, and analysis status.
>
> **Status**: [done] completed | [annotated] completed + source annotations | [partial] partially done | [todo] pending | [skip] excluded
>
> **Role**: [core] = P0 | [supporting] = P1 | [infra] = P2
>
> **Feature**: `{feature:Name}` marks directories that are constituent parts of a cross-cutting feature module (see §20)

```
ProjectRoot/
├── src/                                # Main source directory
│   ├── core/                           # [todo] Core engine (~320 files, C++) [core]
│   │   ├── rendering/                  # [todo] Render pipeline: forward/deferred switching, PBR materials (~85 files)
│   │   ├── physics/                    # [todo] Physics simulation: rigid bodies, collision detection, constraint solving (~60 files)
│   │   └── audio/                      # [todo] Audio system: spatial audio, mixer, streaming (~45 files)
│   ├── gameplay/                       # [partial] Game logic (~1200 files, Python) [core]
│   │   ├── feature_a/                 # [todo] Feature A: core logic and state management (~120 files) {feature:FeatureA}
│   │   ├── feature_b/                 # [todo] Feature B: world simulation, pathfinding (~160 files) {feature:FeatureB}
│   │   ├── ai/                         # [annotated] AI decision: behavior trees, state machines, pathfinding (~240 files)
│   │   └── ui/                         # [todo] UI framework: MVC binding, widget library (~350 files)
│   ├── ui_panels/                      # [todo] UI panel implementations (~280 files, Python) [supporting]
│   │   ├── feature_a_panels/          # [todo] Feature A UI: main panel, detail dialogs (~45 files) {feature:FeatureA}
│   │   └── feature_b_panels/          # [todo] Feature B UI: map view, status overlays (~55 files) {feature:FeatureB}
│   ├── network/                        # [todo] Network layer (~90 files, Python) [supporting]
│   │   ├── feature_a_msg/             # Feature A messages: sync and state transfer (~20 files) {feature:FeatureA}
│   │   ├── feature_b_msg/            # Feature B messages: world state sync (~25 files) {feature:FeatureB}
│   │   ├── frame_sync/                # Frame sync protocol: deterministic lockstep, input serialization (~40 files)
│   │   └── rpc/                        # RPC framework: message codec, route dispatch (~50 files)
│   └── data/                           # [todo] Configuration data (~60 files) [infra]
│       ├── feature_a_cfg/             # Feature A config: templates, parameters (~15 files) {feature:FeatureA}
│       └── feature_b_cfg/            # Feature B config: rules, map data (~10 files) {feature:FeatureB}
├── tools/                              # [skip] Build/deploy tools (~78 files, Shell/Python)
├── thirdparty/                         # [skip] Third-party libraries
├── tests/                              # [todo] Unit tests (~60 files)
└── docs/                               # [skip] Project documentation (~13 files)
```

<!-- Directory tree formatting rules: see SKILL.md §3.2 -->

---

## 50 Documentation Execution Plan

> Lists both structural and feature modules in documentation order. Feature modules are analyzed after
> their constituent structural modules, since feature-level analysis builds on structural understanding.

### Structural Modules

| # | Module | Type | Priority | Planned Diagrams | Estimated Conversations | Status |
|---|--------|------|----------|-----------------|------------------------|--------|
| 1 | [Core Module] | Structural | P0 | Architecture, Class, Data Flow | 1 | [todo] |
| 2 | [Support Module] | Structural | P1 | Architecture | 1 | [todo] |

### Feature Modules

| # | Feature | Priority | Constituent Structural Modules | Planned Diagrams | Estimated Conversations | Status |
|---|---------|----------|-------------------------------|-----------------|------------------------|--------|
| 1 | [FeatureA] | P0 | Logic, UI, Network, Data | Cross-module Flow, Architecture | 1 | [todo] |

---

## 60 Analysis Documents

> (Populated by codebase-documentation skill as modules are analyzed)

### 60.1 [Subsystem A] Documents (Structural)

| # | Document | Path | Status |
|---|----------|------|--------|
| 1 | [Title] | [link](path/to/doc.md) | [done] |

### 60.2 [Feature Name] Documents (Feature)

| # | Document | Path | Status |
|---|----------|------|--------|
| 1 | [Feature]_CrossModule_Analysis.md | [link](path/to/doc.md) | [done] |

---

## 70 Diagrams

### 70.1 Global Architecture

| # | Diagram | Path | Status |
|---|---------|------|--------|
| 1 | Project Architecture | [link](diagrams/Global/Project_Architecture.png) | [done] |

### 70.2 Module Diagrams

| # | Diagram | Module | Path | Status |
|---|---------|--------|------|--------|
| 1 | [Title] | [Module] | [link](diagrams/<Domain>/<Name>.png) | [done] |

---

## 80 Annotated Source Index

> (Populated when file-level annotations are enabled)

| # | Module | Directory | File Count | Coverage | Language |
|---|--------|-----------|------------|----------|----------|
| 1 | [Name] | `path/` | N | 100% | C++ |

**Total**: X files annotated

---

## 90 Excluded Modules

| Module | Directory | File Count | Reason |
|--------|-----------|------------|--------|
| [Name] | `path/` | N | Third-party library / Generated data / Backup |

---

## 91 Reference Standards

- Analysis depth reference: [link]
- Annotation template: [link]

---

## Handoff Notes (Session YYYY-MM-DD)

### Completed this session
- [Module A]: analysis doc created, N diagrams generated

### Next priorities
1. [Module B]: start analysis (N files, estimated 1 conversation)

### Known issues
- (none / list issues)
```
