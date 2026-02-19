<template>
  <NuxtLayout name="auth">
    <v-card class="pa-4">
      <v-card-title class="text-h5 text-center">
        Регистрация
      </v-card-title>
      <v-card-text>
        <v-alert v-if="apiError" type="error" class="mb-4" closable @click:close="apiError = ''">
          {{ apiError }}
        </v-alert>
        <v-form @submit.prevent="handleRegister">
          <v-text-field
            v-model="form.name"
            label="Имя"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            class="mb-2"
            :error-messages="errors.name"
            @blur="validateField('name')"
            @input="clearFieldError('name')"
          />
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            class="mb-2"
            :error-messages="errors.email"
            @blur="validateField('email')"
            @input="clearFieldError('email')"
          />
          <v-text-field
            v-model="form.password"
            label="Пароль"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            class="mb-4"
            :error-messages="errors.password"
            @click:append-inner="showPassword = !showPassword"
            @blur="validateField('password')"
            @input="clearFieldError('password')"
          />
          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="loading"
          >
            Зарегистрироваться
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <span>Уже есть аккаунт?</span>
        <v-btn variant="text" color="primary" to="/login">
          Войти
        </v-btn>
      </v-card-actions>
    </v-card>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { registerSchema, getAllFieldErrors } from '../utils/validation'
import { getReadableErrorMessage } from '../utils/errorMessages'
import { useToast } from '../composables/useToast'

definePageMeta({
  layout: false
})

const form = ref({
  name: '',
  email: '',
  password: ''
})
const errors = ref<Record<string, string>>({
  name: '',
  email: '',
  password: ''
})
const apiError = ref('')
const showPassword = ref(false)
const loading = ref(false)
const { register } = useAuth()
const router = useRouter()
const toast = useToast()

const validateField = (field: 'name' | 'email' | 'password') => {
  const result = registerSchema.safeParse(form.value)
  if (!result.success) {
    const fieldErrors = getAllFieldErrors(result)
    errors.value[field] = fieldErrors[field] || ''
  } else {
    errors.value[field] = ''
  }
}

const clearFieldError = (field: 'name' | 'email' | 'password') => {
  errors.value[field] = ''
}

const validateForm = (): boolean => {
  const result = registerSchema.safeParse(form.value)
  if (!result.success) {
    errors.value = getAllFieldErrors(result)
    return false
  }
  errors.value = { name: '', email: '', password: '' }
  return true
}

const handleRegister = async () => {
  apiError.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    await register(form.value.email, form.value.password, form.value.name)
    toast.success('Регистрация прошла успешно')
    router.push('/')
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    apiError.value = message
  } finally {
    loading.value = false
  }
}
</script>
