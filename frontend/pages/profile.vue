<template>
  <div>
    <h1 class="text-h4 mb-6">Профиль</h1>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-account</v-icon>
            Личные данные
          </v-card-title>
          <v-card-text>
            <v-alert v-if="profileSuccess" type="success" class="mb-4" closable @click:close="profileSuccess = ''">
              {{ profileSuccess }}
            </v-alert>
            <v-alert v-if="profileError" type="error" class="mb-4" closable @click:close="profileError = ''">
              {{ profileError }}
            </v-alert>
            <v-form @submit.prevent="updateProfile">
              <v-text-field
                v-model="form.name"
                label="Имя"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                class="mb-2"
              />
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                class="mb-4"
              />
              <v-btn type="submit" color="primary" :loading="profileLoading">
                <v-icon start>mdi-content-save</v-icon>
                Сохранить
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-lock</v-icon>
            Смена пароля
          </v-card-title>
          <v-card-text>
            <v-alert v-if="passwordSuccess" type="success" class="mb-4" closable @click:close="passwordSuccess = ''">
              {{ passwordSuccess }}
            </v-alert>
            <v-alert v-if="passwordError" type="error" class="mb-4" closable @click:close="passwordError = ''">
              {{ passwordError }}
            </v-alert>
            <v-form @submit.prevent="changePassword">
              <v-text-field
                v-model="passwordForm.currentPassword"
                label="Текущий пароль"
                type="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                class="mb-2"
              />
              <v-text-field
                v-model="passwordForm.newPassword"
                label="Новый пароль"
                type="password"
                prepend-inner-icon="mdi-lock-plus"
                variant="outlined"
                class="mb-2"
              />
              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Подтвердите пароль"
                type="password"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
                class="mb-4"
              />
              <v-btn type="submit" color="warning" :loading="passwordLoading">
                <v-icon start>mdi-key</v-icon>
                Сменить пароль
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'
import { getReadableErrorMessage } from '../utils/errorMessages'

definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
const api = useApi()
const toast = useToast()

const profileLoading = ref(false)
const passwordLoading = ref(false)
const profileSuccess = ref('')
const profileError = ref('')
const passwordSuccess = ref('')
const passwordError = ref('')

const form = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const updateProfile = async () => {
  profileError.value = ''
  profileSuccess.value = ''
  profileLoading.value = true
  try {
    await api.put('/auth/profile', {
      name: form.value.name,
      email: form.value.email,
    })
    profileSuccess.value = 'Профиль успешно обновлен'
    toast.success('Профиль успешно обновлен')
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    profileError.value = message
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordError.value = 'Заполните все поля'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Пароли не совпадают'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Новый пароль должен содержать минимум 6 символов'
    return
  }

  passwordLoading.value = true
  try {
    await api.put('/auth/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordSuccess.value = 'Пароль успешно изменен'
    toast.success('Пароль успешно изменен')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    passwordError.value = message
  } finally {
    passwordLoading.value = false
  }
}
</script>
