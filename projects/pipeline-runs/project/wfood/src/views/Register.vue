<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">注册</h1>
      <form @submit.prevent="onSubmit" class="register-form">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" class="input-skeuo" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码（至少 6 位）" class="input-skeuo" required />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="confirm" type="password" placeholder="请再次输入密码" class="input-skeuo" required />
        </div>
        <p class="error-msg" v-if="error">{{ error }}</p>
        <button type="submit" class="btn-skeuo btn-skeuo--primary" :disabled="loading">
          {{ loading ? '注册中...' : '注 册' }}
        </button>
      </form>
      <p class="register-footer">
        已有账号？<router-link to="/login">去登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = '两次密码不一致'
    return
  }
  loading.value = true
  try {
    await userStore.register(username.value, password.value)
    router.push({ path: '/login', query: { username: username.value } })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 104px);
}
.register-card {
  width: 400px;
  padding: 40px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-convex);
  text-align: center;
}
.register-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 32px;
}
.register-form { text-align: left; }
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
}
.error-msg { color: var(--color-accent); font-size: 14px; margin-bottom: 16px; }
.btn-skeuo--primary { width: 100%; margin-top: 8px; }
.register-footer { margin-top: 20px; font-size: 14px; color: var(--color-text-light); }
.register-footer a { color: var(--color-primary); text-decoration: none; font-weight: 500; }
</style>
