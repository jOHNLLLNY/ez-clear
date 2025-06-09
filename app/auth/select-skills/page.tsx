"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

// Organized skills by category
const skillCategories = [
  {
    category: "Renovation",
    icon: "🧱",
    skills: [
      { id: "drywall-installation", label: "Drywall Installation" },
      { id: "insulation", label: "Insulation" },
      { id: "plastering", label: "Plastering" },
      { id: "painting", label: "Painting" },
      { id: "flooring", label: "Flooring" },
      { id: "tiling", label: "Tiling" },
      { id: "demolition", label: "Demolition" },
      { id: "kitchen-renovation", label: "Kitchen Renovation" },
      { id: "bathroom-renovation", label: "Bathroom Renovation" },
      { id: "basement-finishing", label: "Basement Finishing" },
    ],
  },
  {
    category: "Outdoor Services",
    icon: "🌿",
    skills: [
      { id: "snow-removal", label: "Snow Removal" },
      { id: "lawn-mowing", label: "Lawn Mowing" },
      { id: "leaf-cleanup", label: "Leaf Cleanup" },
      { id: "gutter-cleaning", label: "Gutter Cleaning" },
      { id: "fence-repair", label: "Fence Repair" },
      { id: "power-washing", label: "Power Washing" },
    ],
  },
  {
    category: "Maintenance",
    icon: "🧰",
    skills: [
      { id: "general-handyman", label: "General Handyman" },
      { id: "appliance-installation", label: "Appliance Installation" },
      { id: "filter-change", label: "AC/Furnace Filter Change" },
      { id: "minor-fixes", label: "Minor Fixes" },
      { id: "seasonal-maintenance", label: "Seasonal Maintenance" },
    ],
  },
]

// Flatten all skills for search functionality
const allSkills = skillCategories.flatMap((category) => category.skills)

export default function SelectSkills() {
  const router = useRouter()
  const { userProfile, updateUserProfile } = useUser()
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSkills, setFilteredSkills] = useState(allSkills)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Renovation"])

  // Pre-fill skills if they exist
  useEffect(() => {
    if (userProfile?.skills && userProfile.skills.length > 0) {
      setSelectedSkills(userProfile.skills)
    }
  }, [userProfile])

  // Filter skills based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = allSkills.filter((skill) => skill.label.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredSkills(filtered)
    } else {
      setFilteredSkills(allSkills)
    }
  }, [searchQuery])

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => (prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Save selected skills to profile
    updateUserProfile({ skills: selectedSkills })

    // Redirect to home page based on user type
    const userType = typeof window !== "undefined" ? localStorage.getItem("userType") : null
    router.push(userType === "worker" ? "/home/worker" : "/home/hirer")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#141625] text-white">
      <header className="p-4 flex items-center border-b border-[#252945]">
        <Link
          href="/auth/profile-details"
          className="p-2 rounded-full hover:bg-[#252945] transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Select Your Skills</h1>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">What services do you offer?</h2>
            <p className="text-sm text-gray-400">Select all that apply. You can update these later.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search skills"
              className="pl-10 bg-[#1E2139] border-[#252945] text-white placeholder:text-gray-400 focus:border-[#7C5DFA] focus:ring-[#7C5DFA]/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {searchQuery ? (
              // Show search results
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center space-x-2 p-3 border border-[#252945] rounded-lg bg-[#1E2139]"
                    >
                      <Checkbox
                        id={skill.id}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={() => toggleSkill(skill.id)}
                        className="h-5 w-5 border-2 border-[#7C5DFA] data-[state=checked]:bg-[#7C5DFA] data-[state=checked]:text-white"
                      />
                      <Label
                        htmlFor={skill.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 text-white"
                      >
                        {skill.label}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4">No skills found matching "{searchQuery}"</p>
                )}
              </div>
            ) : (
              // Show categorized skills with accordion
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {skillCategories.map((category) => (
                  <Card key={category.category} className="border border-[#252945] bg-[#1E2139] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.category)}
                      className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <h3 className="font-medium text-white">{category.category}</h3>
                      </div>
                      {expandedCategories.includes(category.category) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {expandedCategories.includes(category.category) && (
                      <CardContent className="pt-0 pb-3 px-3">
                        <div className="space-y-2">
                          {category.skills.map((skill) => (
                            <div
                              key={skill.id}
                              className="flex items-center space-x-2 p-3 border border-[#252945] rounded-lg bg-[#141625]"
                            >
                              <Checkbox
                                id={skill.id}
                                checked={selectedSkills.includes(skill.id)}
                                onCheckedChange={() => toggleSkill(skill.id)}
                                className="h-5 w-5 border-2 border-[#7C5DFA] data-[state=checked]:bg-[#7C5DFA] data-[state=checked]:text-white"
                              />
                              <Label
                                htmlFor={skill.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 text-white"
                              >
                                {skill.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            <div className="sticky bottom-0 bg-[#141625] pt-2">
              <div className="text-center mb-2 text-white">Selected Skills: {selectedSkills.length}</div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7C5DFA] to-[#9277FF] hover:from-[#9277FF] hover:to-[#7C5DFA]"
                disabled={selectedSkills.length === 0}
              >
                Complete Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
