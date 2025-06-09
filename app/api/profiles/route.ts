import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    persistSession: false,
  },
  // Add retry configuration
  global: {
    fetch: (...args) => fetch(...args),
  },
})

// Helper function to implement retry logic with exponential backoff
async function fetchWithRetry(fetchFn, maxRetries = 3) {
  let retries = 0

  while (retries < maxRetries) {
    try {
      return await fetchFn()
    } catch (error) {
      retries++

      // If we've reached max retries, throw the error
      if (retries >= maxRetries) {
        throw error
      }

      // Calculate delay with exponential backoff (1s, 2s, 4s, etc.)
      const delay = Math.pow(2, retries - 1) * 1000

      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (userId) {
      // Get specific user profile with retry logic
      const { data, error } = await fetchWithRetry(async () => {
        return await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()
      })

      if (error) {
        throw error
      }

      return NextResponse.json(data)
    } else {
      // Get all profiles (with optional filters) with retry logic
      const userType = searchParams.get("user_type")

      let query = supabaseAdmin.from("profiles").select("*")

      if (userType) {
        query = query.eq("user_type", userType)
      }

      const { data, error } = await fetchWithRetry(async () => {
        return await query
      })

      if (error) {
        throw error
      }

      return NextResponse.json(data)
    }
  } catch (error: any) {
    console.error("Error fetching profiles:", error)

    // Check if it's a rate limit error
    if (error.message && error.message.includes("Too Many Requests")) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Handle other errors
    return NextResponse.json({ error: error.message || "Failed to fetch profiles" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    if (!body.id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update profile with retry logic
    const { data, error } = await fetchWithRetry(async () => {
      return await supabaseAdmin.from("profiles").update(body).eq("id", body.id).select().single()
    })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating profile:", error)

    // Check if it's a rate limit error
    if (error.message && error.message.includes("Too Many Requests")) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 })
  }
}
