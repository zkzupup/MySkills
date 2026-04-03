# Multi-Conversation Workflow

## Session Startup

Use this section immediately after skill activation.

### New module / first pass

1. Run the Trigger Protocol questions from `SKILL.md`.
2. Read `Document/MasterIndex.md` and capture tier, §10 structural modules, §20 feature modules, dependency summary, and latest handoff notes.
3. If no MasterIndex exists, stop and run `codebase-structure` first, or perform a lightweight in-place inventory.
4. Pick the current module and decide whether it requires a Module Context Packet.
5. Load only the companion file needed for the current phase.

### Resume existing module

1. Read the latest handoff notes.
2. Read the latest Module Context Packet / Coverage Ledger artifact if one exists.
3. Read the current target document or most recent completed analysis doc.
4. Spot-check 3 source files against the active gate.
5. Continue with one target document only.

## Attention Management During Multi-Document Work

- Keep the active working set minimal: main `SKILL.md`, the current target doc, and one companion file for the current phase.
- Do not open final prose for more than one sibling document at a time.
- Same-module subagents return Evidence Packets only.
- When context is tight, preserve source facts, trace inventory, L3 closure, and Key Files before prose polish.
- If function names, file paths, or edge cases start disappearing, stop expanding prose and rebuild the trace inventory first.

## Depth-First Execution Order

1. Build or refresh the Module Context Packet.
2. Build or refresh the Coverage Ledger.
3. Choose one target document.
4. Collect Evidence Packets if needed.
5. Finalize the target document using `templates.md`.
6. Run `CHECKPOINT B` and `CHECKPOINT C`.
7. Repeat for remaining sibling docs.
8. Run `CHECKPOINT M` at module scope.
9. Only then update MasterIndex status, start feature docs, or trigger annotation.

## Execution Gates

### CHECKPOINT B — before Step C

- [ ] Every subsystem from MasterIndex has a data flow trace.
- [ ] No banned syntax or vague language appears in the draft.
- [ ] Performance notes exist for each feature / subsystem.
- [ ] P0 modules contain at least one usage example.

### CHECKPOINT C — before document finalization

- [ ] Every class named in L2 has an L3 entry.
- [ ] Key Files table covers all files in the target directory scope.
- [ ] Diagram count meets the tier minimum.
- [ ] Every diagram has a compliant walkthrough.

### CHECKPOINT M — before module completion

- [ ] Module Context Packet exists and matches the current directory scan.
- [ ] Coverage Ledger is closed for every subsystem in the module.
- [ ] Every shared anchor has exactly one owner document.
- [ ] Sibling docs do not conflict on shared mechanisms.
- [ ] At least 3 hotspot source files were spot-checked after drafting.

### CHECKPOINT F — feature documents only

- [ ] §0 subsystem inventory matches the feature directory scan.
- [ ] §3 traces cover every inventoried subsystem.
- [ ] §5 matches all EventArgs definitions.
- [ ] §6 matches all MsgHandler handlers, if present.
- [ ] Every class named in §3 / §4 appears in L3.
- [ ] Every L3 class file appears in Key Files.

## MasterIndex Update And Annotation Rules

1. Own §50–§91 and Handoff Notes only; §40 may be updated by both skills.
2. Re-read the current MasterIndex before editing §40.
3. Append `<!-- Last updated: YYYY-MM-DD by codebase-documentation -->` after any modified owned section.
4. Only mark a module `[done]` after `CHECKPOINT M` passes.
5. Invoke `code-annotation` only if the user selected `Yes` and `CHECKPOINT M` has passed.

## End-of-Conversation Protocol

1. Update MasterIndex status, file counts, and directory-tree tags.
2. Write Handoff Notes with completed docs, next target doc, active gate, and blockers.
3. Spot-check 3 source files from the current pass.
4. Verify diagram assets or Mermaid embeds.
5. Verify the Context Packet / Coverage Ledger still match the latest source scan.
6. If the module is incomplete, leave a clear next document and next hotspot list.

## Quality Regression Handling

If a spot-check reveals bad quality or depth regression:

1. **STOP** the current batch immediately.
2. Diagnose which files, traces, or ownership decisions caused the regression.
3. Re-calibrate by re-reading the Hard Rules, the active gate, and 1–2 good reference docs.
4. Reduce fan-out: fall back to evidence-only subagents or fully serial drafting.
5. Redo the affected document(s) before moving forward.
6. Record the regression and the fix strategy in handoff notes.

## Dealing with Very Large Projects (10K+ files)

- Break work into macro-phases by priority or language.
- Start with P0/P1 modules that deliver most architectural value.
- Use simplified depth only where the selected tier explicitly allows it.
- Identify SKIP modules early to avoid wasted effort.
- Track cumulative totals in MasterIndex: files analyzed, docs produced, annotations completed.

## MasterIndex Consistency Verification

After each session, verify the MasterIndex remains consistent with produced documents:

| Check | How |
|-------|-----|
| Every P0/P1 module in Priority Matrix has a corresponding analysis document | Scan MasterIndex §10 and verify §60 entries |
| Analysis documents reference diagrams that exist | Check all `![...]()` paths resolve |
| Directory tree status matches actual document existence | `[done]` modules have docs in `NNN-` folders |
| Handoff notes are current | Latest session date matches most recent work |
