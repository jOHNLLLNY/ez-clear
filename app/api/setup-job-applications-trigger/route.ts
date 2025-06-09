import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if the user is authenticated and has admin privileges
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // SQL to create the function and trigger
    const triggerSQL = `
      -- First, check if the function already exists and drop it if it does
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
      
      -- Create the function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Check if the trigger already exists and drop it if it does
      DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
      
      -- Create the trigger
      CREATE TRIGGER update_job_applications_updated_at
      BEFORE UPDATE ON job_applications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql: triggerSQL })

    if (error) {
      console.error("Error creating trigger:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verify the trigger was created
    const { data: triggers, error: verifyError } = await supabase.rpc("exec_sql", {
      sql: `SELECT * FROM pg_trigger WHERE tgname = 'update_job_applications_updated_at'`,
    })

    if (verifyError) {
      console.error("Error verifying trigger:", verifyError)
      return NextResponse.json({ error: verifyError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully created updated_at trigger for job_applications table",
      triggerExists: triggers && triggers.length > 0,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
