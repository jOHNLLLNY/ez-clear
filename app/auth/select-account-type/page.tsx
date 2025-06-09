"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Briefcase, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/user-context"
import Link from "next/link"

export default function SelectAccountType() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const { setUserType } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSelectType = (type: string) => {
    setSelectedType(type)

    // Store user type in context and localStorage
    setUserType(type as "worker" | "hirer")
    localStorage.setItem("userType", type)
  }

  const handleContinue = async () => {
    if (!selectedType) {
      alert("Please select how you want to use the app first")
      return
    }

    setLoading(true)

    try {
      // Store the selected type and redirect to registration
      localStorage.setItem("userType", selectedType)

      // Redirect to registration page
      router.push("/auth/create-account")
    } catch (error) {
      console.error("Error during navigation:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#141625] text-white">
      {/* Header with back button */}
      <header className="p-4 flex items-center">
        <Link href="/onboarding" className="p-2 text-gray-300 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">Welcome to EZ Clear</h1>
            <p className="text-gray-400">Select how you want to use the app</p>
          </div>

          <div className="space-y-4">
            <Card
              className={`cursor-pointer transition-all bg-[#1E2139] border-[#252945] hover:border-[#7C5DFA]/70 ${
                selectedType === "worker" ? "border-[#7C5DFA] bg-[#1E2139]" : ""
              }`}
              onClick={() => handleSelectType("worker")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C5DFA]/20">
                    <Briefcase className="h-6 w-6 text-[#9277FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">I want to work</h3>
                    <p className="text-gray-400 text-sm mt-1">Find jobs and opportunities</p>
                  </div>
                  {selectedType === "worker" && (
                    <div className="h-6 w-6 rounded-full bg-[#7C5DFA] flex items-center justify-center">
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1 4L4.5 7.5L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all bg-[#1E2139] border-[#252945] hover:border-[#7C5DFA]/70 ${
                selectedType === "hirer" ? "border-[#7C5DFA] bg-[#1E2139]" : ""
              }`}
              onClick={() => handleSelectType("hirer")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C5DFA]/20">
                    <UserCircle className="h-6 w-6 text-[#9277FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">I want to hire</h3>
                    <p className="text-gray-400 text-sm mt-1">Post jobs and find talent</p>
                  </div>
                  {selectedType === "hirer" && (
                    <div className="h-6 w-6 rounded-full bg-[#7C5DFA] flex items-center justify-center">
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1 4L4.5 7.5L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button - Replacing Social Login Buttons */}
          <div className="mt-6">
            <Button
              className="w-full bg-gradient-to-r from-[#7C5DFA] to-[#9277FF] hover:from-[#9277FF] hover:to-[#7C5DFA] text-white py-6 border-0"
              onClick={handleContinue}
              disabled={!selectedType || loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              ) : null}
              Get Started
            </Button>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p>
              By continuing, you agree to our{" "}
              <Link href="#" className="text-[#9277FF] hover:text-[#7C5DFA]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#9277FF] hover:text-[#7C5DFA]">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
