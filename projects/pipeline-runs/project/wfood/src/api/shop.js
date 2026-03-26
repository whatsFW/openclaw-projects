// shop API — 模拟实现
// 从 Mock JSON 读取数据，未来仅改此实现层

import shopsData from '../data/shops.json'

export function getShopList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(shopsData.map(s => ({
        id: s.id,
        name: s.name,
        image: s.image,
        rating: s.rating,
        monthlySales: s.monthlySales,
        deliveryFee: s.deliveryFee,
        deliveryTime: s.deliveryTime,
        notice: s.notice
      })))
    }, 200)
  })
}

export function getShopDetail(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shop = shopsData.find(s => s.id === id)
      if (!shop) {
        reject(new Error('店铺不存在'))
        return
      }
      resolve(shop)
    }, 200)
  })
}

export function submitOrder(order) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ orderId: 'ORD' + Date.now(), ...order })
    }, 500)
  })
}
