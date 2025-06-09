import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ success: false, error: "No SQL provided" }, { status: 400 })
    }

    console.log("Executing SQL:", sql)

    const { error } = await supabaseAdmin.query(sql)

    if (error) {
      console.error("SQL execution error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "SQL executed successfully" })
  } catch (error: any) {
    console.error("Error executing SQL:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
