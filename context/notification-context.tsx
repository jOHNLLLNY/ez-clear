"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/context/user-context"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { soundUtils } from "@/utils/sound-utils"

interface NotificationData {
  job_id?: number
  application_id?: number
  applicant_id?: string
  conversation_id?: number
  sender_id?: string
}

interface Notification {
  id: number
  user_id: string
  type: string
  title: string
  description: string
  created_at: string
  read: boolean
  data?: NotificationData
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  soundEnabled: boolean
  toggleSound: () => void
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userId } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Initialize from the soundUtils
    return soundUtils.isSoundEnabled()
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Function to fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return

    try {
      console.log("Fetching notifications for user:", userId)

      // First try to fetch from our API endpoint
      try {
        const response = await fetch(`/api/notifications?user_id=${userId}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Notifications fetched from API:", data)
          setNotifications(data || [])
          setUnreadCount(data?.filter((n: Notification) => !n.read).length || 0)
          return
        }
      } catch (apiError) {
        console.error("Error fetching notifications from API:", apiError)
      }

      // Fallback to direct Supabase query
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notifications from Supabase:", error)
        return
      }

      console.log("Notifications fetched from Supabase:", data)
      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    } catch (err) {
      console.error("Error in fetchNotifications:", err)
    }
  }

  useEffect(() => {
    let notificationsSubscription: RealtimeChannel | null = null

    if (userId) {
      console.log("Setting up notification subscription for user:", userId)

      // Initial fetch
      fetchNotifications().then(() => {
        setIsInitialized(true)
      })

      // Set up real-time subscription
      notificationsSubscription = supabase
        .channel(`notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("Notification change received:", payload)

            if (payload.eventType === "INSERT") {
              // Add new notification to the list
              const newNotification = payload.new as Notification
              setNotifications((prev) => [newNotification, ...prev])
              if (!newNotification.read) {
                setUnreadCount((prev) => prev + 1)

                // Play notification sound if enabled
                if (soundEnabled) {
                  soundUtils.playNotificationSound()
                }
              }

              // Show browser notification if supported
              if (document.visibilityState !== "visible" && "Notification" in window) {
                if (Notification.permission === "granted") {
                  new Notification(newNotification.title, {
                    body: newNotification.description,
                    icon: "/favicon.ico",
                  })
                } else if (Notification.permission !== "denied") {
                  Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                      new Notification(newNotification.title, {
                        body: newNotification.description,
                        icon: "/favicon.ico",
                      })
                    }
                  })
                }
              }
            } else if (payload.eventType === "UPDATE") {
              // Update notification in the list
              setNotifications((prev) =>
                prev.map((notification) =>
                  notification.id === payload.new.id ? { ...notification, ...payload.new } : notification,
                ),
              )

              // Recalculate unread count
              fetchNotifications()
            } else if (payload.eventType === "DELETE") {
              // Remove notification from the list
              setNotifications((prev) => prev.filter((notification) => notification.id !== payload.old.id))

              // Recalculate unread count
              fetchNotifications()
            }
          },
        )
        .subscribe((status) => {
          console.log("Notification subscription status:", status)
        })

      console.log("Notification subscription set up:", notificationsSubscription)
    }

    // Clean up subscription
    return () => {
      if (notificationsSubscription) {
        console.log("Removing notification subscription")
        supabase.removeChannel(notificationsSubscription)
      }
    }
  }, [userId, soundEnabled])

  // Refresh notifications when user changes
  useEffect(() => {
    if (userId && isInitialized) {
      fetchNotifications()
    }
  }, [userId, isInitialized])

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled
    setSoundEnabled(newSoundEnabled)
    soundUtils.setSoundEnabled(newSoundEnabled)
  }

  const markAsRead = async (id: number) => {
    if (!userId) return

    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

      if (error) {
        console.error("Error marking notification as read:", error)
        return
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error in markAsRead:", err)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) {
        console.error("Error marking all notifications as read:", error)
        return
      }

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error in markAllAsRead:", err)
    }
  }

  const refreshNotifications = async () => {
    return fetchNotifications()
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
