import { z } from 'zod'

// Схемы валидации
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен для заполнения')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен для заполнения')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Имя обязательно для заполнения')
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя должно содержать максимум 50 символов'),
  email: z
    .string()
    .min(1, 'Email обязателен для заполнения')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен для заполнения')
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль слишком длинный'),
})

export const employeeSchema = z.object({
  fullName: z
    .string()
    .min(1, 'ФИО обязательно для заполнения')
    .min(2, 'ФИО должно содержать минимум 2 символа')
    .max(200, 'ФИО слишком длинное'),
  personnelNumber: z
    .string()
    .min(1, 'Табельный номер обязателен для заполнения')
    .max(50, 'Табельный номер слишком длинный'),
  department: z
    .string()
    .min(1, 'Отдел обязателен для заполнения'),
  position: z
    .string()
    .min(1, 'Должность обязательна для заполнения'),
  hireDate: z
    .string()
    .min(1, 'Дата приёма обязательна для заполнения'),
  status: z
    .string()
    .min(1, 'Выберите статус'),
  baseSalary: z.coerce
    .number({ message: 'Оклад должен быть числом' })
    .min(0, 'Оклад не может быть отрицательным')
    .max(999999999999, 'Оклад слишком большой'),
})

export const accrualSchema = z.object({
  employeeId: z.coerce
    .number({ message: 'Выберите сотрудника' })
    .min(1, 'Выберите сотрудника'),
  type: z
    .string()
    .min(1, 'Тип начисления обязателен для заполнения'),
  amount: z.coerce
    .number({ message: 'Сумма должна быть числом' })
    .min(0.01, 'Сумма должна быть больше нуля')
    .max(999999999999, 'Сумма слишком большая'),
  period: z
    .string()
    .min(1, 'Период обязателен для заполнения'),
  date: z
    .string()
    .min(1, 'Дата обязательна для заполнения'),
})

export const deductionSchema = z.object({
  employeeId: z.coerce
    .number({ message: 'Выберите сотрудника' })
    .min(1, 'Выберите сотрудника'),
  type: z
    .string()
    .min(1, 'Тип удержания обязателен для заполнения'),
  amount: z.coerce
    .number({ message: 'Сумма должна быть числом' })
    .min(0.01, 'Сумма должна быть больше нуля')
    .max(999999999999, 'Сумма слишком большая'),
  period: z
    .string()
    .min(1, 'Период обязателен для заполнения'),
  date: z
    .string()
    .min(1, 'Дата обязательна для заполнения'),
})

// Типы для форм
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type EmployeeForm = z.infer<typeof employeeSchema>
export type AccrualForm = z.infer<typeof accrualSchema>
export type DeductionForm = z.infer<typeof deductionSchema>

// Хелпер для преобразования ошибок Zod в формат для Vuetify
export const getFieldErrors = (
  result: ReturnType<typeof loginSchema.safeParse> | ReturnType<typeof registerSchema.safeParse> | ReturnType<typeof employeeSchema.safeParse>,
  fieldName: string
): string[] => {
  if (result.success) return []

  const issues = result.error.issues || []
  const fieldErrors = issues
    .filter((issue: any) => issue.path.includes(fieldName))
    .map((issue: any) => issue.message)

  return fieldErrors
}

// Хелпер для получения всех ошибок в виде объекта
export const getAllFieldErrors = (
  result: any
): Record<string, string> => {
  if (result.success) return {}

  const errors: Record<string, string> = {}
  const issues = result.error?.issues || []
  issues.forEach((issue: any) => {
    const field = issue.path[0] as string
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
  })

  return errors
}
