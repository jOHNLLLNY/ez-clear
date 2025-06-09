"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchIcon, MapPin, Star, Shield, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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

export default function ContractorsSearchPage() {
  const searchParams = useSearchParams()
  const initialServiceType = searchParams.get("service_type") || "all"

  const [contractors, setContractors] = useState<Contractor[]>([])
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [serviceType, setServiceType] = useState(initialServiceType)
  const [locationFilter, setLocationFilter] = useState("all")

  useEffect(() => {
    async function fetchContractors() {
      try {
        setLoading(true)

        // Build API URL with filters
        let url = "/api/profiles?user_type=worker"

        // If service type is specified, add it to the query
        if (serviceType && serviceType !== "all") {
          url += `&skills=${serviceType}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch contractors")
        }

        const data = await response.json()

        // Use only the actual data from the database
        setContractors(data)
        setFilteredContractors(data)
      } catch (err: any) {
        console.error("Error fetching contractors:", err)
        setError(err.message || "Failed to load contractors")
      } finally {
        setLoading(false)
      }
    }

    fetchContractors()
  }, [serviceType])

  // Filter contractors when search term or filters change
  useEffect(() => {
    let filtered = [...contractors]

    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (contractor) =>
          contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contractor.business_name && contractor.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (contractor.description && contractor.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by service type (if not already filtered by API)
    if (serviceType && serviceType !== "all" && !window.location.search.includes("service_type")) {
      filtered = filtered.filter((contractor) => contractor.skills && contractor.skills.includes(serviceType))
    }

    // Filter by location
    if (locationFilter && locationFilter !== "all") {
      filtered = filtered.filter((contractor) => contractor.province === locationFilter)
    }

    setFilteredContractors(filtered)
  }, [searchTerm, locationFilter, contractors, serviceType])

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 bg-card shadow-soft z-10 border-b border-border">
        <h1 className="text-xl font-bold mb-4">Find Contractors</h1>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractors..."
              className="pl-9 rounded-lg border-border focus:border-primary focus:ring-primary/20 shadow-button bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="snow_removal">Snow Removal</SelectItem>
                <SelectItem value="landscaping">Landscaping</SelectItem>
                <SelectItem value="lawn_mowing">Lawn Mowing</SelectItem>
                <SelectItem value="gutter_cleaning">Gutter Cleaning</SelectItem>
                <SelectItem value="leaf_cleanup">Leaf Cleanup</SelectItem>
                <SelectItem value="renovation">Renovation</SelectItem>
                <SelectItem value="handyman">Handyman</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="on">Ontario</SelectItem>
                <SelectItem value="qc">Quebec</SelectItem>
                <SelectItem value="bc">British Columbia</SelectItem>
                <SelectItem value="ab">Alberta</SelectItem>
                <SelectItem value="mb">Manitoba</SelectItem>
                <SelectItem value="sk">Saskatchewan</SelectItem>
                <SelectItem value="ns">Nova Scotia</SelectItem>
                <SelectItem value="nb">New Brunswick</SelectItem>
                <SelectItem value="nl">Newfoundland</SelectItem>
                <SelectItem value="pe">Prince Edward Island</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-background">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading contractors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-red-900/10 rounded-lg border border-red-900/20">
            <p className="text-red-500 font-medium mb-2">Error: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-foreground">Available Contractors</h2>
              <span className="text-sm text-muted-foreground bg-card/50 px-2 py-1 rounded-full">
                {filteredContractors.length} found
              </span>
            </div>

            {filteredContractors.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredContractors.map((contractor) => (
                  <Link href={`/contractor/${contractor.id}`} key={contractor.id}>
                    <Card className="border border-border rounded-xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-200 bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <Avatar className="h-14 w-14 mr-3 ring-2 ring-border shadow-soft">
                            {contractor.profile_image ? (
                              <AvatarImage src={contractor.profile_image || "/placeholder.svg"} alt={contractor.name} />
                            ) : (
                              <AvatarImage src="/placeholder.svg?height=56&width=56" alt={contractor.name} />
                            )}
                            <AvatarFallback>{getInitials(contractor.name)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium text-foreground">{contractor.name}</h3>
                              {contractor.is_verified && (
                                <Shield className="h-4 w-4 text-blue-500 ml-1" fill="#EBF5FF" />
                              )}
                              {contractor.rating ? (
                                <div className="ml-auto flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-sm ml-1 text-foreground">{contractor.rating}</span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({contractor.reviews || 0})
                                  </span>
                                </div>
                              ) : (
                                <div className="ml-auto text-xs text-muted-foreground">No ratings yet</div>
                              )}
                            </div>

                            {contractor.business_name && (
                              <p className="text-sm text-muted-foreground">{contractor.business_name}</p>
                            )}

                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{getLocation(contractor)}</span>
                            </div>

                            {contractor.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {contractor.description}
                              </p>
                            )}

                            {contractor.skills && contractor.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {contractor.skills.map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-primary/10 text-primary border-primary/20 text-xs py-0 rounded-md"
                                  >
                                    {formatSkill(skill)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-card/30 rounded-lg border border-border">
                <p className="text-foreground font-medium">No contractors found matching your criteria</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("")
                    setServiceType("all")
                    setLocationFilter("all")
                  }}
                  className="mt-2 text-primary"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
