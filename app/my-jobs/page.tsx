"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Briefcase, MapPin, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import BottomNavigation from "@/components/bottom-navigation"
import { Badge } from "@/components/ui/badge"

interface JobApplication {
  id: number
  job_id: number
  applicant_id: string
  status: "pending" | "accepted" | "declined" | "hired"
  created_at: string
  updated_at?: string
  job_title: string
  job_description: string
  job_location: string
  job_service_type: string
  job_poster?: {
    id: string
    name: string
    profile_image?: string
  }
}

export default function WorkerMyJobs() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    // Fetch worker's jobs
    async function fetchMyJobs() {
      try {
        if (!user?.id) return

        setLoading(true)
        const response = await fetch(`/api/applications?worker_id=${user.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const data = await response.json()
        // Ensure applications is always an array
        setApplications(Array.isArray(data) ? data : [])
        setLoading(false)
      } catch (err: any) {
        console.error("Error:", err)
        setError(err.message || "Failed to load jobs")
        setLoading(false)
        // Initialize applications as an empty array on error
        setApplications([])
      }
    }

    if (user?.id) {
      fetchMyJobs()
    }
  }, [user?.id])

  // Filter applications based on active tab with safety checks
  const pendingApplications = Array.isArray(applications) ? applications.filter((app) => app.status === "pending") : []
  const activeJobs = Array.isArray(applications)
    ? applications.filter((app) => app.status === "accepted" || app.status === "hired")
    : []
  const completedJobs = Array.isArray(applications) ? applications.filter((app) => app.status === "completed") : []
  const declinedApplications = Array.isArray(applications)
    ? applications.filter((app) => app.status === "declined")
    : []

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">Pending</Badge>
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800 border-0">Accepted</Badge>
      case "hired":
        return <Badge className="bg-green-100 text-green-800 border-0">Hired</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 border-0">Completed</Badge>
      case "declined":
        return <Badge className="bg-red-100 text-red-800 border-0">Declined</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-0">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center">
          <Link href="/home/worker" className="mr-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold">My Jobs</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted rounded-xl">
            <TabsTrigger
              value="active"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Active Jobs
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Applications
            </TabsTrigger>
            <TabsTrigger
              value="declined"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Declined
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Active Jobs</h2>
                <span className="text-sm text-muted-foreground">{activeJobs.length} jobs</span>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading jobs...</div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : activeJobs.length > 0 ? (
                <div className="space-y-3">
                  {activeJobs.map((application) => (
                    <Card key={application.id} className="border border-border rounded-2xl overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
                            <Briefcase className="h-6 w-6 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{application.job_title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{application.job_location}</span>
                            </div>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{application.job_description}</p>

                        <div className="flex items-center mb-3">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm text-muted-foreground">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl border-border hover:bg-muted">
                            <Link href={`/job-details/${application.job_id}`}>View Details</Link>
                          </Button>
                          <Button className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl">
                            <Link href={`/messages`}>Message Client</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any active jobs</p>
                  <Link href="/search">
                    <Button className="mt-4 bg-primary hover:bg-primary-600 text-white rounded-xl">Find Jobs</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Pending Applications</h2>
                <span className="text-sm text-muted-foreground">{pendingApplications.length} applications</span>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading applications...</div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : pendingApplications.length > 0 ? (
                <div className="space-y-3">
                  {pendingApplications.map((application) => (
                    <Card key={application.id} className="border border-border rounded-2xl overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="h-12 w-12 rounded-full bg-yellow-900/30 flex items-center justify-center mr-3">
                            <Briefcase className="h-6 w-6 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{application.job_title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{application.job_location}</span>
                            </div>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{application.job_description}</p>

                        <div className="flex items-center mb-3">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm text-muted-foreground">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl border-border hover:bg-muted">
                            <Link href={`/job-details/${application.job_id}`}>View Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any pending applications</p>
                  <Link href="/search">
                    <Button className="mt-4 bg-primary hover:bg-primary-600 text-white rounded-xl">Find Jobs</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="declined" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Declined Applications</h2>
                <span className="text-sm text-muted-foreground">{declinedApplications.length} applications</span>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading applications...</div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : declinedApplications.length > 0 ? (
                <div className="space-y-3">
                  {declinedApplications.map((application) => (
                    <Card key={application.id} className="border border-border rounded-2xl overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="h-12 w-12 rounded-full bg-red-900/30 flex items-center justify-center mr-3">
                            <Briefcase className="h-6 w-6 text-red-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{application.job_title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{application.job_location}</span>
                            </div>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{application.job_description}</p>

                        <div className="flex items-center mb-3">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm text-muted-foreground">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl border-border hover:bg-muted">
                            <Link href={`/job-details/${application.job_id}`}>View Details</Link>
                          </Button>
                          <Button className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl">
                            Find Similar Jobs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any declined applications</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
