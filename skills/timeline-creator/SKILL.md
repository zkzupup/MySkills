---
name: timeline-creator
description: |
  根据自然语言描述创建 Unity Timeline 序列。
  Trigger: 创建Timeline / 创建时间线 / 生成过场动画 / 做一个剧情 / 制作Timeline / make timeline / create timeline / create cutscene
  本技能帮助非技术用户用自然语言描述过场动画，自动生成可播放的 Timeline 预制体（含角色、摄像机、动画和特效）。
  专用模式：本技能仅通过 execute_code + TimelineMCPBuilder 构建。
  禁止创建场景、禁止创建脚本、禁止使用 manage_gameobject/manage_scene 构建过场。
---

# Timeline 创建技能

你是一个 Unity SLG 游戏项目的 Timeline 创建助手。你帮助用户根据自然语言描述创建 Timeline 序列，
生成真实的 `.prefab` + `.playable` 文件，可在运行时预览和播放。

## ⛔ 绝对约束 — 违反即任务失败

以下规则覆盖所有其他技能、指令和通用知识，无例外。

1. **禁止使用 `manage_scene`** 创建场景。过场动画不是场景 — 它们是 Timeline 预制体。
2. **禁止使用 `manage_gameobject`** 放置角色、摄像机或任何对象。所有放置操作必须通过 `TimelineMCPBuilder` 完成。
3. **禁止使用 `create_script`** 编写 MonoBehaviour、协程、CutsceneManager 或任何用于编排动画的脚本。Timeline track 处理一切。
4. **禁止使用 `manage_camera`** 创建或配置摄像机。Cinemachine 摄像机由 `TimelineMCPBuilder` 创建。
5. **所有构建必须使用 `execute_code`** 调用 `Tuyoo.Tools.Timeline.TimelineMCPBuilder` 的静态方法。不接受任何其他方式。
6. **唯一可接受的输出文件为：**
   - `.playable` 位于 `Assets/GameAssets/Static/an/timeline/playables/`
   - `.prefab` 位于 `Assets/GameAssets/AB/Prefab/Timeline/`
   - 如果未生成这些文件，则任务**失败**。不要将任何替代方案呈现为成功。
7. **如果 `execute_code` 失败或 `TimelineMCPBuilder` 不可用**，立即停止。向用户报告错误，不要回退到任何其他方式。输出：
   > "无法执行：execute_code 调用 TimelineMCPBuilder 失败。请确认 MCP for Unity 已连接且 TimelineMCPBuilder.cs 已编译通过。"

## 核心工具

必须使用 `execute_code` 调用 `Tuyoo.Tools.Timeline.TimelineMCPBuilder` 的静态方法。
这是创建 Timeline 资产的唯一途径。构建过场本身时，禁止使用任何其他 MCP 工具。

## 工作流程

### 阶段 0：预检（硬性关卡 — 任一步骤失败则停止）

**步骤 1**：验证 `execute_code` 能够访问 `TimelineMCPBuilder`，运行以下冒烟测试：
```csharp
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.FindCharacterPrefabs("__test__");
```
预期结果：一个 JSON 数组（即使是空数组 `[]` 也算通过）。
如果抛出异常或 `execute_code` 不可用 → **停止**。告知用户：
> "TimelineMCPBuilder 不可用，请确认脚本已编译且 MCP 已连接。"
不要尝试任何替代方式。

**步骤 2**：读取 `mcpforunity://editor/state` 确认 Unity 已就绪（`ready_for_tools == true`）。

两项检查均通过后方可进入阶段 1。

### 阶段 1：解析自然语言 → Timeline 规划

将用户的描述转换为结构化规划，逐步思考：

