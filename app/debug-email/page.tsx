"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [supabase, setSupabase] = useState<any>(null)

  // Initialize Supabase client only on the client side
  useEffect(() => {
    // Only create the client on the client side
    if (typeof window !== "undefined") {
      setSupabase(createClient())
    }
  }, [])

  const addResult = (title: string, status: "success" | "error", details: any) => {
    setResults((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        title,
        status,
        details,
      },
      ...prev,
    ])
  }

  const testConnection = async () => {
    if (!supabase) {
      addResult("Перевірка з'єднання з Supabase", "error", { message: "Supabase клієнт не ініціалізовано" })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("profiles").select("id").limit(1)

      if (error) throw error

      addResult("Перевірка з'єднання з Supabase", "success", { message: "З'єднання успішне", data })
    } catch (error: any) {
      addResult("Перевірка з'єднання з Supabase", "error", {
        message: error.message,
        code: error.code,
        details: error.details,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testResetPassword = async () => {
    if (!supabase) {
      addResult("Тест скидання пароля", "error", { message: "Supabase клієнт не ініціалізовано" })
      return
    }

    if (!email) {
      addResult("Тест скидання пароля", "error", { message: "Введіть email" })
      return
    }

    setIsLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/reset-password`

      addResult("Підготовка запиту", "success", {
        email,
        redirectUrl,
      })

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) throw error

      addResult("Запит на скидання пароля", "success", {
        message: "Запит успішно відправлено",
        data,
      })
    } catch (error: any) {
      addResult("Запит на скидання пароля", "error", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkEnvVariables = () => {
    const variables = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Встановлено" : "✗ Не встановлено",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Встановлено" : "✗ Не встановлено",
    }

    addResult("Перевірка змінних середовища", "success", variables)
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Діагностика Email з Supabase</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Тести з'єднання</CardTitle>
          <CardDescription>Перевірте з'єднання з Supabase та налаштування змінних середовища</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={isLoading || !supabase} className="mr-2">
            Перевірити з'єднання з Supabase
          </Button>
          <Button onClick={checkEnvVariables} disabled={isLoading} variant="outline">
            Перевірити змінні середовища
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Тест скидання пароля</CardTitle>
          <CardDescription>Відправити тестовий email для скидання пароля</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email для тесту</Label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testResetPassword} disabled={isLoading || !email || !supabase}>
            {isLoading ? "Відправка..." : "Відправити тестовий email"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Результати діагностики</CardTitle>
          <CardDescription>Історія виконаних тестів та їх результати</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-sm">Немає результатів. Запустіть тести вище.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{result.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        result.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.status === "success" ? "Успіх" : "Помилка"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{result.timestamp}</p>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
