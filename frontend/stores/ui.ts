import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    loading: false,
    toast: null as { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null,
  }),

  actions: {
    setSidebarOpen(open: boolean) {
      this.sidebarOpen = open
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
      this.toast = { message, type }
      setTimeout(() => {
        this.toast = null
      }, 3000)
    },
  },
})
