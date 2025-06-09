"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationSettings } from "@/components/notification-settings"
import { PushNotificationSettings } from "@/components/push-notification-settings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotificationSettingsPage() {
  const router = useRouter()

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Notification Settings</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sound Notifications</CardTitle>
          <CardDescription>Configure sound alerts for new notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Receive notifications even when you're offline</CardDescription>
        </CardHeader>
        <CardContent>
          <PushNotificationSettings />
        </CardContent>
      </Card>
    </div>
  )
}
