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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, data } = body

    if (!userId || !title) {
      return NextResponse.json({ error: "User ID and title are required" }, { status: 400 })
    }

    // Get the user's push subscription
    const { data: subscriptionData, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error retrieving push subscription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subscriptionData) {
      return NextResponse.json({ error: "No push subscription found for this user" }, { status: 404 })
    }

    // Parse the subscription JSON
    const subscription = JSON.parse(subscriptionData.subscription)

    // Prepare the notification payload
    const payload = JSON.stringify({
      title,
      description,
      data: {
        ...data,
        url: data?.url || "/",
        timestamp: new Date().toISOString(),
      },
    })

    // Send the push notification
    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error sending push notification:", error)

    // Handle expired or invalid subscriptions
    if (error.statusCode === 410) {
      // Subscription has expired or is no longer valid
      const userId = request.body ? (await request.json()).userId : null
      if (userId) {
        // Remove the invalid subscription
        await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", userId)
      }
      return NextResponse.json({ error: "Subscription has expired", removed: true }, { status: 410 })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
