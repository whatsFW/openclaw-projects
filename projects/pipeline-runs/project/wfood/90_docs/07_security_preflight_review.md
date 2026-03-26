[plugins] feishu_doc: Registered feishu_doc, feishu_app_scopes
[plugins] feishu_chat: Registered feishu_chat tool
[plugins] feishu_wiki: Registered feishu_wiki tool
[plugins] feishu_drive: Registered feishu_drive tool
[plugins] feishu_bitable: Registered bitable tools
[plugins] [DingTalk] 插件已注册（支持主动发送 AI Card 消息）
Gate: PASS

# Review Report

## Meta
- artifact_type: Review Report
- owner: security
- phase: Phase 5 设计预审
- version: v1
- status: READY
- date: 2026-03-26
- related_task: task-20260326-190327
- upstream_inputs: `05_product_spec.md` (v1), `06_architecture_spec.md` (v1)
- downstream_target: chief / engineer

---

## Scope Reviewed
- Product Spec 全文：需求定义、MVP 范围、Non-Goals、锁定决策、拟物化程度收口
- Architecture Spec 全文：技术方案、模块划分、数据流、API 层抽象、边界规则、验证检查点（CP1-CP14）
- 安全合规性：路由守卫、localStorage 使用、密码处理、API 层安全预留

---

## Key Findings

### F1：风险面窄，架构安全设计合理
纯前端模拟平台——无真实后端、无真实支付、无真实用户数据。架构在安全设计上已有明确考量：
- 登录态用内存变量（`isLoggedIn: boolean`），不持久化到 localStorage——刷新需重新登录
- 购物车数据通过 `$subscribe` → localStorage，与用户认证状态严格分离
- API 层统一抽象，为后续对接真实后端时集中添加安全措施预留位置

### F2：架构与产品定义高度一致
6 个页面、轻度拟物化、单店购物车、Mock + localStorage 混合数据源——架构忠实于产品锁定决策。API 层接口定义清晰，函数签名和返回值结构与未来真实后端一致。

### F3：边界规则清晰且合理
- views 不直接 import JSON（API 层是唯一数据入口）
- stores 不调 router.push（状态与导航分离）
- components 不调 stores（UI 组件无业务依赖）
- api 不调 stores（数据层不依赖状态层）

四条单向依赖规则完整覆盖了最常见的 Vue 项目架构腐化路径。

### F4：存在若干可改进的非阻断项
详见下文问题清单。

---

## Risk Levels

### Blocking
- 无

### High
- 无

### Medium
- 无

### Low

- **L1：localStorage `JSON.parse` 缺少异常处理**
  - 位置：Architecture Spec → CartStore 数据流 → `initialize` 时从 localStorage 读取
  - 影响：`$patch(JSON.parse(saved))` 如果 localStorage 数据被外部篡改或格式损坏（如浏览器扩展写入脏数据），`JSON.parse` 将抛异常，导致应用启动崩溃。
  - 修复建议：包裹 try-catch，解析失败时降级为空购物车并清除损坏的 localStorage 数据。

- **L2：Mock 注册用户数据持久化到 localStorage，明文存储密码**
  - 位置：Architecture Spec → api/user.ts → `register` 存入 localStorage
  - 影响：Mock 阶段 `register` 将用户名和密码明文写入 localStorage。虽然 architect 在 Security Focus Areas 中标注"生产环境需 hash"，但当前实现中 localStorage 中存在明文密码。如用户在公共设备上使用，密码可被直接读取。
  - 修复建议：在 `api/user.ts` 的 `register` 函数中添加注释明确标注此为 Mock 临时方案，生产环境必须 hash。不阻断当前开发。如需增强 Mock 安全性，可用 base64 编码（非加密，仅避免明文直接可读）。

- **L3：路由守卫白名单逻辑未在架构中显式定义**
  - 位置：Architecture Spec → R5
  - 影响：架构描述"白名单逻辑（login/register 不需 auth）"，但未明确白名单的具体实现方式——是硬编码路径列表，还是通过 `to.meta.requiresAuth` 判断。两种方式的安全性不同：meta 方式更安全（默认不 auth，需显式标记），硬编码方式易遗漏新页面。
  - 修复建议：明确使用 `meta.requiresAuth` 方式——默认页面不需要 auth，需保护的页面显式标记 `meta: { requiresAuth: true }`。在 Implementation Order 的步骤 6 中要求对所有 6 个路由逐一确认 meta 标记。

