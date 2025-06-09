import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email, password, phoneNumber, phoneVerified } = await request.json()

    console.log("Registration request received:", { email, phoneNumber, phoneVerified })

    // Validate request
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Create user in Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    console.log("User created successfully:", userData.user.id)

    // Prepare profile data
    const profileData: any = {
      id: userData.user.id,
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add phone data if available
    if (phoneNumber) {
      // First, ensure the phone columns exist
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/setup-profile-phone-columns`)

      // Then add the phone data
      profileData.phone_number = phoneNumber
      profileData.phone_verified = phoneVerified || false
    }

    // Create profile in profiles table
    const { data: profileCreationData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([profileData])
      .select()

    if (profileError) {
      console.error("Error creating profile:", profileError)

      // Try to delete the user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)

      return NextResponse.json({ error: `Error creating profile: ${profileError.message}` }, { status: 500 })
    }

    console.log("Profile created successfully")

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: userData.user,
    })
  } catch (error: any) {
    console.error("Error in registration:", error)
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
