"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Snowflake, Leaf, MapPin, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import CompactMap from "@/components/compact-map"
import { useAuth } from "@/context/auth-context"

interface Job {
  id: number
  title: string
  description: string
  location: string
  service_type: string
  created_at: string
  status: string
}

interface Application {
  job_id: number
  status: string
}

interface AvailableJobsProps {
  limit?: number
  showViewAll?: boolean
}

export default function AvailableJobs({ limit = 3, showViewAll = true }: AvailableJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingApplications, setLoadingApplications] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchUserApplications() {
      if (!user?.id) return []

      try {
        setLoadingApplications(true)
        const response = await fetch(`/api/applications?worker_id=${user.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch applications")
        }

        const data = await response.json()
        return Array.isArray(data) ? data : []
      } catch (err) {
        console.error("Error fetching applications:", err)
        return []
      } finally {
        setLoadingApplications(false)
      }
    }

    async function fetchJobs() {
      try {
        setLoading(true)

        // First get user applications if user is logged in
        let applications: Application[] = []
        if (user?.id) {
          applications = await fetchUserApplications()
        }

        // Then fetch jobs
        const response = await fetch("/api/jobs?status=open")

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const data = await response.json()

        // If user is logged in, filter out jobs they've already applied to
        if (user?.id && applications.length > 0) {
          const appliedJobIds = applications.map((app: any) => app.job_id)
          const filteredData = data.filter((job: Job) => !appliedJobIds.includes(job.id))
          setJobs(filteredData)
        } else {
          setJobs(data)
        }
      } catch (err: any) {
        console.error("Error fetching jobs:", err)
        setError(err.message || "Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user?.id])

  // Get icon for service type
  const getServiceIcon = (serviceType: string) => {
    if (serviceType === "snow_removal") {
      return <Snowflake className="h-5 w-5 text-green-600" />
    } else if (serviceType === "lawn_mowing" || serviceType === "landscaping") {
      return <Leaf className="h-5 w-5 text-green-600" />
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-green-600"
        >
          <path d="M19 9V6.5a.5.5 0 0 0-.5-.5h-14a.5.5 0 0 0-.5.5V9"></path>
          <path d="M19 9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z"></path>
          <path d="M3 14h18"></path>
        </svg>
      )
    }
  }

  // Format posted time
  const formatPostedTime = (timestamp: string) => {
    const posted = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - posted.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHrs < 1) return "Just now"
    if (diffHrs < 24) return `${diffHrs} hours ago`
    const diffDays = Math.floor(diffHrs / 24)
    return `${diffDays} days ago`
  }

  if (loading || loadingApplications) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-gray-600">Loading available jobs...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Available Jobs</h2>
        {showViewAll && (
          <Link href="/search" className="text-green-600 text-sm font-medium">
            View All
          </Link>
        )}
      </div>

      <div className="mt-4 mb-4 rounded-lg overflow-hidden shadow">
        <CompactMap />
      </div>

      <div className="space-y-3">
        {jobs.length > 0 ? (
          jobs.slice(0, limit).map((job) => (
            <Card key={job.id} className="border rounded-lg overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                    {getServiceIcon(job.service_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium truncate" title={job.title}>
                      {job.title.length > 35 ? `${job.title.substring(0, 35)}...` : job.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{job.description}</p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Posted {formatPostedTime(job.created_at)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Link href={`/job-details/${job.id}`}>Details</Link>
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Link href={`/job-details/${job.id}?apply=true`}>Apply</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No jobs available at the moment</p>
            {user?.id && (
              <div className="mt-2">
                <Link href="/my-jobs">
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">View My Applications</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
