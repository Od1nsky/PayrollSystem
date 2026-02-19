import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  name: string
  role: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },

  actions: {
    async login(email: string, password: string) {
      const api = useApi()
      const response = await api.post('/auth/login', { email, password })
      this.token = response.data.token
      this.user = response.data.user
      if (typeof window !== 'undefined') {
        if (this.token) localStorage.setItem('token', this.token)
        if (this.user) localStorage.setItem('user', JSON.stringify(this.user))
      }
    },

    async register(email: string, password: string, name: string, role?: string) {
      const api = useApi()
      const response = await api.post('/auth/register', { email, password, name, role })
      this.token = response.data.token
      this.user = response.data.user
      if (typeof window !== 'undefined') {
        if (this.token) localStorage.setItem('token', this.token)
        if (this.user) localStorage.setItem('user', JSON.stringify(this.user))
      }
    },

    async fetchUser() {
      if (!this.token) return
      try {
        const api = useApi()
        const response = await api.get('/auth/me')
        this.user = response.data
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    init() {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        const userJson = localStorage.getItem('user')
        if (token) {
          this.token = token
          if (userJson) {
            try {
              this.user = JSON.parse(userJson)
            } catch {
              // Invalid JSON, will fetch from server
            }
          }
          this.fetchUser()
        }
      }
    },
  },
})
