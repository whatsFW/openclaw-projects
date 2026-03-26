[plugins] feishu_doc: Registered feishu_doc, feishu_app_scopes
[plugins] feishu_chat: Registered feishu_chat tool
[plugins] feishu_wiki: Registered feishu_wiki tool
[plugins] feishu_drive: Registered feishu_drive tool
[plugins] feishu_bitable: Registered bitable tools
[plugins] [DingTalk] 插件已注册（支持主动发送 AI Card 消息）
# Research Digest

## Meta
- artifact_type: Research Digest
- owner: research
- phase: Phase 2 产品探索与现实校正
- version: v1
- status: READY
- date: 2026-03-26
- related_task: task-20260326-190327（项目名：wfood）
- upstream_inputs: `01_task_brief.md`
- downstream_target: pm-core

---

## Brief 完整度评估

当前 Brief 比此前极简版有显著改善——Goal 字段包含了项目名、技术栈、功能范围、UI 风格、配色、交付要求。但**仍缺少标准结构字段**（Background、Target User、Success Criteria、Scope/Non-Goals、Constraints、Open Questions）。以下基于已有信息展开，标注需澄清的点。

---

## Research Question
外卖模拟平台（wfood）的功能模式行业共识？Vue3 架构如何组织？拟物化 UI 如何落地？预留后端接口的契约如何定义？

## SCQA

### Situation
wfood：纯前端外卖模拟平台，Vue3+Vite，登录注册、店铺浏览、购物车、下单流程。拟物化 UI，绿色主色调 + 橙色重点色。输出到 dist。预留后端接口。

### Complication
核心交互复杂度集中在三处：购物车状态管理（跨页面持久化、数量修改、价格计算）、下单流程状态机（地址→确认→模拟支付→结果）、店铺浏览的三级导航（列表→详情→菜单）。"模拟"意味着无真实后端，但"预留接口"要求接口设计具有可对接性。

### Question
- 外卖平台核心页面流和状态流？
- Vue3 下购物车和订单的状态管理？
- 拟物化 UI 的设计要点与成本？
- Mock 与接口预留策略？

### Initial Answer
预判 MVP 聚焦"浏览→加购→下单"核心链路。拟物化关键在于阴影、质感、圆角的精细控制。Mock 用 localStorage + JSON，接口参照 RESTful。

---

## Scope of Research

**覆盖**：核心页面流、Vue3 架构、购物车/订单状态管理、拟物化 UI 设计要素、Mock 策略、国内外卖平台交互模式

**未覆盖**：真实后端、移动端适配细节、支付对接、商家后台、骑手端

---

## Key Facts

**事实 1（强证据）**：外卖平台核心页面流——

| 页面 | 核心内容 | 导航关系 |
|------|---------|---------|
| 登录/注册 | 账号密码/手机号表单 | → 店铺列表 |
| 店铺列表 | 店铺卡片、搜索/筛选 | → 店铺详情 |
| 店铺详情 | 菜单分类、菜品列表 | → 购物车 |
| 购物车 | 已加菜品、数量调整、价格汇总 | → 确认订单 |
| 确认订单 | 地址、备注、价格明细、提交 | → 下单结果 |
| 下单结果 | 成功/失败状态、订单摘要 | → 首页 |
| 个人中心（可选） | 用户信息、历史订单 | 各处入口 |

美团/饿了么/DoorDash 的标准结构。

**事实 2（强证据）**：购物车是最复杂的状态——
- 跨页面持久化（切页面不丢数据）
- 店铺隔离（通常切换店铺清空，需确认规则）
- 数量操作（加一/减一/删除/清空）
- 价格计算（单价×数量→小计→总价）

**必须用 Pinia 全局 store + localStorage 持久化**，组件内 state 会丢失。

**事实 3（强证据）**：Vue3 技术栈——
- 状态管理：**Pinia**（非 Vuex），Vue 官方推荐，API 简洁，TS 支持好
- 至少三个 store：`useUserStore`（登录态）、`useCartStore`（购物车）、`useOrderStore`（订单）
- 路由：Vue Router + beforeEach 守卫（未登录重定向）

**事实 4（强证据）**：路由设计——
```
/login              → 登录页
/register           → 注册页
/shops              → 店铺列表
/shops/:id          → 店铺详情（含菜单）
/cart               → 购物车
/order/confirm      → 确认订单
/order/result/:id   → 下单结果
/profile            → 个人中心（可选）
```

