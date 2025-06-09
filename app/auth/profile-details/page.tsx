"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/user-context"

export default function ProfileDetails() {
  const [description, setDescription] = useState("")
  const { userType } = useUser()
  const router = useRouter()

  // Redirect hirers to home page
  useEffect(() => {
    // Get user type from context or localStorage
    const currentUserType = userType || localStorage.getItem("userType")

    // If user is a hirer, redirect to hirer home
    if (currentUserType === "hirer") {
      router.push("/home/hirer")
    }
  }, [userType, router])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Profile description:", description)
    // Redirect to skills selection
    router.push("/auth/select-skills")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#141625] text-white">
      <header className="p-4 flex items-center border-b border-[#252945]">
        <Link
          href="/auth/create-profile"
          className="p-2 rounded-full hover:bg-[#252945] transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Profile Details</h1>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Tell us about yourself</h2>
            <p className="text-sm text-gray-400">This helps customers understand your experience and expertise</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Describe your main skills, strengths, and experience
              </Label>
              <Textarea
                id="description"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] bg-[#1E2139] border-[#252945] text-white placeholder:text-gray-400 focus:border-[#7C5DFA] focus:ring-[#7C5DFA]/10"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7C5DFA] to-[#9277FF] hover:from-[#9277FF] hover:to-[#7C5DFA] mt-6"
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
