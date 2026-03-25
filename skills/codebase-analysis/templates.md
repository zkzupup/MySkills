# Analysis Document Templates

## 1. Master Index Document Template

The master index is the single-source-of-truth navigation hub for the entire project analysis.

```markdown
# [Project Name] Analysis Master Index

> Global navigation index for all analysis documents, diagrams, and source annotations.
>
> Legend: [done] Completed | [partial] Partial | [todo] Todo | [skip] Excluded

---

## 1. Analysis Documents

### 1.1 [Subsystem A] Documents

| # | Document | Path | Status |
|---|----------|------|--------|
| 1 | [Title] | [link](path/to/doc.md) | [done] |

### 1.2 [Subsystem B] Documents
...

---

## 2. Diagrams

### 2.1 Architecture Diagrams

| # | Diagram | Path | Status |
|---|---------|------|--------|
| 1 | [Title] | [link](path/to/diagram.png) | [done] |

---

## 3. Annotated Source Index

### 3.1 Completed Annotations

| # | Module | Directory | File Count | Coverage | Language |
|---|--------|-----------|------------|----------|----------|
| 1 | [Name] | `path/` | N | 100% | C++ |

**Total**: X files annotated

---

## 4. Excluded Modules

| Module | Directory | File Count | Reason |
|--------|-----------|------------|--------|
| [Name] | `path/` | N | Third-party library / Generated data / Backup |

---

## 5. Project Directory Tree

(annotated tree structure here)

---

## 6. Reference Standards

- Analysis depth reference: [link]
- Annotation template: [link]
```

---

## 2. Per-Module Analysis Document Template

```markdown
# [Module Name] Analysis

## 1. Module Overview

- **Purpose**: <One-paragraph description>
- **Design Patterns**: <Observer, Factory, State Machine, etc.>
- **Language / Tech Stack**: <C++17, Python 3.x, etc.>
- **File Count**: N files
- **Key Entry Points**: <main classes or functions that external callers use>

## 2. Architecture Diagram

![Architecture](path/to/diagram.png)

<Or textual description if no diagram available>

## 3. Core Logic Breakdown

### 3.1 [Subsystem / Feature A]

<Detailed explanation of data flow, algorithms, key interfaces>

### 3.2 [Subsystem / Feature B]
...

## 4. Dependency Mapping

### Upstream (this module depends on)
| Module | What it provides | Key files |
|--------|-----------------|-----------|
| [Name] | <description> | `file.h` |

### Downstream (depends on this module)
| Module | What it uses | Key files |
|--------|-------------|-----------|
| [Name] | <description> | `file.py` |

## 5. Key Files Table

| File | Role | Complexity |
|------|------|------------|
| `file.h` | <one-line description> | High/Medium/Low |

## 6. Notes & Known Issues

- <Any gotchas, technical debt, disabled features, performance concerns>
```

---

## 3. Priority Matrix Template

```markdown
## Module Priority Matrix

| Priority | Module | Directory | Files | Reason |
|----------|--------|-----------|-------|--------|
| P0 | [Core module] | `path/` | N | Core business logic |
| P1 | [Support module] | `path/` | N | Supporting system |
| P2 | [Infra module] | `path/` | N | Infrastructure |
| P3 | [UI module] | `path/` | N | Templated UI |
| SKIP | [Third-party] | `path/` | N | External library |
```

---

## 4. Progress Tracking Table

Embed in the master index for cross-conversation continuity:

```markdown
## Progress Tracking

| Phase | Module | Status | Files Done | Files Total | Last Updated | Notes |
|-------|--------|--------|------------|-------------|--------------|-------|
| 3 | AI System | [done] | 422 | 422 | 2025-01-15 | Reference quality |
| 4 | Animation | [partial] | 300 | 467 | 2025-01-16 | Batch 2 in progress |
| 4 | Entities | [todo] | 0 | 270 | - | Next priority |
```
