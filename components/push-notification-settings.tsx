"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/context/user-context"
import { Bell, BellOff, AlertCircle } from "lucide-react"
import { webPushUtils } from "@/utils/web-push-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PushNotificationSettings() {
  const { userId } = useUser()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  // Check if push notifications are supported and if the user is subscribed
  useEffect(() => {
    const checkPushStatus = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if push is supported
        const supported = webPushUtils.isPushSupported()
        setIsSupported(supported)

        if (!supported) {
          setIsLoading(false)
          return
        }

        // Check if service worker is registered
        await webPushUtils.registerServiceWorker()

        // Check if user is subscribed
        const subscribed = await webPushUtils.isSubscribed()
        setPushEnabled(subscribed)
      } catch (err: any) {
        console.error("Error checking push status:", err)
        setError(err.message || "Failed to check push notification status")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      checkPushStatus()
    }
  }, [userId])

  const handleTogglePush = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      if (pushEnabled) {
        // Unsubscribe
        const result = await webPushUtils.unsubscribeFromPushNotifications(userId)
        if (result.success) {
          setPushEnabled(false)
        } else {
          setError(result.message || "Failed to unsubscribe")
        }
      } else {
        // Subscribe
        const result = await webPushUtils.subscribeToPushNotifications(userId)
        if (result.success) {
          setPushEnabled(true)
        } else {
          setError(result.message || "Failed to subscribe")
        }
      }
    } catch (err: any) {
      console.error("Error toggling push notifications:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Supported</AlertTitle>
        <AlertDescription>
          Push notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or
          Edge.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {pushEnabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-gray-400" />}
          <span>Push Notifications</span>
        </div>
        <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} disabled={isLoading} />
      </div>

      <div className="text-sm text-gray-500">
        {pushEnabled
          ? "You will receive notifications even when you're not using the app"
          : "Enable to receive notifications when you're offline"}
      </div>

      {isLoading && <div className="text-sm text-gray-500 animate-pulse">Processing...</div>}
    </div>
  )
}
