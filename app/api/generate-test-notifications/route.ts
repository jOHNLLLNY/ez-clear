import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Ensure the notifications table exists
    await fetch(`${request.nextUrl.origin}/api/setup-notifications-table`)

    // Get user profile
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) {
      throw userError
    }

    const userType = userProfile.user_type

    // Create sample notifications based on user type
    const notifications = []

    // Common notifications for both user types
    notifications.push({
      user_id: userId,
      type: "system",
      title: "Welcome to Ez Clear",
      description: "Thank you for joining our platform. Complete your profile to get started.",
      data: null,
      read: false,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    })

    // User type specific notifications
    if (userType === "worker") {
      // Worker notifications
      notifications.push({
        user_id: userId,
        type: "job",
        title: "New job matches your skills",
        description: "We found 3 new jobs that match your skills in your area.",
        data: null,
        read: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      })

      notifications.push({
        user_id: userId,
        type: "application_update",
        title: "Application accepted",
        description: "Your application for 'Lawn Mowing Service' has been accepted",
        data: {
          job_id: 1,
          application_id: 1,
        },
        read: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      })

      notifications.push({
        user_id: userId,
        type: "message",
        title: "New message",
        description: "John Doe: Hi, I'd like to discuss the details of the job.",
        data: {
          conversation_id: 1,
        },
        read: true,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      })
    } else if (userType === "hirer") {
      // Hirer notifications
      notifications.push({
        user_id: userId,
        type: "application",
        title: "New job application",
        description: "Jane Smith has applied to your job 'Snow Removal Service'",
        data: {
          job_id: 2,
          application_id: 2,
          applicant_id: "some-uuid",
        },
        read: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      })

      notifications.push({
        user_id: userId,
        type: "message",
        title: "New message",
        description: "Jane Smith: Thank you for accepting my application. When would you like me to start?",
        data: {
          conversation_id: 2,
        },
        read: false,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      })

      notifications.push({
        user_id: userId,
        type: "job",
        title: "Job posting expiring soon",
        description: "Your job posting 'Landscaping Service' will expire in 2 days. Consider extending it.",
        data: {
          job_id: 3,
        },
        read: true,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      })
    }

    // Insert notifications
    const { data, error } = await supabaseAdmin.from("notifications").insert(notifications).select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: `${data.length} test notifications created for user ${userId}`,
      notifications: data,
    })
  } catch (error: any) {
    console.error("Error generating test notifications:", error)
    return NextResponse.json({ error: error.message || "Failed to generate test notifications" }, { status: 500 })
  }
}
