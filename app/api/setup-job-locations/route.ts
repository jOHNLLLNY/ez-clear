import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client with service role key for admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // First check if the columns already exist
    const { data: columns, error: columnsError } = await supabase.rpc("test_columns_exist", {
      table_name: "jobs",
      column_names: ["lat", "lng"],
    })

    if (columnsError) {
      throw columnsError
    }

    if (columns && columns.length === 2) {
      // Both columns already exist, no need to add them
      return NextResponse.json({ message: "Lat and lng columns already exist in jobs table" })
    }

    // Add lat and lng columns to jobs table
    const queries = []

    if (!columns.includes("lat")) {
      queries.push(
        supabase.rpc("run_sql", {
          query: "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION",
        }),
      )
    }

    if (!columns.includes("lng")) {
      queries.push(
        supabase.rpc("run_sql", {
          query: "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION",
        }),
      )
    }

    await Promise.all(queries)

    // Add sample coordinates to existing jobs
    const { data: jobs, error: jobsError } = await supabase.from("jobs").select("id")

    if (jobsError) {
      throw jobsError
    }

    // Update jobs with random coordinates near Toronto
    const baseLatitude = 43.65107
    const baseLongitude = -79.347015
    const updates = jobs.map((job) => {
      return supabase
        .from("jobs")
        .update({
          lat: baseLatitude + (Math.random() - 0.5) * 0.05,
          lng: baseLongitude + (Math.random() - 0.5) * 0.05,
        })
        .eq("id", job.id)
    })

    await Promise.all(updates)

    return NextResponse.json({ message: "Successfully added location columns to jobs table" })
  } catch (error: any) {
    console.error("Error setting up job locations:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
