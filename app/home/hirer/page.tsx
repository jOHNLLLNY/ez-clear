"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Snowflake,
  Leaf,
  Wrench,
  Search,
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

export default function HirerHome() {
  const { user } = useAuth()

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
      window.location.href = `/search/contractors?service_type=${serviceId}`
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
          <Link
            href="/search/contractors"
            className="flex items-center gap-1 text-primary mr-2 p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200"
          >
            <Search className="h-5 w-5" />
            <span className="text-sm font-medium">Find Pros</span>
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
            <h2 className="text-lg font-bold">Services</h2>
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

        {/* Find Contractors Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Find Contractors</h2>
            <Link href="/search/contractors" className="text-primary text-sm font-medium">
              View All
            </Link>
          </div>

          <Card className="border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Looking for professionals?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Find skilled contractors for your indoor and outdoor projects.
              </p>
              <Link href="/search/contractors">
                <Button className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl transition-all duration-200 shadow-button">
                  <Search className="h-4 w-4 mr-2" />
                  Find Contractors
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
