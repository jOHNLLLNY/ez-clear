"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface PortfolioItem {
  id: number | string
  image_url: string
  user_id?: string
}

export default function PortfolioPage() {
  const [userType, setUserType] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user type and ID from localStorage
    const storedUserType = localStorage.getItem("userType")
    const storedUserId = localStorage.getItem("userId")
    setUserType(storedUserType)
    setUserId(storedUserId)

    // Fetch portfolio items if user ID exists
    if (storedUserId) {
      fetchPortfolioItems(storedUserId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchPortfolioItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching portfolio items:", error)
      } else {
        setPortfolioItems(data || [])
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userId) return

    const file = e.target.files[0]
    setIsUploading(true)

    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `portfolio/${fileName}`

      const { error: uploadError, data } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL for the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath)

      // Save portfolio item to database
      const { error: dbError, data: newItem } = await supabase
        .from("portfolio")
        .insert({
          user_id: userId,
          image_url: publicUrl,
        })
        .select()
        .single()

      if (dbError) {
        throw dbError
      }

      // Add new item to state
      setPortfolioItems((prev) => [newItem, ...prev])
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteItem = async (id: number | string) => {
    try {
      // Delete from database
      const { error } = await supabase.from("portfolio").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Update state
      setPortfolioItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting portfolio item:", error)
      alert("Failed to delete item. Please try again.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 flex items-center border-b border-border">
        <Link href="/profile" className="mr-3">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {userType === "worker" && (
              <div className="mb-6">
                <Button
                  onClick={() => document.getElementById("portfolio-upload")?.click()}
                  className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Portfolio Photo
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  id="portfolio-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="border rounded-lg overflow-hidden bg-card">
                  <CardContent className="p-0 relative">
                    <img
                      src={item.image_url || "/placeholder.svg?height=200&width=200"}
                      alt="Portfolio item"
                      className="w-full h-48 object-cover"
                    />
                    {userType === "worker" && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        aria-label="Delete portfolio item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {portfolioItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No portfolio photos yet</p>
                {userType === "worker" && (
                  <Button
                    variant="link"
                    onClick={() => document.getElementById("portfolio-upload")?.click()}
                    className="mt-2 text-primary"
                  >
                    Add your first portfolio photo
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
