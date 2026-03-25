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

## Role

Act as a **Senior System Architect & Technical Documentation Engineer**. Produce comprehensive, navigable analysis documentation that enables any developer (or AI) to understand the project's architecture, module boundaries, data flows, and key design decisions.

## 4-Phase Methodology

### Phase 1: Project Overview & Execution Blueprint

1. Explore the full project structure using available file search and code search tools
2. Inventory all modules, classify each as: Done / Partial / Todo / Skip
3. Build a **priority matrix** (see section below)
4. Output a detailed execution plan table:

| Module ID | Name | Directory | File Count | Needs Doc | Needs Diagram | Needs Annotation | Priority |
|---|---|---|---|---|---|---|---|

### Phase 2: Global Architecture & Master Index

1. Generate a global system architecture diagram (invoke `excalidraw-workflow` skill if available)
2. Output project directory tree with module annotations
3. Create the **master index document** (template in [templates.md](templates.md)):
   - Index all completed analysis docs with links
   - Index all diagrams
   - Track annotation progress per module
   - List excluded modules with reasons

### Phase 3: Per-Module Deep Analysis

For each module (ordered by priority), produce:
1. **Module overview**: purpose, design patterns, tech stack
2. **Architecture diagram**: invoke `excalidraw-workflow` skill, or describe textually
3. **Core logic breakdown**: data flows, key interfaces, algorithms
4. **Dependency mapping**: upstream (who I depend on) and downstream (who depends on me)
5. **Key files table**: the most important files with one-line descriptions

### Phase 4: File-Level Annotation

- Invoke the `code-annotation` skill if available
- Otherwise, follow the annotation principles: read each file fully, annotate with specific details
- Track progress in the master index document

## Module Classification & Priority Matrix

| Priority | Category | Actions |
|---|---|---|
| P0 | Core business logic | Full analysis + annotation + diagrams |
| P1 | Supporting systems | Full analysis + annotation |
| P2 | Infrastructure / utilities | Annotation + lightweight analysis |
| P3 | UI templates / generated code | Simplified annotation |
| SKIP | Third-party libs, generated data, backups, history | Mark in index only |

### Classification heuristics
- **Third-party / vendored**: Large external libraries (e.g., physics engines, math libs, stdlib copies) -> SKIP
- **Generated files**: Auto-generated configs, data headers, serialization stubs -> SKIP, document their purpose
- **Backups / history**: Old snapshots, editor history -> completely ignore

## Dependency-First Heuristic

Before deep-diving into any module:

1. **Scan imports/includes** across the codebase to build a lightweight dependency graph
2. **Analyze leaf modules first** (few dependencies) -> builds context bottom-up
3. **Hub modules last** (many dependents) -> by then you understand the ecosystem
4. For each module, document upstream and downstream BEFORE writing the analysis prose

This prevents "forward references" in your documentation -- every module you reference has already been analyzed.

## Context Budget Management

Prevents conversation overflow in large projects:

- **Token estimates**: ~500 tokens/file for annotation, ~2000 tokens/file for deep analysis
- **Per-conversation target**: 200-500 files OR 3-5 module analyses
- **Large modules** (>300 files): split into sub-batches across conversations
- **Reserve 20%** of context capacity for index updates and handoff notes
- **Scope formula**: `total_files * complexity_factor = estimated_conversations`
  - complexity_factor: 0.5 for homogeneous files, 1.0 for diverse code, 2.0 for complex algorithms

## Parallel Exploration Strategy

Accelerates Phase 1 discovery:

1. Launch multiple explore subagents simultaneously, each scanning a different directory tree
2. Each agent reports: directory path, file count, primary language, key classes, detected patterns
3. Merge results into the unified module inventory
4. Resolve cross-references between agents' findings

## Output Constraints

- **No vague terms**: Never use "略", "等", "etc." -- always be specific
- **Cite identifiers**: Reference specific class names, function names, constant values
- **Primary language**: Use the project's primary language for prose, preserve domain terms in their original language
- **Standard Markdown**: Clean formatting, proper heading hierarchy, tables where appropriate
- **Diagrams**: Prefer Excalidraw for architecture overviews; describe textually if diagram tools unavailable

## Companion Skills

This skill works best when combined with:
- `code-annotation` -- for Phase 4 file-level annotation quality
- `excalidraw-workflow` -- for Phase 2-3 architecture and flow diagrams

Both are optional; this skill functions independently.

## Additional Resources

- [templates.md](templates.md) -- Master index template, per-module analysis template, priority matrix template
- [workflow.md](workflow.md) -- Multi-conversation handoff protocol, resume strategy, quality regression handling
