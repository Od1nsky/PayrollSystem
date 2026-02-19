// Маппинг ошибок для обратной совместимости (бэкенд теперь возвращает ошибки на русском)
// Оставляем только для случаев, когда ошибка может прийти на английском
const errorMessages: Record<string, string> = {
  // Сетевые ошибки
  'Network error': 'Ошибка сети. Проверьте подключение к интернету',
  'fetch failed': 'Ошибка соединения с сервером',
  'Failed to fetch': 'Ошибка соединения с сервером',
}

// Функция для получения человекочитаемого сообщения об ошибке
export const getReadableErrorMessage = (error: any): string => {
  // Если это строка, проверяем маппинг или возвращаем как есть (бэкенд уже на русском)
  if (typeof error === 'string') {
    return errorMessages[error] || error
  }

  // Если это объект ошибки от $fetch с полем error
  if (error?.data?.error) {
    const message = error.data.error
    // Бэкенд теперь возвращает ошибки на русском, но проверяем маппинг для сетевых ошибок
    return errorMessages[message] || message
  }

  // Если это объект ошибки валидации от express-validator
  if (error?.data?.errors && Array.isArray(error.data.errors)) {
    const firstError = error.data.errors[0]
    if (firstError?.msg) {
      return firstError.msg
    }
  }

  if (error?.data?.message) {
    const message = error.data.message
    return errorMessages[message] || message
  }

  // Если это объект с полем message
  if (error?.message) {
    const message = error.message
    return errorMessages[message] || message
  }

  // Обработка HTTP статусов
  if (error?.statusCode || error?.status) {
    const status = error.statusCode || error.status
    switch (status) {
      case 400: return 'Некорректный запрос'
      case 401: return 'Требуется авторизация'
      case 403: return 'Доступ запрещён'
      case 404: return 'Ресурс не найден'
      case 409: return 'Конфликт данных'
      case 422: return 'Ошибка валидации'
      case 429: return 'Слишком много запросов'
      case 500: return 'Внутренняя ошибка сервера'
      case 502: return 'Сервер временно недоступен'
      case 503: return 'Сервис недоступен'
      default: return `Ошибка сервера (${status})`
    }
  }

  // Fallback
  return 'Произошла неизвестная ошибка'
}
