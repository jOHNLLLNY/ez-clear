import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const user_id = searchParams.get("user_id")
    const service_type = searchParams.get("service_type")

    let query = supabase.from("jobs").select("*")

    // Apply filters if provided
    if (status) {
      query = query.eq("status", status)
    }

    if (user_id) {
      query = query.eq("user_id", user_id)
    }

    if (service_type) {
      query = query.eq("service_type", service_type)
    }

    // Order by created_at
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    // Process job titles to ensure they're concise
    if (data && Array.isArray(data)) {
      data.forEach((job) => {
        // Truncate extremely long titles for display purposes
        if (job.title && job.title.length > 100) {
          job.display_title = job.title.substring(0, 97) + "..."
        } else {
          job.display_title = job.title
        }
      })
    }

    if (error) {
      console.error("Error fetching jobs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in jobs API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.location || !body.service_type || !body.user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate title length
    if (body.title.length > 100) {
      return NextResponse.json({ error: "Job title is too long (maximum 100 characters)" }, { status: 400 })
    }

    // Set default status if not provided
    if (!body.status) {
      body.status = "open"
    }

    const { data, error } = await supabase.from("jobs").insert(body).select()

    if (error) {
      console.error("Error creating job:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("Error in jobs API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
