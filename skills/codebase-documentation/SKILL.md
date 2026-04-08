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
> 3. **Four-level depth**: Every analysis document MUST contain L0 (concepts, when applicable), L1 (architecture), L2 (mechanism with full data flow traces), AND L3 (compact responsibility index + exhaustive key files table).
> 4. **Walkthrough required**: Every diagram MUST have a walkthrough paragraph (≥2 sentences) directly below it. The walkthrough MUST: (a) name at least 3 specific components visible in the diagram, (b) describe the primary data/control flow direction, and (c) call out at least one non-obvious architectural decision visible in the layout. Generic walkthroughs that could apply to any diagram are violations.
> 5. **File references**: Always use `ClassName::methodName()` with `path/file.ext:line` format.
> 6. **Self-check**: After completing each analysis pass, re-read this Hard Rules block and the active execution gate in `workflow.md` before proceeding.
> 7. **Readability**: No paragraph >4 sentences. No inline lists >3 items. Lead sections with a **bolded summary sentence**. See Readability Formatting Rules.
> 8. **Language**: Headings and prose default to **Chinese**; switch to English only when the user explicitly requests it. `ClassName::method()` and file paths always English.
> 9. **Depth-first multi-document execution**: When a module spans multiple documents, you MUST establish shared module context first and then finalize one sibling document at a time. NEVER draft multiple sibling documents as final prose in parallel.
> 10. **Same-module subagent limit**: One module has one final owner. Same-module subagents are evidence-only by default and must follow the orchestration rules in `reference.md`.

## Trigger Protocol

When this skill is activated, BEFORE performing any analysis, present the user with the following options using the AskQuestion tool:

1. **File-Level Source Annotations** (single-select):
   - **Yes**: After completing module analysis documents, automatically invoke `code-annotation` skill to annotate source files
   - **No** *(default)*: Produce analysis documents only, skip source file annotation

2. **Documentation Language** (single-select):
   - If MasterIndex §00 already records a language choice from `codebase-structure`, use that as the default and show it to the user: "MasterIndex specifies [language]. Keep this or override?"
   - If no MasterIndex language is recorded, default to **Chinese**
   - Options: **Chinese** / **English** — headings, prose, and descriptive text
   - Technical identifiers (`ClassName::method()`, file paths) always stay English regardless of this setting.

## Activation

After Trigger Protocol completes:

1. Follow `workflow.md` for session startup or resume.
2. Load companion files lazily:
  - `templates.md` for Module Context Packet, Evidence Packet, and final document structures
  - `workflow.md` for startup, resume, execution gates, handoff, MasterIndex updates, and annotation flow
  - `reference.md` for tier depth, coverage closure cues, readability, parallelism, and risk decisions
3. If context is tight, preserve source facts, trace inventory, L3 closure, and Key Files coverage before prose polish.

## Role

Act as a **Senior System Architect & Technical Documentation Engineer**. Produce documentation that serves as a **complete substitute for reading source code**.

## Four-Level Depth Model

| Level | Question it answers | What to document |
|-------|-------------------|-----------------|
| **L0 — Concepts** | "What must the reader understand first?" | Domain pattern explanation, key terminology with definitions, architectural alternatives considered, mental model |
| **L1 — Architecture** | "What is this module and how does it fit?" | Purpose, design patterns, layer position, dependencies, architecture diagrams |
| **L2 — Mechanism** | "How does each feature work?" | Complete data flows with function names, algorithms step-by-step, state machines, performance characteristics, usage examples |
| **L3 — Reference** | "What class is responsible for this, and where is it?" | Compact responsibility index: class name + file path + one-line responsibility. NOT full member tables — readers use IDE for signatures. |

**L0 trigger**: Mandatory when the module implements a recognized architectural pattern (ECS, MVC, actor, pipeline, pub-sub, etc.) or introduces >=5 domain-specific terms not defined elsewhere. Optional for utility modules.

**Common failures**: (1) Stopping at L1 without L2/L3 content. (2) Skipping L0 for complex architectural modules, leaving readers without the conceptual foundation.

## Coverage-Chain Completeness Rule

Document depth is determined by closure, not quotas:

```
MasterIndex subsystem inventory
  → L2 traces for every subsystem
    → owner document for every shared mechanism
      → L3 entry for every named class/function
        → Key Files coverage for every referenced source file
```

