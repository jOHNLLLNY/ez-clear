"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Snowflake, Leaf, MapPin, Clock, SearchIcon, Filter, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"

interface Job {
  id: number
  title: string
  description: string
  location: string
  service_type: string
  created_at: string
  status: "open" | "assigned" | "completed"
}

interface Application {
  job_id: number
  status: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialServiceType = searchParams.get("service_type") || searchParams.get("service") || "all"
  const { user } = useAuth()
  const { t } = useLanguage()

  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userApplications, setUserApplications] = useState<Application[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [serviceType, setServiceType] = useState(initialServiceType)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch user applications
  useEffect(() => {
    async function fetchUserApplications() {
      if (!user?.id) return

      try {
        setLoadingApplications(true)
        const response = await fetch(`/api/applications?worker_id=${user.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch applications")
        }

        const data = await response.json()
        setUserApplications(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching applications:", err)
        setUserApplications([])
      } finally {
        setLoadingApplications(false)
      }
    }

    if (user?.id) {
      fetchUserApplications()
    }
  }, [user?.id])

  // Fetch jobs when service type changes or applications are loaded
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)

        // Build API URL with filters
        let url = "/api/jobs?status=open"
        if (serviceType && serviceType !== "all") {
          url += `&service_type=${serviceType}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const data = await response.json()

        // If user is logged in and we have applications data, filter out jobs they've already applied to
        if (user?.id && userApplications.length > 0) {
          const appliedJobIds = userApplications.map((app) => app.job_id)
          const filteredData = data.filter((job: Job) => !appliedJobIds.includes(job.id))
          setJobs(filteredData)
          setFilteredJobs(filteredData)
        } else {
          setJobs(data)
          setFilteredJobs(data)
        }
      } catch (err: any) {
        console.error("Error fetching jobs:", err)
        setError(err.message || "Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [serviceType, userApplications, user?.id])

  // Filter jobs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredJobs(jobs)
    } else {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredJobs(filtered)
    }
  }, [searchTerm, jobs])

  // Get icon for service type
  const getServiceIcon = (serviceType: string) => {
    if (serviceType === "snow_removal") {
      return <Snowflake className="h-5 w-5 text-primary" />
    } else if (serviceType === "landscaping" || serviceType === "lawn_mowing") {
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
          className="h-5 w-5 text-primary"
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
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  return (
    <div className="app-container bg-background text-foreground">
      {/* Header */}
      <header className="page-header border-b-0 bg-card">
        <h1 className="page-title">{t("findJobs")}</h1>
      </header>

      {/* Search and Filter */}
      <div className="px-4 py-4 border-b border-border bg-card/50">
        <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="input-search pl-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className={`h-4 w-4 ${showFilters ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="mb-2">
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="border-border bg-card">
                <SelectValue placeholder="Filter by service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="snow_removal">Snow Removal</SelectItem>
                <SelectItem value="landscaping">Landscaping</SelectItem>
                <SelectItem value="lawn_mowing">Lawn Mowing</SelectItem>
                <SelectItem value="gutter_cleaning">Gutter Cleaning</SelectItem>
                <SelectItem value="leaf_cleanup">Leaf Cleanup</SelectItem>
                <SelectItem value="junk_removal">Junk Removal</SelectItem>
                <SelectItem value="power_washing">Power Washing</SelectItem>
                <SelectItem value="handyman">Handyman</SelectItem>
                <SelectItem value="ice_control">Ice Control</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="page-content pt-4 bg-background">
        {loading || loadingApplications ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-900/10 rounded-lg border border-red-900/20">
            <p className="text-red-500 font-medium mb-2">Error loading jobs</p>
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4 px-4">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-foreground">{t("availableJobs")}</h2>
              <span className="text-sm text-muted-foreground bg-card/50 px-2 py-1 rounded-full">
                {filteredJobs.length} jobs found
              </span>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="border border-border overflow-hidden card-hover bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {getServiceIcon(job.service_type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium truncate text-foreground" title={job.title}>
                            {job.title.length > 40 ? `${job.title.substring(0, 40)}...` : job.title}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Posted {formatPostedTime(job.created_at)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-border hover:bg-card/80">
                            <Link href={`/job-details/${job.id}`}>Details</Link>
                          </Button>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={`/job-details/${job.id}?apply=true`}>Apply</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card/30 rounded-lg border border-border">
                <p className="text-foreground font-medium mb-2">No jobs found matching your criteria</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {user?.id && userApplications.length > 0
                    ? "You've already applied to all available jobs in this category."
                    : "Try adjusting your search filters"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setServiceType("all")
                    }}
                    className="border-border"
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
