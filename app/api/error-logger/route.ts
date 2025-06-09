import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.error) {
      return NextResponse.json({ error: "Error details are required" }, { status: 400 })
    }

    // Create error log entry
    const { data, error } = await supabase
      .from("error_logs")
      .insert({
        error_message: body.error,
        component_stack: body.componentStack,
        url: body.url,
        user_agent: request.headers.get("user-agent") || "",
        timestamp: body.timestamp || new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Failed to log error to database:", error)

      // If the table doesn't exist, create it
      if (error.message.includes("does not exist")) {
        await supabase.rpc("create_error_logs_table", {})

        // Try again after creating the table
        const { data: retryData, error: retryError } = await supabase
          .from("error_logs")
          .insert({
            error_message: body.error,
            component_stack: body.componentStack,
            url: body.url,
            user_agent: request.headers.get("user-agent") || "",
            timestamp: body.timestamp || new Date().toISOString(),
          })
          .select()

        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: retryData })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in error logger API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
