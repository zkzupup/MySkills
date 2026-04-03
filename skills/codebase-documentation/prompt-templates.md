# Prompt Templates

Ready-to-paste prompts for `codebase-documentation`. Each prompt specifies WHAT to do; the skill's own rules govern HOW.

**Usage**: Replace `<placeholders>`, paste into chat. One template per run.

---

## 1. 模块建模

Build Module Context Packet and Coverage Ledger before any prose.

```text
请使用 codebase-documentation，对 <模块名> 做模块建模。只输出 Context Packet 和 Coverage Ledger，不写正式文档正文。

- 模块名：<模块名>                       （例：UnityFramework-UI）
- 源码根目录：<源码路径>                   （例：Assets/Scripts/Framework/Unity/UI/）
- MasterIndex：Document/MasterIndex.md
- 文档目录：<文档目录或"由你建议">          （例：Document/020-UnityFramework/）

输出：Context Packet（含目录扫描、子系统清单、partial class 分布、shared anchors、热点文件）、初版 Coverage Ledger、候选文档切分方案、推荐的首篇 target document 及原因。
```

---

## 2. 单文档定稿

Finalize exactly one document. Context Packet must exist or be built first.

```text
请使用 codebase-documentation，只定稿 1 篇文档。

- 模块名：<模块名>
- 当前目标文档：<文档名>                   （例：024_UI_Analysis.md）
- 源码根目录：<源码路径>
- 文档目录：<文档目录>
- Context Packet：<路径或"如不存在则先补建">

如证据不足，先补取证，不要用抽象总结收尾。完成后显式输出所有适用 CHECKPOINT 的 PASS/FAIL。
```

---

## 3. 模块复核

Module-level closure check after sibling docs exist.

```text
请使用 codebase-documentation，对 <模块名> 做模块级复核。

- 模块名：<模块名>
- 文档目录：<文档目录>
- 源码根目录：<源码路径>
- Context Packet：<路径>
- 复核模式：<audit-only 或 fix-small-gaps>

输出：所有适用 CHECKPOINT 的 PASS/FAIL 汇总、findings 列表（按严重性排序）、hotspot spot-check 记录、建议修复顺序。audit-only 模式不写新正文；fix-small-gaps 只补机械性缺口（缺失的 L3 条目、Key Files 条目等）。
```

---

## 4. 单对话整模块串行完成

Full module in one conversation: modeling → evidence → serial finalization → review.

```text
请使用 codebase-documentation，在一个对话中完成 <模块名> 的整模块分析。除非遇到真正阻塞，否则不要在中途停下来等待我确认。

- 模块名：<模块名>                       （例：TuyooGame-NewCity）
- MasterIndex：Document/MasterIndex.md
- 允许 evidence-only subagents
- 最大 same-module evidence fan-out：<默认 2>

流程：
1. 先建立 Context Packet + Coverage Ledger + 文档切分方案
2. 如需 subagent，只允许 evidence-only，只返回 Evidence Packet，不返回最终 prose
3. 按推荐顺序一次只定稿 1 篇，每篇完成后必须通过并显式输出 CHECKPOINT B + C，如果任何 checkpoint 失败，停止扩写，先补证据，不要用高层概括收尾。
4. 切换到下一篇前：刷新 Coverage Ledger 状态，为新文档范围重新收集 Evidence Packet，更新 Context Packet 中的 shared anchor ownership
5. 全部 sibling docs 完成后执行模块复核，输出 CHECKPOINT M 的 PASS/FAIL
6. 只有模块级 gate 通过后才标记完成
```

---

## 5. Evidence Packet subagent prompt

Give this to a same-module subagent. It returns structured evidence only, never final prose.

```text
你是一个 evidence-only subagent。请对以下范围做深度探索，只返回 Evidence Packet，不写最终文档正文。

- 模块名：<模块名>
- 探索范围：<子系统名或文件集>              （例：CityQueue 子系统，含 Manager/CityQueue/ 目录）
- 源码路径：<具体路径>                     （例：Assets/Scripts/GameLogic/Runtime/Game/Modules/NewCity/Manager/CityQueue/）
- 关注点：<需要重点探索的方面>              （例：队列初始化数据流、与 EventManager 的事件发布链、TbCityWorkQueue 配置表消费方式）

输出格式严格按以下结构：

1. **Trace Inventory**：每条 trace 含 entry → exit → named classes/functions → notes
2. **Required L3 Entries**：所有在 trace 中被点名的类，含路径和原因
3. **Key Files Candidates**：范围内所有源文件，含 role 描述
4. **Cross-Doc Hotspots**：跨文档边界的 anchor，含建议 owner doc
5. **Unresolved Questions**：证据不足或权属不明的问题

禁止：不要写 L2 最终 prose、不要写 diagram walkthrough、不要写设计意图分析。只返回结构化证据。
```

---

## 6. Feature Module 跨模块分析

Feature-level cross-module analysis. Structural modules must be closed first.

```text
请使用 codebase-documentation，对 <Feature 名> 做跨模块分析，按 templates.md §2c 输出。

- Feature 名：<Feature 名>               （例：City 城建）
- 主结构模块：<Feature 主要所在的结构模块>    （例：TuyooGame-NewCity）
- 源码根目录：<Feature 主目录>              （例：Assets/Scripts/GameLogic/Runtime/Game/Modules/NewCity/）
- 文档目录：<文档目录>                     （例：Document/060-TuyooGame/）
- 关联的 MsgHandler：<路径或"无">           （例：Assets/Scripts/GameLogic/Runtime/Game/NetHandler/CityMsgHandler.cs）
- 关联的 EventArgs：<路径或"自动扫描">       （例：Assets/Scripts/GameLogic/Runtime/Game/Modules/NewCity/EventArgs/CityEventArgs.cs）

穷举要求：扫描上述 MsgHandler 和 EventArgs 文件，确保每个 Handler 和每个 EventArgs 类型都在文档中有对应条目。完成后输出 CHECKPOINT F 的 PASS/FAIL。
```

---

## Quick Selection

| Goal                       | Template                     |
| -------------------------- | ---------------------------- |
| 先建模，弄清楚怎么拆文档   | §1 模块建模                 |
| 只把一篇文档写深写透       | §2 单文档定稿               |
| 检查模块是否真正闭合       | §3 模块复核                 |
| 一个对话从建模到模块闭合   | §4 单对话整模块串行完成     |
| 给 subagent 收集结构化证据 | §5 Evidence Packet subagent |
| Feature 跨模块分析         | §6 Feature Module           |
