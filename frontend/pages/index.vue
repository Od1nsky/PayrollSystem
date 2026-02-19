<template>
  <div>
    <h1 class="text-h4 mb-6">Панель управления</h1>

    <v-row>
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" md="4">
        <v-card class="text-center pa-6" elevation="2">
          <v-icon :icon="stat.icon" size="48" :color="stat.color" class="mb-4" />
          <div class="text-h3 font-weight-bold" :class="`text-${stat.color}`">
            {{ stat.value }}
          </div>
          <div class="text-subtitle-1 text-medium-emphasis mt-2">
            {{ stat.label }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-line</v-icon>
            Последние начисления
          </v-card-title>
          <v-card-text>
            <v-list v-if="recentAccruals.length > 0">
              <v-list-item v-for="item in recentAccruals" :key="item.id">
                <template #prepend>
                  <v-avatar color="primary" size="40">
                    <v-icon>mdi-cash-plus</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.employeeName || 'Сотрудник' }} - {{ getAccrualTypeLabel(item.type) }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatCurrency(item.amount) }} | {{ item.period }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="tonal">
              Нет данных о начислениях
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-information</v-icon>
            Быстрые действия
          </v-card-title>
          <v-card-text>
            <v-btn block color="primary" class="mb-2" to="/employees" prepend-icon="mdi-account-group">
              Сотрудники
            </v-btn>
            <v-btn block color="success" class="mb-2" to="/accruals" prepend-icon="mdi-cash-plus">
              Начисления
            </v-btn>
            <v-btn block color="warning" class="mb-2" to="/payroll" prepend-icon="mdi-file-document">
              Ведомости
            </v-btn>
            <v-btn block color="info" to="/reports" prepend-icon="mdi-chart-bar">
              Отчеты
            </v-btn>
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

const stats = ref([
  { label: 'Сотрудников', value: '0', icon: 'mdi-account-group', color: 'primary' },
  { label: 'ФОТ', value: '0 \u20BD', icon: 'mdi-currency-rub', color: 'success' },
  { label: 'Средняя зарплата', value: '0 \u20BD', icon: 'mdi-chart-line', color: 'info' },
])

const recentAccruals = ref<any[]>([])

const accrualTypeLabels: Record<string, string> = {
  salary: 'Зарплата',
  bonus: 'Премия',
  vacation: 'Отпускные',
  sick_leave: 'Больничный',
  overtime: 'Сверхурочные',
}

const getAccrualTypeLabel = (type: string) => {
  return accrualTypeLabels[type] || type
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const fetchSummary = async () => {
  try {
    const response = await api.get('/reports/summary')
    const data = response.data as any
    stats.value[0].value = String(data.activeEmployees ?? data.totalEmployees ?? 0)
    stats.value[1].value = formatCurrency(data.totalSalaryFund ?? 0)
    stats.value[2].value = formatCurrency(data.averageSalary ?? 0)
  } catch (error: any) {
    const message = getReadableErrorMessage(error)
    toast.error(message)
  }
}

const fetchRecentAccruals = async () => {
  try {
    const response = await api.get('/accruals', { params: { limit: 5 } })
    const result = response.data as any
    recentAccruals.value = result.data || result || []
  } catch (error: any) {
    console.error('Failed to fetch recent accruals:', error)
  }
}

onMounted(() => {
  fetchSummary()
  fetchRecentAccruals()
})
</script>
