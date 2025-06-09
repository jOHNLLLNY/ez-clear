"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"

export default function TestResetPage() {
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    // Initialize Supabase client only on the client side
    setSupabase(createClient())
  }, [])

  const testExactCode = async () => {
    setIsLoading(true)
    setResult(null)

    if (!supabase) {
      setResult({ error: "Supabase client not initialized" })
      setIsLoading(false)
      return
    }

    try {
      console.log("Starting password reset test...")

      // Точно такий самий код, як ви надали
      const { data, error } = await supabase.auth.resetPasswordForEmail("dppp9555@gmail.com", {
        redirectTo: "http://localhost:3000/reset-password",
      })

      if (error) {
        console.error("Reset error:", error.message)
        setResult({ error: `Reset error: ${error.message}` })
      } else {
        console.log("Reset email sent successfully!")
        setResult({ success: "Reset email sent successfully!" })
      }
    } catch (e: any) {
      console.error("Unexpected error", e)
      setResult({ error: `Unexpected error: ${e.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  // Додаткова функція для перевірки з іншим клієнтом
  const testWithServerClient = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      console.log("Testing with server client...")

      // Створюємо клієнт з явними параметрами
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      console.log("Using URL:", supabaseUrl.substring(0, 10) + "...")
      console.log("Using key:", supabaseKey.substring(0, 5) + "...")

      const { createClient } = await import("@supabase/supabase-js")
      const directClient = createClient(supabaseUrl, supabaseKey)

      const { data, error } = await directClient.auth.resetPasswordForEmail("dppp9555@gmail.com", {
        redirectTo: "http://localhost:3000/reset-password",
      })

      if (error) {
        console.error("Reset error with direct client:", error.message)
        setResult({ error: `Reset error with direct client: ${error.message}` })
      } else {
        console.log("Reset email sent successfully with direct client!")
        setResult({ success: "Reset email sent successfully with direct client!" })
      }
    } catch (e: any) {
      console.error("Unexpected error with direct client", e)
      setResult({ error: `Unexpected error with direct client: ${e.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Тест скидання пароля (точний код)</h1>

      {!supabase && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          Supabase client is initializing. Please wait...
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Тест скидання пароля</CardTitle>
          <CardDescription>Виконання точно такого коду, як ви надали</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
            {`try {
  const { data, error } = await supabase.auth.resetPasswordForEmail('dppp9555@gmail.com', {
    redirectTo: 'http://localhost:3000/reset-password'
  })
  if (error) console.error('Reset error:', error.message)
  else console.log('Reset email sent successfully!')
} catch (e) {
  console.error('Unexpected error', e)
}`}
          </pre>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={testExactCode} disabled={isLoading || !supabase}>
            {isLoading ? "Виконується..." : "Виконати цей код"}
          </Button>
          <Button onClick={testWithServerClient} disabled={isLoading || !supabase} variant="outline">
            Спробувати з прямим клієнтом
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Результат</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="p-3 bg-green-100 text-green-800 rounded-md">{result.success}</div>
            ) : result.error ? (
              <div className="p-3 bg-red-100 text-red-800 rounded-md">{result.error}</div>
            ) : null}

            <div className="mt-4">
              <h3 className="font-medium mb-2">Перевірте також:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Перевірте консоль браузера (F12) для додаткових деталей</li>
                <li>Перевірте папку "Спам" у вашій поштовій скриньці</li>
                <li>
                  Переконайтеся, що URL <code>http://localhost:3000/reset-password</code> додано до списку дозволених
                  URL в Supabase
                </li>
                <li>Перевірте налаштування SMTP в Supabase</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
