import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST() {
  try {
    // Create the error_logs table if it doesn't exist
    const { error } = await supabase.rpc("create_error_logs_table", {})

    if (error) {
      console.error("Failed to create error_logs table:", error)

      // Try direct SQL approach if RPC fails
      const { error: sqlError } = await supabase.from("error_logs").select("id").limit(1)

      if (sqlError && sqlError.message.includes("does not exist")) {
        // Execute raw SQL to create the table
        const { error: createError } = await supabase.rpc("execute_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS error_logs (
              id SERIAL PRIMARY KEY,
              error_message TEXT NOT NULL,
              component_stack TEXT,
              url TEXT,
              user_agent TEXT,
              timestamp TIMESTAMPTZ DEFAULT NOW(),
              resolved BOOLEAN DEFAULT FALSE
            );
          `,
        })

        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error setting up error_logs table:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
