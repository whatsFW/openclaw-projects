[plugins] feishu_doc: Registered feishu_doc, feishu_app_scopes
[plugins] feishu_chat: Registered feishu_chat tool
[plugins] feishu_wiki: Registered feishu_wiki tool
[plugins] feishu_drive: Registered feishu_drive tool
[plugins] feishu_bitable: Registered bitable tools
[plugins] [DingTalk] 插件已注册（支持主动发送 AI Card 消息）
Product Spec 已收口，写入：

`_pipeline_runs/root-openclaw-projects-projects-task-20260326-190327/20260326_190327/05_product_spec.md`

---

# Product Spec：wfood 外卖模拟平台

## Meta
- artifact_type: Product Spec
- owner: pm-core
- phase: Phase 3 产品收口
- version: v1
- status: READY
- date: 2026-03-26
- related_task: task-20260326-190327
- upstream_inputs: `01_task_brief.md` (v1), `03_pm_ideal_debate.md` (v1), `04_pm_real_debate.md` (v1), `02_research_digest.md` (v1)
- downstream_target: architect

---

## Problem Definition

**核心问题：** 用户需要一个能走通"登录 → 浏览店铺 → 选商品 → 加购物车 → 下单"完整流程的外卖模拟平台——不依赖后端，但架构上预留真实后端对接能力。

**Brief 质量评估：** Goal 包含可辨识的功能列表、技术栈、视觉方向、交付要求。仍缺少 Target User、Success Criteria、Non-Goals。pm-core 自行补全。

**关键判断：**
- **拟物化程度：** 收口为"轻度拟物"——核心组件（按钮/输入框/卡片/导航栏）拟物化，次要组件简化。全面拟物化 CSS 工作量占 40%+，轻度拟物控制成本。
- **功能边界：** 严守"浏览 → 加购 → 下单"核心链路。搜索/评价/订单历史/地址/支付/优惠券全部排除。
- **平台：** 桌面端为主，不做移动端适配。

---

## Target User

**核心用户：** 前端开发者/学习者——需要 Vue3 全家桶实战项目，展示组件化、状态管理、路由、Mock 数据架构能力。

**使用环境：** 桌面浏览器，本地运行或 `dist/` 静态部署。

---

## Core Scenarios

### 场景 1：完整购买流程
登录 → 店铺列表 → 店铺详情 → 加入购物车 → 购物车页 → 确认订单 → 提交成功。

### 场景 2：未登录拦截
未登录时访问店铺/购物车页，路由守卫拦截并跳转登录页。

### 场景 3：购物车持久化
添加商品后刷新页面，购物车数据保留（localStorage）。

---

## Product Goal

> 交付一个完整的外卖模拟平台——能走通从登录到下单的全流程，拟物化 UI 有辨识度，架构预留后端对接能力。

---

## Core Features

### F1：登录注册（2 页）
- **登录页：** 账号 + 密码表单，模拟校验（任意非空输入通过），登录成功跳店铺列表，失败提示。注册入口链接。
- **注册页：** 账号 + 密码 + 确认密码，密码一致即通过，成功后跳登录页（自动填充账号）。

### F2：店铺列表页
- 店铺卡片列表（8-12 家 Mock 店铺）
- 每张卡片：店铺图片（占位图）、名称、评分、月售量、配送费、预计送达时间
- 点击 → 店铺详情页

### F3：店铺详情页
- 店铺头部（名称、评分、公告）
- 商品列表：名称、图片（占位图）、描述、价格、"+"按钮
- 点击"+" → 加入购物车
- 底部悬浮购物车栏：商品数量 + 总价，点击可跳转购物车页或展开详情

### F4：购物车页
- 商品列表：名称、单价、数量 +/- stepper、小计
- 删除按钮
- 底部：总价 + "去结算"
- LocalStorage 持久化
- 店铺隔离：切换店铺清空购物车

### F5：确认订单页
- 商品汇总（不可编辑）
- 默认地址（写死："北京市朝阳区 XX 路 100 号"）
- 备注输入框（可选）
- 总价明细（商品总价 + 配送费）
- "提交订单" → 模拟延迟 500ms → Toast "下单成功" → 跳转店铺列表

### F6：拟物化 UI
- **核心组件拟物化：** 按钮（凸起阴影 + 按下 inset）、输入框（内凹阴影 + 底边高光）、卡片（轻微凸起 + 自然投影）、导航栏（底部渐变 + 阴影）
- **共享 Design Token：** 阴影值、圆角 8-12px、高光线、按钮渐变
- **配色：** 绿色主色 `#43A047` / `#2E7D32`，橙色重点 `#F57C00` / `#E65100`，背景 `#f5f0eb`
- **次要组件简化：** 列表项、分割线、标签不做完整拟物化

---

## MVP Scope

| 模块 | 包含内容 |
|---|---|
| 登录注册 | 登录页 + 注册页（表单 + 模拟校验） |
| 店铺浏览 | 店铺列表页（8-12 家卡片）+ 店铺详情页（菜品 + 加购） |
| 购物车 | 购物车页（增删改数量 + 价格）+ LocalStorage + 底部悬浮栏 |
| 下单流程 | 确认订单页（汇总 + 默认地址 + 提交 + Toast） |
| 拟物化 UI | 核心组件拟物化 + 共享 Design Token |
| 路由 | Vue Router + 登录守卫 |
| 状态管理 | Pinia（UserStore / CartStore） |
| Mock 数据 | JSON + API 调用层抽象 |
| 技术栈 | Vue3 + Vite + Pinia + Vue Router |
| 交付 | `npm run build` → `dist/` |

