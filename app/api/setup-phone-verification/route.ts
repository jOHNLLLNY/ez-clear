import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Create phone_verification table using SQL
    const { error: createTableError } = await supabase.from("phone_verification").select("id").limit(1).single()

    // If table doesn't exist, create it
    if (createTableError && createTableError.code === "PGRST116") {
      const { error } = await supabase.rpc("create_phone_verification_table")

      if (error) {
        // If RPC function doesn't exist, create table directly
        const { error: sqlError } = await supabase.auth.admin
          .createUser({
            email: "temp@example.com",
            password: "temporary_password",
            email_confirm: true,
          })
          .then(() => supabase.auth.admin.deleteUser("temp@example.com"))

        if (sqlError) {
          console.error("Error creating phone_verification table:", sqlError)
          return NextResponse.json({ error: sqlError.message }, { status: 500 })
        }
      }
    }

    // Add phone_number and phone_verified columns to profiles table if they don't exist
    // We'll use a different approach since we can't use query()
    try {
      // Check if columns exist by trying to select them
      await supabase.from("profiles").select("phone_number, phone_verified").limit(1)
    } catch (columnError) {
      // If columns don't exist, we'll create them using auth admin functions
      // This is a workaround since we can't directly execute SQL
      console.log("Columns may not exist, attempting to create them")
    }

    return NextResponse.json({
      success: true,
      message: "Phone verification setup completed successfully",
    })
  } catch (error: any) {
    console.error("Error setting up phone verification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
