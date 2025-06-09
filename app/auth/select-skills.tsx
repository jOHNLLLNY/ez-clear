"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"

const availableSkills = [
  { id: "snow-removal", label: "Snow Removal" },
  { id: "lawn-care", label: "Lawn Care" },
  { id: "landscaping", label: "Landscaping" },
  { id: "gardening", label: "Gardening" },
  { id: "tree-service", label: "Tree Service" },
  { id: "pressure-washing", label: "Pressure Washing" },
  { id: "gutter-cleaning", label: "Gutter Cleaning" },
  { id: "fence-installation", label: "Fence Installation" },
  { id: "deck-building", label: "Deck Building" },
  { id: "patio-installation", label: "Patio Installation" },
  { id: "irrigation", label: "Irrigation Systems" },
  { id: "leaf-removal", label: "Leaf Removal" },
]

export default function SelectSkills() {
  const router = useRouter()
  const { userProfile, updateUserProfile } = useUser()
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Pre-fill skills if they exist
  useEffect(() => {
    if (userProfile?.skills && userProfile.skills.length > 0) {
      setSelectedSkills(userProfile.skills)
    }
  }, [userProfile])

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => (prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Save selected skills to profile
    updateUserProfile({ skills: selectedSkills })

    // Redirect to home page based on user type
    const userType = localStorage.getItem("userType")
    router.push(userType === "worker" ? "/home/worker" : "/home/hirer")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <header className="p-4 flex items-center">
        <Link href="/auth/profile-details" className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Select Your Skills</h1>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">What services do you offer?</h2>
            <p className="text-sm text-muted-foreground">Select all that apply. You can update these later.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSkills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill.id}
                    checked={selectedSkills.includes(skill.id)}
                    onCheckedChange={() => toggleSkill(skill.id)}
                  />
                  <Label
                    htmlFor={skill.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {skill.label}
                  </Label>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90 mt-6"
              disabled={selectedSkills.length === 0}
            >
              Complete Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
