---
name: codebase-documentation
description: >-
  Generate per-module deep analysis documents following a four-level depth model
  (L0 Concepts, L1 Architecture, L2 Mechanism, L3 Reference). Consumes a MasterIndex
  produced by the codebase-structure skill and produces comprehensive analysis documents
  that serve as a complete substitute for reading source code. Use when asked to
  generate module documentation, produce deep code analysis, or create technical
  architecture docs from an existing module inventory.
---

# Codebase Documentation Skill

> **HARD RULES — Violations are never acceptable.**
>
> 1. **Diagrams**: ONLY Excalidraw (via `excalidraw-workflow`) or mermaid fallback. NEVER PlantUML, Draw.io.
> 2. **No vague language**: Never write "handles various", "uses several patterns", "data flows through the system", or "see code for details". Name every class, function, and data path explicitly.
> 3. **Four-level depth**: Every analysis document MUST contain L0 (concepts, when applicable), L1 (architecture), L2 (mechanism with full data flow traces), AND L3 (class/method reference).
> 4. **Walkthrough required**: Every diagram MUST have a walkthrough paragraph (≥2 sentences) directly below it.
> 5. **File references**: Always use `ClassName::methodName()` with `path/file.ext:line` format.
> 6. **Self-check**: After completing each module analysis, re-read this Hard Rules block and the Completeness Gate before proceeding.
> 7. **Readability**: No paragraph >4 sentences. No inline lists >3 items. Lead sections with a **bolded summary sentence**. See Readability Formatting Rules.
> 8. **Language**: Headings and prose default to **Chinese**; switch to English only when the user explicitly requests it. `ClassName::method()` and file paths always English.

## Trigger Protocol

When this skill is activated, BEFORE performing any analysis, present the user with the following options using the AskQuestion tool:

1. **File-Level Source Annotations** (single-select):
   - **Yes**: After completing module analysis documents, automatically invoke `code-annotation` skill to annotate source files
   - **No** *(default)*: Produce analysis documents only, skip source file annotation

2. **Documentation Language** (single-select):
   - **Chinese** *(default)*: Headings, prose, and descriptive text in Chinese
   - **English**: Headings, prose, and descriptive text in English

Technical identifiers (`ClassName::method()`, file paths) always stay English regardless of this setting.

## Startup Protocol

This skill consumes the MasterIndex produced by `codebase-structure`. On activation:

1. **Read `Document/MasterIndex.md`** — extract the structural module list (§10), feature module matrix (§20), dependency summary, and selected detail tier
2. **Read the latest handoff notes** (if resuming a multi-conversation session)
3. **Plan documentation order**: Structural modules first (following the Documentation Execution Plan), then feature modules. Feature module analysis builds on completed structural module docs since it traces cross-module interactions.
4. **Determine documentation depth** based on the tier recorded in MasterIndex:
   - **Tier 1**: L0 + L1 only for P0 structural modules; no standalone documents for P1/P2/P3; feature modules skipped
   - **Tier 2**: Full L0–L3 for P0; L1–L3 for P1; L1–L2 + lightweight L3 for P2. P0 feature modules get a cross-module analysis doc (default)
   - **Tier 3**: Full L0–L3 for ALL structural modules (P0–P2); ALL feature modules get cross-module analysis; maximum diagram requirements; full coverage chain for every module
5. **If no MasterIndex exists**: inform the user to run `codebase-structure` first, or perform a lightweight in-place module inventory before proceeding

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
MasterIndex subsystem inventory
  → L2: each subsystem ≥1 complete data flow trace
    → every class/function named in any L2 data flow
      → L3: must have a Key Class Reference entry
        → every file containing an L3-referenced class
          → must appear in Key Files table
