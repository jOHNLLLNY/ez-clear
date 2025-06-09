"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error) {
    // Don't treat redirects as errors
    if (error && typeof error === "object" && "redirect" in error) {
      return null
    }

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Don't treat redirects as errors
    if (error && typeof error === "object" && "redirect" in error) {
      console.log("Redirect detected, not treating as an error:", error)
      return
    }

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Log error to console
    console.error("Error caught by ErrorBoundary:", error, errorInfo)

    // Send error to server for logging
    this.logErrorToServer(error, errorInfo)
  }

  logErrorToServer(error: Error, errorInfo: ErrorInfo) {
    // Send error to server for logging
    fetch("/api/error-logger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => {
      console.error("Failed to log error to server:", err)
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Auto-retry for the first error
      if (this.state.errorCount === 1) {
        setTimeout(() => {
          this.handleRetry()
        }, 2000)
      }

      // Custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Щось пішло не так</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Виникла помилка при завантаженні цього компоненту. Ми автоматично спробуємо виправити проблему.
            </p>
            <div className="flex gap-4">
              <Button onClick={this.handleRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Спробувати знову
              </Button>
              <Button onClick={this.handleReload}>Перезавантажити сторінку</Button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-card rounded-md text-left overflow-auto max-w-full">
                <p className="font-mono text-sm mb-2">{this.state.error?.toString()}</p>
                <pre className="font-mono text-xs text-muted-foreground">{this.state.errorInfo?.componentStack}</pre>
              </div>
            )}
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
