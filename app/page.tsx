"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { SplashScreen } from "@/components/splash-screen"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Check if we've already shown the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash")

    if (hasSeenSplash === "true") {
      setShowSplash(false)

      // Only redirect if auth check is complete
      if (!loading) {
        if (isAuthenticated) {
          router.push("/home/worker")
        } else {
          router.push("/onboarding")
        }
      }
    }

    // Set a timeout to hide the splash screen
    const timer = setTimeout(() => {
      setShowSplash(false)
      sessionStorage.setItem("hasSeenSplash", "true")

      // Only redirect if auth check is complete
      if (!loading) {
        if (isAuthenticated) {
          router.push("/home/worker")
        } else {
          router.push("/onboarding")
        }
      }
    }, 3500) // Animation duration + fade out

    return () => clearTimeout(timer)
  }, [loading, isAuthenticated, router])

  // Always show splash screen first
  if (showSplash || loading) {
    return <SplashScreen />
  }

  // This will never be visible - it's just a fallback
  return <div className="fixed inset-0 bg-[#0d0d1a]"></div>
}
