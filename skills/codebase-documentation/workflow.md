# Multi-Conversation Workflow

## Workflow Overview

This skill consumes a MasterIndex (produced upstream) and generates per-module L0–L3 analysis documents. Work may span multiple conversations depending on project size. The MasterIndex serves as the handoff artifact across conversations.

### Typical Workflow

```
Conversation 1:  P0 module analysis docs (batch 1)
Conversation 2:  P0 module analysis docs (batch 2) + P1 modules
Conversation N:  remaining modules + optional file annotations
```

## Conversation Scoping

Each conversation should complete one module or a batch of related modules. Plan for 3–5 module analyses per conversation; adjust based on module complexity.

## End-of-Conversation Protocol

Before ending any conversation:

1. **Update the master index** — mark completed modules, update file counts, coverage percentages, and directory tree status tags
2. **Write Handoff Notes** at the bottom of MasterIndex following the template format (Completed / Next priorities / Known issues)
3. **Verify claimed progress** — spot-check 3 files from the work just completed
4. **Verify diagrams** — validate per the Diagram Strategy in [conventions.md](conventions.md): Path A — run the PNG export command and confirm every `.excalidraw` has a `.png` sibling; Path B — confirm mermaid diagrams are fully embedded. Report any issues in the handoff notes.
5. **Verify directory tree** — update status tags in the Project Directory Tree section to reflect completed work

## Resume Protocol

When starting a new conversation to continue the work:

### Resume Steps

1. **Re-read `codebase-documentation` SKILL.md** — especially the Four-Level Depth Model, Coverage-Chain Completeness Rule, and Step B/C checkpoints
2. **Read `Document/MasterIndex.md`** — understand overall progress state, selected detail tier, and module priorities
3. **Read the latest handoff notes** — know exactly what to do next
4. **Read the most recent completed analysis doc** — use as quality calibration reference
5. **Spot-check 3 files** from the previous session's work against CHECKPOINT C
6. **Re-read 1–2 GOOD reference files** to calibrate quality
7. **Continue from where the handoff notes indicate**

## Quality Regression Handling

If a spot-check reveals bad quality (annotations match forbidden anti-patterns, or analysis docs violate Hard Rules):

1. **STOP** the current batch immediately
2. **Diagnose**: identify which files are affected and what pattern caused the regression
3. **Re-calibrate**: re-read GOOD reference files, re-read anti-pattern list / Hard Rules
4. **Redo** the affected files (do not continue forward with bad quality)
5. **Document** the regression in the handoff notes for future awareness

## Dealing with Very Large Projects (10K+ files)

- Break into **macro-phases**: analyze by language first (e.g., C++ → Python → Lua)
- Use P0/P1 modules as the first macro-phase (often ~20% of files, ~80% of value)
- P2/P3 modules can use the "first-full + simplified" strategy aggressively
- SKIP modules should be identified early in `codebase-structure` to avoid wasted effort
- Track cumulative statistics in the MasterIndex: total files analyzed, total docs produced, total annotations completed

## MasterIndex Consistency Verification

After each session, verify the MasterIndex remains consistent with produced documents:

| Check | How |
|-------|-----|
| Every P0/P1 module in Priority Matrix has a corresponding analysis document | Scan MasterIndex §10 → verify §60 has entries |
| Analysis documents reference diagrams that exist | Check all `![...]()` paths resolve to files |
| Directory tree status matches actual document existence | `[done]` modules have docs in `NNN-` folders |
| Handoff notes are current | Latest session date matches most recent work |
