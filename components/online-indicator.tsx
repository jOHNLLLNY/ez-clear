"use client"

import { useOnlineStatus } from "./online-status-provider"
import { cn } from "@/lib/utils"

interface OnlineIndicatorProps {
  userId: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function OnlineIndicator({ userId, className, size = "md" }: OnlineIndicatorProps) {
  const { isUserOnline } = useOnlineStatus()
  const online = isUserOnline(userId)

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  return (
    <span
      className={cn("inline-block rounded-full", online ? "bg-green-500" : "bg-gray-300", sizeClasses[size], className)}
      title={online ? "Online" : "Offline"}
      aria-label={online ? "User is online" : "User is offline"}
    />
  )
}