**事实 5（强证据）**："预留后端接口"的正确做法——
- 定义 `/api` 接口层，所有数据通过统一 service 层获取
- 当前 Mock 实现，接口设计 RESTful 规范，后续替换不动业务代码
- 核心接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 登录 |
| `/api/auth/register` | POST | 注册 |
| `/api/shops` | GET | 店铺列表 |
| `/api/shops/:id` | GET | 店铺详情（含菜品） |
| `/api/cart` | GET/POST/PUT/DELETE | 购物车 CRUD |
| `/api/orders` | GET/POST | 订单列表/创建 |
| `/api/user/profile` | GET | 用户信息 |

**事实 6（中等证据）**：拟物化 UI 设计要素——
- **多层阴影**：`box-shadow` 多层叠加模拟凹凸（`inset` 阴影模拟凹陷按钮）
- **质感纹理**：微妙噪点/皮革/亚麻纹理背景
- **圆角**：较大圆角（8-16px）
- **高光**：顶部 1px 白色/浅色高光线模拟光照
- **立体按钮**：凸起 + 按下 `inset` 阴影模拟物理按压
- **配色**：绿色建议深自然绿（`#2E7D32` / `#388E3C`），橙色建议暖橙（`#FF6F00` / `#E65100`），需要颜色有深度感

**事实 7（中等证据）**：Mock 数据方案对比——

| 方案 | 优点 | 缺点 |
|------|------|------|
| 本地 JSON | 最简单 | 无法模拟增删改 |
| localStorage | 支持持久化 CRUD | 数据结构受限 |
| MSW | 与真实 API 一致 | 额外依赖 |
| JSON Server | 快速 REST API | 需额外进程 |

**推荐 localStorage + JSON 混合**：初始数据 JSON，运行时修改存 localStorage。接口层统一抽象。

**事实 8（中等证据）**：下单流程状态机——
```
SELECT_ADDRESS → CONFIRM_ORDER → SUBMITTING → SUCCESS / FAILED
```
`SUBMITTING` 用 setTimeout 模拟延迟（500-1000ms）。

---

## Key Cases

### 行业参考

**案例 1：美团外卖 / 饿了么**
- 核心流程：首页→列表→详情→加购→购物车→确认→结果
- 关键设计：购物车底部悬浮栏、菜品分类锚点、规格选择弹窗
- **启示：MVP 不需规格弹窗，但应有购物车悬浮栏**

**案例 2：DoorDash / Uber Eats**
- 大图菜品卡片、评分、配送时间预估
- **启示：wfood 拟物化风格与海外扁平化形成差异，是设计辨识度**

**案例 3：GitHub Vue3 外卖开源项目**
- 常见栈：Vue3 + Pinia + Vue Router + Vant4（移动端）或 Element Plus（桌面端）
- **启示：组件库取决于目标平台**

### 反证

**案例 4：购物车状态丢失** → 用组件内 state，切换页面就丢。**必须 Pinia + localStorage。**

**案例 5：Mock 与真实接口脱节** → Mock 字段名与后续 API 不一致，对接时大面积重构。**先定义接口契约，Mock 按契约生成。**

**案例 6：拟物化做成"丑陋拟物"** → 阴影过重、纹理太显、颜色刺眼。**关键是"克制"——阴影柔和、纹理微弱、颜色有深度。**

**案例 7：不做路由守卫** → 未登录直接访问购物车/订单。**必须 beforeEach 守卫。**

---

## Industry Norms

1. **核心链路**：浏览→加购→下单→结果。全行业一致。
2. **购物车**：底部悬浮栏 + 弹出详情。美团/饿了么/DoorDash 一致。
3. **店铺详情布局**：左侧分类 + 右侧菜品（桌面），顶部分类 + 下方瀑布流（移动）。
4. **Vue3 项目结构**：`api/` `assets/` `components/` `router/` `stores/` `views/` `utils/`
5. **Mock 与接口分离**：api 层定义签名，mock 实现可替换。
6. **登录态**：localStorage 存 token，axios 拦截器附加 header。
7. **Vite 构建**：`npm run build` → `dist/`，可直接部署静态托管。

---

## Failure Cases

1. **功能膨胀**：外卖平台完整功能极其庞大，MVP 必须严格收口"浏览→加购→下单"。
2. **拟物化过度**：全局纹理和阴影 → 页面"重"且加载慢。拟物化应是点缀。
3. **购物车逻辑遗漏**：删除最后一个商品、店铺切换清空规则、价格小数精度（`toFixed(2)`）。
4. **Mock 硬编码到组件**：`<div>{{ "宫保鸡丁" }}</div>`——后续替换需大面积改动。
5. **不做响应式**：Brief 未明确桌面/移动优先。

