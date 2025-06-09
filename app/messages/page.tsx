"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import BottomNavigation from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { OnlineIndicator } from "@/components/online-indicator"

interface Conversation {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: boolean
  avatar: string
  isOnline: boolean
  user1_id: string
  user2_id: string
}

export default function Messages() {
  const { user, profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update the fetchConversations function to handle pagination and add retry logic
  useEffect(() => {
    async function fetchConversations() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Add retry logic with exponential backoff
        let retries = 0
        const maxRetries = 3
        let success = false
        let data

        while (!success && retries < maxRetries) {
          try {
            const response = await fetch(`/api/conversations?user_id=${user.id}&page=1&pageSize=50`)

            if (!response.ok) {
              throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`)
            }

            data = await response.json()
            success = true
          } catch (err) {
            retries++
            console.log(`Retry ${retries}/${maxRetries} after error:`, err)

            if (retries >= maxRetries) {
              throw err
            }

            // Wait with exponential backoff before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
          }
        }

        // If data is empty or not an array, set an empty array
        setConversations(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching conversations:", err)
        setError(err.message || "Failed to load conversations")
        // Set empty array to avoid undefined errors
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user])

  // Add this right after the useEffect hook
  useEffect(() => {
    // If no user after 3 seconds, show error
    const timer = setTimeout(() => {
      if (!user && loading) {
        setLoading(false)
        setError("User authentication failed. Please log in again.")
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [user, loading])

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="app-container">
      {/* Header */}
      <header className="page-header border-b-0">
        <h1 className="page-title">Messages</h1>
      </header>

      {/* Search */}
      <div className="px-4 pb-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="input-search rounded-xl bg-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="page-content">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-destructive/10 p-6 rounded-2xl border border-destructive/20 text-center w-full max-w-sm">
              <p className="text-destructive font-medium mb-3">Error loading conversations</p>
              <p className="text-sm text-destructive/80 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <Link href={`/messages/${conversation.id}`} key={conversation.id}>
                  <Card
                    className={`border ${conversation.unread ? "bg-primary/5 border-primary/20" : ""} card-hover rounded-2xl`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center">
                        <div className="relative">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                            <AvatarFallback className="bg-muted text-foreground">
                              {conversation.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                            <OnlineIndicator
                              userId={
                                conversation.user1_id === user?.id ? conversation.user2_id : conversation.user1_id
                              }
                              className="absolute bottom-0 right-0 border-2 border-background"
                              size="md"
                            />
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className={`${conversation.unread ? "font-semibold" : "font-medium"} truncate`}>
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {conversation.time}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${conversation.unread ? "text-foreground" : "text-muted-foreground"} truncate`}
                          >
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unread && (
                          <Badge className="ml-2 bg-primary text-white h-6 w-6 rounded-full p-0 flex items-center justify-center">
                            <span>1</span>
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No new messages</h3>
                <p className="text-muted-foreground mb-6">
                  You have no messages yet. Your conversations will appear here when you start chatting with contractors
                  or clients.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
