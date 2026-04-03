# Analysis Document Templates

## 0. Template Selection Guide

Load only the subsection you need for the current phase. Gate checklists live in `workflow.md`. Ready-to-paste chat prompts live in `prompt-templates.md`.

| Current task | Template to load | Section | Notes |
|--------------|------------------|---------|-------|
| Build shared module context | Module Context Packet | §1.5 | Includes the Coverage Ledger |
| Collect same-module evidence | Evidence Packet | §1.6 | Evidence-only; no final prose |
| Finalize one structural module document | Per-Module Analysis | §2 | One target document per pass |
| Finalize a multi-doc folder overview | Multi-Module Overview | §2b | Use after sibling docs stabilize |
| Finalize one feature document | Feature Cross-Module Analysis | §2c | Use after structural docs close |

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

## 1.5. Module Context Packet Template

Use this template BEFORE drafting any module that will split across multiple documents or contains >=2 independent subsystems. This is a working artifact, not a deliverable document.

```markdown
# [Module Name] — Context Packet

## 0. Directory Scan

| Path | File Count | Notes |
|------|------------|-------|
| `path/` | N | <subtree purpose> |

## 1. Subsystem Inventory

| Subsystem | Source Roots | Shared Anchors | Planned Owner Doc |
|-----------|--------------|----------------|-------------------|
| <name> | `path/a`, `path/b` | <BattleWorld / GameManager / etc.> | `<doc>.md` |

## 2. Partial Class / Split File Map

| Class | Files | Why split matters |
|-------|-------|-------------------|
| `ClassName` | `a.cs`, `b.cs`, `c.cs` | <shared lifecycle / cross-cutting logic> |

## 3. Shared Anchors / Ownership

| Anchor | Source Files | Owner Doc | Referencing Docs | Reason |
|--------|--------------|-----------|------------------|--------|
| <anchor> | `path/file.ext` | `<doc>.md` | `<doc>.md`, `<doc>.md` | <why this anchor is centralized> |

## 4. Hotspot Files

| File | Why it is a hotspot | Affected Docs |
|------|---------------------|---------------|
| `path/file.ext` | <shared large file / state machine / orchestrator> | `<doc>.md`, `<doc>.md` |

## 5. Candidate Document Split

| Document | Scope | Source Ownership | Shared Dependencies |
|----------|-------|------------------|---------------------|
| `<doc>.md` | <subsystem scope> | `path/a`, `path/b` | <anchors owned elsewhere> |

## 6. Coverage Ledger

| Subsystem | Trace ID | Named Classes/Functions | Owner Doc | Key Files | Status |
|-----------|----------|-------------------------|-----------|-----------|--------|
| <name> | `T-01` | `ClassA::method()`, `ClassB::method()` | `<doc>.md` | `a.cs`, `b.cs` | `todo` |
```

---

## 1.6. Evidence Packet Template

Use this template for same-module subagents. It intentionally forbids final prose and only returns structured evidence for the module owner to reconcile.

```markdown
# [Module Name] — Evidence Packet

**Scope:** <subsystem / file set>
**Files Read:**
- `path/file.ext`
- `path/file.ext`

## 1. Trace Inventory

| Trace ID | Entry | Exit | Named Classes/Functions | Notes |
|----------|-------|------|-------------------------|-------|
| `T-01` | `ClassA::method()` | `ClassB::method()` | `ClassA::method()`, `ClassB::method()` | <edge case / branch> |

## 2. Required L3 Entries

| Class | Path | Why it must appear in L3 |
|-------|------|--------------------------|
| `ClassName` | `path/file.ext` | <named in trace / owns state> |

## 3. Key Files Candidates

| File | Role |
|------|------|
| `path/file.ext` | <what this file contributes> |

## 4. Cross-Doc Hotspots

| Anchor | Why it crosses document boundaries | Suggested Owner Doc |
|--------|-----------------------------------|---------------------|
| <anchor> | <shared orchestrator / partial class> | `<doc>.md` |

## 5. Unresolved Questions / Blockers

- <missing edge case>
- <unclear ownership>
```

---

## 2. Per-Module Analysis Document Template

Use this template to finalize ONE document per pass. If a module spans multiple sibling documents, first complete the Module Context Packet and Coverage Ledger, then pick a single target document for this template.

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

## 1.5 Shared Anchors / Cross-Doc Ownership

> **When to include**: Required when the module is split across >=2 documents or contains shared orchestrators, partial classes, or hotspot files that multiple sibling docs reference.

| Anchor | Source files | Owner doc | Referencing docs | Why this anchor is centralized |
|--------|--------------|-----------|------------------|--------------------------------|
| <anchor> | `path/file.ext` | `<doc>.md` | `<doc>.md`, `<doc>.md` | <reason> |

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
> Before writing Section 3, confirm the target document and owning anchors are already fixed in the Module Context Packet.

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

## 3.X Module-Specific Concerns (L2)

> **When to include**: Use when the module contains important content that doesn't fit standard subsystem data flow traces. Examples:
> - **Configuration schemas / data tables**: field semantics, value mappings, config-driven behavior branching
> - **Threading / concurrency model**: thread ownership, synchronization strategy, async patterns
> - **Protocol / serialization**: message structure, field semantics, version compatibility
> - **Rule / strategy engines**: condition trees, priority matrices, matching rules
> - **Editor / tooling extensions**: Inspector customizations, ScriptableObject schemas, menu integrations
>
> Each subsection is free-form but MUST name specific classes and file paths (Hard Rules 2, 5).
> Classes named here MUST appear in §6 (L3) and files in §7 (Key Files) — the coverage chain still applies.
> Skip this section if all module content fits naturally into §3 subsystem traces.

