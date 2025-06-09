import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")
    const type = searchParams.get("type") || "test"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create a test notification
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        type: type,
        title: "Test Notification",
        description: `This is a test ${type} notification`,
        data: {
          test: true,
        },
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating test notification:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Test notification created successfully",
      notification: data[0],
    })
  } catch (error: any) {
    console.error("Error in test notification endpoint:", error)
    return NextResponse.json({ error: error.message || "Failed to create test notification" }, { status: 500 })
  }
}
