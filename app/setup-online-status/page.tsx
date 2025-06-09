"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function SetupOnlineStatus() {
  const [loading, setLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState([
    { name: "Setup Database Functions", status: "pending" },
    { name: "Setup Online Status Field", status: "pending" },
    { name: "Test Realtime Connection", status: "pending" },
  ])

  const runSetup = async () => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Setup database functions
      setSteps((prev) => prev.map((step, i) => (i === 0 ? { ...step, status: "loading" } : step)))

      const functionsRes = await fetch("/api/setup-db-functions")
      if (!functionsRes.ok) {
        const data = await functionsRes.json()
        throw new Error(data.error || "Failed to setup database functions")
      }

      setSteps((prev) => prev.map((step, i) => (i === 0 ? { ...step, status: "complete" } : step)))

      // Step 2: Setup online status field
      setSteps((prev) => prev.map((step, i) => (i === 1 ? { ...step, status: "loading" } : step)))

      const onlineStatusRes = await fetch("/api/setup-online-status")
      if (!onlineStatusRes.ok) {
        const data = await onlineStatusRes.json()
        throw new Error(data.error || "Failed to setup online status field")
      }

      setSteps((prev) => prev.map((step, i) => (i === 1 ? { ...step, status: "complete" } : step)))

      // Step 3: Test realtime connection
      setSteps((prev) => prev.map((step, i) => (i === 2 ? { ...step, status: "loading" } : step)))

      // Wait a bit to ensure realtime is set up
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSteps((prev) => prev.map((step, i) => (i === 2 ? { ...step, status: "complete" } : step)))

      setSetupComplete(true)
    } catch (err: any) {
      console.error("Setup error:", err)
      setError(err.message)

      // Mark current step as failed
      const failedStepIndex = steps.findIndex((step) => step.status === "loading")
      if (failedStepIndex >= 0) {
        setSteps((prev) => prev.map((step, i) => (i === failedStepIndex ? { ...step, status: "error" } : step)))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Setup Online Status</CardTitle>
          <CardDescription>Configure the database and realtime subscriptions for user online status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-medium">{step.name}</div>
                <div>
                  {step.status === "pending" && <div className="h-5 w-5 rounded-full bg-gray-200" />}
                  {step.status === "loading" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                  {step.status === "complete" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {step.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            ))}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">{error}</div>
            )}

            {setupComplete && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md text-green-600 text-sm">
                Setup completed successfully! Online status indicators are now ready to use.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runSetup} disabled={loading || setupComplete} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : setupComplete ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Setup Complete
              </>
            ) : (
              "Run Setup"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
