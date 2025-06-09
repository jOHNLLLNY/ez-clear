"use client"

import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type ErrorSeverity = "error" | "warning" | "info"

interface ErrorAction {
  label: string
  href?: string
  onClick?: () => void
  primary?: boolean
}

interface ErrorMessageProps {
  title?: string
  message: string
  severity?: ErrorSeverity
  actions?: ErrorAction[]
}

export function ErrorMessage({ title, message, severity = "error", actions }: ErrorMessageProps) {
  const getIcon = () => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (severity) {
      case "error":
        return "bg-destructive/10 border-destructive/30 text-destructive-foreground"
      case "warning":
        return "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300"
      case "info":
        return "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
    }
  }

  return (
    <div className={`px-4 py-3 rounded-lg border ${getBgColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className="text-sm mt-1">{message}</div>

          {actions && actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((action, index) =>
                action.href ? (
                  <Link
                    key={index}
                    href={action.href}
                    className={`text-sm font-medium ${
                      action.primary
                        ? "text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md"
                        : "text-primary hover:underline"
                    }`}
                  >
                    {action.label}
                  </Link>
                ) : (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.primary ? "default" : "link"}
                    size="sm"
                    className={action.primary ? "" : "h-auto p-0"}
                  >
                    {action.label}
                  </Button>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
