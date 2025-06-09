"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Phone, Mail, MessageSquare, Shield, ArrowLeft, CheckCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import BottomNavigation from "@/components/bottom-navigation"

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

interface Contractor {
  id: string
  name: string
  email: string
  profile_image?: string
  business_name?: string
  city?: string
  province?: string
  description?: string
  skills?: string[]
  rating?: number
  reviews?: number
  is_verified?: boolean
  is_online: boolean
  phone?: string
  portfolio_images?: string[]
  certifications?: string[]
  experience_years?: number
  completed_jobs?: number
}

interface Review {
  id: number
  user_name: string
  user_image?: string
  rating: number
  comment: string
  date: string
}

export default function ContractorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const contractorId = params.id as string

  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContractorData() {
      try {
        setLoading(true)

        // Fetch contractor profile
        const response = await fetch(`/api/profiles?user_id=${contractorId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch contractor profile")
        }

        const data = await response.json()

        // Use only the actual data from the database
        setContractor(data)

        // Fetch real reviews if available
        try {
          const reviewsResponse = await fetch(`/api/reviews?contractor_id=${contractorId}`)
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json()
            setReviews(reviewsData)
          } else {
            setReviews([])
          }
        } catch (error) {
          console.error("Error fetching reviews:", error)
          setReviews([])
        }
      } catch (err: any) {
        console.error("Error fetching contractor data:", err)
        setError(err.message || "Failed to load contractor profile")
      } finally {
        setLoading(false)
      }
    }

    if (contractorId) {
      fetchContractorData()
    }
  }, [contractorId])

  // Format skills for display
  const formatSkill = (skill: string) => {
    return skill
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get location string
  const getLocation = (contractor: Contractor) => {
    const city = contractor.city || ""
    const province = contractor.province ? provinceNames[contractor.province] || contractor.province : ""

    if (city && province) return `${city}, ${province}`
    return city || province || "Location not specified"
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <header className="p-4 bg-gray-800">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Contractor Profile</h1>
          </div>
          <div className="flex items-center mt-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse mr-4"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  if (error || !contractor) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
        <header className="p-4 bg-gray-800">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Contractor Profile</h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="text-center py-8 text-red-500">
            <p>{error || "Failed to load contractor profile"}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="p-4 bg-gray-800 shadow-soft z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Contractor Profile</h1>
        </div>
      </header>

      {/* Contractor Profile */}
      <div className="p-4 bg-gray-800 shadow-soft">
        <div className="flex items-start">
          <Avatar className="h-20 w-20 mr-4 ring-2 ring-white shadow-soft">
            {contractor.profile_image ? (
              <AvatarImage src={contractor.profile_image || "/placeholder.svg"} alt={contractor.name} />
            ) : (
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt={contractor.name} />
            )}
            <AvatarFallback>{getInitials(contractor.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{contractor.name}</h2>
              {contractor.is_verified && <Shield className="h-5 w-5 text-blue-500 ml-1" fill="#EBF5FF" />}
            </div>

            {contractor.business_name && <p className="text-gray-300">{contractor.business_name}</p>}

            <div className="flex items-center mt-1">
              {contractor.rating ? (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 font-medium">{contractor.rating}</span>
                  <span className="text-sm text-gray-400 ml-1">({contractor.reviews || 0} reviews)</span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">No ratings yet</div>
              )}

              <div className="flex items-center ml-4">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400 ml-1">{getLocation(contractor)}</span>
              </div>
            </div>

            {contractor.skills && contractor.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {contractor.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-primary-50 text-primary-700 border-primary-100 rounded-md"
                  >
                    {formatSkill(skill)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium rounded-lg transition-all duration-200 shadow-button">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="p-4">
        <Card className="border border-gray-700 rounded-xl overflow-hidden shadow-card bg-gray-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Experience</p>
                <p className="font-semibold">
                  {contractor.experience_years ? `${contractor.experience_years}+ years` : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-400">Completed</p>
                <p className="font-semibold">{contractor.completed_jobs || "0"}</p>
                <p className="text-xs text-gray-400">jobs</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-400">Rating</p>
                {contractor.rating ? (
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <p className="font-semibold">{contractor.rating}</p>
                  </div>
                ) : (
                  <p className="font-semibold">N/A</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex-1 px-4">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-lg p-1 bg-gray-700">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 space-y-4">
            {contractor.description && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-gray-300">{contractor.description}</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-3">
                  {contractor.phone ? (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{contractor.phone}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{contractor.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {contractor.certifications && contractor.certifications.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Certifications</h3>
                  <div className="space-y-2">
                    {contractor.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Project Portfolio</h3>
                {contractor.portfolio_images && contractor.portfolio_images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {contractor.portfolio_images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio project ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p>No portfolio images available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Reviews</h3>
                  {contractor.rating ? (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 font-medium">{contractor.rating}</span>
                      <span className="text-sm text-gray-400 ml-1">({contractor.reviews || 0})</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No ratings yet</span>
                  )}
                </div>

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <Avatar className="h-8 w-8 mr-2">
                            {review.user_image ? (
                              <AvatarImage src={review.user_image || "/placeholder.svg"} alt={review.user_name} />
                            ) : (
                              <AvatarFallback>{getInitials(review.user_name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{review.user_name}</p>
                              <p className="text-xs text-gray-400">{review.date}</p>
                            </div>
                            <div className="flex mt-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-300">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <p>No reviews yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
