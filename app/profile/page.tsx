"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  LogOut,
  HelpCircle,
  Star,
  BarChart,
  Shield,
  ImageIcon,
  Gift,
  FileText,
  User,
  ChevronRight,
  Edit,
  Settings,
} from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { useUser } from "@/context/user-context"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

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

export default function Profile() {
  const { userType, userProfile, userId } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completedJobs: 0,
    rating: 0,
    reviews: 0,
    memberSince: "",
  })
  const router = useRouter()

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // Fetch completed jobs count
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "completed")

        if (jobsError) {
          console.error("Error fetching completed jobs:", jobsError)
        }

        // Check if reviews table exists before querying it
        let ratingsData = []
        let totalRatings = 0
        let avgRating = 0

        try {
          // Try to fetch user ratings
          const { data, error } = await supabase.from("reviews").select("rating").eq("recipient_id", userId)

          if (!error) {
            ratingsData = data || []
            totalRatings = ratingsData.length

            // Calculate average rating
            if (totalRatings > 0) {
              const sum = ratingsData.reduce((acc, item) => acc + item.rating, 0)
              avgRating = sum / totalRatings
            }
          } else if (error.code === "42P01") {
            // Table doesn't exist error - just use default values
            console.log("Reviews table doesn't exist yet, using default values")
          } else {
            console.error("Error fetching ratings:", error)
          }
        } catch (ratingError) {
          console.error("Error in ratings fetch:", ratingError)
        }

        // Fetch user creation date
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", userId)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
        }

        // Format member since date
        const memberSince = userData?.created_at
          ? new Date(userData.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : "January 2023" // Fallback

        setStats({
          completedJobs: jobsData?.length || 0,
          rating: avgRating,
          reviews: totalRatings,
          memberSince,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
        // Set fallback data
        setStats({
          completedJobs: 0,
          rating: 0,
          reviews: 0,
          memberSince: "January 2023",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [userId])

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!userProfile?.name) return "U"
    return userProfile.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Get formatted location
  const getLocation = () => {
    if (!userProfile) return ""
    const city = userProfile.city || ""
    const province = userProfile.province ? provinceNames[userProfile.province] || userProfile.province : ""

    if (city && province) return `${city}, ${province}`
    return city || province
  }

  if (loading) {
    return (
      <div className="app-container">
        <header className="page-header">
          <h1 className="page-title">My Profile</h1>
        </header>
        <div className="page-content">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-200"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (!userProfile && !loading) {
    return (
      <div className="app-container">
        <header className="page-header">
          <h1 className="page-title">My Profile</h1>
        </header>
        <div className="page-content flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Unable to load profile data</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">My Profile</h1>
        <Link href="/profile/edit" className="p-2">
          <Edit className="h-5 w-5 text-foreground" />
        </Link>
      </header>

      {/* Profile Card */}
      <div className="page-content space-y-6">
        <Card className="overflow-hidden rounded-2xl shadow-card border border-border">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 h-24 relative"></div>
          <CardContent className="pt-0 relative -mt-12 pb-5">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-background shadow-medium">
                {userProfile?.profileImage ? (
                  <AvatarImage src={userProfile.profileImage || "/placeholder.svg"} alt={userProfile.name || "User"} />
                ) : (
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                )}
                <AvatarFallback className="text-xl bg-muted text-foreground">{getInitials()}</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-xl mt-3">{userProfile?.name}</h2>
              <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
              {getLocation() && <p className="text-sm text-muted-foreground">{getLocation()}</p>}

              <Link href="/profile/edit" className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 transition-all duration-200 shadow-button"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card - Only show for worker users */}
        {userType === "worker" && (
          <Card className="overflow-hidden rounded-2xl shadow-card border border-border">
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <p className="font-semibold text-lg">{stats.reviews > 0 ? stats.rating.toFixed(1) : "New"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.reviews} reviews</p>
                </div>

                <div className="space-y-1 border-x border-border">
                  <p className="font-semibold text-lg">{stats.completedJobs}</p>
                  <p className="text-xs text-muted-foreground">completed jobs</p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold text-lg">{stats.memberSince.split(" ")[0]}</p>
                  <p className="text-xs text-muted-foreground">{stats.memberSince.split(" ")[1]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Options */}
        <div className="space-y-4">
          <h3 className="section-title">Account</h3>
          <Card className="overflow-hidden rounded-2xl shadow-card border border-border">
            <CardContent className="p-0">
              <Link href="/profile/details" className="flex items-center justify-between p-4 hover:bg-muted">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center mr-3 shadow-soft">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Profile Details</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Separator className="bg-border" />

              {userType === "worker" && (
                <>
                  <Link href="/analytics" className="flex items-center justify-between p-4 hover:bg-muted">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-blue-900/30 flex items-center justify-center mr-3 shadow-soft">
                        <BarChart className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="font-medium">Analytics</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>

                  <Separator className="bg-border" />

                  <Link href="/verification" className="flex items-center justify-between p-4 hover:bg-muted">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-green-900/30 flex items-center justify-center mr-3 shadow-soft">
                        <Shield className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="font-medium">Verification</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {userType === "worker" && (
            <>
              <h3 className="section-title">Business</h3>
              <Card className="overflow-hidden rounded-2xl shadow-card border border-border">
                <CardContent className="p-0">
                  <Link href="/invoices" className="flex items-center justify-between p-4 hover:bg-muted">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-indigo-900/30 flex items-center justify-center mr-3 shadow-soft">
                        <FileText className="h-5 w-5 text-indigo-400" />
                      </div>
                      <span className="font-medium">Invoice Generator</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>

                  <Separator className="bg-border" />

                  <Link href="/profile/portfolio" className="flex items-center justify-between p-4 hover:bg-muted">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-amber-900/30 flex items-center justify-center mr-3 shadow-soft">
                        <ImageIcon className="h-5 w-5 text-amber-400" />
                      </div>
                      <span className="font-medium">Portfolio</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>

                  <Separator className="bg-border" />

                  <Link href="/reviews" className="flex items-center justify-between p-4 hover:bg-muted">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-yellow-900/30 flex items-center justify-center mr-3 shadow-soft">
                        <Star className="h-5 w-5 text-yellow-400" />
                      </div>
                      <span className="font-medium">Reviews & Ratings</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>

                  <Separator className="bg-border" />

                  <Link href="/loyalty" className="flex items-center justify-between p-4 hover:bg-muted">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-purple-900/30 flex items-center justify-center mr-3 shadow-soft">
                        <Gift className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="font-medium">Loyalty Program</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            </>
          )}

          <h3 className="section-title">General</h3>
          <Card className="overflow-hidden rounded-2xl shadow-card border border-border">
            <CardContent className="p-0">
              <Link href="/calendar" className="flex items-center justify-between p-4 hover:bg-muted">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-teal-900/30 flex items-center justify-center mr-3 shadow-soft">
                    <Calendar className="h-5 w-5 text-teal-400" />
                  </div>
                  <span className="font-medium">Calendar</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Separator className="bg-border" />

              <Link href="/help" className="flex items-center justify-between p-4 hover:bg-muted">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-blue-900/30 flex items-center justify-center mr-3 shadow-soft">
                    <HelpCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="font-medium">Help & Support</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Separator className="bg-border" />

              <Link href="/settings" className="flex items-center justify-between p-4 hover:bg-muted">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mr-3 shadow-soft">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium">Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full border-red-900/30 text-red-400 hover:bg-red-900/10 mt-4 rounded-xl transition-all duration-200 shadow-button"
            onClick={() => {
              // Clear user data
              localStorage.removeItem("userType")
              localStorage.removeItem("userProfile")
              // Redirect to onboarding
              window.location.href = "/onboarding"
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>

          <div className="text-center text-xs text-muted-foreground mt-6 pb-6">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2023 EZ Clear. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
