<template>
  <div class="shop-list">
    <h2 class="page-title">附近店铺</h2>
    <div class="shop-grid" v-if="!loading">
      <div
        v-for="shop in shops"
        :key="shop.id"
        class="shop-card card-skeuo"
        @click="$router.push(`/shops/${shop.id}`)"
      >
        <div class="shop-image">
          <img :src="shop.image" :alt="shop.name" />
        </div>
        <div class="shop-info">
          <h3 class="shop-name">{{ shop.name }}</h3>
          <div class="shop-meta">
            <span class="rating">⭐ {{ shop.rating }}</span>
            <span class="sales">月售 {{ shop.monthlySales }}</span>
          </div>
          <div class="shop-delivery">
            <span class="fee">{{ shop.deliveryFee === 0 ? '免配送费' : `配送费 ¥${shop.deliveryFee}` }}</span>
            <span class="time">{{ shop.deliveryTime }} 分钟</span>
          </div>
          <p class="shop-notice" v-if="shop.notice">{{ shop.notice }}</p>
        </div>
      </div>
    </div>
    <div class="loading" v-else>加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getShopList } from '../api/service'

const shops = ref([])
const loading = ref(true)

onMounted(async () => {
  shops.value = await getShopList()
  loading.value = false
})
</script>

<style scoped>
.shop-list { max-width: 1200px; margin: 0 auto; }
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: var(--color-text); }
.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.shop-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.shop-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-md);
}
.shop-image { width: 100px; height: 100px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; }
.shop-image img { width: 100%; height: 100%; object-fit: cover; }
.shop-info { flex: 1; min-width: 0; }
.shop-name { font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 6px; }
.shop-meta { display: flex; gap: 12px; margin-bottom: 6px; font-size: 13px; }
.rating { color: var(--color-accent); font-weight: 600; }
.sales { color: var(--color-text-light); }
.shop-delivery { display: flex; gap: 12px; font-size: 13px; color: var(--color-text-light); }
.fee { color: var(--color-primary); font-weight: 500; }
.shop-notice { font-size: 12px; color: var(--color-primary); margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.loading { text-align: center; padding: 60px; color: var(--color-text-light); font-size: 16px; }
</style>
