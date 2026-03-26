// user API — 模拟实现
// 生产环境：对接真实后端（加密传输 + hash 存储），当前为 Mock 临时方案

const USERS_KEY = 'wfood_users'

function loadUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function login(username, password) {
  // Mock: 模拟 300ms 延迟
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!username || !password) {
        reject(new Error('请输入用户名和密码'))
        return
      }
      const users = loadUsers()
      const user = users.find(u => u.username === username)
      if (!user) {
        reject(new Error('用户不存在'))
        return
      }
      // Mock: 明文比对，生产环境绝不可如此
      if (user.password !== password) {
        reject(new Error('密码错误'))
        return
      }
      resolve({ username: user.username })
    }, 300)
  })
}

export function register(username, password) {
  // Mock: 模拟 300ms 延迟
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!username || !password) {
        reject(new Error('请输入用户名和密码'))
        return
      }
      if (username.length < 2) {
        reject(new Error('用户名至少 2 个字符'))
        return
      }
      if (password.length < 6) {
        reject(new Error('密码至少 6 位'))
        return
      }
      const users = loadUsers()
      if (users.find(u => u.username === username)) {
        reject(new Error('用户名已存在'))
        return
      }
      // Mock: 明文存储，生产环境必须 hash
      users.push({ username, password })
      saveUsers(users)
      resolve({ username })
    }, 300)
  })
}
