[plugins] feishu_doc: Registered feishu_doc, feishu_app_scopes
[plugins] feishu_chat: Registered feishu_chat tool
[plugins] feishu_wiki: Registered feishu_wiki tool
[plugins] feishu_drive: Registered feishu_drive tool
[plugins] feishu_bitable: Registered bitable tools
[plugins] [DingTalk] 插件已注册（支持主动发送 AI Card 消息）
[plugins] feishu_doc: Registered feishu_doc, feishu_app_scopes
[plugins] feishu_chat: Registered feishu_chat tool
[plugins] feishu_wiki: Registered feishu_wiki tool
[plugins] feishu_drive: Registered feishu_drive tool
[plugins] feishu_bitable: Registered bitable tools
[plugins] [DingTalk] 插件已注册（支持主动发送 AI Card 消息）
[plugins] feishu_doc: Registered feishu_doc, feishu_app_scopes
[plugins] feishu_chat: Registered feishu_chat tool
[plugins] feishu_wiki: Registered feishu_wiki tool
[plugins] feishu_drive: Registered feishu_drive tool
[plugins] feishu_bitable: Registered bitable tools
[plugins] [DingTalk] 插件已注册（支持主动发送 AI Card 消息）
[plugins] feishu_doc: Registered feishu_doc, feishu_app_scopes
[plugins] feishu_chat: Registered feishu_chat tool
[plugins] feishu_wiki: Registered feishu_wiki tool
[plugins] feishu_drive: Registered feishu_drive tool
[plugins] feishu_bitable: Registered bitable tools
[plugins] [DingTalk] 插件已注册（支持主动发送 AI Card 消息）
# Architecture Spec

## Meta
- artifact_type: Architecture Spec
- owner: architect
- phase: Phase 4 技术设计
- version: v1
- status: READY
- date: 2026-03-27
- related_task: task-20260327-011331
- upstream_inputs: `05_product_spec.md` (v1)
- downstream_target: security / engineer

---

## Technical Goal

交付一个 TFT 经济策略分析系统，包含两个交付物：(1) 技术分析文档 (2) 交互可视化网站。两者共享同一数学模型模块。核心挑战不在渲染而在模型：蒙特卡洛模拟在 1000 次 × 30 回合的规模下必须 < 200ms 完成，以支撑参数调整的即时反馈体验。

---

## Product Alignment

### 必须忠实实现的产品目标

| 产品要求 | 技术实现约束 |
|---|---|
| 经济模型：纯经济变量（基础收入 + 利息 + 连胜/连败奖励） | `model/engine.js` 纯函数，排除 D 牌/阵容/对手 |
| 4 种策略对比（纯攒利息 / 纯连胜 / 连败转型 / 均衡） | 每种策略为一个策略函数，接收状态返回决策 |
| 蒙特卡洛模拟 + 理论期望双视图 | `model/engine.js` 导出 `simulate()` 和 `theoreticalExpectation()` |
| 参数调整即时反馈（< 200ms） | 1000 次 × 30 回合同步计算，纯 JS 前端完成 |
| 多策略曲线叠加（折线图） | ECharts 折线图，4 条曲线不同颜色 |
| Hover 经济明细 tooltip | ECharts tooltip formatter，显示基础收入/利息/连胜奖励/连败奖励/总金分项 |
| 模拟分布对比（箱线图/柱状图） | ECharts boxplot 或 bar chart |
| 最优策略自动推荐 | 基于模拟结果排序，非硬编码 |
| 参数可配置（支持版本切换） | 配置对象从参数读取连胜/连败奖励梯度、基础收入等 |
| 技术文档与网站共享同一模型 | 文档中引用的数值与网站曲线必须一致 |
| 开发顺序：先模型后文档后网站 | 模型是两个交付物的共同基础 |

### 不可被技术方案改写的边界

- 建模范围硬性限定纯经济变量
- 参数调整 < 200ms 即时反馈
- Hover 经济明细必须包含基础收入、利息、连胜/连败奖励分项
- 最优策略推荐基于模拟结果，非硬编码
- 文档与网站的数学一致性
- 纯前端同步计算，不做 Web Worker（第一版）

---

## Overall Approach

**方案：** 三层分离架构——数学模型层（纯 JS 模块）→ 文档层（Markdown）→ 可视化层（HTML + ECharts）。模型层为两个交付物的共同基础。

**为什么选这条路径：**

