import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 })
    }

    console.log("Attempting to change password")

    // Get the user from the session
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated, verifying current password")

    // First verify the current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    })

    if (signInError) {
      console.log("Current password verification failed:", signInError.message)
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    console.log("Current password verified, updating password")

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.log("Password update failed:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Password updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
