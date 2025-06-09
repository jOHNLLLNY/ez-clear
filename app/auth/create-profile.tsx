"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Camera, User } from "lucide-react"
import Link from "next/link"
import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"

export default function CreateProfile() {
  const router = useRouter()
  const { userProfile, updateUserProfile } = useUser()

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    city: "",
    province: "",
  })

  // Pre-fill form if user profile exists
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        businessName: userProfile.businessName || "",
        city: userProfile.city || "",
        province: userProfile.province || "",
      })

      if (userProfile.profileImage) {
        setProfileImage(userProfile.profileImage)
      }
    }
  }, [userProfile])

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
        const result = e.target?.result as string
        setProfileImage(result)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Save profile data
    updateUserProfile({
      ...formData,
      profileImage: profileImage || undefined,
    })

    // Redirect to profile details
    router.push("/auth/profile-details")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <header className="p-4 flex items-center">
        <Link href="/auth/create-account" className="p-2">
          <ArrowLeft className="h-5 w-5" />
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
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#5B2EFF]">
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-[#5B2EFF]/10 flex items-center justify-center border-2 border-dashed border-[#5B2EFF]/50">
                    <User className="h-12 w-12 text-[#5B2EFF]/50" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#5B2EFF] flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Your Business LLC"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="Your City"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select value={formData.province} onValueChange={handleProvinceChange} required>
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
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

            <Button type="submit" className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90 mt-6">
              Save & Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