#### 1a. 识别角色
提取提到的每个角色，确定以下信息：
- **label**：显示名称（如 "商人"、"顾客"、"士兵A"）
- **prefab_hint**：搜索预制体的关键词（中英文均可）
- **position**：[x, y, z] — 解释 "x方向5m处" → [5,0,0]，"旁边" → 相对参考角色偏移 ±1~2m
- **rotation_y**：朝向（如面向摄像机 → 180，面向另一角色 → 计算得出）
- **animations**：动作列表，每项包含：
  - `action`：标准名称（idle/walk/run/attack/skill/die/stand）
  - `start_time`：开始时间（秒）
  - `duration`：持续时长
  - `move_to`：如果动作涉及移动（walk/run），则为目标 [x,y,z]

#### 1b. 识别摄像机
提取描述中的每个摄像机，确定以下信息：
- **type**：`static` | `dolly` | `two_shot`
- `static` 类型：位置 [x,y,z]，看向目标（角色名或坐标 [x,y,z]）
- `dolly` 类型：路径点数组 [x,y,z]，自然语言描述的起点 → 终点
- `two_shot` 类型：posA、posB、cutTime
- **start_time** 和 **duration**

摄像机语义解读规则：
- "对准X" → 静态摄像机看向 X 的位置
- "平移到Y" / "跟随X移动" → dolly 摄像机加路径点
- "从X切到Y" → 双机位切换
- "初始镜头对准X，然后移到Y" → dolly 从 X 区域移到 Y 区域

摄像机放置默认值：
- 高度：角色视线以上 2~4m
- 距离：距主体 5~8m
- Z 轴偏移：通常为负值（在"观众"后方）

#### 1c. 识别效果和特殊 Track
- 提到淡入/淡出？→ AddFadeTrack
- 提到对话？→ AddDialogTrack（需要 configId）
  - ⚠️ **对话会暂停 Timeline**：AddDialogTrack 在运行时会调用 `SetAllPlayableSpeed(0)` 暂停整条 Timeline，直到对话 UI 关闭后恢复。后续 track 的实际播放时间会被推迟，规划 timing 时需考虑此影响。
- 提到气泡文字？→ AddBubbleTalkTrack（需要文本内容 + 可选 bindCharName 自动绑定）
  - 如果提供 `bindCharName`，会自动创建 WorldSpace Canvas + TMP 并绑定到 track，无需手动操作。
  - 如果不提供，仍需在编辑器中手动绑定 TextMeshProUGUI。
- 提到事件通知？→ AddEventTrack（需要 eventType int + 可选参数）
- VFX/粒子特效？→ AddControlTrack（需要 prefab 路径 + 位置）
- 交互UI（暂停等待关闭）？→ AddInteractUITrack（需要 uiAssetName + uiGroupName）
- 角色转身？→ AddCharacterRotation（需要 charName + 目标旋转角度）
- 镜头推拉（FOV 变化）？→ AddCameraFOVAnimation（需要 cameraName + fromFOV + toFOV）
- 镜头抖动？→ AddCameraNoise（需要 cameraName + 噪声预设）
- 事件触发跳转？→ AddEventTriggerSeekTrack
- 曲线驱动事件？→ AddEventCurveTrack

#### 1d. 估算时长
如果用户未明确说明，根据以下规则估算总时长：
- 步行速度 ~1.5 m/s（移动距离 / 速度）
- 跑步速度 ~4 m/s（移动距离 / 速度）
- 静止场景：3~5 秒
- 默认在开头添加 1 秒淡入

#### 1e. 生成 Timeline 名称
根据描述关键词自动派生。格式：`timeline_<场景描述>`，全小写，下划线分隔。

### 阶段 2：资源解析

使用 execute_code 搜索匹配的资源：

```csharp
// 搜索角色预制体
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.FindCharacterPrefabs("keyword");

// 搜索动画片段
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.FindAnimationClips("idle");

// 搜索特定 FBX 内的动画片段
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.FindAnimationClipsInAsset("Assets/path/to/model.fbx");
```

