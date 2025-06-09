import { createClient } from "@supabase/supabase-js"

// Try to get Supabase URL and key from different sources
const getSupabaseCredentials = () => {
  // Check for environment variables
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If we're in the browser, also check localStorage and window
  if (typeof window !== "undefined") {
    // Check localStorage
    if (!supabaseUrl) {
      supabaseUrl = localStorage.getItem("NEXT_PUBLIC_SUPABASE_URL") || undefined
    }
    if (!supabaseAnonKey) {
      supabaseAnonKey = localStorage.getItem("NEXT_PUBLIC_SUPABASE_ANON_KEY") || undefined
    }

    // Check window (might have been set by env-config page)
    if (!supabaseUrl && (window as any).NEXT_PUBLIC_SUPABASE_URL) {
      supabaseUrl = (window as any).NEXT_PUBLIC_SUPABASE_URL
    }
    if (!supabaseAnonKey && (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      supabaseAnonKey = (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Client-side Supabase client creation function
export function createClientSide() {
  // Only create the client on the client side
  if (typeof window === "undefined") {
    console.warn("Attempted to create Supabase client during server-side rendering. This is not supported.")
    // Return a mock client that will throw clear errors if used
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error("Not available during SSR") }),
        onAuthStateChange: () => ({ data: null, error: null, subscription: { unsubscribe: () => {} } }),
      },
      from: () => ({
        select: () => ({ error: new Error("Not available during SSR") }),
      }),
      // Add other commonly used methods with appropriate error messages
    } as any
  }

  // Get credentials from various sources
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials()

  // Check if environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")

    // If we're in the browser, redirect to the env-config page
    if (typeof window !== "undefined" && !window.location.pathname.includes("/env-config")) {
      window.location.href = "/env-config"
    }

    throw new Error("Missing Supabase environment variables. Please configure them at /env-config")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// For backward compatibility - create a client if we're in the browser
const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials()

// Create the client only if we're in the browser and have credentials
export const supabase =
  typeof window !== "undefined" && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any)

// Re-export createClient as a named export
export { createClient }
