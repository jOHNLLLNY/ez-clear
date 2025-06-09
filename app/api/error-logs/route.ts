import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Ensure the table exists
    await fetch("/api/setup-error-logs-table", { method: "POST" })

    // Get all error logs
    const { data, error } = await supabase.from("error_logs").select("*").order("timestamp", { ascending: false })

    if (error) {
      console.error("Failed to fetch error logs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching error logs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
