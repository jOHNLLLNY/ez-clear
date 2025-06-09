import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchIcon } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"

export default function ContractorsSearchLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-xl font-bold mb-4">Find Contractors</h1>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search contractors..." className="pl-9" disabled />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Service type" />
              </SelectTrigger>
            </Select>

            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
