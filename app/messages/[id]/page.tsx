"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Paperclip, ImageIcon, User, Loader2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import BottomNavigation from "@/components/bottom-navigation"

interface Message {
  id: number
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

interface ConversationPartner {
  id: string
  name: string
  profile_image?: string
  is_online: boolean
}

export default function ConversationDetail() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [partner, setPartner] = useState<ConversationPartner | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id

  useEffect(() => {
    if (!user) {
      // Set a timeout to prevent infinite loading
      const timer = setTimeout(() => {
        setLoading(false)
        setError("User authentication failed. Please log in again.")
      }, 3000)
      return () => clearTimeout(timer)
    }

    async function fetchConversationData() {
      try {
        setLoading(true)

        // Fetch messages
        const messagesResponse = await fetch(`/api/messages?conversation_id=${conversationId}`)
        if (!messagesResponse.ok) {
          throw new Error("Failed to fetch messages")
        }
        const messagesData = await messagesResponse.json()

        // Fetch conversation details to get partner info
        const conversationResponse = await fetch(`/api/conversations/${conversationId}`)
        if (!conversationResponse.ok) {
          throw new Error("Failed to fetch conversation details")
        }
        const conversationData = await conversationResponse.json()

        if (!conversationData.partner) {
          throw new Error("Conversation partner not found")
        }

        setMessages(Array.isArray(messagesData) ? messagesData : [])
        setPartner(conversationData.partner)
      } catch (err) {
        console.error("Error fetching conversation data:", err)
        setError(err.message || "Failed to load conversation")
        // Set empty arrays to avoid undefined errors
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    fetchConversationData()
  }, [conversationId, user])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || !conversationId) return

    try {
      setSending(true)
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const sentMessage = await response.json()

      // Add new message to the list
      setMessages((prev) => [...prev, sentMessage])

      // Clear input
      setNewMessage("")
    } catch (err: any) {
      console.error("Error sending message:", err)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format message date for grouping
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
    }
  }

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const date = formatMessageDate(message.created_at)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  if (loading) {
    return (
      <div className="app-container bg-background text-foreground">
        <header className="page-header bg-card border-border">
          <Link href="/messages" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h2 className="font-medium">Loading...</h2>
          </div>
        </header>
        <div className="page-content flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-container bg-background text-foreground">
        <header className="page-header bg-card border-border">
          <Link href="/messages" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h2 className="font-medium">Error</h2>
          </div>
        </header>
        <div className="page-content flex items-center justify-center">
          <div className="bg-red-50 p-6 rounded-lg border border-red-100 text-center w-full max-w-sm">
            <p className="text-red-600 font-medium mb-3">Error loading conversation</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/messages")}>
              Back to Messages
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="app-container bg-background text-foreground">
        <header className="page-header bg-card border-border">
          <Link href="/messages" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h2 className="font-medium">Conversation not found</h2>
          </div>
        </header>
        <div className="page-content flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">This conversation doesn't exist or you don't have access to it.</p>
            <Button variant="outline" onClick={() => router.push("/messages")}>
              Back to Messages
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  const messageGroups = groupMessagesByDate()

  return (
    <div className="app-container bg-background text-foreground">
      {/* Header */}
      <header className="page-header bg-card border-border">
        <Link href="/messages" className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="relative">
          <Avatar className={`h-9 w-9 mr-2 ${partner.is_online ? "avatar-online" : ""}`}>
            <AvatarImage src={partner.profile_image || "/placeholder.svg?height=36&width=36"} alt={partner.name} />
            <AvatarFallback>{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <h2 className="font-medium">{partner.name}</h2>
          <p className="text-xs text-gray-500">{partner.is_online ? "Online" : "Offline"}</p>
        </div>
        <Button variant="ghost" size="icon" className="ml-2" onClick={() => router.push(`/contractor/${partner.id}`)}>
          <User className="h-5 w-5 text-primary" />
        </Button>
      </header>

      {/* Messages */}
      <main className="flex-1 p-4 overflow-y-auto bg-background">
        <div className="space-y-6">
          {Object.keys(messageGroups).length > 0 ? (
            Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date} className="space-y-3">
                <div className="flex justify-center">
                  <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">{date}</div>
                </div>

                {dateMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-card border border-border rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-gray-500"
                        }`}
                      >
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No messages yet</h3>
              <p className="text-gray-500">Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <ImageIcon className="h-5 w-5 text-gray-500" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              className="pr-12 rounded-full border-border dark:bg-card dark:text-foreground"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 btn-primary"
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
