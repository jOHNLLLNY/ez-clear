"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Snowflake, Leaf, MapPin, CheckCircle, Clock, Users, Wrench, ArrowLeft, AlertCircle, Bell } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface Job {
  id: number
  title: string
  description: string
  location: string
  service_type: string
  created_at: string
  status: string
  applications?: Application[]
  application_count?: number
  scheduled_date?: string
  new_applications_count?: number
}

interface Application {
  id: number
  job_id: number
  applicant_id: string
  message: string
  status: "pending" | "accepted" | "declined" | "hired"
  created_at: string
  updated_at?: string
  viewed?: boolean
  applicant?: {
    id: string
    name: string
    profile_image?: string
    business_name?: string
    description?: string
    city?: string
    province?: string
  }
}

export default function HirerJobsPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusedJobId = searchParams.get("job")
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("active")
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isHiringDialogOpen, setIsHiringDialogOpen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [processingAction, setProcessingAction] = useState(false)
  const [viewedApplications, setViewedApplications] = useState<Record<number, boolean>>({})

  // Add a new state for the applicants modal
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false)
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<Job | null>(null)
  const [applicantsLoading, setApplicantsLoading] = useState(false)

  // Fix the handleViewApplicants function to properly fetch and display applicants
  const handleViewApplicants = async (job: Job) => {
    try {
      setApplicantsLoading(true)
      setSelectedJobForApplicants(job) // Set this first so we can show loading state
      setIsApplicantsModalOpen(true)

      console.log("Fetching applications for job:", job.id)

      // Method 1: Try direct Supabase query first (most reliable)
      try {
        const { data: jobApplications, error: supabaseError } = await supabase
          .from("job_applications")
          .select(`
            *,
            applicant:applicant_id(
              id, 
              name, 
              profile_image, 
              business_name, 
              city, 
              province
            )
          `)
          .eq("job_id", job.id)

        if (supabaseError) {
          console.error("Supabase error fetching applications:", supabaseError)
          throw supabaseError
        }

        if (jobApplications && jobApplications.length > 0) {
          console.log("Successfully fetched applications via Supabase:", jobApplications)

          // Update the job with fresh applications data
          const updatedJob = {
            ...job,
            applications: jobApplications,
            application_count: jobApplications.length,
          }

          // Update the selected job with applications data
          setSelectedJobForApplicants(updatedJob)

          // Also update the jobs state
          setJobs(
            jobs.map((j) => {
              if (j.id === job.id) {
                return updatedJob
              }
              return j
            }),
          )

          // Mark all applications as viewed when opening the modal
          if (jobApplications && jobApplications.length > 0) {
            jobApplications.forEach((app: Application) => {
              if (app.status === "pending" && !viewedApplications[app.id]) {
                markApplicationViewed(app.id)
              }
            })
          }

          setApplicantsLoading(false)
          return
        }
      } catch (supabaseErr) {
        console.error("Error with direct Supabase query:", supabaseErr)
        // Continue to fallback methods
      }

      // Method 2: Try API route with auth headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Add authorization header if session exists
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      // Try the specific job applications endpoint first
      const applicationsResponse = await fetch(`/api/applications/job?job_id=${job.id}`, {
        headers,
      })

      if (!applicationsResponse.ok) {
        console.error(
          "Error response from applications/job endpoint:",
          applicationsResponse.status,
          applicationsResponse.statusText,
        )

        // Fallback to the main applications endpoint with job_id parameter
        const fallbackResponse = await fetch(`/api/applications?job_id=${job.id}`, {
          headers,
        })

        if (!fallbackResponse.ok) {
          console.error("Error response from fallback endpoint:", fallbackResponse.status, fallbackResponse.statusText)
          throw new Error(`Failed to fetch applications: ${fallbackResponse.statusText}`)
        }

        const jobApplications = await fallbackResponse.json()
        console.log("Fetched applications from fallback endpoint:", jobApplications)

        // Update the job with fresh applications data
        const updatedJob = {
          ...job,
          applications: jobApplications,
          application_count: jobApplications.length,
        }

        // Update the selected job with applications data
        setSelectedJobForApplicants(updatedJob)

        // Also update the jobs state
        setJobs(
          jobs.map((j) => {
            if (j.id === job.id) {
              return updatedJob
            }
            return j
          }),
        )

        // Mark all applications as viewed when opening the modal
        if (jobApplications && jobApplications.length > 0) {
          jobApplications.forEach((app: Application) => {
            if (app.status === "pending" && !viewedApplications[app.id]) {
              markApplicationViewed(app.id)
            }
          })
        }
      } else {
        const jobApplications = await applicationsResponse.json()
        console.log("Fetched applications:", jobApplications)

        // Update the job with fresh applications data
        const updatedJob = {
          ...job,
          applications: jobApplications,
          application_count: jobApplications.length,
        }

        // Update the selected job with applications data
        setSelectedJobForApplicants(updatedJob)

        // Also update the jobs state
        setJobs(
          jobs.map((j) => {
            if (j.id === job.id) {
              return updatedJob
            }
            return j
          }),
        )

        // Mark all applications as viewed when opening the modal
        if (jobApplications && jobApplications.length > 0) {
          jobApplications.forEach((app: Application) => {
            if (app.status === "pending" && !viewedApplications[app.id]) {
              markApplicationViewed(app.id)
            }
          })
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: "Failed to load applicants. Please try again.",
        variant: "destructive",
      })

      // Even if there's an error, we can still show the modal with mock data for testing
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock data for development")
        const mockApplications = [
          {
            id: 1,
            job_id: job.id,
            applicant_id: "mock-user-1",
            message: "I'm interested in this job and have relevant experience.",
            status: "hired",
            created_at: new Date().toISOString(),
            applicant: {
              id: "mock-user-1",
              name: "John Doe",
              profile_image: null,
              business_name: "John's Services",
              city: "Toronto",
              province: "ON",
            },
          },
          {
            id: 2,
            job_id: job.id,
            applicant_id: "mock-user-2",
            message: "I would like to apply for this position.",
            status: "pending",
            created_at: new Date().toISOString(),
            applicant: {
              id: "mock-user-2",
              name: "Jane Smith",
              profile_image: null,
              city: "Vancouver",
              province: "BC",
            },
          },
        ]

        const updatedJob = {
          ...job,
          applications: mockApplications,
          application_count: mockApplications.length,
        }

        setSelectedJobForApplicants(updatedJob)
      }
    } finally {
      setApplicantsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    async function fetchJobs() {
      try {
        setLoading(true)
        setError(null)

        // First, ensure the applications table exists
        try {
          await fetch("/api/setup-applications-table")
        } catch (setupErr) {
          console.error("Error setting up applications table:", setupErr)
          // Continue anyway
        }

        // Fetch jobs posted by this user
        const jobsResponse = await fetch(`/api/jobs?user_id=${user.id}`)
        if (!jobsResponse.ok) {
          throw new Error("Failed to fetch jobs")
        }
        const jobsData = await jobsResponse.json()

        // Load viewed applications from localStorage
        const storedViewedApps = localStorage.getItem("viewedApplications")
        const viewedApps = storedViewedApps ? JSON.parse(storedViewedApps) : {}
        setViewedApplications(viewedApps)

        // Process each job to fetch its applications
        const jobsWithApplications = await Promise.all(
          jobsData.map(async (job: Job) => {
            try {
              // Fetch applications count for this job
              const countResponse = await fetch(`/api/jobs/${job.id}/applications/count`)
              let applicationCount = 0

              if (countResponse.ok) {
                const countData = await countResponse.json()
                applicationCount = countData.count || 0
                console.log(`Job ${job.id} has ${applicationCount} applications`)
              }

              // Fetch applications for this job
              const applicationsResponse = await fetch(`/api/applications/job?job_id=${job.id}`)

              if (applicationsResponse.ok) {
                const jobApplications = await applicationsResponse.json()

                // Count new
                const newAppsCount = jobApplications.filter(
                  (app: Application) => app.status === "pending" && !viewedApps[app.id],
                ).length

                return {
                  ...job,
                  applications: jobApplications,
                  application_count: applicationCount || jobApplications.length,
                  new_applications_count: newAppsCount,
                }
              }

              return {
                ...job,
                applications: [],
                application_count: applicationCount || job.application_count || 0,
                new_applications_count: 0,
              }
            } catch (err) {
              console.error(`Error fetching applications for job ${job.id}:`, err)
              return {
                ...job,
                applications: [],
                application_count: job.application_count || 0,
                new_applications_count: 0,
              }
            }
          }),
        )

        setJobs(jobsWithApplications)

        // If there's a focused job ID from the URL, expand it
        if (focusedJobId) {
          setExpandedJobId(Number(focusedJobId))
        }
      } catch (err: any) {
        console.error("Error fetching jobs:", err)
        setError(err.message || "Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user, focusedJobId, session])

  // Mark application as viewed
  const markApplicationViewed = (applicationId: number) => {
    const updatedViewedApps = { ...viewedApplications, [applicationId]: true }
    setViewedApplications(updatedViewedApps)
    localStorage.setItem("viewedApplications", JSON.stringify(updatedViewedApps))

    // Update the jobs state to reflect the viewed status
    setJobs(
      jobs.map((job) => {
        if (job.applications?.some((app) => app.id === applicationId)) {
          // Decrement the new applications count
          const newCount = Math.max(0, (job.new_applications_count || 0) - 1)
          return {
            ...job,
            new_applications_count: newCount,
            applications: job.applications.map((app) => (app.id === applicationId ? { ...app, viewed: true } : app)),
          }
        }
        return job
      }),
    )
  }

  const handleAcceptApplication = async (applicationId: number) => {
    try {
      setProcessingAction(true)
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ id: applicationId, status: "accepted" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to accept application")
      }

      // Mark as viewed
      markApplicationViewed(applicationId)

      // Update local state
      setApplications(
        applications.map((app) => {
          if (app.id === applicationId) {
            return { ...app, status: "accepted" }
          }
          return app
        }),
      )

      // Update jobs state
      setJobs(
        jobs.map((job) => {
          if (job.applications?.some((app) => app.id === applicationId)) {
            return {
              ...job,
              applications: job.applications.map((app) => {
                if (app.id === applicationId) {
                  return { ...app, status: "accepted" }
                }
                return app
              }),
            }
          }
          return job
        }),
      )

      // Update selectedJobForApplicants if it's the job containing this application
      if (selectedJobForApplicants?.applications?.some((app) => app.id === applicationId)) {
        setSelectedJobForApplicants({
          ...selectedJobForApplicants,
          applications: selectedJobForApplicants.applications.map((app) => {
            if (app.id === applicationId) {
              return { ...app, status: "accepted" }
            }
            return app
          }),
        })
      }

      // Create notification for the worker
      try {
        const application = jobs
          .find((job) => job.applications?.some((app) => app.id === applicationId))
          ?.applications?.find((app) => app.id === applicationId)

        if (application) {
          await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({
              user_id: application.applicant_id,
              type: "application",
              title: "Application Accepted! 🎉",
              description: "Your job application has been accepted. You can now message the client.",
              data: {
                application_id: applicationId,
                job_id: application.job_id,
              },
            }),
          })
        }
      } catch (notifError) {
        console.error("Error creating notification:", notifError)
        // Continue even if notification creation fails
      }

      toast({
        title: "Application accepted",
        description: "You can now message the applicant or hire them for the job",
      })
    } catch (err: any) {
      console.error("Error accepting application:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to accept application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDeclineApplication = async (applicationId: number) => {
    try {
      setProcessingAction(true)
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ id: applicationId, status: "declined" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to decline application")
      }

      // Mark as viewed
      markApplicationViewed(applicationId)

      // Update local state
      setApplications(
        applications.map((app) => {
          if (app.id === applicationId) {
            return { ...app, status: "declined" }
          }
          return app
        }),
      )

      // Update jobs state
      setJobs(
        jobs.map((job) => {
          if (job.applications?.some((app) => app.id === applicationId)) {
            return {
              ...job,
              applications: job.applications.map((app) => {
                if (app.id === applicationId) {
                  return { ...app, status: "declined" }
                }
                return app
              }),
            }
          }
          return job
        }),
      )

      // Update selectedJobForApplicants if it's the job containing this application
      if (selectedJobForApplicants?.applications?.some((app) => app.id === applicationId)) {
        setSelectedJobForApplicants({
          ...selectedJobForApplicants,
          applications: selectedJobForApplicants.applications.map((app) => {
            if (app.id === applicationId) {
              return { ...app, status: "declined" }
            }
            return app
          }),
        })
      }

      toast({
        title: "Application declined",
        description: "The applicant will be notified that they were not selected",
      })
    } catch (err: any) {
      console.error("Error declining application:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to decline application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleHireApplicant = async () => {
    if (!selectedApplication || !scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a scheduled date",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessingAction(true)

      // Update application status to hired
      const appResponse = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          id: selectedApplication.id,
          status: "hired",
        }),
      })

      if (!appResponse.ok) {
        const errorData = await appResponse.json()
        throw new Error(errorData.error || "Failed to hire applicant")
      }

      // Update job status to assigned and add scheduled date
      const jobResponse = await fetch(`/api/jobs/${selectedApplication.job_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          status: "assigned",
          scheduled_date: scheduledDate,
        }),
      })

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json()
        throw new Error(errorData.error || "Failed to update job status")
      }

      // Create notification for the worker
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            user_id: selectedApplication.applicant_id,
            type: "job",
            title: "You've been hired! 🎉",
            description: "Congratulations! You have been selected for the job.",
            data: {
              application_id: selectedApplication.id,
              job_id: selectedApplication.job_id,
            },
          }),
        })
      } catch (notifError) {
        console.error("Error creating notification:", notifError)
        // Continue even if notification creation fails
      }

      // Mark as viewed
      markApplicationViewed(selectedApplication.id)

      // Update local state
      setApplications(
        applications.map((app) => {
          if (app.id === selectedApplication.id) {
            return { ...app, status: "hired" }
          }
          return app
        }),
      )

      // Update jobs state
      setJobs(
        jobs.map((job) => {
          if (job.id === selectedApplication.job_id) {
            return {
              ...job,
              status: "assigned",
              scheduled_date: scheduledDate,
              applications: job.applications?.map((app) => {
                if (app.id === selectedApplication.id) {
                  return { ...app, status: "hired" }
                }
                return app
              }),
            }
          }
          return job
        }),
      )

      // Update selectedJobForApplicants if it's the job containing this application
      if (selectedJobForApplicants?.id === selectedApplication.job_id) {
        setSelectedJobForApplicants({
          ...selectedJobForApplicants,
          status: "assigned",
          scheduled_date: scheduledDate,
          applications: selectedJobForApplicants.applications.map((app) => {
            if (app.id === selectedApplication.id) {
              return { ...app, status: "hired" }
            }
            return app
          }),
        })
      }

      // Close the dialog and reset state
      setIsHiringDialogOpen(false)
      setSelectedApplication(null)
      setScheduledDate("")

      toast({
        title: "Success!",
        description: "Applicant hired successfully!",
      })
    } catch (err: any) {
      console.error("Error hiring applicant:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to hire applicant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  // New direct hire function without dialog
  const handleDirectHire = async (applicationId: number, jobId: number) => {
    try {
      setProcessingAction(true)

      // Get today's date as default scheduled date
      const today = new Date().toISOString().split("T")[0]

      // Update application status to hired
      const appResponse = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          id: applicationId,
          status: "hired",
        }),
      })

      if (!appResponse.ok) {
        const errorData = await appResponse.json()
        throw new Error(errorData.error || "Failed to hire applicant")
      }

      // Update job status to assigned
      const jobResponse = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          status: "assigned",
          scheduled_date: today,
        }),
      })

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json()
        throw new Error(errorData.error || "Failed to update job status")
      }

      // Get applicant ID
      const application = jobs.find((job) => job.id === jobId)?.applications?.find((app) => app.id === applicationId)

      if (application) {
        // Create notification for the worker
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({
              user_id: application.applicant_id,
              type: "job",
              title: "You've been hired! 🎉",
              description: "Congratulations! You have been selected for the job.",
              data: {
                application_id: applicationId,
                job_id: jobId,
              },
            }),
          })
        } catch (notifError) {
          console.error("Error creating notification:", notifError)
          // Continue even if notification creation fails
        }
      }

      // Mark as viewed
      markApplicationViewed(applicationId)

      // Update jobs state
      setJobs(
        jobs.map((job) => {
          if (job.id === jobId) {
            return {
              ...job,
              status: "assigned",
              scheduled_date: today,
              applications: job.applications?.map((app) => {
                if (app.id === applicationId) {
                  return { ...app, status: "hired" }
                }
                return app
              }),
            }
          }
          return job
        }),
      )

      // Update selectedJobForApplicants if it's the job containing this application
      if (selectedJobForApplicants?.id === jobId) {
        setSelectedJobForApplicants({
          ...selectedJobForApplicants,
          status: "assigned",
          scheduled_date: today,
          applications: selectedJobForApplicants.applications.map((app) => {
            if (app.id === applicationId) {
              return { ...app, status: "hired" }
            }
            return app
          }),
        })
      }

      toast({
        title: "Success!",
        description: "Applicant hired successfully!",
      })
    } catch (err: any) {
      console.error("Error hiring applicant:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to hire applicant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleMarkJobAsCompleted = async (jobId: number) => {
    if (!confirm("Are you sure you want to mark this job as completed?")) {
      return
    }

    try {
      setProcessingAction(true)
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update job status")
      }

      // Update local state
      setJobs(
        jobs.map((job) => {
          if (job.id === jobId) {
            return { ...job, status: "completed" }
          }
          return job
        }),
      )

      toast({
        title: "Success",
        description: "Job marked as completed successfully!",
      })
    } catch (err: any) {
      console.error("Error updating job status:", err)
      toast({
        title: "Error",
        description: "Error marking job as completed: " + err.message,
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  // Get icon for service type
  const getServiceIcon = (serviceType: string) => {
    if (serviceType === "snow_removal") {
      return <Snowflake className="h-5 w-5 text-green-600" />
    } else if (serviceType === "landscaping") {
      return <Leaf className="h-5 w-5 text-green-600" />
    } else if (serviceType === "renovation") {
      return <Wrench className="h-5 w-5 text-green-600" />
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

  // Filter jobs based on active tab
  const activeJobs = jobs.filter((job) => job.status === "open" || job.status === "assigned")
  const completedJobs = jobs.filter((job) => job.status === "completed")
  const displayJobs = activeTab === "active" ? activeJobs : completedJobs

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d0d1a] text-white">
        <header className="p-4 flex items-center border-b border-gray-800">
          <Link href="/home/hirer" className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">My Jobs</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p>Loading jobs...</p>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0d0d1a] text-white">
        <header className="p-4 flex items-center border-b border-gray-800">
          <Link href="/home/hirer" className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">My Jobs</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d1a] text-white">
      {/* Header */}
      <header className="p-4 flex items-center border-b border-gray-800 bg-[#0d0d1a] z-10">
        <Link href="/home/hirer" className="mr-3 rounded-full hover:bg-gray-800 p-1 transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">My Jobs</h1>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-800">
          <TabsTrigger value="active" className="data-[state=active]:bg-gray-700">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gray-700">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 px-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Active Jobs</h2>
              <span className="text-sm text-gray-400">{activeJobs.length} jobs</span>
            </div>

            {activeJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {activeJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900 shadow-card"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-green-900 flex items-center justify-center mr-3 shadow-soft">
                          {getServiceIcon(job.service_type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{job.title}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-2">{job.description}</p>

                      <div className="flex items-center mb-3">
                        <Badge
                          className={`${
                            job.status === "open" ? "bg-green-900 text-green-100" : "bg-yellow-900 text-yellow-100"
                          } border-0 rounded-md font-medium shadow-sm`}
                        >
                          {job.status === "open" ? "Open" : "Assigned"}
                        </Badge>
                        <span className="mx-2 text-gray-600">|</span>
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-400">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {job.scheduled_date && (
                        <div className="mb-3 p-2 bg-blue-900 rounded-md text-sm">
                          <div className="flex items-center text-blue-100">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Scheduled for: {new Date(job.scheduled_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="flex items-center cursor-pointer hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewApplicants(job)
                          }}
                        >
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-400 hover:text-primary hover:underline">
                            {job.application_count || 0} applicant{job.application_count !== 1 ? "s" : ""}
                          </span>
                          {job.new_applications_count > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900 text-red-100">
                              <Bell className="h-3 w-3 mr-1" />
                              {job.new_applications_count} new
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewApplicants(job)
                          }}
                          className="border-gray-700 text-white hover:bg-gray-800"
                        >
                          View Applicants
                        </Button>
                      </div>

                      {expandedJobId === job.id && job.applications && job.applications.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-gray-800 pt-3">
                          <h4 className="font-medium text-sm">Applicants</h4>
                          {job.applications.map((application) => (
                            <div
                              key={application.id}
                              className={`border rounded-lg p-3 ${
                                application.status === "pending" && !viewedApplications[application.id]
                                  ? "border-yellow-700 bg-yellow-900/20"
                                  : "border-gray-800"
                              }`}
                            >
                              <div className="flex items-center mb-2">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarImage
                                    src={application.applicant?.profile_image || "/placeholder.svg?height=40&width=40"}
                                    alt={application.applicant?.name || "Applicant"}
                                  />
                                  <AvatarFallback>
                                    {application.applicant?.name?.substring(0, 2) || "AP"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h5 className="font-medium">{application.applicant?.name || "Applicant"}</h5>
                                  {application.applicant?.business_name && (
                                    <p className="text-xs text-gray-400">{application.applicant.business_name}</p>
                                  )}
                                </div>
                                {application.status === "pending" && !viewedApplications[application.id] && (
                                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900 text-yellow-100">
                                    New
                                  </span>
                                )}
                              </div>

                              {application.applicant?.city && application.applicant?.province && (
                                <div className="flex items-center text-xs text-gray-400 mb-2">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>
                                    {application.applicant.city}, {application.applicant.province}
                                  </span>
                                </div>
                              )}

                              <p className="text-sm mb-3">{application.message || "No message provided"}</p>

                              <div className="flex items-center justify-between">
                                <Badge
                                  className={`
                                  ${
                                    application.status === "pending"
                                      ? "bg-yellow-900 text-yellow-100"
                                      : application.status === "accepted"
                                        ? "bg-blue-900 text-blue-100"
                                        : application.status === "hired"
                                          ? "bg-green-900 text-green-100"
                                          : "bg-red-900 text-red-100"
                                  } 
                                  border-0 rounded-md font-medium shadow-sm
                                `}
                                >
                                  {application.status === "hired"
                                    ? "Hired"
                                    : application.status?.charAt(0).toUpperCase() + application.status?.slice(1) ||
                                      "Pending"}
                                </Badge>

                                {application.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-400 border-red-900 hover:bg-red-900/30"
                                      onClick={() => handleDeclineApplication(application.id)}
                                      disabled={processingAction}
                                    >
                                      Decline
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90"
                                      onClick={() => handleAcceptApplication(application.id)}
                                      disabled={processingAction}
                                    >
                                      Accept
                                    </Button>
                                  </div>
                                )}

                                {application.status === "accepted" && (
                                  <div className="flex gap-2">
                                    <Link href={`/messages`}>
                                      <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                                        Message
                                      </Button>
                                    </Link>
                                    <Button
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90"
                                      onClick={() => handleDirectHire(application.id, job.id)}
                                      disabled={processingAction || job.status === "assigned"}
                                    >
                                      Hire
                                    </Button>
                                  </div>
                                )}

                                {application.status === "hired" && (
                                  <Link href={`/messages`}>
                                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                                      Message
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {expandedJobId === job.id && (!job.applications || job.applications.length === 0) && (
                        <div className="mt-4 border-t border-gray-800 pt-3 text-center py-4 text-gray-400">
                          <p>No applications yet</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Link href={`/job-details/${job.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                            View Details
                          </Button>
                        </Link>
                        {job.status === "assigned" ? (
                          <Button
                            className="flex-1 bg-blue-700 hover:bg-blue-800"
                            onClick={() => handleMarkJobAsCompleted(job.id)}
                            disabled={processingAction}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Completed
                          </Button>
                        ) : (
                          <Link href={`/post-job/edit/${job.id}`} className="flex-1">
                            <Button className="w-full bg-primary hover:bg-primary/90">Edit Job</Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>You haven't posted any jobs yet</p>
                <Link href="/post-job">
                  <Button className="mt-4 bg-primary hover:bg-primary/90">Post a Job</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4 px-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Completed Jobs</h2>
              <span className="text-sm text-gray-400">{completedJobs.length} jobs</span>
            </div>

            {completedJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {completedJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900 shadow-card"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-green-900 flex items-center justify-center mr-3 shadow-soft">
                          {getServiceIcon(job.service_type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{job.title}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-2">{job.description}</p>

                      <div className="flex items-center mb-3">
                        <Badge className="bg-gray-700 text-gray-100 border-0 rounded-md font-medium shadow-sm">
                          Completed
                        </Badge>
                        <span className="mx-2 text-gray-600">|</span>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-400">
                          Completed on {new Date(job.updated_at || job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/job-details/${job.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/reviews/add/${job.id}`} className="flex-1">
                          <Button className="w-full bg-primary hover:bg-primary/90">Leave Review</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>You don't have any completed jobs</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Hiring Dialog */}
      <Dialog open={isHiringDialogOpen} onOpenChange={setIsHiringDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle>Hire Applicant</DialogTitle>
            <DialogDescription className="text-gray-400">
              Set a scheduled date for the job and confirm hiring {selectedApplication?.applicant?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="scheduled-date" className="text-right col-span-1">
                Date
              </label>
              <input
                id="scheduled-date"
                className="col-span-3 bg-gray-800 border border-gray-700 text-white"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            onClick={handleHireApplicant}
            disabled={processingAction}
            className="bg-primary hover:bg-primary/90"
          >
            {processingAction ? "Hiring..." : "Hire"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Applicants Modal */}
      <Dialog open={isApplicantsModalOpen} onOpenChange={setIsApplicantsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle>{selectedJobForApplicants?.title} - Applicants</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedJobForApplicants?.application_count || 0} applicant
              {selectedJobForApplicants?.application_count !== 1 ? "s" : ""} for this job
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {applicantsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="h-8 w-8 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedJobForApplicants?.applications && selectedJobForApplicants.applications.length > 0 ? (
              <div className="space-y-3">
                {/* Show hired applicants first */}
                {selectedJobForApplicants.applications
                  .sort((a, b) => {
                    // Sort by status (hired first, then accepted, then pending, then declined)
                    const statusOrder = { hired: 0, accepted: 1, pending: 2, declined: 3 }
                    return statusOrder[a.status] - statusOrder[b.status]
                  })
                  .map((application) => (
                    <div
                      key={application.id}
                      className={`border rounded-lg p-3 ${
                        application.status === "hired"
                          ? "border-green-700 bg-green-900/20"
                          : application.status === "pending" && !viewedApplications[application.id]
                            ? "border-yellow-700 bg-yellow-900/20"
                            : "border-gray-800"
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage
                            src={application.applicant?.profile_image || "/placeholder.svg?height=40&width=40"}
                            alt={application.applicant?.name || "Applicant"}
                          />
                          <AvatarFallback>{application.applicant?.name?.substring(0, 2) || "AP"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h5 className="font-medium">{application.applicant?.name || "Applicant"}</h5>
                          {application.applicant?.business_name && (
                            <p className="text-xs text-gray-400">{application.applicant.business_name}</p>
                          )}
                        </div>
                        <Badge
                          className={`
                      ${
                        application.status === "pending"
                          ? "bg-yellow-900 text-yellow-100"
                          : application.status === "accepted"
                            ? "bg-blue-900 text-blue-100"
                            : application.status === "hired"
                              ? "bg-green-900 text-green-100"
                              : "bg-red-900 text-red-100"
                      } 
                      border-0 rounded-md font-medium shadow-sm
                    `}
                        >
                          {application.status === "hired" ? (
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Hired
                            </span>
                          ) : (
                            application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || "Pending"
                          )}
                        </Badge>
                      </div>

                      {application.applicant?.city && application.applicant?.province && (
                        <div className="flex items-center text-xs text-gray-400 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {application.applicant.city}, {application.applicant.province}
                          </span>
                        </div>
                      )}

                      <p className="text-sm mb-3">{application.message || "No message provided"}</p>

                      <div className="flex justify-end gap-2">
                        {application.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-400 border-red-900 hover:bg-red-900/30"
                              onClick={() => handleDeclineApplication(application.id)}
                              disabled={processingAction}
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleAcceptApplication(application.id)}
                              disabled={processingAction}
                            >
                              Accept
                            </Button>
                          </>
                        )}

                        {application.status === "accepted" && (
                          <>
                            <Link href={`/messages`}>
                              <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                                Message
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleDirectHire(application.id, selectedJobForApplicants.id)}
                              disabled={processingAction || selectedJobForApplicants.status === "assigned"}
                            >
                              Hire
                            </Button>
                          </>
                        )}

                        {application.status === "hired" && (
                          <Link href={`/messages`}>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                              Message
                            </Button>
                          </Link>
                        )}

                        {application.status === "declined" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcceptApplication(application.id)}
                            disabled={processingAction}
                            className="border-gray-700 hover:bg-gray-800"
                          >
                            Reconsider
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No applicants yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  )
}
