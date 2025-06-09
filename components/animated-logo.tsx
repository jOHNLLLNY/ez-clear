"use client"
import Image from "next/image"

interface AnimatedLogoProps {
  width?: number
  height?: number
  className?: string
  onAnimationComplete?: () => void
}

export function AnimatedLogo({ width = 280, height = 140, className = "", onAnimationComplete }: AnimatedLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col items-center">
        {/* Logo with worker and text */}
        <div
          className="opacity-100 scale-100"
          onLoad={() => {
            if (onAnimationComplete) onAnimationComplete()
          }}
        >
          <Image
            src="/images/ez-clear-logo-white.png"
            alt="EZ Clear Logo"
            width={width}
            height={height}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}