### [Topic Name]
<free-form analysis with explicit class/file references>

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

## 6. Class Responsibility Index (L3)

> Coverage chain: every class named in Section 3 data flow traces MUST have an entry here.
> L3 is a compact lookup index, NOT a member reference manual. Readers use IDE for signatures.

| Class | Path | Responsibility |
|-------|------|----------------|
| `ClassName` | `path/file.ext` | <One sentence: what this class does and why it exists> |
| `ClassName2` | `path/file.ext` | <One sentence> |

## 7. Key Files Table (L3)

> **Exhaustive**: scan the module directory — every source file must appear here.
> Important files get a role description. Supporting/utility files can be grouped in compact rows.

| File | Role |
|------|------|
| `path/file.ext` | <What the file does: "Dispatches events to registered listeners using observer pattern"> |
| `path/other.ext` | <role description> |
| **Supporting files** | `UtilA.cs`, `UtilB.cs`, `HelperC.cs` — <grouped one-line description> |

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

---

## 2c. Feature Module Cross-Module Analysis Template

Use this template for feature-level cross-module analysis documents. Feature modules trace interactions across multiple structural modules, so dimensional coverage (user action paths, network messages, events, state machines, cross-layer bridges) is critical.

```markdown
# [FeatureName] — 跨模块分析

**游戏**：<项目名>
**优先级**：<P0/P1/P2>

---

## §0 子系统盘点表

> 列出 feature 涉及的所有程序集/子域。**展开到二级子目录**，每个子管理器单独列出。
> 此表锚定后续覆盖链——每个列出的子系统必须在 §3 至少出现一次。

| 程序集 / 子域 | 构成位置（规模约） | 子系统明细 | 说明 |
|---|---|---|---|

---

## §1 功能概览 (L1)

> feature 的用户可见功能、主流程入口、参与的结构模块。**≥3 句**。

---

## §2 图表

> P0 feature ≥2 图，P1 ≥1 图。每图必须有 walkthrough（≥2 句，命名 ≥3 组件，描述数据流方向，指出非显而易见的架构决策）。

### 2.1 [图表标题]

[图表]

**Diagram walkthrough:** <...>

---

## §3 跨模块数据流 (L2)

> **穷举原则**：交互路径的数量由代码决定，不由配额决定。扫描 feature 的源码工件
> （子目录、MsgHandler、EventArgs 定义文件、状态机、桥接接口消费方）发现所有交互路径，
> 每条路径各写一个子节。有 10 条就写 10 条，有 20 条就写 20 条。
> 每节包含完整的函数级调用链（`Class::method()` + `path:line`）。

### 3.1 [主交互路径] — 用户操作 → UI → Logic → 结果

**Data Flow:**
`[用户操作]` → `ClassA::methodA()` (`path/file.ext:line`) → ... → `[结果]`

**源码锚点：**

| 步骤 | 类::方法 | 文件:行 |
|---|---|---|

### 3.2 [网络消息路径] — Server → Handler → Manager → Event → UI

> 覆盖 feature 对应 MsgHandler 中的所有 Handler。

### 3.3 [事件驱动路径] — Publisher → EventManager → Subscribers

> 覆盖 feature 定义的所有 EventArgs 的发布与订阅链路。

### 3.4 [生命周期/状态机路径] — 状态列表与转换条件

> 如有状态机，列出所有状态及转换条件。

### 3.5 [跨层桥接路径] — Interface 注册方与全部消费方

> 如有跨程序集接口（如 ICityLogicWrapper），列出注册流程和所有消费方。

---

## §4 模块交互表

> **按交互类型分组**。

### 直接调用

| 源 | 目标 | 交互说明 |
|---|---|---|

### 接口桥接

| 源 | 桥接接口 | 目标 | 交互说明 |
|---|---|---|---|

### 事件驱动

| 发布者 | 事件类型 | 主要订阅者 | 说明 |
|---|---|---|---|

### 网络消息

| 消息类型 | Handler | 目标 Manager 方法 | 触发事件 |
|---|---|---|---|

---

## §5 事件清单

> 列出 feature 定义或消费的**所有**事件类型。以 feature 的 EventArgs 定义文件为锚点，确保无遗漏。

| 事件类型 | 发布者 | 主要订阅者 | 触发场景 |
|---|---|---|---|

---

## §6 网络消息清单（如适用）

> 以 feature 对应的 MsgHandler 文件为锚点，列出所有 Handler。

| Handler | 消息类型 | 目标方法 | 说明 |
|---|---|---|---|

---

## §7 功能特有模式

> 仅在该 feature 层面才出现的架构模式（如双栈切换、跨程序集桥接等）。

---

## §8 类职责索引 (L3)

> Coverage chain: §3/§4 中命名的每个类必须有条目。紧凑索引，不输出成员表。

| 类 (Class) | 路径 (Path) | 职责 (Responsibility) |
|---|---|---|

---

## §9 关键文件表

> **穷举**：扫描 feature 涉及的目录，每个源文件都必须出现。重要文件单独描述，支撑文件可分组列出。

| 文件路径 (Path) | 所含 L3 类 / 说明 |
|---|---|

---

## §10 设计意图分析

### 实现事实（Implementation facts）
- <客观观察到的模式、算法、数据结构——引用具体代码>

### 推断意图（Inferred intent）
- <为什么可能选择这种方案——引用代码结构、注释、命名的证据>

### 意图不明 / 待核实
- `[intent-unclear]` `<代码区域>`: <关于设计理由的遗留问题>

---

## §11 后续事项

| # | 类别 | 描述 | 优先级 |
|---|---|---|---|
```


