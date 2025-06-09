import { supabase } from "@/lib/supabase"

interface ErrorRecoveryOptions {
  retryCount?: number
  maxRetries?: number
  retryDelay?: number
}

export const errorRecovery = {
  // Автоматичне відновлення сесії
  async recoverSession(options: ErrorRecoveryOptions = {}) {
    const { retryCount = 0, maxRetries = 3, retryDelay = 1000 } = options

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        // Спробувати оновити сесію
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError && retryCount < maxRetries) {
          // Спробувати ще раз після затримки
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return this.recoverSession({
            retryCount: retryCount + 1,
            maxRetries,
            retryDelay: retryDelay * 2, // Експоненційна затримка
          })
        }

        return { success: !!refreshData.session, session: refreshData.session }
      }

      return { success: true, session: data.session }
    } catch (error) {
      console.error("Session recovery error:", error)
      return { success: false, error }
    }
  },

  // Автоматичне відновлення з'єднання з базою даних
  async recoverDatabaseConnection(options: ErrorRecoveryOptions = {}) {
    const { retryCount = 0, maxRetries = 3, retryDelay = 1000 } = options

    try {
      // Перевірка з'єднання з базою даних
      const { data, error } = await supabase.from("profiles").select("id").limit(1)

      if (error) {
        if (error.code === "PGRST301" && retryCount < maxRetries) {
          // Помилка з'єднання, спробувати ще раз після затримки
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return this.recoverDatabaseConnection({
            retryCount: retryCount + 1,
            maxRetries,
            retryDelay: retryDelay * 2,
          })
        }

        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      console.error("Database connection recovery error:", error)
      return { success: false, error }
    }
  },

  // Автоматичне виправлення помилок API
  async recoverApiCall<T>(
    apiCall: () => Promise<T>,
    options: ErrorRecoveryOptions = {},
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    const { retryCount = 0, maxRetries = 3, retryDelay = 1000 } = options

    try {
      const result = await apiCall()
      return { success: true, data: result }
    } catch (error: any) {
      console.error(`API call error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error)

      // Перевірка типу помилки
      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        // Мережева помилка, спробувати ще раз
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return this.recoverApiCall(apiCall, {
            retryCount: retryCount + 1,
            maxRetries,
            retryDelay: retryDelay * 2,
          })
        }
      } else if (error.status === 401) {
        // Помилка авторизації, спробувати оновити сесію
        const sessionRecovery = await this.recoverSession()
        if (sessionRecovery.success && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return this.recoverApiCall(apiCall, {
            retryCount: retryCount + 1,
            maxRetries,
            retryDelay,
          })
        }
      }

      return { success: false, error }
    }
  },

  // Автоматичне виправлення помилок завантаження даних
  async recoverDataFetch<T>(
    fetchFunction: () => Promise<T>,
    fallbackData: T,
    options: ErrorRecoveryOptions = {},
  ): Promise<T> {
    try {
      const result = await this.recoverApiCall(fetchFunction, options)
      return result.success ? result.data! : fallbackData
    } catch (error) {
      console.error("Data fetch recovery error:", error)
      return fallbackData
    }
  },
}
