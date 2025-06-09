import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PATCH(request: Request) {
  try {
    const { email, sms, app } = await request.json()

    // Get the user from the session
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if the user settings exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from("user_settings")
      .select("id, notifications")
      .eq("user_id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const notifications = { email, sms, app }
    let error

    if (existingSettings) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from("user_settings")
        .update({ notifications })
        .eq("user_id", userId)

      error = updateError
    } else {
      // Insert new settings
      const { error: insertError } = await supabase.from("user_settings").insert({ notifications, user_id: userId })

      error = insertError
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
