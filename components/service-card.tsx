"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface ServiceCardProps {
  id: string
  name: string
  icon: React.ReactNode
  className?: string
}

export default function ServiceCard({ id, name, icon, className = "" }: ServiceCardProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)

  // Get userType from localStorage only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserType(localStorage.getItem("userType"))
    }
  }, [])

  // Map service names to their service_type values for API queries
  const serviceTypeMap = {
    Renovation: "renovation",
    "Snow Removal": "snow_removal",
    Outdoor: "outdoor",
    "Lawn Mowing": "lawn_mowing",
    "Gutter Cleaning": "gutter_cleaning",
    "Leaf Cleanup": "leaf_cleanup",
    Handyman: "handyman",
    Plumbing: "plumbing",
    Electrical: "electrical",
    Painting: "painting",
    Cleaning: "cleaning",
  }

  const handleClick = () => {
    setLoading(true)

    // Get the service_type value for API queries
    const serviceType = serviceTypeMap[name] || id.toLowerCase().replace(/\s+/g, "_")

    try {
      // For renovation, go to the renovation services page
      if (serviceType === "renovation") {
        router.push("/services/renovation")
        return
      }

      // Check user role and redirect accordingly
      if (profile?.user_type === "hirer") {
        // Hirers see contractors who offer this service
        router.push(`/search/contractors?service_type=${serviceType}`)
      } else if (profile?.user_type === "worker") {
        // Workers see available jobs for this service
        router.push(`/search?service_type=${serviceType}`)
      } else {
        // Fallback if user type is not determined from profile
        if (userType === "hirer") {
          router.push(`/search/contractors?service_type=${serviceType}`)
        } else {
          router.push(`/search?service_type=${serviceType}`)
        }
      }
    } catch (error) {
      console.error("Navigation error:", error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl bg-card hover:bg-card/80 transition-colors ${className}`}
      disabled={loading}
    >
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : icon}
      </div>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </button>
  )
}
