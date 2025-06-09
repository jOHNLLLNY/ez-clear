"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Map, Calendar, User, Search, Snowflake, Leaf, Clock } from "lucide-react"
import Link from "next/link"

export default function Bookings() {
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  const upcomingBookings = [
    {
      id: 1,
      service: "Snow Removal",
      date: "Tomorrow, 8:00 AM",
      address: "123 Main St, Anytown",
      status: "Scheduled",
      icon: <Snowflake className="h-5 w-5 text-green-600" />,
    },
    {
      id: 2,
      service: "Lawn Mowing",
      date: "Friday, 2:00 PM",
      address: "123 Main St, Anytown",
      status: "Pending",
      icon: <Leaf className="h-5 w-5 text-green-600" />,
    },
  ]

  const pastBookings = [
    {
      id: 3,
      service: "Snow Removal",
      date: "Jan 15, 2023",
      address: "123 Main St, Anytown",
      status: "Completed",
      icon: <Snowflake className="h-5 w-5 text-green-600" />,
    },
    {
      id: 4,
      service: "Gutter Cleaning",
      date: "Oct 10, 2022",
      address: "123 Main St, Anytown",
      status: "Completed",
      icon: (
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
          className="h-5 w-5 text-green-600"
        >
          <path d="M19 9V6.5a.5.5 0 0 0-.5-.5h-14a.5.5 0 0 0-.5.5V9"></path>
          <path d="M19 9H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z"></path>
          <path d="M3 14h18"></path>
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-xl font-bold mb-4">My Bookings</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="border rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                      {booking.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{booking.service}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{booking.date}</span>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        booking.status === "Scheduled" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      } border-0`}
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{booking.address}</p>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Reschedule
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="border rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                      {booking.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{booking.service}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{booking.date}</span>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800 border-0">{booking.status}</Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{booking.address}</p>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Details
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">Book Again</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </header>

      {/* Bottom Navigation - Conditional based on user type */}
      {userType === "worker" ? (
        // Worker navigation with Map
        <div className="mt-auto grid grid-cols-5 border-t border-gray-200">
          <Link href="/home/worker" className="flex flex-col items-center py-2 text-gray-400">
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link href="/search" className="flex flex-col items-center py-2 text-gray-400">
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>

          <Link href="/map" className="flex flex-col items-center py-2 text-gray-400">
            <Map className="h-6 w-6" />
            <span className="text-xs mt-1">Map</span>
          </Link>

          <Link href="/bookings" className="flex flex-col items-center py-2 text-green-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Bookings</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center py-2 text-gray-400">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      ) : (
        // Hirer navigation without Map
        <div className="mt-auto grid grid-cols-4 border-t border-gray-200">
          <Link href="/home/hirer" className="flex flex-col items-center py-2 text-gray-400">
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link href="/search" className="flex flex-col items-center py-2 text-gray-400">
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>

          <Link href="/bookings" className="flex flex-col items-center py-2 text-green-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Bookings</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center py-2 text-gray-400">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      )}
    </div>
  )
}
