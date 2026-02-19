<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Расчетные ведомости</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
        Сформировать
      </v-btn>
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="payrollSheets"
        :loading="loading"
        no-data-text="Ведомости не найдены"
        loading-text="Загрузка..."
      >
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>
        <template #item.totalAccrued="{ item }">
          {{ formatCurrency(item.totalAccrued) }}
        </template>
        <template #item.totalDeducted="{ item }">
          {{ formatCurrency(item.totalDeducted) }}
        </template>
        <template #item.totalNet="{ item }">
          <span class="font-weight-bold">{{ formatCurrency(item.totalNet) }}</span>
        </template>
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetails(item)" />
          <v-btn
            v-if="item.status === 'draft'"
            icon="mdi-check"
            variant="text"
            size="small"
            color="success"
            @click="confirmApprove(item)"
          />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания ведомости -->
    <v-dialog v-model="showCreateModal" max-width="500" persistent>
      <v-card>
        <v-card-title>
          <v-icon start>mdi-file-document-plus</v-icon>
          Сформировать ведомость
        </v-card-title>
        <v-card-text>
          <v-alert v-if="formApiError" type="error" class="mb-4" closable @click:close="formApiError = ''">
            {{ formApiError }}
          </v-alert>
          <v-form @submit.prevent="createPayroll">
            <v-text-field
              v-model="createForm.period"
              label="Период"
              placeholder="2024-01"
              variant="outlined"
              class="mb-2"
              hint="Формат: ГГГГ-ММ"
              persistent-hint
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateModal = false">Отмена</v-btn>
          <v-btn color="primary" :loading="submitting" @click="createPayroll">
            Сформировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог просмотра деталей ведомости -->
    <v-dialog v-model="showDetailsModal" max-width="900">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <v-icon start>mdi-file-document</v-icon>
            Ведомость за {{ selectedPayroll?.period }}
          </div>
          <v-chip :color="getStatusColor(selectedPayroll?.status)" size="small">
            {{ getStatusLabel(selectedPayroll?.status) }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-row class="mb-4">
            <v-col cols="4">
              <div class="text-subtitle-2 text-medium-emphasis">Начислено</div>
              <div class="text-h6 text-success">{{ formatCurrency(selectedPayroll?.totalAccrued || 0) }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-subtitle-2 text-medium-emphasis">Удержано</div>
              <div class="text-h6 text-error">{{ formatCurrency(selectedPayroll?.totalDeducted || 0) }}</div>
            </v-col>
            <v-col cols="4">
              <div class="text-subtitle-2 text-medium-emphasis">К выплате</div>
              <div class="text-h6 font-weight-bold">{{ formatCurrency(selectedPayroll?.totalNet || 0) }}</div>
            </v-col>
          </v-row>

          <v-divider class="mb-4" />

          <v-data-table
            :headers="detailHeaders"
            :items="payrollItems"
            :loading="loadingDetails"
            no-data-text="Нет данных"
            density="compact"
          >
            <template #item.accrued="{ item }">
              {{ formatCurrency(item.accrued) }}
            </template>
            <template #item.deducted="{ item }">
              {{ formatCurrency(item.deducted) }}
            </template>
            <template #item.net="{ item }">
              <span class="font-weight-bold">{{ formatCurrency(item.net) }}</span>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDetailsModal = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения утверждения -->
    <v-dialog v-model="showApproveDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon start color="success">mdi-check-circle</v-icon>
          Утверждение ведомости
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите утвердить ведомость за период "{{ payrollToApprove?.period }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showApproveDialog = false">Отмена</v-btn>
          <v-btn color="success" :loading="approving" @click="approvePayroll">Утвердить</v-btn>
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
          Вы уверены, что хотите удалить ведомость за период "{{ payrollToDelete?.period }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Отмена</v-btn>
          <v-btn color="error" :loading="deleting" @click="deletePayroll">Удалить</v-btn>
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

const payrollSheets = ref<any[]>([])
const payrollItems = ref<any[]>([])
const selectedPayroll = ref<any>(null)
const loading = ref(false)
const loadingDetails = ref(false)
const submitting = ref(false)
const approving = ref(false)
const deleting = ref(false)
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const showApproveDialog = ref(false)
const showDeleteDialog = ref(false)
const payrollToApprove = ref<any>(null)
const payrollToDelete = ref<any>(null)
const formApiError = ref('')

const createForm = ref({
  period: '',
})

const headers = [
  { title: 'Период', key: 'period', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Начислено', key: 'totalAccrued', sortable: true },
  { title: 'Удержано', key: 'totalDeducted', sortable: true },
  { title: 'К выплате', key: 'totalNet', sortable: true },
  { title: 'Дата создания', key: 'createdAt', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center' as const },
]

const detailHeaders = [
  { title: 'Сотрудник', key: 'employeeName', sortable: true },
  { title: 'Начислено', key: 'accrued', sortable: true },
  { title: 'Удержано', key: 'deducted', sortable: true },
  { title: 'К выплате', key: 'net', sortable: true },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'warning',
    approved: 'success',
    paid: 'primary',
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    approved: 'Утверждена',
    paid: 'Оплачена',
  }
  return labels[status] || status
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

const fetchPayrolls = async () => {
  loading.value = true
  try {
    const response = await api.get('/payroll')
    const result = response.data as any
    payrollSheets.value = result.data || result || []
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  createForm.value.period = ''
  formApiError.value = ''
  showCreateModal.value = true
}

const createPayroll = async () => {
  formApiError.value = ''
  if (!createForm.value.period) {
    formApiError.value = 'Укажите период'
    return
  }

  submitting.value = true
  try {
    await api.post('/payroll', { period: createForm.value.period })
    toast.success('Ведомость успешно сформирована')
    showCreateModal.value = false
    await fetchPayrolls()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    formApiError.value = message
  } finally {
    submitting.value = false
  }
}

const viewDetails = async (payroll: any) => {
  selectedPayroll.value = payroll
  showDetailsModal.value = true
  loadingDetails.value = true
  try {
    const response = await api.get(`/payroll/${payroll.id}`)
    const result = response.data as any
    selectedPayroll.value = result
    payrollItems.value = (result.items || []).map((item: any) => ({
      ...item,
      employeeName: item.employeeName ||
        (item.employee ? [item.employee.lastName, item.employee.firstName].filter(Boolean).join(' ') : `ID: ${item.employeeId}`),
    }))
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  } finally {
    loadingDetails.value = false
  }
}

const confirmApprove = (payroll: any) => {
  payrollToApprove.value = payroll
  showApproveDialog.value = true
}

const approvePayroll = async () => {
  if (!payrollToApprove.value) return

  approving.value = true
  try {
    await api.put(`/payroll/${payrollToApprove.value.id}/approve`, {})
    toast.success('Ведомость утверждена')
    showApproveDialog.value = false
    payrollToApprove.value = null
    await fetchPayrolls()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    toast.error(message)
  } finally {
    approving.value = false
  }
}

const confirmDelete = (payroll: any) => {
  payrollToDelete.value = payroll
  showDeleteDialog.value = true
}

const deletePayroll = async () => {
  if (!payrollToDelete.value) return

  deleting.value = true
  try {
    await api.delete(`/payroll/${payrollToDelete.value.id}`)
    toast.success('Ведомость удалена')
    showDeleteDialog.value = false
    payrollToDelete.value = null
    await fetchPayrolls()
  } catch (e: any) {
    const message = getReadableErrorMessage(e)
    toast.error(message)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchPayrolls()
})
</script>
