"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Snowflake, Leaf, MapPin, Clock } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"

export default function AvailableLeadsPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [savedLeads, setSavedLeads] = useState<number[]>([])
  const [appliedLeads, setAppliedLeads] = useState<number[]>([])
  const [shortlistedLeads, setShortlistedLeads] = useState<number[]>([2]) // Mock data: job ID 2 is shortlisted
  const [activeTab, setActiveTab] = useState("available")

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  // Mock data for leads
  const leads = [
    {
      id: 1,
      title: "Snow Removal Needed",
      address: "123 Pine St, Anytown",
      distance: "0.5 km",
      serviceId: 1,
      icon: <Snowflake className="h-5 w-5 text-green-600" />,
      postedTime: "2 hours ago",
      description: "Need snow removal for driveway and walkway. Approximately 500 sq ft.",
      matchScore: 95,
    },
    {
      id: 2,
      title: "Lawn Mowing Service",
      address: "456 Oak Ave, Anytown",
      distance: "0.8 km",
      serviceId: 2,
      icon: <Leaf className="h-5 w-5 text-green-600" />,
      postedTime: "3 hours ago",
      description: "Regular lawn maintenance needed. Front and back yard, approx 1/4 acre.",
      matchScore: 87,
    },
    {
      id: 3,
      title: "Gutter Cleaning Required",
      address: "789 Maple Dr, Anytown",
      distance: "1.2 km",
      serviceId: 3,
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
      postedTime: "5 hours ago",
      description: "Two-story house needs gutter cleaning. Some areas may need minor repairs.",
      matchScore: 78,
    },
    {
      id: 4,
      title: "Leaf Cleanup Needed",
      address: "101 Elm St, Anytown",
      distance: "1.5 km",
      serviceId: 4,
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
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      ),
      postedTime: "1 day ago",
      description: "Fall cleanup needed for large yard. Lots of leaves to be removed and disposed of.",
      matchScore: 92,
    },
  ]

  const handleSaveLead = (leadId: number) => {
    // Toggle saved status
    if (savedLeads.includes(leadId)) {
      setSavedLeads((prev) => prev.filter((id) => id !== leadId))
    } else {
      setSavedLeads((prev) => [...prev, leadId])
    }
  }

  const handleApplyForJob = (leadId: number) => {
    // Navigate to job details page to apply
    window.location.href = `/job-details/${leadId}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4 bg-white shadow-soft z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Available Jobs</h1>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="available" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4 rounded-lg p-1 bg-gray-100">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4 px-4">
          <div className="space-y-4">
            {leads.filter((lead) => !appliedLeads.includes(lead.id)).length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {leads
                  .filter((lead) => !appliedLeads.includes(lead.id))
                  .map((lead) => (
                    <Card
                      key={lead.id}
                      className="border border-gray-100 rounded-xl overflow-hidden shadow-card hover:shadow-medium transition-all duration-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center mr-3 shadow-soft">
                            {lead.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{lead.title}</h3>
                              <Badge className="ml-2 bg-green-100 text-green-800 border-0">
                                {lead.matchScore}% match
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{lead.address}</span>
                              <span className="mx-1">•</span>
                              <span>{lead.distance}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{lead.description}</p>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Posted {lead.postedTime}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveLead(lead.id)}
                              className={`rounded-lg transition-all duration-200 ${savedLeads.includes(lead.id) ? "bg-gray-100 border-gray-200" : "hover:bg-gray-50"}`}
                            >
                              {savedLeads.includes(lead.id) ? "Saved" : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-lg transition-all duration-200 shadow-button"
                              onClick={() => handleApplyForJob(lead.id)}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No available jobs found. Check back later.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applied" className="mt-4 px-4">
          <div className="space-y-4">
            {appliedLeads.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {leads
                  .filter((lead) => appliedLeads.includes(lead.id))
                  .map((lead) => (
                    <Card key={lead.id} className="border rounded-lg overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                            {lead.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{lead.title}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{lead.address}</span>
                              <span className="mx-1">•</span>
                              <span>{lead.distance}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <h4 className="font-medium text-sm mb-1">Application Status:</h4>
                          <p className="text-sm">
                            Your application is under review. You'll be notified if you're shortlisted.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => (window.location.href = `/job-details/${lead.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't applied to any jobs yet</p>
                <Button variant="link" onClick={() => setActiveTab("available")} className="mt-2">
                  View available jobs
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shortlisted" className="mt-4 px-4">
          <div className="space-y-4">
            {shortlistedLeads.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {leads
                  .filter((lead) => shortlistedLeads.includes(lead.id))
                  .map((lead) => (
                    <Card key={lead.id} className="border rounded-lg overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                            {lead.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{lead.title}</h3>
                              <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-0">Shortlisted</Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{lead.address}</span>
                              <span className="mx-1">•</span>
                              <span>{lead.distance}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 border-0">{lead.price}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{lead.description}</p>

                        <div className="bg-green-50 p-3 rounded-lg mb-3">
                          <h4 className="font-medium text-sm mb-1">Contact Information:</h4>
                          <p className="text-sm">John Smith</p>
                          <p className="text-sm">+1 (555) 123-4567</p>
                          <p className="text-sm">john.smith@example.com</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => (window.location.href = `/messages/101`)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => (window.location.href = `/job-details/${lead.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't been shortlisted for any jobs yet</p>
                <Button variant="link" onClick={() => setActiveTab("available")} className="mt-2">
                  View available jobs
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
