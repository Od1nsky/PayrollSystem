<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Пользователи</h1>
      <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openCreateModal">
        Добавить
      </v-btn>
    </div>

    <v-card>
      <v-card-text class="pa-0">
        <v-list>
          <v-list-item v-for="u in users" :key="u.id">
            <template #prepend>
              <v-avatar color="primary">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>{{ u.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ u.email }}</v-list-item-subtitle>
            <template #append>
              <v-chip :color="getRoleColor(u.role)" size="small" class="mr-2">
                {{ getRoleText(u.role) }}
              </v-chip>
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditModal(u)" />
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(u)" />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-alert v-if="users.length === 0 && !loading" type="info" class="mt-4">
      Пользователи не найдены
    </v-alert>

    <!-- Диалог создания/редактирования -->
    <v-dialog v-model="showModal" max-width="500" persistent>
      <v-card>
        <v-card-title>
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-account-plus' }}</v-icon>
          {{ isEditing ? 'Редактировать пользователя' : 'Добавить пользователя' }}
        </v-card-title>
        <v-card-text>
          <v-alert v-if="formApiError" type="error" class="mb-4" closable @click:close="formApiError = ''">
            {{ formApiError }}
          </v-alert>
          <v-form @submit.prevent="submitForm">
            <v-text-field
              v-model="formData.name"
              label="Имя"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-if="!isEditing"
              v-model="formData.password"
              label="Пароль"
              type="password"
              variant="outlined"
              class="mb-2"
            />
            <v-select
              v-model="formData.role"
              label="Роль"
              :items="roles"
              variant="outlined"
              class="mb-2"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeModal">Отмена</v-btn>
          <v-btn color="primary" :loading="submitting" @click="submitForm">
            {{ isEditing ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon start color="error">mdi-alert</v-icon>
          Подтверждение удаления
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить пользователя "{{ userToDelete?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Отмена</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteUser">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'
import { getReadableErrorMessage } from '../utils/errorMessages'

interface User {
  id: number
  email: string
  name: string
  role: string
}

definePageMeta({
  middleware: 'auth'
})

const api = useApi()
const toast = useToast()

const users = ref<User[]>([])
const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const userToDelete = ref<User | null>(null)
const formApiError = ref('')

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'user',
})

const roles = [
  { title: 'Администратор', value: 'admin' },
  { title: 'Пользователь', value: 'user' },
]

const getRoleColor = (role: string) => {
  return role === 'admin' ? 'error' : 'primary'
}

const getRoleText = (role: string) => {
  return role === 'admin' ? 'Администратор' : 'Пользователь'
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = { name: '', email: '', password: '', role: 'user' }
  formApiError.value = ''
  showModal.value = true
}

const openEditModal = (user: User) => {
  isEditing.value = true
  editingId.value = user.id
  formData.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
  }
  formApiError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formApiError.value = ''
}

const submitForm = async () => {
  formApiError.value = ''
  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      const payload: any = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
      }
      await api.put(`/auth/users/${editingId.value}`, payload)
      toast.success('Пользователь обновлен')
    } else {
      await api.post('/auth/users', formData.value)
      toast.success('Пользователь создан')
    }
    closeModal()
    await fetchUsers()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    formApiError.value = message
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (user: User) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  deleting.value = true
  try {
    await api.delete(`/auth/users/${userToDelete.value.id}`)
    toast.success('Пользователь удален')
    showDeleteDialog.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    toast.error(message)
  } finally {
    deleting.value = false
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/auth/users')
    users.value = response.data as User[]
  } catch (error: any) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
