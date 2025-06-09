import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate phone number
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Validate phone format (basic validation)
    if (!phone.startsWith("+")) {
      return NextResponse.json(
        { error: "Phone number must be in international format (e.g., +1234567890)" },
        { status: 400 },
      )
    }

    // Send OTP via Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: "sms",
      },
    })

    if (error) {
      console.error("Error sending verification code:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    })
  } catch (error: any) {
    console.error("Unexpected error in phone verification:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
