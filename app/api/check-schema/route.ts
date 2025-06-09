import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Check profiles table structure
    const { data: profileColumns, error: profileError } = await supabaseAdmin
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "profiles")

    if (profileError) {
      return NextResponse.json(
        {
          error: "Error fetching profiles schema",
          details: profileError.message,
        },
        { status: 500 },
      )
    }

    // Check if phone_verification table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "phone_verification")

    if (tablesError) {
      return NextResponse.json(
        {
          error: "Error checking tables",
          details: tablesError.message,
        },
        { status: 500 },
      )
    }

    const phoneVerificationExists = tables && tables.length > 0

    // If phone_verification exists, get its structure
    let phoneVerificationColumns = []
    if (phoneVerificationExists) {
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from("information_schema.columns")
        .select("column_name, data_type")
        .eq("table_name", "phone_verification")

      if (!columnsError) {
        phoneVerificationColumns = columns
      }
    }

    return NextResponse.json({
      profiles: {
        columns: profileColumns,
      },
      phone_verification: {
        exists: phoneVerificationExists,
        columns: phoneVerificationColumns,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error checking schema",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
