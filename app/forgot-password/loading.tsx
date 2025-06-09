import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-32 ml-2" />
      </header>

      <div className="w-full max-w-md mx-auto mt-16 px-4 space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-10 w-full mt-6" />
        </div>
      </div>
    </div>
  )
}
