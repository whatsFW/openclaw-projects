// api/service.js — 统一 API 入口
// 业务代码应 import 此文件，不直接 import user.js/shop.js
// 未来对接真实后端时：仅修改 user.js 和 shop.js 内部实现，业务代码不变

export { login, register } from './user.js'
export { getShopList, getShopDetail, submitOrder } from './shop.js'
