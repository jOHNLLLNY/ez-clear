"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check if we have a valid access token in the URL
  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    if (!accessToken) {
      setMessage({
        type: "error",
        text: "Недійсне посилання для скидання пароля. Спробуйте запросити нове посилання.",
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validate passwords
    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Паролі не співпадають",
      })
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Пароль повинен містити щонайменше 6 символів",
      })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      setIsSuccess(true)
      setMessage({
        type: "success",
        text: "Ваш пароль успішно оновлено",
      })

      // Clear form
      setPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error updating password:", error)
      setMessage({
        type: "error",
        text: error.message || "Помилка при оновленні пароля. Спробуйте ще раз.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center">
        <Link href="/auth/sign-in" className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Скидання пароля</h1>
      </header>

      <div className="w-full max-w-md mx-auto mt-16 px-4 space-y-6">
        {isSuccess ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Пароль оновлено</h2>
              <p className="text-muted-foreground text-sm">
                Ваш пароль було успішно змінено. Тепер ви можете увійти з новим паролем.
              </p>
            </div>

            <Button className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90" asChild>
              <Link href="/auth/sign-in">Перейти до входу</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Створіть новий пароль</h2>
              <p className="text-muted-foreground text-sm">Ваш новий пароль повинен відрізнятися від попереднього</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Новий пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={message?.type === "error" ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={message?.type === "error" ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {message && (
                  <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
                    {message.text}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90 mt-6" disabled={isLoading}>
                {isLoading ? "Оновлення..." : "Оновити пароль"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
