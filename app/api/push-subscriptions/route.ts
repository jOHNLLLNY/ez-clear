import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// VAPID keys for Web Push
// In a real application, these should be generated and stored securely
// For this example, we're using placeholder values
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
const VAPID_PRIVATE_KEY = "3KzvKasA2SoCxsp0iIG_o9B0Ozvl1XDwI63JRKNIWBM"

// Configure web-push with VAPID keys
webpush.setVapidDetails("mailto:support@ezclear.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

// Helper function to ensure the push_subscriptions table exists
async function ensurePushSubscriptionsTable(origin: string) {
  try {
    // Try to check if the table exists
    const { error } = await supabaseAdmin.from("push_subscriptions").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist, create it
      const response = await fetch(`${origin}/api/setup-push-subscriptions-table`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to create push_subscriptions table: ${await response.text()}`)
      }

      // Wait a moment for the table to be available
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify the table was created
      const { error: verifyError } = await supabaseAdmin.from("push_subscriptions").select("id").limit(1)
      if (verifyError) {
        throw verifyError
      }
    } else if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error ensuring push_subscriptions table exists:", error)
    return false
  }
}

// GET endpoint to retrieve the VAPID public key
export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY })
}

// POST endpoint to subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    // Ensure the push_subscriptions table exists
    const tableExists = await ensurePushSubscriptionsTable(request.nextUrl.origin)
    if (!tableExists) {
      return NextResponse.json({ error: "Push subscriptions table could not be created" }, { status: 500 })
    }

    const body = await request.json()
    const { userId, subscription } = body

    if (!userId || !subscription) {
      return NextResponse.json({ error: "User ID and subscription are required" }, { status: 400 })
    }

    // Store the subscription in the database
    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()

    if (error) {
      console.error("Error storing push subscription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error subscribing to push notifications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE endpoint to unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Remove the subscription from the database
    const { error } = await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", userId)

    if (error) {
      console.error("Error removing push subscription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error unsubscribing from push notifications:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
