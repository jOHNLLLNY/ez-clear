"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ServiceCategoryCardProps {
  id: string
  name: string
  icon: React.ReactNode
  tab?: string
  className?: string
}

export default function ServiceCategoryCard({ id, name, icon, tab, className = "" }: ServiceCategoryCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    setLoading(true)
    router.push(`/services${tab ? `?tab=${tab}` : ""}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      disabled={loading}
    >
      <Card
        className={`border border-border rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-medium transition-all duration-200 ${className}`}
      >
        <CardContent className="p-3 flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2 shadow-soft">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : icon}
          </div>
          <span className="text-xs font-medium text-center">{name}</span>
        </CardContent>
      </Card>
    </button>
  )
}
