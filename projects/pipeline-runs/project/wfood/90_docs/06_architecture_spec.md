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
- date: 2026-03-26
- related_task: task-20260326-190327
- upstream_inputs: `05_product_spec.md` (v1)
- downstream_target: security / engineer

---

## Technical Goal

在 Vue3 + Vite + Pinia + Vue Router 技术栈下，实现外卖模拟平台的 6 个核心页面（登录/注册/店铺列表/店铺详情/购物车/确认订单）。核心架构目标：API 调用层统一抽象（当前 Mock 实现，后续只改实现不动业务代码）；购物车状态通过 Pinia + localStorage 双层管理；拟物化 UI 通过共享 Design Token CSS 变量统一控制。

---

## Product Alignment

### 必须忠实实现的产品目标

| 产品要求 | 技术实现约束 |
|---|---|
| 登录注册：模拟校验（任意非空通过），注册后跳登录并自动填充 | `userStore.login()` 模拟延迟 + `router.push` |
| 店铺列表：8-12 家 Mock 店铺卡片 | `data/shops.json` → API 层 `getShopList()` |
| 店铺详情：菜品列表 + "+" 加入购物车 | `api.getShopDetail(id)` → `cartStore.addItem(shopId, item)` |
| 购物车：增删改数量 + 价格计算 + localStorage 持久化 | Pinia CartStore + `$subscribe` → localStorage |
| 购物车店铺隔离：切换店铺清空 | 店铺详情页 `onMounted` 检查 `shopId`，不匹配则 `clearCart()` |
| 确认订单：汇总 + 默认地址 + 提交 → Toast → 跳转 | 模拟 500ms 延迟 + `ElMessage` 或自定义 Toast |
| 拟物化 UI：按钮/输入框/卡片/导航栏 | 共享 CSS 变量 Design Token |
| 路由守卫：未登录拦截跳登录页 | `router.beforeEach` 检查 `userStore.isLoggedIn` |
| API 调用层抽象 | `api/` 目录统一导出，函数签名与未来真实后端一致 |
| 桌面端为主 | 不做移动端适配 |

### 不可被技术方案改写的边界

- 6 个页面，不多不少
- 单店购物车，切换店铺清空
- Mock JSON + localStorage 混合数据源
- 默认地址写死
- 提交即成功（Toast），无支付流程
- 拟物化 UI 全产品一致

---

## Overall Approach

**方案：** Vue3 标准 SPA 项目，Vite 构建，Pinia 状态管理，Vue Router 路由，Mock JSON 数据，API 层统一抽象。

**为什么选这条路径：**

1. 产品已锁定 Vue3 + Vite + Pinia + Vue Router——不存在选型空间。
2. API 调用层抽象是"预留后端对接能力"的核心载体。函数签名和返回值结构与未来真实后端一致，Mock 只是当前实现。
3. 拟物化 Design Token 通过 CSS 变量管理，所有组件共享，避免散落各处的硬编码值。
4. Pinia 的 `$subscribe` 天然支持购物车 localStorage 持久化，无需额外插件。

**项目结构：**

```
wfood/
├── public/
├── src/
│   ├── api/                    # API 调用层（统一抽象）
│   │   ├── index.ts            # 统一导出
│   │   ├── user.ts             # login / register
│   │   ├── shop.ts             # getShopList / getShopDetail
│   │   └── order.ts            # submitOrder
│   ├── components/             # 拟物化共享组件
│   │   ├── WButton.vue         # 凸起阴影 + 按下 inset
│   │   ├── WInput.vue          # 内凹阴影 + 底边高光
│   │   ├── WCard.vue           # 轻微凸起 + 自然投影
│   │   ├── WStepper.vue        # 数量 +/- 步进器
│   │   ├── WCartBar.vue        # 底部悬浮购物车栏
│   │   └── WToast.vue          # Toast 通知
│   ├── stores/                 # Pinia 状态管理
│   │   ├── user.ts             # UserStore
│   │   └── cart.ts             # CartStore
│   ├── views/                  # 6 个页面
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ShopListView.vue
│   │   ├── ShopDetailView.vue
│   │   ├── CartView.vue
│   │   └── OrderConfirmView.vue
│   ├── router/                 # 路由 + 守卫
│   │   └── index.ts
│   ├── data/                   # Mock 数据
│   │   ├── shops.json          # 8-12 家店铺
│   │   └── users.json          # 预置用户（可选）
│   ├── styles/                 # 拟物化 Design Token
│   │   ├── tokens.css          # CSS 变量定义
│   │   └── global.css          # 全局基础样式
│   ├── App.vue
│   └── main.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── dist/                       # npm run build 输出
```

---

