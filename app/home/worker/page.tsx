"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Bell,
  MessageSquare,
  Snowflake,
  Leaf,
  Wrench,
  Hammer,
  Paintbrush,
  Home,
  Brush,
  Scissors,
  Layers,
  Square,
  Bath,
  Fence,
  SprayCanIcon as Spray,
  Plug,
  Filter,
  WrenchIcon as Screwdriver,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import BottomNavigation from "@/components/bottom-navigation"
import CompactMap from "@/components/compact-map"
import { useLanguage } from "@/context/language-context"

interface Job {
  id: number
  title: string
  description: string
  location: string
  service_type: string
  created_at: string
  status: string
}

interface Application {
  job_id: number
  status: string
}

// Same service categories as in /services/page.tsx
const serviceCategories = [
  {
    id: "renovation",
    name: "Renovation",
    icon: "🧱",
    subcategories: [
      {
        id: "drywall-installation",
        name: "Drywall",
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
        name: "Kitchen",
        image: "/kitchen-renovation-modern.png",
        description: "Complete kitchen remodeling services",
      },
      {
        id: "bathroom-renovation",
        name: "Bathroom",
        image: "/bathroom-renovation.png",
        description: "Bathroom remodeling and upgrades",
      },
      {
        id: "basement-finishing",
        name: "Basement",
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
        name: "Lawn Care",
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
        name: "Gutters",
        image: "/images/services/gutter-cleaning.png",
        description: "Gutter cleaning and maintenance",
      },
      {
        id: "fence-repair",
        name: "Fencing",
        image: "/images/services/fence-repair.png",
        description: "Fence installation and repair services",
      },
      {
        id: "power-washing",
        name: "Washing",
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
        name: "Handyman",
        image: "/handyman-services.png",
        description: "General home repairs and maintenance",
      },
      {
        id: "appliance-installation",
        name: "Appliances",
        image: "/appliance-installation.png",
        description: "Installation of household appliances",
      },
      {
        id: "filter-change",
        name: "Filters",
        image: "/hvac-filter-change.png",
        description: "Replacement of HVAC system filters",
      },
      {
        id: "minor-fixes",
        name: "Repairs",
        image: "/home-repairs.png",
        description: "Small repairs around the house",
      },
      {
        id: "seasonal-maintenance",
        name: "Maintenance",
        image: "/seasonal-home-maintenance.png",
        description: "Regular seasonal home maintenance",
      },
    ],
  },
]

// Flatten all subcategories into a single array for horizontal scroll
const allServices = serviceCategories.flatMap((category) =>
  category.subcategories.map((subcategory) => ({
    ...subcategory,
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
  })),
)