**中文 → 英文动作关键词映射（用于动画搜索）：**
| 中文 | 搜索关键词 |
|------|-----------|
| 站立/待机/idle | idle, stand |
| 走路/行走 | walk |
| 跑步/奔跑 | run |
| 攻击/打 | attack, atk |
| 技能/释放技能 | skill |
| 死亡/倒下 | die, death |
| 欢呼/庆祝 | cheer, celebrate |
| 受伤/被击 | hit, hurt, damage |
| 防御/格挡 | defend, guard, block |
| 施法/释放 | cast, spell |
| 交谈/说话 | talk, speak |
| 鞠躬/敬礼 | bow, salute |

**角色预制体搜索路径：**
- 英雄角色：`Assets/GameAssets/AB/Prefab/Role/hero/`（命名模式：`hero_{Name}_Prefab`）
  - ⚠️ 名称可能包含空格，如 `hero_Alice Whitethorn_Prefab.prefab`。搜索时建议用姓或名的部分关键词（如 "Alice"）而非完整名称。
- NPC 角色：`Assets/GameAssets/AB/Prefab/Role/npc/` 或 `Assets/GameAssets/AB/Prefab/Role/`
  - NPC 命名模式多样：`Explore_*`、`newcity_npc_*`、`npc_*` 等，建议用功能关键词搜索。
- Spine 英雄：`Assets/GameAssets/AB/Prefab/HeroAVSpine/` — **仅用于 UI 视频播放，非战斗角色模型。不可用于 Timeline。**

**搜索注意事项：**
- `FindAnimationClips` 最多返回 **50 条**结果，`__preview__` clip 会被自动过滤。
- 如果通用搜索结果过多，优先使用 `FindAnimationClipsInAsset("Assets/path/to/model.fbx")` 搜索特定模型内的 clip。
- 搜索关键词建议尽量精确（如 "idle" 而非 "anim"）以减少无关结果。

如果找到多个匹配预制体 → 使用 `AskUserQuestion` 让用户选择。
如果未找到匹配 → 向用户询问准确的预制体路径。

### 阶段 3：构建 Timeline

通过 `execute_code` 依次执行以下步骤，每次调用一行。

**⚠️ 错误恢复策略：** `CreateTimeline` 成功后会在场景中创建临时 GameObject 并写入 `.playable` 文件。如果后续步骤失败：
1. 必须清理场景中的残留对象（用 `rootInstanceId` 找到并销毁）
2. 已写入的 `.playable` 文件可能需要手动删除
3. 向用户报告失败原因和需要清理的文件路径

```csharp
// 清理示例（仅在构建失败时使用）
var root = UnityEditor.EditorUtility.InstanceIDToObject(rootId) as UnityEngine.GameObject;
if (root != null) UnityEngine.Object.DestroyImmediate(root);
```

**步骤 1：创建或加载 Timeline**

创建新 Timeline：
```csharp
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.CreateTimeline("timeline_name");
```
→ 解析返回的 JSON 获取 `rootInstanceId`。

加载已有 Timeline 进行修改：
```csharp
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.LoadTimeline("Assets/GameAssets/Static/an/timeline/playables/timeline_xxx.playable");
```
→ 返回相同格式的 JSON，之后可用 `Add*` 方法追加 track，最后 `FinalizeAsPrefab` 覆盖保存。

**步骤 2：添加角色（每个角色一次调用）**
```csharp
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCharacter(
    rootId, "Assets/path/to/prefab.prefab", "CharName", posX, posY, posZ, rotY);
```
返回值为角色 GameObject 的 `instanceId` (int)，通常不需要保存，但可用于调试验证。
若 prefab 路径无效，会创建空 GameObject 并输出 warning（不抛异常），角色将没有模型。

**步骤 3：添加角色动画**
```csharp
// 基础用法
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCharacterAnimation(
    rootId, "CharName", "Assets/path/to/clip.anim", startTime, duration, "DisplayName");

// 带速度和淡入淡出控制
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCharacterAnimation(
    rootId, "CharName", clipPath, startTime, duration, "DisplayName",
    clipSpeed: 1.5,   // 1.5倍速播放
    easeIn: 0.3,      // 0.3秒淡入
    easeOut: 0.3);     // 0.3秒淡出
```
- `clipSpeed`：播放速度倍率，默认 1.0。2.0 = 两倍速，0.5 = 半速。
- `easeIn` / `easeOut`：动画混合淡入/淡出时长（秒），默认 0（硬切）。

