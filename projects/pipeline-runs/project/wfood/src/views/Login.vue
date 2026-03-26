<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">🍔 wfood</h1>
      <p class="login-subtitle">外卖模拟平台</p>
      <form @submit.prevent="onSubmit" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            class="input-skeuo"
            required
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="input-skeuo"
            required
          />
        </div>
        <p class="error-msg" v-if="error">{{ error }}</p>
        <button
          type="submit"
          class="btn-skeuo btn-skeuo--primary"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>
      <p class="login-footer">
        还没有账号？<router-link to="/register">去注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref(route.query.username || '')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await userStore.login(username.value, password.value)
    router.push(route.query.redirect || '/shops')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 104px);
}
.login-card {
  width: 400px;
  padding: 40px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-convex);
  text-align: center;
}
.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}
.login-subtitle {
  font-size: 14px;
  color: var(--color-text-light);
  margin-bottom: 32px;
}
.login-form {
  text-align: left;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
}
.error-msg {
  color: var(--color-accent);
  font-size: 14px;
  margin-bottom: 16px;
}
.btn-skeuo--primary {
  width: 100%;
  margin-top: 8px;
}
.login-footer {
  margin-top: 20px;
  font-size: 14px;
  color: var(--color-text-light);
}
.login-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}
</style>