export default function WorkerHome() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userApplications, setUserApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Fetch user applications if user is logged in
    async function fetchUserApplications() {
      if (!user?.id) return []

      try {
        setLoadingApplications(true)
        const response = await fetch(`/api/applications?worker_id=${user.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch applications")
        }

        const data = await response.json()
        setUserApplications(Array.isArray(data) ? data : [])
        return data
      } catch (err) {
        console.error("Error fetching applications:", err)
        return []
      } finally {
        setLoadingApplications(false)
      }
    }

    // Fetch jobs
    async function fetchJobs() {
      try {
        setLoading(true)

        // First get user applications
        const applications = await fetchUserApplications()

        // Then fetch jobs
        const response = await fetch("/api/jobs?status=open")
        if (!response.ok) throw new Error("Failed to fetch jobs")
        const data = await response.json()

        // Filter out jobs the user has already applied to
        if (user?.id && applications.length > 0) {
          const appliedJobIds = applications.map((app: any) => app.job_id)
          const filteredJobs = data.filter((job: Job) => !appliedJobIds.includes(job.id))
          setJobs(filteredJobs)
        } else {
          setJobs(data)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user?.id])

  // Get icon for service type
  const getServiceIcon = (serviceType: string) => {
    if (serviceType === "snow_removal") {
      return <Snowflake className="h-5 w-5 text-primary-600" />
    } else if (serviceType === "landscaping" || serviceType === "lawn_mowing") {
      return <Leaf className="h-5 w-5 text-primary-600" />
    } else {
      return <Wrench className="h-5 w-5 text-primary-600" />
    }
  }

  // Function to get icon for service
  const getServiceIconComponent = (serviceId: string, categoryIcon: string) => {
    // Map specific services to icons
    const iconMap = {
      // Renovation services - updated icons
      "drywall-installation": <Square className="h-5 w-5 text-primary" />, // Wall panels
      insulation: <Home className="h-5 w-5 text-primary" />, // House insulation
      plastering: <Paintbrush className="h-5 w-5 text-primary" />, // Keep paintbrush but for plastering
      painting: <Brush className="h-5 w-5 text-primary" />, // Switch to regular brush
      flooring: <Layers className="h-5 w-5 text-primary" />, // Floor layers
      tiling: <Square className="h-5 w-5 text-primary" />, // Grid pattern for tiles
      demolition: <Hammer className="h-5 w-5 text-primary" />,
      "kitchen-renovation": <Home className="h-5 w-5 text-primary" />, // Home renovation
      "bathroom-renovation": <Bath className="h-5 w-5 text-primary" />,
      "basement-finishing": <Home className="h-5 w-5 text-primary" />, // Underground/foundation

      // Outdoor services
      "snow-removal": <Snowflake className="h-5 w-5 text-primary" />,
      "lawn-mowing": <Scissors className="h-5 w-5 text-primary" />,
      "leaf-cleanup": <Leaf className="h-5 w-5 text-primary" />,
      "gutter-cleaning": <Home className="h-5 w-5 text-primary" />,
      "fence-repair": <Fence className="h-5 w-5 text-primary" />,
      "power-washing": <Spray className="h-5 w-5 text-primary" />,

      // Maintenance services
      "general-handyman": <Wrench className="h-5 w-5 text-primary" />,
      "appliance-installation": <Plug className="h-5 w-5 text-primary" />,
      "filter-change": <Filter className="h-5 w-5 text-primary" />,
      "minor-fixes": <Screwdriver className="h-5 w-5 text-primary" />,
      "seasonal-maintenance": <Calendar className="h-5 w-5 text-primary" />,
    }

    return iconMap[serviceId] || <Wrench className="h-5 w-5 text-primary" />
  }

  const handleServiceClick = (serviceId: string) => {
    // Check user role and redirect accordingly
    if (user?.user_type === "hirer") {
      // Hirers see contractors who offer this service
      window.location.href = `/search/contractors?service_type=${serviceId}`
    } else if (user?.user_type === "worker") {
      // Workers see available jobs for this service
      window.location.href = `/search?service_type=${serviceId}`
    } else {
      // Fallback
      window.location.href = `/search?service_type=${serviceId}`
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-card shadow-soft z-10 rounded-b-2xl">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-2 shadow-soft">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-primary">EZ Clear</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/messages" className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
            <MessageSquare className="h-5 w-5 text-foreground" />
          </Link>
          <Link href="/notifications" className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
            <Bell className="h-5 w-5 text-foreground" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Services */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{t("services")}</h2>
            <Link href="/services" className="text-primary text-sm font-medium">
              View All
            </Link>
          </div>

          {/* Horizontal Scrollable Services */}
          <div className="overflow-x-auto scrollbar-hide" style={{ width: "100%" }}>
            <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
              {allServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-2xl"
                >
                  <Card className="border border-border rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-medium transition-all duration-200 w-[100px]">
                    <CardContent className="p-3 flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2 shadow-soft">
                        {getServiceIconComponent(service.id, service.categoryIcon)}
                      </div>
                      <span className="text-xs font-medium text-center whitespace-nowrap">{service.name}</span>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-4 mb-4">
          <Card className="border border-border rounded-2xl overflow-hidden shadow-card">
            <CompactMap />
          </Card>
        </div>

        {/* Available Jobs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{t("availableJobs")}</h2>
            <Link href="/search" className="text-primary text-sm font-medium">
              View All
            </Link>
          </div>

          {loading || loadingApplications ? (
            <div className="text-center py-4">Loading jobs...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">Error: {error}</div>
          ) : (
            <div className="space-y-3">
              {jobs.length > 0 ? (
                jobs.slice(0, 3).map((job) => (
                  <Card
                    key={job.id}
                    className="border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mr-3 shadow-soft">
                          {getServiceIcon(job.service_type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl transition-all duration-200 shadow-button hover:bg-muted"
                        >
                          <Link href={`/job-details/${job.id}`}>Details</Link>
                        </Button>
                        <Button className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl transition-all duration-200 shadow-button">
                          <Link href={`/job-details/${job.id}?apply=true`}>Apply</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No jobs available at the moment</p>
                  {user?.id && userApplications.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm">You've already applied to all available jobs.</p>
                      <Link href="/my-jobs">
                        <Button className="mt-4 bg-primary hover:bg-primary-600 text-white rounded-xl">
                          View My Applications
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