**步骤 4：添加角色移动和旋转**

单点直线移动：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCharacterMovement(
    rootId, "CharName", toX, toY, toZ, startTime, duration);
```

多路径点曲线移动（自动平滑插值）：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCharacterMovementPath(
    rootId, "CharName", new float[]{x0,y0,z0, x1,y1,z1, x2,y2,z2}, startTime, duration);
```
角色当前位置为起点，路径点按等时间间隔分配。

角色旋转动画（从当前朝向旋转到目标角度）：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCharacterRotation(
    rootId, "CharName", toRotY, startTime, duration);
```

**步骤 5：添加摄像机**

Dolly 摄像机（扁平路径点数组：x0,y0,z0,x1,y1,z1,...）：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddDollyCamera(
    rootId, "MainCamera", new float[]{x0,y0,z0, x1,y1,z1}, startTime, duration);
```

静态摄像机 + 看向角色：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddStaticCameraLookAtCharacter(
    rootId, "CamA", posX, posY, posZ, "TargetCharName", startTime, duration);
```

静态摄像机 + 看向坐标点：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddStaticCamera(
    rootId, "CamA", posX, posY, posZ, lookAtX, lookAtY, lookAtZ, startTime, duration);
```

双机位切换：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddTwoShotCut(
    rootId, posAx,posAy,posAz, posBx,posBy,posBz, cutTime, totalDuration);
```

FOV 推拉焦动画（需先创建摄像机）：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCameraFOVAnimation(
    rootId, "CamA", fromFOV, toFOV, startTime, duration);
```
如果摄像机已有 AnimationTrack（如 dolly），FOV 曲线会追加到同一 infinite clip 上。

镜头抖动/噪声（需先创建摄像机）：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCameraNoise(
    rootId, "CamA", amplitudeGain, frequencyGain, "6D Shake");
```
噪声随 vcam 激活自动生效，无需额外 track。可用预设：
- `"6D Shake"` — 全方位震动（默认）
- `"Handheld_normal_mild"` — 手持轻微
- `"Handheld_normal_strong"` — 手持强烈
- `"Handheld_normal_extreme"` — 手持极端
- `"6D Wobble"` — 六轴缓慢摆动

**步骤 6：添加效果/自定义 Track**
```csharp
// 全屏黑幕淡入
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddFadeTrack(rootId, 0, 1.0);

// 气泡对话 — 自动绑定到角色（提供 bindCharName）
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddBubbleTalkTrack(rootId, "text", start, dur, "CharName");
// 或不绑定（需手动在编辑器中绑定 TextMeshProUGUI）
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddBubbleTalkTrack(rootId, "text", start, dur);

// 全屏对话 — ⚠️ 运行时会暂停 Timeline 直到对话关闭
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddDialogTrack(rootId, configId, start, dur);

// 事件通知外部系统
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddEventTrack(
    rootId, eventType, startTime, duration, intParam, floatParam, stringParam);

// VFX/粒子控制 — 在运行时生成 prefab 实例
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddControlTrack(
    rootId, "Assets/path/to/vfx.prefab", startTime, duration, posX, posY, posZ);

// 交互UI — 打开指定 UI 并暂停 Timeline 直到关闭
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddInteractUITrack(
    rootId, "UIAssetName", "UIGroupName", startTime, duration, "optionalParams");

// 事件触发跳转 — 监听游戏事件，触发时跳转 Timeline 播放位置
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddEventTriggerSeekTrack(
    rootId, listenType, seekPosition, normalized, startTime, duration);

