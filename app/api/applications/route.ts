import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Helper function to ensure the job_applications table exists
async function ensureApplicationsTable() {
  try {
    // Check if job_applications table exists
    const { error: checkError } = await supabaseAdmin.from("job_applications").select("id").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      // Create the table directly using SQL with proper foreign key constraints
      const { error: createError } = await supabaseAdmin.rpc("create_job_applications_table", {})

      if (createError) {
        console.error("Error creating job_applications table with RPC:", createError)

        // Try a different approach - use raw SQL via REST API
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          const response = await fetch(`${baseUrl}/api/setup-applications-table`, {
            method: "POST",
          })

          if (!response.ok) {
            throw new Error(`Failed to create table: ${response.statusText}`)
          }

          return true
        } catch (fetchError) {
          console.error("Error with fallback table creation via API:", fetchError)
          return false
        }
      }

      return true
    }
    return true // Table already exists
  } catch (error) {
    console.error("Error ensuring job_applications table exists:", error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure the job_applications table exists
    const tableExists = await ensureApplicationsTable()
    if (!tableExists) {
      // If the table couldn't be created, return empty array with a warning
      return NextResponse.json({
        data: [],
        warning: "Applications table could not be created. Please try again later.",
      })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("job_id")
    const userId = searchParams.get("user_id")
    const workerId = searchParams.get("worker_id") // Added to support worker-specific queries
    const status = searchParams.get("status")

    // Base query - use simple select to avoid relationship issues
    let query = supabaseAdmin.from("job_applications").select("*")

    if (jobId) {
      query = query.eq("job_id", jobId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    // If workerId is provided, get applications where the worker is the applicant
    if (workerId) {
      const { data: workerApps, error: workerError } = await query.eq("applicant_id", workerId)

      if (workerError) {
        console.error("Error fetching worker applications:", workerError)
        return NextResponse.json([])
      }

      // For each application, fetch the related job details
      const enhancedApps = await Promise.all(
        (workerApps || []).map(async (app) => {
          try {
            // Get job details
            const { data: jobData } = await supabaseAdmin.from("jobs").select("*").eq("id", app.job_id).single()

            // Get job poster details
            const { data: posterData } = await supabaseAdmin
              .from("profiles")
              .select("*")
              .eq("id", jobData?.user_id)
              .single()

            return {
              ...app,
              job: jobData || null,
              job_title: jobData?.title || "Unknown Job",
              job_description: jobData?.description || "",
              job_location: jobData?.location || "",
              job_service_type: jobData?.service_type || "",
              job_poster: posterData || null,
            }
          } catch (error) {
            console.error(`Error enhancing application ${app.id}:`, error)
            return {
              ...app,
              job_title: "Unknown Job",
              job_description: "",
              job_location: "",
              job_service_type: "",
            }
          }
        }),
      )

      return NextResponse.json(enhancedApps)
    }

    // If userId is provided, we need to handle this differently
    if (userId) {
      // Get all applications where the user is the applicant
      const { data: applicantApps, error: applicantError } = await query.eq("applicant_id", userId)

      if (applicantError) {
        console.error("Error fetching applicant applications:", applicantError)
        return NextResponse.json([])
      }

      // Get all jobs posted by this user
      const { data: userJobs, error: jobsError } = await supabaseAdmin.from("jobs").select("id").eq("user_id", userId)

      if (jobsError) {
        console.error("Error fetching user jobs:", jobsError)
        return NextResponse.json(applicantApps || [])
      }

      // If user has posted jobs, get applications for those jobs
      let posterApps: any[] = []
      if (userJobs && userJobs.length > 0) {
        const jobIds = userJobs.map((job) => job.id)

        // For each job, get applications
        for (const jobId of jobIds) {
          const { data: jobApps, error: jobAppsError } = await supabaseAdmin
            .from("job_applications")
            .select("*")
            .eq("job_id", jobId)

          if (jobAppsError) {
            console.error(`Error fetching applications for job ${jobId}:`, jobAppsError)
            continue
          }

          if (jobApps) {
            posterApps = [...posterApps, ...jobApps]
          }
        }
      }

      // Combine both sets of applications and remove duplicates
      const allApps = [...(applicantApps || []), ...posterApps]
      const uniqueApps = Array.from(new Map(allApps.map((app) => [app.id, app])).values())

      // Sort by created_at
      uniqueApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      // For each application, fetch the related job and applicant details
      const enhancedApps = await Promise.all(
        uniqueApps.map(async (app) => {
          try {
            // Get job details
            const { data: jobData } = await supabaseAdmin.from("jobs").select("*").eq("id", app.job_id).single()

            // Get applicant details
            const { data: applicantData } = await supabaseAdmin
              .from("profiles")
              .select("*")
              .eq("id", app.applicant_id)
              .single()

            return {
              ...app,
              job: jobData || null,
              applicant: applicantData || null,
            }
          } catch (error) {
            console.error(`Error enhancing application ${app.id}:`, error)
            return app
          }
        }),
      )

      return NextResponse.json(enhancedApps)
    } else {
      // If no userId, just execute the query as is
      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      // For each application, fetch the related job and applicant details
      const enhancedApps = await Promise.all(
        (data || []).map(async (app) => {
          try {
            // Get job details
            const { data: jobData } = await supabaseAdmin.from("jobs").select("*").eq("id", app.job_id).single()

            // Get applicant details
            const { data: applicantData } = await supabaseAdmin
              .from("profiles")
              .select("*")
              .eq("id", app.applicant_id)
              .single()

            return {
              ...app,
              job: jobData || null,
              applicant: applicantData || null,
            }
          } catch (error) {
            console.error(`Error enhancing application ${app.id}:`, error)
            return app
          }
        }),
      )

      return NextResponse.json(enhancedApps)
    }
  } catch (error: any) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure the job_applications table exists
    const tableExists = await ensureApplicationsTable()
    if (!tableExists) {
      return NextResponse.json(
        { error: "Applications table could not be created. Please try again later." },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { job_id, applicant_id, message } = body

    // Validate required fields
    if (!job_id || !applicant_id) {
      return NextResponse.json({ error: "Missing required fields: job_id and applicant_id" }, { status: 400 })
    }

    // Check if application already exists
    const { data: existingApp, error: checkError } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .eq("job_id", job_id)
      .eq("applicant_id", applicant_id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is what we want
      throw checkError
    }

    if (existingApp) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 })
    }

    // Get job details to create notification
    const { data: jobData, error: jobError } = await supabaseAdmin.from("jobs").select("*").eq("id", job_id).single()

    if (jobError) {
      throw jobError
    }

    // Get applicant details
    const { data: applicantData, error: applicantError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", applicant_id)
      .single()

    if (applicantError) {
      throw applicantError
    }

    // Create the application
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .insert({
        job_id,
        applicant_id,
        message: message || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Create notification for job poster with improved format
    try {
      const { data: notificationData, error: notificationError } = await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: jobData.user_id,
          type: "application",
          title: "New Job Application",
          description: `New application from ${applicantData.name} for your job "${jobData.title}"`,
          data: {
            job_id,
            application_id: data.id,
            applicant_id,
          },
          read: false,
          created_at: new Date().toISOString(),
        })
        .select()

      if (notificationError) {
        console.error("Error creating notification:", notificationError)
      } else {
        console.log("Job application notification created successfully:", notificationData)
      }
    } catch (notifError) {
      console.error("Error in notification creation process:", notifError)
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: error.message || "Failed to apply for job" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update the application status
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // If the status is "hired", create a notification for the applicant
    if (status === "hired") {
      try {
        // Get the job details
        const { data: appData } = await supabaseAdmin
          .from("job_applications")
          .select("job_id, applicant_id")
          .eq("id", id)
          .single()

        if (appData) {
          // Get job title
          const { data: jobData } = await supabaseAdmin.from("jobs").select("title").eq("id", appData.job_id).single()

          // Create notification
          await supabaseAdmin.from("notifications").insert({
            user_id: appData.applicant_id,
            type: "job",
            title: "You've been hired!",
            description: `You've been hired for the job "${jobData?.title || "Job"}"`,
            data: {
              job_id: appData.job_id,
              application_id: id,
            },
            read: false,
            created_at: new Date().toISOString(),
          })
        }
      } catch (notifError) {
        console.error("Error creating notification:", notifError)
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: error.message || "Failed to update application" }, { status: 500 })
  }
}
