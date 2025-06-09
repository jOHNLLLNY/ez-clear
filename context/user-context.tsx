"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { supabase } from "@/lib/supabase"

type UserType = "worker" | "hirer" | null

interface UserProfile {
  name: string
  email: string
  businessName?: string
  city: string
  province: string
  description?: string
  skills?: string[]
  profileImage?: string
  phone?: string
  dateOfBirth?: string
  emergencyContact?: string
  education?: string
  languages?: string[]
  certifications?: string[]
}

// Змінимо інтерфейс UserContextType, щоб включити userId
interface UserContextType {
  userType: UserType
  setUserType: (type: UserType) => void
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile) => void
  updateUserProfile: (data: Partial<UserProfile>) => void
  isAuthenticated: boolean
  userId: string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available
  const [userType, setUserType] = useState<UserType>(() => {
    if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("userType") as UserType
      return savedType || null
    }
    return null
  })

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Update profile with partial data
  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      if (!prev) return data as UserProfile
      return { ...prev, ...data }
    })
  }

  // Check authentication status and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setIsAuthenticated(true)
          setUserId(session.user.id)
          localStorage.setItem("currentUserId", session.user.id)

          // Fetch user profile
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileData && !error) {
            setUserProfile({
              name: profileData.name || "",
              email: profileData.email || "",
              city: profileData.city || "",
              province: profileData.province || "",
              businessName: profileData.business_name,
              description: profileData.description,
              skills: profileData.skills,
              profileImage: profileData.profile_image,
              phone: profileData.phone_number,
              dateOfBirth: profileData.date_of_birth,
              emergencyContact: profileData.emergency_contact,
              education: profileData.education,
              languages: profileData.languages,
              certifications: profileData.certifications,
            })

            // Set user type
            if (profileData.user_type) {
              setUserType(profileData.user_type as UserType)
              localStorage.setItem("userType", profileData.user_type)
            }
          }
        } else {
          // Check if we have a user ID in localStorage (for demo purposes)
          const storedUserId = localStorage.getItem("currentUserId")

          if (storedUserId) {
            setUserId(storedUserId)

            // Fetch user profile
            const { data: profileData, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", storedUserId)
              .single()

            if (profileData && !error) {
              setUserProfile({
                name: profileData.name || "",
                email: profileData.email || "",
                city: profileData.city || "",
                province: profileData.province || "",
                businessName: profileData.business_name,
                description: profileData.description,
                skills: profileData.skills,
                profileImage: profileData.profile_image,
                phone: profileData.phone_number,
                dateOfBirth: profileData.date_of_birth,
                emergencyContact: profileData.emergency_contact,
                education: profileData.education,
                languages: profileData.languages,
                certifications: profileData.certifications,
              })

              // Set user type
              if (profileData.user_type) {
                setUserType(profileData.user_type as UserType)
                localStorage.setItem("userType", profileData.user_type)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true)
        setUserId(session.user.id)
        localStorage.setItem("currentUserId", session.user.id)

        // Fetch user profile
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileData && !error) {
          setUserProfile({
            name: profileData.name || "",
            email: profileData.email || "",
            city: profileData.city || "",
            province: profileData.province || "",
            businessName: profileData.business_name,
            description: profileData.description,
            skills: profileData.skills,
            profileImage: profileData.profile_image,
            phone: profileData.phone_number,
            dateOfBirth: profileData.date_of_birth,
            emergencyContact: profileData.emergency_contact,
            education: profileData.education,
            languages: profileData.languages,
            certifications: profileData.certifications,
          })

          // Set user type
          if (profileData.user_type) {
            setUserType(profileData.user_type as UserType)
            localStorage.setItem("userType", profileData.user_type)
          }
        }
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false)
        setUserId(null)
        setUserProfile(null)
        localStorage.removeItem("currentUserId")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Update localStorage when userType changes
  useEffect(() => {
    if (userType) {
      localStorage.setItem("userType", userType)
    }
  }, [userType])

  // Update user profile in database when it changes
  useEffect(() => {
    const updateProfileInDb = async () => {
      if (userProfile && userId) {
        try {
          await supabase
            .from("profiles")
            .update({
              name: userProfile.name,
              email: userProfile.email,
              city: userProfile.city,
              province: userProfile.province,
              business_name: userProfile.businessName,
              description: userProfile.description,
              skills: userProfile.skills,
              profile_image: userProfile.profileImage,
              phone_number: userProfile.phone,
              date_of_birth: userProfile.dateOfBirth,
              emergency_contact: userProfile.emergencyContact,
              education: userProfile.education,
              languages: userProfile.languages,
              certifications: userProfile.certifications,
              user_type: userType,
            })
            .eq("id", userId)
        } catch (error) {
          console.error("Error updating profile in database:", error)
        }
      }
    }

    updateProfileInDb()
  }, [userProfile, userId, userType])

  // Додамо userId до значення контексту
  const value = {
    userType,
    setUserType,
    userProfile,
    setUserProfile,
    updateUserProfile,
    isAuthenticated,
    userId,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
