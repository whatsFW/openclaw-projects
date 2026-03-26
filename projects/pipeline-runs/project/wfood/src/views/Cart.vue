<template>
  <div class="cart-page">
    <h2 class="page-title">购物车</h2>

    <div class="cart-empty card-skeuo" v-if="cartStore.isEmpty">
      <div class="empty-icon">🛒</div>
      <p class="empty-text">购物车是空的</p>
      <router-link to="/shops" class="btn-skeuo btn-skeuo--primary">去逛逛</router-link>
    </div>

    <template v-else>
      <p class="cart-shop-name">来自「{{ cartStore.shopName }}」</p>
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item card-skeuo">
          <div class="item-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <span class="item-price">¥{{ item.price }}</span>
          </div>
          <div class="item-stepper">
            <button
              class="btn-skeuo btn-skeuo--secondary btn-step"
              @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
            >−</button>
            <span class="step-count">{{ item.quantity }}</span>
            <button
              class="btn-skeuo btn-skeuo--primary btn-step"
              @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
            >+</button>
          </div>
          <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          <button
            class="btn-skeuo btn-skeuo--secondary btn-delete"
            @click="cartStore.removeItem(item.id)"
          >删除</button>
        </div>
      </div>

      <div class="cart-footer card-skeuo">
        <div class="cart-total">
          <span>合计</span>
          <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <button
          class="btn-skeuo btn-skeuo--primary btn-checkout"
          @click="$router.push('/order/confirm')"
        >
          去结算
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
</script>

<style scoped>
.cart-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: var(--color-text); }
.cart-shop-name { font-size: 14px; color: var(--color-text-light); margin-bottom: 16px; }
.cart-empty {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: var(--color-text-light); margin-bottom: 20px; }
.cart-items { display: flex; flex-direction: column; gap: 12px; }
.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}
.item-image { width: 60px; height: 60px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 15px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
.item-price { font-size: 14px; color: var(--color-text-light); }
.item-stepper { display: flex; align-items: center; gap: 8px; }
.btn-step {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 16px;
  line-height: 26px;
  border-radius: 50%;
  text-align: center;
}
.step-count { min-width: 24px; text-align: center; font-weight: 600; font-size: 15px; }
.item-subtotal { min-width: 60px; text-align: right; font-size: 16px; font-weight: 700; color: var(--color-accent); }
.btn-delete { padding: 6px 12px; font-size: 13px; }
.cart-footer {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  max-width: calc(100% - 48px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  z-index: 100;
  background: var(--color-bg);
  box-shadow: 0 -2px 12px var(--shadow-md);
}
.cart-total { font-size: 16px; }
.total-price { font-size: 22px; font-weight: 700; color: var(--color-accent); margin-left: 8px; }
.btn-checkout { padding: 10px 32px; font-size: 16px; }
</style>
