import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Check if the phone number exists in the profiles table
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("phone_number", phoneNumber)
      .maybeSingle()

    if (error) {
      console.error("Error checking phone number:", error)
      return NextResponse.json({ error: "Failed to check phone number" }, { status: 500 })
    }

    return NextResponse.json({
      exists: !!data,
      email: data?.email || null,
    })
  } catch (error: any) {
    console.error("Error in check-phone-exists:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
