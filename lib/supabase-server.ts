import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Make sure we're using the correct environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Server-side Supabase client creation function
export function createServerClient() {
  // Check if environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in server context")
    throw new Error(
      "Missing Supabase environment variables in server context. Please configure them in your Vercel project settings.",
    )
  }

  const cookieStore = cookies()
  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })
}
