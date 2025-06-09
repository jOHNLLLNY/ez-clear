import { supabase } from "@/lib/supabase"

// VAPID keys for Web Push
// In a real application, these should be generated and stored securely
// For this example, we're using placeholder values
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"

export const webPushUtils = {
  // Check if the browser supports push notifications
  isPushSupported: () => {
    return "serviceWorker" in navigator && "PushManager" in window
  },

  // Check if we're in a preview environment (like v0.dev)
  isPreviewEnvironment: () => {
    return (
      typeof window !== "undefined" &&
      (window.location.hostname.includes("vusercontent.net") ||
        window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("vercel.app"))
    )
  },

  // Register the service worker
  registerServiceWorker: async () => {
    if (!webPushUtils.isPushSupported()) {
      console.log("Push notifications not supported")
      return null
    }

    // Skip actual registration in preview environments
    if (webPushUtils.isPreviewEnvironment()) {
      console.log("Skipping service worker registration in preview environment")
      return { scope: "/" } // Return a mock registration object
    }

    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
        type: "module", // Add this to ensure proper script handling
      })
      console.log("Service Worker registered", registration)
      return registration
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      // Return a mock registration object so the app can continue
      return { scope: "/" }
    }
  },

  // Request permission and subscribe to push notifications
  subscribeToPushNotifications: async (userId: string) => {
    if (!webPushUtils.isPushSupported()) {
      return { success: false, message: "Push notifications not supported by your browser" }
    }

    // Skip subscription in preview environments
    if (webPushUtils.isPreviewEnvironment()) {
      console.log("Skipping push notification subscription in preview environment")
      return { success: true, message: "Preview mode - subscription simulated" }
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        return { success: false, message: "Notification permission denied" }
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Get existing subscription or create a new one
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        // Create new subscription
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          })
        } catch (subscribeError) {
          console.error("Error creating push subscription:", subscribeError)
          return { success: false, message: "Failed to create push subscription" }
        }
      }

      // Store subscription in database
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) {
        console.error("Error storing push subscription:", error)
        return { success: false, message: "Failed to store subscription" }
      }

      return { success: true, subscription }
    } catch (error) {
      console.error("Error subscribing to push notifications:", error)
      return { success: false, message: "Failed to subscribe to push notifications" }
    }
  },

  // Unsubscribe from push notifications
  unsubscribeFromPushNotifications: async (userId: string) => {
    if (!webPushUtils.isPushSupported()) {
      return { success: false, message: "Push notifications not supported by your browser" }
    }

    // Skip unsubscription in preview environments
    if (webPushUtils.isPreviewEnvironment()) {
      console.log("Skipping push notification unsubscription in preview environment")
      return { success: true, message: "Preview mode - unsubscription simulated" }
    }

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Get existing subscription
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe
        await subscription.unsubscribe()
      }

      // Remove subscription from database
      const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", userId)

      if (error) {
        console.error("Error removing push subscription:", error)
        return { success: false, message: "Failed to remove subscription from database" }
      }

      return { success: true }
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error)
      return { success: false, message: "Failed to unsubscribe from push notifications" }
    }
  },

  // Check if the user is subscribed to push notifications
  isSubscribed: async () => {
    if (!webPushUtils.isPushSupported()) {
      return false
    }

    // Return false in preview environments
    if (webPushUtils.isPreviewEnvironment()) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      return !!subscription
    } catch (error) {
      console.error("Error checking subscription status:", error)
      return false
    }
  },
}

// Helper function to convert base64 string to Uint8Array
// This is needed for the applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
