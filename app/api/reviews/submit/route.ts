import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractor_id, reviewer_id, rating, comment, service } = body

    // Validate required fields
    if (!contractor_id || !reviewer_id || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the reviewer has already submitted a review for this contractor
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("id")
      .eq("contractor_id", contractor_id)
      .eq("reviewer_id", reviewer_id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing review:", checkError)
      return NextResponse.json({ error: "Failed to check existing review" }, { status: 500 })
    }

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this contractor" }, { status: 400 })
    }

    // Insert the new review
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        contractor_id,
        reviewer_id,
        rating,
        comment,
        service,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error submitting review:", error)
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
    }

    return NextResponse.json({ success: true, review: data[0] })
  } catch (error) {
    console.error("Error in review submission API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
