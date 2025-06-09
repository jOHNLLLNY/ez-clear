"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email) {
      setError("Email is required")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid")
      return
    }

    // Submit form
    console.log("Reset password for:", email)
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center">
        <Link href="/auth/sign-in" className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Forgot Password</h1>
      </header>

      <div className="w-full max-w-md mx-auto mt-16 px-4 space-y-6">
        {!submitted ? (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Reset your password</h2>
              <p className="text-muted-foreground text-sm">We will send you an email with a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90 mt-6">
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-[#5B2EFF]/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-[#5B2EFF]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Check your email</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <Button className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90" asChild>
              <Link href="/auth/sign-in">Back to Sign In</Link>
            </Button>

            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <button className="text-[#5B2EFF] hover:underline" onClick={() => setSubmitted(false)}>
                Try again
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
