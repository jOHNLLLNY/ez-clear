"use client"

import { useState, useEffect } from "react"
import { useNotifications } from "@/context/notification-context"
import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, MessageSquare, Briefcase, Clock, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications()
  const { userId } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      refreshNotifications().then(() => {
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [userId, refreshNotifications])

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    await markAsRead(notification.id)

    // Navigate based on notification type
    if (notification.type === "message" && notification.data?.conversation_id) {
      router.push(`/messages/${notification.data.conversation_id}`)
    } else if (notification.type === "application" && notification.data?.job_id) {
      router.push(`/my-jobs/hirer?job_id=${notification.data.job_id}`)
    } else if (notification.type === "job" && notification.data?.job_id) {
      router.push(`/job-details/${notification.data.job_id}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "application":
        return <Briefcase className="h-5 w-5 text-green-500" />
      case "job":
        return <Briefcase className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500">Loading notifications...</p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Bell className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-700">Notifications</h1>
        <p className="text-gray-500 mt-2">Please sign in to view your notifications</p>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-20 bg-background text-foreground">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/home/worker" className="mr-3 rounded-full hover:bg-gray-800 p-1 transition-colors duration-200">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="border-border text-foreground hover:bg-muted"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Bell className="h-16 w-16 text-muted mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-2xl border border-border ${
                notification.read ? "bg-card" : "bg-primary/10"
              } cursor-pointer transition-colors hover:bg-muted`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{notification.title}</h3>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{notification.description}</p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
