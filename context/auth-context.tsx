"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/lib/database"
import type { ReactNode } from "react"
import type { Profile } from "@/types"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  signUp: (email: string, password: string, userType: "worker" | "hirer") => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Update the AuthProvider component to include better error handling
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return

    const checkAuth = async () => {
      try {
        setLoading(true)

        // Get session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session?.user) {
          setUser(session.user)
          setSession(session)

          // Fetch profile with timeout handling - removed avatar_url from selection
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, email, name, user_type, created_at, is_online")
            .eq("id", session.user.id)
            .abortSignal(AbortSignal.timeout(10000)) // 10 second timeout
            .single()

          // Retry once if we get a timeout error
          if (profileError && (profileError.message.includes("timeout") || profileError.code === "57014")) {
            console.log("Retrying profile fetch after timeout...")
            const { data: retryData, error: retryError } = await supabase
              .from("profiles")
              .select("id, email, name, user_type, created_at, is_online")
              .eq("id", session.user.id)
              .abortSignal(AbortSignal.timeout(15000)) // Longer timeout for retry
              .single()

            if (!retryError) {
              if (retryData) {
                setProfile(retryData)
              }
            } else {
              console.error("Retry profile fetch error:", retryError)
            }
          }

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error fetching profile:", profileError)
            // Don't throw here, just log the error
          } else if (profileError && profileError.code === "PGRST116") {
            console.log("No profile found for user:", session.user.id)

            // Create a profile for the social login user if it doesn't exist
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
                user_type: "worker", // Default to worker
                created_at: new Date().toISOString(),
                is_online: true,
              })
              .select()

            if (insertError) {
              // If we get a duplicate key error, try to fetch the existing profile
              if (insertError.code === "23505") {
                console.log("Profile already exists during initial check, fetching...")
                const { data: existingProfile, error: fetchError } = await supabase
                  .from("profiles")
                  .select("id, email, name, user_type, created_at, is_online")
                  .eq("id", session.user.id)
                  .single()

                if (!fetchError && existingProfile) {
                  setProfile(existingProfile)
                }
              } else {
                console.error("Error creating profile for social user:", insertError)
              }
            } else if (newProfile) {
              setProfile(newProfile[0])
            }
          }
        } else {
          // For demo purposes, check if we have a mock user ID
          const mockUserId = localStorage.getItem("mockUserId")

          if (mockUserId && process.env.USE_MOCK_DATA === "true") {
            console.log("Using mock user:", mockUserId)

            // Create a mock user
            setUser({
              id: mockUserId,
              email: "mock@example.com",
            } as User)

            // Fetch profile for mock user
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", mockUserId)
              .single()

            if (profileError && profileError.code !== "PGRST116") {
              console.error("Error fetching mock profile:", profileError)
            }

            if (profileData) {
              setProfile(profileData)
            }
          } else {
            // No authenticated user
            setUser(null)
            setProfile(null)
            setSession(null)
          }
        }
      } catch (err: any) {
        console.error("Auth error:", err)
        setError(err.message)
        setUser(null)
        setProfile(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    // Initial check
    checkAuth()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setSession(session)

        // Fetch profile with timeout handling - removed avatar_url from selection
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, name, user_type, created_at, is_online")
          .eq("id", session.user.id)
          .abortSignal(AbortSignal.timeout(10000)) // 10 second timeout
          .single()

        // Retry once if we get a timeout error
        if (profileError && (profileError.message.includes("timeout") || profileError.code === "57014")) {
          console.log("Retrying profile fetch after timeout...")
          const { data: retryData, error: retryError } = await supabase
            .from("profiles")
            .select("id, email, name, user_type, created_at, is_online")
            .eq("id", session.user.id)
            .abortSignal(AbortSignal.timeout(15000)) // Longer timeout for retry
            .single()

          if (!retryError) {
            if (retryData) {
              setProfile(retryData)
            }
          } else {
            console.error("Retry profile fetch error:", retryError)
          }
        }

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile on sign in:", profileError)

          // Only try to create profile if it truly doesn't exist (PGRST116 = no rows returned)
          if (profileError.code === "PGRST116") {
            // Profile doesn't exist, create it
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
                user_type: localStorage.getItem("userType") || "worker",
                created_at: new Date().toISOString(),
                is_online: true,
              })
              .select()

            if (insertError) {
              // If we get a duplicate key error, try to fetch the existing profile
              if (insertError.code === "23505") {
                console.log("Profile already exists, fetching existing profile...")
                const { data: existingProfile, error: fetchError } = await supabase
                  .from("profiles")
                  .select("id, email, name, user_type, created_at, is_online")
                  .eq("id", session.user.id)
                  .single()

                if (!fetchError && existingProfile) {
                  setProfile(existingProfile)
                } else {
                  console.error("Error fetching existing profile:", fetchError)
                }
              } else {
                console.error("Error creating profile for social user:", insertError)
              }
            } else if (newProfile) {
              setProfile(newProfile[0])

              // If it's a new profile, redirect to profile details page
              if (typeof window !== "undefined") {
                window.location.href = "/auth/profile-details"
              }
            }
          } else {
            // There was a different error fetching the profile, try to fetch again
            console.log("Retrying profile fetch due to error:", profileError.code)
            const { data: retryProfile, error: retryError } = await supabase
              .from("profiles")
              .select("id, email, name, user_type, created_at, is_online")
              .eq("id", session.user.id)
              .single()

            if (!retryError && retryProfile) {
              setProfile(retryProfile)
            } else {
              console.error("Retry profile fetch failed:", retryError)
            }
          }
        }

        if (profileData) {
          setProfile(profileData)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setSession(null)
        router.push("/auth/sign-in")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signUp = async (email: string, password: string, userType: "worker" | "hirer") => {
    try {
      setLoading(true)
      setError(null)

      // Call the register API endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Sign in the user after successful registration
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (signInData.user) {
        setUser(signInData.user)
      }
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        throw error
      }
      if (data.user) {
        setUser(data.user)

        // Set user as online
        await supabase.from("profiles").update({ is_online: true }).eq("id", data.user.id)
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      // Set user as offline before signing out
      if (user) {
        await supabase.from("profiles").update({ is_online: false }).eq("id", user.id)
      }

      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      router.push("/auth/sign-in")
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add this to provide better context values
  const value = {
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
