"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function DebugPage() {
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [envVars, setEnvVars] = useState({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set (hidden)" : "Not set",
  })
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    checkDbConnection()
  }, [])

  const checkDbConnection = async () => {
    try {
      setDbStatus("loading")

      const response = await fetch("/api/check-db")
      const data = await response.json()

      if (data.success) {
        setDbStatus("connected")
        setTestResult(data)
      } else {
        setDbStatus("error")
        setErrorMessage(data.error || "Unknown error")
        setTestResult(data)
      }
    } catch (error: any) {
      setDbStatus("error")
      setErrorMessage(error.message || "Unknown error")
      setTestResult({ error: error.message })
    }
  }

  const testCreateProfile = async () => {
    try {
      // Generate a test user ID
      const testId = crypto.randomUUID()

      // Try to create a profile
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: testId,
          email: `test-${testId.substring(0, 8)}@example.com`,
          name: "Test User",
          user_type: "worker",
          created_at: new Date().toISOString(),
          is_online: true,
        })
        .select()

      if (error) {
        throw error
      }

      setTestResult({ success: true, message: "Profile created successfully", data })
    } catch (error: any) {
      setTestResult({ success: false, error: error.message })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug Page</h1>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(envVars, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Database Connection</h2>
          <div className="flex items-center mb-4">
            <div
              className={`h-4 w-4 rounded-full mr-2 ${
                dbStatus === "connected" ? "bg-green-500" : dbStatus === "error" ? "bg-red-500" : "bg-yellow-500"
              }`}
            ></div>
            <span>{dbStatus === "connected" ? "Connected" : dbStatus === "error" ? "Error" : "Checking..."}</span>
          </div>

          {dbStatus === "error" && <div className="text-red-500 mb-4">Error: {errorMessage}</div>}

          <Button onClick={checkDbConnection} className="mr-2">
            Check Connection
          </Button>

          <Button onClick={testCreateProfile} variant="outline">
            Test Create Profile
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Debug Links</h2>
          <Link
            href="/debug/language-preview"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium mb-1">Language Preview Tool</h3>
            <p className="text-gray-500 text-sm">
              Preview UI elements in different languages to identify layout issues
            </p>
          </Link>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mt-6 mb-3">Translation Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/debug/language-preview">
          <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
            <h3 className="font-medium mb-2">Language Preview</h3>
            <p className="text-sm text-muted-foreground">Preview UI elements in different languages</p>
          </div>
        </Link>
        <Link href="/debug/translation-coverage">
          <div className="border rounded-lg p-4 hover:bg-muted transition-colors">
            <h3 className="font-medium mb-2">Translation Coverage</h3>
            <p className="text-sm text-muted-foreground">Check and export missing translations</p>
          </div>
        </Link>
      </div>

      {testResult && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Test Result</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96">{JSON.stringify(testResult, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
