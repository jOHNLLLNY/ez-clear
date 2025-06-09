"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import BottomNavigation from "@/components/bottom-navigation"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"

// Renovation service categories with icons
const renovationCategories = [
  {
    id: "kitchen",
    name: "Kitchen Renovation",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <path d="M8 5h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"></path>
        <path d="M2 7h3"></path>
        <path d="M2 11h3"></path>
        <path d="M2 15h3"></path>
        <path d="M19 7h3"></path>
        <path d="M19 11h3"></path>
        <path d="M19 15h3"></path>
        <path d="M8 9h8"></path>
        <path d="M8 13h8"></path>
      </svg>
    ),
    description: "Complete kitchen remodeling, cabinets, countertops, and appliance installation",
  },
  {
    id: "bathroom",
    name: "Bathroom Renovation",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
        <line x1="10" y1="6" x2="20" y2="6"></line>
        <line x1="10" y1="10" x2="20" y2="10"></line>
        <line x1="10" y1="14" x2="20" y2="14"></line>
        <line x1="10" y1="18" x2="20" y2="18"></line>
      </svg>
    ),
    description: "Bathroom remodeling, fixtures, tiling, and plumbing services",
  },
  {
    id: "basement",
    name: "Basement Renovation",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <path d="M2 22h20"></path>
        <path d="M2 17h20"></path>
        <path d="M2 12h20"></path>
        <path d="M2 7h20"></path>
        <path d="M16 2H8"></path>
        <path d="M12 2v20"></path>
      </svg>
    ),
    description: "Basement finishing, waterproofing, and remodeling services",
  },
  {
    id: "flooring",
    name: "Flooring Installation",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M3 9h18"></path>
        <path d="M3 15h18"></path>
        <path d="M9 3v18"></path>
        <path d="M15 3v18"></path>
      </svg>
    ),
    description: "Hardwood, laminate, tile, and vinyl flooring installation",
  },
  {
    id: "painting",
    name: "Painting Services",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path>
        <path d="M2 12h20"></path>
        <path d="M2 7h20"></path>
        <path d="M2 17h20"></path>
      </svg>
    ),
    description: "Interior and exterior painting services for homes and businesses",
  },
  {
    id: "drywall",
    name: "Drywall Installation",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M12 3v18"></path>
      </svg>
    ),
    description: "Drywall installation, repair, and finishing services",
  },
  {
    id: "electrical",
    name: "Electrical Work",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <path d="M18 16.8a7.5 7.5 0 0 0-15 0"></path>
        <path d="M8.7 10.7a4.5 4.5 0 0 0 6.6 0"></path>
        <path d="M12 12a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1Z"></path>
      </svg>
    ),
    description: "Electrical installations, repairs, and upgrades",
  },
  {
    id: "plumbing",
    name: "Plumbing Services",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <path d="M12 22V8"></path>
        <path d="M20 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path>
        <path d="M12 8H4"></path>
        <path d="M20 8h-8"></path>
        <path d="M4 22V8"></path>
      </svg>
    ),
    description: "Plumbing installations, repairs, and fixture replacements",
  },
  {
    id: "windows",
    name: "Window Installation",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="M12 4v16"></path>
        <path d="M2 12h20"></path>
      </svg>
    ),
    description: "Window replacement and installation services",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-green-600"
      >
        <path d="m18 5-3-3H9L6 5"></path>
        <path d="M2 5h20v14H2z"></path>
        <path d="M18 19v-7"></path>
        <path d="M6 19v-7"></path>
        <path d="M12 19v-7"></path>
        <path d="M2 12h20"></path>
      </svg>
    ),
    description: "Custom carpentry, cabinetry, and woodworking services",
  },
]

export default function RenovationServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null)
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [userType, setUserType] = useState<string | null>(null)

  // Get userType from localStorage only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserType(localStorage.getItem("userType"))
    }
  }, [])

  // Filter categories based on search query
  const filteredCategories = renovationCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle category click based on user role
  const handleCategoryClick = (categoryId: string) => {
    setLoadingCategory(categoryId)
    setLoading(true)

    // Format the service type for API queries
    const serviceType = `renovation_${categoryId}`

    try {
      // Check user role and redirect accordingly
      if (profile?.user_type === "hirer") {
        // Hirers see contractors who offer this service
        router.push(`/search/contractors?service_type=${serviceType}`)
      } else if (profile?.user_type === "worker") {
        // Workers see available jobs for this service
        router.push(`/search?service_type=${serviceType}`)
      } else {
        // Fallback if user type is not determined from profile
        if (userType === "hirer") {
          router.push(`/search/contractors?service_type=${serviceType}`)
        } else {
          router.push(`/search?service_type=${serviceType}`)
        }
      }
    } catch (error) {
      console.error("Navigation error:", error)
      setLoading(false)
      setLoadingCategory(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center bg-card">
        <Link href="/services" className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Renovation Services</h1>
      </header>

      {/* Search */}
      <div className="px-4 mb-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search renovation services"
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {authLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg"
                disabled={loading}
              >
                <Card className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      {loadingCategory === category.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No renovation services found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
