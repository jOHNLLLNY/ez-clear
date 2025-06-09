import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractorId = searchParams.get("contractor_id")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!contractorId) {
      return NextResponse.json({ error: "Contractor ID is required" }, { status: 400 })
    }

    // Query the reviews table with joins to get reviewer information
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        service,
        created_at,
        reviewer_id,
        reviewer:profiles!reviewer_id(name, profile_image)
      `)
      .eq("contractor_id", contractorId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError)
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }

    // Get the total count of reviews for pagination
    const { count, error: countError } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("contractor_id", contractorId)

    if (countError) {
      console.error("Error counting reviews:", countError)
    }

    // Format the reviews for the response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      service: review.service,
      date: formatReviewDate(review.created_at),
      reviewer: {
        id: review.reviewer_id,
        name: review.reviewer?.name || "Anonymous",
        image: review.reviewer?.profile_image || null,
      },
    }))

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => Math.round(review.rating) === stars).length,
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      total: count || reviews.length,
      averageRating,
      ratingDistribution,
    })
  } catch (error) {
    console.error("Error in reviews API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to format the review date
function formatReviewDate(timestamp: string): string {
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
