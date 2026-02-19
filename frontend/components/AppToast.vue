<template>
  <v-snackbar
    v-model="snackbar"
    :color="currentColor"
    :timeout="5000"
    location="top"
    multi-line
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">{{ currentIcon }}</v-icon>
      <span>{{ currentMessage }}</span>
    </div>
    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="small"
        @click="closeSnackbar"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useToast, type Toast } from '../composables/useToast'

const { toasts, remove } = useToast()

const snackbar = ref(false)
const currentToast = ref<Toast | null>(null)

const currentMessage = computed(() => currentToast.value?.message || '')
const currentColor = computed(() => {
  const type = currentToast.value?.type || 'info'
  return type
})
const currentIcon = computed(() => {
  const icons: Record<string, string> = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  return icons[currentToast.value?.type || 'info'] || 'mdi-information'
})

const showNext = () => {
  if (toasts.value.length > 0) {
    currentToast.value = toasts.value[0]
    snackbar.value = true
  }
}

const closeSnackbar = () => {
  snackbar.value = false
  if (currentToast.value) {
    remove(currentToast.value.id)
  }
  currentToast.value = null
}

// Следим за закрытием и показываем следующий
watch(snackbar, (newVal) => {
  if (!newVal && toasts.value.length > 0) {
    setTimeout(showNext, 300)
  }
})

// Следим за появлением новых toasts
watch(() => toasts.value.length, (newLen) => {
  if (newLen > 0 && !snackbar.value) {
    showNext()
  }
}, { immediate: true })
</script>
