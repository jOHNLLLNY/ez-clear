import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

// Ініціалізуємо Supabase admin client з service role key для обходу RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Update the GET function to optimize the query and add better error handling
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Fetching conversations for user: ${userId}`)

    // Add pagination to limit the number of records
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")
    const offset = (page - 1) * pageSize

    // Create a more robust Supabase client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      db: {
        schema: "public",
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    })

    // Add retry logic for rate limiting
    let retryCount = 0
    const maxRetries = 3
    let data, error

    while (retryCount < maxRetries) {
      try {
        const result = await supabaseAdmin
          .from("conversations")
          .select(`
            id, 
            last_message, 
            last_message_time, 
            unread_count,
            user1_id, 
            user2_id,
            user1:user1_id(id, name, profile_image, is_online),
            user2:user2_id(id, name, profile_image, is_online)
          `)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order("last_message_time", { ascending: false })
          .range(offset, offset + pageSize - 1)

        data = result.data
        error = result.error
        break // Success, exit retry loop
      } catch (fetchError: any) {
        console.error(`Attempt ${retryCount + 1} failed:`, fetchError)

        // Check if it's a rate limiting error
        if (fetchError.message?.includes("Too Many Requests") || fetchError.status === 429) {
          retryCount++
          if (retryCount < maxRetries) {
            // Exponential backoff: wait 1s, 2s, 4s
            const waitTime = Math.pow(2, retryCount - 1) * 1000
            console.log(`Rate limited, waiting ${waitTime}ms before retry...`)
            await new Promise((resolve) => setTimeout(resolve, waitTime))
            continue
          } else {
            return NextResponse.json(
              { error: "Service temporarily unavailable due to rate limiting. Please try again later." },
              { status: 429 },
            )
          }
        } else {
          // For other errors, don't retry
          throw fetchError
        }
      }
    }

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json({ error: error.message || "Failed to fetch conversations" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.log(`No conversations found for user: ${userId}`)
      return NextResponse.json([])
    }

    console.log(`Found ${data.length} conversations for user: ${userId}`)

    // Format the conversations to match the UI needs
    const formattedData = data
      .map((conv) => {
        const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1

        // Check if otherUser exists
        if (!otherUser) {
          console.error(`Missing user data in conversation ${conv.id}`)
          return null
        }

        return {
          id: conv.id,
          name: otherUser.name || "Unknown User",
          lastMessage: conv.last_message || "",
          time: formatMessageTime(conv.last_message_time),
          unread: conv.unread_count > 0,
          avatar: otherUser.profile_image || "/placeholder.svg?height=40&width=40",
          isOnline: otherUser.is_online || false,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
        }
      })
      .filter(Boolean) // Remove any null entries

    return NextResponse.json(formattedData)
  } catch (error: any) {
    console.error("Error fetching conversations:", error)

    // Handle different types of errors
    if (error.message?.includes("Too Many Requests")) {
      return NextResponse.json({ error: "Service temporarily unavailable. Please try again later." }, { status: 429 })
    }

    return NextResponse.json({ error: error.message || "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Creating conversation with body:", body)

    // Validate request
    if (!body.user1_id || !body.user2_id) {
      return NextResponse.json({ error: "Missing required fields: user1_id and user2_id" }, { status: 400 })
    }

    // Check if conversation already exists
    const { data: existingConv, error: checkError } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${body.user1_id},user2_id.eq.${body.user2_id}),and(user1_id.eq.${body.user2_id},user2_id.eq.${body.user1_id})`,
      )
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing conversation:", checkError)
      throw checkError
    }

    if (existingConv) {
      console.log("Conversation already exists:", existingConv)
      return NextResponse.json(existingConv)
    }

    // Create new conversation
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .insert({
        user1_id: body.user1_id,
        user2_id: body.user2_id,
        last_message: "",
        last_message_time: new Date().toISOString(),
        unread_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      throw error
    }

    console.log("Conversation created successfully:", data)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: error.message || "Failed to create conversation" }, { status: 500 })
  }
}

// Helper function
function formatMessageTime(timestamp: string): string {
  const messageDate = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Today - show time
    return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    // This week - show day name
    return messageDate.toLocaleDateString([], { weekday: "long" })
  } else {
    // Older - show date
    return messageDate.toLocaleDateString()
  }
}
