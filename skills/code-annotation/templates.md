# Annotation Templates

## 1. Python File Header Template

```python
# -*- encoding: utf-8 -*-
"""
================================================================================
文件: <filename>.py
路径: <relative path from project root>
模块: <subsystem> (e.g.: AI.Task.TeamTasks / Network.RPC / UI.Battle)
================================================================================

【文件作用】
<Detailed description of the file's functionality, its role in the system,
design decisions, and key characteristics.>

【核心类/函数】
- <ClassName>: <Concrete behavioral description -- NOT just restating the name>
- <function_name>: <What it computes/manages, key parameters, return semantics>

【继承链】(only when inheritance depth >= 3)
<ASCII diagram>
Example:
    BaseTask
      └── TeamTask
            └── CornerKickTask  ← this file

【上游依赖】 (who does this file depend on)
- <module/file>: <why -- what it imports/uses>

【下游使用者】 (who depends on this file)
- <module/file>: <how -- what they call/reference>

【重要备注】
- <Any non-obvious constraints, known issues, performance notes, disabled features>
================================================================================
"""
```

### Rules
- `# -*- encoding: utf-8 -*-` MUST be the very first line of the file
- Docstring immediately follows the encoding line
- Do NOT include a 【关联文档】 section
- Simple 2-level inheritance (e.g., IdleTask -> BaseTeamTask) can be described in text within 【文件作用】 instead of ASCII diagram
- 【难度参数】 section: add only when the file contains tunable difficulty/gameplay parameters

---

## 2. C++ `.h` File Header Template

The `.h` file is the "What & Interface" -- the complete manual for the module.

```cpp
/**
 * ================================================================================
 * 文件: <filename>.h
 * 路径: <relative path>
 * 模块: <subsystem>
 * ================================================================================
 *
 * 【文件作用】
 * <Complete functional description, design philosophy, key features.
 *  Include specific constant values, enum ranges, data structure sizes
 *  where relevant.>
 *
 * 【核心类/函数】
 * - <ClassName>: <Behavioral description with specifics>
 * - <FunctionName>: <What it does, key parameters, return type semantics>
 *
 * 【继承链】(only when inheritance depth >= 3)
 * <ASCII diagram>
 *
 * 【在系统中的位置】
 * <Layer description, update frequency, sync strategy if applicable>
 *
 * 【上游依赖】
 * - <file>: <why>
 *
 * 【下游使用者】
 * - <file>: <how>
 *
 * 【线程安全】 (if applicable)
 * - <Access patterns in parallel/concurrent contexts>
 *
 * 【重要备注】
 * - <Constraints, known issues, performance characteristics>
 * ================================================================================
 */
```

### Rules
- Block comment goes BEFORE `#pragma once` and `#include` directives
- This is the module's full description -- a developer reads ONLY this to understand the module
- 【难度参数】 section: add when the file exposes tunable gameplay parameters

---

## 3. C++ `.cpp` File Header Template

The `.cpp` file is the "How & Implementation" -- brief header, detail in inline comments.

```cpp
/**
 * ================================================================================
 * 文件: <filename>.cpp
 * 模块: <subsystem>
 * 对应头文件: <filename>.h
 * ================================================================================
 *
 * 【实现概述】
 * <One sentence: what this file implements>
 *
 * 【关键实现细节】(only when needed)
 * - <Coordinate transform formulas, algorithm flow overview, performance notes>
 * ================================================================================
 */
```

### Rules
- Do NOT repeat content already in the `.h` file (文件作用, 上游依赖, 下游使用者, etc.)
- Most implementation detail goes in **function-level inline comments**
- 【关键实现细节】 only for cross-cutting concerns (coordinate systems, thread safety constraints, special algorithms)

---

## 4. "Simplified Version" Template (for homogeneous file groups)

When annotating the 2nd+ file in a group of structurally similar files:

```python
# -*- encoding: utf-8 -*-
"""
================================================================================
文件: <filename>.py
路径: <path>
模块: <subsystem>
================================================================================

【文件作用】
<同类文件模式: 参见 <first_file_in_group>.py 的完整说明>
本文件的差异点:
- <What makes THIS file different from the canonical first file>
- <Unique parameters, thresholds, behavior variations>

【核心类/函数】
- <ClassName>: <Focus on what's DIFFERENT from the base pattern>

【上游依赖】
同 <first_file>.py，额外依赖:
- <any additional dependencies unique to this file>

【重要备注】
- <Anything unique to this specific file>
================================================================================
"""
```

### When to use
- Influence map files sharing the same base class pattern
- Task subclasses (TeamTask, SubTask, Rule implementations)
- UI template files with identical structure
- RPC handler files following the same request/response pattern

---

## 5. Terminology Glossary Framework

Create a project-specific glossary mapping domain terms to their usage convention.
Fill this in at project start; reference it throughout annotation work.

| Original Term | Convention | Notes |
|---|---|---|
| *(example)* tick | Keep English | Frame update call |
| *(example)* 帧同步 | Use Chinese | Frame Sync |
| *(example)* Blackboard | Keep English | AI shared data store |
| *(example)* getter/setter | Keep English | Accessor methods |

**General rule**: Technical API names, design pattern names, and library-specific terms stay in their original language. Domain concepts use the project's primary language.

---

## 6. Special Scenario Rules

### 6a. Inheritance chain display
- Depth >= 3: Add 【继承链】 section with ASCII tree diagram
- Depth = 2: Describe in text within 【文件作用】
- Cross-language inheritance (e.g., Python -> C++ binding -> C++): MUST show full chain

### 6b. Dual-buffer / sync variables
Group related variables with a block comment:
```cpp
// --- <feature name> dual-buffer ---
// m_cpp_xxx: Written by C++ thread (updated in do_tick)
// m_py_xxx:  Read by Python thread (copied from cpp in on_sync_data)
```

### 6c. Scoring / influence map files
Append to 【文件作用】:
```
Score range: [min, max]
Score meaning: <what high/low values represent>
Usage: <how downstream systems consume these scores>
```

### 6d. Configuration / constant files
List actual values in 【文件作用】, not just "defines constants":
```
Contains N constants:
- FIELD_SIZE = 68m x 105m
- GRID_X_MAX = 4, GRID_Z_MAX = 5 -> 30 cells
- TICK_ORDER: DEFAULT=0, TEAM=1, REGION=2
```
