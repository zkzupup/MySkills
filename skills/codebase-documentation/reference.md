# Documentation Analysis Reference Tables

> Reference-only file. Load on-demand when you need tier depth, closure checks, orchestration decisions, readability rules, or risk guidance.

## Detail Tier Depth Configuration

### Tier 1 — Quick Overview

| Priority | Depth | Diagrams | Coverage Chain |
|----------|-------|----------|----------------|
| P0 | L0 + L1 only (purpose, patterns, entry points) | 0 (rely on MasterIndex global diagram) | Not enforced |
| P1-P3 | Listed in MasterIndex only, no standalone documents | - | - |

### Tier 2 — Standard Analysis (Default)

| Priority | Depth | Diagrams | Coverage Chain |
|----------|-------|----------|----------------|
| P0 | Full L0-L2 + L3 responsibility index + usage examples | >=2 per module | Full enforcement |
| P1 | L1-L2 + L3 responsibility index | >=1 per module | Standard |
| P2 | L1-L2 + L3 responsibility index (compact) | >=1 per module | Key Files only |
| P3 | Simplified analysis | Optional | Not enforced |

### Tier 3 — Deep Analysis

| Priority | Depth | Diagrams | Coverage Chain |
|----------|-------|----------|----------------|
| P0 | Full L0-L2 + L3 responsibility index + usage examples + code snippets in every L2 trace | >=3 per module | Full + exhaustive Key Files |
| P1 | Full L0-L2 + L3 responsibility index | >=2 per module | Full enforcement |
| P2 | Full L0-L2 + L3 responsibility index | >=1 per module | Standard |
| P3 | L1-L2 | Optional | Key Files only |

Additional Tier 3 rules:
- Module split threshold lowered to >=2 subsystems.
- Design Intent analysis mandatory for every module.
- Follow-Up Items require detailed priority justification and fix suggestions.

### Feature Module Tier-Based Depth

- **Tier 1**: Feature modules skipped.
- **Tier 2**: P0 features get full cross-module analysis; P1 features get overview + one flow trace.
- **Tier 3**: All features (P0-P2) get full cross-module analysis + interaction map + dedicated diagram.

## Coverage Closure Rules

| Closure edge | Required condition | Typical failure |
|--------------|--------------------|-----------------|
| MasterIndex → L2 | Every subsystem has at least one trace | A subsystem disappears from the draft |
| L2 → Owner doc | Every shared mechanism has one owner document | Two sibling docs explain the same anchor differently |
| L2 → L3 | Every named class/function appears in L3 | L2 names classes that never enter the index |
| L3 → Key Files | Every file containing an L3 class appears in Key Files | Key Files table omits real source files |
| Key Files → Directory scan | Directory diff closes cleanly | Support files become invisible |
| Module → Hotspot review | At least 3 hotspot files are spot-checked | Shared large files drift away from prose |

## Subagent Orchestration Rules

| Situation | Allowed action | Required constraint |
|-----------|----------------|---------------------|
| Same module, multiple final prose owners | Forbidden | One module has one final owner |
| Same-module subagent work | Evidence-only | Use Evidence Packet and avoid final prose |
| Same-module fan-out | Default max = 2 | Raise only if overlap is low and shared anchors are absent |
| High-risk module | Serial final drafting | Partial classes, central orchestrators, hotspot files, or shared state machines force serial final prose |
| Uncertain overlap / risk | Prefer serial | If uncertain, do not widen fan-out |

## Parallelism And Attention Heuristics

| Signal | Risk | Required action |
|--------|------|-----------------|
| Module contains partial classes or split files that share one runtime object | High | One final owner; same-module subagents evidence-only; finalize sibling docs serially |
| Module has a central orchestrator (`BattleWorld`, `GameManager`, `FrameworkManager`, etc.) referenced by multiple sibling docs | High | Assign the orchestrator to exactly one owner doc and prohibit conflicting re-explanations elsewhere |
| Same large file contributes traces to multiple sibling docs | High | Treat the file as a hotspot; spot-check it after drafting and keep final prose serial |
| Cross-subsystem state machine or shared lifecycle file drives multiple areas | High | Keep final drafting serial; use Context Packet ownership to centralize the explanation |
| Candidate sibling docs have low file overlap and no shared anchors | Medium | Evidence-only parallelism is acceptable; final prose can still stay serial |
| Leaf subsystem with isolated files and a single inbound/outbound path | Low | Same-module evidence parallelism is usually safe |

## Context Budget Priority

When context is tight, preserve information in this order:

1. Source facts and line-level anchors.
2. Trace inventory completeness.
3. L3 closure for all named classes.
4. Key Files coverage.
5. Diagram generation / walkthrough polish.
6. Narrative polish, repetition cleanup, and secondary summaries.

## Attention Dilution Signals

| Symptom | Likely cause | Required response |
|---------|--------------|-------------------|
| Function names and file paths disappear from later sections | Context is being consumed by breadth | Stop adding new sections; rebuild trace inventory for the current document |
| Prose becomes generic across sibling docs | Multiple documents are being drafted at once | Return to depth-first mode and finalize one target doc only |
| Shared mechanism is explained differently in two docs | No single owner for a shared anchor | Update the Context Packet ownership matrix and rewrite one side |
| L3 table is shorter than the classes named in L2 | Ledger is not closed | Reconcile L2 traces against the Coverage Ledger before continuing |
| Key Files omit files discovered during directory scan | Directory diff was skipped late in the pass | Re-run exhaustive file mapping before declaring completion |

## Readability Formatting Rules

| Rule | Trigger | Required Format |
|------|---------|----------------|
| Paragraph cap | Any paragraph >4 sentences | Split so each paragraph conveys one idea. Lead with **bolded summary sentence** |
| Structured lists | Listing >=4 items of same type | Bullet list (4-6 items) or table (7+). Max 3 items inline |
| One-step-one-concern | A numbered step contains semicolons or "then / and also" chains | Split into sub-steps (1a, 1b) or separate steps |
| Term introduction | First use of domain term or abbreviation | **Term** — one-sentence definition. Never bury in prose |
| Visual spacing | Two dense blocks adjacent | Insert >=1 sentence of connecting prose |
| Language | Always | Headings/prose default to Chinese; switch to English only when explicitly requested. Technical identifiers (`ClassName::method()`, file paths) stay English |

## Design Intent Tags

| Tag | Meaning |
|-----|---------|
| `[intent-clear]` | Code + comments + naming all align |
| `[intent-likely]` | Strong evidence, alternatives exist |
| `[intent-unclear]` | Insufficient evidence |
| `[intent-conflict]` | Code contradicts comments/docs |

## Risk Escalation

| Severity | Indicator | Action |
|----------|----------|--------|
| Critical | Architectural risk, security hazard | Pause, report, wait for user |
| High | Contradicts expectations/docs | Tag `[conflict]`, present evidence |
| Medium | Multiple plausible interpretations | Tag `[intent-ambiguous]`, list options |
| Low | Minor smells, style issues | Record in Follow-Up Items |