1. Every subsystem identified in MasterIndex must produce at least one L2 trace.
2. Every class/function named in L2 must map to one owner document and an L3 entry.
3. Every file containing an L3-referenced class must appear in Key Files; diff against the directory scan before completion.

For closure patterns, orchestration rules, and attention heuristics, see `reference.md`.

## Module Preconditions

- Build a Module Context Packet (`templates.md` §1.5) before drafting any module that spans >=2 documents or has >=2 independent subsystems. No packet, no prose.
- Use the Coverage Ledger inside the Context Packet to close `subsystem -> trace -> L3 -> Key Files` across sibling documents.
- Same-module evidence collection must use `templates.md` §1.6 and stay evidence-only.
- Default same-module fan-out is 2. High-risk modules with partial classes, central orchestrators, shared hotspot files, or shared lifecycle/state machines keep final drafting serial.

## Per-Module Deep Analysis

For each module (ordered by priority from MasterIndex), finalize one target document per pass using `templates.md` §2.

### Step 0 — Context & Ownership

- **Consume split plan** from MasterIndex §50:
  - multi-doc → Context Packet mandatory, pre-populate §5 from split plan, build Coverage Ledger per planned document
  - single-doc → verify during code reading; if >=2 independent subsystems discovered, escalate to user before proceeding
  - no split plan (legacy MasterIndex) → run fallback Split Decision (see Split And Overview Rules below)
- Pick exactly one target document for the current pass
- Assign every shared anchor to one owner document before prose

### Step A — L0 + L1: Concepts & Architecture

- Add L0 concepts when the L0 trigger fires
- Write L1 overview, patterns, entry points, dependencies, and required diagrams

### Step B — L2: Mechanism & Usage

- Trace every subsystem from MasterIndex with function-level data flow
- Include performance notes, design intent, and P0 usage examples where required

### Step C — L3: Reference Index

- Add an L3 responsibility entry for every class named in L2
- Close the Key Files table against the directory scan
- Record Follow-Up Items or explicit "none identified"

### Execution Gates

- `CHECKPOINT B`: before Step C, validate L2 completeness
- `CHECKPOINT C`: before document finalization, validate L3, Key Files, and diagram closure
- `CHECKPOINT M`: before module completion, validate module-wide ownership, ledger closure, sibling-doc consistency, and hotspot spot-checks

See `workflow.md` `Execution Gates` for full checklists.

### Split And Overview Rules

**Primary path**: follow the MasterIndex §50 split plan. Do not silently override — if you disagree with the plan after reading code, escalate to the user.

**Fallback** (no split plan in §50): split when the module contains >=2 sub-modules with independent entry points and distinct responsibilities. See `reference.md` §Documentation Split Signals for the evaluation guide. Record the decision in Context Packet §5.

**Overview rule**: >=2 sibling docs → Overview must centralize integration flow, shared lifecycle, and limitation callouts (`templates.md` §2b).

## Feature Module Documentation

Write feature documents only after their structural modules are closed.

- Use `templates.md` §2c to finalize one feature document per pass.
- Discover traces by scanning artifacts, not by quota: subdirectories, MsgHandler files, EventArgs definitions, state machines, and bridge/interface consumers determine the path count.
- Run `CHECKPOINT F` before finalizing the feature document.
- Use `reference.md` for tier depth and `workflow.md` for the full feature gate checklist.

## MasterIndex And Annotation

- MasterIndex ownership, update sequence, handoff rules, and annotation flow live in `workflow.md`.
- Only mark a module done or trigger `code-annotation` after `CHECKPOINT M` passes.

## Companion Files

- [templates.md](templates.md) — Module Context Packet, Evidence Packet, per-module analysis, multi-module overview, and feature templates
- [prompt-templates.md](prompt-templates.md) — Ready-to-paste prompts for module modeling, single-document finalization, and module review
- [conventions.md](conventions.md) — Directory structure, file naming, diagram strategy, cross-referencing, compliance checklist
- [reference.md](reference.md) — Tier depth, coverage closure rules, orchestration heuristics, readability, design intent tags, and risk escalation
- [workflow.md](workflow.md) — Session startup/resume, attention management, execution gates, handoff, MasterIndex updates, and annotation flow
- `codebase-structure` skill — produces the MasterIndex consumed by this skill
- `code-annotation` skill — for conditional Phase 4 file-level annotation
- `excalidraw-workflow` skill — for diagram generation (Path A)
