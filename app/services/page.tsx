"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Loader2, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import BottomNavigation from "@/components/bottom-navigation"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the service categories and subcategories
const serviceCategories = [
  {
    id: "renovation",
    name: "Renovation",
    icon: "🧱",
    subcategories: [
      {
        id: "drywall-installation",
        name: "Drywall Installation",
        image: "/drywall-installation-progress.png",
        description: "Professional drywall installation and repair services",
      },
      {
        id: "insulation",
        name: "Insulation",
        image: "/home-insulation.png",
        description: "Home insulation installation and upgrades",
      },
      {
        id: "plastering",
        name: "Plastering",
        image: "/placeholder.svg?key=uhz9j",
        description: "Wall and ceiling plastering services",
      },
      {
        id: "painting",
        name: "Painting",
        image: "/interior-painting-in-progress.png",
        description: "Interior and exterior painting services",
      },
      {
        id: "flooring",
        name: "Flooring",
        image: "/hardwood-flooring.png",
        description: "Hardwood, laminate, and tile flooring installation",
      },
      {
        id: "tiling",
        name: "Tiling",
        image: "/bathroom-tiling.png",
        description: "Bathroom, kitchen, and floor tiling services",
      },
      {
        id: "demolition",
        name: "Demolition",
        image: "/interior-demolition.png",
        description: "Interior demolition and removal services",
      },
      {
        id: "kitchen-renovation",
        name: "Kitchen Renovation",
        image: "/kitchen-renovation-modern.png",
        description: "Complete kitchen remodeling services",
      },
      {
        id: "bathroom-renovation",
        name: "Bathroom Renovation",
        image: "/bathroom-renovation.png",
        description: "Bathroom remodeling and upgrades",
      },
      {
        id: "basement-finishing",
        name: "Basement Finishing",
        image: "/basement-finishing.png",
        description: "Basement finishing and remodeling",
      },
    ],
  },
  {
    id: "outdoor",
    name: "Outdoor Services",
    icon: "🌿",
    subcategories: [
      {
        id: "snow-removal",
        name: "Snow Removal",
        image: "/images/services/snow-removal.png",
        description: "Snow clearing for driveways and walkways",
      },
      {
        id: "lawn-mowing",
        name: "Lawn Mowing",
        image: "/images/services/lawn-mowing.png",
        description: "Regular lawn maintenance and mowing",
      },
      {
        id: "leaf-cleanup",
        name: "Leaf Cleanup",
        image: "/images/services/leaf-cleanup.png",
        description: "Fall leaf removal and yard cleanup",
      },
      {
        id: "gutter-cleaning",
        name: "Gutter Cleaning",
        image: "/images/services/gutter-cleaning.png",
        description: "Gutter cleaning and maintenance",
      },
      {
        id: "fence-repair",
        name: "Fence Repair",
        image: "/images/services/fence-repair.png",
        description: "Fence installation and repair services",
      },
      {
        id: "power-washing",
        name: "Power Washing",
        image: "/images/services/pressure-washing.png",
        description: "Exterior cleaning for decks, siding, and driveways",
      },
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance",
    icon: "🧰",
    subcategories: [
      {
        id: "general-handyman",
        name: "General Handyman",
        image: "/handyman-services.png",
        description: "General home repairs and maintenance",
      },
      {
        id: "appliance-installation",
        name: "Appliance Installation",
        image: "/appliance-installation.png",
        description: "Installation of household appliances",
      },
      {
        id: "filter-change",
        name: "AC/Furnace Filter Change",
        image: "/hvac-filter-change.png",
        description: "Replacement of HVAC system filters",
      },
      {
        id: "minor-fixes",
        name: "Minor Fixes",
        image: "/home-repairs.png",
        description: "Small repairs around the house",
      },
      {
        id: "seasonal-maintenance",
        name: "Seasonal Maintenance",
        image: "/seasonal-home-maintenance.png",
        description: "Regular seasonal home maintenance",
      },
    ],
  },
]

export default function AllServices() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingService, setLoadingService] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all")
  const [jobCounts, setJobCounts] = useState({})
  const [contractorCounts, setContractorCounts] = useState({})

  // Get userType from localStorage only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserType(localStorage.getItem("userType"))
    }
  }, [])

  // Simulate fetching job/contractor counts
  useEffect(() => {
    // In a real app, this would be an API call to get actual counts
    const mockJobCounts = {}
    const mockContractorCounts = {}

    serviceCategories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        mockJobCounts[subcategory.id] = Math.floor(Math.random() * 20) + 1
        mockContractorCounts[subcategory.id] = Math.floor(Math.random() * 15) + 1
      })
    })

    setJobCounts(mockJobCounts)
    setContractorCounts(mockContractorCounts)
  }, [])

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["renovation", "outdoor", "maintenance"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Filter services based on search query and active tab
  const filteredServices = serviceCategories
    .filter((category) => activeTab === "all" || category.id === activeTab)
    .map((category) => ({
      ...category,
      subcategories: category.subcategories.filter(
        (subcategory) =>
          subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subcategory.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.subcategories.length > 0)

  const handleServiceClick = (serviceId: string) => {
    setLoadingService(serviceId)
    setLoading(true)

    try {
      // Check user role and redirect accordingly
      if (profile?.user_type === "hirer") {
        // Hirers see contractors who offer this service
        router.push(`/search/contractors?service_type=${serviceId}`)
      } else if (profile?.user_type === "worker") {
        // Workers see available jobs for this service
        router.push(`/search?service_type=${serviceId}`)
      } else {
        // Fallback if user type is not determined from profile
        if (userType === "hirer") {
          router.push(`/search/contractors?service_type=${serviceId}`)
        } else {
          router.push(`/search?service_type=${serviceId}`)
        }
      }
    } catch (error) {
      console.error("Navigation error:", error)
      setLoading(false)
      setLoadingService(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center border-b border-border bg-card">
        <Link
          href={profile?.user_type === "worker" ? "/home/worker" : "/home/hirer"}
          className="p-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Services</h1>
      </header>

      <div className="px-4 pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search services..."
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="renovation">Renovation</TabsTrigger>
            <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        {authLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="space-y-6">
            {filteredServices.map((category) => (
              <div key={category.id} className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center">{category.name}</h2>
                <div className="grid grid-cols-1 gap-3">
                  {category.subcategories.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceClick(service.id)}
                      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl"
                      disabled={loading}
                    >
                      <Card className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 bg-card">
                        <CardContent className="p-0">
                          <div className="flex items-center">
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <Image
                                src={service.image || "/placeholder.svg"}
                                alt={service.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 p-3">
                              <h3 className="font-medium text-foreground">{service.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                            </div>
                            {loadingService === service.id ? (
                              <div className="pr-3">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="pr-3">
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No services found matching "{searchQuery}"</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