## Module Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                      App.vue                             │
│              (RouterView + 全局布局)                      │
├──────────┬──────────┬───────────┬───────────────────────┤
│  views/  │  stores/ │   api/    │    components/        │
│          │          │           │                       │
│ 6 个页面  │ user.ts  │ user.ts   │ WButton / WInput     │
│ 路由出口  │ cart.ts  │ shop.ts   │ WCard / WStepper     │
│          │          │ order.ts  │ WCartBar / WToast     │
├──────────┴──────────┴───────────┴───────────────────────┤
│         data/ (Mock JSON)    styles/ (Design Token)     │
└─────────────────────────────────────────────────────────┘
```

### 模块职责总表

| 模块 | 职责 | 边界 |
|---|---|---|
| `api/` | 统一数据接口层 | 不含 UI 逻辑；返回值结构固定，与真实后端一致 |
| `stores/` | 全局状态管理 | 不含路由跳转逻辑（由 views 调用 router） |
| `views/` | 页面级组件 | 不定义共享 UI 组件；通过 stores 读写状态 |
| `components/` | 拟物化共享 UI 组件 | 无业务逻辑；通过 props/emits 通信 |
| `router/` | 路由定义 + 守卫 | 不含业务逻辑；只检查 `userStore.isLoggedIn` |
| `data/` | Mock JSON 数据 | 不含逻辑；纯数据文件 |
| `styles/` | Design Token CSS 变量 | 不含组件级样式；只定义变量 |

---

## Boundaries / Responsibilities

### 关键边界规则

1. **API 层是唯一的数据入口：** views 不直接 import `data/*.json`，必须通过 `api/` 层调用。后续对接真实后端时，只改 `api/` 实现，不动 views 和 stores。
2. **stores 不调 router：** Store 中不包含路由跳转。登录成功后的跳转在 LoginView 中调用 `router.push`。Store 只管状态。
3. **components 无业务逻辑：** WButton 不知道什么是"登录"，WStepper 不知道什么是"购物车"。所有业务语义由 views 和 stores 承担。
4. **购物车店铺隔离在 view 层处理：** ShopDetailView `onMounted` 检查 `cartStore.shopId`，不匹配则 `cartStore.clearCart()`。Store 本身不主动清空。
5. **localStorage 持久化在 Store 层：** CartStore 用 `$subscribe` 监听变化自动写入，`initialize` 时从 localStorage 读取。views 不直接操作 localStorage。

### 不允许越界的点

| 规则 | 原因 |
|---|---|
| views 不直接 import JSON | 保证 API 层是唯一数据入口 |
| stores 不调 router.push | 状态与导航分离 |
| components 不调 stores | UI 组件无业务依赖 |
| api 不调 stores | 数据层不应依赖状态层 |

---

## Data Flow / State Flow

### 数据流总览

```
Mock JSON ──→ api/ ──→ stores ──→ views ──→ components
                   ↑                               │
                   │          emits/events         │
                   └───────────────────────────────┘
```

### UserStore 数据流

```typescript
// stores/user.ts
interface UserState {
  isLoggedIn: boolean;
  username: string | null;
}

// 登录流程
LoginView 表单提交
  → api.login(username, password)        // 模拟校验 + 200ms 延迟
  → 成功 → userStore.setLoggedIn(username)
  → router.push('/shops')
  → 失败 → 显示错误提示

// 注册流程
RegisterView 表单提交
  → api.register(username, password)     // 模拟注册 + 200ms 延迟
  → 成功 → router.push({ path: '/login', query: { username } })
  → LoginView 读取 query.username 自动填充

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});
```

### CartStore 数据流

```typescript
// stores/cart.ts
interface CartItem {
  id: string;          // 菜品 ID
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  shopId: string | null;
  shopName: string;
  items: CartItem[];
}

// 关键 getters
totalPrice: number     // items.reduce((sum, i) => sum + i.price * i.quantity, 0)
totalItems: number     // items.reduce((sum, i) => sum + i.quantity, 0)

// 关键 actions
addItem(shopId, shopName, item)    // 同店追加 / 异店清空后新增
removeItem(itemId)
updateQuantity(itemId, delta)      // +1 / -1，quantity=0 时移除
clearCart()

// localStorage 持久化
const cart = useCartStore();
cart.$subscribe((mutation, state) => {
  localStorage.setItem('wfood_cart', JSON.stringify(state));
});
// 初始化时
const saved = localStorage.getItem('wfood_cart');
if (saved) cart.$patch(JSON.parse(saved));
```

### 店铺详情 → 购物车交互流

```
用户点击菜品 "+" 按钮
  → ShopDetailView 调用 cartStore.addItem(currentShopId, currentShopName, menuItem)
  → CartStore 检查 shopId：
    - 相同 → items 中追加或 quantity+1
    - 不同 → clearCart() 再添加
  → $subscribe 触发 → localStorage 更新
  → WCartBar（底部悬浮栏）通过 store getters 响应更新
  → 角标数量 + 总价实时变化
```

### API 调用层接口定义

```typescript
// api/user.ts
export async function login(username: string, password: string): Promise<{ success: boolean; message?: string }>
export async function register(username: string, password: string): Promise<{ success: boolean; message?: string }>

// api/shop.ts
export interface Shop { id: string; name: string; image: string; rating: number; monthlySales: number; deliveryFee: number; deliveryTime: string; }
export interface MenuItem { id: string; name: string; image: string; description: string; price: number; }
export async function getShopList(): Promise<Shop[]>
export async function getShopDetail(shopId: string): Promise<{ shop: Shop; menu: MenuItem[] }>

// api/order.ts
export interface OrderPayload { shopId: string; items: CartItem[]; address: string; remark: string; totalPrice: number; }
export async function submitOrder(payload: OrderPayload): Promise<{ success: boolean; orderId: string }>
```

**当前 Mock 实现：** `login` 任意非空通过；`register` 存入 localStorage；`getShopList` 读 `data/shops.json`；`submitOrder` 模拟 500ms 返回成功。

**后续对接真实后端：** 只改上述函数内部实现（fetch/axios 调后端接口），函数签名和返回值结构不变。业务代码零修改。

---

## Implementation Order

| 顺序 | 内容 | 涉及文件 | 理由 |
|---|---|---|---|
| 1 | 项目初始化 | `npm create vite` + 安装 Vue3/Pinia/VueRouter | 基础设施 |
| 2 | Design Token + 全局样式 | `styles/tokens.css` + `styles/global.css` | 拟物化基础，所有组件共享 |
| 3 | 拟物化共享组件 | `components/W*.vue`（6 个组件） | 视觉基础，后续页面直接复用 |
| 4 | Mock 数据 | `data/shops.json` | API 层依赖的数据源 |
| 5 | API 调用层 | `api/user.ts` + `api/shop.ts` + `api/order.ts` | 统一数据入口 |
| 6 | Router + 守卫 | `router/index.ts` | 路由骨架 |
| 7 | UserStore + 登录/注册页 | `stores/user.ts` + `LoginView` + `RegisterView` | 入口流程 |
| 8 | CartStore | `stores/cart.ts` | 购物车状态核心 |
| 9 | 店铺列表页 | `ShopListView` | 浏览入口 |
| 10 | 店铺详情页 + 底部购物车栏 | `ShopDetailView` + `WCartBar` | **加购核心交互** |
| 11 | 购物车页 | `CartView` | 购物车管理 |
| 12 | 确认订单页 | `OrderConfirmView` | 下单闭环 |
| 13 | 全量检查 | CP1-CP14 | 最终验收 |

**关键检查点：**
- **步骤 3 后：** 验证 4 种核心组件（按钮/输入框/卡片/步进器）的拟物化效果一致。
- **步骤 7 后：** 验证登录→路由守卫→店铺列表跳转流程完整。
- **步骤 10 后：** 验证加购→购物车栏更新→localStorage 持久化→刷新后数据保留。
- **步骤 12 后：** 验证完整流程"登录→浏览→加购→购物车→提交→Toast→跳转"不断裂。

---

## Dependencies

### 外部依赖

| 依赖 | 版本 | 用途 |
|---|---|---|
| vue | ^3.4 | 框架 |
| vue-router | ^4.3 | 路由 |
| pinia | ^2.1 | 状态管理 |
| vite | ^5.x | 构建工具 |
| typescript | ^5.x | 类型系统 |

### 内部前置

```
styles/tokens.css  ← components/（所有组件引用 CSS 变量）
data/shops.json    ← api/shop.ts（import JSON）
api/               ← stores/（store actions 调用 api）
api/               ← views/（部分页面直接调用 api）
stores/            ← views/（页面读写 store）
stores/            ← router/（守卫检查 userStore）
components/        ← views/（页面使用共享组件）
```

### 工具链依赖
- Node.js + npm（Vite 构建）
- 无后端服务依赖

---

## Risks

| ID | 风险 | 影响 | 缓解措施 |
|---|---|---|---|
| R1 | **拟物化 CSS 工作量膨胀** | 开发时间超出预期 | 严守"轻度拟物"：只做 4 种核心组件 + 共享 Token，次要组件用简化样式。Token 统一管理避免散落。 |
| R2 | **购物车店铺隔离逻辑遗漏** | 切换店铺后购物车未清空，价格混乱 | ShopDetailView `onMounted` 中显式检查 shopId，不匹配则 clearCart；P0-4 明确要求 |
| R3 | **API 层与业务代码耦合** | views 直接 import JSON，后续对接后端需改业务代码 | API 层是唯一数据入口，eslint 规则或代码审查禁止 views 直接 import `data/` |
| R4 | **localStorage 数据结构变更** | 版本升级后旧数据格式不兼容 | localStorage key 加版本号前缀（如 `wfood_v1_cart`）；initialize 时 try-catch JSON.parse |
| R5 | **路由守卫遗漏某些路径** | 未登录用户可直接访问受保护页面 | 路由 meta 中 `requiresAuth` 统一标记；beforeEach 中白名单逻辑（login/register 不需 auth） |
| R6 | **Mock 数据不够真实** | 产品展示效果打折 | 使用 picsum.photos 占位图；菜品数据参考真实外卖平台结构 |

---

## Validation / Checkpoints

| 编号 | 检查内容 | 通过标准 |
|---|---|---|
| CP1 | 项目可运行 | `npm run dev` 后浏览器打开无报错 |
| CP2 | 拟物化 UI 一致性 | 按钮凸起+按下 inset、输入框内凹、卡片投影、导航栏阴影——全产品一致 |
| CP3 | Design Token 统一 | 所有阴影/圆角/颜色通过 CSS 变量引用，无硬编码值散落 |
| CP4 | 登录注册 | 任意非空登录通过；注册成功跳登录并自动填充账号；空值校验 |
| CP5 | 路由守卫 | 未登录访问 /shops → 重定向 /login |
| CP6 | 店铺列表 | 8-12 家店铺卡片可见，点击跳详情 |
| CP7 | 店铺详情 | 菜品列表可见，"+" 按钮可加购 |
| CP8 | **购物车核心** | 加购后底部栏角标+总价更新；刷新页面数据保留；切换店铺清空 |
| CP9 | 购物车页 | 数量 +/- 更新价格；删除商品；总价正确 |
| CP10 | 确认订单 | 汇总正确；默认地址显示；提交→Toast→跳转店铺列表 |
| CP11 | 完整流程不断裂 | 登录→浏览→加购→购物车→提交→成功，每步可走通 |
| CP12 | API 层抽象 | views 不直接 import JSON；函数签名清晰 |
| CP13 | `npm run build` | 构建成功，`dist/` 可部署 |
| CP14 | 无控制台报错 | 全流程无红字错误 |

---

## Security Focus Areas

本项目为纯前端模拟平台，无真实后端，无真实支付，无真实用户数据。安全风险低，但需关注以下架构层面的正确性：

### 建议重点检查项

1. **路由守卫完整性：** 确认所有需要 auth 的页面都标记了 `meta.requiresAuth`；守卫逻辑正确（白名单 + auth 检查）。
2. **localStorage 数据安全：** 购物车数据存储在 localStorage 中，明文。确认不存储敏感信息（密码不写入 localStorage）。用户登录态用内存变量（`isLoggedIn: boolean`），不持久化到 localStorage——刷新需重新登录。
3. **API 层注入风险：** Mock 实现阶段无风险。后续对接真实后端时需注意输入校验（XSS/SQL 注入）。当前阶段在 API 层注释标注"后续需加输入清洗"。
4. **密码处理：** Mock 阶段密码不加密。在 `api/user.ts` 中注释标注"生产环境需 hash"。

### 高敏感位
- **无真实安全风险。** 但架构必须保证：后续对接真实后端时，安全措施只需在 API 层添加，不动业务代码。

---

## Handoff to security / engineer

### 对 security
- 风险面窄：纯前端模拟平台，无真实后端，无真实支付
- 重点确认：路由守卫完整性、localStorage 不存密码、API 层预留安全注释
- 无高危阻断项，建议快速通过预审

### 对 engineer
- 按 Implementation Order 执行：项目初始化 → Design Token → 共享组件 → Mock 数据 → API 层 → Router → UserStore + 登录注册 → CartStore → 店铺列表 → **店铺详情 + 购物车栏（步骤 10 核心验证点）** → 购物车页 → 确认订单 → 全量检查
- **API 层是架构核心。** 所有数据必须通过 `api/` 层获取，views 不直接 import JSON。函数签名和返回值结构与未来真实后端一致。
- **购物车店铺隔离必须在 ShopDetailView `onMounted` 中显式处理。** 不依赖用户行为，不依赖 Store 内部逻辑。
- **Design Token 先行。** 先定义好所有 CSS 变量，再做组件。避免后期统一修改拟物化样式。
- **UserStore 不持久化登录态。** `isLoggedIn` 为内存变量，刷新页面需重新登录。这是故意的设计——避免 localStorage 中存储认证状态。
- `npm run build` 输出到 `dist/`，可直接部署为静态站点。
- 三个不可协商的体验点（退回条件）：
  1. 拟物化 UI 全产品一致（CP2 + CP3）
  2. 购物车加购→刷新保留→切换店铺清空全部正确（CP8）
  3. 完整购买流程不断裂（CP11）
