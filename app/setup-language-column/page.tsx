"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupLanguageColumn() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupLanguageColumn = async () => {
    try {
      setStatus("loading")
      const response = await fetch("/api/setup-language-column")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.error || "An error occurred")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to set up language column")
      console.error(error)
    }
  }

  useEffect(() => {
    setupLanguageColumn()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Language Column</CardTitle>
          <CardDescription>Adding language support to user profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && <p>Setting up language column...</p>}
          {status === "success" && <p className="text-green-500">{message}</p>}
          {status === "error" && <p className="text-red-500">{message}</p>}
        </CardContent>
        <CardFooter>
          <Button
            onClick={setupLanguageColumn}
            disabled={status === "loading"}
            variant={status === "success" ? "outline" : "default"}
          >
            {status === "loading" ? "Setting up..." : status === "success" ? "Setup Complete" : "Retry Setup"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
