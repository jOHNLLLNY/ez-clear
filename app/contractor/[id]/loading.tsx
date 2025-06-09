import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"

export default function ContractorProfileLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="p-4 bg-white">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2">
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

      <div className="p-4">
        <div className="flex gap-2 mt-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <BottomNavigation />
    </div>
  )
}
