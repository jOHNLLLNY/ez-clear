import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Parse the form data
    const formData = await request.formData()
    const avatarFile = formData.get("avatar") as File

    if (!avatarFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get file extension and create a unique filename
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // Convert file to arrayBuffer for Supabase storage
    const arrayBuffer = await avatarFile.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, buffer, {
      contentType: avatarFile.type,
      upsert: true,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName)
    const avatarUrl = publicUrlData.publicUrl

    // Update the user profile with the new avatar URL
    const { error: updateError } = await supabase.from("profiles").update({ profile_image: avatarUrl }).eq("id", userId)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatarUrl })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
}
