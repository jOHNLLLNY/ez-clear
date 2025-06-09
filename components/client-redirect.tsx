"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ClientRedirect({ destination }: { destination: string }) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if splash screen is showing
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash")

    // Only redirect if splash screen has been shown
    if (hasSeenSplash === "true") {
      router.push(destination)
    }
  }, [destination, router])

  // Return empty div during server-side rendering
  if (!isClient) {
    return <div className="fixed inset-0 bg-[#0d0d1a]"></div>
  }

  // Return empty div on client-side too - the redirect will happen via router.push
  return <div className="fixed inset-0 bg-[#0d0d1a]"></div>
}
