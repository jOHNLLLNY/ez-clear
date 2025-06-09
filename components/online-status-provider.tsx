"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { usePathname } from "next/navigation"

// Define the context type
type OnlineStatusContextType = {
  onlineUsers: Record<string, boolean>
  isUserOnline: (userId: string) => boolean
  connectionStatus: "connected" | "disconnected" | "connecting" | "disabled"
}

// Create the context
const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined)

// Provider component
export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({})
  const [lastActivity, setLastActivity] = useState<Record<string, number>>({})
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting" | "disabled">(
    "disconnected",
  )
  const lastFetchRef = useRef<number>(0)
  const fetchInProgressRef = useRef<boolean>(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef<number>(0)
  const MAX_RETRY_COUNT = 5
  const MIN_FETCH_INTERVAL = 10000 // 10 seconds minimum between fetches

  // Function to check if a user is online
  const isUserOnline = (userId: string) => {
    if (!userId) return false
    return !!onlineUsers[userId]
  }

  // Check if current page is an auth page
  const isAuthPage = () => {
    return pathname?.startsWith("/auth") || pathname === "/login" || pathname === "/sign-in"
  }

  // Fetch online users with better error handling
  const fetchOnlineUsers = async (force = false) => {
    // Skip if fetch is already in progress
    if (fetchInProgressRef.current) {
      return
    }

    // Rate limiting - don't fetch too frequently unless forced
    const now = Date.now()
    if (!force && now - lastFetchRef.current < MIN_FETCH_INTERVAL) {
      return
    }

    try {
      fetchInProgressRef.current = true
      lastFetchRef.current = now

      // Use Supabase client instead of direct fetch
      const { data, error } = await supabase.from("profiles").select("id, is_online").not("id", "is", null)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Process the data
      const onlineMap: Record<string, boolean> = {}
      const activityMap: Record<string, number> = {}

      if (Array.isArray(data)) {
        data.forEach((profile) => {
          if (profile.id) {
            onlineMap[profile.id] = profile.is_online || false
            if (profile.is_online) {
              activityMap[profile.id] = Date.now()
            }
          }
        })
      }

      setOnlineUsers(onlineMap)
      setLastActivity(activityMap)
      setConnectionStatus("connected")

      // Reset retry count on success
      retryCountRef.current = 0
    } catch (error: any) {
      console.error("Error fetching online users:", error)
      setConnectionStatus("disconnected")

      // Implement exponential backoff for retries
      if (retryCountRef.current < MAX_RETRY_COUNT) {
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000) // Max 30 seconds
        console.log(
          `Retrying fetch in ${delay / 1000} seconds (attempt ${retryCountRef.current + 1}/${MAX_RETRY_COUNT})`,
        )

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }

        retryTimeoutRef.current = setTimeout(() => {
          retryCountRef.current++
          fetchOnlineUsers(true)
        }, delay)
      } else {
        console.error(`Maximum retry attempts (${MAX_RETRY_COUNT}) reached. Giving up.`)
        // Initialize with empty objects to prevent UI errors
        setOnlineUsers({})
        setLastActivity({})
      }
    } finally {
      fetchInProgressRef.current = false
    }
  }

  // Update user's online status with better error handling
  const updateUserOnlineStatus = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from("profiles").update({ is_online: true }).eq("id", user.id)

      if (error) {
        throw new Error(`Failed to update online status: ${error.message}`)
      }
    } catch (error: any) {
      console.error("Error updating online status:", error)
      // Don't throw the error, just log it to prevent breaking the app
    }
  }

  // Set up online status tracking
  useEffect(() => {
    // Skip on auth pages or if user is not authenticated
    if (isAuthPage() || !isAuthenticated || !user?.id) {
      setConnectionStatus("disabled")
      return
    }

    console.log("Setting up online status tracking for user:", user.id)
    setConnectionStatus("connecting")

    // Initial update
    updateUserOnlineStatus()

    // Initial fetch
    fetchOnlineUsers(true)

    // Set up heartbeat to keep user online
    const heartbeatInterval = setInterval(updateUserOnlineStatus, 60000) // Every minute

    // Set up periodic refresh
    const refreshInterval = setInterval(() => fetchOnlineUsers(), 30000) // Refresh every 30 seconds

    // Set up timeout check for inactive users
    const timeoutCheck = setInterval(() => {
      const now = Date.now()
      const timeoutThreshold = 2 * 60 * 1000 // 2 minutes in milliseconds

      setOnlineUsers((prev) => {
        const updated = { ...prev }
        Object.keys(lastActivity).forEach((userId) => {
          if (now - lastActivity[userId] > timeoutThreshold) {
            updated[userId] = false
          }
        })
        return updated
      })
    }, 30000) // Check every 30 seconds

    // Set user as offline when they leave
    const handleBeforeUnload = async () => {
      if (!user?.id) return

      try {
        await supabase.from("profiles").update({ is_online: false }).eq("id", user.id)
      } catch (error) {
        console.error("Error updating offline status:", error)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(refreshInterval)
      clearInterval(timeoutCheck)
      window.removeEventListener("beforeunload", handleBeforeUnload)

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      // Set user as offline when component unmounts
      if (user?.id) {
        supabase
          .from("profiles")
          .update({ is_online: false })
          .eq("id", user.id)
          .then()
          .catch((error) => console.error("Error updating offline status:", error))
      }
    }
  }, [user, isAuthenticated, pathname])

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers, isUserOnline, connectionStatus }}>
      {children}
    </OnlineStatusContext.Provider>
  )
}

// Hook to use the context
export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext)
  if (context === undefined) {
    throw new Error("useOnlineStatus must be used within an OnlineStatusProvider")
  }
  return context
}