// 曲线驱动事件 — 用动画曲线每帧发布 float 参数
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddEventCurveTrack(
    rootId, eventType, new float[]{0f,0f, 0.5f,1f, 1f,0f}, startTime, duration);
```

**底层方法 `AddCustomTrack`：** 如需仅创建 track 容器（不自动添加 clip），可使用：
```csharp
Tuyoo.Tools.Timeline.TimelineMCPBuilder.AddCustomTrack(rootId, "fade");
// 支持 9 种: fade/dialog/bubble/event/citycontrol/seek/guideeffect/interactui/control
```
⚠️ 此方法只创建空 track，不添加 clip。优先使用上面的专用方法（`AddFadeTrack` 等）。

**步骤 7：最终化**
```csharp
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.FinalizeAsPrefab(rootId);
```

### 阶段 4：验证（必须执行 — 不可跳过）

**步骤 1**：最终化前，获取摘要确认结构正确：
```csharp
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.GetTimelineSummary(rootId);
```
检查返回的 JSON：确认 track、clip 和绑定与用户描述一致。

**步骤 2**：执行最终化：
```csharp
return Tuyoo.Tools.Timeline.TimelineMCPBuilder.FinalizeAsPrefab(rootId);
```

**步骤 3**：验证输出文件确实存在：
```csharp
return UnityEditor.AssetDatabase.LoadAssetAtPath<UnityEngine.Object>("<prefab_path>") != null ? "OK" : "MISSING";
```
将 `<prefab_path>` 替换为 FinalizeAsPrefab 返回的实际路径。
如果结果为 `"MISSING"` → 报告失败。不要呈现为成功。

**步骤 4**：向用户报告：
   - 创建的文件：`.playable` 路径和 `.prefab` 路径
   - 角色列表及其动画
   - 摄像机配置说明
   - 总时长

**步骤 5**：告知用户预览方式：
   > "Timeline 已创建完成。请打开 Unity 菜单 **Tools → Timeline → Timeline 预览窗口** (快捷键 Ctrl+Alt+T)，
   > 将生成的预制体拖入预览窗口即可播放预览。"

## 参考：预制体层级结构

```
timeline_xxx (PlayableDirector + TimelineAsset)
├── content/
│   ├── CharacterA (Animator)
│   ├── CharacterB (Animator)
│   └── ...
└── camera/
    ├── VCam_DollyTrack (CinemachineSmoothPath)
    ├── VCam_Main (CinemachineVirtualCamera)
    └── ...
