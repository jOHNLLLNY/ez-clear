import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    console.log(`Counting applications for job ID: ${jobId}`)

    // Count the number of unique applications related to this job
    const { data, error, count } = await supabaseAdmin
      .from("job_applications")
      .select("*", { count: "exact" })
      .eq("job_id", Number(jobId)) // Ensure jobId is converted to a number

    if (error) {
      console.error("Error counting applications:", error)
      throw error
    }

    console.log(`Found ${count} applications for job ${jobId}`)

    return NextResponse.json({ count: count || 0 })
  } catch (error: any) {
    console.error(`Error counting applications for job ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Failed to count applications", count: 0 }, { status: 500 })
  }
}
