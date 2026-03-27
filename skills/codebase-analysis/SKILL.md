---
name: codebase-analysis
description: >-
  Perform comprehensive codebase review and modular analysis as a Senior System
  Architect. Follows a 4-phase methodology: project overview, global architecture,
  per-module deep analysis, and file-level annotation. Includes dependency-first
  heuristic, priority matrix, context budget management, and multi-conversation
  handoff. Use when asked to analyze a codebase, review project architecture,
  create module documentation, or perform systematic code review.
---

# Codebase Analysis Skill

> **HARD RULES — Violations are never acceptable.**
>
> 1. **Diagrams**: ONLY Excalidraw (via `excalidraw-workflow`) or mermaid fallback. NEVER Mermaid, PlantUML, Draw.io.
> 2. **No vague language**: Never write "handles various", "uses several patterns", "data flows through the system", or "see code for details". Name every class, function, and data path explicitly.
> 3. **Four-level depth**: Every analysis document MUST contain L0 (concepts, when applicable), L1 (architecture), L2 (mechanism with full data flow traces), AND L3 (class/method reference).
> 4. **Walkthrough required**: Every diagram MUST have a walkthrough paragraph (≥2 sentences) directly below it.
> 5. **File references**: Always use `ClassName::methodName()` with `path/file.ext:line` format.
> 6. **Self-check**: After completing each module analysis, re-read this Hard Rules block and the Completeness Gate before proceeding.
> 7. **Readability**: No paragraph >4 sentences. No inline lists >3 items. Lead sections with a **bolded summary sentence**. See Readability Formatting Rules.
> 8. **Language match**: Headings and prose match user's language. `ClassName::method()` and file paths always English.

## Role

Act as a **Senior System Architect & Technical Documentation Engineer**. Produce documentation that serves as a **complete substitute for reading source code**.

## Four-Level Depth Model

| Level | Question it answers | What to document |
|-------|-------------------|-----------------|
| **L0 — Concepts** | "What must the reader understand first?" | Domain pattern explanation, key terminology with definitions, architectural alternatives considered, mental model |
| **L1 — Architecture** | "What is this module and how does it fit?" | Purpose, design patterns, layer position, dependencies, architecture diagrams |
| **L2 — Mechanism** | "How does each feature work?" | Complete data flows with function names, algorithms step-by-step, state machines, performance characteristics, usage examples |
| **L3 — Reference** | "What exactly does this class/function do?" | Key class responsibilities, public API signatures, parameter meanings, constants, threading constraints |

**L0 trigger**: Mandatory when the module implements a recognized architectural pattern (ECS, MVC, actor, pipeline, pub-sub, etc.) or introduces >=5 domain-specific terms not defined elsewhere. Optional for utility modules.

**Common failures**: (1) Stopping at L1 without L2/L3 content. (2) Skipping L0 for complex architectural modules, leaving readers without the conceptual foundation.

## Coverage-Chain Completeness Rule

Document depth is determined by a coverage chain, not fixed counts:

```
Phase 1 subsystem inventory
  → L2: each subsystem ≥1 complete data flow trace
    → every class/function named in any L2 data flow
      → L3: must have a Key Class Reference entry
        → every file containing an L3-referenced class
          → must appear in Key Files table
```

1. **Phase 1 anchors L2**: Every subsystem identified in Phase 1 requires ≥1 data flow trace in L2.
2. **L2 anchors L3**: Every class explicitly named in any L2 data flow MUST have an L3 entry.
3. **L3 anchors Key Files**: Every file containing an L3-referenced class MUST appear in Key Files.
4. **Minimum floor**: At least 3 L3 entries and 3 Key Files entries, even if the chain produces fewer.
5. **Self-check**: After writing L3, scan all L2 traces — any unnamed class = incomplete. After writing Key Files, scan all L3 entries — any missing file = incomplete.

## Project Scale Adaptation

| Scale | File Count | Adaptation |
|-------|-----------|------------|
| **Small** | <50 files | Merge Phase 1+2; lightweight Phase 3 (L0/L3 optional); single doc OK |
| **Medium** | 50–500 files | Standard 4-Phase; P0 full depth, P1/P2 may abbreviate L3 |
| **Large** | 500–2000 files | Full workflow + multi-conversation (see [workflow.md](workflow.md)) |
| **Very Large** | 2000+ files | Full workflow + macro-phase splitting; P0 modules first |

