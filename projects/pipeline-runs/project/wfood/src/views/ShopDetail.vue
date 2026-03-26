<template>
  <div class="shop-detail" v-if="shop">
    <!-- 店铺头部 -->
    <div class="shop-header card-skeuo">
      <div class="header-image">
        <img :src="shop.image" :alt="shop.name" />
      </div>
      <div class="header-info">
        <h1 class="header-name">{{ shop.name }}</h1>
        <div class="header-meta">
          <span class="rating">⭐ {{ shop.rating }}</span>
          <span class="sales">月售 {{ shop.monthlySales }}</span>
          <span class="time">{{ shop.deliveryTime }} 分钟</span>
        </div>
        <p class="header-notice" v-if="shop.notice">📢 {{ shop.notice }}</p>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="goods-section">
      <h2 class="section-title">全部商品</h2>
      <div class="goods-list">
        <div v-for="item in shop.goods" :key="item.id" class="goods-item card-skeuo">
          <div class="goods-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="goods-info">
            <h3 class="goods-name">{{ item.name }}</h3>
            <p class="goods-desc">{{ item.description }}</p>
            <div class="goods-bottom">
              <span class="goods-price">¥{{ item.price }}</span>
              <button
                class="btn-skeuo btn-skeuo--primary btn-add"
                @click="addToCart(item)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部购物车栏 -->
    <div class="cart-bar card-skeuo" v-if="cartStore.shopId === shop.id && !cartStore.isEmpty">
      <div class="cart-bar-left" @click="$router.push('/cart')">
        <div class="cart-icon-wrap">
          🛒
          <span class="cart-badge">{{ cartStore.totalCount }}</span>
        </div>
        <div class="cart-summary">
          <span class="cart-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
      </div>
      <div class="cart-bar-right">
        <button
          class="btn-skeuo btn-skeuo--secondary"
          @click="$router.push('/cart')"
        >
          查看购物车
        </button>
      </div>
    </div>
  </div>
  <div class="loading" v-else>加载中...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { getShopDetail } from '../api/service'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const shop = ref(null)
const toast = ref('')

onMounted(async () => {
  const shopId = route.params.id
  try {
    shop.value = await getShopDetail(shopId)
    // 店铺隔离
    if (cartStore.shopId && cartStore.shopId !== shopId) {
      cartStore.clear()
    }
  } catch {
    router.push('/shops')
  }
})

function addToCart(item) {
  cartStore.addItem(shop.value.id, shop.value.name, item)
}
</script>

<style scoped>
.shop-detail {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 80px;
}
.shop-header {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 24px;
}
.header-image { width: 140px; height: 100px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; }
.header-image img { width: 100%; height: 100%; object-fit: cover; }
.header-info { flex: 1; }
.header-name { font-size: 22px; font-weight: 700; color: var(--color-text); margin-bottom: 8px; }
.header-meta { display: flex; gap: 16px; font-size: 14px; margin-bottom: 8px; }
.rating { color: var(--color-accent); font-weight: 600; }
.sales, .time { color: var(--color-text-light); }
.header-notice { font-size: 13px; color: var(--color-primary); }
.section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--color-text); }
.goods-list { display: flex; flex-direction: column; gap: 16px; }
.goods-item { display: flex; gap: 16px; padding: 16px; }
.goods-image { width: 100px; height: 80px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; }
.goods-image img { width: 100%; height: 100%; object-fit: cover; }
.goods-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.goods-name { font-size: 15px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
.goods-desc { font-size: 13px; color: var(--color-text-light); margin-bottom: 8px; }
.goods-bottom { display: flex; align-items: center; justify-content: space-between; }
.goods-price { font-size: 18px; font-weight: 700; color: var(--color-accent); }
.btn-add {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 20px;
  line-height: 30px;
  border-radius: 50%;
}
/* 底部购物车栏 */
.cart-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  max-width: calc(100% - 48px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  z-index: 100;
  background: var(--color-bg);
  box-shadow: 0 -2px 12px var(--shadow-md);
}
.cart-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.cart-icon-wrap {
  position: relative;
  font-size: 28px;
}
.cart-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}
.cart-price { font-size: 18px; font-weight: 700; color: var(--color-accent); }
.loading { text-align: center; padding: 60px; color: var(--color-text-light); }
</style>
