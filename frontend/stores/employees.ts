import { defineStore } from 'pinia'

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    employees: [] as any[],
    filters: {} as any,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
  }),

  actions: {
    async fetchEmployees(filters?: any) {
      const api = useApi()
      const response = await api.get('/employees', { params: filters })
      // Backend возвращает PaginatedResponse: { data, page, limit, total }
      const result = response.data as any
      this.employees = result.data || []
      this.pagination = {
        page: result.page || 1,
        limit: result.limit || 10,
        total: result.total || 0,
      }
    },

    async createEmployee(data: any) {
      const api = useApi()
      const response = await api.post('/employees', data)
      const newEmployee = response.data
      this.employees.unshift(newEmployee)
      return newEmployee
    },

    async updateEmployee(id: number, data: any) {
      const api = useApi()
      const response = await api.put(`/employees/${id}`, data)
      const updatedEmployee = response.data
      const index = this.employees.findIndex(e => e.id === id)
      if (index !== -1) {
        this.employees[index] = updatedEmployee
      }
      return updatedEmployee
    },

    async deleteEmployee(id: number) {
      const api = useApi()
      await api.delete(`/employees/${id}`)
      this.employees = this.employees.filter(e => e.id !== id)
    },
  },
})
