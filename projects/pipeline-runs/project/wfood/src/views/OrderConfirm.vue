<template>
  <div class="order-page">
    <h2 class="page-title">确认订单</h2>

    <!-- 商品汇总 -->
    <div class="section card-skeuo">
      <h3 class="section-title">订单商品</h3>
      <div class="order-items">
        <div v-for="item in cartStore.items" :key="item.id" class="order-item">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-qty">x{{ item.quantity }}</span>
          <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- 配送信息 -->
    <div class="section card-skeuo">
      <h3 class="section-title">配送信息</h3>
      <div class="info-row">
        <span class="info-label">收货地址</span>
        <span class="info-value">{{ defaultAddress }}</span>
      </div>
    </div>

    <!-- 备注 -->
    <div class="section card-skeuo">
      <h3 class="section-title">备注</h3>
      <textarea
        v-model="remark"
        class="input-skeuo remark-input"
        placeholder="选填，如：少放辣、不要葱等"
        rows="2"
      ></textarea>
    </div>

    <!-- 价格明细 -->
    <div class="section card-skeuo">
      <h3 class="section-title">价格明细</h3>
      <div class="price-row">
        <span>商品总价</span>
        <span>¥{{ cartStore.totalPrice.toFixed(2) }}</span>
      </div>
      <div class="price-row">
        <span>配送费</span>
        <span>¥{{ deliveryFee.toFixed(2) }}</span>
      </div>
      <div class="price-row price-total">
        <span>合计</span>
        <span>¥{{ (cartStore.totalPrice + deliveryFee).toFixed(2) }}</span>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="order-actions">
      <button
        class="btn-skeuo btn-skeuo--primary btn-submit"
        :disabled="submitting"
        @click="submit"
      >
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </div>

    <!-- Toast -->
    <div class="toast-overlay" v-if="showToast" @click="onToastClose">
      <div class="toast card-skeuo">
        <div class="toast-icon">✅</div>
        <p class="toast-text">下单成功！</p>
        <button class="btn-skeuo btn-skeuo--primary" @click="onToastClose">返回店铺</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { submitOrder } from '../api/service'

const router = useRouter()
const cartStore = useCartStore()

const defaultAddress = '北京市朝阳区 XX 路 100 号'
const deliveryFee = 3
const remark = ref('')
const submitting = ref(false)
const showToast = ref(false)

// 跳转保护：购物车为空则返回店铺列表
if (cartStore.isEmpty) {
  router.push('/shops')
}

async function submit() {
  submitting.value = true
  try {
    await submitOrder({
      shopId: cartStore.shopId,
      shopName: cartStore.shopName,
      items: cartStore.items,
      totalPrice: cartStore.totalPrice + deliveryFee,
      address: defaultAddress,
      remark: remark.value
    })
    cartStore.clear()
    showToast.value = true
  } finally {
    submitting.value = false
  }
}

function onToastClose() {
  showToast.value = false
  router.push('/shops')
}
</script>

<style scoped>
.order-page {
  max-width: 600px;
  margin: 0 auto;
}
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: var(--color-text); }
.section { padding: 20px; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 12px; }
.order-items { display: flex; flex-direction: column; gap: 8px; }
.order-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--color-text);
}
.order-item .item-name { flex: 1; }
.order-item .item-qty { width: 40px; text-align: center; color: var(--color-text-light); }
.order-item .item-price { width: 70px; text-align: right; font-weight: 600; }
.info-row { display: flex; font-size: 14px; }
.info-label { width: 80px; color: var(--color-text-light); flex-shrink: 0; }
.info-value { flex: 1; color: var(--color-text); }
.remark-input { width: 100%; resize: vertical; font-size: 14px; }
.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-light);
  padding: 4px 0;
}
.price-total {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
  border-top: 1px solid var(--shadow-light);
  margin-top: 8px;
  padding-top: 8px;
}
.order-actions { margin-top: 24px; }
.btn-submit { width: 100%; padding: 14px; font-size: 16px; }
/* Toast */
.toast-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.toast {
  width: 320px;
  padding: 40px 32px;
  text-align: center;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-convex);
}
.toast-icon { font-size: 48px; margin-bottom: 16px; }
.toast-text { font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 20px; }
</style>
