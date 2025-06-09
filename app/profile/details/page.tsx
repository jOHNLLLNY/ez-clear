"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Shield,
  GraduationCap,
  Languages,
  ImageIcon,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useUser } from "@/context/user-context"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function ProfileDetails() {
  const { userType, userProfile, userId } = useUser()
  const [loading, setLoading] = useState(true)
  const [portfolioItems, setPortfolioItems] = useState([])
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    businessName: "",
    description: "",
    skills: [],
    dateOfBirth: "",
    emergencyContact: "",
    education: "",
    languages: [],
    certifications: [],
    profileImage: "",
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return

      try {
        // Fetch profile data from database
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (data && !error) {
          setProfileData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "+1 (555) 123-4567", // Fallback
            address: data.address || "123 Main Street", // Fallback
            city: data.city || "",
            province: data.province || "",
            postalCode: data.postal_code || "",
            businessName: data.business_name || "",
            description: data.description || "",
            skills: data.skills || [],
            dateOfBirth: data.date_of_birth || "",
            emergencyContact: data.emergency_contact || "",
            education: data.education || "",
            languages: data.languages || [],
            certifications: data.certifications || [],
            profileImage: data.profile_image || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [userId])

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      if (!userId) return

      setPortfolioLoading(true)
      try {
        // Fetch real portfolio items from the database
        const { data, error } = await supabase
          .from("portfolio")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(3)

        if (!error && data && data.length > 0) {
          setPortfolioItems(data)
        } else {
          // If no portfolio items exist or there's an error, use empty array
          setPortfolioItems([])
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error)
        setPortfolioItems([])
      } finally {
        setPortfolioLoading(false)
      }
    }

    fetchPortfolioItems()
  }, [userId])

  // Format skills for display
  const getFormattedSkills = () => {
    if (!profileData.skills || profileData.skills.length === 0) return []

    return profileData.skills.map((skillId) => {
      // Convert skill-id format to readable text
      const readableSkill = skillId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      return readableSkill
    })
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Map of province codes to names
  const provinceNames = {
    ab: "Alberta",
    bc: "British Columbia",
    mb: "Manitoba",
    nb: "New Brunswick",
    nl: "Newfoundland and Labrador",
    ns: "Nova Scotia",
    on: "Ontario",
    pe: "Prince Edward Island",
    qc: "Quebec",
    sk: "Saskatchewan",
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="p-4 bg-card border-b border-border flex items-center">
          <Link href="/profile" className="mr-3">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Profile Details</h1>
        </header>
        <main className="flex-1 p-4 space-y-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 bg-card border-b border-border flex items-center">
        <Link href="/profile" className="mr-3">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-xl font-bold">Profile Details</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Profile Image */}
        <div className="flex justify-center mb-2">
          {profileData.profileImage ? (
            <img
              src={profileData.profileImage || "/placeholder.svg"}
              alt={profileData.name}
              className="h-28 w-28 rounded-full object-cover border-4 border-card shadow-md"
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-card shadow-md">
              <User className="h-14 w-14 text-primary" />
            </div>
          )}
        </div>

        {/* Name and Business Name */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{profileData.name}</h2>
          {profileData.businessName && <p className="text-muted-foreground font-medium">{profileData.businessName}</p>}
        </div>

        {/* Personal Information */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Personal Information</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{profileData.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{profileData.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData.city}, {provinceNames[profileData.province] || profileData.province}{" "}
                    {profileData.postalCode}
                  </p>
                </div>
              </div>

              {profileData.dateOfBirth && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">{profileData.dateOfBirth}</p>
                  </div>
                </div>
              )}

              {profileData.emergencyContact && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Emergency Contact</p>
                    <p className="text-sm text-muted-foreground">{profileData.emergencyContact}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Professional Information</h3>

            <div className="space-y-4">
              {profileData.businessName && (
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Business Name</p>
                    <p className="text-sm text-muted-foreground">{profileData.businessName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <FileText className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData.description || "No description provided."}
                  </p>
                </div>
              </div>

              {profileData.education && (
                <div className="flex items-start">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Education</p>
                    <p className="text-sm text-muted-foreground">{profileData.education}</p>
                  </div>
                </div>
              )}

              {profileData.languages && profileData.languages.length > 0 && (
                <div className="flex items-start">
                  <Languages className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Languages</p>
                    <p className="text-sm text-muted-foreground">{profileData.languages.join(", ")}</p>
                  </div>
                </div>
              )}

              {profileData.certifications && profileData.certifications.length > 0 && (
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Certifications</p>
                    <p className="text-sm text-muted-foreground">{profileData.certifications.join(", ")}</p>
                  </div>
                </div>
              )}

              {getFormattedSkills().length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Skills & Services</p>
                  <div className="flex flex-wrap gap-2">
                    {getFormattedSkills().map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section - Only for Workers */}
        {userType === "worker" && (
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Portfolio</h3>
                <Link href="/profile/portfolio" className="text-sm text-primary font-medium">
                  View All
                </Link>
              </div>

              {portfolioLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg overflow-hidden bg-card/60">
                      <img
                        src={item.image_url || "/placeholder.svg?height=200&width=200"}
                        alt="Portfolio item"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p>No portfolio items yet</p>
                  <Link href="/profile/portfolio">
                    <Button variant="link" className="text-primary mt-2">
                      Add your first portfolio item
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
