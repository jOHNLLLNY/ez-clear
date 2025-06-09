"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/context/user-context"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DebugApplications() {
  const { userId } = useUser()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableStatus, setTableStatus] = useState<string>("Checking...")
  const [sqlResult, setSqlResult] = useState<string>("")

  useEffect(() => {
    async function checkTable() {
      try {
        const response = await fetch("/api/setup-applications-table")
        const data = await response.json()
        setTableStatus(data.success ? "Table exists" : "Table creation failed")
      } catch (err) {
        setTableStatus("Error checking table")
        console.error("Error checking table:", err)
      }
    }

    async function fetchApplications() {
      try {
        setLoading(true)
        const response = await fetch(`/api/applications?user_id=${userId}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setApplications(data)
      } catch (err: any) {
        console.error("Error fetching applications:", err)
        setError(err.message || "Failed to load applications")
      } finally {
        setLoading(false)
      }
    }

    checkTable()
    if (userId) {
      fetchApplications()
    }
  }, [userId])

  const testApplication = async () => {
    try {
      // Get the first job
      const jobsResponse = await fetch("/api/jobs")
      const jobs = await jobsResponse.json()

      if (!jobs || jobs.length === 0) {
        alert("No jobs found to apply to")
        return
      }

      const job = jobs[0]

      // Submit test application
      const response = await fetch("/api/applications/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: job.id,
          applicant_id: userId,
          message: "This is a test application from the debug page.",
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert("Test application submitted successfully!")
        // Refresh applications
        window.location.reload()
      } else {
        alert(`Error: ${result.error || "Unknown error"}`)
      }
    } catch (err: any) {
      console.error("Error in test application:", err)
      alert(`Error: ${err.message || "Unknown error"}`)
    }
  }

  const createTableManually = async () => {
    try {
      setSqlResult("Executing SQL...")

      // Try to create the table using direct SQL
      const response = await fetch("/api/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: `
            CREATE TABLE IF NOT EXISTS public.job_applications (
              id SERIAL PRIMARY KEY,
              job_id INTEGER NOT NULL,
              applicant_id UUID NOT NULL,
              message TEXT,
              status TEXT NOT NULL DEFAULT 'pending',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              conversation_id INTEGER
            );
          `,
        }),
      })

      const result = await response.json()
      setSqlResult(result.success ? "Table created successfully" : `Error: ${result.error}`)

      // Refresh table status
      const statusResponse = await fetch("/api/setup-applications-table")
      const statusData = await statusResponse.json()
      setTableStatus(statusData.success ? "Table exists" : "Table creation failed")
    } catch (err: any) {
      setSqlResult(`Error: ${err.message}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <Link href="/debug-supabase" className="flex items-center text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Debug
        </Link>
        <h1 className="text-2xl font-bold">Debug Applications</h1>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applications Table Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Status: {tableStatus}</p>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={async () => {
                  setTableStatus("Checking...")
                  const response = await fetch("/api/setup-applications-table")
                  const data = await response.json()
                  setTableStatus(data.success ? "Table exists/created" : "Table creation failed")
                }}
              >
                Recreate Table
              </Button>
              <Button onClick={createTableManually} variant="outline">
                Create Table Manually
              </Button>
            </div>
            {sqlResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <pre>{sqlResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Application</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create a test application to the first available job</p>
            <Button onClick={testApplication}>Submit Test Application</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading applications...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : applications.length === 0 ? (
              <p>No applications found</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg">
                    <p>
                      <strong>ID:</strong> {app.id}
                    </p>
                    <p>
                      <strong>Job ID:</strong> {app.job_id}
                    </p>
                    <p>
                      <strong>Status:</strong> {app.status}
                    </p>
                    <p>
                      <strong>Created:</strong> {new Date(app.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Message:</strong> {app.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
