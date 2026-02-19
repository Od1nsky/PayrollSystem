import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

export const useToast = () => {
  const show = (message: string, type: Toast['type'] = 'info', timeout = 5000) => {
    const id = ++toastId
    toasts.value.push({ id, message, type, timeout })

    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }

    return id
  }

  const success = (message: string, timeout?: number) => show(message, 'success', timeout)
  const error = (message: string, timeout?: number) => show(message, 'error', timeout)
  const warning = (message: string, timeout?: number) => show(message, 'warning', timeout)
  const info = (message: string, timeout?: number) => show(message, 'info', timeout)

  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}
