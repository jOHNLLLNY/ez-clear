"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugTriggerPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupTrigger = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setup-job-applications-trigger")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up trigger")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const testTrigger = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, get a job application to update
      const getAppResponse = await fetch("/api/applications?limit=1")
      const appData = await getAppResponse.json()

      if (!getAppResponse.ok || !appData.applications || appData.applications.length === 0) {
        throw new Error("No job applications found to test with")
      }

      const appId = appData.applications[0].id

      // Update the application with a test note
      const updateResponse = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: `Test note added at ${new Date().toISOString()}`,
        }),
      })

      const updateData = await updateResponse.json()

      if (!updateResponse.ok) {
        throw new Error(updateData.error || "Failed to update job application")
      }

      // Get the updated application to check the updated_at timestamp
      const verifyResponse = await fetch(`/api/applications/${appId}`)
      const verifyData = await verifyResponse.json()

      setResult({
        success: true,
        message: "Trigger test completed",
        originalUpdatedAt: appData.applications[0].updated_at,
        newUpdatedAt: verifyData.application.updated_at,
        application: verifyData.application,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Job Applications Trigger</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Setup Trigger</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={setupTrigger} disabled={loading}>
              {loading ? "Setting up..." : "Setup updated_at Trigger"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Trigger</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testTrigger} disabled={loading}>
              {loading ? "Testing..." : "Test Trigger"}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This will update a job application and check if the updated_at field changes
            </p>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
