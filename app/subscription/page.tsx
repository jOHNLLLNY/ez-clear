"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"

export default function SubscriptionPage() {
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href="/profile" className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Subscription Plans</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        <Card className="border rounded-lg overflow-hidden bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Clock className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Coming Soon!</h2>
            <p className="text-gray-600 mb-4">
              Premium subscription plans will be available in a future update. Currently, all features are available for
              free.
            </p>
            <p className="text-sm text-gray-500">
              Stay tuned for premium features including priority support, advanced analytics, and more.
            </p>
          </CardContent>
        </Card>

        <Card className="border rounded-lg overflow-hidden">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Current Free Plan</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-green-600 mr-2"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Unlimited job browsing</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-green-600 mr-2"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Messaging with clients</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-green-600 mr-2"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Profile customization</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-green-600 mr-2"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Job posting (for hirers)</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-green-600 mr-2"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <span>Basic analytics</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/profile")}>
          Return to Profile
        </Button>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
