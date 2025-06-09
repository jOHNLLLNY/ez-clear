"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function FixApplicationsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const runFixes = async () => {
    setLoading(true)
    setResults([])
    setError(null)

    try {
      // Step 1: Check RLS policies
      setResults((prev) => [...prev, { step: "Checking RLS policies", status: "running" }])
      const rlsResponse = await fetch("/api/check-job-applications-rls")
      const rlsData = await rlsResponse.json()

      setResults((prev) =>
        prev.map((item) =>
          item.step === "Checking RLS policies" ? { ...item, status: "complete", data: rlsData } : item,
        ),
      )

      // Step 2: Set up RLS policies
      setResults((prev) => [...prev, { step: "Setting up RLS policies", status: "running" }])
      const setupResponse = await fetch("/api/setup-job-applications-rls", {
        method: "POST",
      })
      const setupData = await setupResponse.json()

      setResults((prev) =>
        prev.map((item) =>
          item.step === "Setting up RLS policies" ? { ...item, status: "complete", data: setupData } : item,
        ),
      )

      // Step 3: Check application counts
      setResults((prev) => [...prev, { step: "Checking application counts", status: "running" }])

      // Get all jobs
      const jobsResponse = await fetch("/api/jobs")
      const jobs = await jobsResponse.json()

      const jobCounts = await Promise.all(
        jobs.map(async (job: any) => {
          const countResponse = await fetch(`/api/jobs/${job.id}/applications/count`)
          const countData = await countResponse.json()
          return {
            job_id: job.id,
            title: job.title,
            count: countData.count,
          }
        }),
      )

      setResults((prev) =>
        prev.map((item) =>
          item.step === "Checking application counts"
            ? { ...item, status: "complete", data: { jobs: jobCounts } }
            : item,
        ),
      )

      // Step 4: Verify job_applications table
      setResults((prev) => [...prev, { step: "Verifying job_applications table", status: "running" }])

      const tableResponse = await fetch("/api/setup-applications-table", {
        method: "POST",
      })
      const tableData = await tableResponse.json()

      setResults((prev) =>
        prev.map((item) =>
          item.step === "Verifying job_applications table" ? { ...item, status: "complete", data: tableData } : item,
        ),
      )
    } catch (err: any) {
      console.error("Error running fixes:", err)
      setError(err.message || "An error occurred while running fixes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runFixes()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center mb-6">
        <Link href="/debug-applications" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Fix Application Issues</h1>
      </header>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Diagnostic Results</span>
              <Button variant="outline" size="sm" onClick={runFixes} disabled={loading} className="flex items-center">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Running..." : "Run Again"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 p-4 rounded-md mb-4 text-red-800 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex items-center mb-2">
                    {result.status === "running" ? (
                      <RefreshCw className="h-5 w-5 mr-2 text-blue-500 animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    )}
                    <h3 className="font-medium">{result.step}</h3>
                  </div>

                  {result.status === "complete" && result.data && (
                    <div className="mt-2 pl-7">
                      <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}

              {results.length === 0 && loading && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
                  <p>Running diagnostics and fixes...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {results.some((r) => r.status === "complete") && (
          <div className="flex justify-end mt-6">
            <Link href="/my-jobs/hirer">
              <Button>Go to My Jobs</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
