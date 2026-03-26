import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister } from '../api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  actions: {
    async login(username, password) {
      const result = await apiLogin(username, password)
      this.user = { username: result.username }
      return result
    },
    async register(username, password) {
      return await apiRegister(username, password)
    },
    logout() {
      this.user = null
    }
  }
})
