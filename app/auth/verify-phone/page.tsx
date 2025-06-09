"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ErrorMessage } from "@/components/error-message"

// Error types for better handling
type ErrorType =
  | "INVALID_CODE"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "PHONE_EXISTS"
  | "MISSING_REGISTRATION_DATA"
  | "VERIFICATION_FAILED"
  | "REGISTRATION_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN"

interface ErrorState {
  type: ErrorType
  message: string
  details?: any
}

export default function VerifyPhonePage() {
  const router = useRouter()
  const [verificationCode, setVerificationCode] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [attempts, setAttempts] = useState(0)
  const [registrationData, setRegistrationData] = useState<any>(null)

  // Load registration data and phone number
  useEffect(() => {
    const data = localStorage.getItem("registrationData")
    if (data) {
      const parsedData = JSON.parse(data)
      setRegistrationData(parsedData)
      if (parsedData.phoneNumber) {
        setPhoneNumber(parsedData.phoneNumber)
      } else {
        setError({
          type: "MISSING_REGISTRATION_DATA",
          message: "Phone number not found in registration data. Please restart the registration process.",
        })
        setTimeout(() => {
          router.push("/auth/phone-input")
        }, 3000)
      }
    } else {
      setError({
        type: "MISSING_REGISTRATION_DATA",
        message: "Registration data not found. Please restart the registration process.",
      })
      setTimeout(() => {
        router.push("/auth/create-account")
      }, 3000)
    }
  }, [router])

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      setResendDisabled(false)
      setCountdown(60)
    }
    return () => clearTimeout(timer)
  }, [resendDisabled, countdown])

  // Check if phone number already exists
  const checkPhoneExists = useCallback(async () => {
    if (!phoneNumber) return { exists: false }

    try {
      const response = await fetch("/api/auth/check-phone-exists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check phone number")
      }

      return await response.json()
    } catch (error) {
      console.error("Error checking phone:", error)
      throw error
    }
  }, [phoneNumber])

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!verificationCode || verificationCode.length !== 6) {
      setError({
        type: "INVALID_CODE",
        message: "Please enter a valid 6-digit verification code",
      })
      return
    }

    if (attempts >= 5) {
      setError({
        type: "TOO_MANY_ATTEMPTS",
        message: "Too many failed attempts. Please request a new code.",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if phone number already exists
      const phoneData = await checkPhoneExists()

      if (phoneData.exists) {
        setError({
          type: "PHONE_EXISTS",
          message: "This phone number is already registered with an account.",
          details: { email: phoneData.email },
        })
        setLoading(false)
        return
      }

      // Verify the code
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setAttempts(attempts + 1)

        // Handle specific error types
        if (response.status === 410) {
          throw new Error("CODE_EXPIRED:The verification code has expired. Please request a new one.")
        } else if (response.status === 429) {
          throw new Error("TOO_MANY_ATTEMPTS:Too many verification attempts. Please try again later.")
        } else if (errorData.error?.includes("invalid") || errorData.error?.includes("incorrect")) {
          throw new Error("INVALID_CODE:The verification code is incorrect. Please try again.")
        } else {
          throw new Error(`VERIFICATION_FAILED:${errorData.error || "Failed to verify code"}`)
        }
      }

      // Show success message
      setSuccess(true)

      // Update registration data with verified phone
      if (registrationData) {
        const updatedData = {
          ...registrationData,
          phoneVerified: true,
        }
        localStorage.setItem("registrationData", JSON.stringify(updatedData))
        setRegistrationData(updatedData)
      } else {
        throw new Error("MISSING_REGISTRATION_DATA:Registration data not found")
      }

      // Register the user
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registrationData.email,
          password: registrationData.password,
          phoneNumber: registrationData.phoneNumber,
          phoneVerified: true,
          userType: registrationData.userType || "worker",
        }),
      })

      if (!registerResponse.ok) {
        const registerData = await registerResponse.json()
        throw new Error(`REGISTRATION_FAILED:${registerData.error || "Failed to register user"}`)
      }

      // Sign in the user
      const { supabase } = await import("@/lib/supabase")
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: registrationData.email,
        password: registrationData.password,
      })

      if (signInError) {
        console.error("Sign-in error:", signInError)
        // Continue anyway, we'll redirect to sign-in page
      }

      // Clear registration data
      localStorage.removeItem("registrationData")

      // Redirect to profile details page
      setTimeout(() => {
        router.push("/auth/profile-details")
      }, 1500)
    } catch (error) {
      console.error("Error in verification:", error)

      // Parse error message if it's in our format
      const errorParts = error.message.split(":")
      if (errorParts.length > 1) {
        setError({
          type: errorParts[0] as ErrorType,
          message: errorParts[1],
        })
      } else if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError({
          type: "NETWORK_ERROR",
          message: "Network error. Please check your internet connection and try again.",
        })
      } else {
        setError({
          type: "UNKNOWN",
          message: error.message || "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendDisabled) return

    setResendDisabled(true)
    setCountdown(60)
    setError(null)
    setAttempts(0)

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 429) {
          throw new Error("TOO_MANY_ATTEMPTS:Too many requests. Please try again later.")
        } else {
          throw new Error(errorData.error || "Failed to resend verification code")
        }
      }
    } catch (error) {
      console.error("Error resending code:", error)

      // Parse error message if it's in our format
      const errorParts = error.message.split(":")
      if (errorParts.length > 1) {
        setError({
          type: errorParts[0] as ErrorType,
          message: errorParts[1],
        })
      } else {
        setError({
          type: "UNKNOWN",
          message: error.message || "Failed to resend verification code",
        })
      }

      setResendDisabled(false)
      setCountdown(0)
    }
  }

  const getErrorActions = () => {
    if (!error) return []

    switch (error.type) {
      case "PHONE_EXISTS":
        return [
          {
            label: "Sign in instead",
            href: "/auth/sign-in",
            primary: true,
          },
          {
            label: "Use a different phone number",
            href: "/auth/phone-input",
          },
        ]
      case "MISSING_REGISTRATION_DATA":
        return [
          {
            label: "Start registration again",
            href: "/auth/create-account",
            primary: true,
          },
        ]
      case "CODE_EXPIRED":
      case "TOO_MANY_ATTEMPTS":
        return [
          {
            label: "Request new code",
            onClick: handleResend,
            primary: true,
          },
        ]
      case "INVALID_CODE":
        return [
          {
            label: "Try again",
            onClick: () => {
              setVerificationCode("")
              setError(null)
            },
            primary: true,
          },
          {
            label: "Request new code",
            onClick: handleResend,
          },
        ]
      case "NETWORK_ERROR":
        return [
          {
            label: "Try again",
            onClick: () => {
              setError(null)
              handleVerify(new Event("submit") as any)
            },
            primary: true,
          },
        ]
      default:
        return [
          {
            label: "Try again",
            onClick: () => {
              setError(null)
            },
          },
          {
            label: "Go back",
            href: "/auth/phone-input",
          },
        ]
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center z-10">
        <Link href="/auth/phone-input" className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-xl font-semibold ml-2 text-foreground">Verify Phone Number</h1>
      </header>

      <div className="w-full max-w-md mx-auto mt-16 space-y-6 px-4">
        {error && (
          <ErrorMessage
            title={
              error.type === "PHONE_EXISTS"
                ? "Account Already Exists"
                : error.type === "INVALID_CODE"
                  ? "Invalid Code"
                  : error.type === "CODE_EXPIRED"
                    ? "Code Expired"
                    : error.type === "TOO_MANY_ATTEMPTS"
                      ? "Too Many Attempts"
                      : "Error"
            }
            message={error.message}
            severity={
              error.type === "PHONE_EXISTS"
                ? "info"
                : error.type === "TOO_MANY_ATTEMPTS" || error.type === "CODE_EXPIRED"
                  ? "warning"
                  : "error"
            }
            actions={getErrorActions()}
          />
        )}

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 px-4 py-3 rounded-lg relative flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Phone number verified successfully! Redirecting...</span>
          </div>
        )}

        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Phone Verification</h2>
          <p className="text-muted-foreground text-center mb-6">
            We've sent a verification code to {phoneNumber}. Please enter it below to verify your phone number.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-foreground">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))
                  setError(null)
                }}
                className="text-center text-lg tracking-widest bg-muted text-foreground"
                autoComplete="one-time-code"
              />
              <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your phone</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-primary hover:from-primary-700 hover:to-primary-600 text-white rounded-lg transition-all duration-200 shadow-button"
              disabled={loading || success || verificationCode.length !== 6}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendDisabled}
              className={`text-sm ${resendDisabled ? "text-muted-foreground" : "text-primary hover:underline"}`}
            >
              {resendDisabled ? `Didn't receive a code? Resend in ${countdown}s` : "Didn't receive a code? Resend"}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-muted-foreground/20">
            <p className="text-xs text-muted-foreground text-center">
              Having trouble? Make sure your phone can receive SMS messages. If you continue to have issues, please{" "}
              <Link href="/help" className="text-primary hover:underline">
                contact support
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