- **L4：购物车店铺隔离在 view 层处理，`addItem` action 本身不检查 shopId**
  - 位置：Architecture Spec → Boundaries 规则 4、CartStore 数据流
  - 影响：架构明确将店铺隔离逻辑放在 ShopDetailView `onMounted` 中（检查 `cartStore.shopId`，不匹配则 `clearCart()`），而 `addItem` action 不做检查。这意味着如果未来新增其他加购入口（如搜索结果页直接加购、收藏页加购），需要在每个入口重复隔离逻辑，容易遗漏。
  - 修复建议：将隔离逻辑下沉到 CartStore 的 `addItem` action 中——`addItem` 内部检查 `shopId`，不匹配则自动 `clearCart()`。view 层不再需要手动处理。这是更安全的单一职责分配。当前 MVP 只有一个加购入口，不阻断，但建议在架构层面修正。

---

## Blocking or Not
- **是否阻断推进：否**
- **原因：** 无高危安全问题，无边界失守。L1-L4 均为低风险改进项。架构安全设计合理，API 层抽象和登录态内存化体现了良好的安全意识。

---

## Fix Guidance

| 编号 | 风险等级 | 问题 | 修复方向 | 责任方 | 时点 |
|---|---|---|---|---|---|
| L1 | Low | localStorage JSON.parse 无异常处理 | `$patch` 前 try-catch，失败降级为空购物车 | engineer | 实现阶段 |
| L2 | Low | Mock 密码明文存储 | api/user.ts 中标注 Mock 临时方案；生产环境需 hash | architect/engineer | 实现阶段 |
| L3 | Low | 路由守卫白名单未显式定义 | 明确使用 `meta.requiresAuth`，默认不 auth | architect/engineer | 实现阶段前 |
| L4 | Low | 店铺隔离逻辑在 view 层而非 store 层 | 建议下沉到 CartStore.addItem 内部 | architect/engineer | 实现阶段前 |

---

## Recheck Points

1. **路由守卫完整性**：确认 6 个路由中，ShopListView、ShopDetailView、CartView、OrderConfirmView 标记 `meta: { requiresAuth: true }`，LoginView 和 RegisterView 不标记。未登录直接访问受保护 URL 应重定向到 /login。
2. **localStorage 不存密码**：确认 CartStore 只存储购物车数据（shopId + items），UserStore 的 `isLoggedIn` 不写入 localStorage。`api/user.ts` 的 Mock 注册数据标注为临时方案。
3. **购物车店铺隔离**：切换店铺后购物车清空，价格和角标正确更新。刷新页面后购物车数据保留。
4. **API 层唯一入口**：确认 views 中无 `import ... from '../../data/shops.json'`，所有数据通过 `api/` 层获取。
5. **拟物化 UI 一致性**：按钮（凸起+按下 inset）、输入框（内凹+底边高光）、卡片（轻微凸起+自然投影）全产品一致，通过 CSS 变量引用。
6. **完整流程不断裂**：登录→店铺列表→店铺详情→加购→购物车→确认订单→提交→Toast→跳转，每步可走通。
7. **`npm run build`**：构建成功，`dist/` 无报错、无警告。
8. **零外部安全风险**：无 CDN 加载脚本、无 eval、无 innerHTML 渲染用户数据。

---

## Acceptance Conclusion

**通过。**

架构安全设计合理——登录态内存化、API 层统一抽象、购物车与认证状态严格分离。风险面窄（纯前端模拟平台，无真实后端/支付/用户数据）。L1-L4 为低风险改进项，不构成阻断。其中 L4（店铺隔离逻辑下沉到 store）建议在架构层面修正，避免未来扩展时遗漏。

**放行条件：**
- L1（try-catch）建议在实现阶段处理
- L3（路由守卫 meta）建议在工程师开工前明确
- L4（隔离逻辑下沉）建议修正，不阻断
- 复检时按上述 8 个 Recheck Points 逐项验证
