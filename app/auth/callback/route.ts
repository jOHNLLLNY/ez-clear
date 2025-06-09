import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=${encodeURIComponent(errorDescription || error)}`, request.url),
    )
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("Session error:", sessionError)
        return NextResponse.redirect(
          new URL(`/auth/sign-in?error=${encodeURIComponent(sessionError.message)}`, request.url),
        )
      }

      // Get the user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if the user already has a profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        // If no profile exists, create one
        if (!profile) {
          // Default to worker type
          const userType = "worker"

          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
            user_type: userType,
            created_at: new Date().toISOString(),
            is_online: true,
          })

          // Redirect to profile details for new users
          return NextResponse.redirect(new URL("/auth/profile-details", request.url))
        }

        // For existing users, redirect based on user type
        return NextResponse.redirect(
          new URL(profile.user_type === "worker" ? "/home/worker" : "/home/hirer", request.url),
        )
      }
    } catch (error) {
      console.error("Error in callback:", error)
      return NextResponse.redirect(
        new URL(`/auth/sign-in?error=${encodeURIComponent("Authentication failed")}`, request.url),
      )
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL("/", request.url))
}
