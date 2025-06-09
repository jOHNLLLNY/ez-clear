import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#141625] text-white">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
