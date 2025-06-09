"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { ErrorMessage } from "@/components/error-message"

// Error types for better handling
type ErrorType =
  | "INVALID_PHONE"
  | "PHONE_EXISTS"
  | "MISSING_REGISTRATION_DATA"
  | "SERVER_ERROR"
  | "RATE_LIMIT"
  | "NETWORK_ERROR"
  | "UNKNOWN"

interface ErrorState {
  type: ErrorType
  message: string
  details?: any
}

export default function PhoneInputPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const [existingAccount, setExistingAccount] = useState<{ exists: boolean; email: string | null }>({
    exists: false,
    email: null,
  })
  const [retryCount, setRetryCount] = useState(0)

  // Get registration data from localStorage
  const getRegistrationData = () => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("registrationData")
      return data ? JSON.parse(data) : null
    }
    return null
  }

  useEffect(() => {
    // Check if registration data exists
    const registrationData = getRegistrationData()
    if (!registrationData && typeof window !== "undefined") {
      // If no registration data and not on the first render, show error
      if (retryCount > 0) {
        setError({
          type: "MISSING_REGISTRATION_DATA",
          message: "Registration data not found. Please start the registration process again.",
        })
      } else {
        // Increment retry count for next render
        setRetryCount(retryCount + 1)
      }
    }
  }, [retryCount])

  const handlePhoneChange = (value) => {
    setPhoneNumber(value)
    setError(null)
    setExistingAccount({ exists: false, email: null })
  }

  const checkPhoneExists = async () => {
    try {
      const response = await fetch("/api/auth/check-phone-exists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}` }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check phone number")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error checking phone:", error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 6) {
      setError({
        type: "INVALID_PHONE",
        message: "Please enter a valid phone number with country code",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if phone number already exists
      const phoneCheck = await checkPhoneExists()

      if (phoneCheck.exists) {
        setExistingAccount(phoneCheck)
        setError({
          type: "PHONE_EXISTS",
          message: "An account with this phone number already exists",
          details: { email: phoneCheck.email },
        })
        setLoading(false)
        return
      }

      // Get registration data
      const registrationData = getRegistrationData()

      if (!registrationData) {
        setError({
          type: "MISSING_REGISTRATION_DATA",
          message: "Registration data not found. Please start the registration process again.",
        })
        setLoading(false)
        return
      }

      // Store phone number in localStorage
      localStorage.setItem(
        "registrationData",
        JSON.stringify({
          ...registrationData,
          phoneNumber: `+${phoneNumber}`,
        }),
      )

      // Send verification code
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}` }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific error types
        if (response.status === 429) {
          throw new Error("RATE_LIMIT:Too many attempts. Please try again later.")
        } else if (errorData.error?.includes("invalid")) {
          throw new Error("INVALID_PHONE:The phone number format is invalid. Please check and try again.")
        } else {
          throw new Error(`SERVER_ERROR:${errorData.error || "Failed to send verification code"}`)
        }
      }

      // Redirect to verification page
      router.push("/auth/verify-phone")
    } catch (error) {
      console.error("Error in phone verification:", error)

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
            onClick: () => {
              setPhoneNumber("")
              setError(null)
              setExistingAccount({ exists: false, email: null })
            },
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
      case "RATE_LIMIT":
        return [
          {
            label: "Try again later",
            onClick: () => {
              setError(null)
            },
          },
        ]
      case "NETWORK_ERROR":
        return [
          {
            label: "Try again",
            onClick: () => {
              setError(null)
              handleSubmit(new Event("submit") as any)
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
        ]
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center z-10">
        <Link href="/auth/create-account" className="p-2 rounded-full hover:bg-muted transition-colors duration-200">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-xl font-semibold ml-2 text-foreground">Phone Verification</h1>
      </header>

      <div className="w-full max-w-md mx-auto mt-16 space-y-6 px-4">
        {error && (
          <ErrorMessage
            title={error.type === "PHONE_EXISTS" ? "Account Already Exists" : "Error"}
            message={error.message}
            severity={error.type === "PHONE_EXISTS" ? "info" : error.type === "RATE_LIMIT" ? "warning" : "error"}
            actions={getErrorActions()}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-foreground">
              Phone Number
            </Label>
            <div className="phone-input-container">
              <PhoneInput
                country={"us"}
                value={phoneNumber}
                onChange={handlePhoneChange}
                inputProps={{
                  id: "phoneNumber",
                  name: "phoneNumber",
                  required: true,
                  className: "w-full p-2 rounded-md border border-input bg-muted text-foreground",
                }}
                containerClass="w-full"
                inputClass="!w-full !h-10 !py-2 !px-3 !text-base"
                buttonClass="!bg-muted !border-input"
                dropdownClass="!bg-background !text-foreground"
              />
            </div>
            <p className="text-sm text-muted-foreground">We'll send a verification code to this number</p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-primary hover:from-primary-700 hover:to-primary-600 text-white rounded-lg transition-all duration-200 shadow-button"
            disabled={loading || error?.type === "PHONE_EXISTS"}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>

      <style jsx global>{`
        .phone-input-container .react-tel-input .form-control {
          width: 100%;
          height: 40px;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--input));
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
        }
        .phone-input-container .react-tel-input .selected-flag {
          background-color: hsl(var(--muted));
          border-radius: 0.375rem 0 0 0.375rem;
        }
        .phone-input-container .react-tel-input .selected-flag:hover,
        .phone-input-container .react-tel-input .selected-flag:focus {
          background-color: hsl(var(--muted));
        }
        .phone-input-container .react-tel-input .flag-dropdown {
          background-color: hsl(var(--muted));
          border: 1px solid hsl(var(--input));
          border-radius: 0.375rem 0 0 0.375rem;
        }
        .phone-input-container .react-tel-input .country-list {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--input));
          border-radius: 0.375rem;
          margin-top: 4px;
        }
        .phone-input-container .react-tel-input .country-list .country:hover {
          background-color: hsl(var(--muted));
        }
        .phone-input-container .react-tel-input .country-list .country.highlight {
          background-color: hsl(var(--muted));
        }
      `}</style>
    </div>
  )
}
