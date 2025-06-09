"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface EzClearLogoProps {
  width?: number
  height?: number
  className?: string
  animate?: boolean
}

export function EzClearLogo({ width = 200, height = 100, className = "", animate = false }: EzClearLogoProps) {
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Image
          src="/images/ez-clear-logo-white.png"
          alt="EZ Clear Logo"
          width={width}
          height={height}
          className="object-contain"
        />
      </motion.div>
    )
  }

  return (
    <div className={className}>
      <Image
        src="/images/ez-clear-logo-white.png"
        alt="EZ Clear Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  )
}