---

## Non-Goals

1. 搜索 / 筛选 / 排序
2. 评价 / 评分系统
3. 订单历史 / 个人中心
4. 优惠券 / 促销 / 满减
5. 地址管理（用默认地址）
6. 支付方式选择（提交即成功）
7. 第三方登录
8. 跨店购物车（单店，切换清空）
9. 订单跟踪 / 配送状态
10. 菜品规格选择
11. 移动端适配
12. 暗色模式
13. 收藏 / 关注
14. 商家后台 / 骑手端
15. 真实后端

---

## Priority

### P0 — 必须完成

| ID | 功能 | 理由 |
|---|---|---|
| P0-1 | 登录注册（表单 + 模拟校验 + 路由守卫） | 入口和鉴权 |
| P0-2 | 店铺列表页（卡片 + Mock 数据） | 浏览入口 |
| P0-3 | 店铺详情页（菜品 + 加入购物车） | 选商品核心交互 |
| P0-4 | 购物车（增删改数量 + 价格 + LocalStorage） | 购买流程核心 |
| P0-5 | 确认订单页（汇总 + 默认地址 + 提交 + Toast） | 下单闭环 |
| P0-6 | 拟物化 UI（按钮/输入框/卡片/导航栏） | Brief 明确要求 |
| P0-7 | 路由守卫（未登录重定向） | 安全基础 |
| P0-8 | API 调用层抽象 | Brief 明确要求 |

### P1 — 完成度分水岭

| ID | 功能 | 理由 |
|---|---|---|
| P1-1 | 底部悬浮购物车栏 | 外卖平台标准交互 |
| P1-2 | 购物车展开/收起交互 | 快速操作 |
| P1-3 | 表单验证（空值/密码一致） | 基本体验 |
| P1-4 | 注册成功自动填充登录账号 | 流程衔接 |

### P2 — 有则更好

| ID | 功能 |
|---|---|
| P2-1 | 加购飞入动画 |
| P2-2 | 购物车角标弹跳 |
| P2-3 | 店铺详情页头部拟物质感 |
| P2-4 | Mock 数据真实感（图片占位有品类感） |

---

## Key Trade-offs

**取舍 1：轻度拟物而非全面拟物** — 全面拟物 CSS 占 40%+。轻度拟物聚焦核心组件，共享 Token 控制成本。

**取舍 2：6 个页面最小粒度** — 每个页面粒度明确，不存在歧义。代价：无搜索/筛选/地址管理/订单历史。

**取舍 3：单店购物车** — 切换店铺清空。避免跨店状态复杂度。

**取舍 4：JSON + localStorage 混合 Mock** — 只读数据用 JSON，购物车/用户态用 localStorage。API 层统一抽象。

**取舍 5：桌面端为主** — 模拟平台展示流程为主，桌面足够。

---

## Locked Decisions

1. Vue3 + Vite + Pinia + Vue Router
2. 轻度拟物化 UI（核心组件 + 共享 Design Token）
3. 绿色主色 + 橙色重点色
4. 6 个核心页面
5. 单店购物车 + LocalStorage 持久化
6. Mock JSON + localStorage 混合，API 层抽象
7. 默认地址写死
8. 提交即成功（Toast），无支付流程
9. 桌面端为主
10. 输出到 `dist/`

---

## Open Questions

1. **店铺/菜品图片** —— 建议用图片占位服务（picsum.photos）。
2. **购物车店铺隔离** —— 建议切换店铺清空。
3. **注册后用户数据** —— 建议 localStorage 持久化。

---

## Handoff to architect

1. **Vue3 标准项目结构：** `api/`（接口调用层）、`components/`（WButton / WInput / WCard / WStepper / WCartBar）、`stores/`（user.ts / cart.ts）、`views/`（6 个页面）、`router/`（路由 + 守卫）、`data/`（Mock JSON）、`styles/`（Design Token CSS 变量）。

2. **API 调用层是"预留后端接口"的核心载体。** 函数签名和返回值结构必须与未来真实后端一致。当前 Mock 实现，后续只改实现不动业务代码。

3. **购物车 Store（Pinia）：** items 数组 + totalPrice / totalItems getters + addItem / removeItem / updateQuantity / clearCart actions。`$subscribe` 监听变化 → localStorage。进入店铺详情时检查 shopId，不匹配则清空。

4. **拟物化 Design Token：** CSS 变量统一管理阴影、圆角、渐变、颜色。所有组件共享。

5. **路由守卫：** `beforeEach` 检查 `userStore.isLoggedIn`，未登录且目标非 login/register → 重定向。

6. **Mock 数据：** `data/shops.json` 含 8-12 家店铺，每家 8-15 个菜品。数据结构与 API 返回值一致。

7. **不可被架构覆盖的体验：**
   - 拟物化 UI 全产品一致
   - 购物车交互反馈即时（添加 → 角标变化 → 价格更新）
   - 完整购买流程不断裂
   - 以上如无法实现，**退回 pm-core**
