import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#1B1F25] p-3 text-white shadow-md">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/ez-clear-icon.png" alt="EZ Clear" width={36} height={36} className="h-9 w-9" />
          <span className="font-semibold text-[#06C0B3]">EZ Clear</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Messages">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
