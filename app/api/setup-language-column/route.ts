import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Initialize Supabase client with admin privileges
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if the language column exists
    const { data: columns, error: columnsError } = await supabase.from("profiles").select("language").limit(1)

    if (columnsError && columnsError.message.includes('column "language" does not exist')) {
      // Add the language column to the profiles table
      const { error: alterError } = await supabase.rpc("add_language_column")

      if (alterError) {
        console.error("Error adding language column:", alterError)
        return NextResponse.json({ error: "Failed to add language column" }, { status: 500 })
      }

      // Create the stored procedure if it doesn't exist
      const { error: procedureError } = await supabase.rpc("create_add_language_column_function", {
        function_sql: `
          CREATE OR REPLACE FUNCTION add_language_column()
          RETURNS void AS $$
          BEGIN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
          END;
          $$ LANGUAGE plpgsql;
        `,
      })

      if (procedureError && !procedureError.message.includes("already exists")) {
        console.error("Error creating stored procedure:", procedureError)
        return NextResponse.json({ error: "Failed to create stored procedure" }, { status: 500 })
      }

      // Execute the stored procedure
      const { error: executeError } = await supabase.rpc("add_language_column")

      if (executeError) {
        console.error("Error executing stored procedure:", executeError)
        return NextResponse.json({ error: "Failed to execute stored procedure" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Language column added to profiles table" })
    }

    return NextResponse.json({ success: true, message: "Language column already exists" })
  } catch (error) {
    console.error("Error in setup language column API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