## 4-Phase Methodology

### Phase 1: Project Overview & Execution Blueprint

1. Explore full project structure
2. Inventory all modules, classify: Done / Partial / Todo / Skip
3. **Infer implicit subsystems** (mark `[inferred]`, validate with user)
4. Build **priority matrix** (P0 core / P1 supporting / P2 infra / P3 UI / SKIP third-party)
5. **Plan diagram types per module**:

| Module Characteristic | Required Diagram Types |
|---|---|
| Any module (P0-P2) | Architecture overview |
| ≥3 interacting classes | Class diagram |
| Multi-step data transformation | Data flow diagram |
| Distinct lifecycle phases | Lifecycle diagram |
| Explicit state transitions | State machine diagram |
| Cross-module request/response | Sequence diagram |
| Database / persistence layer | ER diagram |
| SoA/AoS storage, memory pools, data-oriented design | Memory layout diagram |

6. Output execution plan table with Diagram Plan column

### Phase 2: Global Architecture & Master Index

1. Generate global architecture diagram (Excalidraw or mermaid)
2. Output project directory tree with annotations
3. Create master index (see [templates.md](templates.md) §1)
4. For file placement rules, see [conventions.md](conventions.md)

### Phase 3: Per-Module Deep Analysis

For each module (ordered by priority), produce a document following [templates.md](templates.md) §2.

**Execution flow with inline checkpoints:**

#### Step A — L0 + L1: Concepts & Architecture
- L0 Domain Concepts (if trigger met): pattern overview, terminology table, alternatives, mental model
- L1 Module Overview: purpose (≥3 sentences), patterns, tech stack, entry points with file paths
- Diagrams: P0 modules require ≥2 (architecture + one additional); P1/P2 require ≥1

#### Step B — L2: Mechanism & Usage
- Core Logic Breakdown: one subsection per Phase 1 subsystem, each with complete data flow trace
- Usage Patterns (P0 only): ≥1 end-to-end example with real API names; comparison table if multiple modes exist
- Design Intent: implementation facts + inferred intent (cite evidence) + `[intent-unclear]` areas

> **CHECKPOINT B**: Before proceeding to L3, verify:
> - [ ] Every subsystem from Phase 1 has a data flow trace
> - [ ] No banned syntax (mermaid, vague language)
> - [ ] Performance notes present for each feature
> - [ ] P0 modules have a usage example

#### Step C — L3: Reference
- Key Class Reference: one entry per class named in any L2 data flow (floor: 3)
- Key Files Table: one entry per file containing an L3 class (floor: 3)
- Follow-Up Items: ≥1 item or explicit "none identified" with justification

> **CHECKPOINT C**: Coverage chain verified:
> - [ ] Every class named in L2 data flows has an L3 entry
> - [ ] Every file containing an L3 class is in Key Files
> - [ ] Diagram count meets minimum (P0 ≥2, P1/P2 ≥1)
> - [ ] Every diagram has a walkthrough paragraph

#### Module Splitting Criteria

| Condition | Action |
|-----------|--------|
| ≥3 independent subsystems | Create `Overview.md` + per-subsystem `Analysis.md` |
| ≥200 source files | Split by layer or functional area |
| Single doc would exceed ~250 lines | Split into focused docs |
| Coverage chain produces >15 L3 entries | Strong signal to split |

All split documents stay in the SAME `NN-<TopicName>/` folder.

#### Cross-Module Integration Requirements

When a topic folder contains ≥2 sub-module analysis documents, the Overview MUST include:

1. **Integration data flow**: ≥1 end-to-end trace across sub-module boundaries, naming classes/functions at each crossing
2. **Selection guide** (if sub-modules are alternatives): comparison table with scenario, recommendation, rationale, tradeoffs
3. **Shared lifecycle** (if sub-modules share resources): initialization order, shared state, teardown
4. **Limitation callouts**: P0 limitations from sub-modules surfaced prominently in Overview

### Phase 4: File-Level Annotation (on request only)

Invoke `code-annotation` skill if available; track progress in master index.

## Dependency-First Heuristic

