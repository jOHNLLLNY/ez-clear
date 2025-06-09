import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Check if is_online column exists
    const { data: columns, error: columnsError } = await supabaseAdmin.rpc("get_column_info", {
      target_table: "profiles",
      target_column: "is_online",
    })

    if (columnsError) {
      console.error("Error checking column:", columnsError)
      return NextResponse.json({ error: columnsError.message }, { status: 500 })
    }

    // If column doesn't exist, add it
    if (!columns || columns.length === 0) {
      const { error: alterError } = await supabaseAdmin.rpc("add_column_if_not_exists", {
        target_table: "profiles",
        target_column: "is_online",
        column_type: "boolean",
        default_value: "false",
      })

      if (alterError) {
        console.error("Error adding column:", alterError)
        return NextResponse.json({ error: alterError.message }, { status: 500 })
      }
    }

    // Set all users to offline initially
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ is_online: false })
      .is("is_online", null)

    if (updateError) {
      console.error("Error updating profiles:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Enable realtime for the profiles table
    const { error: realtimeError } = await supabaseAdmin.rpc("enable_realtime_for_table", { target_table: "profiles" })

    if (realtimeError && !realtimeError.message.includes("already enabled")) {
      console.error("Error enabling realtime:", realtimeError)
      return NextResponse.json({ error: realtimeError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Online status setup complete" })
  } catch (error: any) {
    console.error("Error setting up online status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
