"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/user-context"
import { supabase } from "@/lib/supabase"

export default function SignIn() {
  const router = useRouter()
  const { updateUserProfile } = useUser()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState({
    email: false,
    google: false,
    apple: false,
    facebook: false,
  })

  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when typing
    if (error) {
      setError("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading({ ...loading, email: true })
    setError("")

    try {
      // Use our server-side API endpoint to login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      console.log("Login successful:", data)

      // Store the user ID for future use
      localStorage.setItem("currentUserId", data.user.id)

      // Update user profile in context
      updateUserProfile({
        email: data.profile.email,
        name: data.profile.name || "",
        city: data.profile.city || "",
        province: data.profile.province || "",
      })

      // Set user type from profile
      if (data.profile.user_type) {
        localStorage.setItem("userType", data.profile.user_type)
      }

      // Redirect based on user type
      const userType = data.profile.user_type || "worker"
      router.push(userType === "worker" ? "/home/worker" : "/home/hirer")
    } catch (error) {
      console.error("Error signing in:", error)
      setError(error.message || "Failed to sign in. Please check your credentials.")
    } finally {
      setLoading({ ...loading, email: false })
    }
  }

  const handleSocialLogin = async (provider) => {
    setLoading({ ...loading, [provider]: true })
    setError("")

    try {
      // Get the current URL for the redirect
      const redirectTo = `${window.location.origin}/auth/callback`

      // Start the OAuth flow with the selected provider
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

      // The user will be redirected to the provider's login page
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      setError(`Failed to sign in with ${provider}. Please try again. ${error.message}`)
      setLoading({ ...loading, [provider]: false })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center z-10">
        <Link
          href="/auth/select-account-type"
          className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <h1 className="text-xl font-semibold ml-2 text-foreground">Sign In</h1>
      </header>

      <div className="w-full max-w-md mx-auto mt-16 space-y-6">
        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-lg relative">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border-border hover:bg-muted transition-all duration-200 shadow-button text-foreground"
            onClick={() => handleSocialLogin("google")}
            disabled={loading.google}
          >
            {loading.google ? (
              <div className="h-5 w-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
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
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border-border hover:bg-muted transition-all duration-200 shadow-button text-foreground"
            onClick={() => handleSocialLogin("apple")}
            disabled={loading.apple}
          >
            {loading.apple ? (
              <div className="h-5 w-5 border-2 border-t-transparent border-foreground rounded-full animate-spin"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.7825 10.7468C15.7663 8.49412 17.4775 7.34647 17.5663 7.29294C16.5588 5.8209 14.9738 5.58235 14.4263 5.56765C13.0875 5.42765 11.7925 6.37824 11.1125 6.37824C10.4163 6.37824 9.37252 5.58235 8.25877 5.60588C6.79752 5.62941 5.44127 6.46 4.69127 7.78C3.14127 10.4732 4.29752 14.4444 5.78627 16.6615C6.53627 17.7444 7.41752 18.9532 8.58002 18.9062C9.70627 18.8591 10.1363 18.1797 11.4913 18.1797C12.8288 18.1797 13.2338 18.9062 14.4088 18.8768C15.6188 18.8591 16.3863 17.7915 17.1125 16.6968C18.0025 15.4409 18.3725 14.2056 18.3888 14.1468C18.3563 14.1351 15.8 13.0756 15.7825 10.7468Z" />
                <path d="M13.6863 3.61176C14.2988 2.85882 14.7038 1.83529 14.5913 0.799994C13.7338 0.835288 12.6488 1.37647 12.0125 2.11176C11.4488 2.76471 10.9613 3.82353 11.0913 4.82353C12.0613 4.89412 13.0575 4.35294 13.6863 3.61176Z" />
              </svg>
            )}
            Continue with Apple
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border-border hover:bg-muted transition-all duration-200 shadow-button text-foreground"
            onClick={() => handleSocialLogin("facebook")}
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
            <span className="bg-background px-2 text-xs text-muted-foreground">OR SIGN IN WITH EMAIL</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 bg-muted text-foreground border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 bg-muted text-foreground border-border"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-primary hover:from-primary-700 hover:to-primary-600 text-white rounded-lg transition-all duration-200 shadow-button mt-6"
            disabled={loading.email}
          >
            {loading.email ? (
              <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            ) : null}
            Sign In
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/select-account-type" className="text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