1. Scan imports/includes to build dependency graph
2. Analyze **leaf modules first** (few dependencies) → context builds bottom-up
3. **Hub modules last** (many dependents)

**Layer model**: Foundation (zero deps) → Core → Feature → Presentation → Peripheral

**Checks**:
- **Circular deps**: topological sort; document cycles with involved modules and interfaces
- **Bottleneck**: ≥3 downstream dependents → mark `[bottleneck]`, prioritize analysis
- **Orphan**: 0 upstream AND 0 downstream → flag for review

## Module Classification

| Priority | Category | Actions |
|---|---|---|
| P0 | Core business logic | Full L0-L3 + diagrams + usage examples |
| P1 | Supporting systems | Full L1-L3 + diagrams |
| P2 | Infrastructure | L1-L2 + lightweight L3 |
| P3 | UI templates / generated | Simplified analysis |
| SKIP | Third-party, generated data, backups | Mark in index only |

## Output Constraints

- **No vague terms**: Never use "略", "等", "etc." — be specific
- **Cite identifiers**: class names, function names, constant values
- **Language**: Section headings, table headers, and prose MUST match the user's interaction language. Technical identifiers (class names, methods, file paths, constants) always remain in original English
- **Diagrams**: Excalidraw Path A or mermaid Path B; see [conventions.md](conventions.md) §Diagram Strategy for tooling and file placement

## Readability Formatting Rules

These rules prevent "AI-readable but human-hostile" output. Every analysis document MUST comply.

| Rule | Trigger | Required Format |
|------|---------|----------------|
| Paragraph cap | Any paragraph >4 sentences | Split so each paragraph conveys one idea. Lead each section with a **bolded summary sentence** |
| Structured lists | Listing ≥4 items of the same type (methods, classes, states) | Use bullet list (4–6 items) or table (7+ items). Max 3 items inline in prose |
| One-step-one-concern | A numbered step contains semicolons or "then / and also" chains | Split into sub-steps (1a, 1b) or separate steps |
| Term introduction | First use of a domain term or abbreviation | Format as: **Term** — one-sentence definition. Never bury in paragraph prose |
| Visual spacing | Two dense blocks (table, code, long list) adjacent | Insert ≥1 sentence of connecting prose between them |
| Language match | User communicates in language X | All headings, table headers, and prose use language X. Technical identifiers (`ClassName::method()`, file paths, constants) always stay in original English |

## Collaborative Protocol

### Key Checkpoints

| Checkpoint | When | Validate |
|-----------|------|----------|
| Module inventory | After Phase 1 | Boundaries, `[inferred]` subsystems, priorities |
| Dependency graph | After dep analysis | Layers, cycles, bottlenecks |
| Design intent | During Phase 3 | Inferences, `[intent-unclear]` areas |
| Document draft | Before writing to disk | Structural completeness |

### Risk Escalation

| Severity | Indicator | Action |
|----------|----------|--------|
| Critical | Architectural risk, security hazard | Pause, report, wait for user |
| High | Contradicts expectations/docs | Tag `[conflict]`, present evidence |
| Medium | Multiple plausible interpretations | Tag `[intent-ambiguous]`, list options |
| Low | Minor smells, style issues | Record in Follow-Up Items |

### Design Intent Tags

| Tag | Meaning |
|-----|---------|
| `[intent-clear]` | Code + comments + naming all align |
| `[intent-likely]` | Strong evidence, alternatives exist |
| `[intent-unclear]` | Insufficient evidence |
| `[intent-conflict]` | Code contradicts comments/docs |

## Context Budget

- ~500 tokens/file annotation, ~2000 tokens/file deep analysis
- Per-conversation: 200-500 files OR 3-5 module analyses
- Large modules (>300 files): split into sub-batches
- Reserve 20% capacity for index updates and handoff

## Companion Files

- [templates.md](templates.md) — Master index, per-module analysis, multi-module overview, priority matrix templates
- [conventions.md](conventions.md) — Directory structure, file naming, diagram strategy, cross-referencing, compliance checklist
- [workflow.md](workflow.md) — Multi-conversation handoff, resume protocol, quality regression handling
- `code-annotation` skill — for Phase 4 file-level annotation
- `excalidraw-workflow` skill — for diagram generation (enables Path A)
