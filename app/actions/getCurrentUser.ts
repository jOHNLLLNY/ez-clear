import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function getCurrentUser() {
  try {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return null
    }

    // Get the user profile from the profiles table
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (!profile) {
      return null
    }

    return {
      id: profile.id,
      email: session.user.email,
      name: profile.full_name,
      phone: profile.phone,
      accountType: profile.account_type,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      ...profile,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