1. 模型层独立于 UI 是架构核心——文档和网站必须使用同一模块保证一致性。
2. 纯前端同步计算是因为：1000 次 × 30 回合 = 3 万次简单加法/比较运算，JS 同步执行 < 100ms，不需要 Web Worker。
3. ECharts 优于 Chart.js 是因为：tooltip 自定义能力强（hover 分项明细）、箱线图原生支持、中文生态好。
4. 先模型后文档后网站的顺序是因为：文档引用模型输出数值，网站图表依赖模型 API。

**项目结构：**

```
tft-economy/
├── model/                          # 数学模型层（纯 JS，零 UI 依赖）
│   ├── engine.js                   # 核心引擎：simulate() + theoreticalExpectation()
│   ├── strategies.js               # 4 种策略函数定义
│   └── config.js                   # 可配置参数（连胜/连败奖励梯度、基础收入等）
│
├── docs/                           # 技术分析文档
│   ├── 00-index.md                 # 目录
│   ├── 01-introduction.md          # 引言
│   ├── 02-modeling.md              # 经济系统建模
│   ├── 03-strategies.md            # 策略定义
│   ├── 04-analysis.md              # 数学分析
│   ├── 05-simulation.md            # 模拟验证
│   ├── 06-conclusion.md            # 结论
│   └── appendix.md                 # 附录
│
├── web/                            # 交互可视化
│   ├── index.html                  # 入口
│   ├── style.css                   # 样式
│   ├── app.js                      # 主逻辑：参数绑定 + 图表更新 + 推荐
│   └── charts.js                   # ECharts 封装（折线图/箱线图/tooltip）
│
├── dist/                           # 构建产物（如需要）
└── README.md                       # 项目说明 + 使用指南
```

---

## Module Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                    model/ (核心层)                        │
│                                                         │
│  config.js ──→ engine.js ←── strategies.js              │
│  (参数配置)    (模拟引擎)     (4 种策略)                   │
│                │                                        │
│                ├── simulate(params, strategy, N, runs)  │
│                └── theoreticalExpectation(params, strat)│
│                                                         │
├────────────────────────┬────────────────────────────────┤
│     docs/ (文档层)      │      web/ (可视化层)            │
│                        │                                │
│  引用 engine.js 输出    │  调用 engine.js API             │
│  数值和公式             │  参数面板 → simulate()           │
│  6 章 Markdown          │  → ECharts 渲染                │
└────────────────────────┴────────────────────────────────┘
```

### 模块 1：`model/config.js` — 可配置参数

```javascript
export const DEFAULT_CONFIG = {
  baseIncome: 5,                    // 每回合基础收入
  interestRate: 1,                  // 每 10 金币利息
  interestCap: 5,                   // 利息上限（存款 50 封顶）
  interestThreshold: 10,            // 利息计算单位
  streakBonus: {                    // 连胜奖励梯度
    win:  { 2: 1, 3: 1, 4: 2, 5: 3 },
    lose: { 2: 1, 3: 1, 4: 2, 5: 3 },
  },
  // 可扩展：不同游戏版本切换
};
```

职责：纯数据对象，不含逻辑。支持版本切换只需替换配置。

### 模块 2：`model/strategies.js` — 策略函数

每种策略是一个纯函数，接收当前状态返回本回合决策：

```javascript
// 策略函数签名
// (state: { round, gold, winStreak, loseStreak }, config) => { spend: number }

export function pureSave(state, config) {
  // 纯攒利息：永远不花钱
  return { spend: 0 };
}

export function pureWinStreak(state, config) {
  // 纯连胜：前期积极投入维持连胜
  // 假设花钱能维持连胜（简化模型）
  const targetGold = state.round < 10 ? 0 : 20;
  return { spend: Math.max(0, state.gold - targetGold) };
}

export function loseStreakTransition(state, config) {
  // 连败转型：前 8 回合不投资，第 9 回合起投入
  if (state.round < 9) return { spend: 0 };
  return { spend: Math.max(0, state.gold - 30) };
}

export function balanced(state, config) {
  // 均衡策略：保持 30 金底线，超出部分投资
  const threshold = 30;
  return { spend: Math.max(0, state.gold - threshold) };
}
```

职责：纯函数，不读写全局状态，不操作 DOM。

### 模块 3：`model/engine.js` — 核心引擎

```javascript
// 导出 2 个核心函数

/**
 * 蒙特卡洛模拟
 * @param {Object} config - 参数配置
 * @param {Function} strategyFn - 策略函数
 * @param {number} rounds - 回合数
 * @param {number} simulations - 模拟次数
 * @returns {Array<{ round, mean, std, details: [{ baseIncome, interest, winBonus, loseBonus, total }] }>}
 */
