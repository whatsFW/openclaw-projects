import { defineStore } from 'pinia'

const STORAGE_KEY = 'wfood_cart'

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* corrupted data, ignore */ }
  return { shopId: null, shopName: '', items: [] }
}

export const useCartStore = defineStore('cart', {
  state: () => loadCart(),
  getters: {
    totalCount: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    isEmpty: (state) => state.items.length === 0
  },
  actions: {
    addItem(shopId, shopName, item) {
      // 店铺隔离
      if (this.shopId && this.shopId !== shopId) {
        this.shopId = null
        this.shopName = ''
        this.items = []
      }
      this.shopId = shopId
      this.shopName = shopName
      const existing = this.items.find(i => i.id === item.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1
        })
      }
      this._save()
    },
    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id)
      if (this.items.length === 0) {
        this.shopId = null
        this.shopName = ''
      }
      this._save()
    },
    updateQuantity(id, quantity) {
      const item = this.items.find(i => i.id === id)
      if (!item) return
      if (quantity <= 0) return this.removeItem(id)
      item.quantity = quantity
      this._save()
    },
    clear() {
      this.shopId = null
      this.shopName = ''
      this.items = []
      this._save()
    },
    _save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        shopId: this.shopId,
        shopName: this.shopName,
        items: this.items
      }))
    }
  }
})
