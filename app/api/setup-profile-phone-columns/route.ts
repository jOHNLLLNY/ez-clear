import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET() {
  try {
    // Check if columns already exist
    const { data: columnsData, error: columnsError } = await supabaseAdmin.rpc("get_column_names", {
      table_name: "profiles",
    })

    if (columnsError) {
      // If the RPC function doesn't exist, create it first
      await supabaseAdmin.rpc("create_get_column_names_function")

      // Try again
      const { data: retryData, error: retryError } = await supabaseAdmin.rpc("get_column_names", {
        table_name: "profiles",
      })

      if (retryError) {
        console.error("Error getting column names:", retryError)

        // Fallback: just try to create the columns anyway
        await createColumns()
        return NextResponse.json({ success: true, message: "Attempted to create columns (fallback method)" })
      }

      if (!retryData.includes("phone_number")) {
        await createColumns()
      }
    } else {
      // Check if phone_number column exists
      if (!columnsData.includes("phone_number")) {
        await createColumns()
      } else {
        return NextResponse.json({ success: true, message: "Columns already exist" })
      }
    }

    return NextResponse.json({ success: true, message: "Phone columns created successfully" })
  } catch (error: any) {
    console.error("Error setting up phone columns:", error)
    return NextResponse.json({ error: error.message || "Failed to set up phone columns" }, { status: 500 })
  }
}

async function createColumns() {
  // Create the phone_number and phone_verified columns
  const { error } = await supabaseAdmin.rpc("add_phone_columns_to_profiles")

  if (error) {
    // If the RPC function doesn't exist, create it and try again
    await supabaseAdmin.rpc("create_add_phone_columns_function")
    await supabaseAdmin.rpc("add_phone_columns_to_profiles")
  }
}
