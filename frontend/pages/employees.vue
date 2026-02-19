<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Сотрудники</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
        Добавить
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              label="Поиск"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="departmentFilter"
              label="Отдел"
              :items="departments"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="statusFilter"
              label="Статус"
              :items="statuses"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :loading="loading"
        :search="search"
        no-data-text="Сотрудники не найдены"
        loading-text="Загрузка..."
      >
        <template #item.salary="{ item }">
          {{ formatCurrency(item.salary) }}
        </template>
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditModal(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования сотрудника -->
    <v-dialog v-model="showModal" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <v-icon start>{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Редактировать сотрудника' : 'Добавить сотрудника' }}
        </v-card-title>
        <v-card-text>
          <v-alert v-if="formApiError" type="error" class="mb-4" closable @click:close="formApiError = ''">
            {{ formApiError }}
          </v-alert>
          <v-form @submit.prevent="submitForm">
            <v-text-field
              v-model="formData.lastName"
              label="Фамилия"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.firstName"
              label="Имя"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.middleName"
              label="Отчество"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.employeeNumber"
              label="Табельный номер"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.department"
              label="Отдел"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.position"
              label="Должность"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model.number="formData.salary"
              label="Оклад"
              type="number"
              variant="outlined"
              class="mb-2"
            />
            <v-select
              v-model="formData.status"
              label="Статус"
              :items="statuses"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.hireDate"
              label="Дата приема"
              type="date"
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
          Вы уверены, что хотите удалить сотрудника "{{ employeeToDelete?.lastName }} {{ employeeToDelete?.firstName }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Отмена</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteEmployee">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'
import { getReadableErrorMessage } from '../utils/errorMessages'

definePageMeta({
  middleware: 'auth'
})

const api = useApi()
const toast = useToast()

const employees = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const search = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const employeeToDelete = ref<any>(null)
const formApiError = ref('')

const headers = [
  { title: 'ФИО', key: 'fullName', sortable: true },
  { title: 'Табельный номер', key: 'employeeNumber', sortable: true },
  { title: 'Отдел', key: 'department', sortable: true },
  { title: 'Должность', key: 'position', sortable: true },
  { title: 'Оклад', key: 'salary', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center' as const },
]

const statuses = [
  { title: 'Работает', value: 'active' },
  { title: 'В отпуске', value: 'on_leave' },
  { title: 'Уволен', value: 'fired' },
]

const departments = computed(() => {
  const deps = [...new Set(employees.value.map((e: any) => e.department).filter(Boolean))]
  return deps.map(d => ({ title: d, value: d }))
})

const formData = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  employeeNumber: '',
  department: '',
  position: '',
  salary: 0,
  status: 'active',
  hireDate: '',
})

const filteredEmployees = computed(() => {
  return employees.value
    .filter((emp: any) => {
      const matchesDepartment = !departmentFilter.value || emp.department === departmentFilter.value
      const matchesStatus = !statusFilter.value || emp.status === statusFilter.value
      return matchesDepartment && matchesStatus
    })
    .map((emp: any) => ({
      ...emp,
      fullName: [emp.lastName, emp.firstName, emp.middleName].filter(Boolean).join(' '),
    }))
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'success',
    on_leave: 'warning',
    fired: 'error',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: 'Работает',
    on_leave: 'В отпуске',
    fired: 'Уволен',
  }
  return texts[status] || status
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(value)
}

const resetForm = () => {
  formData.value = {
    lastName: '',
    firstName: '',
    middleName: '',
    employeeNumber: '',
    department: '',
    position: '',
    salary: 0,
    status: 'active',
    hireDate: '',
  }
  formApiError.value = ''
  isEditing.value = false
  editingId.value = null
}

const openCreateModal = () => {
  resetForm()
  showModal.value = true
}

const openEditModal = (employee: any) => {
  isEditing.value = true
  editingId.value = employee.id
  formData.value = {
    lastName: employee.lastName || '',
    firstName: employee.firstName || '',
    middleName: employee.middleName || '',
    employeeNumber: employee.employeeNumber || '',
    department: employee.department || '',
    position: employee.position || '',
    salary: employee.salary || 0,
    status: employee.status || 'active',
    hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
  }
  formApiError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const submitForm = async () => {
  formApiError.value = ''
  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/employees/${editingId.value}`, formData.value)
      toast.success('Сотрудник успешно обновлен')
    } else {
      await api.post('/employees', formData.value)
      toast.success('Сотрудник успешно создан')
    }
    closeModal()
    await fetchEmployees()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    formApiError.value = message
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (employee: any) => {
  employeeToDelete.value = employee
  showDeleteDialog.value = true
}

const deleteEmployee = async () => {
  if (!employeeToDelete.value) return

  deleting.value = true
  try {
    await api.delete(`/employees/${employeeToDelete.value.id}`)
    toast.success('Сотрудник успешно удален')
    showDeleteDialog.value = false
    employeeToDelete.value = null
    await fetchEmployees()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    toast.error(message)
  } finally {
    deleting.value = false
  }
}

const fetchEmployees = async () => {
  loading.value = true
  try {
    const response = await api.get('/employees')
    const result = response.data as any
    employees.value = result.data || result || []
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>
