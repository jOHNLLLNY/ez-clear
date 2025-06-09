import { supabase } from "./supabase"

// Social login providers
export type Provider = "google" | "apple" | "facebook"

// Function to handle social login
export async function signInWithProvider(provider: Provider) {
  try {
    // Get the current URL for the redirect
    const redirectTo = `${window.location.origin}/auth/callback`

    // Start the OAuth flow with the selected provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // You can add additional scopes if needed
        scopes: provider === "google" ? "email profile" : undefined,
      },
    })

    if (error) throw error

    // The user will be redirected to the provider's login page
    return { success: true, data }
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error)
    return { success: false, error }
  }
}
