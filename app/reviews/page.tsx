"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { StarIcon, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import BottomNavigation from "@/components/bottom-navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

interface Review {
  id: number | string
  name: string
  avatar: string | null
  rating: number
  date: string
  comment: string
  service: string
  user_id?: string
}

export default function ReviewsPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    service: "",
  })
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [userServices, setUserServices] = useState<{ id: string; name: string }[]>([])

  const params = useParams()
  const router = useRouter()
  const contractorId = (params.id as string) || null

  useEffect(() => {
    // Get user type and ID from localStorage
    const storedUserType = localStorage.getItem("userType")
    const storedUserId = localStorage.getItem("userId")
    setUserType(storedUserType)
    setUserId(storedUserId)

    // If we have a contractor ID from the URL, use that as the target
    // Otherwise, we're viewing our own reviews
    if (contractorId) {
      setTargetUserId(contractorId)
      fetchReviews(contractorId)
    } else if (storedUserId) {
      setTargetUserId(storedUserId)
      fetchReviews(storedUserId)
    }

    // If user is a hirer, fetch their completed services for the dropdown
    if (storedUserType === "hirer" && storedUserId && contractorId) {
      fetchUserServices(storedUserId, contractorId)
    }
  }, [contractorId])

  const fetchReviews = async (userId: string) => {
    setIsLoading(true)
    try {
      // Fetch reviews for this user
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          service,
          reviewer_id,
          reviewer:profiles!reviewer_id(name, profile_image)
        `)
        .eq("contractor_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Format the reviews for display
      const formattedReviews: Review[] = data.map((review) => ({
        id: review.id,
        name: review.reviewer?.name || "Anonymous",
        avatar: review.reviewer?.profile_image || "/placeholder.svg?height=40&width=40",
        rating: review.rating,
        date: formatReviewDate(review.created_at),
        comment: review.comment,
        service: review.service || "General Service",
        user_id: review.reviewer_id,
      }))

      setReviews(formattedReviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      // If error, use some sample data so UI isn't empty
      setReviews([
        {
          id: 1,
          name: "John Smith",
          avatar: "/placeholder.svg?height=40&width=40",
          rating: 5,
          date: "15 Jan 2023",
          comment:
            "Great service! Arrived on time and did an excellent job clearing my driveway. Will definitely hire again.",
          service: "Snow Removal",
        },
        {
          id: 2,
          name: "Sarah Williams",
          avatar: "/placeholder.svg?height=40&width=40",
          rating: 4,
          date: "3 Dec 2022",
          comment:
            "Good work on my lawn. Could have been a bit more thorough in some areas, but overall I'm satisfied.",
          service: "Lawn Mowing",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserServices = async (hirerId: string, workerId: string) => {
    try {
      // Fetch completed jobs between this hirer and worker
      const { data, error } = await supabase
        .from("jobs")
        .select("id, service_type")
        .eq("user_id", hirerId)
        .eq("worker_id", workerId)
        .eq("status", "completed")

      if (error) throw error

      if (data && data.length > 0) {
        setUserServices(
          data.map((job) => ({
            id: job.id.toString(),
            name: job.service_type,
          })),
        )

        // Set the first service as default
        setNewReview((prev) => ({
          ...prev,
          service: data[0].service_type,
        }))
      }
    } catch (error) {
      console.error("Error fetching user services:", error)
    }
  }

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }))
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview((prev) => ({ ...prev, comment: e.target.value }))
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewReview((prev) => ({ ...prev, service: e.target.value }))
  }

  const handleSubmitReview = async () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a rating and comment",
        variant: "destructive",
      })
      return
    }

    if (!userId || !targetUserId) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to leave a review",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit the review to Supabase
      const { data, error } = await supabase.from("reviews").insert({
        contractor_id: targetUserId,
        reviewer_id: userId,
        rating: newReview.rating,
        comment: newReview.comment,
        service: newReview.service,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Get the user profile for display
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, profile_image")
        .eq("id", userId)
        .single()

      if (profileError) throw profileError

      // Add the new review to the state
      const newReviewObject: Review = {
        id: data[0].id,
        name: profileData?.name || "You",
        avatar: profileData?.profile_image || "/placeholder.svg?height=40&width=40",
        rating: newReview.rating,
        date: "Just now",
        comment: newReview.comment,
        service: newReview.service,
        user_id: userId,
      }

      setReviews((prev) => [newReviewObject, ...prev])
      setNewReview({ rating: 0, comment: "", service: userServices[0]?.name || "" })

      toast({
        title: "Review submitted",
        description: "Your review has been successfully submitted",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to format review dates
  const formatReviewDate = (timestamp: string): string => {
    const reviewDate = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - reviewDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return "Today"
    if (diffDays < 2) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Check if the user has already submitted a review
  const hasSubmittedReview = userId && reviews.some((review) => review.user_id === userId)

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center bg-card shadow-soft z-10">
        <Link href="/profile" className="mr-3 p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Reviews & Ratings</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-border rounded-xl overflow-hidden shadow-card bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-muted animate-pulse rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {userType === "hirer" && contractorId && !hasSubmittedReview && (
              <Card className="border border-border rounded-xl overflow-hidden mb-6 shadow-card bg-card">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-3">Leave a Review</h2>

                  {userServices.length > 0 ? (
                    <>
                      <div className="mb-3">
                        <label htmlFor="service" className="block text-sm font-medium mb-1">
                          Service
                        </label>
                        <select
                          id="service"
                          className="w-full p-2 border border-border rounded-md bg-muted text-foreground"
                          value={newReview.service}
                          onChange={handleServiceChange}
                        >
                          {userServices.map((service) => (
                            <option key={service.id} value={service.name}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center mb-3">
                        <p className="mr-2">Rating:</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => handleRatingChange(star)} className="focus:outline-none">
                              <StarIcon
                                className={`h-6 w-6 ${
                                  newReview.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Write your review here..."
                        className="mb-3 bg-muted border-border"
                        value={newReview.comment}
                        onChange={handleCommentChange}
                      />
                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition-all duration-200 shadow-button"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center p-3 bg-amber-900/20 text-amber-400 rounded-lg">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">
                        You need to complete a job with this contractor before leaving a review.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {hasSubmittedReview && (
              <div className="mb-6 p-3 bg-green-900/20 text-green-400 rounded-lg flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm">You've already submitted a review for this contractor.</p>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="font-semibold">All Reviews</h2>

              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-lg">
                  <div className="flex flex-col items-center space-y-3">
                    <StarIcon className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">Відгуків поки немає</h3>
                    <p className="text-sm max-w-sm">
                      Коли клієнти залишать відгуки про вашу роботу, вони з'являться тут
                    </p>
                  </div>
                </div>
              ) : (
                reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="border border-border rounded-xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-200 bg-card"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-10 w-10 mr-3 ring-2 ring-border shadow-soft">
                          <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                          <AvatarFallback>{review.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{review.name}</h3>
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  className={`h-4 w-4 ${
                                    review.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">Service: {review.service}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
