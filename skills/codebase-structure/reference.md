# Structure Analysis Reference Tables

> Reference-only file. Loaded on-demand during specific phases. Core rules and workflow remain in SKILL.md.

## Architecture Pattern Recognition (§1.4 Detail)

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
| CQRS | Separate command/query handlers, distinct read/write models, `*Command`/`*Query` classes |
| Hexagonal / Ports-Adapters | `ports/`, `adapters/`, `domain/` directory structure; interface-driven boundary |
| Middleware Chain | Request pipeline with `use()`, `middleware/` directories, ordered handler chain |

## Feature Module Detection Signals (§1.5 Detail)

| Signal | Strength | Example |
|--------|----------|---------|
| User declaration | Strongest | User states "Payments is a major feature" |
| Cross-directory naming pattern: same domain keyword in ≥2 structural modules | Strong | `Payment` appearing in `Logic/Payment/`, `UI/PaymentPanel/`, `Network/PaymentMsg/` |
| Domain-specific config/data cluster referencing classes across directories | Strong | `payment_config.json` with references to both Logic and UI classes |
| Entry-point tracing: a UI panel or command triggers logic across ≥3 structural modules | Medium | `PaymentPanel` imports from Logic, Network, and Data modules |
| Shared domain base class or interface implemented across directories | Medium | `IPaymentComponent` with implementations in multiple structural modules |
| Cohesive protocol/message definitions for a single domain | Medium | `PaymentRequest`, `PaymentResponse`, `PaymentSync` message types grouped by domain |

### Feature Module Record Format

| Field | Content |
|-------|---------|
| Name | Business feature name (default Chinese; English only if user explicitly requests) |
| Domain | Brief description of what the feature does for end users |
| Constituent locations | List of `structural_module/subdirectory` or `structural_module/file_pattern` for each structural module involved, with approximate file counts |
| Entry points | Primary classes/functions that initiate the feature |
| Estimated complexity | Simple (<30 files, ≤2 modules) / Medium (30–150 files, 2–4 modules) / Complex (>150 files or >4 modules) |

### Feature Scan Strategy

1. **Name-based scan**: For each structural module's subdirectories, extract directory-name keywords. Find keywords appearing in ≥2 different top-level structural modules -> candidate features
2. **Import-based scan** (Tier 2+): Sample files from candidate feature locations; verify cross-module imports exist to confirm the feature's constituent parts actually interact
3. **Config/data anchoring**: Scan configuration and data directories for domain-specific files; trace which code modules reference them
4. **User consultation**: Present candidate feature list to user; ask for additions, corrections, or merges
5. **Complexity assessment**: For each confirmed feature, sum total files across all locations, count structural modules spanned, identify key interaction patterns (sync/async, data flow direction)

### Feature Heuristics

- **Merge**: If two candidate features share >70% of their constituent locations, propose merging them into one feature module.
- **Split**: If a candidate feature contains >=3 clearly separable sub-workflows with different user-facing purposes, propose splitting.
- **Minimum threshold**: A feature module must span >=2 structural modules to justify separate tracking.

## Detail Tier Configurations

### Tier 1 — Quick Overview

- Directory scanning: top 2-3 levels only
- Structural module detection: directory-based only (no import analysis for boundary detection)
- Feature module detection: **skip** (user may manually declare features)
- No dependency graph construction (skip Phase 2 entirely)
- No architecture pattern recognition
- Priority classification: binary P0/SKIP only
- Output: MasterIndex with directory tree + basic structural module list
- No diagrams generated

### Tier 2 — Standard Analysis (Default)

- Full directory scanning to functional sub-module level
- Structural module detection with all heuristics (SKILL.md §1.2-1.4)
- Feature module detection: **name-based scan** + user consultation (§1.5 steps 1, 4, 5)
- Dependency graph: sample-based (3-5 files per module)
- Pattern recognition: top-level patterns only
- Full P0-P3 + SKIP classification for both structural and feature modules
- Output: complete MasterIndex (with Feature Module Matrix) + global architecture diagram
- Diagram planning for documentation phase

### Tier 3 — Deep Analysis

- Full directory scanning with mandatory sub-module splitting enforced
- Structural module detection with all heuristics + finest granularity
- Feature module detection: **full scan** — name-based + import-based + config anchoring + user consultation (all §1.5 steps)
- Dependency graph: exhaustive (all source files scanned)
- Pattern recognition: recursive (patterns within sub-modules)
- Full classification with detailed evidence for every module (structural and feature)
- Feature-structural interaction mapping: trace data flow paths within each P0 feature across its constituent structural modules
- Output: complete MasterIndex + global architecture + per-P0-module mini architecture diagrams + per-P0-feature cross-module flow diagrams
- Split threshold lowered: >=2 subsystems triggers split (vs >=3 in Tier 2)
- Mandatory `[inferred]` and `[boundary-uncertain]` confirmation with user for both structural and feature modules

## Project Scale Adaptation

| Scale | File Count | Adaptation |
|-------|-----------|------------|
| **Small** | <50 files | Single-pass scan; skip dependency graph; lightweight directory tree |
| **Medium** | 50-500 files | Standard workflow |
| **Large** | 500-2000 files | Sample-based scanning for Tier 1-2; phased output |
| **Very Large** | 2000+ files | Phased scanning by top-level directory; incremental MasterIndex; P0 modules first |

## Documentation Split Signals

Evaluate these structural independence signals for each module. The decision is qualitative — based on sub-system independence, not file-count thresholds.

| Signal | Indicates split | Indicates single-doc |
|--------|----------------|---------------------|
| Sub-modules have separate entry points | Each can be understood from its own starting point | All share a single init/startup path |
| Sub-modules have distinct responsibilities | Each answers a different "what does this do?" question | Responsibilities are interleaved |
| Low file overlap between sub-modules (<30%) | Sub-modules own disjoint source files | Many files contribute to multiple sub-modules |
| Independent dependency profiles | Sub-modules import different upstream modules | Sub-modules share most upstream dependencies |
| No shared state machine or lifecycle | Sub-modules operate independently at runtime | Sub-modules are phases of a single lifecycle |

**Decision**: If >=2 sub-modules satisfy independence across >=3 signals, recommend multi-doc. Otherwise, recommend single-doc with justification.
