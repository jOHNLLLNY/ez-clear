"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Camera, User } from "lucide-react"
import Link from "next/link"

export default function CreateProfile() {
  const [profileImage, setProfileImage] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    city: "",
    province: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProvinceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      province: value,
    }))
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Profile data:", formData)

    // Get the user type from context
    const userType = localStorage.getItem("userType") || "worker"

    // Redirect based on user type
    if (userType === "worker") {
      // Workers need to complete the profile details
      window.location.href = "/auth/profile-details"
    } else {
      // Hirers skip profile details and go straight to home
      window.location.href = "/home/hirer"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#141625] text-white">
      <header className="p-4 flex items-center border-b border-[#252945]">
        <Link
          href="/auth/create-account"
          className="p-2 rounded-full hover:bg-[#252945] transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Create Your Profile</h1>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <input type="file" id="profile-image" className="hidden" accept="image/*" onChange={handleImageChange} />
              <label htmlFor="profile-image" className="cursor-pointer block">
                {profileImage ? (
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#7C5DFA]">
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-[#252945] flex items-center justify-center border-2 border-dashed border-[#7C5DFA]/50">
                    <User className="h-12 w-12 text-[#7C5DFA]/50" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#7C5DFA] flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Your Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-[#1E2139] border-[#252945] text-white placeholder:text-gray-400 focus:border-[#7C5DFA] focus:ring-[#7C5DFA]/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-white">
                Business Name (Optional)
              </Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Your Business LLC"
                value={formData.businessName}
                onChange={handleChange}
                className="bg-[#1E2139] border-[#252945] text-white placeholder:text-gray-400 focus:border-[#7C5DFA] focus:ring-[#7C5DFA]/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-white">
                City
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="Your City"
                value={formData.city}
                onChange={handleChange}
                required
                className="bg-[#1E2139] border-[#252945] text-white placeholder:text-gray-400 focus:border-[#7C5DFA] focus:ring-[#7C5DFA]/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province" className="text-white">
                Province
              </Label>
              <Select value={formData.province} onValueChange={handleProvinceChange} required>
                <SelectTrigger
                  id="province"
                  className="bg-[#1E2139] border-[#252945] text-white focus:ring-[#7C5DFA]/10"
                >
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E2139] border-[#252945] text-white">
                  <SelectItem value="ab">Alberta</SelectItem>
                  <SelectItem value="bc">British Columbia</SelectItem>
                  <SelectItem value="mb">Manitoba</SelectItem>
                  <SelectItem value="nb">New Brunswick</SelectItem>
                  <SelectItem value="nl">Newfoundland and Labrador</SelectItem>
                  <SelectItem value="ns">Nova Scotia</SelectItem>
                  <SelectItem value="on">Ontario</SelectItem>
                  <SelectItem value="pe">Prince Edward Island</SelectItem>
                  <SelectItem value="qc">Quebec</SelectItem>
                  <SelectItem value="sk">Saskatchewan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7C5DFA] to-[#9277FF] hover:from-[#9277FF] hover:to-[#7C5DFA] mt-6"
            >
              Save & Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
