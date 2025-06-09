"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Calendar, Repeat, Snowflake, Leaf, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"

export default function RecurringPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [recurringServices, setRecurringServices] = useState([
    {
      id: 1,
      title: "Weekly Lawn Mowing",
      address: "123 Main St, Anytown",
      frequency: "Weekly",
      nextDate: "Dec 15, 2023",
      time: "2:00 PM - 4:00 PM",
      price: "$60",
      active: true,
      icon: <Leaf className="h-5 w-5 text-green-600" />,
    },
    {
      id: 2,
      title: "Snow Removal",
      address: "123 Main St, Anytown",
      frequency: "As Needed",
      nextDate: "After snowfall",
      time: "Morning (8:00 AM - 12:00 PM)",
      price: "$80",
      active: true,
      icon: <Snowflake className="h-5 w-5 text-green-600" />,
    },
    {
      id: 3,
      title: "Monthly Gutter Cleaning",
      address: "123 Main St, Anytown",
      frequency: "Monthly",
      nextDate: "Jan 5, 2024",
      time: "10:00 AM - 12:00 PM",
      price: "$90",
      active: false,
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
  ])

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  const toggleServiceActive = (id) => {
    setRecurringServices((prev) =>
      prev.map((service) => (service.id === id ? { ...service, active: !service.active } : service)),
    )
  }

  const deleteService = (id) => {
    if (confirm("Are you sure you want to cancel this recurring service?")) {
      setRecurringServices((prev) => prev.filter((service) => service.id !== id))
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href={userType === "worker" ? "/home/worker" : "/home/hirer"} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Recurring Services</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {userType === "hirer" && (
          <Card className="border rounded-lg overflow-hidden bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Repeat className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold">Set up recurring services</h2>
                  <p className="text-sm text-gray-600 mb-3">
                    Save time by scheduling regular services like lawn mowing, snow removal, and more.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Link href="/post-job?recurring=true">Schedule New Service</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {recurringServices.length > 0 ? (
          <div className="space-y-4">
            {recurringServices.map((service) => (
              <Card key={service.id} className="border rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium">{service.title}</h3>
                        <Badge className="ml-2 bg-blue-100 text-blue-800 border-0">{service.frequency}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{service.address}</p>
                    </div>
                    {userType === "hirer" && (
                      <Switch checked={service.active} onCheckedChange={() => toggleServiceActive(service.id)} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Next Service</p>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-600 mr-1" />
                        <p className="text-sm font-medium">{service.nextDate}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-sm font-medium">{service.time}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="font-medium">{service.price}</p>
                    <div className="flex gap-2">
                      {userType === "hirer" && (
                        <>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {userType === "worker" && (
                        <Button size="sm" className="h-8 px-3 bg-green-600 hover:bg-green-700">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recurring services found</p>
            {userType === "hirer" && (
              <Button variant="link" className="mt-2">
                <Link href="/post-job?recurring=true">Schedule your first service</Link>
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