export function simulate(config, strategyFn, rounds, simulations) { ... }

/**
 * 理论期望计算（无随机性）
 * @returns {Array<{ round, mean, details }>}
 */
export function theoreticalExpectation(config, strategyFn, rounds) { ... }
```

**simulate() 内部逻辑：**

```
for (sim = 0; sim < simulations; sim++) {
  state = { round: 1, gold: config.baseIncome, winStreak: 0, loseStreak: 0 }
  for (round = 1; round <= rounds; round++) {
    decision = strategyFn(state, config)
    state.gold -= decision.spend
    income = config.baseIncome
    interest = Math.min(Math.floor(state.gold / config.interestThreshold) * config.interestRate, config.interestCap)
    // 连胜/连败随机判定（蒙特卡洛引入随机性）
    streakResult = Math.random() > 0.5 ? 'win' : 'lose'
    streakBonus = computeStreakBonus(streakResult, state, config)
    state.gold += income + interest + streakBonus.total
    record[sim][round] = { income, interest, streakBonus, gold: state.gold }
  }
}
// 汇总：每回合所有模拟的 mean / std
```

**theoreticalExpectation() 内部逻辑：**
- 不引入随机性：连胜/连败概率用期望值替代（如 P(win)=0.5）
- 计算每回合期望金币值

### 模块 4：`web/charts.js` — ECharts 封装

```javascript
// 导出 4 个图表初始化/更新函数

export function initLineChart(container)  // 策略收益曲线（折线图）
export function initBoxChart(container)   // 模拟分布（箱线图）
export function updateLineChart(chart, data)  // 更新折线图数据
export function updateBoxChart(chart, data)   // 更新箱线图数据
```

**折线图 tooltip 配置：**
```javascript
tooltip: {
  trigger: 'axis',
  formatter: function(params) {
    // params 包含 4 条曲线在当前 x 的值
    let html = `回合 ${params[0].axisValue}<br/>`;
    params.forEach(p => {
      const d = p.data.details;
      html += `<b>${p.seriesName}</b><br/>`;
      html += `  基础收入: ${d.baseIncome}<br/>`;
      html += `  利息: ${d.interest}<br/>`;
      html += `  连胜奖励: ${d.winBonus}<br/>`;
      html += `  连败奖励: ${d.loseBonus}<br/>`;
      html += `  <b>总金: ${d.total}</b><br/><br/>`;
    });
    return html;
  }
}
```

### 模块 5：`web/app.js` — 主逻辑

```
1. 初始化 ECharts 实例
2. 绑定参数面板事件（滑块 change → 触发重算）
3. 参数变化时：
   a. 读取所有参数值
   b. 对 4 种策略各调用 simulate() 或 theoreticalExpectation()
   c. 更新折线图
   d. 更新箱线图
   e. 计算最优策略 → 显示推荐卡片
4. 图例点击 → 切换曲线显示/隐藏
```

### 模块 6：`docs/` — 技术文档

6 章 Markdown，引用 `model/engine.js` 输出的具体数值。文档中的示例数字与网站在默认参数下的曲线必须一致。

---

## Boundaries / Responsibilities

| 模块 | 职责 | 不允许 |
|---|---|---|
| model/config.js | 纯数据配置 | 不含计算逻辑 |
| model/strategies.js | 纯策略函数 | 不含 UI 引用、不调 engine |
| model/engine.js | 模拟引擎 | 不引用 DOM / ECharts / 文档 |
| web/charts.js | ECharts 封装 | 不含业务逻辑，不做计算 |
| web/app.js | 参数绑定 + 编排 | 不直接操作 ECharts 配置（通过 charts.js） |
| docs/ | 引用模型输出 | 不包含模型代码（只引用数值） |

**关键边界规则：**

1. **model/ 零 UI 依赖：** 不引用 DOM、ECharts、任何浏览器 API。可在 Node.js 中独立运行。
2. **web/ 不直接操作 ECharts 配置：** 所有图表操作通过 `charts.js` 封装函数。
3. **docs/ 不包含模型代码：** 只引用模型输出的数值和公式。如需可复现性，在文档中链接 `model/` 目录。
4. **策略函数为纯函数：** 相同输入 → 相同输出，不依赖随机性。随机性在 `engine.js` 的 `simulate()` 中引入。

---

## Data Flow / State Flow

### 核心数据流

```
用户拖动参数滑块
  → app.js 读取全部参数值
  → 构建 config 对象
  → 对 4 种策略各调用 engine.simulate(config, strategyFn, rounds, simulations)
  → 返回 [{ round, mean, std, details }]
  → charts.js.updateLineChart() → 折线图更新
  → charts.js.updateBoxChart() → 箱线图更新
  → app.js 计算最优策略 → 更新推荐卡片
  → 全程 < 200ms
