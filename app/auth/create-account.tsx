"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/user-context"
import { supabase } from "@/lib/supabase"

export function CreateAccount() {
  const router = useRouter()
  const { updateUserProfile } = useUser()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState({
    email: false,
    google: false,
    apple: false,
    facebook: false,
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { email: "", password: "", confirmPassword: "", general: "" }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setLoading({ ...loading, email: true })
      setErrors((prev) => ({ ...prev, general: "" }))

      try {
        const userType = localStorage.getItem("userType") || "worker"

        // Register the user directly without phone verification
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            userType,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create account")
        }

        // Sign in the user after successful registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) {
          throw signInError
        }

        // Redirect to home page or onboarding
        router.push("/auth/profile-details")
      } catch (error) {
        console.error("Account creation error:", error)
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Failed to create account. Please try again.",
        }))
      } finally {
        setLoading({ ...loading, email: false })
      }
    }
  }

  const handleSocialSignup = async (provider) => {
    setLoading({ ...loading, [provider]: true })
    setErrors((prev) => ({ ...prev, general: "" }))

    try {
      // Store user type in localStorage before redirecting
      const userType = localStorage.getItem("userType") || "worker"

      // Get current URL for redirect
      const redirectTo = `${window.location.origin}/auth/callback`

      // Start OAuth flow with selected provider
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (authError) throw authError

      // User will be redirected to provider's login page
    } catch (error) {
      console.error(`Error signing up with ${provider}:`, error)
      setErrors((prev) => ({
        ...prev,
        general: `Failed to sign up with ${provider}. Please try again. ${error.message}`,
      }))
      setLoading({ ...loading, [provider]: false })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <header className="p-4 flex items-center">
        <Link href="/auth/select-account-type" className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold ml-2">Create Account</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
              onClick={() => handleSocialSignup("google")}
              disabled={loading.google}
            >
              {loading.google ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path
                      d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
                      fill="#4285F4"
                    />
                    <path
                      d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0 0 10 20z"
                      fill="#34A853"
                    />
                    <path
                      d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 0 0 0 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z"
                      fill="#EA4335"
                    />
                  </g>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
              onClick={() => handleSocialSignup("apple")}
              disabled={loading.apple}
            >
              {loading.apple ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="black" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.7825 10.7468C15.7663 8.49412 17.4775 7.34647 17.5663 7.29294C16.5588 5.8209 14.9738 5.58235 14.4263 5.56765C13.0875 5.42765 11.7925 6.37824 11.1125 6.37824C10.4163 6.37824 9.37252 5.58235 8.25877 5.60588C6.79752 5.62941 5.44127 6.46 4.69127 7.78C3.14127 10.4732 4.29752 14.4444 5.78627 16.6615C6.53627 17.7444 7.41752 18.9532 8.58002 18.9062C9.70627 18.8591 10.1363 18.1797 11.4913 18.1797C12.8288 18.1797 13.2338 18.9062 14.4088 18.8768C15.6188 18.8591 16.3863 17.7915 17.1125 16.6968C18.0025 15.4409 18.3725 14.2056 18.3888 14.1468C18.3563 14.1351 15.8 13.0756 15.7825 10.7468Z" />
                  <path d="M13.6863 3.61176C14.2988 2.85882 14.7038 1.83529 14.5913 0.799994C13.7338 0.835288 12.6488 1.37647 12.0125 2.11176C11.4488 2.76471 10.9613 3.82353 11.0913 4.82353C12.0613 4.89412 13.0575 4.35294 13.6863 3.61176Z" />
                </svg>
              )}
              Continue with Apple
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
              onClick={() => handleSocialSignup("facebook")}
              disabled={loading.facebook}
            >
              {loading.facebook ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    fill="#1877F2"
                  />
                </svg>
              )}
              Continue with Facebook
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F8F9FC] px-2 text-xs text-muted-foreground">OR SIGN UP WITH EMAIL</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full bg-[#5B2EFF] hover:bg-[#5B2EFF]/90 mt-6" disabled={loading.email}>
              {loading.email ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              ) : null}
              Continue
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="text-[#5B2EFF] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
