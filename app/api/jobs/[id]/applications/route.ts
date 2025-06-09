import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    // Get all applications for this job
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // For each application, fetch the applicant details
    const enhancedApps = await Promise.all(
      (data || []).map(async (app) => {
        try {
          // Get applicant details
          const { data: applicantData } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", app.applicant_id)
            .single()

          return {
            ...app,
            applicant: applicantData || null,
          }
        } catch (error) {
          console.error(`Error enhancing application ${app.id}:`, error)
          return app
        }
      }),
    )

    return NextResponse.json(enhancedApps)
  } catch (error: any) {
    console.error(`Error fetching applications for job ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 })
  }
}
