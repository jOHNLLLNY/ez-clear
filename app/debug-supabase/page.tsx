"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Database, Table, User, MessageSquare, Bell, Briefcase } from "lucide-react"

export default function DebugSupabase() {
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "success" | "error">("checking")

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch("/api/debug-supabase")
        const data = await response.json()

        if (data.success) {
          setConnectionStatus("success")
          setTables(data.tables || [])
        } else {
          setConnectionStatus("error")
          setError(data.error || "Unknown error")
        }
      } catch (err: any) {
        setConnectionStatus("error")
        setError(err.message || "Failed to connect to Supabase")
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <Link href="/debug" className="flex items-center text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Debug Menu
        </Link>
        <h1 className="text-2xl font-bold">Supabase Debug</h1>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Checking connection...</p>
            ) : connectionStatus === "success" ? (
              <p className="text-green-600">Connected to Supabase successfully!</p>
            ) : (
              <div>
                <p className="text-red-600">Failed to connect to Supabase</p>
                {error && <p className="text-sm mt-2 text-gray-600">{error}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Table className="mr-2 h-5 w-5" />
              Database Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading tables...</p>
            ) : tables.length > 0 ? (
              <ul className="space-y-1">
                {tables.map((table) => (
                  <li key={table} className="p-2 hover:bg-gray-100 rounded">
                    {table}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tables found</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/debug-supabase/users">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Users & Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Debug user accounts and profile data</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/debug-applications">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Job Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Debug job applications and related functionality</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/debug-supabase/messages">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Debug conversations and messages</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/debug-supabase/notifications">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Debug notification system</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
