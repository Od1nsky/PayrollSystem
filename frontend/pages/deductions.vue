<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Удержания</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
        Добавить
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="employeeFilter"
              label="Сотрудник"
              :items="employeeOptions"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="typeFilter"
              label="Тип"
              :items="deductionTypes"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="periodFilter"
              label="Период"
              placeholder="2024-01"
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
        :items="filteredDeductions"
        :loading="loading"
        no-data-text="Удержания не найдены"
        loading-text="Загрузка..."
      >
        <template #item.type="{ item }">
          <v-chip :color="getTypeColor(item.type)" size="small">
            {{ getTypeLabel(item.type) }}
          </v-chip>
        </template>
        <template #item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template #item.date="{ item }">
          {{ formatDate(item.date || item.createdAt) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания удержания -->
    <v-dialog v-model="showModal" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <v-icon start>mdi-plus</v-icon>
          Добавить удержание
        </v-card-title>
        <v-card-text>
          <v-alert v-if="formApiError" type="error" class="mb-4" closable @click:close="formApiError = ''">
            {{ formApiError }}
          </v-alert>
          <v-form @submit.prevent="submitForm">
            <v-select
              v-model="formData.employeeId"
              label="Сотрудник"
              :items="employeeOptions"
              variant="outlined"
              class="mb-2"
            />
            <v-select
              v-model="formData.type"
              label="Тип удержания"
              :items="deductionTypes"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model.number="formData.amount"
              label="Сумма"
              type="number"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.period"
              label="Период"
              placeholder="2024-01"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="formData.date"
              label="Дата"
              type="date"
              variant="outlined"
              class="mb-2"
            />
            <v-textarea
              v-model="formData.description"
              label="Описание"
              variant="outlined"
              rows="3"
              class="mb-2"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeModal">Отмена</v-btn>
          <v-btn color="primary" :loading="submitting" @click="submitForm">
            Создать
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
          Вы уверены, что хотите удалить это удержание?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Отмена</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteDeduction">Удалить</v-btn>
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

const deductions = ref<any[]>([])
const employees = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteDialog = ref(false)
const deductionToDelete = ref<any>(null)
const formApiError = ref('')

const employeeFilter = ref(null)
const typeFilter = ref(null)
const periodFilter = ref('')

const headers = [
  { title: 'Сотрудник', key: 'employeeName', sortable: true },
  { title: 'Тип', key: 'type', sortable: true },
  { title: 'Сумма', key: 'amount', sortable: true },
  { title: 'Период', key: 'period', sortable: true },
  { title: 'Дата', key: 'date', sortable: true },
  { title: 'Описание', key: 'description', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center' as const },
]

const deductionTypes = [
  { title: 'НДФЛ', value: 'tax' },
  { title: 'Аванс', value: 'advance' },
  { title: 'Штраф', value: 'penalty' },
  { title: 'Алименты', value: 'alimony' },
  { title: 'Страхование', value: 'insurance' },
]

const employeeOptions = computed(() => {
  return employees.value.map((emp: any) => ({
    title: [emp.lastName, emp.firstName, emp.middleName].filter(Boolean).join(' '),
    value: emp.id,
  }))
})

const formData = ref({
  employeeId: null as number | null,
  type: 'tax',
  amount: 0,
  period: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
})

const filteredDeductions = computed(() => {
  return deductions.value
    .filter((item: any) => {
      const matchesEmployee = !employeeFilter.value || item.employeeId === employeeFilter.value
      const matchesType = !typeFilter.value || item.type === typeFilter.value
      const matchesPeriod = !periodFilter.value || item.period === periodFilter.value
      return matchesEmployee && matchesType && matchesPeriod
    })
    .map((item: any) => {
      const emp = employees.value.find((e: any) => e.id === item.employeeId)
      return {
        ...item,
        employeeName: emp
          ? [emp.lastName, emp.firstName].filter(Boolean).join(' ')
          : `ID: ${item.employeeId}`,
      }
    })
})

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    tax: 'НДФЛ',
    advance: 'Аванс',
    penalty: 'Штраф',
    alimony: 'Алименты',
    insurance: 'Страхование',
  }
  return labels[type] || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    tax: 'error',
    advance: 'warning',
    penalty: 'deep-orange',
    alimony: 'purple',
    insurance: 'info',
  }
  return colors[type] || 'grey'
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date: string) => {
  if (!date) return '\u2014'
  return new Date(date).toLocaleDateString('ru-RU')
}

const openCreateModal = () => {
  formData.value = {
    employeeId: null,
    type: 'tax',
    amount: 0,
    period: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
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
    await api.post('/deductions', formData.value)
    toast.success('Удержание успешно создано')
    closeModal()
    await fetchDeductions()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    formApiError.value = message
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (deduction: any) => {
  deductionToDelete.value = deduction
  showDeleteDialog.value = true
}

const deleteDeduction = async () => {
  if (!deductionToDelete.value) return

  deleting.value = true
  try {
    await api.delete(`/deductions/${deductionToDelete.value.id}`)
    toast.success('Удержание успешно удалено')
    showDeleteDialog.value = false
    deductionToDelete.value = null
    await fetchDeductions()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    toast.error(message)
  } finally {
    deleting.value = false
  }
}

const fetchDeductions = async () => {
  loading.value = true
  try {
    const response = await api.get('/deductions')
    const result = response.data as any
    deductions.value = result.data || result || []
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const fetchEmployees = async () => {
  try {
    const response = await api.get('/employees')
    const result = response.data as any
    employees.value = result.data || result || []
  } catch (error: any) {
    console.error('Failed to fetch employees:', error)
  }
}

onMounted(() => {
  fetchDeductions()
  fetchEmployees()
})
</script>
