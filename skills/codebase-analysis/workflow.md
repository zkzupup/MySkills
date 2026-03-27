# Multi-Conversation Workflow

## Conversation Scoping

Each conversation should complete **one full Phase** or a **major sub-phase**. Use the context budget formula to plan:

```
estimated_conversations = total_files * complexity_factor / files_per_conversation

complexity_factor:
  0.5 -- homogeneous files (UI templates, generated stubs)
  1.0 -- diverse business logic
  2.0 -- complex algorithms, multi-language interactions

files_per_conversation:
  200-500 for annotation-only work
  50-100 for deep analysis + annotation
```

## End-of-Conversation Protocol

Before ending any conversation:

1. **Update the master index** -- mark completed modules, update file counts and coverage percentages
2. **Write a handoff summary** at the bottom of the index document:

```markdown
## Handoff Notes (Session YYYY-MM-DD)

### Completed this session
- [Module A]: N files annotated, analysis doc created
- [Module B]: N files annotated

### Next priorities
1. [Module C]: start annotation (N files, estimated 2 batches)
2. [Module D]: needs deep analysis first

### Known issues
- [Module A] file X has unusual pattern, needs manual review
- Quality regression detected in batch 3, re-calibrate before continuing
```

3. **Verify claimed progress** -- spot-check 3 files from the work just completed
4. **Verify diagrams** -- validate per the Diagram Strategy in [conventions.md](conventions.md): Path A — run the PNG export command and confirm every `.excalidraw` has a `.png` sibling; Path B — confirm ASCII diagrams are fully embedded. Report any issues in the handoff notes.

## Resume Protocol

When starting a new conversation to continue the work:

1. **Re-read SKILL.md** -- especially the Four-Level Depth Model, Coverage-Chain Completeness Rule, and Phase 3 checkpoints
2. **Read the master index** -- understand overall progress state
3. **Read the latest handoff notes** -- know exactly what to do next
4. **Read the most recent completed analysis doc** -- use as quality calibration reference
5. **Spot-check 3 files** from the previous session's work against Phase 3 CHECKPOINT C
6. **Re-read 1-2 GOOD reference files** to calibrate quality
7. **Continue from where the handoff notes indicate**

## Quality Regression Handling

If a spot-check reveals bad quality (annotations match forbidden anti-patterns):

1. **STOP** the current batch immediately
2. **Diagnose**: identify which files are affected and what pattern caused the regression
3. **Re-calibrate**: re-read GOOD reference files, re-read anti-pattern list
4. **Redo** the affected files (do not continue forward with bad quality)
5. **Document** the regression in the handoff notes for future awareness

## Parallel Work Coordination

When using multiple subagents in one conversation:

1. **Partition by directory**: each agent owns a non-overlapping set of directories
2. **Share reference files**: all agents read the same GOOD annotation examples
3. **Merge results**: after all agents finish, consolidate progress into the master index
4. **Cross-check**: verify that agents didn't produce inconsistent annotations for related files

## Dealing with Very Large Projects (10K+ files)

- Break into **macro-phases**: C++ first, then Python core, then Python periphery
- Use P0/P1 modules as the first macro-phase (often ~20% of files, ~80% of value)
- P2/P3 modules can use the "first-full + simplified" strategy aggressively
- SKIP modules should be identified early to avoid wasted effort
- Track cumulative statistics in the index: total files annotated, total docs produced