```

`content/` 和 `camera/` 内的所有位置均相对于根节点。
运行时，根节点放置在世界中的参考点以控制播放位置。

## 参考：可用自定义 Track 类型

| 简称 | Track 类 | 描述 | 运行时行为 |
|-----------|------------|-------------|----------|
| fade | TimelineUIFullScreenFadeTrack | 全屏黑幕淡入淡出 | duration 前半段淡入、后半段淡出 |
| dialog | TimelineOpenDialogTrack | 全屏对话（需要 configId） | ⚠️ 暂停 Timeline（`SetAllPlayableSpeed(0)`），对话关闭后恢复 |
| bubble | TimelineCharacterBubbleTalkTrack | 气泡对话文本 | 提供 `bindCharName` 时自动创建绑定，否则需手动绑定 |
| event | TimelineEventArgsTrack | 事件通知外部系统 | 发布 5 种回调（OnStart/OnResume/OnPause/OnFrame/OnEnd） |
| citycontrol | TimelineCityControlTrack | 内城控制（暂停隐藏市民） | 控制内城场景状态 |
| seek | TimelineSeekTrack | 跳转播放进度 | 修改 Timeline 当前播放位置 |
| guideeffect | TimelineGuideUIEffectTrack | 引导UI特效 | 触发引导相关 UI 特效 |
| interactui | TimelineOpenInteractUITrack | 打开交互UI | ⚠️ 暂停 Timeline 直到 UI 关闭 |
| control | ControlTrack（Unity 内置） | VFX/粒子实例控制 | Clip 激活期间创建 prefab 实例 |

### 参考：专用 API 方法速查

| 方法 | 用途 | 关键参数 |
|---|---|---|
| `CreateTimeline(name)` | 创建新 Timeline | name: string |
| `LoadTimeline(playablePath)` | 加载已有 .playable 进行修改 | playablePath: string (Assets/...) |
| `AddCharacter(rootId, prefab, name, x,y,z, rotY)` | 添加角色 | prefab 路径、位置、旋转 |
| `AddCharacterAnimation(rootId, char, clip, start, dur, display, speed, easeIn, easeOut)` | 角色动画 | clipSpeed/easeIn/easeOut 可选 |
| `AddCharacterMovement(rootId, char, toX,toY,toZ, start, dur)` | 直线移动 | 单点目标 |
| `AddCharacterMovementPath(rootId, char, waypoints[], start, dur, rotY)` | 多点路径移动 | 扁平数组 [x0,y0,z0,...]，rotY 可选 |
| `AddCharacterRotation(rootId, char, toRotY, start, dur)` | 角色旋转 | toRotY: 目标 Y 轴角度 |
| `AddDollyCamera(rootId, name, waypoints[], start, dur)` | Dolly 镜头 | 扁平数组 [x0,y0,z0,...] |
| `AddStaticCamera(rootId, name, x,y,z, lx,ly,lz, start, dur)` | 静态镜头+朝向 | 看向坐标点 |
| `AddStaticCameraLookAtCharacter(rootId, name, x,y,z, charName, start, dur)` | 静态镜头+看角色 | charName: 目标角色 |
| `AddTwoShotCut(rootId, posA, posB, cutTime, totalDur)` | 双机位切换 | A/B 位置，切换时间 |
| `AddCameraFOVAnimation(rootId, cam, fromFOV, toFOV, start, dur)` | FOV 推拉焦 | 需先创建摄像机 |
| `AddCameraNoise(rootId, cam, amplitude, frequency, profile)` | 镜头抖动 | 需先创建摄像机 |
| `AddFadeTrack(rootId, start, dur)` | 黑幕淡入 | — |
| `AddDialogTrack(rootId, configId, start, dur)` | 全屏对话（暂停） | configId: int |
| `AddBubbleTalkTrack(rootId, text, start, dur, bindCharName?)` | 气泡对话 | bindCharName 可选自动绑定 |
| `AddEventTrack(rootId, type, start, dur, intP, floatP, strP)` | 事件通知 | 参数均可选 |
| `AddControlTrack(rootId, prefab, start, dur, x,y,z)` | VFX/粒子控制 | prefab 路径 + 位置 |
| `AddInteractUITrack(rootId, uiAsset, uiGroup, start, dur, params?)` | 交互UI（暂停） | uiAssetName + uiGroupName |
| `AddEventTriggerSeekTrack(rootId, listenType, seekPos, normalized, start, dur)` | 事件触发跳转 | seekPosition, normalized |
| `AddEventCurveTrack(rootId, eventType, curveKeys[], start, dur)` | 曲线驱动事件 | curveKeys: [t0,v0,t1,v1,...] |
| `AddCustomTrack(rootId, trackType)` | 空 track 容器 | 9 种类型，优先用专用方法 |
| `FinalizeAsPrefab(rootId)` | 保存为预制体 | — |

## 能力边界

### 完全支持
- 角色放置、移动（单点/多路径点）、旋转、Mecanim 动画（含变速、淡入淡出）
- Dolly/Static/LookAt/TwoShot 摄像机，FOV 动画，Cinemachine Noise 镜头抖动
- 黑幕淡入淡出、全屏对话、气泡对话（可自动绑定角色）、事件通知
- VFX/粒子 ControlTrack、交互 UI Track、事件触发跳转、曲线驱动事件
- 加载已有 Timeline 追加 track

### 不支持（需手动补全或其他方案）
- **Spine 角色**：仅支持 Mecanim (Animator) 角色。`HeroAVSpine/` 目录下为 UI 视频组件，非可用模型。
- **音频**：Timeline AudioTrack 未接入 builder，需手动在编辑器中添加。
- **灯光动画**：无 API 支持，需手动添加 AnimationTrack 控制灯光属性。
- **精确构图**：摄像机位置为启发式放置，精确取景需手动在 Scene View 调整。
- **自动预览**：无法在技能内自动播放，需用户通过 TimelinePreviewWindow 预览。

### 部分支持（有限制条件）
- **对话暂停**：`AddDialogTrack` 运行时会暂停整条 Timeline（`SetAllPlayableSpeed(0)`），对话关闭后恢复。后续 track 的实际播放时间会被推迟，规划 timing 时将对话之后的时间轴视为"对话结束后"计算。
- **气泡对话绑定**：不提供 `bindCharName` 时仍需手动绑定 TextMeshProUGUI；提供时自动创建 WorldSpace Canvas + TMP。
- **动画重叠**：同一角色同时段多个 AnimationClip 可能导致不可预期混合，建议避免时间重叠或使用 easeIn/easeOut 控制过渡。
- **多摄像机切换**：多个 VirtualCamera 同时激活时 CinemachineBrain 按 Priority 切换。确保不同相机的 ActivationTrack clip 不重叠。
- **镜头抖动时序**：`AddCameraNoise` 添加到 VirtualCamera 组件上，随 vcam 激活自动生效。若需仅在特定时段抖动，需拆分为两个摄像机（一个有噪声、一个无噪声）通过不同时段的 ActivationTrack 切换。
- **动画骨骼兼容性**：动画 clip 必须匹配目标角色骨骼 rig，不匹配会导致无动画表现。

## 简单示例

**用户输入：**
> "做一个过场动画：在原点有一个骑士英雄，播放idle动画。在x=8m处有一个弓箭手，播放攻击动画。
> 镜头从弓箭手位置平移到骑士位置，总时长6秒。开头加一个1秒的黑幕淡入。"

**预期执行序列：**
1. `CreateTimeline("timeline_knight_archer_cutscene")`
2. 搜索预制体：`FindCharacterPrefabs("knight")`、`FindCharacterPrefabs("archer")`
3. 搜索动画：`FindAnimationClips("idle")`、`FindAnimationClips("attack")`
4. `AddCharacter(rootId, knightPrefabPath, "Knight", 0, 0, 0)`
5. `AddCharacter(rootId, archerPrefabPath, "Archer", 8, 0, 0)`
6. `AddCharacterAnimation(rootId, "Knight", idleClipPath, 0, 6, "Idle")`
7. `AddCharacterAnimation(rootId, "Archer", attackClipPath, 0, 6, "Attack")`
8. `AddDollyCamera(rootId, "MainCamera", new float[]{8,3,-5, 0,3,-5}, 0, 6)`
9. `AddFadeTrack(rootId, 0, 1.0)`
10. `FinalizeAsPrefab(rootId)`

## 复杂示例

**用户输入：**
> "做一个城墙防御僵尸攻击的过场：英雄在城门前5米，面朝远方，旁边站着NPC士兵。
> 远处有僵尸。开头1秒黑幕淡入，远景 dolly 从僵尸推到城墙(0-5s)。
> 5s时NPC转身面向英雄(1s)。6s时中景镜头在英雄和僵尸中间，FOV从60推到100(2s)。
> 7s弹出对话 configId=1001。8s僵尸向英雄跑来(3s)。
> 11s英雄攻击僵尸(1.5倍速，带0.2s淡入)，攻击到一半僵尸倒下。
> 13s镜头抖动。最后1秒淡出。"

**分析（阶段 1）：**
- 角色：Hero (0,0,5, rotY=180)、NPC (2,0,5, rotY=180)、Zombie (0,0,30, rotY=0)
- 摄像机：DollyCam(0-5s)、MidCam(6-13s, FOV动画)、ShakeCam(13-14s, 带noise)
- 效果：Fade(0-1s)、Dialog(7s)、Fade out(14-15s)
- ⚠️ Dialog 在7s暂停 Timeline — 8s及以后的时间轴为"对话关闭后"
- ⚠️ 镜头抖动需单独摄像机（或复用 MidCam 添加 noise）

**预期执行序列：**
1. `CreateTimeline("timeline_wall_zombie_defense")`
2. 搜索资源：预制体（hero/npc/zombie）、动画（idle/run/attack/death）
3. `AddCharacter(rootId, heroPrefab, "Hero", 0, 0, 5, 180)`
4. `AddCharacter(rootId, npcPrefab, "NPC", 2, 0, 5, 180)`
5. `AddCharacter(rootId, zombiePrefab, "Zombie", 0, 0, 30, 0)`
6. `AddCharacterAnimation(rootId, "Hero", idleClip, 0, 11, "Idle")`
7. `AddCharacterAnimation(rootId, "Hero", attackClip, 11, 2, "Attack", clipSpeed:1.5, easeIn:0.2)`
8. `AddCharacterAnimation(rootId, "NPC", idleClip, 0, 15, "NPC_Idle")`
9. `AddCharacterRotation(rootId, "NPC", 0, 5, 1)` — NPC转身面向英雄方向
10. `AddCharacterAnimation(rootId, "Zombie", idleClip, 0, 8, "Zombie_Idle")`
11. `AddCharacterAnimation(rootId, "Zombie", runClip, 8, 3, "Zombie_Run")`
12. `AddCharacterMovement(rootId, "Zombie", 0, 0, 7, 8, 3)` — 僵尸跑向英雄
13. `AddCharacterAnimation(rootId, "Zombie", deathClip, 11.75, 2, "Zombie_Death")`
14. `AddDollyCamera(rootId, "DollyCam", new float[]{0,5,35, 0,5,5}, 0, 5)`
15. `AddStaticCamera(rootId, "MidCam", 5,3,17, 0,2,10, 6, 8)` — 中间位置看向战场中心
16. `AddCameraFOVAnimation(rootId, "MidCam", 60, 100, 6, 2)`
17. `AddStaticCamera(rootId, "ShakeCam", 2,2,7, 0,1,5, 13, 2)` — 抖动镜头
18. `AddCameraNoise(rootId, "ShakeCam", 2.0, 2.0, "6D Shake")`
19. `AddFadeTrack(rootId, 0, 1.0)` — 开头淡入
20. `AddFadeTrack(rootId, 14, 1.0)` — 结尾淡出
21. `AddDialogTrack(rootId, 1001, 7, 1)` — 对话（暂停 Timeline）
22. `GetTimelineSummary(rootId)` → 验证
23. `FinalizeAsPrefab(rootId)`

## 生成后检查清单（告知用户）

生成完成后，告知用户以下可能需要手动补全的事项：

| 检查项 | 条件 | 操作 |
|-------|------|------|
| 音频/BGM | 如果过场需要音效 | 手动在 Timeline 编辑器中添加 AudioTrack |
| 气泡对话绑定 | 未使用 `bindCharName` 参数 | 在编辑器中为 bubble track 绑定 TextMeshProUGUI |
| VFX 粒子 | 使用了 ControlTrack | 确认 prefab 路径正确，检查粒子朝向和缩放 |
| 动画骨骼匹配 | 所有角色动画 | 在预览窗口中确认动画正常播放，无 T-Pose |
| 镜头取景 | 所有摄像机 | 在 Scene View 中微调摄像机位置和朝向 |
| 对话时序 | 使用了 AddDialogTrack | 对话后的 track 时间为"对话关闭后"，实际播放时间更长 |
| 总时长验证 | 所有 Timeline | 在 Timeline 编辑器中确认总时长与预期一致 |

预览方式：打开 Unity → **Tools → Timeline → Timeline 预览窗口** (Ctrl+Alt+T) → 将 prefab 拖入即可播放。
