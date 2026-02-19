import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    login: store.login.bind(store),
    logout: store.logout.bind(store),
    register: store.register.bind(store),
    fetchUser: store.fetchUser.bind(store),
  }
}
