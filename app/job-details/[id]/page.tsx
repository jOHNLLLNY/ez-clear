"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, MapPin, Clock, Snowflake, Leaf, Wrench, CheckCircle, Users, Edit, Trash, Eye } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/context/user-context"
import BottomNavigation from "@/components/bottom-navigation"
import { supabase } from "@/lib/supabase"

interface JobDetails {
  id: number
  title: string
  description: string
  location: string
  city?: string
  province?: string
  postal_code?: string
  service_type: string
  created_at: string
  status: "open" | "assigned" | "completed"
  user_id: string // Added user_id field
  user: {
    id: string
    name: string
    profile_image?: string
    business_name?: string
  }
}

interface Application {
  id: number
  job_id: number
  applicant_id: string
  message?: string
  status: "pending" | "accepted" | "declined" | "hired"
  created_at: string
}

// Map service types to icons
const serviceIcons = {
  snow_removal: <Snowflake className="h-5 w-5 text-primary" />,
  landscaping: <Leaf className="h-5 w-5 text-green-600" />,
  renovation: <Wrench className="h-5 w-5 text-blue-600" />,
  default: <Wrench className="h-5 w-5 text-gray-600" />,
}

export default function JobDetails() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shouldAutoApply = searchParams.get("apply") === "true"
  const { toast } = useToast()

  const { userId } = useUser()
  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [application, setApplication] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [applicantCount, setApplicantCount] = useState<number>(0)
  const [isJobOwner, setIsJobOwner] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [existingApplication, setExistingApplication] = useState<Application | null>(null)
  const [applications, setApplications] = useState<any[]>([])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/jobs/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }

      const data = await response.json()
      setJob(data)

      // Check if current user is the job owner
      const currentUserId = userId || localStorage.getItem("currentUserId")
      setIsJobOwner(currentUserId === data.user_id || currentUserId === data.user.id)

      // Check if user has already applied
      if (currentUserId && !isJobOwner) {
        try {
          const { data: applicationData, error: applicationError } = await supabase
            .from("job_applications")
            .select("*")
            .eq("job_id", params.id)
            .eq("applicant_id", currentUserId)
            .single()

          if (applicationData) {
            setExistingApplication(applicationData)
            console.log("User has already applied:", applicationData)
          }

          if (applicationError && applicationError.code !== "PGRST116") {
            // PGRST116 means no rows found, which is expected if user hasn't applied
            console.error("Error checking application status:", applicationError)
          }
        } catch (appErr) {
          console.error("Error checking if user already applied:", appErr)
        }
      }

      // Set application count from job data if available
      if (data.application_count) {
        setApplicantCount(data.application_count)
      } else {
        // Fetch applicant count as fallback
        try {
          const countResponse = await fetch(`/api/jobs/${params.id}/applications/count`)
          if (countResponse.ok) {
            const countData = await countResponse.json()
            setApplicantCount(countData.count || 0)
            console.log("Fetched applicant count:", countData.count)
          }
        } catch (countErr) {
          console.error("Error fetching applicant count:", countErr)
          // Don't throw error for this, just continue
        }
      }

      // If auto-apply is set, scroll to application form
      if (shouldAutoApply && data && !isJobOwner) {
        setTimeout(() => {
          document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })
        }, 500)
      }
    } catch (err: any) {
      console.error("Error fetching job details:", err)
      setError(err.message || "Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchJobDetails()
    }
  }, [params.id, shouldAutoApply, userId, isJobOwner])

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true)
        const response = await fetch(`/api/applications/job?job_id=${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch applications")
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

    if (params.id && isJobOwner) {
      fetchApplications()
    }
  }, [params.id, isJobOwner])

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()

    // Add logging for tracking
    console.log("Submitting application:", { application, userId, jobId: params.id })

    // Get user ID
    const currentUserId = userId || localStorage.getItem("currentUserId")

    if (!currentUserId || !job) {
      toast({
        title: "Error",
        description: "Could not determine user or job",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Check if user has already applied
      const { data: existingApp, error: checkError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_id", Number(params.id))
        .eq("applicant_id", currentUserId)
        .single()

      if (existingApp) {
        toast({
          title: "Already Applied",
          description: "You have already applied to this job",
          variant: "destructive",
        })
        setExistingApplication(existingApp)
        setSubmitting(false)
        return
      }

      // Use the API endpoint instead of direct Supabase insertion
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: Number(params.id),
          applicant_id: currentUserId,
          message: application.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }

      const newApplication = await response.json()
      console.log("Application submitted successfully:", newApplication)
      setExistingApplication(newApplication)

      // Create conversation with job poster
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1_id: currentUserId,
          user2_id: job.user.id,
        }),
      })

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.json()
        console.error("Conversation creation error:", errorData)
        // Don't throw error here, as the application was already submitted
      }

      const conversation = await conversationResponse.json()
      console.log("Conversation created:", conversation)

      // Send application message
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: conversation.id,
            sender_id: currentUserId,
            content: `Application for "${job.title}": ${application}`,
          }),
        })
      } catch (msgError) {
        console.error("Error sending message:", msgError)
        // Don't throw error here, as the application was already submitted
      }

      setApplicationSuccess(true)
      setApplicantCount((prev) => prev + 1)

      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the job poster",
        variant: "default",
      })

      // Refresh job details after submitting application
      fetchJobDetails()

      // Show success message and redirect after delay
      setTimeout(() => {
        router.push(`/messages/${conversation.id}`)
      }, 2000)
    } catch (err: any) {
      console.error("Error submitting application:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Get formatted time
  const getPostedTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) {
      return "Just now"
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    }
  }

  // Get icon for service type
  const getServiceIcon = (serviceType: string) => {
    return serviceIcons[serviceType as keyof typeof serviceIcons] || serviceIcons.default
  }

  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!confirm("Are you sure you want to delete this job?")) {
      return
    }

    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete job")
      }

      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      router.push("/my-jobs")
    } catch (err: any) {
      console.error("Error deleting job:", err)
      toast({
        title: "Error",
        description: "Error deleting job: " + err.message,
        variant: "destructive",
      })
    }
  }

  // Handle marking job as completed
  const handleMarkAsCompleted = async () => {
    if (!confirm("Are you sure you want to mark this job as completed?")) {
      return
    }

    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
      setJob((prev) => (prev ? { ...prev, status: "completed" } : null))
      toast({
        title: "Success",
        description: "Job marked as completed successfully",
      })
    } catch (err: any) {
      console.error("Error updating job status:", err)
      toast({
        title: "Error",
        description: "Error marking job as completed: " + err.message,
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Determine the back link based on where the user likely came from
  const getBackLink = () => {
    if (isJobOwner) {
      return "/my-jobs"
    } else {
      return "/search"
    }
  }

  // Get application status display
  const getApplicationStatusDisplay = () => {
    if (!existingApplication) return null

    switch (existingApplication.status) {
      case "pending":
        return (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4">
            <p className="text-yellow-800 font-medium">Your application is pending review</p>
            <p className="text-sm text-yellow-700 mt-1">
              You applied on {new Date(existingApplication.created_at).toLocaleDateString()}
            </p>
          </div>
        )
      case "accepted":
        return (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
            <p className="text-blue-800 font-medium">Your application has been accepted!</p>
            <p className="text-sm text-blue-700 mt-1">The job poster is interested in your application</p>
          </div>
        )
      case "declined":
        return (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <p className="text-gray-800 font-medium">Your application was not selected</p>
            <p className="text-sm text-gray-700 mt-1">You can search for other job opportunities</p>
          </div>
        )
      case "hired":
        return (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
            <p className="text-green-800 font-medium">You've been hired for this job!</p>
            <p className="text-sm text-green-700 mt-1">Congratulations! Check your messages for details</p>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return <p>Loading job details...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  if (!job) {
    return <p>Job not found</p>
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center border-b border-border bg-card shadow-soft z-10">
        <Link href={getBackLink()} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Job Details</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Job Header */}
        <h2 className="text-2xl font-bold mb-2">{job.title}</h2>

        <div className="flex items-center gap-3 mb-3">
          {job.status && (
            <Badge
              className={`${
                job.status === "open"
                  ? "bg-primary-50 text-primary-700"
                  : job.status === "assigned"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-blue-50 text-blue-700"
              } border-0 rounded-md font-medium shadow-sm`}
            >
              {job.status === "open" ? "Open" : job.status === "assigned" ? "Assigned" : "Completed"}
            </Badge>
          )}

          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Posted {getPostedTime(job.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-700 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span>
            {job.city || job.postal_code
              ? `${job.city || ""} ${job.province ? `, ${job.province}` : ""} ${job.postal_code ? ` ${job.postal_code}` : ""}`
              : job.location}
          </span>
        </div>

        {/* Job Poster - Only show if not the job owner */}
        {job && !isJobOwner && (
          <Card className="border border-border rounded-xl shadow-card dark:bg-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3">
                  {job.user.profile_image ? (
                    <AvatarImage src={job.user.profile_image || "/placeholder.svg"} alt={job.user.name} />
                  ) : (
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="User" />
                  )}
                  <AvatarFallback>{job.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{job.user.name}</h3>
                  {job.user.business_name && <p className="text-sm text-gray-500">{job.user.business_name}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Details */}
        <div>
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center mr-2 shadow-soft">
              {getServiceIcon(job.service_type)}
            </div>
            <span className="font-medium">
              {job.service_type === "snow_removal"
                ? "Snow Removal"
                : job.service_type === "landscaping"
                  ? "Landscaping"
                  : job.service_type === "renovation"
                    ? "Renovation"
                    : "General Service"}
            </span>
          </div>

          <Card className="border border-border rounded-xl shadow-card dark:bg-card">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-foreground whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Applicant Count */}
        {job && (
          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center text-foreground">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span>
                {applicantCount === 0
                  ? isJobOwner
                    ? "No applications yet"
                    : "Be the first to apply!"
                  : `${applicantCount} contractor${applicantCount === 1 ? "" : "s"} applied`}
              </span>
            </div>
          </div>
        )}

        {/* Job Owner Actions or Application Form */}
        {job && isJobOwner ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Manage Job</h3>

            {job.status !== "completed" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/post-job/edit/${job.id}`}>
                    <Button variant="outline" className="flex items-center justify-center">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Job
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDeleteJob}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-lg transition-all duration-200 shadow-button"
                  onClick={handleMarkAsCompleted}
                  disabled={updatingStatus}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {updatingStatus ? "Updating..." : "Mark as Completed"}
                </Button>
              </>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800">This job has been marked as completed</p>
              </div>
            )}

            {applicantCount > 0 && (
              <Button
                className="w-full mt-3 bg-primary hover:bg-primary/90"
                onClick={() => router.push(`/my-jobs/hirer?job=${job.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Applications ({applicantCount})
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Show application status if user has already applied */}
            {existingApplication && getApplicationStatusDisplay()}

            {applicationSuccess ? (
              <Card className="bg-green-50 border-green-100">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Application Submitted!</h3>
                  <p className="text-gray-700 mb-4">Your application has been sent to the job poster.</p>
                  <p className="text-sm text-gray-500">Redirecting to messages...</p>
                </CardContent>
              </Card>
            ) : existingApplication ? (
              <div className="mt-4">
                <Button className="w-full" onClick={() => router.push("/messages")}>
                  View Messages
                </Button>
              </div>
            ) : (
              <div id="application-form">
                <h3 className="font-semibold mb-3">Apply for this job</h3>
                <form onSubmit={handleSubmitApplication}>
                  <Textarea
                    placeholder="Describe why you're a good fit for this job..."
                    className="min-h-[150px] mb-4 border-border focus:border-primary focus:ring-primary/20 dark:bg-card dark:text-foreground"
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    required
                  />
                  {job?.status && job.status === "open" ? (
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-lg transition-all duration-200 shadow-button"
                      disabled={submitting}
                      onClick={(e) => {
                        console.log("Apply button clicked")
                        if (!submitting) handleSubmitApplication(e)
                      }}
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                      <p className="text-red-600 font-medium">This job is no longer accepting applications</p>
                    </div>
                  )}
                </form>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
