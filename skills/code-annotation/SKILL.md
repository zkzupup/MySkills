---
name: code-annotation
description: >-
  Generate high-quality, code-aware annotations for source files by reading and
  understanding the actual code. Covers Python, C++ (.h/.cpp), and extensible to
  other languages. Includes quality gates, calibration protocol, batch strategy,
  and anti-pattern detection. Use when asked to annotate code, add comments, 
  review annotation quality, document source files, or generate code documentation.
---

# Code Annotation Skill

## 1. Annotation Philosophy -- "Read, Understand, Then Annotate"

- MUST read the **full source code** of each file before writing any annotation.
- Never infer annotation content from class/function names, file paths, or directory structure alone.
- The annotation should contain information that is **NOT obvious** from reading the code: the "why", domain context, design constraints, cross-module relationships, specific constant values, algorithm names.
- Annotations are **comment-only changes** -- never modify code logic.

## 2. Quality Gates -- Forbidden Anti-Patterns

| Anti-Pattern | Description | Example |
|---|---|---|
| **Name-echo** | Restates the identifier name in natural language | "UserManager: manages users" |
| **Hollow abstraction** | Vague umbrella terms instead of concrete details | "core logic", "related business", "relevant functionality" |
| **Signature parrot** | Repeats the function signature as the comment body | "init(config): initializes with config" |
| **Placeholder stub** | Filler text with no information | "see implementation", "details in code" |
| **Context-free** | Could apply to any file in any project | Lacks specific constants, enum values, algorithm names |

**Detection rule**: If you can swap the annotation between two unrelated files and it still "makes sense", the annotation is **BAD**.

For concrete GOOD vs BAD examples, see [examples.md](examples.md).

## 3. Calibration Protocol

Prevents quality drift during long annotation sessions:

1. **Before starting**: Read 2-3 files in the project that already have GOOD annotations as a quality baseline. If none exist, use the examples in [examples.md](examples.md).
2. **Every 20 files**: Re-read one GOOD reference file to recalibrate.
3. **Subagent batches**: Each subagent independently reads the reference files before starting its batch.
4. **Blind check** (end of each batch): Read 3 annotations WITHOUT looking at the source code. Can you understand what the module does, its key APIs, and its dependencies? If not, the annotations need rework.

## 4. Language-Specific Templates

Full templates with all sections are in [templates.md](templates.md). Summary:

### Python files
- `# -*- encoding: utf-8 -*-` MUST be line 1
- Triple-quote docstring immediately after, with sections: 文件作用, 核心类/函数, 继承链 (if >= 3 levels), 上游依赖, 下游使用者, 重要备注

### C++ `.h` files -- "What & Interface"
- Block comment (`/** ... */`) BEFORE `#pragma once` / `#include`
- This is the module's **complete manual**: full 文件作用, 核心类/函数, 继承链, 上游依赖, 下游使用者, 线程安全, 重要备注
- A developer should understand the module's purpose and boundaries by reading ONLY the `.h` annotation

### C++ `.cpp` files -- "How & Implementation"
- Brief block comment with 实现概述 (one sentence) + optional 关键实现细节
- Do NOT repeat content from the `.h` annotation
- Detailed explanations go in **inline function comments**

### Other languages (Java, Lua, Go, etc.)
- Adapt the Python template structure to the language's comment syntax
- Keep the same section names and quality requirements

## 5. Inline Comment Strategy

### What to skip
- Simple getters/setters
- Constructors (unless complex initialization)
- Event forwarding, trivial delegation

### What to comment
- Complex logic, math formulas, non-obvious algorithms
- Business rules not evident from code structure
- Magic numbers and hard-coded thresholds
- Coordinate transforms, unit conversions
- Cross-module interaction points

### Format conventions
| Type | Format | Example |
|---|---|---|
| Algorithm steps | `# Step N: ...` | `# Step 1: Clear all grid data` |
| Conditional branches | `# Scenario: ...` | `# Scenario: fallback when not in match` |
| Magic constants | `# <value>: <meaning>` | `# 4: filter players within 4m of ball` |
| Dual-buffer vars | `// --- <name> dual-buffer ---` | `// --- intercept position dual-buffer ---` |

## 6. Batch Strategy for Large Codebases

### "First-full + subsequent-simplified"
For groups of structurally similar files (e.g., UI templates, rule implementations, task subclasses):
1. **First file**: Full annotation with every section populated
2. **Subsequent files**: Focus on what's DIFFERENT from the first file. Reference the first file for common sections: "Same pattern as <first_file>, differences below:"

### Parallel subagent batching
- ~25 files per subagent, each reads full source
- Each subagent receives: the annotation templates, 2-3 GOOD reference files, the anti-pattern list
- Verification: spot-check 10 files per batch against calibration reference

### Incremental progress tracking
- Maintain a checklist of annotated files (can be in the project's index document)
- Resume across conversations by reading the checklist first

## 7. Self-Validation Checklist

Run after each file:

- [ ] Annotation is comment-only (no code logic changed)
- [ ] Language-specific rules followed (encoding line, pragma placement, etc.)
- [ ] No content duplication between `.h` and `.cpp`
- [ ] Inheritance chains >= 3 levels include ASCII diagram
- [ ] Domain-specific values cited with actual numbers (constants, enums, thresholds)
- [ ] Passes the "swap test" -- annotation is NOT interchangeable with another file's
- [ ] 核心类/函数 entries describe **behavior**, not just restate names

## 8. Additional Resources

- [templates.md](templates.md) -- Full annotation templates for each language, terminology glossary framework, special scenario rules
- [examples.md](examples.md) -- Side-by-side GOOD vs BAD examples for each anti-pattern
