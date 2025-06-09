"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Search, Map, MessageSquare, User, Snowflake, Leaf, MapPin, Clock, CreditCard, Lock } from "lucide-react"
import Link from "next/link"

export default function LeadsPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [purchasedLeads, setPurchasedLeads] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState("new")
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [purchaseAmount, setPurchaseAmount] = useState(10)

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType")
    setUserType(storedUserType)
  }, [])

  // Mock data for leads
  const leads = [
    {
      id: 1,
      title: "Прибирання снігу",
      address: "вул. Соснова 123, Київ",
      distance: "0.5 км",
      serviceId: 1,
      icon: <Snowflake className="h-5 w-5 text-green-600" />,
      postedTime: "2 години тому",
      description: "Потрібно прибрати сніг з під'їзду та тротуару. Приблизно 50 кв.м.",
      matchScore: 95,
    },
    {
      id: 2,
      title: "Стрижка газону",
      address: "вул. Дубова 456, Київ",
      distance: "0.8 км",
      serviceId: 2,
      icon: <Leaf className="h-5 w-5 text-green-600" />,
      postedTime: "3 години тому",
      description: "Регулярний догляд за газоном. Передній та задній двір, приблизно 0.1 га.",
      matchScore: 87,
    },
    {
      id: 3,
      title: "Чистка водостоків",
      address: "вул. Кленова 789, Київ",
      distance: "1.2 км",
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
      postedTime: "5 годин тому",
      description:
        "Двоповерховий будинок потребує чистки водостоків. Деякі ділянки можуть потребувати дрібного ремонту.",
      matchScore: 78,
    },
    {
      id: 4,
      title: "Прибирання листя",
      address: "вул. В'язова 101, Київ",
      distance: "1.5 км",
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
      postedTime: "1 день тому",
      description: "Осіннє прибирання для великого двору. Багато листя, яке потрібно прибрати та утилізувати.",
      matchScore: 92,
    },
  ]

  const handlePurchaseLead = (leadId: number) => {
    // Просто додаємо лід до куплених без перевірки кредитів
    setPurchasedLeads((prev) => [...prev, leadId])
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Leads</h1>
        </div>
        <div className="px-4 py-2 bg-blue-50 flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Available Leads</span>
          </div>
        </div>
      </header>

      <Tabs defaultValue="new" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="new">New Leads</TabsTrigger>
          <TabsTrigger value="purchased">Purchased Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <div className="space-y-4">
            {leads.filter((lead) => !purchasedLeads.includes(lead.id)).length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {leads
                  .filter((lead) => !purchasedLeads.includes(lead.id))
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

                        <div className="bg-gray-100 p-3 rounded-lg mb-3 flex items-center">
                          <Lock className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600">
                            Purchase this lead to see details and client contact information
                          </p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Posted {lead.postedTime}</span>
                          </div>
                          <Button
                            onClick={() => handlePurchaseLead(lead.id)}
                            className="bg-green-600 hover:bg-green-700"
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
                <p>No new leads. Check back later.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="purchased" className="mt-4">
          <div className="space-y-4">
            {purchasedLeads.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {leads
                  .filter((lead) => purchasedLeads.includes(lead.id))
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

                        <p className="text-sm text-gray-600 mb-3">{lead.description}</p>

                        <div className="bg-green-50 p-3 rounded-lg mb-3">
                          <h4 className="font-medium text-sm mb-1">Contact Information:</h4>
                          <p className="text-sm">Ivan Petrenko</p>
                          <p className="text-sm">+380 50 123 4567</p>
                          <p className="text-sm">ivan.petrenko@example.com</p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Message
                          </Button>
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">Call</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>You don't have any purchased leads yet</p>
                <Button variant="link" onClick={() => setActiveTab("new")} className="mt-2">
                  View available leads
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* The TabsContent components have been moved inside the Tabs component above */}
      </main>

      {/* Bottom Navigation */}
      <div className="grid grid-cols-5 border-t border-gray-200">
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

        <Link href="/messages" className="flex flex-col items-center py-2 text-gray-400">
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>

        <Link href="/profile" className="flex flex-col items-center py-2 text-gray-400">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
