# Analysis Document Templates

---

## 1. MasterIndex Extension

This skill extends the MasterIndex (created by `codebase-structure`) by populating these sections:

| MasterIndex Section | What This Skill Adds |
|---------------------|---------------------|
| §50 Documentation Execution Plan | Analysis order for structural and feature modules |
| §60 Analysis Documents | Links to completed analysis documents |
| §70 Diagrams | Links to per-module diagrams |
| §80 Annotated Source Index | File-level annotation progress (if enabled) |
| Handoff Notes | Session progress and next priorities |

The MasterIndex template (§00–§40, §90–§91, scaffold) is maintained in the `codebase-structure` skill.

---

## 2. Per-Module Analysis Document Template

```markdown
# [Module Name] Analysis

## 0. Domain Concepts (L0)

> **When to include**: Mandatory when the module implements a recognized architectural pattern
> (ECS, MVC, actor model, pipeline, pub-sub, etc.) or introduces >=5 domain-specific terms
> not defined elsewhere in the project docs. Skip for utility/infrastructure modules.

### Pattern Overview
- **Pattern name**: <e.g., Archetype-based Entity Component System>
- **Core idea**: <2-3 sentences: What is this pattern? What problem does it solve compared to naive approaches?>
- **Key terminology**:

| Term | General Definition | This Module's Implementation |
|------|--------------------|------------------------------|
| <term> | <domain-standard definition> | <specific class/struct and how it realizes the concept> |

### Architectural Alternatives
- <Alternative approach A>: <why NOT chosen, or how it coexists — cite evidence if available>
- <Alternative approach B>: <same>

### Mental Model
<1-2 sentences: the "aha" insight for how a reader should think about this module's approach>

## 1. Module Overview (L1)

- **Purpose**: <≥3 sentences, split into ≤4-sentence paragraphs. Lead with a **bolded summary sentence**. What problem this module solves, who calls it, what it produces>
- **Design Patterns**: <Name each pattern + where used: "Observer in `EventBus` for decoupled event handling">
- **Language / Tech Stack**: <C++17, Python 3.x, Lua 5.3, etc.>
- **File Count**: N files
- **Key Entry Points**: <3-5 main classes/functions with file paths: `EventBus::dispatch()` in `src/core/event_bus.h`>

## 2. Diagrams (L1/L2)

### 2.1 Architecture Overview

![Architecture](../diagrams/<DomainLabel>/<ModuleName>_Architecture.png)

**Diagram walkthrough:** <2-5 sentences explaining what this diagram shows. Identify the major components visible in the diagram, describe how they connect, highlight the primary data flow direction, and call out any notable architectural decisions visible in the layout. Do NOT just restate the module overview — explain what a reader is LOOKING AT in the diagram.>

### 2.2 [Additional Diagram Type] (if applicable per MasterIndex diagram plan)

> Repeat this subsection for each additional diagram (data flow, class diagram, state machine, lifecycle, sequence, ER, memory layout). Each follows the same format: image embed + walkthrough paragraph.

![<DiagramDescription>](../diagrams/<DomainLabel>/<DiagramName>.png)

**Diagram walkthrough:** <2-5 sentences specific to this diagram type. For a data flow diagram: trace the path from source to sink, naming each transformation stage. For a state machine: list the states and key transitions. For a class diagram: explain the inheritance/composition hierarchy and key interfaces. For a memory layout diagram: describe the SoA/AoS arrangement, alignment, and access patterns.>

## 3. Core Logic Breakdown (L2)

> Each subsection traces a complete feature from input to output. Include function names at every step.
> The coverage chain requires: every subsystem from MasterIndex gets at least one subsection here.

### 3.1 [Feature / Subsystem A]

**Data Flow:**
`[Input Source]` → `ClassA::methodA()` (`path/file.ext:line`) → `ClassB::methodB()` → `[Output/Effect]`

**Step-by-step Logic:**
1. [Trigger]: what initiates this flow
2. [Processing]: specific functions called, data transformations, algorithms
3. [Result]: what is produced, where does it go
4. [Edge Cases]: what happens on error, timeout, invalid input

**State Machine / Lifecycle:** (if applicable)
<Describe states and transitions>

**Performance Notes:**
- Time complexity: O(?)
- Caching/batching strategy: <describe>

### 3.2 [Feature / Subsystem B]
<Same structure>

## 4. Usage Patterns & Examples (L2)

> **When to include**: Mandatory for P0 modules. Optional for P1/P2.

### Typical Usage Scenario
<Describe the most common use case in 2-3 sentences, then show a concrete example>

**Example: <scenario name>**
```cpp
// Pseudo-code or actual API calls showing end-to-end usage
// Must use real class/function names from this module
```

### Usage Mode Comparison (if applicable)

> Include when multiple approaches/tracks/modes exist (e.g., Entity track vs ECS track).

| Scenario | Recommended Approach | Rationale |
|----------|---------------------|-----------|
| <scenario> | <which API/track/mode> | <why> |

### Reference Implementations
- `<test_file.ext>`: <what it demonstrates>
- `<example_file.ext>`: <what it demonstrates>

## 5. Dependency Mapping (L1)

### Upstream (this module depends on)
| Module | What it provides | Interface / Key Files |
|--------|-----------------|----------------------|
| [Name] | <description> | `InterfaceName` in `path/file.ext` |

### Downstream (depends on this module)
| Module | What it uses | Interface / Key Files |
|--------|-------------|----------------------|
| [Name] | <description> | `InterfaceName` in `path/file.ext` |

## 5.5. Dependency Position (L1)

- **Layer**: <Foundation / Core / Feature / Presentation / Peripheral>
- **Downstream dependents**: N modules
- **Risk level**: <Bottleneck / Normal / Leaf / Orphan>
- **Circular dependencies**: <None / list>

## 6. Key Class & Interface Reference (L3)

> Coverage chain: every class named in Section 3 data flow traces MUST have an entry here.
> Minimum floor: 3 entries even if fewer classes appear in data flows.

### 6.1 `ClassName` (`path/file.ext`)

**Responsibility**: <One sentence>

**Key Methods:**
| Method | Signature | Description |
|--------|-----------|-------------|
| `methodA` | `ReturnType methodA(ParamType param)` | <what it does, when to call it> |
| `methodB` | `void methodB(int id, Action callback)` | <what it does, side effects> |

**Constants:**
| Name | Value | Meaning |
|------|-------|---------|
| `MAX_RETRY` | `3` | Maximum connection retry attempts |

**Threading/Lifecycle Notes:** <e.g., "Must be constructed on main thread", "Dispose() must be called before scene unload">

### 6.2 `ClassName2` (`path/file.ext`)
<Same structure>

## 7. Key Files Table (L3)

> Coverage chain: every file containing an L3-referenced class MUST appear here.
> Minimum floor: 3 entries. Description states what the file DOES and HOW, not what it IS.

| File | Role | Complexity |
|------|------|------------|
| `path/file.ext` | <What the file does: "Dispatches events to registered listeners using observer pattern, maintains subscriber list per event type"> | High/Medium/Low |

## 8. Design Intent Analysis (L2)

### Implementation Facts
- <Objectively observed patterns, algorithms, data structures — cite specific code>

### Inferred Design Intent
- <Why this approach was likely chosen — cite evidence from code structure, comments, naming>

### Unclear Intent Areas
- `[intent-unclear]` `<code region>`: <What question remains about the design rationale>

## 9. Follow-Up Items

| # | Category | Description | Priority |
|---|----------|-------------|----------|
| 1 | Edge case | <unhandled scenario found during analysis> | High/Medium/Low |
| 2 | Tech debt | <architectural concern or code smell> | High/Medium/Low |
| 3 | Missing feature | <gap between apparent intent and implementation> | High/Medium/Low |

## 10. Notes & Known Issues

- <Gotchas, disabled features, performance concerns, known bugs>
```