---

## User Scenario Keywords

`外卖平台` · `模拟点餐` · `店铺浏览` · `购物车` · `下单流程` · `Vue3` · `Pinia` · `拟物化UI` · `Mock数据` · `RESTful接口` · `绿色主题`

---

## Evidence Strength

### Strong
- 外卖平台核心页面流（行业一致）
- 购物车全局状态管理 + 持久化（Pinia + localStorage）
- Vue3 + Pinia + Vue Router（Vue 官方推荐）
- Mock 与接口层分离
- 路由守卫

### Medium
- 拟物化 UI 设计要素
- Mock 方案选择（localStorage + JSON 混合）
- 下单流程状态机
- 项目目录结构

### Weak
- 平台优先级（桌面 vs 移动，Brief 未明确）
- UI 组件库选型（取决于平台）
- 拟物化审美偏好

---

## Implications for Product Decision

### Brief 补充建议

1. **Target User**：面向谁？学习项目？面试作品？
2. **平台优先级**：桌面 vs 移动？（影响组件库和布局）
3. **Success Criteria**：完成标准？
4. **Non-Goals**：商家后台、骑手端、真实支付等明确排除
5. **店铺数据**：真实图片 vs 占位图？
6. **地址管理**：MVP 是否包含？

### MVP 功能收口建议

| 必须有 | 可延后 | 不做 |
|-------|-------|------|
| 登录/注册 | 地址管理 | 商家后台 |
| 店铺列表（搜索/筛选） | 订单历史 | 骑手端 |
| 店铺详情 + 菜单 | 评价系统 | 真实支付 |
| 购物车（加减/删除/汇总） | 优惠券/满减 | 多人拼单 |
| 确认订单（模拟地址） | 菜品规格选择 | 配送追踪 |
| 下单结果页 | 收藏 | 消息推送 |

### 关键架构决策

1. **Mock 策略**：localStorage + JSON 混合，接口层统一抽象
2. **UI 组件库**：移动→Vant4，桌面→Element Plus / Naive UI，两者兼顾→Tailwind
3. **拟物化实现**：CSS 变量统一管理阴影/纹理/颜色参数
4. **购物车**：Pinia store + localStorage + 店铺隔离规则（需确认）

### 关于流程路径

**建议走完 Phase 2-4。** 存在多个产品层决策（平台优先级、MVP 边界、店铺隔离规则、地址策略），拟物化 UI 有设计定义需求，架构决策需要明确。

---

## Recommendation to pm-core

### 建议保留
- Vue3 + Vite + Pinia + Vue Router
- 绿色主色调 + 橙色重点色
- 拟物化 UI
- 纯前端 + 预留后端接口
- 输出到 dist

### 建议补充
- 平台优先级（桌面/移动/响应式）
- 完整 Non-Goals
- 购物车店铺隔离规则
- Mock 策略定义
- 地址管理策略（MVP 用模拟地址）

### 建议警惕
- **功能膨胀**：MVP 严守"浏览→加购→下单"
- **拟物化过度**：阴影/纹理克制
- **Mock 硬编码**：数据必须从 api 层获取
- **购物车丢失**：Pinia + localStorage 持久化
- **无路由守卫**：未登录保护

### 待确定
- 平台优先级？
- 购物车店铺隔离规则？
- MVP 页面清单？
- 菜品数据：真实图 vs 占位图？
- 地址管理策略？
- 组件库选型？

---

## 附注

受限于 API 额度不足，未进行实时外部搜索。以上基于外卖平台产品经验、Vue3 生态知识和前端架构实践。Strong 证据项在业界有大量一致实践。

---

文件已写入：`_pipeline_runs/root-openclaw-projects-projects-task-20260326-190327/20260326_190327/02_research_digest.md`

核心结论：**wfood Brief 信息量足够启动研究但仍需补全标准字段。技术方案锁定 Vue3+Pinia+Vue Router，Mock 用 localStorage+JSON 混合，接口层统一抽象。MVP 严守"浏览→加购→下单"核心链路，功能边界是最大风险。拟物化 UI 的关键在于"克制"。建议走完 Phase 2-4，pm-core 优先确认平台优先级和功能边界。**
