"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"

export default function ProfileDetails() {
  const router = useRouter()
  const { userProfile, updateUserProfile } = useUser()
  const [description, setDescription] = useState("")

  // Pre-fill description if it exists
  useEffect(() => {
    if (userProfile?.description) {
      setDescription(userProfile.description)
    }
  }, [userProfile])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Save description to profile
    updateUserProfile({ description })

    // Redirect to skills selection
    router.push("/auth/select-skills")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <header className="p-4 flex items-center">
        <Link href="/auth/create-profile" className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Profile Details</h1>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Tell us about yourself</h2>
            <p className="text-sm text-muted-foreground">
              This helps customers understand your experience and expertise
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Describe your main skills, strengths, and experience</Label>
              <Textarea
                id="description"
                placeholder="I have 5 years of experience in snow removal and landscaping. I specialize in residential properties and pride myself on reliability and quality work..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px]"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90 mt-6">
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
