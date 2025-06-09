import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Initialize Supabase client with the correct environment variable names
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the language from the request body
    const { language } = await request.json()

    if (!language) {
      return NextResponse.json({ error: "Language is required" }, { status: 400 })
    }

    try {
      // Try to update the user's profile with the new language preference
      const { error: updateError } = await supabase.from("profiles").update({ language }).eq("id", user.id)

      if (updateError) {
        // If the error is about the missing column, try to create it
        if (updateError.message.includes('column "language" does not exist')) {
          // Call the setup API to create the column
          const setupResponse = await fetch("/api/setup-language-column")

          if (!setupResponse.ok) {
            console.error("Failed to set up language column")
            return NextResponse.json({ error: "Failed to set up language column" }, { status: 500 })
          }

          // Try the update again
          const { error: retryError } = await supabase.from("profiles").update({ language }).eq("id", user.id)

          if (retryError) {
            console.error("Error updating language preference after column creation:", retryError)
            return NextResponse.json({ error: "Failed to update language preference" }, { status: 500 })
          }
        } else {
          console.error("Error updating language preference:", updateError)
          return NextResponse.json({ error: "Failed to update language preference" }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error updating language preference:", error)
      return NextResponse.json({ error: "Failed to update language preference" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in language API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
