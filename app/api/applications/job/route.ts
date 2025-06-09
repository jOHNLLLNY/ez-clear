import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Helper function to ensure the job_applications table exists with proper relationships
async function ensureApplicationsTable() {
  try {
    // Check if job_applications table exists
    const { error: checkError } = await supabaseAdmin.from("job_applications").select("id").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      // Create the table using direct SQL
      try {
        const { error: createError } = await supabaseAdmin.query(`
          CREATE TABLE IF NOT EXISTS public.job_applications (
            id SERIAL PRIMARY KEY,
            job_id INTEGER NOT NULL,
            applicant_id UUID NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            conversation_id INTEGER
          );
          
          -- Add indexes for better performance
          CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
          CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id);
        `)

        if (createError) {
          console.error("Error creating job_applications table with SQL:", createError)

          // Fallback: Try to create the table using the simpler approach without indexes
          const { error: simpleCreateError } = await supabaseAdmin.query(`
            CREATE TABLE IF NOT EXISTS job_applications (
              id SERIAL PRIMARY KEY,
              job_id INTEGER NOT NULL,
              applicant_id UUID NOT NULL,
              message TEXT,
              status TEXT DEFAULT 'pending',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `)

          if (simpleCreateError) {
            console.error("Error with fallback table creation:", simpleCreateError)
            return false
          }
        }

        return true
      } catch (sqlError) {
        console.error("SQL execution error:", sqlError)
        return false
      }
    }
    return true // Table already exists
  } catch (error) {
    console.error("Error ensuring job_applications table exists:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { job_id, applicant_id, message } = body

    // Try to use the existing table first
    try {
      // Check if application already exists
      const { data: existingApp, error: checkError } = await supabaseAdmin
        .from("job_applications")
        .select("*")
        .eq("job_id", job_id)
        .eq("applicant_id", applicant_id)
        .single()

      if (!checkError && existingApp) {
        return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 })
      }
    } catch (error) {
      // Table might not exist, we'll create it below
      console.log("Error checking existing application, table might not exist:", error)
    }

    console.log("Received application request:", { job_id, applicant_id, message })

    if (!job_id || !applicant_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Try to use the existing table first
    try {
      // Check if application already exists
      const { data: existingApp, error: checkError } = await supabaseAdmin
        .from("job_applications")
        .select("*")
        .eq("job_id", job_id)
        .eq("applicant_id", applicant_id)
        .single()

      if (!checkError && existingApp) {
        return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 })
      }
    } catch (error) {
      // Table might not exist, we'll create it below
      console.log("Error checking existing application, table might not exist:", error)
    }

    // Ensure the job_applications table exists
    const tableExists = await ensureApplicationsTable()
    if (!tableExists) {
      return NextResponse.json(
        { error: "Applications table could not be created. Please try again later." },
        { status: 500 },
      )
    }

    // Get job details to create notification
    const { data: jobData, error: jobError } = await supabaseAdmin.from("jobs").select("*").eq("id", job_id).single()

    if (jobError) {
      console.error("Error fetching job details:", jobError)
      throw jobError
    }

    // Get applicant details
    const { data: applicantData, error: applicantError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", applicant_id)
      .single()

    if (applicantError) {
      console.error("Error fetching applicant details:", applicantError)
      throw applicantError
    }

    console.log("Creating application record...")

    // Create the application
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .insert({
        job_id,
        applicant_id,
        message: message || `I'm interested in this job and would like to apply.`,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting application:", error)
      throw error
    }

    console.log("Application created successfully:", data)

    // Update the job to increment application count
    await supabaseAdmin
      .from("jobs")
      .update({
        application_count: jobData.application_count ? jobData.application_count + 1 : 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job_id)

    // Create notification for job poster
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: jobData.user_id,
        type: "application",
        title: "New job application",
        description: `${applicantData.name} has applied to your job "${jobData.title}"`,
        data: {
          job_id,
          application_id: data.id,
          applicant_id,
        },
        read: false,
        created_at: new Date().toISOString(),
      })
    } catch (notifError) {
      console.error("Error creating notification:", notifError)
      // Continue even if notification creation fails
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: error.message || "Failed to apply for job" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("job_id")

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // First, try to get applications without the join
    const { data: applications, error } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false })

    if (error) {
      if (error.message.includes("does not exist")) {
        // Table doesn't exist, return empty array
        return NextResponse.json([])
      }
      throw error
    }

    // If we have applications, fetch the applicant details separately
    if (applications && applications.length > 0) {
      const enhancedApplications = await Promise.all(
        applications.map(async (app) => {
          try {
            // Get applicant details
            const { data: applicantData, error: applicantError } = await supabaseAdmin
              .from("profiles")
              .select("id, name, profile_image, business_name, city, province, description")
              .eq("id", app.applicant_id)
              .single()

            if (applicantError) {
              console.error(`Error fetching applicant details for ${app.applicant_id}:`, applicantError)
              return {
                ...app,
                applicant: null,
              }
            }

            return {
              ...app,
              applicant: applicantData,
            }
          } catch (error) {
            console.error(`Error enhancing application ${app.id}:`, error)
            return app
          }
        }),
      )

      return NextResponse.json(enhancedApplications)
    }

    return NextResponse.json(applications || [])
  } catch (error: any) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 })
  }
}
