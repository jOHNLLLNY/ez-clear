"use client"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorAlertProps {
  title?: string
  message: string
  onDismiss?: () => void
  onRetry?: () => void
  variant?: "default" | "destructive"
}

export function ErrorAlert({
  title = "Помилка",
  message,
  onDismiss,
  onRetry,
  variant = "destructive",
}: ErrorAlertProps) {
  return (
    <Alert variant={variant} className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>

      {onDismiss && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onDismiss}>
          <X className="h-4 w-4" />
          <span className="sr-only">Закрити</span>
        </Button>
      )}

      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Спробувати знову
        </Button>
      )}
    </Alert>
  )
}
