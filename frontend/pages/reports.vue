<template>
  <div>
    <h1 class="text-h4 mb-6">Отчеты</h1>

    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-pie</v-icon>
            Сводка
          </v-card-title>
          <v-card-text>
            <v-list v-if="summary">
              <v-list-item>
                <v-list-item-title>Всего сотрудников</v-list-item-title>
                <template #append>
                  <v-chip color="primary" size="small">{{ summary.totalEmployees }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Активных</v-list-item-title>
                <template #append>
                  <v-chip color="success" size="small">{{ summary.activeEmployees }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>ФОТ</v-list-item-title>
                <template #append>
                  <v-chip color="success" size="small">{{ formatCurrency(summary.totalSalaryFund) }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Средняя зарплата</v-list-item-title>
                <template #append>
                  <v-chip color="info" size="small">{{ formatCurrency(summary.averageSalary) }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Всего начислено</v-list-item-title>
                <template #append>
                  <v-chip color="primary" size="small">{{ formatCurrency(summary.totalAccrued) }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Всего удержано</v-list-item-title>
                <template #append>
                  <v-chip color="error" size="small">{{ formatCurrency(summary.totalDeducted) }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-progress-circular v-else-if="loading" indeterminate />
            <v-alert v-else type="info">Нет данных</v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon start>mdi-office-building</v-icon>
            По отделам
          </v-card-title>
          <v-card-text>
            <v-data-table
              v-if="departmentReport.length > 0"
              :headers="departmentHeaders"
              :items="departmentReport"
              density="compact"
              no-data-text="Нет данных"
            >
              <template #item.totalSalary="{ item }">
                {{ formatCurrency(item.totalSalary) }}
              </template>
              <template #item.avgSalary="{ item }">
                {{ formatCurrency(item.avgSalary) }}
              </template>
            </v-data-table>
            <v-progress-circular v-else-if="loading" indeterminate />
            <v-alert v-else type="info">Нет данных</v-alert>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon start>mdi-account-group</v-icon>
            По сотрудникам
          </v-card-title>
          <v-card-text>
            <v-data-table
              v-if="employeeReport.length > 0"
              :headers="employeeHeaders"
              :items="employeeReport"
              density="compact"
              no-data-text="Нет данных"
            >
              <template #item.salary="{ item }">
                {{ formatCurrency(item.salary) }}
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
            </v-data-table>
            <v-progress-circular v-else-if="loading" indeterminate />
            <v-alert v-else type="info">Нет данных</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-download</v-icon>
            Экспорт отчетов
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="primary" prepend-icon="mdi-file-document" @click="exportReport('summary')" :loading="exporting">
                  Сводка (JSON)
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="primary" prepend-icon="mdi-file-document" @click="exportReport('by-department')" :loading="exporting">
                  По отделам (JSON)
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="primary" prepend-icon="mdi-file-document" @click="exportReport('by-employee')" :loading="exporting">
                  По сотрудникам (JSON)
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="primary" prepend-icon="mdi-file-document" @click="exportReport('all')" :loading="exporting">
                  Все отчеты (JSON)
                </v-btn>
              </v-col>
            </v-row>
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

const api = useApi()
const toast = useToast()

const summary = ref<any>(null)
const departmentReport = ref<any[]>([])
const employeeReport = ref<any[]>([])
const loading = ref(false)
const exporting = ref(false)

const departmentHeaders = [
  { title: 'Отдел', key: 'department', sortable: true },
  { title: 'Сотрудников', key: 'employeeCount', sortable: true },
  { title: 'Общий ФОТ', key: 'totalSalary', sortable: true },
  { title: 'Средняя зарплата', key: 'avgSalary', sortable: true },
]

const employeeHeaders = [
  { title: 'Сотрудник', key: 'employeeName', sortable: true },
  { title: 'Отдел', key: 'department', sortable: true },
  { title: 'Оклад', key: 'salary', sortable: true },
  { title: 'Начислено', key: 'totalAccrued', sortable: true },
  { title: 'Удержано', key: 'totalDeducted', sortable: true },
  { title: 'К выплате', key: 'totalNet', sortable: true },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(value || 0)
}

const fetchSummary = async () => {
  try {
    const response = await api.get('/reports/summary')
    summary.value = response.data
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  }
}

const fetchDepartmentReport = async () => {
  try {
    const response = await api.get('/reports/by-department')
    departmentReport.value = (response.data as any) || []
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  }
}

const fetchEmployeeReport = async () => {
  try {
    const response = await api.get('/reports/by-employee')
    const result = response.data as any
    employeeReport.value = (result || []).map((item: any) => ({
      ...item,
      employeeName: item.employeeName ||
        [item.lastName, item.firstName].filter(Boolean).join(' ') ||
        `ID: ${item.employeeId}`,
    }))
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  }
}

const fetchAllReports = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchSummary(),
      fetchDepartmentReport(),
      fetchEmployeeReport(),
    ])
  } finally {
    loading.value = false
  }
}

const exportReport = async (type: string) => {
  exporting.value = true
  try {
    let data: any

    if (type === 'all') {
      data = {
        summary: summary.value,
        byDepartment: departmentReport.value,
        byEmployee: employeeReport.value,
      }
    } else {
      const response = await api.get(`/reports/${type}`)
      data = response.data
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${type}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Отчет успешно экспортирован')
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  fetchAllReports()
})
</script>
