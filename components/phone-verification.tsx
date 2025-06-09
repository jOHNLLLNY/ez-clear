"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void
  onCancel: () => void
}

export function PhoneVerification({ onVerified, onCancel }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [receivedCode, setReceivedCode] = useState<string | null>(null)

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      setError("Будь ласка, введіть номер телефону")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Помилка відправки коду")
      }

      setCodeSent(true)
      setSuccess("Код верифікації відправлено на ваш телефон")

      // For development purposes, show the code
      if (data.code) {
        setReceivedCode(data.code)
      }
    } catch (err: any) {
      setError(err.message || "Помилка відправки коду")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode) {
      setError("Будь ласка, введіть код верифікації")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Невірний код верифікації")
      }

      setSuccess("Номер телефону успішно верифіковано")
      setTimeout(() => {
        onVerified(phoneNumber)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Помилка верифікації коду")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Верифікація телефону</CardTitle>
        <CardDescription>
          Для безпеки вашого облікового запису, будь ласка, підтвердіть ваш номер телефону
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Помилка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Успішно</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {!codeSent ? (
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Номер телефону</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+380XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              Введіть номер телефону в міжнародному форматі, наприклад +380501234567
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Код верифікації</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Введіть 6-значний код"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isLoading}
              maxLength={6}
            />
            <p className="text-sm text-gray-500">Введіть 6-значний код, який було надіслано на ваш телефон</p>

            {receivedCode && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-800">Код для тестування</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Код верифікації: <strong>{receivedCode}</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Пропустити
        </Button>

        {!codeSent ? (
          <Button onClick={sendVerificationCode} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Надіслати код
          </Button>
        ) : (
          <Button onClick={verifyCode} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Перевірити
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
