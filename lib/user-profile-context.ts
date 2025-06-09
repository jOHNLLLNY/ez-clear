"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface UserProfileContextType {
  userProfile: { email: string } | null
  updateUserProfile: (profile: { email: string }) => void
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<{ email: string } | null>(null)

  const updateUserProfile = (profile: { email: string }) => {
    setUserProfile(profile)
  }

  return (
    <UserProfileContext.Provider value={{ userProfile, updateUserProfile }}>{children}</UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider")
  }
  return context
}
