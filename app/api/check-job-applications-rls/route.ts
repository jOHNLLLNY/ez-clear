import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    console.log("Checking RLS policies for job_applications table")

    // Check if the table exists
    const { error: checkError } = await supabaseAdmin.from("job_applications").select("id").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      return NextResponse.json(
        {
          error: "job_applications table does not exist",
        },
        { status: 404 },
      )
    }

    // Query to get RLS policies
    const { data, error } = await supabaseAdmin.rpc("get_table_policies", {
      table_name: "job_applications",
    })

    if (error) {
      throw error
    }

    // Check if RLS is enabled
    const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc("is_rls_enabled", {
      table_name: "job_applications",
    })

    if (rlsError) {
      throw rlsError
    }

    return NextResponse.json({
      policies: data || [],
      rls_enabled: rlsData || false,
    })
  } catch (error: any) {
    console.error("Error checking RLS policies:", error)
    return NextResponse.json({ error: error.message || "Failed to check RLS policies" }, { status: 500 })
  }
}
