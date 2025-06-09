"use client"

import { useEffect, useState } from "react"
import { webPushUtils } from "@/utils/web-push-utils"

export function ServiceWorkerInit() {
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return

    // Register service worker when the app loads
    const registerSW = async () => {
      try {
        const registration = await webPushUtils.registerServiceWorker()
        if (registration) {
          console.log("Service worker registered successfully")
          setServiceWorkerStatus("success")
        } else {
          setServiceWorkerStatus("error")
        }
      } catch (error) {
        console.error("Service worker registration failed:", error)
        setServiceWorkerStatus("error")
      }
    }

    registerSW()
  }, [])

  // Don't render anything visible
  return null
}
