"use client"

import { useState, useEffect, useCallback } from "react"

interface UseApiWithRetryOptions {
  maxRetries?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onRetry?: (attempt: number, error: Error) => void
}

export function useApiWithRetry<T>(apiFunction: () => Promise<T>, options: UseApiWithRetryOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000, onSuccess, onError, onRetry } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiFunction()
      setData(result)
      setLoading(false)
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error("API error:", error)

      if (retryCount < maxRetries) {
        onRetry?.(retryCount + 1, error)

        // Schedule retry
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          execute()
        }, retryDelay * Math.pow(2, retryCount)) // Exponential backoff
      } else {
        setError(error)
        setLoading(false)
        onError?.(error)
      }

      return null
    }
  }, [apiFunction, maxRetries, onError, onRetry, onSuccess, retryCount, retryDelay])

  useEffect(() => {
    execute()
  }, [execute])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setRetryCount(0)
  }, [])

  const retry = useCallback(() => {
    setRetryCount(0)
    execute()
  }, [execute])

  return { data, error, loading, retry, reset, execute }
}