```

1. **MasterIndex anchors L2**: Every subsystem identified in MasterIndex requires ≥1 data flow trace in L2.
2. **L2 anchors L3**: Every class explicitly named in any L2 data flow MUST have an L3 entry.
3. **L3 anchors Key Files**: Every file containing an L3-referenced class MUST appear in Key Files.
4. **Minimum floor**: At least 3 L3 entries and 3 Key Files entries, even if the chain produces fewer.
5. **Self-check**: After writing L3, scan all L2 traces — any unnamed class = incomplete. After writing Key Files, scan all L3 entries — any missing file = incomplete.

## Per-Module Deep Analysis

For each module (ordered by priority from MasterIndex), produce a document following [templates.md](templates.md) §2.

**Execution flow with inline checkpoints:**

### Step A — L0 + L1: Concepts & Architecture

- L0 Domain Concepts (if trigger met): pattern overview, terminology table, alternatives, mental model
- L1 Module Overview: purpose (≥3 sentences), patterns, tech stack, entry points with file paths
- Diagrams: P0 modules require ≥2 (architecture + one additional); P1/P2 require ≥1

### Step B — L2: Mechanism & Usage

- Core Logic Breakdown: one subsection per subsystem from MasterIndex, each with complete data flow trace
- Usage Patterns (P0 only): ≥1 end-to-end example with real API names; comparison table if multiple modes exist
- Design Intent: implementation facts + inferred intent (cite evidence) + `[intent-unclear]` areas

> **CHECKPOINT B**: Before proceeding to L3, verify:
> - [ ] Every subsystem from MasterIndex has a data flow trace
> - [ ] No banned syntax (vague language)
> - [ ] Performance notes present for each feature
> - [ ] P0 modules have a usage example

### Step C — L3: Reference

- Key Class Reference: one entry per class named in any L2 data flow (floor: 3)
- Key Files Table: one entry per file containing an L3 class (floor: 3)
- Follow-Up Items: ≥1 item or explicit "none identified" with justification

> **CHECKPOINT C**: Coverage chain verified:
> - [ ] Every class named in L2 data flows has an L3 entry
> - [ ] Every file containing an L3 class is in Key Files
> - [ ] Diagram count meets minimum (P0 ≥2, P1/P2 ≥1)
> - [ ] Every diagram has a walkthrough paragraph

### Module Splitting Criteria

| Condition | Action |
|-----------|--------|
| ≥3 independent subsystems (≥2 in Tier 3) | Create `Overview.md` + per-subsystem `Analysis.md` |
| ≥200 source files | Split by layer or functional area |
| Single doc would exceed ~250 lines | Split into focused docs |
| Coverage chain produces >15 L3 entries | Strong signal to split |

All split documents stay in the SAME `NNN-<TopicName>/` folder.

### Cross-Module Integration Requirements

When a topic folder contains ≥2 sub-module analysis documents, the Overview MUST include:

1. **Integration data flow**: ≥1 end-to-end trace across sub-module boundaries, naming classes/functions at each crossing
2. **Selection guide** (if sub-modules are alternatives): comparison table with scenario, recommendation, rationale, tradeoffs
3. **Shared lifecycle** (if sub-modules share resources): initialization order, shared state, teardown
4. **Limitation callouts**: P0 limitations from sub-modules surfaced prominently in Overview

## Feature Module Documentation

**Feature modules are documented AFTER their constituent structural modules are complete**, since feature-level analysis traces cross-module interactions that rely on L2/L3 content from structural docs.

### Feature Module Analysis Document

For each feature module (ordered by priority from MasterIndex §20), produce a cross-module analysis document:

1. **Feature Overview (L1)**: What the feature does for end users; which structural modules participate; entry points
2. **Cross-Module Data Flow (L2)**: Trace ≥1 complete end-to-end path from user action → UI → Logic → Network → Data and back. Name specific classes/functions at each structural module boundary crossing.
3. **Module Interaction Map**: Table showing which class in structural module A calls which class in structural module B, with the interaction purpose
4. **Feature-Specific Patterns**: Architecture patterns that only emerge at the feature level (e.g., optimistic update pattern spanning UI + Logic + Network)
5. **Feature Diagram**: Cross-module flow diagram showing the feature's data/control flow across structural modules

**Document naming**: `<FeatureName>_CrossModule_Analysis.md`, placed in the topic folder of the feature's primary structural module (the one with the most files for this feature).

**Tier-based depth**:
- **Tier 1**: Feature modules skipped
- **Tier 2**: P0 features get full cross-module analysis; P1 features get overview + one flow trace
- **Tier 3**: All features (P0–P2) get full cross-module analysis + interaction map + dedicated diagram

## Detail Tier Depth Configuration

### Tier 1 — Quick Overview

| Priority | Depth | Diagrams | Coverage Chain |
|----------|-------|----------|----------------|
| P0 | L0 + L1 only (purpose, patterns, entry points) | 0 (rely on MasterIndex global diagram) | Not enforced |
| P1–P3 | Listed in MasterIndex only, no standalone documents | — | — |

### Tier 2 — Standard Analysis (Default)

| Priority | Depth | Diagrams | Coverage Chain |
|----------|-------|----------|----------------|
| P0 | Full L0–L3 + usage examples | ≥2 per module | Full enforcement |
| P1 | L1–L3 | ≥1 per module | Standard |
| P2 | L1–L2 + lightweight L3 | ≥1 per module | L3 floor only |
| P3 | Simplified analysis | Optional | Not enforced |

### Tier 3 — Deep Analysis

| Priority | Depth | Diagrams | Coverage Chain |
|----------|-------|----------|----------------|
| P0 | Full L0–L3 + usage examples + code snippets in every L2 trace | ≥3 per module | Full + all public APIs |
| P1 | Full L0–L3 | ≥2 per module | Full enforcement |
| P2 | Full L0–L3 | ≥1 per module | Standard |
| P3 | L1–L2 | Optional | L3 floor only |

Additional Tier 3 rules:
- Module split threshold lowered to ≥2 subsystems
- Design Intent analysis mandatory for every module
- Follow-Up Items require detailed priority justification and fix suggestions

## Readability Formatting Rules

| Rule | Trigger | Required Format |
|------|---------|----------------|
| Paragraph cap | Any paragraph >4 sentences | Split so each paragraph conveys one idea. Lead with **bolded summary sentence** |
| Structured lists | Listing ≥4 items of same type | Bullet list (4–6 items) or table (7+). Max 3 items inline |
| One-step-one-concern | A numbered step contains semicolons or "then / and also" chains | Split into sub-steps (1a, 1b) or separate steps |
| Term introduction | First use of domain term or abbreviation | **Term** — one-sentence definition. Never bury in prose |
| Visual spacing | Two dense blocks adjacent | Insert ≥1 sentence of connecting prose |
| Language | Always | Headings/prose default to Chinese; switch to English only when explicitly requested. Technical identifiers (`ClassName::method()`, file paths) stay English |

## Collaborative Protocol

### Key Checkpoints

| Checkpoint | When | Validate |
|-----------|------|----------|
| MasterIndex consumed | Startup | Module list matches expectations, tier is correct |
| Design intent | During analysis | Inferences, `[intent-unclear]` areas |
| Document draft | Before writing to disk | Structural completeness via CHECKPOINT B and C |

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

## File-Level Annotation (Conditional)

If the user selected "Yes" for file-level annotations in the Trigger Protocol:

1. After completing all module analysis documents, invoke `code-annotation` skill
2. Track annotation progress in the MasterIndex Annotated Source Index section
3. Follow the annotation skill's batch strategy and calibration protocol

## Companion Files

- [templates.md](templates.md) — Master index, per-module analysis, multi-module overview, priority matrix templates
- [conventions.md](conventions.md) — Directory structure, file naming, diagram strategy, cross-referencing, compliance checklist
- [workflow.md](workflow.md) — Multi-conversation handoff, resume protocol, quality regression handling
- `codebase-structure` skill — produces the MasterIndex consumed by this skill
- `code-annotation` skill — for conditional Phase 4 file-level annotation
- `excalidraw-workflow` skill — for diagram generation (Path A)
