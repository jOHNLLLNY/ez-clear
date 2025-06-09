"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function EnvironmentCheck() {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Skip check if we're already on the env-config page
    if (pathname === "/env-config") {
      setChecked(true)
      return
    }

    // Check if Supabase environment variables are available
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      localStorage.getItem("NEXT_PUBLIC_SUPABASE_URL") ||
      (window as any).NEXT_PUBLIC_SUPABASE_URL

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      localStorage.getItem("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
      (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If either is missing, redirect to the env-config page
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Missing Supabase environment variables. Redirecting to configuration page.")
      router.push("/env-config")
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  // This component doesn't render anything visible
  return null
}