```

### 每回合经济计算细节

```
回合开始状态：{ gold, winStreak, loseStreak }

1. 策略函数返回 { spend }
   → gold -= spend

2. 基础收入
   → gold += config.baseIncome

3. 利息
   → interest = min(floor(gold / 10) * 1, 5)
   → gold += interest

4. 连胜/连败判定（仅 simulate 引入随机性）
   → 模拟对战结果：win or lose
   → 如果 win: winStreak++, loseStreak=0
   → 如果 lose: loseStreak++, winStreak=0
   → streakBonus = config.streakBonus[type][streak] || 0
   → gold += streakBonus

5. 记录本回合明细
   → { baseIncome, interest, winBonus, loseBonus, total: gold }
```

### 策略对比数据结构

```javascript
// simulate() 返回值
[
  { // S1: 纯攒利息
    strategy: 'pureSave',
    results: [
      { round: 1, mean: 15.2, std: 0.8, details: { baseIncome: 5, interest: 1, winBonus: 0, loseBonus: 0, total: 16 } },
      { round: 2, mean: 21.5, std: 1.2, details: { ... } },
      // ...
    ]
  },
  { strategy: 'pureWinStreak', results: [...] },
  { strategy: 'loseStreakTransition', results: [...] },
  { strategy: 'balanced', results: [...] },
]
```

---

## Implementation Order

| 顺序 | 模块 | 内容 | 理由 |
|---|---|---|---|
| 1 | `model/config.js` | 可配置参数定义 | 模型的基础数据 |
| 2 | `model/strategies.js` | 4 种策略纯函数 | engine 依赖的决策函数 |
| 3 | `model/engine.js` | simulate() + theoreticalExpectation() | **核心——模型输出是所有后续的基础** |
| 4 | 模型测试 | 用默认参数运行，验证数值合理性 | 确保模型正确后才做后续 |
| 5 | `docs/` | 6 章文档，引用步骤 4 的输出数值 | 先文档后网站 |
| 6 | `web/index.html` + `style.css` | 页面骨架 + 参数面板 + 图表容器 | 可视化基础 |
| 7 | `web/charts.js` | ECharts 折线图 + 箱线图 + tooltip 封装 | 图表能力 |
| 8 | `web/app.js` | 参数绑定 + simulate 调用 + 图表更新 + 推荐 | **可视化核心** |
| 9 | 全量检查 | CP1-CP13 | 最终验收 |

**关键检查点：**
- **步骤 4 后：** 验证模型数值合理性。默认参数下：纯攒利息策略在第 5 回合应攒到约 30-35 金（基础收入 5×5=25 + 利息累积）。连败转型策略前 8 回合金币应低于纯攒利息，第 12 回合后可能反超。**数值不合理则模型有 bug。**
- **步骤 8 后：** 验证参数调整 < 200ms 即时反馈。拖动滑块无明显延迟。
- **步骤 9 后：** 验证文档与网站在默认参数下数值一致。

---

## Dependencies

### 外部依赖

| 依赖 | 用途 |
|---|---|
| ECharts ^5.x | 可视化图表（折线图、箱线图、tooltip） |

### 内部依赖

```
model/config.js  ← model/engine.js（读取参数）
model/strategies.js ← model/engine.js（调用策略函数）
model/engine.js  ← web/app.js（调用 simulate/theoreticalExpectation）
web/charts.js    ← web/app.js（调用图表更新函数）
model/engine.js  ← docs/（引用输出数值）
```

### 关键约束
- model/ 不引用 web/ 或 docs/
- web/ 不直接引用 model/config.js（通过 app.js 传递 config 到 engine）
- docs/ 不包含可执行代码

---

## Risks

| ID | 风险 | 影响 | 缓解措施 |
|---|---|---|---|
| R1 | **模型数值不合理** | 整个系统不可信 | 步骤 4 后做手工合理性检验（纯攒利息第 5 回合约 30-35 金）；与游戏实际数值交叉验证 |
| R2 | **蒙特卡洛模拟性能超标** | 参数调整延迟 > 200ms，核心体验崩溃 | 1000×30=3万次简单运算应 < 50ms；如超标可降默认模拟次数到 500；步骤 8 后实测 |
| R3 | **文档与网站数值不一致** | 用户质疑系统可信度 | 两者使用同一 engine.js；默认参数下数值必须完全一致；步骤 9 专项检查 |
| R4 | **连胜/连败奖励数值不确定** | 模型参数与游戏实际不符 | config.js 中参数化；标注"需从游戏内确认当前版本精确值"；支持版本切换 |
| R5 | **tooltip 显示分项不清晰** | 用户看不懂经济明细 | tooltip formatter 中用清晰的分项标签 + 排版；步骤 8 后截图验证 |
| R6 | **箱线图在大量模拟下渲染慢** | 图表更新卡顿 | ECharts boxplot 在 1000 数据点下性能可控；如慢可降模拟次数或改用柱状图 |

---

## Validation / Checkpoints

| 编号 | 检查内容 | 通过标准 |
|---|---|---|
| CP1 | 模型数值合理性 | 默认参数下纯攒利息第 5 回合约 30-35 金；连败转型前 8 回合低于纯攒利息 |
| CP2 | 4 种策略函数正确 | 每种策略在相同状态下返回确定性结果（纯函数） |
| CP3 | simulate() 返回结构正确 | 返回数组长度 = rounds，每项含 mean/std/details |
| CP4 | theoreticalExpectation() 与 simulate() 趋势一致 | 理论曲线应在模拟均值曲线附近 |
| CP5 | 文档公式与模型输出一致 | 默认参数下文档引用的数值与 engine 输出完全一致 |
| CP6 | 参数面板交互 | 滑块拖动可调整 3-5 个参数 |
| CP7 | **参数调整即时反馈** | 拖动滑块后所有图表 < 200ms 更新 |
| CP8 | 策略曲线叠加 | 4 种策略折线图叠加显示，不同颜色 |
| CP9 | Hover 经济明细 | 鼠标悬停曲线 → tooltip 显示基础收入/利息/连胜/连败/总金分项 |
| CP10 | 模拟分布对比 | 箱线图或柱状图显示 4 种策略末回合金币分布 |
| CP11 | 最优策略推荐 | 基于模拟结果自动标注最优策略，非硬编码 |
| CP12 | 图例切换 | 点击图例可显示/隐藏对应策略曲线 |
| CP13 | 零后端依赖 | 纯前端运行，无需服务器 |

---

## Security Focus Areas

本项目为纯前端数学建模 + 可视化工具，零外部依赖（除 ECharts CDN）、零网络请求（除 CDN）、零用户数据处理。安全风险极低。

### 高敏感位
- **无。** 不处理用户凭据、不发送请求、不存储数据。

### 建议重点检查项
1. **ECharts CDN 信任：** 使用固定版本号，不使用 `@latest`。
2. **无 `innerHTML` / `eval`：** tooltip formatter 使用字符串拼接，确认无注入风险。
3. **性能边界：** 参数滑块快速拖动可能产生大量中间计算。可加 debounce（100ms）防止过度计算。

---

## Handoff to security / engineer

### 对 security
- 风险面极窄：纯前端建模 + 可视化，唯一外部依赖为 ECharts CDN
- 无高危阻断项，建议快速通过预审

### 对 engineer
- 三层架构：`model/`（纯 JS，零 UI 依赖）→ `docs/`（Markdown）→ `web/`（ECharts）
- **按 Implementation Order 执行：** config → strategies → **engine（步骤 3-4 核心验证点）** → docs → web 骨架 → charts.js → app.js → 全量检查
- **model/ 是两个交付物的共同基础。** 模型正确性决定了文档可信度和网站可用性。步骤 4 后必须做手工合理性检验。
- **性能是核心体验约束。** 参数调整 < 200ms。步骤 8 后实测 1000 次 × 30 回合的 simulate() 耗时。如超标可降默认模拟次数或加 debounce。
- **文档与网站必须使用同一 engine.js。** 不允许文档中硬编码数字或用独立脚本重新计算。
- tooltip formatter 必须显示基础收入/利息/连胜奖励/连败奖励/总金五项分项，缺一不可。
- 三个不可协商的体验点（退回条件）：
  1. 参数调整 < 200ms 即时反馈（CP7）
  2. Hover 经济明细包含全部分项（CP9）
  3. 最优策略推荐基于模拟结果，非硬编码（CP11）
