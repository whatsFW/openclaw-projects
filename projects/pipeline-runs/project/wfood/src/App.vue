<template>
  <div class="app-shell">
    <nav class="app-nav" v-if="isLoggedIn">
      <div class="nav-brand">
        <span class="nav-icon">🍔</span>
        <span class="nav-title">wfood</span>
      </div>
      <div class="nav-links">
        <router-link to="/shops" class="nav-link">店铺</router-link>
        <router-link to="/cart" class="nav-link">
          购物车
          <span class="nav-badge" v-if="cartCount > 0">{{ cartCount }}</span>
        </router-link>
      </div>
      <div class="nav-user">
        <span class="nav-username">{{ username }}</span>
        <button class="btn-skeuo btn-skeuo--secondary" @click="logout">退出</button>
      </div>
    </nav>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import { useCartStore } from './stores/cart'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.user?.username || '')
const cartCount = computed(() => cartStore.totalCount)

function logout() {
  userStore.logout()
  cartStore.clear()
  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: linear-gradient(to bottom, var(--color-bg), var(--color-nav-bg));
  box-shadow: 0 2px 8px var(--shadow-md);
  flex-shrink: 0;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-icon { font-size: 24px; }
.nav-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.5px;
}
.nav-links {
  display: flex;
  gap: 16px;
}
.nav-link {
  position: relative;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
  background: var(--color-bg);
  box-shadow: 0 1px 3px var(--shadow-sm);
}
.nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
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
.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-username {
  font-size: 14px;
  color: var(--color-text-light);
}
.app-main {
  flex: 1;
  padding: 24px;
  background: var(--color-bg-page);
}
</style>
