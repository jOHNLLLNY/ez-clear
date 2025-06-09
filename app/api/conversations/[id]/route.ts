import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id

    // Get the user ID from the request
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Fetch the conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select(`
        *,
        user1:user1_id(id, name, profile_image, is_online),
        user2:user2_id(id, name, profile_image, is_online)
      `)
      .eq("id", conversationId)
      .single()

    if (convError) {
      console.error("Error fetching conversation:", convError)
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Determine which user is the conversation partner
    const partner = userId
      ? conversation.user1_id === userId
        ? conversation.user2
        : conversation.user1
      : conversation.user2 // Default to user2 if no userId provided

    // Format the response
    const formattedResponse = {
      id: conversation.id,
      last_message: conversation.last_message,
      last_message_time: conversation.last_message_time,
      unread_count: conversation.unread_count,
      partner: {
        id: partner.id,
        name: partner.name,
        profile_image: partner.profile_image || "/placeholder.svg?height=40&width=40",
        is_online: partner.is_online,
      },
    }

    return NextResponse.json(formattedResponse)
  } catch (error: any) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch conversation" }, { status: 500 })
  }
}
