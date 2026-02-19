export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const getHeaders = () => {
    const headers: Record<string, string> = {}
    if (import.meta.client) {
      const token = localStorage.getItem('token')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }
    return headers
  }

  const handleError = (error: any) => {
    if (error.statusCode === 401 && import.meta.client) {
      localStorage.removeItem('token')
      navigateTo('/login')
    }
    throw error
  }

  return {
    get: async <T = any>(url: string, options?: { params?: Record<string, any> }) => {
      try {
        const data = await $fetch<T>(url, {
          baseURL,
          method: 'GET',
          headers: getHeaders(),
          query: options?.params,
        })
        return { data }
      } catch (error) {
        handleError(error)
        throw error
      }
    },

    post: async <T = any>(url: string, body?: any) => {
      try {
        const data = await $fetch<T>(url, {
          baseURL,
          method: 'POST',
          headers: getHeaders(),
          body,
        })
        return { data }
      } catch (error) {
        handleError(error)
        throw error
      }
    },

    put: async <T = any>(url: string, body?: any) => {
      try {
        const data = await $fetch<T>(url, {
          baseURL,
          method: 'PUT',
          headers: getHeaders(),
          body,
        })
        return { data }
      } catch (error) {
        handleError(error)
        throw error
      }
    },

    delete: async <T = any>(url: string) => {
      try {
        const data = await $fetch<T>(url, {
          baseURL,
          method: 'DELETE',
          headers: getHeaders(),
        })
        return { data }
      } catch (error) {
        handleError(error)
        throw error
      }
    },
  }
}
