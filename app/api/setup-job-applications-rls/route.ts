import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin access
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    console.log("Setting up RLS policies for job_applications table")

    // First check if the table exists
    const { error: checkError } = await supabaseAdmin.from("job_applications").select("id").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      console.log("job_applications table does not exist, creating it first")

      // Create the table
      const { error: createError } = await supabaseAdmin.rpc("create_job_applications_table", {})

      if (createError) {
        throw new Error(`Failed to create job_applications table: ${createError.message}`)
      }
    }

    // Drop existing policies to avoid conflicts
    try {
      await supabaseAdmin.rpc("drop_policy_if_exists", {
        table_name: "job_applications",
        policy_name: "job_applications_select_policy",
      })

      await supabaseAdmin.rpc("drop_policy_if_exists", {
        table_name: "job_applications",
        policy_name: "job_applications_insert_policy",
      })

      await supabaseAdmin.rpc("drop_policy_if_exists", {
        table_name: "job_applications",
        policy_name: "job_applications_update_policy",
      })
    } catch (policyError) {
      console.error("Error dropping existing policies:", policyError)
      // Continue anyway
    }

    // Create SELECT policy for job_applications
    // This allows:
    // 1. Job owners to see all applications for their jobs
    // 2. Applicants to see their own applications
    const selectPolicySQL = `
      CREATE POLICY "job_applications_select_policy" ON "public"."job_applications"
      FOR SELECT USING (
        -- Applicant can see their own applications
        (auth.uid() = applicant_id) OR
        -- Job owner can see applications for their jobs
        (auth.uid() IN (
          SELECT user_id FROM jobs WHERE id = job_id
        ))
      );
    `

    // Create INSERT policy for job_applications
    const insertPolicySQL = `
      CREATE POLICY "job_applications_insert_policy" ON "public"."job_applications"
      FOR INSERT WITH CHECK (
        -- Users can only create applications for themselves
        auth.uid() = applicant_id
      );
    `

    // Create UPDATE policy for job_applications
    const updatePolicySQL = `
      CREATE POLICY "job_applications_update_policy" ON "public"."job_applications"
      FOR UPDATE USING (
        -- Applicants can update their own applications
        (auth.uid() = applicant_id) OR
        -- Job owners can update applications for their jobs
        (auth.uid() IN (
          SELECT user_id FROM jobs WHERE id = job_id
        ))
      );
    `

    // Execute the SQL statements
    await supabaseAdmin.rpc("execute_sql", { sql_query: selectPolicySQL })
    await supabaseAdmin.rpc("execute_sql", { sql_query: insertPolicySQL })
    await supabaseAdmin.rpc("execute_sql", { sql_query: updatePolicySQL })

    // Enable RLS on the table
    const enableRlsSQL = `
      ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;
    `
    await supabaseAdmin.rpc("execute_sql", { sql_query: enableRlsSQL })

    return NextResponse.json({
      success: true,
      message: "RLS policies for job_applications table set up successfully",
    })
  } catch (error: any) {
    console.error("Error setting up RLS policies:", error)
    return NextResponse.json({ error: error.message || "Failed to set up RLS policies" }, { status: 500 })
  }
}
