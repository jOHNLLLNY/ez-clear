import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    // Validate input
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone number and verification code are required" }, { status: 400 })
    }

    console.log(`Attempting to verify code for phone: ${phone}, code: ${code}`)

    // For testing purposes, allow a special test code
    if (process.env.NODE_ENV === "development" && code === "123456") {
      console.log("Using test verification code")

      // Skip updating the verification status in the database for test code
      return NextResponse.json({
        success: true,
        message: "Phone verified successfully with test code",
      })
    }

    // Verify OTP via Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    })

    if (error) {
      console.error("Error verifying code:", error)

      // Check if this is a development environment and provide more helpful error
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            error: `Verification failed: ${error.message}. In development, you can use code "123456" for testing.`,
          },
          { status: 400 },
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // We successfully verified the phone number
    // Note: We're skipping the profile update since the column doesn't exist
    // If you need to store the phone number, you'll need to create this column first

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully",
      user: data?.user,
    })
  } catch (error: any) {
    console.error("Unexpected error in code verification:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