---

## 2b. Multi-Module Overview Template

Use this template when a topic folder contains >=2 sub-module analysis documents. The Overview document connects the sub-modules and explains how they work together.

```markdown
# [Topic Name] — Overview

> Sub-module navigation and cross-module integration analysis.

## Sub-Document Navigation

| Document | Content |
|----------|---------|
| [NNN_SubModule_A_Analysis.md](./NNN_SubModule_A_Analysis.md) | <one-line summary> |
| [NNN_SubModule_B_Analysis.md](./NNN_SubModule_B_Analysis.md) | <one-line summary> |

## Cross-Module Integration

### Integration Data Flow

> Trace at least one end-to-end path showing how data/control flows ACROSS sub-modules
> at runtime. Name specific classes and functions at each boundary crossing.

`[External trigger]`
→ SubModule_A: `ClassA::entryPoint()` (`path/file.ext:line`)
→ boundary: <what data/interface crosses>
→ SubModule_B: `ClassB::receive()` (`path/file.ext:line`)
→ `[Final output/effect]`

<2-3 sentences explaining this integration path and why it matters>

### Selection Guide (if applicable)

> Include when sub-modules represent alternative approaches to the same problem.

| Scenario | Recommended Sub-Module | Rationale | Tradeoffs |
|----------|----------------------|-----------|-----------|
| <scenario> | <SubModule_A or B> | <why> | <what you give up> |

### Shared Lifecycle (if applicable)

> Include when sub-modules share runtime resources.

- **Initialization order**: <which module initializes first, what shared state is created>
- **Shared resources**: <memory arenas, update loops, global registries>
- **Teardown sequence**: <reverse order, cleanup responsibilities>

### Limitation Callouts

> Surface P0-level limitations from sub-module analyses that affect cross-module usage.

| Limitation | Source | Impact | Reference |
|-----------|--------|--------|-----------|
| <description> | <SubModule + section> | <who/what is affected> | <link to sub-module section> |

## Related Documents

- <links to upstream/downstream analysis docs>
```


