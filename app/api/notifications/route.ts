import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Helper function to ensure the notifications table exists
async function ensureNotificationsTable(origin: string) {
  try {
    // Try to check if the table exists
    const { error } = await supabaseAdmin.from("notifications").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist, create it
      const response = await fetch(`${origin}/api/setup-notifications-table`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to create notifications table: ${errorText}`)
        throw new Error(`Failed to create notifications table: ${response.status}`)
      }

      // Wait a moment for the table to be available
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify the table was created
      const { error: verifyError } = await supabaseAdmin.from("notifications").select("id").limit(1)
      if (verifyError) {
        throw verifyError
      }
    } else if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error ensuring notifications table exists:", error)
    return false
  }
}

// Helper function to send push notification
async function sendPushNotification(origin: string, userId: string, title: string, description: string, data: any) {
  try {
    const response = await fetch(`${origin}/api/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title,
        description,
        data,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error sending push notification: ${response.status} - ${errorText}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending push notification:", error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure the notifications table exists
    const tableExists = await ensureNotificationsTable(request.nextUrl.origin)
    if (!tableExists) {
      return NextResponse.json({ error: "Notifications table could not be created" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching notifications:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, read } = body

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ read: read === undefined ? true : read })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: error.message || "Failed to update notification" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the notifications table exists
    const tableExists = await ensureNotificationsTable(request.nextUrl.origin)
    if (!tableExists) {
      return NextResponse.json({ error: "Notifications table could not be created" }, { status: 500 })
    }

    const body = await request.json()
    const { user_id, type, title, description, data } = body

    if (!user_id || !type || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Creating notification:", { user_id, type, title, description, data })

    const { data: notificationData, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        description,
        data,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error creating notification:", error)
      throw error
    }

    console.log("Notification created successfully:", notificationData)

    // Send push notification if the user has subscribed
    await sendPushNotification(request.nextUrl.origin, user_id, title, description || "", {
      ...data,
      notificationId: notificationData.id,
      type,
    })

    return NextResponse.json(notificationData)
  } catch (error: any) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: error.message || "Failed to create notification" }, { status: 500 })
  }
}
