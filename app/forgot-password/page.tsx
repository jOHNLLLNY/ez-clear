"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  // Initialize Supabase client only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupabase(createClient())
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setDebugInfo(null)

    if (!supabase) {
      setMessage({
        type: "error",
        text: "Помилка: Не вдалося ініціалізувати з'єднання з Supabase",
      })
      setIsLoading(false)
      return
    }

    try {
      console.log(`Attempting to send password reset email to: ${email}`)
      console.log(`Redirect URL: ${window.location.origin}/reset-password`)

      // Виклик API для скидання пароля
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      console.log("Reset password response:", { data, error })

      if (error) {
        throw error
      }

      // Додаткова діагностична інформація
      const debugData = JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          email,
          redirectUrl: `${window.location.origin}/reset-password`,
          response: data,
        },
        null,
        2,
      )

      setDebugInfo(debugData)

      setMessage({
        type: "success",
        text: "Перевірте вашу електронну пошту для отримання посилання для скидання пароля",
      })
    } catch (error: any) {
      console.error("Error resetting password:", error)

      // Детальне повідомлення про помилку
      let errorMessage = "Помилка при скиданні пароля. Спробуйте ще раз."

      if (error.message) {
        errorMessage = `Помилка: ${error.message}`
      }

      if (error.status) {
        errorMessage += ` (Код: ${error.status})`
      }

      setMessage({
        type: "error",
        text: errorMessage,
      })

      // Додаткова діагностична інформація
      setDebugInfo(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            email,
            redirectUrl: `${window.location.origin}/reset-password`,
            error: {
              message: error.message,
              status: error.status,
              name: error.name,
              stack: error.stack,
            },
          },
          null,
          2,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Функція для тестування з'єднання з Supabase
  const testSupabaseConnection = async () => {
    if (!supabase) {
      setDebugInfo(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            message: "Supabase connection failed: Client not initialized",
          },
          null,
          2,
        ),
      )
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("profiles").select("id").limit(1)

      if (error) {
        throw error
      }

      setDebugInfo(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            message: "Supabase connection successful",
            data,
          },
          null,
          2,
        ),
      )
    } catch (error: any) {
      console.error("Error testing Supabase connection:", error)
      setDebugInfo(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            message: "Supabase connection failed",
            error: {
              message: error.message,
              status: error.status,
              name: error.name,
            },
          },
          null,
          2,
        ),
      )
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
        <h1 className="text-xl font-semibold ml-2">Забули пароль</h1>
      </header>

      <div className="w-full max-w-md mx-auto mt-16 px-4 space-y-6">
        {message?.type === "success" ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-[#5B2EFF]/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-[#5B2EFF]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Перевірте вашу пошту</h2>
              <p className="text-muted-foreground text-sm">
                Ми надіслали посилання для скидання пароля на
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <Button className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90" asChild>
              <Link href="/auth/sign-in">Повернутися до входу</Link>
            </Button>

            <p className="text-sm text-muted-foreground">
              Не отримали листа?{" "}
              <button className="text-[#5B2EFF] hover:underline" onClick={() => setMessage(null)}>
                Спробувати ще раз
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Скинути ваш пароль</h2>
              <p className="text-muted-foreground text-sm">
                Ми надішлемо вам електронний лист з посиланням для скидання
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Електронна пошта</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ваша@пошта.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={message?.type === "error" ? "border-red-500" : ""}
                />
                {message?.type === "error" && <p className="text-red-500 text-sm">{message.text}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90 mt-6" disabled={isLoading}>
                {isLoading ? "Надсилання..." : "Надіслати посилання для скидання"}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-muted-foreground mb-2">Діагностика:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={testSupabaseConnection}
                className="w-full mb-2"
                disabled={isLoading}
              >
                Перевірити з'єднання з Supabase
              </Button>

              {debugInfo && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                  <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
