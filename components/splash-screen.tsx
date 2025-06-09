"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { motion } from "framer-motion"
import { AnimatedLogo } from "./animated-logo"

export function SplashScreen() {
  const [animationComplete, setAnimationComplete] = useState(false)
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Set a timeout to complete the animation
    const timer = setTimeout(() => {
      setAnimationComplete(true)

      // Only redirect if auth check is complete
      if (!loading) {
        if (isAuthenticated) {
          router.push("/home/worker")
        } else {
          router.push("/onboarding")
        }
      }
    }, 3000) // Animation duration

    return () => clearTimeout(timer)
  }, [loading, isAuthenticated, router])

  // Always show the splash screen during initial load
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d1a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <AnimatedLogo width={280} height={140} onAnimationComplete={() => {}} />

        {/* Optional pulsing effect after logo appears */}
        {animationComplete && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[#7C5DFA]/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.2, 0],
              scale: [0.8, 1.2, 1.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />
        )}
      </div>
    </motion.div>
  )
}
