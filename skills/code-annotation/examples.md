# Annotation Examples: GOOD vs BAD

Each example demonstrates a specific anti-pattern and its corrected version.

---

## Anti-Pattern 1: Name-Echo

### BAD
```cpp
/**
 * 【文件作用】
 * 定义 TeamTaskInfoManager 类，实现团队任务信息管理相关功能。
 *
 * 【核心类/函数】
 * - TeamTaskInfoManager: 团队任务信息管理器
 */
```
**Why it's bad**: Every word in the annotation is already in the class name. Zero new information.

### GOOD
```cpp
/**
 * 【文件作用】
 * 团队任务分配引擎：收集多个 TeamTask 的评分提交，通过稳定排序
 * (priority > score > team_task_id > player_index) 执行贪心分配算法，
 * 每人最终获得一个任务，受 sub_task_limit 约束。仅对 dirty/新增
 * 的分配调用 PlayerAgent 推送变更。
 *
 * 【核心类/函数】
 * - TeamTaskInfoManager: 维护操作队列 (vector<OperationInfo>),
 *   每帧 flush 时排序+分配+增量推送到 PlayerAgent
 */
```

---

## Anti-Pattern 2: Hollow Abstraction

### BAD
```python
"""
【文件作用】
封装与驱动器相关的核心业务逻辑。

【核心类/函数】
- Driver: 核心驱动类，封装与名称相关的业务逻辑
- SimpleDriver: 简化驱动类
- DummyDriver: 虚拟驱动类
"""
```
**Why it's bad**: "核心业务逻辑" and "与名称相关的业务逻辑" are hollow -- they apply to any class in any project.

### GOOD
```python
"""
【文件作用】
Messiah 引擎实体驱动层封装：为游戏实体提供 Skeleton（动画骨骼）、
CharCtrl（胶囊体物理控制器）、Navigator（寻路）、Filter（网络位置
滤波器）、PoseSender（位置上传）五大组件的创建/释放/状态管理。

核心设计：
1. 五组件优先级链: CharCtrl > Navigator > PoseSender > Filter > Actor
2. 所有可选组件初始值为 SWALLOW（空对象哨兵），调用任意方法无副作用
3. release() 后 entity 替换为 DummyDriver（Null-Object 模式）

【核心类/函数】
- Driver: 完整驱动器，管理五大引擎组件的生命周期和交互
  - createCharCtrl(): 创建胶囊体碰撞控制器，默认 MaxSlope=0.5rad
  - moveToWithRadius(): 寻路+卡死检测（位移增量为0时触发回调）
- SimpleDriver: 轻量驱动器，仅 Skeleton + Transform，用于导弹等简单实体
- DummyDriver: Null-Object，__getattr__/__call__ 返回 self，
  getPosition() 返回 (10000,0,10000) 哨兵坐标
"""
```

---

## Anti-Pattern 3: Signature Parrot

### BAD
```python
def calculate_score(player, ball_pos, target_pos):
    # calculate_score: 计算分数，参数为 player, ball_pos, target_pos
```
**Why it's bad**: The comment adds nothing beyond what the signature already shows.

### GOOD
```python
def calculate_score(player, ball_pos, target_pos):
    # 传球可行性评分 = 距离衰减(0~1) * 角度奖励(0~1.5) * 防守压力惩罚(0.3~1)
    # 返回值范围 [0, 1.5]，阈值 0.4 以下表示传球不可行
```

---

## Anti-Pattern 4: Placeholder Stub

### BAD
```cpp
/**
 * 【实现概述】
 * 实现 ai_const.cpp 的相关逻辑，细节见正文。
 */
```
**Why it's bad**: "细节见正文" is a placeholder that provides zero guidance.

### GOOD
```cpp
/**
 * 【实现概述】
 * 实现 HRInfo 结构体的构造函数和帧同步属性注册（z_id, x_id）。
 */
```

---

## Anti-Pattern 5: Context-Free

### BAD
```python
"""
【文件作用】
提供类型、常量或系统 API 的定义。

【核心类/函数】
- Constants: 定义系统常量
"""
```
**Why it's bad**: This annotation could describe ANY constants file in ANY project. No specific values mentioned.

### GOOD
```python
"""
【文件作用】
AI 系统全局常量定义。包含三个命名空间:
1. fix_ai_const: 场地参数 (FIELD_SCALE = 68m x 105m)、
   HR 网格 (5x6 = 30 个 Home Region)、并行 tick 顺序枚举
2. fix_home_region: HRInfo 结构体 (z_id, x_id 标识一个网格)
3. fix_ai: SubTask UID 枚举 (0~88)、防守类型、调试索引

【核心类/函数】
- ParallelTickOrder: C++ 并行 tick 执行顺序 (DEFAULT=0 .. AI_PITCH=4)
- FormationPosition: 16 种阵型位置 (GK, CB, LB, RB, ... ST)
- ESubTaskUid: uint8_t, 0~88 的 SubTask 唯一标识 (max=255)
"""
```

---

## Summary: The Swap Test

For any annotation you write, ask:

> "Could I paste this annotation on a completely different file and have it still make sense?"

- If **yes** -> the annotation is BAD (context-free, hollow, or name-echo)
- If **no** -> the annotation is specific enough to be useful

Good annotations are "glued" to their file by citing **specific names, values, algorithms, relationships, and behaviors** that only exist in that file.
