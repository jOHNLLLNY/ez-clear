import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F9FC]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#5B2EFF]" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
