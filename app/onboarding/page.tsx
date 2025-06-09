"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AnimatedLogo } from "@/components/animated-logo"
import { ArrowRight, Home, Search, Briefcase } from "lucide-react"

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Welcome to EZ Clear",
      description:
        "The easiest way to connect with contractors for renovation services, snow removal, landscaping, and more.",
      icon: Home,
    },
    {
      title: "Find Services Quickly",
      description: "Browse available services in your area and book with just a few taps.",
      icon: Search,
    },
    {
      title: "Get Work Done",
      description: "Reliable contractors ready to help with your indoor and outdoor maintenance needs.",
      icon: Briefcase,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#141625] text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <AnimatedLogo width={240} height={120} />
          </div>

          {/* Slides */}
          <div className="relative h-48">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full transition-opacity duration-500 flex flex-col items-center text-center ${
                  currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <slide.icon className="w-20 h-20 mb-3 text-[#7C5DFA]" />
                <h2 className="text-xl font-semibold mb-2 text-white">{slide.title}</h2>
                <p className="text-[#DFE3FA]">{slide.description}</p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? "w-6 bg-[#7C5DFA]" : "w-2 bg-[#252945]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <Button
              className="w-full bg-gradient-to-r from-[#7C5DFA] to-[#9277FF] hover:from-[#9277FF] hover:to-[#7C5DFA] text-white border-0"
              asChild
            >
              <Link href="/auth/select-account-type">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <div className="text-center">
              <p className="text-sm text-[#DFE3FA]">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="text-[#9277FF] hover:text-[#7C5DFA] hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
